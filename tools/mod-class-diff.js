// What a 1.40 mod changed in the game's classes, by civilization (against the official 1.40, so HD's own fixes do not count):
//   node tools/mod-class-diff.js <mod DATA/CLASSES> [--all] [--hd]   (--all lists every changed element, not only the stats; --hd: a mod
//   made for HD, compared with HD instead of 1.40)
// A civilization that shows up here has to become a civilization of its own (AGENTS.md, "Civilizations are independent").
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const [M, ...rest] = process.argv.slice(2);
if (!M) { console.error("usage: node tools/mod-class-diff.js <mod DATA/CLASSES> [--all]"); process.exit(1); }
const O = path.join(ROOT, "originals", rest.includes("--hd") ? "game-data" : "game-140", "paks", "DATA", "CLASSES");   // --hd: a mod made for HD
const els = s => { const b = s.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, ""); return [...b.matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)].map(m => m[0].replace(/\s+/g, " ").trim()); };
const STAT = /maxhealth|damage=|armor|speed|range|radius|unit_specials|HeroSkills|attack_speed|sight|cost|race=/;
const SKIP = /edittree_pos|display_name|Enable_Or_Disable|\bhelp=|icon=|<value\d|<sounds/;
const raceOf = s => (s.match(/race\s*=\s*"([^"]+)"/) || [])[1];
const out = {}, fresh = {};
const hd = new Map(fs.readdirSync(O).map(f => [f.toLowerCase(), f]));
for (const f of fs.readdirSync(M, { withFileTypes: true })) {
  if (!f.isFile() || !/\.sc\.xml$/i.test(f.name)) continue;
  const s = fs.readFileSync(path.join(M, f.name), "latin1"), id = (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1], op = hd.get(f.name.toLowerCase());
  if (!op) { (fresh[raceOf(s) || "(no race)"] ??= []).push(id); continue; }
  const os = fs.readFileSync(path.join(O, op), "latin1"), o = new Set(els(os));
  const d = els(s).filter(e => !o.has(e) && !SKIP.test(e) && (rest.includes("--all") || STAT.test(e)));
  if (d.length) (out[raceOf(os) || raceOf(s) || "(base class)"] ??= []).push(`${id}: ${d.map(e => e.replace(/<properties |\/>|<\/?[a-z_]+/g, "").trim()).join(" ; ").slice(0, 130)}`);
}
for (const [k, v] of Object.entries(out).sort()) console.log(`\n${k} (${v.length})\n  ${v.join("\n  ")}`);
console.log("\nclasses the mod adds (by race):");
for (const [k, v] of Object.entries(fresh).sort()) console.log(`  ${k} (${v.length}): ${v.slice(0, 14).join(" ")}${v.length > 14 ? " …" : ""}`);
