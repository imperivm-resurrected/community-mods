// Celtic Kings Adventure (Larax, from Imperivm I) by Luken_SOD, MODS.md row 202 -> ported/celtic-kings-adventure/
//   node tools/celtic-kings-adventure.js
// Needs originals/forum/celtic-kings-adventure-larax-from-imperivm-i/files/ (the three ModDB zips), originals/game-data (HD data, and
// local-spanish / local-italian: the game's texts, see docs/SETUP.md) and bsdtar. Same result every run. Reasons in extras/celtic-kings-adventure/NOTES.md.
//
// The mod is one adventure in three editions (English, Spanish, Italian: each its own .bfhp with its own texts and voices) plus the
// classes, commands and items the adventure needs. The original changed HD's own Larax, DLleldoryn and Stonehenge classes, commands
// and two items in place (HD's adventures place them too), so here:
//   - the changed classes are classes of its own (CKLarax, CKThoric, CKDLleldoryn, CKStonehenge...; extras/.../data/classes), the commands
//     and the items are patches that only add (extras/.../patches), HD's stay as they are;
//   - the three .bfhp are edited in place (their pages are 512 bytes: a name that grows is paid for with indentation, see fit()) so
//     that they place and ask for the new ids: `class=`/`classoffirstbuilding=` in map.obj.xml, class arguments in the scripts, item ids in the scripts;
//   - the texts the mod added to the game's GAME.LOC.XML (one whole file per language in the original) become loc/<language>.loc.xml.
const fs = require("fs"), path = require("path"), os = require("os"), crypto = require("crypto"), { execFileSync } = require("child_process");
const hpfs = require("./hpfs.js");
const ROOT = path.join(__dirname, "..");
const ID = "celtic-kings-adventure";
const ZIPS = path.join(ROOT, "originals/forum/celtic-kings-adventure-larax-from-imperivm-i/files");
const GAME = path.join(ROOT, "originals/game-data");
const OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const BSDTAR = process.env.BSDTAR || (process.platform === "linux" ? "bsdtar" : "tar");

// file name in adventures/ (the three .bfhp are called the same inside the zips), language of the loc file
const EDITIONS = [
  { zip: "Celtic_Kings_Adventure_-_Vanilla_-_English.4.zip", file: "Celtic Kings Adventure (English)", loc: "english" },
  { zip: "Celtic_Kings_Adventure_-_Vanilla_-_Spanish.4.zip", file: "Celtic Kings Adventure (Español)", loc: "spanish" },
  { zip: "Celtic_Kings_Adventure_-_Vanilla_-_Italian.4.zip", file: "Celtic Kings Adventure (Italiano)", loc: "italian" },
];
// HD classes the mod redefined -> the mod's own ones (lowercase old id -> new id). DLleldoryn_Map3 is not HD's and stays.
const CLASSES = { larax: "CKLarax", thoric: "CKThoric", dlleldoryn: "CKDLleldoryn", stonehenge1: "CKStonehenge1", stonehenge2: "CKStonehenge2" };
// HD items the mod changed -> the mod's own (the id is also the name: the adventure keeps a hero's items by name between maps)
const ITEMS = { "Glowing gem": "CK Glowing gem", "Gem of Power": "CK Gem of Power" };
// the original's files that extras/ replaces (lowercase path inside its pak) and the one that is only renamed
const REPLACED = new Set(["data/classes/larax.sc.xml", "data/classes/thoric.sc.xml", "data/classes/dlleldoryn.sc.xml", "data/classes/stonehenge.sc.xml",
  "data/sound entities/voicelarax.xml", "data/items.xml", "data/commands/druid.xml", "data/commands/stonehenge.xml", "units/dlleldoryn/dlleldoryn.ent.xml"]);
const RENAMED = { "data/itemscripts/glowing gem.vs": "data/itemscripts/ck glowing gem.vs" };

const md5 = b => crypto.createHash("md5").update(b).digest("hex");
const die = msg => { console.error("❌ " + msg); process.exit(1); };

// ---- .pak ("HMMSYS PackFile", as in the SDK's shrink-mod.js) ----
function readPak(file) {
  const b = fs.readFileSync(file);
  if (b.toString("latin1", 0, 15) !== "HMMSYS PackFile") die(`${file} is not a pak`);
  const n = b.readUInt32LE(0x20), out = new Map();
  let p = 0x28, prev = "";
  for (let i = 0; i < n; i++) {
    const len = b[p], sh = b[p + 1];
    p += 2;
    const name = prev.slice(0, sh) + b.toString("latin1", p, p + len - sh);
    p += len - sh;
    const off = b.readUInt32LE(p), size = b.readUInt32LE(p + 4);
    p += 8; prev = name;
    out.set(name.toLowerCase().replace(/\\/g, "/"), b.subarray(off, off + size));
  }
  return out;
}

