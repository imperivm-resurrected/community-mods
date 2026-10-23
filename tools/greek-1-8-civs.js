// Greek Mod 1.8: the game's civilizations as the mod changed them, each as a civilization of its own (AGENTS.md, "Civilizations are
// independent"). Run after tools/greek-1-8.js, which keeps what port-140.js merged for the game's classes in originals/greek-1-8-merged:
//   node tools/greek-1-8-civs.js [rome18 ...]       (no argument: every civilization of the table)
// For each one:
//   1. the SDK's clone-civilization.js clones it from HD, but starting from the mod's version of its classes and of its barracks
//      commands (HD + the 1.8 changes, merged by port-140.js): stats, costs, specials
//   2. what the 1.8 changed in the base classes it inherits (Ranged, Hero, Catapult...) is written inside each copy
//   3. the Rome branch choice (Enable_Or_Disable behaviors, the trainM* commands) is not ported (AGENTS.md); scripts the mod never
//      shipped are dropped from the classes; the mod's "Hero<unit>" classes become Hero<letter><unit>
//   4. the copies go into the port: classes, commands, patches that add the copy to shared commands (merged with the port's own)
// Not here (still pending, see NOTES.md): the mod's changes to shared research commands (ARENA/BLACKSMITH/TEMPLE/TAVERN.XML), the
// mod's maps (they place the game's R* classes), the mod's changes to game-wide files (unit_specials.ini, skills.ini).
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, ".."), PORT = path.join(ROOT, "ported", "greek-mod-1-8"), MERGED = path.join(ROOT, "originals", "greek-1-8-merged");
const HD = path.join(ROOT, "originals", "game-data", "DATA"), SDK = process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk");
const SUFFIX = "Greek Mod 1.8", LABEL = "Greek 1.8";                // the lobby's dropdown cuts a name at about 22 characters: LABEL is what shows
const CIVS = [
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "J", id: "rome18", index: 33,
    name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." },   // short: the dropdown cuts long names
    dropCmd: /^trainM/ },                                                          // the Imperial units in the Republican barracks: the Rome branch
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", letter: "L", id: "gaul18", index: 34, name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", letter: "P", id: "carthage18", index: 35, name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", letter: "O", id: "britain18", index: 36, name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", letter: "U", id: "iberia18", index: 37, name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", letter: "V", id: "egypt18", index: 38, name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", letter: "F", id: "germany18", index: 39, name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];
const DROP_BEHAVIOR = /_Enable_Or_Disable_Cmd\.vs$/i, NEVER = /(?!)/;
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const parentAttr = s => (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1];
const files = (d, re) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isFile() && re.test(e.name)).map(e => e.name) : [];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const ci = (d, name) => fs.readdirSync(d).find(f => f.toLowerCase() === name.toLowerCase());
const norm = s => s.replace(/\s+/g, " ").trim();
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };

if (!fs.existsSync(MERGED)) { console.error("run tools/greek-1-8.js first (it fills " + MERGED + ")"); process.exit(1); }
const BASE_CHANGES = new Map(Object.entries(readJson(path.join(MERGED, "base-changes.json"))));
const HD_CLASSES = path.join(HD, ci(HD, "classes")), HD_COMMANDS = path.join(HD, ci(HD, "commands"));
const PORT_CLASSES = path.join(PORT, "DATA", "CLASSES");
const hdScripts = new Set([...walk(HD), ...walk(PORT)].map(f => f.toLowerCase()));
const want = process.argv.slice(2);

