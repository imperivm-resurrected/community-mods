// Which files of Greek Mod 2.5.3 / 2.6.1 are new or changed against the 2.3 and byte-identical to a file of Imperivm Legacy 2.4.1 (the ones the line's diagram
// marks as Legacy Mod assets used without permission from 2.5 on). The ports leave them out: tools/greek-2x-source.js reads extras/<id>/legacy-left-out.txt and,
// in the flat folder port-140.js reads, drops a new file and puts the 2.3's file back in place of a changed one. The 2.3 is the baseline for both versions.
//   node tools/greek-2x-legacy.js <2.5.3|2.6.1> [--legacy <folder>]
// Needs work/greek-<v>-raw and work/greek-2-3-raw (the flat folders before the exclusion: tools/greek-2x-source.js leaves them) and the Legacy port
// (ported/imperivm-legacy of the main checkout, or --legacy).
// LIMIT: it compares loose files (same size and MD5, at any path of Legacy). The sprites of both mods are inside their rle.mmp / rle.mmp.tail and are NOT
// compared: the question of the license is not closed by this list.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { ROOT, WORK, VERSIONS } = require("./lib/greek-2x-versions.js");
const VER = process.argv[2], V = VERSIONS[VER];
if (!V || !V.legacyLeft) { console.error("usage: node tools/greek-2x-legacy.js <2.5.3|2.6.1> [--legacy <folder>]"); process.exit(1); }
const li = process.argv.indexOf("--legacy");
const LEGACY = path.resolve(li >= 0 ? process.argv[li + 1] : path.join(ROOT, "..", "community-mods", "ported", "imperivm-legacy"));
const RAW = w => path.join(WORK, `${w}-raw`);
for (const d of [LEGACY, RAW(V.work), RAW("greek-2-3")]) if (!fs.existsSync(d)) { console.error(`no ${d}: run tools/greek-2x-source.js for 2.3 and ${VER} first`); process.exit(1); }
const walk = (d, out = new Map(), base = d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out, base); else if (e.isFile()) out.set(path.relative(base, p).replace(/\\/g, "/"), p); } return out; };
const md5 = p => crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex");
const legacy = new Map();                                                 // size -> [paths]
for (const p of walk(LEGACY).values()) { const s = fs.statSync(p).size; if (s >= 512) (legacy.get(s) || legacy.set(s, []).get(s)).push(p); }
const base = new Map([...walk(RAW("greek-2-3"))].map(([k, p]) => [k.toLowerCase(), p]));
const mine = walk(RAW(V.work)), cache = new Map(), hash = p => cache.get(p) || (cache.set(p, md5(p)), cache.get(p));
const left = [];
for (const [rel, p] of [...mine].sort((a, b) => a[0].localeCompare(b[0]))) {
  if (/\.(exe|dll)$/i.test(rel)) continue;
  const s = fs.statSync(p).size, c = legacy.get(s); if (!c) continue;
  const q = base.get(rel.toLowerCase()); if (q && hash(q) === hash(p)) continue;          // the 2.3 has it as it is: not flagged
  if (c.some(x => hash(x) === hash(p))) left.push(rel);
}
const out = path.join(ROOT, "extras", V.dir, "legacy-left-out.txt");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `# ${V.name}: files new or changed against the 2.3 and byte-identical to a file of Imperivm Legacy 2.4.1 (loose files only: the sprites in rle.mmp were not compared)\n${left.join("\n")}\n`);
console.log(`${left.length} files -> extras/${V.dir}/legacy-left-out.txt`);
