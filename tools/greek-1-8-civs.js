// Greek Mod 1.8: the game's civilizations as the mod changed them, each as a civilization of its own (AGENTS.md, "Civilizations are
// independent"). Run after tools/greek-1-8.js, which keeps what port-140.js merged for the game's classes in originals/greek-1-8-merged:
//   node tools/greek-1-8-civs.js [rome18 ...]       (no argument: every civilization of the table)
// The work is in tools/lib/clone-civs.js; this file says which civilizations and where the mod's classes are.
// For each one:
//   1. the SDK's clone-civilization.js clones it from HD, but starting from the mod's version of its classes and of its barracks
//      commands (HD + the 1.8 changes, merged by port-140.js): stats, costs, specials
//   2. what the 1.8 changed in the base classes it inherits (Ranged, Hero, Catapult...) is written inside each copy
//   3. the Rome branch choice (RHT_SCELTA_ROMA, the Enable_Or_Disable behaviors) is not ported (AGENTS.md): Rome is three civilizations, one per
//      branch (Republican, Imperial, Punic), each with the commands its branch's scripts leave visible (tools/lib/branch.js, as the 4.2 does).
//      Scripts the mod never shipped are dropped from the classes; the mod's "Hero<unit>" classes become Hero<letter><unit>
//   4. the copies go into the port: classes, commands, patches that add the copy to shared commands (merged with the port's own)
// Not here (still pending, see NOTES.md): the mod's changes to shared research commands (ARENA/BLACKSMITH/TEMPLE/TAVERN.XML), the
// mod's maps (they place the game's R* classes), the mod's changes to game-wide files (unit_specials.ini, skills.ini).
const path = require("path");
const ROOT = path.join(__dirname, "..");
const PORT = path.join(ROOT, "ported", "greek-mod-1-8");
// the branch scripts (R*_Enable_Or_Disable_Cmd.vs) say what each branch leaves visible; greek-1-8.js does not ship them, tools/lib/branch.js reads them
const BRANCH = (flag, hire) => ({ flag, scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, hire });
const CIVS = [
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "J", id: "rome18", index: 33,
    name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." },   // short: the dropdown cuts long names
    skipExtra: /^ImperialRomanHero/, branch: BRANCH("ChooseRepublicanRome") },
  // The Imperial and Punic Rome of the 1.8 are new civilizations: no letter and no index, the prefix is derived from the id (its first 3
  // characters: Emp, Pun; GBR Tactics has Imp and Rep) and the engine assigns the index. Their Velit and Praetorian are the game's Imperial
  // Rome classes (race ImperialRome, ids RVelit/RPraetorian) that the mod's branch trained in the Republican barracks: copies with the branch's race.
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "empire18", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." },
    asBase: ["RVelit", "RPraetorian"], branch: BRANCH("ChooseImperialRome", { cmd: "hireheroRImperial", hero: "ImperialRomanHero" }) },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "punic18", name: { spanish: "Roma pún.", english: "Pun. Rome", italian: "Roma pun." },
    skipExtra: /^ImperialRomanHero/, asBase: ["RPraetorian"], branch: BRANCH("ChoosePunicRome") },
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", letter: "L", id: "gaul18", index: 34, name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", letter: "P", id: "carthage18", index: 35, name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", letter: "O", id: "britain18", index: 36, name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", letter: "U", id: "iberia18", index: 37, name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", letter: "V", id: "egypt18", index: 38, name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", letter: "F", id: "germany18", index: 39, name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];
// the branch scripts are read from the mod's own files, put in the port while the civilizations are cloned and taken out after (no civilization uses them)
const fs0 = require("fs"), SRC = path.join(ROOT, "originals", "greek-mod-1.8-flat", "DATA", "SUBAI"), DST = path.join(PORT, "DATA", "SUBAI");
const branchScripts = fs0.readdirSync(SRC).filter(f => /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i.test(f));
for (const f of branchScripts) fs0.copyFileSync(path.join(SRC, f), path.join(DST, f));
require("./lib/clone-civs.js")({
  PORT, MERGED: path.join(ROOT, "originals", "greek-1-8-merged"),
  SUFFIX: "Greek Mod 1.8", LABEL: "Rattlesmake",          // the lobby's dropdown cuts a name at about 22 characters: LABEL is what shows
  CIVS, cloneAllOrders: true, want: process.argv.slice(2),
});
for (const f of branchScripts) fs0.rmSync(path.join(DST, f), { force: true });
// The mod's AI asks the Punic branch for "RGladiator Shows2" (the Imperial research) in some scripts; Punic's is "RGladiator Shows" (the mod's
// Arena script leaves Shows2 off for it), so the AI of punic18 gets that one when it asks for the other.
{
  const f = path.join(PORT, "civs", "punic18.json");
  if (fs0.existsSync(f)) {
    const j = JSON.parse(fs0.readFileSync(f, "utf8")), a = j.alias && j.alias.commands;
    if (a && a["RGladiator Shows"] && !a["RGladiator Shows2"]) { a["RGladiator Shows2"] = a["RGladiator Shows"]; fs0.writeFileSync(f, JSON.stringify(j, null, 2) + "\n"); }
  }
}

