// Community Mod v12 (Ferónidas, row 1, GameBanana 730058): the game's eight civilizations as the mod has them, each a civilization of its own next to the game's
// (AGENTS.md, "Civilizations are independent"; decided in #15: a balance mod is ported as copies, the host chooses the set in the room). Rebuild with
//   SDK=<imperivm-resurrected/sdk> node tools/community-mod.js [id ...]     (no id: all eight)
// The mod is the author's own HD package (loose files over the game, no 1.40 merge: its scripts and classes are already HD's). It unpacks
// originals/gamebanana/730058/community_mod_v12.rar in .scratch/cm-src (git-ignored, inside the worktree: nothing is written under originals/), copies the mod's folder
// into .scratch/cm-pristine without what is not the civilizations' (text tables, the packs of the game's languages, hidden.txt, patches/const.ini, see NOTES.md),
// rebuilds ported/community-mod-civs from that and then:
//   1. keeps the mod's version of the game's classes and commands (.scratch/cm-merged) and drops them from the port: they are the game's, and each
//      civilization they belong to is cloned from HD with the mod's changes on top (tools/lib/clone-civs.js); what the mod changed in the base classes
//      (Unit, Hero, Melee, Ranged, Catapult...) is written inside each clone
//   2. the commands of the mod's classes that belong to no civilization are an own file / patches
//   3. the shared tables (items, constants, formations...) only contribute what they ADD, as patches; the edits of the game's own are not ported
//   4. the mod's edits of the game's behavior scripts are copies of their own (_cm, tools/lib/own-scripts.js) that only the clones' classes point to; the
//      class ids a script writes as text are each clone's own
//   5. the mod's AI as CM_* scripts that only run for the mod's civilizations (tools/lib/asvr-ai.js); never started with AIRun when they loop (engine #15)
//   6. names another port (or the game) has with other bytes are given the tag "cm" (tools/lib/ported-patch.js, tagCollisions); the pictures, sounds and entities
//      that rename left broken are put back in tools/lib/community-refs.js (not in tagCollisions)
// The prefix of each civilization is derived from its id by the SDK (first 3 characters: Fga, Fro, Fim...) and there is no index (imperivm-resurrected#37).
// The token "f" is this port's: every id starts with it.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { net, checkBalance, checkAbsolute, removeStrayBraces, applyPatch, classStrings, classTable, heroBaseProblem, CLASS_CALL } = require("./lib/script-checks.js");
const ROOT = path.join(__dirname, "..");
const ID = "community-mod-civs", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const SCRATCH = path.join(ROOT, ".scratch"), SRC = path.join(SCRATCH, "cm-src"), PRISTINE = path.join(SCRATCH, "cm-pristine"), MERGED = path.join(SCRATCH, "cm-merged");
const RAR = path.join(ROOT, "originals", "gamebanana", "730058", "community_mod_v12.rar");
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const TAG = "cm";
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };
const want = process.argv.slice(2);
if (!fs.existsSync(RAR)) { console.error("no " + RAR); process.exit(1); }
// The MAIN checkout is the parent of the git common dir: ROOT may be a worktree under .wt/ (or anywhere), where the ports built only in the main checkout (git-ignored:
// Mediterranevm alpha, MCI, Imperivm Legacy) do not exist. The other ports are read from the main checkout AND from ROOT/ported (ROOT's wins), so that the same commit gives the
// same bytes from either place (found by the review of #46: from .wt/ the build did not see Mediterranevm alpha's UI/CMDBAR/UPGRADES/BSHIELDS.BMP and shipped it at the plain path).
const MAIN = (() => { try { return path.dirname(path.resolve(ROOT, cp.execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim())); } catch { return ROOT; } })();
const firstThere = list => list.find(p => p && fs.existsSync(p));
const SDK = process.env.SDK || firstThere([path.join(ROOT, "..", "imperivm-resurrected", "sdk"), path.join(MAIN, "..", "imperivm-resurrected", "sdk")]);
if (!SDK || !fs.existsSync(path.join(SDK, "tools", "clone-civilization.js"))) { console.error("set SDK to imperivm-resurrected/sdk (branch dev-villoh)"); process.exit(1); }
process.env.SDK = SDK;                                                  // clone-civs.js reads it
// The ports every build compares its names with. Known to exist (some only in the main checkout): the build stops if one is missing, because it would tag other names than from a
// complete place. CM_NO_OTHERS=1 says "build without them" (the result then differs from a complete build).
const REQUIRED_PORTS = ["imperivm-legacy", "mci", "mediterranevm-alpha", "cgwar", "greek-mod-1-8", "greek-civilization-mod"];
const OTHER_PORTS = (() => {
  const m = new Map();
  for (const base of [path.join(MAIN, "ported"), path.join(ROOT, "ported")]) for (const d of fs.existsSync(base) ? fs.readdirSync(base) : []) if (d !== ID && find(path.join(base, d), "DATA/CLASSES")) m.set(d, path.join(base, d));
  const missing = REQUIRED_PORTS.filter(d => !m.has(d));
  if (missing.length && process.env.CM_NO_OTHERS !== "1") { console.error(`missing ports: ${missing.join(", ")}.\nThey are built in the main checkout (${path.join(MAIN, "ported")}) and git-ignored: build them there (see docs/TOOLS.md) or set CM_NO_OTHERS=1 to build without them (the names tagged will differ).`); process.exit(1); }
  return [...m].sort((a, b) => a[0] < b[0] ? -1 : 1).map(x => x[1]);
})();

// the ids start with "f" (the token of this port) and differ in their first three characters: the SDK derives the prefix from them. No index.
// The mod's own classes of a civilization's race that do not start with its letter are renamed <letter><id> in the clone (clone-civs.js). The mod's hero variants
// (BHero4, GHero5a, MHero1c...) start with their civilization's letter. `neutral`: classes of the mod that belong to nobody (the multiplayer peasant of Imperial
// Rome's letter). `asBase`: the mod gave RLiberatus the race ImperialRome (both Romes' arenas hire it): the Republican copy keeps its own race.
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "fgaul", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "frome", asBase: ["RLiberatus"], name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "fimperial", neutral: /^(MPeasantMulti|MUltiOne|MultiOne|MultiOneShip)$/i, name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "fcarthage", name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "fbritain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "fiberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "fegypt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "fgermany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];

