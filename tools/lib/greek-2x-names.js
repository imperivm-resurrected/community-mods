// Offline check of the NAMES a port's scripts use (the second half of the checks of tools/lib/greek-2x-checks.js; a file of its own so that it can run alone):
//   checkNames({ OUT, HD, SDK })  ->  { errors: [], notes: [], scanned }
// The game compiles a script when it is first used, and an identifier it does not know stops THAT script with "No matching function with name X" (a bare
// name is looked up as a function too). Nothing but the game compiles them, so a build that passes can still ship a script that never runs. This reads the
// scripts of the port (its copies, its AI) and the game's scripts that a class or a command of the port points to, and reports:
//   - a script named by a `vs=` / `verify=` / `onfinish=` of a class or a command, or by a string in a script (`AIRun('X.vs')`), that is in neither the port
//     nor the game;
//   - a bare identifier or a call that is not a variable or parameter of the script, a member (`.name`), a function / type / constant the game gives to scripts
//     (sdk/game-functions.txt, taken from the executable), a special (UNIT_SPECIALS.INI), an AI variable (`AIV_*`), an AI script or strategy of an AI.INI,
//     or the id of a civilization or a class of the port or the game.
// What it CANNOT see: the type of an expression (`x.nme`, a typo after a dot, is a member and is not looked at), the signature of a call (argument types and
// count), the `Mod_*` functions of the engine (any name with that prefix passes), a name that a string builds at run time (`"GS_" + n`), code under
// `if (false)` (what a branch flag becomes: skipped on purpose), an identifier that exists but not for that object, and whether the script does what it should.
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const KEYWORDS = new Set("if else while for do return break continue switch case default true false null new this This and or not static const".split(" "));
const TYPES = new Set("int float bool point rect str pstr IntArray StrArray StrMap void ObjList Query ObjArray".split(" "));
const ALWAYS = ["Gaul", "Egypt", "Teuton"];     // races the executable registers with no name in game-functions.txt (&DAT_...)

// the identifiers the game gives to scripts, from sdk/game-functions.txt
function gameVocabulary(SDK) {
  const f = SDK && path.join(SDK, "game-functions.txt");
  if (!f || !fs.existsSync(f)) return null;
  const names = new Set(), types = new Set();
  for (const l of rd(f).split(/\r?\n/)) {
    let m = /^\s+(?:CONST|TIPO)\s+&?([A-Za-z_]\w*)/.exec(l);
    if (m) { names.add(m[1]); if (/TIPO/.test(l)) types.add(m[1]); continue; }
    m = /^0x[0-9a-f]+\s+L?\s*([A-Za-z_][\w:~]*)\s/i.exec(l);
    if (!m) continue;
    const parts = m[1].split("::"), n = parts[parts.length - 1];
    if (/^[A-Za-z_]\w*$/.test(n)) names.add(n);
    if (parts.length > 1) types.add(parts[0]);
    for (const t of l.matchAll(/\b([A-Z][A-Za-z]+)\b/g)) types.add(t[1]);     // the types in the signature too
  }
  return { names, types };
}

