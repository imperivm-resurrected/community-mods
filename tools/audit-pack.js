// Audit a pack of maps/adventures (a folder with .bfhp files) against everything we already have, and write a manifest:
// what each map is called in the game, who signed it (game.xml `author`), and whether it duplicates something.
//   node tools/audit-pack.js <pack folder> <out.md> [--game <game folder>] [--skip <path part>,...]
// Compared with the .bfhp in originals/ and ported/ (loose, and inside .zip/.rar/.7z with bsdtar) and in --game:
//   identical  same SHA-256
//   variant    not identical, but N% of its inner bytes (game.xml and Local/ aside) are the same files as in one of ours
//   new        neither
// A map identical to another one of the same pack is a copy ("= other file"). Needs bsdtar.
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { spawnSync } = require("child_process");
const hpfs = require("./hpfs.js");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < args.length; i++) args[i].startsWith("--") ? (opt[args[i].slice(2)] = args[++i]) : pos.push(args[i]);
const [packDir, outFile] = pos;
if (!packDir || !outFile) { console.error("usage: node tools/audit-pack.js <pack folder> <out.md> [--game <dir>] [--skip a,b]"); process.exit(1); }
const skip = (opt.skip || "").split(",").filter(Boolean);
const walk = (d, f) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, f) : f(p); } };
const sha = buf => crypto.createHash("sha256").update(buf).digest("hex");
const isMap = n => /\.bfhp$/i.test(n), isArc = n => /\.(zip|rar|7z)$/i.test(n);
const tar = (a, ...x) => spawnSync("bsdtar", [...a, ...x], { encoding: a[0] === "-xOf" ? "buffer" : "utf8", maxBuffer: 1500 * 1024 * 1024 });
const nameKey = f => path.basename(f).replace(/\.[^.]+$/, "").toLowerCase().replace(/[ _-]+(spanish|english|italian|esp|eng|ita)\b/g, "").replace(/[^a-z0-9]/g, "");
const label = p => p.replace(ROOT + path.sep, "").replace(/^.*\/Imperivm - Great Battles of Rome HD\//, "game/");

// 1. the pack
const pack = [];
walk(packDir, p => { if (isMap(p)) pack.push({ file: p, rel: path.relative(packDir, p).split(path.sep).join("/"), size: fs.statSync(p).size }); });
pack.sort((a, b) => a.rel.localeCompare(b.rel));
const attrs = buf => { // name, author, description of game.xml
  try {
    const x = hpfs(buf).find(e => /^game\.xml$/i.test(e.path)); if (!x) return {};
    const g = x.read().toString("latin1"), a = k => { const m = g.match(new RegExp(`\\s${k}="([^"]*)"`)); return m ? Buffer.from(m[1], "latin1").toString("utf8").replace(/\s+/g, " ").trim() : ""; };
    return { name: a("name"), author: a("author"), desc: a("description") };
  } catch { return {}; }
};
const inner = buf => { // inner file path -> { sha1, size }, without game.xml and the texts
  const m = new Map();
  try { for (const e of hpfs(buf)) if (!/^local\//i.test(e.path) && !/\.loc\.xml$/i.test(e.path) && !/^game\.xml$/i.test(e.path)) { const d = e.read(); m.set(e.path.toLowerCase(), { h: crypto.createHash("sha1").update(d).digest("hex"), n: d.length }); } } catch { /* not a map */ }
  return m;
};
for (const m of pack) { const buf = fs.readFileSync(m.file); m.sha = sha(buf); Object.assign(m, attrs(buf)); m.inner = inner(buf); }
const bySha = new Map(); for (const m of pack) (bySha.get(m.sha) || bySha.set(m.sha, []).get(m.sha)).push(m);

// 2. what we already have: [{ where, size, read() }]
const have = [];
const roots = ["originals", "ported", opt.game].filter(Boolean).map(r => path.resolve(ROOT, r));
const arcs = [];
for (const r of roots) if (fs.existsSync(r)) walk(r, p => {
  if (skip.some(s => p.includes(s)) || p.startsWith(path.resolve(packDir))) return;
  if (isMap(p)) have.push({ where: label(p), size: fs.statSync(p).size, read: () => fs.readFileSync(p) });
  else if (isArc(p)) arcs.push(p);
});
for (const a of arcs) for (const line of (tar(["-tvf"], a).stdout || "").split("\n")) {
  const m = line.match(/^\S+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+(?:\d+:\d+|\d{4})\s+(.*)$/);
  if (m && isMap(m[2])) have.push({ where: `${label(a)} :: ${m[2]}`, size: +m[1], read: () => tar(["-xOf"], a, m[2]).stdout });
}
console.error(`pack: ${pack.length} maps; ours: ${have.length} maps in ${arcs.length} archives and folders`);

// 3. compare
const sizes = new Set(pack.map(m => m.size)), exact = new Map();
for (const h of have) if (sizes.has(h.size)) { const s = sha(h.read()); for (const m of bySha.get(s) || []) if (m.size === h.size) (exact.get(m) || exact.set(m, []).get(m)).push(h.where); }
const cache = new Map(), innerOf = h => cache.get(h) || (cache.set(h, inner(h.read())), cache.get(h));
for (const m of pack) {
  m.same = exact.get(m) || [];
  const twin = bySha.get(m.sha).find(o => o !== m && o.rel < m.rel); if (twin) m.copyOf = twin.rel;
  if (m.same.length || m.copyOf) continue;
  let best = null;
  const total = [...m.inner.values()].reduce((a, v) => a + v.n, 0) || 1;
  for (const h of have) {
    if (h.size < m.size * 0.25 || h.size > m.size * 4) continue; // far too different in size to be an edition of it
    const c = innerOf(h); let n = 0; for (const [k, v] of m.inner) if (c.get(k)?.h === v.h) n += v.n;
    const pct = Math.round(100 * n / total); if (!best || pct > best.pct) best = { pct, where: h.where };
  }
  if (best && best.pct >= 40) m.variant = best;
  else { // same adventure in another language: the translated texts sit inside the big files, so little matches
    const k = nameKey(m.rel), h = k.length >= 8 && have.find(x => nameKey(x.where.split(" :: ").pop()) === k);
    if (h) m.variant = { pct: best ? best.pct : 0, where: h.where, byName: true };
  }
}

// 4. manifest
const verdict = m => m.copyOf ? `copy of \`${m.copyOf}\`` : m.same.length ? `identical: ${[...new Set(m.same.map(w => w.replace(/^.*(GreekMod_1\.8|greekcivilizationmod42|originals\/game-data|originals\/game-140|game\/).*$/, (_, k) => k === "game/" ? "game" : k)))].slice(0, 2).map(w => `\`${w}\``).join(", ")}` : m.variant ? `variant ${m.variant.byName ? "by name" : m.variant.pct + "%"} of \`${m.variant.where}\`` : "**new**";
const esc = s => String(s || "").replace(/\|/g, "\\|");
const action = m => m.copyOf ? "skip" : m.same.length ? (m.same.some(w => /^game\/|originals\/game-/.test(w)) ? "skip (official)" : "skip (have it)") : m.variant ? (m.variant.pct >= 98 ? "skip (same map)" : "compare") : "port";
const c = { identical: 0, copy: 0, variant: 0, new: 0 };
for (const m of pack) c[m.copyOf ? "copy" : m.same.length ? "identical" : m.variant ? "variant" : "new"]++;
const byAuthor = new Map(); for (const m of pack) { const k = m.author || "(none)"; const e = byAuthor.get(k) || byAuthor.set(k, { n: 0, port: 0, cmp: 0 }).get(k); e.n++; const a = action(m); if (a === "port") e.port++; else if (a === "compare") e.cmp++; }
const out = [`# Audit of ${path.basename(packDir)}`, "", `Generated by \`node tools/audit-pack.js\`. ${pack.length} maps: ${c.identical} identical to ones we have, ${c.copy} copies inside the pack, ${c.variant} variants, **${c.new} new**. *Action*: \`skip\` = nothing to port, \`compare\` = another edition of a map we have (check which one to keep), \`port\` = new.`, "",
  "Author and name are the ones in each map's `game.xml`: what its author typed, not checked.", "", "| File | Name in the game | Author in `game.xml` | Verdict | Action |", "|---|---|---|---|---|"];
for (const m of pack) out.push(`| \`${esc(m.rel)}\` | ${esc(m.name)} | ${esc(m.author)} | ${esc(verdict(m))} | ${action(m)} |`);
out.push("", "## By author", "", "| Author in `game.xml` | Maps | To port | To compare |", "|---|---|---|---|");
for (const [k, e] of [...byAuthor].sort((a, b) => b[1].n - a[1].n)) out.push(`| ${esc(k)} | ${e.n} | ${e.port} | ${e.cmp} |`);
fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
fs.writeFileSync(outFile, out.join("\n") + "\n");
console.log(`${outFile}: ${JSON.stringify(c)}`);
