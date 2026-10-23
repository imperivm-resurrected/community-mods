// Which files, class ids and entity folders a ported mod shares with the game and with the other ported mods (AGENTS.md,
// "Civilizations are independent": there must be none outside patches/, unless the bytes are the same).
//   node tools/shared-paths.js <ported mod id> [--all]        --all also lists same-bytes files
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.join(__dirname, "..");
const [id, ...rest] = process.argv.slice(2);
if (!id) { console.error("usage: node tools/shared-paths.js <ported mod id> [--all]"); process.exit(1); }
const walk = (d, out = new Map(), base = d) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out, base); else out.set(path.relative(base, p).toLowerCase().replace(/\\/g, "/"), p); } return out; };
const md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
const classIds = m => { const s = new Map(); for (const [k, p] of m) if (/^data\/classes\/.*\.sc\.xml$/.test(k)) { const x = (fs.readFileSync(p, "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1]; if (x) s.set(x.toLowerCase(), k); } return s; };
const mine = walk(path.join(ROOT, "ported", id)), myIds = classIds(mine);
const others = [["HD (the game)", walk(path.join(ROOT, "originals/game-data/paks"))], ...fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== id && fs.existsSync(path.join(ROOT, "ported", d, "mod.json"))).map(d => [d, walk(path.join(ROOT, "ported", d))])];
let bad = 0;
for (const [name, m] of others) {
  const same = [], diff = [];
  for (const [k, p] of mine) {
    if (/^(mod\.json|patches\/|notes\.md|civs\/|loc\/|local\/)/.test(k)) continue;
    const q = m.get(k) || (name.startsWith("HD") ? m.get(k) : null); if (!q) continue;
    (md5(p) === md5(q) ? same : diff).push(k);
  }
  const ids = [...classIds(m)].filter(([c]) => myIds.has(c)).map(([c]) => c);
  if (diff.length || ids.length || rest.includes("--all")) console.log(`\n${name}: ${diff.length} files in the same path with other bytes${same.length ? `, ${same.length} identical` : ""}, ${ids.length} class ids in common`);
  if (diff.length) console.log("  " + diff.slice(0, +process.env.SP_MAX || 25).join("\n  ") + (diff.length > (+process.env.SP_MAX || 25) ? `\n  … ${diff.length - 25} more` : ""));
  if (ids.length) console.log("  ids: " + ids.slice(0, 30).join(" "));
  if (rest.includes("--all") && same.length) console.log("  identical: " + same.slice(0, 10).join(", ") + (same.length > 10 ? " …" : ""));
  bad += diff.length + ids.length;
}
console.log(bad ? `\n${bad} collisions` : "\nno collisions");
process.exit(bad ? 1 : 0);
