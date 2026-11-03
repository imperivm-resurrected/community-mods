// Offline check: a script uses `This` (or the object it hands to Mod_TrueRace / Mod_PlayerCiv) that it never declares.
// Found in game on 2026-11-02 (Logs: "compilation error: (251, 52): No matching function with name This" for antic_cm.vs and verify_research_cm.vs): the group VERIFIERS
// (`//bool, ObjList objs, str OUT reasonText`) have no `This` parameter, they declare `Building this;` and assign it from objs[0]; the transformer wrote
// `Mod_TrueRace(This)` for the omitted receiver of `.race`, which only compiles in a script with an `Obj This` parameter. tools/lib/names (the names check) saw `This` as a
// known name, so it did not stop the build.
//   undeclared({ text, header })       -> [identifier]   the names handed to Mod_TrueRace / Mod_PlayerCiv, and any bare `This`, that are not a parameter or a local of the script
//   scan({ OUT, HD, applyPatch })      -> { scanned, hits: ["file: line"] }  every .vs of the port; a patch of a game script is applied to the game's script first (its `This` is the game's)
// What it does NOT see: the type of the object, a member (`x.This`), a declaration in a branch that is not reached.
const fs = require("fs"), path = require("path");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ").replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, "''");
const rd = f => fs.readFileSync(f, "latin1");

function declaredNames(text) {
  const first = text.split(/\r?\n/).find(l => l.trim()) || "", names = new Set();
  if (/^\s*\/\//.test(first)) for (const p of first.replace(/^\s*\/\/\s*/, "").split(",").slice(1)) { const w = p.trim().split(/\s+/).pop().replace(/^\*/, ""); if (/^[A-Za-z_]\w*$/.test(w)) names.add(w); }
  // locals: `Type a, b = x;`  `Type *p`  `for (int i`
  for (const m of strip(text).matchAll(/(?:^|[;{}(]|\bfor\s*\()\s*([A-Za-z_]\w*)\s*\*?\s*([A-Za-z_]\w*(?:\s*(?:\[[^\]]*\])?\s*(?:=[^;,]*)?\s*,\s*[A-Za-z_]\w*)*)\s*(?==|;|,|\[)/g)) {
    if (/^(return|else|if|while|new)$/.test(m[1])) continue;
    for (const n of m[2].matchAll(/(?:^|,)\s*([A-Za-z_]\w*)/g)) names.add(n[1]);
  }
  return names;
}
function undeclared({ text }) {
  const names = declaredNames(text), code = strip(text), out = new Set();
  if (/(?<![\w.])This\b/.test(code) && !names.has("This")) out.add("This");
  for (const m of code.matchAll(/\b(?:Mod_TrueRace|Mod_PlayerCiv)\s*\(\s*([A-Za-z_]\w*)\s*[,)]/g)) if (!names.has(m[1]) && !/^(AIGetPlayer|GetCentralBuilding)$/.test(m[1])) out.add(m[1]);
  return [...out];
}
function scan({ OUT, HD, applyPatch }) {
  const hits = []; let scanned = 0;
  for (const f of walk(OUT).filter(f => /\.vs$/i.test(f))) {
    const rel = path.relative(OUT, f).replace(/\\/g, "/"); let text = rd(f);
    if (/^patches\//i.test(rel)) {
      const g = path.join(HD, rel.replace(/^patches\/DATA\//i, ""));   // HD: the game's DATA folder
      const hdf = walk(HD).find(x => x.toLowerCase() === g.toLowerCase());
      if (!hdf) { hits.push(`${rel}: the game has no such script`); continue; }
      text = applyPatch(rd(hdf), text).text;
    }
    scanned++;
    for (const id of undeclared({ text })) {
      const line = text.split(/\r?\n/).findIndex(l => new RegExp(`(?<![\\w.])${id}\\b`).test(l.replace(/\/\/.*$/, ""))) + 1;
      hits.push(`${rel}: line ${line}: "${id}" is used and never declared`);
    }
  }
  return { scanned, hits };
}
module.exports = { undeclared, scan };

// self-test: node tools/lib/community-this.js
if (require.main === module) {
  const assert = require("assert");
  assert.deepStrictEqual(undeclared({ text: "//bool, ObjList objs, str OUT reasonText\nBuilding this;\nthis = objs[0].AsBuilding();\nif ((.race==Carthage || Mod_TrueRace(This) == Fcarthage)) return true;\n" }), ["This"]);
  assert.deepStrictEqual(undeclared({ text: "//bool, ObjList objs, str OUT reasonText\nBuilding this;\nthis = objs[0].AsBuilding();\nif ((.race==Carthage || Mod_TrueRace(this) == Fcarthage)) return true;\n" }), []);
  assert.deepStrictEqual(undeclared({ text: "// void, Obj This\nif (Mod_TrueRace(This) == Fgaul) return;\n" }), []);
  assert.deepStrictEqual(undeclared({ text: "// void, Obj owner\nif (Mod_TrueRace(owner) == Fgaul || Mod_TrueRace(x) == Fgaul) return;\n// This in a comment\n" }), ["x"]);
  console.log("community-this self-test ok");
}
