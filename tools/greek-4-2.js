// Greek Civilization Mod 4.2: every civilization of the mod (and every one it changes) as a civilization of its own, next to the game's
// (AGENTS.md, "Civilizations are independent" and "What a civilization is, it is from the start"). Run after shrink-mod.js, the copy of
// extras/greek-civilization-mod/ and tools/greek-mod-fixes.js, which leave the port in originals/greek-4-2-pristine:
//   node tools/greek-4-2.js [id ...]        (no id: everything)
// Rebuilds ported/greek-civilization-mod from the pristine copy (hard links, so it costs no space) and then:
//   1. keeps the mod's version of the game's classes and commands (originals/greek-4-2-merged) and drops them from the port: they are the
//      game's, and each civilization they belong to is cloned from HD with the mod's changes on top (tools/lib/clone-civs.js)
//   2. Rome has three civilizations (Republican, Imperial, Punic) and Carthage two (Numidian, Mauritanian): the mod let the player pick the
//      branch at the town hall; each one is a civilization whose commands are the ones its branch left visible (tools/lib/branch.js)
//   3. the game's files the mod replaced become patches of what is Greek; the rest, and hidden.txt, go (tools/lib/independent.js)
//   4. Greece (letter H) is its own civilization, no longer in Imperial Rome's slot
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const PRISTINE = path.join(ROOT, "originals", "greek-4-2-pristine"), OUT = path.join(ROOT, "ported", "greek-civilization-mod"), MERGED = path.join(ROOT, "originals", "greek-4-2-merged");
const HD = path.join(ROOT, "originals", "game-data", "paks"), HDDATA = path.join(ROOT, "originals", "game-data", "DATA");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const want = process.argv.slice(2);
if (!fs.existsSync(PRISTINE)) { console.error("no " + PRISTINE + ": it is the port of the 4.2 before this script (see extras/greek-civilization-mod/NOTES.md)"); process.exit(1); }

// the civilizations: letters and indices in the README's table (a digit is a letter too: 26 run out)
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", letter: "X", id: "gaul42", index: 40, name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", letter: "Y", id: "britain42", index: 41, name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", letter: "Z", id: "iberia42", index: 42, name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", letter: "1", id: "egypt42", index: 43, name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", letter: "3", id: "germany42", index: 44, name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "4", id: "romerep42", index: 45, name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." },
    skipExtra: /^(ImperialRomanHero|MHero|AncientRomanHero)/, branch: { flag: "ChooseRepublicanRome", scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "5", id: "romeimp42", index: 46, name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." },
    skipExtra: /^(AncientRomanHero)/, branch: { flag: "ChooseImperialRome", scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, hire: { cmd: "hireheroRImperial", hero: "ImperialRomanHero" } } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "6", id: "romepun42", index: 47, name: { spanish: "Roma púnica", english: "Punic Rome", italian: "Roma punica" },
    skipExtra: /^(ImperialRomanHero|MHero)/, branch: { flag: "ChoosePunicRome", scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, hire: { cmd: "hireheroR", hero: "AncientRomanHero" } } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", letter: "7", id: "carthnum42", index: 48, name: { spanish: "Númida", english: "Numidia", italian: "Numida" },
    skipExtra: /^(MauritanianHero)/, branch: { flag: "ChooseNumidianCarthage", scripts: /^C[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", letter: "8", id: "carthmau42", index: 49, name: { spanish: "Mauritana", english: "Mauritania", italian: "Mauritana" },
    branch: { flag: "ChooseMauritanianCarthage", scripts: /^C[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, hire: { cmd: "hireheroCM", hero: "MauritanianHero" } } },
];

const TEMPLATE = "Greek Gabbo";                     // Greece's random map templates ("Greek Gabbo Town 1"): letters and spaces

// 0. a fresh copy of the pristine port: hard links (every write below removes the file first)
fs.rmSync(OUT, { recursive: true, force: true });
cp.spawnSync("cp", ["-al", PRISTINE, OUT], { stdio: "inherit" });
const CLASSES = find(OUT, "DATA/CLASSES"), COMMANDS = find(OUT, "DATA/COMMANDS");
const HD_CLASSES = find(HD, "DATA/CLASSES");
const hdClass = new Set(walk(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f)).map(f => (classOf(rd(path.join(HD_CLASSES, f))) || "").toLowerCase()));

// 1. what the mod did to the game's classes and commands: kept apart, and the game's classes leave the port
fs.rmSync(MERGED, { recursive: true, force: true });
const elements = s => {
  const body = s.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, ""), out = [];
  for (const m of body.matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)) out.push({ text: m[0].trim(), norm: m[0].replace(/\s+/g, " ").trim() });
  return out;
};
const baseChanges = {};
let kept = 0, dropped = 0;
for (const f of fs.readdirSync(CLASSES, { withFileTypes: true })) {
  if (!f.isFile() || !/\.sc\.xml$/i.test(f.name)) continue;
  const p = path.join(CLASSES, f.name), s = rd(p), id = classOf(s);
  if (!id) continue;
  wr(path.join(MERGED, "classes", f.name), s); kept++;
  if (hdClass.has(id.toLowerCase())) {
    const hp = fs.readdirSync(HD_CLASSES).find(x => x.toLowerCase() === f.name.toLowerCase());
    if (hp) {
      const hdEls = new Set(elements(rd(path.join(HD_CLASSES, hp))).map(e => e.norm));
      const mine = elements(s).filter(e => !hdEls.has(e.norm) && !/^<properties\b[^>]*\b(edittree_pos|display_name)\b/.test(e.norm));
      if (mine.length) baseChanges[id.toLowerCase()] = mine.map(e => e.text);
    }
  }
}
for (const f of fs.readdirSync(COMMANDS)) wr(path.join(MERGED, "commands", f), rd(path.join(COMMANDS, f)));
wr(path.join(MERGED, "base-changes.json"), JSON.stringify(baseChanges, null, 1));
console.log(`${kept} classes and ${fs.readdirSync(COMMANDS).length} command files of the mod kept; ${Object.keys(baseChanges).length} of the game's classes changed`);

