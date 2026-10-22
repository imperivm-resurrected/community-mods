// Imperivm I (Celtic Kings: Rage of War) classes for maps that still place them: the shared mod ported/imperivm1-legacy/.
//
//   node tools/imperivm1.js setup <celtickingspatch116.exe> <celtickingsdemo.zip>
//   node tools/imperivm1.js add <map.bfhp | ClassName>...
//
// Both files are free on ModDB (Celtic Kings: Rage of War > Downloads: "Patch 1.16" and "Celtic Kings: Rage of War Demo").
// setup unpacks them into originals/imperivm1/ (the patch's data.pak has every Imperivm I class; the demo has the art) and
// writes raw/imperivm1-equivalents.json: which HD class stands for each Imperivm I class. That table comes from Haemimont's
// own conversion: the patch ships 4 Imperivm I maps that the Imperivm III saga converted, and every object kept its position,
// so pairing them by position gives the replacement (TeutonMetal -> TTeutonRider, GWFighter -> GWomanWarrior...). Classes
// those maps don't place are matched by display name, then by sharing a model with a matched class.
// add puts the Imperivm I classes a map places (and the HD game lacks) into ported/imperivm1-legacy/: a copy of the HD
// equivalent under the old id, or, for objects the HD game never had (cliffs, rocks, the warehouse), the original class with
// its art rebuilt from the demo (each .rle.mmp + the demo's rle.mmp -> a standalone .rle). Maps that need it get
// "requires": ["imperivm1-legacy"] from tools/wrap-map.js. Uses the SDK in ../imperivm-resurrected/sdk (SDK=<path>).
const fs = require("fs"), path = require("path"), zlib = require("zlib"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const SDK = process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk");
const rle = require(path.join(SDK, "tools", "lib", "rle.js"));
const I1 = path.join(ROOT, "originals", "imperivm1"), HD = path.join(ROOT, "originals", "game-data", "DATA");
const TABLE = path.join(ROOT, "raw", "imperivm1-equivalents.json");
const MOD = path.join(ROOT, "ported", "imperivm1-legacy");
const BSDTAR = process.env.BSDTAR || (process.platform === "linux" ? "bsdtar" : "tar");
const die = m => { console.error(m); process.exit(1); };

// --- class files: id/altid (lowercase) -> { id, file, text, head } ---
const readClasses = dir => {
  const r = {};
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    if (!/\.sc\.xml$/i.test(f)) continue;
    const s = fs.readFileSync(path.join(dir, f), "latin1");
    for (const m of s.matchAll(/<class\b[^>]*>[\s\S]*?<\/class>/g)) {
      const head = m[0].match(/<class\b[^>]*>/)[0], get = k => (head.match(new RegExp(`\\b${k}\\s*=\\s*"([^"]+)"`)) || [])[1];
      const c = { id: get("id"), altid: get("altid"), file: path.join(dir, f), text: m[0], head,
        entity: (m[0].match(/\bentity\s*=\s*"([^"]+)"/) || [])[1] || "", name: (m[0].match(/display_name="([^"]+)"/) || [])[1] || "" };
      for (const k of [c.id, c.altid].filter(Boolean)) r[k.toLowerCase()] = r[k.toLowerCase()] || c;
    }
  }
  return r;
};
const placed = f => { const h = {}; for (const m of fs.readFileSync(f, "latin1").matchAll(/class="([^"]+)"/g)) h[m[1]] = (h[m[1]] || 0) + 1; return h; };
const objects = f => { // placed objects with their position
  const r = [];
  for (const m of fs.readFileSync(f, "latin1").matchAll(/class="([^"]+)"([\s\S]{0,400}?)\/>/g)) {
    const b = m[2].replace(/[^\x20-\x7e]/g, " "), get = k => (b.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1];
    if (get("x") != null) r.push({ c: m[1], at: `${get("x")},${get("y")}` });
  }
  return r;
};
const extract = (pakDir, pak, out) => execFileSync("node", [path.join(SDK, "tools", "extract-data.js"), pakDir, out, pak], { stdio: "ignore" });

