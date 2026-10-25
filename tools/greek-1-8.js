// Greek Mod 1.8: Greece as a civilization of its own (civs/greek18.json), independent of the game's and of the other
// Greek mods (AGENTS.md, "Civilizations are independent"). Run after tools/port-140.js has built ported/greek-mod-1-8:
//   node tools/greek-1-8.js [--dry]       (--dry: only lists the names it would rename)
// The 1.8 put Greece in Imperial Rome's slot with the letter H and edited the game's files. Here:
//   - every Greek name (class ids, commands, entity folders, sprites, icons, voices) starts with Q instead of H, one letter for
//     one letter (HHoplite -> QHoplite, trainHHoplite -> trainQHoplite, Units/HHOPLITE -> Units/QHOPLITE); the engine builds
//     names from the letter, so the commands it asks for are trainpeasantq and hireheroQ
//   - the Greek classes have race="greek18"; the Greek walls, gates and tower the mod drew over Imperial Rome's M* ids become
//     Q* classes, and Imperial Rome stays the game's
//   - what the mod changed in the game's civilizations is NOT here: each one is going to be its own civilization (a later step)
//     and the changes to base classes (Melee, Hero...) are written inside the Greek classes that inherit from them
//   - game files it edited: commands, items, formations and the random map objects become patches that add the Greek part;
//     its AI scripts run as GR18_* for Greek settlements only (a patch on each game helper hands them over); the two
//     script hooks of Greek researches and items are patches; the Greek names for heroes are QName00x in const.ini
//   - the maps, adventures, conquests and videos of the mod stay in it; the Greek classes they place are renamed inside the .bfhp
//     (HPFS, rewritten in place). The menu skin (CURRENTLANG, UI/MENU, MAINMENU.INI, TEMPLATE.INI) stays too: it is cosmetic and only one can show
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "ported", "greek-mod-1-8"), EXTRAS = path.join(ROOT, "extras", "greek-mod-1-8");
const HD = path.join(ROOT, "originals", "game-data", "paks"), MOD140 = path.join(ROOT, "originals", "greek-mod-1.8-flat");
const LETTER = "Q", RACE = "greek18", INDEX = 32, INTERNAL = "Greek18", TEMPLATE = "Greek Rattlesmake";   // a template name is letters and spaces only
const dry = process.argv.includes("--dry");
// What port-140.js merged for the game's own classes and commands (HD + the mod's changes) is kept here before this script drops it:
// tools/greek-1-8-civs.js reads it to give each of the game's civilizations the changes the 1.8 made to it
const MERGED = path.join(ROOT, "originals", "greek-1-8-merged");
fs.rmSync(MERGED, { recursive: true, force: true });
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const rm = rel => { const p = find(OUT, rel); if (p) fs.rmSync(p, { recursive: true, force: true }); return !!p; };
const TEXT = /\.(xml|vs|ini|txt)$/i;
const report = [];

// ---- 0. what is not in the mod ---------------------------------------------------------------------------------------
// (nothing is left out here: the maps, adventures, conquests and videos of the mod stay in it)

// ---- 0b. the mod's Italian texts ---------------------------------------------------------------------------------------
// port-140.js only knows the Spanish table (flatten-paks.js unpacks only Local\spanish.pak). The mod also ships Local\italian.pak: what its
// tables say that HD's Italian ones do not goes to loc/italian.loc.xml, the same rule as loc/spanish.loc.xml (new keys and changed ones), and it
// is renamed with the rest of the text files below. English has 4 entries (no Greek text: the keys are English); Czech is a whole translation of
// the game, a language HD does not have, and is not ported. CREDITS.TXT goes to local/italian as the Spanish one goes to local/spanish.
{
  const pak = path.join(ROOT, "originals", "greek-mod-1.8-full", "GreekMod_1.8", "Local", "italian.pak"), HDL = path.join(ROOT, "originals", "game-data", "local-italian", "CURRENTLANG");
  if (fs.existsSync(pak) && fs.existsSync(HDL)) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "it-")), g = path.join(tmp, "game");     // extract-data.js reads the Packs\ of a game folder
    fs.mkdirSync(path.join(g, "Packs"), { recursive: true }); fs.copyFileSync(pak, path.join(g, "Packs", "italian.pak"));
    const r = cp.spawnSync("node", [path.join(process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk"), "tools", "extract-data.js"), g, path.join(tmp, "out"), "italian.pak"], { encoding: "utf8" });
    if (r.status) { console.error(r.stderr || r.stdout); process.exit(1); }
    const decode = b => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; };
    const entries = f => { const m = new Map(); if (fs.existsSync(f)) for (const e of decode(fs.readFileSync(f)).matchAll(/<translationtableentry\b[^>]*?\/>/g)) {
      const t = (e[0].match(/\btext="([^"]*)"/) || [])[1], c = (e[0].match(/\bcontext="([^"]*)"/) || [])[1] || "", res = (e[0].match(/\bresult="([^"]*)"/) || [])[1];
      if (t != null) m.set(t + "\0" + c, { res, line: e[0] }); } return m; };
    const out = new Map(), CL = find(path.join(tmp, "out"), "CURRENTLANG");
    for (const f of ["GAME.LOC.XML", "TRANSLATION.LOC.XML"]) {
      const mine = entries(find(CL, f) || path.join(CL, f)), hd = entries(path.join(HDL, f));
      for (const [k, e] of mine) if ((!hd.has(k) || hd.get(k).res !== e.res) && !out.has(k)) out.set(k, e.line);
    }
    fs.mkdirSync(path.join(OUT, "loc"), { recursive: true });
    fs.writeFileSync(path.join(OUT, "loc", "italian.loc.xml"), "\ufeff<translationtable>\n" + [...out.values()].join("\n") + "\n</translationtable>\n", "utf8");
    const cr = find(CL, "CREDITS.TXT");
    if (cr) { fs.mkdirSync(path.join(OUT, "local", "italian"), { recursive: true }); fs.copyFileSync(cr, path.join(OUT, "local", "italian", "CREDITS.TXT")); }
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`${out.size} Italian texts (loc/italian.loc.xml)`);
  } else report.push("no Local\\italian.pak or HD Italian texts: loc/italian.loc.xml not written");
}