for (const civ of CIVS.filter(c => !want.length || want.includes(c.id))) {
  const bl = civ.baseLetter, Id = civ.id[0].toUpperCase() + civ.id.slice(1);
  const OWN = new RegExp(`^(${bl}[A-Z]|${bl}house|${civ.hero}$)`);
  const report = [];
  // 1. the staged DATA: HD's classes and commands with the mod's version of the civilization's own over them
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), `civ-${civ.id}-`)), SC = path.join(stage, "CLASSES"), SM = path.join(stage, "COMMANDS");
  fs.mkdirSync(SC); fs.mkdirSync(SM);
  for (const f of files(HD_CLASSES, /\.sc\.xml$/i)) fs.copyFileSync(path.join(HD_CLASSES, f), path.join(SC, f));
  for (const f of files(HD_COMMANDS, /\.xml$/i)) fs.copyFileSync(path.join(HD_COMMANDS, f), path.join(SM, f));
  const stripBehavior = s => s.replace(/^[ \t]*<behavior\b[^>]*\bscript\s*=\s*"([^"]+)"[^>]*\/>[ \t]*\r?\n?/gim, (m, v) => DROP_BEHAVIOR.test(v) ? "" : m);
  let overlaid = 0;
  for (const f of files(path.join(MERGED, "classes"), /\.sc\.xml$/i)) {
    const s = rd(path.join(MERGED, "classes", f)), id = classOf(s);
    if (id && OWN.test(id)) { wr(path.join(SC, ci(SC, f) || f), stripBehavior(s)); overlaid++; }
  }
  for (const f of files(PORT_CLASSES, /\.sc\.xml$/i)) {                      // the mod's own new ones (RVillager_Apollonia...)
    const s = rd(path.join(PORT_CLASSES, f)), id = classOf(s);
    if (id && OWN.test(id) && !fs.existsSync(path.join(SC, f))) { wr(path.join(SC, f), stripBehavior(s)); overlaid++; }
  }
  const dropCmds = s => s.replace(/<cmd\b[^>]*?\bname\s*=\s*"([^"]*)"[\s\S]*?<\/cmd>[ \t]*\r?\n?/g, (m, n) => (civ.dropCmd || NEVER).test(n) ? (report.push(`command ${n} (Rome branch) not ported`), "") : m);
  // the merged command files that are the civilization's alone (every source is one of its classes): its barracks, temples...
  const ownCmds = [];
  for (const f of files(path.join(MERGED, "commands"), /\.xml$/i)) {
    const t = rd(path.join(MERGED, "commands", f)), srcs = [...t.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(m => m[1]);
    if (/SCELTA/i.test(f)) continue;                                      // RHT_SCELTA_ROMA: the Rome branch choice, not ported
    if (srcs.length && srcs.every(x => OWN.test(x))) { wr(path.join(SM, ci(SM, f) || f), dropCmds(t)); ownCmds.push(f); }
  }
  console.log(`${civ.id}: ${overlaid} classes and ${ownCmds.join(", ") || "no commands"} from the mod over HD's`);

  // clone it
  const out = fs.mkdtempSync(path.join(os.tmpdir(), `clone-${civ.id}-`));
  const r = cp.spawnSync("node", [path.join(SDK, "tools", "clone-civilization.js"), stage, out, civ.id, civ.letter, civ.base, String(civ.index)], { encoding: "utf8" });
  if (r.status) { console.error(r.stdout + r.stderr); process.exit(1); }
  console.log(r.stdout.trim());
  const json = readJson(path.join(out, "civs", `${civ.id}.json`));
  const rename = new Map(Object.entries(json.alias.classes));            // old id -> new id
  const OLD = new Map([...rename].map(([o, n]) => [n.toLowerCase(), o]));

  // 2. base-class changes of the 1.8, inside each copy (the farthest ancestor first, the nearest wins). The copy's own parent, when it is
  // a copy too, has them already
  const parentOf = new Map();
  for (const f of files(SC, /\.sc\.xml$/i)) { const s = rd(path.join(SC, f)), id = classOf(s); if (id) parentOf.set(id.toLowerCase(), parentAttr(s)); }
  const inherited = id => { const o = []; for (let p = parentOf.get(id.toLowerCase()); p && o.length < 20; p = parentOf.get(p.toLowerCase())) { if (rename.has(p)) break; o.push(p.toLowerCase()); } return o; };
  const decorate = (s, from) => {
    const extra = [];
    for (const b of inherited(from).reverse()) for (const e of BASE_CHANGES.get(b) || []) if (!s.includes(norm(e)) && !extra.includes(e)) extra.push(e);
    return extra.length ? [s.replace(/(<class\b[^>]*>)/, `$1\n\t<!-- changes the ${SUFFIX} made to its base classes -->\n\t${extra.join("\n\t")}`), extra.length] : [s, 0];
  };
  // 3. the mod's Hero<unit> classes (unmounted heroes for the editor): Hero<letter><unit>
  const heroes = [];
  for (const f of files(PORT_CLASSES, /^hero.*\.sc\.xml$/i)) {
    const s = rd(path.join(PORT_CLASSES, f)), id = classOf(s);
    if (!id || !new RegExp(`^Hero${bl}[A-Z]`).test(id)) continue;
    const nid = `Hero${civ.letter}${id.slice(5)}`;
    wr(path.join(out, "data", "classes", `${nid}.sc.xml`), s.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${nid}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "").replace(/\brace\s*=\s*"[^"]+"/, `race="${Id}"`));
    parentOf.set(nid.toLowerCase(), parentAttr(s)); OLD.set(nid.toLowerCase(), id); heroes.push(path.join(PORT_CLASSES, f));
  }
  let inlined = 0, gone = 0;
  const classFiles = files(path.join(out, "data", "classes"), /\.sc\.xml$/i);
  for (const f of classFiles) {
    const p = path.join(out, "data", "classes", f); let s = rd(p);
    const nid = classOf(s), [t, n] = decorate(s, nid); s = t; inlined += n;
    // a script neither the mod nor the game has (the 1.8 never shipped them): the game could not run it
    s = s.replace(/^[ \t]*<(behavior|method)\b[^>]*?\b(?:script|vs)\s*=\s*"(data\/[^"]+\.vs)"[^>]*\/>[ \t]*\r?\n?/gim, (m, _t, v) => hdScripts.has(v.toLowerCase()) ? m : (gone++, ""));
    // race of the hero children that name the base's race by id
    wr(path.join(PORT_CLASSES, `${nid.toUpperCase()}.SC.XML`), s);
  }
  console.log(`${classFiles.length} classes (${heroes.length} editor heroes), ${inlined} base-class elements inside them, ${gone} references to missing scripts removed`);
  // the mod's own copies of what is cloned now go
  for (const f of heroes) fs.rmSync(f);
  for (const [o] of rename) { const hit = ci(PORT_CLASSES, `${o}.SC.XML`); if (hit) { const id = classOf(rd(path.join(PORT_CLASSES, hit))); if (id === o) fs.rmSync(path.join(PORT_CLASSES, hit)); } }

  // the mod's own new classes that its maps place (RVillager_Apollonia...): the maps name the copies
  {
    const hdIds = new Set(files(HD_CLASSES, /\.sc\.xml$/i).map(f => (classOf(rd(path.join(HD_CLASSES, f))) || "").toLowerCase()));
    const fresh = [...rename].filter(([o]) => !hdIds.has(o.toLowerCase()));
    if (fresh.length) {
      const hpfs = require("./hpfs.js"), re = new RegExp(`(?<![A-Za-z0-9])(${fresh.map(([o]) => o).join("|")})(?![A-Za-z0-9])`, "g"), to = Object.fromEntries(fresh);
      let touched = 0;
      for (const f of walk(PORT).filter(f => /^(scenarios|adventures|conquests)\/.*\.bfhp$/i.test(f))) {
        const p = path.join(PORT, f), buf = fs.readFileSync(p); let dirty = false;
        try { for (const e of hpfs(buf)) { if (!/\.(xml|vs)$/i.test(e.path)) continue; const t = e.read().toString("latin1"), n = t.replace(re, m => to[m]); if (n !== t) { e.write(Buffer.from(n, "latin1")); dirty = true; } } }
        catch (err) { report.push(`${f}: ${err.message}`); continue; }
        if (dirty) { fs.writeFileSync(p, buf); touched++; }
      }
      console.log(`${civ.id}: ${fresh.length} classes of the mod's own (${fresh.map(x => x[0]).join(", ")}) renamed in ${touched} maps`);
    }
  }
  // 4. commands and patches
  const cmdFile = path.join(out, "data", "commands", `${Id}.xml`);
  wr(path.join(PORT, "DATA", "COMMANDS", `${Id.toUpperCase()}.XML`), rd(cmdFile));
  for (const f of files(path.join(out, "patches", "data", "commands"), /\.xml$/i)) {
    const add = rd(path.join(out, "patches", "data", "commands", f)).replace(/^[\s\S]*?<patch>\s*/, "").replace(/\s*<\/patch>[\s\S]*$/, "");
    const dest = path.join(PORT, "patches", "DATA", "COMMANDS", f.toUpperCase());
    if (fs.existsSync(dest)) wr(dest, rd(dest).replace(/\s*<\/patch>\s*$/, `\n${add}\n</patch>\n`));
    else wr(dest, `<patch>\n${add}\n</patch>\n`);
  }
  json.name = Object.fromEntries(Object.entries(civ.name).map(([k, v]) => [k, `${v} (${LABEL})`]));
  wr(path.join(PORT, "civs", `${civ.id}.json`), JSON.stringify(json, null, 2) + "\n");
  if (report.length) console.log("to check:\n  " + report.join("\n  "));
}
