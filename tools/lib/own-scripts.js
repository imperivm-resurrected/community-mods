// The mod's versions of the game's behavior scripts (data/subai/*.vs), as scripts of the port's civilizations only.
// A civilization mod must not change the game's scripts for everybody (AGENTS.md), but its civilizations (the clones of the game's, and the new
// ones) did play with the mod's versions: barrack_train.vs, hero_attack.vs, druid_learn.vs... Here each one is copied under a name of its own
// (<name>_<tag>.vs) and only the port's classes and commands point to the copy; the game's script, and so every other civilization, stays as it is.
//   ownScripts({ OUT, HD, tag, skip })  ->  { copied: [{ from, to, users }], skipped: [{ name, why }], problems: [] }
// OUT is the port, with the mod's scripts still at the game's paths (before tools/lib/independent.js takes them out); HD is the game's paks folder.
// What is copied: the scripts the port's classes and commands name (method vs=, verify=, onfinish=, behavior script=, groupverifier=...), and the ones
// those scripts start (StartPlayerScript("x.vs")), when the mod's bytes differ from the game's. What is not: the scripts that choose a branch of a
// civilization or read the old engine's sentinel (`skip`): each branch is a civilization now and those choices are not ported.
// A script that does read the branch flags (`EnvReadString(settlement, "ChooseXxx") == "researched"`) is still copied: the flags are written into the copy
// as true or false at build time, which is what the branch is in each civilization (nothing is chosen at run time). `civs` lists the civilizations whose
// copy differs from the rest: { id, match: RegExp on the basename of the class or command file, flags: {ChooseXxx: true}, subst: [[RegExp, text]] } (subst:
// ids written as text in the script that are the civilization's own classes or researches; `scripts` { "name.vs": [[RegExp, text]] } the same for one script,
// which is then copied once per civilization too); every other civilization gets the copy with all flags false.
// Then the script must have no flag left that is read (a dynamic one, `EnvReadString(x, subFac)`, goes through `dynamic`).
const fs = require("fs"), path = require("path");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };   // rm first: the file may be a hard link to the pristine copy
const REF = /(data[\\/]subai[\\/])([^"'\s]+?\.vs)\b/gi;

const FLAG = /EnvReadString\s*\(\s*[^,()]+,\s*"(Choose\w+)"\s*\)\s*(==|!=)\s*"researched"/g;
const LEFT = /EnvReadString\s*\([^)]*Choose\w+|\bnLobbyBranch|rand\(\s*776|CmdEnable\(\s*"Choose|CmdDisable\(\s*"Choose|EnvWriteString\s*\([^)]*Choose/;

// Class ids written as text (`Place("EPriest", ...)`, `.class == "GArcher"`) are the game's or the mod's old ids. A civilization of `civs` with a `letter` gets its
// own: the script is copied once for it when its text changes, with each literal that is a known class id (`from`: the letters of the ids it was cloned from)
// written as the clone has it (`EPriest` -> `1Priest`) when that class exists in the port. `modClasses` is a folder with the mod's own classes (their ids count as known).
const classIds = d => { const out = new Set(); if (d && fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (/\.sc\.xml$/i.test(f)) { const m = /<class\b[^>]*?\bid\s*=\s*"([^"]+)"/.exec(fs.readFileSync(path.join(d, f), "latin1")); if (m) out.add(m[1]); } return out; };

module.exports = function ownScripts({ OUT, HD, tag, skip, civs = [], dynamic = [], modClasses }) {
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
  // which ones are copied; a script that reads the branch flags gets one copy per civilization of `civs` that uses it, and one for all the others
  const rename = new Map();                                                     // lowercase old name -> { def, per: Map(civ id -> new name) }
  const civOf = base => civs.find(c => c.match.test(base));
  const portIds = new Map([...classIds(dir(OUT, "DATA/CLASSES"))].map(i => [i.toLowerCase(), i]));
  const known = new Set([...classIds(dir(HD, "DATA/CLASSES")), ...classIds(modClasses)].map(i => i.toLowerCase()));
  const classOf = (x, civ) => {
    const lx = x.toLowerCase(); if (!known.has(lx) || portIds.has(lx)) return x;
    for (const c of [...(civ.from.includes(x[0]) ? [civ.letter + x.slice(1)] : []), civ.letter + x]) if (portIds.has(c.toLowerCase())) return portIds.get(c.toLowerCase());
    return x;
  };
  const resolve = (text, civ, name = "", branchy = false) => {
    let t = text.replace(FLAG, (_m, name, op) => ((civ && civ.flags && civ.flags[name] === true) === (op === "==")) ? "true" : "false");
    for (const d of dynamic) t = t.replace(d, "false");
    for (const [re, to] of [...(branchy && civ && civ.subst || []), ...((civ && civ.scripts && civ.scripts[name.toLowerCase()]) || [])]) t = t.replace(re, to);
    if (civ && civ.letter) t = t.replace(/"([A-Za-z0-9_]+)"/g, (m, x) => { const y = classOf(x, civ); return y === x ? m : `"${y}"`; });
    return t;
  };
  const jobs = [];                                                              // { from, to, civ }
  for (const [k, w] of wanted) {
    if (!differs(w.name)) continue;
    const t = rd(mine(w.name)), stem = w.name.replace(/\.vs$/i, ""), ext = w.name.slice(stem.length);
    const branchy = skip.test(t) || civs.some(c => c.scripts && c.scripts[w.name.toLowerCase()]);
    if (branchy && LEFT.test(resolve(t, null, w.name, true).replace(/\/\/[^\n]*/g, ""))) { result.skipped.push({ name: w.name, why: "reads the branch in a way that is not a flag" }); continue; }
    const per = new Map(), base = resolve(t, null, w.name, branchy), used = [...w.users].map(civOf).filter(c => c && resolve(t, c, w.name, branchy) !== base);   // a civilization with the same text as the rest shares the copy
    for (const c of new Set(used)) per.set(c.id, `${stem}_${tag}_${c.id}${ext}`);
    rename.set(k, { def: `${stem}_${tag}${ext}`, per });
    jobs.push({ from: w.name, to: `${stem}_${tag}${ext}`, civ: null, users: [...w.users], branchy });
    for (const c of new Set(used)) jobs.push({ from: w.name, to: per.get(c.id), civ: c, users: [...w.users].filter(u => civOf(u) === c), branchy });
  }
  for (const j of jobs) result.copied.push({ from: j.from, to: j.to, users: j.users, ...(j.civ ? { civ: j.civ.id } : {}) });
  if (!rename.size) return result;
  const target = (n, civ) => { const r = rename.get(n.toLowerCase()); return r ? ((civ && r.per.get(civ.id)) || r.def) : null; };
  const swap = (text, civ) => text.replace(REF, (m, pre, n) => target(n, civ) ? pre + target(n, civ) : m).replace(bare, (m, n) => target(n, civ) ? m.replace(n, target(n, civ)) : m);
  for (const j of jobs) { const t = rd(mine(j.from)); wr(path.join(SUB, j.to), swap(resolve(t, j.civ, j.from, j.branchy), j.civ)); }
  for (const f of users) { const t = rd(f), c = civOf(path.basename(f)), n = t.replace(REF, (m, pre, name) => target(name, c) ? pre + target(name, c) : m); if (n !== t) wr(f, n); }
  return result;
};