// the first line of a script: `// ret, Type name, Type *name`
function params(text) {
  const first = text.split(/\r?\n/).find(l => l.trim()) || "", m = /^\s*\/\/\s*(.*)$/.exec(first);
  if (!m) return [];
  return m[1].split(",").slice(1).map(p => (p.trim().split(/\s+/).pop() || "").replace(/^\*/, "")).filter(x => /^[A-Za-z_]\w*$/.test(x));
}
// the text without comments, strings (returned apart: scripts name other scripts by them) and `if (false) {...}` blocks
function clean(text) {
  const strings = [];
  let t = text.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ").replace(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g, (_m, a, b) => { strings.push(a !== undefined ? a : b); return '""'; });
  for (let m; (m = /\bif\s*\(\s*false\s*\)\s*\{/.exec(t));) {
    let i = m.index + m[0].length, depth = 1;
    while (i < t.length && depth) { if (t[i] === "{") depth++; else if (t[i] === "}") depth--; i++; }
    t = `${t.slice(0, m.index)} ${t.slice(i)}`;
  }
  return { text: t, strings };
}

// -> { unknown: Map name -> count, strings }. `known`: lowercase names; `typeNames`: the class names a declaration may start with
function scan(text, known, typeNames) {
  const { text: t, strings } = clean(text), unknown = new Map(), declared = new Set(params(text));
  // declarations: `Type a, b = x;`, `Type *p`, `for (int i = ...`: the names that follow a type
  for (const m of t.matchAll(/(?:^|[;{}(,]|\bfor\s*\()\s*([A-Za-z_]\w*)\s*\*?\s*([A-Za-z_]\w*(?:\s*(?:\[[^\]]*\])?\s*(?:=[^;,]*)?\s*,\s*[A-Za-z_]\w*)*)/g)) {
    if (!TYPES.has(m[1]) && !typeNames.has(m[1])) continue;
    for (const n of m[2].matchAll(/(?:^|,)\s*([A-Za-z_]\w*)/g)) declared.add(n[1]);
  }
  for (const m of t.matchAll(/(?<![\w.])([A-Za-z_]\w*)\b/g)) {
    const id = m[1];
    if (KEYWORDS.has(id) || TYPES.has(id) || declared.has(id) || known.has(id.toLowerCase()) || /^Mod_/.test(id)) continue;
    if (t[m.index - 1] === ".") continue;                                      // a member
    unknown.set(id, (unknown.get(id) || 0) + 1);
  }
  return { unknown, strings };
}

function checkNames({ OUT, HD, SDK }) {
  const errors = [], notes = [], vocab = gameVocabulary(SDK);
  if (!vocab) return { errors, notes: ["names: sdk/game-functions.txt not found: the names the scripts use were NOT checked"], scanned: 0 };
  const hdData = path.join(HD, ci(HD, "DATA") || "DATA"), mine = ci(OUT, "DATA") ? path.join(OUT, ci(OUT, "DATA")) : null;
  const known = new Set([...vocab.names, ...ALWAYS].map(x => x.toLowerCase()));
  const iniAt = (root, rel) => { let p = root; for (const part of rel.split("/")) { const n = ci(p, part); if (!n) return ""; p = path.join(p, n); } return fs.statSync(p).isFile() ? rd(p) : ""; };
  // specials (UNIT_SPECIALS.INI: the id is the section name, lowercase): the game's and the port's
  for (const t of [iniAt(hdData, "UNIT_SPECIALS.INI"), iniAt(OUT, "patches/DATA/UNIT_SPECIALS.INI")])
    for (const m of t.matchAll(/^\s*\[([^\]]+)\]/gm)) { const n = m[1].trim().toLowerCase(); known.add(n.replace(/\s+/g, "")); known.add(n.replace(/\s+/g, "_")); }
  // AI.INI of the game and of the port's patch: the AI scripts (callable by name), the strategies, the AIV_ variables
  for (const t of [iniAt(hdData, "AI/AI.INI"), iniAt(OUT, "patches/DATA/AI/AI.INI")]) {
    let sec = "";
    for (const l of t.split(/\r?\n/)) {
      const h = /^\s*\[([^\]]+)\]/.exec(l); if (h) { sec = h[1]; continue; }
      const m = /^\s*\+?\s*([A-Za-z_][\w ]*?)\s*(?:\.vs)?\s*(?:=|$)/i.exec(l); if (m) known.add(m[1].trim().toLowerCase());
    }
  }
  // the ids of the civilizations and the classes of the port and the game
  for (const root of [hdData, mine].filter(Boolean)) for (const f of walk(path.join(root, ci(root, "CLASSES") || "CLASSES"))) { const m = /<class\b[^>]*?\bid\s*=\s*"([^"]+)"/.exec(rd(f)); if (m) known.add(m[1].toLowerCase()); }
  for (const f of walk(OUT).filter(p => /[\\/]civs[\\/][^\\/]+\.json$/i.test(p))) { try { const j = JSON.parse(fs.readFileSync(f, "utf8")); for (const k of ["id", "letter"]) if (j[k]) known.add(String(j[k]).toLowerCase()); } catch { /* not a civilization */ } }
  // the orders: <cmd name=...> of the commands of the port (and its patches) and the game, and the `sig` of every method of a class
  const orders = new Set();
  for (const root of [hdData, mine, path.join(OUT, "patches", "DATA")].filter(Boolean)) for (const f of walk(root).filter(p => /\.xml$/i.test(p) && /[\\/](COMMANDS|CLASSES)[\\/]/i.test(p)))
    for (const m of rd(f).replace(/<!--[\s\S]*?-->/g, "").matchAll(/<cmd\b[^>]*?\bname\s*=\s*"([^"]+)"|<method\b[^>]*?\bsig\s*=\s*"([^"]+)"/gi)) orders.add((m[1] || m[2]).toLowerCase());
  const typeNames = new Set([...vocab.types]);
  // what the executable registers without listing it in game-functions.txt (LAIKA, the hero skills `hsCharge`...): taken from the game's own live scripts
  // (its AI folder) and from the hero skills named in any of the game's scripts; HD's dead scripts (DRUID_REVITALIZE*.VS) are NOT a source
  const calib = new Set(), hdLive = new Set();
  for (const d of ["CLASSES", "COMMANDS"]) for (const f of walk(path.join(hdData, ci(hdData, d) || d)).filter(p => /\.xml$/i.test(p)))
    for (const m of rd(f).matchAll(/\b(?:vs|verify|onfinish|script|groupverifier)\s*=\s*"([^"]+\.vs)"/gi)) hdLive.add(path.basename(m[1].replace(/\\/g, "/")).toLowerCase());
  const liveFiles = walk(hdData).filter(p => /\.vs$/i.test(p) && (hdLive.has(path.basename(p).toLowerCase()) || /[\\/]AI[\\/]/i.test(p)));
  for (const f of liveFiles) for (const k of scan(rd(f), known, typeNames).unknown.keys()) calib.add(k.toLowerCase());
  // the orders the game's own scripts give (the Stonehenge spells are not <cmd>s): from every script of the game that passes the name check above. HD ships scripts
  // that cannot compile (DRUID_REVITALIZE*.VS name a special that does not exist): their orders are NOT a source
  // the skills the game lists in its HEROSKILL DEFAULT.VS ("Epic armor.vs" -> hsEpicArmor)
  const hsd = ci(path.join(hdData, ci(hdData, "AI") || "AI"), "HEROSKILL DEFAULT.VS");
  if (hsd) for (const m of rd(path.join(hdData, ci(hdData, "AI"), hsd)).matchAll(/"([A-Za-z ]+)\.vs"/g)) calib.add(`hs${m[1].split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join("")}`.toLowerCase());
  for (const k of calib) known.add(k);
  const ORDER_CALL = /\b(?:AddCommand|SetCommand|SneakCommand|GetCmdStaminaCost|GetCmdCost|CmdCount|CmdEnable|CmdDisable|SetCmdEnable|GetCmdEnable|ExecCmd|AddDefCmd)\s*\(\s*(?:true\s*,\s*|false\s*,\s*)?"([^"]+)"/g;
  const nocomment = s => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
  for (const f of walk(hdData).filter(p => /\.vs$/i.test(p))) { const s = rd(f); if (scan(s, known, typeNames).unknown.size) continue; for (const m of nocomment(s).matchAll(ORDER_CALL)) orders.add(m[1].toLowerCase()); }
  const scriptFiles = new Set();
  for (const root of [hdData, mine, path.join(OUT, "patches", "DATA")].filter(Boolean)) for (const f of walk(root).filter(p => /\.vs$/i.test(p))) scriptFiles.add(path.basename(f).toLowerCase());
  const hdScripts = new Map(walk(hdData).filter(p => /\.vs$/i.test(p)).map(p => [path.basename(p).toLowerCase(), p]));
  // which scripts to read: the port's own, and the game's that a class or a command of the port names
  const toRead = new Map();
  if (mine) {
    for (const d of ["SUBAI", "AI", "AI HELPERS", "ITEMSCRIPTS", "GAMESCRIPTS"]) for (const f of walk(path.join(mine, ci(mine, d) || d)).filter(p => /\.vs$/i.test(p))) toRead.set(f, "the port's");
    const refs = new Set();
    for (const d of ["CLASSES", "COMMANDS"]) for (const f of walk(path.join(mine, ci(mine, d) || d)).filter(p => /\.xml$/i.test(p)))
      for (const m of rd(f).replace(/<!--[\s\S]*?-->/g, "").matchAll(/\b(?:vs|verify|onfinish|script|groupverifier)\s*=\s*"([^"]+\.vs)"/gi)) {
        const n = path.basename(m[1].replace(/\\/g, "/")).toLowerCase(); refs.add(n);
        if (!scriptFiles.has(n)) errors.push(`${path.basename(f)}: names the script "${m[1]}", which is in neither the port nor the game`);
      }
    for (const n of refs) if (hdScripts.has(n) && !scriptFiles.has(`${n}\u0000mine`) && !toRead.has(hdScripts.get(n)) && ![...toRead.keys()].some(k => path.basename(k).toLowerCase() === n)) toRead.set(hdScripts.get(n), "the game's, started by a class or a command of the port");
  }
  // a script nothing points to never runs (the mod's Stonehenge spells: their class is global and was left out): reachable = named by a class or a command of the
  // port, in the AI folder (AI.INI), or by a string of a script that is reachable
  const base = f => path.basename(f).toLowerCase();
  const reach = new Set([...toRead.keys()].filter(f => /[\\/](AI|AI HELPERS)[\\/]/i.test(f) || (toRead.get(f) !== "the port's")).map(base));
  if (mine) for (const d of ["CLASSES", "COMMANDS"]) for (const f of [...walk(path.join(mine, ci(mine, d) || d)), ...walk(path.join(OUT, "patches", "DATA", d))].filter(p => /\.xml$/i.test(p)))
    for (const m of rd(f).replace(/<!--[\s\S]*?-->/g, "").matchAll(/"([^"]+\.vs)"/gi)) reach.add(path.basename(m[1].replace(/\\/g, "/")).toLowerCase());
  const byName = new Map([...toRead.keys()].map(f => [base(f), f]));
  for (let grew = true; grew;) { grew = false; for (const n of [...reach]) { const f = byName.get(n); if (!f) continue; for (const s of clean(rd(f)).strings) { const m = /^([\w ./\\-]+\.vs)$/i.exec(s.trim()); const k = m && path.basename(m[1].replace(/\\/g, "/")).toLowerCase(); if (k && !reach.has(k)) { reach.add(k); grew = true; } } } }
  const orphans = [...toRead.keys()].filter(f => !reach.has(base(f)));
  for (const f of orphans) toRead.delete(f);
  for (const [f, why] of toRead) {
    const rel = f.startsWith(OUT) ? path.relative(OUT, f).replace(/\\/g, "/") : `game: ${path.relative(HD, f).replace(/\\/g, "/")}`;
    const r = scan(rd(f), known, typeNames);
    for (const [id, n] of r.unknown) errors.push(`${rel}: "${id}" (${n}x) is no variable, member, game function or constant, special, AI name or class of the port or the game (${why})`);
    // the orders a script gives or asks about by name must exist: a command of the port or the game (a rename of the order, `revitalize` -> `revitalize (w26)`, leaves
    // the old name in the strings of a script that was not renamed with it), or a method of a class (`enter`, `advanceenter`: the engine's own orders)
    for (const m of nocomment(rd(f)).matchAll(ORDER_CALL))
      if (!orders.has(m[1].toLowerCase())) errors.push(`${rel}: an order "${m[1]}" is given or asked about that no command or method of the port or the game has (${why})`);
    for (const s of r.strings) {
      const m = /^([\w ./\\-]+\.vs)$/i.exec(s.trim());
      if (m && !scriptFiles.has(path.basename(m[1].replace(/\\/g, "/")).toLowerCase())) errors.push(`${rel}: names the script "${s}", which is in neither the port nor the game`);
    }
  }
  notes.push(`names: ${toRead.size} scripts read, ${errors.length} problems; ${orphans.length} scripts that nothing points to were not read (${orphans.slice(0, 4).map(f => path.basename(f)).join(", ")}${orphans.length > 4 ? ", ..." : ""})`);
  return { errors, notes, scanned: toRead.size, orphans: orphans.map(f => path.relative(OUT, f).replace(/\\/g, "/")) };
}

