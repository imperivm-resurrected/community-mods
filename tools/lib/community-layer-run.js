// Runs the layer build of tools/lib/community-layer.js on the built port and writes raw/community-mod-civs-layer.txt (path -> how -> files). Stops on any problem.
const fs = require("fs"), path = require("path");
const L = require("./community-layer.js");

module.exports = function run({ ROOT, SDK }) {
  const OUT = path.join(ROOT, "ported", "community-mod-civs"), SCRATCH = path.join(ROOT, ".scratch");
  const r = L.build({
    ROOT, OUT, SRC: path.join(SCRATCH, "cm-src"), GAME: path.join(ROOT, "originals", "game-data"), HDDATA: path.join(ROOT, "originals", "game-data", "DATA"),
    SDK, SCRATCH, EXTRAS: path.join(ROOT, "extras", "community-mod-civs"),
  });
  const lines = r.manifest.map(m => `${m.path} | ${m.how} | ${m.dest.join(" ; ") || "-"}`).sort();
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-layer.txt"), [`# rulesets/${L.ID}/ of community-mod-civs: inventory path | how | file(s) of the layer (tools/lib/community-layer.js)`, ...lines, ""].join("\n"));
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-layer-notes.txt"), r.notes.sort().join("\n") + "\n");
  // The scripts of the civilizations that read a flag only the layer's game modes (or scripts) write: they did nothing without the layer (issue #53, "Revive what is dead today").
  // A key is read as EnvReadInt/EnvReadString("key") or (x, "key") and written as EnvWriteInt/EnvWriteString; the layer's patches count as written text.
  const keys = (dir, re) => { const m = new Map(); for (const f of L.walk(dir).filter(f => /\.(vs|VS)$/.test(f))) { const t = fs.readFileSync(path.join(dir, f), "latin1"); for (const x of t.matchAll(re)) { if (!m.has(x[1])) m.set(x[1], new Set()); m.get(x[1]).add(f); } } return m; };
  const READ = /EnvRead(?:Int|String)\(\s*(?:[^,()"]+,\s*)?"([^"]+)"/g, WRITE = /EnvWrite(?:Int|String)\(\s*(?:[^,()"]+,\s*)?"([^"]+)"/g;
  const rootRead = new Map(), rootWrite = new Map(), layerWrite = new Map(), hdWrite = new Map();
  for (const [k, v] of keys(path.join(OUT, "DATA"), READ)) rootRead.set(k, v);
  for (const [k, v] of keys(path.join(OUT, "DATA"), WRITE)) rootWrite.set(k, v);
  for (const [k, v] of keys(path.join(r.LAYER), WRITE)) layerWrite.set(k, v);
  for (const [k, v] of keys(path.join(ROOT, "originals", "game-data", "DATA"), WRITE)) hdWrite.set(k, v);
  const revived = [...rootRead].filter(([k]) => layerWrite.has(k) && !rootWrite.has(k) && !hdWrite.has(k)), orphans = [...rootRead].filter(([k]) => !layerWrite.has(k) && !rootWrite.has(k) && !hdWrite.has(k));
  const flagLines = ["# flags the package's civilizations read: written only by the layer (revived when the ruleset is mounted), and written by nobody (the game's engine may write them: check by hand)", "", "## written only by the layer", ...revived.map(([k, v]) => `${k}: read by ${[...v].join(", ")}; written by ${[...layerWrite.get(k)].join(", ")}`), "", "## written by no script", ...orphans.map(([k, v]) => `${k}: read by ${[...v].join(", ")}`), ""];
  fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-layer-flags.txt"), flagLines.join("\n"));
  console.log(`flags read by the civilizations: ${revived.length} written only by the layer (${revived.map(x => x[0]).join(" ")}), ${orphans.length} written by no script`);
  const files = L.walk(r.LAYER);
  console.log(`layer rulesets/${L.ID}: ${files.length} files, ${r.manifest.length} inventory rows (${r.manifest.filter(m => m.how.startsWith("DROPPED")).length} dropped on purpose)`);
  for (const n of r.notes) console.log("  " + n);
  if (r.problems.length) { console.error(`LAYER FAILED (${r.problems.length}):\n  ` + [...new Set(r.problems)].slice(0, 80).join("\n  ")); process.exit(1); }
  return r;
};
