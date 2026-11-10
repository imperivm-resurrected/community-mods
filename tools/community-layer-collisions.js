// Root against layer (community-mods#53, "Root against layer"): what the ruleset layer of community-mod-civs shares with every other port in ported/, as the content manager would see it.
//   node tools/community-layer-collisions.js [--ports=id,id] [--all]        writes raw/community-mod-civs-layer-collisions.txt
// Layer against layer is no collision (only one layer is mounted); layer against the ROOT of another package can be one, and so can the patches of both. Four kinds, per port:
//   file      the same game path as a loose file of the layer and a loose file of the other port's root (or of one of its layers): same bytes = harmless, other bytes = the load order decides
//             (and, until the engine always lets the chosen layer win, a root can beat it: the engine PR the maintainer mentioned)
//   patched   a file the layer ships whole that the other port patches: its patch runs on top of our file
//   patch     both patch the same game file: XML <set> of the same attribute of the same element (selectors compared in the engine's canonical form), a <remove>/<replace> of what the other edits, the
//             same element added twice; INI the same [section] key; script patches that cannot both be applied (both orders, with the engine's algorithm); texts the same key with another result
//   hidden    a file the layer's hidden.txt hides that the other port ships or patches
// The other ports are read from the main checkout and from this worktree (this worktree's wins). A port that has its own rulesets/ is compared layer by layer.
const fs = require("fs"), path = require("path"), cp = require("child_process"), crypto = require("crypto");
const P = require("./lib/community-patch.js"), L = require("./lib/community-layer.js"), { applyScriptPatch } = require("./lib/script-patch.js");
const ROOT = path.join(__dirname, "..");
const MAIN = (() => { try { return path.dirname(path.resolve(ROOT, cp.execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim())); } catch { return ROOT; } })();
const args = process.argv.slice(2), only = (args.find(a => a.startsWith("--ports=")) || "").slice(8).split(",").filter(Boolean), all = args.includes("--all");
const ID = "community-mod-civs", MINE = path.join(ROOT, "ported", ID), LAYER = path.join(MINE, "rulesets", L.ID);
const HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const sha = f => crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex");
// A path as the game names it (gameres/ = ui/, menuini/ = data/interface/menu/); the language of Local/<language>/x is kept (currentlang@<language>/x), and a file at currentlang/x counts for every
// language: Local/english/VOICES/X against Local/spanish/VOICES/X is no collision, against currentlang/voices/x it is.
const LANGS = ["english", "spanish", "italian"];
const norm = rel => { const p = rel.replace(/\\/g, "/").toLowerCase(), m = p.match(/^local\/([^/]+)\/(.+)$/); if (m) return [`currentlang@${m[1]}/${m[2]}`]; const g = L.gamePath(p); return g.startsWith("currentlang/") ? LANGS.map(l => `currentlang@${l}/${g.slice(12)}`) : [g]; };
const SKIP = /^(mod\.json|notes\.md|readme[^/]*|civs\/|specials\/|options\/|events\/|modes\/|rules\/|rulesets\/|loc\/|hidden\.txt|patches\/)/i;
const lc = s => String(s).toLowerCase();

