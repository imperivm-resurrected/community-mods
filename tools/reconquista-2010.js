// La Reconquista 2010 (JVLIVS CAESAR): the game's civilizations as the mod changed them, each as a civilization of its own next to the game's
// (AGENTS.md, "Civilizations are independent"). Run after tools/port-140.js has built ported/la-reconquista-2010:
//   node tools/reconquista-2010.js
// The mod adds no civilization: it rebalances the game's eight (stats, costs, outposts, heroes) and gives each longbowmen, outpost guards,
// a captain, ships and hero ranks. So, as in tools/greek-1-8.js + tools/greek-1-8-civs.js (the 1.8's six other civilizations):
//   1. what port-140.js merged for the game's own classes and commands (HD + the mod's changes) is kept in originals/la-reconquista-2010-merged
//      and leaves the port: the game's classes stay as they are
//   2. what the mod changed in the game's files (scripts, AI, const.ini, skills, sounds, entities...) is left out; only what the mod adds goes
//      on as a patch (new items); gameFilesToPatches decides, see tools/lib/independent.js
//   3. tools/lib/clone-civs.js clones each civilization from HD with the mod's version of its classes and commands on top (stats, costs, the
//      mod's new units and ships, its heroes) and what the mod changed in the base classes (Ranged, Hero, Unit...) written inside each copy
//   4. names another port (or the game) has with other bytes are given the tag "rec" (tools/lib/ported-patch.js, tagCollisions)
// The prefix of each civilization is derived from its id by the SDK (first 3 characters: Gau, Bri, Car, Egy, Ger, Ibe, Rom, Imp) and the
// index is assigned by the game (imperivm-resurrected#37): neither is in the table.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const ID = "la-reconquista-2010", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const HD = path.join(ROOT, "originals", "game-data", "paks");
const MERGED = path.join(ROOT, "originals", ID + "-merged");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
if (!fs.existsSync(OUT)) { console.error("run tools/port-140.js first (see extras/" + ID + "/NOTES.md)"); process.exit(1); }
fs.rmSync(MERGED, { recursive: true, force: true });
const report = [];

// ---- 1. the game's own classes and commands: HD + the mod's changes, kept for the clones and left out of the port -------------------------
const CLASSES = find(OUT, "DATA/CLASSES"), HDCLASS = find(HD, "DATA/CLASSES");
const hdClass = new Set(walk(HDCLASS).filter(f => /\.sc\.xml$/i.test(f)).map(f => (classOf(rd(path.join(HDCLASS, f))) || "").toLowerCase()));
const hdFile = new Map(walk(HDCLASS).filter(f => /\.sc\.xml$/i.test(f)).map(f => [(classOf(rd(path.join(HDCLASS, f))) || "").toLowerCase(), path.join(HDCLASS, f)]));
// 1a. what the mod changed in a class of the game, as the elements it added or changed (the base classes' ones go inside each copy)
const elements = s => {
  const body = s.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, ""), out = [];
  for (const m of body.matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)) out.push({ text: m[0].trim(), norm: m[0].replace(/\s+/g, " ").trim() });
  return out;
};
const BASE_CHANGES = new Map();
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const s = rd(path.join(CLASSES, f)), id = classOf(s), h = id && hdFile.get(id.toLowerCase());
  if (!h) continue;
  const hdEls = new Set(elements(rd(h)).map(e => e.norm)), mine = elements(s).filter(e => !hdEls.has(e.norm) && !/^<properties\b[^>]*\b(edittree_pos|display_name)\b/.test(e.norm));
  if (mine.length) BASE_CHANGES.set(id.toLowerCase(), mine);
}
wr(path.join(MERGED, "base-changes.json"), JSON.stringify(Object.fromEntries([...BASE_CHANGES].map(([k, v]) => [k, v.map(e => e.text)])), null, 1));
// 1b. every class of the game the mod re-defined leaves the port (the clone tool reads the top folder only: WINTER/ has same-named files)
let dropped = 0;
for (const f of fs.readdirSync(CLASSES, { recursive: true }).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), id = classOf(rd(p));
  if (id && hdClass.has(id.toLowerCase())) { if (!/[\\/]/.test(f)) wr(path.join(MERGED, "classes", f), rd(p)); fs.rmSync(p); dropped++; }
}
// 1c. the command files: the mod's version of the game's orders goes to the clones; what only its base classes (Unit, Hero, Outpost,
// BaseVillage...) order is every civilization's, so it is not ported
const CMDS = find(OUT, "DATA/COMMANDS");
for (const f of fs.readdirSync(CMDS).filter(f => /\.xml$/i.test(f))) {
  let t = rd(path.join(CMDS, f));
  // the mod's TAVERN.XML ends with a command that is never closed ("Hire AnUbis Warriors"): the file does not parse, and a regex for <cmd>...</cmd> skips it
  const last = t.lastIndexOf("<cmd "), tail = last < 0 ? "" : t.slice(last);
  if (last >= 0 && !tail.includes("</cmd>")) { t = t.slice(0, last) + tail.replace(/\s*<\/commands>\s*$/, "\n</cmd>\n\n</commands>\n"); console.log(`${f}: the last command was never closed: closed`); }
  wr(path.join(MERGED, "commands", f), t); fs.rmSync(path.join(CMDS, f));
}
fs.rmdirSync(CMDS);
console.log(`${dropped} classes of the game's civilizations and objects left out (kept for the clones), ${BASE_CHANGES.size} of them with changes to inherit`);

