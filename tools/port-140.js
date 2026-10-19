// Ports a loose-file mod made for Imperivm III 1.40 (copied over the game folder, often with its own rle.mmp) to
// Imperivm Resurrected on the HD game, keeping the HD fixes:
//
//   node tools/port-140.js <old mod folder> <output folder> --id <id> --name "<Name>" --version <v> --category "<Category>"
//
// Needs, once:
//   originals/game-data/paks/        every HD Packs\*.pak extracted (extract-data.js "<game>" <that> <pak>, one per pak)
//   originals/game-data/local-spanish/  the HD local\spanish.pak (CURRENTLANG)
//   originals/game-140/paks/         the 1.40 patch's data.pak, Units.pak, Buildings.pak, MapObjects.pak extracted
//                                    (Cab3.cab inside "Imperivm III-1.40-ES.exe", forum t731 "Imperium_3_official_patch.zip")
//
// Each file of the old mod:
//   same as HD                  dropped
//   same as 1.40                dropped (the HD version, with its fixes, stays)
//   HD = 1.40                   the mod's version
//   both changed                3-way merge (git merge-file) with 1.40 as base; where both touched the same lines,
//                               .xml merges attribute by attribute and .ini key by key (the mod wins a value both changed:
//                               it is a balance mod), lines only one side added are kept. What no rule settles takes the
//                               mod's side and goes to the report, for review by hand.
//   new                         copied
//   *.rle.mmp                   pixels from the mod's rle.mmp -> standalone .rle; dropped if the HD sprite has the same pixels
//   currentlang\*.loc.xml       only the entries that differ from the HD Spanish table -> loc\spanish.loc.xml
//   currentlang\ other text     local\spanish\ (the mod's language); images stay in currentlang\
//   Thumbs.db, *.bak            dropped
// The report (what to check by hand) goes to raw/port-140/<id>.md. Uses the SDK in ../imperivm-resurrected/sdk/en (SDK=<path>).
const fs = require("fs"), path = require("path"), os = require("os"), crypto = require("crypto"), { spawnSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const SDK = process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk", "en");
const rle = require(path.join(SDK, "tools", "lib", "rle.js"));
const GAME = process.env.GAME || path.join(os.homedir(), ".local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD");
const die = m => { console.error(m); process.exit(1); };

const args = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < args.length; i++) args[i].startsWith("--") ? (opt[args[i].slice(2)] = args[++i]) : pos.push(args[i]);
const [modDir, outDir] = pos;
if (!modDir || !outDir || !opt.id) die("usage: node tools/port-140.js <old mod> <output> --id <id> [--name N --version V --category C]");
if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) die("the output folder has to be empty: " + outDir);

const idx = d => { const m = new Map(); if (!fs.existsSync(d)) return m;
  for (const f of fs.readdirSync(d, { recursive: true })) { const p = path.join(d, f); if (fs.statSync(p).isFile()) m.set(f.toLowerCase().replace(/\\/g, "/"), p); } return m; };
