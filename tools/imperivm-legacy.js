// Imperivm Legacy 2.4.1 (Nicoghiro31, row 3): the game's eight civilizations as the mod has them, each a civilization of its own next to the game's
// (AGENTS.md, "Civilizations are independent"; decided in #15: a balance mod is ported as copies, the host chooses the set in the room). Rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/imperivm-legacy.js [id ...]     (no id: all eight)
// The mod ships as three Clickteam installers (ENG, ESP, ITA) that only differ in local/<language>.pak: they are installed once with wine into .scratch/legacy-src
// (git-ignored; steps in extras/imperivm-legacy/NOTES.md, *Rebuild*; LEGACY_SRC overrides the folder). The tool runs the SDK's shrink-mod.js on it into
// .scratch/legacy-pristine (what is identical to the game stays out; the sprites go to rle.mmp.tail), puts the four hand fixes of extras/ over it (files whose
// paths were broken in the original), rebuilds ported/imperivm-legacy from that and then:
//   1. keeps the mod's version of the game's classes and commands (.scratch/legacy-merged) and drops them from the port: they are the game's, and each
//      civilization they belong to is cloned from HD with the mod's changes on top (tools/lib/clone-civs.js); what the mod changed in the base classes
//      (Hero, Melee, Ranged, Catapult...) is written inside each clone
//   2. the commands of the mod's classes that belong to no civilization are an own file / patches
//   3. the shared tables (items, unit specials, constants, bonuses) only contribute what they ADD, as patches; the edits of the game's own are not ported
//   4. the mod's edits of the game's behavior scripts are copies of their own (_leg, tools/lib/own-scripts.js) that only the clones' classes point to; the
//      class ids a script writes as text are each clone's own
//   5. the mod's AI as L_* scripts that only run for the mod's civilizations (tools/lib/asvr-ai.js); never started with AIRun when they loop (engine #15)
//   6. names another port (or the game) has with other bytes are given the tag "leg" (tools/lib/ported-patch.js, tagCollisions)
//   7. the checks: pictures (the blue-square bug), names a script calls, exit points of the buildings, balance of every script
// The prefix of each civilization is derived from its id by the SDK (first 3 characters: Lga, Lro, Lim...) and there is no index (imperivm-resurrected#37).
// The token "l" is this port's: every id starts with it.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { net, checkBalance, checkAbsolute, removeStrayBraces, applyPatch, classStrings, classTable, heroBaseProblem, CLASS_CALL } = require("./lib/script-checks.js");
const ROOT = path.join(__dirname, "..");
const ID = "imperivm-legacy", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const SCRATCH = path.join(ROOT, ".scratch"), SRC = process.env.LEGACY_SRC || path.join(SCRATCH, "legacy-src"), PRISTINE = path.join(SCRATCH, "legacy-pristine"), MERGED = path.join(SCRATCH, "legacy-merged");
const SDK = process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk");
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const TAG = "leg";
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };
const want = process.argv.slice(2), store = {};
if (!fs.existsSync(path.join(SRC, "rle.mmp"))) { console.error("no installed Legacy 2.4.1 in " + SRC + " (see extras/imperivm-legacy/NOTES.md, *Rebuild*)"); process.exit(1); }
if (!process.env.G || !fs.existsSync(path.join(process.env.G, "rle.mmp"))) { console.error('set G to the HD game folder (shrink-mod.js compares with it)'); process.exit(1); }

// the ids start with "l" (the token of this port) and differ in their first three characters: the SDK derives the prefix from them (Lga, Lro, Lim, Lca, Lbr, Lib,
// Leg, Lge). No index. The mod's own classes of a race that its civilization does not start with by letter are renamed <letter><id> in the clone (clone-civs.js).
// `neutral`: the Numidian tent a map places (CTent), the two mercenaries its script places by name for whoever owns it (CHorseman, CSkirmisher), the Greek garrison post
// (HOutpost) and its hoplite (CHoplite) are nobody's, as in Mediterranevm (alpha). Carthage's barracks train three of them (see NOTES.md, *Carthage*).
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "lgaul", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "lrome", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "limperial", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "lcarthage", neutral: /^(CTent|CHorseman|CSkirmisher|CHoplite|HOutpost)$/, name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "lbritain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "liberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "legypt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "lgermany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];

// 0. the installed mod shrunk against the game (the SDK's tool) in .scratch, with the hand fixes of extras/ over it
fs.rmSync(PRISTINE, { recursive: true, force: true });
{
  fs.mkdirSync(SCRATCH, { recursive: true });
  const r = cp.spawnSync("node", [path.join(SDK, "tools", "shrink-mod.js"), SRC, process.env.G, PRISTINE, "--id", ID, "--name", "Imperivm Legacy", "--version", "2.4.1", "--category", "Gameplay & Balance"], { stdio: ["ignore", "ignore", "inherit"] }); if (r.status) process.exit(1);
  // the four files of the original mod with broken paths (BASETAVERN, RAMUNIT, RTHERMAE, FOG_OWNER_MARKER): extras/ has the fixed ones, which replace them here so that the
  // changes to the base classes are taken from the fixed text. mod.json and NOTES.md are not part of the pristine copy.
  for (const f of walk(EXTRAS)) { if (/^(mod\.json|NOTES\.md)$/.test(f)) continue; const dst = path.join(PRISTINE, f), cur = find(PRISTINE, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); if (cur) fs.rmSync(cur); fs.copyFileSync(path.join(EXTRAS, f), dst); }
}
// 1. a fresh copy of the pristine port: hard links (every write below removes the file first)
fs.rmSync(OUT, { recursive: true, force: true });
cp.spawnSync("cp", ["-al", PRISTINE, OUT], { stdio: "inherit" });
fs.rmSync(path.join(OUT, "NOTES.md"), { force: true });
// What stays out of a civilizations pack altogether (listed in NOTES.md; left-out lists in raw/): the files the old mod removed from the game by replacing its packs
// (hidden.txt: it would hide them for the game's civilizations too), the installer's own update.xml, the adventures and scenarios (they place the game's classes and would
// play with HD's balance, #8; Adventures/Tutorial.BFHP at the game's path would replace the game's tutorial), the whole-game translation tables and per-language voices
// (handled below), and Packs/RandomMapSettlements.bfhp (the game's random-map towns, at the game's path)
{
  const out = [];
  for (const f of ["hidden.txt", "update.xml"]) if (fs.existsSync(path.join(OUT, f))) { fs.rmSync(path.join(OUT, f)); out.push(f); }
  for (const d of ["Adventures", "Scenarios", "Packs", "Local"]) { const p = find(OUT, d); if (p) { for (const f of walk(p)) out.push(`${d}/${f}`); fs.rmSync(p, { recursive: true }); } }
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", "imperivm-legacy-not-ported.txt"), out.join("\n") + "\n");
  console.log(`left out of the port altogether: ${out.length} files (raw/imperivm-legacy-not-ported.txt)`);
}
// files the game does not use (validate-mod.js warns): the Windows thumbnail cache and a cursor nothing names
for (const f of walk(OUT).filter(f => /(^|\/)thumbs[^/]*\.db$|^UI\/CURSORS\/arow2\.cur$/i.test(f))) fs.rmSync(path.join(OUT, f));
// scripts saved in Latin-1 (accents): the game's compiler wants UTF-8, as for the classes (port-140.js)
for (const f of walk(OUT).filter(f => /\.vs$/i.test(f))) {
  const p = path.join(OUT, f), b = fs.readFileSync(p);
  try { new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { fs.rmSync(p); fs.writeFileSync(p, Buffer.from(b.toString("latin1"), "utf8")); }
}
// The mod's own scripts can be broken in ways 1.40's compiler tolerated and this one reports ("Closing } without correspond opening"): the mod's UNIT_ON_KILL.VS removed the
// `if (!Victim.IsSentry) {` of two blocks (its sentries now get the items too) and left their closing braces. A "}" that closes nothing is removed from every script of the
// mod before any copy is made from it (found in game: imperivm-mod.log 18:53:32 "(56, 3)"; lines are those of the mod's file).
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
// (The <method>s the clones inherit from the game's classes and whose script the mod edited are written inside the clones by tools/lib/own-scripts.js, step 3c.)
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
  for (const c of CIVS) if (c.neutral) for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const id = classOf(rd(path.join(CLASSES, f))); if (id && c.neutral.test(id)) neutral.add(id); }
}