// ---- 2. the game's files the mod edited: only what it adds stays, as a patch ---------------------------------------------------------
{
  const { gameFilesToPatches } = require("./lib/independent.js");
  // nothing of the game's scripts is the mod's civilizations' alone: GREEK never matches, so no script insertion becomes a patch
  const r = gameFilesToPatches({ OUT, HD, GREEK: /(?!)/, keep: /^(currentlang|ui\/menu|data\/interface\/menu)\//i });
  console.log(`game files: patches ${r.patches.join("; ") || "none"}; ${r.dropped.length} left out (edits of the game's own scripts, AI, const.ini, skills, entities, art...)`);
  fs.writeFileSync(path.join(MERGED, "left-out.txt"), r.dropped.join("\n") + "\n");      // the hunks of the game's scripts it did not take are not listed: all of them are left out
  fs.writeFileSync(path.join(MERGED, "left-out-hunks.txt"), r.report.join("\n") + "\n");
}

// the mod's own scripts with accents saved in Latin-1: UTF-8, as the validator asks (port-140.js does it for classes only)
for (const f of walk(OUT).filter(f => /^DATA\/.*\.vs$/i.test(f))) {
  const p = path.join(OUT, f), b = fs.readFileSync(p);
  try { new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { fs.writeFileSync(p, Buffer.from(b.toString("latin1"), "utf8")); }
}

// ---- 3. hand fixes (extras/<id>/): the final files, copied over the result -------------------------------------------------------------
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }
fs.rmSync(path.join(OUT, "NOTES.md"), { force: true });             // port-140.js copies extras/ whole

// ---- 4. the civilizations ---------------------------------------------------------------------------------------------------------------
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: "gaul2010", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: "britain2010", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: "carthage2010", name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: "egypt2010", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: "germany2010", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: "iberia2010", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: "rome2010", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." } },   // short: the dropdown cuts long names
  { base: "ImperialRome", baseLetter: "M", hero: "ImperialRomanHero", id: "imperial2010", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." } },
];
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: "La Reconquista", LABEL: "Reconq.", newCommands: "RECONQUISTA", CIVS, want: process.argv.slice(2) });   // LABEL: the lobby cuts a name at about 22 characters

// ---- 5. names another port (or the game) has with other bytes: the mod's own (tag "rec") ------------------------------------------------
{
  const { tagCollisions } = require("./lib/ported-patch.js"), G = path.join(ROOT, "originals", "game-data");
  const others = [...fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== ID && fs.existsSync(path.join(ROOT, "ported", d, "mod.json"))).map(d => path.join(ROOT, "ported", d)), G, path.join(G, "paks")].filter(fs.existsSync);
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: "rec", others, gameDirs: [path.join(G, "paks")], skip: /^(currentlang|ui\/menu|data\/interface\/menu)\// });
    console.log(`own names (rec), pass ${pass}: ${r.classes.length} classes, ${r.folders.length} art folders, ${r.files.length} files`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
}
// orders and items another port also defines (the MCI is built on this mod): listed, not renamed. tagNames would also rename what it finds between
// quotes that is not a key: a method's `sig=` (the engine dispatches by it) and a unit's display name ("Captain" is an item and a unit). See NOTES.md, Pending.
{
  const { ownNames } = require("./lib/ported-patch.js"), mine = ownNames(OUT, HD), shared = [];
  for (const d of fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== ID && fs.existsSync(path.join(ROOT, "ported", d, "mod.json")))) {
    const t = ownNames(path.join(ROOT, "ported", d), HD);
    for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) shared.push(`${d}\t${k === "cmds" ? "order" : "item"}\t${n}`);
  }
  fs.writeFileSync(path.join(MERGED, "shared-names.txt"), shared.join("\n") + "\n");
  console.log(`${mine.cmds.size} orders and ${mine.items.size} items of the mod's own; ${shared.length} names also defined by another port (originals/${ID}-merged/shared-names.txt)`);
}
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
