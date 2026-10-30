// The engine's script patch (src/mods/patchxml.cpp, PatchScriptText) in JavaScript, so that a build can prove what a patch does to the game's script
// without running the game: the same directives (@top, @bottom, @before, @after, @replace, @end), the same anchor (the FIRST line that contains the text),
// the same body (the lines below, trailing blank ones dropped; a directive with no code below is an error, except @replace).
//   applyScriptPatch(scriptText, patchText) -> { text, errors }
// The same function as tools/oggetti-in-tutte-le-strutture.js's applyVs (branch nuclear-oggetti-37-38), with the engine's @top, @end and the error cases.
const split = t => t.replace(/\r/g, "").split("\n");

function applyScriptPatch(data, patch) {
  const errors = [], ops = [];
  split(patch).forEach((l, i) => {
    if (!l || l[0] !== "@") { if (ops.length && ops[ops.length - 1].kind) ops[ops.length - 1].body.push(l); return; }
    const sp = l.search(/[ \t]/), word = l.slice(1, sp < 0 ? undefined : sp), rest = sp < 0 ? "" : l.slice(sp).trim();
    if (word === "end") { if (ops.length) ops.push({ kind: "", anchor: "", body: [], line: i + 1 }); return; }
    if (!["top", "bottom", "before", "after", "replace"].includes(word)) { errors.push(`line ${i + 1}: the directive @${word} does not exist`); ops.push({ kind: "", anchor: "", body: [], line: i + 1 }); return; }
    if (["before", "after", "replace"].includes(word) && !rest) { errors.push(`line ${i + 1}: @${word} needs the text of the line to look for`); ops.push({ kind: "", anchor: "", body: [], line: i + 1 }); return; }
    ops.push({ kind: word, anchor: rest, body: [], line: i + 1 });
  });
  const lines = split(data);
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  for (const op of ops) {
    if (!op.kind) continue;
    while (op.body.length && !op.body[op.body.length - 1].trim()) op.body.pop();
    if (!op.body.length && op.kind !== "replace") { errors.push(`line ${op.line}: @${op.kind} without code below`); continue; }
    if (op.kind === "bottom") { while (lines.length && !lines[lines.length - 1].trim()) lines.pop(); lines.push(...op.body); continue; }
    if (op.kind === "top") { lines.splice(lines.length && lines[0].trim().startsWith("//") ? 1 : 0, 0, ...op.body); continue; }
    const i = lines.findIndex(x => x.includes(op.anchor));
    if (i < 0) { errors.push(`line ${op.line}: no line of the script contains "${op.anchor}"`); continue; }
    if (op.kind === "before") lines.splice(i, 0, ...op.body); else if (op.kind === "after") lines.splice(i + 1, 0, ...op.body); else lines.splice(i, 1, ...op.body);
  }
  return { text: lines.join("\n"), errors };
}

// the text of a script without comments and strings, to count braces and parentheses
const bare = t => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, "");
const balanced = t => { const b = bare(t), n = c => b.split(c).length - 1; return n("{") === n("}") && n("(") === n(")"); };

module.exports = { applyScriptPatch, balanced, bare };