// the game's classes go from the port (they are the game's); so do the ones the clones replace (the clone step removes those)
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), id = classOf(rd(p));
  if (id && hdClass.has(id.toLowerCase())) { fs.rmSync(p); dropped++; }
}
console.log(`${dropped} classes of the game's own left out`);

// 2. the civilizations of the game, as the mod has them
require("./lib/clone-civs.js")({
  PORT: OUT, MERGED, SUFFIX: "Greek Mod 4.2", LABEL: "Gabbo", CIVS, cloneAllOrders: true, want,
});

// the branch switches nobody asks for any more (the originals of the scripts the clones copied with their own names, or dropped)
{
  const SUB = find(OUT, "DATA/SUBAI"), refs = new Set();
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) for (const m of rd(path.join(CLASSES, f)).matchAll(/data\/subai\/([^"]+\.vs)/gi)) refs.add(m[1].toLowerCase());
  let n = 0;
  for (const f of fs.readdirSync(SUB).filter(f => /_(ENABLE_OR_DISABLE_CMD|CAPTURED_BY_AI)\.VS$/i.test(f))) if (!refs.has(f.toLowerCase())) { fs.rmSync(path.join(SUB, f)); n++; }
  console.log(`${n} scripts of the branch choice nobody uses left out`);
}

// 3. Greece: its scripts
{
  // "if (race != ImperialRome) return;" ended at once on a Greek building (Greece has a race of its own now), and the engine started the behavior
  // again and again: the game hung. The scripts are only attached to Greek classes: the test goes. A test of the owner's race is the Greek one.
  const SUB = find(OUT, "DATA/SUBAI");
  for (const f of fs.readdirSync(SUB).filter(f => /\.vs$/i.test(f))) {
    const p = path.join(SUB, f), s0 = rd(p);
    const t = s0.replace(/^[ \t]*if\s*\(\s*[\w.()]*\.race\s*!=\s*ImperialRome\s*\)\s*\r?\n[ \t]*return\s*;[ \t]*\r?\n/m, "").replace(/GetPlayerRace\((\w+)\.player\)\s*==\s*ImperialRome/g, "Mod_TrueRace($1) == Greek");
    if (t !== s0) { wr(p, t); console.log(`${f}: tests of "ImperialRome" fixed for Greece`); }
  }
}
// 3. Greece: the classes the mod gave Imperial Rome's race ("ImperialRome" in 4.2 means Greece) have a race of their own
const GREEK_RACE = "greek";
const greekIds = new Set();
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), s = rd(p), id = classOf(s);
  if (id && /<properties\b[^>]*\brace\s*=\s*"ImperialRome"/.test(s)) { greekIds.add(id); wr(p, s.replace(/(\brace\s*=\s*")ImperialRome"/, `$1${GREEK_RACE}"`)); }
}
// the Greek children without a race of their own
for (let grew = true; grew;) {
  grew = false;
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) { const s = rd(path.join(CLASSES, f)), id = classOf(s), par = (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1]; if (id && !greekIds.has(id) && par && greekIds.has(par) && !/\brace\s*=/.test(s)) { greekIds.add(id); grew = true; } }
}
// the Greek pieces the mod drew over Imperial Rome's ids (walls, gates, tower, ambient villagers) are H* classes of Greece; the city builder asks
// for the pieces the mod did not draw by letter too: copies of the nearest Greek ones (the tavern, the arena)
const pieces = new Map();
{
  const mk = (src, id) => { wr(path.join(CLASSES, `${id.toUpperCase()}.SC.XML`), src.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${id}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "").replace(/\brace\s*=\s*"(ImperialRome|greek)"/, `race="${GREEK_RACE}"`)); greekIds.add(id); };
  for (const f of fs.readdirSync(path.join(MERGED, "classes")).filter(f => /^M(WALLS|GATE|TOWER|VILLAGER|WVILLAGER|VILLAGERAMBIENT|WVILLAGERAMBIENT)\w*\.SC\.XML$/i.test(f))) {
    const s0 = rd(path.join(MERGED, "classes", f)), id = classOf(s0);
    if (id && /ImperialRome/.test(s0) && !/^MVillager/i.test(id)) { mk(s0, "H" + id.slice(1)); pieces.set(id, "H" + id.slice(1)); }
  }
  const have = id => fs.existsSync(path.join(CLASSES, `${id.toUpperCase()}.SC.XML`));
  for (const [id, like] of [["HTavern", "HAgora"], ["HTavern2", "HAgora"], ["HArena", "HGymnasium"]]) if (!have(id) && have(like)) { mk(rd(path.join(CLASSES, `${like.toUpperCase()}.SC.XML`)), id); pieces.set(`#${id}`, id); }
}
console.log(`Greece: ${greekIds.size} classes with race "${GREEK_RACE}" (${pieces.size} city pieces among them)`);

