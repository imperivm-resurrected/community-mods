// AsvrMod VII Ancient Generals a0.8.1 (Asvr, row 6): the game's eight civilizations as the mod has them, each a civilization of its own next to the game's
// (AGENTS.md, "Civilizations are independent"; decided in #15: a balance mod is ported as copies, the host chooses the set in the room). Rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/asvrmod-vii.js [id ...]     (no id: all eight)
// It unpacks originals/gamebanana/729311/asvrmod_7a_081.rar in .scratch/asvr-src (git-ignored, inside the worktree: nothing is written under originals/; the
// three executables are not used), runs tools/port-140.js on it into .scratch/asvr-pristine (HD + 1.40 + mod, three-way), rebuilds ported/asvrmod-vii from that and then:
//   1. keeps the mod's version of the game's classes and commands (.scratch/asvr-merged) and drops them from the port: they are the game's, and each
//      civilization they belong to is cloned from HD with the mod's changes on top (tools/lib/clone-civs.js); what the mod changed in the base classes
//      (Hero, Melee, Ranged, Catapult...) is written inside each clone
//   2. the commands of the mod's classes that belong to no civilization are an own file / patches
//   3. the shared tables (items, unit specials, constants, bonuses) only contribute what they ADD, as patches; the edits of the game's own are not ported
//   4. the mod's edits of the game's behavior scripts are copies of their own (_asv, tools/lib/own-scripts.js) that only the clones' classes point to; the
//      class ids a script writes as text are each clone's own
//   5. the mod's AI as ASV_* scripts that only run for the mod's civilizations (tools/lib/asvr-ai.js); never started with AIRun when they loop (engine #15)
//   6. names another port (or the game) has with other bytes are given the tag "asv" (tools/lib/ported-patch.js, tagCollisions)
// The prefix of each civilization is derived from its id by the SDK (first 3 characters: Aga, Aro, Aim...) and there is no index (imperivm-resurrected#37).
// The token "a" is this port's: every id starts with it.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { net, checkBalance, checkAbsolute, removeStrayBraces, applyPatch, classStrings, classTable, heroBaseProblem, CLASS_CALL } = require("./lib/script-checks.js");
const ROOT = path.join(__dirname, "..");
const ID = "asvrmod-vii", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const SCRATCH = path.join(ROOT, ".scratch"), SRC = path.join(SCRATCH, "asvr-src"), PRISTINE = path.join(SCRATCH, "asvr-pristine"), MERGED = path.join(SCRATCH, "asvr-merged");
const RAR = path.join(ROOT, "originals", "gamebanana", "729311", "asvrmod_7a_081.rar");
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const TAG = "asv";
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };
const want = process.argv.slice(2);
if (!fs.existsSync(RAR)) { console.error("no " + RAR); process.exit(1); }
if (!process.env.G || !fs.existsSync(path.join(process.env.G, "rle.mmp"))) { console.error('set G to the HD game folder (port-140.js compares sprites with it)'); process.exit(1); }

// the ids start with "a" (the token of this port) and differ in their first three characters: the SDK derives the prefix from them. No index.
// The mod's own classes of a race that its civilization does not start with by letter (Anibal, Boadicea, NVael, Momia...) are renamed <letter><id> in the
// clone (clone-civs.js). `neutral`: classes the mod's item scripts and the like place by name for whoever owns the item (the Egyptian mummy, the Gaul ghost): they are
// nobody's and stay as they are. `asBase`: classes of another race that the mod trains in this civilization's buildings (the mod's Hoplite has race Carthage
// and is trained in the Republican barracks); `skipExtra` keeps them out of the civilization their race names.
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "agaul", neutral: /^(AnubisGhost|GTracio)$/, name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "arome", asBase: ["RLider", "RLider1", "RLider2", "RLider3", "EHOPLITA", "TaxCollector"], name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "aimperial", asBase: ["Hipatista"], skipExtra: /^RLider/, name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "acarthage", skipExtra: /^(EHOPLITA|Hipatista|PINMORTAL)$/, name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "abritain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "aiberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "aegypt", neutral: /^(Momia|EHOPLITA)$/, asBase: ["PINMORTAL"], name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "agermany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];

