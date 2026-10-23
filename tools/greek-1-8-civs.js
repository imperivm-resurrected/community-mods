// Greek Mod 1.8: the game's civilizations as the mod changed them, each as a civilization of its own (AGENTS.md, "Civilizations are
// independent"). Run after tools/greek-1-8.js, which keeps what port-140.js merged for the game's classes in originals/greek-1-8-merged:
//   node tools/greek-1-8-civs.js [rome18 ...]       (no argument: every civilization of the table)
// The work is in tools/lib/clone-civs.js; this file says which civilizations and where the mod's classes are.
// For each one:
//   1. the SDK's clone-civilization.js clones it from HD, but starting from the mod's version of its classes and of its barracks
//      commands (HD + the 1.8 changes, merged by port-140.js): stats, costs, specials
//   2. what the 1.8 changed in the base classes it inherits (Ranged, Hero, Catapult...) is written inside each copy
//   3. the Rome branch choice (Enable_Or_Disable behaviors, the trainM* commands) is not ported (AGENTS.md); scripts the mod never
//      shipped are dropped from the classes; the mod's "Hero<unit>" classes become Hero<letter><unit>
//   4. the copies go into the port: classes, commands, patches that add the copy to shared commands (merged with the port's own)
// Not here (still pending, see NOTES.md): the mod's changes to shared research commands (ARENA/BLACKSMITH/TEMPLE/TAVERN.XML), the
// mod's maps (they place the game's R* classes), the mod's changes to game-wide files (unit_specials.ini, skills.ini).
const path = require("path");
const ROOT = path.join(__dirname, "..");
const CIVS = [
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "J", id: "rome18", index: 33,
    name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." },   // short: the dropdown cuts long names
    dropCmd: /^trainM/ },                                                          // the Imperial units in the Republican barracks: the Rome branch
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", letter: "L", id: "gaul18", index: 34, name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", letter: "P", id: "carthage18", index: 35, name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", letter: "O", id: "britain18", index: 36, name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", letter: "U", id: "iberia18", index: 37, name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", letter: "V", id: "egypt18", index: 38, name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", letter: "F", id: "germany18", index: 39, name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];
require("./lib/clone-civs.js")({
  PORT: path.join(ROOT, "ported", "greek-mod-1-8"), MERGED: path.join(ROOT, "originals", "greek-1-8-merged"),
  SUFFIX: "Greek Mod 1.8", LABEL: "Rattlesmake",          // the lobby's dropdown cuts a name at about 22 characters: LABEL is what shows
  CIVS, want: process.argv.slice(2),
});

// names the CGWAR (built first) already has with other bytes, or that are the same gameplay file: this port's are renamed (tools/lib/ported-patch.js)
{
  const fs = require("fs"), { tagCollisions } = require("./lib/ported-patch.js"), G = path.join(ROOT, "originals", "game-data");
  const others = [path.join(ROOT, "ported", "cgwar"), G, path.join(G, "paks")].filter(fs.existsSync);
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT: path.join(ROOT, "ported", "greek-mod-1-8"), tag: "g18", others, mapLabel: "Rattlesmake", skip: /^(currentlang|ui\/menu|data\/interface\/menu)\// });
    console.log(`own names (g18), pass ${pass}: ${r.classes.length} classes, ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
}