// 2. the civilizations of the game, as the mod has them
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "Legacy", LABEL: "Legacy", CIVS, cloneAllOrders: true, want });

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
  if (own.length) wr(path.join(COMMANDS, "LEGACY.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
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
    const p = path.join(COMMANDS, "LEGACY.XML"), t = fs.existsSync(p) ? rd(p) : "<commands>\n\n</commands>\n";
    wr(p, t.replace(/\s*<\/commands>\s*$/, `\n\n${add.join("\n\n")}\n\n</commands>\n`));
  }
  console.log(`commands of the mod for the game's base classes: ${add.length} added with the port's classes under them as sources (${noHeirs} with no class of this port under them left out)`);
}

// 3c. the mod's versions of the game's behavior scripts (barrack_train.vs, arena_behavior.vs, unit_on_kill.vs...): the clones' classes and commands use copies of
// their own (<name>_leg.vs, and <name>_leg_<id>.vs where the class ids the script writes as text differ per civilization); the game's scripts stay the game's
// (tools/lib/own-scripts.js). The mod has no branch to choose, so nothing is skipped. `inherit`: the methods the clones inherit from the game's classes
// (Unit, Military...) whose script the mod edited are written inside each clone, pointing to the copy.
const CLONES = CIVS.map(c => { const letter = c.id.slice(0, 3).replace(/^./, x => x.toUpperCase()); return { id: c.id, letter, from: [c.baseLetter, ...(c.asBase || []).map(x => x[0])], match: new RegExp(`^(${letter}|${c.id}\\.)`, "i"), modOnly: true, keep: c.neutral }; });
{
  const r = require("./lib/own-scripts.js")({ OUT, HD, tag: TAG, skip: /(?!)/, civs: CLONES, modClasses: path.join(PRISTINE, "DATA", "CLASSES"), inherit: true });
  console.log(`scripts of the mod's own for its civilizations: ${r.copied.length} copied (_${TAG}), ${r.skipped.length} left to the game's (${r.skipped.map(s => s.name).join(", ")})`);
  console.log(`  methods inherited from the game's classes whose script the mod edited: ${r.injected} <method> written inside ${r.touched} classes; behaviors inherited and left the game's: ${(r.behaviorsLeft || []).join("; ") || "none"}`);
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", "imperivm-legacy-own-scripts.txt"), r.copied.map(c => `${c.from} -> ${c.to}  (${c.users.slice(0, 4).join(", ")}${c.users.length > 4 ? ", ..." : ""})`).join("\n") + "\n\nnot copied:\n" + r.skipped.map(s => `${s.name}: ${s.why}`).join("\n") + "\n\nbehaviors inherited from the game's classes and left the game's:\n" + (r.behaviorsLeft || []).join("\n") + "\n");
}

// 3d. The mod wrote its civilization tests as `.race == Gaul` (`owner.AsUnit.race == Germany`): for a clone the race is the clone's own, so the test is false (a
// behavior script that returns on it is restarted for ever). Each test in the mod's scripts also accepts the clone: `(X.race == Gaul || Mod_TrueRace(X) == Lgaul)`.
// `GetPlayerRace` is left alone (it returns the base for a clone, as the game's scripts expect).
const BASE_CONST = { Gaul: "Lgaul", RepublicanRome: "Lrome", ImperialRome: "Limperial", Carthage: "Lcarthage", Britain: "Lbritain", Iberia: "Liberia", Egypt: "Legypt", Germany: "Lgermany" };
// Only the comparison is matched (never the "(" before it): receiver = a chain of names with optional "()" (`owner.AsUnit`, `u.AsUnit`), or nothing for the bare `.race` of
// the script's own object (`obj`: its first parameter, `This`). Mod_TrueRace takes the object, so a trailing .AsUnit / .AsBuilding is dropped.
const RACE_RE = new RegExp(String.raw`(?<![\w.)\]])((?:[A-Za-z_]\w*(?:\(\))?\.)*[A-Za-z_]\w*(?:\(\))?)?\.race\s*(==|!=)\s*(${Object.keys(BASE_CONST).join("|")})\b`, "g");
const objOf = text => (/^\s*\/\/\s*[\w]+\s*,\s*Obj\s+(\w+)/.exec(text.split("\n")[0]) || [])[1] || "This";
const raceTests = (text, obj = objOf(text)) => text.replace(RACE_RE, (m, r, op, b) => {
  const o = (r || obj).replace(/\.As(?:Unit|Building)(?:\(\))?$/, "");
  return op === "==" ? `(${m} || Mod_TrueRace(${o}) == ${BASE_CONST[b]})` : `(${m} && Mod_TrueRace(${o}) != ${BASE_CONST[b]})`;
});
// The same for the class ids the scripts test (`.IsHeirOf("CLider2")`, `Count(player, "GArcher")`): the clone's class is not a CLider2 or a GArcher, so each test also
// accepts the clones' classes (one per civilization: the original id and the ids it became). The ids the clone step renamed (Hipatista -> MHipatista -> AimHipatista) count too.
// The original id stays in the test only if it is a class (of the game or of this port): `IsHeirOf("BLider")` is not, the clones' are.
const heirOf = new Map();                                              // lowercase original id -> [the clones' ids]
const KNOWN = classTable([HD_CLASSES, find(OUT, "DATA/CLASSES")]);     // every class the game and this port have
{
  const mod = new Set(walk(path.join(PRISTINE, "DATA", "CLASSES")).filter(f => /\.sc\.xml$/i.test(f)).map(f => classOf(rd(path.join(PRISTINE, "DATA", "CLASSES", f)))));
  for (const c of CIVS.filter(c => !want.length || want.includes(c.id))) {
    const j = readJson(path.join(OUT, "civs", `${c.id}.json`));
    // a clone of a class of the mod that has no letter of its own (MHipatista <- Hipatista) is also known by that name; GLider is the mod's own id, not "Lider"
    for (const [k, v] of Object.entries(j.alias.classes)) for (const o of new Set([k, k[0] === c.baseLetter && !mod.has(k) && mod.has(k.slice(1)) && !hdClass.has(k.toLowerCase()) ? k.slice(1) : k])) { const l = o.toLowerCase(); if (!heirOf.has(l)) heirOf.set(l, []); if (!heirOf.get(l).includes(v)) heirOf.get(l).push(v); }
  }
}
const RECV = String.raw`(\.|(?:[A-Za-z_]\w*(?:\[[^\]]*\])?(?:\(\))?\.)+)`;
const heirTests = text => text
  .replace(new RegExp(`${RECV}IsHeirOf\\("(\\w+)"\\)`, "g"), (m, r, id) => {
    const c = heirOf.get(id.toLowerCase()); if (!c) return m;
    const alt = [...(KNOWN.has(id.toLowerCase()) ? [m] : []), ...c.filter(x => x.toLowerCase() !== id.toLowerCase()).map(x => `${r}IsHeirOf("${x}")`)];
    return alt.length > 1 ? `(${alt.join(" || ")})` : alt[0];
  })
  .replace(/\bCount\(([^,()]+),\s*"(\w+)"\)/g, (m, p, id) => {
    const c = heirOf.get(id.toLowerCase()); if (!c) return m;
    const alt = [...(KNOWN.has(id.toLowerCase()) ? [m] : []), ...c.filter(x => x.toLowerCase() !== id.toLowerCase()).map(x => `Count(${p}, "${x}")`)];
    return alt.length > 1 ? `(${alt.join(" + ")})` : alt[0];
  });
