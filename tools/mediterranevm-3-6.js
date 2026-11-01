// Mediterranevm Mod v3.6 (GreekModTeam / MediterranevmTeam, row 386, ModDB 2023-04-17, updated 2024-03-09): the game's eight civilizations as the mod has them, each a
// civilization of its own next to the game's (AGENTS.md, "Civilizations are independent"). The ancestor of Imperivm Legacy; NOT the alpha (row 200, tools/mediterranevm-alpha.js:
// 313 of its files are the same, 259 are not): its own tag, ids and prefixes. The mod is three archives (ENG, ES, ITA) of the same game folder: HD's own `Packs/*.pak` (identical
// to HD's, checked), loose files over them (identical in the three but `Currentlang`), a `rle.mmp` of 420 MB and `local/<language>.pak`. Rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/mediterranevm-3-6.js [id ...]     (no id: all eight)
// It unpacks the ENG archive in a temporary folder (nothing is written under originals/), leaves out `Packs/`, `local/` and `Settings.ini` (HD's own or inert), runs the
// SDK's shrink-mod.js on it (what is identical to the game stays out; the sprites that are not the game's go to rle.mmp.tail: 28.8 MB), and then the steps of the alpha's tool:
//   1. the mod's version of the game's classes and commands is kept apart and leaves the port; each civilization is cloned from HD with the mod's changes on top
//   2. the neutral classes, the commands for the base classes, the voices as the clones' own, the shared tables as patches that only ADD, names that collide get the tag
//   3. the Spanish and Italian archives give texts (loc/) and the lines they record themselves (Local/<language>/voices); the AI of the mod is NOT ported (NOTES.md)
// The ids start with `g` (token of this mod): the prefixes derived from them (Gga Gro Gim Gca Gbr Gib Geg Gge) are distinct, no index.
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const { ROOT, SDK, LEGACY_PORTED } = require("./lib/greek-2x-versions.js");
process.env.SDK = SDK;                                      // the shared tools read it
const ID = "mediterranevm-3-6", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const ARCH = lang => path.join(ROOT, "originals", "moddb", "mediterranevm-mod-3-6", "files", `MediterranevmMod_3.6_${lang}.rar`);
const GAME = process.env.G;

const OWN_BUGS = new Map([["gameres/icons/upgrades/sacredhealing.bmp", "the mod's new Sacred Healing research names it; none of the three archives has a sacredhealing.bmp (the two files named so are a sound entity and a script, checked): the original did not resolve either"]]);   // references the mod's own package cannot resolve either: key (lowercase) -> reason
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const TAG = "g36", LABEL = "Med 3.6";
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const want = process.argv.slice(2);
if (!GAME || !fs.existsSync(path.join(GAME, "rle.mmp"))) { console.error('set G to the HD game folder (shrink-mod.js compares with it), e.g. G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"'); process.exit(1); }
for (const l of ["ENG", "ES.1", "ITA"]) if (!fs.existsSync(ARCH(l))) { console.error("no " + ARCH(l) + " (originals/moddb/mediterranevm-mod-3-6/)"); process.exit(1); }

// the ids start with "g" and differ in their first three characters: the SDK derives the prefix from them (Gga Gro Gim Gca Gbr Gib Geg Gge). No index.
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "ggaul", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "grome", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "gimperial", skipExtra: /^HHoplite/, name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  // CTent (the Numidian tent a map places) and the two mercenaries it hires are nobody's: the tent's scripts place them by name for whoever owns it
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "gcarthage", neutral: /^(CTent|CHorseman|CMercenaryTuareg)$/, skipExtra: /^HOutpost/, name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "gbritain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "giberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "gegypt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "ggermany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];