// ---- 1. the Greek names: what the mod defines and the game does not ----------------------------------------------------
const files = walk(OUT);
const names = new Map();                                   // lowercase old name -> { old, at } (at: index of the letter in it)
const add = (old, at) => { const k = old.toLowerCase(); if (!names.has(k)) names.set(k, { old, at }); };
const HDCLASS = find(HD, "DATA/CLASSES");
const hdClass = new Set(walk(HDCLASS).filter(f => /\.sc\.xml$/i.test(f)).map(f => (classOf(rd(path.join(HDCLASS, f))) || "").toLowerCase()));
for (const f of files.filter(f => /^DATA\/CLASSES\/[^/]+\.SC\.XML$/i.test(f))) {
  const id = classOf(rd(path.join(OUT, f)));
  if (!id || hdClass.has(id.toLowerCase())) continue;
  if (/^H[A-Z]|^Hhouse\d/.test(id)) { add(id, 0); }
  else if (/^HeroH[A-Z]/.test(id)) add(id, 4);
}
for (const f of files.filter(f => /^DATA\/AI\//i.test(f)))                 // AIV_MaxHHoplite: the AI's limit of a Greek unit
  for (const m of rd(path.join(OUT, f)).matchAll(/AIV_MaxH[A-Za-z_]+/g)) add(m[0], 7);
add("GreekHero", -1);                                      // no letter in it: Q goes in front
for (const f of files.filter(f => /^DATA\/COMMANDS\//i.test(f)))
  for (const m of rd(path.join(OUT, f)).matchAll(/<cmd\b[^>]*?\bname\s*=\s*"([^"]+)"/g)) {
    const n = m[1];
    if (/^train(H[A-Z]\w*)$/.test(n)) add(n, 5);
    else if (/^H[A-Z]\w*$/.test(n) && !/^H(Align|IDDEN)/.test(n)) add(n, 0);
    else if (/^(trainpeasant|hirehero)h$/i.test(n)) add(n, n.length - 1);
  }
// art, icons, voices, sprites: by stem
const STEM = /^(Hero)?H(Agora|Barracks|Blacksmith|Chariot|CmdBar|Gymnasium|Hero|Hoplite|House|Hypaspista|Myrmidon|Priest|Sentry|Temple|Tower|Townhall|Totoxes|Toxotes|Village|Villager|WVillager|Wall|Gates|Walls|GuardPostSentry|Centaur|ReligiousFeast|Restoration|AddPop|Tribute|MaleVillager|_Die)\w*$/i;
const seen = new Set();
for (const f of files.filter(f => !/^(minimap|music|civs|loc|local)\//i.test(f)))
  for (const part of f.split("/")) {
    const stem = part.replace(/(\.(ent|sc|rle|pass))*\.[^.]*$/i, ""), k = stem.toLowerCase();
    if (seen.has(k)) continue; seen.add(k);
    const v = stem.replace(/^voice/i, "").replace(/^train/i, "");
    const pre = stem.length - v.length;
    if (/^hire hero/i.test(stem)) { add(stem, stem.length - 1); continue; }
    const m = v.match(STEM);
    if (m) add(stem, pre + (m[1] ? 4 : 0));
  }
for (const k of [...names.keys()]) { const n = names.get(k); if (n.at >= 0 && !/h/i.test(n.old[n.at])) names.delete(k); }
add("MWalls", 0);                                          // the folder of Greek wall art that the mod put under an Imperial Rome name
const list = [...names.values()].sort((a, b) => b.old.length - a.old.length);
if (dry) { console.log(`${list.length} names:\n${list.map(n => n.old).sort().join(" ")}`); process.exit(0); }

// one regex, longest first; a name is not part of a longer word (letters and digits around it); "_" and "." end it
const RE = new RegExp(`(?<![A-Za-z0-9])(${list.map(n => n.old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![A-Za-z0-9])`, "gi");
const swap = s => s.replace(RE, m => {
  const n = names.get(m.toLowerCase()), up = m[Math.max(n.at, 0)] === m[Math.max(n.at, 0)].toUpperCase();
  const L = up ? LETTER : LETTER.toLowerCase();
  return n.at < 0 ? L + m : m.slice(0, n.at) + L + m.slice(n.at + 1);
});
let swapped = 0;
for (const f of walk(OUT)) {
  const p = path.join(OUT, f);
  if (TEXT.test(f)) { const s = rd(p), n = swap(s); if (n !== s) { wr(p, n); swapped++; } }
}
// file names (a folder is renamed by moving its files); the folders left empty go
const moves = walk(OUT).map(f => [f, swap(f)]).filter(([a, b]) => a !== b);
let moved = 0;
for (const [from, to] of moves) { const a = path.join(OUT, from), b = path.join(OUT, to); fs.mkdirSync(path.dirname(b), { recursive: true }); fs.renameSync(a, b); moved++; }
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
console.log(`${list.length} Greek names: ${swapped} text files rewritten, ${moved} files/folders renamed`);

// the maps: HPFS containers; the Greek classes they place are renamed in place (one letter for another)
{
  const hpfs = require("./hpfs.js"); let maps = 0, touched = 0, failed = 0, names = 0;
  for (const f of walk(OUT).filter(f => /^(scenarios|adventures|conquests)\/.*\.bfhp$/i.test(f))) {
    const p = path.join(OUT, f); maps++;
    const buf = fs.readFileSync(p); let dirty = false;
    try {
      for (const e of hpfs(buf)) {
        if (!/\.(xml|vs)$/i.test(e.path)) continue;
        const text = e.read().toString("latin1"), n = swap(text);
        if (n === text) continue;
        try { e.write(Buffer.from(n, "latin1")); dirty = true; names += (text.match(RE) || []).length; }
        catch (err) { failed++; report.push(`${f}: ${e.path}: ${err.message}`); }
      }
    } catch (err) { report.push(`${f}: not read as HPFS (${err.message})`); continue; }
    if (dirty) { fs.writeFileSync(p, buf); touched++; }
  }
  console.log(`${maps} maps: ${touched} with Greek classes rewritten (${names} names)${failed ? `, ${failed} failed` : ""}`);
}

// ---- 2. classes ----------------------------------------------------------------------------------------------------
const CLASSES = find(OUT, "DATA/CLASSES");
const HDCLASS_FILES = walk(HDCLASS).filter(f => /\.sc\.xml$/i.test(f)), HDCLASS_IDS = new Map(HDCLASS_FILES.map(f => [(classOf(rd(path.join(HDCLASS, f))) || "").toLowerCase(), path.join(HDCLASS, f)]));
const hdFile = id => HDCLASS_IDS.get(id.toLowerCase());
// 2a. what the mod changed in base classes (HD's Melee, Hero...), as the elements it added or changed
const elements = s => { // direct children of <class>: [{ text, norm }]
  const body = s.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, ""), out = [];
  for (const m of body.matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)) out.push({ text: m[0].trim(), norm: m[0].replace(/\s+/g, " ").trim() });
  return out;
};
const BASE_CHANGES = new Map();                            // lowercase base class id -> elements the mod changed or added
for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const s = rd(path.join(CLASSES, f)), id = classOf(s), h = id && hdFile(id);
  if (!h) continue;
  const hdEls = new Set(elements(rd(h)).map(e => e.norm)), mine = elements(s).filter(e => !hdEls.has(e.norm) && !/^<properties\b[^>]*\b(edittree_pos|display_name)\b/.test(e.norm));
  if (mine.length) BASE_CHANGES.set(id.toLowerCase(), mine);
}
wr(path.join(MERGED, "base-changes.json"), JSON.stringify(Object.fromEntries([...BASE_CHANGES].map(([k, v]) => [k, v.map(e => e.text)])), null, 1));
// 2b. the classes the mod defines and the game does not, and the chain of parents of each
const parentOf = new Map(), modClasses = new Map();
for (const dir of [HDCLASS, CLASSES]) for (const f of fs.readdirSync(dir, { recursive: true }).filter(f => /\.sc\.xml$/i.test(f))) {
  const s = rd(path.join(dir, f)), id = classOf(s); if (!id) continue;
  parentOf.set(id.toLowerCase(), (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1]);
  if (dir === CLASSES && !hdClass.has(id.toLowerCase())) modClasses.set(id.toLowerCase(), path.join(dir, f));
}
const chain = id => { const o = []; for (let c = id.toLowerCase(); c; c = (parentOf.get(c) || "").toLowerCase()) { o.push(c); if (o.length > 20) break; } return o; };
const greek = [...modClasses.keys()].filter(id => /^(q[a-z]|heroq[a-z])/i.test(id) || id === "qgreekhero");
let inlined = 0;
for (const id of greek) {
  const p = modClasses.get(id); let s = rd(p);
  const ch = chain(id).slice(1), extra = [];
  for (const b of ch.reverse()) for (const e of BASE_CHANGES.get(b) || []) extra.push(e.text);   // farthest ancestor first: nearer ones win
  // race: the Greek classes are greek18, not Imperial Rome
  s = s.replace(/\brace\s*=\s*"(ImperialRome|Imperial Rome)"/, `race="${RACE}"`);
  if (extra.length) { s = s.replace(/(<class\b[^>]*>)/, `$1\n\t<!-- changes the 1.8 made to its base classes -->\n\t${extra.join("\n\t")}`); inlined += extra.length; }
  wr(p, s);
}
console.log(`${greek.length} Greek classes, ${inlined} base-class elements written inside them`);

// 2c. the Greek pieces the mod drew over Imperial Rome's ids (M* walls, gates, tower): Q* classes
let pieces = 0;
for (const f of fs.readdirSync(CLASSES).filter(f => /^M(WALLS|GATE|TOWER|VILLAGER|WVILLAGER|VILLAGERAMBIENT|WVILLAGERAMBIENT)\w*\.SC\.XML$/i.test(f))) {
  const s = rd(path.join(CLASSES, f)), id = classOf(s), q = LETTER + id.slice(1);
  const n = s.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${q}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "").replace(/\brace\s*=\s*"(ImperialRome|Imperial Rome)"/, `race="${RACE}"`);
  wr(path.join(CLASSES, `${q.toUpperCase()}.SC.XML`), n); pieces++;
}
// the city builder asks by letter for pieces the mod did not draw: copies of the nearest Greek ones
const cls = id => { const k = modClasses.get(id.toLowerCase()); const p = fs.existsSync(path.join(CLASSES, `${id.toUpperCase()}.SC.XML`)) ? path.join(CLASSES, `${id.toUpperCase()}.SC.XML`) : k; return p && fs.existsSync(p) ? rd(p) : null; };
const copyAs = (from, to) => { const s = cls(from); if (s) { wr(path.join(CLASSES, `${to.toUpperCase()}.SC.XML`), s.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${to}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "")); pieces++; } else report.push(`no ${from} to make ${to}`); };
copyAs("QAgora", "QTavern"); copyAs("QAgora", "QTavern2"); copyAs("QGymnasium", "QArena");
// 2d. every class of the game the mod re-defined goes: they are the game's civilizations, each its own civilization in the next step
let dropped = 0;
for (const f of fs.readdirSync(CLASSES, { recursive: true }).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), id = classOf(rd(p));
  if (id && hdClass.has(id.toLowerCase())) { if (!/[\\/]/.test(f)) wr(path.join(MERGED, "classes", f), rd(p)); fs.rmSync(p); dropped++; }   // (the clone tool reads the top folder only: WINTER/ has same-named files)
}
for (const d of fs.readdirSync(CLASSES, { withFileTypes: true }).filter(e => e.isDirectory())) { const p = path.join(CLASSES, d.name); if (!fs.readdirSync(p).length) fs.rmdirSync(p); }
console.log(`${pieces} Q* pieces; ${dropped} classes of the game's civilizations left out`);

