// Antíoco III el Grande (Falcata, MODS.md row 215): after tools/port-140.js, what is left to make it a content pack that works next to every other
// mod (AGENTS.md, "Civilizations are independent"). It adds no civilization: it is Falcata's own classes (decor, a few units, a hero, items and
// their scripts) and the two adventures that place them with the Greek Mod's units.
//   node tools/port-140.js <imperium_mod folder> ported/antioco-iii-el-grande --id antioco-iii-el-grande --name "Antíoco III el Grande" --version 1.0 --category Adventures
//   node tools/antioco-iii.js
// It was made for the Greek Mod 1.8 (his post: "deben tener instalado el GreekMod"), whose Greece is "Q" here: see "names of the 1.8" below.
// The zip is a copy of the Greek Mod 1.8 with Falcata's work on top, so most of it is not his:
//   - the menu skin, the editor icons and sounds of the Greek Mod, the Thumbs.db: left out (the Greek Mod ports have them)
//   - the .rle.bmp next to each sprite (the source of the .rle.mmp, which port-140 already made a standalone .rle): left out
//   - the files at the game's paths: items as a patch that adds only Falcata's items, the editor's icon lists the same; the rest (the changes he
//     made to the game's items and sounds, the Greek village commands) is left out
//   - names another mod also uses (the CGWAR has KOutpost, Free_House01...; the MCI has CMERCENARIO): Falcata's get "_ant" (tools/lib/ported-patch.js),
//     and so do the maps' references to them
//   - the trade post's "sell food" order: a patch on the game's commercial outpost commands (it was in his village.xml)
// The adventures go in Adventures/, with their author in game.xml where the editor left "Autor desconocido".
const fs = require("fs"), path = require("path"), os = require("os");
const { tagCollisions } = require("./lib/ported-patch.js"), { gameFilesToPatches } = require("./lib/independent.js");
const hpfs = require("./hpfs.js");
const ROOT = path.join(__dirname, ".."), ID = "antioco-iii-el-grande", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const HD = path.join(ROOT, "originals", "game-data", "paks"), SRC = path.join(ROOT, "originals", "forum", "t1326", "files");
const TAG = "ant", GREEK_MODS = ["greek-civilization-mod", "greek-mod-1-8"];
if (!fs.existsSync(path.join(OUT, "DATA"))) { console.error("run tools/port-140.js into ported/" + ID + " first (see the top of this file)"); process.exit(1); }
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, out) : out.push(p); } return out; };
const rel = (root, p) => path.relative(root, p).replace(/\\/g, "/");
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };

