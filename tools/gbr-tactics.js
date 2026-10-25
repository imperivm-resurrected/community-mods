// GBR Tactics 2.4 (zeloslaw, row 198): the game's eight civilizations as the mod has them, each a civilization of its own next to the game's
// (AGENTS.md, "Civilizations are independent"). Run after tools/port-140.js has built the port in originals/gbr-tactics-2-4-pristine:
//   node tools/gbr-tactics.js [id ...]        (no id: all eight)
// Rebuilds ported/gbr-tactics from the pristine copy (hard links, so it costs no space) and then:
//   1. keeps the mod's version of the game's classes and commands (originals/gbr-tactics-merged) and drops them from the port: they are the
//      game's, and each civilization they belong to is cloned from HD with the mod's changes on top (tools/lib/clone-civs.js); what the mod
//      changed in the base classes (Hero, Catapult, Ranged...) is written inside each clone
//   2. the commands of the mod's classes that belong to no civilization (Great Tavern, Iron Mine...) are an own file / patches
//   3. the shared tables the mod edited in place (items, skills, unit specials, formations) only contribute what they ADD, as patches: the
//      mod's edits of the game's own items and values are not ported (they would change every civilization)
//   4. files at a game path with other bytes: kept (under a name of its own) when something of the mod uses them, left out otherwise.
//      The mod's AI (DATA/AI) and game modes are left out: see NOTES.md, Pending
//   5. names other ports of ours already have are renamed here (tools/lib/ported-patch.js)
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const PRISTINE = path.join(ROOT, "originals", "gbr-tactics-2-4-pristine"), OUT = path.join(ROOT, "ported", "gbr-tactics"), MERGED = path.join(ROOT, "originals", "gbr-tactics-merged");
const EXTRAS = path.join(ROOT, "extras", "gbr-tactics");
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const TAG = "gbrt";
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const want = process.argv.slice(2);
if (!fs.existsSync(PRISTINE)) { console.error("no " + PRISTINE + ": run tools/port-140.js first (see extras/gbr-tactics/NOTES.md, Rebuild)"); process.exit(1); }

// The ids have different first three letters on purpose: the prefix of a civilization is derived from them (Gau, Bri, Car...). No index: the engine assigns it.
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "gaul_gbrt", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "republic_gbrt", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "imperial_gbrt", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "carthage_gbrt", name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "britain_gbrt", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "iberia_gbrt", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "egypt_gbrt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "germany_gbrt", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];

// 0. a fresh copy of the pristine port: hard links (every write below removes the file first)
fs.rmSync(OUT, { recursive: true, force: true });
cp.spawnSync("cp", ["-al", PRISTINE, OUT], { stdio: "inherit" });
// what the installer left next to the packs: not part of the mod (the maintainer reads the Readme in NOTES.md)
for (const f of ["ChangeLang.bat", "OtherLangSettings.ini", "Readme.txt", "UpdateClient_Log.html", "UpdateClient_Status.xml", "uninstall.ini", "NOTHING/NOTHING.TXT"]) fs.rmSync(path.join(OUT, f), { force: true });
// The mod's TAxeman entity says its Walk sprite has 10 rows and animates 20 frames (the game's sprite has 12 rows): it would read rows that do
// not exist (validate-mod.js says so). The game's entity stays; only the mod's walk timing for the Germanic axeman is lost.
fs.rmSync(path.join(OUT, "UNITS", "TAXEMAN", "TAXEMAN.ENT.XML"), { force: true });
// scripts saved in Latin-1 (accents): the game's compiler wants UTF-8, as for the classes (port-140.js)
for (const f of walk(OUT).filter(f => /\.vs$/i.test(f))) {
  const p = path.join(OUT, f), b = fs.readFileSync(p);
  try { new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { fs.rmSync(p); fs.writeFileSync(p, Buffer.from(b.toString("latin1"), "utf8")); }
}
const CLASSES = find(OUT, "DATA/CLASSES"), COMMANDS = find(OUT, "DATA/COMMANDS");
const HD_CLASSES = find(HD, "DATA/CLASSES");
const hdClass = new Set(walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f)).map(f => (classOf(rd(path.join(HD_CLASSES, f))) || "").toLowerCase()));

// 1. what the mod did to the game's classes and commands: kept apart, and the game's classes leave the port
fs.rmSync(MERGED, { recursive: true, force: true });
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
// The scripts the mod edited in place (unit_engage.vs, melee_attack.vs, unit_on_kill.vs...) are run by the game's base classes through
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