// its commands: the whole Greek ones in GREEK42.XML, the Greek sources the mod added to the game's commands as patches
{
  const cmds = s => [...s.matchAll(/<cmd\b([^>]*)>([^]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
  const HDC = find(HD, "DATA/COMMANDS"), hdFiles = Object.fromEntries(fs.readdirSync(HDC).filter(f => /\.xml$/i.test(f)).map(f => [f.toUpperCase(), cmds(rd(path.join(HDC, f)).replace(/<!--[\s\S]*?-->/g, ""))]));
  const where = name => Object.keys(hdFiles).find(f => hdFiles[f].some(c => c.name === name));
  const ops = {}, own = [], seen = new Set(), sel = n => n.includes("'") ? `/commands/cmd[@name="${n}"]` : `/commands/cmd[@name='${n}']`;
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) {
    for (const c of cmds(rd(path.join(MERGED, "commands", f)).replace(/<!--[\s\S]*?-->/g, ""))) {
      const greek = c.src.filter(x => greekIds.has(x)); if (!greek.length) continue;
      const home = where(c.name);
      if (home) { for (const o of greek) if (!hdFiles[home].find(h => h.name === c.name).src.includes(o)) (ops[home] ||= []).push(`  <add select="${sel(c.name)}"><src obj="${o}"/></add>`); }
      else if (!seen.has(c.name)) { seen.add(c.name); own.push(c.src.length === greek.length ? c.text : c.text.replace(/<src\b[^>]*\/>\s*/g, "").replace(/<\/cmd>$/, greek.map(g => `\t<src obj="${g}"/>`).join("\n") + "\n</cmd>")); }
    }
  }
  // the repair, gate and wall orders the game offers on Imperial Rome's pieces are offered on the Greek copies; the tavern and the arena copies take
  // the orders of the Agora and the Gymnasium
  const also = { HTavern: "HAgora", HTavern2: "HAgora", HArena: "HGymnasium" };
  for (const [file, list] of Object.entries(hdFiles)) for (const c of list) {
    for (const [m, h] of pieces) if (!m.startsWith("#") && c.src.includes(m)) (ops[file] ||= []).push(`  <add select="${sel(c.name)}"><src obj="${h}"/></add>`);
  }
  for (let i = 0; i < own.length; i++) for (const [k, like] of Object.entries(also)) own[i] = own[i].replace(new RegExp(`(\\s*)<src obj="${like}"\\s*/>`, "g"), (m, sp) => `${m}${sp}<src obj="${k}"/>`);
  for (const f of fs.readdirSync(path.join(MERGED, "commands"))) fs.rmSync(path.join(COMMANDS, f), { force: true });
  wr(path.join(COMMANDS, "GREEK42.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
  for (const [file, list] of Object.entries(ops)) {
    const dest = path.join(OUT, "patches", "DATA", "COMMANDS", file), add = [...new Set(list)].join("\n");
    if (fs.existsSync(dest)) wr(dest, rd(dest).replace(/\s*<\/patch>\s*$/, `\n${add}\n</patch>\n`)); else wr(dest, `<patch>\n${add}\n</patch>\n`);
  }
  console.log(`Greece: ${own.length} commands, ${Object.values(ops).reduce((a, l) => a + new Set(l).size, 0)} sources added to the game's commands`);
}

// its AI (the mod's settlement scripts that treat Imperial Rome as Greece) runs only for Greek settlements
{
  const r = require("./lib/greek-ai.js")({ OUT, HD, prefix: "GR42_", constName: "Greek", varRe: /^AIV_(Max[A-Z]|Time)/ });
  console.log(`AI: ${r.names.length} scripts run as GR42_* (${r.loops.join(", ")})`);
}

// the menu skin: images stay, the layout becomes a patch of the keys it changed
console.log(`menu skin: ${require("./lib/menu-skin.js").skinToPatches({ OUT, HD })} layout files became patches of the keys they changed`);

// 4. the game's files the mod replaced: only what is Greek, as patches; the rest, and what the mod hid, goes
{
  fs.rmSync(path.join(OUT, "hidden.txt"), { force: true });
  const GREEK = /Greece|Greek|\bH[A-Z][a-z]|trainH\b|Athena|Aegle|Zeus|Circe|Hecate|Olympic|KAresGuard|Ares/;
  const { gameFilesToPatches } = require("./lib/independent.js");
  const r = gameFilesToPatches({ OUT, HD, GREEK, keep: /^(currentlang|ui\/menu)\//, skipFiles: /^DATA\/SUBAI\/(VERIFY_RESEARCH|UNIT_ATTACH_VERIFY)\.VS$/i });
  console.log(`game files: ${r.patches.length} became patches, ${r.dropped.length} left out`);
  fs.writeFileSync(path.join(ROOT, "raw", "greek-4-2-left-out.txt"), r.dropped.join("\n") + "\n\n" + r.report.join("\n") + "\n");
}

// the mod's const.ini patch tunes the game for everybody (player colors, language, raids...): not a civilization's. What is Greece's is the
// names of its heroes (MName00x of the old slot -> HName00x)
{
  const cp0 = path.join(OUT, "patches", "data", "const.ini");
  if (fs.existsSync(cp0)) {
    const names = [...rd(cp0).matchAll(/^\s*MName(00\d)\s*=\s*(.+?)\s*$/gm)].map(m => `HName${m[1]} = ${m[2]}`);
    fs.rmSync(cp0);
    if (names.length) wr(path.join(OUT, "patches", "DATA", "CONST.INI"), `[GamePlay]\r\n${names.join("\r\n")}\r\n`);
    console.log(`const.ini: ${names.length} Greek hero names; the mod's tuning of the game left out`);
  }
}

// the Greek priest names HD's druid_revitalize.vs, which reads a unit special ("revitalize") that only the mod's old engine hook declared: the game's
// compiler refuses the script ("No matching function with name revitalize") every time the class loads, and the ability never worked here
{
  const hp = path.join(CLASSES, "HPRIEST.SC.XML");
  if (fs.existsSync(hp)) { const t0 = rd(hp), t = t0.replace(/^[ \t]*<method\b[^>]*\bvs\s*=\s*"data\/subai\/druid_revitalize[^"]*"[^>]*\/>[ \t]*\r?\n?/gim, ""); if (t !== t0) { wr(hp, t); console.log("HPriest: the revitalize methods that cannot compile are gone"); } }
}
// scripts patched by hand (extras/greek-4-2-hand): what the generator cannot cut out of the mod's changes (they are all in one hunk)
{
  const HAND = path.join(ROOT, "extras", "greek-4-2-hand");
  for (const f of walk(HAND)) { const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(HAND, f), dst); }
}

// 5. the declarations: Greece (its own race, in no one's slot) and the clones'; the variants of the engine's old trick are gone
for (const f of ["romerepublican", "romeimperial", "romepunic", "carthagenumidian", "carthagemauritanian"]) fs.rmSync(path.join(OUT, "civs", `${f}.json`), { force: true });
{
  const alias = {};
  for (const id of greekIds) { const m = id.match(/^H(.+)$/); if (m && fs.existsSync(path.join(CLASSES, `${id.toUpperCase()}.SC.XML`))) alias[`M${m[1]}`] = id; }
  const gp = path.join(OUT, "civs", "greek.json"), g = JSON.parse(fs.readFileSync(gp, "utf8"));
  delete g.replacesBase; g.template = TEMPLATE; g.ai = true; g.alias = { classes: alias, commands: {} };
  g.name = { spanish: "Grecia (Gabbo)", english: "Greece (Gabbo)", italian: "Grecia (Gabbo)" };
  fs.rmSync(gp); fs.writeFileSync(gp, JSON.stringify(g, null, 2) + "\n", "utf8");
}
// the game's packs the mod replaced (Packs/*.bfhp: the random map's towns, the empty scenario...) go; the Greek towns and villages in its
// RandomMapSettlements are templates of Greece's own ("Greek Gabbo Town N") added by a patch, with the Greek pieces as H* classes
{
  const pack = find(OUT, "Packs/RandomMapSettlements.bfhp");
  if (pack) {
    const hpfs = require("./hpfs.js"), e = hpfs(fs.readFileSync(pack)).find(x => /maps\/1\/map\.obj\.xml$/i.test(x.path));
    const text = e.read().toString("latin1").replace(/\r\n/g, "\n").replace(/\bM(Tower|Walls[NSEW]+|Gate\d)\b/g, "H$1");
    const objRe = /<scriptobj\b[\s\S]*?\/>/g, out = [];
    let cursorX = 3000;
    for (let i = text.indexOf("<settlement"); i >= 0; i = text.indexOf("<settlement", i + 1)) {
      const xml = text.slice(i, text.indexOf("</settlement>", i) + 13), name = (/name="([^"]*)"/.exec(xml.slice(0, xml.indexOf(">"))) || [])[1];
      if (!name || !/^Greek (Town|Village)/.test(name)) continue;
      const objs = [...xml.matchAll(objRe)].map(m => ({ xml: m[0], x: +/\bx="(-?\d+)"/.exec(m[0])[1], y: +/\by="(-?\d+)"/.exec(m[0])[1] }));
      const minX = Math.min(...objs.map(o => o.x)), maxX = Math.max(...objs.map(o => o.x)), minY = Math.min(...objs.map(o => o.y)), maxY = Math.max(...objs.map(o => o.y));
      const dx = Math.round(cursorX + (maxX - minX) / 2 - (minX + maxX) / 2), dy = Math.round(26000 - (minY + maxY) / 2);
      const head = xml.slice(0, xml.indexOf(">") + 1).replace(/name="[^"]*"/, `name="${TEMPLATE}${name.slice("Greek".length)}"`);
      const body = objs.map((o, k) => "\t" + o.xml.replace(/(\bx=")-?\d+(")/, `$1${o.x + dx}$2`).replace(/(\by=")-?\d+(")/, `$1${o.y + dy}$2`).replace(/(\bnum=")\d+(")/, `$1${k}$2`).trim()).join("\n");
      out.push(`${head}\n${body}\n</settlement>`); cursorX += maxX - minX + 3000;
    }
    wr(path.join(OUT, "patches", "randommapsettlements", "maps", "1", "map.obj.xml"), `<patch>\n  <!-- Templates of ${TEMPLATE}: the Greek towns and villages of the Greek Mod 4.2. Free area of the map: y 24192-27904 -->\n  <add select="/mapobject">\n${out.join("\n")}\n  </add>\n</patch>\n`);
    console.log(`${out.length} Greek templates (${TEMPLATE})`);
    if (cursorX - 3000 > 31000) console.log("the Greek templates do not fit in the free area");
  }
  for (const f of ["RandomMapSettlements.bfhp", "emptyadv.bfhp", "emptyscn.bfhp", "randommap.BFHP"]) { const p = find(OUT, `Packs/${f}`); if (p) fs.rmSync(p); }
}

// names another mod of ours (or the game's own adventures) already has with other bytes: this port's are renamed (its Greek assets come from the
// CGWAR and the 1.8 lineage, so the same ids, folders, icons, sounds and scripts show up in all three)
{
  const { tagCollisions } = require("./lib/ported-patch.js");
  const G = path.join(ROOT, "originals", "game-data");
  // renaming a name changes the files that mention it, which can then differ from another mod's file at the same path: until nothing is left
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: "g42", others: [path.join(ROOT, "ported", "cgwar"), path.join(ROOT, "ported", "greek-mod-1-8"), G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: "Gabbo", skip: /^(currentlang|ui\/menu|data\/interface\/menu)\// });
    console.log(`own names (g42), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
}
// researches, orders and items two of these mods define under the same name ("Olympic Games", "Greek archers", "Charm of Athena"...): the name is the
// key of the research's state, so the one being ported takes a name of its own
{
  const { ownNames, tagNames } = require("./lib/ported-patch.js");
  const mine = ownNames(OUT, path.join(ROOT, "originals", "game-data", "paks")), clash = { cmds: new Set(), items: new Set() };
  for (const o of ["cgwar", "greek-mod-1-8"]) { const t = ownNames(path.join(ROOT, "ported", o), path.join(ROOT, "originals", "game-data", "paks")); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const names = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with the CGWAR or the 1.8: ${clash.cmds.size} orders, ${clash.items.size} items -> "(g42)" in ${tagNames({ OUT, names, tag: "g42" })} files`);
}
// two item scripts of the mod that the game's compiler cannot read (no signature line): the item's owner is the argument
for (const f of ["BELT OF SNAKES REMOVE.VS", "FEATHER AMULET REMOVE.VS"]) { const p = find(OUT, `DATA/ITEMSCRIPTS/${f}`); if (p && !/^\s*\/\//.test(rd(p))) wr(p, "//void, Obj owner\r\n" + rd(p)); }
{
  const mp = path.join(OUT, "mod.json"), j = JSON.parse(fs.readFileSync(mp, "utf8"));
  delete j.incompatibleWith; fs.rmSync(mp); fs.writeFileSync(mp, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("done");
