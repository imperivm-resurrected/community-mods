// Turns what a 1.40 mod added to a game file into a patch that only adds it (AGENTS.md, "Civilizations are independent": a mod never
// ships a whole file at a path the game uses).
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");

// Line diff of two scripts -> script patch directives (@after/@before/@bottom). Only the pure insertions whose text passes `keep` (the part
// that belongs to the mod's civilization) are kept; the others go to `report`. An anchor is a line of the original that holds text no
// earlier line holds; if the line the insertion follows or precedes is not one, it is reported and left out.
// The patch is then APPLIED to hdText with the engine's algorithm (tools/lib/script-patch.js) and compared, line by line and ignoring indentation and blank
// lines, with what the kept hunks say the script must be (the game's lines with each kept hunk replaced by the mod's): a difference stops the build (a patch that
// does not give what it was cut from is wrong, and a script patch is global). PATCH_CHECK=warn only reports it.
function vsPatch(hdText, modText, keep, label, report) {
  const { applyScriptPatch } = require("./script-patch.js");
  const kept = [];                                                          // { at, k, add } the hunks that became directives: for the expected text
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "g18-")), a = path.join(tmp, "a"), b = path.join(tmp, "b");
  const A = hdText.replace(/\r/g, "").split("\n"), B = modText.replace(/\r/g, "").split("\n");
  fs.writeFileSync(a, A.join("\n")); fs.writeFileSync(b, B.join("\n"));
  const d = cp.spawnSync("diff", ["-U0", a, b], { encoding: "utf8" }).stdout; fs.rmSync(tmp, { recursive: true });
  const safe = i => i >= 1 && i <= A.length && A[i - 1].trim().length >= 6 && A.findIndex(l => l.includes(A[i - 1].trim())) === i - 1;
  const out = [], hunks = [];
  for (const h of d.split(/^(?=@@ )/m).slice(1)) {
    const m = h.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/), at = +m[1];
    const lines = h.split("\n").slice(1).filter(l => l !== "\\ No newline at end of file"), delAll = lines.filter(l => l.startsWith("-")).map(l => l.slice(1).trim());
    const insAll = lines.filter(l => l.startsWith("+")).map(l => l.slice(1));
    // lines the mod only re-indented (or whose end of file changed) are not edits: what is new is the insertion
    // (one copy of a deleted line per deleted line: a line the mod repeats (olLibyansOut.Add(...) twice) is not swallowed by the one it replaces)
    const del = delAll.filter(l => l && !insAll.some(x => x.trim() === l)), pool = new Map();
    for (const l of delAll) pool.set(l, (pool.get(l) || 0) + 1);
    const ins = insAll.filter(l => { const k = l.trim(); if (!k) return true; const n = pool.get(k) || 0; if (!n) return true; pool.set(k, n - 1); return false; });
    const text = ins.join("\n"), first = ins.find(l => l.trim()) || "";
    // a patch that does not compile breaks every script that loads it: braces must balance, and a variable it assigns must be one it declares
    // (or the script declares: the mod declared variables at the top, which is a hunk of its own that is not Greek)
    const code = text.replace(/\/\/.*$/gm, "").replace(/"[^"]*"/g, '""');
    const open = (code.match(/\{/g) || []).length, close = (code.match(/\}/g) || []).length;
    const declared = new Set([...A.join("\n").matchAll(/^\s*(?:int|str|bool|point|Obj|ObjList|Settlement|Building|Unit|Hero|Squad|Item|StrArray|IntArray)\b([^;(]*);/gm)].flatMap(m => m[1].split(",").map(x => x.trim().split(/[\s=]/)[0]))
      .concat([...code.matchAll(/^\s*(?:int|str|bool|point|Obj|ObjList|Settlement|Building|Unit|Hero|Squad|Item)\b([^;(]*);/gm)].flatMap(m => m[1].split(",").map(x => x.trim().split(/[\s=]/)[0]))));
    const undeclared = [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*[-+*]?=[^=]/gm)].map(m => m[1]).filter(n => !declared.has(n));
    if (keep(text) && (open !== close || undeclared.length)) { report.push(`${label}: hunk at line ${at} left out (${open !== close ? "unbalanced braces" : "uses " + [...new Set(undeclared)].join(", ") + " without declaring it"}): ${first.trim().slice(0, 60)}`); continue; }
    if (del.length || !keep(text)) { report.push(`${label}: hunk at line ${at} left out (${del.length ? "it edits the game's lines" : "not Greek"}): ${first.trim().slice(0, 60)}`); continue; }
    const k = m[2] === undefined ? 1 : +m[2];
    let dir;
    if (at >= A.length) dir = ["@bottom", ...ins];
    else if (safe(at)) dir = [`@after ${A[at - 1].trim()}`, ...ins];
    else if (safe(at + 1)) dir = [`@before ${A[at].trim()}`, ...ins];
    else { report.push(`${label}: no safe anchor at line ${at}: ${first.trim().slice(0, 60)}`); continue; }
    hunks.push(dir); kept.push({ at, k, add: insAll });
  }
  // bottom to top: what an earlier directive inserted never holds the text a later anchor looks for (the engine takes the FIRST line that contains it)
  for (const dir of hunks.reverse()) out.push(...dir);
  if (!out.length) return null;
  const patch = out.join("\r\n") + "\r\n";
  // what the script must be: the game's lines, each kept hunk replaced by the mod's lines of it (bottom to top, so the line numbers hold)
  const want = A.slice();
  for (const h of kept.slice().sort((x, y) => y.at - x.at)) want.splice(h.k === 0 ? h.at : h.at - 1, h.k, ...h.add);
  const norm = ls => ls.map(l => l.trim()).filter(Boolean);
  const r = applyScriptPatch(A.join("\n"), patch), got = norm(r.text.split("\n")), exp = norm(want);
  let bad = r.errors.length ? r.errors[0] : "";
  if (!bad) for (let i = 0; i < Math.max(got.length, exp.length); i++) if (got[i] !== exp[i]) { bad = `line ${i + 1} of the result: the patch gives ${JSON.stringify(got[i])}, the mod's hunks say ${JSON.stringify(exp[i])}`; break; }
  if (bad) {
    const msg = `${label}: the patch applied to the game's script does not give what it was cut from (${bad})`;
    report.push(msg);
    if (process.env.PATCH_CHECK !== "warn") throw new Error(msg);
  }
  return patch;
}

