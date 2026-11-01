// The three versions of Rattlesmake's Greek Mod continued by MediterranevmTeam that are ported (rows 385, 257, 258 of docs/MODS.md), for
// tools/greek-2x-source.js (the standalone game folder -> a flat folder -> tools/port-140.js) and tools/greek-2x.js (the civilizations).
//   dir     the port's folder and mod id           name   the room's set (mod.json `name`: the mod's name WITH its version)
//   tok     the id token reserved for the line     tag    the suffix of the files that collide with another port, and of the scripts' copies
//   ai      the prefix of the AI copies            label  what the lobby's names end with: <civ> (<label>), at most ~22 characters
//   download the file (a .zip, or the Inno Setup installer: run under wine)   inner  the game folder inside it ("" if it is the folder itself)
//   work    where the sources are laid out in work/   letters  the explicit prefix (up to 4 characters, civilizations.md, *Prefix convention*) of each civilization
//           when the derived ones (the first 3 characters of the id) would clash: w5gaul, w5germany and w5greece all give "W5g"   template  Greece's random map template
//           (letters and spaces only)   legacyLeft  the files byte-identical to Imperivm Legacy's are left out (tools/greek-2x-legacy.js)
// Nothing is written under originals/: everything goes to work/ (git-ignored).
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
// Where the files this build needs but the branch does not carry are. ROOT is the worktree the tool runs in, which may sit anywhere (next to the main checkout, or under
// its .wt/), so nothing is looked up as ROOT/../<sibling>: the MAIN checkout (the parent of the git common dir) is asked too. Found out by a clean worktree under
// community-mods/.wt/ that built the 2.3 WITHOUT Imperivm Legacy's names (176 files different): ROOT/../community-mods/ported/imperivm-legacy does not exist there.
const fs = require("fs"), cp = require("child_process");
const MAIN = (() => { try { return path.dirname(path.resolve(ROOT, cp.execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim())); } catch { return ROOT; } })();
const firstThere = list => list.find(p => p && fs.existsSync(p));
// the SDK of imperivm-resurrected (env SDK overrides): the repository next to the main checkout
const SDK = process.env.SDK || firstThere([path.join(ROOT, "..", "imperivm-resurrected", "sdk"), path.join(MAIN, "..", "imperivm-resurrected", "sdk")]) || path.join(ROOT, "..", "imperivm-resurrected", "sdk");
// the folder of the ports that the branch does not carry (git-ignored there): Imperivm Legacy, whose names every build compares with (env LEGACY_PORTED overrides)
const LEGACY_PORTED = [process.env.LEGACY_PORTED, path.join(MAIN, "ported"), path.join(ROOT, "..", "community-mods", "ported")].filter(Boolean);
// The conflicts of git merge-file (HD, the 1.40 the mod started from, the mod) that tools/port-140.js settled with the mod's side and that cannot stay so,
// decided by hand, in order: "cur" = HD's side, "oth" = the mod's, a string, or a function (cur, oth) -> text. Only scripts (the XML files keep port-140.js's
// attribute by attribute merge). An undecided conflict, or a decision with no conflict, stops tools/greek-2x.js.
const RESOLVE_23 = {
  // the mod's random for the level a unit gains (rand(4)), HD's comment
  "DATA/SUBAI/MILITARY_ONDIE.VS": ["exp = 1; // level to add\r\nrandom = rand(4);\r\n"],
  // 1. the Supplies research (Greek), before Tribute; 2. HD's Gambling (food, and it already explores the area: the mod's is the 1.40 text); 3. the Greek
  // researches Trade Routes and Strengthen Stronghold Gates, after HD's 4500 (the mod's 6000 is the 1.40 value)
  "DATA/SUBAI/ONFINISH_RESEARCH.VS": ["oth", "cur", (_cur, oth) => oth.replace(/ExploreCircle\(\.player, \.pos, 6000\);/, "ExploreCircle(.player, .pos, 4500);")],
  // HD's text (it has the mod's Peasant test already) and the mod's line about the share of control
  "DATA/SUBAI/UNIT_ATTACH_VERIFY.VS": [(cur, oth) => cur.replace(/(return true;)/, oth.match(/^.*DiplGetShareControl.*\r?\n/m)[0] + "$1")],
  // the parry mode and ceasefire tests: the mod's
  "DATA/SUBAI/UNIT_CAPTURE.VS": ["oth"],
  // HD wrapped the veteran items in `if (!Victim.IsSentry) { ... }`: the mod's side dropped the line that opens the brace and kept the one that closes it
  // (the script did not compile). HD's wrapper stays, with the mod's level (>= 12; HD's is > 3); then the Statue of Zeus research (Greek), the mod's
  "DATA/SUBAI/UNIT_ON_KILL.VS": [cur => cur.replace(/inherentlevel > 3/, "inherentlevel >= 12"), "oth"],
  // the mod dropped the catapult's default commands (the parent has them); HD added the four infobar values, which stay
  "DATA/CLASSES/RCATAPULT.SC.XML": [cur => cur.replace(/[ \t]*<defaultcmd\b[\s\S]*?<\/defaultcmd>[ \t]*\r?\n/g, "")],
};
// 2.5.3 and 2.6.1 rewrote whole scripts that the 1.40 and HD both changed (86 and 121 conflicts, raw/port-140/): tools/greek-2x.js takes the mod's own whole script
// for every script with a conflict (wholeOnConflict), unless it is decided here. Nothing to decide for them yet.
const RESOLVE_25 = {};
const RESOLVE_26 = {};
const SUFFIXES = ["greece", "rome", "imperial", "punic", "gaul", "carthage", "britain", "iberia", "egypt", "germany"];
const CODES = { greece: "gr", rome: "ro", imperial: "im", punic: "pu", gaul: "ga", carthage: "ca", britain: "br", iberia: "ib", egypt: "eg", germany: "ge" };
const letters = pre => Object.fromEntries(SUFFIXES.map(s => [s, pre + CODES[s]]));
// the line, oldest first: a version is built against the ports of the versions before it only, so that a later one never changes an earlier one
const LINE = ["greek-mod-2-3", "greek-mod-2-5-3", "greek-mod-2-6-1", "mediterranevm-3-6"];
module.exports = {
  ROOT, MAIN, SDK, LEGACY_PORTED,
  LINE,
  WORK: process.env.WORK || path.join(ROOT, "work"),
  VERSIONS: {
    "2.3": { dir: "greek-mod-2-3", name: "Greek Mod 2.3", version: "2.3", label: "Greek 2.3", tok: "w", tag: "w23", ai: "GRW23_", download: "originals/moddb/greek-mod-2-3/files/Greek23.zip", inner: "Greek23", work: "greek-2-3", resolve: RESOLVE_23 },
    "2.5.3": { dir: "greek-mod-2-5-3", name: "Greek Mod 2.5.3", version: "2.5.3", label: "Greek 2.5.3", tok: "w5", letters: letters("W5"), template: "Greek Mod Two Five Three", tag: "w25", ai: "GRW25_", download: "originals/forum/greek-mod-2-5-3/files/GreekModInstaller.exe", inner: "", work: "greek-2-5-3", legacyLeft: true, wholeOnConflict: true, resolve: RESOLVE_25 },
    "2.6.1": { dir: "greek-mod-2-6-1", name: "Greek Mod 2.6.1", version: "2.6.1", label: "Greek 2.6.1", tok: "w6", letters: letters("W6"), template: "Greek Mod Two Six One", tag: "w26", ai: "GRW26_", download: "originals/forum/greek-mod-2-6-1/files/Greek261.zip", inner: "Greek261", work: "greek-2-6-1", legacyLeft: true, wholeOnConflict: true, resolve: RESOLVE_26 },
  },
};
