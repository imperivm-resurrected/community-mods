// The art of Community Mod 12 that the GameBanana upload (the port's source) lacks or has in another state, taken from the Discord download of the same mod
// (originals/discord/community-mod-v12/Community Mod v12.rar, a full game copy whose Packs/UI.pak has the mod's command-bar buttons), 
//   discordCmdbar({ RAR, SDK, SCRATCH })             -> folder with the UI.pak's CMDBAR files (UI/CMDBAR/<kind>/<name>.BMP), made in SCRATCH and the pak deleted
//   shipIcons({ OUT, DISCORD, HD, TAG })             -> { shipped, notNamed, replaced, repointed, files }  every UI/CMDBAR picture of the Discord pak that differs from HD's (and the ones HD has
//                                                      not that a clone's order names) goes to UI/CMDBAR/<kind>/<name>_<tag>.<ext>; the references of the copies' orders follow
//   hotkeys({ OUT })                                 -> { rows, mismatch, unreadable, ok }  the letter painted at the bottom centre of each shipped button against the `key=` of
//                                                      each clone order that uses it
// HD's paths are never written: the Discord art is renamed <name>_<tag>.BMP and the orders of the port's civilizations point to it (the same class of rename tools/lib/community-refs.js
// repairs after tagCollisions). Orders the game shares by name (the patches that add a source to UNIT.XML, VILLAGE.XML...) keep the game's buttons: a patch cannot re-point them.
const fs = require("fs"), path = require("path"), cp = require("child_process"), crypto = require("crypto");
const rd = f => fs.readFileSync(f, "latin1");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
const rel = (root, p) => path.relative(root, p).replace(/\\/g, "/");
const rmDir = d => fs.rmSync(d, { recursive: true, force: true });

const { extractPak } = require("./community-pak.js");
function discordCmdbar({ RAR, SDK, SCRATCH }) {
  return extractPak({ archive: RAR, member: "Packs/UI.pak", SDK, SCRATCH, out: path.join(SCRATCH, "cm-discord-ui"), filter: "CMDBAR", pak: "UI.pak" });
}

const ATTR = /\b(button|queueicon|icon|transpicon|image)\s*=\s*"([^"]*\.bmp)"/gi;
// the file under UI/CMDBAR a value names (lowercase), or null: a plain `button=` is relative to UI/CMDBAR; gameres/cmdbar/x too
const cmdbarOf = (attr, v) => { v = v.replace(/\\/g, "/"); const g = /^gameres\/cmdbar\/(.*)$/i.exec(v); if (g) return `ui/cmdbar/${g[1]}`.toLowerCase(); return /^button$/i.test(attr) && !/^gameres\//i.test(v) ? `ui/cmdbar/${v}`.toLowerCase() : null; };
const plainKey = k => k.replace(/_cm(\.[a-z0-9]+)$/i, "$1");
const texts = OUT => [...walk(path.join(OUT, "DATA")), ...walk(path.join(OUT, "patches", "DATA"))].filter(f => /\.xml$/i.test(f) && !/[\\/](loc|local)[\\/]/i.test(f));

function shipIcons({ OUT, DISCORD, HD, TAG }) {
  const hdIdx = new Map(); for (const f of walk(path.join(HD, "UI"))) hdIdx.set(rel(HD, f).toLowerCase(), f);
  const named = new Set();                                              // plain keys of the pictures the port's own texts name
  for (const f of texts(OUT)) for (const m of rd(f).replace(/<!--[\s\S]*?-->/g, "").matchAll(ATTR)) { const k = cmdbarOf(m[1], m[2]); if (k) named.add(plainKey(k)); }
  const shipped = new Map(), notNamed = [], same = []; let notHD = 0, differ = 0;
  for (const f of walk(DISCORD).sort()) {
    const r = rel(DISCORD, f), k = r.toLowerCase();
    if (!/^ui\/cmdbar\/[^/]+\/[^/]+\.bmp$/.test(k)) continue;
    const h = hdIdx.get(k);
    if (h && md5(h) === md5(f)) { same.push(r); continue; }
    if (!h) { notHD++; if (!named.has(k)) { notNamed.push(r); continue; } } else differ++;
    shipped.set(k, f);
  }
  // write them; what the GameBanana package put at the plain path or at the renamed one goes (the Discord version is the mod's own art: see NOTES.md, "Icons")
  const replaced = [];
  for (const [k, f] of shipped) {
    const r = rel(DISCORD, f), dir = path.join(OUT, path.dirname(r)), base = path.basename(r), ext = path.extname(base), stem = base.slice(0, -ext.length);
    if (fs.existsSync(dir)) for (const x of fs.readdirSync(dir)) { const xs = x.toLowerCase(); if (xs === base.toLowerCase() || xs === `${stem}_${TAG}${ext}`.toLowerCase()) { fs.rmSync(path.join(dir, x)); replaced.push(`${path.dirname(r)}/${x}`); } }
    fs.mkdirSync(dir, { recursive: true }); fs.copyFileSync(f, path.join(dir, `${stem}_${TAG}${ext}`));
  }
  // the references of the port's own texts
  let repointed = 0, files = 0;
  for (const f of texts(OUT)) {
    const s = rd(f), t = s.replace(ATTR, (m, attr, v) => { const k = cmdbarOf(attr, v); if (!k || !shipped.has(plainKey(k))) return m; if (/_cm\.[A-Za-z0-9]+$/i.test(v)) return m; repointed++; return m.replace(v, v.replace(/(\.[A-Za-z0-9]+)$/, `_${TAG}$1`)); });
    if (t !== s) { fs.rmSync(f); fs.writeFileSync(f, t, "latin1"); files++; }
  }
  return { shipped: [...shipped.keys()].sort(), notNamed: notNamed.sort(), same: same.length, differ, notHD, replaced: replaced.sort(), repointed, files };
}

// ---- the painted hotkey letter ----
function readBmp(f) {
  const b = fs.readFileSync(f), off = b.readUInt32LE(10), w = b.readInt32LE(18), hh = b.readInt32LE(22), bpp = b.readUInt16LE(28), h = Math.abs(hh), stride = Math.ceil(w * bpp / 32) * 4, px = Buffer.alloc(w * h);
  if (bpp !== 16 && bpp !== 24) throw new Error(`${f}: ${bpp} bpp`);
  for (let y = 0; y < h; y++) { const s = off + (hh > 0 ? h - 1 - y : y) * stride; for (let x = 0; x < w; x++) { let r, g, bl; if (bpp === 24) { bl = b[s + x * 3]; g = b[s + x * 3 + 1]; r = b[s + x * 3 + 2]; } else { const v = b.readUInt16LE(s + x * 2); r = Math.round(((v >> 10) & 31) * 255 / 31); g = Math.round(((v >> 5) & 31) * 255 / 31); bl = Math.round((v & 31) * 255 / 31); } px[y * w + x] = Math.round((r + g + bl) / 3); } }
  return { w, h, px };
}
// the glyph box of the first frame (51 wide): x 17..33, y 39..49, brightness above 200 is the letter
const mask = im => { let m = ""; for (let y = 39; y < Math.min(im.h, 50); y++) for (let x = 17; x < 34; x++) m += im.px[y * im.w + x] > 200 ? "1" : "0"; return m; };
const ham = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };

