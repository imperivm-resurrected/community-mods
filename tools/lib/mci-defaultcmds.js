// The default commands (right click) of the MCI port's units: what tools/lib/default-cmds.js (main, written for the 2.3) finds in this build, and what this port does about it.
//
// A class that has a <defaultcmd> of its own has a map of its own: its keys shadow its parent's for every target that is a kind of that key, so a unit whose map has `Unit` and no
// `Hero` cannot link to a hero (the troops of the 2.x ports, found in game). MCI's civilizations are copies of the game's eight, so the clones' classes carry HD's maps as they are; the
// check finds 18 classes with a target their reference has, and 3 where a missing target is shadowed (Hero, Wagon, WildHorse):
//   IgaDLleldoryn     the mod's Gaul mage (GDLleldoryn, parent BaseMage): its own map has `Unit` and `ShipBattle`, BaseMage's `Hero` is shadowed -> FIXED here (the block of BaseMage is written
//                     in the class); HD's own DLleldoryn has a map with only `ShipBattle`, so it has the same shape in HD: the right click of the mage on a hero was never an attach there
//                     either, but the mod's class has `Unit` and the hero is a kind of Unit, so it would attack/approach its own hero. The Hero block is what BaseMage says.
//   CarroHierro, ShipTransport_mci   the mod's iron cart and transport ship: their own map is a copy of HD's Wagon map (ShipBattle, Inn, Catapult, Tower, Wall, Gate, Building, Teleport, ground,
//                     Unit), and HD's Wagon has no Hero / Wagon / WildHorse / TTent either: a cart does not link to heroes -> EXEMPT, same as the game's.
//   the other 15      not shadowed (the sentries lack `Building`, the clones of the ships lack ShipBattle/ShipS/Unit because their reference is the base class's own map): nothing breaks.
//   fix({ OUT, HDC, tag })     writes the shadowed targets of the reference's map into the class, for every class that is not exempt -> [{ id, targets }]
//   stops({ OUT, HDC, tag })   -> the classes that still have a shadowed target and are not exempt
const fs = require("fs"), path = require("path");
const DC = require("./default-cmds.js");
const rd = f => fs.readFileSync(f, "latin1");
const EXEMPT = new Map([
  ["CarroHierro", "the mod's cart: its map is HD's Wagon map, which has no Hero either"],
  ["ShipTransport_mci", "the mod's transport ship: its map is HD's Wagon map, which has no Hero either"],
]);
const exempt = id => EXEMPT.has(id) || [...EXEMPT.keys()].some(k => k.toLowerCase() === id.toLowerCase());

function classFile(dirs, id) {
  for (const d of dirs) for (const f of fs.existsSync(d) ? fs.readdirSync(d).filter(f => /\.sc\.xml$/i.test(f)) : []) { const t = rd(path.join(d, f)); if (new RegExp(`<class\\b[^>]*?\\bid\\s*=\\s*"${id}"`, "i").test(t)) return { file: path.join(d, f), text: t }; }
  return null;
}

function fix({ OUT, HDC, tag }) {
  const dirs = [path.join(OUT, "DATA", "CLASSES"), HDC], done = [];
  for (const x of DC.check({ OUT, dirs, tag }).filter(x => x.shadowed.length && !exempt(x.id))) {
    const me = classFile(dirs.slice(0, 1), x.id), ref = classFile(dirs, x.ref); if (!me || !ref) throw new Error(`${x.id}: no file for it or for its reference ${x.ref}`);
    const want = DC.ownMap(ref.text).filter(b => x.shadowed.some(s => s.toLowerCase() === b.target.toLowerCase()));
    const last = me.text.lastIndexOf("</defaultcmd>") + "</defaultcmd>".length; if (last < "</defaultcmd>".length) throw new Error(`${x.id}: no <defaultcmd> to write after`);
    const add = want.map(b => "\n\t" + b.text.replace(/\r?\n[ \t]*/g, m => m.startsWith("\r") ? "\r\n\t" : "\n\t")).join("");
    fs.rmSync(me.file); fs.writeFileSync(me.file, me.text.slice(0, last) + `\n\t<!-- the default commands of ${ref.text.match(/\bid\s*=\s*"([^"]+)"/)[1]} that this class's own map would shadow (tools/lib/mci-defaultcmds.js) -->` + add + me.text.slice(last), "latin1");
    done.push({ id: x.id, targets: want.map(b => b.target) });
  }
  return done;
}
const stops = ({ OUT, HDC, tag }) => DC.check({ OUT, dirs: [path.join(OUT, "DATA", "CLASSES"), HDC], tag }).filter(x => x.shadowed.length && !exempt(x.id));

module.exports = { fix, stops, EXEMPT };

// self-test: node tools/lib/mci-defaultcmds.js
if (require.main === module) {
  const assert = require("assert"), os = require("os");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "mci-dc-")), O = path.join(T, "port"), H = path.join(T, "hd");
  const put = (r, n, s) => { fs.mkdirSync(path.join(r, "DATA", "CLASSES"), { recursive: true }); fs.writeFileSync(path.join(r, "DATA", "CLASSES", n), s); };
  const cls = (id, parent, targets) => `<class id="${id}" parent="${parent}">\n${targets.map(t => `\t<defaultcmd target="${t}"><cmd name="x${t}"/></defaultcmd>`).join("\n")}\n</class>\n`;
  put(H, "UNIT.SC.XML", cls("Unit", "Object", ["Unit", "Hero"])); put(H, "MAGE.SC.XML", cls("BaseMage", "Unit", ["Hero"])); put(H, "HERO.SC.XML", cls("Hero", "Unit", []));
  put(O, "A.SC.XML", cls("IgaMage", "BaseMage", ["Unit"]));
  put(O, "B.SC.XML", cls("CarroHierro", "Unit", ["Unit"]));
  const o = { OUT: O, HDC: path.join(H, "DATA", "CLASSES"), tag: "mci" };
  // BaseMage's map has Hero: IgaMage (Unit only) is shadowed; Hero is a kind of Unit
  const before = stops(o).map(x => x.id); assert.deepStrictEqual(before, ["IgaMage"], JSON.stringify(before));
  assert.deepStrictEqual(fix(o), [{ id: "IgaMage", targets: ["Hero"] }]);
  assert.deepStrictEqual(stops(o), []); assert(/target="Hero"/.test(rd(path.join(O, "DATA", "CLASSES", "A.SC.XML"))));
  fs.rmSync(T, { recursive: true, force: true });
  console.log("mci-defaultcmds self-test ok");
}
