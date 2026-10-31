// Nucl3arW1nter's Balanced factions 2.6 (row 288): a pure balance mod ported as copies (1-C, community-mods#15; the recipe is in docs/PORTING.md,
// "Balance mods"): one clone of each of the game's eight civilizations, with the mod's changes on top, labelled "(Nuclear)". The game's eight stay as they
// are and the mod is never an exclusive ruleset. Rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/nuclear-fazioni-equilibrate.js [id ...]    (no id: all eight)
// 1. the rar is unpacked in a temporary folder (nothing is written under originals/) and tools/port-140.js merges it with HD (git merge-file against 1.40)
// 2. what the mod did to the game's classes and commands goes to MERGED (classes/, commands/, base-changes.json) and the files leave the port: they are the game's
// 3. tools/lib/clone-civs.js clones each civilization from HD with the mod's version of its classes and of the commands that name them
// 4. DATA/SUBAI/UNIT_ON_KILL.VS (the mod's only script) and DATA/UNIT_SPECIALS.INI are not ported, see extras/nuclear-fazioni-equilibrate/NOTES.md
// Prefixes are derived from the ids by the SDK (Nga, Nro, Nim...) and the index is assigned by the game (imperivm-resurrected#37). The reserved token of this
// port is "n": every id starts with it.
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const ID = "nuclear-fazioni-equilibrate", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const RAR = path.join(ROOT, "originals", "forum", "fazioni-equilibrate-mod-v-ufficiale-2017", "files", "Nucl3arW1nter MOD UFFICIALE 2.6.rar");
const GAME = process.env.G;
if (!GAME || !fs.existsSync(path.join(GAME, "rle.mmp"))) { console.error('set G to the HD game folder, e.g. G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"'); process.exit(1); }
if (!fs.existsSync(RAR)) { console.error("no " + RAR + " (node tools/download-forum.js)"); process.exit(1); }
const want = process.argv.slice(2);
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };

// the lobby cuts a name at about 22 characters: "Rep. Rome (Nuclear)" is 19
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "ngaul", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "nrome", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "nimperial", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "ncarthage", name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "nbritain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "niberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "negypt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "ngermany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];

// 1. the mod merged with HD, in a temporary folder
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), "nuclear-")), MERGED = path.join(WORK, "merged"), MERGEDOUT = path.join(WORK, "out");
fs.mkdirSync(path.join(WORK, "rar"));
{
  const r = cp.spawnSync("bsdtar", ["-xf", RAR, "-C", path.join(WORK, "rar")], { stdio: "inherit" }); if (r.status) process.exit(1);
  const src = path.join(WORK, "rar", "Nucl3arW1nter MOD UFFICIALE 2.6");
  const p = cp.spawnSync("node", [path.join(__dirname, "port-140.js"), src, MERGEDOUT, "--id", ID, "--version", "2.6", "--category", "Gameplay & Balance"], { stdio: "inherit", env: { ...process.env, GAME } });
  if (p.status) process.exit(1);
}

// 2. HD plus the mod's changes, kept apart; nothing of it stays at the game's paths
const classes = path.join(MERGEDOUT, "DATA", "CLASSES"), commands = path.join(MERGEDOUT, "DATA", "COMMANDS");
for (const f of fs.readdirSync(classes)) wr(path.join(MERGED, "classes", f), rd(path.join(classes, f)));
for (const f of fs.readdirSync(commands)) wr(path.join(MERGED, "commands", f), rd(path.join(commands, f)));
wr(path.join(MERGED, "base-changes.json"), "{}");   // the mod changes unit classes only: no Hero/Melee/... base class
console.log(`${fs.readdirSync(classes).length} classes and ${fs.readdirSync(commands).length} command files of the mod kept apart`);

// 3. the clones
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "DATA", "SUBAI"), { recursive: true });                // clone-civs.js looks for the port's scripts here
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "Nuclear mod", LABEL: "Nuclear", CIVS, cloneAllOrders: true, want });

// 4. mod.json (name with the version: it names the room's set) and the folders the steps left empty
if (fs.existsSync(EXTRAS)) for (const f of fs.readdirSync(EXTRAS)) if (f !== "NOTES.md") fs.copyFileSync(path.join(EXTRAS, f), path.join(OUT, f));
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
fs.rmSync(WORK, { recursive: true, force: true });
console.log("done");