// 0. the mod unpacked and shrunk in a temporary folder, then the port from it
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), "mediterranevm-3-6-")), MERGED = path.join(WORK, "merged");
// the archives: ENG is the base (the loose files are the same in the three); ES and ITA give their texts and voices below
const UNPACKED = {};
for (const [k, l] of [["eng", "ENG"], ["es", "ES.1"], ["ita", "ITA"]]) {
  if (k !== "eng" && want.length) continue;
  UNPACKED[k] = path.join(WORK, `arch-${k}`); fs.mkdirSync(UNPACKED[k], { recursive: true });
  const r = cp.spawnSync("bsdtar", ["-xf", ARCH(l), "-C", UNPACKED[k], ...(k === "eng" ? [] : ["Currentlang"])], { stdio: "inherit" }); if (r.status) process.exit(1);   // ES and ITA: their Currentlang only
}
{
  const src = UNPACKED.eng;
  // HD's own packs (byte-identical to HD's: checked), the Spanish voices of HD under paths no entity names, and the game's settings: not the mod's
  for (const x of ["Packs", "local", "Settings.ini"]) fs.rmSync(path.join(src, x), { recursive: true, force: true });
  // folder names as the game's packs have them (DATA/CLASSES, UNITS...): the tools below look for them
  const upper = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { const up = e.name.toUpperCase(), p = path.join(d, e.name); upper(p); if (up !== e.name) fs.renameSync(p, path.join(d, up)); } };
  for (const top of ["Data", "Units", "Buildings", "Outlines", "Minimap", "MapObjects", "Sounds", "Terrain", "UI", "Visuals"]) if (fs.existsSync(path.join(src, top))) { upper(path.join(src, top)); fs.renameSync(path.join(src, top), path.join(src, top.toUpperCase())); }
  fs.rmSync(OUT, { recursive: true, force: true });
  const s = cp.spawnSync("node", [path.join(SDK, "tools", "shrink-mod.js"), src, GAME, OUT, "--id", ID, "--name", "Mediterranevm 3.6", "--version", "3.6", "--category", "Civilizations"], { stdio: "inherit" });
  if (s.status) process.exit(1);
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
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "Mediterranevm 3.6", LABEL, CIVS, cloneAllOrders: true, want });   // LABEL: the lobby cuts a name at about 22 characters

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
  if (own.length) wr(path.join(COMMANDS, "MEDITERRANEVM36.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
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
    const p = path.join(COMMANDS, "MEDITERRANEVM36.XML"), t = fs.existsSync(p) ? rd(p) : "<commands>\n\n</commands>\n";
    wr(p, t.replace(/\s*<\/commands>\s*$/, `\n\n${add.join("\n\n")}\n\n</commands>\n`));
  }
  console.log(`commands of the mod for the game's base classes: ${add.length} added with the port's classes under them as sources (${noHeirs} with no class of this port under them left out)`);
}

