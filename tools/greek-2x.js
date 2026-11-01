// Greek Mod 2.x (Rattlesmake's Greek Mod continued by MediterranevmTeam: 2.3, 2.5.3, 2.6.1): Greece and the game's civilizations as the mod has them, each a
// civilization of its own next to the game's (AGENTS.md, "Civilizations are independent" and "What a civilization is, it is from the start").
//   node tools/greek-2x.js <2.3|2.5.3|2.6.1> [civ id ...]       (the extra ids rebuild only those clones, after the first run)
// Run after tools/greek-2x-source.js (the standalone game folder -> work/greek-<v>-flat) and tools/port-140.js (HD + the mod, merged; the command is printed
// by greek-2x-source.js and is in extras/greek-mod-2-*/NOTES.md). The three versions are one mod line with the same structure as the 1.8 (a 1.40 game
// folder with `zGreek.pak`, Greece in Imperial Rome's slot with the letter H, the Roman branches chosen at the town hall), so one tool builds all three:
// only the table VERSIONS below changes. Stages (the 1.8's tools/greek-1-8*.js and the 4.2's tools/greek-4-2.js, in the order the 4.2 runs them):
//   0. the Italian texts (loc/italian.loc.xml), as the 1.8 does
//   1. Greece's names: the H of its classes, commands, art and sounds becomes the prefix of the civilization (HHoplite -> WgrHoplite, trainpeasanth ->
//      trainpeasantwgr); the maps are rewritten inside the HPFS container
//   2. the classes of the game the mod re-defined leave the port (they are the game's) and are kept in work/greek-<v>-merged: the clones read them
//   3. the Roman branches are three civilizations (Republican, Imperial, Punic), the game's other civilizations one each (tools/lib/clone-civs.js)
//   4. AI, scripts, conquests and names that collide with another port: tools/lib/{greek-ai,own-ai,own-scripts,independent,conquests,ported-patch}.js
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os");
const { ROOT, WORK, VERSIONS, LINE, SDK, LEGACY_PORTED } = require("./lib/greek-2x-versions.js");
process.env.SDK = SDK;                                      // the shared tools (clone-civs.js, port-140.js, flatten-paks.js) read it
const VER = process.argv[2], V = VERSIONS[VER];
if (!V) { console.error("usage: node tools/greek-2x.js <" + Object.keys(VERSIONS).join("|") + "> [civ id ...]"); process.exit(1); }
const want = process.argv.slice(3);
const OUT = path.join(ROOT, "ported", V.dir), EXTRAS = path.join(ROOT, "extras", V.dir);
const FLAT = path.join(WORK, `${V.work}-flat`), FULL = path.join(WORK, `${V.work}-full`, V.inner || ""), MERGED = path.join(WORK, `${V.work}-merged`);
const HD = path.join(ROOT, "originals", "game-data", "paks"), G = path.join(ROOT, "originals", "game-data");
const PORTED = path.join(ROOT, "ported");
// Imperivm Legacy (and Imperivm I's): the names this port shares with it are renamed like those it shares with the other ports. It is git-ignored in the main checkout, so it is
// looked up there (LEGACY_PORTED, tools/lib/greek-2x-versions.js). Without it the build would rename LESS and be different from a build that has it, so it stops.
const EXTRA_PORTS = [];
for (const d of ["imperivm-legacy", "imperivm1-legacy"]) {
  if (fs.existsSync(path.join(PORTED, d))) continue;               // it is one of the ports of this worktree: `others` has it
  const p = LEGACY_PORTED.map(b => path.join(b, d)).find(x => fs.existsSync(x));
  if (p) EXTRA_PORTS.push(p); else if (d === "imperivm-legacy" && !process.env.GREEK2X_NO_LEGACY) { console.error(`no ${d} in ${PORTED} or in ${LEGACY_PORTED.join(", ")}: the names that collide with Imperivm Legacy would NOT be renamed and the build would differ from one that has it. Build it there, set LEGACY_PORTED=<a ported/ folder that has it>, or GREEK2X_NO_LEGACY=1 to build without it on purpose.`); process.exit(1); }
}
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };   // a malformed file stops the build, on purpose
const TEXT = /\.(xml|vs|ini|txt)$/i;
if (!fs.existsSync(OUT) || !fs.readdirSync(OUT).length) { console.error(`no ${OUT}: run tools/port-140.js first (extras/${V.dir}/NOTES.md, Rebuild)`); process.exit(1); }
if (fs.existsSync(path.join(OUT, "civs"))) { console.error(`${OUT} was already processed: rebuild it from tools/port-140.js (the stages rename files in place)`); process.exit(1); }
const report = [];

// ---- the conflicts between HD and the mod that tools/port-140.js settled with the mod's side: decided by hand (tools/lib/greek-2x-versions.js) -----------------------------
// Every file with a decision is merged again (HD, the 1.40 the mod started from, the mod) with git merge-file and each conflict takes its decision, in order.
// A conflict with no decision, or a decision with no conflict, stops the run: port-140.js's choice is not looked at again by anybody otherwise.
{
  const B140 = path.join(ROOT, "originals", "game-140", "paks"), has = new Set(walk(OUT).map(f => f.toLowerCase()));
  let done = 0;
  for (const [rel, decisions] of Object.entries(V.resolve || {})) {
    const cur = find(HD, rel), base = find(B140, rel), oth = find(FLAT, rel);
    if (!cur || !base || !oth) { console.error(`${rel}: not found (HD ${!!cur}, 1.40 ${!!base}, mod ${!!oth})`); process.exit(1); }
    const r = cp.spawnSync("git", ["merge-file", "-p", "-L", "cur", "-L", "base", "-L", "oth", cur, base, oth], { encoding: "latin1", maxBuffer: 1 << 26 });
    if (r.status < 0 || r.status > 100) { console.error(`${rel}: git merge-file failed: ${r.stderr}`); process.exit(1); }
    let i = 0;
    const text = r.stdout.replace(/<<<<<<< cur\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> oth\r?\n?/g, (_m, a, b) => {
      const d = decisions[i++];
      if (d === undefined) return _m;
      return d === "cur" ? a : d === "oth" ? b : typeof d === "function" ? d(a, b) : d;
    });
    if (i !== decisions.length || /^<<<<<<< cur/m.test(text)) { console.error(`${rel}: ${i} conflicts, ${decisions.length} decisions`); process.exit(1); }
    if (!has.has(rel.toLowerCase())) { report.push(`${rel}: not in the port (port-140.js dropped it): decision not applied`); continue; }
    wr(path.join(OUT, rel), text); done++;
  }
  console.log(`${done} files merged again with the conflicts decided by hand`);
  // 2.5.3 and 2.6.1 rewrote whole scripts the 1.40 and HD both changed (the merge mixes the declarations of one with the body of the other, which does not
  // compile or does not mean what either meant). A script with a conflict and no decision above is the mod's own, whole: it ran as a whole in the mod, and
  // it is only used by the mod's civilizations (the copies `_<tag>`), so HD's later fixes to that script are the price. Listed in raw/<id>-whole-scripts.txt.
  if (V.wholeOnConflict) {
    const whole = [];
    for (const rel of walk(FLAT).filter(f => /^DATA\/(SUBAI|AI|AI HELPERS|ITEMSCRIPTS)\/[^/]+\.vs$/i.test(f))) {
      if (Object.keys(V.resolve || {}).some(k => k.toLowerCase() === rel.toLowerCase()) || !has.has(rel.toLowerCase())) continue;
      const cur = find(HD, rel), base = find(B140, rel), oth = find(FLAT, rel);
      if (!cur || !base) continue;
      const r = cp.spawnSync("git", ["merge-file", "-p", "-L", "cur", "-L", "base", "-L", "oth", cur, base, oth], { encoding: "latin1", maxBuffer: 1 << 26 });
      if (r.status > 0 && r.status <= 100) { wr(path.join(OUT, rel), rd(oth)); whole.push(rel); }
    }
    fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "raw", `${V.dir}-whole-scripts.txt`), whole.join("\n") + "\n");
    console.log(`${whole.length} scripts with a conflict are the mod's own, whole (raw/${V.dir}-whole-scripts.txt)`);
  }
}