function setup(patch, demo) {
  if (!patch || !demo) die("usage: node tools/imperivm1.js setup <celtickingspatch116.exe> <celtickingsdemo.zip>");
  fs.mkdirSync(path.join(I1, "game", "Packs"), { recursive: true });
  // the patch is a 7-Zip self-extractor: data.pak and the 4 maps Haemimont converted
  execFileSync(BSDTAR, ["-xf", patch, "-C", I1]);
  fs.copyFileSync(path.join(I1, "data", "files", "data.pak"), path.join(I1, "game", "Packs", "data.pak"));
  extract(path.join(I1, "game"), "data.pak", path.join(I1, "data-pak"));
  // the demo is a Wise installer inside a zip: its files are raw deflate streams; keep the PackFile (.pak) and the
  // pixel store (rle.mmp, the biggest stream that is neither a .pak nor a program)
  execFileSync(BSDTAR, ["-xf", demo, "-C", I1]);
  const exe = fs.readdirSync(I1).find(f => /demo\.exe$/i.test(f));
  if (!exe) die("no Celtic Kings Demo.EXE in " + demo);
  const buf = fs.readFileSync(path.join(I1, exe));
  let pak = null, mmp = null;
  for (let pos = 0; pos < buf.length - 16;) {
    // a stream start must decode its first 4 KB cleanly (random bytes rarely do); only then decode it whole
    let probe;
    try { probe = zlib.inflateRawSync(buf.subarray(pos, pos + 4096), { finishFlush: zlib.constants.Z_SYNC_FLUSH }); } catch { pos++; continue; }
    if (probe.length < 1024) { pos++; continue; }
    let res;
    try { res = zlib.inflateRawSync(buf.subarray(pos), { info: true, maxOutputLength: 200e6 }); } catch { pos++; continue; }
    const data = res.buffer, used = res.engine.bytesWritten;
    if (data.toString("latin1", 0, 15) === "HMMSYS PackFile") { if (!pak || data.length > pak.length) pak = data; } // the main one is the biggest
    else if (data.length > 10e6 && data.toString("latin1", 0, 2) !== "MZ" && (!mmp || data.length > mmp.length)) mmp = data;
    pos += Math.max(used, 1);
  }
  if (!pak || !mmp) die("could not find the demo's .pak and rle.mmp");
  fs.writeFileSync(path.join(I1, "game", "Packs", "demo.pak"), pak);
  fs.writeFileSync(path.join(I1, "rle.mmp"), mmp);
  extract(path.join(I1, "game"), "demo.pak", path.join(I1, "demo-pak"));
  console.log(`unpacked: Imperivm I data.pak, demo.pak (${(pak.length / 1e6).toFixed(1)} MB), rle.mmp (${(mmp.length / 1e6).toFixed(1)} MB)`);
  writeTable();
}

