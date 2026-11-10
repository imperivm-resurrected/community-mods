#!/usr/bin/env node
// Completeness audit of a port against the original mod (community-mods#53, "Completeness rule"): every file of the original, and every member of its
// containers (.pak, .bfhp, LZIS packs, .zip/.rar/.7z inside), gets exactly ONE status, an art class and the place where it must live. Works for any mod.
//
//   node tools/audit-completeness.js <id> [--orig <zip|rar|folder>] [--port <folder>] [--out <folder>] [--strict] [--fresh]
//   node tools/audit-completeness.js --self-test        a tiny fixture: every status, a lost file, the exit codes
//
// Inputs (all read only):
//   original   --orig, or "original" in extras/<id>/audit.json (zip/rar/7z unpacked with bsdtar into .scratch/audit/<id>/orig, kept between runs; --fresh unpacks again)
//   port       --port, or ported/<id> in this checkout or in the main one (the parent of the git common dir: ports are git-ignored and built there)
//   the game   originals/game-data (HD packs, DATA, Adventures, local-<language>), originals/game-140 (the 1.40 base of old mods), and the HD game folder
//              ($G or the Steam default, read only: Units/ has the HD sprite sheets, rle.mmp the pixels) for what the game folder has and the packs do not
//   others     every other port of ported/ (collision section)
//   decisions  extras/<id>/audit.json (optional, see below)
// Output (--out, default .scratch/audit/<id>/): INVENTORY.csv (one row per file AND per member) and INVENTORY.md (totals, tables per status/kind/class, the
// GLOBAL list, every DROPPED row with its citation, the rows with no status, placement, collisions). Same input, same output, twice.
//
// Statuses (one per row): CLONED (reaches a civilization of the port: a clone class, a renamed copy of a script/entity/sprite/voice, orders...), SHIPPED-AS-IS
// (carried outside any civilization: maps, menu skin, new items, random-map pictures...), IDENTICAL-TO-HD (same bytes, or same sprite pixels, as the game's file),
// GLOBAL (changes a game file/class/value everybody shares: not a civilization's; the list the ruleset layer carries; "carried" when the row's port twin is
// in rulesets/<id>/), DROPPED-ON-PURPOSE (with its citation), UNCLASSIFIED (no evidence and no decision: the audit FAILS). Exit 1 if there is one, which includes the
// LOST files (a file of the original with no twin in the port and no explanation; `how` says "lost"). --strict also fails on GLOBAL rows the port has no layer
// copy of and on class-2 art that sits in the root.
//
// Art class (column art_class; only files that are art, sound or text): 1 art of a civilization or with names of its own (nobody's is replaced: entities,
// sprites, icons, voices, new music, new random-map pictures), 2 global in-game art/sound/text that sits at a path of the game (it replaces the game's: walls,
// the game units' sprites, walk sounds, GAME.LOC.XML...), 3 outside the match (menu skin: CURRENTLANG pictures, UI/MENU, menu INIs, lobby pages, tips, help, movies).
// lives_in: root | rulesets/<id>/ | skins/<id>/ (root until the engine has skins, #55) | - (nothing to carry). now_in: where the port has it today.
//
// extras/<id>/audit.json (all optional): {
//   "original": "originals/.../mod.zip", "base": "folder inside the archive" (default: the single top folders are descended),
//   "tags": ["mci"]          the tags the build adds to names (_mci, " (mci)", MCI_ prefix); default: the id,
//   "language": "spanish"    the language of CURRENTLANG/,
//   "leftOut": ["raw/x-left-out.txt"]   lists of paths the build leaves out on purpose (one per line, "path (reason)"); cited as the reason,
//   "rules": [{"match": "regex on the lower-case path", "status": "DROPPED-ON-PURPOSE", "kind": "...", "reason": "...", "cite": "extras/x/NOTES.md 'Section'"}] }
// A rule is a documented decision and goes before the evidence; it needs a reason and a cite. A table (INI, items, orders, formations, bonuses, texts) is checked
// by element: INI by section/key and value, XML by the id/name of its elements, texts by key; the values of XML elements are not compared (weak: said in the note).
// Node, no dependencies; bsdtar for archives; the SDK (SDK=, ../imperivm-resurrected/sdk) for the sprite compare of .rle.mmp.
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process"), crypto = require("crypto");
const hpfs = require("./hpfs.js"), lzis = require("./lib/lzis.js");

const ROOT = path.join(__dirname, "..");
// ports and originals are git-ignored: built/downloaded in the MAIN checkout (the parent of the git common dir), also seen from a worktree
const MAIN = (() => { try { return path.dirname(path.resolve(ROOT, cp.execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim())); } catch { return ROOT; } })();
const HERE_ROOTS = [...new Set([ROOT, MAIN])];
const firstThere = list => list.find(p => p && fs.existsSync(p));
const STATUSES = ["CLONED", "SHIPPED-AS-IS", "IDENTICAL-TO-HD", "GLOBAL", "DROPPED-ON-PURPOSE", "UNCLASSIFIED"];
const CIV_KINDS = new Set(["class", "class-base", "commands", "script-subai", "script-ai", "script-item", "entity", "sprite", "voice", "sound-entity", "sound", "ui-art"]);
const GAME_ROOTS = new Set(["data", "units", "buildings", "ui", "sounds", "outlines", "randommap", "currentlang", "local", "adventures", "scenarios", "conquests", "conquestmaps", "movies", "music", "mapobjects", "minimap", "patches", "civs", "loc", "packs", "additionalart", "terrain", "fonts"]);
const ART_EXT = /\.(bmp|png|jpg|jpeg|tga|rle|mmp|wav|ogg|mp3|avi|pass)$/i;

