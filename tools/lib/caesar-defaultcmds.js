// The default commands (right click) of the Caesar Mod port's units. Wraps main's tools/lib/default-cmds.js (read only, written for the Greek 2.3, PR #39) with the one thing this
// port needs on top: classes that are EXEMPT (as tools/lib/mci-defaultcmds.js does for CarroHierro).
//
// A class with a <defaultcmd> of its own has a map of its own: its keys shadow its parent's for every target that is a kind of that key (a hero is a kind of Unit, so a map with `Unit`
// and no `Hero` attacks its own hero). The check found 7 unit classes of the 1.1.0 and 1.1.1 builds that lack a target of their reference, 5 of them shadowed:
//   KcaShaman, KegPriest, KgeEnchantress   lack `Military` (HD's CShaman/EPriest/TEnchantress: Military -> curse/cripple, written before their `Hero` block on purpose). The mod's own map has
//                     `Unit -> curse`, so the shadowed Military never reaches HD's block. FIXED: the block of the HD twin is written in the class (the own blocks stay and win).
//   KgaGhostUnit ((ground)), Fisherman_cae (ShipBattle)   missing, not shadowed (the parent's map is read for it): completed from the reference all the same, same shape as the others.
//   CrowUnit, Mule   EXEMPT (below).
// complete()  runs main's `complete` and puts the exempt classes back as they were -> { classes, blocks, list, exempt }
// stops()     -> the classes that still lack a SHADOWED target and are not exempt (the build stops on them)
const fs = require("fs");
const DC = require("./default-cmds.js");

const EXEMPT = new Map([
  ["CrowUnit", "the mod's crow (a flier, the druids' summoned crow (druid_crow_summoning.vs; CrowSummoned derives from it), parent Animal): its own map is `ground -> move` and `Object -> approach`, written to replace the mod's Animal map " +
    "(`ShipBattle -> boardship`); HD has no CrowUnit and HD's Animal/Crow have no ShipBattle at all. A crow that boards a ship is not what the mod meant, and neither reference has `Hero`"],
  ["Mule", "the mod's pack mule (parent Wagon, no HD twin): its own map is the mod's (`Unit -> follow`, ShipBattle, Building, Teleport, Inn). What its reference has and it lacks is `ground`, " +
    "`Object` and HD's Wagon `Sentry -> approach`; the mod's `Unit -> follow` answers first on a sentry, which is the mod's choice (the mod's own Wagon has no Sentry block). Neither Wagon has `Hero`"],
]);
const norm = (id, tag) => id.toLowerCase().replace(new RegExp(`_${tag}$`, "i"), "");
const isExempt = (id, tag) => [...EXEMPT.keys()].some(k => k.toLowerCase() === norm(id, tag));

const classFile = (dir, id) => fs.readdirSync(dir).filter(f => /\.sc\.xml$/i.test(f)).map(f => dir + "/" + f)
  .find(p => ((fs.readFileSync(p, "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase() === id.toLowerCase());

// o = { OUT, dirs: [port classes, mod's merged classes, HD classes], tag }
function complete(o) {
  const exempt = DC.check(o).filter(x => isExempt(x.id, o.tag));
  const saved = exempt.map(x => { const f = classFile(o.dirs[0], x.id); return { x, f, text: fs.readFileSync(f, "latin1") }; });
  const done = DC.complete(o);
  for (const s of saved) fs.writeFileSync(s.f, s.text, "latin1");
  const list = done.list.filter(x => !isExempt(x.id, o.tag));
  return { list, classes: list.length, blocks: list.reduce((n, x) => n + x.missing.length, 0), exempt: saved.map(s => s.x) };
}
const stops = o => DC.check(o).filter(x => x.shadowed.length && !isExempt(x.id, o.tag));
const exempted = o => DC.check(o).filter(x => isExempt(x.id, o.tag));
const perTarget = list => { const per = {}; for (const x of list) for (const t of x.missing) per[t] = (per[t] || 0) + 1; return per; };

module.exports = { complete, stops, exempted, perTarget, EXEMPT };

// self-test: node tools/lib/caesar-defaultcmds.js
if (require.main === module) {
  const assert = require("assert"), os = require("os"), path = require("path");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "cae-dc-")), O = path.join(T, "port"), H = path.join(T, "hd"), put = (r, n, s) => { fs.mkdirSync(path.join(r, "DATA", "CLASSES"), { recursive: true }); fs.writeFileSync(path.join(r, "DATA", "CLASSES", n), s); };
  const cls = (id, parent, targets) => `<class id="${id}" parent="${parent}">\n${targets.map(t => `\t<defaultcmd target="${t}"><cmd name="x${t}"/></defaultcmd>`).join("\n")}\n</class>\n`;
  put(H, "UNIT.SC.XML", cls("Unit", "Object", ["Unit"])); put(H, "MILITARY.SC.XML", cls("Military", "Unit", [])); put(H, "CSHAMAN.SC.XML", cls("CShaman", "Unit", ["Military", "Hero"]));
  put(H, "ANIMAL.SC.XML", cls("Animal", "Unit", ["ShipBattle"]));
  put(O, "A.SC.XML", cls("KcaShaman", "Unit", ["Unit", "Hero"])); put(O, "B.SC.XML", cls("CrowUnit", "Animal", ["Object"]));
  fs.mkdirSync(path.join(O, "civs")); fs.writeFileSync(path.join(O, "civs", "kca.json"), JSON.stringify({ alias: { classes: { CShaman: "KcaShaman" } } }));
  const o = { OUT: O, dirs: [path.join(O, "DATA", "CLASSES"), path.join(H, "DATA", "CLASSES")], tag: "cae" };
  assert.deepStrictEqual(stops(o).map(x => x.id), ["KcaShaman"]);                                 // Military is a kind of Unit: shadowed; CrowUnit is exempt
  const crow = fs.readFileSync(path.join(O, "DATA", "CLASSES", "B.SC.XML"), "latin1");
  const r = complete(o); assert.strictEqual(r.classes, 1); assert.deepStrictEqual(stops(o), []);
  assert(/target="Military"/.test(fs.readFileSync(path.join(O, "DATA", "CLASSES", "A.SC.XML"), "latin1")));
  assert.strictEqual(fs.readFileSync(path.join(O, "DATA", "CLASSES", "B.SC.XML"), "latin1"), crow);   // the exempt class is untouched
  fs.rmSync(T, { recursive: true, force: true }); console.log("caesar-defaultcmds self-test ok");
}
