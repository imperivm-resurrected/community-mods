// Secuter's Fun mod 1.5 (row 312, forum t60040716): the game's eight civilizations as the mod has them, each a civilization of its own next to the game's
// (AGENTS.md, "Civilizations are independent"; decided in #15: a balance mod is ported as copies, the host chooses the set in the room). Two ports, one tool:
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/secuter-fun-mod.js plain [id ...]    -> ported/secuter-fun-mod        (token "s")
//   G=... node tools/secuter-fun-mod.js grecia [id ...]                                                                               -> ported/secuter-fun-mod-grecia (token "z")
// It unpacks the forum zip into .scratch (git-ignored, inside the worktree: nothing is written under originals/), runs tools/port-140.js and
// tools/merge-secuter-fun.js on it (HD + 1.40 + mod, three-way; raw/port-140/<id>.md lists the conflicts, in which the mod's side won) and rebuilds the port from that:
//   1. keeps the mod's version of the game's classes and commands (.scratch/secuter-<variant>-merged) and drops them from the port: they are the game's, and each
//      civilization they belong to is cloned from HD with the mod's changes on top (tools/lib/clone-civs.js); what the mod changed in the base classes (Hero, Unit,
//      BaseTavern...) is written inside each clone
//   2. the commands of the mod's classes that belong to no civilization are an own file / patches
//   3. the mod's edits of the game's behavior scripts are copies of their own (_sec / _sez, tools/lib/own-scripts.js) that only the clones' classes point to
//   4. what is global (the camps and the neutral classes the mod redefines, the outposts' garrison, the items, the constants...) is NOT in this pack: it is left out
//      and listed in NOTES.md ("Left out because it is global"); the world rules pack secuter-fun-mod-rules carries it
//   5. names another port (or the game) has with other bytes are given a tag (tools/lib/ported-patch.js, tagCollisions); the pictures it breaks are put back
// The prefix of each civilization is derived from its id by the SDK (first 3 characters: Sga, Sro, Sim...; Zga, Zro...) and there is no index (imperivm-resurrected#37).
// The reserved token of the plain version is "s", of the Greece version "z": every id starts with it.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { removeStrayBraces } = require("./lib/script-checks.js");
const ROOT = path.join(__dirname, "..");
const VARIANT = process.argv[2];
if (!["plain", "grecia"].includes(VARIANT)) { console.error("usage: node tools/secuter-fun-mod.js plain|grecia [id ...]"); process.exit(1); }
const GRECIA = VARIANT === "grecia";
const ID = GRECIA ? "secuter-fun-mod-grecia" : "secuter-fun-mod", OUT = path.join(ROOT, "ported", ID);
const T = GRECIA ? "z" : "s", TAG = "se" + T;                    // the token of the ids and the tag of the copies and renamed names (_ses / _sez)
const SCRATCH = path.join(ROOT, ".scratch"), SRC = path.join(SCRATCH, `secuter-${VARIANT}-src`), P140 = path.join(SCRATCH, `secuter-${VARIANT}-p140`), PRISTINE = path.join(SCRATCH, `secuter-${VARIANT}-merged`), MERGED = path.join(SCRATCH, `secuter-${VARIANT}-classes`);
const ZIP = path.join(ROOT, "originals", "forum", "fun-mod-civilta-personalizzate-2017", "files", GRECIA ? "Secuter Mod Imperium - Versione Grecia.zip" : "Secuter Mod Imperium.zip");
const HD = path.join(ROOT, "originals", "game-data", "paks");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const want = process.argv.slice(3);
if (!fs.existsSync(ZIP)) { console.error("no " + ZIP + " (node tools/download-forum.js)"); process.exit(1); }
if (!process.env.G || !fs.existsSync(path.join(process.env.G, "rle.mmp"))) { console.error('set G to the HD game folder (port-140.js compares sprites with it)'); process.exit(1); }
const report = [];

