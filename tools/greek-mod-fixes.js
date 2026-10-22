// Greek Civilization Mod 4.2: what shrink-mod.js leaves broken in ported/greek-civilization-mod. Run after shrink-mod.js and the copy
// of extras/greek-civilization-mod/ (see its NOTES.md):
//   node tools/greek-mod-fixes.js
//
// Game modes. 4.2 replaced the game's five victory scripts ("1 ELIMINATION.VS" ... "5 ALTERNATIVE.VS") with nine of its own ("1 VARIOS.VS" ...
// "9 CUSTOM.VS"), kept its edited copies of the old five inside data.pak as ".VX" (nothing reads them) and its old pack hid the game's.
// Most maps (the community's and 4.2's own, like 00_Ludus_Martis) say victory_condition="1 Elimination" (228 of the 415 maps here; a few
// say "3 Time limit (military rating)", "4 Time limit (score)" or "5 Alternative"): with that script hidden the game starts the map and
// goes back to the menu at once, with nothing in the log. So the game's five are not hidden any more (they are the game's own, so a map
// plays as its author made it) and the .VX are dropped. The lobby lists them next to 4.2's nine.
//
// Rome's three branches and Carthage's two. In 4.2 you pick them in the lobby: its engine hook leaves the choice in the pre-lobby "sentinel"
// rand(776 + player) (Rome: 0 Republican, 1 Imperial, 2 Punic; Carthage: 1 Numidian, 2 Mauritanian), which five scripts read to research
// the branch's ChooseXxx at the start. Here the branches are lobby civilizations (civs/*.json, variants of Republican Rome and Carthage
// that replace their base in the lobby) and those scripts ask Mod_PlayerCiv instead; a civilization that is not one of them (a map that
// fixes plain Rome) gets no branch, and the buttons at the town hall are still there as before.
//
// Misspelled class ids. HD names some classes with typos ("TValkyria", "CMacemen", "BHighlandar", "IDefendar", "GTridentWarriar",
// "BaseBoilding") and 4.2 renames them and drops the old ones. The game's own scripts (TOutpost's defenders) and the maps made for HD place
// the old ids, which no longer exist: "could not create an object of class 'TValkyria'". The renamed class takes the old id as its
// `altid`, so both names find it (the 4.2 version, as in the 4.2 balance).
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const MOD = path.join(ROOT, "ported", "greek-civilization-mod");
const GS = path.join(MOD, "DATA", "GAMESCRIPTS");

for (const f of fs.readdirSync(GS).filter(f => /\.VX$/i.test(f))) fs.rmSync(path.join(GS, f));
const hp = path.join(MOD, "hidden.txt");
const lines = fs.readFileSync(hp, "utf8").split(/\r?\n/);
const kept = lines.filter(l => !/^data\/gamescripts\/[1-5] [^/]*\.vs$/i.test(l.trim()));
fs.writeFileSync(hp, kept.join("\n"));
console.log(`game modes: ${lines.length - kept.length} lines out of hidden.txt`);

const TYPOS = { TValkyrie: "TValkyria", CMaceman: "CMacemen", BHighlander: "BHighlandar", IDefender: "IDefendar", GTridentWarrior: "GTridentWarriar", BaseBuilding: "BaseBoilding" };
const CLASSES = path.join(MOD, "DATA", "CLASSES");
let aliased = 0;
for (const f of fs.readdirSync(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), t = fs.readFileSync(p, "latin1");
  const m = /<class\b[^>]*?\bid\s*=\s*"([^"]+)"[^>]*>/.exec(t);
  if (!m || !TYPOS[m[1]] || /\baltid\s*=/.test(m[0])) continue;
  fs.writeFileSync(p, t.replace(m[0], m[0].replace(/(\bid\s*=\s*"[^"]+")/, `$1 altid="${TYPOS[m[1]]}"`)), "latin1");
  aliased++;
}
console.log(`typo ids: ${aliased} classes take the old id as altid`);

const BRANCHES = {
  rome: ["RomeRepublican", "RomeImperial", "RomePunic"],          // value 0, 1, 2
  carthage: [null, "CarthageNumidian", "CarthageMauritanian"],      // value 0 (the default, Numidian), 1, 2
};
let rewired = 0;
for (const f of ["SUBAI/RTOWNHALL_ENABLE_OR_DISABLE_CMD.VS", "SUBAI/RTOWNHALL_CAPTURED_BY_AI.VS", "AI/GETTACTICSCRIPT.VS", "SUBAI/CTOWNHALL_ENABLE_OR_DISABLE_CMD.VS", "SUBAI/CTOWNHALL_CAPTURED_BY_AI.VS"]) {
  const p = path.join(MOD, "DATA", f), t = fs.readFileSync(p, "latin1");
  const kind = /^SUBAI\/C/.test(f) ? "carthage" : "rome";
  const re = /^([ \t]*)nLobbyBranch\s*=\s*rand\(776 \+ ([\w.]+)\);\r?\n[ \t]*nLobbyBranch2\s*=\s*rand\(776 \+ [\w.]+\);\r?\n[ \t]*nLobbyBranch3\s*=\s*rand\(776 \+ [\w.]+\);/m;
  const m = re.exec(t);
  if (!m) { console.log(`  ${f}: no sentinel found`); continue; }
  const eol = t.includes("\r\n") ? "\r\n" : "\n", [, ind, who] = m;
  const lines = [`nLobbyBranch = 0;`];
  BRANCHES[kind].forEach((id, v) => { if (id) lines.push(`${lines.length === 1 ? "if" : "else if"} (Mod_PlayerCiv(${who}) == ${id}) nLobbyBranch = ${v};`); });
  lines.push("nLobbyBranch2 = nLobbyBranch;", "nLobbyBranch3 = nLobbyBranch;");
  if (kind === "rome") lines[0] = "nLobbyBranch = -1;";
  fs.writeFileSync(p, t.replace(m[0], lines.map(l => ind + l).join(eol)), "latin1");
  rewired++;
}
console.log(`pre-lobby sentinel: ${rewired} scripts now ask Mod_PlayerCiv`);