// the classes of the mod's own that no civilization owns (Great Tavern, Iron Mine...): the commands that name them
const neutral = new Set();
{
  const info = new Map();
  for (const f of walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const s = rd(path.join(HD_CLASSES, f)); info.set(classOf(s), { race: (s.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1], parent: (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] }); }
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const s = rd(path.join(CLASSES, f)); info.set(classOf(s), { race: (s.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1], parent: (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] }); }
  const raceOf = id => { for (let c = id, n = 0; c && n < 20; n++) { const x = info.get(c); if (!x) return null; if (x.race && x.race !== "None") return x.race; c = x.parent; } return null; };
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const id = classOf(rd(path.join(CLASSES, f))); if (id && !raceOf(id)) neutral.add(id); }
}

// 2. the civilizations of the game, as the mod has them
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "GBR Tactics", LABEL: "GBRT", CIVS, cloneAllOrders: true, want });

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
  if (own.length) wr(path.join(COMMANDS, "GBRTACTICS.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
  for (const [file, list] of Object.entries(ops)) {
    const dest = path.join(OUT, "patches", "DATA", "COMMANDS", file), add = [...new Set(list)].join("\n");
    if (fs.existsSync(dest)) wr(dest, rd(dest).replace(/\s*<\/patch>\s*$/, `\n${add}\n</patch>\n`)); else wr(dest, `<patch>\n${add}\n</patch>\n`);
  }
  console.log(`neutral classes (${[...neutral].join(", ")}): ${own.length} commands, ${Object.values(ops).reduce((a, l) => a + new Set(l).size, 0)} sources added to the game's commands`);
}

// 3b. commands the mod defines for the game's BASE classes (Hero, Outpost, Gate, BaseVillage, BaseTownhall...): tribute, burn, militia, gate levels, retreat_notai...
// The clones only took the commands whose sources are their own classes, so these were lost (vxlog.log: "Unknown Command: retreat_notai"). Their sources become
// the classes of this port that inherit from the base class (never the game's own classes: a command with source "Hero" would also reach the game's heroes)
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
    const p = path.join(COMMANDS, "GBRTACTICS.XML"), t = fs.existsSync(p) ? rd(p) : "<commands>\n\n</commands>\n";
    wr(p, t.replace(/\s*<\/commands>\s*$/, `\n\n${add.join("\n\n")}\n\n</commands>\n`));
  }
  console.log(`commands of the mod for the game's base classes: ${add.length} added with the port's classes under them as sources (${noHeirs} with no class of this port under them left out)`);
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
  addXml("DATA/ITEMS.XML", "items"); addXml("DATA/FORMATIONS.XML", "formations");
  addIni("DATA/UNIT_SPECIALS.INI"); addIni("DATA/SKILLS.INI");
  console.log(`patches: ${patches.join("; ")}`);
}

// 5. files at a game path with other bytes
{
  const hdFile = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  const left = [];
  // the game's own files the mod edited in place that are not a civilization's: left out (AI, game modes, interface lists, random map, tuning)
  const GONE = /^DATA\/(AI\/|GAMESCRIPTS\/|INTERFACE\/|RANDOMMAP\/|TUTORIALS\/|BONUSSCRIPTS\/|BONUS\.XML|CONST\.INI|COUNTERUNITS\.XML|CURSORS\.XML|PATHFINDERINIT\.VS|RANDOM_MAP\.OBJ\.XML|SCDEBUG\.XML|SETTINGS\.XML|TERRAINS\.XML|VXACTION\.XML|VXNOTIFICATIONS\.XML|ZBINS\.XML|SUBAI\/SCDOC\.XML)/i;
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
      if (/^(patches|civs|loc|local)\//i.test(f) || f === "mod.json") continue;
      const h = hdFile.get(f.toLowerCase()); if (!h) continue;
      const base = path.basename(f).toLowerCase().replace(/\.rle$/, ""), stem = base.replace(/\.[^.]+$/, "");
      if (/^(units|buildings|mapobjects)\//i.test(f)) continue;                      // art and entities: found by folder
      if (!texts.some(([tf, t]) => tf.toLowerCase() !== f.toLowerCase() && (t.includes(base) || (/\.(bmp|wav|mp3)$/i.test(base) && t.includes(stem))))) { fs.rmSync(path.join(OUT, f)); left.push(f + " (nothing uses it)"); gone++; }
    }
    if (!gone) break;
  }
  fs.writeFileSync(path.join(ROOT, "raw", "gbr-tactics-left-out.txt"), left.join("\n") + "\n");
  console.log(`game files with other bytes: ${left.length} left out (raw/gbr-tactics-left-out.txt)`);
}

