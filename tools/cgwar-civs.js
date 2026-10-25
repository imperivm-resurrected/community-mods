// CGWAR: the two Romes of the mod, each a civilization of its own next to the game's (AGENTS.md, "Civilizations are independent" and "What a
// civilization is, it is from the start"). Run after tools/port-140.js and BEFORE tools/cgwar-greece.js, which throws the mod's Rome files away:
//   node tools/cgwar-civs.js [id ...]
// The mod let Republican Rome turn Imperial or Republican at the Arena (research Imperial_Administration / Republican_Administration) and
// DATA/SUBAI/Technology_of_Rome_Buildings.vs turned commands on and off depending on the choice. The choice is not ported (the lobby is the
// choice): each branch is a clone of HD's Republican Rome (tools/lib/clone-civs.js) that has its side from the start.
//   cgwarimperial  Imperial Rome (CGWAR)   hireheroM (Imperial hero), Liberati, Military Academy, Standartization, Roman Velit/Praetorian...
//   cgwarrepublic  Republican Rome (CGWAR) hireheroR, Gladiator Shows, Rome Training, Veteran Offence/Defence/Health, Roman Full Armor/Chariot Wheels...
// For each:
//   - the commands that script leaves on for the branch are in it, as the mod has them (the Imperial ones were Imperial Rome's in HD: sources
//     RArena/RBarracks/RBlacksmith here); the ones it leaves off are not, read from the script itself (hiddenBy for the state with nothing
//     researched, plus what the branch's block disables, minus what it enables)
//   - the requirements on "<branch> Administration" (ReqSet in the researches, the Liberati's trainex parameter) go: nothing researches it
//   - Imperial only: the classes the Imperial commands name that are Imperial Rome's in HD (RVelit, RPraetorian, ImperialRomanHero and its MHero
//     children) get the Republican race in the staged data, so the clone takes them
// Nothing else of the mod touches the game's Roman classes (the only R* classes that differ from HD are RArena, RBarracks and RBlacksmith, which
// only add the Technology_of_Rome_Buildings.vs behavior), so there are no base-class changes to write inside the copies.
// Prefixes: "cgwarimperial" derives Cgw. "cgwarrepublic" would derive Cgw too, so the Republican one has its own (Cgr).
const fs = require("fs"), path = require("path"), os = require("os");
const { hiddenBy } = require("./lib/branch.js");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "ported", "cgwar"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1], parentOf = s => (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1];

const COMMANDS = find(OUT, "DATA/COMMANDS"), SCRIPT = find(OUT, "DATA/SUBAI/Technology_of_Rome_Buildings.vs");
if (!SCRIPT || !fs.existsSync(path.join(COMMANDS, "ARENA.XML"))) { console.error("run tools/port-140.js first, and this before tools/cgwar-greece.js (it needs the mod's Rome files)"); process.exit(1); }

const script = rd(SCRIPT), names = (s, what) => [...s.matchAll(new RegExp(`Cmd${what}\\("([^"]+)"\\)`, "g"))].map(m => m[1]);
const mark = n => script.indexOf(`"${n} Administration") == "researched" && t == 0`);
const marks = ["Imperial", "Republican"].map(n => [n, mark(n)]);
if (marks.some(([, i]) => i < 0)) { console.error("Technology_of_Rome_Buildings.vs is not the one this tool reads"); process.exit(1); }
const block = n => { const at = mark(n), next = marks.map(([, i]) => i).filter(i => i > at).sort((a, b) => a - b)[0]; return script.slice(at, next ?? script.length); };
// what a branch leaves off at the start: everything the script disables when nothing is researched, and what the branch's own block disables,
// minus what that block enables
const hideOf = n => { const b = block(n), h = new Set([...hiddenBy(script, { researched: [] }).disabled, ...names(b, "Disable")]); for (const x of names(b, "Enable")) h.delete(x); return h; };