// 3c. the voices. The mod replaced the game's voice files of its units (Currentlang/Voices/<unit>/1..5.wav) at the game's own paths: with the mod active, the game's
// civilizations would sound like the mod's. Each folder the clones use becomes a folder of its own (<unit>_g36) with an entity of its own (Voice<unit>_g36.xml,
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
  // the folders are found through the entity (VoiceGWomanWarrior.xml plays GWWarrior/): each folder its entities name that the mod has becomes <folder>_g36
  const folders = new Map(VROOT ? fs.readdirSync(VROOT, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => [e.name.toLowerCase(), e.name]) : []);
  const consumed = new Set(); let made = 0, files = 0, renamedList = 0;
  for (const entName of used) {
    const gameEnt = HDSE && ci(HDSE, entName); if (!gameEnt || !VROOT) continue;
    let touched = false;
    let text = rd(path.join(HDSE, gameEnt));
    text = text.replace(/file\s*=\s*"CurrentLang\/voices\/([^"\/]+)\/([^"]+)"/gi, (m, d, f) => {
      const dir = folders.get(d.toLowerCase()); if (!dir) return m;
      const src = fs.readdirSync(path.join(VROOT, dir)).find(x => x.toLowerCase() === f.toLowerCase()); if (!src) return m;   // the game's file stays the game's
      const out = path.join(VROOT, `${dir}_${TAG}`); fs.mkdirSync(out, { recursive: true });
      fs.copyFileSync(path.join(VROOT, dir, src), path.join(out, src)); files++; consumed.add(dir); touched = true; return `file="CurrentLang/voices/${dir}_${TAG}/${f}"`;
    });
    // HD's entity names files the mod does not have ("Best eye in the land.wav"; the mod's are 1.wav...5.wav, which 1.40's entity named): the unit plays the mod's
    // files, as it did in the mod (the game's entity, with the list of the mod's files)
    if (!touched) {
      const d0 = (text.match(/file\s*=\s*"CurrentLang\/voices\/([^"\/]+)\//i) || [])[1], dir = d0 && folders.get(d0.toLowerCase());
      const wavs = dir ? fs.readdirSync(path.join(VROOT, dir)).filter(x => /\.wav$/i.test(x)).sort() : [];
      if (!wavs.length) continue;
      const out = path.join(VROOT, `${dir}_${TAG}`); fs.mkdirSync(out, { recursive: true });
      for (const w of wavs) { fs.copyFileSync(path.join(VROOT, dir, w), path.join(out, w)); files++; }
      text = `${text.match(/<entity\b[^>]*>/)[0]}\n   <files>\n${wavs.map(w => `      <sound file="CurrentLang/voices/${dir}_${TAG}/${w}" frequency="20"/>`).join("\n")}\n   </files>\n</entity>\n`;
      consumed.add(dir); renamedList++;
    }
    const newEnt = entName.replace(/\.xml$/i, `_${TAG}.xml`);
    wr(path.join(OUT, "DATA", "SOUND ENTITIES", newEnt.toUpperCase().replace(new RegExp(`_${TAG}\\.XML$`, "i"), `_${TAG}.XML`)), text); made++;
    for (const f of clones) { const p = path.join(SC, f), s = rd(p), t = s.split(`data/sound entities/${entName}`).join(`data/sound entities/${newEnt}`); if (t !== s) wr(p, t); }
  }
  // every folder at the game's paths goes (the game's path is the game's again), except the one of the mod's own neutral horseman (VoiceCHorseman.xml, the mod's)
  const left = [];
  // (and the folders that the mod's OWN entities name: its own units' voices, VoiceFisherman.xml, VoiceHHoplite.xml, VoiceCSkirmisher.xml... the game has no entity of those names)
  const ownEnt = fs.readdirSync(path.join(OUT, "DATA", "SOUND ENTITIES")).filter(e => !ci(HDSE, e));
  const ownText = ownEnt.map(e => rd(path.join(OUT, "DATA", "SOUND ENTITIES", e)).toLowerCase()).join("\n");
  const keep = new Set([...folders.values()].filter(d => /^CHORSEMAN$/i.test(d) || ownText.includes(`voices/${d.toLowerCase()}/`)).map(d => d.toLowerCase()));
  for (const dir of folders.values()) { if (keep.has(dir.toLowerCase())) continue; fs.rmSync(path.join(VROOT, dir), { recursive: true }); if (!consumed.has(dir)) left.push(dir); }
  const lp = find(OUT, "Local"); if (lp) fs.rmSync(lp, { recursive: true });
  console.log(`voices: ${made} entities of their own, ${consumed.size} folders copied as <folder>_${TAG} (${files} files, ${renamedList} entities with the list of the mod's files because HD's names others); not ported, no clone's entity plays them: ${left.join(", ") || "none"}; Local/english.pak left out`);
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
  // the random maps: the mod's PLACEOBJECTS.XML puts the Greek garrison (HOutpost) in every outpost block and the Numidian tent (CTent) next to the Teuton tent, with a
  // RaceAlternative per race, in blocks of several lines inside <ifdef>s: a setting of how EVERY random map is made, not a civilization's: not ported, listed in NOTES.md
  // (the alpha's tool added single lines, which is not this file's shape)
  const mp = find(OUT, "DATA/RANDOMMAP/PLACEOBJECTS.XML");
  if (mp) { fs.rmSync(mp); report.push("DATA/RANDOMMAP/PLACEOBJECTS.XML: places HOutpost and CTent in every random map (multi-line blocks with RaceAlternative): global, not ported"); }
  // game-wide tuning of const.ini (the disease cost): not a civilization's
  // The keys the mod's scripts read that the game's CONST.INI lacks (DoubleHealAmount...) are added by a patch that ONLY adds keys; the values it changes of the game's own keys
  // are not a civilization's and stay out (listed in NOTES.md, raw/<id>-const-ini.txt)
  {
    const cp0 = [path.join(OUT, "patches", "data", "const.ini")].find(x => fs.existsSync(x)), hd0 = find(HDDATA, "CONST.INI");   // shrink-mod.js writes patches/data (lowercase): next to the patches/DATA of this tool, so find() cannot tell them apart
    if (cp0 && hd0) {
      const mod = rd(cp0), r = iniAdded(rd(hd0), mod);
      if (r) { wr(path.join(OUT, "patches", "DATA", "CONST.INI"), r.text); patches.push(`DATA/CONST.INI (${r.count} keys)`); }
      const parse = s => { const m = new Map(); let sec = ""; for (const l of s.replace(/\r/g, "").split("\n")) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; continue; } const k = l.match(/^\s*([^;=\s][^=]*?)\s*=\s*([^;]*?)\s*(?:;.*)?$/); if (k) m.set(`${sec}|${k[1]}`, k[2]); } return m; };
      const A = parse(rd(hd0)), B = parse(mod), diff = [...B].filter(([k, v]) => A.has(k) && A.get(k) !== v).map(([k, v]) => `${k.replace("|", " / ")}: game ${A.get(k)} -> mod ${v}`);
      fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, "raw", `${ID}-const-ini.txt`), `# values of the game's own CONST.INI keys the mod changes (global: not ported)\n${diff.join("\n")}\n`);
      console.log(`CONST.INI: ${r ? r.count : 0} keys the game lacks added by a patch, ${diff.length} values of the game's own keys left out (raw/${ID}-const-ini.txt)`);
    }
    fs.rmSync(path.join(OUT, "patches", "data"), { recursive: true, force: true });
  }
  console.log(`patches: ${patches.join("; ")}`);
}