// The 1.8 behavior scripts that start with `if (race != ImperialRome) return;` (1.8 Greece WAS Imperial Rome, so it never returned there).
// Greece has its own race now, so the test is true on the first run, the script ends at once, the engine starts it again at once,
// and the game clock never moves: the game hangs (the HANG of the first independent builds: CVXThreadManager::UnlinkThread,
// CVXScriptObj::StartScriptSlot). The script is only attached to Greek classes, so the test goes.
{
  let n = 0;
  for (const f of walk(OUT).filter(f => /^DATA\/SUBAI\/[^/]+\.vs$/i.test(f))) {
    const p = path.join(OUT, f), s = rd(p);
    const t = s.replace(/^[ \t]*if\s*\(\s*[\w.()]*\.race\s*!=\s*ImperialRome\s*\)\s*\r?\n[ \t]*return\s*;[ \t]*\r?\n/m, "");
    if (t !== s) { wr(p, t); n++; }
  }
  if (n) report.push(`${n} behavior script(s) lost their "race != ImperialRome" early return (it ended at once and the engine started it again, forever: the game hung)`);
}
// a behavior script of a Greek class that can end before its first Sleep is restarted at once, forever: report each one
{
  const seenB = new Set();
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f)))
    for (const m of rd(path.join(CLASSES, f)).matchAll(/<behavior\b[^>]*\bscript\s*=\s*"([^"]+)"/gi)) seenB.add(m[1].toLowerCase());
  for (const b of seenB) {
    const p = find(OUT, b.replace(/^data\//, "DATA/")); if (!p) continue;      // the game's own scripts are fine
    const code = rd(p).replace(/\/\/.*$/gm, ""), i = code.search(/\breturn\s*;/), j = code.search(/\bSleep\s*\(/);
    if (i >= 0 && (j < 0 || i < j)) report.push(`${b}: can return before its first Sleep: the engine would restart it forever (hang)`);
  }
}
// a class that names a script neither the mod nor the game has (the 1.8 never shipped them): the game could not run it, the line goes
{
  const have = new Set([...walk(OUT), ...walk(HD)].map(f => f.toLowerCase()));
  let gone = 0;
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
    const p = path.join(CLASSES, f), s = rd(p);
    const n = s.replace(/^[ \t]*<(behavior|method)\b[^>]*?\b(?:script|vs)\s*=\s*"(data\/[^"]+\.vs)"[^>]*\/>[ \t]*\r?\n?/gim, (m, _t, v) => (have.has(v.toLowerCase()) ? m : (gone++, "")));
    if (n !== s) wr(p, n);
  }
  if (gone) report.push(`${gone} references to scripts the mod never shipped removed from classes`);
}