// --- the equivalence table ---
function writeTable() {
  const i1 = readClasses(path.join(I1, "data-pak")), hd = readClasses(HD);
  // Haemimont's conversion: the patch's original maps against their Imperivm III saga versions (from Discord)
  const SAGA = path.join(ROOT, "originals", "discord", "saga-imperivm");
  const PAIRS = [["scenarios/Ascendency.bfhp", "ascendencia"], ["adventures/Return to the Throne.bfhp", "el-trono-de-dacia"],
    ["adventures/Defenders.bfhp", "defensores"], ["scenarios/The fall of Avalon.BFHP", "la-caida-de-avalon"]];
  const votes = {};
  for (const [orig, slug] of PAIRS) {
    const dir = path.join(SAGA, slug), conv = dir && fs.existsSync(dir) && fs.readdirSync(dir).find(f => /\.bfhp$/i.test(f));
    if (!conv) { console.log(`  (no saga copy of ${slug} in originals/discord: skipped)`); continue; }
    const at = new Map(objects(path.join(dir, conv)).map(o => [o.at, o.c]));
    for (const o of objects(path.join(I1, "data", "files", orig))) {
      const n = at.get(o.at);
      if (!n || n.toLowerCase() === o.c.toLowerCase() || !hd[n.toLowerCase()]) continue;
      votes[o.c] = votes[o.c] || {};
      votes[o.c][n] = (votes[o.c][n] || 0) + 1;
    }
  }
  const table = {};
  const hdKnown = c => hd[c.toLowerCase()];
  for (const c of Object.values(i1)) {
    if (table[c.id] || hdKnown(c.id)) continue; // already resolved by the HD game itself (same id or altid)
    const v = votes[c.id];
    if (v) { const best = Object.entries(v).sort((a, b) => b[1] - a[1]); table[c.id] = { hd: best[0][0], how: "haemimont", votes: v }; }
  }
  for (const c of Object.values(i1)) {
    if (table[c.id] || hdKnown(c.id)) continue;
    const cpp = c.head.match(/cpp_class="([^"]+)"/)?.[1];
    const byName = c.name && Object.values(hd).find(h => h.name === c.name && h.head.includes(`cpp_class="${cpp}"`));
    if (byName) table[c.id] = { hd: byName.id, how: "display name" };
  }
  for (const c of Object.values(i1)) {
    if (table[c.id] || hdKnown(c.id) || !c.entity) continue;
    const twin = Object.values(i1).find(o => o !== c && o.entity.toLowerCase() === c.entity.toLowerCase() && table[o.id]);
    if (twin) table[c.id] = { hd: table[twin.id].hd, how: `same model as ${twin.id}` };
  }
  fs.writeFileSync(TABLE, JSON.stringify(Object.fromEntries(Object.entries(table).sort()), null, 1) + "\n");
  console.log(`${Object.keys(table).length} Imperivm I classes have an HD equivalent -> ${path.relative(process.cwd(), TABLE)}`);
}

// --- art: an Imperivm I entity (.ent.xml + .rle.mmp + .pass) rebuilt from the demo into the mod ---
const demoFile = rel => { // case-insensitive lookup under originals/imperivm1/demo-pak/ENTITIES
  let dir = path.join(I1, "demo-pak", "ENTITIES");
  for (const part of rel.split(/[\\/]/)) {
    const hit = fs.existsSync(dir) && fs.readdirSync(dir).find(n => n.toLowerCase() === part.toLowerCase());
    if (!hit) return null;
    dir = path.join(dir, hit);
  }
  return dir;
};
function copyEntity(entity) { // entity="assets/entities/MapObjects/Cliffs1/Clifs1_as.ent.xml" -> mod MapObjects/Cliffs1/...
  const rel = entity.replace(/^assets[\\/]entities[\\/]/i, "");
  const src = demoFile(rel);
  if (!src) return `${rel} is not in the demo`;
  const outDir = path.join(MOD, path.dirname(rel));
  const xml = fs.readFileSync(src, "latin1");
  // every image first, so a missing one leaves nothing behind
  const names = [...xml.matchAll(/<image\b[^>]*\bfile="([^"]+)"/g)].map(m => m[1].replace(/\.rle$/i, ""));
  const missing = names.find(n => !demoFile(path.join(path.dirname(rel), n + ".rle.mmp")));
  if (missing) return `${missing}.rle.mmp of ${rel} is not in the demo`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, path.basename(rel)), xml, "latin1");
  const fd = fs.openSync(path.join(I1, "rle.mmp"), "r");
  for (const name of names) {
    const sheet = rle.parse(fs.readFileSync(demoFile(path.join(path.dirname(rel), name + ".rle.mmp"))));
    rle.resolveMmp(sheet, fd);
    fs.writeFileSync(path.join(outDir, name + ".rle"), rle.write(sheet));
  }
  fs.closeSync(fd);
  const pass = (xml.match(/\bpass_file="([^"]+)"/) || [])[1], passSrc = pass && demoFile(path.join(path.dirname(rel), pass));
  if (passSrc) fs.copyFileSync(passSrc, path.join(outDir, pass));
  return null;
}