// 0. the mod unpacked and ported (HD + 1.40 + mod), in .scratch
fs.rmSync(SRC, { recursive: true, force: true }); fs.rmSync(PRISTINE, { recursive: true, force: true });
{
  fs.mkdirSync(SCRATCH, { recursive: true });
  const tmp = path.join(SCRATCH, "asvr-unpack"); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
  let r = cp.spawnSync("bsdtar", ["-xf", RAR, "-C", tmp], { stdio: "inherit" }); if (r.status) process.exit(1);
  fs.renameSync(path.join(tmp, "AsvrMod 7a 0.8"), SRC); fs.rmSync(tmp, { recursive: true, force: true });
  // AsvrMod.exe is the 1.40 gbr.exe with the large-address-aware flag and another icon (see NOTES.md); Arch.EXE packs .pak files; 4gb_patch.exe sets the flag: nothing for a mod to ship
  for (const f of fs.readdirSync(SRC)) if (/\.exe$/i.test(f) || /^NOTAS\.txt$/i.test(f)) fs.rmSync(path.join(SRC, f));
  r = cp.spawnSync("node", [path.join(__dirname, "port-140.js"), SRC, PRISTINE, "--id", ID, "--name", "AsvrMod VII", "--version", "a0.8.1", "--category", "Civilizations"], { stdio: "inherit", env: { ...process.env, GAME: process.env.G } }); if (r.status) process.exit(1);
}
// 1. a fresh copy of the pristine port: hard links (every write below removes the file first)
fs.rmSync(OUT, { recursive: true, force: true });
cp.spawnSync("cp", ["-al", PRISTINE, OUT], { stdio: "inherit" });
fs.rmSync(path.join(OUT, "NOTAS.txt"), { force: true });
fs.rmSync(path.join(OUT, "NOTES.md"), { force: true });                // port-140.js copies extras/<id>/ over its output, the notes included: they are not part of the mod
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
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "AsvrMod", LABEL: "Asvr", CIVS, cloneAllOrders: true, want });

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
  if (own.length) wr(path.join(COMMANDS, "ASVRMODVII.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
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
    const p = path.join(COMMANDS, "ASVRMODVII.XML"), t = fs.existsSync(p) ? rd(p) : "<commands>\n\n</commands>\n";
    wr(p, t.replace(/\s*<\/commands>\s*$/, `\n\n${add.join("\n\n")}\n\n</commands>\n`));
  }
  console.log(`commands of the mod for the game's base classes: ${add.length} added with the port's classes under them as sources (${noHeirs} with no class of this port under them left out)`);
}

// 3c. the mod's versions of the game's behavior scripts (barrack_train.vs, arena_behavior.vs, unit_on_kill.vs...): the clones' classes and commands use copies of
// their own (<name>_asv.vs, and <name>_asv_<id>.vs where the class ids the script writes as text differ per civilization); the game's scripts stay the game's
// (tools/lib/own-scripts.js). The mod has no branch to choose, so nothing is skipped. `inherit`: the methods the clones inherit from the game's classes
// (Unit, Military...) whose script the mod edited are written inside each clone, pointing to the copy.
const CLONES = CIVS.map(c => { const letter = c.id.slice(0, 3).replace(/^./, x => x.toUpperCase()); return { id: c.id, letter, from: [c.baseLetter, ...(c.asBase || []).map(x => x[0])], match: new RegExp(`^(${letter}|${c.id}\\.)`, "i"), modOnly: true, keep: c.neutral }; });
{
  const r = require("./lib/own-scripts.js")({ OUT, HD, tag: TAG, skip: /(?!)/, civs: CLONES, modClasses: path.join(PRISTINE, "DATA", "CLASSES"), inherit: true });
  console.log(`scripts of the mod's own for its civilizations: ${r.copied.length} copied (_${TAG}), ${r.skipped.length} left to the game's (${r.skipped.map(s => s.name).join(", ")})`);
  console.log(`  methods inherited from the game's classes whose script the mod edited: ${r.injected} <method> written inside ${r.touched} classes; behaviors inherited and left the game's: ${(r.behaviorsLeft || []).join("; ") || "none"}`);
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", "asvrmod-vii-own-scripts.txt"), r.copied.map(c => `${c.from} -> ${c.to}  (${c.users.slice(0, 4).join(", ")}${c.users.length > 4 ? ", ..." : ""})`).join("\n") + "\n\nnot copied:\n" + r.skipped.map(s => `${s.name}: ${s.why}`).join("\n") + "\n\nbehaviors inherited from the game's classes and left the game's:\n" + (r.behaviorsLeft || []).join("\n") + "\n");
}