// And the comparison of an object's class with an id of the game (`newunit.class == "GAxeman"`, `.class != "IDefender"`): a clone's unit is not a GAxeman, so the test is false for it and
// the bonus, the conversion or the recount the script does for that unit never happens (a bonus of the mod's new MELEE_ATTACK_BONUS.VS, UNIT_CONVERT.VS...). Each test also accepts the
// clones' ids of that class (one per civilization that has it); a test that already names a clone's id is left as it is. Only a plain receiver (`x.class`, `.class`, `a.b().class`).
const CLASS_CMP = /(?<![\w.)\]])((?:[A-Za-z_]\w*(?:\(\))?\.)+|\.)class\s*(==|!=)\s*"(\w+)"/g;
const classCmp = text => text.replace(CLASS_CMP, (m, recv, op, id) => {
  const c = (heirOf.get(id.toLowerCase()) || []).filter(x => x.toLowerCase() !== id.toLowerCase()); if (!c.length) return m;
  return op === "==" ? `(${[m, ...c.map(x => `${recv}class == "${x}"`)].join(" || ")})` : `(${[m, ...c.map(x => `${recv}class != "${x}"`)].join(" && ")})`;
});
const ownTests = (text, obj) => classCmp(heirTests(raceTests(text, obj)));
{
  let n = 0;
  for (const sub of ["DATA/SUBAI", "DATA/ITEMSCRIPTS", "DATA/ESPECIALIDADES", "DATA/RANGOS"]) {
    const dir = find(OUT, sub); if (!dir) continue;
    for (const f of fs.readdirSync(dir).filter(f => /\.vs$/i.test(f))) { const p = path.join(dir, f), s = rd(p), t = ownTests(s); if (t !== s) { wr(p, t); n++; } }
  }
  console.log(`${n} scripts of the mod: the tests of the civilization (.race == Gaul...) and of the classes (IsHeirOf, Count) also accept the clones`);
}
// 3e. The behaviors the clones inherit from the game's classes and the mod edited (arena_behavior.vs of every barracks and arena, the outposts' garrison, the villages'
// food): the mod's version as blocks inside the game's script that only run for the mod's civilizations (tools/lib/asvr-inline.js). The ruins' (BaseRuins) are neutral
// objects of the map: not ported.
{
  const map = require("./lib/own-scripts.js").classMapper({ OUT, HD, modClasses: path.join(PRISTINE, "DATA", "CLASSES") });
  const civs = CLONES.map(c => ({ ...c, constant: c.id[0].toUpperCase() + c.id.slice(1) }));
  for (const name of ["arena_behavior.vs", "outpost_behavior.vs", "village_behavior_givefood.vs", "village_behavior_supply.vs", "townhall_autotrain.vs", "townhall_behavior_guard.vs"]) {
    const r = require("./lib/asvr-inline.js")({ OUT, HD: HDDATA, SRC: path.join(PRISTINE, "DATA", "SUBAI"), name, civs, mapClasses: map, transform: (t, c) => ownTests(t, "This").replace(/"([A-Z])Lider"/g, (m, l) => KNOWN.has(`${l}lider`) ? m : `"${c.letter}Lider"`) });
    console.log(`  ${name}: ${r ? `a block for each of the ${r.civs} civilizations inside the game's script (declared at the top: ${r.declared.join(" ") || "none"})` : "not in the mod or the game"}`);
  }
}

// 3f. The AI (tools/lib/asvr-ai.js plus what Legacy adds to it). The mod's edits: the economy loops of strongholds and villages, the helpers they start (new ones for
// the Carthaginian army, the fleets and the shipyard), the tactics of five civilizations (two variants for three of them, as the mod draws them), the squad monitor,
// the recruiter and the new fleet monitor, and the values the engine asks by name (CalcGAIKAPriority, GetArmyNeed, GetGAIKAStrat). Not ported (NOTES.md): the tuning of
// AI.INI (the values of the keys the game has, for every AI), AI/DEFENSIVE and AI/_TEUTON (profiles), AIOSendSquad and EvalRecruit (the engine calls them with no player
// to scope them by), the outposts' loops (ES_OutpostSellFood/Gold: the mod's change is global to outposts), GS_KillEnemies / GSH_SynchApproach.
{
  const ids = {};                                                      // the mod's classes the clone step renamed: <letter of the base><id>
  for (const c of CIVS) { const j = readJson(path.join(OUT, "civs", `${c.id}.json`)); for (const k of Object.keys(j.alias.classes)) if (k[0] === c.baseLetter && /^[A-Z]/.test(k.slice(1)) && fs.existsSync(path.join(PRISTINE, "DATA", "CLASSES", `${k.slice(1).toUpperCase()}.SC.XML`)) && !hdClass.has(k.slice(1).toLowerCase()) && !hdClass.has(k.toLowerCase())) ids[k.slice(1)] = k; }
  const VARIANTS = { Lgaul: ["TS_GaulTactic", "=TS_GaulTactic2"], Liberia: ["TS_IberianTactic", "TS_IberianTactic2"], Limperial: ["TS_MRomeTactic", "TS_MRomeTactic2"], Lbritain: ["TS_BritishTactic"], Lrome: ["TS_RRomeTactic"] };
  const r = require("./lib/asvr-ai.js")({ OUT, HD: HDDATA, SRC: path.join(PRISTINE, "DATA", "AI"), prefix: "LEG_", ids,
    civs: CIVS.map(c => c.id[0].toUpperCase() + c.id.slice(1)),
    tactics: Object.fromEntries(Object.entries(VARIANTS).map(([c, v]) => [c, v[0]])),
    loops: ["ES_Stronghold", "ES_Village"],
    helpers: ["ES_Shipyard", "ESH_ArenaUnits", "ESH_ArmyTechSeq", "ESH_BuildArmy", "ESH_BuildGermanArmy", "ESH_BuildCarthaginianArmy", "ESH_CombatMagic", "ESH_CounterUnits", "ESH_Druids", "ESH_EnabledUnits", "ESH_Market", "ESH_NeedTech", "ESH_ResearchTraining",
      "ESH_BuildAdmiralShip", "ESH_BuildFleet", "ESH_NeedTechShipyard", "ESH_ShipyardGoldTransportHarvesting", "ESH_ShipyardGoldTransportNeededTech", "ESH_ShipyardNeedFishermen", "TSH_RecruitArmy", "TS_IberianTactic2", "TS_MRomeTactic2"],
    monitors: ["SquadMonitor", "Recruiter", "FleetMonitor"],
    inline: [{ name: "CalcGAIKAPriority.vs", player: "idPlayer" }, { name: "GetArmyNeed.vs", player: "idPlayer" }, { name: "GetGAIKAStrat.vs", player: "idPlayer" }] });
  // what the library does not know: the shipyard's loop, the second tactic of three civilizations drawn like the mod does it, and the new fleet monitor
  const pd = path.join(OUT, "patches", "DATA", "AI"), mine = CIVS.map(c => c.id[0].toUpperCase() + c.id.slice(1));
  { const p = path.join(pd, "GETECONOMYSCRIPT.VS"); wr(p, rd(p).replace(/\}\s*$/, "\tif (set.IsShipyard)\r\n\t\treturn LEG_ES_Shipyard;\r\n}\r\n")); }
  { const p = path.join(pd, "AI.INI"); wr(p, rd(p).replace("[EconomyScripts]\r\n", "[EconomyScripts]\r\n+LEG_ES_Shipyard\r\n").replace("[TacticScripts]\r\n", "[TacticScripts]\r\n+LEG_TS_IberianTactic2\r\n+LEG_TS_MRomeTactic2\r\n")); }
  { const p = path.join(pd, "MAIN.VS"); wr(p, rd(p).replace(/\treturn;\r\n\}/, "\tAIRun('LEG_FleetMonitor.vs');\r\n\treturn;\r\n}")); }
  { // the mod's GetTacticScript: in the first two seconds each civilization draws among its tactics (Germany, Egypt and Carthage have none in the mod)
    const body = mine.map(c => { const v = VARIANTS[c] || [], n = v.length, pick = v.map((t, i) => `\t\tif (nLegRnd < ${Math.round(100 * (i + 1) / (n === 1 ? 2 : 3))})\r\n\t\t\treturn ${t[0] === "=" ? t.slice(1) : "LEG_" + t};\r\n`).join("");
      return `if (Mod_TrueRace(set.GetCentralBuilding) == ${c})\r\n{\r\n\tif (GetTime < 2000)\r\n\t{\r\n\t\tnLegRnd = rand(100);\r\n${pick}\t}\r\n\treturn TS_NONE;\r\n}\r\n`; }).join("");
    wr(path.join(pd, "GETTACTICSCRIPT.VS"), `@top\r\nint nLegRnd;\r\n@before nRace = set.GetCentralBuilding.race;\r\n// The mod's own tactic for each of its civilizations (the game's AI sees their base), drawn as the mod draws it\r\n${body}`); }
  { // the library reads the variables as AIV_[A-Za-z0-9]+, which stops at an underscore (AIV_Sleep_FleetMonitor, AIV_Sleep_Recruit...): every AIV_ name the copies and the
    // patches use that the game's AI.INI lacks is declared here, with the mod's value in each section the mod gives it (a key the game has keeps the game's value)
    const ini = (t) => { const m = new Map(); let sec = ""; for (const l of t.split(/\r?\n/)) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; m.set(sec, m.get(sec) || []); continue; } if (sec) m.get(sec).push(l); } return m; };
    const keyOf = l => (l.match(/^\s*\+?\s*([A-Za-z_]\w*)\s*=/) || [])[1];
    const hdText = rd(path.join(HDDATA, "AI", find(path.join(HDDATA, "AI"), "AI.INI") ? path.basename(find(path.join(HDDATA, "AI"), "AI.INI")) : "AI.INI")), modText = rd(find(path.join(PRISTINE, "DATA", "AI"), "AI.INI"));
    const hdKeys = new Set([...ini(hdText).values()].flat().map(keyOf).filter(Boolean).map(x => x.toLowerCase()));
    const used = new Set(); for (const f of [...walk(path.join(OUT, "DATA", "AI")).map(x => path.join(OUT, "DATA", "AI", x)), ...walk(pd).filter(x => /\.vs$/i.test(x)).map(x => path.join(pd, x))]) for (const m of rd(f).matchAll(/\bAIV_\w+/g)) used.add(m[0]);
    const patch = ini(rd(path.join(pd, "AI.INI"))), mod = ini(modText), have = new Set([...patch.values()].flat().map(keyOf).filter(Boolean).map(x => x.toLowerCase())), added = [];
    for (const v of used) if (!hdKeys.has(v.toLowerCase()) && !have.has(v.toLowerCase())) for (const [sec, lines] of mod) for (const l of lines) if ((keyOf(l) || "").toLowerCase() === v.toLowerCase()) { if (!patch.has(sec)) patch.set(sec, []); patch.get(sec).push(l.replace(/\s*;.*$/, "").trim()); added.push(`${sec}: ${v}`); }
    wr(path.join(pd, "AI.INI"), [...patch].flatMap(([sec, lines]) => [`[${sec}]`, ...lines.filter(l => l.trim())]).join("\r\n") + "\r\n");
    r.vars.push(...added);
  }
  console.log(`AI: ${r.forks.length} scripts as LEG_* copies (${r.forks.join(", ")}); ${r.inlined.length} inside the game's (${r.inlined.join(", ")}); tactics ${r.tactics.join(", ")}; AI variables declared: ${r.vars.join(", ") || "none"}${r.problems.length ? "\n  to check: " + r.problems.join("; ") : ""}`);
  // what the mod's AI folder left at the game's path is now copies or left out
  for (const f of fs.readdirSync(find(OUT, "DATA/AI")).filter(f => !/^LEG_/i.test(f))) fs.rmSync(path.join(find(OUT, "DATA/AI"), f), { recursive: true, force: true });
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
  // CONST.INI: shrink-mod.js made it a patch (patches/data/const.ini, without [Resolutions]). Only the keys the game's file lacks are the mod's content (the scripts read
  // them); the keys the game has cannot be scoped to a clone, and the colours of the players, the delay of the interface bars and the rank points are not the mod's
  // civilizations': they go to raw/imperivm-legacy-global-const.txt, for the rules pack (NOTES.md, *Left out because it is global*)
  {
    const cpath = path.join(OUT, "patches", "data", "const.ini");
    if (fs.existsSync(cpath)) {
      const hdText = rd(find(HDDATA, "CONST.INI")), hdVal = new Map(); let sec = "";
      for (const l of hdText.split(/\r?\n/)) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1].toLowerCase(); continue; } const k = l.match(/^\s*([A-Za-z_]\w*)\s*=\s*(.*?)\s*(?:[;/].*)?$/); if (k) hdVal.set(k[1].toLowerCase(), k[2]); }
      const keep = [], global = []; sec = "";
      for (const l of rd(cpath).split(/\r?\n/)) {
        const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; continue; }
        const k = l.match(/^\s*(-?)([A-Za-z_]\w*)\s*(?:=\s*(.*?))?\s*$/); if (!k) continue;
        if (k[1]) { global.push(`${sec}: ${l.trim()}   (removes a key of the game)`); continue; }
        if (/^(PlayerColors|UIBars|Ranks)$/i.test(sec)) { global.push(`${sec}: ${l.trim()}`); continue; }
        if (hdVal.has(k[2].toLowerCase())) { global.push(`${sec}: ${k[2]}   game: ${hdVal.get(k[2].toLowerCase())}   mod: ${(k[3] || "").replace(/\s*[;/].*$/, "")}`); continue; }
        keep.push([sec, l.trim().replace(/\s*(;|\/\/).*$/, "")]);
      }
      fs.rmSync(path.join(OUT, "patches", "data"), { recursive: true, force: true });
      if (keep.length) { const out = []; for (const sc of [...new Set(keep.map(x => x[0]))]) out.push(`[${sc}]`, ...keep.filter(x => x[0] === sc).map(x => x[1])); wr(path.join(OUT, "patches", "DATA", "CONST.INI"), out.join("\r\n") + "\r\n"); }
      fs.writeFileSync(path.join(ROOT, "raw", "imperivm-legacy-global-const.txt"), global.join("\n") + "\n");
      patches.push(`DATA/CONST.INI (${keep.length} keys the game lacks; ${global.length} lines left out as global)`);
    }
  }
  // the random maps (PLACEOBJECTS.XML): the mod places its Greek garrison (HOutpost) and Numidian tent (CTent) through the game's own blocks, as RaceAlternative of the
  // game's Carthage and Egypt: a patch for that would change the maps of the game's own Carthage and Egypt (and it is not known whether a clone is matched by its base's race),
  // so the two neutral classes are not placed by the random maps (NOTES.md). The file, and the other map files the mod edited, are left out below (step 5).
  { const mp = find(OUT, "DATA/RANDOMMAP/PLACEOBJECTS.XML"); if (mp) fs.rmSync(mp); }
  // BONUS.XML: the mod's bonuses of its spearmen against horses name the game's classes (GSpearman, BBronzeSpearman...): each clone gets its own
  const bm = find(OUT, "DATA/BONUS.XML"), bh = find(HDDATA, "BONUS.XML");
  if (bm && bh) {
    const have = new Set([...rd(bh).matchAll(/<bonus\s+attacker="([^"]+)"\s+defender="([^"]+)"/g)].map(m => `${m[1]}>${m[2]}`.toLowerCase()));
    const ops = [];
    for (const m of rd(bm).matchAll(/<bonus\s+attacker="([^"]+)"\s+defender="([^"]+)"\s+bonus="([^"]+)"\s*\/>/g)) {
      if (have.has(`${m[1]}>${m[2]}`.toLowerCase())) continue;
      for (const c of CIVS) { const j = readJson(path.join(OUT, "civs", `${c.id}.json`)), to = Object.entries(j.alias.classes).find(([k]) => k.toLowerCase() === m[1].toLowerCase() || k.toLowerCase() === `${c.baseLetter}${m[1]}`.toLowerCase()); if (to) ops.push(`  <add select="/bonuses"><bonus attacker="${to[1]}" defender="${m[2]}" bonus="${m[3]}"/></add>`); }
    }
    fs.rmSync(bm);
    if (ops.length) { wr(path.join(OUT, "patches", "DATA", "BONUS.XML"), `<patch>\n${ops.join("\n")}\n</patch>\n`); patches.push(`DATA/BONUS.XML (${ops.length} bonuses of the clones' classes)`); }
  }
  // the patch of the items has accents (the mod's texts are Spanish): UTF-8, as the validator wants
  { const ip = path.join(OUT, "patches", "DATA", "ITEMS.XML"); if (fs.existsSync(ip)) { const b = fs.readFileSync(ip); try { new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { fs.rmSync(ip); fs.writeFileSync(ip, Buffer.from(b.toString("latin1"), "utf8")); } } }
  console.log(`patches: ${patches.join("; ")}`);
}