// ---- rewriting what the maps ask for ----
// A name that grows (Larax -> CKLarax) must not change the length of the file inside the .bfhp: whitespace pays for it, never code.
function fit(text, length) {
  let t = text;
  const steps = [s => s.replace(/[ \t]+$/gm, ""), s => s.replace(/\r\n/g, "\n"), s => s.replace(/^[ \t]+/gm, ""), s => s.replace(/\n{2,}/g, "\n")];
  for (const step of steps) { if (t.length <= length) break; t = step(t); }
  if (t.length > length) die(`no room: ${t.length - length} bytes too many`);
  return t + " ".repeat(length - t.length); // a file that shrank is padded after its last line
}
const CLASS_FUNCS = new Set(["AreaObjs", "ClassPlayerAreaObjs", "ObjsInSight", "UnitsAroundSettlement"]); // their arguments are classes
const NAME_FUNCS = new Set(["GetNamedObj", "SpawnNamed", "SetActor", "CreateNamedObj"]);                  // their arguments are names of placed objects
const CLASS_VARS = new Set(["s_larax", "s_class"]);                                                       // strings the scripts compare with .class or Mutate() with
// the call whose parentheses hold position p ("" if none, null if the statement has no call around it)
function enclosing(s, p) {
  let depth = 0;
  for (let i = p - 1; i >= 0; i--) {
    const c = s[i];
    if (c === ")") depth++;
    else if (c === "(") { if (!depth) return (s.slice(Math.max(0, i - 40), i).match(/([A-Za-z_]\w*)\s*$/) || [, ""])[1]; depth--; }
    else if (c === ";" || c === "{" || c === "}") return null;
  }
  return null;
}
const QUOTED = new RegExp(`"(${Object.keys(CLASSES).join("|")})"`, "gi");
function rewriteScript(s, where, count) {
  let t = s.replace(QUOTED, (m, id, at) => {
    const call = enclosing(s, at);
    if (call && CLASS_FUNCS.has(call)) { count.classes++; return `"${CLASSES[id.toLowerCase()]}"`; }
    if (call && NAME_FUNCS.has(call)) return m;
    const v = call === null && (s.slice(Math.max(0, at - 30), at).match(/(\w+)\s*=\s*$/) || [])[1];
    if (v && CLASS_VARS.has(v)) { count.classes++; return `"${CLASSES[id.toLowerCase()]}"`; }
    die(`${where}: ${m} in an unknown place (${call ?? "no call"}): ${s.slice(Math.max(0, at - 40), at + 30).replace(/\s+/g, " ")}`);
  });
  for (const [from, to] of Object.entries(ITEMS)) t = t.replace(new RegExp(`"${from}"`, "g"), () => { count.items++; return `"${to}"`; });
  return t;
}
function rewriteMapObj(s, count) {
  return s.replace(new RegExp(`\\b(class|classoffirstbuilding)="(${Object.keys(CLASSES).join("|")})"`, "gi"), (m, attr, id) => { count.classes++; return `${attr}="${CLASSES[id.toLowerCase()]}"`; });
}
function rewriteMap(file) {
  const buf = fs.readFileSync(file), count = { classes: 0, items: 0, files: 0 };
  for (const e of hpfs(buf)) {
    const isObj = /(^|\/)map\.obj\.xml$/i.test(e.path), isVs = /\.vs$/i.test(e.path);
    if (!isObj && !isVs) continue;
    const old = e.read().toString("latin1"), c = { classes: 0, items: 0 };
    const t = isObj ? rewriteMapObj(old, c) : rewriteScript(old, `${path.basename(file)}: ${e.path}`, c);
    if (t === old) continue;
    e.write(Buffer.from(fit(t, old.length), "latin1"));
    count.classes += c.classes; count.items += c.items; count.files++;
  }
  fs.writeFileSync(file, buf);
  // nothing of HD's may be left in the places that name a class or an item
  for (const e of hpfs(fs.readFileSync(file))) {
    const t = e.read().toString("latin1");
    if (/(^|\/)map\.obj\.xml$/i.test(e.path) && new RegExp(`\\b(class|classoffirstbuilding)="(${Object.keys(CLASSES).join("|")})"`, "i").test(t)) die(`${e.path}: an HD class is left`);
    if (/\.vs$/i.test(e.path) && Object.keys(ITEMS).some(i => t.includes(`"${i}"`))) die(`${e.path}: an HD item is left`);
  }
  return count;
}

