// Mediterranevm (alpha) (GreekModTeam, row 200): the game's eight civilizations as the mod has them, each a civilization of its own next to the game's
// (AGENTS.md, "Civilizations are independent"). The mod is a set of loose files over HD (no pak, no installer); rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/mediterranevm-alpha.js [id ...]     (no id: all eight)
// It unpacks originals/forum/imperivm-iii-mediterranevm-alpha/files/*.rar in a temporary folder (nothing is written under originals/), runs the SDK's
// shrink-mod.js on it (what is identical to the game stays out; the sprites go to rle.mmp.tail), rebuilds ported/mediterranevm-alpha from that and then:
//   1. keeps the mod's version of the game's classes and commands (in the temporary folder) and drops them from the port: they are the game's, and each
//      civilization they belong to is cloned from HD with the mod's changes on top (tools/lib/clone-civs.js); what the mod changed in the base
//      classes (BaseBarracks, BaseTavern, Horse...) is written inside each clone. Changes to neutral map objects (Shrine, Stonehenge, BaseRuins) are not ported
//   2. the mod's own neutral classes (the Numidian tent and the mercenaries it hires, the Greek garrison and its hoplites, the fisherman) stay as they are
//   3. the shared tables (items, unit specials, random map objects) only contribute what they ADD, as patches; const.ini, hidden.txt and the edits of
//      the game's own items and values are not ported
//   4. names another port (or the game) has with other bytes are given the tag "med" (tools/lib/ported-patch.js, tagCollisions)
// The prefix of each civilization is derived from its id by the SDK (first 3 characters: Mga, Mbr, Mca...) and the index is assigned by the game
// (imperivm-resurrected#37): neither is in docs/CIVILIZATIONS.md. The ids start with "m" (Mediterranevm) so that no prefix is the one of another port.
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const ID = "mediterranevm-alpha", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const RAR = path.join(ROOT, "originals", "forum", "imperivm-iii-mediterranevm-alpha", "files", "Mediterranevm_Mod_-_components.rar");
const SDK = process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk"), GAME = process.env.G;
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const TAG = "med";
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const want = process.argv.slice(2);
if (!GAME || !fs.existsSync(path.join(GAME, "rle.mmp"))) { console.error('set G to the HD game folder (shrink-mod.js compares with it), e.g. G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"'); process.exit(1); }
if (!fs.existsSync(RAR)) { console.error("no " + RAR + " (node tools/download-forum.js)"); process.exit(1); }

// the ids start with "m" and differ in their first three characters: the SDK derives the prefix from them. No index.
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "mgaul", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "mrome", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "mimperial", skipExtra: /^HHoplite/, name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  // CTent (the Numidian tent a map places) and the two mercenaries it hires are nobody's: the tent's scripts place them by name for whoever owns it
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "mcarthage", neutral: /^(CTent|CHorseman|CMercenaryTuareg)$/, skipExtra: /^HOutpost/, name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "mbritain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "miberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "megypt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "mgermany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];