// The game modes (the mod edits modes 1-5 and adds 6 SMALL MAP and 7 VARIOS MODE, "online rulesets") and the bonus scripts are rules of the game for every player: not a
// civilization's. They are not shipped and are listed in raw/imperivm-legacy-not-ported.txt (NOTES.md: for the rules pack)
for (const d of ["DATA/GAMESCRIPTS", "DATA/BONUSSCRIPTS"]) { const p = find(OUT, d); if (p) { fs.appendFileSync(path.join(ROOT, "raw", "imperivm-legacy-not-ported.txt"), walk(p).map(f => `${d}/${f}\n`).join("")); fs.rmSync(p, { recursive: true, force: true }); } }
// The mod's menu skin: written back from the pristine copy at the end of step 6 (below), AFTER the steps that compare files with the game's, which would remove it
// (the menu INIs and the UI/MENU pictures are at the game's names). Here what is at the game's paths goes.
const SKIN = /^(CURRENTLANG\/[^/]+\.bmp|UI\/MENU\/[^/]+|DATA\/INTERFACE\/MENU\/[^/]+\.INI)$/i;
for (const f of walk(OUT).filter(f => SKIN.test(f))) fs.rmSync(path.join(OUT, f));

// The mod's edits of the scripts of the game's own items (God's Gift...) are global: the items' edits are not ported (above), so the scripts that only they used go too
{
  const hdIS = find(HDDATA, "ITEMSCRIPTS"), mineIS = find(OUT, "DATA/ITEMSCRIPTS"), ip = path.join(OUT, "patches", "DATA", "ITEMS.XML"), used = fs.existsSync(ip) ? rd(ip).toLowerCase() : "";
  const hdNames = new Set(fs.readdirSync(hdIS).map(f => f.toLowerCase()));
  for (const f of mineIS ? fs.readdirSync(mineIS) : []) if (hdNames.has(f.toLowerCase()) && !used.includes(f.toLowerCase())) { fs.rmSync(path.join(mineIS, f)); console.log(`item script of a game item the mod edited, not ported: ${f}`); }
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
  fs.writeFileSync(path.join(ROOT, "raw", "imperivm-legacy-left-out.txt"), left.join("\n") + "\n");
  console.log(`game files with other bytes: ${left.length} left out (raw/imperivm-legacy-left-out.txt)`);
}