module.exports = { checkNames, gameVocabulary, scan, clean, params };

// self-test: node tools/lib/greek-2x-names.js
if (require.main === module) {
  const assert = require("assert");
  const SDK = process.env.SDK || path.join(__dirname, "..", "..", "..", "imperivm-resurrected", "sdk"), v = gameVocabulary(SDK);
  assert(v, "sdk/game-functions.txt not found");
  const known = new Set([...v.names, "determination"].map(x => x.toLowerCase())), types = new Set([...v.types, "Unit", "Druid"]);
  const a = scan("// void, Obj This, Obj target\n\nDruid this;\nint n;\nthis = This.AsDruid;\nif (!.HasSpecial(revitalize)) return;\nif (.HasSpecial(determination)) n = GetConst(\"X\");\nSleep(n);\n", known, types);
  assert.deepStrictEqual([...a.unknown.keys()], ["revitalize"], JSON.stringify([...a.unknown]));
  const b = scan("// void, GAIKA g, int p\nif (g.StratRunning(p) == GRW26_GS_EnterSettlement) return;\nif (false) { Nothing(); }", known, types);
  assert.deepStrictEqual([...b.unknown.keys()], ["GRW26_GS_EnterSettlement"], JSON.stringify([...b.unknown]));
  console.log("greek-2x-names self-test ok");
}