// The AI of the mod. Its 28 scripts at the game's own paths (ES_Stronghold, ESH_*, SquadMonitor, TS_*, GetGAIKAStrat, GetTacticScript, AI.INI, DEFENSIVE/EvalRecruit...) edit the
// game's AI in place: at those paths they would replace it for every civilization, and porting each as a copy for the clones only (the 2.x line's forks and redirects) is a work of
// its own that nobody has tried in game: NOT ported here, listed in NOTES.md (the clones play with the game's AI: `ai: true`). The mod's AI PROFILE `_TEUTON` is a folder of its own
// (the engine lists every subfolder of data/ai as an AI profile the player picks in the lobby, ScanAIProfiles 0x4433b0): it stays, renamed `_TEUTON_<tag>` as a whole (its files keep
// their names: the profile needs its own ai.ini)
{
  const AI = find(OUT, "DATA/AI"), left = [];
  if (AI) {
    for (const e of fs.readdirSync(AI, { withFileTypes: true })) {
      const p = path.join(AI, e.name);
      if (e.isDirectory() && /^_TEUTON$/i.test(e.name)) { fs.renameSync(p, path.join(AI, `${e.name}_${TAG}`)); continue; }
      for (const f of e.isDirectory() ? walk(p) : [""]) left.push(path.join(e.name, f));
      fs.rmSync(p, { recursive: true, force: true });
    }
    fs.writeFileSync(path.join(ROOT, "raw", `${ID}-ai-left-out.txt`), `# AI scripts of the mod at the game's own paths: not ported\n${left.join("\n")}\n`);
    console.log(`AI: ${left.length} scripts of the mod at the game's paths not ported (raw/${ID}-ai-left-out.txt); profile _TEUTON kept as _TEUTON_${TAG}`);
  }
}