// The ids start with the token and differ in their first three characters. The camps (Tent) are map objects of nobody (an independent camp, or one a player captures): they
// keep the race of their people and are the world rules pack's, so they are `neutral`. The names are the lobby's: "<civ> (Secuter)", at most ~22 characters.
const NEUTRAL = /Tent\d*$/;
const mk = (suffix, base, baseLetter, hero, name, extra = {}) => ({ base, baseLetter, hero, id: `${T}${suffix}`, neutral: NEUTRAL, name, ...extra });
const CIVS = [
  mk("gaul", "Gaul", "G", "GaulHero", { spanish: "Galos", english: "Gaul", italian: "Galli" }),
  mk("rome", "RepublicanRome", "R", "RepublicanRomanHero", { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." }),
  // (in the Greece version the Greek classes have the race of Imperial Rome, as in the 1.8: they are Greece's, not a Roman clone's)
  mk("imperial", "ImperialRome", "M", "ImperialRomanHero", { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." }, GRECIA ? { skipExtra: /^(H[A-Z]|Hhouse)/ } : {}),
  mk("carthage", "Carthage", "C", "CarthaginianHero", { spanish: "Cartago", english: "Carthage", italian: "Cartagine" }),
  mk("britain", "Britain", "B", "BritonHero", { spanish: "Britania", english: "Britain", italian: "Britannia" }),
  mk("iberia", "Iberia", "I", "IberianHero", { spanish: "Iberia", english: "Iberia", italian: "Iberia" }),
  mk("egypt", "Egypt", "E", "EgyptianHero", { spanish: "Egipto", english: "Egypt", italian: "Egitto" }),
  mk("germany", "Germany", "T", "GermanHero", { spanish: "Germania", english: "Germany", italian: "Germania" }),
];

// 0. the mod unpacked and ported (HD + 1.40 + mod), in .scratch
for (const d of [SRC, P140, PRISTINE]) fs.rmSync(d, { recursive: true, force: true });
{
  fs.mkdirSync(SRC, { recursive: true });
  let r = cp.spawnSync("bsdtar", ["-xf", ZIP, "-C", SRC], { stdio: "inherit" }); if (r.status) process.exit(1);
  r = cp.spawnSync("node", [path.join(__dirname, "port-140.js"), SRC, P140, "--id", ID, "--name", GRECIA ? "Secuter Fun Greece 1.5" : "Secuter Fun 1.5", "--version", "1.5", "--category", "Gameplay & Balance"], { stdio: "inherit", env: { ...process.env, GAME: process.env.G } }); if (r.status) process.exit(1);
  r = cp.spawnSync("node", [path.join(__dirname, "merge-secuter-fun.js"), SRC, P140, PRISTINE, ...(GRECIA ? ["--greek"] : [])], { stdio: "inherit", env: { ...process.env, GAME: process.env.G } }); if (r.status) process.exit(1);
}
// 1. a fresh copy of the pristine port: hard links (every write below removes the file first)
fs.rmSync(OUT, { recursive: true, force: true });
cp.spawnSync("cp", ["-al", PRISTINE, OUT], { stdio: "inherit" });
fs.rmSync(path.join(OUT, "NOTES.md"), { force: true });                // port-140.js copies extras/<id>/ over its output, the notes included: they are not part of the mod
for (const f of walk(OUT).filter(f => /(^|\/)thumbs[^/]*\.db$/i.test(f))) fs.rmSync(path.join(OUT, f));
// scripts saved in Latin-1 (accents): the game's compiler wants UTF-8, as for the classes (port-140.js)
for (const f of walk(OUT).filter(f => /\.vs$/i.test(f))) {
  const p = path.join(OUT, f), b = fs.readFileSync(p);
  try { new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { fs.rmSync(p); fs.writeFileSync(p, Buffer.from(b.toString("latin1"), "utf8")); }
}
// A "}" that closes nothing is removed from every script of the mod before any copy is made from it (the 1.40 compiler took it, the game's does not)
{
  const stray = [];
  for (const f of walk(path.join(OUT, "DATA")).filter(f => /\.vs$/i.test(f))) {
    const p = path.join(OUT, "DATA", f), t = rd(p), r = removeStrayBraces(t);
    if (r.removed.length) { wr(p, r.text); stray.push(`DATA/${f} (line ${r.removed.join(", ")})`); }
  }
  console.log(`stray "}" removed from the mod's own scripts: ${stray.join("; ") || "none"}`);
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
for (const f of fs.readdirSync(COMMANDS)) wr(path.join(MERGED, "commands", f), rd(path.join(COMMANDS, f)));
wr(path.join(MERGED, "base-changes.json"), JSON.stringify(baseChanges, null, 1));
console.log(`${kept} classes and ${fs.readdirSync(COMMANDS).length} command files of the mod kept; ${Object.keys(baseChanges).length} of the game's classes changed`);
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), id = classOf(rd(p));
  if (id && hdClass.has(id.toLowerCase())) { fs.rmSync(p); dropped++; }
}
console.log(`${dropped} classes of the game's own left out`);

// 2. the civilizations of the game, as the mod has them
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "Secuter Fun mod", LABEL: "Secuter", CIVS, cloneAllOrders: true, want });

// The camps (Tent): map objects of nobody that the mod's random maps place (PLACEOBJECTS.XML) and a player captures; the mod redefines the game's TTent as an abstract
// class under them and edits ttent_behavior.vs, which indexes arrays with the camp's race. All of it changes the game's own objects for everybody: the rules pack's.
{
  let n = 0;
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const p = path.join(CLASSES, f), id = classOf(rd(p)); if (id && NEUTRAL.test(id)) { fs.rmSync(p); n++; } }
  console.log(`${n} camp classes left out (global, the rules pack's)`);
}
// The mod's animation objects of the arenas, barracks and temples and its arena spawns name entity files (Buildings/CArena/CArena_Anim.ent.xml...) that its zip does not ship (the zip has
// DATA, UI, OUTLINES and RANDOMMAP only): nothing places them without the scripts that start them, which no class names either. The Pyramid is a Stonehenge of Egypt (a map object, parent
// Stonehenge: the rules pack's). None is in the clones.
const ORPHANS = /(Anim\d*|^IArenaElite|^IArenaMount|^IArenaMountaineer|^GArenaBear|^RArenAnim)$/, GLOBAL_CLASSES = /^Pyramid$/;
const orphaned = [];
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const p = path.join(CLASSES, f), id = classOf(rd(p)); if (id && (ORPHANS.test(id) || GLOBAL_CLASSES.test(id))) { fs.rmSync(p); orphaned.push(id); } }
console.log(`${orphaned.length} classes left out (no entity in the zip, or a map object): ${orphaned.join(", ")}`);

