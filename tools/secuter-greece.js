// Greece of Secuter's Fun mod, Greece version (row 312): a civilization of its own (zgreece, prefix Zgr), independent of the game's and of the three Greek ports. Used by
// tools/secuter-fun-mod.js (grecia); nothing here is shared with another port by name or by path.
// The evidence for the base (NOTES.md): Secuter's Greek files are changes over the Greek Mod 1.8, not over the 4.2 (HHoplite is byte for byte the 1.8's, Hero.sc.xml differs by
// 8 lines from the 1.8's and by 250 from the 4.2's, HMyrmidon_Sword exists only in the 1.8, GREECE.XML differs by 85 lines from the 1.8's and by 442 from the 4.2's).
// So Greece is the 1.8's Greece with Secuter's changes on top:
//   1. the Greek part of the built port of the 1.8 (ported/greek-mod-1-8: classes, commands, scripts, art, voices, interface, AI, items, texts), selected by name and by what the
//      Greek classes and commands name (art, sounds, scripts), copied under the names of this pack: every name that starts with the 1.8's letter Q (QHoplite, trainQHoplite,
//      Units/QHOPLITE, VoiceQHoplite, AIV_MaxQHoplite...) starts with the derived prefix Zgr instead, and the 1.8's own copies of game scripts (*_g18.vs) are *_sez.vs
//   2. what Secuter changed in the Greek classes and in GREECE.XML: a three-way merge (git merge-file) of the 1.8's original, its built class and Secuter's file, with the
//      names put in the same letter; where both changed the same lines Secuter's side wins (a balance mod), as in tools/merge-secuter-fun.js
//   3. his Greek chariot hero and outpost (new classes), and what he changed in the base classes (Hero, Unit...) inside every Greek class
//   4. the AI of the 1.8 for Greek settlements only, as ZGR_* copies handed over by patches (tools/lib/greek-ai.js, which the 4.2 and the CGWAR ports use)
// The Roman branches of the 1.8 (Rome18, Empire18, Punic18) are not carried: this pack has the game's Rome, cloned, and Greece.
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const cpf = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.rmSync(b, { force: true }); fs.copyFileSync(a, b); };
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const TEXT = /\.(xml|vs|ini|txt|json)$/i;
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const lf = s => s.replace(/\r\n/g, "\n"), crlf = s => s.replace(/\r?\n/g, "\r\n");
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };   // a malformed file stops the build, on purpose