// 3d. The mod wrote its civilization tests as `.race == Gaul` (`owner.AsUnit.race == Germany`): for a clone the race is the clone's own, so the test is false (a
// behavior script that returns on it is restarted for ever). Each test in the mod's scripts also accepts the clone: `(X.race == Gaul || Mod_TrueRace(X) == Agaul)`.
// `GetPlayerRace` is left alone (it returns the base for a clone, as the game's scripts expect).
const BASE_CONST = { Gaul: "Agaul", RepublicanRome: "Arome", ImperialRome: "Aimperial", Carthage: "Acarthage", Britain: "Abritain", Iberia: "Aiberia", Egypt: "Aegypt", Germany: "Agermany" };
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

// 3f. The AI (tools/lib/asvr-ai.js). The mod's edits: the AI uses items (SquadMonitor, TS_AttackAtWill), caves, the new units of the arena (ESH_ResearchTraining), the tribute
// and the market, and the tactic of each civilization. Not ported: the tuning of AI.INI (the values of the keys the game has, for every AI), AI/DEFENSIVE (the mod's
// profile), AIOSendSquad (the engine calls it by name with no player), GS_KillEnemies / GSH_SynchApproach (log lines and a constant: the engine picks the strategy).
{
  const ids = {};                                                      // the mod's classes the clone step renamed: <letter of the base><id>
  for (const c of CIVS) { const j = readJson(path.join(OUT, "civs", `${c.id}.json`)); for (const k of Object.keys(j.alias.classes)) if (k[0] === c.baseLetter && /^[A-Z]/.test(k.slice(1)) && fs.existsSync(path.join(PRISTINE, "DATA", "CLASSES", `${k.slice(1).toUpperCase()}.SC.XML`)) && !hdClass.has(k.slice(1).toLowerCase()) && !hdClass.has(k.toLowerCase())) ids[k.slice(1)] = k; }
  delete ids.TaxCollector;                                             // two civilizations have it (Rome's, both): the AI does not count it
  const r = require("./lib/asvr-ai.js")({ OUT, HD: HDDATA, SRC: path.join(PRISTINE, "DATA", "AI"), prefix: "ASV_", ids,
    civs: CIVS.map(c => c.id[0].toUpperCase() + c.id.slice(1)),
    tactics: { Agaul: "TS_GaulTactic2", Aiberia: "TS_IberianTactic2", Agermany: "TS_GermanyTactic2", Aegypt: "TS_EgyptTactic", Abritain: "TS_BritishTactic", Acarthage: "TS_CarthageTactic2", Arome: "TS_RRomeTactic", Aimperial: "TS_MRomeTactic2" },
    loops: ["ES_Stronghold", "ES_Village"], helpers: ["ESH_ArenaUnits", "ESH_BuildArmy", "ESH_BuildGermanArmy", "ESH_CombatMagic", "ESH_Market", "ESH_NeedTech", "ESH_ResearchTraining"], monitors: ["SquadMonitor"],
    inline: [{ name: "CalcGAIKAPriority.vs", player: "idPlayer" }, { name: "GetArmyNeed.vs", player: "idPlayer" }, { name: "TSH_ArenaRecruit.vs", player: "set.player" }] });
  console.log(`AI: ${r.forks.length} scripts as ASV_* copies (${r.forks.join(", ")}); ${r.inlined.length} inside the game's (${r.inlined.join(", ")}); tactics ${r.tactics.join(", ")}; AI variables declared: ${r.vars.join(", ") || "none"}${r.problems.length ? "\n  to check: " + r.problems.join("; ") : ""}`);
  // what the mod's AI folder left at the game's path is now copies or left out
  for (const f of fs.readdirSync(find(OUT, "DATA/AI")).filter(f => !/^ASV_/i.test(f))) fs.rmSync(path.join(find(OUT, "DATA/AI"), f), { recursive: true, force: true });
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
  addIni("DATA/UNIT_SPECIALS.INI"); addIni("DATA/SKILLS.INI"); addIni("DATA/CONST.INI");
  // the random maps: the mod's lines for its own neutral object (the iron mine) are added to each block; its changes to the counts of the game's own objects
  // (outposts, ruins, stonehenge) are not ported (they change every map for everybody)
  const mp = find(OUT, "DATA/RANDOMMAP/PLACEOBJECTS.XML"), hp = find(HDDATA, "RANDOMMAP/PLACEOBJECTS.XML");
  if (mp && hp) {
    const blocks = t => [...t.replace(/\r/g, "").matchAll(/<PlaceGameObjects\b[\s\S]*?<\/PlaceGameObjects>/g)].map(m => m[0]);
    const A = blocks(rd(hp)), B = blocks(rd(mp)), ops = [];
    if (A.length !== B.length) report.push("PLACEOBJECTS.XML: not the same blocks as the game's: left out");
    else B.forEach((b, i) => { const hdLines = new Set(A[i].split("\n").map(l => l.trim())); for (const l of b.split("\n")) if (l.trim() && !hdLines.has(l.trim()) && /class="IronMine"/.test(l) && !/^<!--/.test(l.trim())) ops.push(`  <add select="/placeobjects/PlaceGameObjects[${i + 1}]">${l.trim()}</add>`); });
    fs.rmSync(mp);
    if (ops.length) { wr(path.join(OUT, "patches", "DATA", "RANDOMMAP", "PLACEOBJECTS.XML"), `<patch>\n${ops.join("\n")}\n</patch>\n`); patches.push(`DATA/RANDOMMAP/PLACEOBJECTS.XML (${ops.length} lines)`); }
  }
  // the colors of the neutral players 14-16 the mod's CONST.INI adds are not the mod's content: left out
  { const cp = path.join(OUT, "patches", "DATA", "CONST.INI"); if (fs.existsSync(cp)) { const t = rd(cp), n = t.replace(/\[PlayerColors\][\s\S]*?(?=\r?\n\[|\s*$)/, "").replace(/\s+$/, "\r\n"); if (n !== t) wr(cp, n); } }
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

// The game modes (6 Destruccion, 9 Puntuacion, 10 Rey de los bandidos) and the starting bonuses (004 Wealth, 005 People) the mod adds: another author's code ("By El Justiciero
// Misteryoso, no plagiar"), numbers the 4.2's modes and bonuses also take, and none belongs to a civilization: not shipped (NOTES.md)
for (const d of ["DATA/GAMESCRIPTS", "DATA/BONUSSCRIPTS"]) { const p = find(OUT, d); if (p) fs.rmSync(p, { recursive: true, force: true }); }
// The mod's menu skin: what port-140.js left of it is dropped here (the pictures of the loading, credits, help and options screens in Currentlang/, the top bar's UI/MENU/*.bmp);
// the main menu is written back, from the rar, at the end of step 6 (tools/lib/asvr-menu.js): it is written AFTER the steps that compare files with the game's, which would remove
// them (DATA/INTERFACE/ is "global" and UI/MENU/*.bmp are the game's names).
for (const f of walk(OUT).filter(f => /^(CURRENTLANG\/[^/]+\.bmp|UI\/MENU\/[^/]+)$/i.test(f))) fs.rmSync(path.join(OUT, f));

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
  fs.writeFileSync(path.join(ROOT, "raw", "asvrmod-vii-left-out.txt"), left.join("\n") + "\n");
  console.log(`game files with other bytes: ${left.length} left out (raw/asvrmod-vii-left-out.txt)`);
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
  const ports = fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== ID && find(path.join(ROOT, "ported", d), "DATA/CLASSES")).map(d => path.join(ROOT, "ported", d));
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: TAG, others: [...ports, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: "Asvr", gameDirs: [path.join(G, "paks")], skip: /^(currentlang|ui\/menu|data\/interface\/menu)\// });
    console.log(`own names (${TAG}), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
  const { ownNames, tagNames } = require("./lib/ported-patch.js");
  const mine = ownNames(OUT, HD), clash = { cmds: new Set(), items: new Set() };
  for (const o of ports) { const t = ownNames(o, HD); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const names = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with other ports: ${clash.cmds.size} orders, ${clash.items.size} items -> "(${TAG})" in ${tagNames({ OUT, names, tag: TAG })} files`);
}

// The main menu skin: the one exception to "patches only" the maintainer approved (cosmetic, one skin shows at a time; the 1.8 does the same). After step 6 on purpose.
{ const r = require("./lib/asvr-menu.js")({ SRC, OUT }); console.log(`main menu: ${r.files.length} files (${r.edits.join(", ")} edited from the rar's; ${r.files.filter(f => /^UI\//.test(f)).length} pictures of UI/MENU)`); }

// 7. hand fixes of this mod (extras/asvrmod-vii/): the final files and mod.json with the credits
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }
// Scripts of the mod that the game's compiler (stricter than 1.40's) refuses: they use a variable they never declare, or declare one twice, or
// the header names a parameter other than the one the body reads. A behavior that does not compile ends at once and the engine starts it again,
// forever: the game hangs when a match starts (Logs\comp_out.txt lists them). Found with the compiler's own log; each fix is the missing
// or the duplicate declaration, nothing else.
{
  const FIXES = [
    // the mod dropped gold_sales from the declaration and still reads it ("gold_sales = food_sales;"): 1.40 let it pass, HD's compiler does not
    ...["outpost_idle_asv.vs", "outpost_idle_asv_acarthage.vs", "outpost_idle_asv_arome.vs"].map(n => [`DATA/SUBAI/${n}`, /^int min_resource, refresh, food_sales, food_income,/m, "int min_resource, refresh, food_sales, gold_sales, food_income,"]),
    ["DATA/RANGOS/leyenda.VS", /^/, "//void, Obj owner\r\n"],                                       // the only script of the mod's ranks with no signature line
    ["BUILDINGS/IRONMINE/IRONMINE.ENT.XML", /<state idx="(?:9|10)"[^\n]*\n/g, ""],                   // the engine allows 8 states: the two last ones are copies of the others (all rows 0)
  ];
  fs.rmSync(path.join(find(OUT, "DATA/CLASSES"), "PUNTO.SC.XML"), { force: true });      // the mod's Punto (a feedback object) names an entity nobody has; nothing places it
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
  const stem = v => path.basename(v).toLowerCase().replace(/\.vs$/, "").replace(/_asv(_a[a-z]+)?$/, "");
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
      if (/_asv(_a[a-z]+)?\.vs/i.test(left[i])) { t = t.replace(left[i], ""); over--; removed++; (twins["(over 8)"] ||= new Set()).add(`${id}: ${left[i].match(/script="([^"]+)"/)[1]}`); }
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
  const ALLOW = new Set(["DATA/SUBAI/RCHARIOT2_MUTATE_GV.VS|IsHeirOf|RArcher2",                     // the mod's verify script of a command it dropped; no class RArcher2 anywhere; nothing names the script
    "DATA/AI/ASV_TS_GermanyTactic2.VS|Count|TTeutonRiders"]);                                          // HD's TS_GermanyTactic2.vs has the same typo (counts nothing)
  let fixed = 0;
  for (const dir of ["SUBAI", "ITEMSCRIPTS", "ESPECIALIDADES", "RANGOS", "AI"]) {
    const d = find(OUT, `DATA/${dir}`); if (!d) continue;
    for (const f of fs.readdirSync(d).filter(vs)) { const p = path.join(d, f), t = rd(p), u = fixLiterals(t); if (u !== t) { wr(p, u); fixed++; } }
  }
  { const pd = find(OUT, "patches/DATA"); for (const dir of pd ? fs.readdirSync(pd).filter(d => fs.statSync(path.join(pd, d)).isDirectory()) : []) for (const f of fs.readdirSync(path.join(pd, dir)).filter(vs)) { const p = path.join(pd, dir, f), t = rd(p), u = fixLiterals(t); if (u !== t) { wr(p, u); fixed++; } } }
  console.log(`class ids written as text: ${fixed} scripts had the mod's original ids rewritten as the clone's`);
  const stem = n => n.replace(/^ASV_/i, "").replace(/_asv(_a[a-z]+)?(?=\.vs$)/i, "");
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
  // the menu skin: exactly what was approved, and nothing that would change the game for everybody
  { const have = walk(OUT).map(f => f.toLowerCase()), bad = [];
    for (const f of have) {
      if (/^currentlang\/[^/]+\.loc\.xml$/.test(f) || /^local\//.test(f) && /\.loc\.xml$/.test(f)) bad.push(`${f}: a text table of the whole game must not ship`);
      if (/^patches\/menuini\//.test(f)) bad.push(`${f}: cannot coexist with the whole MAINMENU.INI`);
      if (/^data\/interface\/menu\//.test(f) && !/^data\/interface\/menu\/(mainmenu|menuback)\.ini$/.test(f)) bad.push(`${f}: only MAINMENU.INI and MENUBACK.INI of the menu are approved`);
      if (/^ui\//.test(f) && !/^ui\/(menu|cmdbar|help|icons|infobar)\//.test(f)) bad.push(`${f}: unexpected folder of UI/`);
      if (/^currentlang\/menubackgroundimperiv/.test(f)) bad.push(`${f}: not shipped`);
    }
    for (const must of ["data/interface/menu/mainmenu.ini", "data/interface/menu/menuback.ini", "currentlang/menubackground.bmp", "currentlang/generals.bmp", "currentlang/titulo3.bmp", "currentlang/titulo.bmp", "currentlang/credits.bmp", "currentlang/tips.xml"]) if (!have.includes(must)) bad.push(`${must}: missing`);
    if (have.filter(f => /^ui\/menu\/[^/]+\.bmp$/.test(f)).length !== 20) bad.push("UI/MENU: not 20 pictures");
    const mm = rd(find(OUT, "DATA/INTERFACE/MENU/MAINMENU.INI")), mb = rd(find(OUT, "DATA/INTERFACE/MENU/MENUBACK.INI"));
    if (!/ButtonXStart = 790\r?\nButtonYStart = 20\r?\n/.test(mm) || !/RectWH = 25, 25, 450, 248/.test(mm) || /RectWH = 140, 260, 450, 248/.test(mm)) bad.push("MAINMENU.INI: the HD edits are not there");
    { const sec = (/\[MenuBack\]\r?\n([\s\S]*?)(?=\r?\n\[)/.exec(mb) || [])[1] || ""; if (!/RectWH = 0, 0, %Larghezza%, %Altezza%/.test(sec) || /1920, 1080/.test(sec)) bad.push("MENUBACK.INI: the HD edit of [MenuBack] is not there"); }   // a second 1920x1080 further down is the mod's and stays
    if (/[^\r]\n/.test(mm.replace(/\r\n/g, "")) ) bad.push("MAINMENU.INI: mixed line ends");
    problems.push(...bad); }
  console.log(`script checks: ${copies} copies/rewrites balanced like the mod's, ${patchesChecked} patches applied to the game's script and balanced, ${strings} class strings resolved, hero bases: ${[...bases].sort().join(" ")}`);
  if (problems.length) { console.error(`SCRIPT CHECKS FAILED (${problems.length}):\n  ` + [...new Set(problems)].slice(0, 80).join("\n  ")); process.exit(1); }
}

// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