// ---- what a port holds
function inventory(dir) {
  const files = new Map(), patches = new Map(), locs = new Map();                   // game path -> real path
  for (const f of L.walk(dir)) {
    if (/^rulesets\//i.test(f)) continue;
    if (/^patches\//i.test(f)) patches.set(norm(f.slice(8))[0], path.join(dir, f));
    else if (/^loc\/.+\.xml$/i.test(f)) locs.set(lc(f), path.join(dir, f));
    else if (!SKIP.test(f)) for (const k of norm(f)) files.set(k, path.join(dir, f));
  }
  return { files, patches, locs };
}
// ---- what a patch touches
const canonSel = sel => { try { const parts = []; let s = sel.trim(); const re = /(\/\/?)([^/[\]]+)((?:\[[^\]]*\])*)/y; let m; let pos = 0; while (pos < s.length) { re.lastIndex = pos; m = re.exec(s); if (!m) return lc(sel); const conds = [...m[3].matchAll(/\[([^\]]*)\]/g)].map(c => lc(c[1].trim().replace(/^@([^=\s]+)\s*=\s*(['"])(.*)\2$/, "@$1='$3'"))).sort(); parts.push(m[1] + lc(m[2]) + conds.map(c => `[${c}]`).join("")); pos = re.lastIndex; } return parts.join(""); } catch { return lc(sel); } };
const dec = v => v.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function xmlOps(text) {
  let root; try { root = P.parseXml(text); } catch { return []; }
  return root.kids.filter(k => typeof k !== "string").map(op => {
    const get = n => { const a = op.attrs.find(([k]) => lc(k) === n); return a ? dec(a[1]) : ""; };
    const kind = lc(op.tag), sel = canonSel(get("select"));
    const attrs = kind === "set" ? op.attrs.filter(([k]) => !["select", "unset", "optional"].includes(lc(k))).map(([k, v]) => [lc(k), v]).concat(get("unset").split(/\s+/).filter(Boolean).map(k => [lc(k), null])) : [];
    const added = kind === "add" || kind === "replace" ? op.kids.filter(k => typeof k !== "string").map(k => `${lc(k.tag)}:${lc(dec((k.attrs.find(([a]) => /^(id|name|class|sig|obj)$/i.test(a)) || [, ""])[1]))}`) : [];
    return { kind, sel, attrs, added };
  });
}
function iniKeys(text) {
  const out = []; let sec = "";
  for (const raw of text.replace(/\r/g, "").split("\n")) { const h = raw.match(/^\s*\[([^\]]+)\]/); if (h) { sec = lc(h[1]); continue; } const x = raw.trim(); if (!x || x[0] === ";") continue; if (x[0] === "-") { out.push({ k: `${sec}/${lc(x.slice(1).trim())}`, v: null }); continue; } if (x[0] === "+") { out.push({ k: `${sec}/+${lc(x.slice(1).trim())}`, v: "+" }); continue; } const m = x.match(/^([^=]+?)\s*=\s*(.*)$/); if (m) out.push({ k: `${sec}/${lc(m[1])}`, v: m[2].trim() }); }
  return out;
}
const readT = f => { const b = fs.readFileSync(f); try { return new TextDecoder("utf-8", { fatal: true }).decode(b); } catch { return b.toString("latin1"); } };

function comparePatch(game, mineF, theirF, out) {
  const ext = path.extname(game).toLowerCase(), a = readT(mineF), b = readT(theirF);
  if (ext === ".xml") {
    const A = xmlOps(a), B = xmlOps(b), seen = new Set();
    for (const x of A) for (const y of B) {
      if (x.kind === "set" && y.kind === "set" && x.sel === y.sel) for (const [k, v] of x.attrs) { const w = y.attrs.find(([n]) => n === k); if (w) { const key = `set ${x.sel}@${k}`; if (!seen.has(key)) { seen.add(key); out.push({ level: v === w[1] ? "same" : "CLASH", text: `${game}: both set ${x.sel} ${k} (${v === null ? "unset" : v} / ${w[1] === null ? "unset" : w[1]})` }); } } }
      if ((x.kind === "remove" || x.kind === "replace") && (y.sel === x.sel || y.sel.startsWith(x.sel + "/") || y.sel.startsWith(x.sel + "["))) { const key = `A${x.kind} ${x.sel} ${y.sel}`; if (!seen.has(key)) { seen.add(key); out.push({ level: "CLASH", text: `${game}: the layer ${x.kind}s ${x.sel}, which the other port ${y.kind === "set" ? "edits" : y.kind + "s"} (${y.sel})` }); } }
      if ((y.kind === "remove" || y.kind === "replace") && (x.sel === y.sel || x.sel.startsWith(y.sel + "/") || x.sel.startsWith(y.sel + "["))) { const key = `B${y.kind} ${y.sel} ${x.sel}`; if (!seen.has(key)) { seen.add(key); out.push({ level: "CLASH", text: `${game}: the other port ${y.kind}s ${y.sel}, which the layer ${x.kind === "set" ? "edits" : x.kind + "s"} (${x.sel})` }); } }
      if (x.kind === "add" && y.kind === "add") for (const e of x.added) if (y.added.includes(e) && !seen.has("add" + e)) { seen.add("add" + e); out.push({ level: "CLASH", text: `${game}: both add the element ${e}` }); }
    }
    if (!out.some(o => o.text.startsWith(game + ":"))) out.push({ level: "merge", text: `${game}: both patch it, no key in common` });
  } else if (ext === ".ini") {
    const A = iniKeys(a), B = iniKeys(b); let n = 0;
    for (const x of A) { const y = B.find(z => z.k === x.k); if (y) { n++; out.push({ level: x.v === y.v ? "same" : "CLASH", text: `${game}: both ${x.v === null || y.v === null ? "remove or set" : "set"} [${x.k.replace("/", "] ")} (${x.v === null ? "removed" : x.v} / ${y.v === null ? "removed" : y.v})` }); } }
    if (!n) out.push({ level: "merge", text: `${game}: both patch it, no key in common` });
  } else if (ext === ".vs") {
    const hd = path.join(HDDATA, game.replace(/^data\//, "")), base = fs.existsSync(hd) ? readT(hd) : null;
    if (!base) { out.push({ level: "merge", text: `${game}: both patch it (the game's script not found to prove it)` }); return; }
    const ab = applyScriptPatch(applyScriptPatch(base, b).text, a), ba = applyScriptPatch(applyScriptPatch(base, a).text, b);
    const bad = [...ab.errors, ...ba.errors];
    out.push({ level: bad.length ? "CLASH" : "merge", text: `${game}: both patch the script${bad.length ? ", the directives do not apply one after the other: " + bad[0] : ", the directives apply in both orders"}` });
  }
}

// ---- go
const mine = inventory(MINE);
const layerFiles = new Map(); for (const f of L.walk(LAYER)) { if (/^patches\//i.test(f)) continue; if (/^(loc\/|hidden\.txt$)/i.test(f)) continue; for (const k of norm(f)) layerFiles.set(k, path.join(LAYER, f)); }
const layerPatches = new Map(); for (const f of L.walk(path.join(LAYER, "patches"))) layerPatches.set(norm(f)[0], path.join(LAYER, "patches", f));
const layerLocs = new Map(); for (const f of L.walk(path.join(LAYER, "loc"))) layerLocs.set(lc(f), path.join(LAYER, "loc", f));
const hiddenSet = (() => { const h = path.join(LAYER, "hidden.txt"); return fs.existsSync(h) ? new Set(readT(h).replace(/\r/g, "").split("\n").map(l => l.trim()).filter(l => l && l[0] !== ";" && l[0] !== "[").map(lc)) : new Set(); })();
const ports = new Map();
for (const base of [path.join(MAIN, "ported"), path.join(ROOT, "ported")]) for (const d of fs.existsSync(base) ? fs.readdirSync(base) : []) if (d !== ID && fs.existsSync(path.join(base, d, "mod.json")) && (!only.length || only.includes(d))) ports.set(d, path.join(base, d));
const report = [`# ${ID}: rulesets/${L.ID}/ against the other ports of ported/ (tools/community-layer-collisions.js). ${layerFiles.size} loose files, ${layerPatches.size} patches, ${layerLocs.size} text patches, ${hiddenSet.size} hidden paths in the layer.`, "# CLASH = the same thing changed twice with other values (or removed and edited); same = the same bytes/value; merge = both patch the file with nothing in common.", ""];
let total = 0; const summary = [];
for (const [id, dir] of [...ports].sort((x, y) => (x[0] < y[0] ? -1 : 1))) {
  const o = inventory(dir), found = [];
  for (const [g, f] of layerFiles) {
    if (o.files.has(g)) { const same = sha(f) === sha(o.files.get(g)); found.push({ level: same ? "same" : "CLASH", text: `file ${g}: ${same ? "the same bytes" : "other bytes"} in the root of ${id}` }); }
    if (o.patches.has(g)) found.push({ level: "patched", text: `patched ${g}: the layer ships it whole, ${id} patches it` });
  }
  for (const [g, f] of layerPatches) if (o.patches.has(g)) comparePatch(g, f, o.patches.get(g), found);
  for (const [g, f] of layerPatches) if (o.files.has(g)) found.push({ level: "CLASH", text: `file ${g}: the layer patches it, ${id} ships it whole in its root` });
  for (const [k, f] of layerLocs) if (o.locs.has(k)) {
    const A = L.walk(path.dirname(f)).length ? P.locEntries(readT(f)) : new Map(), B = P.locEntries(readT(o.locs.get(k)));
    let same = 0, diff = 0; for (const [key, e] of A) { const w = B.get(key); if (w) (w.result === e.result ? same++ : diff++); }
    if (same || diff) found.push({ level: diff ? "CLASH" : "same", text: `texts ${k}: ${diff} keys with another result, ${same} the same` });
  }
  // game modes: the lobby lists a mode by its file name without the leading number, so two packs with a "SCORE LIMIT" (other numbers) show two entries of the same name
  { const modes = d => L.walk(d).filter(f => /^DATA\/GAMESCRIPTS\/[^/]+\.vs$/i.test(f)).map(f => path.basename(f, path.extname(f)));
    const theirs = modes(dir), name = m => m.replace(/^\d+\s+/, "").toLowerCase();
    for (const t of theirs) for (const m of modes(LAYER)) if (name(t) === name(m)) found.push({ level: t.toLowerCase() === m.toLowerCase() ? "CLASH" : "modes", text: `modes: "${m}" of the layer and "${t}" of ${id} are listed under the same name` }); }
  for (const h of hiddenSet) { const g = norm(h)[0]; if (o.files.has(g)) found.push({ level: "hidden", text: `hidden ${g}: the layer hides a file that the root of ${id} ships` }); else if (o.patches.has(g)) found.push({ level: "hidden", text: `hidden ${g}: the layer hides a file that ${id} patches` }); }
  const bad = found.filter(f => f.level === "CLASH"), rest = found.filter(f => f.level !== "CLASH");
  if (!found.length) continue;
  total += bad.length;
  summary.push(`${id}: ${bad.length} CLASH, ${rest.filter(r => r.level === "same").length} same, ${rest.filter(r => r.level === "merge").length} merge, ${rest.filter(r => r.level === "patched").length} patched, ${rest.filter(r => r.level === "hidden").length} hidden${rest.some(r => r.level === "modes") ? `, ${rest.filter(r => r.level === "modes").length} modes with the same name` : ""}`);
  report.push(`## ${id}`, ...bad.map(f => "  CLASH " + f.text), ...rest.filter(f => all || f.level !== "same").slice(0, all ? 1e9 : 60).map(f => `  ${f.level} ${f.text}`), "");
}
report.splice(3, 0, ...summary.map(s => "# " + s), "");
fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "raw", "community-mod-civs-layer-collisions.txt"), report.join("\n") + "\n");
console.log(summary.join("\n") || "no port shares anything with the layer");
console.log(`${ports.size} ports compared, ${total} CLASH lines (raw/community-mod-civs-layer-collisions.txt)`);