const CIVS = [
  { admin: "Imperial", base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "cgwarimperial", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." },
    skipExtra: /^K[A-Z]/,                                  // Greece's KPriest and KSlinger hang from RPriest and RBalearSlinger and have no race of their own
    branch: { hire: { cmd: "hireheroM", hero: "ImperialRomanHero" } } },
  { admin: "Republican", base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "cgwarrepublic", letter: "Cgr", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." },
    skipExtra: /^(K[A-Z]|ImperialRomanHero|MHero)/,        // the Imperial hero and its children are Imperial's
    // the script names the mod's third Standartization "Flexibility", but port-140.js merged it under HD's name; it asks for Standartization II, which
    // is Imperial's: unreachable here
    hideAlso: ["Standartization III"] },
].filter(c => !process.argv.slice(2).length || process.argv.slice(2).includes(c.id));

const HD_CLASSES = find(HDDATA, "CLASSES");
const hdClass = new Map(fs.readdirSync(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f)).map(f => { const s = rd(path.join(HD_CLASSES, f)); return [classOf(s), s]; }));
const tmp = [];
for (const civ of CIVS) {
  const hide = hideOf(civ.admin), on = names(block(civ.admin), "Enable");
  for (const n of civ.hideAlso || []) hide.add(n);
  console.log(`${civ.id}: ${on.length} commands on, ${hide.size} off: ${[...hide].join(", ")}`);
  // what the clone starts from (tools/lib/clone-civs.js, MERGED): kept in a temporary folder
  const MERGED = fs.mkdtempSync(path.join(os.tmpdir(), `cgwar-merged-${civ.id}-`)); tmp.push(MERGED);
  // RArena, RBarracks and RBlacksmith as HD has them (the mod's differ only by the behavior of the script that chose)
  for (const id of ["RArena", "RBarracks", "RBlacksmith"]) wr(path.join(MERGED, "classes", `${id.toUpperCase()}.SC.XML`), hdClass.get(id));
  if (civ.admin === "Imperial") {
    // Imperial Rome's own in HD, trained or hired by the Imperial commands (the heroes' children have no race of their own and follow their parent)
    const imperialHero = [...hdClass].filter(([id, s]) => id === "ImperialRomanHero" || parentOf(s) === "ImperialRomanHero");
    for (const [id, s] of [["RVelit", hdClass.get("RVelit")], ["RPraetorian", hdClass.get("RPraetorian")], ...imperialHero])
      wr(path.join(MERGED, "classes", `${id.toUpperCase()}.SC.XML`), s.replace(/(<properties\b[^>]*\brace\s*=\s*")ImperialRome"/, '$1RepublicanRome"'));
  }
  wr(path.join(MERGED, "base-changes.json"), "{}");
  // the requirement on the choice: "ReqSet, X Administration, default, " (or ", ," / no value) in a research, "…, X Administration, , Gladiator Shows" in the Liberati's trainex
  const req = new RegExp(`ReqSet\\s*,\\s*${civ.admin} Administration\\s*,\\s*[^,"]*,\\s*`, "g"), trainex = new RegExp(`(\\bparam\\s*=\\s*"[^"]*?)${civ.admin} Administration\\s*,\\s*,\\s*`, "g");
  for (const f of fs.readdirSync(COMMANDS)) wr(path.join(MERGED, "commands", f), rd(path.join(COMMANDS, f)).replace(req, "").replace(trainex, "$1"));
  civ.branch = { ...civ.branch, flag: `${civ.admin} Administration`, hide: [...hide] };
  require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "CGWAR", LABEL: "CGWAR", CIVS: [civ], cloneAllOrders: true });
}

// the script that chose is nobody's now (the classes that ran it went back to HD in cgwar-greece.js)
if (!process.argv.slice(2).length) fs.rmSync(SCRIPT);
for (const d of tmp) fs.rmSync(d, { recursive: true, force: true });