// The elements a mod added to an XML file of the game (items, formations...): the XML of a patch that adds them under `root`, or null.
// An element whose tag and id/name/class the game already has is an edit, not an addition: it is left out (and reported).
function xmlAdded(hdText, modText, root, report = [], label = root) {
  const A = hdText.replace(/\r/g, ""), B = modText.replace(/\r/g, "");
  const el = s => [...s.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)].map(m => ({ text: m[0], key: m[1] + ":" + ((m[2].match(/\b(?:id|name|class)\s*=\s*"([^"]*)"/i) || [])[1] || "").toLowerCase() }));
  const body = s => s.replace(/^[\s\S]*?<[A-Za-z_][\w-]*\b[^>]*>/, "");
  const norm = x => x.replace(/\s+/g, " "), hd = el(body(A)), ha = new Set(hd.map(x => norm(x.text))), hk = new Set(hd.filter(x => !x.key.endsWith(":")).map(x => x.key));
  const added = [];
  for (const x of el(body(B))) {
    if (ha.has(norm(x.text))) continue;
    if (hk.has(x.key)) { report.push(`${label}: ${x.key} edits the game's element: left out`); continue; }
    added.push(x.text);
  }
  return added.length ? { xml: `<patch>\n  <add select="/${root}">\n${added.join("\n")}\n  </add>\n</patch>\n`, count: added.length } : null;
}

// The keys a mod added to an INI file of the game: the text of a patch with only those (a key the game has is not touched)
function iniAdded(hdText, modText) {
  const parse = t => { const m = new Map(); let sec = ""; for (const l of t.replace(/\r/g, "").split("\n")) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; m.set(sec, m.get(sec) || new Map()); continue; } const k = l.match(/^\s*([^;=\s][^=]*?)\s*=\s*(.*?)\s*$/); if (k && sec) m.get(sec).set(k[1].toLowerCase(), [k[1], k[2]]); } return m; };
  const A = parse(hdText), B = parse(modText), out = []; let n = 0;
  for (const [sec, keys] of B) { const add = [...keys].filter(([k]) => !(A.get(sec) || new Map()).has(k)); if (add.length) { out.push(`[${sec}]`, ...add.map(([, [k, v]]) => `${k} = ${v}`)); n += add.length; } }
  return n ? { text: out.join("\r\n") + "\r\n", count: n } : null;
}

// Gives files of a port names of its own: each `rels` entry (a path inside `root`, any case) becomes <name>_<tag>.<ext>, and the references
// to its file name in the port's text files (commands, classes, ini, scripts) follow. Returns the old -> new names.
function tagFiles(root, rels, tag) {
  const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
  const all = walk(root), want = new Set(rels.map(r => r.toLowerCase())), map = new Map();
  for (const p of all) {
    const rel = path.relative(root, p).replace(/\\/g, "/");
    if (!want.has(rel.toLowerCase())) continue;
    const ext = path.extname(p), base = path.basename(p, ext), nb = `${base}_${tag}${ext}`;
    fs.renameSync(p, path.join(path.dirname(p), nb)); map.set(path.basename(p).toLowerCase(), nb);
  }
  if (!map.size) return map;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), re = new RegExp(`(?<![A-Za-z0-9_.-])(${[...map.keys()].map(esc).join("|")})`, "gi");
  for (const p of all) {
    if (!/\.(xml|ini|vs|txt)$/i.test(p) || !fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, "latin1"), t = s.replace(re, m => map.get(m.toLowerCase()));
    if (t !== s) { fs.rmSync(p); fs.writeFileSync(p, t, "latin1"); }
  }
  return map;
}

