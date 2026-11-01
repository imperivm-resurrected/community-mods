// Caesar Mod 1.1.0 (Paolo Lamberto and the Greek Mod 1.9 creators, GameBanana 728740, row 2): the civilization part of the mod as civilizations of its own, next to
// the game's (AGENTS.md, "Civilizations are independent"; decided in #15: a balance mod is ported as copies, the host chooses the set in the room). Rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/caesar-mod.js [id ...]     (no id: everything)
// Same pipeline as the Greek Mod 4.2 (tools/greek-4-2.js, tools/lib/*), on the mod's own zip:
//   0. the zip is unpacked in .scratch/caesar-src (git-ignored; nothing is written under originals/); what is not the mod's civilizations (the engine's old tricks:
//      civs/, patches/, hidden.txt) goes. DATA/ is ported with tools/port-140.js (three-way: HD, 1.40, mod): the mod's class and script files are written in their own
//      format and HD fixed files after 1.40, so a file the mod did not change is HD's, not the mod's reformatted copy
//   1. the mod's version of the game's classes and commands is kept apart (.scratch/caesar-merged) and leaves the port: each civilization they belong to is cloned
//      from HD with the mod's changes on top (tools/lib/clone-civs.js); what the mod changed in the base classes is written inside each clone
//   2. Rome has three branches (Republican, Imperial, Punic; the mod lets the player choose at the town hall): each is a civilization with the commands of its branch
//   3. Greece (the mod puts it in Imperial Rome's slot, classes H*) is a civilization of its own, prefix Kgr
//   4. scripts, AI, conquests, random-map templates, collisions with the game and the other Greek mods (tag "cae")
// The token "k" is this port's: every id starts with it, the prefixes are derived by the SDK from the ids (Kga, Kbr, Kib, Keg, Kge, Kca, Kre, Kim, Kpu, Kgr) and there is
// no index (imperivm-resurrected#37).
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { net, checkBalance, checkAbsolute, removeStrayBraces, applyPatch, classStrings, classTable, heroBaseProblem, CLASS_CALL } = require("./lib/script-checks.js");
const ROOT = path.join(__dirname, "..");
// A worktree under .wt/ does not see the ports that only the MAIN checkout has built (its ported/ is git-ignored for them): the main checkout is the parent of the git common dir.
// The other ports are read from there AND from this ported/, and the build STOPS if the known existing ones are missing (below), so the same commit gives the same bytes from the
// main checkout and from any worktree.
const MAIN = (() => { try { return path.dirname(path.resolve(ROOT, cp.execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim())); } catch { return ROOT; } })();
process.env.SDK = process.env.SDK || [path.join(ROOT, "..", "imperivm-resurrected", "sdk"), path.join(MAIN, "..", "imperivm-resurrected", "sdk")].find(fs.existsSync) || path.join(ROOT, "..", "imperivm-resurrected", "sdk");   // clone-civs.js and port-140.js read it
const ID = "caesar-mod-civs", TAG = "cae", LABEL = "Caesar", SUFFIX = "Caesar Mod 1.1.0", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const SCRATCH = path.join(ROOT, ".scratch"), SRC = path.join(SCRATCH, "caesar-src"), STAGE = path.join(SCRATCH, "caesar-data-in"), DATAOUT = path.join(SCRATCH, "caesar-data-merged"), MERGED = path.join(SCRATCH, "caesar-merged");
const ZIP = path.join(ROOT, "originals", "gamebanana", "728740", "caesar_mod.zip");
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA"), GD = path.join(ROOT, "originals", "game-data");
const GAME = process.env.G || path.join(process.env.HOME || "", ".local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
// a malformed file stops the build, on purpose
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };
const want = process.argv.slice(2);
if (!fs.existsSync(ZIP)) { console.error("no " + ZIP + ": download GameBanana 728740 (docs/PORTING.md, step 2)"); process.exit(1); }
if (!fs.existsSync(path.join(GAME, "rle.mmp"))) { console.error('set G to the HD game folder (port-140.js opens its rle.mmp)'); process.exit(1); }
const report = [];

// The civilizations. The ids start with "k" (the token of this port) and differ in their first three characters. Rome's three ids avoid "kromeX" (three "Kro").
// Rome: the mod lets the player choose Republican, Imperial or Punic Rome at the town hall (ChooseXxxRome researches, R*_Enable_Or_Disable_Cmd.vs scripts that open and close
// the commands of each); each is a civilization here with the commands of its branch from the start (tools/lib/branch.js reads those scripts). The hero of each branch
// comes with the hire command of the branch; Caesar is the Republican branch's (the mod enables "Hire Caesar" only there).
const BR = (flag, hire) => ({ flag, scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, ...(hire ? { hire } : {}) });
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "kgaul", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "kbritain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "kiberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "kegypt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "kgermany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "kcarthage", name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "krepublic", skipExtra: /^(ImperialRomanHero|PunicRomanHero|MHero)/, branch: BR("ChooseRepublicanRome"),
    name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "kimperial", skipExtra: /^(PunicRomanHero|Caesar$)/, branch: BR("ChooseImperialRome", { cmd: "hireheroRImperial", hero: "ImperialRomanHero" }),
    name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "kpunic", skipExtra: /^(ImperialRomanHero|MHero|Caesar$)/, branch: BR("ChoosePunicRome", { cmd: "hireheroRPunic", hero: "PunicRomanHero" }),
    name: { spanish: "Roma púnica", english: "Punic Rome", italian: "Roma punica" } },
];
const GREECE = "kgreece", GP = "Kgr", GCONST = "Kgreece", TEMPLATE = "Greek Caesar";   // Greece's id, prefix, constant in scripts, random map templates ("Greek Caesar Town 1")
const CONSTS = [GCONST, ...CIVS.map(c => c.id[0].toUpperCase() + c.id.slice(1))];

// 0. the zip, unpacked
for (const d of [SRC, STAGE, DATAOUT, MERGED]) fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(SRC, { recursive: true });
{
  const x = cp.spawnSync("bsdtar", ["-xf", ZIP, "-C", SRC, "--strip-components=1"], { stdio: "inherit" }); if (x.status) process.exit(1);
  const left = [];
  // civs/ (the three Rome variants of the engine's old trick), patches/ (their switches in R*_Enable_Or_Disable_Cmd.vs and es_stronghold.vs; the const.ini patch is read below),
  // hidden.txt (what the old mod hid of the game's files), the engine's .fingerprint, the changelogs and the scripting reference
  const constPatch = find(SRC, "patches/data/const.ini");
  if (constPatch) fs.copyFileSync(constPatch, path.join(SCRATCH, "caesar-const.ini"));
  for (const rel of ["civs", "patches", "mod.json", "hidden.txt", ".fingerprint", "game_functions.xml", "CHANGELOG_ENG.txt", "CHANGELOG_ITA.txt", "CHANGELOG_SPA.txt"]) { const p = find(SRC, rel); if (p) { fs.rmSync(p, { recursive: true, force: true }); left.push(rel); } }
  // the license travels with the mod (CC BY-SA 4.0 asks for it), the credits too
  fs.mkdirSync(path.join(SRC, "Licenses"), { recursive: true });
  fs.renameSync(path.join(SRC, "LICENSE.txt"), path.join(SRC, "Licenses", "CAESAR-CC-BY-SA-4.0.txt"));
  fs.copyFileSync(path.join(SRC, "Local", "english", "CREDITS.TXT"), path.join(SRC, "Licenses", "CREDITS.txt"));
  // the music the game already has, byte for byte
  const mine = find(SRC, "Music"), theirs = find(GAME, "Music"); let n = 0;
  if (mine && theirs) for (const f of fs.readdirSync(mine)) { const g = find(theirs, f); if (g && md5(path.join(mine, f)) === md5(g)) { fs.rmSync(path.join(mine, f)); n++; } }
  console.log(`unpacked ${walk(SRC).length} files; left out: ${left.join(", ")}; music identical to the game's: ${n} files left out`);
  // DATA/ three-way (tools/port-140.js: same as HD or 1.40 -> HD's; changed by the mod only -> the mod's; both -> merged). Its report: raw/port-140/<id>.md
  fs.mkdirSync(STAGE, { recursive: true });
  cp.spawnSync("cp", ["-al", path.join(SRC, "DATA"), path.join(STAGE, "DATA")], { stdio: "inherit" });
  const r = cp.spawnSync("node", [path.join(__dirname, "port-140.js"), STAGE, DATAOUT, "--id", ID, "--name", SUFFIX, "--version", "1.1.0", "--category", "Civilizations"], { stdio: "inherit", env: { ...process.env, GAME } }); if (r.status) process.exit(1);
  fs.rmSync(path.join(SRC, "DATA"), { recursive: true, force: true });
  fs.renameSync(path.join(DATAOUT, find(DATAOUT, "DATA") ? path.basename(find(DATAOUT, "DATA")) : "DATA"), path.join(SRC, "DATA"));
}
// 1. a fresh copy: hard links (every write below removes the file first)
fs.rmSync(OUT, { recursive: true, force: true });
cp.spawnSync("cp", ["-al", SRC, OUT], { stdio: "inherit" });
// scripts saved in Latin-1 (accents): the game's compiler wants UTF-8
for (const f of walk(OUT).filter(f => /\.vs$/i.test(f))) {
  const p = path.join(OUT, f), b = fs.readFileSync(p);
  try { new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { fs.rmSync(p); fs.writeFileSync(p, Buffer.from(b.toString("latin1"), "utf8")); }
}
// The mod's own scripts can be broken in ways 1.40's compiler tolerated and this one reports ("Closing } without correspond opening"): a "}" that closes nothing is removed
{
  const stray = [];
  for (const f of walk(path.join(OUT, "DATA")).filter(f => /\.vs$/i.test(f))) { const p = path.join(OUT, "DATA", f), r = removeStrayBraces(rd(p)); if (r.removed.length) { wr(p, r.text); stray.push(`DATA/${f} (line ${r.removed.join(", ")})`); } }
  console.log(`stray "}" removed from the mod's own scripts: ${stray.join("; ") || "none"}`);
}
const CLASSES = find(OUT, "DATA/CLASSES"), COMMANDS = find(OUT, "DATA/COMMANDS"), HD_CLASSES = find(HD, "DATA/CLASSES");
// the choice of branch at the town hall is not ported (AGENTS.md, "What a civilization is, it is from the start"): the three researches go, the branches are the civilizations
fs.rmSync(path.join(COMMANDS, fs.readdirSync(COMMANDS).find(f => /^RTOWNHALL_CHOICE\.XML$/i.test(f)) || "none"), { force: true });
const hdClass = new Set(walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f)).map(f => (classOf(rd(path.join(HD_CLASSES, f))) || "").toLowerCase()));

// 2. what the mod did to the game's classes and commands: kept apart, and the game's classes leave the port
const elements = s => {
  const body = s.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, ""), out = [];
  for (const m of body.matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)) out.push({ text: m[0].trim(), norm: m[0].replace(/\s+/g, " ").replace(/\s+\/>/g, "/>").trim() });
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
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const p = path.join(CLASSES, f), id = classOf(rd(p)); if (id && hdClass.has(id.toLowerCase())) { fs.rmSync(p); dropped++; } }
console.log(`${dropped} classes of the game's own left out`);

