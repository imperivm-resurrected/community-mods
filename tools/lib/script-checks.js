// Offline checks of the scripts a port generates (nothing compiles them but the game, and a script that does not compile stops for EVERY civilization when it is
// a patch of the game's own). Used by tools/asvrmod-vii.js, which stops on a problem.
//   net(text)                     { "(": n, "{": n, "[": n }: opens minus closes, with comments and strings removed
//   applyPatch(hdText, patch)     the engine's PatchScriptText (src/mods/patchxml.cpp), { text, errors }
//   checkBalance(out, src, label) the three nets of a generated script must be the ones of its source
//   classStrings(text)            the literals that name a class in Place, GetRandomHeroClass, IsHeirOf, Count, Mutate...
//   classTable({ dirs })          id (lowercase) -> { parent, entity } of every class in the folders
//   heroBaseProblem(table, base)  why GetRandomHeroClass(base) could never return (PickRandomHeroClass re-draws until a candidate HasEntity)
const fs = require("fs"), path = require("path");

const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ").replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, "''");
function net(text) {
  const s = strip(text), n = { "(": 0, "{": 0, "[": 0 };
  for (const ch of s) { if (ch === "(") n["("]++; else if (ch === ")") n["("]--; else if (ch === "{") n["{"]++; else if (ch === "}") n["{"]--; else if (ch === "[") n["["]++; else if (ch === "]") n["["]--; }
  return n;
}
const showNet = n => `(${n["("]} {${n["{"]} [${n["["]}`;
function checkBalance(out, src, label, problems) {
  const a = net(out), b = net(src);
  if (a["("] !== b["("] || a["{"] !== b["{"] || a["["] !== b["["]) problems.push(`${label}: balance ${showNet(a)} but its source has ${showNet(b)}`);
  // the shapes the rewrites once produced
  const s = strip(out);
  if (/Mod_TrueRace\(\s*[()=,]/.test(s) || /Mod_TrueRace\(\s*\)/.test(s)) problems.push(`${label}: Mod_TrueRace without an object`);
  if (/\(\s*\(\s*\)\s*==/.test(s)) problems.push(`${label}: "(() =="`);
}

// the engine's algorithm (src/mods/patchxml.cpp, PatchScriptText): the directives apply in order, the anchor is the first line that contains the text
function applyPatch(hdText, patch) {
  const errors = [], ops = [];
  const split = t => t.split("\n").map(l => l.replace(/\r$/, ""));
  for (const [i, l] of split(patch).entries()) {
    if (!l.startsWith("@")) { if (ops.length && ops[ops.length - 1].kind) ops[ops.length - 1].body.push(l); continue; }
    const m = /^@(\S*)[ \t]*(.*)$/.exec(l), word = m[1].toLowerCase(), rest = m[2].trim();
    if (word === "end") { if (ops.length) ops.push({ kind: "", body: [] }); continue; }
    if (!["top", "bottom", "before", "after", "replace"].includes(word)) { errors.push(`line ${i + 1}: the directive @${word} does not exist`); ops.push({ kind: "", body: [] }); continue; }
    if (["before", "after", "replace"].includes(word) && !rest) { errors.push(`line ${i + 1}: @${word} needs a line to look for`); ops.push({ kind: "", body: [] }); continue; }
    ops.push({ kind: word, anchor: rest, body: [], line: i + 1 });
  }
  const crlf = hdText.includes("\r\n"), eol = hdText.endsWith("\n");
  const lines = split(hdText); if (eol && lines.length && lines[lines.length - 1] === "") lines.pop();
  for (const op of ops) {
    if (!op.kind) continue;
    while (op.body.length && !op.body[op.body.length - 1].trim()) op.body.pop();
    if (!op.body.length && op.kind !== "replace") { errors.push(`line ${op.line}: @${op.kind} without code below`); continue; }
    if (op.kind === "bottom") { while (lines.length && !lines[lines.length - 1].trim()) lines.pop(); lines.push(...op.body); continue; }
    if (op.kind === "top") { lines.splice(lines.length && lines[0].trim().startsWith("//") ? 1 : 0, 0, ...op.body); continue; }
    const at = lines.findIndex(l => l.includes(op.anchor));
    if (at < 0) { errors.push(`line ${op.line}: no line of the script contains "${op.anchor}"`); continue; }
    if (op.kind === "before") lines.splice(at, 0, ...op.body); else if (op.kind === "after") lines.splice(at + 1, 0, ...op.body); else lines.splice(at, 1, ...op.body);
  }
  return { text: lines.join(crlf ? "\r\n" : "\n") + (eol ? (crlf ? "\r\n" : "\n") : ""), errors };
}

// literals that name a class: the arguments of the functions that look a class up by name (not the strings the commands' parameters carry)
const CLASS_CALL = /\b(?:Place|GetRandomHeroClass|IsHeirOf|Count|ClassPlayerObjs|GetPlayerUnits|Mutate|ObjsInSight|ObjsInRange|ObjsInCircle|ObjsInRect|CreateObject|FindClass)\s*\((?:[^()"]|"[^"]*"|\((?:[^()"]|"[^"]*")*\))*\)/;
const CLASS_FNS = /\b(Place|GetRandomHeroClass|IsHeirOf|Count|ClassPlayerObjs|GetPlayerUnits|Mutate|ObjsInSight|ObjsInRange|ObjsInCircle|ObjsInRect|CreateObject|FindClass)\s*\(/g;
function classStrings(text) {
  const s = text.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " "), out = [];
  for (let m; (m = CLASS_FNS.exec(s));) {
    let depth = 1, i = CLASS_FNS.lastIndex; const start = i;
    for (; i < s.length && depth; i++) { if (s[i] === "(") depth++; else if (s[i] === ")") depth--; }
    for (const q of s.slice(start, i).matchAll(/"([A-Za-z][A-Za-z0-9_]*)"/g)) out.push({ fn: m[1], id: q[1] });
  }
  return out;
}

function classTable(dirs) {
  const t = new Map();
  for (const d of dirs) if (d && fs.existsSync(d)) for (const f of fs.readdirSync(d)) {
    if (!/\.sc\.xml$/i.test(f)) continue;
    const x = fs.readFileSync(path.join(d, f), "latin1").replace(/<!--[\s\S]*?-->/g, ""), c = /<class\b([^>]*)>/.exec(x); if (!c) continue;
    const g = n => (new RegExp(`\\b${n}\\s*=\\s*"([^"]*)"`, "i").exec(c[1]) || [])[1];
    if (g("id")) t.set(g("id").toLowerCase(), { id: g("id"), parent: (g("parent") || "").toLowerCase(), entity: g("entity") || "" });
  }
  return t;
}
function heroBaseProblem(table, base) {
  const b = table.get(base.toLowerCase()); if (!b) return `the class ${base} does not exist`;
  const under = id => { for (let c = id, n = 0; c && n < 40; c = (table.get(c) || {}).parent, n++) if (c === base.toLowerCase()) return true; return false; };
  for (const [id, c] of table) if (c.entity && under(id)) return null;
  return `${base} has no descendant with an entity (PickRandomHeroClass would draw for ever)`;
}

// ---- ABSOLUTE checks (no comparison with any original: the mod's own scripts are sometimes broken, and 1.40's compiler tolerated what this one reports) ----------
// the text with every comment and string replaced by spaces (same length, newlines kept): positions in it are positions in the text
function mask(text) {
  let out = "", i = 0; const n = text.length;
  while (i < n) {
    const c = text[i], d = text[i + 1];
    if (c === "/" && d === "/") { while (i < n && text[i] !== "\n") { out += text[i] === "\r" ? "\r" : " "; i++; } continue; }
    if (c === "/" && d === "*") { const e = text.indexOf("*/", i + 2), end = e < 0 ? n : e + 2; out += text.slice(i, end).replace(/[^\r\n]/g, " "); i = end; continue; }
    if (c === '"' || c === "'") { let j = i + 1; while (j < n && text[j] !== c && text[j] !== "\n") j++; const end = j < n && text[j] === c ? j + 1 : j; out += c + " ".repeat(Math.max(0, end - i - 2)) + (text[end - 1] === c && end - i > 1 ? c : ""); i = end; continue; }
    out += c; i++;
  }
  return out;
}
const lineOf = (text, pos) => text.slice(0, pos).split("\n").length;
// every ")" "}" "]" that closes nothing, and what is left open at the end
function depthProblems(text) {
  const m = mask(text), pairs = { ")": "(", "}": "{", "]": "[" }, depth = { "(": 0, "{": 0, "[": 0 }, stray = [];
  for (let i = 0; i < m.length; i++) {
    const c = m[i];
    if (c === "(" || c === "{" || c === "[") depth[c]++;
    else if (pairs[c]) { if (depth[pairs[c]] === 0) stray.push({ ch: c, pos: i, line: lineOf(text, i) }); else depth[pairs[c]]--; }
  }
  return { stray, open: depth };
}
// deletes the stray "}" (and the line when nothing else is on it): what the mod's scripts have where a block's opener was removed
function removeStrayBraces(text) {
  const { stray } = depthProblems(text), at = stray.filter(s => s.ch === "}").map(s => s.pos);
  if (!at.length) return { text, removed: [] };
  let out = text; const removed = [];
  for (const pos of at.sort((a, b) => b - a)) {
    const ls = out.lastIndexOf("\n", pos - 1) + 1, le = out.indexOf("\n", pos), end = le < 0 ? out.length : le;
    const line = out.slice(ls, end); removed.push(lineOf(text, pos));
    out = line.replace(/\r$/, "").trim() === "}" ? out.slice(0, ls) + out.slice(le < 0 ? end : le + 1) : out.slice(0, pos) + out.slice(pos + 1);
  }
  return { text: out, removed: removed.reverse() };
}
// a `return ...;` that is a statement of its own (after ; { } or the start) and is followed by another statement of the same block: the engine reports
// "Code after return operator - skipped" as a compilation error. `if (x) return;` and `else return;` (the return is the body of a control) are not statements of the block.
function codeAfterReturn(text) {
  const m = mask(text), found = [], re = /\breturn\b/g;
  for (let r; (r = re.exec(m));) {
    let b = r.index - 1; while (b >= 0 && /\s/.test(m[b])) b--;
    if (b >= 0 && !/[;{}]/.test(m[b])) continue;                                   // after `)` or `else`: the body of a control
    let d = 0, i = r.index;
    for (; i < m.length; i++) { if (m[i] === "(" || m[i] === "[") d++; else if (m[i] === ")" || m[i] === "]") d--; else if (m[i] === ";" && d <= 0) break; }
    let k = i + 1; while (k < m.length && /\s/.test(m[k])) k++;
    if (k < m.length && m[k] !== "}") found.push(lineOf(text, k));
  }
  return found;
}
function checkAbsolute(text, label, problems) {
  const { stray, open } = depthProblems(text);
  for (const s of stray.slice(0, 3)) problems.push(`${label}(${s.line}): "${s.ch}" closes nothing`);
  for (const k of ["(", "{", "["]) if (open[k]) problems.push(`${label}: ${open[k]} "${k}" never closed`);
  for (const l of codeAfterReturn(text).slice(0, 3)) problems.push(`${label}(${l}): code after a return in the same block`);
}

module.exports = { mask, depthProblems, removeStrayBraces, codeAfterReturn, checkAbsolute, CLASS_CALL, strip, net, showNet, checkBalance, applyPatch, classStrings, classTable, heroBaseProblem };