// A port's own names where another mod (or the game) has the same path with other bytes (AGENTS.md, "Names and paths": the one being ported is
// renamed, never the other). `others` are folders to compare with (other ported mods, the game's Adventures...). By kind:
//   DATA/CLASSES/X.SC.XML       the class gets the id X_<tag>, and every reference to the id follows
//   UNITS|BUILDINGS|MAPOBJECTS/<folder>/...   the folder becomes <folder>_<tag> and every reference to it follows
//   a .bfhp                     <name> (<tag>).bfhp (nothing refers to a map by its file name)
//   anything else               <name>_<tag>.<ext> and every reference to the name follows
// Returns what it renamed.
// `gameDirs`: folders of the game's own packs. A file the mod adds inside a folder the game has (a sentry's .ent.xml next to the game's archer art,
// whose images it names without a path) is renamed alone: renaming the folder would cut it off from the game's art, and the references to the
// game's folder in every class of the port would follow it.
function tagCollisions({ OUT, others, tag, skip, dropMapsOf = [], mapLabel, gameDirs = [] }) {
  if (skip) skip = new RegExp(skip.source, "i");                // the folders of a port are upper or lower case
  const crypto = require("crypto");
  const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
  const md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
  const rel = (root, p) => path.relative(root, p).replace(/\\/g, "/");
  const theirs = new Map();
  for (const o of others) for (const p of walk(o)) { const k = rel(o, p).toLowerCase(); if (!/^(patches|civs|loc|local|mod\.json|notes\.md)/.test(k)) (theirs.get(k) || theirs.set(k, []).get(k)).push(p); }
  for (const p of walk(OUT)) if (/(^|[\\/])(desktop\.ini|thumbs\.db)$/i.test(p)) fs.rmSync(p);   // not part of any mod
  const hits = [];
  for (const p of walk(OUT)) {
    const r = rel(OUT, p); if (/^(patches|civs|loc|local)\//i.test(r) || r === "mod.json" || (skip && skip.test(r))) continue;
    // other bytes, or the same bytes in a gameplay file: the mod manager does not compare bytes, and two mods that ship the same gameplay file are
    // "use only one" for it, and a gameplay or map file shared by two mods stops the player from choosing between their cosmetic files (the menu skin)
    // (art, sounds and the like are cosmetic: one of them is used and nothing breaks)
    const t = theirs.get(r.toLowerCase()); if (t && (t.some(q => md5(q) !== md5(p)) || /^(data\/|units\/.*\.xml$|(buildings|mapobjects)\/.*\.xml$|randommap|scenarios\/|adventures\/|conquests\/|conquestmaps\/)/i.test(r))) hits.push(r);
  }
  const folders = new Set(), ids = new Map(), names = new Map(), maps = [], dropped = [], unlabeled = [];
  for (const r of hits) {
    const parts = r.split("/");
    if (/^data\/classes\/[^/]+\.sc\.xml$/i.test(r)) { const id = (fs.readFileSync(path.join(OUT, r), "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1]; if (id) ids.set(id, `${id}_${tag}`); }
    else if (/^(units|buildings|mapobjects)$/i.test(parts[0]) && parts.length >= 3 && gameDirs.some(g => fs.existsSync(path.join(g, parts[0])) && fs.readdirSync(path.join(g, parts[0])).some(x => x.toLowerCase() === parts[1].toLowerCase()))) names.set(parts[parts.length - 1].toLowerCase(), r);
    else if (/^(units|buildings|mapobjects)$/i.test(parts[0]) && parts.length >= 3) folders.add(`${parts[0]}/${parts[1]}`);
    else if (/\.bfhp$/i.test(r)) {
      // a map the game itself ships (an official adventure the mod edited): the game's stays, the mod's copy is not needed
      if ((theirs.get(r.toLowerCase()) || []).some(q => dropMapsOf.some(d => q.startsWith(d + path.sep)))) dropped.push(r); else maps.push(r);
    }
    else names.set(parts[parts.length - 1].toLowerCase(), r);
  }
  for (const [b, r] of [...names]) { const stem = path.basename(r, path.extname(r)).toLowerCase(), dir = path.dirname(r).toLowerCase(); if (maps.some(m => path.dirname(m).toLowerCase() === dir && path.basename(m, path.extname(m)).toLowerCase() === stem)) names.delete(b); }
  // text files that can refer to a name
  const swap = (re, fn) => { for (const p of walk(OUT).filter(p => /\.(xml|ini|vs|txt)$/i.test(p))) { if (!fs.existsSync(p)) continue; const s = fs.readFileSync(p, "latin1"), t = s.replace(re, fn); if (t !== s) { fs.rmSync(p); fs.writeFileSync(p, t, "latin1"); } } };
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // classes: the id in the file, and the references to it (not inside a path)
  if (ids.size) {
    swap(new RegExp(`(?<![A-Za-z0-9_/\\\\.])(${[...ids.keys()].map(esc).join("|")})(?![A-Za-z0-9_/\\\\.])`, "g"), m => ids.get(m));
    for (const nid of ids.values()) { const f = walk(path.join(OUT, "DATA")).find(p => /\.sc\.xml$/i.test(p) && (fs.readFileSync(p, "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1] === nid); if (f) fs.renameSync(f, path.join(path.dirname(f), `${nid.toUpperCase()}.SC.XML`)); }
  }
  // folders
  if (folders.size) swap(new RegExp(`(?<=[/\\\\"'])(${[...folders].map(f => esc(f.split("/")[1])).join("|")})(?=[/\\\\])`, "gi"), m => `${m}_${tag}`);
  for (const f of folders) {
    const [top, name] = f.split("/"), dir = fs.readdirSync(path.join(OUT, top)).find(x => x.toLowerCase() === name.toLowerCase()); if (!dir) continue;
    fs.renameSync(path.join(OUT, top, dir), path.join(OUT, top, `${dir}_${tag}`));
  }
  // maps
  for (const r of dropped) {
    const p = path.join(OUT, r), dir = path.dirname(p), stem = path.basename(p, path.extname(p));
    for (const f of fs.readdirSync(dir)) if (path.basename(f, path.extname(f)).toLowerCase() === stem.toLowerCase()) fs.rmSync(path.join(dir, f));
  }
  for (const [b, r] of [...names]) { const stem = path.basename(r, path.extname(r)).toLowerCase(), dir = path.dirname(r).toLowerCase(); if (dropped.some(m => path.dirname(m).toLowerCase() === dir && path.basename(m, path.extname(m)).toLowerCase() === stem)) names.delete(b); }
  // a renamed map says whose it is in the list: its name (game.xml, written in place: it has to fit the same pages) ends with the mod's label
  const label = bfhp => {
    if (!mapLabel) return "";
    try {
      const hpfs = require("../hpfs.js"), buf = fs.readFileSync(bfhp), e = hpfs(buf).find(x => /^game\.xml$/i.test(x.path));
      if (!e) return "no game.xml";
      const t = e.read().toString("latin1"), n = t.replace(/(<properties\b[\s\S]*?\bname\s*=\s*")([^"]*)"/, (m, a, v) => v.endsWith(`(${mapLabel})`) ? m : `${a}${v} (${mapLabel})"`);
      if (n === t) return "";
      const squeeze = x => x.replace(/\r?\n[ \t]+/g, " ");              // the attributes' indentation, if the name does not fit the same pages
      try { e.write(Buffer.from(n, "latin1")); } catch { e.write(Buffer.from(squeeze(n), "latin1")); }
      fs.rmSync(bfhp); fs.writeFileSync(bfhp, buf); return "";
    } catch (err) { return err.message; }
  };
  // (a map's picture and text files share its name: they follow it)
  for (const r of maps) {
    const p = path.join(OUT, r), dir = path.dirname(p), stem = path.basename(p, path.extname(p));
    for (const f of fs.readdirSync(dir)) if (path.basename(f, path.extname(f)).toLowerCase() === stem.toLowerCase()) fs.renameSync(path.join(dir, f), path.join(dir, `${stem} (${tag})${path.extname(f)}`));
    const why = label(path.join(dir, `${stem} (${tag})${path.extname(p)}`));
    if (why) unlabeled.push(`${r}: ${why}`);
  }
  // single files
  const done = new Map();
  for (const [base, r] of names) {
    const p = walk(OUT).find(x => rel(OUT, x).toLowerCase() === r.toLowerCase()); if (!p) continue;
    const ext = path.extname(p), nb = `${path.basename(p, ext)}_${tag}${ext}`;
    fs.renameSync(p, path.join(path.dirname(p), nb)); done.set(base, nb);
  }
  if (done.size) swap(new RegExp(`(?<![A-Za-z0-9_.-])(${[...done.keys()].map(esc).join("|")})`, "gi"), m => done.get(m.toLowerCase()));
  return { classes: [...ids.keys()], folders: [...folders], maps, dropped, unlabeled, files: [...done.values()] };
}

// Names of commands (researches, orders) and items that a port defines and the game does not: what shows up in `<cmd name=` of its own command
// files and patches, and in `<item id=` of its items.
function ownNames(root, HD) {
  const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
  const hdText = walk(path.join(HD, "DATA")).filter(p => /\.xml$/i.test(p)).map(p => fs.readFileSync(p, "latin1")).join("\n").replace(/<!--[\s\S]*?-->/g, "").toLowerCase();
  const out = { cmds: new Set(), items: new Set() };
  for (const p of walk(root).filter(p => /\.xml$/i.test(p))) {
    const rel = path.relative(root, p).replace(/\\/g, "/");
    const isCmd = /(^|patches\/)data\/commands\//i.test(rel), isItem = /(^|patches\/)data\/items\.xml$/i.test(rel);
    if (!isCmd && !isItem) continue;
    for (const m of fs.readFileSync(p, "latin1").replace(/<!--[\s\S]*?-->/g, "").matchAll(isCmd ? /<cmd\b[^>]*?\bname\s*=\s*"([^"]*)"/g : /<item\b[^>]*?\bid\s*=\s*"([^"]*)"/g)) {
      if (!hdText.includes(`"${m[1].toLowerCase()}"`)) out[isCmd ? "cmds" : "items"].add(m[1]);
    }
  }
  return out;
}

// Gives names of commands and items that two ports both define a name of this port's own: "<name> (<tag>)" in the command and item definitions, in
// the quoted strings of scripts and in the tokens of the parameters that name it ("NameSet, Olympic Games, default"). The names are keys:
// the state of a research is stored under its name.
function tagNames({ OUT, names, tag }) {
  const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
  const list = [...names].sort((a, b) => b.length - a.length), map = new Map(list.map(n => [n.toLowerCase(), `${n} (${tag})`]));
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!list.length) return 0;
  const alt = list.map(esc).join("|");
  let n = 0;
  for (const p of walk(OUT).filter(p => /\.(xml|vs|ini)$/i.test(p) || /(^|[\\/])civs[\\/][^\\/]+\.json$/i.test(p))) {     // civs/*.json: the alias table names orders
    const rel = path.relative(OUT, p).replace(/\\/g, "/");
    if (/^(loc|local)\//i.test(rel) || /\.bfhp$/i.test(rel)) continue;
    let s0 = fs.readFileSync(p, "latin1"), t = s0;
    // a quoted string that is exactly a name (scripts, attributes: name="X", id="X", button texts are not names and differ)
    t = t.replace(new RegExp(`(["'])(${alt})\\1`, "gi"), (_m, q, nm) => `${q}${map.get(nm.toLowerCase())}${q}`);
    // a token of a comma separated parameter
    t = t.replace(/(\b(?:param|sclass)\s*=\s*")([^"]*)"/g, (_m, a, v) => `${a}${v.split(",").map(tok => { const k = tok.trim().toLowerCase(); return map.has(k) ? tok.replace(tok.trim(), map.get(k)) : tok; }).join(",")}"`);
    if (t !== s0) { fs.rmSync(p); fs.writeFileSync(p, t, "latin1"); n++; }
  }
  return n;
}

// The keys a mod changed or added in an INI file of the game: the text of a patch with only those (the menu skin's layout: AGENTS.md, "Civilizations are
// independent": a whole data/interface/menu/*.ini would make every other mod's skin "use only one")
function iniChanged(hdText, modText) {
  const parse = t => { const m = new Map(); let sec = ""; for (const l of t.replace(/\r/g, "").split("\n")) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; if (!m.has(sec)) m.set(sec, new Map()); continue; } const k = l.match(/^\s*([^;=\s][^=]*?)\s*=\s*(.*?)\s*$/); if (k && sec) m.get(sec).set(k[1].toLowerCase(), [k[1], k[2]]); } return m; };
  const A = parse(hdText), B = parse(modText), out = []; let n = 0;
  for (const [sec, keys] of B) {
    const mine = A.get(sec) || new Map(), ch = [...keys].filter(([k, [, v]]) => !mine.has(k) || mine.get(k)[1] !== v);
    if (ch.length) { out.push(`[${sec}]`, ...ch.map(([, [k, v]]) => `${k} = ${v}`)); n += ch.length; }
  }
  return n ? { text: out.join("\r\n") + "\r\n", count: n } : null;
}
module.exports = { vsPatch, xmlAdded, iniAdded, iniChanged, tagFiles, tagCollisions, ownNames, tagNames };
