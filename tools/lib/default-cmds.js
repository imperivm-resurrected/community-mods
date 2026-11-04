// The default commands (right click) of the clones: complete each clone's own <defaultcmd> map, and check it.
//
// How the engine picks the command of a right click (CCmdRegistry::FindDefaultCommand, 004ed310, in the decompilation of imperivm-iii-research): the OUTER loop walks the
// class chain of the unit that acts (clone -> Melee -> Military -> Unit), the INNER one walks the class chain of the target (Hero1 -> ... -> Hero -> Military -> Unit); in
// each class it looks only at that class's own map (target type -> commands) and takes the first command whose verify accepts. A class that defines ANY <defaultcmd> of
// its own has a map of its own, and its keys shadow the parent's for every target that is a kind of that key. HD's UNIT.SC.XML has `Unit` (attack, approach...) AND `Hero` (attach...)
// in the same map, so the more specific target wins. The 2.x ports wrote the mod's changed blocks of Unit (`Unit`, `WallTarget`, `CTent`) inside each clone but not the
// unchanged `Hero` block: the clone's map had `Unit` and no `Hero`, a hero is a kind of Unit, and `attack`/`approach` answered before the parent's `Hero -> attach` was ever read:
// the troops did not link to their hero (maintainer, in game, 2026-11-02; confirmed by adding the one `Hero` block by hand).
//
//   complete({ OUT, dirs, tag, all })  for every class of the port with its own map: the targets of the nearest ancestor that has a map (the mod's version of it when the mod changed it:
//                                 `dirs` = [OUT classes, MERGED classes, HD classes], first wins) that the class does not have are written after its own blocks; a target the class has
//                                 is never touched (its own block wins). A class whose HD twin has a map of its own (the priests, the animals) is completed from the twin: its map stays
//                                 the one HD gave it. Parents first, so a clone's parent is complete when the clone is. `all: false` completes only the classes that have a shadowed target (the 3.6, whose
//                                 classes have no inlined base blocks: only its two neutral animals). -> { classes, blocks, list }
//   check({ OUT, dirs, tag })     the same walk, nothing written: -> [{ id, ref, missing: [targets], shadowed: [targets] }]. `missing` is every target of the reference the class lacks
//                                 (a target is compared without its `_<tag>` suffix: CTent_w25 is CTent); `shadowed` is the part that BREAKS something: a missing target that is a kind of
//                                 one of the class's own keys (Hero, Wagon, WildHorse, ShipBattle are kinds of Unit), so the own key answers first. The build stops on `shadowed`.
//   Only classes that are units (their chain reaches `Unit`; the buildings' maps are the buildings') are looked at.
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1");
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const parentOf = s => (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]*)"/) || [])[1];
const noComments = s => s.replace(/<!--[\s\S]*?-->/g, "");
// -> [{ target, text }] in document order
const ownMap = s => [...noComments(s).matchAll(/<defaultcmd\b([^>]*)>[\s\S]*?<\/defaultcmd>/gi)].map(m => ({ target: (m[1].match(/\btarget\s*=\s*"([^"]*)"/i) || [])[1] || "", text: m[0] }));
const classFiles = dir => !dir || !fs.existsSync(dir) ? [] : fs.readdirSync(dir).filter(f => /\.sc\.xml$/i.test(f)).map(f => path.join(dir, f));

function index(dirs) {                                          // lowercase id -> { id, file, text }, the first dir that has it wins
  const m = new Map();
  for (const d of dirs) for (const f of classFiles(d)) { const t = rd(f), id = classOf(t); if (id && !m.has(id.toLowerCase())) m.set(id.toLowerCase(), { id, file: f, text: t }); }
  return m;
}
// the HD twin of a port class: civs/<id>.json alias.classes maps the game's id to the clone's; a neutral class is `<id>_<tag>`
function twins(OUT, tag) {
  const t = new Map();
  const cd = path.join(OUT, "civs");
  for (const f of fs.existsSync(cd) ? fs.readdirSync(cd).filter(f => /\.json$/i.test(f)) : []) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(cd, f), "utf8")); } catch { continue; }
    for (const [o, n] of Object.entries((j.alias || {}).classes || {})) t.set(n.toLowerCase(), o);
  }
  return t;
}
const stripTag = (t, tag) => t.toLowerCase().replace(new RegExp(`_${tag}$`, "i"), "");