// 2b. Greece (Greece version only): the 1.8's Greece with Secuter's changes, as the civilization zgreece (tools/secuter-greece.js)
if (GRECIA) {
  // Secuter's own Greek classes in the zip (H*, the 1.8's letter) are the input of the merge in tools/secuter-greece.js (from PRISTINE); they leave the port
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const p = path.join(CLASSES, f), id = classOf(rd(p)); if (id && /^(H[A-Z]|Hhouse)/.test(id) && !hdClass.has(id.toLowerCase())) fs.rmSync(p); }
  const B = path.join(ROOT, "ported", "greek-mod-1-8");
  if (!fs.existsSync(path.join(B, "civs", "greek18.json"))) { console.error("needs the built port of the Greek Mod 1.8 (ported/greek-mod-1-8: see extras/greek-mod-1-8/NOTES.md, Rebuild); it is only read"); process.exit(1); }
  const r = require("./secuter-greece.js")({ OUT, B, HD, PRISTINE, MERGED, ORIG18: path.join(ROOT, "originals", "greek-mod-1.8", "DATA"), TAG });
  fs.writeFileSync(path.join(ROOT, "raw", `${ID}-exit-points.txt`), r.exits.join("\n") + "\n");
  if (r.problems.length) { console.error("GREECE: " + r.problems.join("; ")); process.exit(1); }
  console.log(`exit points (type 2) of Greece's barracks, gymnasium, temple, village and town hall (raw/${ID}-exit-points.txt):\n  ${r.exits.join("\n  ")}`);
  console.log(`Greece: ${r.files} files copied from the 1.8's Greece, ${r.names} names; merged with Secuter's: ${r.merged.join(", ")}${r.notMerged.length ? "; " + r.notMerged.join("; ") : ""}\n  ${r.log.join("\n  ")}`);
}

