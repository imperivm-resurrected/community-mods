// Do the classes of a port have the commands its scripts give them? A script that calls `u.SetCommand("advance_enter", hall)` (or AddCommand / SneakCommand) on an object whose class
// has no method with that sig (and no order of that name) does nothing: the engine says "This object does not have a '%s' command! Command not added" (CreateCommandByName,
// Obj::SetCommand 005b0c30 of the Ghidra export; the message goes to a diagnostic stub, not to imperivm-mod.log) after cancelling the unit's current commands. Found in game: every
// Greek unit trained at the barracks, temple or gymnasium of the Caesar Mod port stayed where it appeared, because the mod's `Unit` declares `advance_enter` (HD's has `advanceenter`)
// and the Greek classes did not inherit the mod's base classes.
//
//   scan({ OUT, HDC, exempt })      -> { triples: [{ script, name, cls, family, via }], calls, unresolved }   (script, command name, class) triples that miss
//   inherit({ OUT, HDC, changes })  -> writes into every unit class of the port the <method> elements of the mod's base classes that its shipped chain lacks (see below)
//   summary(r, top)                 -> text
//
// WHO a call is on: `This`, `this` and a call with no receiver -> the classes that run the script (their <method vs=>, <behavior script=>, verify=, or the src of the order that names
// it, and their heirs); a variable declared `Unit`, `Hero` or `Building` -> every class of the port's civilizations that is a kind of it. Anything else (`.army`, a list element,
// a function result) is not looked at (counted in `unresolved`). WHAT it needs: a <method sig> in the class or a shipped ancestor (the port's classes first, then the game's: the
// engine reads what is shipped, never the mod's own base classes), or an order (<cmd name>) whose <src> is the class or an ancestor. A civilization's class = its `race` (own or
// inherited) is one of the port's civilizations.
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1");
const ci = (d, n) => d && fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { const n = ci(p, part); if (!n) return null; p = path.join(p, n); } return p; };
const strip = s => s.replace(/<!--[\s\S]*?-->/g, "");
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, out = []) => { if (!d || !fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const sigsOf = t => new Set([...strip(t).matchAll(/<method\b[^>]*?\bsig\s*=\s*"([^"]+)"/gi)].map(m => m[1].toLowerCase()));

// id (lowercase) -> { id, parent, sigs, race, file, text }; the first directory that has an id wins (top-level files only: WINTER/ variants repeat the ids)
function table(dirs) {
  const t = new Map();
  for (const d of dirs) for (const f of d && fs.existsSync(d) ? fs.readdirSync(d).filter(f => /\.sc\.xml$/i.test(f)) : []) {
    const text = rd(path.join(d, f)), id = classOf(text); if (!id || t.has(id.toLowerCase())) continue;
    const body = strip(text);
    t.set(id.toLowerCase(), { id, parent: ((body.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]*)"/) || [])[1] || "").toLowerCase(), sigs: sigsOf(text), race: ((body.match(/<properties\b[^>]*?\brace\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase(), file: path.join(d, f), text });
  }
  return t;
}
const chainOf = (t, id) => { const o = []; for (let c = t.get(id.toLowerCase()), n = 0; c && n++ < 40; c = c.parent ? t.get(c.parent) : null) o.push(c); return o; };

// orders: name (lowercase) -> Set of src ids (lowercase); and script (lowercase base name) -> Set of src ids, from COMMANDS files
function orders(dirs) {
  const names = new Map(), scripts = new Map();
  for (const d of dirs) for (const f of d && fs.existsSync(d) ? fs.readdirSync(d).filter(f => /\.xml$/i.test(f)) : []) {
    const t = strip(rd(path.join(d, f)));
    for (const m of t.matchAll(/<cmd\b[\s\S]*?<\/cmd>/g)) {
      const n = (m[0].match(/\bname\s*=\s*"([^"]*)"/) || [])[1]; if (!n) continue;
      const srcs = [...m[0].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1].toLowerCase());
      if (!names.has(n.toLowerCase())) names.set(n.toLowerCase(), new Set());
      for (const s of srcs) names.get(n.toLowerCase()).add(s);
      for (const v of m[0].matchAll(/="(?:data\/)?(?:subai\/)?([^"\/]+\.vs)"/gi)) { const k = v[1].toLowerCase(); if (!scripts.has(k)) scripts.set(k, new Set()); for (const s of srcs) scripts.get(k).add(s); }
    }
  }
  return { names, scripts };
}

// the commands a script gives: [{ name, recv }] with recv "self" | a declared type | null
function calls(text) {
  const code = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const decl = new Map();
  for (const m of code.matchAll(/^[ \t]*(Obj|Unit|Hero|Building|Barrack|Wagon|Settlement|Tower|Catapult|Druid|ObjList|Query)\s+([\w\s,]+?);/gm)) for (const v of m[2].split(",")) decl.set(v.trim().toLowerCase().replace(/=.*/, ""), m[1]);
  for (const m of (text.split("\n")[0] || "").matchAll(/\b(Obj|Unit|Hero|Building)\s+(\w+)/g)) decl.set(m[2].toLowerCase(), m[1]);
  const out = [];
  for (const m of code.matchAll(/([\w.()\[\]]*?)\.\s*(?:SetCommand|AddCommand|SneakCommand)\s*\(\s*(?:(?:true|false)\s*,\s*)?"([^"]+)"/g)) {
    const r = m[1]; let recv = null;
    if (!r || /^this$/i.test(r)) recv = "self";
    else if (/^\w+$/.test(r)) recv = decl.get(r.toLowerCase()) || null;
    else { const c = r.match(/^(\w+)\.As(Unit|Hero|Building)(?:\(\))?$/i); recv = c ? (/^this$/i.test(c[1]) ? "self" : c[2][0].toUpperCase() + c[2].slice(1).toLowerCase()) : null; }
    if (recv && !/^(self|Unit|Hero|Building)$/.test(recv)) recv = null;
    out.push({ name: m[2], recv });
  }
  return out;
}

function scan({ OUT, HDC, HDCMD, exempt = () => null }) {
  const CL = find(OUT, "DATA/CLASSES"), T = table([CL, HDC]), O = orders([find(OUT, "DATA/COMMANDS"), HDCMD]);
  const races = new Set();
  for (const f of walk(find(OUT, "civs")).filter(f => /\.json$/i.test(f))) { try { const j = JSON.parse(rd(f)); races.add(String(j.id || "").toLowerCase()); if (j.race) races.add(String(j.race).toLowerCase()); } catch { /* not a civilization */ } }
  const raceOf = id => { for (const c of chainOf(T, id)) if (c.race) return c.race; return ""; };
  const isKind = (id, kind) => chainOf(T, id).some(c => c.id.toLowerCase() === kind.toLowerCase());
  const civ = [...T.values()].filter(c => races.has(raceOf(c.id)) && isKind(c.id, "Unit"));
  const has = (cls, name) => { const n = name.toLowerCase(), ch = chainOf(T, cls.id); if (ch.some(c => c.sigs.has(n))) return true; const srcs = O.names.get(n); return !!srcs && ch.some(c => srcs.has(c.id.toLowerCase())); };
  // who runs a script: classes naming it, and the src of the orders that name it, with their heirs
  const users = new Map();
  const heirs = id => [...T.values()].filter(c => chainOf(T, c.id).some(a => a.id.toLowerCase() === id.toLowerCase()));
  for (const c of [...T.values()].filter(c => T.get(c.id.toLowerCase()).file.startsWith(CL))) for (const m of strip(c.text).matchAll(/\b(?:vs|verify|script)\s*=\s*"(?:data\/)?(?:subai\/)?([^"\/]+\.vs)"/gi)) { const k = m[1].toLowerCase(); if (!users.has(k)) users.set(k, new Set()); users.get(k).add(c.id.toLowerCase()); }
  for (const [k, srcs] of O.scripts) { if (!users.has(k)) users.set(k, new Set()); for (const s of srcs) users.get(k).add(s); }
  const familyOf = id => { const ch = chainOf(T, id); const x = ch.slice(1).find(c => !raceOf(c.id) || !races.has(raceOf(c.id))); return x ? x.id : (ch[1] ? ch[1].id : "-"); };
  // a variable declared `Unit` can be any unit the script meets (a ghoul it summoned, a sentry of a tower): for it only the sigs that no class of the game declares are looked at
  // (advance_enter, guard_patrol...: the mod's own, which a class has to get from the mod's base classes); `This` is exact and looks at every name
  const hdSigs = new Set([...table([HDC]).values()].flatMap(c => [...c.sigs])), modOnly = n => !hdSigs.has(n.toLowerCase());
  // ...and only for the classes that are expected to have it: their peers (the civilization classes whose nearest class of the game is the same: Ranged, ShortRanged, Hero...) mostly do
  const hdIds = new Set(table([HDC]).keys()), peersOf = new Map();
  const nearHd = id => (chainOf(T, id).slice(1).find(c => hdIds.has(c.id.toLowerCase())) || { id: "-" }).id.toLowerCase();
  for (const c of civ) { const k = nearHd(c.id); if (!peersOf.has(k)) peersOf.set(k, []); peersOf.get(k).push(c); }
  const expected = (c, name) => { const ps = peersOf.get(nearHd(c.id)) || []; return ps.filter(p => p !== c && has(p, name)).length * 2 >= ps.filter(p => p !== c).length && ps.length > 1; };
  const triples = [], seen = new Set(); let ncalls = 0, unresolved = 0;
  for (const f of walk(find(OUT, "DATA")).filter(f => /\.vs$/i.test(f) && !/[\\/]TUTORIALS[\\/]/i.test(f))) {
    const base = path.basename(f).toLowerCase(), cs = calls(rd(f));
    for (const c of cs) {
      ncalls++;
      let targets;
      if (c.recv === "self") targets = [...new Set([...(users.get(base) || [])].flatMap(id => heirs(id).map(h => h.id)))].map(id => T.get(id.toLowerCase())).filter(x => x && races.has(raceOf(x.id)));
      else if (c.recv) targets = modOnly(c.name) ? civ.filter(x => isKind(x.id, c.recv) && expected(x, c.name)) : [];
      else { unresolved++; continue; }
      if (c.recv === "self" && !(users.get(base) || []).size) { unresolved++; continue; }
      for (const t of targets) {
        if (has(t, c.name) || exempt(t.id, c.name)) continue;
        const key = `${base}|${c.name.toLowerCase()}|${t.id}`; if (seen.has(key)) continue; seen.add(key);
        triples.push({ script: path.basename(f), name: c.name, cls: t.id, family: familyOf(t.id), via: c.recv });
      }
    }
  }
  return { triples, calls: ncalls, unresolved, classes: civ.length };
}

const count = (list, k) => { const o = {}; for (const x of list) o[x[k]] = (o[x[k]] || 0) + 1; return o; };
const top = (o, n = 5) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${v}`).join(", ");
const summary = (r, n = 5) => `${r.triples.length} (script, name, class) triples; names: ${top(count(r.triples, "name"), n)}; families: ${top(count(r.triples, "family"), n)}; ${new Set(r.triples.map(t => t.cls)).size} classes; ${r.calls} calls read, ${r.unresolved} on an unknown receiver`;

// -- the cause: the clone step gives each civilization's classes the mod's changes to the base classes (tools/lib/clone-civs.js `decorate`), but follows the parent chain only through the
// game's classes and the civilization's own: a class whose parent is a class of the mod's own that is no civilization's (MediumRanged, OldMan...) stopped there, and the Greek classes
// (the mod's H*, never cloned) did not get any. `inherit` walks the whole chain (the port's classes, then the game's) and writes into every unit class the <method> elements of the
// mod's changes to the HD classes of that chain, for the sigs the shipped chain does not have yet. Only methods: properties, behaviors and default commands of those base classes
// are NOT written (the report counts them). `changes`: { hdClassIdLowercase: [element text] } (MERGED/base-changes.json).
function inherit({ OUT, HDC, changes, exists = () => true }) {
  const CL = find(OUT, "DATA/CLASSES"), T = table([CL, HDC]), done = [], noScript = [], used = new Set();
  const hdIds = new Set(table([HDC]).keys());
  // every FILE of the port, not every id: the mod's HHERO2C.SC.XML declares id="HHero2b" (a copy-paste slip), and the tool's rename keeps the last file of an id
  const mine = fs.readdirSync(CL).filter(f => /\.sc\.xml$/i.test(f)).map(f => { const text = rd(path.join(CL, f)), body = strip(text); return { id: classOf(text), parent: ((body.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]*)"/) || [])[1] || "").toLowerCase(), sigs: sigsOf(text), file: path.join(CL, f), text }; }).filter(c => c.id);
  const depth = c => (c.parent ? chainOf(T, c.parent).length : 0);
  mine.sort((a, b) => depth(a) - depth(b));                                      // parents first: a child does not get what its parent has just got
  for (const c of mine) {
    const ch = [c, ...(c.parent ? chainOf(T, c.parent) : [])]; if (!ch.some(x => x.id.toLowerCase() === "unit")) continue;
    const have = new Set(ch.flatMap(x => [...x.sigs]));
    const want = new Map();                                                      // sig -> element; the farthest ancestor first so that the nearest wins
    for (const a of ch.slice(1).reverse()) { if (!hdIds.has(a.id.toLowerCase())) continue; for (const e of changes[a.id.toLowerCase()] || []) { const m = e.match(/^<method\b[^>]*?\bsig\s*=\s*"([^"]+)"/i); if (m) { want.set(m[1].toLowerCase(), e); used.add(a.id.toLowerCase()); } } }
    const add = [...want].filter(([s]) => !have.has(s)).map(([, e]) => e).filter(e => { const v = [...e.matchAll(/\b(?:vs|verify)\s*=\s*"([^"]+)"/gi)].map(x => x[1]).find(x => !exists(x)); if (v) noScript.push(`${c.id}: ${e.match(/\bsig\s*=\s*"([^"]+)"/i)[1]} names ${v}, which nobody has`); return !v; });
    if (!add.length) continue;
    const nl = c.text.includes("\r\n") ? "\r\n" : "\n", i = c.text.lastIndexOf("</class>"); if (i < 0) continue;
    fs.rmSync(c.file); fs.writeFileSync(c.file, c.text.slice(0, i) + add.map(e => "\t" + e + nl).join("") + c.text.slice(i), "latin1");
    const rec = T.get(c.id.toLowerCase()); if (rec && rec.file === c.file) for (const e of add) rec.sigs.add(e.match(/\bsig\s*=\s*"([^"]+)"/i)[1].toLowerCase());
    done.push({ id: c.id, sigs: add.map(e => e.match(/\bsig\s*=\s*"([^"]+)"/i)[1]), family: ch[1] ? ch[1].id : "-" });
  }
  // what the base classes of those chains changed besides methods is NOT written (properties, behaviors, default commands, values): counted once per base class
  const skipped = {};
  for (const id of used) for (const e of changes[id]) { const k = (e.match(/^<(\w+)/) || [])[1]; if (k && k !== "method") { skipped[id] = skipped[id] || {}; skipped[id][k] = (skipped[id][k] || 0) + 1; } }
  return { done, noScript, skipped };
}

module.exports = { scan, inherit, summary, calls, table, chainOf };

// self-test: node tools/lib/caesar-methods.js --self-test
if (require.main === module && process.argv.includes("--self-test")) {
  const assert = require("assert"), os = require("os"), T = fs.mkdtempSync(path.join(os.tmpdir(), "cae-m-")), O = path.join(T, "port"), H = path.join(T, "hd");
  const put = (r, rel, s) => { fs.mkdirSync(path.dirname(path.join(r, rel)), { recursive: true }); fs.writeFileSync(path.join(r, rel), s); };
  const cls = (id, parent, extra = "") => `<class id="${id}" parent="${parent}">\n${extra}\n</class>\n`;
  put(H, "UNIT.SC.XML", cls("Unit", "Object", '<method sig="advanceenter" vs="x.vs"/>')); put(H, "MELEE.SC.XML", cls("Melee", "Unit"));
  put(O, "DATA/CLASSES/A.SC.XML", cls("KgaSword", "Melee", '<properties race="Kgaul"/><method sig="advance_enter" vs="e.vs"/>'));   // a clone: has it
  put(O, "DATA/CLASSES/B.SC.XML", cls("KgrHoplite", "Melee", '<properties race="kgreece"/>'));                                       // Greece: does not
  put(O, "civs/kgaul.json", '{"id":"kgaul"}'); put(O, "civs/kgreece.json", '{"id":"kgreece"}');
  put(O, "DATA/SUBAI/barrack_train.vs", '//void, Obj This\nUnit u;\nu.SetCommand("advance_enter", hall);\n');
  const o = { OUT: O, HDC: path.join(H), HDCMD: path.join(H, "none") };
  assert.deepStrictEqual(scan(o).triples.map(t => t.cls), ["KgrHoplite"]);
  const r = inherit({ OUT: O, HDC: o.HDC, changes: { unit: ['<method sig="advance_enter" vs="e.vs" />', '<properties x="1"/>'] } });
  assert.deepStrictEqual(r.done.map(d => d.id), ["KgrHoplite"]); assert.deepStrictEqual(scan(o).triples, []);
  assert(!/x="1"/.test(rd(path.join(O, "DATA/CLASSES/B.SC.XML"))), "only methods are written");
  fs.rmSync(T, { recursive: true, force: true }); console.log("caesar-methods self-test ok");
} else if (require.main === module) {
// CLI: node tools/lib/caesar-methods.js <port dir> [--top N] [--list]     (read only; the game's classes and orders from originals/game-data)
  const ROOT = path.join(__dirname, "..", ".."), argv = process.argv.slice(2), dir = argv.find(a => !a.startsWith("--")), n = +(argv[argv.indexOf("--top") + 1]) || 5;
  const MAIN = process.env.COMMUNITY_MODS || ROOT, hd = find(path.join(MAIN, "originals", "game-data"), "DATA");
  const r = scan({ OUT: path.resolve(dir), HDC: find(hd, "CLASSES"), HDCMD: find(hd, "COMMANDS") });
  console.log(`${path.basename(path.resolve(dir))}: ${summary(r, n)}`);
  if (argv.includes("--list")) for (const t of r.triples) console.log(`  ${t.script} ${t.name} ${t.cls} (${t.family}, on ${t.via})`);
}