const HD = idx(path.join(ROOT, "originals/game-data/paks")), OLD = idx(path.join(ROOT, "originals/game-140/paks"));
for (const sub of ["Scenarios", "Adventures", "Music", "Movies", "Units"]) for (const [k, v] of idx(path.join(GAME, sub))) HD.set(sub.toLowerCase() + "/" + k, v);
if (!HD.size) die("extract the HD packs to originals/game-data/paks first");
if (!OLD.size) die("extract the 1.40 packs to originals/game-140/paks first");
const md5 = b => crypto.createHash("md5").update(b).digest("hex");
const report = [], stats = {};
const count = k => (stats[k] = (stats[k] || 0) + 1);
// a Latin-1 class with accents doesn't load in the HD game (and it doesn't warn): classes go out as UTF-8
const isUtf8 = b => { try { new TextDecoder("utf-8", { fatal: true }).decode(b); return true; } catch { return false; } };
// 1.40 ran item and victory scripts without the signature line; the HD game needs it (the same as its own scripts)
const SIGNATURES = { itemscripts: "//void, Obj owner", gamescripts: "//void, int player, str param" };
const write = (rel, data) => { if (/\.sc\.xml$/i.test(rel) && !isUtf8(data)) { data = Buffer.from(data.toString("latin1"), "utf8"); count("class converted to UTF-8"); }
  const sig = /\.vs$/i.test(rel) && SIGNATURES[rel.split(/[\\/]/).slice(-2, -1)[0].toLowerCase()];
  if (sig && !/^\s*\/\//.test(data.toString("latin1"))) { data = Buffer.concat([Buffer.from(sig + "\r\n"), data]); count("script signature added"); }
  const p = path.join(outDir, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); };

// --- merging a conflict hunk (arrays of lines: hd, base, mod) ---
const attrs = l => [...l.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map(m => [m[1], m[2]]);
const keyers = {
  xml: l => l.replace(/"[^"]*"/g, '""').trim(),                 // a line is its tag/attribute skeleton
  ini: l => (/^\s*[^;#=\s][^=]*=/.test(l) ? l.split("=")[0].trim().toLowerCase() : l.trim()),
};
function mergeLine(type, a, o, b) { // same key on the three sides
  if (b === o) return a;
  if (a === o || a === b) return b;
  if (type === "ini") return b;
  const va = attrs(a), vo = attrs(o), vb = attrs(b);
  if (va.length !== vo.length || vb.length !== vo.length) return b;
  let i = 0;
  return b.replace(/([\w-]+)(\s*=\s*")([^"]*)"/g, (_m, k, eq, v) => { const r = vb[i][1] === vo[i][1] ? va[i][1] : v; i++; return `${k}${eq}${r}"`; });
}
function mergeHunk(type, A, O, B) { // returns [lines, unresolved?]
  const num = s => s.join("\n").replace(/-?\d+(\.\d+)?/g, "#").replace(/\s+/g, " ").trim();
  if (num(A) === num(B)) return [B, false];                     // only numbers differ: the mod's balance
  if (!O.join("").trim()) return [[...A, ...B], false];         // both added different things: keep both
  const key = keyers[type];
  if (!key) return [B, true];
  const map = L => { const m = new Map(); for (const l of L) { if (!l.trim()) continue; const k = key(l); if (m.has(k)) return null; m.set(k, l); } return m; };
  const a = map(A), o = map(O), b = map(B);
  if (!a || !o || !b) return [B, true];
  const out = [];
  for (const l of B) {
    if (!l.trim()) { out.push(l); continue; }
    const k = key(l);
    if (a.has(k)) out.push(mergeLine(type, a.get(k), o.get(k) ?? a.get(k), l));
    else if (o.has(k)) { if (l !== o.get(k)) return [B, true]; }  // HD removed it (and the mod changed it: by hand)
    else out.push(l);                                               // the mod added it
  }
  for (const [k, l] of a) {
    if (b.has(k)) continue;
    if (o.has(k)) { if (l !== o.get(k)) return [B, true]; continue; } // the mod removed it (HD changed it: by hand)
    // HD added it: goes at the end of the hunk, so only a whole element or ini line is safe there
    if (type === "xml" && !/^\s*<[^]*>\s*$/.test(l)) return [B, true];
    out.push(l);
  }
  return [out, false];
}
// .ini: key by key over the whole file (HD moved blocks around, so hunks would look like deletions). Start from HD's
// text and apply the values the mod changed from 1.40; keys the mod added go at the end of their section.
function mergeIni(hdFile, baseFile, modFile) {
  const parse = f => { const m = new Map(); let sec = "";
    for (const l of fs.readFileSync(f, "latin1").split(/\r?\n/)) {
      const s = l.match(/^\s*\[([^\]]+)\]/); if (s) { sec = s[1].trim().toLowerCase(); continue; }
      const kv = l.match(/^\s*([^;#=\s][^=]*?)\s*=\s*(.*?)\s*(;.*)?$/); if (kv) m.set(sec + "\u0000" + kv[1].toLowerCase(), { sec, key: kv[1], val: kv[2], line: l });
    } return m; };
  const hd = parse(hdFile), base = parse(baseFile), mod = parse(modFile);
  const byKey = new Map([...hd.values()].map(e => [e.key.toLowerCase(), e])); // HD may have moved a key to another section
  const change = new Map(), add = [];
  for (const [k, e] of mod) {
    const b = base.get(k);
    if (b && b.val === e.val) continue;
    const h = hd.get(k) || byKey.get(e.key.toLowerCase());
    if (h) { if (h.val !== e.val) change.set(h, e); } else add.push(e);
  }
  const eol = fs.readFileSync(hdFile, "latin1").includes("\r\n") ? "\r\n" : "\n";
  const out = [];
  let sec = "";
  const flush = () => { for (const e of add.filter(e => e.sec === sec)) out.push(e.line); };
  for (const l of fs.readFileSync(hdFile, "latin1").split(/\r?\n/)) {
    const s = l.match(/^\s*\[([^\]]+)\]/);
    if (s) { flush(); sec = s[1].trim().toLowerCase(); out.push(l); continue; }
    const kv = l.match(/^\s*([^;#=\s][^=]*?)\s*=/), h = kv && hd.get(sec + "\u0000" + kv[1].toLowerCase());
    out.push(h && change.has(h) ? l.replace(/(=\s*)(.*?)(\s*(;.*)?)$/, (_m, eq, _v, rest) => eq + change.get(h).val + rest) : l);
  }
  flush();
  const secs = new Set([...hd.values()].map(e => e.sec));
  for (const s of new Set(add.filter(e => !secs.has(e.sec)).map(e => e.sec))) { out.push(`[${s}]`); for (const e of add.filter(e => e.sec === s)) out.push(e.line); }
  return out.join(eol);
}
function merge3(rel, hdFile, baseFile, modFile) {
  const type = /\.xml$/i.test(rel) ? "xml" : /\.ini$/i.test(rel) ? "ini" : "text";
  if (type === "ini") return mergeIni(hdFile, baseFile, modFile);
  const res = spawnSync("git", ["merge-file", "-p", "--diff3", "-L", "HD", "-L", "1.40", "-L", "mod", hdFile, baseFile, modFile], { encoding: "latin1", maxBuffer: 1e8 });
  if (res.status === 0) return res.stdout;
  const eol = res.stdout.includes("\r\n") ? "\r\n" : "\n";
  const lines = res.stdout.split(/\r?\n/), out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("<<<<<<< HD")) { out.push(lines[i]); continue; }
    const A = [], O = [], B = [];
    let side = A;
    for (i++; !lines[i].startsWith(">>>>>>> mod"); i++) {
      if (lines[i].startsWith("||||||| 1.40")) side = O; else if (lines[i] === "=======") side = B; else side.push(lines[i]);
    }
    const [merged, unresolved] = mergeHunk(type, A, O, B);
    if (unresolved) report.push({ rel, A, O, B });
    out.push(...merged);
  }
  return out.join(eol);
}

// --- sprites ---
const modMmp = fs.existsSync(path.join(modDir, "rle.mmp")) ? fs.openSync(path.join(modDir, "rle.mmp"), "r") : null;
const gameMmp = fs.openSync(path.join(GAME, "rle.mmp"), "r");
const sheet = (file, fd) => { const s = rle.parse(fs.readFileSync(file)); rle.resolveMmp(s, fd); return rle.write(s); };

// --- texts: the mod's translation table, minus what the HD Spanish table already says ---
const locEntries = s => { const m = new Map(); for (const e of s.matchAll(/<translationtableentry\b[^>]*?\/>/g)) {
  const t = (e[0].match(/\btext="([^"]*)"/) || [])[1], c = (e[0].match(/\bcontext="([^"]*)"/) || [])[1] || "", r = (e[0].match(/\bresult="([^"]*)"/) || [])[1];
  if (t != null) m.set(t + "\u0000" + c, { t, c, r, line: e[0] }); } return m; };
const hdLoc = idx(path.join(ROOT, "originals/game-data/local-spanish"));
// loose files in the game folder beat the pack (Steam ships a 1920x1080 Currentlang/MENUBACKGROUND.bmp over the 1366x768 one)
for (const [k, v] of idx(path.join(GAME, "Currentlang"))) hdLoc.set("currentlang/" + k, v);
const decode = b => (b.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) || !/[\x80-\xff]/.test(b.toString("latin1")) ? b.toString("utf8") : (() => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; })());

// An old 4:3 BMP (16-bit 5-5-5 or 24-bit) fitted to width x height as 24-bit: scaled to the new height, then the left half
// and a thin right border stay as drawn and the band between them is stretched to fill the width. Old menu backgrounds put
// their figure on the left and a frame on the right, with plain parchment in between. Bilinear.
// ponytail: fixed layout (left half + right border); a per-mod crop option if some background has its figure elsewhere
function fitBmp(b, width, height) {
  const off = b.readUInt32LE(10), w = b.readInt32LE(18), hh = b.readInt32LE(22), h = Math.abs(hh), bpp = b.readUInt16LE(28);
  if (b.readUInt32LE(30) !== 0 || (bpp !== 16 && bpp !== 24)) return null;
  const k = height / h, sw = w * k;                                   // scaled to the new height
  if (sw > width + 1) return null;                                    // would need cropping: not this case
  const inStride = Math.ceil(w * bpp / 32) * 4, px = (x, y) => { const o = off + (hh > 0 ? h - 1 - y : y) * inStride + x * bpp / 8;
    if (bpp === 24) return [b[o + 2], b[o + 1], b[o]];
    const v = b.readUInt16LE(o); return [(v >> 10 & 31) * 255 / 31, (v >> 5 & 31) * 255 / 31, (v & 31) * 255 / 31]; };
  const left = Math.floor(sw / 2), border = Math.round(24 * k), band = sw - left - border, newBand = width - left - border;
  const srcX = x => (x < left ? x : x >= left + newBand ? x - newBand + band : left + (x - left) * band / newBand) / k;
  const outStride = Math.ceil(width * 3 / 4) * 4, out = Buffer.alloc(54 + outStride * height);
  out.write("BM", 0); out.writeUInt32LE(out.length, 2); out.writeUInt32LE(54, 10); out.writeUInt32LE(40, 14);
  out.writeInt32LE(width, 18); out.writeInt32LE(height, 22); out.writeUInt16LE(1, 26); out.writeUInt16LE(24, 28); out.writeUInt32LE(outStride * height, 34);
  const xs = Array.from({ length: width }, (_, x) => Math.min(Math.max(srcX(x + 0.5) - 0.5, 0), w - 1));
  for (let y = 0; y < height; y++) {
    const sy = Math.min(Math.max((y + 0.5) / k - 0.5, 0), h - 1), y0 = Math.floor(sy), ty = sy - y0, y1 = Math.min(y0 + 1, h - 1);
    const row = height - 1 - y;                                       // BMP rows are bottom-up
    for (let x = 0; x < width; x++) {
      const sx = xs[x], x0 = Math.floor(sx), tx = sx - x0, x1 = Math.min(x0 + 1, w - 1);
      const p00 = px(x0, y0), p10 = px(x1, y0), p01 = px(x0, y1), p11 = px(x1, y1), o = 54 + row * outStride + x * 3;
      for (let c = 0; c < 3; c++) out[o + 2 - c] = Math.round((p00[c] * (1 - tx) + p10[c] * tx) * (1 - ty) + (p01[c] * (1 - tx) + p11[c] * tx) * ty);
    }
  }
  return out;
}
// the menu draws only CurrentLang/MenuBackground.bmp, at its own size (Steam HD: 1920x1080, loose); menu_16_9/menu_4_3 are never read
const MENU_SET = ["menubackground.bmp"];

const locSeen = new Set();
for (const f of fs.readdirSync(modDir, { recursive: true })) {
  const p = path.join(modDir, f);
  if (!fs.statSync(p).isFile()) continue;
  // zip names saved as UTF-8 read as CP850 then stored again ("á" -> "Ã¡" -> bsdtar "ǭ")
  // ponytail: only the vowels seen so far; a real CP850 decoder if other letters turn up
  const rel = f.replace(/\\/g, "/").replace(/ǭ/g, "á"), k = rel.toLowerCase(), top = k.split("/")[0];
  if (/(^|\/)thumbs\.db$|\.bak$/.test(k) || k === "rle.mmp" || k === "mod.json") { count("dropped (junk/rle.mmp)"); continue; }
  if (/\.rle\.mmp$/.test(k)) {
    if (!modMmp) die(`${rel}: a .rle.mmp needs the mod's rle.mmp`);
    const data = sheet(p, modMmp), out = rel.replace(/\.mmp$/i, "");
    const g = HD.get(k);
    if (g && md5(sheet(g, gameMmp)) === md5(data)) { count("sprite same as HD"); continue; }
    if (g) report.push({ rel, note: "changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder" });
    write(out, data); count(g ? "sprite changed (not applied!)" : "sprite new");
    continue;
  }
  if (top === "currentlang") {
    const inner = rel.split("/").slice(1).join("/");
    if (/\.loc\.xml$/i.test(k)) {
      const mine = locEntries(decode(fs.readFileSync(p))), hd = locEntries(decode(fs.readFileSync(hdLoc.get("currentlang/game.loc.xml"))));
      for (const [key, e] of mine) if (!locSeen.has(key) && (!hd.has(key) || hd.get(key).r !== e.r)) locSeen.add(key);
      locSeen.mine = new Map([...(locSeen.mine || []), ...mine]);
      count("text table merged"); continue;
    }
    const g = hdLoc.get(k), data = fs.readFileSync(p);
    if (g && md5(fs.readFileSync(g)) === md5(data)) { count("same as HD"); continue; }
    // a menu background drawn for 1024x768 over HD's 1366x768: the HD menu is laid out for its own size, so widen it
    const size = b => (b.toString("latin1", 0, 2) === "BM" ? [b.readInt32LE(18), Math.abs(b.readInt32LE(22))] : null);
    const a = size(data), h = g && size(fs.readFileSync(g));
    if (a && h && (a[0] !== h[0] || a[1] !== h[1])) {
      const set = MENU_SET.includes(inner.toLowerCase()) ? MENU_SET : [inner.toLowerCase()];
      const fits = set.map(n => { const gg = hdLoc.get("currentlang/" + n), hs = gg && size(fs.readFileSync(gg)); return hs && [n, fitBmp(data, hs[0], hs[1])]; }).filter(x => x && x[1]);
      if (fits.length === set.length) { for (const [n, img] of fits) write(path.join("CURRENTLANG", n.toUpperCase()), img); count(`screen image fitted to HD (${fits.length} sizes)`); continue; }
      count("low-res screen image (HD kept)"); report.push({ rel, note: `${a.join("x")} over HD's ${h.join("x")}: left out, HD's stays` }); continue;
    }
    write(/\.(xml|txt|ini)$/i.test(k) ? path.join("local/spanish", inner) : rel, data); count("language file");
    continue;
  }
  const data = fs.readFileSync(p), g = HD.get(k), o = OLD.get(k);
  if (!g) { write(rel, data); count("new"); continue; }
  const hdData = fs.readFileSync(g);
  if (md5(hdData) === md5(data)) { count("same as HD"); continue; }
  // the same up to the editor folder, id case and line ends: HD's
  const norm = b => b.toString("latin1").replace(/\r/g, "").replace(/\s*<properties edittree_pos="[^"]*"\/>/g, "").replace(/\bid="[^"]*"/, m => m.toLowerCase()).trim();
  if (norm(hdData) === norm(data)) { count("same as HD (but the editor folder)"); continue; }
  if (!o) { write(rel, data); count("changed (no 1.40 base: mod's)"); if (/\.(xml|vs|ini)$/i.test(k)) report.push({ rel, note: "changed, but 1.40 has no such file to compare: the mod's version was used" }); continue; }
  const oData = fs.readFileSync(o);
  if (md5(oData) === md5(data)) { count("same as 1.40 (HD kept)"); continue; }
  if (md5(oData) === md5(hdData)) { write(rel, data); count("changed by the mod only"); continue; }
  if (!/\.(xml|vs|ini|txt)$/i.test(k)) { write(rel, data); count("binary changed by both (mod's)"); continue; }
  write(rel, Buffer.from(merge3(rel, g, o, p), "latin1")); count("merged with HD");
}
if (locSeen.size) {
  const lines = [...locSeen].map(k => locSeen.mine.get(k).line);
  write("loc/spanish.loc.xml", "\ufeff<translationtable>\n" + lines.join("\n") + "\n</translationtable>\n");
  stats["texts that differ from HD"] = lines.length;
}

// conflicts resolved by hand: extras/<id>/ holds the final files, copied over the result (and off the report)
const EXTRAS = path.join(ROOT, "extras", opt.id);
if (fs.existsSync(EXTRAS)) for (const f of fs.readdirSync(EXTRAS, { recursive: true })) {
  const p = path.join(EXTRAS, f);
  if (!fs.statSync(p).isFile()) continue;
  const k = f.replace(/\\/g, "/").toLowerCase();
  const outRel = fs.readdirSync(outDir, { recursive: true }).find(x => x.replace(/\\/g, "/").toLowerCase() === k) || f;
  write(outRel, fs.readFileSync(p));
  for (let i = report.length - 1; i >= 0; i--) if (report[i].rel.toLowerCase() === k) report.splice(i, 1);
  count("resolved by hand (extras/)");
}
let manifest = {};
for (const f of [path.join(modDir, "mod.json"), path.join(EXTRAS, "mod.json")]) { try { Object.assign(manifest, JSON.parse(fs.readFileSync(f, "utf8"))); } catch { /* none */ } } // extras/<id>/mod.json: credits, description
// the SDK libs turn English option names into their Spanish ones (--name -> nombre, --category -> categoria)
const name = opt.name || opt.nombre, category = opt.category || opt.categoria, version = opt.version;
Object.assign(manifest, { id: opt.id }, name && { name }, version && { version }, category && { category });
write("mod.json", JSON.stringify(manifest, null, 2) + "\n");

const rep = path.join(ROOT, "raw", "port-140", opt.id + ".md");
fs.mkdirSync(path.dirname(rep), { recursive: true });
fs.writeFileSync(rep, `# ${opt.id}: to check by hand\n\n${report.length} items. In each conflict the mod's side was used.\n\n` + report.map((r, i) => r.note ? `- \`${r.rel}\`: ${r.note}` :
  `## ${i + 1}. ${r.rel}\n\n\`\`\`text\n<<<<<<< HD\n${r.A.join("\n")}\n||||||| 1.40\n${r.O.join("\n")}\n=======\n${r.B.join("\n")}\n>>>>>>> mod\n\`\`\``).join("\n\n") + "\n");
for (const [k, v] of Object.entries(stats)) console.log(String(v).padStart(5), k);
console.log(`${report.length} items to check by hand -> ${path.relative(process.cwd(), rep)}`);
