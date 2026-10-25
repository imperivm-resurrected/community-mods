// The mod's versions of the game's behavior scripts (data/subai/*.vs), as scripts of the port's civilizations only.
// A civilization mod must not change the game's scripts for everybody (AGENTS.md), but its civilizations (the clones of the game's, and the new
// ones) did play with the mod's versions: barrack_train.vs, hero_attack.vs, druid_learn.vs... Here each one is copied under a name of its own
// (<name>_<tag>.vs) and only the port's classes and commands point to the copy; the game's script, and so every other civilization, stays as it is.
//   ownScripts({ OUT, HD, tag, skip })  ->  { copied: [{ from, to, users }], skipped: [{ name, why }], problems: [] }
// OUT is the port, with the mod's scripts still at the game's paths (before tools/lib/independent.js takes them out); HD is the game's paks folder.
// What is copied: the scripts the port's classes and commands name (method vs=, verify=, onfinish=, behavior script=, groupverifier=...), and the ones
// those scripts start (StartPlayerScript("x.vs")), when the mod's bytes differ from the game's. What is not: the scripts that choose a branch of a
// civilization or read the old engine's sentinel (`skip`): each branch is a civilization now and those choices are not ported.
const fs = require("fs"), path = require("path");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };   // rm first: the file may be a hard link to the pristine copy
const REF = /(data[\\/]subai[\\/])([^"'\s]+?\.vs)\b/gi;

module.exports = function ownScripts({ OUT, HD, tag, skip }) {
  const dir = (base, rel) => { let p = base; for (const part of rel.split("/")) { const n = ci(p, part); if (!n) return null; p = path.join(p, n); } return p; };
  const SUB = dir(OUT, "DATA/SUBAI"), HDSUB = dir(HD, "DATA/SUBAI");
  const result = { copied: [], skipped: [], problems: [] };
  if (!SUB || !HDSUB) return result;
  // the files of the port that name scripts: its classes and the commands it owns (the patches of the game's commands are the game's)
  const users = [];
  for (const d of ["DATA/CLASSES", "DATA/COMMANDS"]) { const p = dir(OUT, d); if (p) for (const f of fs.readdirSync(p, { withFileTypes: true })) if (f.isFile() && /\.xml$/i.test(f.name)) users.push(path.join(p, f.name)); }
  const mine = n => { const f = ci(SUB, n); return f && path.join(SUB, f); };
  const differs = n => { const m = mine(n), h = ci(HDSUB, n); return !!(m && h && !fs.readFileSync(m).equals(fs.readFileSync(path.join(HDSUB, h)))); };
  const wanted = new Map();                                                     // lowercase name -> { name, users }
  const want = (n, by) => { const k = n.toLowerCase(); if (!wanted.has(k)) wanted.set(k, { name: n, users: new Set() }); wanted.get(k).users.add(by); };
  for (const f of users) for (const m of rd(f).matchAll(REF)) want(m[2], path.basename(f));
  // the scripts they start: the closure
  const bare = /["']([^"'\s\\/]+\.vs)["']/gi;
  for (let grew = true; grew;) {
    grew = false;
    for (const w of [...wanted.values()]) {
      if (w.seen) continue; w.seen = true;
      if (!differs(w.name)) continue;
      const t = rd(mine(w.name));
      for (const m of t.matchAll(REF)) if (!wanted.has(m[2].toLowerCase())) { want(m[2], w.name); grew = true; }
      for (const m of t.matchAll(bare)) if (mine(m[1]) && !wanted.has(m[1].toLowerCase())) { want(m[1], w.name); grew = true; }
    }
  }
  // which ones are copied
  const rename = new Map();                                                     // lowercase old name -> new name
  for (const [k, w] of wanted) {
    if (!differs(w.name)) continue;
    const t = rd(mine(w.name)), why = skip.test(t) ? "branch choice or old-engine sentinel" : null;
    if (why) { result.skipped.push({ name: w.name, why }); continue; }
    const stem = w.name.replace(/\.vs$/i, ""), to = `${stem}_${tag}${w.name.slice(stem.length)}`;
    rename.set(k, to);
    result.copied.push({ from: w.name, to, users: [...w.users] });
  }
  if (!rename.size) return result;
  const swap = text => text.replace(REF, (m, pre, n) => rename.has(n.toLowerCase()) ? pre + rename.get(n.toLowerCase()) : m)
    .replace(bare, (m, n) => rename.has(n.toLowerCase()) ? m.replace(n, rename.get(n.toLowerCase())) : m);
  for (const c of result.copied) wr(path.join(SUB, c.to), swap(rd(mine(c.from))));
  for (const f of users) { const t = rd(f), n = t.replace(REF, (m, pre, name) => rename.has(name.toLowerCase()) ? pre + rename.get(name.toLowerCase()) : m); if (n !== t) wr(f, n); }
  return result;
};