// The mod's text tables (loc/spanish.loc.xml, loc/italian.loc.xml) also CHANGE the game's own texts for everybody (the name of Republican Rome, the
// menu, the unit specials...). The game's are never modified (AGENTS.md): an entry whose key (text + context) HD's table already has with another
// result is dropped. When its context is the name of a command a civilization cloned (investR -> investJ, Noble Offence -> Noble Offence Rome18...),
// the same text is kept for each clone's command, which is the civilization's own.
{
  const fs = require("fs"), HDL = lang => path.join(ROOT, "originals", "game-data", "local-" + lang, "CURRENTLANG");
  const alias = new Map();                                              // old command name -> new names
  for (const f of fs.readdirSync(path.join(PORT, "civs"))) for (const [o, n] of Object.entries(JSON.parse(fs.readFileSync(path.join(PORT, "civs", f), "utf8")).alias.commands || {})) (alias.get(o) || alias.set(o, []).get(o)).push(n);
  const decode = b => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; };
  const entry = e => ({ line: e, text: (e.match(/\btext="([^"]*)"/) || [])[1], ctx: (e.match(/\bcontext="([^"]*)"/) || [])[1] || "", res: (e.match(/\bresult="([^"]*)"/) || [])[1] });
  for (const lang of ["spanish", "italian"]) {
    const file = path.join(PORT, "loc", lang + ".loc.xml"); if (!fs.existsSync(file)) continue;
    const hd = new Map();
    for (const f of ["GAME.LOC.XML", "TRANSLATION.LOC.XML"]) if (fs.existsSync(path.join(HDL(lang), f)))
      for (const m of decode(fs.readFileSync(path.join(HDL(lang), f))).matchAll(/<translationtableentry\b[^>]*?\/>/g)) { const e = entry(m[0]); if (e.text != null) hd.set(e.text + "\0" + e.ctx, e.res); }
    const keep = [], seen = new Set(); let dropped = 0, moved = 0;
    for (const m of decode(fs.readFileSync(file)).matchAll(/<translationtableentry\b[^>]*?\/>/g)) {
      const e = entry(m[0]); if (e.text == null) continue;
      if (!hd.has(e.text + "\0" + e.ctx) || hd.get(e.text + "\0" + e.ctx) === e.res) { keep.push(e.line); continue; }
      dropped++;
      for (const n of alias.get(e.ctx) || []) {                         // the clone's command carries the mod's text
        const key = e.text.split("@")[0] + "@" + n; if (seen.has(key)) continue; seen.add(key); moved++;
        keep.push(e.line.replace(/\btext="[^"]*"/, () => `text="${key}"`).replace(/\bcontext="[^"]*"/, () => `context="${n}"`));
      }
    }
    fs.writeFileSync(file, "\ufeff<translationtable>\n" + keep.join("\n") + "\n</translationtable>\n", "utf8");
    console.log(`${lang}: ${dropped} texts that changed the game's own left out, ${moved} kept for the clones' commands, ${keep.length} entries`);
  }
}

// its conquests that share a path with the game's (Mediterranean) or with another port's become conquests of their own, next to those (tools/lib/conquests.js); before tagCollisions, which would rename the files of a folder one by one
{
  const fs = require("fs"), PORTED = path.join(ROOT, "ported"), G = path.join(ROOT, "originals", "game-data");
  const others = [G, ...fs.readdirSync(PORTED).filter(d => d !== "greek-mod-1-8").map(d => path.join(PORTED, d))].filter(d => fs.existsSync(d) && fs.statSync(d).isDirectory());
  const r = require("./lib/conquests.js")({ OUT: path.join(ROOT, "ported", "greek-mod-1-8"), others, tag: "g18", label: "Rattlesmake" });
  for (const c of r.done) console.log(`conquest ${c.from} -> ${c.to} (${c.folder})`);
  if (r.problems.length) console.log("conquests, to check:\n  " + r.problems.join("\n  "));
}

// the Greece territory of its conquests is played as Greece: the interface of a <territory> (inside the .bfhp) is the race of the player, 4 (ImperialRome)
// in the original. A civilization of a mod is its index; it needs an Imperivm Resurrected build that accepts it (imperivm-resurrected#44, #45): the
// release 1.0 only reads 0-7 and ignores it, and the player then keeps the race of the room.
{
  const fs = require("fs"), hpfs = require("./hpfs.js"), dir = path.join(ROOT, "ported", "greek-mod-1-8", "Conquests");
  const index = JSON.parse(fs.readFileSync(path.join(ROOT, "ported", "greek-mod-1-8", "civs", "greek18.json"), "utf8")).index;
  for (const f of fs.readdirSync(dir).filter(x => /\.bfhp$/i.test(x))) {
    const bfhp = path.join(dir, f), buf = fs.readFileSync(bfhp), e = hpfs(buf).find(x => /^territories\.xml$/i.test(x.path)), raw = e && e.read().toString("latin1");
    const out = raw && raw.replace(/(\bid="Greece"[\s\S]*?\binterface=")\d+"/, (_m, a) => `${a}${index}"`);
    if (!out || out === raw) continue;
    try { e.write(Buffer.from(out, "latin1")); fs.rmSync(bfhp); fs.writeFileSync(bfhp, buf); console.log(`conquest ${f}: Greece plays as greek18 (interface ${index})`); }
    catch (err) { console.log(`conquest ${f}: Greece interface not set (${err.message})`); }
  }
}

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