// The branch scripts ask `IsResearched(set, "ChooseXxxRome")`; tools/lib/branch.js reads the flag as `EnvReadString(set, "ChooseXxxRome")` (the 4.2's scripts say it so) and treats a call
// it does not know as 0, which would hide every command of every branch. The scripts are only read for that (they are dropped below), so the same test is written as the reader knows it.
for (const f of fs.readdirSync(find(OUT, "DATA/SUBAI")).filter(f => /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i.test(f))) {
  const p = path.join(find(OUT, "DATA/SUBAI"), f), s = rd(p); wr(p, s.replace(/IsResearched\(\s*set\s*,\s*("Choose\w+")\s*\)/g, "EnvReadString(set, $1)"));
}
// 3. the civilizations of the game, as the mod has them
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX, LABEL, CIVS, cloneAllOrders: true, want });

// the branch switches nobody asks for any more
{
  const SUB = find(OUT, "DATA/SUBAI"), refs = new Set();
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) for (const m of rd(path.join(CLASSES, f)).matchAll(/data\/subai\/([^"]+\.vs)/gi)) refs.add(m[1].toLowerCase());
  let n = 0;
  for (const f of fs.readdirSync(SUB).filter(f => /_(ENABLE_OR_DISABLE_CMD|CAPTURED_BY_AI)\.VS$/i.test(f))) if (!refs.has(f.toLowerCase())) { fs.rmSync(path.join(SUB, f)); n++; }
  console.log(`${n} scripts of the branch choice nobody uses left out`);
}

// 4. Greece: its scripts
{
  // "if (race != ImperialRome) return;" ended at once on a Greek building (Greece has a race of its own), and the engine started the behavior again and again: the game hung
  const SUB = find(OUT, "DATA/SUBAI");
  for (const f of fs.readdirSync(SUB).filter(f => /\.vs$/i.test(f))) {
    const p = path.join(SUB, f), s0 = rd(p);
    const t = s0.replace(/^[ \t]*if\s*\(\s*[\w.()]*\.race\s*!=\s*ImperialRome\s*\)\s*\r?\n[ \t]*return\s*;[ \t]*\r?\n/m, "").replace(/GetPlayerRace\((\w+)\.player\)\s*==\s*ImperialRome/g, `Mod_TrueRace($1) == ${GCONST}`);
    if (t !== s0) { wr(p, t); console.log(`${f}: tests of "ImperialRome" fixed for Greece`); }
  }
}
// the classes the mod gave Imperial Rome's race ("ImperialRome" in the mod means Greece) have a race of their own
const greekIds = new Set();
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), s = rd(p), id = classOf(s);
  if (id && /<properties\b[^>]*\brace\s*=\s*"ImperialRome"/.test(s)) { greekIds.add(id); wr(p, s.replace(/(\brace\s*=\s*")ImperialRome"/, `$1${GREECE}"`)); }
}
for (let grew = true; grew;) {
  grew = false;
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const s = rd(path.join(CLASSES, f)), id = classOf(s), par = (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1]; if (id && !greekIds.has(id) && par && greekIds.has(par) && !/\brace\s*=/.test(s)) { greekIds.add(id); grew = true; } }
}
// the Greek pieces the mod drew over Imperial Rome's ids (walls, gates, tower) are H* classes of Greece; the city builder asks for the pieces the mod did not draw by
// letter too: copies of the nearest Greek ones (the tavern, the arena)
const pieces = new Map();
{
  const mk = (src, id) => { wr(path.join(CLASSES, `${id.toUpperCase()}.SC.XML`), src.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${id}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "").replace(/\brace\s*=\s*"(ImperialRome|[a-z]+)"/, `race="${GREECE}"`)); greekIds.add(id); };
  for (const f of fs.readdirSync(path.join(MERGED, "classes")).filter(f => /^M(WALLS|GATE|TOWER|VILLAGER|WVILLAGER|VILLAGERAMBIENT|WVILLAGERAMBIENT)\w*\.SC\.XML$/i.test(f))) {
    const s0 = rd(path.join(MERGED, "classes", f)), id = classOf(s0);
    if (id && /ImperialRome/.test(s0) && !/^MVillager/i.test(id)) { mk(s0, "H" + id.slice(1)); pieces.set(id, "H" + id.slice(1)); }
  }
  const have = id => fs.existsSync(path.join(CLASSES, `${id.toUpperCase()}.SC.XML`));
  for (const [id, like] of [["HTavern", "HAgora"], ["HTavern2", "HAgora"], ["HArena", "HGymnasium"]]) if (!have(id) && have(like)) { mk(rd(path.join(CLASSES, `${like.toUpperCase()}.SC.XML`)), id); pieces.set(`#${id}`, id); }
}
console.log(`Greece: ${greekIds.size} classes with race "${GREECE}" (${pieces.size} city pieces among them)`);