function walk({ OUT, dirs, tag, write, all = true }) {
  const idx = index(dirs), tw = twins(OUT, tag), hdOnly = index(dirs.slice(-1)), out = [];
  const portDir = dirs[0];
  const chainOf = id => { const o = []; let c = idx.get(id.toLowerCase()), n = 0; while (c && n++ < 30) { o.push(c); const p = parentOf(c.text); c = p ? idx.get(p.toLowerCase()) : null; } return o; };
  const mine = classFiles(portDir).map(f => idx.get((classOf(rd(f)) || "").toLowerCase())).filter(Boolean);
  mine.sort((a, b) => chainOf(a.id).length - chainOf(b.id).length);           // parents first
  let classes = 0, blocks = 0;
  const kindOf = (target, key) => { const t = idx.get(stripTag(target, tag)) || idx.get(target.toLowerCase()); return stripTag(target, tag) === key || (t ? chainOf(t.id).some(x => x.id.toLowerCase() === key) : false); };
  for (const c of mine) {
    if (!/<defaultcmd\b/i.test(noComments(c.text))) continue;
    if (!chainOf(c.id).some(x => x.id.toLowerCase() === "unit")) continue;                     // a unit: its chain reaches Unit
    const cur = rd(c.file), own = ownMap(cur), have = new Set(own.map(b => stripTag(b.target, tag)));
    // the reference: the HD twin when it has a map of its own, else the nearest ancestor that has one
    const twinId = tw.get(c.id.toLowerCase()) || (hdOnly.has(stripTag(c.id, tag)) ? stripTag(c.id, tag) : null);
    const twin = twinId && hdOnly.get(twinId.toLowerCase());
    let ref = twin && ownMap(twin.text).length ? twin : null;
    if (!ref) for (const a of chainOf(c.id).slice(1)) { const t = idx.has(a.id.toLowerCase()) ? rd(a.file) : a.text; if (ownMap(t).length) { ref = { id: a.id, text: t }; break; } }
    if (!ref) continue;
    const missing = ownMap(ref.text).filter(b => !have.has(stripTag(b.target, tag)));
    if (!missing.length) continue;
    const keys = [...have].filter(k => k), shadowed = missing.filter(b => b.target && keys.some(k => k !== stripTag(b.target, tag) && kindOf(b.target, k)));
    if (write && (all || shadowed.length)) {
      const last = cur.lastIndexOf("</defaultcmd>") + "</defaultcmd>".length;
      const add = missing.map(b => "\n\t" + b.text.replace(/\r?\n[ \t]*/g, m => m.startsWith("\r") ? "\r\n\t" : "\n\t")).join("");
      fs.writeFileSync(c.file, cur.slice(0, last) + "\n\t<!-- the other default commands of " + ref.id + ": a class with a map of its own does not read its parent's for a target it has a key for (tools/lib/default-cmds.js) -->" + add + cur.slice(last), "latin1");
      blocks += missing.length;
    }
    if (write && !(all || shadowed.length)) continue;
    classes++; out.push({ id: c.id, ref: ref.id, missing: missing.map(b => b.target || "(ground)"), shadowed: shadowed.map(b => b.target) });
  }
  return write ? { classes, blocks, list: out } : out;
}
const complete = o => walk({ ...o, write: true });
const check = o => walk({ ...o, write: false });
// a class that has the same target in two blocks of its own: the engine joins them in one list, in document order (information, not a failure)
function duplicates({ OUT, tag }) {
  const out = [];
  for (const f of classFiles(path.join(OUT, "DATA", "CLASSES"))) { const t = rd(f), seen = new Map(); for (const b of ownMap(t)) seen.set(stripTag(b.target, tag), (seen.get(stripTag(b.target, tag)) || 0) + 1); const d = [...seen].filter(([, n]) => n > 1).map(([k]) => k); if (d.length) out.push({ id: classOf(t), targets: d }); }
  return out;
}
module.exports = { complete, check, duplicates, ownMap };

if (require.main === module) {                                    // self test
  const assert = require("assert"), os = require("os");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "defcmd-")), mk = (d, f, s) => { fs.mkdirSync(path.join(root, d), { recursive: true }); fs.writeFileSync(path.join(root, d, f), s); };
  const blk = (t, c) => `<defaultcmd target="${t}"><cmd name="${c}"/></defaultcmd>`;
  mk("hd", "UNIT.SC.XML", `<class id="Unit" cpp_class="CVXUnit" parent="Object">${blk("Unit", "attack")}${blk("Hero", "attach")}${blk("Wagon", "capture")}</class>`);
  mk("hd", "HERO.SC.XML", `<class id="Hero" cpp_class="CVXHero" parent="Unit"></class>`);
  mk("hd", "WAGON.SC.XML", `<class id="Wagon" cpp_class="CVXUnit" parent="Unit"></class>`);
  mk("hd", "MELEE.SC.XML", `<class id="Melee" cpp_class="CVXUnit" parent="Unit"></class>`);
  mk("hd", "WOLFUNIT.SC.XML", `<class id="WolfUnit" cpp_class="CVXUnit" parent="Unit">${blk("Unit", "attack")}</class>`);
  mk("merged", "UNIT.SC.XML", `<class id="Unit" cpp_class="CVXUnit" parent="Object">${blk("Unit", "attack")}${blk("CTent", "attack_independent")}${blk("Hero", "attach")}${blk("Wagon", "capture")}</class>`);
  mk("out/DATA/CLASSES", "X.SC.XML", `<class id="X" cpp_class="CVXUnit" parent="Melee">${blk("Unit", "attack")}${blk("CTent_w23", "attack_independent")}</class>`);
  mk("out/DATA/CLASSES", "WOLFUNIT_W23.SC.XML", `<class id="WolfUnit_w23" cpp_class="CVXUnit" parent="Unit">${blk("Unit", "attack")}</class>`);
  const o = { OUT: path.join(root, "out"), dirs: [path.join(root, "out/DATA/CLASSES"), path.join(root, "merged"), path.join(root, "hd")], tag: "w23" };
  const before = check(o); assert.deepStrictEqual(before.map(x => x.id), ["X"], "the wolf's twin has a map without Hero: it is as HD's; X lacks Hero and Wagon"); assert.deepStrictEqual(before[0].missing, ["Hero", "Wagon"]);
  assert.deepStrictEqual(before[0].shadowed, ["Hero", "Wagon"], "Hero and Wagon are kinds of Unit, the class's own key");
  const r = complete(o); assert.strictEqual(r.blocks, 2); assert.strictEqual(check(o).length, 0, "complete: nothing missing");
  assert.strictEqual((rd(path.join(root, "out/DATA/CLASSES/X.SC.XML")).match(/target="Unit"/g) || []).length, 1, "the class's own block is not duplicated");
  console.log("default-cmds self-test ok"); fs.rmSync(root, { recursive: true, force: true });
}
