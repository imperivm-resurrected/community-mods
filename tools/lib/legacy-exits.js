// The exit points of the buildings a port ships: the <point type="2"> of a building's .ent.xml are where the units it trains or hires appear. A barracks of the Greek 2.x line had
// its only exit at the dead end of a corridor of its own .pass and the units stayed stuck inside (fixed in game by moving the point from (-32,-50) to (-16,-50)).
//   checkExits({ OUT, HD }) -> { problems: [string], notes: [string], checked, same, unverified: [file] }
// WHAT THIS DOES, AND WHAT IT CANNOT: the mapping from an entity point (screen offsets: the .pass is a diamond) to a cell of the .pass is not written anywhere the tool can read.
// It was searched for (2401 affine maps over the game's own 276 type-2 points: the best puts 82% of them on a free cell, and the best ones disagree with each other), so a
// geometric test of "lands on a free cell that leads out" would be a guess and is NOT done. What is checked instead needs no map: for each building the port ships, its set of
// type-2 points together with the bytes of the .pass it uses is compared with every building of the game. A building whose points and .pass are those of a building of the
// game (the same ones that work in the game) is "same"; any other is listed "unverified" for a human to look at in game (units stuck inside = the exit's cell is closed in).
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const rd = f => fs.readFileSync(f, "latin1");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");

module.exports = function checkExits({ OUT, HD }) {
  const exitsOf = text => [...text.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<point\b[^>]*\btype\s*=\s*"2"[^>]*>/g)].map(m => `${/\bx\s*=\s*"(-?\d+)"/.exec(m[0])[1]},${/\by\s*=\s*"(-?\d+)"/.exec(m[0])[1]}`).sort();
  // the .pass of an entity: next to it in the port, else in the game's folder of the same name (a renamed folder carries the suffix: HOUTPOST_leg)
  const passOf = (file, root, other) => {
    const pf = (/\bpass_file\s*=\s*"([^"]+)"/.exec(rd(file)) || [])[1]; if (!pf) return null;
    const rel = path.relative(root, path.dirname(file));
    for (const d of [path.dirname(file), path.join(other, rel), path.join(other, rel.replace(/_[a-z]{2,4}$/i, ""))]) { const n = ci(d, pf); if (n) return path.join(d, n); }
    return null;
  };
  const scan = (root, other) => { const B = path.join(root, ci(root, "BUILDINGS") || "BUILDINGS"), O = path.join(other, ci(other, "BUILDINGS") || "BUILDINGS"), out = [];
    for (const f of walk(B).filter(p => /\.ent(_[a-z]+)?\.xml$/i.test(p))) { const ex = exitsOf(rd(f)); if (!ex.length) continue; const p = passOf(f, B, O); out.push({ file: f, rel: path.relative(root, f).replace(/\\/g, "/"), pts: ex.join(" "), pass: p ? md5(p) : null }); }
    return out; };
  const hd = scan(HD, HD), known = new Map();
  for (const e of hd) known.set(`${e.pts}|${e.pass}`, e.rel);
  const mine = scan(OUT, HD), problems = [], unverified = []; let same = 0, checked = 0;
  for (const e of mine) {
    checked += e.pts.split(" ").length;
    if (!e.pass) { problems.push(`${e.rel}: no .pass found for its pass_file (the footprint would be empty)`); continue; }
    if (known.has(`${e.pts}|${e.pass}`)) same++; else unverified.push(`${e.rel}: type-2 points ${e.pts.replace(/ /g, " ")} with a .pass that no building of the game has with them`);
  }
  const notes = [`exit points: ${mine.length} buildings of the port have type-2 points (${checked} points); ${same} have the points AND the .pass of a building of the game; ${unverified.length} do not (listed in NOTES.md, to try in game)`];
  return { problems, notes, checked, same, unverified };
};

// self-test: node tools/lib/legacy-exits.js
if (require.main === module) {
  const assert = require("assert"), os = require("os");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "exits-")), put = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
  const ent = pts => `<entity name="X" pass_file="A.pass">${pts}</entity>`, out = path.join(T, "out"), hd = path.join(T, "hd");
  for (const r of [out, hd]) put(path.join(r, "BUILDINGS", "A", "A.PASS"), "same pass");
  put(path.join(hd, "BUILDINGS", "A", "A.ENT.XML"), ent('<point idx="2" type="2" x="-16" y="-50"/>'));
  put(path.join(out, "BUILDINGS", "A", "A.ENT_leg.XML"), ent('<point idx="2" type="2" x="-16" y="-50"/>'));      // the game's
  put(path.join(out, "BUILDINGS", "A", "B.ENT_leg.XML"), ent('<point idx="2" type="2" x="-32" y="-50"/>'));      // moved: not the game's
  const r = module.exports({ OUT: out, HD: hd });
  assert.strictEqual(r.same, 1); assert.strictEqual(r.unverified.length, 1); assert(/-32,-50/.test(r.unverified[0]));
  console.log("legacy-exits self-test ok");
}
