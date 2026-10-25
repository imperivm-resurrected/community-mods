// CGWAR: Imperial Rome (CGWAR), a civilization of its own next to the game's (AGENTS.md, "Civilizations are independent" and "What a civilization
// is, it is from the start"). Run after tools/port-140.js and BEFORE tools/cgwar-greece.js, which throws the mod's Rome files away:
//   node tools/cgwar-civs.js [id ...]
// The mod let Republican Rome turn Imperial or Republican at the Arena (research Imperial_Administration / Republican_Administration) and
// DATA/SUBAI/Technology_of_Rome_Buildings.vs turned commands on and off depending on the choice. The choice is not ported (the lobby is the
// choice): Imperial Rome (CGWAR) is a clone of HD's Republican Rome (tools/lib/clone-civs.js) that has the Imperial side from the start:
//   - the commands that script enables for the Imperial branch (hireheroM, Liberati, Military Academy, Standartization, Roman Velit/Praetorian,
//     trainMVelit, trainMPraetorian) are in it, as the mod has them (they were Imperial Rome's, with RArena/RBarracks/RBlacksmith as sources)
//   - the commands it leaves off (the Republican side, and the two research that chose) are not, read from the script itself
//   - the classes those commands name that are Imperial Rome's in HD (RVelit, RPraetorian, ImperialRomanHero and the MHero children) belong to it:
//     their race is Republican Rome in the staged data, so they are cloned with the rest
//   - the requirements on "Imperial Administration" (in the commands and in the Liberati's trainex parameter) go: nothing researches it
// Nothing else of the mod touches the game's Roman classes (checked 2026-10-25 with tools/mod-class-diff.js-style comparison: the only R*
// classes that differ from HD are RArena, RBarracks and RBlacksmith, which only add the Technology_of_Rome_Buildings.vs behavior), so there are no
// base-class changes to write inside the copy.
// The prefix is derived from the id ("cgwarimperial" -> Cgw; "imperial_..." would be Imp, GBR Tactics') and the index is the engine's.
const fs = require("fs"), path = require("path"), os = require("os");
const { hiddenBy } = require("./lib/branch.js");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "ported", "cgwar"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1], parentOf = s => (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1];

const COMMANDS = find(OUT, "DATA/COMMANDS"), CLASSES = find(OUT, "DATA/CLASSES"), SCRIPT = find(OUT, "DATA/SUBAI/Technology_of_Rome_Buildings.vs");
if (!SCRIPT || !fs.existsSync(path.join(COMMANDS, "ARENA.XML"))) { console.error("run tools/port-140.js first, and this before tools/cgwar-greece.js (it needs the mod's Rome files)"); process.exit(1); }

// the commands the script leaves off for the Imperial branch: everything it disables when nothing is researched, and what the Imperial block
// disables itself, minus what that block enables
const script = rd(SCRIPT), names = (s, what) => [...s.matchAll(new RegExp(`Cmd${what}\\("([^"]+)"\\)`, "g"))].map(m => m[1]);
const impStart = script.indexOf('"Imperial Administration") == "researched" && t == 0'), repStart = script.indexOf('"Republican Administration") == "researched" && t == 0');
if (impStart < 0 || repStart < impStart) { console.error("Technology_of_Rome_Buildings.vs is not the one this tool reads"); process.exit(1); }
const imperial = script.slice(impStart, repStart), hide = new Set([...hiddenBy(script, { researched: [] }).disabled, ...names(imperial, "Disable")]);
for (const n of names(imperial, "Enable")) hide.delete(n);
console.log(`Imperial branch: ${names(imperial, "Enable").length} commands on, ${hide.size} off: ${[...hide].join(", ")}`);

// what the clone starts from (tools/lib/clone-civs.js, MERGED): kept in a temporary folder, rebuilt every time
const MERGED = fs.mkdtempSync(path.join(os.tmpdir(), "cgwar-merged-")), HD_CLASSES = find(HDDATA, "CLASSES");
const hdClass = new Map(fs.readdirSync(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f)).map(f => { const s = rd(path.join(HD_CLASSES, f)); return [classOf(s), s]; }));
// RArena, RBarracks and RBlacksmith as HD has them (the mod's differ only by the behavior of the script that chose)
for (const id of ["RArena", "RBarracks", "RBlacksmith"]) wr(path.join(MERGED, "classes", `${id.toUpperCase()}.SC.XML`), hdClass.get(id));
// Imperial Rome's own in HD, trained or hired by the Imperial commands: Republican Rome's race here, so the clone takes them (the heroes' children
// have no race of their own and follow their parent)
const imperialHero = [...hdClass].filter(([id, s]) => id === "ImperialRomanHero" || parentOf(s) === "ImperialRomanHero");
for (const [id, s] of [["RVelit", hdClass.get("RVelit")], ["RPraetorian", hdClass.get("RPraetorian")], ...imperialHero])
  wr(path.join(MERGED, "classes", `${id.toUpperCase()}.SC.XML`), s.replace(/(<properties\b[^>]*\brace\s*=\s*")ImperialRome"/, '$1RepublicanRome"'));
wr(path.join(MERGED, "base-changes.json"), "{}");
for (const f of fs.readdirSync(COMMANDS))
  wr(path.join(MERGED, "commands", f), rd(path.join(COMMANDS, f))
    .replace(/ReqSet\s*,\s*Imperial Administration\s*,\s*default\s*,\s*/g, "")           // researches that required the choice
    .replace(/(\bparam\s*=\s*"[^"]*?)Imperial Administration\s*,\s*,\s*/g, "$1"));        // the Liberati's trainex: "…, Liberati, Imperial Administration, , Gladiator Shows"

const CIVS = [
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "cgwarimperial", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." },
    skipExtra: /^K[A-Z]/,                                  // Greece's KPriest and KSlinger hang from RPriest and RBalearSlinger and have no race of their own
    branch: { flag: "Imperial Administration", hide: [...hide], hire: { cmd: "hireheroM", hero: "ImperialRomanHero" } } },
];
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "CGWAR", LABEL: "CGWAR", CIVS, cloneAllOrders: true, want: process.argv.slice(2) });

// the script that chose, and the researches of the choice, are nobody's now (the classes that ran it went back to HD in cgwar-greece.js)
fs.rmSync(SCRIPT);
fs.rmSync(MERGED, { recursive: true, force: true });
