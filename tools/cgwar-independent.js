// CGWAR: what is left to be independent of the game and of every other mod (AGENTS.md, "Civilizations are independent").
// Run after tools/cgwar-greece.js:   node tools/cgwar-independent.js
// A file of the mod at a path the game uses (with other bytes) would replace the game's for every civilization. Here each one is
//   - a script (.vs): only its insertions about Greece, as a patch (@after / @before / @bottom); its edits of the game's lines and what is
//     not Greek (the mod's general tuning) are left out
//   - items.xml, counterunits.xml, placeobjects.xml, the editor's INI lists: only what the mod added, as a patch
//   - anything else (the animations of other civilizations' units, the Greek-less ruins and fountains, mainmenu.ini, copyrights): left out
// The menu skin (CURRENTLANG) is the exception, as in the other ports: cosmetic, and the sign that the mod is loaded.
// `GreekHero`, the hero base the Greek heroes hang from, is `KGreekHero` (the 4.2 and the 1.8 have their own).
const fs = require("fs"), path = require("path");
const { tagFiles, ownNames, tagNames } = require("./lib/ported-patch.js"), { gameFilesToPatches } = require("./lib/independent.js");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "ported", "cgwar"), HD = path.join(ROOT, "originals", "game-data", "paks");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s, "latin1"); };
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const GREEK = /Ares|Greece|Greek|Circe|Hecate|Free_Village|Combative Spirit|Olympic|\bK[A-Z][A-Za-z]+/;