// ---------- small helpers ----------
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
function shaFile(p) { // streamed: rle.mmp has 400 MB
  const h = crypto.createHash("sha256"), fd = fs.openSync(p, "r"), buf = Buffer.allocUnsafe(1 << 20);
  try { for (let n; (n = fs.readSync(fd, buf, 0, buf.length, null)) > 0;) h.update(buf.subarray(0, n)); } finally { fs.closeSync(fd); }
  return h.digest("hex");
}
const posix = p => p.split(path.sep).join("/");
const walk = (d, out = [], base = d) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out, base); else if (e.isFile()) out.push({ rel: posix(path.relative(base, p)), abs: p }); } return out; };
// zip names saved as UTF-8 read as CP850 then stored again ("á" -> "Ã¡" -> bsdtar "ǭ"): the same repair as port-140.js
const fixName = s => s.replace(/ǭ/g, "á");
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
const dec = b => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; };
const ci = (dir, name) => { try { return fs.readdirSync(dir).find(x => x.toLowerCase() === name.toLowerCase()); } catch { return undefined; } };
const csvCell = v => { v = v == null ? "" : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
const bsdtar = (src, dest) => { fs.mkdirSync(dest, { recursive: true }); const r = cp.spawnSync("bsdtar", ["-xf", src, "-C", dest], { stdio: ["ignore", "ignore", "pipe"] }); if (r.status) throw new Error(`bsdtar ${src}: ${String(r.stderr).slice(0, 200)}`); };

// ---------- containers: members of a .pak, .bfhp (LZIS or not) and nested archives ----------
function listPak(data) { // HMMSYS PackFile (same reader as sdk/tools/extract-data.js)
  const count = data.readUInt32LE(0x20); let p = 0x28, prev = ""; const out = [];
  for (let i = 0; i < count; i++) {
    const len = data[p], shared = data[p + 1]; p += 2;
    const name = prev.slice(0, shared) + data.toString("latin1", p, p + len - shared); p += len - shared;
    const offset = data.readUInt32LE(p), size = data.readUInt32LE(p + 4); p += 8; prev = name;
    out.push({ name: name.replace(/\\/g, "/"), size, read: () => data.subarray(offset, offset + size) });
  }
  return out;
}
// -> [{name, size, sha, read()}] or null when the file is not a container this tool opens
function members(abs, tmpRoot) {
  const ext = path.extname(abs).toLowerCase();
  try {
    if (/^\.(zip|rar|7z)$/.test(ext)) { const d = fs.mkdtempSync(path.join(tmpRoot, "nest-")); bsdtar(abs, d); return walk(d).map(f => ({ name: f.rel, size: fs.statSync(f.abs).size, read: () => fs.readFileSync(f.abs) })).map(m => ({ ...m, sha: sha(m.read()) })); }
    if (ext === ".bfhp" || ext === ".pak" || ext === "") {
      let b = fs.readFileSync(abs);
      if (lzis.isLzis(b)) b = lzis.decode(b);
      const kind = b.toString("latin1", 0, 4) === "HPFS" ? "hpfs" : b.toString("latin1", 0, 15) === "HMMSYS PackFile" ? "pak" : null;
      if (!kind) return null;
      return (kind === "hpfs" ? hpfs(b).map(e => ({ name: e.path, size: e.size, read: () => e.read() })) : listPak(b)).map(m => ({ ...m, sha: sha(m.read()) }));
    }
  } catch (e) { return { error: e.message }; }
  return null;
}

// ---------- the game: HD, 1.40 ----------
// An index of loose files, key = lower-case path as the mod writes it. Later roots do not replace earlier keys.
class Tree {
  constructor() { this.map = new Map(); this.shas = new Map(); }
  add(dir, prefix = "") { for (const f of walk(dir)) { const k = (prefix + f.rel).toLowerCase(); if (!this.map.has(k)) this.map.set(k, f.abs); } return this; }
  get(k) { return this.map.get(k.toLowerCase()); }
  has(k) { return this.map.has(k.toLowerCase()); }
  sha(k) { const a = this.get(k); if (!a) return null; if (!this.shas.has(a)) this.shas.set(a, shaFile(a)); return this.shas.get(a); }
}
function gameTrees(opt) {
  const gd = opt.gameData || firstThere(HERE_ROOTS.map(r => path.join(r, "originals", "game-data")));
  const g140 = opt.game140 || firstThere(HERE_ROOTS.map(r => path.join(r, "originals", "game-140")));
  const G = opt.gameDir || process.env.G || process.env.GAME || path.join(os.homedir(), ".local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD");
  const hd = new Tree(), old = new Tree();
  if (gd) {
    hd.add(path.join(gd, "paks"));
    for (const d of ["DATA", "Adventures", "Scenarios", "Conquests", "ConquestMaps"]) hd.add(path.join(gd, d), d + "/");
    for (const d of fs.existsSync(gd) ? fs.readdirSync(gd).filter(x => /^local-/.test(x)).sort() : []) { // CURRENTLANG/ is the language of the mod; local/<language>/ is every language's
      if (d === "local-" + (opt.language || "spanish")) hd.add(path.join(gd, d, "CURRENTLANG"), "currentlang/");
      hd.add(path.join(gd, d, "CURRENTLANG"), `local/${d.slice(6)}/`);
    }
  }
  if (fs.existsSync(G)) for (const d of ["Units", "Scenarios", "Adventures", "Music", "Movies", "Conquests", "ConquestMaps", "Currentlang"]) hd.add(path.join(G, ci(G, d) || d), d.toLowerCase() + "/");
  if (g140) { old.add(path.join(g140, "paks")); for (const d of ["DATA", "BUILDINGS", "UNITS", "MAPOBJECTS"]) old.add(path.join(g140, d), d + "/"); }
  return { hd, old, gd, g140, G: fs.existsSync(G) ? G : null };
}

// ---------- the port ----------
function portIndex(dir, id, tags) {
  const files = walk(dir).map(f => ({ ...f, size: fs.statSync(f.abs).size, lower: f.rel.toLowerCase() }));
  const civs = (fs.existsSync(path.join(dir, "civs")) ? fs.readdirSync(path.join(dir, "civs")).filter(f => /\.json$/i.test(f)) : []).map(f => ({ id: f.replace(/\.json$/i, ""), json: readJson(path.join(dir, "civs", f)) || {} }));
  const t = tags.map(esc).join("|"), c = civs.map(x => esc(x.id)).join("|");
  const reTag = t ? new RegExp(`(?:_|\\s\\()(?:${t})(?:_(?:${c || "(?!)"}))?\\)?(?=[./]|$)`, "g") : null;
  const reCiv = c ? new RegExp(`_(?:${c})(?=[./]|$)`, "g") : null, rePre = t ? new RegExp(`(?<=^|/)(?:${t})_`, "g") : null;
  // a name as the original wrote it: the tags and civilization ids the build added taken off; .rle.mmp is built as a standalone .rle
  const norm = p => { let s = p.toLowerCase().replace(/\\/g, "/"); if (reTag) s = s.replace(reTag, ""); if (reCiv) s = s.replace(reCiv, ""); if (rePre) s = s.replace(rePre, ""); return s.replace(/\.rle\.mmp$/, ".rle"); };
  const bySha = new Map(), byNorm = new Map(), byPatch = new Map();
  for (const f of files) {
    f.sha = shaFile(f.abs);
    if (!bySha.has(f.sha)) bySha.set(f.sha, []); bySha.get(f.sha).push(f);
    const lay = f.lower.replace(/^(?:rulesets|skins)\/[^/]+\//, ""), m = /^patches\/(.*)$/.exec(lay); // a layer is laid out like a root
    const k = norm(m ? m[1] : lay);
    (m ? byPatch : byNorm).has(k) ? (m ? byPatch : byNorm).get(k).push(f) : (m ? byPatch : byNorm).set(k, [f]);
  }
  const layerOf = rel => { const m = /^rulesets\/([^/]+)\//i.exec(rel); return m ? `rulesets/${m[1]}/` : /^skins\/([^/]+)\//i.test(rel) ? rel.split("/").slice(0, 2).join("/") + "/" : "root"; };
  return { dir, id, files, civs, norm, bySha, byNorm, byPatch, layerOf, text: new Map(), members: new Map(), classes: null };
}
const portText = (P, f) => { if (!P.text.has(f.abs)) P.text.set(f.abs, dec(fs.readFileSync(f.abs))); return P.text.get(f.abs); };
// every ruleset/skin layer folder of the port: its files count in the same indexes, said apart by layerOf
// a name as the original wrote it: "Hire IcaPINMORTAL" (the civilization's letters inside), "trainCMacemen Icarthage" (its id after) and "burn (mci)" (the tag) taken off
const normName = (P, n) => {
  let s = String(n).trim(); const letters = P.civs.map(c => c.json.letter).filter(Boolean);
  if (letters.length) s = s.replace(new RegExp(`(?<![A-Za-z])(?:${letters.map(esc).join("|")})(?=[A-Z0-9])`, "g"), "");
  s = s.toLowerCase().replace(/\s\([a-z0-9]+\)$/, "");
  for (const c of P.civs) s = s.replace(new RegExp(`[\\s_]${esc(c.id)}$`), "");
  return s;
};
function classIndex(P, hd) {
  if (P.classes) return P.classes;
  const ids = new Map(), parent = new Map();
  for (const f of P.files) if (/\/classes\/[^/]+\.xml$/i.test(f.lower) || /^data\/classes\//.test(f.lower)) {
    const t = portText(P, f), m = /<class\b[^>]*?\bid\s*=\s*"([^"]+)"[^>]*?(?:\bparent\s*=\s*"([^"]*)")?/.exec(t); // parent may come first: read both
    const id = (/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/.exec(t) || [])[1], par = (/<class\b[^>]*?\bparent\s*=\s*"([^"]*)"/.exec(t) || [])[1];
    if (id) { ids.set(id.toLowerCase(), f); if (par) parent.set(id.toLowerCase(), par.toLowerCase()); }
  }
  const hdParent = new Map();
  for (const [k, abs] of hd.map) if (/^data\/classes\/[^/]+\.xml$/.test(k)) { const t = dec(fs.readFileSync(abs)), id = (/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/.exec(t) || [])[1], par = (/<class\b[^>]*?\bparent\s*=\s*"([^"]*)"/.exec(t) || [])[1]; if (id && par) hdParent.set(id.toLowerCase(), par.toLowerCase()); }
  const ancestors = new Set(); // every class an id of the port inherits from, through the port's classes and the game's
  for (const id of ids.keys()) { let c = parent.get(id), n = 0; while (c && n++ < 40) { ancestors.add(c); c = parent.get(c) || hdParent.get(c); } }
  const alias = new Map(); // game class -> civilization copy, from civs/*.json
  for (const c of P.civs) for (const [k, v] of Object.entries((c.json.alias || {}).classes || {})) alias.set(k.toLowerCase(), v);
  return (P.classes = { ids, parent, ancestors, alias });
}

// ---------- tables, by element ----------
const normText = s => s.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
function iniEntries(t) { // lower "section/key" -> "value"; .orig: the same keys -> [section, key] as written
  const m = new Map(); m.orig = new Map(); let sec = "", secOrig = "";
  for (const raw of t.split(/\r?\n/)) { const l = raw.replace(/[;#].*$/, "").trim(); if (!l) continue; const s = /^\[(.+)\]$/.exec(l); if (s) { secOrig = s[1]; sec = s[1].toLowerCase(); continue; } const kv = /^([^=]+?)\s*=\s*(.*)$/.exec(l); if (kv) { const k = sec + "/" + kv[1].trim().toLowerCase(); m.set(k, kv[2].trim()); m.orig.set(k, [secOrig, kv[1].trim()]); } }
  return m;
}
function xmlElements(t) { // depth-1 children (depth-2 when the root has a single container child, as PLACEOBJECTS): id -> normalized text
  t = t.replace(/^\uFEFF/, "").replace(/<\?[\s\S]*?\?>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const tokens = [...t.matchAll(/<(\/?)([A-Za-z_][\w.:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g)];
  const out = new Map(); out.meta = new Map(); let depth = 0, start = null, level = 1;
  const rootTag = (tokens.find(m => !m[1]) || [])[2], containerTag = (tokens.filter(m => !m[1])[1] || [])[2];
  const rootKids = []; { let d = 0; for (const m of tokens) { if (m[1]) d--; else { if (d === 1) rootKids.push(m[2]); if (!m[4]) d++; } } }
  if (rootKids.length === 1) level = 2;
  for (const m of tokens) {
    const [, close, tag, attrs, self] = m;
    if (close) { depth--; if (depth === level && start) { add(start, m.index + m[0].length); start = null; } continue; }
    if (depth === level && !start) start = { tag, attrs, at: m.index };
    if (self) { if (depth === level && start) { add(start, m.index + m[0].length); start = null; } } else depth++;
  }
  function add(s, end) {
    const a = s.attrs, id = (/(?<![\w-])(?:id|name|Name|SetName)\s*=\s*"([^"]*)"/.exec(a) || [])[1], two = /\battacker\s*=\s*"([^"]*)"[^>]*\bdefender\s*=\s*"([^"]*)"/.exec(a);
    const raw = t.slice(s.at, end), body = normText(raw), an = (/(?<![\w-])(id|name|Name|SetName)\s*=\s*"/.exec(a) || [])[1];
    const q = v => (v.includes("'") ? `"${v}"` : `'${v}'`), base = `/${rootTag}${level === 2 ? "/" + containerTag : ""}/${s.tag}`;
    const sel = two ? `${base}[@attacker=${q(two[1])}][@defender=${q(two[2])}]` : id != null ? `${base}[@${an}=${q(id)}]` : null;
    let key = two ? `${s.tag}:${two[1]}>${two[2]}` : id != null ? `${s.tag}:${id}` : `${s.tag}:#${sha(body).slice(0, 10)}`;
    while (out.has(key)) key += "'";
    out.set(key, body); out.meta.set(key, { sel: key.endsWith("'") ? null : sel, raw, parent: base.slice(0, base.lastIndexOf("/")) });
  }
  return out;
}
function locEntries(t) { // text + context -> result
  const m = new Map();
  for (const e of t.matchAll(/<translationtableentry\b[^>]*?\/>/g)) { const x = (/\btext="([^"]*)"/.exec(e[0]) || [])[1], c = (/\bcontext="([^"]*)"/.exec(e[0]) || [])[1] || "", r = (/\bresult="([^"]*)"/.exec(e[0]) || [])[1]; if (x != null) m.set(x + "\u0000" + c, r); }
  return m;
}
const quoted = t => { const s = new Set(); for (const m of t.matchAll(/"([^"\n]*)"|'([^'\n]*)'/g)) s.add((m[1] ?? m[2]).trim()); return s; };

// ---------- the audit ----------
function audit(opt) {
  const { id } = opt;
  const cfgFile = firstThere(HERE_ROOTS.map(r => path.join(r, "extras", id, "audit.json")));
  const cfg = { ...(cfgFile ? readJson(cfgFile) || {} : {}), ...(opt.config || {}) };
  const tags = cfg.tags || [id], language = cfg.language || "spanish";
  const work = opt.work || path.join(ROOT, ".scratch", "audit", id);
  fs.mkdirSync(work, { recursive: true });
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "audit-"));
  // original
  let origDir = opt.origDir;
  if (!origDir) {
    const src = opt.orig || cfg.original && firstThere(HERE_ROOTS.map(r => path.resolve(r, cfg.original)));
    if (!src) throw new Error(`no original: pass --orig <zip|folder> or set "original" in extras/${id}/audit.json`);
    if (fs.statSync(src).isDirectory()) origDir = src;
    else { origDir = path.join(work, "orig"); const stamp = path.join(work, "orig.stamp"), want = `${src}:${fs.statSync(src).size}`; if (opt.fresh || !fs.existsSync(stamp) || fs.readFileSync(stamp, "utf8") !== want) { fs.rmSync(origDir, { recursive: true, force: true }); bsdtar(src, origDir); fs.writeFileSync(stamp, want); } }
  }
  if (cfg.base) origDir = path.join(origDir, cfg.base);
  else for (;;) { const es = fs.readdirSync(origDir, { withFileTypes: true }); if (es.length === 1 && es[0].isDirectory() && !GAME_ROOTS.has(es[0].name.toLowerCase())) origDir = path.join(origDir, es[0].name); else break; }
  const portDir = opt.portDir || firstThere(HERE_ROOTS.map(r => path.join(r, "ported", id)));
  if (!portDir) throw new Error(`no port: ported/${id} is neither in ${ROOT} nor in ${MAIN} (--port)`);
  const { hd, old, G } = opt.trees || gameTrees({ ...opt, language });
  const P = portIndex(portDir, id, tags);
  const leftOut = new Map(); // lower path -> list file
  for (const l of cfg.leftOut || []) { const f = firstThere(HERE_ROOTS.map(r => path.resolve(r, l))); if (!f) continue; for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) { const m = /^([^#\s][^(]*?)\s*(?:\(.*\))?\s*$/.exec(line); if (m) leftOut.set(m[1].toLowerCase(), path.relative(ROOT, f) === l || true ? l : l); } }
  const rules = (cfg.rules || []).map(r => { if (!r.reason || !r.cite) throw new Error(`audit.json rule ${r.match}: a decision needs "reason" and "cite"`); return { ...r, re: new RegExp(r.match, "i") }; });
  let rle = null; // lazily: the SDK's sprite reader
  const sdk = process.env.SDK || firstThere(HERE_ROOTS.flatMap(r => [path.join(r, "..", "imperivm-resurrected", "sdk")]));
  const loadRle = () => { if (rle === null) { try { rle = require(path.join(sdk, "tools", "lib", "rle.js")); } catch { rle = false; } } return rle; };
  const modMmp = fs.existsSync(path.join(origDir, "rle.mmp")) ? fs.openSync(path.join(origDir, "rle.mmp"), "r") : null;
  const gameMmp = G && fs.existsSync(path.join(G, "rle.mmp")) ? fs.openSync(path.join(G, "rle.mmp"), "r") : null;
  const sheetSha = (abs, fd) => { const r = loadRle(); const s = r.parse(fs.readFileSync(abs)); r.resolveMmp(s, fd); return sha(r.write(s)); };

  // kind + group of a file, by its path (lower case)
  const kindOf = lp => {
    const t = (re, kind, group) => re.test(lp) && [kind, group];
    return t(/^(\.fingerprint|mod\.json|readme.*|.*\.(exe|dll)|.*(^|\/)thumbs\.db|.*\.bak)$/, "meta", "meta") || t(/^rle\.mmp$/, "sprite-store", "art") ||
      t(/^data\/classes\//, "class", "classes") || t(/^data\/commands\//, "commands", "orders") || t(/^data\/itemscripts\//, "script-item", "scripts") ||
      t(/^data\/gamescripts\//, "game-mode", "modes") || t(/^data\/bonusscripts\//, "game-bonus", "modes") || t(/^data\/ai\/.*\.ini$/, "ini", "ini") || t(/^data\/(ai|ai helpers)\//, "script-ai", "scripts") ||
      t(/^data\/subai\//, "script-subai", "scripts") || t(/^data\/sound entities\//, "sound-entity", "sound") || t(/^data\/interface\/menu\//, "menu-ini", "menu/interface") ||
      t(/^data\/interface\//, "interface-list", "menu/interface") || t(/^data\/randommap\//, "randommap-table", "maps") || t(/^data\/[^/]+\.ini$/, "ini", "ini") ||
      t(/^data\/items\.xml$/, "items", "items") || t(/^data\/[^/]+\.(xml|txt)$/, "table", "tables") || t(/^(local\/[^/]+|currentlang)\/voices\//, "voice", "sound") ||
      t(/^(local\/[^/]+|currentlang)\/[^/]*\.loc\.xml$/, "text-table", "texts") || t(/(^|\/)(tips|help)\.xml$/, "skin-text", "menu/interface") ||
      t(/^(local\/[^/]+|currentlang)\/[^/]*\.(bmp|png|jpg|tga)$/, "menu-skin-art", "menu/interface") || t(/^ui\/menu\//, "menu-skin-art", "menu/interface") || t(/^local\/[^/]+\.pak$/, "container-pages", "menu/interface") ||
      t(/^(units|buildings)\/.*\.(ent\.xml|ent[^/]*\.xml)$/, "entity", "art") || t(/^(units|buildings)\//, "sprite", "art") || t(/^sounds\//, "sound", "sound") ||
      t(/^ui\/(cmdbar|icons|help|favourite|infobar)\//, "ui-art", "art") || t(/^ui\//, "ui-art", "art") || t(/^randommap\//, "randommap-art", "art") ||
      t(/^(mapobjects|outlines|minimap|additionalart)\//, "mapobject-art", "art") || t(/^(scenarios|adventures)\//, "map", "maps") || t(/^(conquests|conquestmaps)\//, "conquest", "maps") ||
      t(/^packs\//, "map-pack", "maps") || t(/^music\//, "music", "sound") || t(/^movies\//, "movie", "art") || t(/^patches\//, "patch", "patches") || ["other", "other"];
  };
  const SKIN = lp => /^(currentlang\/[^/]+\.(bmp|png|jpg|tga)|ui\/menu\/|data\/interface\/menu\/|local\/[^/]+\/ui\/menu\/|movies\/)/.test(lp) || /(^|\/)(tips|help)\.xml$/.test(lp) || /^local\/[^/]+\.pak$/.test(lp);
  const isArt = (lp, kind) => ART_EXT.test(lp) || ["voice", "text-table", "skin-text", "entity", "sound-entity", "music", "movie"].includes(kind);
  const hdHas = lp => hd.has(lp) || (/^currentlang\//.test(lp) && false);
  // art class and where it must live, from the row's status and path
  const place = (r, lp, kind) => {
    const art = isArt(lp, kind), skin = SKIN(lp) || kind === "menu-ini" || kind === "menu-skin-art" || kind === "container-pages";
    let cls = "";
    if (skin) cls = "3";
    else if (art) {
      const first = (r.ported_as || "").split(" ; ")[0].toLowerCase();
      if (r.status === "GLOBAL") cls = "2";                                         // it replaces the game's file for everybody
      else if (r.status === "CLONED") cls = "1";                                    // a civilization's (a renamed copy next to the game's)
      else if (r.status === "SHIPPED-AS-IS") cls = hdHas(lp) && first === lp ? "2" : "1"; // at the game's own path in the port: it replaces the game's
      else cls = hdHas(lp) ? "2" : "1";
    }
    let lives = "-";
    if (r.status === "CLONED") lives = "root";
    else if (r.status === "SHIPPED-AS-IS") lives = cls === "3" ? `skins/${id}/ (root until #55)` : cls === "2" ? `rulesets/${id}/` : "root";
    else if (r.status === "GLOBAL") lives = cls === "3" ? `skins/${id}/ (root until #55)` : `rulesets/${id}/`;
    return { art_class: cls, lives_in: lives };
  };
  const twin = (key, ...maps) => { for (const m of maps) { const v = m.get(key); if (v && v.length) return v; } return null; };
  const rows = [], detail = [];
  const T = (p, size, status, kind, note, extra = {}) => ({ path: p, size, status, kind, note, ...extra });

  // ----- decide one file or member. f = {path, size, sha, abs?, read?, level, container?}
  function decide(f) {
    const p = f.path, lp = p.toLowerCase(), [kind0, group] = kindOf(lp);
    let kind = kind0;
    const done = (status, note, extra = {}) => ({ ...T(p, f.size, status, extra.kind || kind, note, { sha256: f.sha, level: f.level, container: f.container || "", group, ...extra }) });
    const lang = (/^local\/([^/]+)\//.exec(lp) || [])[1] || language;
    const aliasLocal = /^currentlang\//.test(lp) && !ART_EXT.test(lp) ? lp.replace(/^currentlang\//, `local/${lang}/`) : null;
    const found = () => { // the port's twin: same name under the tags first (the build may edit the bytes), then the same bytes anywhere, then a patch of the same file
      const n = P.norm(lp), a = twin(n, P.byNorm); if (a) return { files: a, how: "name" };
      const s = P.bySha.get(f.sha); if (s && (!hd.has(lp) || s.some(x => P.norm(x.lower) === n))) return { files: s, how: "sha" }; // not at the game's path: another file with the same bytes is not this one
      const b = twin(n, P.byPatch); if (b) return { files: b, how: "patch" };
      return null;
    };
    const nowOf = files => { const l = [...new Set(files.map(x => P.layerOf(x.rel)))]; return l.length === 1 ? l[0] : l.join("+"); };
    const carriedRow = (status, note, fnd, extra = {}) => ({ ...done(status, note, { ...extra, evidence: extra.evidence || fnd.how, ported_as: fnd.files.slice(0, 3).map(x => x.rel).join(" ; ") + (fnd.files.length > 3 ? ` (+${fnd.files.length - 3})` : ""), now_in: nowOf(fnd.files) }) });
    // 1. same bytes as the game, or the 1.40 base the HD game superseded
    if (hd.has(lp) && hd.sha(lp) === f.sha) return done("IDENTICAL-TO-HD", `same sha256 as the game's ${lp}`, { evidence: "sha" });
    if (old.has(lp) && old.sha(lp) === f.sha) return done("DROPPED-ON-PURPOSE", `same bytes as the 1.40 file: the mod did not change it and HD's (fixed) version stays; port-140.js: "same as 1.40: dropped"`, { evidence: "1.40", cite: "tools/port-140.js" });
    // the same text with other line endings / BOM / trailing blanks (1.40 files are CRLF, HD's are not)
    if (f.abs && /\.(xml|ini|vs|txt)$/.test(lp)) {
      const flat = b => dec(b).replace(/^\uFEFF/, "").replace(/[ \t]+(?=\r?\n)/g, "").replace(/\r\n?/g, "\n").trimEnd();
      let mine = null; const me = () => (mine === null ? (mine = flat(fs.readFileSync(f.abs))) : mine);
      if (hd.has(lp) && flat(fs.readFileSync(hd.get(lp))) === me()) return done("IDENTICAL-TO-HD", `same text as the game's ${lp}; only the line endings, BOM or trailing blanks differ`, { evidence: "text", semantic: true });
      if (old.has(lp) && flat(fs.readFileSync(old.get(lp))) === me()) return done("DROPPED-ON-PURPOSE", `same text as the 1.40 file (only line endings differ): the mod did not change it and HD's version stays; port-140.js: "same as 1.40: dropped"`, { evidence: "1.40-text", cite: "tools/port-140.js" });
    }
    // 2. documented decisions
    const rule = rules.find(r => r.re.test(lp));
    if (rule && rule.status === "GLOBAL") { const fl = found(); if (fl && fl.files.some(x => /^rulesets\//.test(x.lower))) return carriedRow("GLOBAL", `${rule.reason} (${rule.cite}); carried in the ruleset layer: ${fl.files[0].rel}`, fl, { kind: rule.kind || kind, cite: rule.cite }); }
    if (rule) return done(rule.status || "DROPPED-ON-PURPOSE", `${rule.reason} (${rule.cite})`, { kind: rule.kind || kind, evidence: "rule", cite: rule.cite });
    if (kind === "meta") return done("DROPPED-ON-PURPOSE", /\.(exe|dll)$/.test(lp) ? "a mod cannot ship executables or DLLs (AGENTS.md, Porting)" : /thumbs\.db|\.bak/.test(lp) ? "junk: Thumbs.db / *.bak are dropped (tools/port-140.js)" : "the author's package metadata: ours is extras/<id>/mod.json", { evidence: "meta", cite: /\.(exe|dll)$/.test(lp) ? "AGENTS.md" : "tools/port-140.js" });
    if (kind === "sprite-store") return done("DROPPED-ON-PURPOSE", "the mod's rle.mmp pixel store: its sprites are resolved into standalone .rle files (tools/port-140.js) and the file itself is not shipped", { evidence: "sprite-store", cite: "tools/port-140.js" });
    // 3. by kind
    // sprite headers: .rle.mmp -> standalone .rle
    if (/\.rle\.mmp$/.test(lp) && f.abs) {
      const fnd = found();
      if (fnd) return carriedRow("CLONED", `sprite carried as ${fnd.files[0].rel} (pixels resolved from the mod's rle.mmp into a standalone .rle)`, fnd, { kind: "sprite" });
      if (!loadRle() || !modMmp) return done("UNCLASSIFIED", `sprite header with no twin in the port; cannot compare it with the game's (${!loadRle() ? "no SDK: set SDK=" : "the mod has no rle.mmp"})`, { kind: "sprite", evidence: "no-rle-lib" });
      const g = hd.get(lp);
      if (g && gameMmp) { try { if (sheetSha(f.abs, modMmp) === sheetSha(g, gameMmp)) return done("IDENTICAL-TO-HD", "the sprite resolves to the same pixels as the game's (tools/port-140.js: \"sprite same as HD\")", { kind: "sprite", evidence: "sprite-pixels" }); } catch (e) { return done("UNCLASSIFIED", `sprite not read: ${e.message}`, { kind: "sprite", evidence: "error" }); } }
      if (g) return done("GLOBAL", "the mod redraws a sprite of the game at the game's path: a mod cannot replace it in the root (port-140.js \"sprite changed (not applied!)\")", { kind: "sprite", evidence: "hd-path" });
      return done("UNCLASSIFIED", "a new sprite of the mod with no .rle in the port: LOST" + (g ? "" : ""), { kind: "sprite", evidence: "lost" });
    }
    // classes
    if (kind === "class" && f.abs) {
      const t = dec(fs.readFileSync(f.abs)), cid = (/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/.exec(t) || [])[1];
      const C = classIndex(P, hd);
      if (!cid) return done("UNCLASSIFIED", "no <class id> in this class file", { evidence: "no-id" });
      const lc = cid.toLowerCase(), al = C.alias.get(lc), inHD = [...hd.map.keys()].some(k => /^data\/classes\//.test(k)) && hd.has(`data/classes/${path.posix.basename(lp)}`);
      const fileOf = x => C.ids.get(String(x).toLowerCase());
      if (al && fileOf(al)) { const fl = fileOf(al); return done("CLONED", `${inHD ? "game civilization class edited by the mod" : "class of the mod"} ${cid} -> clone ${al} (civs/*.json alias)`, { kind: "class", evidence: "alias", ported_as: fl.rel, now_in: P.layerOf(fl.rel) }); }
      const copies = P.civs.map(c => (c.json.letter || c.id).toLowerCase() + lc).filter(x => C.ids.has(x));
      if (copies.length) return done("CLONED", `${inHD ? "game class edited by the mod" : "new class of the mod"} ${cid} -> ${copies.length} civilization cop${copies.length > 1 ? "ies" : "y"} (${copies.slice(0, 3).map(x => C.ids.get(x).rel.split("/").pop()).join(", ")}${copies.length > 3 ? ", ..." : ""})`, { kind: "class", evidence: "civ-copy", ported_as: C.ids.get(copies[0]).rel, now_in: P.layerOf(C.ids.get(copies[0]).rel) });
      for (const cand of [lc, ...tags.map(x => `${lc}_${x.toLowerCase()}`)]) if (C.ids.has(cand) && !inHD) { const fl = C.ids.get(cand); return done("SHIPPED-AS-IS", `new class of the mod kept as ${fl.rel}`, { kind: "class-new", evidence: "id", ported_as: fl.rel, now_in: P.layerOf(fl.rel) }); }
      if (C.ancestors.has(lc) && inHD) return done("CLONED", `base class ${cid} edited by the mod: written inside the clones; ${[...C.ids.keys()].length} classes in the port, some inherit it (not verified element by element)`, { kind: "class-base", evidence: "inherited" });
      if (inHD) { const fl = found(); if (fl && fl.files.some(x => /^rulesets\//.test(x.lower))) return carriedRow("GLOBAL", `class ${cid} of the game edited by the mod, carried in the ruleset layer: ${fl.files[0].rel}`, fl, { kind: "class-neutral" }); return done("GLOBAL", `class ${cid} of the game edited by the mod; no class of the port inherits it and no clone carries it`, { kind: "class-neutral", evidence: "hd-path" }); }
      const lo = leftOut.get(lp);
      return lo ? done("DROPPED-ON-PURPOSE", `new class ${cid} left out on purpose (listed in ${lo})`, { kind: "class", evidence: "left-out", cite: lo }) : done("UNCLASSIFIED", `new class ${cid}: no clone, no copy in the port, not listed: LOST`, { kind: "class", evidence: "lost" });
    }
    // tables: INI by key, XML by element, texts by key
    if (f.abs && hd.has(lp) && (kind === "ini" || kind === "items" || kind === "table" || kind === "commands" || kind === "randommap-table" || /\.xml$/.test(lp) && /^data\/[^/]+\.xml$/.test(lp) || kind === "text-table") && /\.(ini|xml)$/.test(lp)) {
      const hdAbs = hd.get(lp), t = dec(fs.readFileSync(f.abs));
      const explained = (cfg.explain || []).filter(x => x.path.toLowerCase() === lp); for (const x of explained) if (!x.reason || !x.cite) throw new Error(`audit.json explain ${x.path} ${x.element}: needs "reason" and "cite"`);
      const explainedKeys = { has: k => explained.some(x => x.element === k || (x.element.endsWith("*") && k.startsWith(x.element.slice(0, -1)))) }; // an element, or a prefix ending in *
      const fnd = found();
      const portFiles = [...(P.byNorm.get(P.norm(lp)) || []), ...(P.byPatch.get(P.norm(lp)) || [])];
      const oldAbs = old.get(lp), oldT = oldAbs ? dec(fs.readFileSync(oldAbs)) : null; let same140 = 0;
      let total = 0, same = 0, edited = [], added = [], carriedEdit = 0, carriedAdd = 0, miss = [], pending = [], weak = false, unit = "elements";
      if (kind === "text-table") {
        unit = "texts"; const mine = locEntries(t), hdt = hdAbs ? locEntries(dec(fs.readFileSync(hdAbs))) : new Map();
        // the game says a text in its GAME and in its TRANSLATION table: a key in either one is the game's (tools/port-140.js compares with both)
        const sib = hd.get(lp.replace(/(game|translation)\.loc\.xml$/, m => (m.startsWith("game") ? "translation" : "game") + ".loc.xml")); if (sib) for (const [k, v] of locEntries(dec(fs.readFileSync(sib)))) if (!hdt.has(k)) hdt.set(k, v);
        // a clone writes the text again under its own context ("Gaul Ship@IgaShipGaul class name", "...@MGladiator Shows Iimperial"): compared with the build's letters and ids taken off
        const nk = k => k.split("\u0000").map(x => normName(P, x)).join("\u0000");
        const have = new Map(); for (const x of P.files) if (/\.loc\.xml$/i.test(x.lower)) for (const [k, v] of locEntries(portText(P, x))) have.set(nk(k), v);
        for (const [k, v] of mine) { total++; const h = hdt.get(k); if (h === v) { same++; continue; } const kk = k.split("\u0000")[0]; (h === undefined ? added : edited).push(kk); if (have.get(nk(k)) === v || explainedKeys.has(kk)) { h === undefined ? carriedAdd++ : carriedEdit++; } else { miss.push(kk + (h === undefined ? " [new]" : " [edit]")); pending.push({ kind: "loc", isNew: h === undefined, key: k, result: v }); } }
      } else if (/\.ini$/.test(lp)) {
        unit = "keys"; const mine = iniEntries(t), hdt = hdAbs ? iniEntries(dec(fs.readFileSync(hdAbs))) : new Map(), pe = new Map();
        for (const x of portFiles) for (const [k, v] of iniEntries(portText(P, x))) pe.set(k, v);
        const bt = oldT ? iniEntries(oldT) : new Map();
        for (const [k, v] of mine) { total++; const h = hdt.get(k); if (h === v) { same++; continue; } if (bt.get(k) === v) { same140++; continue; } const isNew = h === undefined; (isNew ? added : edited).push(k); if (pe.get(k) === v || explainedKeys.has(k)) { isNew ? carriedAdd++ : carriedEdit++; } else { miss.push(k + (isNew ? " [new]" : ` [HD ${h} -> ${v}]`)); pending.push({ kind: "ini", isNew, section: mine.orig.get(k)[0], name: mine.orig.get(k)[1], value: v }); } }
      } else {
        weak = true; const mine = xmlElements(t), hdt = hdAbs ? xmlElements(dec(fs.readFileSync(hdAbs))) : new Map();
        const rev = new Map(); for (const [b, c] of classIndex(P, hd).alias) rev.set(String(c).toLowerCase(), b); // a clone's class id counts as its base's
        const names = new Set(); for (const x of portFiles) for (const q of quoted(portText(P, x))) { names.add(normName(P, q)); if (rev.has(q.toLowerCase())) names.add(rev.get(q.toLowerCase())); }
        if (kind === "commands") for (const c of P.civs) for (const q of Object.keys((c.json.alias || {}).commands || {})) names.add(normName(P, q)), names.add(normName(P, (c.json.alias.commands || {})[q]));
        if (kind === "commands") for (const x of P.files) if (/(^|\/)commands\/[^/]+\.xml$/i.test(x.lower)) for (const q of quoted(portText(P, x))) names.add(normName(P, q));
        const bt = oldT ? xmlElements(oldT) : new Map();
        for (const [k, v] of mine) {
          total++; const h = hdt.get(k); if (h === v) { same++; continue; } if (bt.get(k) === v) { same140++; continue; }
          const isNew = h === undefined, idn = (k.split(":")[1] || "").replace(/'+$/, ""), present = names.has(normName(P, idn)) || (k.includes(">") && names.has(normName(P, k.split(":")[1].split(">")[0])));
          (isNew ? added : edited).push(k); if (present || explainedKeys.has(k)) { isNew ? carriedAdd++ : carriedEdit++; } else { miss.push(k + (isNew ? " [new]" : " [edit]")); pending.push({ kind: "xml", isNew, key: k, ...mine.meta.get(k) }); }
        }
      }
      detail.push({ path: p, kind, pending, unit, total, same, same140, explained: explained.map(x => `${x.element}: ${x.reason} (${x.cite})`), edited: edited.length, added: added.length, carriedEdit, carriedAdd, miss });
      const lostNew = added.length - carriedAdd, lostEdit = edited.length - carriedEdit;
      const sum = `${total} ${unit}: ${same} equal to the game's${same140 ? `, ${same140} equal to the 1.40 base (HD's change stays)` : ""}, ${added.length} new (${carriedAdd} carried), ${edited.length} edit${edited.length === 1 ? "" : "s"} of the game's (${carriedEdit} carried)${weak ? "; checked by name, the values of XML elements are not compared" : ""}${explained.length ? `; ${explained.length} explained by decision (${[...new Set(explained.map(x => x.cite))].join(", ")})` : ""}`;
      const kk = kind === "commands" ? "commands" : kind === "text-table" ? "text-table" : kind;
      const locFiles = kind === "text-table" ? P.files.filter(x => /\.loc\.xml$/i.test(x.lower)) : [];
      const extra = { kind: kk, evidence: "elements", ported_as: [...portFiles, ...locFiles].slice(0, 3).map(x => x.rel).join(" ; "), now_in: portFiles.length || locFiles.length ? nowOf([...portFiles, ...locFiles]) : "" };
      if (!lostNew && !lostEdit) {
        if (!added.length && !edited.length) return same140 ? done("DROPPED-ON-PURPOSE", sum + "; the mod changed nothing against the 1.40 base: HD's version stays (tools/port-140.js)", { ...extra, cite: "tools/port-140.js" }) : done("IDENTICAL-TO-HD", sum + "; semantically identical to the game's (bytes differ)", { ...extra, semantic: true });
        if (portFiles.some(x => /^rulesets\//.test(x.lower)) || (kind === "text-table" && P.files.some(x => /^rulesets\/[^/]+\/loc\/[^/]+\.loc\.xml$/.test(x.lower)))) return done("GLOBAL", sum + "; the mod's edits of the game's file are carried in the ruleset layer", extra);
        return done(kind === "commands" ? "CLONED" : "SHIPPED-AS-IS", sum, extra);
      }
      // the game has the file: whatever the mod added to it or changed in it and the port does not carry is the mod's edit of a file everybody shares
      return done("GLOBAL", `${sum}; ${lostNew + lostEdit} not carried (${miss.slice(0, 4).join("; ")}${miss.length > 4 ? "; ..." : ""})`, extra);
    }
    // everything else: sha / name / patch twin
    const fnd = found();
    if (fnd) {
      const cls = fnd.files.every(x => /^rulesets\//.test(x.lower)) ? "GLOBAL" : CIV_KINDS.has(kind) ? "CLONED" : "SHIPPED-AS-IS"; // GLOBAL: its twin is in the ruleset layer
      return carriedRow(cls, `${fnd.how === "sha" ? "same bytes" : fnd.how === "patch" ? "a patch of this file" : "same name under the build's tags"} in the port: ${fnd.files[0].rel}${fnd.files[0].sha === f.sha ? "" : " (bytes differ: the build edited it)"}`, fnd);
    }
    // maps: a rewritten container found by name is handled above (name); not found
    const lo = leftOut.get(lp) || (aliasLocal && leftOut.get(aliasLocal));
    if (hd.has(lp) || (aliasLocal && hd.has(aliasLocal))) return done("GLOBAL", `the mod's edit of the game's ${lp}${lo ? `, listed as left out in ${lo}` : ""}: not in the port (it would replace the game's file for everybody)`, { evidence: "hd-path" });
    if (lo) return done("DROPPED-ON-PURPOSE", `left out on purpose (listed in ${lo})`, { evidence: "left-out", cite: lo });
    return done("UNCLASSIFIED", `no twin in the port (not by bytes, not by name under the tags, no patch), the game has no such path and no decision names it: LOST`, { evidence: "lost" });
  }

  // ----- walk the original
  const memCache = new Map();
  const files = walk(origDir).map(f => ({ ...f, rel: fixName(f.rel) }));
  for (const f of files) {
    const size = fs.statSync(f.abs).size, s = shaFile(f.abs);
    const base = { path: f.rel, size, sha: s, abs: f.abs, level: "file" };
    rows.push(decide(base));
    const ms = (size < 1.5e9 && /\.(bfhp|pak|zip|rar|7z|)$/i.test(f.rel) && !/(^|\/)rle\.mmp$/i.test(f.rel)) ? members(f.abs, tmpRoot) : null;
    if (!ms) continue;
    if (ms.error) { rows.push(T(f.rel + "::?", 0, "UNCLASSIFIED", "container", `could not open the container: ${ms.error}`, { sha256: s, level: "member", container: f.rel, evidence: "container-error" })); continue; }
    rows.push(...ms.map(m => memberRow(f.rel, m, s)));
  }
  // members: against the game's container at the same path and the port's container (by name)
  function memberRow(cont, m, contSha) {
    const lc = cont.toLowerCase(), name = fixName(m.name), key = name.toLowerCase();
    const base = { path: `${cont}::${name}`, size: m.size, sha256: m.sha, level: "member", container: cont };
    const mk = (status, kind, note, extra = {}) => ({ ...T(base.path, m.size, status, kind, note, { ...base, group: kindOf(lc)[1], ...extra }) });
    const find = (map, k) => { const a = map.get(k); return a; };
    const open = abs => { if (!abs) return null; if (!memCache.has(abs)) memCache.set(abs, (() => { const r = members(abs, tmpRoot); return r && !r.error ? new Map(r.map(x => [x.name.toLowerCase(), x])) : null; })()); return memCache.get(abs); };
    const hdc = open(hd.get(lc)), hm = hdc && hdc.get(key);
    if (hm && hm.sha === m.sha) return mk("IDENTICAL-TO-HD", "map-member", `same bytes as the member of the game's ${path.posix.basename(lc)}`, { evidence: "sha" });
    const pf = (P.byNorm.get(P.norm(lc)) || [])[0], pc = pf && open(pf.abs), pm = pc && pc.get(key);
    const lp = lc.endsWith(".pak") ? `ui/${key}` : key;
    if (pm) return mk("SHIPPED-AS-IS", "map-member", `${hm ? "the mod's edit of the game's member" : "member only the mod has"}; carried in ${pf.rel}${pm.sha === m.sha ? " (byte-equal)" : " (edited by the build: bytes differ)"}`, { evidence: "member", ported_as: pf.rel + "::" + pm.name, now_in: P.layerOf(pf.rel) });
    const any = P.bySha.get(m.sha); // the member shipped loose (lobby pages of a .pak, for instance)
    if (any) return mk("SHIPPED-AS-IS", "member", `the same bytes are in the port as ${any[0].rel}`, { evidence: "sha", ported_as: any[0].rel, now_in: P.layerOf(any[0].rel) });
    const loose = (P.byNorm.get(P.norm(lc.endsWith(".pak") ? `local/${path.posix.basename(lc, ".pak")}/${key}` : key)) || [])[0];
    if (loose) return mk("SHIPPED-AS-IS", "member", `shipped loose as ${loose.rel}`, { evidence: "name", ported_as: loose.rel, now_in: P.layerOf(loose.rel) });
    const fileRow = rows.find(r => r.path === cont);
    if (fileRow && fileRow.status === "DROPPED-ON-PURPOSE") return mk("DROPPED-ON-PURPOSE", "member", `member of ${cont}, which is dropped on purpose: ${fileRow.note}`, { evidence: "container", cite: fileRow.cite });
    if (hm) return mk("GLOBAL", "member", `the mod's edit of the game's member ${name} (HD ${hm.size} B, mod ${m.size} B), not in the port`, { evidence: "hd-path" });
    return mk("UNCLASSIFIED", "member", `member with no twin in the port (container ${pf ? pf.rel + " lacks it" : "not in the port"}): LOST`, { evidence: "lost" });
  }

  // ----- art class, where it lives, kind-level placement
  for (const r of rows) {
    if (r.level === "member" && r.kind === "member" || r.kind === "map-member") { r.art_class = ""; r.lives_in = r.status === "GLOBAL" ? `rulesets/${id}/` : r.status === "IDENTICAL-TO-HD" || r.status === "DROPPED-ON-PURPOSE" ? "-" : "root"; if (/\.pak::/i.test(r.path) && r.status !== "IDENTICAL-TO-HD") { r.art_class = "3"; r.lives_in = `skins/${id}/ (root until #55)`; } continue; }
    const lp = r.path.toLowerCase(), pl = place(r, lp, r.kind);
    r.art_class = pl.art_class; r.lives_in = pl.lives_in;
    if (r.status === "SHIPPED-AS-IS" && ["map", "conquest", "map-pack", "class-new", "randommap-table", "items", "table", "ini"].includes(r.kind)) r.art_class = "";
  }
  // GLOBAL rows whose twin is in a layer are carried
  for (const r of rows) r.carried = r.status === "GLOBAL" && /(^|\+)rulesets\//.test(r.now_in || "") ? "layer" : "";

  // ----- placement: root files of the port that replace a file of the game (class 2 art in a root), and layer files that are skin
  const placement = [];
  for (const f of P.files) {
    const layer = P.layerOf(f.rel), lp = f.lower.replace(/^(rulesets|skins)\/[^/]+\//, "");
    if (/^(patches|civs|loc|mod\.json|notes)/.test(lp) || lp === "mod.json" || lp === "readme.md") continue;
    const [kind] = kindOf(lp), art = isArt(lp, kind);
    if (layer === "root" && hd.has(lp) && hd.sha(lp) !== f.sha) placement.push({ file: f.rel, where: layer, why: art ? (SKIN(lp) ? "class 3 (menu skin) at the game's path: allowed in the root until skins exist (#55)" : "class 2: replaces the game's file; belongs in the ruleset layer") : "replaces a file of the game at its path (not art)", art_class: art ? (SKIN(lp) ? "3" : "2") : "", error: !SKIN(lp) });
    if (layer.startsWith("rulesets/") && SKIN(lp)) placement.push({ file: f.rel, where: layer, why: "class 3 (menu skin) in a ruleset layer: belongs in skins/", art_class: "3", error: true });
  }

  // ----- collisions: the same path in the root of another port
  const others = new Map();
  for (const r of HERE_ROOTS) { const d = path.join(r, "ported"); if (!fs.existsSync(d)) continue; for (const x of fs.readdirSync(d).sort()) if (x !== id && !others.has(x) && fs.statSync(path.join(d, x)).isDirectory()) others.set(x, path.join(d, x)); }
  const otherIdx = new Map(); // lower path -> [{port, abs}]
  if (!opt.noOthers) for (const [name, dir] of others) for (const f of walk(dir)) { const lp = f.rel.toLowerCase(); if (/^(patches|civs|loc|rulesets|skins)\/|^mod\.json$|\.md$/.test(lp)) continue; if (!otherIdx.has(lp)) otherIdx.set(lp, []); otherIdx.get(lp).push({ port: name, abs: f.abs }); }
  const collisions = [];
  for (const f of P.files) {
    const lp = f.lower.replace(/^(rulesets|skins)\/[^/]+\//, ""), layer = P.layerOf(f.rel);
    if (/^(patches|civs|loc|rulesets|skins)\/|^mod\.json$|\.md$/.test(lp)) continue;
    const o = otherIdx.get(lp); if (!o) continue;
    collisions.push({ file: f.rel, layer, others: o.map(x => ({ port: x.port, same: shaFile(x.abs) === f.sha })) });
  }
  const patchTargets = {}; // the same file patched by other ports: informational (patches of several mods merge; only the same key collides)
  if (!opt.noOthers) { const mine = new Set(P.files.filter(f => /^patches\//.test(f.lower)).map(f => f.lower)); for (const [name, dir] of others) { const pd = path.join(dir, "patches"); if (!fs.existsSync(pd)) continue; for (const f of walk(pd)) { const k = ("patches/" + f.rel).toLowerCase(); if (mine.has(k)) (patchTargets[k] = patchTargets[k] || []).push(name); } } }

  fs.rmSync(tmpRoot, { recursive: true, force: true });
  for (const fd of [modMmp, gameMmp]) if (fd) fs.closeSync(fd);
  rows.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const counts = {};
  for (const lv of ["file", "member"]) { counts[lv] = Object.fromEntries(STATUSES.map(s => [s, 0])); for (const r of rows) if (r.level === lv) counts[lv][r.status]++; }
  const totals = { file: rows.filter(r => r.level === "file").length, member: rows.filter(r => r.level === "member").length };
  return { id, rows, counts, totals, detail, placement, collisions, patchTargets, portDir, origDir, tags, cfg, hasLayer: P.files.some(f => /^rulesets\//i.test(f.rel)), portFiles: P.files.length, others: [...others.keys()] };
}

// ---------- reports ----------
const HEAD = ["path", "size", "status", "kind", "note", "sha256", "level", "container", "group", "nature", "how", "art_class", "lives_in", "now_in", "evidence", "ported_as", "carried"];
function writeReports(res, out) {
  fs.mkdirSync(out, { recursive: true });
  const { rows, counts, totals, detail, placement, collisions, patchTargets, id } = res;
  fs.writeFileSync(path.join(out, "INVENTORY.csv"), HEAD.join(",") + "\n" + rows.map(r => HEAD.map(h => csvCell(r[h])).join(",")).join("\n") + "\n");
  const by = (rs, f) => { const m = new Map(); for (const r of rs) { const k = f(r); m.set(k, (m.get(k) || 0) + 1); } return [...m].sort((a, b) => (a[0] < b[0] ? -1 : 1)); };
  const L = [];
  L.push(`# ${id}: completeness audit`, "", `Original: \`${res.origDir}\`. Port: \`${res.portDir}\` (${res.portFiles} files${res.hasLayer ? ", with a ruleset layer" : ", no ruleset layer"}). Tags: ${res.tags.join(", ")}. Made by \`tools/audit-completeness.js\`; \`INVENTORY.csv\` has one row per file and per container member (columns in docs/TOOLS.md).`, "");
  L.push("## 1. Totals", "", "| status | files | members |", "|---|---|---|", ...STATUSES.map(s => `| ${s === "UNCLASSIFIED" ? "**UNCLASSIFIED**" : s} | ${counts.file[s]} | ${counts.member[s]} |`), `| **sum** | **${totals.file}** | **${totals.member}** |`, "");
  const un = rows.filter(r => r.status === "UNCLASSIFIED"), lost = un.filter(r => r.evidence === "lost");
  L.push(`UNCLASSIFIED: **${un.length}** (of which LOST, a file of the original with no twin in the port and no explanation: **${lost.length}**). ${un.length ? "The audit FAILS." : "The audit passes."}`, "");
  L.push("## 2. By kind and status", "", "| status | kind | files | members |", "|---|---|---|---|");
  for (const s of STATUSES) for (const [k] of by(rows.filter(r => r.status === s), r => r.kind)) { const rs = rows.filter(r => r.status === s && r.kind === k); L.push(`| ${s} | ${k} | ${rs.filter(r => r.level === "file").length} | ${rs.filter(r => r.level === "member").length} |`); }
  L.push("", "## 3. Art class and where it must live", "", "Class 1: art of a civilization or with names of its own (root). 2: global in-game art/sound/text at a path of the game (the ruleset layer). 3: outside the match, the menu skin (root until the engine has skins, #55). Blank: not art.", "", "| art class | lives in | status | rows |", "|---|---|---|---|");
  for (const [k, n] of by(rows.filter(r => r.art_class), r => `${r.art_class} | ${r.lives_in} | ${r.status}`)) L.push(`| ${k} | ${n} |`);
  L.push("", "| lives in (all rows) | rows |", "|---|---|", ...by(rows, r => r.lives_in).map(([k, n]) => `| ${k} | ${n} |`), "");
  const skin = rows.filter(r => r.art_class === "3");
  L.push(`### Skin (class 3): ${skin.length} rows`, "", ...skin.map(r => `- \`${r.path}\` ${r.status}${r.ported_as ? " -> " + r.ported_as : ""}`), "");
  const glob = rows.filter(r => r.status === "GLOBAL");
  L.push("## 4. GLOBAL: what a ruleset layer carries", "", `${glob.length} rows, ${glob.filter(r => r.carried).length} with a copy in a layer of the port.`, "", "| path | kind | class | carried | note |", "|---|---|---|---|---|", ...glob.map(r => `| \`${r.path}\` | ${r.kind} | ${r.art_class} | ${r.carried || "no"} | ${r.note.replace(/\|/g, "\\|")} |`), "");
  const dr = rows.filter(r => r.status === "DROPPED-ON-PURPOSE");
  L.push("## 5. DROPPED-ON-PURPOSE (every one, with its citation)", "", "| path | citation | reason |", "|---|---|---|", ...dr.map(r => `| \`${r.path}\` | ${r.cite || ""} | ${r.note.replace(/\|/g, "\\|")} |`), "");
  L.push("## 6. UNCLASSIFIED (the audit fails while this is not empty)", "", ...(un.length ? un.map(r => `- \`${r.path}\` (${r.kind}): ${r.note}`) : ["none"]), "");
  L.push("## 7. Placement: root against layer", "", ...(placement.length ? ["| file | now in | why | class |", "|---|---|---|---|", ...placement.map(x => `| \`${x.file}\` | ${x.where} | ${x.why} | ${x.art_class} |`)] : ["No root file replaces a file of the game."]), "");
  L.push("## 8. Collisions: the same path in the root of another port", "", `${collisions.length} files of this port (root or layer) are also at the same path in another port's root. A layer against another root can collide; layer against layer cannot.`, "", ...(collisions.length ? ["| file | in | other ports (same bytes?) |", "|---|---|---|", ...collisions.map(c => `| \`${c.file}\` | ${c.layer} | ${c.others.map(o => `${o.port}${o.same ? " (same)" : " (other bytes)"}`).join(", ")} |`)] : []), "");
  const pt = Object.keys(patchTargets).sort();
  L.push(`Patched files shared with other ports (informational: patches merge by attribute, only the same key collides): ${pt.length}.`, "", ...pt.map(k => `- \`${k}\`: ${patchTargets[k].join(", ")}`), "");
  L.push("## Appendix: tables by element", "", "| file | elements | equal to game | new (carried) | edits of the game's (carried) | not carried |", "|---|---|---|---|---|---|");
  for (const d of detail) L.push(`| \`${d.path}\` | ${d.total} ${d.unit} | ${d.same} | ${d.added} (${d.carriedAdd}) | ${d.edited} (${d.carriedEdit}) | ${d.miss.length ? d.miss.slice(0, 60).map(x => x.replace(/\|/g, "\\|")).join("; ") + (d.miss.length > 60 ? `; ... (+${d.miss.length - 60})` : "") : ""} |`);
  fs.writeFileSync(path.join(out, "INVENTORY.md"), L.join("\n") + "\n");
}

// ---------- the exit code ----------
function verdict(res, strict) {
  const bad = [];
  const un = res.rows.filter(r => r.status === "UNCLASSIFIED");
  if (un.length) bad.push(`${un.length} UNCLASSIFIED (${un.filter(r => r.evidence === "lost").length} lost)`);
  if (strict) {
    const pend = res.rows.filter(r => r.status === "GLOBAL" && !r.carried);
    if (pend.length) bad.push(`${pend.length} GLOBAL rows with no copy in a ruleset layer`);
    const pe = res.placement.filter(x => x.error);
    if (pe.length) bad.push(`${pe.length} files in the wrong place (root against layer)`);
  }
  return bad;
}

// ---------- self test: a tiny mod, a tiny game, a tiny port ----------
function selfTest() {
  const assert = (c, m) => { if (!c) throw new Error("self-test: " + m); };
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "audit-selftest-")), w = (rel, s) => { const p = path.join(d, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
  try {
    w("hd/DATA/CONST.INI", "[A]\nx = 1\ny = 2\n"); w("hd/DATA/SUBAI/UNIT_MOVE.VS", "hd move"); w("hd/DATA/CLASSES/GARCHER.SC.XML", '<class id="GArcher" parent="Unit"/>'); w("hd/DATA/CLASSES/UNIT.SC.XML", '<class id="Unit" parent="Object"/>');
    w("hd/SOUNDS/WALK/STEP.WAV", "hd step"); w("hd/UI/ICONS/SAME.BMP", "same");
    w("orig/Mod/DATA/CONST.INI", "[A]\nx = 5\ny = 2\n[B]\nz = 9\n");           // x edit (not carried -> GLOBAL), z new (carried)
    w("orig/Mod/DATA/SUBAI/UNIT_MOVE.VS", "mod move");                           // copy in the port
    w("orig/Mod/DATA/SUBAI/NEW_THING.VS", "mod new");                            // nowhere: LOST
    w("orig/Mod/DATA/SUBAI/DEAD.VS", "mod dead");                                // listed as left out
    w("orig/Mod/DATA/CLASSES/GARCHER.SC.XML", '<class id="GArcher" parent="Unit"><x/></class>'); w("orig/Mod/DATA/CLASSES/UNIT.SC.XML", '<class id="Unit" parent="Object"><y/></class>');
    w("orig/Mod/SOUNDS/WALK/STEP.WAV", "mod step");                              // replaces the game's, not in the port: GLOBAL class 2
    w("orig/Mod/UI/ICONS/SAME.BMP", "same");                                     // identical to HD
    w("orig/Mod/UI/ICONS/NEWICON.BMP", "icon");                                  // shipped under a tag
    w("orig/Mod/CURRENTLANG/MENUBACKGROUND.BMP", "bg");                          // skin
    w("orig/Mod/movies/intro.avi", "avi"); w("orig/Mod/Thumbs.db", "junk");
    w("port/mod.json", "{}"); w("port/civs/tgaul.json", JSON.stringify({ id: "tgaul", alias: { classes: { GArcher: "TgaArcher" } } }));
    w("port/DATA/CLASSES/TGAARCHER.SC.XML", '<class id="TgaArcher" parent="Unit"/>'); w("port/DATA/CLASSES/ZFOO.SC.XML", '<class id="Zfoo" parent="Unit"/>');
    w("port/DATA/SUBAI/unit_move_tst_tgaul.vs", "mod move!"); w("port/patches/DATA/CONST.INI", "[B]\nz = 9\n"); w("port/UI/ICONS/NEWICON_tst.BMP", "icon"); w("port/CURRENTLANG/MENUBACKGROUND.BMP", "bg");
    w("lists/left.txt", "DATA/SUBAI/DEAD.VS (nothing uses it)\n");
    const run = o => audit({ id: "tst", origDir: path.join(d, "orig/Mod"), portDir: path.join(d, "port"), work: path.join(d, "work"), trees: (() => { const hd = new Tree().add(path.join(d, "hd")); return { hd, old: new Tree(), G: null }; })(), noOthers: true, config: { tags: ["tst"], rules: [{ match: "^movies/", status: "DROPPED-ON-PURPOSE", reason: "videos", cite: "NOTES.md 'x'" }], leftOut: [path.join(d, "lists/left.txt")] }, ...o });
    const res = run({}), st = Object.fromEntries(res.rows.map(r => [r.path, r]));
    const is = (p, s) => assert(st[p] && st[p].status === s, `${p} should be ${s}, is ${st[p] && st[p].status} (${st[p] && st[p].note})`);
    is("DATA/CONST.INI", "GLOBAL"); is("DATA/SUBAI/UNIT_MOVE.VS", "CLONED"); is("DATA/SUBAI/NEW_THING.VS", "UNCLASSIFIED"); is("DATA/SUBAI/DEAD.VS", "DROPPED-ON-PURPOSE");
    is("DATA/CLASSES/GARCHER.SC.XML", "CLONED"); is("DATA/CLASSES/UNIT.SC.XML", "CLONED"); is("SOUNDS/WALK/STEP.WAV", "GLOBAL"); is("UI/ICONS/SAME.BMP", "IDENTICAL-TO-HD");
    is("UI/ICONS/NEWICON.BMP", "CLONED"); is("CURRENTLANG/MENUBACKGROUND.BMP", "SHIPPED-AS-IS"); is("movies/intro.avi", "DROPPED-ON-PURPOSE"); is("Thumbs.db", "DROPPED-ON-PURPOSE");
    assert(st["SOUNDS/WALK/STEP.WAV"].art_class === "2" && st["SOUNDS/WALK/STEP.WAV"].lives_in === "rulesets/tst/", "walk sound is class 2, layer");
    assert(st["CURRENTLANG/MENUBACKGROUND.BMP"].art_class === "3", "background is class 3"); assert(st["UI/ICONS/NEWICON.BMP"].art_class === "1", "own-name icon is class 1");
    assert(res.counts.file.UNCLASSIFIED === 1 && res.totals.file === 12, `counts ${JSON.stringify(res.counts.file)} total ${res.totals.file}`);
    assert(Object.values(res.counts.file).reduce((a, b) => a + b, 0) === res.totals.file, "the counts add up to the total");
    assert(verdict(res, false).length === 1, "a lost file fails the audit");
    w("port/DATA/SUBAI/new_thing.vs", "mod new");                                  // now carried (same name, same bytes)
    const res2 = run({}), st2 = Object.fromEntries(res2.rows.map(r => [r.path, r]));
    assert(st2["DATA/SUBAI/NEW_THING.VS"].status === "CLONED" && !verdict(res2, false).length, "carried: passes");
    assert(verdict(res2, true).length > 0, "--strict fails while a GLOBAL row has no layer copy");
    writeReports(res2, path.join(d, "out")); assert(fs.existsSync(path.join(d, "out/INVENTORY.csv")) && fs.readFileSync(path.join(d, "out/INVENTORY.csv"), "utf8").split("\n").length === res2.rows.length + 2, "csv has one row per file");
    const again = run({}); assert(JSON.stringify(again.rows) === JSON.stringify(res2.rows), "the same input gives the same rows twice");
    console.log("self-test ok: 12 files, every status, a lost file fails, --strict fails on a GLOBAL row with no layer copy, same rows twice");
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
}

// ---------- main ----------
if (require.main === module) {
  const args = process.argv.slice(2), opt = {}, pos = [];
  for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === "--self-test" || a === "selfcheck") opt.selfTest = true; else if (a === "--strict") opt.strict = true; else if (a === "--fresh") opt.fresh = true; else if (a.startsWith("--")) opt[a.slice(2)] = args[++i]; else pos.push(a); }
  if (opt.selfTest) { selfTest(); process.exit(0); }
  const id = pos[0];
  if (!id) { console.error("usage: node tools/audit-completeness.js <id> [--orig <zip|folder>] [--port <folder>] [--out <folder>] [--strict] [--fresh]\n       node tools/audit-completeness.js --self-test"); process.exit(2); }
  let res;
  try { res = audit({ id, orig: opt.orig && path.resolve(opt.orig), portDir: opt.port && path.resolve(opt.port), fresh: opt.fresh }); } catch (e) { console.error(e.message); process.exit(2); }
  const out = path.resolve(opt.out || path.join(ROOT, ".scratch", "audit", id));
  writeReports(res, out);
  console.log(`${id}: ${res.totals.file} files, ${res.totals.member} members -> ${out}`);
  for (const lv of ["file", "member"]) console.log(lv.padEnd(7), STATUSES.map(s => `${s} ${res.counts[lv][s]}`).join("  "));
  console.log(`placement: ${res.placement.length} root/layer findings; collisions: ${res.collisions.length} files at the same path in another port's root`);
  const bad = verdict(res, opt.strict);
  if (bad.length) { console.error("FAIL: " + bad.join("; ")); process.exit(1); }
}
module.exports = { audit, writeReports, verdict, STATUSES, iniEntries, xmlElements, locEntries };
