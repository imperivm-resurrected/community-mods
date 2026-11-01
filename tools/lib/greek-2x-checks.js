// Offline checks of what a port's scripts name, run at the end of a build (tools/greek-2x.js; usable by any tool):
//   checkScripts({ OUT, HD, DATA })  ->  { errors: [], warnings: [], notes: [] }
// 1. every script patch of the port (patches/DATA/<SUBAI|AI|...>/NAME.vs) is applied to the game's script with the engine's algorithm
//    (tools/lib/script-patch.js): every anchor must exist, the result must keep its braces and parentheses balanced, and no `{` may be followed at once by the `}`
//    of the game's own block it was added into (an `if (...) {` with no body: the patch lost its lines);
// 2. the classes a script names by string must exist, in the port or the game:
//      GetRandomHeroClass("X") and every order `method="hirehero"` with param X: X must have at least one class derived from it WITH an entity. The engine's
//      PickRandomHeroClass (0x531060) collects X and its descendants (CollectDerivedClasses 0x530e40: IsKindOfName includes X itself) and then draws one at random
//      until CVXScriptClass::HasEntity is true: a base with entity="" and no child makes the game hang for ever (a base that does not exist only gives "No heroes found")
//      Place("X"...), IsHeirOf("X"), ClassPlayerObjs("X"...), ObjsInCircle(..., "X"), GameObj class="X" in the random map lists: X should exist (a warning: the
//      call does nothing, it does not hang)
// 3. GetConst("K") names a key the game's CONST.INI or the port's CONST.INI patch has
// 4. the names the scripts use (tools/lib/greek-2x-names.js): a script that a class, a command or the AI starts, and that calls or compares with a name nothing defines (a
//    function, constant, special, AI script or strategy, class), or names a script file that is in neither the port nor the game, stops in game with "No matching function"
// A class the game has that a clone of the port replaces (a key of civs/*.json alias.classes) and that a script of the port names by string is a warning: the
// script should write the clone's own id (AGENTS.md: class ids written as text are each clone's own), unless it means the game's class on purpose.
const fs = require("fs"), path = require("path");
const { applyScriptPatch, balanced, bare } = require("./script-patch.js");
const rd = f => fs.readFileSync(f, "latin1");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const files = (d, re, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) files(p, re, out); else if (re.test(e.name)) out.push(p); } return out; };
// `if (false) { ... }` (what a branch flag becomes in a script's copy for a civilization that is not that branch) never runs: its names are not checked
const stripDead = t => { for (let m; (m = /\bif\s*\(\s*false\s*\)\s*\{/.exec(t));) { let i = m.index + m[0].length, depth = 1; while (i < t.length && depth) { if (t[i] === "{") depth++; else if (t[i] === "}") depth--; i++; } t = t.slice(0, m.index) + t.slice(i); } return t; };
const SCRIPT_DIRS = /(^|[\\/])DATA[\\/](SUBAI|AI|AI HELPERS|ITEMSCRIPTS|GAMESCRIPTS|BONUSSCRIPTS)[\\/]/i;

function classTable(roots) {
  const t = new Map();                                                      // lowercase id -> { id, parent, entity, file }
  for (const root of roots) for (const f of files(root, /\.sc\.xml$/i)) {
    const s = rd(f).replace(/<!--[\s\S]*?-->/g, ""), m = s.match(/<class\b[^>]*>/); if (!m) continue;
    const id = (m[0].match(/\bid\s*=\s*"([^"]+)"/) || [])[1]; if (!id) continue;
    const alt = (m[0].match(/\baltid\s*=\s*"([^"]+)"/) || [])[1];
    const rec = { id, parent: (m[0].match(/\bparent\s*=\s*"([^"]*)"/) || [])[1] || "", entity: (m[0].match(/\bentity\s*=\s*"([^"]*)"/) || [])[1] || "", file: f };
    if (!t.has(id.toLowerCase())) t.set(id.toLowerCase(), rec);
    if (alt && !t.has(alt.toLowerCase())) t.set(alt.toLowerCase(), rec);
  }
  return t;
}

function checkScripts({ OUT, HD, DATA = path.join(path.dirname(HD), "DATA"), SDK = process.env.SDK || path.join(__dirname, "..", "..", "..", "imperivm-resurrected", "sdk") }) {
  const errors = [], warnings = [], notes = [];
  const hdData = ci(HD, "DATA") ? path.join(HD, ci(HD, "DATA")) : HD;
  const mine = ci(OUT, "DATA") ? path.join(OUT, ci(OUT, "DATA")) : null;
  const classes = classTable([path.join(hdData, ci(hdData, "CLASSES") || "CLASSES"), ...(mine && ci(mine, "CLASSES") ? [path.join(mine, ci(mine, "CLASSES"))] : [])]);
  const mineIds = new Set([...classTable(mine && ci(mine, "CLASSES") ? [path.join(mine, ci(mine, "CLASSES"))] : []).keys()]);
  const kids = new Map();
  for (const c of classes.values()) { const p = c.parent.toLowerCase(); if (p) (kids.get(p) || kids.set(p, []).get(p)).push(c); }
  const derived = id => { const out = [], seen = new Set(), stack = [id.toLowerCase()]; while (stack.length) { const x = stack.pop(); if (seen.has(x)) continue; seen.add(x); const c = classes.get(x); if (c) out.push(c); for (const k of kids.get(x) || []) stack.push(k.id.toLowerCase()); } return out; };
  const heroOk = (id, where) => {
    if (!classes.has(id.toLowerCase())) { errors.push(`${where}: GetRandomHeroClass("${id}"): no such class (the engine answers "No heroes found")`); return; }
    const d = derived(id), withEntity = d.filter(c => c.entity);
    if (!withEntity.length) errors.push(`${where}: "${id}" and its ${d.length - 1} descendants have no entity: PickRandomHeroClass never returns (the game hangs)`);
  };
  // the clones' classes that replace the game's: alias.classes of civs/*.json
  const replaced = new Map();                                              // lowercase game id -> [clone ids]
  const civs = mine ? files(OUT, /\.json$/i).filter(f => /[\\/]civs[\\/]/i.test(f)) : [];
  for (const f of civs) { let j; try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; } for (const [o, n] of Object.entries((j.alias && j.alias.classes) || {})) (replaced.get(o.toLowerCase()) || replaced.set(o.toLowerCase(), []).get(o.toLowerCase())).push(n); }

  // 1. the patches
  const patchDir = path.join(OUT, "patches", "DATA");
  for (const f of files(patchDir, /\.vs$/i)) {
    const rel = path.relative(path.join(OUT, "patches"), f).replace(/\\/g, "/");
    const dir = path.dirname(f), hdDir = (() => { let p = hdData; for (const part of path.relative(path.join(OUT, "patches", "DATA"), dir).split(path.sep).filter(Boolean)) { const n = ci(p, part); if (!n) return null; p = path.join(p, n); } return p; })();
    const hdFile = hdDir && ci(hdDir, path.basename(f));
    if (!hdFile) { errors.push(`patches/${rel}: the game has no such script to patch`); continue; }
    const hdText = rd(path.join(hdDir, hdFile)), r = applyScriptPatch(hdText, rd(f));
    if (r.errors.length) { errors.push(`patches/${rel}: ${r.errors.join("; ")}`); continue; }
    if (!balanced(r.text)) { errors.push(`patches/${rel}: the game's script with the patch has unbalanced braces or parentheses`); continue; }
    // an added `{` right before a `}` of the game's: the added if/while has no body
    const a = r.text.split("\n"), b = hdText.replace(/\r/g, "").split("\n").map(l => l.trim());
    for (let i = 0; i + 1 < a.length; i++) if (/(\bif\b|\bwhile\b|\bfor\b|\belse\b).*\{\s*$/.test(bare(a[i])) && /^\s*\}\s*$/.test(a[i + 1]) && !b.includes(a[i].trim())) errors.push(`patches/${rel}: line ${i + 1} opens "${a[i].trim().slice(0, 50)}" and the next line closes it: an empty body`);
  }

  // 2 and 3. the names the scripts write
  const keys = new Set();
  for (const root of [path.join(hdData, ci(hdData, "CONST.INI") || "CONST.INI"), ...(mine ? files(path.join(OUT, "patches", "DATA"), /^const\.ini$/i).concat(files(mine, /^const\.ini$/i)) : [])]) if (fs.existsSync(root)) for (const m of rd(root).matchAll(/^\s*([A-Za-z_]\w*)\s*=/gm)) keys.add(m[1].toLowerCase());
  const scripts = [...(mine ? files(mine, /\.vs$/i).filter(f => SCRIPT_DIRS.test(f)) : []), ...files(path.join(OUT, "patches", "DATA"), /\.vs$/i)];
  const CLASS_CALLS = [/\bPlace\s*\(\s*"([^"]+)"/g, /\.IsHeirOf\s*\(\s*"([^"]+)"/g, /\bClassPlayerObjs\s*\(\s*"([^"]+)"/g, /\bObjsInCircle\s*\([^"()]*(?:\([^()]*\)[^"()]*)*,\s*"([^"]+)"/g, /\bGetPlayerUnits\s*\([^,)]*,\s*"([^"]+)"/g];
  const counted = { hero: 0, cls: 0, konst: 0 };
  for (const f of scripts) {
    const rel = path.relative(OUT, f).replace(/\\/g, "/"), t = stripDead(rd(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""));
    for (const m of t.matchAll(/\bGetRandomHeroClass\s*\(\s*"([^"]+)"/g)) { counted.hero++; heroOk(m[1], rel); }
    for (const m of t.matchAll(/\bGetConst\s*\(\s*"([^"]+)"/g)) { counted.konst++; if (!keys.has(m[1].toLowerCase())) errors.push(`${rel}: GetConst("${m[1]}"): neither the game's CONST.INI nor the port's has the key`); }
    const own = /_(w\d\d)(_\w+)?\.vs$/i.test(f) || /patches[\\/]/i.test(f);
    const seen = new Set();
    for (const re of CLASS_CALLS) for (const m of t.matchAll(re)) {
      const id = m[1]; if (seen.has(id)) continue; seen.add(id); counted.cls++;
      if (!classes.has(id.toLowerCase())) { warnings.push(`${rel}: "${id}" names no class of the port or the game (Place makes nothing, IsHeirOf is false)`); continue; }
      if (own && replaced.has(id.toLowerCase()) && !mineIds.has(id.toLowerCase())) warnings.push(`${rel}: "${id}" is the game's class that ${[...new Set(replaced.get(id.toLowerCase()))].slice(0, 3).join(", ")} replaces`);
    }
  }
  // the heroes the orders hire
  for (const f of mine ? files(path.join(mine, ci(mine, "COMMANDS") || "COMMANDS"), /\.xml$/i) : []) for (const m of rd(f).replace(/<!--[\s\S]*?-->/g, "").matchAll(/<cmd\b[^>]*?\bparam\s*=\s*"([^"]*)"[^>]*?\bmethod\s*=\s*"hirehero"|<cmd\b[^>]*?\bmethod\s*=\s*"hirehero"[^>]*?\bparam\s*=\s*"([^"]*)"/g)) { counted.hero++; heroOk(m[1] || m[2], `${path.relative(OUT, f).replace(/\\/g, "/")} (hirehero)`); }
  // the random map lists
  for (const f of files(path.join(OUT, "patches", "DATA"), /placeobjects\.xml$/i).concat(mine ? files(mine, /placeobjects\.xml$/i) : [])) for (const m of rd(f).matchAll(/<GameObj\b[^>]*?\bclass\s*=\s*"([^"]+)"/gi)) { counted.cls++; if (!classes.has(m[1].toLowerCase())) warnings.push(`${path.relative(OUT, f).replace(/\\/g, "/")}: GameObj class="${m[1]}": no such class`); }
  notes.push(`${scripts.length} scripts, ${counted.hero} hero bases, ${counted.cls} class names and ${counted.konst} GetConst keys checked`);
  // 4. the names the scripts use (a call or a constant that nothing defines stops the script in game: tools/lib/greek-2x-names.js)
  const names = require("./greek-2x-names.js").checkNames({ OUT, HD, SDK });
  errors.push(...names.errors); notes.push(...names.notes);
  return { errors, warnings, notes };
}
module.exports = { checkScripts };
