// A behavior script the game's base classes run (arena_behavior.vs for BaseBarracks, outpost_behavior.vs for Outpost...) that the mod edited, for the mod's civilizations
// only (AGENTS.md, "Civilizations are independent"). A clone inherits the behavior from the game's class, so a copy under another name cannot replace it (a class lists
// at most 8 behaviors and the same path counts once: both would run), and the game's script cannot be shipped at the game's path. The mod's version goes as a patch of
// the game's script: one block per civilization of the mod, at the first line of code, that runs the mod's body with that civilization's class ids and returns.
//   inlineBehavior({ OUT, HD, SRC, name, civs, mapClasses, transform, dir, guard })  ->  { civs: n, declared: [names] } or null
// SRC is the mod's folder with the script (DATA/SUBAI or DATA/AI of HD + mod, three-way), HD the game's DATA folder, `civs` [{ id, constant, letter, from, ... }] (what
// own-scripts.js's classMapper wants), `mapClasses(text, civ)` its class mapper and `transform(text)` what else every copy gets (the tests of the race). `dir` is the
// folder of the script (SUBAI by default; AI for what the engine calls by name: CalcGAIKAPriority, GetArmyNeed...), `guard(civ)` the condition that picks the civilization
// (by default `Mod_TrueRace(This) == <constant>`; for an AI script that gets a player: `Mod_PlayerCiv(idPlayer) == <constant>`). Variables the mod declares at the top
// that the game's script does not are declared by the patch with @top (an initial value becomes an assignment at the start of the block).
const fs = require("fs"), path = require("path"), { mask } = require("./script-checks.js");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());

// the body already ends in a `return ...;` of its own (a statement of the block, not the body of an `if`): another `return;` after it is code after a return, which the
// engine's compiler reports as an error
function endsWithReturn(body) {
  const m = mask(body).replace(/\s+$/, ""); if (!m.endsWith(";")) return false;
  const start = Math.max(m.lastIndexOf(";", m.length - 2), m.lastIndexOf("{"), m.lastIndexOf("}"));
  return /^\s*return\b/.test(m.slice(start + 1));
}
const DECL = /^[A-Za-z_]\w*\s+\*?[A-Za-z_]\w*(\s*=[^,]*)?(\s*,\s*\*?[A-Za-z_]\w*(\s*=[^,]*)?)*$/;
// the script split at the end of its top declarations: { decls: [{ type, name, init }], body, firstCode }
function split(text) {
  const lines = text.replace(/\r/g, "").split("\n"), decls = [], strip = s => s.replace(/\/\/.*$/, "");
  let acc = "", start = 1;
  for (let i = 1; i < lines.length; i++) {
    const l = strip(lines[i]);
    if (!l.trim() && !acc) { start = i + 1; continue; }
    acc += (acc ? " " : "") + l.trim();
    if (!acc.includes(";")) continue;
    const st = acc.slice(0, acc.indexOf(";")).trim(), rest = acc.slice(acc.indexOf(";") + 1).trim();
    if (rest || !DECL.test(st) || /^(return|break|continue|else|if|while|for)\b/.test(st)) break;
    const type = st.match(/^[A-Za-z_]\w*/)[0];
    for (const part of st.slice(type.length).split(",")) { const m = part.trim().match(/^(\*?[A-Za-z_]\w*)\s*(?:=\s*(.*))?$/); if (m) decls.push({ type, name: m[1], init: m[2] }); }
    acc = ""; start = i + 1;
  }
  const body = lines.slice(start);
  return { decls, body: body.join("\n"), firstCode: (body.find(l => l.trim() && !l.trim().startsWith("//")) || "").trim() };
}

module.exports = function inlineBehavior({ OUT, HD, SRC, name, civs, mapClasses, transform = t => t, dir = "SUBAI", guard = c => `Mod_TrueRace(This) == ${c.constant}` }) {
  const hdDir = ci(HD, dir), hdFile = hdDir && ci(path.join(HD, hdDir), name), srcFile = ci(SRC, name);
  if (!hdFile || !srcFile) return null;
  const hd = split(rd(path.join(HD, hdDir, hdFile))), mod = split(rd(path.join(SRC, srcFile)));
  if (!hd.firstCode) return null;
  const have = new Set(hd.decls.map(d => d.name)), top = [], inits = [];
  for (const d of mod.decls) { if (!have.has(d.name)) { top.push(`${d.type} ${d.name};`); have.add(d.name); } if (d.init !== undefined) inits.push(`${d.name} = ${d.init};`); }
  const blocks = civs.map(c => {
    const body = transform(mapClasses([...inits, mod.body].join("\n"), c), c).replace(/\s+$/, "");
    return `// ${c.id}\nif (${guard(c)})\n{\n${body}${endsWithReturn(body) ? "" : "\n\treturn;"}\n}\n`;
  });
  const patch = `${top.length ? `@top\n${top.join("\n")}\n` : ""}@before ${hd.firstCode}\n// The mod's version of this script, only for the mod's civilizations\n${blocks.join("\n")}`;
  wr(path.join(OUT, "patches", "DATA", dir, `${name.replace(/\.vs$/i, "").toUpperCase()}.VS`), patch.replace(/\n/g, "\r\n"));
  return { civs: civs.length, declared: top };
};

module.exports.split = split;
