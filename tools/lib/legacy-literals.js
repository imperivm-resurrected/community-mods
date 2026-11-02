// Class ids a script writes as text (`Place("GVillager", ...)`, `.Mutate('TTeutonArcher')`, `.class == "IDefender"`, `mutateClass = "GSpearman"`) and what a clone's script must say instead.
// A clone's units are not the game's: a script that a clone's class or command runs and that places, mutates, counts or compares the GAME's id gives the player a unit of the game's
// civilization (or never matches). The library of the other ports rewrites only double-quoted literals of a fixed list of functions and only in the scripts it copies; here every
// script of the port is read, with both quotes, and every call that takes a class.
//   findSites(text)                      -> [{ id, kind, fn, line, start, end }]   (code only: comments and `if (false) {...}` blocks are masked)
//   rewrite(text, map)                   -> text with each site whose id is in map (lowercase id -> clone id) rewritten
//   runnersOf({ OUT, civs })             -> Map(script file name lowercase -> Set(civ id | "*neutral*"))   who runs each script of the port (see the function)
const fs = require("fs"), path = require("path");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };

// the functions whose string arguments are class ids
const CLASS_FNS = new Set("place mutate getplayerunits objclass objectsaround classplayerobjs createobject findclass count isheirof getrandomheroclass objsinsight objsinrange objsincircle objsinrect isclass".split(" "));
const ENV_CLASS_KEYS = /^(mutateclass|upgradespawnerunit|upgradespawnerclass|env_cprod)$/i;

// text with comments and `if (false) {...}` removed, same length (every masked character is a space, new lines kept), strings kept
function mask(text) {
  const out = text.split(""); let i = 0;
  const blank = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== "\n" && out[k] !== "\r") out[k] = " "; };
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'") { let j = i + 1; while (j < text.length && text[j] !== c && text[j] !== "\n") j += text[j] === "\\" ? 2 : 1; i = j + 1; continue; }
    if (c === "/" && text[i + 1] === "/") { let j = text.indexOf("\n", i); if (j < 0) j = text.length; blank(i, j); i = j; continue; }
    if (c === "/" && text[i + 1] === "*") { let j = text.indexOf("*/", i + 2); j = j < 0 ? text.length : j + 2; blank(i, j); i = j; continue; }
    i++;
  }
  let t = out.join("").replace(/^@[^\r\n]*/gm, x => " ".repeat(x.length));            // a directive line of a patch (@before <the game's text>) is the game's, not ours
  for (let m; (m = /\bif\s*\(\s*false\s*\)\s*\{/.exec(t));) {                  // the block of a branch flag that is false: never runs
    let k = m.index + m[0].length, depth = 1, q = null;
    while (k < t.length && depth) { const ch = t[k]; if (q) { if (ch === q) q = null; } else if (ch === '"' || ch === "'") q = ch; else if (ch === "{") depth++; else if (ch === "}") depth--; k++; }
    t = t.slice(0, m.index) + t.slice(m.index, k).replace(/[^\r\n]/g, " ") + t.slice(k);
  }
  return t;
}

function findSites(text) {
  const t = mask(text), sites = [], stack = [];                               // stack: the call names of the open parentheses
  let line = 1;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "\n") { line++; continue; }
    if (c === "(") { const m = /([A-Za-z_]\w*)\s*$/.exec(t.slice(Math.max(0, i - 60), i)); stack.push(m ? m[1].toLowerCase() : ""); continue; }
    if (c === ")") { stack.pop(); continue; }
    if (c !== '"' && c !== "'") continue;
    let j = i + 1; while (j < t.length && t[j] !== c && t[j] !== "\n") j += t[j] === "\\" ? 2 : 1;
    const id = t.slice(i + 1, j), before = t.slice(Math.max(0, i - 80), i), fn = stack[stack.length - 1] || "";
    let kind = null;
    if (/^[A-Za-z][A-Za-z0-9_]*$/.test(id)) {
      if (/(?:^|[^\w])class\s*(?:==|!=)\s*$/.test(before) || /(?:==|!=)\s*$/.test(before) && /\bclass\s*(?:\(\s*\))?\s*$/.test(before.replace(/(?:==|!=)\s*$/, ""))) kind = "compare";
      else if (CLASS_FNS.has(fn)) kind = fn;
      else if (/\benvwritestring\s*\([^;]*,\s*"([A-Za-z_]+)"\s*,\s*$/i.test(before) && ENV_CLASS_KEYS.test((/\benvwritestring\s*\([^;]*,\s*"([A-Za-z_]+)"\s*,\s*$/i.exec(before) || [])[1] || "")) kind = "envwrite";
      else if (/\b(\w*(?:class|unit)\w*)\s*=\s*$/i.test(before) && !/[=!<>]=\s*$/.test(before)) kind = "assign";
    }
    if (kind) sites.push({ id, kind, fn, line, start: i + 1, end: j });
    i = j;
  }
  return sites;
}