// The letters are not read by a reader of text: the glyph masks that three or more shipped buttons share are the templates, each named by the `key=` that most of the
// orders that use its buttons have (an order whose key is the minority of its template is what the report lists). A button whose nearest template is more than 10 pixels
// away is listed as unreadable, not guessed.
function hotkeys({ OUT }) {
  const dir = path.join(OUT, "DATA", "COMMANDS"), cmds = [];
  for (const f of fs.readdirSync(dir).filter(f => /^F.*\.XML$|^COMMUNITYMOD\.XML$/i.test(f)).sort()) {
    const t = rd(path.join(dir, f)).replace(/<!--[\s\S]*?-->/g, "");
    for (const m of t.matchAll(/<cmd\b([^>]*)>/g)) { const g = n => (m[1].match(new RegExp(`\\b${n}\\s*=\\s*"([^"]*)"`)) || [])[1]; const b = g("button"); if (b) cmds.push({ file: f, name: g("name"), key: g("key") || "", button: b, k: `ui/cmdbar/${b.replace(/\\/g, "/")}`.toLowerCase() }); }
  }
  const files = new Map(walk(path.join(OUT, "UI", "CMDBAR")).map(f => [rel(OUT, f).toLowerCase(), f]));
  const M = new Map(), skipped = [];
  const iconOf = c => files.get(c.k) || files.get(c.k.replace(/(\.[a-z0-9]+)$/, "_cm$1"));
  for (const c of cmds) { const f = iconOf(c); if (!f) { skipped.push(c); continue; } if (!M.has(f)) { const im = readBmp(f); if (im.w >= 51 && /_cm\.[a-z0-9]+$/i.test(f)) M.set(f, mask(im)); else M.set(f, null); } }
  const votes = new Map(); for (const c of cmds) { const f = iconOf(c); if (f && M.get(f)) { const v = votes.get(f) || votes.set(f, []).get(f); v.push(c.key.toLowerCase()); } }
  const byMask = new Map(); for (const [f, m] of M) if (m) (byMask.get(m) || byMask.set(m, []).get(m)).push(f);
  const tpl = [];
  for (const [m, fs_] of [...byMask].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    if (fs_.length < 3) continue; const v = {}; for (const f of fs_) for (const x of votes.get(f) || []) v[x] = (v[x] || 0) + 1;
    const best = Object.entries(v).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]; if (best && best[1] >= 2) tpl.push({ m, label: best[0] });
  }
  const rows = [], mismatch = [], unreadable = []; let ok = 0;
  for (const c of cmds) {
    const f = iconOf(c), m = f && M.get(f); if (!m) continue;
    let best = null; for (const t of tpl) { const d = ham(m, t.m); if (!best || d < best.d) best = { d, l: t.label }; }
    const row = { ...c, icon: rel(OUT, f), painted: best ? best.l : "?", dist: best ? best.d : 99 };
    if (!best || best.d > 10) unreadable.push(row); else if (best.l === c.key.toLowerCase()) ok++; else mismatch.push(row);
    rows.push(row);
  }
  return { rows, mismatch, unreadable, ok, templates: tpl.length, commands: cmds.length, noIcon: skipped.length };
}

module.exports = { discordCmdbar, shipIcons, hotkeys, readBmp, mask };