// 5. files at a game path with other bytes
{
  const hdFile = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  const left = [];
  // the game's own files the mod edited in place that are not a civilization's: left out (the edited item scripts)
  const GONE = /^DATA\/(ITEMSCRIPTS\/|CONST\.INI)/i;
  const ENGINE_READ = /^(DATA\/(RANDOMMAP\/|GAMESCRIPTS\/|TERRAINS\.XML|VXNOTIFICATIONS\.XML)|UI\/(INFOBAR\/|CMDBAR\/(FRAMES\/|EMPTYMENU|[^/]+\.bmp$)))/i;
  // GLOBAL, reason 1: the terrain textures. They go with terrains.xml (global, not ported), so no class of the port uses them, and the mini-map ones replace the game's grass3.bmp & co at the game's paths.
  for (const f of walk(OUT)) if (/^(TERRAIN\/|MINIMAP\/ZOOM\d+\/TERRAIN\/)/i.test(f)) { fs.rmSync(path.join(OUT, f)); left.push(f + " (global, reason 1: terrain texture; it goes with terrains.xml, which is global)"); }
  // THE MENU SKIN (AGENTS.md, "Civilizations are independent": the cosmetic exception). Shipped, not left out:
  //  - Currentlang/{MenuBackground,Logo,AdventureDefault}.bmp: whole files at the game's paths (only one skin shows; the content manager lets the player choose). Checked: all three differ from the game's, none is a text table.
  //  - DATA/INTERFACE/MENU/*.ini: a patch of only the keys the mod changed (tools/lib/menu-skin.js, as the 4.2, the 1.8 and the 2.x ports do): the skin moves every menu panel to a 1920x1080 layout, so
  //    all 13 MENU files that differ from the game's are the skin's (MAINMENU.INI and TEMPLATE.INI place the logo, the buttons and the panel; the others follow them). The 13 others are the game's byte for byte (shrink-mod.js dropped them).
  const nSkin = require("./lib/menu-skin.js").skinToPatches({ OUT, HD });
  console.log(`menu skin: ${nSkin} layout files became patches of the keys they changed; Currentlang/*.bmp stay`);
  // the validator warns (and the SDK says) that the engine does not strip a comment at the end of a key line ("Button12Rect = ... %ButtonHeight% ;Start estrategia"): in the patches the comments are dropped, the values stay
  { let nc = 0; const dir = find(OUT, "patches/DATA/INTERFACE/MENU");
    for (const f of dir ? fs.readdirSync(dir) : []) { const pp = path.join(dir, f), t = rd(pp), n = t.replace(/^((?!Text\s*=)[A-Za-z0-9_.]+\s*=\s*[^;\r\n]*?)[ \t]+;[^\r\n]*/gm, (_m, a) => { nc++; return a; }); if (n !== t) wr(pp, n); }
    if (nc) console.log(`menu skin: ${nc} comments at the end of a line left out of the patches (the engine does not strip them)`); }
  // the mod's CONQUESTGAME.INI points [BackImage] at UI/Interface/MenuMod.bmp, a picture that is in none of the three archives or in the game (the mod's own bug): that key is not shipped, the conquest screen keeps the game's CurrentLang/MenuBackground.bmp (= the skin's)
  { const pp = find(OUT, "patches/DATA/INTERFACE/MENU/CONQUESTGAME.INI");
    if (pp) { const t = rd(pp), n = t.replace(/\[BackImage\]\r?\nImage = UI\/Interface\/MenuMod\.bmp\r?\n/i, ""); if (n !== t) { wr(pp, n); left.push("DATA/INTERFACE/MENU/CONQUESTGAME.INI [BackImage] Image = UI/Interface/MenuMod.bmp (key not shipped: the picture exists nowhere, the mod's own bug)"); console.log("CONQUESTGAME.INI: the [BackImage] key that names the missing MenuMod.bmp is not shipped"); } } }
  // GLOBAL, reason 2: the rest of DATA/INTERFACE is not the menu skin: the in-game command bars and info bar of the game's own civilizations (the engine reads them by path) and the editor's unit combo. They would change the game's own civilizations.
  for (const f of walk(OUT)) if (/^DATA\/INTERFACE\/(CMDBAR|INFOBAR|EDITOR)\//i.test(f)) { fs.rmSync(path.join(OUT, f)); left.push(f + " (global, reason 2: in-game bar / editor INI the engine reads by path; not the menu skin)"); }
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
      if (!texts.some(([tf, t]) => tf.toLowerCase() !== f.toLowerCase() && (t.includes(base) || (/\.(bmp|wav|mp3)$/i.test(base) && t.includes(stem))))) { fs.rmSync(path.join(OUT, f)); left.push(f + (ENGINE_READ.test(f) ? " (global, reason 3: the engine reads it by path or name, no class of the port names it: pictures of the game\u0027s own in-game bars, random maps, game scripts, terrains, notifications)" : " (no class, entity or script of the port names it: a script or picture of the game at its own path that the mod edited)")); gone++; }
    }
    if (!gone) break;
  }
  fs.writeFileSync(path.join(ROOT, "raw", `${ID}-left-out.txt`), left.join("\n") + "\n");
  console.log(`game files with other bytes: ${left.length} left out (raw/${ID}-left-out.txt)`);
}