// 0. the mod unpacked and copied, in .scratch
fs.rmSync(SRC, { recursive: true, force: true }); fs.rmSync(PRISTINE, { recursive: true, force: true });
{
  fs.mkdirSync(SCRATCH, { recursive: true });
  const tmp = path.join(SCRATCH, "cm-unpack"); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
  const r = cp.spawnSync("bsdtar", ["-xf", RAR, "-C", tmp], { stdio: "inherit" }); if (r.status) process.exit(1);
  fs.renameSync(path.join(tmp, "Community Mod v12", "Community Mod"), SRC); fs.rmSync(tmp, { recursive: true, force: true });
  // What is not the civilizations' (NOTES.md, "Left out"): the game's language packs (Local/*.pak: 182 MB each, the game's own), the text tables of the whole game
  // (Local/<lang>/GAME.LOC.XML, TIPS.XML: they translate the game for everybody), hidden.txt (hides 1932 game files for everyone), patches/data/const.ini (global values),
  // the file list of the author's installer (.fingerprint) and mod.json (extras/ has ours)
  cp.spawnSync("cp", ["-a", SRC, PRISTINE], { stdio: "inherit" });
  for (const f of walk(PRISTINE)) if (/^(\.fingerprint|hidden\.txt|mod\.json|patches\/|Local\/[^/]+\.pak$|Local\/[^/]+\/(GAME\.LOC|TIPS)\.XML$)/i.test(f)) fs.rmSync(path.join(PRISTINE, f));
  // a class file the game does not load: the mod's GHero7a is saved as "GHERO7A.SC .XML" (a space before the extension), which HD's scan for *.sc.xml never opens
  for (const f of walk(PRISTINE).filter(f => /^DATA\/CLASSES\/[^/]+$/i.test(f) && !/\.sc\.xml$/i.test(f))) { console.log(`class file the game would not load, left out: ${f}`); fs.rmSync(path.join(PRISTINE, f)); }
}
// 1. a fresh copy of the pristine port: hard links (every write below removes the file first)
fs.rmSync(OUT, { recursive: true, force: true });
cp.spawnSync("cp", ["-al", PRISTINE, OUT], { stdio: "inherit" });
// the references the mod's own package could not resolve (HD's included), before any rename: the check at the end only stops on new ones
const BASELINE = require("./lib/community-refs.js").baselineOf(PRISTINE, HD);
// files the game does not use (validate-mod.js warns): the Windows thumbnail cache
for (const f of walk(OUT).filter(f => /(^|\/)(thumbs[^/]*\.db|desktop\.ini)$/i.test(f))) fs.rmSync(path.join(OUT, f));
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
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "Community Mod", LABEL: "Community", CIVS, cloneAllOrders: true, want });

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
  if (own.length) wr(path.join(COMMANDS, "COMMUNITYMOD.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
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
    const p = path.join(COMMANDS, "COMMUNITYMOD.XML"), t = fs.existsSync(p) ? rd(p) : "<commands>\n\n</commands>\n";
    wr(p, t.replace(/\s*<\/commands>\s*$/, `\n\n${add.join("\n\n")}\n\n</commands>\n`));
  }
  console.log(`commands of the mod for the game's base classes: ${add.length} added with the port's classes under them as sources (${noHeirs} with no class of this port under them left out)`);
}

// 3c. the mod's versions of the game's behavior scripts (barrack_train.vs, arena_behavior.vs, unit_on_kill.vs...): the clones' classes and commands use copies of
// their own (<name>_cm.vs, and <name>_asv_<id>.vs where the class ids the script writes as text differ per civilization); the game's scripts stay the game's
// (tools/lib/own-scripts.js). The mod has no branch to choose, so nothing is skipped. `inherit`: the methods the clones inherit from the game's classes
// (Unit, Military...) whose script the mod edited are written inside each clone, pointing to the copy.
const CLONES = CIVS.map(c => { const letter = c.id.slice(0, 3).replace(/^./, x => x.toUpperCase()); return { id: c.id, letter, from: [c.baseLetter, ...(c.asBase || []).map(x => x[0])], match: new RegExp(`^(${letter}|${c.id}\\.)`, "i"), modOnly: true, keep: c.neutral }; });
{
  const r = require("./lib/own-scripts.js")({ OUT, HD, tag: TAG, skip: /(?!)/, civs: CLONES, modClasses: path.join(PRISTINE, "DATA", "CLASSES"), inherit: true });
  console.log(`scripts of the mod's own for its civilizations: ${r.copied.length} copied (_${TAG}), ${r.skipped.length} left to the game's (${r.skipped.map(s => s.name).join(", ")})`);
  console.log(`  methods inherited from the game's classes whose script the mod edited: ${r.injected} <method> written inside ${r.touched} classes; behaviors inherited and left the game's: ${(r.behaviorsLeft || []).join("; ") || "none"}`);
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-own-scripts.txt"), r.copied.map(c => `${c.from} -> ${c.to}  (${c.users.slice(0, 4).join(", ")}${c.users.length > 4 ? ", ..." : ""})`).join("\n") + "\n\nnot copied:\n" + r.skipped.map(s => `${s.name}: ${s.why}`).join("\n") + "\n\nbehaviors inherited from the game's classes and left the game's:\n" + (r.behaviorsLeft || []).join("\n") + "\n");
}

// 3d. The mod wrote its civilization tests as `.race == Gaul` (`owner.AsUnit.race == Germany`): for a clone the race is the clone's own, so the test is false (a
// behavior script that returns on it is restarted for ever). Each test in the mod's scripts also accepts the clone: `(X.race == Gaul || Mod_TrueRace(X) == Fgaul)`.
// `GetPlayerRace` is left alone (it returns the base for a clone, as the game's scripts expect).
const BASE_CONST = { Gaul: "Fgaul", RepublicanRome: "Frome", ImperialRome: "Fimperial", Carthage: "Fcarthage", Britain: "Fbritain", Iberia: "Fiberia", Egypt: "Fegypt", Germany: "Fgermany" };
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
const ownTests = (text, obj) => heirTests(raceTests(text, obj));
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
  for (const name of ["arena_behavior.vs", "outpost_behavior.vs", "village_behavior_givefood.vs"]) {
    const r = require("./lib/asvr-inline.js")({ OUT, HD: HDDATA, SRC: path.join(PRISTINE, "DATA", "SUBAI"), name, civs, mapClasses: map, transform: (t, c) => ownTests(t, "This").replace(/"([A-Z])Lider"/g, (m, l) => KNOWN.has(`${l}lider`) ? m : `"${c.letter}Lider"`) });
    console.log(`  ${name}: ${r ? `a block for each of the ${r.civs} civilizations inside the game's script (declared at the top: ${r.declared.join(" ") || "none"})` : "not in the mod or the game"}`);
  }
}