function add(args) {
  if (!args.length) die("usage: node tools/imperivm1.js add <map.bfhp | ClassName>...");
  if (!fs.existsSync(TABLE)) die("run setup first");
  let table;
  try { table = JSON.parse(fs.readFileSync(TABLE, "utf8")); } catch (err) { die(`${TABLE}: ${err.message}`); }
  const i1 = readClasses(path.join(I1, "data-pak")), hd = readClasses(HD);
  const want = new Set();
  for (const a of args) for (const c of fs.existsSync(a) ? Object.keys(placed(a)) : [a])
    if (i1[c.toLowerCase()] && !hd[c.toLowerCase()]) want.add(i1[c.toLowerCase()].id);
  const classDir = path.join(MOD, "data", "classes");
  fs.mkdirSync(classDir, { recursive: true });
  const report = [];
  for (const id of [...want].sort()) {
    const out = path.join(classDir, id + ".sc.xml");
    const eq = table[id];
    if (eq) { // the HD equivalent under the Imperivm I id; no altid (the original keeps it)
      const base = hd[eq.hd.toLowerCase()];
      const text = base.text.replace(base.head, base.head.replace(/\bid\s*=\s*"[^"]+"/, `id="${id}"`).replace(/\s+altid\s*=\s*"[^"]+"/, ""));
      fs.writeFileSync(out, `<!-- Imperivm I class ${id}: copy of the HD ${base.id} (${eq.how}) -->\n${text}\n`, "latin1");
      report.push(`${id} = ${base.id} (${eq.how})`);
      continue;
    }
    // no HD equivalent: the original class, with its art from the demo
    const c = i1[id.toLowerCase()];
    let text = c.text;
    const main = (text.match(/\bentity\s*=\s*"([^"]+)"/) || [])[1], err = main && copyEntity(main);
    if (err) { report.push(`${id}: ❌ ${err}`); continue; }
    const notes = [];
    for (const m of [...text.matchAll(/\s(entity_\w+)\s*=\s*"([^"]+)"/g)]) { // seasonal art: optional, the main one stands in
      if (m[2] === main) continue;
      const e = copyEntity(m[2]);
      if (e) { text = text.replace(m[0], ""); notes.push(`no ${m[1]} (${e})`); }
    }
    text = text.replace(/(\bentity(?:_\w+)?\s*=\s*")assets[\\/]entities[\\/]/gi, "$1");
    text = text.replace(/(<class\b[^>]*?)\s+altid\s*=\s*"[^"]+"/, "$1"); // a generic alias ("Warehouse") could clash with another mod
    fs.writeFileSync(out, `<!-- Imperivm I class ${id} with its original art (from the Celtic Kings demo) -->\n${text}\n`, "latin1");
    report.push(`${id}: original class + art${notes.length ? " — " + notes.join("; ") : ""}`);
  }
  const all = fs.readdirSync(classDir).map(f => f.replace(/\.sc\.xml$/i, "")).sort();
  fs.writeFileSync(path.join(MOD, "mod.json"), JSON.stringify({
    id: "imperivm1-legacy",
    name: "Imperivm I: clases clásicas",
    version: "1.0",
    authors: ["Haemimont Games", "FX Interactive", "Villoh (port)"],
    description: {
      spanish: `Clases de Imperivm I (Celtic Kings) que el juego HD ya no tiene, para los mapas que aún las colocan: las unidades como la equivalente de Imperivm III que eligió Haemimont al convertir sus mapas, y los objetos que el HD nunca tuvo (acantilados, rocas, almacén) con sus gráficos originales, recuperados de la demo de Celtic Kings. Incluye: ${all.join(", ")}.`,
      english: `Imperivm I (Celtic Kings) classes the HD game no longer has, for maps that still place them: units as the Imperivm III equivalent Haemimont chose when converting its maps, and objects the HD game never had (cliffs, rocks, warehouse) with their original art, recovered from the Celtic Kings demo. Includes: ${all.join(", ")}.`,
    },
    category: "Units & Heroes",
    tags: [],
    redistributable: true,
  }, null, 2) + "\n");
  console.log(`${path.relative(process.cwd(), MOD)}: ${all.length} classes\n  ${report.join("\n  ") || "(nothing new)"}`);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "setup") setup(...rest);
else if (cmd === "table") writeTable();
else if (cmd === "add") add(rest);
else die("usage: node tools/imperivm1.js setup <patch.exe> <demo.zip> | table | add <map.bfhp | Class>...");
