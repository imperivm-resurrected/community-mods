#!/usr/bin/env node
// Does each building of a port show on the strategic map? The engine draws a building from its class's entity= path (also entity_winter=, entity_autumn=,
// entity_spring=): it drops the last 8 characters (".ent.xml", or whatever they are: "X.ent_tag.xml" leaves "X.ent"), turns "/" into "-" and opens
// MINIMAP/ZOOM{8,16,32}/ENTITIES/<name>.BMP and OUTLINES/ZOOMn/{BLACK,COLOR}_<name>.BMP. A missing file is not drawn, with no error.
// tagCollisions (tools/lib/ported-patch.js) renames an entity that collides with another port's: its bitmaps have to follow it.
//
//   node tools/check-minimap.js [--game "<HD folder>"] [--detail] <dir> [<dir> ...]   a port (a folder with DATA/CLASSES) or a folder of ports
//                                                                                    (the game's mods/, ported/)
//   node tools/check-minimap.js --self-test [--lib <ported-patch.js>]                 synthetic ports; --lib tries another copy of tagCollisions
//
// For each port: the entities with a bitmap missing in the port and in HD, and whether it is a "rename" (a bitmap exists under the name the entity had
// before a tag was added to it: the port was built with the bug) or "absent" (never existed: the original did not have it either). Outlines are only
// expected where one exists under the pre-rename name (HD has them for town halls, villages, outposts and the like). Exit 1 if some are "rename".
// HD's baseline is the index of Packs/Minimap.pak and Outlines.pak of the game (--game, G=, or the Steam folder), else originals/game-data/paks.
// The objects HD's own classes name and HD has no bitmap for (fires, abstract Base* classes...) are left out: they are not a port's fault.
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const walk = (d, base = d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const ZOOMS = ["zoom8", "zoom16", "zoom32"], KINDS = /^(buildings|mapobjects)\//i;
const nameOf = e => e.replace(/\\/g, "/").slice(0, -8).replace(/\//g, "-").toLowerCase();         // what the engine builds

// names inside a game .pak (HMMSYS PackFile): a count at 0x20, then entries of length, shared prefix, the rest of the name and 8 bytes
function packNames(file) {
  const d = fs.readFileSync(file), n = d.readUInt32LE(0x20), out = []; let q = 0x28, prev = "";
  for (let i = 0; i < n; i++) { const len = d[q], sh = d[q + 1]; q += 2; const nm = prev.slice(0, sh) + d.toString("latin1", q, q + len - sh); q += len - sh + 8; prev = nm; out.push(nm.replace(/\\/g, "/").toLowerCase()); }
  return out;
}
const hdFromPaks = game => new Set(["Minimap", "Outlines"].flatMap(n => packNames(path.join(game, "Packs", fs.readdirSync(path.join(game, "Packs")).find(f => f.toLowerCase() === n.toLowerCase() + ".pak")))));
const hdFromDirs = root => new Set(["minimap", "outlines"].flatMap(n => { const d = fs.readdirSync(root).find(x => x.toLowerCase() === n); return d ? walk(path.join(root, d)).map(f => `${n}/${f}`.toLowerCase()) : []; }));

// the entity= paths of a set of class files: lowercase path -> {attr, cls, e}
function entitiesOf(files, read) {
  const ents = new Map();
  for (const f of files) for (const m of read(f).matchAll(/<class\b([\s\S]*?)>/gi)) {
    const cls = (/\bid\s*=\s*"([^"]+)"/i.exec(m[1]) || [])[1];
    for (const a of m[1].matchAll(/(?<!\w)(entity(?:_winter|_autumn|_spring)?)\s*=\s*"([^"]+)"/gi)) { const e = a[2].replace(/\\/g, "/"); if (KINDS.test(e) && !ents.has(e.toLowerCase())) ents.set(e.toLowerCase(), { attr: a[1].toLowerCase(), cls, e }); }
  }
  return ents;
}

// names an entity had before a port's rename: each "_tag" of a folder or file taken out, and ".ent_tag.xml" back to ".ent.xml"
function olds(e) {
  const base = e.replace(/\.ent_[a-z0-9]+\.xml$/i, ".ent.xml"), out = new Set();
  const toks = new Set([...e.matchAll(/_[a-z0-9]{2,4}(?=[\/.]|$)/gi)].map(m => m[0].toLowerCase()).filter(t => !/^_(as|aw|sw|w)$/.test(t)));   // _w, _aw...: HD's own winter/autumn variants
  for (const t of toks) out.add(nameOf(base.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?=[\\/.]|$)", "gi"), "")));
  if (base !== e) out.add(nameOf(base));
  return [...out];
}

// `skip`: engine names HD itself lacks bitmaps for (also when the port renamed one: HD's own HOutpost has none, nor does HOutpost_tag). `has`: a bitmap path (lowercase) exists in HD or in the port.
function checkPort(id, files, read, ownFiles, hd, skip) {
  const own = new Set(ownFiles.map(f => f.toLowerCase())), has = p => hd.has(p) || own.has(p);
  const ents = entitiesOf(files, read), r = { id, checked: ents.size, miss: [], outl: [] };
  for (const [k, v] of ents) {
    const n = nameOf(v.e), lacking = ZOOMS.filter(z => !has(`minimap/${z}/entities/${n}.bmp`));
    if (lacking.length && ![n, ...olds(v.e)].some(x => skip.has(x))) {
      const old = olds(v.e).find(o => ZOOMS.every(z => has(`minimap/${z}/entities/${o}.bmp`)));
      r.miss.push({ cls: v.cls, attr: v.attr, n, lacking, old: old || null });
    }
    for (const z of ZOOMS) for (const c of ["black", "color"]) {
      if (has(`outlines/${z}/${c}_${n}.bmp`)) continue;
      const old = olds(v.e).find(o => has(`outlines/${z}/${c}_${o}.bmp`));
      if (old) r.outl.push({ cls: v.cls, n: `${c}_${n}`, z, old });
    }
  }
  return r;
}

// the ports to check: dir itself if it has classes, else its folders that do
const classFiles = list => list.filter(f => /^data\/classes\/.*\.xml$/i.test(f));
function portsOf(dir) {
  const own = classFiles(walk(dir));
  if (own.length) return [{ id: path.basename(dir), dir, list: walk(dir) }];
  return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => ({ id: e.name, dir: path.join(dir, e.name), list: walk(path.join(dir, e.name)) })).filter(p => classFiles(p.list).length);
}
function skipSet(hd, classesDir) {
  const files = walk(classesDir).filter(f => /\.xml$/i.test(f)), s = new Set();
  for (const [k, v] of entitiesOf(files, f => fs.readFileSync(path.join(classesDir, f), "latin1"))) if (!ZOOMS.every(z => hd.has(`minimap/${z}/entities/${nameOf(v.e)}.bmp`))) s.add(nameOf(v.e));
  return s;
}
function report(ports, hd, skip, detail, quiet) {
  let bad = 0;
  const log = quiet ? () => {} : console.log;
  log("port".padEnd(34) + "entities  missing bitmaps (rename/absent)  missing outlines");
  for (const p of ports) {
    const r = checkPort(p.id, classFiles(p.list), f => fs.readFileSync(path.join(p.dir, f), "latin1"), p.list, hd, skip), ren = r.miss.filter(m => m.old).length;
    log(r.id.padEnd(34) + String(r.checked).padEnd(10) + `${r.miss.length} (${ren}/${r.miss.length - ren})`.padEnd(38) + r.outl.length);
    if (detail) { for (const m of r.miss) log(`    ${m.cls} [${m.attr}] ${m.n} lacks ${m.lacking.join(",")} ${m.old ? "rename (was " + m.old + ")" : "absent"}`); for (const m of r.outl) log(`    outline ${m.z} ${m.n} rename (was ${m.old})`); }
    bad += ren + r.outl.length;
  }
  return bad;
}

function selfTest(lib) {
  const { tagCollisions } = require(path.resolve(lib || path.join(__dirname, "lib", "ported-patch.js"))), assert = require("assert");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "minimap-")), put = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
  try {
    const zs = [8, 16, 32], bmps = (root, n, tint, outl = true) => zs.forEach(z => { put(path.join(root, `MINIMAP/ZOOM${z}/ENTITIES/${n.toUpperCase()}.BMP`), `m${z}${tint}`); if (outl) ["BLACK", "COLOR"].forEach(c => put(path.join(root, `OUTLINES/ZOOM${z}/${c}_${n.toUpperCase()}.BMP`), `o${z}${c}${tint}`)); });
    const cls = (ent, extra = "") => `<class id="C${ent.length}${extra.length}" entity="${ent}" ${extra}/>\n`;
    // the game: a town hall with bitmaps and outlines, a sentry and a Fountain (bitmaps, no outlines), a fire HD has none for
    const HD = path.join(T, "hd");
    ["Buildings/HTownhall/HTownhall.ent.xml", "Buildings/Sentry.ent.xml", "Buildings/Fountain/Fountain.ent.xml", "MapObjects/Fire/Fire.ent.xml"].forEach(e => put(path.join(HD, "DATA/CLASSES", path.basename(e, ".ent.xml") + ".SC.XML"), cls(e)));
    put(path.join(HD, "Buildings/Fountain/Fountain.ent.xml"), "hd");   // the game's entity: the port's other bytes collide, renamed alone
    bmps(HD, "buildings-htownhall-htownhall", "hd"); bmps(HD, "buildings-sentry", "hd", false); bmps(HD, "buildings-fountain-fountain", "hd", false);
    // another port with the same entities (other bytes): P's collide with them
    const Q = path.join(T, "q");
    ["Buildings/HTownhall/HTownhall.ent.xml", "Buildings/Sentry.ent.xml"].forEach(e => put(path.join(Q, e), "q" + e));
    // P: the town hall with its own bitmaps and a winter variant that has bitmaps too; the sentry file at the root (renamed alone: X.ent.xml -> X.ent_cae.xml);
    // Fountain's bitmaps are the game's (not shipped); Lone does not collide; a class of the game's folder keeps its name
    const P = path.join(T, "p");
    put(path.join(P, "DATA/CLASSES/A.SC.XML"), cls("Buildings/HTownhall/HTownhall.ent.xml", 'entity_winter="Buildings/HTownhall/HTownhall_w.ent.xml"') + cls("Buildings/Sentry.ent.xml") + cls("Buildings/Fountain/Fountain.ent.xml") + cls("Buildings/Lone/Lone.ent.xml") + cls("MapObjects/Fire/Fire.ent.xml"));
    ["Buildings/HTownhall/HTownhall.ent.xml", "Buildings/HTownhall/HTownhall_w.ent.xml", "Buildings/Sentry.ent.xml", "Buildings/Fountain/Fountain.ent.xml", "Buildings/Lone/Lone.ent.xml"].forEach(e => put(path.join(P, e), "p" + e));
    bmps(P, "buildings-htownhall-htownhall", "p"); bmps(P, "buildings-htownhall-htownhall_w", "p"); bmps(P, "buildings-sentry", "p", false); bmps(P, "buildings-lone-lone", "p");
    const hd = hdFromDirs(HD), skip = skipSet(hd, path.join(HD, "DATA/CLASSES")), run = () => report(portsOf(P), hd, skip, true, true);
    assert.deepStrictEqual([...skip], ["mapobjects-fire-fire"], "HD's own object without bitmaps is skipped");
    // Fountain's bitmaps are not shipped, but the game has them. The fire is skipped. Before the rename, nothing is missing.
    assert.strictEqual(portsOf(P)[0].id, "p"); assert.strictEqual(run(), 0, "no rename: nothing missing");
    fs.cpSync(P, path.join(T, "p0"), { recursive: true });
    const r = tagCollisions({ OUT: P, tag: "cae", others: [Q, HD], gameDirs: [HD], skip: /^(currentlang|ui\/menu)\// });
    assert(r.folders.includes("Buildings/HTownhall") && r.files.includes("Sentry.ent_cae.xml"), "the town hall folder and the sentry file were renamed: " + JSON.stringify(r));
    // the checker sees what the old behaviour (bitmaps left at the old names) does: a copy renamed the same way with the bitmaps untouched
    const O = path.join(T, "old"); fs.cpSync(path.join(T, "p0"), O, { recursive: true });
    fs.renameSync(path.join(O, "Buildings/HTownhall"), path.join(O, "Buildings/HTownhall_cae")); fs.renameSync(path.join(O, "Buildings/Sentry.ent.xml"), path.join(O, "Buildings/Sentry.ent_cae.xml"));
    put(path.join(O, "DATA/CLASSES/A.SC.XML"), fs.readFileSync(path.join(O, "DATA/CLASSES/A.SC.XML"), "latin1").replace(/HTownhall\//g, "HTownhall_cae/").replace(/Sentry\.ent\.xml/g, "Sentry.ent_cae.xml"));
    const oldOut = report(portsOf(O), hd, skip, true, true); assert(oldOut > 0, "the old behaviour must be reported");
    // the fix: every entity has its bitmaps and outlines under the engine's name; the sentry's keeps ".ent"
    assert.strictEqual(run(), 0, "bitmaps follow the renamed entities");
    const files = walk(P).map(f => f.toLowerCase());
    for (const f of ["minimap/zoom8/entities/buildings-htownhall_cae-htownhall.bmp", "minimap/zoom32/entities/buildings-htownhall_cae-htownhall_w.bmp", "outlines/zoom16/color_buildings-htownhall_cae-htownhall.bmp", "minimap/zoom16/entities/buildings-sentry.ent.bmp"]) assert(files.includes(f), "missing " + f);
    assert(!files.includes("minimap/zoom8/entities/buildings-htownhall-htownhall.bmp") && !files.includes("minimap/zoom8/entities/buildings-sentry.bmp"), "the old names are gone (no class names them)");
    assert(files.includes("minimap/zoom8/entities/buildings-lone-lone.bmp"), "an entity that was not renamed keeps its bitmap");
    assert.strictEqual(fs.readFileSync(path.join(P, "MINIMAP/ZOOM8/ENTITIES/BUILDINGS-HTOWNHALL_CAE-HTOWNHALL.BMP"), "latin1"), "m8p", "the port's own bitmap moves with the entity");
    assert(!files.some(f => /_cae\.bmp$/.test(f)), "no bitmap renamed alone");
    assert(files.includes("minimap/zoom8/entities/buildings-fountain-fountain.ent.bmp") && fs.existsSync(path.join(HD, "MINIMAP/ZOOM8/ENTITIES/BUILDINGS-FOUNTAIN-FOUNTAIN.BMP")), "the game's bitmaps (not shipped by the port) are copied, the game's stay");
    console.log("check-minimap self-test: ok (" + (lib ? lib : "tools/lib/ported-patch.js") + ")");
  } finally { fs.rmSync(T, { recursive: true, force: true }); }
}

const args = process.argv.slice(2), opt = (n, v) => { const i = args.indexOf(n); if (i < 0) return null; const x = v ? args.splice(i, 2)[1] : (args.splice(i, 1), true); return x; };
const selftest = opt("--self-test"), lib = opt("--lib", 1), detail = opt("--detail"), gameArg = opt("--game", 1);
if (selftest) { selfTest(lib); process.exit(0); }
if (!args.length) { console.error("usage: node tools/check-minimap.js [--game <HD folder>] [--detail] <port or folder of ports> ... | --self-test"); process.exit(1); }
const game = gameArg || process.env.G || path.join(os.homedir(), ".local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"), HDDIR = path.join(ROOT, "originals", "game-data", "paks");
const hd = fs.existsSync(path.join(game, "Packs")) ? hdFromPaks(game) : hdFromDirs(HDDIR);
let classes = path.join(HDDIR, "DATA", "CLASSES"), tmp = null;
if (!fs.existsSync(classes)) {                         // HD's classes from the game's data.pak, in a temporary folder (deleted after)
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hd-classes-")); const SDK = process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk");
  const x = cp.spawnSync("node", [path.join(SDK, "tools", "extract-data.js"), game, tmp, "data.pak", "CLASSES"], { encoding: "utf8" });
  if (x.status) { console.error(x.stderr || x.stdout); process.exit(1); }
  classes = fs.readdirSync(tmp).map(d => path.join(tmp, d)).find(d => fs.existsSync(path.join(d, "CLASSES"))) ; classes = classes ? path.join(classes, "CLASSES") : path.join(tmp, "DATA", "CLASSES");
}
const skip = skipSet(hd, classes); if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
console.log(`HD baseline: ${hd.size} bitmaps; ${skip.size} entities of HD's own classes without bitmaps are left out`);
let bad = 0; for (const d of args) bad += report(portsOf(d), hd, skip, detail);
process.exit(bad ? 1 : 0);
