// Offline checks of the damage a text rewrite can do to a script, found in game on 2026-11-02 ("compilation error: (86, 10): Identifier expected after ." in outpost_idle_cm.vs):
// the rewrite of `.Units[i].IsHeirOf("CMacemen")` wrote `.(Units[i].IsHeirOf("CMacemen") || Units[i].IsHeirOf("FcaMacemen"))`: the receiver's leading dot stayed outside the parenthesis.
//   dotHits(text)                     -> [{ line, text }]  a `.` that is not followed by an identifier (nor part of a number): `.(`, `.)`, `.,`, a dot at the end of a line...
//   compare(gen, src)                 -> { lines, changed, problems: [] }  line by line against the script the copy came from: the same number of lines, and for every line that
//                                        changed, once the alternatives a rewrite adds (`|| Mod_TrueRace(x) == Fxxx`, `|| x.IsHeirOf("Fxx")`, `+ Count(p, "Fxx")`) and the strings are taken out,
//                                        the two lines are the same text (parentheses aside), and the parentheses of the line stay balanced as they were
//   scan({ OUT, HD, applyPatch, PRISTINE, pristineFor })  -> { scanned, dots: [], compared, changed, problems: [] }
// What it does NOT see: a rewrite that is wrong but well formed (the wrong class id), and scripts with no source to compare (patches of the game's: those only get the dot scan).
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const code = t => t.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " ")).replace(/\/\/[^\n]*/g, m => " ".repeat(m.length)).replace(/"[^"\n]*"/g, m => `"${" ".repeat(m.length - 2)}"`).replace(/'[^'\n]*'/g, m => `'${" ".repeat(m.length - 2)}'`);

function dotHits(text) {
  const hits = [];
  code(text).split(/\r?\n/).forEach((l, i) => {
    for (const m of l.matchAll(/\./g)) {
      const a = l[m.index - 1], b = l.slice(m.index + 1);
      if (/\d/.test(a || "") && /^\d/.test(b)) continue;          // 1.5
      if (/^\d/.test(b)) continue;                                  // .5
      if (!/^[A-Za-z_]/.test(b)) { hits.push({ line: i + 1, text: l.trim().slice(0, 120) }); break; }
    }
  });
  return hits;
}

const strip = l => l.replace(/\/\/.*$/, "").replace(/"[^"]*"/g, '""');
const net = l => (l.match(/\(/g) || []).length - (l.match(/\)/g) || []).length;
// What a rewrite adds is taken out of BOTH lines before they are compared: the strings are emptied, each IsHeirOf test becomes H, each Count becomes C, each Mod_TrueRace comparison R;
// a run of tests of one kind joined by || (or + for Count) is one; an R added after a race test goes; then the parentheses go. What is left is the text the rewrite must not touch.
const skeleton = l => {
  let s = strip(l);
  s = s.replace(/Mod_TrueRace\([^()]*\)\s*(?:==|!=)\s*\w+/g, "R").replace(/Count\([^()]*\)/g, "C").replace(/(?:[\w.\[\]]*\.)?IsHeirOf\(""\)/g, "H");
  for (let before = ""; before !== s;) { before = s; s = s.replace(/([HC])[\s()]*(?:\|\||\+)[\s()]*\1(?![\w])/g, "$1").replace(/\s*(?:\|\||&&)[\s()]*R(?![\w])/g, ""); }
  return s.replace(/[()]/g, "").replace(/\s+/g, " ").trim();
};
function compare(gen, src) {
  const G = gen.split(/\r?\n/), S = src.split(/\r?\n/), problems = []; let changed = 0;
  if (G.length !== S.length) return { lines: [G.length, S.length], changed: 0, problems: [`${G.length} lines, its source has ${S.length}`], aligned: false };
  for (let i = 0; i < G.length; i++) {
    if (G[i] === S[i]) continue; changed++;
    // a changed line that only differs in class ids inside strings is the same line once the strings are empty
    if (skeleton(G[i]) !== skeleton(S[i])) problems.push(`line ${i + 1}: ${G[i].trim().slice(0, 110)}  <=>  ${S[i].trim().slice(0, 110)}`);
    else if (net(strip(G[i])) !== net(strip(S[i]))) problems.push(`line ${i + 1}: parentheses ${net(strip(G[i]))} against ${net(strip(S[i]))}: ${G[i].trim().slice(0, 110)}`);
  }
  return { lines: [G.length, S.length], changed, problems, aligned: true };
}

