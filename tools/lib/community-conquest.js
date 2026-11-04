// The data folder of the port's conquest (ConquestMaps/<folder>) must be whole: the engine reads the pictures from the folder the territories.xml INSIDE the .bfhp
// names in data= (global.bmp, territories.bmp, territories.xml, ShieldArrow.bmp and Shield<id>.bmp of every <territory id=...>), and a folder renamed by
// tools/lib/conquests.js no longer falls back to the game's own (seen in game 2026-11-02: "mediterranean (cm)" showed no map; the folder had only global.bmp, which is
// all the original mod shipped because the rest came from the game's folder at the original path).
//   complete({ OUT, GAME })   copies from the game's ConquestMaps/1 - GBR europe what the renamed folder lacks (by name, case-insensitive); never overwrites the mod's own file
//   check({ OUT })            -> [problem]  for every conquest it ships: the data= folder exists and has each file above; the folder's territories.xml names the same territories
// The copies are the game's own files, as the other ports' (caesar-mod.js, the CGWAR): the same bytes the player has in his game folder; the mod's own global.bmp (other bytes
// than the game's) stays.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const hpfs = require("../hpfs.js");

const ci = (d, n) => fs.existsSync(d) ? fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase()) : undefined;
const walkTo = (base, rel) => rel.split(/[\\/]/).filter(Boolean).reduce((p, s) => p && (ci(p, s) ? path.join(p, ci(p, s)) : null), base);
const md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");

// -> [{ bfhp, data, dir (absolute or null), ids }] of every conquest the port ships
function conquests(OUT) {
  const cdir = ci(OUT, "Conquests"), out = [];
  for (const f of cdir ? fs.readdirSync(path.join(OUT, cdir)).filter(x => /\.bfhp$/i.test(x)) : []) {
    const e = hpfs(fs.readFileSync(path.join(OUT, cdir, f))).find(x => /^territories\.xml$/i.test(x.path));
    if (!e) { out.push({ bfhp: f, data: null, dir: null, ids: [], noXml: true }); continue; }
    const t = e.read().toString("latin1"), data = (/<conquestmap\b[^>]*?\bdata\s*=\s*"([^"]+)"/i.exec(t) || /\bdata\s*=\s*"([^"]+)"/i.exec(t) || [])[1] || null;
    out.push({ bfhp: f, data, dir: data ? walkTo(OUT, data) : null, ids: [...t.matchAll(/<territory\b[^>]*?\bid\s*=\s*"([^"]+)"/gi)].map(m => m[1]) });
  }
  return out;
}
const needed = ids => ["global.bmp", "territories.bmp", "territories.xml", "ShieldArrow.bmp", ...ids.map(i => `Shield${i}.bmp`)];

function complete({ OUT, GAME }) {
  const gm = walkTo(GAME, "ConquestMaps/1 - GBR europe"), copied = [], same = [];
  if (!gm) throw new Error("originals/game-data/ConquestMaps/1 - GBR europe is missing: copy the game's ConquestMaps/ there (AGENTS.md)");
  for (const c of conquests(OUT)) {
    if (!c.dir) continue;
    for (const n of needed(c.ids)) {
      const have = ci(c.dir, n), g = ci(gm, n);
      if (have) { if (g && md5(path.join(c.dir, have)) === md5(path.join(gm, g))) same.push(`${path.basename(c.dir)}/${have}`); continue; }
      if (g) { fs.copyFileSync(path.join(gm, g), path.join(c.dir, g)); copied.push(`${path.basename(c.dir)}/${g}`); }
    }
  }
  return { copied, same };
}

function check({ OUT }) {
  const problems = [], list = conquests(OUT);
  if (!list.length) return problems;
  for (const c of list) {
    if (c.noXml) { problems.push(`Conquests/${c.bfhp}: no territories.xml inside`); continue; }
    if (!c.data) { problems.push(`Conquests/${c.bfhp}: its territories.xml has no data=`); continue; }
    if (!c.dir) { problems.push(`Conquests/${c.bfhp}: data="${c.data}" is not a folder of the port (the engine reads the pictures from it)`); continue; }
    if (!c.ids.length) problems.push(`Conquests/${c.bfhp}: no <territory id=...> in its territories.xml`);
    const missing = needed(c.ids).filter(n => !ci(c.dir, n));
    if (missing.length) problems.push(`${c.data}: lacks ${missing.join(", ")} (the engine reads them from this folder, not from the game's)`);
    const fx = ci(c.dir, "territories.xml");
    if (fx) { const mine = [...fs.readFileSync(path.join(c.dir, fx), "latin1").matchAll(/<territory\b[^>]*?\bid\s*=\s*"([^"]+)"/gi)].map(m => m[1]).sort().join(","); if (mine !== [...c.ids].sort().join(",")) problems.push(`${c.data}/${fx} names other territories (${mine}) than the .bfhp's (${[...c.ids].sort().join(",")})`); }
  }
  return problems;
}

module.exports = { complete, check, conquests };

if (require.main === module) {
  const assert = require("assert"), os = require("os");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cm-conq-")), OUT = path.join(tmp, "out"), GAME = path.join(tmp, "game");
  const xml = ids => `<conquestmap data="ConquestMaps/X (cm)">${ids.map(i => `<territory id="${i}"/>`).join("")}</conquestmap>`;
  const gdir = path.join(GAME, "ConquestMaps", "1 - GBR europe"); fs.mkdirSync(gdir, { recursive: true });
  for (const n of ["global.bmp", "territories.bmp", "ShieldArrow.bmp", "ShieldA.bmp", "ShieldB.bmp"]) fs.writeFileSync(path.join(gdir, n), "game " + n);
  fs.writeFileSync(path.join(gdir, "territories.xml"), xml(["A", "B"]));
  const odir = path.join(OUT, "ConquestMaps", "X (cm)"); fs.mkdirSync(odir, { recursive: true }); fs.writeFileSync(path.join(odir, "GLOBAL.BMP"), "mine");
  // a conquest for the check without a real container: stub hpfs through the cache
  const real = require.cache[require.resolve("../hpfs.js")].exports;
  require.cache[require.resolve("../hpfs.js")].exports = () => [{ path: "territories.xml", read: () => Buffer.from(xml(["A", "B"])) }];
  fs.mkdirSync(path.join(OUT, "Conquests"), { recursive: true }); fs.writeFileSync(path.join(OUT, "Conquests", "x.BFHP"), "x");
  // `conquests` closed over the original hpfs: reload the module with the stub
  delete require.cache[require.resolve(__filename)]; const M = require(__filename);
  assert(M.check({ OUT }).some(p => /lacks territories\.bmp/.test(p)), "an incomplete folder fails");
  const r = M.complete({ OUT, GAME });
  assert.strictEqual(r.copied.length, 5, r.copied.join()); assert.strictEqual(fs.readFileSync(path.join(odir, "GLOBAL.BMP"), "latin1"), "mine", "the mod's own file is kept");
  assert.deepStrictEqual(M.check({ OUT }), [], "complete folder passes");
  fs.rmSync(path.join(odir, "ShieldB.bmp")); assert(M.check({ OUT }).some(p => /ShieldB\.bmp/.test(p)), "a missing shield fails");
  require.cache[require.resolve("../hpfs.js")].exports = real; fs.rmSync(tmp, { recursive: true, force: true });
  console.log("community-conquest self-test ok");
}