// ---- 3. commands: only the Greek part, as patches -------------------------------------------------------------------------
const cmds = s => [...s.matchAll(/<cmd\b([^>]*)>([^]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
const HD_CMDS = find(HD, "DATA/COMMANDS"), MOD_CMDS = find(OUT, "DATA/COMMANDS");
const hdCmdFiles = Object.fromEntries(fs.readdirSync(HD_CMDS).filter(f => /\.xml$/i.test(f)).map(f => [f.toUpperCase(), cmds(rd(path.join(HD_CMDS, f)))]));
const where = name => Object.keys(hdCmdFiles).find(f => hdCmdFiles[f].some(c => c.name === name));
const isModClass = c => !hdClass.has(c.toLowerCase());
const ops = {}, own = [], sel = n => n.includes("'") ? `/commands/cmd[@name="${n}"]` : `/commands/cmd[@name='${n}']`;
const addSrc = (file, name, obj) => { (ops[file] ||= []); const l = `  <add select="${sel(name)}"><src obj="${obj}"/></add>`; if (!ops[file].includes(l)) ops[file].push(l); };
const ownNames = new Set();
for (const f of fs.readdirSync(MOD_CMDS).filter(f => /\.xml$/i.test(f))) {
  const isHd = hdCmdFiles[f.toUpperCase()];
  for (const c of cmds(rd(path.join(MOD_CMDS, f)))) {
    if (isHd) {
      const greekSrc = c.src.filter(isModClass); if (!greekSrc.length) continue;
      const home = where(c.name);
      if (home) { for (const o of greekSrc) if (!hdCmdFiles[home].find(h => h.name === c.name).src.includes(o)) addSrc(home, c.name, o); }
      else if (!ownNames.has(c.name)) { own.push(c.text); ownNames.add(c.name); }
    } else if (!ownNames.has(c.name) && c.src.some(isModClass)) { own.push(c.text); ownNames.add(c.name); }
  }
  wr(path.join(MERGED, "commands", f), rd(path.join(MOD_CMDS, f)));
  fs.rmSync(path.join(MOD_CMDS, f));                       // its Greek commands are in GREEK18.XML now
}
// the Greek pieces that stand for the game's: the commands of the building they copy
for (const [k, like] of [["QTavern", "QAgora"], ["QTavern2", "QAgora"], ["QArena", "QGymnasium"]]) {
  for (let i = 0; i < own.length; i++) own[i] = own[i].replace(new RegExp(`(\\s*)<src obj="${like}"\\s*/>`, "g"), (m, sp) => `${m}${sp}<src obj="${k}"/>`);
}
wr(path.join(MOD_CMDS, "GREEK18.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
for (const [file, list] of Object.entries(ops)) wr(path.join(OUT, "patches", "DATA", "COMMANDS", file), `<patch>\n${list.join("\n")}\n</patch>\n`);
console.log(`${own.length} Greek commands, ${Object.values(ops).reduce((a, l) => a + l.length, 0)} source patches in ${Object.keys(ops).length} files`);

// ---- 4. files of the game it edited: only what is Greek, as patches -------------------------------------------------------
// line diff of two scripts -> script patch directives (@after/@before/@bottom); only the pure insertions whose text passes `keep`
// (the Greek part: what the mod changed for the game's civilizations is not here). An anchor is a line of the original that holds
// text no earlier line holds; if the line the insertion follows or precedes is not one, it is reported and left out
const { vsPatch: vsp, xmlAdded, tagFiles } = require("./lib/ported-patch.js");
const vsPatch = (hd, mod, keep, label) => vsp(hd, mod, keep, label, report);
const hdRel = rel => find(HD, rel);
const patches = [];
// 4a. the scripts with Greek behavior: the Greek insertions as patches. The recruiting helpers (TSH_*) decide with "Greece = ImperialRome",
// which a patch would apply to the game's Imperial Rome too: the Greek AI goes through the GR18_* scripts only
const GREEK_TEXT = /Athena|Aegle|Zeus|Greece|Greek|Supplies|Trade Routes|Strengthen Stronghold|\bQ[A-Z][a-z]|trainQ|greek_/;
for (const rel of ["DATA/SUBAI/ONFINISH_RESEARCH.VS", "DATA/SUBAI/UNIT_ON_KILL.VS"]) {
  const mp = find(OUT, rel), hp = hdRel(rel); if (!mp || !hp) { report.push(`${rel}: not found`); continue; }
  const ptch = vsPatch(rd(hp), rd(mp), t => GREEK_TEXT.test(t), rel); fs.rmSync(mp);
  if (ptch) { wr(path.join(OUT, "patches", rel.replace(/\.VS$/i, ".vs")), ptch); patches.push(rel); }
}
// 4b. items, formations and random map objects the mod only added to: the added elements as a patch
const xmlAddPatch = (rel, root) => {
  const mp = find(OUT, rel), hp = hdRel(rel); if (!mp || !hp) return;
  const r = xmlAdded(rd(hp), rd(mp), root, report, rel); fs.rmSync(mp);
  if (!r) return;
  wr(path.join(OUT, "patches", rel), r.xml); patches.push(`${rel} (${r.count} elements)`);
};
xmlAddPatch("DATA/ITEMS.XML", "items"); xmlAddPatch("DATA/FORMATIONS.XML", "formations");
// 4c. const.ini: the Greek names for heroes (MName00x -> QName00x)
{
  const mp = find(OUT, "DATA/CONST.INI"), hp = hdRel("DATA/CONST.INI");
  if (mp && hp) {
    const get = s => new Map([...s.matchAll(/^\s*(MName00\d)\s*=\s*(.+?)\s*$/gm)].map(m => [m[1], m[2]]));
    const A = get(rd(hp)), B = get(rd(mp)), lines = [`[GamePlay]`];                  // the section the game's own MName00x are in
    for (const [k, v] of B) if (A.get(k) !== v) lines.push(`${LETTER}${k.slice(1)} = ${v}`);
    const mm = rd(mp).match(/^\s*MaxMyrmidonsValue\s*=\s*(\d+)/m);             // a key HD does not have: the Myrmidon scripts read it with GetConst
    if (mm && !/^\s*MaxMyrmidonsValue\s*=/m.test(rd(hp))) lines.push(`MaxMyrmidonsValue = ${mm[1]}`);
    fs.rmSync(mp);
    if (lines.length > 1) { wr(path.join(OUT, "patches", "DATA", "CONST.INI"), lines.join("\r\n") + "\r\n"); patches.push("DATA/CONST.INI (hero names)"); }
  }
}
console.log(`patches: ${patches.join("; ")}`);

// ---- 5. the Greek interface: files the game looks up by the civilization's internalName ---------------------------------
const mvTo = (from, to, fn = s => s) => { const p = find(OUT, from); if (p) { wr(path.join(path.dirname(p), to), fn(rd(p))); fs.rmSync(p); } else report.push(`${from}: not found`); };
mvTo("DATA/INTERFACE/INFOBAR/INFOBAR_IROME.INI", `INFOBAR_${INTERNAL.toUpperCase()}.INI`);
mvTo("DATA/INTERFACE/CMDBAR/CMDBARIROME.INI", `CMDBAR${INTERNAL.toUpperCase()}.INI`);
{
  const fp = find(OUT, "DATA/INTERFACE/CMDBAR/FRAMES.INI");
  if (fp) { const m = rd(fp).match(/^ImperialRome\s*=\s*(.+)$/m); fs.rmSync(fp); if (m) wr(path.join(OUT, "patches", "DATA", "INTERFACE", "CMDBAR", "FRAMES.INI"), `[Images]\n${INTERNAL} = ${m[1].trim()}\n`); }
}

// ---- 6. AI: the mod's settlement scripts run only for Greek settlements --------------------------------------------------
const AI = find(OUT, "DATA/AI"), HD_AI = find(HD, "DATA/AI"), aiIni = rd(path.join(HD_AI, "AI.INI"));
const aiName = f => (aiIni.match(new RegExp(`^(${f.replace(/\.VS$/i, "")}\\.vs)\\s*=`, "im")) || [])[1];
const DECL = /^\s*(int|str|bool|point|Obj|ObjList|Settlement|Building|Unit|StrArray|IntArray|Hero|GAIKA|Squad|Item)\b[^(]*;\s*(\/\/.*)?$/;
const greekAi = [], romeAi = new Set();
// The three Romes (rome18, empire18, punic18) see the AI as RepublicanRome (their base): the mod's scripts that choose by the branch flags
// (ChooseRepublicanRome...) work for them as they are, once the flag is on the settlement. So the scripts that have those flags also run, with the
// flag set by the civilization, for the Romes; nothing about Rome is copied. The flags are written only on settlements of these civilizations.
const GREEK = RACE[0].toUpperCase() + RACE.slice(1), ROMES = [["Rome18", "ChooseRepublicanRome"], ["Empire18", "ChooseImperialRome"], ["Punic18", "ChoosePunicRome"]];
const TRUE = "Mod_TrueRace(set.GetCentralBuilding)";
const ROME_TEST = ROMES.map(([c]) => `${TRUE} == ${c}`).join(" || ");
const FLAGS = ROMES.map(([c, f]) => `if (${TRUE} == ${c})\r\n\tEnvWriteString(set, "${f}", "researched");\r\n`).join("");
for (const f of fs.readdirSync(AI).filter(f => /\.vs$/i.test(f))) {
  const hd = rd(path.join(HD_AI, f)).split(/\r?\n/), name = aiName(f), text = rd(path.join(AI, f));
  if (!name || !/^\/\/\s*void,\s*Settlement set\s*$/i.test(hd[0]) || !/\b(ImperialRome|race\s*==\s*4)\b/.test(text)) continue;
  let i = 1; while (i < hd.length && (!hd[i].trim() || hd[i].trim().startsWith("//") || DECL.test(hd[i]))) i++;
  fs.renameSync(path.join(AI, f), path.join(AI, "GR18_" + f));
  const rome = /Choose(Republican|Imperial|Punic)Rome/.test(text); if (rome) romeAi.add(name);
  if (!/^ES_/i.test(name)) wr(path.join(OUT, "patches", "DATA", "AI", f), `@before ${hd[i].trim()}\r\nif (${TRUE} == ${GREEK}${rome ? " || " + ROME_TEST : ""})\r\n{\r\n\tset.AIRun("GR18_${name}");\r\n\treturn;\r\n}\r\n`);
  greekAi.push(name);
}
const loops = greekAi.filter(n => /^ES_/i.test(n)).map(n => "GR18_" + n.replace(/\.vs$/i, ""));
wr(path.join(OUT, "patches", "DATA", "AI", "GETECONOMYSCRIPT.VS"), `@before if (set.IsVillage)\r\n${FLAGS}if (${TRUE} == ${GREEK}${[...romeAi].some(n => /^ES_/i.test(n)) ? " || " + ROME_TEST : ""})\r\n{\r\n`
  + loops.map(n => `\tif (set.Is${/village/i.test(n) ? "Village" : "Stronghold"})\r\n\t\treturn ${n};\r\n`).join("") + "}\r\n");
// the AI variables the mod added for Greece (AIV_MaxQHoplite... per difficulty, AIV_TimeStrenghtenStrongholdGates): a script that reads one
// that is not declared in AI.INI does not compile ("No matching function with name AIV_Max...")
const vars = [];
{ let sec = ""; for (const l of rd(path.join(AI, "AI.INI")).split(/\r?\n/)) {
    const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; continue; }
    const v = l.match(/^\s*(AIV_Max[A-Za-z]+|AIV_TimeStrenghtenStrongholdGates)\s*=\s*(-?\d+)/);
    if (v && /^AIV_MaxQ|Strenghten/.test(v[1])) vars.push([sec, `${v[1]} = ${v[2]}`]);
  } }
const varLines = []; for (const sec of [...new Set(vars.map(x => x[0]))]) varLines.push(`[${sec}]`, ...vars.filter(x => x[0] === sec).map(x => x[1]));
wr(path.join(OUT, "patches", "DATA", "AI", "AI.INI"), ["[EconomyScripts]", ...loops.map(n => "+" + n), "[Scripts]", ...greekAi.map(n => `GR18_${n} = void, Settlement set`), ...varLines, ""].join("\r\n"));
fs.rmSync(path.join(AI, "AI.INI"));
// every other file of the mod's AI folder edited the game's scripts (or Rome's tactics): gone
for (const f of fs.readdirSync(AI).filter(f => !/^GR18_/i.test(f))) fs.rmSync(path.join(AI, f), { recursive: true });
console.log(`AI: ${greekAi.length} scripts run as GR18_* (${loops.join(", ")}); the rest of the mod's AI folder left out`);

// ---- 7. what else of the mod edited the game's files is not Greece's: left out --------------------------------------------
// (interface menus of the old launcher, sound entities, game scripts, terrains, notifications, Rome's merge...)
const hdAll = new Set(walk(HD).map(f => f.toLowerCase()));
let left = 0;
for (const f of walk(OUT)) {
  if (/^(patches|civs|loc|local)\//i.test(f)) continue;
  if (hdAll.has(f.toLowerCase()) && !/^(buildings|units|mapobjects|sounds|ui|voices|outlines|terrain|fonts|additionalart)\//i.test(f)) { fs.rmSync(path.join(OUT, f)); left++; }
}
console.log(`${left} more files that were edits of the game's own left out`);

// assets at a path the game has, with other bytes: the mod changed the game's own art or sounds for every civilization (not Greece's):
// it would replace them for all. The menu skin (CURRENTLANG, UI/MENU) is the exception and stays.
{
  const crypto = require("crypto"), md5 = f => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");
  const hdByPath = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  let swapped = 0;
  for (const f of walk(OUT)) {
    if (/^(patches|civs|loc|local)\//i.test(f)) continue;
    const h = hdByPath.get(f.toLowerCase());
    if (/^(currentlang|ui\/menu)\//i.test(f)) continue;            // the menu skin (background, logo, buttons): cosmetic, only one can show
    if (h && md5(h) !== md5(path.join(OUT, f))) { fs.rmSync(path.join(OUT, f)); swapped++; left++; }
    else if (h) { fs.rmSync(path.join(OUT, f)); left++; }
  }
  prune(OUT);
  report.push(`${swapped} files that replaced the game's own (sounds, animations, menu skin) left out`);
}
// art with the name of another mod's (the Greek icons all the Greek mods draw): the mod's own names
tagFiles(OUT, ["UI/CMDBAR/FRAMES/greek_frame.bmp", "UI/CMDBAR/RESEARCH/imperial.bmp", "UI/CMDBAR/UPGRADES/olympic games.bmp", "UI/ICONS/UPGRADES/olympic games.bmp"], "g18");
for (const f of walk(OUT)) if (/\.(py|generated|orig)$|\.ini\.(generated|orig)$/i.test(f) || /^DATA\/SUBAI\/R(ARENA|BARRACKS|BLACKSMITH|TAVERN|TEMPLE|TOWNHALL)_ENABLE_OR_DISABLE_CMD\.VS$/i.test(f) || /^DATA\/COMMANDS\/RHT_SCELTA_ROMA\.XML$/i.test(f)) { fs.rmSync(path.join(OUT, f)); left++; }
// ---- 8. the civilization -------------------------------------------------------------------------------------------------------
const alias = {};                                          // what the game's AI asks for in Imperial Rome -> the Greek class
const map = { MTownhall: "QTownhall", MBarracks: "QBarracks", MBlacksmith: "QBlacksmith", MTemple: "QTemple", MTavern: "QTavern", MTavern2: "QTavern2", MArena: "QArena", MTower: "QTower", MSentry: "QSentry", MSentry1: "QSentry1", MGuardPostSentry: "QGuardPostSentry" };
for (const g of ["MGate0", "MGate1", "MGate2", "MGate3", "MGate4", "MGate5", "MGate6", "MGate7", "MWallsE", "MWallsN", "MWallsNE", "MWallsNW", "MWallsS", "MWallsSE", "MWallsSW", "MWallsW"]) map[g] = LETTER + g.slice(1);
for (const [k, v] of Object.entries(map)) if (fs.existsSync(path.join(CLASSES, `${v.toUpperCase()}.SC.XML`))) alias[k] = v;
const civ = { id: RACE, index: INDEX, base: "ImperialRome", name: { spanish: "Grecia (Rattlesmake)", english: "Greece (Rattlesmake)", italian: "Grecia (Greek 1.8)" },
  letter: LETTER, internalName: INTERNAL, template: TEMPLATE, ai: true, alias: { classes: alias, commands: {} } };
wr(path.join(OUT, "civs", `${RACE}.json`), JSON.stringify(civ, null, 2) + "\n");
fs.rmSync(path.join(OUT, "civs", "greek.json"), { force: true });

// ---- 9. the Greek city and villages of the random map -----------------------------------------------------------------------
{
  const hpfs = require("./hpfs.js"), pack = path.join(MOD140, "..", "greek-mod-1.8-full", "GreekMod_1.8", "Packs", "RandomMapSettlements.bfhp");
  const e = hpfs(fs.readFileSync(pack)).find(x => /maps\/1\/map\.obj\.xml$/i.test(x.path));
  const text = swap(e.read().toString("latin1").replace(/\r\n/g, "\n")).replace(/\bM(Tower|Walls[NSEW]+|Gate\d)\b/g, `${LETTER}$1`);
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
  if (cursorX - 3000 > 31000) report.push("the Greek templates do not fit in the free area");
  wr(path.join(OUT, "patches", "randommapsettlements", "maps", "1", "map.obj.xml"), `<patch>\n  <!-- Templates of ${TEMPLATE}: the Greek towns and villages of the Greek Mod 1.8, with its classes renamed. Free area of the map: y 24192-27904 -->\n  <add select="/mapobject">\n${out.join("\n")}\n  </add>\n</patch>\n`);
  console.log(`${out.length} Greek templates`);
}

// ---- 10. hand fixes of this mod (extras/greek-mod-1-8/) ------------------------------------------------------------------------
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md") continue; const p = path.join(EXTRAS, f); const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(p, dst); }
console.log(`menu skin: ${require("./lib/menu-skin.js").skinToPatches({ OUT, HD: path.join(ROOT, "originals", "game-data", "paks") })} layout files became patches of the keys they changed`);
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