// 6. names another mod of ours (or the game's own adventures) already has with other bytes: this port's are renamed
{
  const { tagCollisions } = require("./lib/ported-patch.js");
  const G = path.join(ROOT, "originals", "game-data");
  const ports = fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== "gbr-tactics" && find(path.join(ROOT, "ported", d), "DATA/CLASSES")).map(d => path.join(ROOT, "ported", d));
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: TAG, others: [...ports, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: "GBRT", gameDirs: [path.join(G, "paks")], skip: /^(currentlang|ui\/menu|data\/interface\/menu)\// });
    console.log(`own names (${TAG}), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
  const { ownNames, tagNames } = require("./lib/ported-patch.js");
  const mine = ownNames(OUT, HD), clash = { cmds: new Set(), items: new Set() };
  for (const o of ports) { const t = ownNames(o, HD); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const names = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with other ports: ${clash.cmds.size} orders, ${clash.items.size} items -> "(${TAG})" in ${tagNames({ OUT, names, tag: TAG })} files`);
}

// 7. hand fixes of this mod (extras/gbr-tactics/): the final files and mod.json with the credits
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }
// Scripts of the mod that the game's compiler (stricter than 1.40's) refuses: they use a variable they never declare, or declare one twice, or
// the header names a parameter other than the one the body reads. A behavior that does not compile ends at once and the engine starts it again,
// forever: the game hangs when a match starts (Logs\comp_out.txt lists them). Found with the compiler's own log; each fix is the missing
// or the duplicate declaration, nothing else.
{
  const FIXES = [
    ["DATA/SUBAI/UNIT_ATTACK_gbrt.VS", /^Unit this, tgt;/m, "Unit this, tgt;\r\nBuilding b;"],                       // b = u.AsBuilding; (HD's UNIT_ATTACK.VS declares it)
    ["DATA/SUBAI/UNIT_ATTACH_gbrt.VS", /^int i, limit, admin, horse;/m, "int limit, admin, horse;"],                  // "int i;" is three lines above
    // the mod's "gold selling" block was never finished: it reads gold_sales and food_income, which nothing declares (the line that set food_income
    // is commented out in the mod itself), and bSellGold. Without the block the outpost keeps selling and buying food as before
    ["DATA/SUBAI/OUTPOST_IDLE_gbrt.VS", /[ \t]*\/\/Gold selling\r?\n[ \t]*bSellGold = [^\r\n]*\r?\n[ \t]*if \(!bProduceGold && bSellGold[^\r\n]*\r?\n(?:[^\r\n}]*\r?\n)*?[ \t]*\}\r?\n/, ""],
    ["DATA/SUBAI/GROUP_GOUTPOST_SELL_FOOD_VERIFIY_gbrt.VS", /^str strEnvStr_gold;/m, "str strEnvStr, strEnvStr_gold;"],  // declared strEnvStr_gold / _food, uses strEnvStr
    ["DATA/SUBAI/VILLAGE_REPOPULATE_gbrt.VS", /^int i, monpop;/m, "int i, monpop, minpop;"],                          // declared monpop, uses minpop
    ["DATA/ITEMSCRIPTS/ASSASSIN BOW_gbrt.VS", /^\/\/ void, Obj this, point pt/, "// void, Obj owner"],                // the body reads owner and declares "Unit this"
    ["DATA/ITEMSCRIPTS/ASSASSIN SWORD_gbrt.VS", /^\/\/ void, Obj this, point pt/, "// void, Obj owner"],
  ];
  for (const [rel, re, to] of FIXES) {
    const p = find(OUT, rel); if (!p) { report.push(`${rel}: not found (script fix)`); continue; }
    const s = rd(p), t = s.replace(re, to); if (t === s) { report.push(`${rel}: the line to fix is not there`); continue; }
    wr(p, t);
  }
}
// a <method>/<behavior> that names a script neither the mod nor the game has (the mod never shipped DLLELDORYN_FOLLOW.VS): the game could not run it.
// clone-civs.js removes the ones at the start of a line; these sit inline among other elements
{
  const have = new Set([...walk(OUT), ...walk(HDDATA).map(f => "DATA/" + f)].map(f => f.toLowerCase())), SC = find(OUT, "DATA/CLASSES");
  let gone = 0;
  for (const f of walk(SC).filter(f => /\.sc\.xml$/i.test(f))) {
    const p = path.join(SC, f), s = rd(p);
    const t = s.replace(/<(?:behavior|method)\b[^>]*?\b(?:script|vs)\s*=\s*"(data\/[^"]+\.vs)"[^>]*\/>[ \t]*/gi, (m, v) => (have.has(v.toLowerCase()) ? m : (gone++, "")));
    if (t !== s) wr(p, t);
  }
  if (gone) console.log(`${gone} inline method/behavior elements that name a script nobody has removed`);
}
// Five classes of the mod have elements AFTER </class> (the mod's BSENTRY.SC.XML ends with a stray <sounds .../>; ECHARIOT with a <properties range="300"/>).
// 1.40's parser stops at </class>; HD's refuses the whole class (Logs\vxlog.log: "Load of script class from file ... failed") and the game goes back to the
// menu when a match starts. Whatever follows </class> was never read by the game the mod was made for: it goes.
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
// A class takes 8 <behavior> in all, the ones it inherits included ("class can't inherit behavior from parent. Too many behavior scripts"). The mod's classes
// list the mod's version of a behavior the game's parent class also has (BaseTownhall: townhall_behavior_guard.vs; here TOWNHALL_BEHAVIOR_GUARD_gbrt.VS): in the
// mod they were the same path, so they counted once; here the copy has another name and both would run (and past 8 the parent's are dropped). The copy of the
// mod goes and the game's behavior stays: what the mod changed in those few behaviors (townhall guard, outpost income...) is not ported. Listed in NOTES.md.
{
  const parent = new Map(), beh = new Map(), file = new Map();
  const SC = find(OUT, "DATA/CLASSES");
  const behs = s => [...s.matchAll(/<behavior\b[^>]*?\bscript\s*=\s*"([^"]+)"[^>]*\/>/gi)].map(m => ({ tag: m[0], script: m[1] }));
  for (const [dir, own] of [[HD_CLASSES, false], [SC, true]]) for (const f of walk(dir).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) {
    const s = rd(path.join(dir, f)), id = classOf(s); if (!id) continue;
    parent.set(id.toLowerCase(), ((s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase());
    beh.set(id.toLowerCase(), behs(s)); if (own) file.set(id.toLowerCase(), path.join(dir, f));
  }
  const stem = v => path.basename(v).toLowerCase().replace(/\.vs$/, "").replace(/_gbrt$/, "").replace(/_(gaul|britain|iberia|egypt|germany|carthage|imperial|republic)$/, "");
  let removed = 0, touched = 0; const twins = {};
  for (const [id, p] of file) {
    const inherited = [];
    for (let c = parent.get(id), n = 0; c && n < 30; c = parent.get(c), n++) inherited.push(...(beh.get(c) || []).map(b => ({ ...b, owner: c })));
    let s = rd(p), t = s;
    for (const b of beh.get(id)) {
      const twin = inherited.find(h => stem(h.script) === stem(b.script) && h.script.toLowerCase() !== b.script.toLowerCase());
      if (twin) { t = t.replace(b.tag, ""); removed++; (twins[twin.owner] ||= new Set()).add(`${stem(b.script)}`); }
    }
    // still over 8 with the game's own behaviors the clone step now keeps (GGuardPost: settlement_behavior_horses, GGuardPost_Sentries): the mod's own go, last first
    const left = behs(t).map(b => b.tag);
    for (let over = left.length + inherited.length - 8, i = left.length - 1; over > 0 && i >= 0; i--) {
      if (/_gbrt\.vs/i.test(left[i])) { t = t.replace(left[i], ""); over--; removed++; (twins["(over 8)"] ||= new Set()).add(`${id}: ${left[i].match(/script="([^"]+)"/)[1]}`); }
    }
    if (t !== s) { wr(p, t); touched++; }
  }
  console.log(`${removed} behaviors of the mod that the game's parent class already has removed from ${touched} classes`);
  for (const [o, s] of Object.entries(twins)) console.log(`  under ${o}: ${[...s].join(", ")}`);
}
// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