// the pictures of the neutral map objects whose classes the mod changed (Shrine, Stonehenge: a black outline for a mini-map icon the port does not set)
for (const pic of walk(OUT).filter(x => /^(outlines|minimap)\/.*MAPOBJECTS-/i.test(x))) fs.rmSync(path.join(OUT, pic));

// the mod's own bug: the class RThermae names `Buildings/Thermae/RThermae_as.ent.xml` for its entity and `Buildings/RThermae/...` for the seasons; the folder the mod ships is
// RThermae (no file is invented: the path is the one of the same class's other lines)
{
  const p = find(OUT, "DATA/CLASSES/RTHERMAE.SC.XML");
  if (p) { const s = rd(p), n = s.replace(/entity="Buildings\/Thermae\/RThermae_as\.ent\.xml"/, 'entity="Buildings/RThermae/RThermae_as.ent.xml"'); if (n !== s) { wr(p, n); console.log("RThermae: entity path put on the folder the mod ships (its own typo)"); } }
}

// 6. names another mod of ours (or the game's own adventures) already has with other bytes: this port's are renamed
{
  const { tagCollisions } = require("./lib/ported-patch.js");
  const G = path.join(ROOT, "originals", "game-data");
  const ports = fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== ID && find(path.join(ROOT, "ported", d), "DATA/CLASSES")).map(d => path.join(ROOT, "ported", d));
  // Imperivm Legacy (the 3.6's descendant: BlackWolf, RThermae, Ruins2... share ids with it) is git-ignored in the main checkout: looked up there (as tools/greek-2x.js does). Without it the
  // build would rename LESS and differ from one that has it, so it stops (GREEK2X_NO_LEGACY=1 builds without it).
  for (const d of ["imperivm-legacy", "imperivm1-legacy"]) {
    if (ports.some(x => path.basename(x) === d)) continue;
    const q = LEGACY_PORTED.map(b => path.join(b, d)).find(x => fs.existsSync(x));
    if (q) ports.push(q); else if (d === "imperivm-legacy" && !process.env.GREEK2X_NO_LEGACY) { console.error(`no ${d} in ${path.join(ROOT, "ported")} or in ${LEGACY_PORTED.join(", ")}: build it there, set LEGACY_PORTED, or GREEK2X_NO_LEGACY=1`); process.exit(1); }
  }
  console.log(`names compared with: ${ports.map(x => path.basename(x)).join(", ")}`);
  for (let pass = 1; pass <= 6; pass++) {
    // rle.mmp.tail is found by its name; the outline and mini-map pictures are named after their entity's folder (renamed below)
    const r = tagCollisions({ OUT, tag: TAG, others: [...ports, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: LABEL, gameDirs: [path.join(G, "paks")], skip: new RegExp(`^(currentlang|ui/menu|data/interface/menu|rle\\.mmp\\.tail$|outlines/|minimap/|data/ai/_teuton_${TAG}/)`, "i") });
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

// a folder of sounds or voices whose name a text has just got the tag on (the rename of an art folder swaps its name in every text, `Sounds/animals/Snake/` too): the folder follows
{
  let n = 0;
  for (const f of walk(OUT).filter(f => /\.(xml|ini)$/i.test(f) && !/^(loc|local|patches)\//i.test(f))) for (const m of rd(path.join(OUT, f)).matchAll(new RegExp(`((?:currentlang/voices|sounds(?:/[^/"']+)*))/([^/"']+)_${TAG}/`, "gi"))) {
    const parent = find(OUT, m[1]); if (!parent) continue;
    const kids = fs.readdirSync(parent), from = kids.find(x => x.toLowerCase() === m[2].toLowerCase());
    if (from && !kids.some(x => x.toLowerCase() === `${m[2]}_${TAG}`.toLowerCase())) { fs.renameSync(path.join(parent, from), path.join(parent, `${from}_${TAG}`)); n++; }
  }
  if (n) console.log(`${n} folders of sounds or voices follow the name their texts got`);
}

// the rename above also reached a unit's name on screen ("Fisherman_g36"): the names the player reads are the mod's
for (const f of walk(OUT).filter(f => /^DATA\/CLASSES\/[^/]+\.SC\.XML$/i.test(f))) {
  const p = path.join(OUT, f), s = rd(p), t = s.replace(new RegExp(`(\\bdisplay_name(?:_plural)?\\s*=\\s*"[^"]*?)_${TAG}(?=")`, "g"), "$1");
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
// 7b. the Spanish and Italian archives: their texts (loc/<language>.loc.xml: only what the mod ADDS, and what it changed of the game's own texts is kept for the clones' orders and
// classes that carry the mod's names, never for the game's own: AGENTS.md) and the voice lines they record themselves (Local/<language>/voices/<unit>_<tag>/). The data of the three
// archives is the same: only Currentlang differs (checked: 15911 files same, 422 differ, all in Currentlang)
if (UNPACKED.es && UNPACKED.ita) {
  const G0 = path.join(ROOT, "originals", "game-data");
  const alias = { classes: new Map(), commands: new Map() };
  for (const f of fs.readdirSync(path.join(OUT, "civs"))) { let j; try { j = JSON.parse(fs.readFileSync(path.join(OUT, "civs", f), "utf8")); } catch (e) { console.error(`civs/${f} is not valid JSON (${e.message}): the build stops`); process.exit(1); } for (const k of ["classes", "commands"]) for (const [o, n] of Object.entries((j.alias || {})[k] || {})) (alias[k].get(o) || alias[k].set(o, []).get(o)).push(n); }
  // the mod's own classes that carry the tag (the neutral ones)
  for (const f of walk(find(OUT, "DATA/CLASSES")).filter(f => /\.sc\.xml$/i.test(f))) { const id = classOf(rd(path.join(find(OUT, "DATA/CLASSES"), f))); const m = id && id.match(new RegExp(`^(.+)_${TAG}$`)); if (m) (alias.classes.get(m[1]) || alias.classes.set(m[1], []).get(m[1])).push(id); }
  const decode = b => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; };
  const entries = file => { const m = new Map(); if (file && fs.existsSync(file)) for (const e of decode(fs.readFileSync(file)).matchAll(/<translationtableentry\b[^>]*?\/>/g)) { const at = k => (e[0].match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1]; const text = at("text"); if (text != null) m.set(`${text}\0${at("context") || ""}`, { line: e[0], text, just: at("justtext"), ctx: at("context") || "", res: at("result") }); } return m; };
  for (const [k, lang] of [["es", "spanish"], ["ita", "italian"]]) {
    const modT = entries(find(path.join(UNPACKED[k], "Currentlang"), "GAME.LOC.XML")), hdT = entries(path.join(G0, `local-${lang}`, "CURRENTLANG", "GAME.LOC.XML"));
    const out = new Map(); let fresh = 0, mapped = 0, changedGone = 0;
    for (const [key, e] of modT) {
      const h = hdT.get(key), isNew = !h, differs = h && h.res !== e.res;
      if (!isNew && !differs) continue;
      let targets = [];
      const cm = e.ctx.match(/^(.+?) class name( plural)?$/);
      if (cm && alias.classes.has(cm[1])) targets = alias.classes.get(cm[1]).map(n => `${n} class name${cm[2] || ""}`);
      else if (alias.commands.has(e.ctx)) targets = alias.commands.get(e.ctx);
      for (const n of targets) {
        const nk = `${e.text.split("@")[0]}@${n}`; if (out.has(nk)) continue;
        out.set(nk, e.line.replace(/\btext="[^"]*"/, () => `text="${nk}"`).replace(/\bcontext="[^"]*"/, () => `context="${n}"`)); mapped++;
      }
      if (isNew && !targets.length) { out.set(key, e.line); fresh++; }
      else if (differs && !targets.length) changedGone++;
    }
    if (out.size) { wr(path.join(OUT, "loc", `${lang}.loc.xml`), "\ufeff<translationtable>\n" + [...out.values()].join("\n") + "\n</translationtable>\n"); }
    console.log(`${lang}: ${out.size} texts (${fresh} new keys as they are, ${mapped} for the clones' and neutral classes and orders); ${changedGone} texts that change the game's own left out`);
    // the voices the language archive records itself: not the game's own (byte-identical to HD's same-language voices)
    const HDV = path.join(G0, `local-${lang}`, "CURRENTLANG", "VOICES"), hdHash = new Set(walk(HDV).map(f => md5(path.join(HDV, f))));
    const AV = find(path.join(UNPACKED[k], "Currentlang"), "Voices"), cloneV = find(OUT, "Currentlang/Voices");
    let copied = 0, modOnly = 0;
    if (AV && cloneV) for (const f of walk(AV)) {
      const p = path.join(AV, f); if (hdHash.has(md5(p))) continue; modOnly++;
      const [dir, ...rest] = f.split("/"), mine = fs.readdirSync(cloneV).find(x => x.toLowerCase() === `${dir}_${TAG}`.toLowerCase());
      if (!mine || !rest.length) continue;
      const dst = path.join(OUT, "local", lang, "voices", mine, rest.join("/")); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(p, dst); copied++;
    }
    console.log(`${lang} voices: ${modOnly} files of the archive are not the game's own, ${copied} go to Local/${lang}/voices (the clones' own folders)`);
  }
}

// 8. what the texts name: pictures, sounds, entities, scripts (tools/lib/greek-2x-refs.js, greek-2x-names.js, greek-2x-checks.js: the build stops on a problem)
{
  const refs = require("./lib/greek-2x-refs.js"), { checkScripts } = require("./lib/greek-2x-checks.js");
  const fixed = [...refs.fixBmpRefs(OUT, HD, TAG), ...refs.fixSoundRefs(OUT, HD, TAG), ...refs.fixClassWords(OUT, TAG)];
  console.log(`references put back to the name the mod's text had: ${fixed.length}${fixed.length ? "\n  " + fixed.join("\n  ") : ""}`);
  const ownBugs = new Map();   // the original's own references that no package resolves: filled in with the reason, from what the check finds
  for (const [k, why] of OWN_BUGS) ownBugs.set(k, why);
  const r = refs.checkRefs(OUT, HD, TAG, { extraRoots: [], hdClasses: refs.hdSounds(HD), ownBugs });
  console.log(`references: ${r.checked} checked, ${r.problems.length} that do not resolve, ${r.allowed.size} allowed`);
  for (const [k, why] of r.allowed) console.log(`  allowed ${k}: ${why}`);
  for (const p of r.patternBroken) report.push(`${p}: renamed to a name that does not end in .sc.xml; whether the class loader reads it was not checked`);
  if (r.problems.length) { console.error("REFERENCES that do not resolve:\n  " + r.problems.join("\n  ")); process.exitCode = 1; }
  const c = checkScripts({ OUT, HD, SDK });
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", `${ID}-script-checks.txt`), [...c.notes, "", `${c.errors.length} errors`, ...c.errors, "", `${c.warnings.length} warnings`, ...c.warnings].join("\n") + "\n");
  console.log(`script checks: ${c.notes.join(" | ")}; ${c.errors.length} errors, ${c.warnings.length} warnings (raw/${ID}-script-checks.txt)`);
  if (c.errors.length) { console.error("SCRIPT CHECKS FAILED:\n  " + c.errors.join("\n  ")); process.exitCode = 1; }
}
// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
fs.rmSync(WORK, { recursive: true, force: true });
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
