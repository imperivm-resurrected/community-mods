// The object a script's tests of the civilization are written on, and a check that every receiver the build wrote exists in its script.
//
// Found in game (Community Mod, 2026-11-02, the same transformer): the tests `.race == Carthage` of the mod's scripts are rewritten as `(.race == Carthage || Mod_TrueRace(X) == Fcarthage)`,
// and X was "This" for any script whose header did not name an `Obj` first. A group VERIFIER (`//bool, ObjList objs, str OUT reasonText`) has no `This`: it declares the local
// `Building this;` and the bare `.race` means that local. `Mod_TrueRace(This)` there is "No matching function with name This", the script does not compile, and every command whose
// groupverifier it is fails to verify. The names check did not see it: `This` is a name the game knows.
//   receiverOf(text)      the identifier to write for an implicit receiver in this script: the first `Obj <name>` parameter, else the local `this`, else "This" (checkReceivers will say)
//   checkReceivers({ OUT, HD })  -> { problems, scanned, uses }: every `This` used and every argument of Mod_TrueRace / Mod_PlayerCiv must be a parameter or local of the script
//                         (a patch file is read with the header and the declarations of the game's script it patches)
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ").replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, '""');
// game functions that return the object or player (sdk/game-functions.txt; HD's AI/SquadMonitor.vs uses it bare, GS_Guard.vs with parentheses): not variables
const GAME_CALLS = new Set(["AIGetPlayer"]);
const NOT_TYPES = new Set("return else if while for do switch case new and or not break continue true false".split(" "));

// the parameters named in the first line `// ret, Type name, Type *name`: [{ type, name }]
function headerParams(text) {
  const first = text.split(/\r?\n/).find(l => l.trim()) || "", m = /^\s*\/\/(.*)$/.exec(first);
  if (!m) return [];
  return m[1].split(",").slice(1).map(p => p.trim().split(/\s+/)).filter(a => a.length >= 2).map(a => ({ type: a[a.length - 2].replace(/\*$/, ""), name: a[a.length - 1].replace(/^\*/, "") }));
}
// the names declared in the body: `Type a, b = x;`, `Type *p`
function locals(text) {
  const out = new Set();
  for (const m of strip(text).matchAll(/(?:^|[;{}(])\s*([A-Za-z_]\w*)\s*\*?\s*([A-Za-z_]\w*(?:\s*(?:\[[^\]]*\])?\s*(?:=[^;,]*)?\s*,\s*[A-Za-z_]\w*)*)/g)) {
    if (NOT_TYPES.has(m[1])) continue;
    for (const n of m[2].matchAll(/(?:^|,)\s*([A-Za-z_]\w*)/g)) out.add(n[1]);
  }
  return out;
}

function receiverOf(text) {
  const p = headerParams(text);
  const obj = p.find(x => x.type === "Obj");
  if (p.length && p[0].type === "Obj" && obj) return obj.name;               // the old rule: `// ret, Obj name` (the first parameter)
  if (p.some(x => x.name === "This")) return "This";
  if (locals(text.replace(/^.*\r?\n/, "")).has("this")) return "this";      // a verifier: `Building this; this = objs[0].AsBuilding();`
  return "This";
}

function checkReceivers({ OUT, HD }) {
  const problems = [], seen = new Map(); let scanned = 0;
  const hdData = path.join(HD, ci(HD, "DATA") || "DATA");
  const targetOf = f => {                                                      // a patch file's script in the game
    const rel = path.relative(path.join(OUT, "patches", "DATA"), f).replace(/\\/g, "/").split("/");
    if (rel.length < 2) return null;
    const d = ci(hdData, rel[0]); const n = d && ci(path.join(hdData, d), rel[1]);
    return n ? path.join(hdData, d, n) : null;
  };
  for (const f of walk(OUT).filter(p => /\.vs$/i.test(p))) {
    const text = rd(f), rel = path.relative(OUT, f).replace(/\\/g, "/"), isPatch = /^patches\//i.test(rel);
    let known, owner = text;
    if (isPatch) { const t = targetOf(f); if (!t) { problems.push(`${rel}: the game has no script to patch`); continue; } owner = rd(t); }
    scanned++;
    known = new Set([...headerParams(owner).map(x => x.name), ...locals(owner.replace(/^.*\r?\n/, "")), ...(isPatch ? locals(text) : [])]);
    const body = strip(text);
    for (const m of body.matchAll(/(?<![\w.])This\b/g)) { if (!known.has("This")) { problems.push(`${rel}: uses This and declares none (header "${(owner.split(/\r?\n/).find(l => l.trim()) || "").trim().slice(0, 60)}")`); break; } }
    for (const m of body.matchAll(/\b(Mod_TrueRace|Mod_PlayerCiv)\s*\(\s*([A-Za-z_]\w*)/g)) {
      seen.set(`${m[1]}(${m[2]})`, (seen.get(`${m[1]}(${m[2]})`) || 0) + 1);
      if (!known.has(m[2]) && !GAME_CALLS.has(m[2])) problems.push(`${rel}: ${m[1]}(${m[2]}...) names a variable the script does not declare`);
    }
  }
  return { problems: [...new Set(problems)], scanned, uses: seen };
}

module.exports = { receiverOf, checkReceivers, headerParams, locals };

// self-test: node tools/lib/mci-receivers.js
if (require.main === module) {
  const assert = require("assert"), os = require("os");
  assert.strictEqual(receiverOf("//bool, ObjList objs, str OUT reasonText\n\nBuilding this;\nthis = objs[0].AsBuilding();\nif (.race == Gaul) return true;\n"), "this");
  assert.strictEqual(receiverOf("// void, Obj This\nif (.race == Gaul) return;\n"), "This");
  assert.strictEqual(receiverOf("//void, Obj owner\nif (.race == Gaul) return;\n"), "owner");
  assert.strictEqual(receiverOf("//bool, ObjList objs\nif (.race == Gaul) return true;\n"), "This");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "mci-rec-")), O = path.join(T, "port"), H = path.join(T, "hd");
  const put = (r, p, s) => { fs.mkdirSync(path.dirname(path.join(r, p)), { recursive: true }); fs.writeFileSync(path.join(r, p), s); };
  put(H, "DATA/SUBAI/A.VS", "// void, Obj This\nint n;\n"); put(O, "patches/DATA/SUBAI/A.VS", "@top int k;\n@before n = 1;\nif (Mod_TrueRace(This) == Igaul) return;\n");
  put(O, "DATA/SUBAI/v.vs", "//bool, ObjList objs, str OUT r\nBuilding this;\nthis = objs[0].AsBuilding();\nif (Mod_TrueRace(this) == Igaul) return true;\n");
  assert.deepStrictEqual(checkReceivers({ OUT: O, HD: H }).problems, []);
  put(O, "DATA/SUBAI/w.vs", "//bool, ObjList objs, str OUT r\nBuilding this;\nif (.race == Gaul || Mod_TrueRace(This) == Igaul) return true;\n");
  assert(checkReceivers({ OUT: O, HD: H }).problems.length >= 1, "the bug of the game test is found");
  put(O, "DATA/SUBAI/w.vs", "// void, int idPlayer\nif (Mod_PlayerCiv(idPlaer) == Igaul) return;\n");
  assert.strictEqual(checkReceivers({ OUT: O, HD: H }).problems.length, 1, "a misspelt receiver is found");
  fs.rmSync(T, { recursive: true, force: true });
  console.log("mci-receivers self-test ok");
}