// ---- the civilizations ------------------------------------------------------------------------------------------------------------------------
// An id is the token of the line (`w`) and the name of the civilization; the SDK derives the prefix from its first 3 characters (imperivm-resurrected#37) and
// the engine assigns the index. Distinct start for every civilization of the mod: Wga Wge Wgr Wca Wbr Wib Weg Wro Wim Wpu.
const GREEK = { id: V.tok + "greece", name: { spanish: "Grecia", english: "Greece", italian: "Grecia" } };
const prefixOf = id => { if (V.letters && V.letters[id.slice(V.tok.length)]) return V.letters[id.slice(V.tok.length)]; const d = id.replace(/_/g, "").slice(0, 3).toLowerCase(); return d[0].toUpperCase() + d.slice(1); };
const PREFIX = prefixOf(GREEK.id), RACE = GREEK.id, INTERNAL = GREEK.id[0].toUpperCase() + GREEK.id.slice(1), CONST = INTERNAL, TEMPLATE = V.template || `Greek ${PREFIX}`;   // a template name is letters and spaces only
// The Imperial branch hires ImperialRomanHero's children (MHero1..3c, the game's Imperial Rome heroes: race ImperialRome, so the clone of Republican Rome does not
// have them): they are cloned with the branch (asBase, renamed <letter>MHero1...), or `GetRandomHeroClass("WimImperialRomanHero")` finds a class with no entity
// and no child and PickRandomHeroClass never returns (the first test of the 2.3 hung there)
const IMPERIAL_HEROES = [...new Set([find(HD, "DATA/CLASSES"), find(FLAT, "DATA/CLASSES")].filter(Boolean).flatMap(dir => walk(dir).filter(f => /\.sc\.xml$/i.test(f))
  .map(f => rd(path.join(dir, f))).filter(t => /<class\b[^>]*\bparent\s*=\s*"ImperialRomanHero"/.test(t)).map(classOf)))].sort();
const BRANCH = (flag, hire) => ({ flag, scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, hire });
const CIVS = [
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: V.tok + "rome", name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." },
    skipExtra: /^(ImperialRomanHero|AncientRomanHero)/, branch: BRANCH("ChooseRepublicanRome") },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: V.tok + "imperial", name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." },
    skipExtra: /^(AncientRomanHero)/, asBase: ["RVelit", "RPraetorian", ...IMPERIAL_HEROES], branch: BRANCH("ChooseImperialRome", { cmd: "hireheroRImperial", hero: "ImperialRomanHero" }) },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", id: V.tok + "punic", name: { spanish: "Roma pún.", english: "Pun. Rome", italian: "Roma pun." },
    skipExtra: /^(ImperialRomanHero)/, asBase: ["RPraetorian"], branch: BRANCH("ChoosePunicRome", { cmd: "hireheroR", hero: "AncientRomanHero" }) },
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", id: V.tok + "gaul", name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", id: V.tok + "carthage", name: { spanish: "Cartago", english: "Carthage", italian: "Cartagine" },
    neutral: /^(CTent|CHorseman|CCamelRider|HOutpost)$/ },   // the Numidian tent and what it hires, the Greek garrison: nobody's, the random maps place them (as in Mediterranevm alpha)
  { base: "Britain", baseLetter: "B", hero: "BritonHero", id: V.tok + "britain", name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", id: V.tok + "iberia", name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", id: V.tok + "egypt", name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", id: V.tok + "germany", name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
];
for (const c of CIVS) { c.prefix = prefixOf(c.id); if (V.letters) c.letter = c.prefix; }   // an explicit letter: clone-civs.js passes it to the SDK instead of deriving it
{ const seen = new Map(); for (const p of [PREFIX, ...CIVS.map(c => c.prefix)]) { if (seen.has(p.toLowerCase())) { console.error(`prefix ${p} twice`); process.exit(1); } seen.set(p.toLowerCase(), 1); } }
console.log(`${V.name}: ${[GREEK.id, ...CIVS.map(c => c.id)].map(i => `${i} (${prefixOf(i)})`).join(", ")}`);

// ---- 0. the mod's Italian texts ---------------------------------------------------------------------------------------------------------------
// port-140.js only knows the Spanish table (flatten-paks.js unpacks only Local\spanish.pak). The mod also ships Local\italian.pak: what its tables say that
// HD's Italian ones do not goes to loc/italian.loc.xml (new keys and changed ones), as the 1.8 does. Czech is a whole translation of the game, a language HD
// does not have, and is not ported; English has a handful of entries and none of Greek content.
{
  const pak = find(FULL, "local/italian.pak"), HDL = path.join(G, "local-italian", "CURRENTLANG");
  if (pak && fs.existsSync(HDL)) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "it-")), g = path.join(tmp, "game");
    fs.mkdirSync(path.join(g, "Packs"), { recursive: true }); fs.copyFileSync(pak, path.join(g, "Packs", "italian.pak"));
    const r = cp.spawnSync("node", [path.join(SDK, "tools", "extract-data.js"), g, path.join(tmp, "out"), "italian.pak"], { encoding: "utf8" });
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
    wr(path.join(OUT, "loc", "italian.loc.xml"), "\ufeff<translationtable>\n" + [...out.values()].join("\n") + "\n</translationtable>\n");
    fs.writeFileSync(path.join(OUT, "loc", "italian.loc.xml"), "\ufeff<translationtable>\n" + [...out.values()].join("\n") + "\n</translationtable>\n", "utf8");
    const cr = find(CL, "CREDITS.TXT");
    if (cr) { fs.mkdirSync(path.join(OUT, "local", "italian"), { recursive: true }); fs.copyFileSync(cr, path.join(OUT, "local", "italian", "CREDITS.TXT")); }
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`${out.size} Italian texts (loc/italian.loc.xml)`);
  } else report.push("no Local\\italian.pak or HD Italian texts: loc/italian.loc.xml not written");
}