// 3f. The AI (tools/lib/asvr-ai.js). What the mod's AI folder changes against HD is small: the names of the researches and charms the AI buys (the mod's Hunting
// Festival instead of Gambling, its Charms of Seth/Thoth/Ra/Isis), the Britons' research order (ESH_NeedTech), the Gaul, British and Imperial Roman tactics, the class the
// outpost counter looks for (TS_AttackAtWill: CMacemen) and the picks of GetTacticScript (the first tactic of each civilization every time, instead of one of two or three).
// The loops (ES_Stronghold, ES_Village) are the game's, unedited by the mod: they are copied as well so that the copies start the mod's helpers (never AIRun: engine #15).
// Not ported: AIOSendSquad (the engine calls it by name with no player; the mod changes a 10-minute wait to 1 minute).
// The source is the game's AI folder with the mod's scripts over it (.scratch/cm-ai), so that the unedited tactics can be copied too.
{
  const AI_SRC = path.join(SCRATCH, "cm-ai"); fs.rmSync(AI_SRC, { recursive: true, force: true }); fs.mkdirSync(AI_SRC, { recursive: true });
  for (const f of fs.readdirSync(find(HDDATA, "AI"))) if (fs.statSync(path.join(find(HDDATA, "AI"), f)).isFile()) fs.copyFileSync(path.join(find(HDDATA, "AI"), f), path.join(AI_SRC, f));
  for (const f of fs.readdirSync(find(PRISTINE, "DATA/AI"))) { const hit = fs.readdirSync(AI_SRC).find(x => x.toLowerCase() === f.toLowerCase()); if (hit) fs.rmSync(path.join(AI_SRC, hit)); fs.copyFileSync(path.join(find(PRISTINE, "DATA/AI"), f), path.join(AI_SRC, f)); }
  const ids = {};                                                      // the mod's classes the clone step renamed: <letter of the base><id>
  for (const c of CIVS) { const j = readJson(path.join(OUT, "civs", `${c.id}.json`)); for (const k of Object.keys(j.alias.classes)) if (k[0] === c.baseLetter && /^[A-Z]/.test(k.slice(1)) && fs.existsSync(path.join(find(PRISTINE, "DATA/CLASSES"), `${k.slice(1).toUpperCase()}.SC.XML`)) && !hdClass.has(k.slice(1).toLowerCase()) && !hdClass.has(k.toLowerCase())) ids[k.slice(1)] = k; }
  const r = require("./lib/asvr-ai.js")({ OUT, HD: HDDATA, SRC: AI_SRC, prefix: "CM_", ids,
    civs: CIVS.map(c => c.id[0].toUpperCase() + c.id.slice(1)),
    tactics: { Fgaul: "TS_GaulTactic", Fiberia: "TS_IberianTactic", Fgermany: "TS_GermanyTactic", Fegypt: "TS_EgyptTactic", Fbritain: "TS_BritishTactic", Fcarthage: "TS_CarthageTactic", Frome: "TS_RRomeTactic", Fimperial: "TS_MRomeTactic" },
    loops: ["ES_Stronghold", "ES_Village"], helpers: ["ESH_Market", "ESH_NeedTech", "ESH_ResearchTraining"], monitors: [], inline: [] });
  console.log(`AI: ${r.forks.length} scripts as CM_* copies (${r.forks.join(", ")}); tactics ${r.tactics.join(", ")}; AI variables declared: ${r.vars.join(", ") || "none"}${r.problems.length ? "\n  to check: " + r.problems.join("; ") : ""}`);
  // asvr-ai.js also writes patches/DATA/AI/MAIN.VS: it starts the six monitors the game starts, for the eight civilizations, and returns. With no monitor of the mod's (the mod does not
  // edit SquadMonitor...) that is the game's own Main.vs repeated, an inert patch of a script every AI runs, and it would stop every AI if it ever failed to compile: not shipped
  fs.rmSync(path.join(OUT, "patches", "DATA", "AI", "MAIN.VS"), { force: true });
  // what the mod's AI folder left at the game's path is now copies or left out
  for (const f of fs.readdirSync(find(OUT, "DATA/AI")).filter(f => !/^CM_/i.test(f))) fs.rmSync(path.join(find(OUT, "DATA/AI"), f), { recursive: true, force: true });
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
  // the patch of the items has accents (the mod's texts are Spanish): UTF-8, as the validator wants
  { const ip = path.join(OUT, "patches", "DATA", "ITEMS.XML"); if (fs.existsSync(ip)) { const b = fs.readFileSync(ip); try { new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { fs.rmSync(ip); fs.writeFileSync(ip, Buffer.from(b.toString("latin1"), "utf8")); } } }
  console.log(`patches: ${patches.join("; ")}`);
}

// The game modes (the mod's "[CM] Competitive Conquest" and "[CM] Competitive Tempo", the renumbered score and time limits, the changed Elimination) apply to every player of a
// match, not to a civilization: not shipped, listed in NOTES.md for the rules pack. Same for the game scripts' folder as a whole.
for (const d of ["DATA/GAMESCRIPTS", "DATA/BONUSSCRIPTS"]) { const p = find(OUT, d); if (p) fs.rmSync(p, { recursive: true, force: true }); }
fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
// Scripts the mod added that only its game modes name (TOWNHALL_NEUTRALARMY.VS: the neutral army of the Competitive modes) go with the modes
{
  const gone = [];
  for (const f of walk(OUT).filter(f => /^DATA\/SUBAI\/(TOWNHALL_NEUTRALARMY)\.VS$/i.test(f))) { fs.rmSync(path.join(OUT, f)); gone.push(f); }
  console.log(`scripts only the game modes used, left out: ${gone.join(", ") || "none"}`);
}
// Neutral decoration and outlines of map objects (bushes, dead trees, the shrine's and Stonehenge's outline): the mod's version of the game's own files changes every map for
// everybody and no class of a civilization names them: not shipped (NOTES.md, "Left out because it is global")
{
  const gone = [];
  for (const f of walk(OUT).filter(f => /^(MAPOBJECTS|OUTLINES)\//i.test(f))) { fs.rmSync(path.join(OUT, f)); gone.push(f); }
  console.log(`neutral map objects and outlines left out: ${gone.length}`);
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-neutral-art.txt"), gone.join("\n") + "\n");
}
// The menu skin (AGENTS.md: the one cosmetic exception). Its art stays at the game's paths (UI/INTERFACE/MenuMod*.bmp, UI/MENU/*.bmp, Currentlang/ConquestDefault.bmp...); the INIs
// that PLACE that art become patches of only the keys they changed (tools/lib/menu-skin.js). The INIs that only move buttons and chat boxes (no art) are left out.
{
  const MENU = find(OUT, "DATA/INTERFACE/MENU"), ART = /^(MAINMENU|MENUBACK|TEMPLATE|CONQUESTGAME|CONQUESTMENU|MPGAMEMENU|MPMENU|PREADVENTUREMENU|PROFILE)\.INI$/i, out = [];
  for (const f of MENU ? fs.readdirSync(MENU) : []) if (!ART.test(f)) { fs.rmSync(path.join(MENU, f)); out.push(f); }
  // skinToPatches carries `Key = value`; the lists of bare names (`[MainMenu Objects]` gets the mod's `MenuSash`) are `+Line` / `-Line` in an INI patch (sdk/patches.md): added here
  const bare = t => { const m = new Map(); let sec = ""; for (const l of t.replace(/\r/g, "").split("\n")) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; if (!m.has(sec)) m.set(sec, []); continue; } const x = l.trim(); if (sec && x && !x.startsWith(";") && !x.includes("=")) m.get(sec).push(x); } return m; };
  const mine = new Map(MENU ? fs.readdirSync(MENU).map(f => [f.toLowerCase(), rd(path.join(MENU, f))]) : []);
  const n = require("./lib/menu-skin.js").skinToPatches({ OUT, HD }), lists = [];
  const PD = find(OUT, "patches/DATA/INTERFACE/MENU");
  for (const f of PD ? fs.readdirSync(PD) : []) {
    const hp = find(HD, `DATA/INTERFACE/MENU/${f}`), A = bare(rd(hp)), B = bare(mine.get(f.toLowerCase()) || ""), ops = new Map();
    for (const [sec, ls] of B) { const have = new Set(A.get(sec) || []); for (const l of ls) if (!have.has(l)) (ops.get(sec) || ops.set(sec, []).get(sec)).push("+" + l); }
    for (const [sec, ls] of A) { const keep = new Set(B.get(sec) || []); if (B.has(sec)) for (const l of ls) if (!keep.has(l)) (ops.get(sec) || ops.set(sec, []).get(sec)).push("-" + l); }
    if (!ops.size) continue;
    let t = rd(path.join(PD, f)).replace(/\s+$/, "");
    for (const [sec, add] of ops) { const head = `[${sec}]`, i = t.indexOf(head); if (i < 0) t += `\r\n${head}\r\n${add.join("\r\n")}`; else { const j = t.indexOf("\n[", i + 1); const end = j < 0 ? t.length : j; t = t.slice(0, end).replace(/\s+$/, "") + `\r\n${add.join("\r\n")}` + t.slice(end); } lists.push(`${f} ${head} ${add.join(" ")}`); }
    wr(path.join(PD, f), t + "\r\n");
  }
  console.log(`menu skin: INIs with no art left out: ${out.join(", ")}; ${n} INIs became patches of the keys they changed; list lines (+/-): ${lists.join("; ") || "none"}`);
}
// The voices (Local/<language>/VOICES/<UNIT>/N.WAV): the mod re-recorded them at the game's own paths, which would change the game's civilizations too. For each voice entity a
// clone's class names, the mod's folder becomes <UNIT>_cm and the entity a copy of its own (Voice<Unit>_cm.xml) that the clones' classes point to (as Mediterranevm did). Only
// the folders the mod has in all three languages: a clone cannot fall back to the game's English/Spanish/Italian file for a language the mod did not record.
{
  const LOC = find(OUT, "Local"), HDSE = find(HDDATA, "SOUND ENTITIES"), MYSE = find(OUT, "DATA/SOUND ENTITIES"), SC = find(OUT, "DATA/CLASSES");
  const langs = LOC ? fs.readdirSync(LOC, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name) : [];
  const V = l => find(path.join(LOC, l), "VOICES");
  const common = langs.length ? [...new Set(fs.readdirSync(V(langs[0])).map(x => x.toLowerCase()))].filter(d => langs.every(l => V(l) && fs.readdirSync(V(l)).some(x => x.toLowerCase() === d))) : [];
  const ci = (d, n) => fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
  const used = new Map();                                              // entity file name -> the class files that name it
  for (const f of walk(SC).filter(f => /\.sc\.xml$/i.test(f))) for (const m of rd(path.join(SC, f)).matchAll(/data\/sound entities\/(Voice\w+\.xml)/gi)) { const k = m[1].toLowerCase(); (used.get(k) || used.set(k, []).get(k)).push(f); }
  const done = [], skipped = []; let files = 0;
  for (const [ent] of used) {
    const mine = MYSE && ci(MYSE, ent), game = HDSE && ci(HDSE, ent), text = mine ? rd(path.join(MYSE, mine)) : game ? rd(path.join(HDSE, game)) : null;
    const dir = text && (text.match(/CurrentLang\/voices\/([^"\/]+)\//i) || [])[1];
    if (!dir || !common.includes(dir.toLowerCase())) { if (dir && langs.some(l => V(l) && ci(V(l), dir))) skipped.push(dir); continue; }
    const wanted = [...text.matchAll(/CurrentLang\/voices\/[^"\/]+\/([^"]+)"/gi)].map(m => m[1]);
    if (!langs.every(l => wanted.every(w => ci(path.join(V(l), ci(V(l), dir)), w)))) { skipped.push(`${dir} (a file the entity names is missing in a language)`); continue; }
    for (const l of langs) { const from = path.join(V(l), ci(V(l), dir)), to = path.join(V(l), `${ci(V(l), dir)}_${TAG}`); fs.mkdirSync(to, { recursive: true }); for (const f of fs.readdirSync(from)) { fs.copyFileSync(path.join(from, f), path.join(to, f)); files++; } }
    const nent = (mine || game).replace(/\.xml$/i, `_${TAG}.xml`);
    wr(path.join(MYSE || path.join(OUT, "DATA", "SOUND ENTITIES"), nent), text.replace(new RegExp(`(CurrentLang/voices/)${dir}/`, "gi"), `$1${dir}_${TAG}/`));
    for (const f of new Set(used.get(ent))) { const p = path.join(SC, f), s = rd(p), t = s.replace(new RegExp(`data/sound entities/${ent}`, "gi"), `data/sound entities/${nent}`); if (t !== s) wr(p, t); }
    done.push(dir);
  }
  // what stays at the game's paths goes: the mod's voice entities and every folder it recorded (the ones copied are <UNIT>_cm now)
  const SE = find(OUT, "DATA/SOUND ENTITIES");
  for (const f of SE ? fs.readdirSync(SE).filter(f => /^voice/i.test(f) && !new RegExp(`_${TAG}\\.xml$`, "i").test(f)) : []) fs.rmSync(path.join(SE, f));
  const dropped = new Set();
  for (const l of langs) for (const d of fs.readdirSync(V(l)).filter(d => !new RegExp(`_${TAG}$`, "i").test(d))) { fs.rmSync(path.join(V(l), d), { recursive: true }); dropped.add(d); }
  console.log(`voices: ${done.length} folders copied as <UNIT>_${TAG} in ${langs.length} languages (${files} files): ${done.join(" ")}; not carried: ${[...dropped].filter(d => !done.some(x => x.toLowerCase() === d.toLowerCase())).length} folders (English only, or no clone names their entity)`);
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-voices.txt"), `carried: ${done.join(" ")}\nnot carried: ${[...dropped].filter(d => !done.some(x => x.toLowerCase() === d.toLowerCase())).join(" ")}\nentity named by a clone but folder not in all languages: ${skipped.join(" ")}\n`);
}

// The mod's edits of the scripts of the game's own items (God's Gift...) are global: the items' edits are not ported (above), so the scripts that only they used go too
{
  const hdIS = find(HDDATA, "ITEMSCRIPTS"), mineIS = find(OUT, "DATA/ITEMSCRIPTS"), ip = path.join(OUT, "patches", "DATA", "ITEMS.XML"), used = fs.existsSync(ip) ? rd(ip).toLowerCase() : "";
  const hdNames = new Set(fs.readdirSync(hdIS).map(f => f.toLowerCase()));
  for (const f of mineIS ? fs.readdirSync(mineIS) : []) if (hdNames.has(f.toLowerCase()) && !used.includes(f.toLowerCase())) { fs.rmSync(path.join(mineIS, f)); console.log(`item script of a game item the mod edited, not ported: ${f}`); }
}

// The random map packs (Packs/randommap.BFHP, Packs/RandomMapSettlements.bfhp) are the game's own at its own path and the mod's have other bytes: they would change every random map
// for every player (the game's Packs/ folder is not in originals/game-data, so tagCollisions would not see it). Not shipped (NOTES.md, "Left out because it is global").
{ const p = find(OUT, "Packs"); if (p) { fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-packs.txt"), walk(p).map(f => "Packs/" + f).join("\n") + "\n"); fs.rmSync(p, { recursive: true, force: true }); console.log("Packs/ (the game's random map packs with the mod's bytes) left out"); } }
// pictures of adventures, scenarios and conquests whose map is the game's own (identical bytes, so not carried): the thumbnail alone is of no use
{
  let n = 0;
  for (const top of ["Adventures", "Scenarios", "Conquests"]) { const base = find(OUT, top); if (!base) continue;
    for (const f of walk(base)) { if (!/\.(bmp)$/i.test(f)) continue; const d = path.dirname(path.join(base, f)), stem = path.basename(f, path.extname(f)).toLowerCase(); if (!fs.readdirSync(d).some(x => /\.bfhp$/i.test(x) && path.basename(x, path.extname(x)).toLowerCase() === stem)) { fs.rmSync(path.join(base, f)); n++; } } }
  console.log(`thumbnails of the game's own maps left out: ${n}`);
}
// 5. files at a game path with other bytes
{
  const hdFile = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  const left = [];
  // the game's own files the mod edited in place that are not a civilization's: left out (AI, game modes, interface lists, random map, tuning)
  const GONE = /^DATA\/(AI\/|GAMESCRIPTS\/|INTERFACE\/|RANDOMMAP\/PLACEOBJECTS\.XML|TUTORIALS\/|BONUSSCRIPTS\/|BONUS\.XML|CONST\.INI|COUNTERUNITS\.XML|CURSORS\.XML|PATHFINDERINIT\.VS|RANDOM_MAP\.OBJ\.XML|SCDEBUG\.XML|SETTINGS\.XML|TERRAINS\.XML|VXACTION\.XML|VXNOTIFICATIONS\.XML|ZBINS\.XML|SUBAI\/SCDOC\.XML)/i;
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
      if (/^DATA\/RANDOMMAP\//i.test(f)) continue;                                   // the random map templates: kept, renamed below (NOTES.md)
      if (!texts.some(([tf, t]) => tf.toLowerCase() !== f.toLowerCase() && (t.includes(base) || (/\.(bmp|wav|mp3)$/i.test(base) && t.includes(stem))))) { fs.rmSync(path.join(OUT, f)); left.push(f + " (nothing uses it)"); gone++; }
    }
    if (!gone) break;
  }
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-left-out.txt"), left.join("\n") + "\n");
  console.log(`game files with other bytes: ${left.length} left out (raw/community-mod-civs-left-out.txt)`);
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
  const ports = OTHER_PORTS;
  // paths that another port of the same batch ships with other bytes and that no port in ported/ has yet: a placeholder at each, so that tagCollisions gives this port's the tag too (found with
  // the built Caesar Mod port, .wt/caesar-mod-civs, 2026-11-01: the only art file in common outside the random map pictures Caesar drops)
  const RESERVED = path.join(SCRATCH, "cm-reserved"); fs.rmSync(RESERVED, { recursive: true, force: true });
  for (const f of ["UI/CMDBAR/ACTIONS/HOVER.BMP"]) wr(path.join(RESERVED, f), "reserved by tools/community-mod.js");
  // the conquest first (tools/lib/conquests.js): its .bfhp, picture, folder and both data= are renamed together; tagCollisions below would rename the files one by one and leave it broken
  { const r = require("./lib/conquests.js")({ OUT, others: [G, ...ports].filter(fs.existsSync), tag: TAG, label: "Community" }); console.log(`conquests: ${r.done.map(d => `${d.from} -> ${d.to} (${d.folder})`).join("; ") || "none renamed"}${r.problems.length ? "; problems: " + r.problems.join("; ") : ""}`); }
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: TAG, others: [...ports, RESERVED, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: "Community", gameDirs: [path.join(G, "paks")], skip: /^(currentlang|ui\/interface|ui\/menu|data\/interface\/menu)\// });
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
// and now asks for a file that does not exist (the blue square where an icon should be). The pictures, sounds and entities that do not resolve go back to the mod's own name
// (tools/lib/community-refs.js, not tagCollisions); the sound entities the port renamed are named by the clones' classes. The check at the end of the build stops on any that is
// still missing and that the mod's own package resolved: the references that were already broken in the rar (and HD's own: WBreast, Anibal) are left alone and counted.
const REFS = require("./lib/community-refs.js");
{ const fixed = REFS.fixRefs({ OUT, HD, TAG }); console.log(`references put back to the mod's own name or to the renamed sound entity: ${fixed.length}${fixed.length ? "\n  " + fixed.slice(0, 40).join("\n  ") + (fixed.length > 40 ? `\n  ... (${fixed.length - 40} more)` : "") : ""}`); }

// Two files whose names differ only by case in one folder cannot live together on Windows or in a zip (found by the review of #46: research_cm.vs / RESEARCH_cm.VS, catapult_attack,
// catapult_autofire). They come from own-scripts.js (the copy the clones name, lower case) and from tagCollisions (the mod's own script at the game's path, renamed): the same
// name by case. Same bytes: the one with the lower-case extension stays (the clones name it). Other bytes would be said and the copy the clones name kept (the build stops: not seen).
{
  const dups = []; let kept = 0;
  const dirs = new Set(walk(OUT).map(f => path.dirname(f)));
  for (const d of dirs) {
    const full = path.join(OUT, d), by = new Map();
    for (const e of fs.readdirSync(full, { withFileTypes: true })) if (e.isFile()) { const k = e.name.toLowerCase(); (by.get(k) || by.set(k, []).get(k)).push(e.name); }
    for (const names of by.values()) {
      if (names.length < 2) continue;
      names.sort((a, b) => (/\.[a-z0-9]+$/.test(a) ? 0 : 1) - (/\.[a-z0-9]+$/.test(b) ? 0 : 1) || (a < b ? -1 : 1));
      for (const n of names.slice(1)) {
        if (md5(path.join(full, n)) !== md5(path.join(full, names[0]))) { console.error(`${d}/${n} and ${names[0]} differ only by case AND have other bytes: decide which one the clones name`); process.exit(1); }
        fs.rmSync(path.join(full, n)); dups.push(`${d || "."}/${n} (same bytes as ${names[0]})`);
      }
      kept++;
    }
  }
  console.log(`names that differed only by case: ${kept} pairs, kept the lower-case extension: ${dups.join("; ") || "none"}`);
}

// 7. hand fixes of this mod (extras/community-mod-civs/): the final files and mod.json with the credits
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }
// The mod's scripts that nothing of the port names any more (the clones use the copies Name_<id>.vs the clone step made: TempleOfThorChamber.vs -> _fbritain), and that are not the
// game's: the originals carry the mod's own class ids (BHero...) and would run for nobody. They go (list in raw/). The game's behaviors are never touched.
// Then a behavior script of the mod with no signature line (the game's compiler reads the first line as `// <return>, <parameters>`) gets `// void, Obj This`, as every behavior has.
{
  const SUB = find(OUT, "DATA/SUBAI"), hdSub = new Set(fs.readdirSync(find(HDDATA, "SUBAI")).map(f => f.toLowerCase()));
  const texts = walk(OUT).filter(f => /\.(xml|ini|vs|txt|json)$/i.test(f) && !/^(loc|local)\//i.test(f)).map(f => [f, rd(path.join(OUT, f)).toLowerCase()]);
  const orphans = [], signed = [];
  for (const f of fs.readdirSync(SUB).filter(f => /\.vs$/i.test(f))) {
    const lo = f.toLowerCase(); if (hdSub.has(lo)) continue;
    if (!texts.some(([tf, t]) => path.basename(tf).toLowerCase() !== lo && t.includes(lo))) { fs.rmSync(path.join(SUB, f)); orphans.push(f); continue; }
    const t = rd(path.join(SUB, f));
    if (!/^\s*\/\//.test(t) && texts.some(([tf, tx]) => /^data\/classes\//i.test(tf) && new RegExp(`<behavior\\b[^>]*${lo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(tx))) { wr(path.join(SUB, f), `// void, Obj This\r\n${t}`); signed.push(f); }
  }
  // the item scripts: named by an item of patches/DATA/ITEMS.XML (kill_script="file://data/ItemScripts/x.vs") or by another script. The ones of the game's items the mod edited (not ported)
  // and their helpers are named by nobody once those items are out (BELT OF SNAKES_cm.VS, FEATHER AMULET_cm.VS, ...: renamed by tagCollisions, dead)
  { const IS = find(OUT, "DATA/ITEMSCRIPTS"), ip = path.join(OUT, "patches", "DATA", "ITEMS.XML"), itemText = fs.existsSync(ip) ? rd(ip).toLowerCase() : "";
    for (const f of IS ? fs.readdirSync(IS).filter(f => /\.vs$/i.test(f)) : []) { const lo = f.toLowerCase(); if (!itemText.includes(lo) && !texts.some(([tf, t]) => /\.vs$/i.test(tf) && path.basename(tf).toLowerCase() !== lo && t.includes(lo))) { fs.rmSync(path.join(IS, f)); orphans.push("ITEMSCRIPTS/" + f); } } }
  console.log(`scripts of the mod that nothing names, left out: ${orphans.length} (${orphans.join(" ")}); behaviors given the signature line: ${signed.join(" ") || "none"}`);
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-unnamed-scripts.txt"), orphans.join("\n") + "\n");
}
// Germany's queue cap: the mod's verify_trainex.vs and trainex_onaddremove.vs read QueuedBuild/TTeutonRider (and Archer), while train_ex.vs and trainex_onaddremove.vs write
// QueuedBuild/<class of the order's parameter>, which for the copy is FgeTeutonRider: the keys never met and the queued riders did not count (found by the review of #46). Only the
// two copies of Germany read the Teuton keys; the other civilizations' orders never take that branch. The mod's own "Build//TTeutonRider" (a double slash nothing writes) is left as it is.
{
  const SUB = find(OUT, "DATA/SUBAI"); let n = 0;
  for (const f of ["verify_trainex_cm_fgermany.vs", "trainex_onaddremove_cm_fgermany.vs"]) {
    const p = find(SUB, f); if (!p) { console.error(`${f}: not found (queue keys)`); process.exit(1); }
    const t = rd(p), u = t.replace(/"QueuedBuild\/TTeutonRider"/g, '"QueuedBuild/FgeTeutonRider"').replace(/"QueuedBuild\/TTeutonArcher"/g, '"QueuedBuild/FgeTeutonArcher"');
    if (u === t) { console.error(`${f}: the queue keys to fix are not there`); process.exit(1); }
    wr(p, u); n++;
  }
  console.log(`Germany's queue keys now match what train_ex writes (QueuedBuild/FgeTeutonRider, FgeTeutonArcher): ${n} scripts`);
}
// The outposts of the copies garrison the GAME's classes: clone-civs.js leaves `defender_cls_N="BShieldBearer"` as the mod wrote it, and the engine spawns the class it is told by name, so a
// copy's outpost would raise the game's defender (HD stats), and the loyalty block of unit_on_kill_cm_<id>.vs, which names the copy's classes (FbrShieldBearer -> FbrOutpost), would never
// see them (found by the review of #46). Each defender_cls of a copy's class names the copy's own class (alias.classes of its civs/<id>.json). The loyalty block also needs a building:
// the mod took one for granted (b invalid -> EnvReadInt(b.AsBuilding...)), so `if(!b.IsValid()) return;` goes after the search.
{
  const SC = find(OUT, "DATA/CLASSES"); let n = 0, files = 0;
  for (const c of CIVS) {
    const letter = c.id.slice(0, 3).replace(/^./, x => x.toUpperCase()), map = new Map(Object.entries(readJson(path.join(OUT, "civs", `${c.id}.json`)).alias.classes).map(([k, v]) => [k.toLowerCase(), v]));
    for (const f of fs.readdirSync(SC).filter(f => /\.sc\.xml$/i.test(f) && f.toLowerCase().startsWith(letter.toLowerCase()))) {
      const p = path.join(SC, f), t = rd(p), u = t.replace(/(\bdefender_cls_\d+\s*=\s*")([^"]+)"/g, (m, a, v) => map.has(v.toLowerCase()) ? (n++, `${a}${map.get(v.toLowerCase())}"`) : m);
      if (u !== t) wr(p, u);
    }
  }
  const SUB = find(OUT, "DATA/SUBAI");
  for (const f of fs.readdirSync(SUB).filter(f => /^unit_on_kill_cm.*\.vs$/i.test(f))) {
    const p = path.join(SUB, f), t = rd(p), u = t.replace(/(\r?\n)([ \t]*)(j = EnvReadInt\(b\.AsBuilding)/, "$1$2if(!b.IsValid()) return;$1$2$3");
    if (u === t) { console.error(`${f}: the loyalty block to guard is not there`); process.exit(1); }
    wr(p, u); files++;
  }
  console.log(`outposts of the copies: ${n} defender_cls now name the copy's own class; ${files} unit_on_kill copies guard the loyalty block against no building`);
}
// the patches of the menu skin: a comment at the end of a line is not stripped by the engine's patch (validate-mod.js); the value without it is what the game reads
{
  const dir = find(OUT, "patches/DATA/INTERFACE/MENU"); let n = 0;
  for (const f of dir ? fs.readdirSync(dir) : []) { const p = path.join(dir, f), s = rd(p), t = s.replace(/^(\s*[^;=\s\[][^=\r\n]*=[^;\r\n]*?)[ \t]+;[^\r\n]*$/gm, "$1"); if (t !== s) { wr(p, t); n++; } }
  console.log(`menu skin patches: end-of-line comments cut in ${n} files`);
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
  const stem = v => path.basename(v).toLowerCase().replace(/\.vs$/, "").replace(/_cm(_f[a-z]+)?$/, "");
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
      if (/_cm(_f[a-z]+)?\.vs/i.test(left[i])) { t = t.replace(left[i], ""); over--; removed++; (twins["(over 8)"] ||= new Set()).add(`${id}: ${left[i].match(/script="([^"]+)"/)[1]}`); }
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
  // the mod's own bugs, in scripts nothing runs or that the game's script has too: named here so that the check does not hide others
  // false positives: the game's own scripts build the name too (HD's GGUARDPOST_SENTRIES.VS: Place(sRace+"GuardPostSentry"), TTENT_BEHAVIOR.VS: Place(EnvReadString(.settlement, "ENV_TProd")...)): the literal is a suffix / a key, not a class
  const ALLOW = new Set(["DATA/SUBAI/GGuardPost_Sentries_cm.vs|Place|GuardPostSentry", "DATA/SUBAI/ttent_behavior_cm.vs|Place|ENV_TProd", "DATA/SUBAI/ttent_behavior_cm_fgermany.vs|Place|ENV_TProd"]);
  let fixed = 0;
  for (const dir of ["SUBAI", "ITEMSCRIPTS", "ESPECIALIDADES", "RANGOS", "AI"]) {
    const d = find(OUT, `DATA/${dir}`); if (!d) continue;
    for (const f of fs.readdirSync(d).filter(vs)) { const p = path.join(d, f), t = rd(p), u = fixLiterals(t); if (u !== t) { wr(p, u); fixed++; } }
  }
  { const pd = find(OUT, "patches/DATA"); for (const dir of pd ? fs.readdirSync(pd).filter(d => fs.statSync(path.join(pd, d)).isDirectory()) : []) for (const f of fs.readdirSync(path.join(pd, dir)).filter(vs)) { const p = path.join(pd, dir, f), t = rd(p), u = fixLiterals(t); if (u !== t) { wr(p, u); fixed++; } } }
  console.log(`class ids written as text: ${fixed} scripts had the mod's original ids rewritten as the clone's`);
  const stem = n => n.replace(/^CM_/i, "").replace(/_cm(_f[a-z]+)?(?=\.vs$)/i, "");
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
  // every picture, sound entity, sound file and entity a text names exists in the port or in the game (or was already broken in the rar), and no text names a `_cm` file, folder or class that is not there
  { const r = REFS.checkRefs({ OUT, HD, TAG, baseline: BASELINE }); problems.push(...r.problems); console.log(`references: ${r.checked} checked, ${r.allowed.length} unresolved in the mod's own package too (left alone)`); fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-refs-unresolved.txt"), r.allowed.sort().join("\n") + "\n"); }
  // the menu skin: what was approved (art at the game's paths, INIs as patches) and nothing that would change the game for everybody
  { const have = walk(OUT).map(f => f.toLowerCase()), bad = [];
    for (const f of have) {
      if (/^currentlang\/[^/]+\.loc\.xml$/.test(f) || /^local\//.test(f) && /\.(loc\.xml|pak)$|tips\.xml$/.test(f)) bad.push(`${f}: a text table or pak of the whole game must not ship`);
      if (/^data\/interface\//.test(f)) bad.push(`${f}: a menu INI at the game's path (it goes as a patch)`);
    }
    problems.push(...bad); }
  // the names the scripts use (tools/lib/community-names.js, from the Greek chain's): an identifier the game does not know stops THAT script when it first runs. The problems the mod's own
  // scripts already had in the rar are listed in raw/community-mod-civs-names.txt and do not stop the build; a script of ours with a new one does (after the first run: NAMES_BASELINE)
  { const r = require("./lib/community-names.js").checkNames({ OUT, HD: path.join(ROOT, "originals", "game-data"), SDK }); fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-names.txt"), r.errors.sort().join("\n") + "\n"); console.log(r.notes.join("; ")); // the checker strips a // comment before it reads the strings, so the mod's own typo "Build//TTeutonRider" (a double slash, left alone on purpose) reads as the name Build: known, in both Teuton copies
    problems.push(...r.errors.filter(e => !/^DATA\/SUBAI\/verify_trainex_cm(_fgermany)?\.vs: "Build" \(1x\)/.test(e))); }
  console.log(`script checks: ${copies} copies/rewrites balanced like the mod's, ${patchesChecked} patches applied to the game's script and balanced, ${strings} class strings resolved, hero bases: ${[...bases].sort().join(" ")}`);
  if (problems.length) { console.error(`SCRIPT CHECKS FAILED (${problems.length}):\n  ` + [...new Set(problems)].slice(0, 80).join("\n  ")); process.exit(1); }
}

// The maps of ours that need the mod (mod.json requires) or name it: which of the classes they place the copies renamed. A civilization's class (GArcher) is cloned for every civilization
// and the map keeps placing the game's own; the mod's own classes (the 36 hero variants and the second spearmen/swordsmen) exist only as the copies of the civilizations (FgaHero5a...). Rewriting
// the maps is community-mods#8; this only lists (raw/community-mod-civs-maps.txt).
{
  const hpfs = require("./hpfs.js"), alias = new Map(), fresh = new Map();
  const mod = new Set(walk(find(PRISTINE, "DATA/CLASSES")).filter(f => /\.sc\.xml$/i.test(f)).map(f => (classOf(rd(path.join(find(PRISTINE, "DATA/CLASSES"), f))) || "").toLowerCase()));
  for (const c of CIVS) for (const [k, v] of Object.entries(readJson(path.join(OUT, "civs", `${c.id}.json`)).alias.classes)) { alias.set(k.toLowerCase(), v); if (mod.has(k.toLowerCase()) && !hdClass.has(k.toLowerCase())) fresh.set(k.toLowerCase(), [k, v]); }
  const lines = [`# maps of ported/ whose mod.json names community-mod; "added" = classes the mod added (HD has no such class, so a map that places one needs the copy), "cloned" = how many of the game's civilization classes it places (they keep working, as the game's own)`, ""];
  const mods = fs.readdirSync(path.join(ROOT, "ported")).filter(d => { try { return /"community-mod"/.test(fs.readFileSync(path.join(ROOT, "ported", d, "mod.json"), "utf8")); } catch { return false; } }).sort();
  for (const d of mods) {
    const j = readJson(path.join(ROOT, "ported", d, "mod.json")), rel = (j.requires || []).includes("community-mod") ? "requires" : (j.incompatibleWith || []).includes("community-mod") ? "incompatibleWith" : "mentions";
    const added = new Set(); let cloned = new Set(), maps = 0;
    const MAINPORTED = path.join(ROOT, "..", "..", "ported", d);   // the .bfhp files are git-ignored: they are in the main checkout, not in a worktree
    for (const f of walk(fs.existsSync(MAINPORTED) ? MAINPORTED : path.join(ROOT, "ported", d)).filter(f => /\.bfhp$/i.test(f))) {
      let ents; try { ents = hpfs(fs.readFileSync(path.join(fs.existsSync(MAINPORTED) ? MAINPORTED : path.join(ROOT, "ported", d), f))); } catch { continue; } maps++;
      for (const e of ents.filter(e => /\.(xml|vs)$/i.test(e.path))) for (const m of e.read().toString("latin1").matchAll(/\bclass\s*=\s*"([^"]+)"/g)) { const k = m[1].toLowerCase(); if (fresh.has(k)) added.add(fresh.get(k)[0]); else if (alias.has(k)) cloned.add(k); }
    }
    lines.push(`${d} (${rel}, ${maps} map files): added: ${[...added].sort().join(" ") || "none"}; cloned: ${cloned.size}`);
  }
  lines.push("", "# added class -> its copy per civilization", ...[...fresh.values()].sort().map(([k, v]) => `${k} -> ${v}`));
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-maps.txt"), lines.join("\n") + "\n");
  console.log(`maps that name the mod: ${mods.length}; raw/community-mod-civs-maps.txt`);
}

// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