// 6. names another mod of ours (or the game's own adventures) already has with other bytes: this port's are renamed
{
  // a class file is named after its id (the mod's IronMine is in MINAORO.SC.XML): the collision is found by path
  for (const f of fs.readdirSync(find(OUT, "DATA/CLASSES")).filter(f => /\.sc\.xml$/i.test(f))) {
    const d = find(OUT, "DATA/CLASSES"), id = classOf(rd(path.join(d, f)));
    if (id && `${id.toUpperCase()}.SC.XML` !== f.toUpperCase() && !fs.existsSync(path.join(d, `${id.toUpperCase()}.SC.XML`))) fs.renameSync(path.join(d, f), path.join(d, `${id.toUpperCase()}.SC.XML`));
  }
  const { tagCollisions } = require("./lib/ported-patch.js");
  const G = path.join(ROOT, "originals", "game-data");
  // The ports whose names this one avoids: `ported/` of the worktree, or PORTS_DIR (a folder with a copy of them: the Greek 2.x ports are rebuilt by another worktree while this
  // one is built, and the names that get the `_leg` suffix depend on what they have at that moment; a snapshot makes the build repeatable, see NOTES.md, *Rebuild*)
  const PORTS = process.env.PORTS_DIR || path.join(ROOT, "ported");
  const ports = fs.readdirSync(PORTS).filter(d => d !== ID && find(path.join(PORTS, d), "DATA/CLASSES")).map(d => path.join(PORTS, d));
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: TAG, others: [...ports, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: "Legacy", gameDirs: [path.join(G, "paks")], skip: /^(currentlang|ui\/menu|data\/interface\/menu|rle\.mmp\.tail$|outlines\/|minimap\/)/ });
    // rle.mmp.tail is found by its name; the outline and mini-map pictures are named after their entity's folder: a renamed art folder's follow it below
    // ("[BLACK_|COLOR_]<top>-<folder>-<name of the entity>.bmp", the name attribute of the .ent.xml, which the rename changed too)
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
    console.log(`own names (${TAG}), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
  const { ownNames, tagNames } = require("./lib/ported-patch.js");
  const mine = ownNames(OUT, HD), clash = { cmds: new Set(), items: new Set() };
  for (const o of ports) { const t = ownNames(o, HD); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const names = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with other ports: ${clash.cmds.size} orders, ${clash.items.size} items -> "(${TAG})" in ${tagNames({ OUT, names, tag: TAG })} files`);
}

