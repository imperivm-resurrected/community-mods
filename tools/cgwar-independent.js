// CGWAR: what is left to be independent of the game and of every other mod (AGENTS.md, "Civilizations are independent").
// Run after tools/cgwar-greece.js:   node tools/cgwar-independent.js
// A file of the mod at a path the game uses (with other bytes) would replace the game's for every civilization. Here each one is
//   - a script (.vs): only its insertions about Greece, as a patch (@after / @before / @bottom); its edits of the game's lines and what is
//     not Greek (the mod's general tuning) are left out
//   - items.xml, counterunits.xml, placeobjects.xml, the editor's INI lists: only what the mod added, as a patch
//   - anything else (the animations of other civilizations' units, the Greek-less ruins and fountains, mainmenu.ini, copyrights): left out
// The menu skin (CURRENTLANG) is the exception, as in the other ports: cosmetic, and the sign that the mod is loaded.
// `GreekHero`, the hero base the Greek heroes hang from, is `KGreekHero` (the 4.2 and the 1.8 have their own).
const fs = require("fs"), path = require("path");
const { tagFiles, ownNames, tagNames } = require("./lib/ported-patch.js"), { gameFilesToPatches } = require("./lib/independent.js");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "ported", "cgwar"), HD = path.join(ROOT, "originals", "game-data", "paks");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s, "latin1"); };
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const GREEK = /Ares|Greece|Greek|Circe|Hecate|Free_Village|Combative Spirit|Olympic|\bK[A-Z][A-Za-z]+/;

// 1. KGreekHero
{
  let n = 0;
  for (const f of walk(OUT)) {
    if (!/\.(xml|vs|ini|txt)$/i.test(f) || /^(patches|loc|local)\//i.test(f) && !/\.(xml|vs|ini)$/i.test(f)) continue;
    const p = path.join(OUT, f), s = rd(p), t = s.replace(/(?<![A-Za-z0-9_])GreekHero(?![A-Za-z0-9_])/g, "KGreekHero");
    if (t !== s) { wr(p, t); n++; }
  }
  const from = walk(OUT).find(f => /^DATA\/CLASSES\/GREEKHERO\.SC\.XML$/i.test(f));
  if (from) fs.renameSync(path.join(OUT, from), path.join(OUT, path.dirname(from), "KGREEKHERO.SC.XML"));
  console.log(`GreekHero -> KGreekHero in ${n} files`);
}

// 2. the files at the game's paths (tools/lib/independent.js)
const { report, patches, dropped } = gameFilesToPatches({ OUT, HD, GREEK, keep: /^currentlang\// });

// 4. art with the name of another mod's (the Greek icons all the Greek mods draw): the mod's own names
{
  const m = tagFiles(OUT, ["UI/CMDBAR/FRAMES/greek_frame.bmp", "UI/CMDBAR/RESEARCH/imperial.bmp", "UI/CMDBAR/UPGRADES/olympic games.bmp", "UI/ICONS/UPGRADES/olympic games.bmp"], "cgwar");
  console.log(`own names: ${[...m.values()].join(", ")}`);
}
// researches, orders and items the 1.8 also defines under the same name ("Olympic Games", "Greek archers"): the name is the key of the research's
// state, so this port takes a name of its own
{
  const HDP = path.join(ROOT, "originals", "game-data", "paks"), mine = ownNames(OUT, HDP), t = ownNames(path.join(ROOT, "ported", "greek-mod-1-8"), HDP), names = new Set();
  for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) names.add(n);
  console.log(`names shared with the 1.8: ${[...names].join(", ")} -> "(cgwar)" in ${tagNames({ OUT, names, tag: "cgwar" })} files`);
}
// the mod's extras that were whole files of the game's scripts were handled above; empty folders go
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
console.log(`patches: ${patches.join("; ")}`);
console.log(`left out (the game's own files, with the mod's changes for everyone): ${dropped.length}`);
for (const d of dropped) console.log("  " + d);
if (report.length) console.log("to check:\n  " + report.join("\n  "));