// 0. the mod unpacked and shrunk in a temporary folder, then the port from it
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), "mediterranevm-alpha-")), MERGED = path.join(WORK, "merged");
{
  const r = cp.spawnSync("bsdtar", ["-xf", RAR, "-C", WORK], { stdio: "inherit" }); if (r.status) process.exit(1);
  const src = path.join(WORK, "Mediterranevm Mod - components");
  // folder names as the game's packs have them (DATA/CLASSES, UNITS...): the tools below look for them
  const upper = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { const up = e.name.toUpperCase(), p = path.join(d, e.name); upper(p); if (up !== e.name) fs.renameSync(p, path.join(d, up)); } };
  for (const top of ["Data", "Units", "Buildings", "Outlines", "Minimap"]) if (fs.existsSync(path.join(src, top))) { upper(path.join(src, top)); fs.renameSync(path.join(src, top), path.join(src, top.toUpperCase())); }
  fs.rmSync(OUT, { recursive: true, force: true });
  const s = cp.spawnSync("node", [path.join(SDK, "tools", "shrink-mod.js"), src, GAME, OUT, "--id", ID, "--name", "Mediterranevm (alpha)", "--version", "alpha", "--category", "Civilizations"], { stdio: "inherit" });
  if (s.status) process.exit(1);
  fs.rmSync(src, { recursive: true, force: true });
}
// the old mod hid game files by replacing the game's packs (the voices it did not carry over): that would hide them for the game's civilizations too
fs.rmSync(path.join(OUT, "hidden.txt"), { force: true });
// Sound Forge's peak files next to the voices (.sfk): the game does not use them (validate-mod.js warns)
for (const f of walk(OUT).filter(f => /\.sfk$/i.test(f))) fs.rmSync(path.join(OUT, f));
const CLASSES = find(OUT, "DATA/CLASSES"), COMMANDS = find(OUT, "DATA/COMMANDS");
const HD_CLASSES = find(HD, "DATA/CLASSES");
const hdClass = new Set(walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f)).map(f => (classOf(rd(path.join(HD_CLASSES, f))) || "").toLowerCase()));

// 1. what the mod did to the game's classes and commands: kept apart, and the game's classes leave the port
const elements = s => {
  const body = s.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, ""), out = [];
  for (const m of body.matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)) out.push({ text: m[0].trim(), norm: m[0].replace(/\s+/g, " ").trim() });
  return out;
};
const baseChanges = {};
let kept = 0, dropped = 0;
for (const f of fs.readdirSync(CLASSES, { withFileTypes: true })) {
  if (!f.isFile() || !/\.sc\.xml$/i.test(f.name)) continue;
  const p = path.join(CLASSES, f.name), s = rd(p), id = classOf(s);
  if (!id) continue;
  wr(path.join(MERGED, "classes", f.name), s); kept++;
  if (hdClass.has(id.toLowerCase())) {
    const hp = fs.readdirSync(HD_CLASSES).find(x => x.toLowerCase() === f.name.toLowerCase());
    if (hp) {
      const hdEls = new Set(elements(rd(path.join(HD_CLASSES, hp))).map(e => e.norm));
      const mine = elements(s).filter(e => !hdEls.has(e.norm) && !/^<properties\b[^>]*\b(edittree_pos|display_name)\b/.test(e.norm));
      if (mine.length) baseChanges[id.toLowerCase()] = mine.map(e => e.text);
    }
  }
}
// The scripts the mod edited in place (barrack_train_ex.vs, onfinish_research.vs, outpost_behavior.vs...) are run by the game's base classes through
// <method>/<behavior> elements the mod did not need to touch. A clone inherits those elements from HD's class, which names the game's script:
// each such element is also written inside the clones (as the base-class changes are), so they run the mod's script, which
// tagCollisions gives a name of its own below. Nothing of HD's changes.
{
  const SUB = find(OUT, "DATA/SUBAI"), HD_SUB = find(HDDATA, "SUBAI");
  const edited = new Set(fs.readdirSync(SUB).filter(f => /\.vs$/i.test(f)).filter(f => { const h = fs.readdirSync(HD_SUB).find(x => x.toLowerCase() === f.toLowerCase()); return h && md5(path.join(SUB, f)) !== md5(path.join(HD_SUB, h)); }).map(f => f.toLowerCase()));
  const uses = e => [...e.matchAll(/\b(?:vs|script|verify)\s*=\s*"data\/subai\/([^"]+\.vs)"/gi)].some(m => edited.has(m[1].toLowerCase()));
  const seen = new Set(); let added = 0;
  for (const dir of [path.join(MERGED, "classes"), HD_CLASSES]) for (const f of fs.readdirSync(dir).filter(f => /\.sc\.xml$/i.test(f))) {
    const s = rd(path.join(dir, f)), id = classOf(s); if (!id || seen.has(id.toLowerCase())) continue; seen.add(id.toLowerCase());     // the mod's version first
    const have = new Set((baseChanges[id.toLowerCase()] || []).map(e => e.replace(/\s+/g, " ")));
    for (const e of elements(s).filter(e => /^<(method|behavior)\b/.test(e.norm) && uses(e.norm))) if (!have.has(e.norm)) { (baseChanges[id.toLowerCase()] ||= []).push(e.text); added++; }
  }
  console.log(`${edited.size} scripts of the game edited by the mod; ${added} method/behavior elements that run them written in the base-change set`);
}
for (const f of fs.readdirSync(COMMANDS)) wr(path.join(MERGED, "commands", f), rd(path.join(COMMANDS, f)));
wr(path.join(MERGED, "base-changes.json"), JSON.stringify(baseChanges, null, 1));
console.log(`${kept} classes and ${fs.readdirSync(COMMANDS).length} command files of the mod kept; ${Object.keys(baseChanges).length} of the game's classes changed`);
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), id = classOf(rd(p));
  if (id && hdClass.has(id.toLowerCase())) { fs.rmSync(p); dropped++; }
}
console.log(`${dropped} classes of the game's own left out`);