// tagCollisions rewrites a renamed file's references by file name alone, so a name that only ends the same way, or a file of that name in another folder, was renamed too
// and now asks for a file that does not exist (the blue square where the "Gladiator shows" icon should be). The pictures that do not resolve go back to the mod's own name:
// tools/lib/legacy-refs.js. Its check at the end of the build stops on any that is still missing.
{ const R = require("./lib/legacy-refs.js"), fixed = R.fixBmpRefs(OUT, HD), other = R.fixFileRefs(OUT, HD);
  console.log(`picture references put back to the mod's own name: ${fixed.length}${fixed.length ? "\n  " + fixed.join("\n  ") : ""}\nreferences to scripts and other files put back: ${other.length}${other.length ? "\n  " + other.join("\n  ") : ""}`); }

// The game's base hero classes written as text in a script of the port (`.ObjectsAround("BritonHero")` in the Carnyx research: the heroes around the blacksmith): the clone's
// heroes are children of its own base hero (LbritainHero), not of the game's, so the literal never matches one. A literal names the heroes of ONE civilization, so it becomes that
// civilization's clone hero whoever runs the script (a script shared by every civilization's buildings finds, near a Gaul blacksmith, an ally's Britain hero now as before). Only
// the port's own scripts; the game's scripts and the patches of them are not touched. Code under `if (false)` and comments do not count.
{
  const hero = Object.fromEntries(CIVS.map(c => [c.hero, readJson(path.join(OUT, "civs", `${c.id}.json`)).alias.classes[c.hero]]));
  const heroRe = new RegExp(`"(${CIVS.map(c => c.hero).join("|")})"`, "g"), live = t => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  let n = 0;
  for (const f of walk(path.join(OUT, "DATA", "SUBAI")).filter(f => /\.vs$/i.test(f))) {
    const p = path.join(OUT, "DATA", "SUBAI", f), t = rd(p); if (!heroRe.test(live(t))) continue; heroRe.lastIndex = 0;
    wr(p, t.replace(heroRe, (m, h) => (hero[h] ? `"${hero[h]}"` : m))); n++;
  }
  console.log(`base hero class written as text in a script of the port: ${n} rewritten to the clone's hero`);
}