// 1. KGreekHero
{
  let n = 0;
  for (const f of walk(OUT)) {
    if (!/\.(xml|vs|ini|txt)$/i.test(f) || /^(patches|loc|local)\//i.test(f) && !/\.(xml|vs|ini)$/i.test(f)) continue;
    const p = path.join(OUT, f), s = rd(p), t = s.replace(/(?<![A-Za-z0-9_])GreekHero(?![A-Za-z0-9_])/g, "KGreekHero");
    if (t !== s) { wr(p, t); n++; }
  }
  const from = walk(OUT).find(f => /^DATA\/CLASSES\/GREEKHERO\.SC\.XML$/i.test(f));
  if (from) fs.renameSync(path.join(OUT, from), path.join(OUT, path.dirname(from), "KGREEKHERO.SC.XML"));
  console.log(`GreekHero -> KGreekHero in ${n} files`);
}

// 1b. the squad monitor of the AI: the mod's version (items dropped or passed to another hero, War Horn, Invocation, a hurt hero detaches a small army...)
// is a whole script for every AI player, so it runs as GR_SquadMonitor.vs, and only for the players who chose one of the mod's civilizations
// (Main.vs, which starts one SquadMonitor per AI player, picks it). The game's stays as it is for everyone else.
{
  const sm = walk(OUT).find(f => /^DATA\/AI\/SQUADMONITOR\.VS$/i.test(f));
  if (sm) {
    const dir = path.dirname(path.join(OUT, sm));
    fs.renameSync(path.join(OUT, sm), path.join(dir, "GR_SQUADMONITOR.VS"));
    const civs = fs.readdirSync(path.join(OUT, "civs")).filter(f => /\.json$/i.test(f)).map(f => f.replace(/\.json$/i, ""));
    const test = civs.map(c => `Mod_PlayerCiv(AIGetPlayer) == ${c[0].toUpperCase()}${c.slice(1)}`).join(" || ");
    wr(path.join(OUT, "patches", "DATA", "AI", "MAIN.VS"), `@replace AIRun('SquadMonitor.vs');\r\nif (${test})\r\n\tAIRun('GR_SquadMonitor.vs');\r\nelse\r\n\tAIRun('SquadMonitor.vs');\r\n`);
    const ini = path.join(OUT, "patches", "DATA", "AI", "AI.INI"), t = rd(ini);
    if (!/GR_SquadMonitor\.vs/i.test(t)) wr(ini, t.replace(/(\[Scripts\]\r?\n)/, "$1GR_SquadMonitor.vs = void\r\n"));
    console.log(`SquadMonitor: GR_SQUADMONITOR.VS for ${civs.join(", ")}`);
  }
}

// 1c. the mod's conquest (Conquests/mediterranean.BFHP, a Greece territory in Maps/11 on top of the game's seven) shares its path with the game's
// Mediterranean: it becomes a conquest of its own next to it (tools/lib/conquests.js, as the 1.8's). Its Greek walls, tower and gates are the M*
// ids the 1.40 mod redrew (Greece was Imperial Rome): K* here, as wrap-map.js does in the maps that need the CGWAR. Its ConquestMaps folder is only
// what the mod changed (the game's has the shields of the other civilizations): the renamed folder is completed from the game's.
{
  const G = path.join(ROOT, "originals", "game-data"), PORTED = path.join(ROOT, "ported");
  const cDir = fs.existsSync(path.join(OUT, "Conquests")) ? path.join(OUT, "Conquests") : null;
  if (cDir) {
    const hpfs = require("./hpfs.js");
    let walls = 0;
    for (const f of fs.readdirSync(cDir).filter(f => /\.bfhp$/i.test(f))) {
      const p = path.join(cDir, f), buf = fs.readFileSync(p);
      for (const x of hpfs(buf).filter(x => /^Maps\/\d+\/map\.obj\.xml$/i.test(x.path))) {
        let n = 0;
        const s = x.read().toString("latin1").replace(/class="M(Walls\w*|Tower|Gate\d)"/g, (_m, c) => (n++, `class="K${c}"`));
        if (n) { x.write(Buffer.from(s, "latin1")); walls += n; }
      }
      fs.rmSync(p); fs.writeFileSync(p, buf);
    }
    const others = [G, ...fs.readdirSync(PORTED).filter(d => d !== "cgwar").map(d => path.join(PORTED, d))].filter(d => fs.existsSync(d) && fs.statSync(d).isDirectory());
    const r = require("./lib/conquests.js")({ OUT, others, tag: "cgwar", label: "CGWAR" });
    for (const c of r.done) {
      console.log(`conquest ${c.from} -> ${c.to} (${c.folder}); ${walls} Greek walls, towers and gates M* -> K*`);
      const m = /^(.*) -> (.*)$/.exec(c.folder);
      if (m) {                                              // the renamed folder has only the mod's files: the game's shields and the rest come from the game's
        const from = path.join(G, "ConquestMaps", fs.readdirSync(path.join(G, "ConquestMaps")).find(d => d.toLowerCase() === m[1].toLowerCase())), to = path.join(OUT, "ConquestMaps", m[2]);
        let n = 0;
        for (const f of fs.readdirSync(from)) if (!fs.readdirSync(to).some(x => x.toLowerCase() === f.toLowerCase())) { fs.copyFileSync(path.join(from, f), path.join(to, f)); n++; }
        console.log(`  ${n} files of the game's ${m[1]} copied into ${m[2]}`);
      }
    }
    if (r.problems.length) console.log("conquests, to check:\n  " + r.problems.join("\n  "));
    // The race of the player of a territory is the `interface` of its <territory> in the territories.xml inside the .bfhp: 4 (ImperialRome) in the
    // original, where Greece was Imperial Rome. A civilization of a mod is its index; it needs an Imperivm Resurrected build with
    // imperivm-resurrected#44/#45 (the 1.0 release only reads 0-7 and the player keeps the room's race).
    const index = JSON.parse(fs.readFileSync(path.join(OUT, "civs", "greece.json"), "utf8")).index;
    for (const f of fs.readdirSync(cDir).filter(f => /\.bfhp$/i.test(f))) {
      const p = path.join(cDir, f), buf = fs.readFileSync(p), e = require("./hpfs.js")(buf).find(x => /^territories\.xml$/i.test(x.path)), raw = e && e.read().toString("latin1");
      const out = raw && raw.replace(/(<territory\b[^>]*\bid="Graecia"[^>]*\binterface=")\d+"/, (_m, a) => `${a}${index}"`);
      if (!out || out === raw) continue;
      try { e.write(Buffer.from(out, "latin1")); fs.rmSync(p); fs.writeFileSync(p, buf); console.log(`conquest ${f}: Graecia plays as Greece (CGWAR) (interface ${index})`); }
      catch (err) { console.log(`conquest ${f}: Graecia interface not set (${err.message})`); }
    }
  }
}

// 2. the files at the game's paths (tools/lib/independent.js)
const { report, patches, dropped } = gameFilesToPatches({ OUT, HD, GREEK, keep: /^currentlang\// });

// 4. art with the name of another mod's (the Greek icons all the Greek mods draw): the mod's own names
{
  const m = tagFiles(OUT, ["UI/CMDBAR/FRAMES/greek_frame.bmp", "UI/CMDBAR/RESEARCH/imperial.bmp", "UI/CMDBAR/UPGRADES/olympic games.bmp", "UI/ICONS/UPGRADES/olympic games.bmp"], "cgwar");
  console.log(`own names: ${[...m.values()].join(", ")}`);
}
// researches, orders and items the 1.8 also defines under the same name ("Olympic Games", "Greek archers"): the name is the key of the research's
// state, so this port takes a name of its own
{
  const HDP = path.join(ROOT, "originals", "game-data", "paks"), mine = ownNames(OUT, HDP), t = ownNames(path.join(ROOT, "ported", "greek-mod-1-8"), HDP), names = new Set();
  for (const k of ["cmds", "items"]) for (const n of mine[k]) if ([...t[k]].some(x => x.toLowerCase() === n.toLowerCase())) names.add(n);
  console.log(`names shared with the 1.8: ${[...names].join(", ")} -> "(cgwar)" in ${tagNames({ OUT, names, tag: "cgwar" })} files`);
  // the texts are keyed by the old name (rollover, and the description under the rollover as its context): the translation of the new name is the same
  // text, so each entry that names it is repeated with the tagged name (the translation shows without the tag)
  const loc = path.join(OUT, "loc", "spanish.loc.xml");
  if (names.size && fs.existsSync(loc)) {
    const tagged = new Map([...names].map(n => [n.toLowerCase(), `${n} (cgwar)`])), t = rd(loc), extra = [];
    const retag = v => v.split("@").map(p => tagged.get(p.trim().toLowerCase()) ?? p).join("@");
    for (const line of t.split(/\r?\n/)) {
      if (!/<translationtableentry\b/.test(line)) continue;
      const n = line.replace(/\b(text|justtext|context)(\s*=\s*")([^"]*)"/g, (_m, a, eq, v) => `${a}${eq}${retag(v)}"`);
      if (n !== line) extra.push(n);
    }
    if (extra.length) { wr(loc, t.replace(/\s*<\/translationtable>\s*$/, "\n" + extra.join("\n") + "\n</translationtable>\n")); console.log(`${extra.length} Spanish texts repeated under the tagged names`); }
  }
}
// the mod's extras that were whole files of the game's scripts were handled above; empty folders go
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) { prune(path.join(d, e.name)); if (!fs.readdirSync(path.join(d, e.name)).length) fs.rmdirSync(path.join(d, e.name)); } };
prune(OUT);
console.log(`patches: ${patches.join("; ")}`);
console.log(`left out (the game's own files, with the mod's changes for everyone): ${dropped.length}`);
for (const d of dropped) console.log("  " + d);
if (report.length) console.log("to check:\n  " + report.join("\n  "));