// the classes of the mod's own that no civilization owns (the fisherman, the Numidian tent): the commands that name them
const neutral = new Set();
{
  const info = new Map();
  for (const f of walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const s = rd(path.join(HD_CLASSES, f)); info.set(classOf(s), { race: (s.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1], parent: (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] }); }
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const s = rd(path.join(CLASSES, f)); info.set(classOf(s), { race: (s.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1], parent: (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] }); }
  const raceOf = id => { for (let c = id, n = 0; c && n < 20; n++) { const x = info.get(c); if (!x) return null; if (x.race && x.race !== "None") return x.race; c = x.parent; } return null; };
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const id = classOf(rd(path.join(CLASSES, f))); if (id && !raceOf(id)) neutral.add(id); }
  for (const c of CIVS) if (c.neutral) for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const id = classOf(rd(path.join(CLASSES, f))); if (id && c.neutral.test(id)) neutral.add(id); }
}

// 2. the civilizations of the game, as the mod has them
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "Mediterranevm", LABEL: "Mediterr.", CIVS, cloneAllOrders: true, want });   // LABEL: the lobby cuts a name at about 22 characters

// 3. the commands of the neutral classes
{
  const cmds = s => [...s.matchAll(/<cmd\b([^>]*)>([^]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
  const HDC = find(HD, "DATA/COMMANDS"), hdFiles = Object.fromEntries(fs.readdirSync(HDC).filter(f => /\.xml$/i.test(f)).map(f => [f.toUpperCase(), cmds(rd(path.join(HDC, f)).replace(/<!--[\s\S]*?-->/g, ""))]));
  const where = name => Object.keys(hdFiles).find(f => hdFiles[f].some(c => c.name === name));
  const ops = {}, own = [], seen = new Set(), sel = n => n.includes("'") ? `/commands/cmd[@name="${n}"]` : `/commands/cmd[@name='${n}']`;
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) {
    for (const c of cmds(rd(path.join(MERGED, "commands", f)).replace(/<!--[\s\S]*?-->/g, ""))) {
      const mine = c.src.filter(x => neutral.has(x)); if (!mine.length) continue;
      const home = where(c.name);
      if (home) { for (const o of mine) if (!hdFiles[home].find(h => h.name === c.name).src.includes(o)) (ops[home] ||= []).push(`  <add select="${sel(c.name)}"><src obj="${o}"/></add>`); }
      else if (!seen.has(c.name)) { seen.add(c.name); own.push(c.src.length === mine.length ? c.text : c.text.replace(/<src\b[^>]*\/>\s*/g, "").replace(/<\/cmd>$/, mine.map(g => `\t<src obj="${g}"/>`).join("\n") + "\n</cmd>")); }
    }
  }
  // the mod's command files are in the clones now (and in the patches above)
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) fs.rmSync(path.join(COMMANDS, f), { force: true });
  if (own.length) wr(path.join(COMMANDS, "MEDITERRANEVM.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
  for (const [file, list] of Object.entries(ops)) {
    const dest = path.join(OUT, "patches", "DATA", "COMMANDS", file), add = [...new Set(list)].join("\n");
    if (fs.existsSync(dest)) wr(dest, rd(dest).replace(/\s*<\/patch>\s*$/, `\n${add}\n</patch>\n`)); else wr(dest, `<patch>\n${add}\n</patch>\n`);
  }
  console.log(`neutral classes (${[...neutral].join(", ")}): ${own.length} commands, ${Object.values(ops).reduce((a, l) => a + new Set(l).size, 0)} sources added to the game's commands`);
}

// 3b. commands the mod defines for the game's BASE classes (BaseVillage, BaseTownhall, Outpost, BaseShipyard...): the food mules, tribute...
// The clones only took the commands whose sources are their own classes. Their sources become the classes of this port that inherit from the base class
// (never the game's own classes: a command with source "BaseVillage" would also reach the game's villages)
{
  const stripC = t => t.replace(/<!--[\s\S]*?-->/g, "");
  const cmdsOf = t => [...stripC(t).matchAll(/<cmd\b([^>]*)>([\s\S]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
  const hdNames = new Set(), have = new Set();
  for (const f of walk(find(HD, "DATA/COMMANDS"))) for (const c of cmdsOf(rd(path.join(find(HD, "DATA/COMMANDS"), f)))) hdNames.add(c.name);
  for (const f of walk(path.join(OUT, "DATA", "COMMANDS"))) for (const c of cmdsOf(rd(path.join(OUT, "DATA", "COMMANDS", f)))) have.add(c.name);
  const parent = new Map(), mine = new Set();
  for (const [dir, own] of [[HD_CLASSES, false], [CLASSES, true]]) for (const f of walk(dir).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) {
    const s = rd(path.join(dir, f)), id = classOf(s); if (!id) continue;
    parent.set(id.toLowerCase(), ((s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase()); if (own) mine.add(id);
  }
  const chain = id => { const o = []; for (let c = id.toLowerCase(), n = 0; c && n < 30; c = parent.get(c), n++) o.push(c); return o; };
  const heirs = new Map();                                    // lowercase base id -> ids of this port's classes under it
  for (const id of mine) for (const a of chain(id)) (heirs.get(a) || heirs.set(a, []).get(a)).push(id);
  const add = [], seen = new Set(); let noHeirs = 0;
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) for (const c of cmdsOf(rd(path.join(MERGED, "commands", f)))) {
    if (!c.name || hdNames.has(c.name) || have.has(c.name) || seen.has(c.name)) continue;
    const under = [...new Set(c.src.flatMap(s => heirs.get(s.toLowerCase()) || []))];
    if (c.src.length && !under.length) { noHeirs++; continue; }
    seen.add(c.name);
    add.push(c.src.length ? c.text.replace(/<src\b[^>]*\/>\s*/g, "").replace(/<\/cmd>$/, under.map(g => `\t<src obj="${g}"/>`).join("\n") + "\n</cmd>") : c.text);
  }
  if (add.length) {
    const p = path.join(COMMANDS, "MEDITERRANEVM.XML"), t = fs.existsSync(p) ? rd(p) : "<commands>\n\n</commands>\n";
    wr(p, t.replace(/\s*<\/commands>\s*$/, `\n\n${add.join("\n\n")}\n\n</commands>\n`));
  }
  console.log(`commands of the mod for the game's base classes: ${add.length} added with the port's classes under them as sources (${noHeirs} with no class of this port under them left out)`);
}

// 3c. the voices. The mod replaced the game's voice files of its units (Currentlang/Voices/<unit>/1..5.wav) at the game's own paths: with the mod active, the game's
// civilizations would sound like the mod's. Each folder the clones use becomes a folder of its own (<unit>_med) with an entity of its own (Voice<unit>_med.xml,
// the game's entity with the files the mod has pointing to the new folder; a file the mod does not have stays the game's), and the clones' classes name that entity.
// What the clones do not use (the voices of units no civilization of the port has) is not ported, and neither is Local/english.pak: its files sit at paths no
// entity of the game names (the game's entities say CurrentLang/voices/<unit>/..., this pak has <unit>/...).
{
  const VROOT = find(OUT, "Currentlang/Voices"), HDSE = find(HDDATA, "SOUND ENTITIES"), SC = find(OUT, "DATA/CLASSES");
  const ci = (d, n) => fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
  const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };
  const mine = new Set();
  for (const f of fs.readdirSync(path.join(OUT, "civs"))) for (const n of Object.values(readJson(path.join(OUT, "civs", f)).alias.classes || {})) mine.add(n.toLowerCase());
  const clones = walk(SC).filter(f => /\.sc\.xml$/i.test(f) && mine.has((classOf(rd(path.join(SC, f))) || "").toLowerCase()));
  const refRe = /data\/sound entities\/(Voice\w+\.xml)/gi, used = new Set();                    // the game's entities the clones' classes name
  for (const f of clones) for (const m of rd(path.join(SC, f)).matchAll(refRe)) used.add(m[1]);
  // the folders are found through the entity (VoiceGWomanWarrior.xml plays GWWarrior/): each folder its entities name that the mod has becomes <folder>_med
  const folders = new Map(VROOT ? fs.readdirSync(VROOT, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => [e.name.toLowerCase(), e.name]) : []);
  const consumed = new Set(); let made = 0, files = 0, renamedList = 0;
  for (const entName of used) {
    const gameEnt = HDSE && ci(HDSE, entName); if (!gameEnt || !VROOT) continue;
    let touched = false;
    let text = rd(path.join(HDSE, gameEnt));
    text = text.replace(/file\s*=\s*"CurrentLang\/voices\/([^"\/]+)\/([^"]+)"/gi, (m, d, f) => {
      const dir = folders.get(d.toLowerCase()); if (!dir) return m;
      const src = fs.readdirSync(path.join(VROOT, dir)).find(x => x.toLowerCase() === f.toLowerCase()); if (!src) return m;   // the game's file stays the game's
      const out = path.join(VROOT, `${dir}_med`); fs.mkdirSync(out, { recursive: true });
      fs.copyFileSync(path.join(VROOT, dir, src), path.join(out, src)); files++; consumed.add(dir); touched = true; return `file="CurrentLang/voices/${dir}_med/${f}"`;
    });
    // HD's entity names files the mod does not have ("Best eye in the land.wav"; the mod's are 1.wav...5.wav, which 1.40's entity named): the unit plays the mod's
    // files, as it did in the mod (the game's entity, with the list of the mod's files)
    if (!touched) {
      const d0 = (text.match(/file\s*=\s*"CurrentLang\/voices\/([^"\/]+)\//i) || [])[1], dir = d0 && folders.get(d0.toLowerCase());
      const wavs = dir ? fs.readdirSync(path.join(VROOT, dir)).filter(x => /\.wav$/i.test(x)).sort() : [];
      if (!wavs.length) continue;
      const out = path.join(VROOT, `${dir}_med`); fs.mkdirSync(out, { recursive: true });
      for (const w of wavs) { fs.copyFileSync(path.join(VROOT, dir, w), path.join(out, w)); files++; }
      text = `${text.match(/<entity\b[^>]*>/)[0]}\n   <files>\n${wavs.map(w => `      <sound file="CurrentLang/voices/${dir}_med/${w}" frequency="20"/>`).join("\n")}\n   </files>\n</entity>\n`;
      consumed.add(dir); renamedList++;
    }
    const newEnt = entName.replace(/\.xml$/i, "_med.xml");
    wr(path.join(OUT, "DATA", "SOUND ENTITIES", newEnt.toUpperCase().replace(/_MED\.XML$/, "_med.XML")), text); made++;
    for (const f of clones) { const p = path.join(SC, f), s = rd(p), t = s.split(`data/sound entities/${entName}`).join(`data/sound entities/${newEnt}`); if (t !== s) wr(p, t); }
  }
  // every folder at the game's paths goes (the game's path is the game's again), except the one of the mod's own neutral horseman (VoiceCHorseman.xml, the mod's)
  const left = [];
  for (const dir of folders.values()) { if (/^CHORSEMAN$/i.test(dir)) continue; fs.rmSync(path.join(VROOT, dir), { recursive: true }); if (!consumed.has(dir)) left.push(dir); }
  const lp = find(OUT, "Local"); if (lp) fs.rmSync(lp, { recursive: true });
  console.log(`voices: ${made} entities of their own, ${consumed.size} folders copied as <folder>_med (${files} files, ${renamedList} entities with the list of the mod's files because HD's names others); not ported, no clone's entity plays them: ${left.join(", ") || "none"}; Local/english.pak left out`);
}

// 4. the shared tables: only what the mod adds
const { xmlAdded, iniAdded } = require("./lib/ported-patch.js");
const report = [], patches = [];
{
  const addXml = (rel, root) => {
    const mp = find(OUT, rel), hp = find(HDDATA, rel.replace(/^DATA\//, "")); if (!mp || !hp) return;
    const r = xmlAdded(rd(hp), rd(mp), root, report, rel); fs.rmSync(mp);
    if (r) { wr(path.join(OUT, "patches", rel), r.xml); patches.push(`${rel} (${r.count} elements)`); }
  };
  const addIni = rel => {
    const mp = find(OUT, rel), hp = find(HDDATA, rel.replace(/^DATA\//, "")); if (!mp || !hp) return;
    const r = iniAdded(rd(hp), rd(mp)); fs.rmSync(mp);
    if (r) { wr(path.join(OUT, "patches", rel), r.text); patches.push(`${rel} (${r.count} keys)`); }
  };
  addXml("DATA/ITEMS.XML", "items"); addIni("DATA/UNIT_SPECIALS.INI"); addIni("DATA/SKILLS.INI");
  // the random maps: the mod's lines for the neutral Greek garrison and the Numidian tent are added to each block; its changes to the counts of the game's
  // own objects (COutpost, TTent) are not
  const mp = find(OUT, "DATA/RANDOMMAP/PLACEOBJECTS.XML"), hp = find(HDDATA, "RANDOMMAP/PLACEOBJECTS.XML");
  if (mp && hp) {
    const blocks = t => [...t.replace(/\r/g, "").matchAll(/<PlaceGameObjects\b[\s\S]*?<\/PlaceGameObjects>/g)].map(m => m[0]);
    const A = blocks(rd(hp)), B = blocks(rd(mp)), ops = [];
    if (A.length !== B.length) report.push("PLACEOBJECTS.XML: not the same blocks as the game's: left out");
    else B.forEach((b, i) => { const hdLines = new Set(A[i].split("\n").map(l => l.trim())); for (const l of b.split("\n")) if (l.trim() && !hdLines.has(l.trim()) && /class="(HOutpost|CTent)"/.test(l)) ops.push(`  <add select="/placeobjects/PlaceGameObjects[${i + 1}]">${l.trim()}</add>`); });
    fs.rmSync(mp);
    if (ops.length) { wr(path.join(OUT, "patches", "DATA", "RANDOMMAP", "PLACEOBJECTS.XML"), `<patch>\n${ops.join("\n")}\n</patch>\n`); patches.push(`DATA/RANDOMMAP/PLACEOBJECTS.XML (${ops.length} lines)`); }
  }
  // game-wide tuning of const.ini (the disease cost): not a civilization's
  fs.rmSync(path.join(OUT, "patches", "data", "const.ini"), { force: true });
  console.log(`patches: ${patches.join("; ")}`);
}

// 5. files at a game path with other bytes
{
  const hdFile = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  const left = [];
  // the game's own files the mod edited in place that are not a civilization's: left out (the edited item scripts)
  const GONE = /^DATA\/(ITEMSCRIPTS\/|CONST\.INI)/i;
  for (const f of walk(OUT)) {
    if (/^(patches|civs|loc|local)\//i.test(f) || f === "mod.json") continue;
    const h = hdFile.get(f.toLowerCase()); if (!h) continue;
    if (md5(path.join(OUT, f)) === md5(h)) { fs.rmSync(path.join(OUT, f)); continue; }
    if (GONE.test(f)) { fs.rmSync(path.join(OUT, f)); left.push(f); }
  }
  // the rest is kept only if something of the mod uses it; what uses it follows the rename (tagCollisions, below)
  for (let pass = 0; pass < 10; pass++) {
    const texts = walk(OUT).filter(f => /\.(xml|ini|vs|txt|json)$/i.test(f) && !/^loc\//i.test(f)).map(f => [f, rd(path.join(OUT, f)).toLowerCase()]);
    let gone = 0;
    for (const f of walk(OUT)) {
      if (/^(patches|civs|loc|local|currentlang)\//i.test(f) || f === "mod.json" || f === "rle.mmp.tail") continue;
      const h = hdFile.get(f.toLowerCase()); if (!h) continue;
      const base = path.basename(f).toLowerCase().replace(/\.rle$/, ""), stem = base.replace(/\.[^.]+$/, "");
      if (/^(units|buildings|mapobjects|outlines|minimap)\//i.test(f)) continue;                      // art and entities: found by folder
      if (!texts.some(([tf, t]) => tf.toLowerCase() !== f.toLowerCase() && (t.includes(base) || (/\.(bmp|wav|mp3)$/i.test(base) && t.includes(stem))))) { fs.rmSync(path.join(OUT, f)); left.push(f + " (nothing uses it)"); gone++; }
    }
    if (!gone) break;
  }
  fs.writeFileSync(path.join(ROOT, "raw", "mediterranevm-alpha-left-out.txt"), left.join("\n") + "\n");
  console.log(`game files with other bytes: ${left.length} left out (raw/mediterranevm-alpha-left-out.txt)`);
}

// the pictures of the neutral map objects whose classes the mod changed (Shrine, Stonehenge: a black outline for a mini-map icon the port does not set)
for (const pic of walk(OUT).filter(x => /^(outlines|minimap)\/.*MAPOBJECTS-/i.test(x))) fs.rmSync(path.join(OUT, pic));

// 6. names another mod of ours (or the game's own adventures) already has with other bytes: this port's are renamed
{
  const { tagCollisions } = require("./lib/ported-patch.js");
  const G = path.join(ROOT, "originals", "game-data");
  const ports = fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== ID && find(path.join(ROOT, "ported", d), "DATA/CLASSES")).map(d => path.join(ROOT, "ported", d));
  for (let pass = 1; pass <= 6; pass++) {
    // rle.mmp.tail is found by its name; the outline and mini-map pictures are named after their entity's folder (renamed below)
    const r = tagCollisions({ OUT, tag: TAG, others: [...ports, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: "Mediterr.", gameDirs: [path.join(G, "paks")], skip: /^(currentlang|ui\/menu|data\/interface\/menu|rle\.mmp\.tail$|outlines\/|minimap\/)/ });
    console.log(`own names (${TAG}), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders (${r.folders.slice(0, 6).join(", ")}), ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    // a renamed art folder: its outline and mini-map pictures are found by "[BLACK_|COLOR_]<top>-<folder>-<name of the entity>.bmp" (the name
    // attribute of the .ent.xml, which the rename above changed too: GGuardPost_w.ent.xml is the entity "GGUARDPOST" in HD)
    for (const f of r.folders) {
      const [top, name] = f.split("/"), dir = find(OUT, `${top}/${name}_${TAG}`); if (!dir) continue;
      for (const e of fs.readdirSync(dir).filter(e => /\.ent\.xml$/i.test(e))) {
        const now = (rd(path.join(dir, e)).match(/<entity\s+name\s*=\s*"([^"]*)"/i) || [])[1]; if (!now) continue;
        const was = now.replace(new RegExp(`_${TAG}$`), "");
        for (const pic of walk(OUT).filter(x => /^(outlines|minimap)\//i.test(x))) {
          const m = path.basename(pic).match(new RegExp(`^((?:BLACK_|COLOR_)?${top}-)${name}-${was}(\\.[^.]+)$`, "i"));
          if (m) fs.renameSync(path.join(OUT, pic), path.join(OUT, path.dirname(pic), `${m[1]}${name}_${TAG}-${now.toUpperCase()}${m[2]}`));
        }
      }
    }
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
  const { ownNames, tagNames } = require("./lib/ported-patch.js");
  const mine = ownNames(OUT, HD), clash = { cmds: new Set(), items: new Set() };
  for (const o of ports) { const t = ownNames(o, HD); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const names = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with other ports: ${clash.cmds.size} orders, ${clash.items.size} items -> "(${TAG})" in ${tagNames({ OUT, names, tag: TAG })} files`);
}

// the rename above also reached a unit's name on screen ("Fisherman_med"): the names the player reads are the mod's
for (const f of walk(OUT).filter(f => /^DATA\/CLASSES\/[^/]+\.SC\.XML$/i.test(f))) {
  const p = path.join(OUT, f), s = rd(p), t = s.replace(/(\bdisplay_name(?:_plural)?\s*=\s*"[^"]*?)_med(?=")/g, "$1");
  if (t !== s) wr(p, t);
}

// 7. hand fixes of this mod (extras/mediterranevm-alpha/): the final files and mod.json with the credits
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }
// a <method>/<behavior> that names a script neither the mod nor the game has: the game could not run it
{
  const have = new Set([...walk(OUT), ...walk(HDDATA).map(f => "DATA/" + f)].map(f => f.toLowerCase())), SC = find(OUT, "DATA/CLASSES");
  let gone = 0;
  for (const f of walk(SC).filter(f => /\.sc\.xml$/i.test(f))) {
    const p = path.join(SC, f), s = rd(p);
    const t = s.replace(/<(?:behavior|method)\b[^>]*?\b(?:script|vs)\s*=\s*"(data\/[^"]+\.vs)"[^>]*\/>[ \t]*/gi, (m, v) => (have.has(v.toLowerCase()) ? m : (gone++, "")));
    if (t !== s) wr(p, t);
  }
  if (gone) console.log(`${gone} method/behavior elements that name a script nobody has removed`);
}
// Elements AFTER </class> (1.40's parser stops at </class>; HD's refuses the whole class and the match falls back to the menu): cut
{
  const SC = find(OUT, "DATA/CLASSES"); let n = 0;
  for (const f of walk(SC).filter(f => /\.sc\.xml$/i.test(f))) {
    const p = path.join(SC, f), s = rd(p), i = s.search(/<\/class\s*>/i);
    if (i < 0) continue;
    const end = i + s.slice(i).indexOf(">") + 1;
    if (s.slice(end).trim()) { wr(p, s.slice(0, end) + "\r\n"); n++; }
  }
  if (n) console.log(`${n} classes had text after </class>: cut`);
}
// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
fs.rmSync(WORK, { recursive: true, force: true });
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