// 1. what is not Falcata's, or is the sprite's source
const mine = walk(OUT), have = new Set(mine.map(p => rel(OUT, p).toLowerCase()));
const greek = new Set(GREEK_MODS.flatMap(m => walk(path.join(ROOT, "ported", m)).map(p => rel(path.join(ROOT, "ported", m), p).toLowerCase())));
let gone = { skin: 0, thumbs: 0, bmp: 0, greek: 0 };
const stash = fs.mkdtempSync(path.join(os.tmpdir(), "antioco-"));       // what goes with the Greek Mod's files, in case one of his classes needs it below
for (const p of mine) {
  const r = rel(OUT, p), k = r.toLowerCase();
  if (/^currentlang\//.test(k)) { fs.rmSync(p); gone.skin++; }
  else if (/(^|\/)thumbs\.db$/.test(k)) { fs.rmSync(p); gone.thumbs++; }
  else if (/\.rle\.bmp$/.test(k) && have.has(k.replace(/\.bmp$/, ""))) { fs.rmSync(p); gone.bmp++; }
  // the Greek Mod's own icons, sounds and the like (his copies are older): the Greek Mod's stay. Entity folders are settled below, by name.
  else if (!/^(units|buildings|mapobjects)\//.test(k) && greek.has(k)) { fs.mkdirSync(path.dirname(path.join(stash, k)), { recursive: true }); fs.copyFileSync(p, path.join(stash, k)); fs.rmSync(p); gone.greek++; }
}
console.log(`left out: ${gone.skin} menu skin files, ${gone.thumbs} Thumbs.db, ${gone.bmp} sprite sources (.rle.bmp), ${gone.greek} files of the Greek Mod`);

// 2. the game's paths: items and the editor's lists as patches with only what he added; the rest is dropped
{
  const r = gameFilesToPatches({ OUT, HD, GREEK: /./, keep: /^(?!)/ });
  console.log("patches:", r.patches.join(", ") || "none", "\ndropped (at the game's paths):", r.dropped.join(", ") || "none", ...r.report.map(x => "\n  " + x));
}
// the items the Greek Mod also defines (he copied them): the Greek Mod's stay
{
  const f = path.join(OUT, "patches", "DATA", "ITEMS.XML"), t = fs.readFileSync(f, "latin1"), taken = new Set();
  for (const m of GREEK_MODS) for (const p of walk(path.join(ROOT, "ported", m, "patches")).filter(p => /items\.xml$/i.test(p))) for (const x of fs.readFileSync(p, "latin1").matchAll(/<item\s[^>]*?\bid\s*=\s*"([^"]+)"/g)) taken.add(x[1].toLowerCase());
  let n = 0;
  const u = t.replace(/<item\s[^>]*?\bid\s*=\s*"([^"]+)"[\s\S]*?<\/item>\s*/g, (m, id) => taken.has(id.toLowerCase()) ? (n++, "") : m);
  fs.writeFileSync(f, u, "latin1");
  console.log(`items in the patch: ${(u.match(/<item\s/g) || []).length} (${n} left to the Greek Mod: ${[...taken].filter(id => t.toLowerCase().includes(`id="${id}"`)).join(", ")})`);
}

// the editor's icon lists: the keys the Greek Mod's patches already have are the Greek Mod's
for (const ini of ["ITEMICONS.INI", "UNITICONS.INI"]) {
  const f = path.join(OUT, "patches", "DATA", "INTERFACE", "EDITOR", "COMBO", ini), key = l => (l.match(/^\s*([^;=\s][^=]*?)\s*=/) || [])[1]?.toLowerCase();
  if (!fs.existsSync(f)) continue;
  const taken = new Set(GREEK_MODS.flatMap(m => walk(path.join(ROOT, "ported", m, "patches")).filter(p => p.toUpperCase().endsWith("/" + ini)).flatMap(p => fs.readFileSync(p, "latin1").split(/\r?\n/).map(key))));
  const keep = fs.readFileSync(f, "latin1").split(/\r?\n/).filter(l => !key(l) || !taken.has(key(l)));
  const left = keep.filter(key).length;
  if (left) fs.writeFileSync(f, keep.join("\r\n"), "latin1"); else fs.rmSync(f);
  console.log(`${ini}: ${left} keys of his own`);
}
// caesar2.bmp is also the MCI's, with other bytes: his goes to the stash and comes back as caesar2_ant.bmp if a map names it (iconFix, below)
for (const p of walk(OUT)) if (/^ui\/icons\/caesar2\.bmp$/i.test(rel(OUT, p))) { fs.mkdirSync(path.join(stash, "ui", "icons"), { recursive: true }); fs.copyFileSync(p, path.join(stash, "ui", "icons", "caesar2.bmp")); fs.rmSync(p); }

// 3. names other mods use: Falcata's get _ant, in the files and in the maps below
const others = fs.readdirSync(path.join(ROOT, "ported")).filter(d => d !== ID && fs.existsSync(path.join(ROOT, "ported", d, "mod.json"))).map(d => path.join(ROOT, "ported", d));
const r = tagCollisions({ OUT, tag: TAG, others: [...others, HD] });
prune(OUT);
console.log(`renamed (${TAG}): ${r.classes.length} classes (${r.classes.join(", ")}), folders ${r.folders.join(", ") || "-"}, files ${r.files.join(", ") || "-"}`);

// a class id another mod has in a file of another name (tagCollisions goes by path): IronMine is the MCI's too
const ids = new Map(r.classes.map(c => [c, `${c}_${TAG}`]));
{
  const clsFiles = d => walk(d).filter(p => /\/data\/classes\/[^/]+\.sc\.xml$/i.test("/" + rel(d, p)));
  const idOf = p => (fs.readFileSync(p, "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
  // (the Community Mod and the Caesar Mod are published packs with no ported/ folder: their classes are in originals/mods)
  const classMods = ["community-mod", "caesar-mod"].map(m => path.join(ROOT, "originals", "mods", m));
  const theirs = new Set([...others, ...classMods].flatMap(o => clsFiles(o).map(idOf)).filter(Boolean).map(x => x.toLowerCase()));
  for (const p of clsFiles(OUT)) {
    const id = idOf(p);
    if (id && theirs.has(id.toLowerCase())) {
      const to = `${id}_${TAG}`, re = new RegExp(`(?<![A-Za-z0-9_/\\\\.])${id}(?![A-Za-z0-9_/\\\\.])`, "g");
      for (const q of walk(OUT).filter(q => /\.(xml|ini|vs|txt)$/i.test(q))) { const s = fs.readFileSync(q, "latin1"), t = s.replace(re, to); if (t !== s) fs.writeFileSync(q, t, "latin1"); }
      fs.renameSync(p, path.join(path.dirname(p), `${to.toUpperCase()}.SC.XML`)); ids.set(id, to);
      console.log(`class ${id} is another mod's too -> ${to}`);
    }
  }
  // his copies of the game's classes (RLiberatus2, BVikingLord2) carry the game's altid: two classes cannot share one (SDK, civilizations.md)
  for (const p of clsFiles(OUT)) { const s = fs.readFileSync(p, "latin1"), t = s.replace(/(<class\b[^>]*?)\s+altid\s*=\s*"[^"]*"/, "$1"); if (t !== s) { fs.writeFileSync(p, t, "latin1"); console.log(`altid removed: ${path.basename(p)}`); } }
}

// the Greek Mod 1.8 (the mod he made it for) calls its Greece "Q" here, not "H" as in 2021 (tools/greek-1-8.js: HHoplite -> QHoplite, Units/HHERO3 ->
// Units/QHERO3, VoiceHHoplite...): his references to the 1.8's names follow, in his files and in the maps. A name is changed only if the 1.8 has the
// Q one and he does not ship the H one himself (HHoplite3, HPriest2 and the hero icons HHero10... are his).
const G18 = path.join(ROOT, "ported", "greek-mod-1-8");
const stemOf = s => s.replace(/(\.(ent|sc|rle|pass))*\.[^.]*$/i, "").toLowerCase();
const q18 = new Set(walk(G18).flatMap(p => rel(G18, p).split("/").map(stemOf)));
const own = new Set(walk(OUT).flatMap(p => rel(OUT, p).split("/").map(stemOf)));
const toQ = new Map();                                              // what was changed, for the report
const NAME = /(?<![A-Za-z0-9])((?:Hero|train|Voice)?)(H[A-Za-z0-9_]*)(?![A-Za-z0-9])/g;
// the hero base his three heroes hang from: the 1.8 port calls it QGreekHero (greek-1-8.js, "Q goes in front"); without it the class has no parent and the
// game drops to the menu on Start, with nothing in the log
const swapQ = s => s.replace(/(?<![A-Za-z0-9_])GreekHero(?![A-Za-z0-9_])/g, () => (toQ.set("GreekHero", "QGreekHero"), "QGreekHero")).replace(NAME, (m, pre, h) => {
  const q = pre + (h[0] === "H" ? "Q" : "q") + h.slice(1);
  if (own.has(m.toLowerCase()) || !q18.has(q.toLowerCase())) return m;
  toQ.set(m, q); return q;
});
for (const p of walk(OUT).filter(p => /\.(xml|vs|ini|txt)$/i.test(p))) { const s = fs.readFileSync(p, "latin1"), t = swapQ(s); if (t !== s) fs.writeFileSync(p, t, "latin1"); }
console.log(`names of the 1.8 (H -> Q): ${[...toQ].map(([a, b]) => `${a}>${b}`).join(" ")}`);

// the icons his classes and items name that nothing has now (the 1.8 does not, and his copy went with the Greek Mod's): his own, back. If another mod
// has the file with other bytes (the 4.2's and the MCI's cmercenario.bmp) it gets a name of his own. The editor's lists lose the keys whose icon is gone.
{
  const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
  const hdHas = new Set(walk(HD).map(p => rel(HD, p).toLowerCase())), g18Has = new Set(walk(G18).map(p => rel(G18, p).toLowerCase()));
  const exists = k => hdHas.has(k) || g18Has.has(k) || walk(path.join(OUT, "UI", "ICONS")).some(p => rel(OUT, p).toLowerCase() === k);
  const text = walk(OUT).filter(p => /\.xml$/i.test(p) && /(^|\/)(data\/classes\/|patches\/data\/items\.xml$)/i.test(rel(OUT, p)));
  const wanted = new Set(text.flatMap(p => [...fs.readFileSync(p, "latin1").matchAll(/gameres\/icons\/([^"=\r\n<]+?\.bmp)/gi)].map(m => m[1])));
  const restored = [];
  for (const icon of wanted) {
    const k = "ui/icons/" + icon.toLowerCase();
    if (exists(k) || !fs.existsSync(path.join(stash, k))) continue;
    const clash = others.some(o => walk(path.join(o, "UI", "ICONS")).some(p => rel(o, p).toLowerCase() === k && md5(p) !== md5(path.join(stash, k))));
    const name = clash ? icon.replace(/\.bmp$/i, `_${TAG}.bmp`) : icon;
    fs.mkdirSync(path.join(OUT, "UI", "ICONS"), { recursive: true });
    fs.copyFileSync(path.join(stash, k), path.join(OUT, "UI", "ICONS", name));
    if (clash) for (const p of text) { const s = fs.readFileSync(p, "latin1"), t = s.split(icon).join(name); if (t !== s) fs.writeFileSync(p, t, "latin1"); }
    restored.push(name);
  }
  console.log(`icons of his classes put back: ${restored.join(", ") || "none"}`);
  for (const f of walk(path.join(OUT, "patches", "DATA", "INTERFACE", "EDITOR", "COMBO"))) {
    const lines = fs.readFileSync(f, "latin1").split(/\r?\n/);
    const keep = lines.filter(l => { const m = l.match(/=\s*gameres\/icons\/(.+?\.bmp)\s*$/i); return !m || exists("ui/icons/" + m[1].toLowerCase()); });
    if (keep.length !== lines.length) { console.log(`${path.basename(f)}: ${lines.length - keep.length} keys with no icon left out`); fs.writeFileSync(f, keep.join("\r\n"), "latin1"); }
  }
}

// his maps place hero versions of the game's units (HeroCNoble, HeroESwordsman, HeroRTribune, HeroRScout, HeroRChariot) that the 1.8 defined and its
// port does not carry (they are changes to the game's civilizations): without them the game says "could not create an object", the named actors of a
// conversation are missing and it crashes when the dialogue opens. They are copied from the 1.8's own files with a name of his (_ant), their altid
// (RHorseman) dropped; the entities and sounds they use are the game's.
{
  const FLAT = path.join(ROOT, "originals", "greek-mod-1.8-flat", "DATA", "CLASSES");
  if (!fs.existsSync(FLAT)) throw new Error("originals/greek-mod-1.8-flat is needed (see extras/greek-mod-1-8/NOTES.md, Rebuild)");
  for (const id of ["HeroCNoble", "HeroESwordsman", "HeroRTribune", "HeroRScout", "HeroRChariot"]) {
    const from = path.join(FLAT, `${id.toUpperCase()}.SC.XML`), to = `${id}_${TAG}`;
    const s = fs.readFileSync(from, "latin1").replace(new RegExp(`\\bid="${id}"`), `id="${to}"`).replace(/(<class\b[^>]*?)\s+altid\s*=\s*"[^"]*"/, "$1");
    fs.writeFileSync(path.join(OUT, "DATA", "CLASSES", `${to.toUpperCase()}.SC.XML`), s, "latin1");
    ids.set(id, to);
  }
  console.log("hero classes of the 1.8 copied: HeroCNoble, HeroESwordsman, HeroRTribune, HeroRScout, HeroRChariot (_ant)");
}

// the icons his maps name (an object's Icon="gameres/icons/hhero7.bmp", a conversation's SetDefActor): a missing one makes the dialogue crash the game
// when it opens. The 1.8 draws them as qhero<N> (its Greek heroes are Q here); the rest are his own copies, which other mods also have with other bytes
// (the 4.2's chero9, nhero10...): they get a name of his (_ant), the way the maps' classes did.
const iconHave = new Set([...walk(HD), ...walk(G18)].map(p => rel(p.startsWith(HD) ? HD : G18, p).toLowerCase()));
const iconFix = s => s.replace(/\b(gameres\/icons\/|ui\/icons\/)([^"'\r\n<]+?)\.bmp/gi, (m, pre, base) => {
  const k = base.toLowerCase(), ui = f => `ui/icons/${f}.bmp`;
  if (iconHave.has(ui(k)) || walk(path.join(OUT, "UI", "ICONS")).some(p => rel(OUT, p).toLowerCase() === ui(k))) return m;
  const q = k.replace(/^hhero/, "qhero");
  if (q !== k && iconHave.has(ui(q))) return pre + q + ".bmp";
  const from = path.join(stash, ui(k));
  if (!fs.existsSync(from)) return m;
  fs.mkdirSync(path.join(OUT, "UI", "ICONS"), { recursive: true });
  fs.copyFileSync(from, path.join(OUT, "UI", "ICONS", `${base}_${TAG}.bmp`));
  return `${pre}${base}_${TAG}.bmp`;
});

// 4. the adventures: the renamed classes in their map.obj.xml (written in place: the same length, so the same pages), the author in game.xml
const AUTHOR = { "ANTIOCO3_p1.BFHP": "Falcata" };
const squeeze = x => x.replace(/\r?\n[ \t]+(?=[\w.]+=)/g, " ");             // the attributes' indentation: room for what the names add
for (const name of fs.readdirSync(SRC).filter(n => /\.bfhp$/i.test(n))) {
  const buf = Buffer.from(fs.readFileSync(path.join(SRC, name))), files = hpfs(buf);
  let n = 0;
  for (const x of files.filter(x => /\.(xml|vs)$/i.test(x.path))) {
    const s = x.read().toString("latin1"), isObj = /(^|\/)map\.obj\.xml$/i.test(x.path);
    let t = iconFix(swapQ(isObj ? s.replace(/\b(class|classoffirstbuilding)="([^"]+)"/g, (m, a, c) => ids.has(c) ? (n++, `${a}="${ids.get(c)}"`) : m) : s));
    if (t === s) continue;
    if (isObj) n += (t.match(/class="Q/g) || []).length - (s.match(/class="Q/g) || []).length;
    // the file may grow within the pages it already has (hpfs.js); if it does not fit, the attributes' indentation goes, and then trailing spaces
    // make up the length (ponytail: the XML reader skips them)
    const put = u => { try { x.write(Buffer.from(u, "latin1")); return true; } catch { return false; } };
    if (!put(t) && !put((t = squeeze(t)) + " ".repeat(Math.max(0, s.length - t.length)))) throw new Error(`${name} ${x.path}: no room for the new names`);
  }
  const g = files.find(x => /^game\.xml$/i.test(x.path));
  if (g && AUTHOR[name]) {
    const s = g.read().toString("latin1"), t = s.replace(/(\bauthor=")Autor desconocido"/, `$1${AUTHOR[name]}"`);
    if (t !== s) g.write(Buffer.from(t.length > s.length ? squeeze(t) : t, "latin1"));
  }
  fs.mkdirSync(path.join(OUT, "Adventures"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "Adventures", name), buf);
  console.log(`Adventures/${name}: ${n} class names renamed (_ant and H -> Q)`);
}

// 5. mod.json, and the hand fixes (extras/: the entity IronMine with its 8 states, the sell-food patch)
fs.writeFileSync(path.join(OUT, "mod.json"), JSON.stringify({
  id: ID,
  name: "Antíoco III el Grande",
  version: "1.0",
  authors: ["Falcata", "Haemimont Games", "Villoh (port)"],
  description: {
    spanish: "Dos aventuras de Falcata sobre Antíoco III el Grande y el Imperio Seléucida (223 a.C.), con sus propias unidades, héroe, objetos y decorados griegos y egipcios. La segunda reedita \"Egipto en armas – 58 a.C.\" de Haemimont Games con unidades del Greek Mod. Necesita el Greek Mod 1.8 de Rattlesmake, para el que fue hecho (las unidades griegas, y las ruinas de Poseidón y las termas).",
    english: "Two adventures by Falcata about Antiochus III the Great and the Seleucid Empire (223 BC), with his own units, hero, items and Greek and Egyptian decorations. The second one reworks Haemimont Games' \"Egipto en armas – 58 a.C.\" with Greek Mod units. It needs Rattlesmake's Greek Mod 1.8, which it was made for (the Greek units, and the Poseidon and baths ruins)."
  },
  category: "Adventures",
  tags: ["Language: Spanish"],
  // his maps are painted with terrain layers 41-54 (the Greek Mod's): HD stops at 40 and crashes drawing them (wrap-map.js, extraTerrain). The 1.8 port
  // has the .vq files but not the layers (TERRAINS.XML), which greek-mod-terrains adds
  requires: ["greek-mod-1-8", "greek-mod-terrains"],
  redistributable: true
}, null, 2) + "\n");
if (fs.existsSync(EXTRAS)) fs.cpSync(EXTRAS, OUT, { recursive: true, force: true });
console.log(`${walk(OUT).length} files in ${path.relative(ROOT, OUT)}`);