// ---- 1. Greece's names: what the mod defines and the game does not, with the letter H --------------------------------------------------------------
fs.rmSync(MERGED, { recursive: true, force: true });
// the modders' own helper scripts (DATA/SUBAI/@ FIND WORD.PY) and generator leftovers are not part of the mod
for (const f of walk(OUT).filter(f => /\.(py|generated|orig)$/i.test(f))) { fs.rmSync(path.join(OUT, f)); console.log(`left out: ${f} (not game data)`); }
const files = walk(OUT);
const names = new Map();                                   // lowercase old name -> { old, at } (at: index of the letter in it)
const add = (old, at) => { const k = old.toLowerCase(); if (!names.has(k)) names.set(k, { old, at }); };
const HDCLASS = find(HD, "DATA/CLASSES");
const hdClass = new Set(walk(HDCLASS).filter(f => /\.sc\.xml$/i.test(f)).map(f => (classOf(rd(path.join(HDCLASS, f))) || "").toLowerCase()));
const NEUTRAL_H = /^(HOutpost)$/i;                         // the Greek garrison post is nobody's (the random maps place it): it keeps its name until tagCollisions
for (const f of files.filter(f => /^DATA\/CLASSES\/[^/]+\.SC\.XML$/i.test(f))) {
  const id = classOf(rd(path.join(OUT, f)));
  if (!id || hdClass.has(id.toLowerCase()) || NEUTRAL_H.test(id)) continue;
  if (/^H[A-Z]|^Hhouse\d/.test(id)) add(id, 0);
  else if (/^HeroH[A-Z]/.test(id)) add(id, 4);
}
for (const f of files.filter(f => /^DATA\/AI\//i.test(f))) for (const m of rd(path.join(OUT, f)).matchAll(/AIV_MaxH[A-Za-z_]+/g)) add(m[0], 7);   // AIV_MaxHHoplite
add("GreekHero", -1);                                      // no letter in it: the prefix goes in front
for (const f of files.filter(f => /^DATA\/COMMANDS\//i.test(f)))
  for (const m of rd(path.join(OUT, f)).matchAll(/<cmd\b[^>]*?\bname\s*=\s*"([^"]+)"/g)) {
    const n = m[1];
    if (/^train(H[A-Z]\w*)$/.test(n)) add(n, 5);
    else if (/^H[A-Z]\w*$/.test(n) && !/^H(Align|IDDEN)/.test(n)) add(n, 0);
    else if (/^(trainpeasant|hirehero)h$/i.test(n)) add(n, n.length - 1);
  }
const STEM = /^(Hero)?H(Agora|Barracks|Blacksmith|Chariot|CmdBar|Gymnasium|Hero|Hoplite|House|Hypaspista|Myrmidon|Priest|Sentry|Temple|Tower|Townhall|Totoxes|Toxotes|Village|Villager|WVillager|Wall|Gates|Walls|GuardPostSentry|Centaur|ReligiousFeast|Restoration|AddPop|Tribute|MaleVillager|_Die|Peltast|Cataphract)\w*$/i;
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
const RE = new RegExp(`(?<![A-Za-z0-9])(${list.map(n => n.old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![A-Za-z0-9])`, "gi");
const swap = s => s.replace(RE, m => {
  const n = names.get(m.toLowerCase()), at = Math.max(n.at, 0), up = m[at] === m[at].toUpperCase();
  const L = m.length > 1 && m === m.toUpperCase() ? PREFIX.toUpperCase() : up ? PREFIX : PREFIX.toLowerCase();   // HHOPLITE (a folder or a file name) -> WGRHOPLITE
  return n.at < 0 ? L + m : m.slice(0, n.at) + L + m.slice(n.at + 1);
});
let swapped = 0;
for (const f of walk(OUT)) { const p = path.join(OUT, f); if (TEXT.test(f)) { const s = rd(p), n = swap(s); if (n !== s) { wr(p, n); swapped++; } } }
const moves = walk(OUT).map(f => [f, swap(f)]).filter(([a, b]) => a !== b);
for (const [from, to] of moves) { const a = path.join(OUT, from), b = path.join(OUT, to); fs.mkdirSync(path.dirname(b), { recursive: true }); fs.renameSync(a, b); }
prune(OUT);
console.log(`${list.length} Greek names: ${swapped} text files rewritten, ${moves.length} files/folders renamed`);
// the maps: HPFS containers; the Greek classes they place are renamed in place
{
  const hpfs = require("./hpfs.js"); let maps = 0, touched = 0, failed = 0, n = 0;
  for (const f of walk(OUT).filter(f => /^(scenarios|adventures|conquests)\/.*\.bfhp$/i.test(f))) {
    const p = path.join(OUT, f); maps++;
    const buf = fs.readFileSync(p); let dirty = false;
    try {
      for (const e of hpfs(buf)) {
        if (!/\.(xml|vs)$/i.test(e.path)) continue;
        const text = e.read().toString("latin1"), t = swap(text);
        if (t === text) continue;
        // The longer names (H -> Wgr) can make a file need one more page, and an HPFS file is written in place (same pages): the indentation goes first
        // (a file that got shorter than its pages is padded with spaces up to its old length)
        const pad = v => (v.length < e.size ? v + " ".repeat(e.size - v.length) : v);
        const fits = [t, t.replace(/[ \t]+(\r?\n)/g, "$1"), t.replace(/\r?\n[ \t]+/g, "\n"), t.replace(/\r?\n[ \t]+/g, " ")].map(pad);
        let ok = false, last = "";
        for (const v of fits) { try { e.write(Buffer.from(v, "latin1")); ok = true; break; } catch (err) { last = err.message; } }
        if (ok) { dirty = true; n += (text.match(RE) || []).length; } else { failed++; report.push(`${f}: ${e.path}: ${last}`); }
      }
    } catch (err) { report.push(`${f}: not read as HPFS (${err.message})`); continue; }
    if (dirty) { fs.rmSync(p); fs.writeFileSync(p, buf); touched++; }
  }
  console.log(`${maps} maps: ${touched} with Greek classes rewritten (${n} names)${failed ? `, ${failed} failed` : ""}`);
}

// ---- 2. classes -------------------------------------------------------------------------------------------------------------------------------
const CLASSES = find(OUT, "DATA/CLASSES");
const HDCLASS_FILES = walk(HDCLASS).filter(f => /\.sc\.xml$/i.test(f)), HDCLASS_IDS = new Map(HDCLASS_FILES.map(f => [(classOf(rd(path.join(HDCLASS, f))) || "").toLowerCase(), path.join(HDCLASS, f)]));
const hdFile = id => HDCLASS_IDS.get(id.toLowerCase());
const elements = s => {
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
const parentOf = new Map(), modClasses = new Map();
for (const dir of [HDCLASS, CLASSES]) for (const f of fs.readdirSync(dir, { recursive: true }).filter(f => /\.sc\.xml$/i.test(f))) {
  const s = rd(path.join(dir, f)), id = classOf(s); if (!id) continue;
  parentOf.set(id.toLowerCase(), (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1]);
  if (dir === CLASSES && !hdClass.has(id.toLowerCase())) modClasses.set(id.toLowerCase(), path.join(dir, f));
}
const chain = id => { const o = []; for (let c = id.toLowerCase(); c; c = (parentOf.get(c) || "").toLowerCase()) { o.push(c); if (o.length > 20) break; } return o; };
// Greece's classes: the ones that start with the prefix (and its heroes)
const PRE = PREFIX.toLowerCase();
const greek = [...modClasses.keys()].filter(id => id.startsWith(PRE) || id.startsWith("hero" + PRE));
let inlined = 0;
for (const id of greek) {
  const p = modClasses.get(id); let s = rd(p);
  const ch = chain(id).slice(1), extra = [];
  for (const b of ch.reverse()) for (const e of BASE_CHANGES.get(b) || []) extra.push(e.text);   // farthest ancestor first: nearer ones win
  s = s.replace(/\brace\s*=\s*"(ImperialRome|Imperial Rome)"/, `race="${RACE}"`);
  if (extra.length) { s = s.replace(/(<class\b[^>]*>)/, `$1\n\t<!-- changes the ${V.name} made to its base classes -->\n\t${extra.join("\n\t")}`); inlined += extra.length; }
  wr(p, s);
}
console.log(`${greek.length} Greek classes, ${inlined} base-class elements written inside them`);
// the Greek pieces the mod drew over Imperial Rome's ids (M* walls, gates, tower): <prefix>* classes
let pieces = 0;
for (const f of fs.readdirSync(CLASSES).filter(f => /^M(WALLS|GATE|TOWER|VILLAGER|WVILLAGER|VILLAGERAMBIENT|WVILLAGERAMBIENT)\w*\.SC\.XML$/i.test(f))) {
  const s = rd(path.join(CLASSES, f)), id = classOf(s), q = PREFIX + id.slice(1);
  wr(path.join(CLASSES, `${q.toUpperCase()}.SC.XML`), s.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${q}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "").replace(/\brace\s*=\s*"(ImperialRome|Imperial Rome)"/, `race="${RACE}"`)); pieces++;
}
const cls = id => { const p = path.join(CLASSES, `${id.toUpperCase()}.SC.XML`); return fs.existsSync(p) ? rd(p) : null; };
const copyAs = (from, to) => { const s = cls(from); if (s) { wr(path.join(CLASSES, `${to.toUpperCase()}.SC.XML`), s.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${to}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "")); pieces++; } else report.push(`no ${from} to make ${to}`); };
// the city builder asks by letter for pieces the mod did not draw: copies of the nearest Greek ones
copyAs(`${PREFIX}Agora`, `${PREFIX}Tavern`); copyAs(`${PREFIX}Agora`, `${PREFIX}Tavern2`); copyAs(`${PREFIX}Gymnasium`, `${PREFIX}Arena`);
// the classes of the game the mod re-defined go: each is a civilization of its own in the next step
let dropped = 0;
for (const f of fs.readdirSync(CLASSES, { recursive: true }).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f), id = classOf(rd(p));
  if (id && hdClass.has(id.toLowerCase())) { if (!/[\\/]/.test(f)) wr(path.join(MERGED, "classes", f), rd(p)); fs.rmSync(p); dropped++; }   // (the clone tool reads the top folder only: WINTER/ has same-named files)
}
for (const d of fs.readdirSync(CLASSES, { withFileTypes: true }).filter(e => e.isDirectory())) { const p = path.join(CLASSES, d.name); if (!fs.readdirSync(p).length) fs.rmdirSync(p); }
console.log(`${pieces} ${PREFIX}* pieces; ${dropped} classes of the game's civilizations left out`);
// A behavior script that starts with `if (race != ImperialRome) return;` ended at once on a Greek building (Greece has a race of its own now) and the engine
// started it again and again: the game hung (the first independent builds of the 1.8). The scripts are only attached to Greek classes: the test goes.
{
  let n = 0;
  for (const f of walk(OUT).filter(f => /^DATA\/SUBAI\/[^/]+\.vs$/i.test(f))) {
    const p = path.join(OUT, f), s = rd(p);
    const t = s.replace(/^[ \t]*if\s*\(\s*[\w.()]*\.race\s*!=\s*ImperialRome\s*\)\s*\r?\n[ \t]*return\s*;[ \t]*\r?\n/m, "").replace(/GetPlayerRace\((\w+)\.player\)\s*==\s*ImperialRome/g, `Mod_TrueRace($1) == ${CONST}`);
    if (t !== s) { wr(p, t); n++; }
  }
  if (n) console.log(`${n} behavior script(s) lost their "race != ImperialRome" test (Greece is its own race)`);
}
// a behavior script of a Greek class that can end before its first Sleep is restarted at once, forever: report each one
{
  const seenB = new Set();
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) for (const m of rd(path.join(CLASSES, f)).matchAll(/<behavior\b[^>]*\bscript\s*=\s*"([^"]+)"/gi)) seenB.add(m[1].toLowerCase());
  for (const b of seenB) {
    const p = find(OUT, b.replace(/^data\//, "DATA/")); if (!p) continue;
    const code = rd(p).replace(/\/\/.*$/gm, ""), i = code.search(/\breturn\s*;/), j = code.search(/\bSleep\s*\(/);
    if (i >= 0 && (j < 0 || i < j)) report.push(`${b}: can return before its first Sleep: the engine would restart it forever (hang)`);
  }
}
// a class that names a script neither the mod nor the game has: the game could not run it, the line goes
{
  const have = new Set([...walk(OUT), ...walk(HD)].map(f => f.toLowerCase()));
  let gone = 0;
  for (const f of walk(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
    const p = path.join(CLASSES, f), s = rd(p);
    const n = s.replace(/^[ \t]*<(behavior|method)\b[^>]*?\b(?:script|vs)\s*=\s*"(data\/[^"]+\.vs)"[^>]*\/>[ \t]*\r?\n?/gim, (m, _t, v) => (have.has(v.toLowerCase()) ? m : (gone++, "")));
    if (n !== s) wr(p, n);
  }
  if (gone) console.log(`${gone} references to scripts the mod never shipped removed from Greece's classes`);
}

// ---- 3. commands: the Greek ones in a file of their own, the Greek sources the mod added to the game's as patches ------------------------------------
{
  const cmds = s => [...s.matchAll(/<cmd\b([^>]*)>([^]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
  const HD_CMDS = find(HD, "DATA/COMMANDS"), MOD_CMDS = find(OUT, "DATA/COMMANDS");
  const hdCmdFiles = Object.fromEntries(fs.readdirSync(HD_CMDS).filter(f => /\.xml$/i.test(f)).map(f => [f.toUpperCase(), cmds(rd(path.join(HD_CMDS, f)).replace(/<!--[\s\S]*?-->/g, ""))]));
  const where = name => Object.keys(hdCmdFiles).find(f => hdCmdFiles[f].some(c => c.name === name));
  const isModClass = c => !hdClass.has(c.toLowerCase()) && greek.includes(c.toLowerCase()) || greek.includes(c.toLowerCase());
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
    fs.rmSync(path.join(MOD_CMDS, f));                       // its Greek commands are in <GREECE>.XML now
  }
  for (const [k, like] of [[`${PREFIX}Tavern`, `${PREFIX}Agora`], [`${PREFIX}Tavern2`, `${PREFIX}Agora`], [`${PREFIX}Arena`, `${PREFIX}Gymnasium`]])
    for (let i = 0; i < own.length; i++) own[i] = own[i].replace(new RegExp(`(\\s*)<src obj="${like}"\\s*/>`, "g"), (m, sp) => `${m}${sp}<src obj="${k}"/>`);
  wr(path.join(MOD_CMDS, `${INTERNAL.toUpperCase()}.XML`), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
  for (const [file, list] of Object.entries(ops)) wr(path.join(OUT, "patches", "DATA", "COMMANDS", file), `<patch>\n${list.join("\n")}\n</patch>\n`);
  console.log(`${own.length} Greek commands, ${Object.values(ops).reduce((a, l) => a + l.length, 0)} source patches in ${Object.keys(ops).length} files`);
}

// ---- 4. the Greek interface: files the game looks up by the civilization's internalName ------------------------------------------------------------
{
  const mvTo = (from, to, fn = s => s) => { const p = find(OUT, from); if (p) { wr(path.join(path.dirname(p), to), fn(rd(p))); fs.rmSync(p); } else report.push(`${from}: not found`); };
  mvTo("DATA/INTERFACE/INFOBAR/INFOBAR_IROME.INI", `INFOBAR_${INTERNAL.toUpperCase()}.INI`);
  mvTo("DATA/INTERFACE/CMDBAR/CMDBARIROME.INI", `CMDBAR${INTERNAL.toUpperCase()}.INI`);
  const fp = find(OUT, "DATA/INTERFACE/CMDBAR/FRAMES.INI");
  if (fp) { const m = rd(fp).match(/^ImperialRome\s*=\s*(.+)$/m); fs.rmSync(fp); if (m) wr(path.join(OUT, "patches", "DATA", "INTERFACE", "CMDBAR", "FRAMES.INI"), `[Images]\n${INTERNAL} = ${m[1].trim()}\n`); }
}

// ---- 5. the civilizations of the game, as the mod has them ----------------------------------------------------------------------------------------
// the branch scripts (R*_Enable_Or_Disable_Cmd.vs) say what each branch leaves visible; tools/lib/branch.js reads them. They are put in the port while the
// civilizations are cloned and taken out after (no civilization uses them)
const SUB = find(OUT, "DATA/SUBAI"), branchScripts = fs.readdirSync(SUB).filter(f => /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i.test(f));
const branchCopy = path.join(os.tmpdir(), `branch-${V.tag}`); fs.rmSync(branchCopy, { recursive: true, force: true }); fs.mkdirSync(branchCopy);
for (const f of branchScripts) fs.copyFileSync(path.join(SUB, f), path.join(branchCopy, f));
require("./lib/clone-civs.js")({ PORT: OUT, MERGED, SUFFIX: V.name, LABEL: V.label, CIVS, cloneAllOrders: true, want });
fs.rmSync(branchCopy, { recursive: true, force: true });
// The branch switches nobody asks for any more: every branch is a civilization now (the lobby is the choice, AGENTS.md). The scripts that enabled or disabled
// the commands of a branch and the one that picked a branch for the AI when a town hall was captured go; no class names them (the clones' classes dropped them).
{
  let n = 0;
  for (const f of fs.readdirSync(SUB).filter(f => /^R[A-Z]+_(ENABLE_OR_DISABLE_CMD|CAPTURED_BY_AI)\.VS$/i.test(f))) { fs.rmSync(path.join(SUB, f)); n++; }
  console.log(`${n} scripts of the branch choice left out`);
}

// The mod's text tables also CHANGE the game's own texts for everybody (the name of Republican Rome, the menu, the unit specials...). The game's are never
// modified (AGENTS.md): an entry whose key (text + context) HD's table already has with another result is dropped. When its context is the name of a command
// a civilization cloned, the same text is kept for each clone's command.
{
  const HDL = lang => path.join(G, "local-" + lang, "CURRENTLANG"), alias = new Map();
  for (const f of fs.readdirSync(path.join(OUT, "civs"))) for (const [o, n] of Object.entries(readJson(path.join(OUT, "civs", f)).alias.commands || {})) (alias.get(o) || alias.set(o, []).get(o)).push(n);
  const decode = b => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; };
  const entry = e => ({ line: e, text: (e.match(/\btext="([^"]*)"/) || [])[1], ctx: (e.match(/\bcontext="([^"]*)"/) || [])[1] || "", res: (e.match(/\bresult="([^"]*)"/) || [])[1] });
  for (const lang of ["spanish", "italian"]) {
    const file = path.join(OUT, "loc", lang + ".loc.xml"); if (!fs.existsSync(file)) continue;
    const hd = new Map();
    for (const f of ["GAME.LOC.XML", "TRANSLATION.LOC.XML"]) if (fs.existsSync(path.join(HDL(lang), f)))
      for (const m of decode(fs.readFileSync(path.join(HDL(lang), f))).matchAll(/<translationtableentry\b[^>]*?\/>/g)) { const e = entry(m[0]); if (e.text != null) hd.set(e.text + "\0" + e.ctx, e.res); }
    const keep = [], seenK = new Set(); let gone = 0, moved = 0;
    for (const m of decode(fs.readFileSync(file)).matchAll(/<translationtableentry\b[^>]*?\/>/g)) {
      const e = entry(m[0]); if (e.text == null) continue;
      if (!hd.has(e.text + "\0" + e.ctx) || hd.get(e.text + "\0" + e.ctx) === e.res) { keep.push(e.line); continue; }
      gone++;
      for (const n of alias.get(e.ctx) || []) {
        const key = e.text.split("@")[0] + "@" + n; if (seenK.has(key)) continue; seenK.add(key); moved++;
        keep.push(e.line.replace(/\btext="[^"]*"/, () => `text="${key}"`).replace(/\bcontext="[^"]*"/, () => `context="${n}"`));
      }
    }
    fs.rmSync(file); fs.writeFileSync(file, "\ufeff<translationtable>\n" + keep.join("\n") + "\n</translationtable>\n", "utf8");
    console.log(`${lang}: ${gone} texts that changed the game's own left out, ${moved} kept for the clones' commands, ${keep.length} entries`);
  }
}

// ---- 6. AI ------------------------------------------------------------------------------------------------------------------------------------
// The mod's settlement scripts that treat Imperial Rome as Greece run only for Greek settlements (tools/lib/greek-ai.js); the monitors, the group
// strategies and what the engine calls by name (tools/lib/own-ai.js) only for the AI players of the mod's civilizations. The Roman branches read the old
// ChooseXxx flags: they keep the game's AI for the economy and the helpers (NOBRANCH leaves them out), as the 4.2 does.
const ALL = [CONST, ...CIVS.map(c => c.id[0].toUpperCase() + c.id.slice(1))], NOBRANCH = ALL.filter(c => !new RegExp(`^${V.tok}(rome|imperial|punic)$`, "i").test(c));
{
  const aiDir = find(OUT, "DATA/AI");
  const SRC = path.join(os.tmpdir(), `ai-${V.tag}`); fs.rmSync(SRC, { recursive: true, force: true }); fs.cpSync(aiDir, SRC, { recursive: true });
  const rest = require("./lib/own-ai.js")({ OUT, HD, SRC, prefix: V.ai, civs: ALL, flat: NOBRANCH, inline: [
    { name: "CalcGAIKAPriority", player: "idPlayer" }, { name: "EvalRecruit", player: "sq.Player" }, { name: "CalcMaxTake", player: "idPlayer" }, { name: "CheckMAIKA", player: "idPlayer" },
    { name: "GetGAIKAStrat", player: "idPlayer" }, { name: "HeroSkill Default", player: "hero.player" }, { name: "TSH_HeroSkills", player: "hero.player" },
    { name: "TSH_Research", player: "set.player" }, { name: "TSH_TempleRecruit", player: "set.player" },
    { name: "TSH_RecruitArmy", player: "set.player", set: "flat" }, { name: "TSH_HeroRecruit", player: "set.player", set: "flat" }, { name: "TSH_ArenaRecruit", player: "set.player", set: "flat" }] });
  console.log(`AI: ${rest.forks.length} scripts as ${V.ai}* copies started by Main.vs and the strategies (${rest.forks.join(", ")}); ${rest.inlined.length} inside the game's (${rest.inlined.join(", ")})`);
  const tactics = readJson(path.join(EXTRAS, "tactics.json"));       // the mod's GetTacticScript, read by hand (see NOTES.md)
  const toConst = id => id[0].toUpperCase() + id.slice(1);
  const r = require("./lib/greek-ai.js")({ OUT, HD, prefix: V.ai, constName: CONST, varRe: new RegExp(`^AIV_(Max${PREFIX}|Time)`), extra: rest, civs: NOBRANCH,
    tactics: Object.fromEntries(Object.entries(tactics.picks).map(([k, v]) => [k === "greece" ? CONST : toConst(V.tok + k), v])), guards: {} });
  console.log(`AI: ${r.names.length} scripts run as ${V.ai}* (${r.loops.join(", ")})`);
  // The mod edited none of the monitors Main.vs starts: the patch would send the mod's AI players out of Main.vs without starting any (own-ai.js writes it
  // whatever it forked), and the game's monitors would never run for them
  if (!rest.forks.some(n => /Monitor$|^(Prioritize|Recruiter)$/.test(n))) fs.rmSync(path.join(OUT, "patches", "DATA", "AI", "MAIN.VS"), { force: true });
  // GS_Capture: a group strategy is chosen by GetGAIKAStrat (the mod did not edit it: the game's returns the game's constant), so a copy nobody picks is not shipped
  for (const n of rest.forks.filter(n => /^GS_/.test(n))) {
    fs.rmSync(path.join(find(OUT, "DATA/AI"), `${V.ai}${n}.VS`), { force: true });
    const ini = path.join(OUT, "patches", "DATA", "AI", "AI.INI");
    wr(ini, rd(ini).split(/\r?\n/).filter(l => !new RegExp(`${V.ai}${n}\\b`).test(l)).join("\r\n"));
    report.push(`AI ${n}: the mod's edit is not ported (the game picks its group strategy by name)`);
  }
  // 6b. a call to a script of the port's own AI that the port does not ship: the game answers "No matching function" / the script is not found and the AI player stops
  // (found by tools/lib/greek-2x-names.js in the 2.3: the Greek tactic ran GRW23_TS_AttackAtWill.vs, a copy the 2.3 never had; the renaming of the tactics wrote the prefix
  // into the call anyway). It is the game's own script then.
  {
    const AIDIR = find(OUT, "DATA/AI"), HDAI = find(HD, "DATA/AI"), esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), pre = esc(V.ai), notes = [];
    const ci = (d, n) => fs.readdirSync(d).find(x => x.toLowerCase() === n.toLowerCase()), inPort = n => !!ci(AIDIR, n), inHD = n => !!ci(HDAI, n);
    for (const f of fs.readdirSync(AIDIR).filter(x => x.toLowerCase().startsWith(V.ai.toLowerCase()) && /\.vs$/i.test(x))) {
      const p = path.join(AIDIR, f), s = rd(p);
      const t = s.replace(new RegExp(`(["'])${pre}([\\w ]+)\\.vs\\1`, "gi"), (m, q, n) => { if (inPort(`${V.ai}${n}.vs`) || !inHD(`${n}.vs`)) return m; notes.push(`${f}: ${V.ai}${n}.vs -> ${n}.vs (the game's)`); return `${q}${n}.vs${q}`; });
      if (t !== s) wr(p, t);
    }
    console.log(`AI names: ${notes.length} put right${notes.length ? "\n  " + notes.join("\n  ") : ""}`);
  }
  fs.rmSync(SRC, { recursive: true, force: true });
}
console.log(`menu skin: ${require("./lib/menu-skin.js").skinToPatches({ OUT, HD })} layout files became patches of the keys they changed`);

// ---- 7. the mod's versions of the game's behavior scripts: copies of their own (<name>_<tag>.vs) that the classes of the mod's civilizations point to ---------
// port-140.js already merged each one with HD (HD + the mod's edits), so the file at the game's path is the copy to make (tools/lib/own-scripts.js).
{
  const letters = CIVS.map(c => ({ id: c.id, letter: c.prefix, from: c.base === "RepublicanRome" ? ["R", "M"] : [c.baseLetter], match: new RegExp(`^(${c.prefix}|${c.id}\\.)`, "i") }));
  const flags = { [`${V.tok}rome`]: { ChooseRepublicanRome: true }, [`${V.tok}imperial`]: { ChooseImperialRome: true }, [`${V.tok}punic`]: { ChoosePunicRome: true } };
  for (const c of letters) if (flags[c.id]) c.flags = flags[c.id];
  // the hero base each branch hires, written in arena_hirehero.vs as the game\'s class ("RepublicanRomanHero", "ImperialRomanHero", "AncientRomanHero"): each clone\'s own
  // (AGENTS.md: class ids a script writes as text are each clone\'s own). The branches that are not the clone\'s are `if (false)` there: they name its hero too
  const HIRE = { [`${V.tok}rome`]: "RepublicanRomanHero", [`${V.tok}imperial`]: "ImperialRomanHero", [`${V.tok}punic`]: "AncientRomanHero" };
  for (const c of letters) if (HIRE[c.id]) {
    const hero = (CIVS.find(x => x.id === c.id).branch.hire ? `${c.letter}${HIRE[c.id]}` : null) || ({ [`${V.tok}rome`]: `${c.id[0].toUpperCase()}${c.id.slice(1)}Hero` })[c.id];
    c.scripts = { "arena_hirehero.vs": [[/GetRandomHeroClass\(\s*"(?:RepublicanRomanHero|ImperialRomanHero|AncientRomanHero)"/g, `GetRandomHeroClass("${hero}"`]] };
  }
  const r = require("./lib/own-scripts.js")({ OUT, HD, tag: V.tag, skip: /rand\(\s*776|nLobbyBranch|ChooseRomanRace/i,
    dynamic: [/EnvReadString\(\s*\.settlement\s*,\s*subFac\s*\)\s*!=\s*"researched"/g],
    inherit: true, modClasses: path.join(MERGED, "classes"), civs: letters });
  // the guard post's sentries: "GREEK MOD: pRace == ImperialRome -> H" named Greece's class by the letter of the game's Imperial Rome; Greece has a race and a prefix of its own
  for (const f of fs.readdirSync(find(OUT, "DATA/SUBAI")).filter(f => /^GGuardPost_Sentries/i.test(f))) {
    const p = path.join(find(OUT, "DATA/SUBAI"), f), t = rd(p), n = t.replace(/\n[ \t]*\/\/GREEK MOD:\r?\n[ \t]*if\s*\(\s*pRace\s*==\s*ImperialRome\s*\)\s*\{\s*sRace\s*=\s*"H";\s*\}[ \t]*\r?\n/, "\n");
    if (n !== t) wr(p, n); else report.push(`${f}: the Greek test of sRace was not found`);
  }
  console.log(`scripts of the mod's own for its civilizations: ${r.copied.length} copied (_${V.tag}), ${r.skipped.length} left to the game's (${r.skipped.map(s => s.name).join(", ")})`);
  console.log(`  methods inherited from the game's classes whose script the mod edited: ${r.injected} <method> written inside ${r.touched} classes; behaviors inherited and left the game's: ${(r.behaviorsLeft || []).join("; ") || "none"}`);
  fs.mkdirSync(path.join(ROOT, "raw"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "raw", `${V.dir}-own-scripts.txt`), r.copied.map(c => `${c.from} -> ${c.to}  (${c.users.slice(0, 4).join(", ")}${c.users.length > 4 ? ", ..." : ""})`).join("\n") + "\n\nnot copied:\n" + r.skipped.map(s => `${s.name}: ${s.why}`).join("\n") + "\n");
}

// ---- 7b. what the mod changes that no clone can carry: reported, not ported (AGENTS.md, "World rules packs") ------------------------------------------
// The game's files the mod replaced that are global (values of the game's .ini files, tables, scripts of its own, game modes, item scripts, random map lists)
// and the game's classes no civilization of the port took (neutral objects, other races): raw/<id>-global.md has each one with the game's value and the mod's, so
// that a rules pack can be built later. Written before step 8, which takes the files out.
{
  const lines = [`# ${V.name}: left out because it is global`, "", "What the mod changes that cannot be scoped to a clone (generated by tools/greek-2x.js; the game's value is HD's, the mod's is what port-140.js merged: HD plus the mod's edits).", ""];
  const hdBy = new Map(walk(HD).map(f => [f.toLowerCase(), path.join(HD, f)]));
  const keyed = t => { const m = new Map(); let sec = ""; for (const l of t.replace(/\r/g, "").split("\n")) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; continue; } const k = l.match(/^\s*([^;#=\s][^=]*?)\s*=\s*(.*?)\s*$/); if (k) m.set(`${sec}|${k[1]}`, k[2]); } return m; };
  const ini = ["DATA/CONST.INI", "DATA/UNIT_SPECIALS.INI", "DATA/SKILLS.INI"];
  for (const rel of ini) {
    const mp = find(OUT, rel), hp = hdBy.get(rel.toLowerCase()); if (!mp || !hp) continue;
    // (MName00x: the names of Greece's heroes, ported as <prefix>Name00x)
    const A = keyed(rd(hp)), B = keyed(rd(mp)), ch = [...B].filter(([k, v]) => A.has(k) && A.get(k) !== v && !/\|MName00\d$/.test(k)), added = [...B].filter(([k]) => !A.has(k));
    lines.push(`## ${rel}`, "", `${ch.length} values the game has and the mod changed (game -> mod), ${added.length} keys the game lacks (those are added by patches/ when a script of the mod reads them).`, "", "| section | key | game | mod |", "|---|---|---|---|", ...ch.map(([k, v]) => `| ${k.split("|")[0]} | ${k.split("|")[1]} | ${A.get(k)} | ${v} |`), "");
  }
  const lineDiff = (a, b) => { const sa = new Set(a.split(/\r?\n/).map(x => x.trim()).filter(Boolean)), sb = new Set(b.split(/\r?\n/).map(x => x.trim()).filter(Boolean)); return { removed: [...sa].filter(x => !sb.has(x)), added: [...sb].filter(x => !sa.has(x)) }; };
  const text = [];
  for (const f of walk(OUT).filter(f => /^DATA\/(?!CLASSES|COMMANDS|INTERFACE\/(CMDBAR|INFOBAR))/i.test(f) && /\.(xml|vs|ini|txt|grid)$/i.test(f) && !ini.some(i => i.toLowerCase() === f.toLowerCase()))) {
    const hp = hdBy.get(f.toLowerCase()); if (!hp) continue;
    const a = rd(hp), b = rd(path.join(OUT, f)); if (a === b) continue;
    const d = lineDiff(a, b); if (d.added.length + d.removed.length) text.push(`- \`${f}\`: ${d.removed.length} lines of the game's changed or removed, ${d.added.length} added by the mod`);
  }
  lines.push("## Other files of the game the mod replaced (data tables, scripts, game modes, item scripts, random map lists)", "", "Scripts the civilizations of the port use are not here: they are copies of their own (`_" + V.tag + "`). These are the files at the game's own path; the ones with Greek content became patches (step 8).", "", ...text, "");
  const owned = new Set();
  for (const f of fs.readdirSync(path.join(OUT, "civs"))) for (const o of Object.keys(readJson(path.join(OUT, "civs", f)).alias.classes || {})) owned.add(o.toLowerCase());
  const orphan = [];
  for (const f of fs.readdirSync(path.join(MERGED, "classes")).filter(f => /\.sc\.xml$/i.test(f))) {
    const s = rd(path.join(MERGED, "classes", f)), id = classOf(s), race = (s.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1];
    if (id && !owned.has(id.toLowerCase()) && !/^Base|^Hero$/.test(id)) orphan.push(`${id}${race ? ` (race ${race})` : ""}`);
  }
  lines.push("## The game's classes the mod changed that no civilization of the port took", "", "Neutral objects and classes of no clone (their changed attributes are in the mod's classes under work/: not ported).", "", orphan.length ? orphan.map(x => `- ${x}`).join("\n") : "none", "");
  fs.writeFileSync(path.join(ROOT, "raw", `${V.dir}-global.md`), lines.join("\n") + "\n");
  console.log(`global: ${ini.length} ini files, ${text.length} other files, ${orphan.length} classes -> raw/${V.dir}-global.md`);
}

// ---- 8. the game's files the mod replaced: only what is Greek, as patches; the rest goes ------------------------------------------------------------------
{
  fs.rmSync(path.join(OUT, "hidden.txt"), { force: true });
  const GREEKRE = new RegExp(`Greece|Greek|\\b${PREFIX}[A-Z][a-z]|train${PREFIX}\\b|Athena|Aegle|Zeus|Circe|Hecate|Olympic|Ares|${CONST}`);
  const { gameFilesToPatches } = require("./lib/independent.js");
  const r = gameFilesToPatches({ OUT, HD, GREEK: GREEKRE, keep: /^(currentlang|ui\/menu)\//, skipFiles: /^DATA\/SUBAI\/(VERIFY_RESEARCH|UNIT_ATTACH_VERIFY)\.VS$/i });
  console.log(`game files: ${r.patches.length} became patches, ${r.dropped.length} left out`);
  fs.writeFileSync(path.join(ROOT, "raw", `${V.dir}-left-out.txt`), r.dropped.join("\n") + "\n\n" + r.report.join("\n") + "\n");
}
// const.ini: the names of Greece's heroes (MName00x -> <prefix>Name00x) and the keys the game does not have that the mod's scripts read
{
  const hp = find(HD, "DATA/CONST.INI"), mp = find(FLAT, "DATA/CONST.INI");
  if (hp && mp) {
    const keys = t => new Set([...t.matchAll(/^\s*(\w+)\s*=/gm)].map(m => m[1].toLowerCase())), hdKeys = keys(rd(hp));
    const mine = rd(mp), nm = [...mine.matchAll(/^\s*MName(00\d)\s*=\s*(.+?)\s*$/gm)].filter(m => !new RegExp(`^\\s*MName${m[1]}\\s*=\\s*${m[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(rd(hp))).map(m => `${PREFIX}Name${m[1]} = ${m[2]}`);
    const gp = (mine.match(/^\[GamePlay\][^]*?(?=^\[|(?![^]))/m) || [""])[0], addK = [...gp.matchAll(/^\s*(\w+)\s*=.*$/gm)].filter(m => !hdKeys.has(m[1].toLowerCase()) && !/^(UI|Cinematics|Language|MName)/i.test(m[1])).map(m => m[0].trim());
    if (nm.length || addK.length) wr(path.join(OUT, "patches", "DATA", "CONST.INI"), `[GamePlay]\r\n${[...nm, ...addK].join("\r\n")}\r\n`);
    console.log(`const.ini: ${nm.length} Greek hero names and ${addK.length} keys of the mod's scripts; the mod's tuning of the game left out`);
  }
}
// two item scripts of the mod that the game's compiler cannot read (no signature line): the item's owner is the argument
for (const f of ["BELT OF SNAKES REMOVE.VS", "FEATHER AMULET REMOVE.VS"]) { const p = find(OUT, `DATA/ITEMSCRIPTS/${f}`); if (p && !/^\s*\/\//.test(rd(p))) wr(p, "//void, Obj owner\r\n" + rd(p)); }

// ---- 9. Greece: the declaration, the city and villages of the random map ---------------------------------------------------------------------------------
{
  const alias = {};                                        // what the game's AI asks for in Imperial Rome -> the Greek class
  const map = { MTownhall: "Townhall", MBarracks: "Barracks", MBlacksmith: "Blacksmith", MTemple: "Temple", MTavern: "Tavern", MTavern2: "Tavern2", MArena: "Arena", MTower: "Tower", MSentry: "Sentry", MSentry1: "Sentry1", MGuardPostSentry: "GuardPostSentry" };
  for (const g of ["Gate0", "Gate1", "Gate2", "Gate3", "Gate4", "Gate5", "Gate6", "Gate7", "WallsE", "WallsN", "WallsNE", "WallsNW", "WallsS", "WallsSE", "WallsSW", "WallsW"]) map["M" + g] = g;
  for (const [k, v] of Object.entries(map)) if (fs.existsSync(path.join(CLASSES, `${(PREFIX + (v)).toUpperCase()}.SC.XML`))) alias[k] = PREFIX + v;
  const civ = { id: RACE, base: "ImperialRome", name: Object.fromEntries(Object.entries(GREEK.name).map(([k, v]) => [k, `${v} (${V.label})`])), letter: PREFIX, internalName: INTERNAL, template: TEMPLATE, ai: true, alias: { classes: alias, commands: {} } };
  wr(path.join(OUT, "civs", `${RACE}.json`), JSON.stringify(civ, null, 2) + "\n");
  fs.rmSync(path.join(OUT, "civs", "greek.json"), { force: true });
}
{
  const hpfs = require("./hpfs.js"), pk = find(FULL, "Packs/RandomMapSettlements.bfhp");
  if (pk) {
    const e = hpfs(fs.readFileSync(pk)).find(x => /maps\/1\/map\.obj\.xml$/i.test(x.path));
    const text = swap(e.read().toString("latin1").replace(/\r\n/g, "\n")).replace(/\bM(Tower|Walls[NSEW]+|Gate\d)\b/g, `${PREFIX}$1`);
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
    wr(path.join(OUT, "patches", "randommapsettlements", "maps", "1", "map.obj.xml"), `<patch>\n  <!-- Templates of ${TEMPLATE}: the Greek towns and villages of the ${V.name}, with its classes renamed. Free area of the map: y 24192-27904 -->\n  <add select="/mapobject">\n${out.join("\n")}\n  </add>\n</patch>\n`);
    console.log(`${out.length} Greek templates (${TEMPLATE})`);
    if (cursorX - 3000 > 31000) report.push("the Greek templates do not fit in the free area");
  } else report.push("no Packs/RandomMapSettlements.bfhp: no Greek templates for the random map");
}
// Greece's barracks: the mod gave it ONE exit point (type 2, -32,-50) = cell 61,68 of its .PASS (SDK's pass.js), the very end of a 1-2 cell dead-end corridor through
// the footprint (a 34x33 cell diamond), on the steps at the back of the courtyard. In game (maintainer, 2.3 and 2.5.3, units trained and looked at) the troops stayed
// stuck on the steps in "Greek Town 2" (barracks north-west of the town hall) and came out in "Greek Town 1" (south-west). Tried, one run each, not repeated:
//   (-32,-50) cell 61,68 (the original)        stuck in Town 2 (2.5.3, as in 2.3)
//   (-16,-50) cell 62,68                        out well in Town 2 AND in Town 1 (2.5.3)       <- the fix below
//   (0,-34)   cell 63,67                        also worked in Town 2
//   three door points (64,22 / 80,34 / 96,45)   worked in 2.3, but they are not needed
//   two tries outside the building (200 units south of the diamond; at the mouth of the corridor): the troops came out but far from the door
// Row 68 of the .PASS has free cells 61, 62 and 63 only; 61 is the end of the corridor (free 3x3 around it: 4/9, against 6/9 for 62). That fits, but WHY the engine fails at
// 61 and in one layout only is NOT proven (nothing in either layout is within 250 map units of the point). The minimal fix: that point moves from x=-32 to x=-16; the
// points of type 10 and 12 stay at -32,-50 and nothing else changes.
{
  const f = path.join(OUT, "BUILDINGS", `${PREFIX}BARRACKS`.toUpperCase(), `${PREFIX}BARRACKS.ENT.XML`.toUpperCase());
  if (fs.existsSync(f)) {
    const t = fs.readFileSync(f, "latin1"), re = /(<point idx="\d+" type="2" x=)"-32"( y="-50"\/>)/;
    if (!re.test(t)) report.push("the barracks' exit point is not where it was moved from (type 2, -32,-50): look at it");
    else wr(f, t.replace(re, '$1"-16"$2'));
  }
}
// the mod's own files (extras/<id>/: mod.json, hand patches)
if (fs.existsSync(EXTRAS)) for (const f of walk(EXTRAS)) { if (f === "NOTES.md" || f === "tactics.json" || f === "legacy-left-out.txt") continue; const dst = path.join(OUT, f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.copyFileSync(path.join(EXTRAS, f), dst); }

// ---- 10. conquests -----------------------------------------------------------------------------------------------------------------------------
// A conquest at the path of the game's or of another port's is renamed, whatever the bytes (tools/lib/conquests.js; before tagCollisions). The Greece territory
// is played as Greece: the interface of a <territory> (the territories.xml inside the .bfhp) is the race of the player, 4 (ImperialRome) in the original, here
// the index of this civilization. The engine assigns it (imperivm-resurrected#37): the lowest free number from 10 over the civilizations without an index, in
// the order of their lowercase ids, with this set alone in the profile (the case a conquest is played in). Needs a DLL with imperivm-resurrected#45.
const LATER = LINE.slice(LINE.indexOf(V.dir) + 1);     // the later versions of the line: they are built against this one, never the other way round
const others = () => [G, ...fs.readdirSync(PORTED).filter(d => d !== V.dir && !LATER.includes(d) && fs.existsSync(path.join(PORTED, d, "mod.json"))).map(d => path.join(PORTED, d))].filter(d => fs.existsSync(d) && fs.statSync(d).isDirectory());
{
  const hpfs = require("./hpfs.js"), ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase()), dataRe = /(\bdata\s*=\s*"ConquestMaps[\/\\])([^"]+)"/i;
  const r = require("./lib/conquests.js")({ OUT, others: others(), tag: V.tag, label: V.label });
  const problems = [];
  for (const c of r.done) {
    console.log(`conquest ${c.from} -> ${c.to} (${c.folder})`);
    const m = /^(.*) -> (.*)$/.exec(c.folder), cm = path.join(OUT, "ConquestMaps");
    if (m && !ci(cm, m[1]) && !ci(cm, m[2])) {                // not in the port: the game's folder, under the new name
      const from = path.join(G, "ConquestMaps", ci(path.join(G, "ConquestMaps"), m[1]) || m[1]), to = path.join(cm, m[2]);
      if (!fs.existsSync(from)) { problems.push(`ConquestMaps/${m[1]}: not in the port nor in the game's`); continue; }
      fs.cpSync(from, to, { recursive: true });
      const t = ci(to, "territories.xml");
      if (t) { const p = path.join(to, t), s = rd(p); wr(p, s.replace(dataRe, (_x, a) => `${a}${m[2]}"`)); }
      console.log(`  ConquestMaps/${m[2]}: the game's ${m[1]} (the mod ships none)`);
    }
  }
  problems.push(...r.problems.filter(x => !/no such folder in the port/.test(x)));
  if (problems.length) report.push("conquests: " + problems.join("; "));
  const ids = [GREEK.id, ...CIVS.map(c => c.id)].sort(), index = 10 + ids.indexOf(GREEK.id);
  const cDir = find(OUT, "Conquests");
  for (const f of cDir ? fs.readdirSync(cDir).filter(f => /\.bfhp$/i.test(f)) : []) {
    const bfhp = path.join(cDir, f), buf = fs.readFileSync(bfhp), e = hpfs(buf).find(x => /^territories\.xml$/i.test(x.path)), raw = e && e.read().toString("latin1");
    const out = raw && raw.replace(/(<territory\b[^>]*\bid="Greece"[^>]*\binterface=")\d+"/, (_m, a) => `${a}${index}"`);
    if (!out || out === raw) continue;
    try { e.write(Buffer.from(out, "latin1")); fs.rmSync(bfhp); fs.writeFileSync(bfhp, buf); console.log(`conquest ${f}: Greece plays as ${RACE} (interface ${index}, its index with this set alone)`); }
    catch (err) { report.push(`conquest ${f}: Greece interface not set (${err.message})`); }
  }
}

// port-140.js copies extras/<id>/ whole: the Legacy list is a build input, not part of the mod (and tagCollisions would rewrite the names in it)
fs.rmSync(path.join(OUT, "legacy-left-out.txt"), { force: true });
// ---- 11. names another port (or the game's adventures) already has with other bytes: this port's are renamed ------------------------------------------------
{
  const { tagCollisions, ownNames, tagNames } = require("./lib/ported-patch.js");
  const extra = EXTRA_PORTS;
  console.log(`names compared with: ${others().filter(d => d !== G).length} ports of this worktree and ${extra.length ? extra.map(d => path.basename(d)).join(", ") + " from " + path.dirname(extra[0]) : "no Imperivm Legacy"}`);
  for (let pass = 1; pass <= 6; pass++) {
    const r = tagCollisions({ OUT, tag: V.tag, others: [...others().filter(d => d !== G), ...extra, G, path.join(G, "paks")].filter(fs.existsSync), mapLabel: V.label, skip: /^(currentlang|ui\/menu|data\/interface\/menu)\// });
    console.log(`own names (${V.tag}), pass ${pass}: ${r.classes.length} classes (${r.classes.slice(0, 6).join(", ")}...), ${r.folders.length} art folders, ${r.maps.length} maps, ${r.files.length} files${r.unlabeled.length ? "; names not written: " + r.unlabeled.slice(0, 4).join(" | ") : ""}`);
    if (!r.classes.length && !r.folders.length && !r.maps.length && !r.files.length) break;
  }
  // the voices of the neutral units (Voices/CHORSEMAN...): the folder follows its name in the sound entities, which tagCollisions rewrote (CHorseman -> CHorseman_<tag>)
  {
    const vo = find(OUT, "CURRENTLANG/VOICES"), ent = find(OUT, "DATA/SOUND ENTITIES"); let n = 0;
    for (const f of ent ? fs.readdirSync(ent) : []) for (const m of rd(path.join(ent, f)).matchAll(new RegExp(`voices/([^/"]+)_${V.tag}/`, "gi"))) {
      const from = vo && fs.readdirSync(vo).find(x => x.toLowerCase() === m[1].toLowerCase());
      if (from && !fs.existsSync(path.join(vo, `${from}_${V.tag}`))) { fs.renameSync(path.join(vo, from), path.join(vo, `${from}_${V.tag}`)); n++; }
    }
    console.log(`voices: ${n} folders renamed to follow their sound entities`);
  }
  // The voices belong to a language (sdk/languages.md: Local\<language>\voices\<unit>\). port-140.js took the Spanish pack's for everybody (22 kHz 8 bit); the mod's
  // English pack has other takes (44.1 kHz 16 bit). currentlang/voices (every language) = English where the pack has the unit, the Spanish one where it does not
  // (the villagers); Local\spanish and Local\italian have their own pack's. A unit's folder in the packs has the old name (H for Greece's prefix, no _<tag>).
  {
    const vo = find(OUT, "CURRENTLANG/VOICES"), langs = path.join(WORK, `${V.work}-lang`);
    const src = (lang, dir) => { const base = find(langs, `${lang}/CURRENTLANG/VOICES`); if (!base) return null; const old = dir.replace(new RegExp(`_${V.tag}$`, "i"), "").replace(new RegExp(`^${PREFIX}`, "i"), "H"); return find(base, old); };
    const put = (from, to) => { fs.mkdirSync(to, { recursive: true }); for (const f of fs.readdirSync(from)) { fs.rmSync(path.join(to, f), { force: true }); fs.copyFileSync(path.join(from, f), path.join(to, f)); } };
    const n = { english: 0, spanish: 0, italian: 0 }; let fallback = 0;
    if (vo) for (const dir of fs.readdirSync(vo)) {
      const own = path.join(vo, dir), en = src("english", dir);
      for (const l of ["spanish", "italian"]) { const s = src(l, dir); if (s) { put(s, path.join(OUT, "local", l, "voices", dir.toUpperCase())); n[l]++; } }
      if (en) { fs.rmSync(own, { recursive: true }); put(en, own); n.english++; } else fallback++;   // no English recording: the Spanish pack's stays for every language
    }
    console.log(`voices per language: english ${n.english}, spanish ${n.spanish}, italian ${n.italian}; ${fallback} units with no English recording keep the Spanish one for every language`);
  }
  // researches, orders and items two of these mods define under the same name ("Olympic Games", "Greek archers"...): the name is the key of the research's state
  const mine = ownNames(OUT, HD), clash = { cmds: new Set(), items: new Set() };
  for (const o of fs.readdirSync(PORTED).filter(d => d !== V.dir && !LATER.includes(d) && fs.existsSync(path.join(PORTED, d, "mod.json")))) { const t = ownNames(path.join(PORTED, o), HD); for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) clash[k].add(n); }
  const nm = new Set([...clash.cmds, ...clash.items]);
  console.log(`names shared with another port: ${clash.cmds.size} orders, ${clash.items.size} items -> "(${V.tag})" in ${tagNames({ OUT, names: nm, tag: V.tag })} files`);
}

// ---- 11a. what the texts name and the renames may have broken (tools/lib/greek-2x-refs.js): pictures, sounds, entities, renamed files -----------------------------------
// tagCollisions renames a file by its name alone and rewrites every reference by name, in every folder: a reference to a file that was not the renamed one points to
// nothing (the blue square of the missing picture). The post-pass puts back what the mod's text said when THAT resolves; the check stops the build for the rest.
{
  const refs = require("./lib/greek-2x-refs.js");
  const fixedPics = [...refs.fixBmpRefs(OUT, HD, V.tag), ...refs.fixSoundRefs(OUT, HD, V.tag)], fixedWords = refs.fixClassWords(OUT, V.tag);
  console.log(`references: ${fixedPics.length} pictures and sound entities and ${fixedWords.length} order names put back to the name the mod's text had (a rename by file name alone had changed them)`);
  for (const l of [...fixedPics, ...fixedWords]) console.log("  fixed " + l);
  const list = path.join(ROOT, "extras", V.dir, "legacy-left-out.txt");
  const legacy = V.legacyLeft && fs.existsSync(list) ? fs.readFileSync(list, "utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#")) : [];
  // the mod's own package does not have these either (checked: not in its packs nor in HD's, in the 2.3, the 2.5.3 and the 2.6.1)
  const ownBugs = new Map([1, 2, 3, 4, 5].map(i => [`currentlang/voices/tteutonwolf/${i}.wav`, "the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either"]));
  const r = refs.checkRefs(OUT, HD, V.tag, { legacy, extraRoots: [path.join(G, "local-spanish")], hdClasses: refs.hdSounds(HD), ownBugs });
  console.log(`references: ${r.checked} checked, ${r.problems.length} that do not resolve, ${r.allowed.size} allowed`);
  for (const [k, why] of r.allowed) console.log(`  allowed ${k}: ${why}`);
  for (const p of r.patternBroken) report.push(`${p}: renamed to a name that does not end in .sc.xml; whether the class loader reads it was not checked`);
  if (r.problems.length) { console.error("REFERENCES that do not resolve:\n  " + r.problems.join("\n  ")); process.exitCode = 1; }
}

// ---- 11b. every script of the port has balanced braces and parentheses (a bad merge of HD's and the mod's edits does not compile: the script stops, and for the AI
// every AI player of the mod's civilizations stops with it) --------------------------------------------------------------------------------------------------
{
  const bad = [];
  for (const f of walk(OUT).filter(f => /\.vs$/i.test(f) && /^(DATA\/(SUBAI|AI|AI HELPERS|GAMESCRIPTS|ITEMSCRIPTS)|patches\/DATA\/(SUBAI|AI|ITEMSCRIPTS))\//i.test(f))) {
    const t = rd(path.join(OUT, f)).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, "");
    const n = c => t.split(c).length - 1;
    if (n("{") !== n("}") || n("(") !== n(")")) bad.push(`${f} ({ ${n("{")} } ${n("}")} ( ${n("(")} ) ${n(")")})`);
  }
  if (bad.length) { console.error("UNBALANCED scripts (a bad merge): " + bad.join("; ")); process.exitCode = 1; } else console.log("scripts: braces and parentheses balanced in every one");
}

// ---- 11c. what the scripts name: patches applied to the game's scripts with the engine's algorithm, hero bases, classes, GetConst keys (tools/lib/greek-2x-checks.js) -------------
{
  const r = require("./lib/greek-2x-checks.js").checkScripts({ OUT, HD, SDK });
  fs.writeFileSync(path.join(ROOT, "raw", `${V.dir}-script-checks.txt`), [...r.notes, "", `${r.errors.length} errors`, ...r.errors, "", `${r.warnings.length} warnings`, ...r.warnings].join("\n") + "\n");
  console.log(`script checks: ${r.notes[0]}; ${r.errors.length} errors, ${r.warnings.length} warnings (raw/${V.dir}-script-checks.txt)`);
  if (r.errors.length) { console.error("SCRIPT CHECKS FAILED:\n  " + r.errors.join("\n  ")); process.exitCode = 1; }
}

// ---- 12. mod.json and the leftovers -----------------------------------------------------------------------------------------------------------------------
for (const f of walk(OUT).filter(f => /(^|\/)(\.fingerprint|desktop\.ini|thumbs\.db)$/i.test(f))) fs.rmSync(path.join(OUT, f));
fs.rmSync(path.join(OUT, "tactics.json"), { force: true });      // port-140.js copies extras/<id>/ whole; the file is only this tool's input
{
  const mp = path.join(OUT, "mod.json"), j = { ...readJson(mp) };
  j.name = V.name; delete j.incompatibleWith; fs.rmSync(mp); fs.writeFileSync(mp, JSON.stringify(j, null, 2) + "\n", "utf8");
}
if (report.length) console.log("to check:\n  " + report.join("\n  "));
console.log("done");