// `added`: lines this build writes itself into a copy (a guard it adds), left out of the comparison
function scan({ OUT, HD, applyPatch, pristineFor, added = [] }) {
  const dots = [], problems = [], notAligned = []; let scanned = 0, compared = 0, changed = 0;
  for (const f of walk(OUT).filter(f => /\.vs$/i.test(f))) {
    const rel = path.relative(OUT, f).replace(/\\/g, "/"); let text = rd(f);
    if (/^patches\//i.test(rel)) {
      const g = path.join(HD, rel.replace(/^patches\/DATA\//i, "")), hdf = walk(HD).find(x => x.toLowerCase() === g.toLowerCase());
      if (hdf) text = applyPatch(rd(hdf), text).text; else continue;
    }
    scanned++;
    for (const h of dotHits(text)) dots.push(`${rel}: line ${h.line}: ${h.text}`);
    const m = /^DATA\/(SUBAI|ITEMSCRIPTS|ESPECIALIDADES|RANGOS|AI)\/([^/]+)$/i.exec(rel), src = m && pristineFor(m[1], m[2]);
    if (src) { const c = compare(rd(f).split(/\r?\n/).filter(l => !added.some(re => re.test(l))).join("\r\n"), rd(src)); compared++; changed += c.changed; if (!c.aligned) notAligned.push(`${rel}: ${c.problems[0]}`); for (const p of c.problems.slice(c.aligned ? 0 : 99)) problems.push(`${rel}: ${p}`); }
  }
  return { scanned, dots, compared, changed, problems, notAligned };
}
module.exports = { dotHits, compare, scan };

// self-test: node tools/lib/community-dots.js
if (require.main === module) {
  const assert = require("assert");
  assert.strictEqual(dotHits('if( .(Units[i].IsHeirOf("CMacemen") || Units[i].IsHeirOf("FcaMacemen")) && !.Units[i].AsUnit.GetCommanded ) {').length, 1);
  assert.strictEqual(dotHits('if( (.Units[i].IsHeirOf("CMacemen") || .Units[i].IsHeirOf("FcaMacemen")) && !.Units[i].AsUnit.GetCommanded ) { x = 0.5; y = .5; z = "a.(b"; } // .(\n').length, 0);
  const src = 'if( .Units[i].IsHeirOf("CMacemen") && !.Units[i].AsUnit.GetCommanded ) {\n  n = Count(p, "GArcher");\n}', good = 'if( (.Units[i].IsHeirOf("CMacemen") || .Units[i].IsHeirOf("FcaMacemen")) && !.Units[i].AsUnit.GetCommanded ) {\n  n = (Count(p, "GArcher") + Count(p, "FgaArcher"));\n}';
  assert.deepStrictEqual(compare(good, src).problems, []);
  assert(compare(good.replace("!.Units", "!Units"), src).problems.length, "a lost dot is found");
  assert(compare(good.replace("&& !.Units[i]", "&& .Units[i]"), src).problems.length, "a lost operator is found");
  const moved = good.replace("(.Units[i].IsHeirOf(\"CMacemen\") ||", ".(Units[i].IsHeirOf(\"CMacemen\") ||");
  assert(compare(moved, src).problems.length && dotHits(moved).length, "the moved dot of the bug is found by both");
  console.log("community-dots self-test ok");
}