// what is done with a site of each kind (see tools/imperivm-legacy.js, step 3g, and NOTES.md):
//   REPLACE   the call creates, changes or looks up units of the script's OWN player (a clone's player owns clones' units, never the game's): the clone's id takes the place
//   UNION     the call filters a list that may hold anybody's objects (a townhall's neighbours, a circle on the map): both ids, `Union(l.ObjClass("X"), l.ObjClass("Clone"))`
//   COMPARE   `.class == "X"` / `class != "X"` also accepts the clone's id (classCmp in the tool: the game's id stays: the object may be a game civilization's)
//   ENGINE    IsHeirOf and Count: the engine already counts a clone as its base (src/game/civai.cpp: IsDerivedFrom, IsKindOfName and CVXArmy::GetClassCount are hooked for every
//             civilization with ai: true and sum the classes of alias.classes), so the game's id is right and a second one would count twice
const REPLACE = new Set(["place", "mutate", "envwrite", "assign", "getplayerunits", "createobject", "findclass", "classplayerobjs"]);
const UNION = new Set(["objclass", "objsincircle"]);

// map: lowercase game id -> the clone's id. Returns the text and the number of sites changed
function rewrite(text, map) {
  let n = 0;
  const sites = findSites(text).filter(s => REPLACE.has(s.kind) && map.has(s.id.toLowerCase()));
  let out = text, shift = 0;
  for (const s of sites) {
    if (text[text.lastIndexOf("\n", s.start) + 1] === "@") continue;                  // a directive of a patch (the anchor is the game's text)
    const to = map.get(s.id.toLowerCase()); out = out.slice(0, s.start + shift) + to + out.slice(s.end + shift); shift += to.length - (s.end - s.start); n++;
  }
  // UNION: only where the call is a plain `recv.ObjClass("X")` or `ObjsInCircle(a, b, "X")` with no parentheses in the arguments; the build stops on any other (the check below)
  const code = mask(out);
  out = out.replace(/(\.?[A-Za-z_]\w*(?:\(\))?(?:\.[A-Za-z_]\w*(?:\(\))?)*)\.ObjClass\(\s*(["'])(\w+)\2\s*\)/g, (m, recv, q, id, off) => {
    const to = map.get(id.toLowerCase()); if (!to || to === id || code[off] === " " || code.slice(off, off + m.length) !== m) return m; n++;
    return `Union(${m}, ${recv}.ObjClass(${q}${to}${q}))`;
  });
  out = out.replace(/\bObjsInCircle\(([^()"']*),\s*(["'])(\w+)\2\s*\)/g, (m, args, q, id) => {
    const to = map.get(id.toLowerCase()); if (!to || to === id) return m; n++;
    return `Union(${m}, ObjsInCircle(${args}, ${q}${to}${q}))`;
  });
  return { text: out, n };
}

// the sites that are still the game's id where the clone's must be (or both): [{ line, kind, id, why }]. map as above; `also`: the clone ids of each game id (a line that has one counts)
function remaining(text, map) {
  const lines = text.split("\n"), out = [];
  for (const s of findSites(text)) {
    const to = map.get(s.id.toLowerCase()); if (!to) continue;
    const ln = lines[s.line - 1] || "";
    if (REPLACE.has(s.kind)) out.push({ line: s.line, kind: s.kind, id: s.id, to, text: ln.trim().slice(0, 160) });
    else if ((UNION.has(s.kind) || s.kind === "compare") && !ln.includes(to)) out.push({ line: s.line, kind: s.kind, id: s.id, to, text: ln.trim().slice(0, 160) });
  }
  return out;
}

module.exports = { findSites, rewrite, remaining, mask, CLASS_FNS, REPLACE, UNION, walk, ci };

// self-test: node tools/lib/legacy-literals.js
if (require.main === module) {
  const assert = require("assert");
  const s = findSites(`// void, Obj This
Obj u;
u = Place("GVillager", .pos, 1);  // Place("Ignored", 1)
.Mutate('TTeutonArcher');
if (.class == "IDefender" || .class != 'IMountaineer') {}
if (false) { u = Place("Never", 1); }
EnvWriteString(player, "MutateClass", "IArcher");
mutateClass = "GSpearman";
x = GetPlayerUnits(player,"CWarElephant");
Print("GAxeman");
AddCommand(true, "trainGAxeman", s);`);
  assert.deepStrictEqual(s.map(x => `${x.id}:${x.kind}`), ["GVillager:place", "TTeutonArcher:mutate", "IDefender:compare", "IMountaineer:compare", "IArcher:envwrite", "GSpearman:assign", "CWarElephant:getplayerunits"], JSON.stringify(s.map(x => `${x.id}:${x.kind}`)));
  const m = new Map([["gvillager", "LgaVillager"], ["idefender", "LibDefender"], ["cnoble", "LcaNoble"], ["ioutpost", "LibOutpost"]]);
  const r = rewrite('u = Place("GVillager", a);\nl.RemoveList(l.ObjClass("CNoble"));\nx = ObjsInCircle(c, r, "IOutpost");\nif (.class == "IDefender") {}\n@before Place("GVillager")', m);
  assert.strictEqual(r.text, 'u = Place("LgaVillager", a);\nl.RemoveList(Union(l.ObjClass("CNoble"), l.ObjClass("LcaNoble")));\nx = Union(ObjsInCircle(c, r, "IOutpost"), ObjsInCircle(c, r, "LibOutpost"));\nif (.class == "IDefender") {}\n@before Place("GVillager")'); assert.strictEqual(r.n, 3);
  assert.deepStrictEqual(remaining(r.text, m).map(x => x.kind + ":" + x.id), ["compare:IDefender"]);
  assert.strictEqual(remaining(rewrite(r.text, m).text, m).length, 1, "idempotent: a second pass changes nothing");
  console.log("legacy-literals self-test ok");
}