// ---- texts: what the mod added to the game's GAME.LOC.XML ----
const ENTRY = /<translationtableentry\b((?:[^>"]|"[^"]*")*)\/>/g;
const attr = (a, k) => (a.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1];
function readLoc(buf) {
  const m = new Map();
  for (const [, a] of buf.toString("utf8").matchAll(ENTRY)) {
    const text = attr(a, "text"), context = attr(a, "context") ?? "", result = attr(a, "result") ?? "";
    m.set(`${text}\u0000${context}`, { text, context, result }); // text is the whole key ("Larax@Larax class name"): it goes out as it is
  }
  return m;
}
const line = e => `  <translationtableentry text="${e.text}" result="${e.result}"/>`;
function locFile(lang, modLoc) {
  const base = lang === "english" ? null : readLoc(fs.readFileSync(path.join(GAME, `local-${lang}`, "CURRENTLANG", "GAME.LOC.XML")));
  const out = new Map(), add = e => out.set(e.text, e);
  const ren = s => s.replace(/\b(\w+) class name/g, (m, id) => CLASSES[id.toLowerCase()] ? `${CLASSES[id.toLowerCase()]} class name` : m);
  if (modLoc) for (const [k, e] of readLoc(modLoc)) if (!base.has(k)) add({ ...e, text: ren(e.text), context: ren(e.context) }); // what HD does not have (Thoric's names are CKThoric's now)
  if (base) for (const [, e] of base) { // the names of HD's classes that have a CK copy: same texts, the new id as context
    const m = e.context.match(/^(\w+) class name( plural)?$/);
    if (m && ["larax", "dlleldoryn"].includes(m[1].toLowerCase())) add({ ...e, text: ren(e.text), context: ren(e.context) });
  }
  for (const [from, to] of Object.entries(ITEMS)) { // the item names: HD's translation of the name they had
    const hd = base && base.get(`${from}\u0000`);
    if (base && !hd) die(`${lang}: no text for the item ${from}`);
    add({ text: to, context: "", result: hd ? hd.result : from });
  }
  return `<translationtable>\n${[...out.values()].map(line).join("\n")}\n</translationtable>\n`;
}

// ---- build ----
const work = fs.mkdtempSync(path.join(os.tmpdir(), "ck-adventure-"));
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, "adventures"), { recursive: true });
const seen = new Map(); // files that are the same in the three zips: the first one's goes in, the others are checked
const same = (key, buf) => { const h = md5(buf); if (seen.has(key) && seen.get(key) !== h) die(`${key} differs between the editions`); seen.set(key, h); };
const locs = {};
for (const ed of EDITIONS) {
  const zip = path.join(ZIPS, ed.zip), dir = path.join(work, ed.loc);
  if (!fs.existsSync(zip)) die(`missing ${zip}`);
  fs.mkdirSync(dir);
  execFileSync(BSDTAR, ["-xf", zip, "-C", dir], { maxBuffer: 1 << 28 });
  const f = n => path.join(dir, n);
  fs.copyFileSync(f("Adventures/Celtic Kings Adventure.bfhp"), path.join(OUT, "adventures", ed.file + ".bfhp"));
  fs.copyFileSync(f("Adventures/Celtic Kings Adventure.bmp"), path.join(OUT, "adventures", ed.file + ".bmp"));
  const n = rewriteMap(path.join(OUT, "adventures", ed.file + ".bfhp"));
  console.log(`${ed.file}: ${n.files} files rewritten, ${n.classes} class ids, ${n.items} item ids`);
  // movies, music and the classes are the same in the three
  for (const [sub, to] of [["Movies", "movies"], ["Music", "music"]])
    for (const name of fs.readdirSync(f(sub))) {
      const b = fs.readFileSync(f(path.join(sub, name)));
      same(`${to}/${name}`, b);
      fs.mkdirSync(path.join(OUT, to), { recursive: true });
      fs.writeFileSync(path.join(OUT, to, name), b);
    }
  const pak = readPak(f("Packs/zCelticKingsAdventure.pak"));
  same("pak", Buffer.concat([...pak].sort(([a], [b]) => a.localeCompare(b)).map(([, d]) => d)));
  if (ed.loc === "english") for (const [p, data] of pak) { // written once
    if (REPLACED.has(p)) continue;
    const to = path.join(OUT, RENAMED[p] || p);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, data);
  }
  // the language pack is HD's own plus the mod's texts: only its GAME.LOC.XML differs
  const lang = ed.loc === "english" ? null : readPak(f(`local/${ed.loc}.pak`)).get("currentlang/game.loc.xml");
  if (ed.loc !== "english" && !lang) die(`${ed.loc}.pak has no currentlang/game.loc.xml`);
  fs.mkdirSync(path.join(OUT, "loc"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "loc", ed.loc + ".loc.xml"), locFile(ed.loc, lang));
}
fs.rmSync(work, { recursive: true });
// the final files: classes, patches, mod.json, NOTES.md
fs.cpSync(EXTRAS, OUT, { recursive: true });
// the original's scripts must not name what was renamed (class ids and item ids of HD)
const bad = [];
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(path.join(OUT, "data")).filter(f => /\.(vs|xml)$/i.test(f))) {
  const t = fs.readFileSync(f, "latin1");
  if (Object.keys(ITEMS).some(i => t.includes(`"${i}"`))) bad.push(f);
}
if (bad.length) die(`HD item ids left in: ${bad.join(", ")}`);
console.log(`${OUT}`);