module.exports = function greece({ OUT, B, HD, PRISTINE, ORIG18, MERGED, TAG }) {
  const log = [], res = { files: 0, names: 0, problems: [] };
  const hasB = rel => { let p = B; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
  const bFiles = walk(B).filter(f => !/^(movies|music|scenarios|adventures|conquests|conquestmaps|minimap|terrain|mapobjects)\//i.test(f));
  const bIdx = new Map(bFiles.map(f => [f.toLowerCase(), f]));
  const hdIdx = new Set(walk(HD).map(f => f.toLowerCase()));
  const inHD = rel => hdIdx.has(rel.toLowerCase());

  // ---- 1. what is Greece's in the built 1.8 ---------------------------------------------------------------------------------------
  const sel = new Set();
  const take = f => { const k = f.toLowerCase(); if (bIdx.has(k) && !sel.has(bIdx.get(k)) && !inHD(bIdx.get(k))) { sel.add(bIdx.get(k)); return true; } return false; };
  for (const f of bFiles) {
    if (/^DATA\/CLASSES\/(HERO)?Q[A-Z0-9_]*\.SC\.XML$/i.test(f) && !/^DATA\/CLASSES\/QUARRY/i.test(f)) take(f);
    else if (/^DATA\/COMMANDS\/GREEK18\.XML$/i.test(f)) take(f);
    else if (/^DATA\/AI\/GR18_/i.test(f)) take(f);
    else if (/^DATA\/INTERFACE\/(CMDBAR\/CMDBARGREEK18|INFOBAR\/INFOBAR_GREEK18)\.INI$/i.test(f)) take(f);
    else if (/^patches\/DATA\/(CONST\.INI|ITEMS\.XML|SUBAI\/[^/]+|INTERFACE\/CMDBAR\/FRAMES\.INI)$/i.test(f)) take(f);
    else if (/^patches\/randommapsettlements\//i.test(f)) take(f);
    else if (/^DATA\/SOUND ENTITIES\/VOICEQ/i.test(f)) take(f);
  }
  const textOf = f => rd(path.join(B, f));
  // closure: the scripts, entities, pictures and sounds that what is selected names, and that the game does not have
  const refs = text => {
    const out = new Set();
    for (const m of text.matchAll(/\b(?:Place|Mutate)\(\s*"([A-Za-z0-9_]+)"/g)) out.add(`DATA/CLASSES/${m[1]}.SC.XML`);   // a class a script places (the fisherman of the village)
    for (const m of text.matchAll(/data[\\/]subai[\\/]([^"'\s<>]+?\.vs)/gi)) out.add("DATA/SUBAI/" + m[1]);
    for (const m of text.matchAll(/data[\\/]itemscripts[\\/]([^"'<>]+?\.vs)/gi)) out.add("DATA/ITEMSCRIPTS/" + m[1]);   // (item scripts have spaces in their names: charm of athena removing.vs)
    for (const m of text.matchAll(/["'(]\s*([A-Za-z0-9_]+\.vs)\s*["')]/g)) out.add("DATA/SUBAI/" + m[1]);
    for (const m of text.matchAll(/data[\\/]sound entities[\\/]([^"'<>]+?\.xml)/gi)) out.add("DATA/SOUND ENTITIES/" + m[1]);
    for (const m of text.matchAll(/\b(?:entity\w*|entity_\w+)\s*=\s*"([^"]+)"/gi)) out.add(m[1].replace(/\\/g, "/"));
    for (const m of text.matchAll(/gameres[\\/](cmdbar|icons|infobar)[\\/]([^"'<>]+)/gi)) out.add(`UI/${m[1]}/${m[2]}`);
    for (const m of text.matchAll(/\b(?:button|queueicon|icon|transpicon|image)\s*=\s*"([^"]+\.bmp)"/gi)) { const v = m[1].replace(/\\/g, "/"); out.add(`UI/CMDBAR/${v}`); if (!/^gameres\//i.test(v)) out.add(`UI/ICONS/${v}`); }
    for (const m of text.matchAll(/([A-Za-z0-9_ \-\\/.]+\.(?:wav|mp3|rle|pass|bmp))/gi)) { const v = m[1].replace(/\\/g, "/").replace(/^\/+/, ""); out.add(v); out.add("SOUNDS/" + v); out.add("VOICES/" + v.replace(/^voices\//i, "")); }
    return out;
  };
  const dirsTaken = new Set();
  for (let grew = true; grew;) {
    grew = false;
    for (const f of [...sel]) {
      if (!TEXT.test(f) || /^patches\/randommapsettlements/i.test(f)) continue;
      for (const r of refs(textOf(f))) {
        const k = r.toLowerCase();
        if (take(r)) grew = true;
        // an entity takes its whole folder (sprites, shadows, passability)
        if (/\.ent\.xml$/i.test(r) && bIdx.has(k) && !inHD(bIdx.get(k))) { const dir = path.posix.dirname(bIdx.get(k)); if (!dirsTaken.has(dir)) { dirsTaken.add(dir); for (const x of bFiles) if (path.posix.dirname(x) === dir && take(x)) grew = true; } }
      }
    }
  }
  // the Greek art folders by name (a sprite folder no entity of the selection names yet: walls, gates, houses)
  for (const f of bFiles) if (/^(UNITS|BUILDINGS|VOICES)\/Q[A-Z0-9_]*\//i.test(f) || /^SOUNDS\/.*\/Q[A-Z0-9_]+\.[A-Z0-9]+$/i.test(f) || /^UI\/ICONS\/Q[A-Z0-9_ ]+\./i.test(f) || /^UI\/HELP\/QCMDBAR\//i.test(f)) take(f);
  log.push(`${sel.size} files of the 1.8's Greece selected`);

  // ---- 2. the names ----------------------------------------------------------------------------------------------------------------------
  const stems = new Set(["q"]);
  const addStem = s => { const t = s.toLowerCase().replace(/^(hero|voice|train|hirehero|aiv_max)/, ""); if (/^q[a-z0-9_]*$/.test(t)) stems.add(t); };
  for (const f of sel) {
    for (const part of f.split("/")) addStem(part.replace(/\..*$/, ""));
    if (TEXT.test(f)) for (const m of textOf(f).matchAll(/(?<![A-Za-z0-9])(?:Hero|train|hirehero|Voice|AIV_Max)?(Q[A-Z0-9][A-Za-z0-9_]*[a-z][A-Za-z0-9_]*|Qhouse\d+)/g)) addStem(m[1]);
  }
  const stemRe = /(?<![A-Za-z0-9])(Hero|train|hirehero|hire hero |Voice|AIV_Max)?([Qq][A-Za-z0-9_]*)(?![A-Za-z0-9])/gi;
  const caseOf = (stem, P) => { const rest = stem.slice(1); if (stem[0] === "q") return P.toLowerCase() + rest; return (rest.length >= 2 && /[A-Z]/.test(rest) && rest === rest.toUpperCase()) ? P.toUpperCase() + rest : P + rest; };
  const swap = s => s
    .replace(stemRe, (m, pre, stem) => stems.has(stem.toLowerCase()) ? (pre || "") + caseOf(stem, "Zgr") : m)
    .replace(/trainpeasantq(?![A-Za-z0-9])/g, "trainpeasantzgr").replace(/hireheroQ(?![A-Za-z0-9])/g, "hireheroZgr")
    .replace(/\bGreek Rattlesmake\b/g, "Greek Secuter").replace(/\bGreek18\b/g, "Zgreece").replace(/\bgreek18\b/g, "zgreece")
    .replace(/GREEK_FRAME_g18/gi, "GREEK_FRAME_" + TAG).replace(/_g18(?![A-Za-z0-9])/gi, "_zgr").replace(/GREEK18/g, "ZGREECE").replace(/(?<![A-Za-z0-9])GR18_/g, "ZGR_");
  // the 1.8's old names, from the original (H, Imperial Rome's slot), in the 1.8's new letter (Q) so that the original and Secuter's files can be merged with the built classes
  const toQ = s => s.replace(/(?<![A-Za-z0-9])(Hero|train|hirehero|hire hero |Voice|AIV_Max)?([Hh][A-Za-z0-9_]*)(?![A-Za-z0-9])/g, (m, pre, stem) => { const q = "q" + stem.slice(1).toLowerCase(); return stems.has(q) ? (pre || "") + (stem[0] === "h" ? "q" : "Q") + stem.slice(1) : m; });
  res.names = stems.size;

  // ---- 3. copy ---------------------------------------------------------------------------------------------------------------------------
  const dest = f => {
    const p = f.replace(/^patches\/randommapsettlements\//i, "patches/randommapsettlements/").split("/").map(c => { const dot = c.indexOf("."); const stem = dot < 0 ? c : c.slice(0, dot), ext = dot < 0 ? "" : c.slice(dot); return swap(stem) + ext; }).join("/");
    return p;
  };
  const outRel = new Map();
  for (const f of sel) {
    if (/^patches\/DATA\/(SUBAI)\//i.test(f) === false && /^patches\//i.test(f) && !/^patches\/(randommapsettlements|DATA\/(CONST\.INI|ITEMS\.XML|INTERFACE))/i.test(f)) continue;
    if (/^patches\/DATA\/SUBAI\/DRUID_ONDIE\.vs$/i.test(f)) continue;           // written below (no @replace: the 1.8 replaces the same line)
    let to = dest(f);
    if (/^DATA\/AI\/GR18_/i.test(f)) to = to.replace(/^DATA\/AI\/ZGR_/i, "DATA/AI/");   // the AI library takes the mod's own names and puts the prefix back
    if (/^DATA\/COMMANDS\/GREEK18\.XML$/i.test(f)) to = "DATA/COMMANDS/ZGREECE.XML";
    outRel.set(f, to);
    const dst = path.join(OUT, to);
    if (TEXT.test(f)) wr(dst, swap(textOf(f))); else cpf(path.join(B, f), dst);
    res.files++;
  }
  // the game's own commands the 1.8 gave a Greek source: only the lines that name a Greek class (the same patch files carry the other civilizations of the 1.8)
  {
    const dir = path.join(B, "patches", "DATA", "COMMANDS");
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
      const lines = rd(path.join(dir, f)).split(/\r?\n/).filter(l => /<(n?src) obj="(Hero)?Q[A-Z]/i.test(l) && stems.has((l.match(/obj="((?:Hero)?Q[^"]*)"/i)[1]).toLowerCase().replace(/^hero/, "")));
      if (lines.length) wr(path.join(OUT, "patches", "DATA", "COMMANDS", f), swap(`<patch>\r\n${lines.join("\r\n")}\r\n</patch>\r\n`));
    }
  }
  // the 1.8's formations: only the ones a Greek command names
  {
    const fp = hasB("patches/DATA/FORMATIONS.XML");
    if (fp) {
      const cmds = rd(path.join(OUT, "DATA", "COMMANDS", "ZGREECE.XML")), blocks = [...rd(fp).matchAll(/<FormationClass\b[\s\S]*?<\/FormationClass>/g)].map(m => m[0]).filter(b => cmds.includes(`"${(b.match(/Name="([^"]+)"/) || [])[1]}"`));
      if (blocks.length) wr(path.join(OUT, "patches", "DATA", "FORMATIONS-GREECE.XML"), `<patch>\r\n  <add select="/formations">\r\n${blocks.join("\r\n")}\r\n  </add>\r\n</patch>\r\n`);
    }
  }
  // texts: the entries of the 1.8's tables that name a Greek class or order
  for (const lang of ["spanish", "italian"]) {
    const lp = hasB(`loc/${lang}.loc.xml`); if (!lp) continue;
    const entries = [...rd(lp).matchAll(/<translationtableentry\b[^>]*\/>/g)].map(m => m[0]).filter(e => { const ctx = (e.match(/\bcontext="([^"]*)"/) || [])[1] || ""; return stemRe.lastIndex = 0, [...(ctx + " " + ((e.match(/\btext="([^"]*)"/) || [])[1] || "")).matchAll(stemRe)].some(m => stems.has(m[2].toLowerCase())); });
    if (entries.length) wr(path.join(OUT, "loc", `${lang}.loc.xml`), swap(`<translationtable>\r\n${entries.join("\r\n")}\r\n</translationtable>\r\n`));
    log.push(`${entries.length} ${lang} texts`);
  }
  // ---- 4. the civilization ---------------------------------------------------------------------------------------------------------------
  const j = readJson(path.join(B, "civs", "greek18.json"));
  const alias = {};
  for (const [k, v] of Object.entries(j.alias.classes)) if (/^Q/.test(v) && stems.has(v.toLowerCase())) alias[k] = swap(v);
  const civ = { id: "zgreece", base: "ImperialRome", name: { spanish: "Grecia (Secuter)", english: "Greece (Secuter)", italian: "Grecia (Secuter)" }, internalName: "ZGreece", template: "Greek Secuter", ai: true, alias: { classes: alias, commands: {} } };
  wr(path.join(OUT, "civs", "zgreece.json"), JSON.stringify(civ, null, 2) + "\n");
  // the frame of the command bar the game looks up by internalName
  {
    const fr = hasB("patches/DATA/INTERFACE/CMDBAR/FRAMES.INI");
    wr(path.join(OUT, "patches", "DATA", "INTERFACE", "CMDBAR", "FRAMES.INI"), swap(rd(fr)).replace(/\[Images\]\r?\n\s*Zgreece\s*=/i, "[Images]\r\nZGreece ="));
  }

  // ---- 5. the classes: race, Secuter's changes, the base classes ------------------------------------------------------------------------
  const CL = path.join(OUT, "DATA", "CLASSES");
  const fix = s => s.replace(/\brace\s*=\s*"(greek18|zgreece|ImperialRome|Imperial Rome)"/g, 'race="zgreece"');
  const greekId = id => /^(Hero)?Zgr/.test(id);
  for (const f of walk(CL).filter(f => /\.sc\.xml$/i.test(f))) { const p = path.join(CL, f); if (greekId(classOf(rd(p)))) wr(p, fix(rd(p))); }
  // Secuter's changes: base = the 1.8's original class (in the 1.8's letter), ours = the built class, theirs = Secuter's file
  const merged = [], notMerged = [];
  // tools/merge-secuter-fun.js --greek commented out the <method>s of three scripts that Secuter's zip lacks (`<!-- script missing in Secuter's zip: <method .../> -->`). Two of them
  // (myrmidon_sword.vs, myrmidon_javelin.vs) are the 1.8's and are in this pack, so the methods come back; centaur_summoning.vs is in no download: that method stays out.
  const unComment = t => t.replace(/<!-- script missing in Secuter's zip: (<method\b[^>]*\/>) -->/g, (_m, el) => (/centaur_summoning/i.test(el) ? "" : el));
  const ORIGC = path.join(ORIG18, "CLASSES"), SECC = path.join(PRISTINE, "DATA", "CLASSES");
  const ciIn = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(x => x.toLowerCase() === n.toLowerCase());
  for (const f of walk(CL).filter(f => /\.sc\.xml$/i.test(f))) {
    const p = path.join(CL, f), ours = rd(p), id = classOf(ours);
    if (!greekId(id)) continue;
    const oname = /^HeroZgr/.test(id) ? "Hero" + "H" + id.slice(7) : "H" + id.slice(3);
    const bo = ciIn(ORIGC, `${oname}.SC.XML`), so = ciIn(SECC, `${oname}.SC.XML`);
    if (!bo || !so) continue;
    const base = lf(rd(path.join(ORIGC, bo))), theirs = unComment(lf(rd(path.join(SECC, so))));
    if (base === theirs) continue;                                        // Secuter did not change it
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sg-"));
    fs.writeFileSync(path.join(tmp, "o"), lf(ours), "latin1"); fs.writeFileSync(path.join(tmp, "b"), lf(swap(toQ(base))).replace(/race="[^"]*"/g, m => m), "latin1"); fs.writeFileSync(path.join(tmp, "t"), lf(swap(toQ(theirs))), "latin1");
    const r = cp.spawnSync("git", ["merge-file", "-p", "--diff3", "-L", "built", "-L", "1.8", "-L", "secuter", path.join(tmp, "o"), path.join(tmp, "b"), path.join(tmp, "t")], { encoding: "latin1", maxBuffer: 1 << 26 });
    fs.rmSync(tmp, { recursive: true, force: true });
    let n = 0;
    const text = r.stdout.replace(/<<<<<<< built\n[\s\S]*?\|\|\|\|\|\|\| 1\.8\n[\s\S]*?=======\n([\s\S]*?)>>>>>>> secuter\n/g, (_m, mine) => { n++; return mine; });   // both changed it: Secuter's side
    wr(p, crlf(fix(text))); merged.push(`${id}${n ? ` (${n} conflicts, Secuter's side)` : ""}`);
  }
  // his new Greek classes: the chariot hero and the outpost (the camp is a map object: the rules pack's)
  for (const [o, n] of [["HChariotHero", "ZgrChariotHero"], ["HOutpost", "ZgrOutpost"]]) {
    const so = ciIn(SECC, `${o}.SC.XML`); if (!so) { notMerged.push(`${o}: not in Secuter's zip`); continue; }
    wr(path.join(CL, `${n.toUpperCase()}.SC.XML`), crlf(fix(swap(toQ(unComment(lf(rd(path.join(SECC, so)))))).replace(new RegExp(`(<class\\b[^>]*?\\bid\\s*=\\s*")${n}"`), `$1${n}"`))));
    merged.push(`${n} (new)`);
  }
  res.merged = merged; res.notMerged = notMerged;
  // GREECE.XML: the same three-way
  {
    const ours = rd(path.join(OUT, "DATA", "COMMANDS", "ZGREECE.XML")), bo = ciIn(path.join(ORIG18, "COMMANDS"), "GREECE.XML"), so = ciIn(path.join(PRISTINE, "DATA", "COMMANDS"), "GREECE.XML");
    if (bo && so) {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sg-"));
      fs.writeFileSync(path.join(tmp, "o"), lf(ours), "latin1"); fs.writeFileSync(path.join(tmp, "b"), lf(swap(toQ(rd(path.join(ORIG18, "COMMANDS", bo))))), "latin1"); fs.writeFileSync(path.join(tmp, "t"), lf(swap(toQ(rd(path.join(PRISTINE, "DATA", "COMMANDS", so))))), "latin1");
      const r = cp.spawnSync("git", ["merge-file", "-p", "--diff3", "-L", "built", "-L", "1.8", "-L", "secuter", path.join(tmp, "o"), path.join(tmp, "b"), path.join(tmp, "t")], { encoding: "latin1", maxBuffer: 1 << 26 });
      fs.rmSync(tmp, { recursive: true, force: true });
      let n = 0;
      const text = r.stdout.replace(/<<<<<<< built\n[\s\S]*?\|\|\|\|\|\|\| 1\.8\n[\s\S]*?=======\n([\s\S]*?)>>>>>>> secuter\n/g, (_m, mine) => { n++; return mine; });
      wr(path.join(OUT, "DATA", "COMMANDS", "ZGREECE.XML"), crlf(text));
      log.push(`ZGREECE.XML: three-way with Secuter's GREECE.XML, ${n} conflicts (his side)`);
    }
  }
  // what Secuter changed in the base classes the Greek classes inherit (Hero, Unit, Melee...), inside each Greek class after the 1.8's own block
  {
    const bc = readJson(path.join(MERGED, "base-changes.json")), norm = s => s.replace(/\s+/g, " ").trim();
    const parent = new Map();
    for (const dir of [path.join(HD, "DATA", "CLASSES"), CL]) for (const f of walk(dir).filter(f => /\.sc\.xml$/i.test(f) && !/[\\/]/.test(f))) { const s = rd(path.join(dir, f)), id = classOf(s); if (id) parent.set(id.toLowerCase(), (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1]); }
    let added = 0;
    for (const f of fs.readdirSync(CL).filter(f => /\.sc\.xml$/i.test(f))) {
      const p = path.join(CL, f); let s = rd(p);
      const chain = []; for (let c = parent.get(classOf(s).toLowerCase()), n = 0; c && n < 20; c = parent.get(c.toLowerCase()), n++) { if (/^Zgr/i.test(c)) continue; chain.push(c.toLowerCase()); }
      const extra = [];
      for (const b of chain.reverse()) for (const e of bc[b] || []) if (!s.includes(norm(e)) && !s.includes(e.trim()) && !extra.includes(e)) extra.push(e);
      if (extra.length) { s = s.replace(/(<class\b[^>]*>)/, `$1\n\t<!-- changes Secuter's Fun mod made to its base classes -->\n\t${extra.join("\n\t")}`); wr(p, s); added += extra.length; }
    }
    log.push(`${added} base-class elements of Secuter's written inside the Greek classes`);
  }

  // ---- 6. the AI of the 1.8 for Greek settlements only ----------------------------------------------------------------------------------
  {
    const iniSrc = hasB("patches/DATA/AI/AI.INI");
    wr(path.join(OUT, "DATA", "AI", "AI.INI"), swap(iniSrc ? rd(iniSrc) : "").replace(/^\[Scripts\][\s\S]*?(?=^\[)/m, ""));
    const r = require("./lib/greek-ai.js")({ OUT, HD, prefix: "ZGR_", constName: "Zgreece", varRe: /^AIV_(MaxZgr|TimeStrenghtenStrongholdGates)/ });
    log.push(`AI: ${r.names.length} scripts as ZGR_* (${r.names.join(", ")}), main loops ${r.loops.join(", ") || "none"}`);
    // the recruiting helper the engine calls by name from the tactics (not through AIRun): the Greek table of the 1.8 as a patch that only acts for Greek settlements
    // The 1.8's own patch of this helper (and of DRUID_ONDIE.vs) @replace the same lines of the game's script and declare `greekBuildName`, `isGreek`... with @top; with both mods on, a
    // second @replace of a line the first already replaced finds the text inside the first one's block, and the declarations would be made twice. These patches therefore touch
    // no line the 1.8 replaces and declare nothing: TSH_RECRUITARMY gets ONE block before the first `if (num)` (the game's cmd and tech were computed above it; this overrides them for
    // a Greek settlement of this pack only, with the 1.8's table: Hoplite/Toxotes/Hypaspista/Chariot, anything else asks for the Hoplite's), DRUID_ONDIE gets a block at the bottom.
    // Lines two mods cannot both patch: none, now. (With the 1.8 on too, its block still sets cmd and tech for ITS Greek settlements; mine acts only when Mod_TrueRace is Zgreece.)
    if (hasB("patches/DATA/AI/TSH_RECRUITARMY.vs")) {
      const out = `@before if (num)\n// Secuter's Fun mod, Greece: the AI of a Greek settlement asks for Greek units; the game's table is the Roman one (the 1.8's table, by class)\nif (Mod_TrueRace(set.GetCentralBuilding) == Zgreece)\n{\n\tif (class == "ZgrToxotes")\n\t{\n\t\tcmd = "trainZgrToxotes";\n\t\ttech = "Greek Archers";\n\t}\n\telse if (class == "ZgrHypaspista")\n\t{\n\t\tcmd = "trainZgrHypaspista";\n\t\ttech = "Greek Royal Armor";\n\t}\n\telse if (class == "ZgrChariot")\n\t{\n\t\tcmd = "trainZgrChariot";\n\t\ttech = "Greek Chariot Wheels";\n\t}\n\telse\n\t{\n\t\tcmd = "trainZgrHoplite";\n\t\ttech = "Greek Spears";\n\t}\n}\n`;
      wr(path.join(OUT, "patches", "DATA", "AI", "TSH_RECRUITARMY.vs"), crlf(out));
    }
    // the Greek priest also has Restoration (the Gaul druid's, which the game's script gives to `.race == Gaul`): a block of its own at the bottom, no @replace
    wr(path.join(OUT, "patches", "DATA", "SUBAI", "DRUID_ONDIE.vs"), crlf(`@bottom\n// Secuter's Fun mod, Greece: the Greek priest also has Restoration (as the 1.8's patch, without replacing the game's line)\nif (.class == "ZgrPriest")\nif (EnvReadString(.player, "Restoration") == "researched")\n{\n\tint nZgrRestored = 0;\n\tol = ObjsInCircle(.pos, .sight, "Unit").GetObjList();\n\n\tfor (i = 0; i < ol.count; i += 1)\n\t{\n\t\tu = ol[i].AsUnit();\n\t\tif (!u.IsValid()) continue;\n\t\tif (.IsEnemy(u)) continue;\n\t\tif (u.stamina >= u.maxstamina) continue;\n\t\tu.SetStamina(u.maxstamina);\n\t\tCreateFeedback("StaminaBoost", u);\n\t\tnZgrRestored += 1;\n\t\tif (nZgrRestored >= 5)\n\t\t\tbreak;\n\t}\n}\n`));
  }
  // ---- 7. the exit points (type 2) of the buildings that train or house units ----------------------------------------------------------------
  // Greece's barracks (the 1.8's, byte for byte: the same .PASS as ported/greek-mod-1-8's QBarracks) has ONE exit point, type 2 at (-32,-50) = cell 61,68 of its .PASS, the head of a
  // 1-2 cell dead-end corridor through the footprint (row 68 has free cells 61, 62 and 63 only). The Greek Mod 2.x ports (community-mods#39, #42) found it in game: the troops
  // stayed stuck on the steps in one of the two town layouts; moving that ONE point to (-16,-50) (cell 62,68) fixed it in both, with the footprint and the point of this barracks.
  // The same one-point change is made here. It was NOT tried in game with this pack. The mapping of a point to a cell is the one of that fix: column 63 + x/16, row 64 + ceil(-y/16).
  {
    const f = path.join(OUT, "BUILDINGS", "ZGRBARRACKS", "ZGRBARRACKS.ENT.XML");
    if (fs.existsSync(f)) {
      const t = rd(f), re = /(<point idx="\d+" type="2" x=)"-32"( y="-50"\/>)/;
      if (re.test(t)) { wr(f, t.replace(re, '$1"-16"$2')); log.push("ZgrBarracks: the exit point (-32,-50) moved to (-16,-50)"); } else res.problems.push("ZgrBarracks: its exit point is not where it was moved from (type 2, -32,-50): look at it");
    }
    const pass = require(path.join(process.env.SDK || path.join(__dirname, "..", "..", "imperivm-resurrected", "sdk"), "tools", "lib", "pass.js"));
    const rep = [];
    for (const d of ["ZGRBARRACKS", "ZGRGYMNASIUM", "ZGRTEMPLE", "ZGRVILLAGE", "ZGRTOWNHALL"]) {
      const dir = path.join(OUT, "BUILDINGS", d); if (!fs.existsSync(dir)) continue;
      for (const ef of fs.readdirSync(dir).filter(x => /\.ent\.xml$/i.test(x))) {
        const t = rd(path.join(dir, ef)), pf = (t.match(/pass_file="([^"]+)"/) || [])[1], pp = pf && fs.readdirSync(dir).find(x => x.toLowerCase() === pf.toLowerCase());
        if (!pp) { rep.push(`${d}: no .pass`); continue; }
        const P = pass.decode(fs.readFileSync(path.join(dir, pp))), free = (a, b) => a >= 0 && b >= 0 && a < P.w && b < P.h && !P.cells[b * P.w + a];
        let a0 = P.w, a1 = -1, b0 = P.h, b1 = -1;
        for (let b = 0; b < P.h; b++) for (let a = 0; a < P.w; a++) if (P.cells[b * P.w + a]) { a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); }
        for (const m of t.matchAll(/<point idx="(\d+)" type="2" x="(-?\d+)" y="(-?\d+)"\/>/g)) {
          const x = +m[2], y = +m[3], a = 63 + Math.round(x / 16), b = 64 + Math.ceil(-y / 16), ok = free(a, b);
          let n3 = 0; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (free(a + i, b + j)) n3++;
          let reach = false, size = 0; const seen = new Set(), st = ok ? [[a, b]] : [];
          while (st.length && size < 30000) { const [u, v] = st.pop(), k = u * 1000 + v; if (seen.has(k) || !free(u, v)) continue; seen.add(k); size++; if (u < a0 || u > a1 || v < b0 || v > b1) reach = true; st.push([u + 1, v], [u - 1, v], [u, v + 1], [u, v - 1]); }
          rep.push(`${d}/${ef} point ${m[1]} (${x},${y}) -> cell ${a},${b}: ${ok ? "free" : "BLOCKED"}, free 3x3 ${n3}/9, ${ok ? (reach ? "reaches the outside of the footprint" : "does NOT reach the outside") : "-"}`);
        }
      }
    }
    res.exits = rep;
  }
  res.log = log;
  return res;
};