// its commands: the whole Greek ones in GREECE.XML, the Greek sources the mod added to the game's commands as patches
{
  const cmds = s => [...s.matchAll(/<cmd\b([^>]*)>([^]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
  const HDC = find(HD, "DATA/COMMANDS"), hdFiles = Object.fromEntries(fs.readdirSync(HDC).filter(f => /\.xml$/i.test(f)).map(f => [f.toUpperCase(), cmds(rd(path.join(HDC, f)).replace(/<!--[\s\S]*?-->/g, ""))]));
  const where = name => Object.keys(hdFiles).find(f => hdFiles[f].some(c => c.name === name));
  const ops = {}, own = [], seen = new Set(), sel = n => n.includes("'") ? `/commands/cmd[@name="${n}"]` : `/commands/cmd[@name='${n}']`;
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) {
    for (const c of cmds(rd(path.join(MERGED, "commands", f)).replace(/<!--[\s\S]*?-->/g, ""))) {
      const greek = c.src.filter(x => greekIds.has(x)); if (!greek.length) continue;
      const home = where(c.name);
      if (home) { for (const o of greek) if (!hdFiles[home].find(h => h.name === c.name).src.includes(o)) (ops[home] ||= []).push(`  <add select="${sel(c.name)}"><src obj="${o}"/></add>`); }
      else if (!seen.has(c.name)) { seen.add(c.name); own.push(c.src.length === greek.length ? c.text : c.text.replace(/<src\b[^>]*\/>\s*/g, "").replace(/<\/cmd>$/, greek.map(g => `\t<src obj="${g}"/>`).join("\n") + "\n</cmd>")); }
    }
  }
  const also = { HTavern: "HAgora", HTavern2: "HAgora", HArena: "HGymnasium" };
  for (const [file, list] of Object.entries(hdFiles)) for (const c of list) for (const [m, h] of pieces) if (!m.startsWith("#") && c.src.includes(m)) (ops[file] ||= []).push(`  <add select="${sel(c.name)}"><src obj="${h}"/></add>`);
  for (let i = 0; i < own.length; i++) for (const [k, like] of Object.entries(also)) own[i] = own[i].replace(new RegExp(`(\\s*)<src obj="${like}"\\s*/>`, "g"), (m, sp) => `${m}${sp}<src obj="${k}"/>`);
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) fs.rmSync(path.join(COMMANDS, f), { force: true });
  wr(path.join(COMMANDS, "GREECE.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
  for (const [file, list] of Object.entries(ops)) {
    const dest = path.join(OUT, "patches", "DATA", "COMMANDS", file), add = [...new Set(list)].join("\n");
    if (fs.existsSync(dest)) wr(dest, rd(dest).replace(/\s*<\/patch>\s*$/, `\n${add}\n</patch>\n`)); else wr(dest, `<patch>\n${add}\n</patch>\n`);
  }
  console.log(`Greece: ${own.length} commands, ${Object.values(ops).reduce((a, l) => a + new Set(l).size, 0)} sources added to the game's commands`);
}

// 5. the AI. The mod rewrote all of it (4 tactics per civilization, economy, recruitment, monitors). The civilizations whose AI does not read the old branch flags
// get the mod's economy loops and helpers; Rome's three branches read ChooseXxxRome in them and get the game's economy (as the 4.2's do), with the mod's tactics,
// monitors, group strategies and the scripts the engine calls by name for all of them (the TSH_* helpers read the flags: flat only).
{
  const FLAT = CONSTS.filter(c => !/^K(republic|imperial|punic)$/.test(c));
  const TACT = n => [[25, `TS_${n}Tactic`], [50, `TS_${n}Tactic2`], [75, `TS_${n}Tactic3`], [100, `TS_${n}Tactic4`]];
  // the mod: 20% no tactic, only for a stronghold, in the first 2 seconds, with 7000 gold or more (the game's rolls differ: it is HD's GetTacticScript that is patched)
  const GUARD = "rand(5) == 0 || !set.IsStronghold || set.gold < 7000";
  const AIDIR = find(OUT, "DATA/AI"), AISRC = find(SRC, "DATA/AI");
  // helpers the mod added and the game does not have (ESH_ArmyRecruitment...): the loops start them by name; they stay as they are and are declared
  const hdAI = new Set(fs.readdirSync(find(HD, "DATA/AI")).map(f => f.toLowerCase()));
  const newAi = fs.readdirSync(AISRC).filter(f => /^ESH_.*\.VS$/i.test(f) && !hdAI.has(f.toLowerCase()));
  const rest = require("./lib/own-ai.js")({ OUT, HD, SRC: AISRC, prefix: "CAE_", civs: CONSTS, flat: FLAT, inline: [
    { name: "CalcGAIKAPriority", player: "idPlayer" }, { name: "EvalRecruit", player: "sq.Player" }, { name: "CalcMaxTake", player: "idPlayer" }, { name: "CheckMAIKA", player: "idPlayer" },
    { name: "GetGAIKAStrat", player: "idPlayer" }, { name: "GetArmyNeed", player: "idPlayer" }, { name: "HeroSkill Default", player: "hero.player" }, { name: "TSH_HeroSkills", player: "hero.player" },
    { name: "TSH_Research", player: "set.player" }, { name: "TSH_TempleRecruit", player: "set.player" },
    { name: "TSH_RecruitArmy", player: "set.player", set: "flat" }, { name: "TSH_HeroRecruit", player: "set.player", set: "flat" }, { name: "TSH_ArenaRecruit", player: "set.player", set: "flat" }] });
  console.log(`AI: ${rest.forks.length} scripts as CAE_* copies started by Main.vs and the strategies (${rest.forks.join(", ")}); ${rest.inlined.length} inside the game's (${rest.inlined.join(", ")})`);
  const modIni = rd(path.join(AIDIR, "AI.INI")), sigOf = n => (modIni.match(new RegExp(`^${n}\\.vs\\s*=\\s*(.+?)\\s*$`, "im")) || [])[1];
  const tactics = { [GCONST]: TACT("Greek"), Kgaul: TACT("Gaul"), Kbritain: TACT("British"), Kiberia: TACT("Iberian"), Kegypt: TACT("Egypt"), Kgermany: TACT("Germany"), Kcarthage: TACT("Carthage"),
    Krepublic: TACT("RRome"), Kimperial: TACT("MRome"), Kpunic: TACT("PRome") };
  const guards = Object.fromEntries(CONSTS.map(c => [c, GUARD]));
  const r = require("./lib/greek-ai.js")({ OUT, HD, prefix: "CAE_", constName: GCONST, varRe: /^AIV_(Max[A-Z]|Time)/, extra: rest, civs: FLAT, tactics, guards });
  console.log(`AI: ${r.names.length} scripts run as CAE_* (${r.loops.join(", ")})`);
  // the helpers the mod added: back under their own names (greek-ai.js cleared the folder), declared with the signature the mod gives them
  const ini = path.join(OUT, "patches", "DATA", "AI", "AI.INI"); let add = [];
  for (const f of newAi) { const n = f.replace(/\.vs$/i, ""), sig = sigOf(n); if (!sig) { report.push(`${f}: no signature in the mod's AI.INI`); continue; } fs.copyFileSync(path.join(AISRC, f), path.join(AIDIR, f.toUpperCase())); add.push(`${n}.vs = ${sig}`); }
  { const t = rd(ini), sec = t.match(/\[Scripts\]\r?\n/); wr(ini, sec ? t.replace(sec[0], sec[0] + add.join("\r\n") + "\r\n") : t + `[Scripts]\r\n${add.join("\r\n")}\r\n`); }
  console.log(`AI: ${newAi.length} helpers the game does not have, declared: ${newAi.join(", ")}`);
}

// The mod's menu skin (UI/MENU pictures, MENUBACKGROUND, the layout INIs of DATA/INTERFACE/MENU) is not ported: AGENTS.md lets a skin ship only with the maintainer's say, and a
// layout patch without its pictures (or the other way round) breaks the menus. The editor's lists (DATA/INTERFACE/EDITOR) stay (step 7). A question in the PR.
{
  let n = 0;
  for (const rel of ["UI/MENU", "DATA/INTERFACE/MENU", "CURRENTLANG"]) { const p = find(OUT, rel); if (p) { n += walk(p).length; fs.rmSync(p, { recursive: true, force: true }); } }
  console.log(`menu skin: ${n} files not shipped (UI/MENU, DATA/INTERFACE/MENU)`);
}

const OWN_COPIED = new Set();
// 6. the mod's versions of the game's behavior scripts (barrack_train.vs, hero_attack.vs...): the port's classes and commands use copies of their own (<name>_cae.vs); the
// game's scripts stay the game's (tools/lib/own-scripts.js). Rome's branches read the old ChooseXxxRome flags: copies with the flags written in
{
  const C = (id, from, extra = {}) => { const L = id[0].toUpperCase() + id.slice(1, 3); return { id, letter: L, from, match: new RegExp(`^(${L}|${id}\\.)`, "i"), ...extra }; };
  const r = require("./lib/own-scripts.js")({ OUT, HD, tag: TAG, skip: /Choose(Republican|Imperial|Punic)Rome|ChooseRomanRace|rand\(\s*776|nLobbyBranch/i,
    inherit: true, modClasses: path.join(SRC, "DATA", "CLASSES"),
    civs: [C("kgaul", ["G"]), C("kbritain", ["B"]), C("kiberia", ["I"]), C("kegypt", ["E"]), C("kgermany", ["T"]), C("kcarthage", ["C"]),
      C("krepublic", ["R", "M"], { flags: { ChooseRepublicanRome: true } }), C("kimperial", ["R", "M"], { flags: { ChooseImperialRome: true } }), C("kpunic", ["R", "M"], { flags: { ChoosePunicRome: true } })] });
  for (const c of r.copied) OWN_COPIED.add(c.to.toLowerCase());
  console.log(`scripts of the mod's own for its civilizations: ${r.copied.length} copied (_${TAG}), ${r.skipped.length} left to the game's (${r.skipped.map(s => s.name).join(", ")})`);
  console.log(`  methods inherited from the game's classes whose script the mod edited: ${r.injected} <method> written inside ${r.touched} classes; behaviors inherited and left the game's: ${(r.behaviorsLeft || []).join("; ") || "none"}`);
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", "caesar-mod-civs-own-scripts.txt"), r.copied.map(c => `${c.from} -> ${c.to}  (${c.users.slice(0, 4).join(", ")}${c.users.length > 4 ? ", ..." : ""})`).join("\n") + "\n\nnot copied:\n" + r.skipped.map(s => `${s.name}: ${s.why}`).join("\n") + "\n\nbehaviors inherited from the game's classes, edited by the mod and left the game's:\n" + (r.behaviorsLeft || []).join("\n") + "\n");
}

// 7. the game's files the mod replaced: only what is Greek, as patches; the rest, and hidden.txt, go
{
  const GREEK = /Greece|Greek|\bH[A-Z][a-z]|trainH\b|Athena|Aegle|Zeus|Circe|Hecate|Olympic|KAresGuard|Ares/;
  const { gameFilesToPatches } = require("./lib/independent.js");
  const r = gameFilesToPatches({ OUT, HD, GREEK, keep: /^$/ });
  console.log(`game files: ${r.patches.length} became patches, ${r.dropped.length} left out`);
  fs.writeFileSync(path.join(ROOT, "raw", "caesar-mod-civs-left-out.txt"), r.dropped.join("\n") + "\n\n" + r.report.join("\n") + "\n");
}
// the mod's const.ini tunes the game for everybody (player colors, language, raids...): not a civilization's. What is Greece's is the names of its heroes
// (MName00x of the old slot -> HName00x); the keys the game does not have are read only by the mod's own scripts: they are added
{
  const cp0 = path.join(SCRATCH, "caesar-const.ini");
  if (fs.existsSync(cp0)) {
    const keys = t => new Set([...t.matchAll(/^\s*(\w+)\s*=/gm)].map(m => m[1].toLowerCase())), hdKeys = keys(rd(find(HD, "DATA/CONST.INI")));
    const mine = rd(cp0), names = [...mine.matchAll(/^\s*MName(00\d)\s*=\s*(.+?)\s*$/gm)].map(m => `HName${m[1]} = ${m[2]}`);
    const gp = (mine.match(/^\[GamePlay\][^]*?(?=^\[|(?![^]))/m) || [""])[0], added = [...gp.matchAll(/^\s*(\w+)\s*=.*$/gm)].filter(m => !hdKeys.has(m[1].toLowerCase()) && !/^(UI|Cinematics|Language|MName)/i.test(m[1])).map(m => m[0].trim());
    if (names.length || added.length) wr(path.join(OUT, "patches", "DATA", "CONST.INI"), `[GamePlay]\r\n${[...names, ...added].join("\r\n")}\r\n`);
    console.log(`const.ini: ${names.length} Greek hero names and ${added.length} keys of the mod's scripts; the mod's tuning of the game left out`);
  }
}
// StaminaBoostSound: a feedback class nothing declares (the Greek priest's idle scripts); the game's own is "StaminaBoost"
{
  const SUB = find(OUT, "DATA/SUBAI"); let n = 0;
  for (const f of fs.readdirSync(SUB).filter(f => /\.vs$/i.test(f))) { const p = path.join(SUB, f), t = rd(p); if (/StaminaBoostSound/.test(t)) { wr(p, t.replace(/StaminaBoostSound/g, "StaminaBoost")); n++; } }
  console.log(`StaminaBoostSound -> StaminaBoost in ${n} scripts`);
}

// 8. Greece's prefix: the mod's H* classes (and the pieces) are Kgr*. Every text of the port that names a Greek class by id follows (classes, commands, scripts, AI, patches);
// a name inside a path (an entity folder, a picture) stays. The two commands the engine builds from the prefix are renamed too (trainpeasant<prefix in lowercase>, hirehero<prefix>)
const gid = id => id === "GreekHero" ? "KgreeceHero" : /^H([A-Z]|house)/.test(id) ? GP + id.slice(1) : GP + id;   // MercenaryHHoplite -> KgrMercenaryHHoplite, as clone-civs.js does for the clones' extras
const idMap = new Map([...greekIds].map(id => [id, gid(id)]));
{
  const re = new RegExp(`(?<![A-Za-z0-9_/\\\\.])(${[...idMap.keys()].sort((a, b) => b.length - a.length).join("|")})(?![A-Za-z0-9_/\\\\]|\\.(?:bmp|wav|ogg|mp3|rle|xml|pass|ini|vs|txt|avi)\\b)`, "g");
  const cmdRe = /(?<![A-Za-z0-9_])(trainpeasanth|hireheroH)(?![A-Za-z0-9_])/g, cmdTo = { trainpeasanth: "trainpeasant" + GP.toLowerCase(), hireheroH: "hirehero" + GP };
  const ren = t => t.replace(re, m => idMap.get(m)).replace(cmdRe, m => cmdTo[m]);
  let n = 0;
  for (const f of walk(OUT).filter(f => /^(DATA|patches\/DATA)\//i.test(f) && /\.(xml|vs|ini)$/i.test(f))) { const p = path.join(OUT, f), s = rd(p), t = ren(s); if (t !== s) { wr(p, t); n++; } }
  for (const f of fs.readdirSync(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const id = classOf(rd(path.join(CLASSES, f))); if (id && `${id.toUpperCase()}.SC.XML` !== f.toUpperCase()) fs.renameSync(path.join(CLASSES, f), path.join(CLASSES, `${id.toUpperCase()}.SC.XML`)); }
  global.CAE_REN = ren; global.CAE_IDRE = re;
  console.log(`Greece: ${idMap.size} classes renamed H* -> ${GP}*, ${n} files rewritten`);
}

// 9. the declarations: Greece (its own race, in no one's slot) and the clones' (written by clone-civs.js)
{
  const alias = {};
  for (const [id, nid] of idMap) { const m = id.match(/^H(.+)$/); if (m && fs.existsSync(path.join(CLASSES, `${nid.toUpperCase()}.SC.XML`))) alias[`M${m[1]}`] = nid; }
  for (const [m, h] of pieces) if (!m.startsWith("#")) alias[m] = idMap.get(h);
  // `letter` is written: a declaration without it takes its base's prefix (sdk civilizations.md: "Omit it to inherit the base's prefix"), not one derived from the id; the nine
  // declarations the clone tool writes carry theirs
  const j = { id: GREECE, base: "ImperialRome", letter: GP, name: { spanish: `Grecia (${LABEL})`, english: `Greece (${LABEL})`, italian: `Grecia (${LABEL})` }, template: TEMPLATE, ai: true, alias: { classes: alias, commands: {} } };
  fs.mkdirSync(path.join(OUT, "civs"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "civs", `${GREECE}.json`), JSON.stringify(j, null, 2) + "\n", "utf8");
}
// the game's packs the mod replaced (Packs/*.bfhp: the random map's towns) go; the Greek towns and villages in its RandomMapSettlements are templates of Greece's own
// ("Greek Caesar Town N") added by a patch
{
  const pack = find(OUT, "Packs/RandomMapSettlements.bfhp");
  if (pack) {
    const hpfs = require("./hpfs.js"), e = hpfs(fs.readFileSync(pack)).find(x => /maps\/1\/map\.obj\.xml$/i.test(x.path));
    const text = global.CAE_REN(e.read().toString("latin1").replace(/\r\n/g, "\n").replace(/\bM(Tower|Walls[NSEW]+|Gate\d)\b/g, "H$1"));
    const objRe = /<scriptobj\b[\s\S]*?\/>/g, out = [];
    let cursorX = 3000;
    for (let i = text.indexOf("<settlement"); i >= 0; i = text.indexOf("<settlement", i + 1)) {
      const xml = text.slice(i, text.indexOf("</settlement>", i) + 13), name = (/name="([^"]*)"/.exec(xml.slice(0, xml.indexOf(">"))) || [])[1];
      if (!name || !/^Imperial Roman (Town|Village)/.test(name)) continue;   // the mod's Imperial Roman towns and villages are the Greek ones (HTownhall, HVillage...)
      const objs = [...xml.matchAll(objRe)].map(m => ({ xml: m[0], x: +/\bx="(-?\d+)"/.exec(m[0])[1], y: +/\by="(-?\d+)"/.exec(m[0])[1] }));
      const minX = Math.min(...objs.map(o => o.x)), maxX = Math.max(...objs.map(o => o.x)), minY = Math.min(...objs.map(o => o.y)), maxY = Math.max(...objs.map(o => o.y));
      const dx = Math.round(cursorX + (maxX - minX) / 2 - (minX + maxX) / 2), dy = Math.round(26000 - (minY + maxY) / 2);
      const head = xml.slice(0, xml.indexOf(">") + 1).replace(/name="[^"]*"/, `name="${TEMPLATE}${name.slice("Imperial Roman".length)}"`);
      const body = objs.map((o, k) => "\t" + o.xml.replace(/(\bx=")-?\d+(")/, `$1${o.x + dx}$2`).replace(/(\by=")-?\d+(")/, `$1${o.y + dy}$2`).replace(/(\bnum=")\d+(")/, `$1${k}$2`).trim()).join("\n");
      out.push(`${head}\n${body}\n</settlement>`); cursorX += maxX - minX + 3000;
    }
    wr(path.join(OUT, "patches", "randommapsettlements", "maps", "1", "map.obj.xml"), `<patch>\n  <!-- Templates of ${TEMPLATE}: the Greek towns and villages of the Caesar Mod. Free area of the map: y 24192-27904 -->\n  <add select="/mapobject">\n${out.join("\n")}\n  </add>\n</patch>\n`);
    console.log(`${out.length} Greek templates (${TEMPLATE})`);
    if (cursorX - 3000 > 31000) console.log("the Greek templates do not fit in the free area");
  }
  for (const f of ["RandomMapSettlements.bfhp", "emptyadv.bfhp", "emptyscn.bfhp", "randommap.BFHP"]) { const p = find(OUT, `Packs/${f}`); if (p) fs.rmSync(p); }
}
// the maps of the pack that place classes of the mod: the Greek ones (8 of 69 maps) and the mod's own new classes of the clones (clone-civs.js renames those, but it writes a
// map back only if every entry fits the pages it had: the longer ids of ConquestRemake did not). Here an entry that does not fit is compacted (trailing blanks, CRLF)
{
  const hpfs = require("./hpfs.js"); let touched = 0, edits = 0, squeezed = 0; const problems = [];
  const modIds = new Set(fs.readdirSync(path.join(MERGED, "classes")).map(f => (classOf(rd(path.join(MERGED, "classes", f))) || "").toLowerCase()));
  const fresh = new Map();                                    // the mod's own id -> the clone's, for classes the game does not have
  for (const c of CIVS) for (const [o, n] of Object.entries(readJson(path.join(OUT, "civs", `${c.id}.json`)).alias.classes || {})) {
    const orig = modIds.has(o.toLowerCase()) ? o : modIds.has(o.slice(1).toLowerCase()) ? o.slice(1) : null;
    if (orig && !hdClass.has(orig.toLowerCase()) && !fresh.has(orig)) fresh.set(orig, n);   // two clones with one id (RVillager_Apollonia): the first; the maps place one
  }
  const freshRe = fresh.size ? new RegExp(`(?<![A-Za-z0-9_/\\\\.])(${[...fresh.keys()].sort((a, b) => b.length - a.length).join("|")})(?![A-Za-z0-9_/\\\\])`, "g") : null;
  const ren = t => { const g = global.CAE_REN(t); return freshRe ? g.replace(freshRe, m => fresh.get(m)) : g; };
  const squeeze = [t => t, t => t.replace(/[ \t]+(\r?\n)/g, "$1"), t => t.replace(/[ \t]+(\r?\n)/g, "$1").replace(/\r\n/g, "\n"), t => t.replace(/[ \t]+(\r?\n)/g, "$1").replace(/\r\n/g, "\n").replace(/\n[ \t]+/g, "\n")];
  for (const f of walk(OUT).filter(f => /^(scenarios|adventures|conquests)\/.*\.bfhp$/i.test(f))) {
    const p = path.join(OUT, f), buf = fs.readFileSync(p); let dirty = false;
    try {
      for (const e of hpfs(buf)) {
        if (!/\.(xml|vs)$/i.test(e.path)) continue;
        const t = e.read().toString("latin1"), n = ren(t); if (n === t) continue;
        let done = false, last;
        // an entry keeps the number of pages it has: compacted text is padded with blanks at the end up to the length it had
        for (let k = 0; k < squeeze.length && !done; k++) { try { const s = squeeze[k](n); e.write(Buffer.from(s.length < t.length ? s + " ".repeat(t.length - s.length) : s, "latin1")); done = true; if (k) squeezed++; } catch (err) { last = err; } }
        if (!done) throw last;
        dirty = true; edits++;
      }
    } catch (err) { problems.push(`${f}: ${err.message}`); continue; }
    if (dirty) { fs.rmSync(p); fs.writeFileSync(p, buf); touched++; }
  }
  console.log(`maps: ${fresh.size} classes of the mod's own and ${idMap.size} Greek ones renamed in ${touched} maps (${edits} files inside them, ${squeezed} compacted to fit)${problems.length ? "\n  NOT rewritten: " + problems.join("\n  ") : ""}`);
  report.push(...problems);
}

// 9b. Orders (commands and researches) that the port's scripts give or ask about by name and that exist nowhere: the mod added them to a command file of the game for a game BASE class
// (VILLAGE.XML: `repair village ai`, src BaseVillage; BLACKSMITH.XML: `Strengthen Stronghold Defences I/II`, src BaseBlacksmith), and the clones carry only the orders of their own
// classes (PORTING.md, step 6). Each becomes an order of the port's own, `<name> (cae)`, offered by the port's classes that derive from its sources (the Greek 2.6.1 does the same
// with `repair village ai (w26)`), and the scripts and the params of the other carried orders name it so. One that the mod does not have either stops the build (step 13). Before tagCollisions on purpose, so the pictures and class ids the orders name follow the renames. A source with no class in the port (the Stonehenge spells: that class is global) is not carried.
const CARRIED = [];
{
  const cmdRe = /<cmd\b[^>]*?\bname\s*=\s*"([^"]*)"[\s\S]*?<\/cmd>/g, mask = t => t.replace(/<!--[\s\S]*?-->/g, m => " ".repeat(m.length));
  const defs = new Map();
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) { const t = rd(path.join(MERGED, "commands", f)); for (const m of mask(t).matchAll(cmdRe)) defs.set(m[1], { text: t.slice(m.index, m.index + m[0].length), srcs: [...m[0].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }); }
  const have = new Set();
  for (const root of [find(HD, "DATA/COMMANDS"), find(OUT, "DATA/COMMANDS"), find(OUT, "patches/DATA/COMMANDS")].filter(Boolean)) for (const f of fs.readdirSync(root).filter(f => /\.xml$/i.test(f))) for (const m of mask(rd(path.join(root, f))).matchAll(cmdRe)) have.add(m[1].toLowerCase());
  for (const f of walk(OUT).filter(f => /^DATA\/CLASSES\/.*\.xml$/i.test(f))) for (const m of rd(path.join(OUT, f)).matchAll(/<method\b[^>]*?\bsig\s*=\s*"([^"]+)"/gi)) have.add(m[1].toLowerCase());
  for (const f of walk(HD_CLASSES).filter(f => /\.xml$/i.test(f))) for (const m of rd(path.join(HD_CLASSES, f)).matchAll(/<method\b[^>]*?\bsig\s*=\s*"([^"]+)"/gi)) have.add(m[1].toLowerCase());
  for (const f of walk(path.join(HD, "DATA")).filter(f => /\.vs$/i.test(f))) for (const m of rd(path.join(HD, "DATA", f)).replace(/\/\/[^\n]*/g, "").matchAll(/\b(?:SetCommand|ExecCmd|AddCommand)\s*\(\s*"([^"]+)"/g)) have.add(m[1].toLowerCase());   // the game's own orders given by name (spells)
  for (const f of walk(OUT).filter(f => /^DATA\/CLASSES\/.*\.xml$/i.test(f))) for (const m of rd(path.join(OUT, f)).matchAll(/<method\b[^>]*?\bsig\s*=\s*"([^"]+)"/gi)) have.add(m[1].toLowerCase());
  for (const f of fs.readdirSync(path.join(OUT, "civs"))) for (const k of Object.keys(readJson(path.join(OUT, "civs", f)).alias.commands || {})) have.add(k.toLowerCase());   // the AI names the base's order, the engine translates it
  const ORDER_CALL = /\b(?:AddCommand|SetCommand|SneakCommand|GetCmdStaminaCost|GetCmdCost|CmdCount|CmdEnable|CmdDisable|SetCmdEnable|GetCmdEnable|ExecCmd|AddDefCmd|Research|CanResearch|CanAfford|IsResearching|IsResearched)\s*\(\s*(?:true\s*,\s*|false\s*,\s*)?(?:[A-Za-z_][\w.]*\s*,\s*)?"([^"]+)"/g;
  const scripts = walk(OUT).filter(f => /^(DATA\/(SUBAI|AI|AI HELPERS|ITEMSCRIPTS)|patches\/DATA\/(SUBAI|AI))\/[^/]+\.vs$/i.test(f));
  const want = new Set();
  for (const f of scripts) for (const m of rd(path.join(OUT, f)).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ").matchAll(ORDER_CALL)) if (!have.has(m[1].toLowerCase()) && defs.has(m[1])) want.add(m[1]);
  for (let grew = true; grew;) { grew = false; for (const n of [...want]) for (const m of defs.get(n).text.matchAll(/\bparam\s*=\s*"([^"]*)"/g)) for (const tok of m[1].split(",").map(x => x.trim())) if (defs.has(tok) && !have.has(tok.toLowerCase()) && !want.has(tok)) { want.add(tok); grew = true; } }
  if (want.size) {
    const parent = new Map();
    for (const dir of [HD_CLASSES, find(OUT, "DATA/CLASSES")]) for (const f of walk(dir).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const s = rd(path.join(dir, f)), id = classOf(s); if (id) parent.set(id.toLowerCase(), ((s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase()); }
    const mine = [...walk(find(OUT, "DATA/CLASSES")).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f)).map(f => classOf(rd(path.join(find(OUT, "DATA/CLASSES"), f))))];
    const heirs = srcs => mine.filter(id => { for (let c = id.toLowerCase(), n = 0; c && n < 30; c = parent.get(c), n++) if (srcs.some(s => s.toLowerCase() === c)) return true; return false; });
    const nm = n => `${n} (${TAG})`, out = [];
    for (const n of want) {
      const d = defs.get(n), classes = heirs(d.srcs);
      if (!classes.length) { want.delete(n); continue; }
      let text = d.text.replace(/\bname\s*=\s*"[^"]*"/, `name="${nm(n)}"`).replace(/\bparam\s*=\s*"([^"]*)"/, (_m, v) => `param="${v.split(",").map(x => (want.has(x.trim()) ? x.replace(x.trim(), nm(x.trim())) : x)).join(",")}"`);
      text = text.replace(/[ \t]*<src\b[^>]*\/>[ \t]*\r?\n?/g, "").replace(/<\/cmd>\s*$/, `\t${classes.map(c => `<src obj="${c}"/>`).join("\n\t")}\n</cmd>`);
      out.push(text); CARRIED.push(`${n} -> ${nm(n)} (src ${d.srcs.join(", ")}; ${classes.length} classes of the port)`);
    }
    wr(path.join(find(OUT, "DATA/COMMANDS"), `${TAG.toUpperCase()}ORDERS.XML`), `<commands>\n${out.join("\n")}\n</commands>\n`);
    for (const f of scripts) { const p = path.join(OUT, f), s = rd(p); let t = s; for (const n of want) t = t.split(`"${n}"`).join(`"${nm(n)}"`); if (t !== s) wr(p, t); }
  }
  console.log(`orders the scripts name that only the mod's base-class sources had: ${CARRIED.length ? "\n  " + CARRIED.join("\n  ") : "none"}`);
}

// 10. the mod's conquests: a Conquests/<name>.bfhp or a ConquestMaps/<folder> at the path of the game's or of another port's is renamed, whatever the bytes
// (tools/lib/conquests.js; before tagCollisions, which renames the files of a folder one by one)
// every other port of the repository, from the main checkout and from this one (the names and files are compared with all of them, classes or not: a picture or a map
// collides too). Not `imperivm-legacy`: the old build is replaced by a new port that renames its own names.
// The ports that must be there: without them the names tagged differ from a build where they are (a worktree does not have the ones built only in the main checkout).
// CAESAR_MOD_NO_OTHERS=1 builds with what is found (the bytes then depend on that).
const REQUIRED_PORTS = ["cgwar", "greek-mod-1-8", "greek-civilization-mod", "mediterranevm-alpha", "mci", "secuter-fun-mod", "secuter-fun-mod-grecia"];
const PORTS = (() => {
  const found = new Map();
  for (const root of [path.join(MAIN, "ported"), path.join(ROOT, "ported")]) if (fs.existsSync(root)) for (const e of fs.readdirSync(root, { withFileTypes: true })) if ((e.isDirectory() || e.isSymbolicLink()) && !found.has(e.name) && fs.existsSync(path.join(root, e.name))) found.set(e.name, path.join(root, e.name));
  const missing = REQUIRED_PORTS.filter(n => !found.has(n));
  if (missing.length && process.env.CAESAR_MOD_NO_OTHERS !== "1") { console.error(`the ports ${missing.join(", ")} are not in ${path.join(MAIN, "ported")} or ${path.join(ROOT, "ported")}: build them there first (tools/mediterranevm-alpha.js, tools/port-140.js..., see each NOTES.md), or CAESAR_MOD_NO_OTHERS=1 to build without them (the names tagged differ)`); process.exit(1); }
  return [...found].filter(([n]) => n !== ID && n !== "imperivm-legacy").sort(([a], [b]) => (a < b ? -1 : 1)).map(([, p]) => p);
})();
console.log(`other ports compared: ${PORTS.length} (${REQUIRED_PORTS.filter(n => PORTS.some(p => path.basename(p) === n)).join(", ")} and ${PORTS.length - REQUIRED_PORTS.length} more); main checkout: ${MAIN}`);
{
  const r = require("./lib/conquests.js")({ OUT, others: [GD, ...PORTS], tag: TAG, label: LABEL });
  for (const c of r.done) console.log(`conquest ${c.from} -> ${c.to} (${c.folder})`);
  if (r.problems.length) { console.log("conquests, to check:\n  " + r.problems.join("\n  ")); report.push(...r.problems); }
}
// names another mod of ours (or the game's own adventures) already has with other bytes: this port's are renamed
{
  const { tagCollisions } = require("./lib/ported-patch.js");
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: TAG, others: [...PORTS, GD, HD].filter(fs.existsSync), mapLabel: LABEL, gameDirs: [HD], skip: /^(currentlang|ui\/menu|data\/interface\/menu|rle\.mmp\.tail$)/ });   // the graphics tail keeps its name: the sprites' headers point into it
    console.log(`own names (${TAG}), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
  // researches, orders and items two of these mods define under the same name: the name is the key of the research's state
  const { ownNames, tagNames } = require("./lib/ported-patch.js");
  const mine = ownNames(OUT, HD), clash = { cmds: new Set(), items: new Set() };
  for (const o of PORTS) { const t = ownNames(o, HD); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const names = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with the other Greek mods: ${clash.cmds.size} orders, ${clash.items.size} items -> "(${TAG})" in ${tagNames({ OUT, names, tag: TAG })} files`);
}
// pictures: tagCollisions rewrites a renamed file's references by file name alone and leaves broken ones behind (tools/lib/caesar-refs.js, after the AsvrMod's)
{ const fixed = require("./lib/caesar-refs.js").fixBmpRefs(OUT, HD); console.log(`picture references put back to the mod's own name: ${fixed.length}${fixed.length ? "\n  " + fixed.join("\n  ") : ""}`); }

// Exit points of the Greek barracks, gymnasium, temple and village (type 2: where the trained units appear). Checked against the building's own .PASS (the footprint, SDK lib/pass.js):
// the point has to be on a free cell that leads out of the footprint. Where the cell of a point is: x is 1 cell per 16 units from the origin cell 63, and y runs the other way at
// 1.5 cells... (ky = 1.5/16 per unit, found by testing the 192 type-2 points of the game's own buildings against their .PASS: free cells at ky 1.0: 138, at 1.5: 190, at 2.0: 163).
// The mod's temple has its point on a BLOCKED cell (at ky 1.0 and at 1.5). The barracks has the very point and footprint (md5 0273d53b) of the Greek Mod 1.8 and 2.x: ONE exit at
// the dead end of a corridor; there the units stayed stuck in one town layout and the move of that point from x=-32 to x=-16 worked in both layouts (maintainer, 2026-11-01, on the 2.5.3).
{
  const pass = require(path.join(process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk"), "tools", "lib", "pass.js"));
  const cell = (x, y, ky) => [63 + Math.round(x / 16), 64 + Math.ceil(-y * ky / 16)];
  const B = find(OUT, "BUILDINGS"), lines = [];
  for (const d of fs.readdirSync(B).filter(d => /^(HBARRACKS|HGYMNASIUM|HTEMPLE|HVILLAGE)(_cae)?$/i.test(d))) {
    const dir = path.join(B, d), ent = fs.readdirSync(dir).find(f => /\.ent\.xml$/i.test(f)), ps = fs.readdirSync(dir).find(f => /\.pass$/i.test(f));
    if (!ent || !ps) { report.push(`${d}: no .ent.xml or .pass`); continue; }
    const pbuf = fs.readFileSync(path.join(dir, ps)), g = pass.decode(pbuf), free = (a, b) => a >= 0 && b >= 0 && a < g.w && b < g.h && !g.cells[b * g.w + a];
    let a0 = g.w, a1 = -1, b0 = g.h, b1 = -1;
    for (let b = 0; b < g.h; b++) for (let a = 0; a < g.w; a++) if (g.cells[b * g.w + a]) { a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); }
    const out = (a, b) => a < a0 - 1 || a > a1 + 1 || b < b0 - 1 || b > b1 + 1;
    // does a walk over free cells (8 neighbours) from the cell leave the box of the footprint? how many steps
    const steps = (a, b) => { if (!free(a, b)) return -1; const seen = new Set([b * g.w + a]); let q = [[a, b]]; for (let n = 0; q.length && n < 400; n++) { const nx = []; for (const [x, y] of q) { if (out(x, y)) return n; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const X = x + dx, Y = y + dy; if (free(X, Y) && !seen.has(Y * g.w + X)) { seen.add(Y * g.w + X); nx.push([X, Y]); } } } q = nx; } return -1; };
    const n9 = (a, b) => { let n = 0; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (free(a + i, b + j)) n++; return n; };
    const ok = (x, y) => { const c1 = cell(x, y, 1), c2 = cell(x, y, 1.5); return free(...c1) && free(...c2) && steps(...c2) >= 0 && steps(...c1) >= 0 && n9(...c2) >= 6; };
    let t = rd(path.join(dir, ent)), changed = false;
    const md5pass = require("crypto").createHash("md5").update(pbuf).digest("hex").slice(0, 8);
    for (const m of [...t.matchAll(/<point idx="(\d+)" type="2" x="(-?\d+)" y="(-?\d+)"\/>/g)]) {
      const x = +m[2], y = +m[3], c1 = cell(x, y, 1), c2 = cell(x, y, 1.5), s2 = steps(...c2);
      let nx = x, ny = y, why = "";
      if (/BARRACKS/i.test(d) && md5pass === "0273d53b" && x === -32 && y === -50) { nx = -16; why = "the 1.8's and 2.x's barracks (same footprint, same single point): moved as in the 2.5.3, which worked in game"; }
      else if ((!free(...c1) || !free(...c2) || s2 < 0) && process.env.CAESAR_TEMPLE_EXIT !== "1") {
        // a type-2 point on a blocked cell: 12 of the 45 single-point buildings of the game are on one at 1 cell per 16 units in y and work; at 1.5 (which fits the game's points far
        // better) only 1 is. Nothing proves either way: unchanged. CAESAR_TEMPLE_EXIT=1 computes the nearest free point instead (the build of the first PR did that)
        why = "BLOCKED cell, untested, UNCHANGED";
      }
      else if (!free(...c1) || !free(...c2) || s2 < 0) {
        let best = null;
        for (let dx = -96; dx <= 96; dx++) for (let dy = -96; dy <= 96; dy++) { const dd = dx * dx + dy * dy; if ((!best || dd < best[0]) && ok(x + dx, y + dy)) best = [dd, x + dx, y + dy]; }
        if (best) { nx = best[1]; ny = best[2]; why = `the cell was blocked (${c1} at 1.0, ${c2} at 1.5): the nearest point that is free at both scales, leads out of the footprint and has 6 of 9 free cells around it. NOT tried in game`; } else why = "BLOCKED and no free point within 96 units";
      }
      const f = cell(nx, ny, 1.5);
      lines.push(`${d} point ${m[1]} type 2 (${x},${y}) cell ${c2}: ${free(...c2) ? "free" : "BLOCKED"}, ${s2} steps to leave the footprint's box${why ? (nx === x && ny === y ? ` -> ${why}` : ` -> (${nx},${ny}) cell ${f}, ${steps(...f)} steps: ${why}`) : ""}`);
      if (nx !== x || ny !== y) { t = t.replace(m[0], `<point idx="${m[1]}" type="2" x="${nx}" y="${ny}"/>`); changed = true; }
    }
    if (changed) wr(path.join(dir, ent), t);
  }
  console.log(`exit points (type 2) of the Greek buildings, against their .PASS:\n  ${lines.join("\n  ")}`);
  fs.writeFileSync(path.join(ROOT, "raw", "caesar-mod-civs-exit-points.txt"), lines.join("\n") + "\n");
}

// Sound entities: tagCollisions renames the files that collide with another port's (VOICEHHOPLITE.XML -> VOICEHHOPLITE_cae.XML) and rewrites the references that carry the file's
// extension; a class names its sounds without it (<sounds command="VoiceHHoplite"/>), so those stay and ask for a file nobody has (silent units). Same as the pictures: a name that
// does not resolve and has a `_cae` file of its own gets the suffix.
{
  const SE = find(OUT, "DATA/SOUND ENTITIES"), hdSE = find(HD, "DATA/SOUND ENTITIES"), mine = new Map(), have = new Set();
  for (const d of [SE, hdSE]) if (d) for (const f of fs.readdirSync(d)) have.add(f.replace(/\.xml$/i, "").toLowerCase());
  if (SE) for (const f of fs.readdirSync(SE)) { const m = /^(.*)_cae\.xml$/i.exec(f); if (m) mine.set(m[1].toLowerCase(), `${m[1]}_cae`); }
  const fixed = [];
  for (const f of walk(OUT).filter(f => /^DATA\/CLASSES\/.*\.xml$/i.test(f))) {
    const p = path.join(OUT, f), s = rd(p);
    const t = s.replace(/<sounds\b[^>]*\/?>/g, tag => tag.replace(/(\b\w+\s*=\s*")([^"/\\]+)"/g, (m, a, v) => (have.has(v.toLowerCase()) || !mine.has(v.toLowerCase())) ? m : (fixed.push(`${path.basename(f)} ${v} -> ${mine.get(v.toLowerCase())}`), `${a}${mine.get(v.toLowerCase())}"`)));
    if (t !== s) wr(p, t);
  }
  console.log(`sound references put on the mod's own _${TAG} file: ${fixed.length}`);
}

// Local/<language>/: the mod's files for one language. Shipped: the voices of units the game does not have (the Greek ones, the fisherman...), in the folder the sound entities
// name, and the texts the game's table lacks (loc/<language>.loc.xml: only keys that are not in the game's own table, so nothing of the game's is translated differently).
// Not shipped, because each replaces a file of the game for everybody who plays in that language: help.xml, tips.xml, splash.ini (the mod's intro), credits.txt (it is in
// Licenses/), the whole game.loc.xml (it renames the game's Imperial Rome to Greece, among others), the voices of the game's own units, and spanish.pak.
{
  const L = find(OUT, "Local"), lines = [];
  const hdUnits = new Set(fs.readdirSync(path.join(GD, "local-italian"), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name.toLowerCase()));
  const refs = new Set();
  for (const f of walk(OUT).filter(f => /^DATA\/SOUND ENTITIES\/.*\.xml$/i.test(f))) for (const m of rd(path.join(OUT, f)).matchAll(/CurrentLang[\\/]Voices[\\/]([^\\/"]+)[\\/]/gi)) refs.add(m[1].toLowerCase());
  const entries = file => { const t = fs.readFileSync(file); const s = t.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) || !/[\x80-\xff]/.test(t.toString("latin1")) ? t.toString("utf8") : (t.toString("utf8").includes("\ufffd") ? t.toString("latin1") : t.toString("utf8")); return [...s.matchAll(/<translationtableentry\b[^>]*?\/>/g)].map(m => ({ line: m[0], text: (m[0].match(/\btext="([^"]*)"/) || [])[1], context: (m[0].match(/\bcontext="([^"]*)"/) || [])[1] })).filter(e => e.text != null); };
  for (const lang of L ? fs.readdirSync(L, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name) : []) {
    const dir = path.join(L, lang), hdTable = { spanish: path.join(GD, "local-spanish", "CURRENTLANG", "GAME.LOC.XML"), italian: path.join(GD, "local-italian", "CURRENTLANG", "GAME.LOC.XML") }[lang];
    const tbl = find(dir, "GAME.LOC.XML");
    if (tbl && hdTable && fs.existsSync(hdTable)) {
      const base = e => e.text.split("@")[0], hd = new Set(entries(hdTable).map(base)), keep = entries(tbl).filter(e => !hd.has(base(e)) && !/^(Imparial Rome|Imperial Roman|Republican Roman)$/.test(e.text));   // a text the game has, with any context, is the game's (the mod's change of it is global); so are the three that rename the game's Roman civilizations
      if (keep.length) { fs.mkdirSync(path.join(OUT, "loc"), { recursive: true }); fs.rmSync(path.join(OUT, "loc", `${lang}.loc.xml`), { force: true }); fs.writeFileSync(path.join(OUT, "loc", `${lang}.loc.xml`), `<translationtable>\n${keep.map(e => e.line).join("\n")}\n</translationtable>\n`, "utf8"); }
      lines.push(`${lang}: ${keep.length} of ${entries(tbl).length} texts are new (loc/${lang}.loc.xml)`);
    } else lines.push(`${lang}: no game table to compare with: texts not shipped`);
    for (const n of ["GAME.LOC.XML", "HELP.XML", "TIPS.XML", "SPLASH.INI", "CREDITS.TXT"]) { const p = find(dir, n); if (p) fs.rmSync(p); }
    const V = find(dir, "VOICES"); let kept = 0, gone = 0;
    for (const u of V ? fs.readdirSync(V) : []) {
      if (hdUnits.has(u.toLowerCase())) { fs.rmSync(path.join(V, u), { recursive: true }); gone++; continue; }
      if (refs.has(`${u}_${TAG}`.toLowerCase()) && !refs.has(u.toLowerCase())) fs.renameSync(path.join(V, u), path.join(V, `${u}_${TAG}`));
      kept++;
    }
    lines.push(`${lang}: ${kept} voice folders of units the game lacks kept, ${gone} of the game's units left out`);
  }
  for (const f of ["Local/spanish.pak", "Movies/Intro.avi"]) { const p = find(OUT, f); if (p) fs.rmSync(p); }
  console.log(`Local/: \n  ${lines.join("\n  ")}`);
}

// 11. hand fixes of this mod (extras/caesar-mod-civs/): mod.json with the credits, the license files
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }
// the engine writes .fingerprint in an installed mod's folder (and Windows leaves desktop.ini): never part of the port
for (const f of walk(OUT).filter(f => /(^|\/)(\.fingerprint|desktop\.ini|thumbs\.db)$/i.test(f))) fs.rmSync(path.join(OUT, f));
// a <method>/<behavior> that names a script neither the mod nor the game has: the game could not run it
{
  const have = new Set([...walk(OUT), ...walk(HDDATA).map(f => "DATA/" + f)].map(f => f.toLowerCase())), SC = find(OUT, "DATA/CLASSES");
  let gone = 0; const dropped = [];
  for (const f of walk(SC).filter(f => /\.sc\.xml$/i.test(f))) {
    const p = path.join(SC, f), s = rd(p);
    const t = s.replace(/<(?:behavior|method)\b[^>]*?\b(?:script|vs)\s*=\s*"(data\/[^"]+\.vs)"[^>]*\/>[ \t]*/gi, (m, v) => (have.has(v.toLowerCase()) ? m : (gone++, dropped.push(`${f}: ${m.trim()}`), "")));
    if (t !== s) wr(p, t);
  }
  // listed, not silent: a method whose script is missing is a behavior of the mod that the port does not have
  fs.writeFileSync(path.join(ROOT, "raw", "caesar-mod-civs-dropped-methods.txt"), dropped.join("\n") + "\n");
  console.log(`${gone} inline method/behavior elements that name a script nobody has removed (raw/caesar-mod-civs-dropped-methods.txt)`);
}
// elements AFTER </class>: HD's parser refuses the whole class
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
// A class takes 8 <behavior> in all, the inherited ones included: the copy of a behavior the game's parent class also has (BaseTownhall: townhall_behavior_guard.vs, here
// ..._cae.vs) would run next to it; the copy goes and the game's behavior stays
{
  const parent = new Map(), beh = new Map(), file = new Map(), SC = find(OUT, "DATA/CLASSES");
  const behs = s => [...s.matchAll(/<behavior\b[^>]*?\bscript\s*=\s*"([^"]+)"[^>]*\/>/gi)].map(m => ({ tag: m[0], script: m[1] }));
  for (const [dir, own] of [[HD_CLASSES, false], [SC, true]]) for (const f of walk(dir).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) {
    const s = rd(path.join(dir, f)), id = classOf(s); if (!id) continue;
    parent.set(id.toLowerCase(), ((s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase());
    beh.set(id.toLowerCase(), behs(s)); if (own) file.set(id.toLowerCase(), path.join(dir, f));
  }
  const stem = v => path.basename(v).toLowerCase().replace(/\.vs$/, "").replace(new RegExp(`_${TAG}(_k[a-z]+)?$`), "");
  let removed = 0, touched = 0; const twins = {};
  for (const [id, p] of file) {
    const inherited = [];
    for (let c = parent.get(id), n = 0; c && n < 30; c = parent.get(c), n++) inherited.push(...(beh.get(c) || []).map(b => ({ ...b, owner: c })));
    const s = rd(p); let t = s;
    for (const b of beh.get(id)) {
      const twin = inherited.find(h => stem(h.script) === stem(b.script) && h.script.toLowerCase() !== b.script.toLowerCase());
      if (twin) { t = t.replace(b.tag, ""); removed++; (twins[twin.owner] ||= new Set()).add(`${stem(b.script)}`); }
    }
    const left = behs(t).map(b => b.tag);
    for (let over = left.length + inherited.length - 8, i = left.length - 1; over > 0 && i >= 0; i--) {
      if (new RegExp(`_${TAG}(_k[a-z]+)?\\.vs`, "i").test(left[i])) { t = t.replace(left[i], ""); over--; removed++; (twins["(over 8)"] ||= new Set()).add(`${id}: ${left[i].match(/script="([^"]+)"/)[1]}`); }
    }
    if (t !== s) { wr(p, t); touched++; }
  }
  console.log(`${removed} behaviors of the mod that the game's parent class already has removed from ${touched} classes`);
  for (const [o, s] of Object.entries(twins)) console.log(`  under ${o}: ${[...s].join(", ")}`);
}

// copies of a script (<name>_cae.vs) that every user replaced with a per-civilization one are not named by anything: they go
{
  const SUB = find(OUT, "DATA/SUBAI"), texts = walk(OUT).filter(f => /^(DATA|patches\/DATA)\/.*\.(xml|vs|ini)$/i.test(f)).map(f => rd(path.join(OUT, f)).toLowerCase()).join("\n");
  let n = 0;
  // only the copies own-scripts.js made (a script the mod ships that tagCollisions renamed `_cae` is not one of them: watch_eye_no_reveal_cae.vs was removed here by mistake)
  for (const f of fs.readdirSync(SUB).filter(f => OWN_COPIED.has(f.toLowerCase()))) if (!texts.includes(f.toLowerCase())) { fs.rmSync(path.join(SUB, f)); n++; }
  console.log(`${n} default copies of scripts that only per-civilization copies use removed`);
  // tagCollisions appends _cae to the editor-tree label of a class it renamed ("Roman Thermae_cae"): the label is not a name
  let m = 0;
  for (const f of walk(OUT).filter(f => /^DATA\/CLASSES\/.*\.xml$/i.test(f))) { const p = path.join(OUT, f), s = rd(p), t = s.replace(/(edittree_pos="[^"]*?)_cae(")/g, "$1$2"); if (t !== s) { wr(p, t); m++; } }
  console.log(`${m} editor-tree labels cleaned of the suffix`);
  // the same for the editor's lists (a key of the combo is a label, the picture it names is the mod's own), and a winter class file renamed "X.SC_cae.XML" (the game reads <ID>.SC.XML)
  let k = 0;
  // (a key is a label; the picture keeps `_cae` if a file of that name exists, as BHERO5_cae.BMP does: gameres/icons/X is UI/ICONS/X)
  for (const f of walk(OUT).filter(f => /^patches\/DATA\/INTERFACE\/EDITOR\/COMBO\/[^/]+\.INI$/i.test(f))) {
    const p = path.join(OUT, f), s = rd(p);
    const t = s.split("\n").map(l => l.replace(/^([^=\r]*?)(\s*=\s*)([^\r]*)/, (_m, key, eq, val) => `${key.replace(/_cae/g, "")}${eq}${val.replace(/gameres\/icons\/([^\r\n]*)/, (m2, name) => (/_cae/.test(name) && !find(OUT, `UI/ICONS/${name}`) ? m2.replace(/_cae/g, "") : m2))}`)).join("\n");
    if (t !== s) { wr(p, t); k++; }
  }
  const wd = find(OUT, "DATA/CLASSES/WINTER");
  for (const f of wd ? fs.readdirSync(wd).filter(f => /\.SC_cae\.XML$/i.test(f)) : []) {
    const to = path.join(wd, f.replace(/\.SC_cae\.XML$/i, "_CAE.SC.XML"));
    fs.renameSync(path.join(wd, f), to);
    wr(to, rd(to).replace(/(<class\b[^>]*?\bid\s*=\s*")([^"]+)"/, (m, a, id) => (id.endsWith("_cae") ? m : `${a}${id}_cae"`)));   // the class id is the other mods' too (ThermaeWinter)
  }
  console.log(`${k} editor lists cleaned of the suffix`);
}
// The mod's neutral scripts name classes that only exist as the clones' copies now (the Carthage tavern hires "MercenaryGHorseman", a Gaul class): a literal in a class-lookup
// call that is no class of the game or of this port and that exactly one clone class stands for is written as that class (two or more are left, the check reports them)
{
  const heirOf = new Map(), mod = new Set(fs.readdirSync(path.join(MERGED, "classes")).map(f => (classOf(rd(path.join(MERGED, "classes", f))) || "").toLowerCase()));
  const add = (o, n) => { const l = o.toLowerCase(); if (!heirOf.has(l)) heirOf.set(l, []); if (!heirOf.get(l).includes(n)) heirOf.get(l).push(n); };
  for (const c of CIVS) for (const [k, v] of Object.entries(readJson(path.join(OUT, "civs", `${c.id}.json`)).alias.classes || {})) {
    add(k, v); if (k[0] === c.baseLetter && !mod.has(k.toLowerCase()) && mod.has(k.slice(1).toLowerCase())) add(k.slice(1), v);
  }
  for (const [o, n] of idMap) add(o, n);
  const TABLE = classTable([HD_CLASSES, find(OUT, "DATA/CLASSES")]);
  let fixed = 0;
  const fix = text => text.split("\n").map(line => /^@/.test(line) ? line : line.replace(new RegExp(CLASS_CALL.source, "g"), call => call.replace(/"([A-Za-z][A-Za-z0-9_]*)"/g, (m, id) => {
    if (TABLE.has(id.toLowerCase())) return m;
    const c = heirOf.get(id.toLowerCase()); if (!c || c.length !== 1) return m;
    fixed++; return `"${c[0]}"`;
  }))).join("\n");
  for (const f of walk(OUT).filter(f => /^(DATA\/(SUBAI|AI|ITEMSCRIPTS)|patches\/DATA\/(SUBAI|AI))\/[^/]+\.vs$/i.test(f))) { const p = path.join(OUT, f), t = rd(p), u = fix(t); if (u !== t) wr(p, u); }
  console.log(`class ids written as text: ${fixed} literals rewritten as the clone's`);
}

// The mod's scripts test the game's civilizations by race and by class (`.race == Britain`, `.IsHeirOf("BVikingLord")`, `Count(player, "TTeutonWolf")`); the race of a clone's object is
// the clone's and its classes are copies, not children of the game's, so each test also accepts the clones (the same as AsvrMod VII's, tools/asvrmod-vii.js: `heirTests`). Scripts that
// only one civilization's classes use and that the game does not have (UNIT_CONVERT_TTEUTONRIDER.VS: Mutate("TTeutonArcher")) name that clone's classes instead.
// Not the AI: the game's AI sees a clone as its base and the engine translates the names.
{
  const RACE_CONST = { Gaul: ["Kgaul"], Britain: ["Kbritain"], Iberia: ["Kiberia"], Egypt: ["Kegypt"], Germany: ["Kgermany"], Carthage: ["Kcarthage"], RepublicanRome: ["Krepublic", "Kimperial", "Kpunic"], ImperialRome: [GCONST] };
  const RACE_RE = new RegExp(String.raw`((?:[A-Za-z_]\w*(?:\[[^\]]*\])?(?:\(\))?(?:\.[A-Za-z_]\w*(?:\(\))?)*)?)\.race\s*(==|!=)\s*(${Object.keys(RACE_CONST).join("|")})\b`, "g");
  const raceTests = text => text.replace(RACE_RE, (m, r, op, b) => {
    const o = (r || "This").replace(/\.As(?:Unit|Building)(?:\(\))?$/, "");
    return op === "==" ? `(${m} || ${RACE_CONST[b].map(c => `Mod_TrueRace(${o}) == ${c}`).join(" || ")})` : `(${m} && ${RACE_CONST[b].map(c => `Mod_TrueRace(${o}) != ${c}`).join(" && ")})`;
  });
  const heirOf = new Map(), KNOWN = classTable([HD_CLASSES, find(OUT, "DATA/CLASSES")]), modIds = new Set(fs.readdirSync(path.join(MERGED, "classes")).map(f => (classOf(rd(path.join(MERGED, "classes", f))) || "").toLowerCase()));
  const addHeir = (o, n) => { const l = o.toLowerCase(); if (!heirOf.has(l)) heirOf.set(l, []); if (!heirOf.get(l).includes(n)) heirOf.get(l).push(n); };
  const aliasOf = new Map();                                    // civ id -> { staged id -> clone id }
  for (const c of CIVS) {
    const al = readJson(path.join(OUT, "civs", `${c.id}.json`)).alias.classes || {}; aliasOf.set(c.id, al);
    for (const [k, v] of Object.entries(al)) { addHeir(k, v); if (k[0] === c.baseLetter && !modIds.has(k.toLowerCase()) && modIds.has(k.slice(1).toLowerCase()) && !hdClass.has(k.toLowerCase())) addHeir(k.slice(1), v); }
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
  // the new scripts (the game has none of that name) that the classes of exactly one civilization name: that clone's classes
  const hdSub = new Set(fs.readdirSync(find(HD, "DATA/SUBAI")).map(f => f.toLowerCase()));
  const owner = f => { const c = CIVS.find(c => new RegExp(`^${c.id[0].toUpperCase() + c.id.slice(1, 3)}`, "i").test(f)); return c && c.id; };
  const users = walk(path.join(OUT, "DATA")).filter(f => /^(CLASSES|COMMANDS)\//i.test(f.replace(/^DATA\//i, "")) && /\.xml$/i.test(f) || /^CLASSES\/|^COMMANDS\//i.test(f)).map(f => [path.basename(f), rd(path.join(OUT, "DATA", f)).toLowerCase()]);
  const map = require("./lib/own-scripts.js").classMapper({ OUT, HD, modClasses: path.join(SRC, "DATA", "CLASSES") });
  let single = 0, tests = 0;
  for (const dirName of ["SUBAI", "ITEMSCRIPTS"]) {
    const dir = find(OUT, `DATA/${dirName}`); if (!dir) continue;
    for (const f of fs.readdirSync(dir).filter(f => /\.vs$/i.test(f))) {
      const p = path.join(dir, f); let t = rd(p);
      if (dirName === "SUBAI" && !hdSub.has(f.toLowerCase()) && !new RegExp(`_${TAG}(_k[a-z]+)?\\.vs$`, "i").test(f)) {
        const owners = new Set(users.filter(([, txt]) => txt.includes(f.toLowerCase())).map(([n]) => owner(n))); owners.delete(undefined);
        if (owners.size === 1) { const c = CIVS.find(c => owners.has(c.id)), L = c.id[0].toUpperCase() + c.id.slice(1, 3), u = map(t, { id: c.id, letter: L, from: [c.baseLetter, ...(c.baseLetter === "R" ? ["M"] : [])] }); if (u !== t) { t = u; single++; } }
      }
      const u = heirTests(raceTests(t)); if (u !== t) { tests++; t = u; }
      if (t !== rd(p)) wr(p, t);
    }
  }
  console.log(`scripts only one civilization uses, with that clone's classes: ${single}; ${tests} scripts whose race/class tests also accept the clones`);
}

// 11b. Branch flags in the AI. The mod's AI asks `IsResearched(set, "ChooseImperialRome")` to know which Rome it plays; here the branch is the civilization, so the test is
// `Mod_PlayerCiv(set.player) == Kimperial` (false for everybody else, as before). The choice itself (`ChooseRomanRace` is never 1 for a civilization that is not a branch,
// so the block that picks a Rome with rand(3) and researches it ran at the start of every CAE_ES_Stronghold, with a Sleep(500)) is not ported: the block goes.
{
  const BR = { Republican: "Krepublic", Imperial: "Kimperial", Punic: "Kpunic" };
  const cut = (t, start) => { const i = t.search(start); if (i < 0) return [t, 0]; let j = t.indexOf("{", i), d = 0; for (let k = j; k < t.length; k++) { if (t[k] === "{") d++; else if (t[k] === "}" && --d === 0) { j = k + 1; break; } } return [t.slice(0, i) + t.slice(j), 1]; };
  let flags = 0, blocks = 0; const files = [];
  for (const f of walk(OUT).filter(f => /^(DATA\/(AI|AI HELPERS)|patches\/DATA\/AI)\/[^/]+\.vs$/i.test(f))) {
    const p = path.join(OUT, f); let t = rd(p); const t0 = t;
    let k; do { [t, k] = cut(t, /if\s*\(\s*EnvReadInt\(\s*set\s*,\s*"ChooseRomanRace"\s*\)\s*!=\s*1\s*\)\s*\{/); blocks += k; } while (k);
    t = t.split("\n").map(l => (/^@/.test(l) ? l : l.replace(/\bIsResearched\(\s*([\w.()]+?)\s*,\s*"Choose(Republican|Imperial|Punic)Rome"\s*\)/g, (_m, s, b) => { flags++; return `(Mod_PlayerCiv(${s}.player) == ${BR[b]})`; }))).join("\n");
    if (t !== t0) { wr(p, t); files.push(path.basename(f)); }
  }
  console.log(`branch flags in the AI: ${flags} tests of ChooseXxxRome are the civilization now, ${blocks} block that chose a Rome removed (${files.length} scripts)`);
}

// 11d. The mod added a method to a game class that no clone has (WatchEye: `no_reveal`, watch_eye_no_reveal.vs; the taverns' scout area places a `WatchEyeBig` and gives it that
// order). WatchEyeBig is a class of the port and derives from the game's WatchEye, which lacks the method: it gets the method and the script ships (its name as tagCollisions left it).
{
  const wc = find(OUT, "DATA/CLASSES/WATCHEYEBIG.SC.XML"), SUB = find(OUT, "DATA/SUBAI"), sc = SUB && fs.readdirSync(SUB).find(f => /^watch_eye_no_reveal(_cae)?\.vs$/i.test(f));
  if (wc && sc) { const s = rd(wc); if (!/sig="no_reveal"/i.test(s)) wr(wc, s.replace(/(<class\b[^>]*>)/, `$1\n\t<method sig="no_reveal" vs="data/subai/${sc}"/>`)); console.log(`WatchEyeBig: method no_reveal -> ${sc}`); }
  else report.push(`WatchEyeBig / watch_eye_no_reveal.vs not found (${!!wc}, ${!!sc})`);
}

// 11e. Random-map pictures: a picture in a folder the game has (RandomMap/Mediterranean/) joins the game's own pool for everybody and the game draws from it; the templates
// of the mod that used them are left out (global). Only the folders the game does not have stay (RandomMap/Competitive/, for the template shipped with it).
{
  const hdRM = find(HD, "RANDOMMAP"), rm = find(OUT, "RANDOMMAP"), gone = [];
  for (const d of rm ? fs.readdirSync(rm, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name) : []) if (hdRM && find(hdRM, d)) { for (const f of walk(path.join(rm, d))) { fs.rmSync(path.join(rm, d, f)); gone.push(`RANDOMMAP/${d}/${f}`); } }
  fs.writeFileSync(path.join(ROOT, "raw", "caesar-mod-civs-random-map-pictures.txt"), gone.join("\n") + "\n");
  console.log(`random-map pictures in the game's own folders left out: ${gone.length} (raw/caesar-mod-civs-random-map-pictures.txt)`);
}

// 11f. Two files whose names differ only by case in one folder cannot live together on Windows or in a zip: the same bytes keep one (the first in name order); other bytes stop the build.
{
  const groups = new Map();
  for (const f of walk(OUT)) { const k = f.toLowerCase(); (groups.get(k) || groups.set(k, []).get(k)).push(f); }
  let n = 0;
  for (const g of [...groups.values()].filter(g => g.length > 1).map(g => g.sort())) {
    if (new Set(g.map(f => md5(path.join(OUT, f)))).size > 1) { console.error(`files that differ only by case, with other bytes: ${g.join(" | ")}`); process.exit(1); }
    for (const f of g.slice(1)) { fs.rmSync(path.join(OUT, f)); n++; }
  }
  console.log(`files that differ only by case (same bytes, one kept): ${n}`);
}

// 12. offline checks of every script this build writes (nothing compiles them but the game, and a patch of the game's own that does not compile stops that script for EVERY
// civilization). The build stops on a problem.
{
  const problems = [], vs = f => /\.vs$/i.test(f), TABLE = classTable([HD_CLASSES, find(OUT, "DATA/CLASSES")]);
  const stem = n => n.replace(/^CAE_/i, "").replace(new RegExp(`_${TAG}(_k[a-z]+)?(?=\\.vs$)`, "i"), "");
  const pristineFor = (dir, name) => { const d = find(SRC, `DATA/${dir}`); if (!d) return null; const w = stem(name).toLowerCase(), h = fs.readdirSync(d).find(x => x.toLowerCase() === w); return h && path.join(d, h); };
  let copies = 0, patchesChecked = 0, strings = 0; const bases = new Set();
  for (const dir of ["SUBAI", "ITEMSCRIPTS", "ESPECIALIDADES", "RANGOS", "AI"]) {
    const d = find(OUT, `DATA/${dir}`); if (!d) continue;
    for (const f of fs.readdirSync(d).filter(vs)) {
      const src = pristineFor(dir, f), t = rd(path.join(d, f));
      if (src) { checkBalance(t, removeStrayBraces(rd(src)).text, `DATA/${dir}/${f}`, problems); copies++; } else checkBalance(t, t, `DATA/${dir}/${f}`, problems);
      checkAbsolute(t, `DATA/${dir}/${f}`, problems);
    }
  }
  const pdir = find(OUT, "patches/DATA"), pdirs = pdir ? fs.readdirSync(pdir).filter(d => fs.statSync(path.join(pdir, d)).isDirectory()) : [];
  for (const dir of pdirs) {
    if (!/^(SUBAI|AI)$/i.test(dir)) continue;
    for (const f of fs.readdirSync(path.join(pdir, dir)).filter(vs)) {
      const hdf = find(HDDATA, `${dir}/${f}`), label = `patches/DATA/${dir}/${f}`;
      if (!hdf) { problems.push(`${label}: the game has no such script`); continue; }
      const patch = rd(path.join(pdir, dir, f)), hd = rd(hdf), r = applyPatch(hd, patch);
      for (const e of r.errors) problems.push(`${label}: ${e}`);
      for (const blk of patch.split(/^@.*$/m).slice(1)) { const n = net(blk); if (n["("] || n["{"] || n["["]) problems.push(`${label}: a block is unbalanced ((${n["("]} {${n["{"]} [${n["["]})`); }
      checkBalance(r.text, hd, label, problems);
      { const a = [], b = [], kind = x => x.replace(/^[^:]*?(\(\d+\))?:/, ""); checkAbsolute(r.text, label, a); checkAbsolute(hd, label, b); const known = new Set(b.map(kind)); problems.push(...a.filter(x => !known.has(kind(x)))); }
      patchesChecked++;
    }
  }
  const sources = [];
  for (const dir of ["SUBAI", "ITEMSCRIPTS", "ESPECIALIDADES", "RANGOS", "AI"]) { const d = find(OUT, `DATA/${dir}`); if (d) for (const f of fs.readdirSync(d).filter(vs)) sources.push([`DATA/${dir}/${f}`, rd(path.join(d, f))]); }
  for (const dir of pdirs) for (const f of fs.readdirSync(path.join(pdir, dir)).filter(vs)) sources.push([`patches/DATA/${dir}/${f}`, rd(path.join(pdir, dir, f))]);
  for (const [label, text] of sources) for (const { fn, id } of classStrings(text)) {
    strings++;
    if (!TABLE.has(id.toLowerCase()) && id === "TBarrackHorse") continue;   // "TBarrackHorse" + i: TBarrackHorse1..5 are the mod's (checked)
    // the mod's generic mule scripts test the Roman shipyard too; Greece and Germany use these copies and never have one (the Roman civilizations use their own copies)
    if (!TABLE.has(id.toLowerCase()) && fn === "IsHeirOf" && id === "RomanShipyard" && /create_(food|gold)_mule_(big|small)_cae\.vs$/.test(label)) continue;
    if (!TABLE.has(id.toLowerCase())) problems.push(`${label}: ${fn}("${id}") names a class neither the game nor this port has`);
    else if (fn === "GetRandomHeroClass") bases.add(id);
  }
  for (const b of bases) { const w = heroBaseProblem(TABLE, b); if (w) problems.push(`GetRandomHeroClass("${b}"): ${w}`); }
  { const info = {}; problems.push(...require("./lib/caesar-refs.js").checkRefs(OUT, HD, info)); console.log(`picture references: ${info.checked} checked, ${info.allowed.length} allowed (the mod's own: ${info.allowed.join(", ")})`); }
  console.log(`script checks: ${copies} copies/rewrites balanced like the mod's, ${patchesChecked} patches applied to the game's script and balanced, ${strings} class strings resolved, hero bases: ${[...bases].sort().join(" ")}`);
  if (problems.length) { fs.writeFileSync(path.join(SCRATCH, "caesar-problems.txt"), [...new Set(problems)].join("\n") + "\n"); console.error(`SCRIPT CHECKS FAILED (${[...new Set(problems)].length}), all in .scratch/caesar-problems.txt:\n  ` + [...new Set(problems)].slice(0, 60).join("\n  ")); process.exit(1); }
}

// What the mod changed in the game's classes that no clone took and that is not a base class the clones inherit (those are written inside each clone): neutral objects, animals,
// the outposts, ships... It is global and waits for a rules pack (AGENTS.md, "World rules packs"): raw/caesar-mod-civs-global.md
{
  const cloned = new Set(), parentOf = new Map();
  for (const f of fs.readdirSync(path.join(OUT, "civs"))) for (const k of Object.keys(readJson(path.join(OUT, "civs", f)).alias.classes || {})) cloned.add(k.toLowerCase());
  for (const [dir, ] of [[HD_CLASSES], [path.join(MERGED, "classes")]]) for (const f of walk(dir).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const s = rd(path.join(dir, f)), id = classOf(s); if (id) parentOf.set(id.toLowerCase(), ((s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase()); }
  const inherited = new Set();
  for (const c of cloned) for (let p = parentOf.get(c), n = 0; p && n < 30; p = parentOf.get(p), n++) inherited.add(p);
  const base = [], other = [];
  for (const [id, els] of Object.entries(baseChanges)) { if (cloned.has(id)) continue; (inherited.has(id) ? base : other).push(`${id} (${els.length})`); }
  fs.writeFileSync(path.join(ROOT, "raw", "caesar-mod-civs-global.md"), `# Caesar Mod: what the mod changed in the game's classes and is not in the civilizations pack\n\nFrom the build of tools/caesar-mod.js (elements of the mod's class that the game's class lacks, in parentheses). Waits for a rules pack (AGENTS.md, *World rules packs*).\n\n## Base classes the clones inherit: written inside each clone, ${base.length}\n\n${base.sort().join(", ")}\n\n## Classes no clone took: neutral objects, animals, ships, outposts... ${other.length}\n\n${other.sort().join(", ")}\n`);
  console.log(`global: ${base.length} base classes (inside the clones), ${other.length} classes no clone took -> raw/caesar-mod-civs-global.md`);
}

// 13. The NAMES the scripts use (tools/lib/caesar-names.js, the Greek 2.x's checker with two fixes): a script, an order, a research or an identifier that exists nowhere stops that
// script in the game ("No matching function with name X"). A call to something that exists nowhere stops the build.
{
  const r = require("./lib/caesar-names.js").checkNames({ OUT, HD, SDK: process.env.SDK });
  console.log(r.notes.join("\n"));
  if (r.errors.length) { fs.writeFileSync(path.join(SCRATCH, "caesar-names.txt"), r.errors.join("\n") + "\n"); console.error(`NAME CHECKS FAILED (${r.errors.length}), all in .scratch/caesar-names.txt:\n  ${r.errors.slice(0, 60).join("\n  ")}`); process.exit(1); }
}

// folders the steps above left empty
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log(`done: ${walk(OUT).length} files in ported/${ID}`);