// The menu skin: the one exception to "patches only" (AGENTS.md, *Menu skin*): cosmetic, one skin shows at a time, and the rule names Imperivm Legacy as a skin that replaces
// the layout of the menus. What it ships, byte for byte from the shrunk original: the six pictures of Currentlang/ (background, the two decorations, logo, the adventure and
// conquest defaults), the two pictures of UI/MENU and the 13 menu INIs of DATA/INTERFACE/MENU (the main menu places the decoration and the logo and writes "Legacy Mod v2.4.1";
// TEMPLATE.INI moves every menu's buttons to the right). Not shipped: the CMDBAR/INFOBAR/EDITOR INIs (they change the game's interface for everybody) and any text table.
{
  const files = walk(PRISTINE).filter(f => SKIN.test(f));
  for (const f of files) { const d = path.join(OUT, f.replace(/^currentlang\//i, "CURRENTLANG/")); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.rmSync(d, { force: true }); fs.copyFileSync(path.join(PRISTINE, f), d); }
  console.log(`menu skin: ${files.length} files (${files.filter(f => /\.INI$/i.test(f)).length} INIs, ${files.filter(f => /\.bmp$/i.test(f)).length} pictures)`);
}

// What only the tables and templates left out as global used: the mod's terrain textures (TERRAINS.XML / TERRAINMIX.XML, global, not ported) and their mini-map tiles, the
// game's DECORS.INI the mod edited (the game reads that name, a copy under another does nothing), and the pictures of the game's own random-map types whose template is not shipped
// (the new templates, CONTINENT (MIRRORED) and CRUCIBLE, are bitmap-based and stay with their pictures). Listed in raw/imperivm-legacy-not-ported.txt.
{
  const gone = [], rm = f => { fs.rmSync(path.join(OUT, f), { recursive: true, force: true }); gone.push(f); };
  for (const f of walk(OUT)) if (/^TERRAIN\//i.test(f) || /^MINIMAP\/ZOOM\d+\/TERRAIN\//i.test(f) || /^MAPOBJECTS\/DECORS\/DECORS/i.test(f)) rm(f);
  const tpl = new Set(fs.readdirSync(find(OUT, "DATA/RANDOMMAP") || OUT).filter(f => /\.rm\.xml$/i.test(f)).map(f => f.replace(/\.rm\.xml$/i, "").replace(/^_/, "").replace(/ *\(.*\)/, "").toLowerCase()));
  const rmDir = find(OUT, "RANDOMMAP");
  if (rmDir) for (const d of fs.readdirSync(rmDir, { withFileTypes: true }).filter(e => e.isDirectory())) if (!tpl.has(d.name.toLowerCase().replace(/ *\(.*\)/, ""))) for (const f of walk(path.join(rmDir, d.name))) rm(`RANDOMMAP/${d.name}/${f}`);
  fs.appendFileSync(path.join(ROOT, "raw", "imperivm-legacy-not-ported.txt"), gone.map(f => `${f}\n`).join(""));
  console.log(`terrain textures, mini-map tiles of terrains, DECORS and pictures of random-map types left out: ${gone.length} files`);
}

// 7. hand fixes of this mod (extras/imperivm-legacy/): the final files and mod.json with the credits
// (the four fixed class/entity files of extras/ were put over the pristine copy at step 0; only mod.json is copied here)
fs.copyFileSync(path.join(EXTRAS, "mod.json"), path.join(OUT, "mod.json"));
// Scripts of the mod that the game's compiler (stricter than 1.40's) refuses: they use a variable they never declare, or declare one twice, or
// the header names a parameter other than the one the body reads. A behavior that does not compile ends at once and the engine starts it again,
// forever: the game hangs when a match starts (Logs\comp_out.txt lists them). Found with the compiler's own log; each fix is the missing
// or the duplicate declaration, nothing else.
{
  const FIXES = [];                                                  // filled from the compiler's log in game (NOTES.md); the offline checks below find the rest
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
  const stem = v => path.basename(v).toLowerCase().replace(/\.vs$/, "").replace(/_leg(_l[a-z]+)?$/, "");
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
      if (/_leg(_l[a-z]+)?\.vs/i.test(left[i])) { t = t.replace(left[i], ""); over--; removed++; (twins["(over 8)"] ||= new Set()).add(`${id}: ${left[i].match(/script="([^"]+)"/)[1]}`); }
    }
    if (t !== s) { wr(p, t); touched++; }
  }
  console.log(`${removed} behaviors of the mod that the game's parent class already has removed from ${touched} classes`);
  for (const [o, s] of Object.entries(twins)) console.log(`  under ${o}: ${[...s].join(", ")}`);
}
// 8. Offline checks of every script this build writes (nothing compiles them but the game, and a patch of the game's own that does not compile stops that script for EVERY
// civilization). The build stops on a problem.
//   (a) each copy / rewritten script has the parens, braces and brackets of the mod's script it comes from (comments and strings out), and no Mod_TrueRace without an object
//   (b) each patch is applied to the game's script with the engine's algorithm (PatchScriptText): no directive fails, each block is balanced, the result has the game's balance
//   (c) each class a script names as text (Place, GetRandomHeroClass, IsHeirOf, Count...) is a class of the game or of this port, and a GetRandomHeroClass base has a
//       descendant with an entity (PickRandomHeroClass draws until it finds one: a base without one hangs the game)
{
  const problems = [], vs = f => /\.vs$/i.test(f), TABLE = classTable([HD_CLASSES, find(OUT, "DATA/CLASSES")]);
  // The class ids the mod's scripts write as text are the mod's original ones (`CSentry2`, `MHipatista`, `GAncientDruid`): a clone's own are `AcaSentry2`, `AimHipatista`...
  // (AGENTS.md). A literal that is no class of the game or of this port and that exactly one clone class stands for is written as that class. Only the arguments of the
  // functions that look a class up (classStrings) and never a directive line of a patch (the anchor must stay the game's text). Two or more clones (`Lider`) are left: the
  // check below reports them.
  const fixLiterals = text => {
    const line = text.split("\n"); let changed = 0;
    for (let i = 0; i < line.length; i++) {
      if (/^@/.test(line[i])) continue;
      line[i] = line[i].replace(new RegExp(CLASS_CALL.source, "g"), call => call.replace(/"([A-Za-z][A-Za-z0-9_]*)"/g, (m, id) => {
        if (TABLE.has(id.toLowerCase())) return m;
        const c = heirOf.get(id.toLowerCase()); if (!c || c.length !== 1) return m;
        changed++; return `"${c[0]}"`;
      }));
    }
    return changed ? line.join("\n") : text;
  };
  // the mod's own bugs in scripts nothing runs, named here so that the check does not hide others (none known yet)
  const ALLOW = new Set(["DATA/SUBAI/CTENT_BEHAVIOR_leg.VS|Place|ENV_CProd",                       // the first string of Place(EnvReadString(.settlement, "ENV_CProd"), ...): an environment key, not a class
    "DATA/SUBAI/PLAYER_UNITS_MUTATE.VS|GetPlayerUnits|MutateClass",                                // the mod's own script: a placeholder the mod never replaced
    "DATA/SUBAI/UNIT_CONVERT.VS|Mutate|Villager",                                                  // the mod's own: no class Villager anywhere (HD has Peasant)
    "DATA/AI/LEG_ESH_BuildArmy.VS|Count|TeutonArcher", "DATA/AI/LEG_ESH_BuildGermanArmy.VS|Count|TeutonArcher"]);   // HD's ESH_BuildArmy.vs has the same typo (counts nothing)
  let fixed = 0;
  for (const dir of ["SUBAI", "ITEMSCRIPTS", "ESPECIALIDADES", "RANGOS", "AI"]) {
    const d = find(OUT, `DATA/${dir}`); if (!d) continue;
    for (const f of fs.readdirSync(d).filter(vs)) { const p = path.join(d, f), t = rd(p), u = fixLiterals(t); if (u !== t) { wr(p, u); fixed++; } }
  }
  { const pd = find(OUT, "patches/DATA"); for (const dir of pd ? fs.readdirSync(pd).filter(d => fs.statSync(path.join(pd, d)).isDirectory()) : []) for (const f of fs.readdirSync(path.join(pd, dir)).filter(vs)) { const p = path.join(pd, dir, f), t = rd(p), u = fixLiterals(t); if (u !== t) { wr(p, u); fixed++; } } }
  console.log(`class ids written as text: ${fixed} scripts had the mod's original ids rewritten as the clone's`);
  const stem = n => n.replace(/^LEG_/i, "").replace(/_leg(_l[a-z]+)?(?=\.vs$)/i, "");
  const pristineFor = (dir, name) => { const d = find(PRISTINE, `DATA/${dir}`); if (!d) return null; const w = stem(name).toLowerCase(), h = fs.readdirSync(d).find(x => x.toLowerCase() === w); return h && path.join(d, h); };
  let copies = 0, patchesChecked = 0, strings = 0; const bases = new Set();
  // (a)
  for (const dir of ["SUBAI", "ITEMSCRIPTS", "ESPECIALIDADES", "RANGOS", "AI"]) {
    const d = find(OUT, `DATA/${dir}`); if (!d) continue;
    for (const f of fs.readdirSync(d).filter(vs)) {
      const src = pristineFor(dir, f), t = rd(path.join(d, f));
      if (src) { checkBalance(t, removeStrayBraces(rd(src)).text, `DATA/${dir}/${f}`, problems); copies++; } else checkBalance(t, t, `DATA/${dir}/${f}`, problems);
      checkAbsolute(t, `DATA/${dir}/${f}`, problems);          // absolute: never below 0, ends at 0, no code after a return, whatever the mod's own script does
    }
  }
  // (b) the patches of the game's scripts: SUBAI (the inherited behaviors) and AI
  const pdir = find(OUT, "patches/DATA"), pdirs = pdir ? fs.readdirSync(pdir).filter(d => fs.statSync(path.join(pdir, d)).isDirectory()) : [];
  for (const dir of pdirs) {
    if (!/^(SUBAI|AI)$/i.test(dir)) continue;
    for (const f of fs.readdirSync(path.join(pdir, dir)).filter(vs)) {
      const hdf = find(HDDATA, `${dir}/${f}`), label = `patches/DATA/${dir}/${f}`;
      if (!hdf) { problems.push(`${label}: the game has no such script`); continue; }
      const patch = rd(path.join(pdir, dir, f)), hd = rd(hdf), r = applyPatch(hd, patch);
      for (const e of r.errors) problems.push(`${label}: ${e}`);
      // every block alone: a patch is a sum of balanced pieces
      for (const blk of patch.split(/^@.*$/m).slice(1)) { const n = net(blk); if (n["("] || n["{"] || n["["]) problems.push(`${label}: a block is unbalanced ((${n["("]} {${n["{"]} [${n["["]})`); }
      checkBalance(r.text, hd, label, problems);
      // absolute: whatever the patched script has that the game's own script does not (the line numbers differ, the kind of problem is compared)
      { const a = [], b = [], kind = x => x.replace(/^[^:]*?(\(\d+\))?:/, ""); checkAbsolute(r.text, label, a); checkAbsolute(hd, label, b); const known = new Set(b.map(kind)); problems.push(...a.filter(x => !known.has(kind(x)))); }
      // the mod's script it carries: its body is a copy of the mod's, so the result is the game's plus the mod's
      const mine = pristineFor(dir, f);
      if (mine) { const a = net(r.text), b = net(hd), c = net(rd(mine)); for (const k of ["(", "{", "["]) if (a[k] !== b[k] + c[k] && a[k] !== b[k]) problems.push(`${label}: balance ${k} ${a[k]} is neither the game's ${b[k]} nor the game's plus the mod's ${b[k] + c[k]}`); }
      patchesChecked++;
    }
  }
  // (c) over what is generated: the port's scripts and the patches
  const sources = [];
  for (const dir of ["SUBAI", "ITEMSCRIPTS", "ESPECIALIDADES", "RANGOS", "AI"]) { const d = find(OUT, `DATA/${dir}`); if (d) for (const f of fs.readdirSync(d).filter(vs)) sources.push([`DATA/${dir}/${f}`, rd(path.join(d, f))]); }
  for (const dir of pdirs) for (const f of fs.readdirSync(path.join(pdir, dir)).filter(vs)) sources.push([`patches/DATA/${dir}/${f}`, rd(path.join(pdir, dir, f))]);
  for (const [label, text] of sources) for (const { fn, id } of classStrings(text)) {
    strings++;
    if (!TABLE.has(id.toLowerCase()) && !ALLOW.has(`${label}|${fn}|${id}`)) problems.push(`${label}: ${fn}("${id}") names a class neither the game nor this port has`);
    else if (fn === "GetRandomHeroClass") bases.add(id);
  }
  for (const b of bases) { const w = heroBaseProblem(TABLE, b); if (w) problems.push(`GetRandomHeroClass("${b}"): ${w}`); }
  // every picture a command, class or item names exists in the port or in the game, and no text names an `_leg` file, folder or class that is not there
  { const info = {}; problems.push(...require("./lib/legacy-refs.js").checkRefs(OUT, HD, info)); console.log(`picture references: ${info.checked} checked, ${info.allowed.length} allowed (the mod's own: ${info.allowed.join(", ")})`); }
  // the names the scripts call (a script, an order, a variable that exists nowhere), the entities / images / sounds the classes name, and the exit points of the buildings
  { const N = require("./lib/legacy-names.js").checkNames({ OUT, HD, SDK }), KNOWN_BAD = [/HEROSHIP_MOVE\.VS: an order "heroship_stand_position"/];     // the mod's HeroShip names an order its class never defines (NOTES.md)
    problems.push(...N.errors.filter(e => !KNOWN_BAD.some(re => re.test(e)))); console.log(N.notes.join("\n"));
    const A = require("./lib/legacy-refs.js").checkAssets(OUT, HD); problems.push(...A.problems); console.log(A.notes.join("\n"));
    const X = require("./lib/legacy-exits.js")({ OUT, HD }); problems.push(...X.problems); console.log(X.notes.join("\n"));
    fs.writeFileSync(path.join(ROOT, "raw", "imperivm-legacy-exit-points.txt"), `Buildings of the port whose type-2 points (and .pass) are not those of any building of the game (to try in game):\n${X.unverified.join("\n")}\n`); }
  // the menu skin: exactly what the build writes (6 pictures of Currentlang, 2 of UI/MENU, 13 menu INIs), no text table, nothing else of the interface
  { const have = walk(OUT).map(f => f.toLowerCase()), bad = [];
    for (const f of have) {
      if (/^currentlang\/[^/]+\.loc\.xml$/.test(f) || /^local\//.test(f) && /\.loc\.xml$/.test(f)) bad.push(`${f}: a text table of the whole game must not ship`);
      if (/^data\/interface\//.test(f) && !/^data\/interface\/menu\/[^/]+\.ini$/.test(f)) bad.push(`${f}: only the menu INIs of the skin are approved`);
    }
    const n = re => have.filter(f => re.test(f)).length;
    if (n(/^currentlang\/[^/]+\.bmp$/) !== 6) bad.push("Currentlang: not the 6 pictures of the skin");
    if (n(/^ui\/menu\/[^/]+\.bmp$/) !== 2) bad.push("UI/MENU: not the 2 pictures");
    if (n(/^data\/interface\/menu\/[^/]+\.ini$/) !== 13) bad.push("DATA/INTERFACE/MENU: not the 13 INIs");
    problems.push(...bad); }
  console.log(`script checks: ${copies} copies/rewrites balanced like the mod's, ${patchesChecked} patches applied to the game's script and balanced, ${strings} class strings resolved, hero bases: ${[...bases].sort().join(" ")}`);
  if (problems.length) { console.error(`SCRIPT CHECKS FAILED (${problems.length}):\n  ` + [...new Set(problems)].slice(0, 80).join("\n  ")); process.exit(1); }
}

// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
