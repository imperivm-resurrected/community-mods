// The ruleset layer of the MCI package (community-mods#53, "Building a mod's layer"): rulesets/mci/ holds what the mod changes for EVERYBODY (the GLOBAL rows of
// tools/audit-completeness.js) and is only mounted when the host picks it in Create room > Rules. The civilizations stay in the root.
//   - a file of the game the mod edited (neutral class, script, entity, sound, picture): the mod's version as tools/port-140.js left it (HD + 1.40 + mod, three-way),
//     as a whole file at the game's path INSIDE the layer (a layer is laid out like a root and is mounted alone)
//   - a table (INI, items, commands, formations, bonuses, random-map objects, texts): only the elements/keys the mod changed or added and the root does not carry, as patches
//     (`Key = value`, `<replace>`/`<add>`, `loc/<language>.loc.xml`), so the HD fixes in the rest of the file stay
// Which rows: the audit of the port as built (so the root decides what is a civilization's). After writing, the audit runs again: every GLOBAL row must have its copy in
// the layer or the build stops (a table element whose XML has no selector is the one thing that can stay behind, and it is said).
const fs = require("fs"), path = require("path");
const A = require("../audit-completeness.js");
const TABLES = new Set(["ini", "items", "table", "commands", "randommap-table", "text-table"]);
const wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s); };
// PLACEOBJECTS.XML as the mod wrote it names the mod's own classes by the ids of the 1.40 mod; in this port they are the clones' or carry the tag. A class the game and the port have is kept,
// `X` becomes `X_mci` / `<letters>X` when the port has that one, and a class that exists nowhere stops the build (the game hangs generating a random map that places a class it does not have). Returns the text and what it did.
function fixPlaceObjects(text, OUT, HDDATA, ID) {
  const ids = new Set(), add = d => { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d)) if (/\.sc\.xml$/i.test(f)) { const m = /<class\b[^>]*?\bid\s*=\s*"([^"]+)"/.exec(fs.readFileSync(path.join(d, f), "latin1")); if (m) ids.add(m[1]); } };
  add(path.join(OUT, "DATA", "CLASSES")); add(path.join(HDDATA, "CLASSES"));
  const lower = new Map([...ids].map(i => [i.toLowerCase(), i])), letters = fs.readdirSync(path.join(OUT, "civs")).map(f => JSON.parse(fs.readFileSync(path.join(OUT, "civs", f), "utf8")).letter).filter(Boolean);
  const hdFile = path.join(HDDATA, "RANDOMMAP", "PLACEOBJECTS.XML"), hdClasses = new Set(fs.existsSync(hdFile) ? [...fs.readFileSync(hdFile, "latin1").matchAll(/<GameObj\b[^>]*?\bclass="([^"]+)"/g)].map(m => m[1]) : []);
  const renamed = [], dropped = [], pick = c => {
    if (hdClasses.has(c)) return c;                                  // the game's own lines (Area::SandChest...) are not classes of the port
    if (lower.has(c.toLowerCase())) return lower.get(c.toLowerCase());
    if (lower.has(`${c}_${ID}`.toLowerCase())) return lower.get(`${c}_${ID}`.toLowerCase());
    const l = [...new Set(letters.flatMap(x => [x + c, x + c.slice(1)]).map(x => lower.get(x.toLowerCase())).filter(Boolean))]; return l.length === 1 ? l[0] : null; // the clone's id: letters + id, or letters + id without the race letter
  };
  const out = text.split(/\r?\n/).filter(line => {
    const cs = [...line.matchAll(/<GameObj\b[^>]*?\bclass="([^"]+)"/g)].map(m => m[1]);
    for (const c of cs) { if (!pick(c)) dropped.push(c); }
    return true;
  }).map(line => line.replace(/(<GameObj\b[^>]*?\bclass=")([^"]+)(")/g, (m, a, c, b) => { const to = pick(c); if (to !== c) renamed.push(`${c} -> ${to}`); return a + to + b; }));
  if (dropped.length) throw new Error("PLACEOBJECTS.XML places classes that exist nowhere: " + [...new Set(dropped)].join(", "));
  return { text: out.join("\n"), renamed: [...new Set(renamed)], dropped: [...new Set(dropped)] };
}
const xe = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

module.exports = function buildLayer({ OUT, PRISTINE, SRC, ID, HDDATA, language = "spanish" }) {
  const LAYER = path.join(OUT, "rulesets", ID);
  fs.rmSync(path.join(OUT, "rulesets"), { recursive: true, force: true });
  const before = A.audit({ id: ID, portDir: OUT, origDir: SRC, noOthers: true });
  const left = before.rows.filter(r => r.status === "UNCLASSIFIED");
  if (left.length) throw new Error("the port has files with no status, fix them before the layer: " + left.slice(0, 5).map(r => r.path).join(", "));
  const byPath = new Map(before.detail.map(d => [d.path, d]));
  const stats = { files: 0, ini: 0, xml: 0, loc: 0 }, unresolved = [], wholeTables = [], locPending = new Map();
  for (const r of before.rows.filter(r => r.level === "file" && r.status === "GLOBAL")) {
    const d = byPath.get(r.path);
    if (!TABLES.has(r.kind) || !d) { // a whole file of the game, the mod's version
      const src = path.join(PRISTINE, r.path);
      if (!fs.existsSync(src)) throw new Error(`${r.path}: GLOBAL but not in ${PRISTINE}`);
      fs.mkdirSync(path.dirname(path.join(LAYER, r.path)), { recursive: true }); fs.copyFileSync(src, path.join(LAYER, r.path)); stats.files++; continue;
    }
    if (d.kind === "text-table") { for (const x of d.pending) locPending.set(x.key, x.result); continue; }
    if (/\.ini$/i.test(r.path)) {
      const bySec = new Map();
      for (const x of d.pending) { if (!bySec.has(x.section)) bySec.set(x.section, []); bySec.get(x.section).push(`${x.name} = ${x.value}`); }
      wr(path.join(LAYER, "patches", r.path), [...bySec].map(([s, l]) => `[${s}]\n${l.join("\n")}\n`).join("\n")); stats.ini += d.pending.length; continue;
    }
    // a table whose elements cannot be selected one by one (PLACEOBJECTS.XML: blocks with no id): the mod's whole file, as port-140.js left it (HD + 1.40 + mod, three-way)
    if (d.pending.some(x => x.kind === "xml" && !x.sel) && fs.existsSync(path.join(PRISTINE, r.path))) { fs.mkdirSync(path.dirname(path.join(LAYER, r.path)), { recursive: true }); fs.copyFileSync(path.join(PRISTINE, r.path), path.join(LAYER, r.path)); stats.files++; wholeTables.push(r.path);
      if (/placeobjects\.xml$/i.test(r.path)) { const x = fixPlaceObjects(fs.readFileSync(path.join(LAYER, r.path), "latin1"), OUT, HDDATA, ID); wr(path.join(LAYER, r.path), Buffer.from(x.text, "latin1")); console.log(`${r.path}: classes renamed to the port's: ${x.renamed.join(", ") || "none"}; lines dropped (class nobody has): ${x.dropped.join(", ") || "none"}`); }
      continue; }
    const ops = [];
    for (const x of d.pending) {
      if (x.isNew && x.parent) ops.push(`  <add select="${xe(x.parent)}">${x.raw.trim()}</add>`);
      else if (!x.isNew && x.sel) ops.push(`  <replace select="${xe(x.sel)}">${x.raw.trim()}</replace>`);
      else unresolved.push(`${r.path} ${x.key}`);
    }
    if (ops.length) { wr(path.join(LAYER, "patches", r.path), `<patch>\n${ops.join("\n")}\n</patch>\n`); stats.xml += ops.length; }
  }
  if (locPending.size) { // the entries (whole lines) of the mod's two tables for the keys the root does not carry
    const lines = new Map();
    for (const f of ["GAME.LOC.XML", "TRANSLATION.LOC.XML"]) {
      const p = path.join(SRC, "CURRENTLANG", f); if (!fs.existsSync(p)) continue;
      const b = fs.readFileSync(p), t = (() => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; })();
      for (const e of t.matchAll(/<translationtableentry\b[^>]*?\/>/g)) { const x = (/\btext="([^"]*)"/.exec(e[0]) || [])[1], c = (/\bcontext="([^"]*)"/.exec(e[0]) || [])[1] || ""; if (x != null) lines.set(x + "\u0000" + c, e[0]); }
    }
    const out = [...locPending.keys()].sort().map(k => lines.get(k)).filter(Boolean);
    wr(path.join(LAYER, "loc", `${language}.loc.xml`), "\ufeff<translationtable>\n" + out.join("\n") + "\n</translationtable>\n"); stats.loc = out.length;
  }
  // a class or command of the mod names its scripts by the mod's ids; the root has the ones it copied under the tag (`supply_tributefood_mci.vs`)
  { const have = new Set(); for (const base of [OUT, HDDATA && path.dirname(HDDATA)]) { if (!base) continue; const walkDir = (d, pre) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.isDirectory()) { if (!/^(rulesets|patches)$/i.test(e.name) || pre) walkDir(path.join(d, e.name), pre + e.name + "/"); } else if (/\.vs$/i.test(e.name)) have.add((pre + e.name).toLowerCase()); } }; walkDir(base, ""); }
    for (const f of (function w(d) { return fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? w(path.join(d, e.name)) : [path.join(d, e.name)]) : []; })(LAYER)) {
      if (!/\.xml$/i.test(f)) continue; const inLayer = rel => fs.existsSync(path.join(LAYER, rel));
      const t = fs.readFileSync(f, "latin1"), u = t.replace(/(["'])(data\/[^"']+?\.vs)\1/gi, (m, q, v) => { if (have.has(v.toLowerCase()) || inLayer(v)) return m; const alt = v.replace(/\.vs$/i, `_${ID}.vs`); return have.has(alt.toLowerCase()) ? q + alt + q : m; });
      if (u !== t) { fs.writeFileSync(f, u, "latin1"); stats.scriptRefs = (stats.scriptRefs || 0) + 1; }
    } }
  const after = A.audit({ id: ID, portDir: OUT, origDir: SRC, noOthers: true });
  const pend = after.rows.filter(r => r.status === "GLOBAL" && !r.carried);
  console.log(`ruleset layer rulesets/${ID}/: ${stats.files} whole files, ${stats.ini} INI keys, ${stats.xml} XML operations, ${stats.loc} texts; audit: ${after.rows.filter(r => r.status === "GLOBAL").length} GLOBAL rows, ${pend.length} without a copy in the layer, ${after.rows.filter(r => r.status === "UNCLASSIFIED").length} UNCLASSIFIED`);
  if (wholeTables.length) console.log("whole file in the layer (no selector for its elements): " + wholeTables.join(", "));
  if (unresolved.length) console.log("no selector for (stay GLOBAL, written in the notes):\n  " + unresolved.join("\n  "));
  return { stats, pending: pend, unresolved, after };
};