// 3. the commands of the neutral classes (nobody's: the druid's summons, the arena animations...) and of the base classes
const neutral = new Set();
{
  const info = new Map();
  for (const f of walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const s = rd(path.join(HD_CLASSES, f)); info.set(classOf(s), { race: (s.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1], parent: (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] }); }
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const s = rd(path.join(CLASSES, f)); info.set(classOf(s), { race: (s.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1], parent: (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] }); }
  const raceOf = id => { for (let c = id, n = 0; c && n < 20; n++) { const x = info.get(c); if (!x) return null; if (x.race && x.race !== "None") return x.race; c = x.parent; } return null; };
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const id = classOf(rd(path.join(CLASSES, f))); if (id && !raceOf(id)) neutral.add(id); }
}
const OWNFILE = "SECUTERFUN.XML";
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
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) fs.rmSync(path.join(COMMANDS, f), { force: true });   // the mod's command files are in the clones now
  if (own.length) wr(path.join(COMMANDS, OWNFILE), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
  for (const [file, list] of Object.entries(ops)) {
    const dest = path.join(OUT, "patches", "DATA", "COMMANDS", file), add = [...new Set(list)].join("\n");
    if (fs.existsSync(dest)) wr(dest, rd(dest).replace(/\s*<\/patch>\s*$/, `\n${add}\n</patch>\n`)); else wr(dest, `<patch>\n${add}\n</patch>\n`);
  }
  console.log(`neutral classes (${[...neutral].join(", ")}): ${own.length} commands, ${Object.values(ops).reduce((a, l) => a + new Set(l).size, 0)} sources added to the game's commands`);
}
// 3b. commands the mod defines for the game's BASE classes (Hero, Outpost, BaseVillage...): the clones only took the commands whose sources are their own classes. Their sources
// become the classes of this port that inherit from the base class (never the game's own classes: a command with source "Hero" would also reach the game's heroes)
{
  const stripC = t => t.replace(/<!--[\s\S]*?-->/g, "");
  const cmdsOf = t => [...stripC(t).matchAll(/<cmd\b([^>]*)>([\s\S]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
  const hdNames = new Set(), have = new Set();
  for (const f of walk(find(HD, "DATA/COMMANDS"))) for (const c of cmdsOf(rd(path.join(find(HD, "DATA/COMMANDS"), f)))) hdNames.add(c.name);
  for (const f of walk(path.join(OUT, "DATA", "COMMANDS"))) for (const c of cmdsOf(rd(path.join(OUT, "DATA", "COMMANDS", f)))) have.add(c.name);
  const haveNames = [...have];
  // a command can name a class by its altid (DruidHouse for GDruidHouse): the clone step does not follow it, the civs' alias tables do (original id -> the clone's)
  const altid = new Map(), cloneOf = new Map();
  for (const f of walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const s = rd(path.join(HD_CLASSES, f)), a = (s.match(/<class\b[^>]*?\baltid\s*=\s*"([^"]+)"/) || [])[1]; if (a) altid.set(a.toLowerCase(), classOf(s)); }
  for (const c of CIVS) { const jp = path.join(OUT, "civs", `${c.id}.json`); if (!fs.existsSync(jp)) continue; for (const [o, n] of Object.entries(JSON.parse(fs.readFileSync(jp, "utf8")).alias.classes || {})) { const k = o.toLowerCase(); (cloneOf.get(k) || cloneOf.set(k, []).get(k)).push(n); } }
  // (Greece version) the mod's Greek classes are named as in the 1.8 (HGymnasium); Greece's are ZgrGymnasium. Its own orders (trainHHoplite, HAddPop...) are in ZGREECE.XML, renamed.
  const greekOrder = n => GRECIA && /^(train|hirehero)?H[A-Z]|^trainpeasanth$/.test(n);
  const toZgr = new Map();
  if (GRECIA) for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const id = classOf(rd(path.join(CLASSES, f))); if (/^(Hero)?Zgr/.test(id)) toZgr.set(id.replace(/^(Hero)?Zgr/, "$1H").toLowerCase(), id); }
  const greekText = t => t.replace(/(?<![A-Za-z0-9])(?:Hero)?H[A-Za-z0-9_]*/g, m => toZgr.get(m.toLowerCase()) || m);
  const parent = new Map(), mine = new Set();
  for (const [dir, own] of [[HD_CLASSES, false], [CLASSES, true]]) for (const f of walk(dir).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) {
    const s = rd(path.join(dir, f)), id = classOf(s); if (!id) continue;
    parent.set(id.toLowerCase(), ((s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase()); if (own) mine.add(id);
  }
  const chain = id => { const o = []; for (let c = id.toLowerCase(), n = 0; c && n < 30; c = parent.get(c), n++) o.push(c); return o; };
  const heirs = new Map();
  for (const id of mine) for (const a of chain(id)) (heirs.get(a) || heirs.set(a, []).get(a)).push(id);
  const add = [], seen = new Set(), noHeirsNames = []; let noHeirs = 0;
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) for (const c of cmdsOf(rd(path.join(MERGED, "commands", f)))) {
    if (greekOrder(c.name)) continue;
    if (!c.name || hdNames.has(c.name) || have.has(c.name) || seen.has(c.name) || cloneOf.has(c.name.toLowerCase()) || haveNames.some(n => n.startsWith(`${c.name} `))) continue;   // (the clones' own copies of an order are named "<name> <Id>")
    const under = [...new Set(c.src.flatMap(s => [...(heirs.get(s.toLowerCase()) || []), ...(cloneOf.get((altid.get(s.toLowerCase()) || s).toLowerCase()) || []), ...(toZgr.has(s.toLowerCase()) ? [toZgr.get(s.toLowerCase())] : [])]))];
    if (c.src.length && !under.length) { noHeirs++; noHeirsNames.push(`${c.name}  (${c.src.join(", ")})`); continue; }
    seen.add(c.name);
    add.push(c.src.length ? greekText(c.text).replace(/<src\b[^>]*\/>\s*/g, "").replace(/<\/cmd>$/, under.map(g => `\t<src obj="${g}"/>`).join("\n") + "\n</cmd>") : c.text);
  }
  if (add.length) {
    const p = path.join(COMMANDS, OWNFILE), t = fs.existsSync(p) ? rd(p) : "<commands>\n\n</commands>\n";
    wr(p, t.replace(/\s*<\/commands>\s*$/, `\n\n${add.join("\n\n")}\n\n</commands>\n`));
  }
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", `${ID}-left-out-commands.txt`), noHeirsNames.sort().join("\n") + "\n");
  console.log(`commands of the mod for the game's base classes: ${add.length} added with the port's classes under them as sources (${noHeirs} with no class of this port under them left out)`);
}

// 3c. the mod's versions of the game's behavior scripts (barrack_train.vs, verify_research.vs, onfinish_research.vs...): the clones' classes and commands use copies of their own
// (<name>_ses.vs, and <name>_ses_<id>.vs where the class ids the script writes as text differ per civilization); the game's scripts stay the game's (tools/lib/own-scripts.js).
// `inherit`: the methods the clones inherit from the game's classes (Unit, Military, BaseTownBuilding...) whose script the mod edited are written inside each clone.
const CLONES = CIVS.map(c => { const letter = c.id.slice(0, 3).replace(/^./, x => x.toUpperCase()); return { id: c.id, letter, from: [c.baseLetter], match: new RegExp(`^(${letter}|${c.id}\\.)`, "i"), modOnly: true, keep: NEUTRAL }; });
{
  const r = require("./lib/own-scripts.js")({ OUT, HD, tag: TAG, skip: /(?!)/, civs: CLONES, modClasses: path.join(PRISTINE, "DATA", "CLASSES"), inherit: true });
  console.log(`scripts of the mod's own for its civilizations: ${r.copied.length} copied (_${TAG}), ${r.skipped.length} left to the game's (${r.skipped.map(s => s.name).join(", ")})`);
  console.log(`  methods inherited from the game's classes whose script the mod edited: ${r.injected} <method> written inside ${r.touched} classes; behaviors inherited and left the game's: ${(r.behaviorsLeft || []).join("; ") || "none"}`);
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", `${ID}-own-scripts.txt`), r.copied.map(c => `${c.from} -> ${c.to}  (${c.users.slice(0, 4).join(", ")}${c.users.length > 4 ? ", ..." : ""})`).join("\n") + "\n\nnot copied:\n" + r.skipped.map(s => `${s.name}: ${s.why}`).join("\n") + "\n\nbehaviors inherited from the game's classes and left the game's:\n" + (r.behaviorsLeft || []).join("\n") + "\n");
}

// 3d. The mod wrote its civilization tests as `.race == Gaul` (`.race==Germany`, `.race==Carthage`): for a clone the race is the clone's own, so the test is false. Each
// test in the scripts of the mod also accepts the clone: `(.race == Gaul || Mod_TrueRace(This) == Sgaul)`. `GetPlayerRace` is left alone (it returns the base for a clone, as the game's
// scripts expect). The mod's scripts index no array with a race outside the global ones (the outposts' garrison, the camps): those are the rules pack's, see NOTES.md.
const BASE_CONST = Object.fromEntries(CIVS.map(c => [c.base, c.id[0].toUpperCase() + c.id.slice(1)]));
const RACE_RE = new RegExp(String.raw`(?<![\w.)\]])((?:[A-Za-z_]\w*(?:\(\))?\.)*[A-Za-z_]\w*(?:\(\))?)?\.race\s*(==|!=)\s*(${Object.keys(BASE_CONST).join("|")})\b`, "g");
const NEWONLY = f => /_ses|_sez/i.test(f) || !fs.existsSync(path.join(HD, "DATA", "SUBAI", f));   // the copies and the mod's new scripts, never the game's own scripts the mod edited in place
const objOf = text => (/^\s*\/\/\s*[\w]+\s*,\s*Obj\s+(\w+)/.exec(text.split("\n")[0]) || [])[1] || "This";
const raceTests = (text, obj = objOf(text)) => text.replace(RACE_RE, (m, r, op, b) => {
  const o = (r || obj).replace(/\.As(?:Unit|Building)(?:\(\))?$/, "");
  return op === "==" ? `(${m} || Mod_TrueRace(${o}) == ${BASE_CONST[b]})` : `(${m} && Mod_TrueRace(${o}) != ${BASE_CONST[b]})`;
});
{
  let n = 0;
  for (const f of fs.readdirSync(find(OUT, "DATA/SUBAI")).filter(f => /\.vs$/i.test(f) && NEWONLY(f))) { const p = path.join(find(OUT, "DATA/SUBAI"), f), s = rd(p), t = raceTests(s); if (t !== s) { wr(p, t); n++; console.log(`  race tests of ${f}: ${(s.match(RACE_RE) || []).length}`); } }
  console.log(`${n} scripts of the mod: the tests of the civilization (.race == Gaul...) also accept the clones`);
}

// 4. the shared tables: only what the mod ADDS and the clones need. The new formation (Fila) is a patch; the rest of FORMATIONS.XML (descriptions of the game's), CONST.INI (RushDamage,
// DefensePerEpicArmorLevel, RankPoints10 are values the game has), SKILLS.INI, UNIT_SPECIALS.INI (stamina_cost of a special the game has) and ITEMS.XML are global: left out (NOTES.md)
const { xmlAdded } = require("./lib/ported-patch.js");
const patches = [];
{
  const mp = find(OUT, "DATA/FORMATIONS.XML"), hp = find(path.join(ROOT, "originals", "game-data", "DATA"), "FORMATIONS.XML");
  const r = xmlAdded(rd(hp), rd(mp), "formations", report, "DATA/FORMATIONS.XML");
  if (r) { wr(path.join(OUT, "patches", "DATA", "FORMATIONS.XML"), r.xml); patches.push(`DATA/FORMATIONS.XML (${r.count} formation)`); }
  console.log(`patches: ${patches.join("; ")}`);
}

// 5. files at a game path: the mod's edits of the game's own files are global (or already in the clones) and leave; the files that are the game's own bytes leave too
const left = [];
{
  const hdFile = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  for (const f of walk(OUT)) {
    if (/^(patches|civs|loc|local)\//i.test(f) || f === "mod.json") continue;
    const h = hdFile.get(f.toLowerCase()); if (!h) continue;
    if (md5(path.join(OUT, f)) !== md5(h)) left.push(f);
    fs.rmSync(path.join(OUT, f));
  }
  // new scripts and pictures that nothing left in the port uses (the Stonehenge, the neutral structures, the items: the rules pack's)
  for (let pass = 0; pass < 10; pass++) {
    const texts = walk(OUT).filter(f => /\.(xml|ini|vs|txt|json)$/i.test(f) && !/^loc\//i.test(f)).map(f => rd(path.join(OUT, f)).toLowerCase());
    let gone = 0;
    for (const f of walk(OUT)) {
      if (!/^(DATA\/(SUBAI|ITEMSCRIPTS|AI)\/[^/]+\.vs|UI\/(CMDBAR|ICONS|NOTEICONS)\/.*\.bmp)$/i.test(f)) continue;
      const base = path.basename(f).toLowerCase(), stem = base.replace(/\.[^.]+$/, "");
      if (!texts.some(t => t.includes(base) || (/\.bmp$/i.test(base) && t.includes(stem)))) { fs.rmSync(path.join(OUT, f)); left.push(f + " (nothing in this pack uses it)"); gone++; }
    }
    if (!gone) break;
  }
  fs.writeFileSync(path.join(ROOT, "raw", `${ID}-left-out.txt`), left.sort().join("\n") + "\n");
  console.log(`game files with other bytes, and files nothing uses: ${left.length} left out (raw/${ID}-left-out.txt)`);
}

// 5b. The Greece version has its own copy of the formations (a name is a key: two packs declaring "Fila" would declare it twice)
if (GRECIA) {
  const fp = path.join(OUT, "patches", "DATA", "FORMATIONS.XML"), names = [...rd(fp).matchAll(/<FormationClass\s+Name="([^"]+)"/g)].map(m => m[1]);
  const re = new RegExp(`(["',])(\\s*)(${names.join("|")})(\\s*)(?=["',])`, "g");
  let n = 0;
  for (const f of walk(OUT).filter(f => /^(patches\/)?DATA\/(COMMANDS|SUBAI)\/[^/]+\.(xml|vs)$/i.test(f)).concat("patches/DATA/FORMATIONS.XML")) {
    const p = path.join(OUT, f), s = rd(p), t = s.replace(re, (_m, a, b, nm, c) => `${a}${b}${nm}_${TAG}${c}`);
    if (t !== s) { wr(p, t); n++; }
  }
  console.log(`formations ${names.join(", ")}: renamed with _${TAG} in ${n} files`);
}

// 6. names another mod of ours (or the game's own adventures) already has with other bytes: this port's are renamed (tools/lib/ported-patch.js, tagCollisions). The two Secuter packs
// are built from the same zip and share many names: the plain one is built first and does not look at the Greece one, which looks at both; the rules pack is not looked at.
{
  for (const f of fs.readdirSync(find(OUT, "DATA/CLASSES")).filter(f => /\.sc\.xml$/i.test(f))) {
    const d = find(OUT, "DATA/CLASSES"), id = classOf(rd(path.join(d, f)));
    if (id && `${id.toUpperCase()}.SC.XML` !== f.toUpperCase() && !fs.existsSync(path.join(d, `${id.toUpperCase()}.SC.XML`))) fs.renameSync(path.join(d, f), path.join(d, `${id.toUpperCase()}.SC.XML`));
  }
  const { tagCollisions, ownNames, tagNames } = require("./lib/ported-patch.js");
  const G = path.join(ROOT, "originals", "game-data");
  const sibling = d => d === "secuter-fun-mod-rules" || (!GRECIA && d === "secuter-fun-mod-grecia");
  const ports = fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== ID && !sibling(d) && find(path.join(ROOT, "ported", d), "DATA/CLASSES")).map(d => path.join(ROOT, "ported", d));
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: TAG, others: [...ports, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: "Secuter", gameDirs: [path.join(G, "paks")] });
    console.log(`own names (${TAG}), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.files.length ? " (" + r.files.slice(0, 8).join(", ") + ")" : ""}${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
  const mine = ownNames(OUT, HD), clash = { cmds: new Set(), items: new Set() };
  for (const o of ports) { const t = ownNames(o, HD); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const names = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with other ports: ${clash.cmds.size} orders, ${clash.items.size} items -> "(${TAG})" in ${tagNames({ OUT, names, tag: TAG })} files`);
}

// 6a. The bitmaps of a random map template are named after what they are for (010.bmp ... 120.bmp: the SDK's random-maps.md) and the template names their folder
// (<bitmap file="RandomMap/Africa/"/>): tagCollisions renamed them one by one (010_sez.BMP). The folder gets the tag instead and the bitmaps keep their names; the template
// (renamed AFRICA.RM_sez.XML by tagCollisions, kept as renamed) names the new folder.
{
  const rm = find(OUT, "RANDOMMAP"), moved = new Set();
  if (rm) for (const d of fs.readdirSync(rm)) {
    const dir = path.join(rm, d); if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) { const m = f.match(new RegExp(`^(\\d+)_${TAG}(\\.bmp)$`, "i")); if (m) { const nd = path.join(rm, `${d}_${TAG}`); fs.mkdirSync(nd, { recursive: true }); fs.renameSync(path.join(dir, f), path.join(nd, m[1] + m[2])); moved.add(d); } }
  }
  const rmx = find(OUT, "DATA/RANDOMMAP");
  if (rmx) for (const f of fs.readdirSync(rmx).filter(f => new RegExp(`\\.rm_${TAG}\\.xml$`, "i").test(f))) {
    const p = path.join(rmx, f), s = rd(p); let t = s;
    for (const d of moved) t = t.replace(new RegExp(`(RandomMap[\\\\/])${d}([\\\\/])`, "i"), `$1${d}_${TAG}$2`);
    if (t !== s) wr(p, t);
  }
  if (moved.size) console.log(`random map bitmaps: folders ${[...moved].map(d => d + "_" + TAG).join(", ")} (the bitmaps keep their names)`);
}

// 6b. tagCollisions rewrites a renamed file's references by file name alone: a name that only ends the same way, or a file of that name in another folder, was renamed too
// and now asks for a file that does not exist (the blue square where an icon should be). The same for sounds and entities. Every reference of the port that no longer
// resolves goes back to the name the mod's own text had when that resolves; the check at the end of the build stops on any that is still missing.
const ATTR = /\b(button|queueicon|icon|transpicon|image|entity|entity_winter|sound|loop_sound|help_icon)\s*=\s*"([^"]*)"/gi;
const textsOf = () => [...walk(path.join(OUT, "DATA")), ...walk(path.join(OUT, "patches", "DATA")).map(f => "../patches/DATA/" + f)].filter(f => /\.xml$/i.test(f)).map(f => path.join(OUT, "DATA", f));
const index = (...roots) => { const s = new Set(); for (const r of roots) for (const f of walk(r)) s.add(f.toLowerCase()); return s; };
const relOf = (attr, v) => {
  v = v.replace(/\\/g, "/").trim(); if (!v) return null;
  const g = /^gameres\/(cmdbar|icons|infobar)\/(.*)$/i.exec(v); if (g) return `ui/${g[1]}/${g[2]}`;
  if (/^data\//i.test(v)) return v;
  if (/\.ent\.xml$/i.test(v)) return v;
  if (/^button$/i.test(attr)) return `ui/cmdbar/${v}`;
  return null;
};
const resolves = (have, attr, v) => { const rel = relOf(attr, v); return !rel || have.has(rel.toLowerCase()); };
const unresolved = have => { const out = []; for (const f of textsOf()) for (const m of rd(f).replace(/<!--[\s\S]*?-->/g, "").matchAll(ATTR)) if (!resolves(have, m[1], m[2])) out.push([f, m[1], m[2]]); return out; };
{
  const have = index(OUT, HD), fixed = [];
  for (const f of textsOf()) {
    const s = rd(f), t = s.replace(ATTR, (m, attr, v) => {
      if (resolves(have, attr, v)) return m;
      const orig = v.replace(new RegExp(`_${TAG}(\\.[A-Za-z]+)$`, "i"), "$1").replace(new RegExp(`_${TAG}(?=/)`, "gi"), "");
      if (orig === v || !resolves(have, attr, orig)) return m;
      fixed.push(`${path.basename(f)} ${attr}=${v} -> ${orig}`);
      return m.replace(v, orig);
    });
    if (t !== s) wr(f, t);
  }
  console.log(`references put back to the mod's own name: ${fixed.length}${fixed.length ? "\n  " + fixed.join("\n  ") : ""}`);
}

// 7. hand fixes of this mod (extras/<id>/): the final files and mod.json with the credits
const EXTRAS = path.join(ROOT, "extras", ID);
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }

// 8. checks that stop the build
{
  const have = index(OUT, HD), bad = unresolved(have).map(([f, a, v]) => `${path.basename(f)}: ${a}="${v}" is not in the port or in the game`);
  // the references the mod's own package could not resolve either (checked on the pristine port, before anything here touched it)
  const pristineHave = index(PRISTINE, HD), mineNot = new Set();
  for (const f of walk(path.join(PRISTINE, "DATA")).filter(f => /\.xml$/i.test(f))) for (const m of rd(path.join(PRISTINE, "DATA", f)).replace(/<!--[\s\S]*?-->/g, "").matchAll(ATTR)) if (!resolves(pristineHave, m[1], m[2])) mineNot.add(`${m[1]}="${m[2]}"`.toLowerCase());
  const real = bad.filter(b => !mineNot.has(b.replace(/^[^:]*: /, "").replace(/ is not in the port or in the game$/, "").toLowerCase()));
  console.log(`references: ${bad.length} unresolved, ${bad.length - real.length} of them already unresolved in the mod's own package (HD's own too, or the mod's)`);
  if (bad.length - real.length) console.log("  " + [...mineNot].filter(x => bad.some(b => b.toLowerCase().includes(x))).slice(0, 40).join("\n  "));
  if (real.length) { console.error(`REFERENCE CHECK FAILED (${real.length}):\n  ` + [...new Set(real)].slice(0, 60).join("\n  ")); process.exit(1); }
}

// 9. Offline checks of every script this build writes (nothing compiles them but the game). The build stops on a problem.
//   (a) each copy has the parens, braces and brackets of the mod's script it comes from, and nothing returns or ends in the wrong place (script-checks.js)
//   (b) each class a script names as text (Place, GetRandomHeroClass, IsHeirOf, Count...) is a class of the game or of this port, and a GetRandomHeroClass base has a descendant
//       with an entity (PickRandomHeroClass draws until it finds one: a base without one hangs the game)
//   (c) no script of the port indexes an array with the object's race (clones have a race of 10 or more: the read goes outside the array)
{
  const { checkBalance, checkAbsolute, classStrings, classTable, heroBaseProblem, CLASS_CALL } = require("./lib/script-checks.js");
  const problems = [], TABLE = classTable([HD_CLASSES, find(OUT, "DATA/CLASSES")]), bases = new Set();
  // The class ids the mod's NEW scripts write as text are the mod's original ones (`THumanWolf`): a clone's own are `SgeHumanWolf` (AGENTS.md). A literal that is no class of the game
  // or of this port and that exactly one clone class stands for is written as that class (only the arguments of the functions that look a class up). Two or more clones: left, the check reports it.
  {
    const heirOf = new Map();
    for (const c of CIVS) for (const [o, n] of Object.entries(JSON.parse(fs.readFileSync(path.join(OUT, "civs", `${c.id}.json`), "utf8")).alias.classes || {})) (heirOf.get(o.toLowerCase()) || heirOf.set(o.toLowerCase(), []).get(o.toLowerCase())).push(n);
    let fixed = 0;
    for (const dir of ["SUBAI", "ITEMSCRIPTS"]) {
      const d = find(OUT, `DATA/${dir}`); if (!d) continue;
      for (const f of fs.readdirSync(d).filter(f => /\.vs$/i.test(f))) {
        const p = path.join(d, f), t = rd(p);
        const u = t.split("\n").map(l => l.replace(new RegExp(CLASS_CALL.source, "g"), call => call.replace(/"([A-Za-z][A-Za-z0-9_]*)"/g, (m, id) => { if (TABLE.has(id.toLowerCase())) return m; const c = heirOf.get(id.toLowerCase()); return c && c.length === 1 ? `"${c[0]}"` : m; }))).join("\n");
        if (u !== t) { wr(p, u); fixed++; }
      }
    }
    console.log(`class ids written as text: ${fixed} scripts had the mod's original ids rewritten as the clone's`);
  }
  const stem = n => n.replace(/_se[sz](_s[a-z]+)?(?=\.vs$)/i, "");
  let copies = 0, strings = 0;
  const ALLOW = new Set([]);
  for (const dir of ["SUBAI", "ITEMSCRIPTS"]) {
    const d = find(OUT, `DATA/${dir}`); if (!d) continue;
    for (const f of fs.readdirSync(d).filter(f => /\.vs$/i.test(f))) {
      const t = rd(path.join(d, f)), pd = find(PRISTINE, `DATA/${dir}`), w = stem(f).toLowerCase(), h = pd && fs.readdirSync(pd).find(x => x.toLowerCase() === w);
      if (h) { checkBalance(t, removeStrayBraces(rd(path.join(pd, h))).text, `DATA/${dir}/${f}`, problems); copies++; } else checkBalance(t, t, `DATA/${dir}/${f}`, problems);
      checkAbsolute(t, `DATA/${dir}/${f}`, problems);
      for (const { fn, id } of classStrings(t)) { strings++; if (!TABLE.has(id.toLowerCase()) && !ALLOW.has(`DATA/${dir}/${f}|${fn}|${id}`)) problems.push(`DATA/${dir}/${f}: ${fn}("${id}") names a class neither the game nor this port has`); else if (fn === "GetRandomHeroClass") bases.add(id); }
      if (/\[\s*(?:[\w.()]*\.)?race\s*\]/i.test(t.replace(/\/\/.*/g, ""))) problems.push(`DATA/${dir}/${f}: indexes an array with .race`);
    }
  }
  for (const b of bases) { const w = heroBaseProblem(TABLE, b); if (w) problems.push(`GetRandomHeroClass("${b}"): ${w}`); }
  console.log(`script checks: ${copies} copies balanced like the mod's, ${strings} class strings resolved, hero bases: ${[...bases].sort().join(" ") || "none"}`);
  if (problems.length) { console.error(`SCRIPT CHECKS FAILED (${problems.length}):\n  ` + [...new Set(problems)].slice(0, 80).join("\n  ")); process.exit(1); }
}

// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
