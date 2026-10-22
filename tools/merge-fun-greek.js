// Secuter's Fun mod (Greece version) on top of the Greek Mod 4.2, keeping both sides. The Fun mod Greece version (requires the Greek Mod)
// ships files the Greek Mod also ships; when both are active the Fun mod's copy is used, which would throw away what 4.2 changed in it.
// So its copies become the merge of both. The Greek Mod itself is not touched: with only the Greek Mod installed nothing changes.
//
//   node tools/merge-fun-greek.js <fun mod Greece folder before this step> <greek mod folder> <out folder>
//
// <fun mod Greece folder> = ported/secuter-fun-mod-grecia as tools/merge-secuter-fun.js --greek left it (HD already merged).
// Per DATA file both mods ship, a 3-way merge (git merge-file) with this base:
//   - the same file in the normal Fun mod (ported/secuter-fun-mod): the HD game's. Secuter's Fun mod is HD + his changes.
//   - a file only the Greece version has: it was made over Greek Mod 1.8 (originals/greek-mod-1.8/DATA, the unpacked data.pak and
//     zGreek.pak of the 1.8 download, row 4): what Secuter changed there. Without a 1.8 copy: the HD game's.
//   - neither: both made a file of the same name; the Greek Mod's is kept (listed in the report).
// A file Secuter did not change is left out (the Greek Mod's applies); one that comes out equal to the Greek Mod's, too.
// Conflicts (both changed the same lines): an XML line both changed is merged attribute by attribute; both added lines: both kept;
// the rest: the Fun mod's side wins, as in the rest of the Fun mod (a balance mod), and it goes in the report.
const fs = require("fs"), path = require("path"), os = require("os"), { spawnSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const [funDir, greekDir, outDir] = process.argv.slice(2);
if (!funDir || !greekDir || !outDir) { console.error("usage: node tools/merge-fun-greek.js <fun mod Greece folder> <greek mod folder> <out folder>"); process.exit(1); }
const walk = root => { const r = new Map(); if (fs.existsSync(root)) for (const f of fs.readdirSync(root, { recursive: true })) { const p = path.join(root, f); if (fs.statSync(p).isFile()) r.set(f.split(path.sep).join("/").toLowerCase(), p); } return r; };
const dataOf = d => walk(d);
const fun = walk(funDir), greek = walk(greekDir), normal = walk(path.join(ROOT, "ported/secuter-fun-mod"));
const hd = new Map([...walk(path.join(ROOT, "originals/game-data/paks")), ...walk(path.join(ROOT, "originals/game-data/DATA")).entries()].map(([k, v]) => [k.replace(/^paks\//, "").replace(/^data\//, "data/"), v]));
for (const [k, v] of walk(path.join(ROOT, "originals/game-data/DATA"))) if (!hd.has("data/" + k)) hd.set("data/" + k, v);
const g18 = new Map([...walk(path.join(ROOT, "originals/greek-mod-1.8/DATA")).entries()].map(([k, v]) => ["data/" + k, v]));
const rd = p => fs.readFileSync(p, "latin1");
const lf = s => s.replace(/\r\n/g, "\n");
const same = (a, b) => lf(rd(a)) === lf(rd(b));
const bin = p => /\.(bmp|wav|pak|avi)$/i.test(p);

// <tag a="1" b="2"/> on one line: attribute by attribute; null if a line is anything else
const TAG = /^(\s*)<([\w-]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>(.*)$/;
const attrs = s => [...s.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]);
const mergeLine = (f, b, g) => {
  if (f === g) return f;
  if (f === b) return g;
  if (g === b) return f;
  const [mf, mb, mg] = [f, b, g].map(l => TAG.exec(l));
  if (!mf || !mb || !mg || mf[2] !== mb[2] || mg[2] !== mb[2]) return null;
  const [af, ab, ag] = [mf[3], mb[3], mg[3]].map(s => new Map(attrs(s)));
  const out = new Map();
  for (const k of new Set([...ab.keys(), ...ag.keys(), ...af.keys()])) {
    const [vb, vg, vf] = [ab.get(k), ag.get(k), af.get(k)];
    const v = vf !== vb ? vf : vg; // the Fun mod's change wins over the Greek Mod's on the same attribute
    if (v !== undefined) out.set(k, v);
  }
  return `${mf[1]}<${mf[2]}${[...out].map(([k, v]) => ` ${k}="${v}"`).join("")}${mf[4]}>${mf[5] !== mb[5] ? mf[5] : mg[5]}`;
};
// What a side did to the base lines of a conflict: per base line the lines that replace it ([] = deleted), and the lines inserted
// before each base line (ins[n] = after the last), by longest common subsequence. A block of changed lines of equal size on both
// sides is a line-by-line replacement; otherwise the base lines are deleted and the new ones inserted before them.
const edits = (b, s) => {
  const n = b.length, m = s.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = b[i] === s[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const rep = b.map(l => [l]), ins = Array.from({ length: n + 1 }, () => []);
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && b[i] === s[j]) { i++; j++; continue; }
    const i0 = i, j0 = j;
    while ((i < n || j < m) && !(i < n && j < m && b[i] === s[j])) { if (j >= m || (i < n && L[i + 1][j] >= L[i][j + 1])) i++; else j++; }
    if (i - i0 === j - j0) for (let k = 0; k < i - i0; k++) rep[i0 + k] = [s[j0 + k]];
    else { for (let k = i0; k < i; k++) rep[k] = []; ins[i0].push(...s.slice(j0, j)); }
  }
  return { rep, ins };
};
// well-formed enough for the game's XML: tags close in order, no attribute twice on a tag
const wellFormed = text => {
  const stack = [];
  for (const m of text.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<(\/?)([\w:.-]+)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g)) {
    if (m[1]) { if (stack.pop() !== m[2]) return false; continue; }
    const names = [...m[3].matchAll(/([\w:.-]+)\s*=\s*(?:"[^"]*"|'[^']*')/g)].map(a => a[1]);
    if (new Set(names).size !== names.length) return false;
    if (!m[4]) stack.push(m[2]);
  }
  return stack.length === 0;
};
let MODE = "smart"; // "attr": only attribute-by-attribute on lines both changed in place; "fun": the Fun mod's side takes the whole conflict
const decide = (f, b, g, notes) => { // f, b, g: arrays of lines of one conflict
  if (f.join("\n") === g.join("\n")) return f;
  if (MODE === "fun") { notes.push("the Fun mod's side"); return f; }
  if (MODE === "attr") {
    if (f.length === b.length && g.length === b.length) { const m = b.map((_, i) => mergeLine(f[i], b[i], g[i])); if (m.every(l => l !== null)) return m; }
    notes.push("the Fun mod's side"); return f;
  }
  const [ef, eg] = [edits(b, f), edits(b, g)], out = [];
  let lost = false;
  const add = (a, c) => { const seen = new Set(a.map(l => l.trim())); return [...a, ...c.filter(l => !seen.has(l.trim()))]; };
  for (let i = 0; i <= b.length; i++) {
    const [x, y] = [ef.ins[i], eg.ins[i]];
    if (x.length && y.length && x.join("\n") !== y.join("\n")) notes.push("both added: both kept");
    out.push(...add(x, y));
    if (i === b.length) break;
    const [rf, rg] = [ef.rep[i], eg.rep[i]], same1 = (p, q) => p.length === q.length && p.every((l, k) => l === q[k]);
    if (same1(rf, [b[i]])) out.push(...rg);
    else if (same1(rg, [b[i]]) || same1(rf, rg)) out.push(...rf);
    else if (rf.length === 1 && rg.length === 1 && mergeLine(rf[0], b[i], rg[0]) !== null) out.push(mergeLine(rf[0], b[i], rg[0]));
    else { out.push(...rf); lost = true; }
  }
  if (lost) notes.push("the Fun mod's side");
  return out;
};

const merge3 = (rel, base, notes) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mfg-"));
  fs.writeFileSync(path.join(tmp, "f"), lf(rd(fun.get(rel))), "latin1");
  fs.writeFileSync(path.join(tmp, "b"), lf(rd(base)), "latin1");
  fs.writeFileSync(path.join(tmp, "g"), lf(rd(greek.get(rel))), "latin1");
  const r = spawnSync("git", ["merge-file", "-p", "--diff3", "-L", "fun", "-L", "base", "-L", "greek", path.join(tmp, "f"), path.join(tmp, "b"), path.join(tmp, "g")], { encoding: "latin1", maxBuffer: 1 << 28 });
  fs.rmSync(tmp, { recursive: true, force: true });
  const split = s => s === "" ? [] : s.replace(/\n$/, "").split("\n");
  return r.stdout.replace(/<<<<<<< fun\n([\s\S]*?)\|\|\|\|\|\|\| base\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> greek\n/g,
    (_m, f, b, g) => decide(split(f), split(b), split(g), notes).join("\n") + "\n");
};

const DECL = /^\s*(?:int|str|bool|point|Obj|ObjList|Settlement|Building|Unit|StrArray|IntArray|Hero|GAIKA|Squad|Item|Player|float)\s+([\w\s,\[\]="]+?);/gm;
const declared = s => { const r = new Set(); for (const m of s.matchAll(DECL)) for (const n of m[1].split(",")) { const x = /^\s*(\w+)/.exec(n); if (x) r.add(x[1]); } return r; };
const code = s => s.replace(/\/\/.*/g, "").replace(/"(\\.|[^"\\])*"/g, " ");
const lostDecls = (merged, sources) => {
  const have = declared(merged), body = code(merged);
  return [...new Set(sources.flatMap(s => [...declared(s)]))].filter(n => !have.has(n) && new RegExp(`\\b${n}\\b`).test(body));
};
fs.mkdirSync(outDir, { recursive: true });
fs.cpSync(funDir, outDir, { recursive: true });
const report = [], stats = { kept: 0, dropped: 0, merged: 0, greek: 0 };
const outPath = rel => path.join(outDir, ...fun.get(rel).slice(path.resolve(funDir).length + 1).split(path.sep));
for (const rel of [...fun.keys()].sort()) {
  if (!greek.has(rel) || rel === "mod.json") { stats.kept++; continue; }
  const drop = why => { fs.rmSync(outPath(rel)); stats.dropped++; report.push(`- \`${rel}\`: ${why}`); };
  if (same(fun.get(rel), greek.get(rel))) { drop("identical to the Greek Mod's, left out"); continue; }
  if (bin(rel)) { drop("a picture both ship, different: the Greek Mod's is used"); continue; }
  const rest = rel.replace(/^data\//, "");
  const inNormal = normal.has(rel) && same(fun.get(rel), normal.get(rel));
  const base = inNormal ? hd.get(rel) : (g18.get(rel) || hd.get(rel));
  const baseName = inNormal ? "HD" : g18.has(rel) ? "Greek Mod 1.8" : hd.has(rel) ? "HD" : "none";
  if (!base) { drop("both made a file of this name (no base): the Greek Mod's is used, check it keeps what Secuter's did"); continue; }
  if (same(fun.get(rel), base)) { drop(`Secuter did not change it (base ${baseName}): the Greek Mod's applies`); continue; }
  if (same(greek.get(rel), base)) { stats.kept++; continue; } // only Secuter changed it
  const notes = [];
  const isXml = /\.xml$/i.test(rel), isIni = /\.ini$/i.test(rel);
  MODE = isXml || isIni ? "smart" : "fun"; // scripts are not mixed line by line: a wrong mix still looks fine
  let text = merge3(rel, base, notes);
  for (const mode of isXml && !wellFormed(text) ? ["attr", "fun"] : []) {
    notes.length = 0; MODE = mode; text = merge3(rel, base, notes); notes.push(`(${mode})`);
    if (wellFormed(text)) break;
  }
  if (isXml && !wellFormed(text)) { stats.kept++; report.push(`- \`${rel}\`: **not merged** (no merge came out as valid XML): the Fun mod's file kept as it was`); continue; }
  // scripts declare their variables at the top and a line-level mix can lose one ("No matching function with name gold" when the
  // game compiles it): a merged script has to declare every name either side declares and uses, else the Fun mod's file is kept whole
  if (/\.vs$/i.test(rel)) {
    const lost = lostDecls(text, [rd(fun.get(rel)), rd(greek.get(rel))]);
    if (lost.length) { stats.kept++; report.push(`- \`${rel}\`: **not merged** (the merge lost the declaration of ${lost.slice(0, 4).join(", ")}): the Fun mod's file kept as it was, the Greek Mod 4.2's changes in it are not applied`); continue; }
  }
  const eol = rd(fun.get(rel)).includes("\r\n") ? "\r\n" : "\n";
  if (text === lf(rd(greek.get(rel)))) { drop("the merge is the Greek Mod's: left out"); continue; }
  fs.writeFileSync(outPath(rel), text.replace(/\n/g, eol), "latin1");
  stats.merged++;
  const count = n => notes.filter(x => x === n).length;
  if (notes.length) report.push(`- \`${rel}\` (base ${baseName}): ${count("both added: both kept")} added by both and kept, ${count("the Fun mod's side")} conflicts where the Fun mod's side won${notes.includes("(fun)") ? " (the Fun mod's side for every conflict: no finer merge was valid XML)" : notes.includes("(attr)") ? " (attribute by attribute only: the line-level mix was not valid XML)" : ""}`);
  void rest;
}
// Fixes the game's script compiler needs and the Fun mod's scripts (made for 1.40 and the Greek Mod 1.8) don't meet:
// - TS_CarthageTactic2.vs has a stray ')' in a while condition (also in the normal Fun mod)
// - a script that uses `Greece` without declaring it: in 1.8 the engine had it; 4.2's own scripts declare `int Greece;` and
//   `Greece = ImperialRome;` ("Greece's race is the old Imperial Rome") before using it
for (const f of fs.readdirSync(outDir, { recursive: true }).filter(f => /\.vs$/i.test(f))) {
  const p = path.join(outDir, f);
  let s = rd(p);
  const eol = s.includes("\r\n") ? "\r\n" : "\n";
  let t = s;
  if (/TS_CarthageTactic2\.vs$/i.test(f)) t = t.replace(/(while \(!bSpoilsOfWar \|\| !bPeoplesAssembly \|\| !bCHeroLevel8\))\)/, "$1");
  if (/\bGreece\b/.test(code(t)) && !/\bint\s+[^;]*\bGreece\b/.test(t)) {
    const lines = t.split(/\r?\n/);
    let last = -1, first = -1;
    for (let i = 1; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l || l.startsWith("//")) continue;
      if (/^(int|str|bool|point|Obj|ObjList|Settlement|Building|Unit|StrArray|IntArray|Hero|GAIKA|Squad|Item|Player|float)\b[^(]*;/.test(l)) last = i; else { first = i; break; }
    }
    if (first > 0) {
      lines.splice(first, 0, "// Greece: the old Imperial Rome", "Greece = ImperialRome;", "");
      lines.splice(last + 1, 0, "int Greece;");
      t = lines.join(eol);
      report.push(`- \`${f.toLowerCase().replace(/\\/g, "/")}\`: uses \`Greece\` without declaring it, \`int Greece; Greece = ImperialRome;\` added like the Greek Mod's scripts`);
    }
  }
  if (t !== s) fs.writeFileSync(p, t, "latin1");
}
const md = `# Fun mod Greece version over Greek Mod 4.2

Generated by \`tools/merge-fun-greek.js\`. ${stats.merged} files merged, ${stats.dropped} left out of the Fun mod, ${stats.kept} as they were. Files with conflicts or no base:

${report.join("\n")}
`;
fs.mkdirSync(path.join(ROOT, "raw/port-140"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "raw/port-140/secuter-fun-mod-grecia-over-greek-4.2.md"), md);
console.log(JSON.stringify(stats));
