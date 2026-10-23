// A port's files at the game's own paths become patches (AGENTS.md, "Civilizations are independent": a mod never ships a whole file at a
// path the game uses). Used by tools/cgwar-independent.js and tools/greek-4-2-independent.js.
//   gameFilesToPatches({ OUT, HD, GREEK, keep })     GREEK: what is the mod's civilization's (a RegExp on the inserted text); keep: paths
//   (RegExp) that stay as they are (the menu skin)
// A file at a game path with other bytes is
//   - a script (.vs): only its insertions that match GREEK, as a patch (@after / @before / @bottom); the rest is left out
//   - items.xml, counterunits.xml, placeobjects.xml, the editor's INI lists: only what the mod added, as a patch
//   - anything else: left out (it changes the game's units, sounds or art for every civilization)
// A patch already in patches/ at that path (written by hand, in extras/) wins.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { vsPatch, xmlAdded, iniAdded } = require("./ported-patch.js");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); }   // rm first: the file may be a hard link to the pristine copy;
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };

function gameFilesToPatches({ OUT, HD, GREEK, keep, skipFiles }) {
  const report = [], patches = [], dropped = [];
  const hdByPath = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  function placeObjectsPatch(hd, mod) {
    const blocks = t => [...t.replace(/\r/g, "").matchAll(/<PlaceGameObjects\b[\s\S]*?<\/PlaceGameObjects>/g)].map(m => m[0]);
    const A = blocks(hd), B = blocks(mod), ops = [];
    if (A.length !== B.length) { report.push("placeobjects.xml: not the same blocks as the game's: left out"); return null; }
    B.forEach((b, i) => { const have = new Set(A[i].split("\n").map(l => l.trim())); for (const l of b.split("\n")) if (l.trim() && !have.has(l.trim()) && GREEK.test(l)) ops.push(`  <add select="/placeobjects/PlaceGameObjects[${i + 1}]">${l.trim()}</add>`); });
    return ops.length ? `<patch>\n${ops.join("\n")}\n</patch>\n` : null;
  }
  // counter units: the counters the mod gives the game's units against its Greek ones, and its Greek units
  function counterPatch(hd, mod) {
    const units = t => new Map([...t.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<unit\s+class\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/unit>/g)].map(m => [m[1], { text: m[0], counters: [...m[2].matchAll(/<counter\b[^>]*\/>/g)].map(c => c[0]) }]));
    const A = units(hd), B = units(mod), ops = [];
    for (const [cls, u] of B) {
      const h = A.get(cls);
      if (!h) { ops.push(`  <add select="/counterunits">\n${u.text}\n  </add>`); continue; }
      const key = c => c.replace(/\s+/g, " ").replace(/\s*coeff="[^"]*"/, ""), have = new Set(h.counters.map(key));
      const add = u.counters.filter(c => !have.has(key(c)));
      if (add.length) ops.push(`  <add select="/counterunits/unit[@class='${cls}']">${add.join("")}</add>`);
    }
    return ops.length ? `<patch>\n${ops.join("\n")}\n</patch>\n` : null;
  }
  
  
  for (const f of walk(OUT)) {
    if (/^(patches|civs|loc|local)\//i.test(f) || keep.test(f)) continue;
    const hp = hdByPath.get(f.toLowerCase()); if (!hp) continue;
    const mp = path.join(OUT, f);
    if (md5(mp) === md5(hp)) { fs.rmSync(mp); continue; }
    const dest = path.join(OUT, "patches", f), rel = f;
    if (walk(path.join(OUT, "patches")).some(x => x.toLowerCase() === `${f}`.toLowerCase())) { fs.rmSync(mp); patches.push(`${rel} (by hand, extras/)`); continue; }   // a patch written by hand wins
    let made = null;
    if (skipFiles && skipFiles.test(f)) { fs.rmSync(mp); dropped.push(rel + " (not Greek: the old trick)"); continue; }
    if (/^DATA\/(SUBAI|AI)\/[^/]+\.VS$/i.test(f)) {
      const p = vsPatch(rd(hp), rd(mp), t => GREEK.test(t), f, report);
      if (p) { wr(dest.replace(/\.VS$/i, ".vs"), p); made = "script"; }
    } else if (/^DATA\/ITEMS\.XML$/i.test(f)) {
      const r = xmlAdded(rd(hp), rd(mp), "items", report, f); if (r) { wr(dest, r.xml); made = `${r.count} items`; }
    } else if (/^DATA\/COUNTERUNITS\.XML$/i.test(f)) {
      const x = counterPatch(rd(hp), rd(mp)); if (x) { wr(dest, x); made = "counters"; }
    } else if (/^DATA\/RANDOMMAP\/PLACEOBJECTS\.XML$/i.test(f)) {
      const x = placeObjectsPatch(rd(hp), rd(mp)); if (x) { wr(dest, x); made = "objects"; }
    } else if (/^DATA\/INTERFACE\/EDITOR\/COMBO\/[^/]+\.INI$/i.test(f)) {
      const r = iniAdded(rd(hp), rd(mp)); if (r) { wr(dest, r.text); made = `${r.count} keys`; }
    }
    fs.rmSync(mp);
    if (made) patches.push(`${rel} (${made})`); else dropped.push(rel);
  }
  
  prune(OUT);
  return { report, patches, dropped };
}
module.exports = { gameFilesToPatches };
