// A local that a script declares inside a { } block and uses after the block closes (or in a block of its own): the game's compiler stops the whole script with
// "No matching function with name u" (found in game: imperivm-mod.log, `unit_capture_cae.vs (199, 10)`; the check of tools/lib/caesar-names.js did not see it because it treats
// every declaration of the script as known everywhere).
//   scopeProblems(text, types) -> [{ line, name, declaredAt }]
// The scopes are the braces; a declaration is `Type name[, name...][ = ...];` at the start of a statement with Type a type of the game's scripts (`types`: a Set of names); the
// parameters are the ones of the first line (`// void, Obj This, Obj target`). A name that some scope of the script declares, that is not declared in the scopes that are open where it is
// used, and that is not a member (`.name`) or inside a string/comment is a problem. A `for (int i...)` belongs to the block that holds the for. It does NOT see the use of a name before its
// declaration in the same block, an undeclared name that no scope declares (caesar-names.js does that), or the types of expressions.
const TYPES0 = "int float bool point rect str pstr IntArray StrArray StrMap ObjList Query ObjArray".split(" ");
function strip(text) { return text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, " ")).replace(/\/\/[^\n]*/g, m => " ".repeat(m.length)).replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, m => `"${" ".repeat(m.length - 2)}"`); }
function scopeProblems(text, types = new Set()) {
  const T = new Set([...TYPES0, ...types]), t = strip(text), problems = [];
  const first = text.split(/\r?\n/).find(l => l.trim()) || "", sig = /^\s*\/\/\s*(.*)$/.exec(first);
  const params = sig ? sig[1].split(",").slice(1).map(p => (p.trim().split(/\s+/).pop() || "").replace(/^\*/, "")).filter(x => /^[A-Za-z_]\w*$/.test(x)) : [];
  // 1. every declaration, with its scope id and the line
  const scopes = [{ id: 0, parent: -1, names: new Map(params.map(p => [p, 0])) }]; let cur = 0, line = 1;
  const declared = new Map();                                                      // name -> first line it is declared at
  const uses = [];                                                                 // { name, line, scope }
  const re = /\{|\}|\n|(?:^|(?<=[;{}(,\n]))[ \t]*([A-Za-z_]\w*)\s*\*?\s+\*?([A-Za-z_]\w*(?:\s*(?:\[[^\]]*\])?\s*(?:=(?!=)[^;,]*)?\s*,\s*[A-Za-z_]\w*)*)\s*(?:=(?!=)[^;]*)?;|\b([A-Za-z_]\w*)\b/g;
  for (let m; (m = re.exec(t));) {
    if (m[0] === "{") { scopes.push({ id: scopes.length, parent: cur, names: new Map() }); cur = scopes.length - 1; }
    else if (m[0] === "}") { if (scopes[cur].parent >= 0) cur = scopes[cur].parent; }
    else if (m[0] === "\n") line++;
    else if (m[1] && T.has(m[1])) {
      const lines = m[0].split("\n").length - 1;
      for (const n of m[2].matchAll(/(?:^|,)\s*([A-Za-z_]\w*)/g)) { scopes[cur].names.set(n[1], line); if (!declared.has(n[1])) declared.set(n[1], line); }
      line += lines;
    } else if (m[3] && t[m.index - 1] !== "." && !/^\s*\(/.test(t.slice(m.index + m[3].length, m.index + m[3].length + 2))) uses.push({ name: m[3], line, scope: cur });
    else if (m[3] && t[m.index - 1] !== "." ) uses.push({ name: m[3], line, scope: cur, call: true });
  }
  // 2. a use of a name that is declared in some scope but in none of the open ones
  const open = (scope, name) => { for (let s = scope; s >= 0; s = scopes[s].parent) if (scopes[s].names.has(name)) return true; return false; };
  const seen = new Set();
  for (const u of uses) {
    if (u.call || !declared.has(u.name) || open(u.scope, u.name) || params.includes(u.name)) continue;
    const k = `${u.name}@${u.line}`; if (seen.has(k)) continue; seen.add(k);
    problems.push({ line: u.line, name: u.name, declaredAt: declared.get(u.name) });
  }
  return problems;
}
module.exports = { scopeProblems };

// self-test: node tools/lib/caesar-scopes.js
if (require.main === module) {
  const assert = require("assert"), types = new Set(["Unit", "Obj", "Settlement"]);
  const bad = "//void, Obj This, Obj target\n\nif (target.IsValid) {\n\tUnit this;\n\tthis = This.AsUnit();\n\tif (this.IsValid) {\n\t\tUnit u;\n\t\tu = target.AsUnit();\n\t}\n}\nelse if (u.IsHeirOf(\"WildHorse\"))\n\tSleep(1);\n";
  assert.deepStrictEqual(scopeProblems(bad, types).map(p => `${p.name}:${p.line}<-${p.declaredAt}`), ["u:11<-7"]);
  const good = "//void, Obj This, Obj target\n\nUnit u;\nif (target.IsValid) {\n\tu = target.AsUnit();\n\tfor (int i = 0; i < 3; i++) Sleep(i);\n}\nelse if (u.IsValid)\n\tSleep(1);\nSleep(2);\n";
  assert.deepStrictEqual(scopeProblems(good, types), []);
  const shadow = "//void, Obj me\n\n{\n\tint n;\n\tn = 1;\n}\n{\n\tint n;\n\tn = 2;\n}\n";
  assert.deepStrictEqual(scopeProblems(shadow, types), []);
  console.log("caesar-scopes self-test ok");
}
