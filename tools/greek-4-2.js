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
const HD = path.join(ROOT, "originals", "game-data", "paks");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const want = process.argv.slice(2);
if (!fs.existsSync(PRISTINE)) { console.error("no " + PRISTINE + ": it is the port of the 4.2 before this script (see extras/greek-civilization-mod/NOTES.md)"); process.exit(1); }

// the civilizations: letters and indices in the table of docs/CIVILIZATIONS.md (a digit is a letter too: 26 run out)
const CIVS = [
  { base: "Gaul", baseLetter: "G", hero: "GaulHero", letter: "X", keepImp2: true, id: "gaul42", index: 40, name: { spanish: "Galos", english: "Gaul", italian: "Galli" } },
  { base: "Britain", baseLetter: "B", hero: "BritonHero", letter: "Y", id: "britain42", index: 41, name: { spanish: "Britania", english: "Britain", italian: "Britannia" } },
  { base: "Iberia", baseLetter: "I", hero: "IberianHero", letter: "Z", keepImp2: true, id: "iberia42", index: 42, name: { spanish: "Iberia", english: "Iberia", italian: "Iberia" } },
  { base: "Egypt", baseLetter: "E", hero: "EgyptianHero", letter: "1", id: "egypt42", index: 43, name: { spanish: "Egipto", english: "Egypt", italian: "Egitto" } },
  { base: "Germany", baseLetter: "T", hero: "GermanHero", letter: "3", id: "germany42", index: 44, name: { spanish: "Germania", english: "Germany", italian: "Germania" } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "4", id: "romerep42", index: 45, name: { spanish: "Roma rep.", english: "Rep. Rome", italian: "Roma rep." },
    skipExtra: /^(ImperialRomanHero|MHero|AncientRomanHero)/, branch: { flag: "ChooseRepublicanRome", scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "5", keepImp2: true, id: "romeimp42", index: 46, name: { spanish: "Roma imp.", english: "Imp. Rome", italian: "Roma imp." },
    skipExtra: /^(AncientRomanHero)/, branch: { flag: "ChooseImperialRome", scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, hire: { cmd: "hireheroRImperial", hero: "ImperialRomanHero" } } },
  { base: "RepublicanRome", baseLetter: "R", hero: "RepublicanRomanHero", letter: "6", id: "romepun42", index: 47, name: { spanish: "Roma púnica", english: "Punic Rome", italian: "Roma punica" },
    skipExtra: /^(ImperialRomanHero|MHero)/, branch: { flag: "ChoosePunicRome", scripts: /^R[A-Z]+_ENABLE_OR_DISABLE_CMD\.VS$/i, hire: { cmd: "hireheroR", hero: "AncientRomanHero" } } },
  { base: "Carthage", baseLetter: "C", hero: "CarthaginianHero", letter: "7", keepImp2: true, id: "carthnum42", index: 48, name: { spanish: "Númida", english: "Numidia", italian: "Numida" },
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
  // the civilizations the mod's economy runs for: not Rome's and Carthage's branches (their scripts read the old ChooseXxx flags); the tactics are the
  // mod's GetTacticScript (originals/greek-4-2-pristine/DATA/AI/GETTACTICSCRIPT.VS: 30% / 60% of the first roll, the Rome branches and the
  // Mauritanian Carthage none, Numidian Carthage 100%). Gaul in Old School mode has none (its tactic is not asked for there)
  const TACT = (a, b) => [[30, a], [90, b]];
  const ALL = ["Greek", "Gaul42", "Britain42", "Iberia42", "Egypt42", "Germany42", "Romerep42", "Romeimp42", "Romepun42", "Carthnum42", "Carthmau42"], FLAT = ["Greek", "Gaul42", "Britain42", "Iberia42", "Egypt42", "Germany42"];
  // the rest of the mod's AI (tools/lib/own-ai.js): the monitors Main.vs starts and the group strategies as copies, and what the engine calls by name as blocks
  // inside the game's scripts that only run for the mod's civilizations; the TSH_* helpers read the old branch flags for Rome's branches (FLAT: not for them)
  const rest = require("./lib/own-ai.js")({ OUT, HD, SRC: path.join(PRISTINE, "DATA", "AI"), prefix: "GR42_", civs: ALL, flat: FLAT, inline: [
    { name: "CalcGAIKAPriority", player: "idPlayer" }, { name: "EvalRecruit", player: "sq.Player" }, { name: "CalcMaxTake", player: "idPlayer" }, { name: "CheckMAIKA", player: "idPlayer" },
    { name: "GetGAIKAStrat", player: "idPlayer" }, { name: "HeroSkill Default", player: "hero.player" }, { name: "TSH_HeroSkills", player: "hero.player" },
    { name: "TSH_Research", player: "set.player" }, { name: "TSH_TempleRecruit", player: "set.player" },
    { name: "TSH_RecruitArmy", player: "set.player", set: "flat" }, { name: "TSH_HeroRecruit", player: "set.player", set: "flat" }, { name: "TSH_ArenaRecruit", player: "set.player", set: "flat" }] });
  console.log(`AI: ${rest.forks.length} scripts as GR42_* copies started by Main.vs and the strategies (${rest.forks.join(", ")}); ${rest.inlined.length} inside the game's (${rest.inlined.join(", ")})`);
  const r = require("./lib/greek-ai.js")({ OUT, HD, prefix: "GR42_", constName: "Greek", varRe: /^AIV_(Max[A-Z]|Time)/, extra: rest,
    civs: FLAT,
    tactics: { Greek: TACT("TS_GreekTactic", "TS_GreekTactic2"), Gaul42: TACT("TS_GaulTactic", "TS_GaulTactic2"), Britain42: TACT("TS_BritishTactic", "TS_BritishTactic2"),
      Iberia42: TACT("TS_IberianTactic", "TS_IberianTactic2"), Germany42: TACT("TS_GermanyTactic", "TS_GermanyTactic2"), Egypt42: [[100, "TS_EgyptTactic"]],
      Carthnum42: [[100, "TS_CarthageTactic"]], Carthmau42: [], Romerep42: [], Romeimp42: [], Romepun42: [] },
    guards: { Gaul42: 'EnvReadInt(idPlayer, "ModeOldSchoolCostsV2") == 1' } });
  console.log(`AI: ${r.names.length} scripts run as GR42_* (${r.loops.join(", ")})`);
}

// the menu skin: images stay, the layout becomes a patch of the keys it changed
console.log(`menu skin: ${require("./lib/menu-skin.js").skinToPatches({ OUT, HD })} layout files became patches of the keys they changed`);

// 3b. the mod's versions of the game's behavior scripts (barrack_train.vs, hero_attack.vs, druid_learn.vs...): the port's classes and commands use
// copies of their own (<name>_g42.vs); the game's scripts stay the game's (tools/lib/own-scripts.js). The ones that choose a branch of Rome or Carthage,
// or read the old engine's sentinel, are not copied: each branch is a civilization now.
{
  // The scripts that read the branch flags (onfinish_research, arena_hirehero, verify_research, specialize_build_verify) are copied with the flags written
  // in: false for everybody but the Carthages (the Roman branches' hero comes in the order's parameter, as in the game's script; verify_research's
  // check of the branch is dynamic and goes), and the class or research ids the script writes as text are the civilization's own for the three
  // that need it (Numidian and Mauritanian Carthage: the shaman of Dark Rituals; Britain: the bet of Fights)
  const shaman = n => [[/"CShamanNumidian"/g, `"${n}ShamanNumidian"`], [/"CShaman"/g, `"${n}Shaman"`]];
  const r = require("./lib/own-scripts.js")({ OUT, HD, tag: "g42", skip: /Choose(Republican|Imperial|Punic|Numidian|Mauritanian)(Rome|Carthage)|rand\(\s*776|nLobbyBranch/i,
    dynamic: [/EnvReadString\(\s*\.settlement\s*,\s*subFac\s*\)\s*!=\s*"researched"/g],
    // every civilization that is a clone also gets the class ids the scripts write as text ("EPriest") as its own ("1Priest") where the clone has the class
    modClasses: path.join(PRISTINE, "DATA", "CLASSES"),
    civs: [{ id: "gaul42", letter: "X", from: ["G"], match: /^(X|gaul42\.)/i }, { id: "iberia42", letter: "Z", from: ["I"], match: /^(Z|iberia42\.)/i },
      { id: "egypt42", letter: "1", from: ["E"], match: /^(1|egypt42\.)/i }, { id: "germany42", letter: "3", from: ["T"], match: /^(3|germany42\.)/i },
      { id: "romerep42", letter: "4", from: ["R", "M"], match: /^(4|romerep42\.)/i }, { id: "romeimp42", letter: "5", from: ["R", "M"], match: /^(5|romeimp42\.)/i },
      { id: "romepun42", letter: "6", from: ["R", "M"], match: /^(6|romepun42\.)/i },
      { id: "britain42", letter: "Y", from: ["B"], match: /^(Y|britain42\.)/i, subst: [[/"Fights"/g, '"Britain42 Fights"']] },
      { id: "carthnum42", letter: "7", from: ["C"], match: /^(7|carthnum42\.)/i, flags: { ChooseNumidianCarthage: true }, subst: shaman(7), scripts: { "coutpost_behavior.vs": [[/"CMERCENARIO"/g, '"7MERCENARIO"']] } },
      { id: "carthmau42", letter: "8", from: ["C"], match: /^(8|carthmau42\.)/i, flags: { ChooseMauritanianCarthage: true }, subst: shaman(8), scripts: { "coutpost_behavior.vs": [[/"CMERCENARIO"/g, '"8MERCENARIO"']] } }] });
  console.log(`scripts of the mod's own for its civilizations: ${r.copied.length} copied (_g42), ${r.skipped.length} left to the game's (${r.skipped.map(s => s.name).join(", ")})`);
  fs.writeFileSync(path.join(ROOT, "raw", "greek-4-2-own-scripts.txt"), r.copied.map(c => `${c.from} -> ${c.to}  (${c.users.slice(0, 4).join(", ")}${c.users.length > 4 ? ", ..." : ""})`).join("\n") + "\n\nnot copied:\n" + r.skipped.map(s => `${s.name}: ${s.why}`).join("\n") + "\n");
}

// 3c. the mod's game modes (data/gamescripts/1 VARIOS ... 9 CUSTOM) are modes of the mod: their rules for a civilization reach only the mod's civilizations.
// "1 Varios" took Eagle/Wolf Summoning, Scout Area, Expedition and Gossip from the game's civilizations' buildings (RTavern, MTavern, CTavern, EMarket,
// BTempleOfThor, TTempleOfNeptus...); "5 Old school" (Imperivm 2) disabled the game's orders of 22 of the game's buildings, with no replacement (its "Imp2 Cost"
// orders are not shipped), and let the game's Rome, Gaul, Iberia and Carthage in. Now the rules are written for each of the mod's civilizations (tools/lib/mode-rules.js:
// the scripts with the clone's class ids and order names, <name>_<civ id>.vs) and the modes start the copy of the player's civilization; the game's civilizations get
// none. Old school lets in the mod's four equivalents (Gaul 4.2, Iberia 4.2, Imperial Rome 4.2, Numidian Carthage): the others, the game's included, are out as
// it already did with the rest. Those four keep the "Imp2 Cost" copies of their orders (keepImp2 in the table above). The branch the mode forced on Rome and Carthage
// (mode_inverno_rules.vs) is what romeimp42 and carthnum42 are.
{
  const GM = find(OUT, "DATA/GAMESCRIPTS");
  const CL = [["greek", "Greek", "H", ["M"]], ["gaul42", "Gaul42", "X", ["G"]], ["britain42", "Britain42", "Y", ["B"]], ["iberia42", "Iberia42", "Z", ["I"]], ["egypt42", "Egypt42", "1", ["E"]],
    ["germany42", "Germany42", "3", ["T"]], ["romerep42", "Romerep42", "4", ["R", "M"]], ["romeimp42", "Romeimp42", "5", ["R", "M"]], ["romepun42", "Romepun42", "6", ["R", "M"]],
    ["carthnum42", "Carthnum42", "7", ["C"]], ["carthmau42", "Carthmau42", "8", ["C"]]].map(([id, c, letter, from]) => ({ id, c, letter, from }));
  const IMP2 = ["gaul42", "iberia42", "romeimp42", "carthnum42"], ALLIDS = CL.map(c => c.id);
  const rules = [{ script: "mode_varios_disable_upgrades.vs", civs: ALLIDS }, { script: "mode_hide_imperivm2_costs.vs", civs: IMP2 }, { script: "mode_imperivm2_costs.vs", civs: IMP2 },
    { script: "mode_imperivm2_gaul.vs", civs: ["gaul42"] }, { script: "mode_imperivm2_iberia.vs", civs: ["iberia42"] }, { script: "mode_imperivm2_rome.vs", civs: ["romeimp42"] }];
  const made = require("./lib/mode-rules.js")({ OUT, HD, modClasses: path.join(PRISTINE, "DATA", "CLASSES"), clones: CL, rules });
  console.log(`game modes: ${made.length} scripts written for the mod's civilizations (${rules.map(r => r.script.replace(/^mode_|\.vs$/gi, "")).join(", ")})`);
  const start = (script, ids, ind = "") => ids.map(id => `${ind}if (Mod_PlayerCiv(player) == ${CL.find(c => c.id === id).c})\n${ind}\tStartPlayerScript(player, "data/subai/${script.replace(/\.vs$/i, "")}_${id}.vs");`).join("\n");
  const only = ids => `if (!(${ids.map(id => `Mod_PlayerCiv(player) == ${CL.find(c => c.id === id).c}`).join(" || ")}))`;
  const gmFiles = fs.readdirSync(GM).filter(f => /\.vs$/i.test(f));
  const edit = (file, from, to, what) => { const f = gmFiles.find(x => x.toLowerCase() === file.toLowerCase()); if (!f) return console.log(`  game mode ${file}: not in the port`); const p = path.join(GM, f), t = rd(p); if (!from.test(t)) return console.log(`  game mode ${file}: ${what} not found`); wr(p, t.replace(from, to)); };
  for (const f of gmFiles) {                                     // every mode that hid the Imperivm 2 orders or Varios' upgrades
    const p = path.join(GM, f); let t = rd(p); const t0 = t;
    t = t.replace(/^([ \t]*)StartPlayerScript\(player, "data\/subai\/mode_hide_imperivm2_costs\.vs"\);/m, (_m, ind) => start("mode_hide_imperivm2_costs.vs", IMP2, ind));
    t = t.replace(/^([ \t]*)StartPlayerScript\(player, "data\/subai\/mode_varios_disable_upgrades\.vs"\);/m, (_m, ind) => start("mode_varios_disable_upgrades.vs", ALLIDS, ind));
    if (t !== t0) wr(p, t);
  }
  edit("5 Old school.VS", /if \(nRace != RepublicanRome && nRace != Gaul && nRace != Iberia && nRace != Carthage\)/, only(IMP2), "the check of the civilizations");
  edit("5 Old school.VS", /Translate\("Old school: only Rome, Gaul, Iberia and Numidian Carthage are allowed"\)/, 'Translate("Old school: only Gaul 4.2, Iberia 4.2, Imperial Rome 4.2 and Numidian Carthage (Greek Mod 4.2) are allowed")', "the message");
  edit("5 Old school.VS", /^if \(nRace == RepublicanRome \|\| nRace == Carthage\)\s*\n\s*StartPlayerScript\(player, "data\/subai\/mode_inverno_rules\.vs"\);/m, "// the branch the mode forced (Imperial Rome, Numidian Carthage) is the civilization now: nothing to force", "the forced branch");
  edit("5 Old school.VS", /^if \(nRace == RepublicanRome\)\s*\n\s*StartPlayerScript\(player, "data\/subai\/mode_imperivm2_rome\.vs"\);/m, start("mode_imperivm2_rome.vs", ["romeimp42"]), "Rome's kit");
  edit("5 Old school.VS", /^if \(nRace == Gaul\)\s*\n\s*StartPlayerScript\(player, "data\/subai\/mode_imperivm2_gaul\.vs"\);/m, start("mode_imperivm2_gaul.vs", ["gaul42"]), "Gaul's kit");
  edit("5 Old school.VS", /^if \(nRace == Iberia\)\s*\n\s*StartPlayerScript\(player, "data\/subai\/mode_imperivm2_iberia\.vs"\);/m, start("mode_imperivm2_iberia.vs", ["iberia42"]), "Iberia's kit");
  edit("5 Old school.VS", /^StartPlayerScript\(player, "data\/subai\/mode_imperivm2_costs\.vs"\);/m, start("mode_imperivm2_costs.vs", IMP2), "the costs");
}

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
// names of its heroes (MName00x of the old slot -> HName00x). The keys the game does not have (Stonehenge*, MaxMyrmidonsValue, AntiRonda*...) are
// read only by the mod's own scripts: they are added (a key HD has keeps HD's value; the interface and language keys are not ours)
{
  const cp0 = path.join(OUT, "patches", "data", "const.ini");
  if (fs.existsSync(cp0)) {
    const keys = t => new Set([...t.matchAll(/^\s*(\w+)\s*=/gm)].map(m => m[1].toLowerCase())), hdKeys = keys(rd(path.join(HD, find(HD, "DATA/CONST.INI") ? path.relative(HD, find(HD, "DATA/CONST.INI")) : "DATA/CONST.INI")));
    const mine = rd(cp0), names = [...mine.matchAll(/^\s*MName(00\d)\s*=\s*(.+?)\s*$/gm)].map(m => `HName${m[1]} = ${m[2]}`);
    const gp = (mine.match(/^\[GamePlay\][^]*?(?=^\[|(?![^]))/m) || [""])[0], added = [...gp.matchAll(/^\s*(\w+)\s*=.*$/gm)].filter(m => !hdKeys.has(m[1].toLowerCase()) && !/^(UI|Cinematics|Language|MName)/i.test(m[1])).map(m => m[0].trim());
    fs.rmSync(cp0);
    if (names.length || added.length) wr(path.join(OUT, "patches", "DATA", "CONST.INI"), `[GamePlay]\r\n${[...names, ...added].join("\r\n")}\r\n`);
    console.log(`const.ini: ${names.length} Greek hero names and ${added.length} keys of the mod's scripts; the mod's tuning of the game left out`);
  }
}

// The Greek priest named the game's druid_revitalize*.vs, which read a unit special ("revitalize") that only the mod's old engine hook declared:
// the game's compiler refused them ("No matching function with name revitalize") and the ability never worked here. It now names the mod's own
// versions (druid_revitalize*_g42.vs, from tools/lib/own-scripts.js), which test the special the priest does have ("Determination", the mod's "fake
// skill to make revitalize work", as HDRUID_IDLE/STAND_POSITION do) and heal only the priest's own civilization. The game's druids keep the game's.
// "StaminaBoostSound" (those scripts and the priest's two idle scripts) is a feedback class nothing in the mod or the game declares: the game's own is
// "StaminaBoost".
{
  const SUB = find(OUT, "DATA/SUBAI"); let n = 0;
  for (const f of fs.readdirSync(SUB).filter(f => /\.vs$/i.test(f))) { const p = path.join(SUB, f), t = rd(p); if (/StaminaBoostSound/.test(t)) { wr(p, t.replace(/StaminaBoostSound/g, "StaminaBoost")); n++; } }
  const hp = path.join(CLASSES, "HPRIEST.SC.XML"), methods = fs.existsSync(hp) ? (rd(hp).match(/data\/subai\/druid_revitalize\w*\.vs/gi) || []) : [];
  console.log(`HPriest: methods ${methods.join(", ")}; StaminaBoostSound -> StaminaBoost in ${n} scripts`);
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
  const gp = path.join(OUT, "civs", "greek.json"), g = { ...require(gp) };
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

// the mod's conquests: a Conquests/<name>.bfhp or a ConquestMaps/<folder> at the path of the game's or of another port's is renamed, whatever the bytes
// (tools/lib/conquests.js; before tagCollisions, which renames the files of a folder one by one). The mod's Mediterranean has no ConquestMaps folder of
// its own (its files are the game's): the renamed folder is the game's. Its Greece territory plays as the mod's Greece: the `interface` of a <territory>
// (the territories.xml inside the .bfhp) is the race of the player, 4 (ImperialRome) in the original, here the index of `greek` (needs
// imperivm-resurrected#45; the 1.0 release ignores it, as for the CGWAR and the 1.8).
{
  const G = path.join(ROOT, "originals", "game-data"), PORTED = path.join(ROOT, "ported"), hpfs = require("./hpfs.js");
  const others = [G, ...fs.readdirSync(PORTED).filter(d => d !== "greek-civilization-mod").map(d => path.join(PORTED, d))].filter(d => fs.existsSync(d) && fs.statSync(d).isDirectory());
  const r = require("./lib/conquests.js")({ OUT, others, tag: "g42", label: "Gabbo" }), dataRe = /(\bdata\s*=\s*"ConquestMaps[\/\\])([^"]+)"/i, ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
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
      // its map has no region for the Greece territory the mod declares (index 9): drawn here (tools/lib/conquest-greece.js)
      const gr = require("./lib/conquest-greece.js");
      console.log(`  Greece: region ${gr.addGreece(to)} pixels in territories.bmp, ShieldGreece.bmp and the name HELLAS on the map`); gr.drawShield(to); gr.writeLabel(to);
    }
  }
  problems.push(...r.problems.filter(x => !/no such folder in the port/.test(x)));
  if (problems.length) console.log("conquests, to check:\n  " + problems.join("\n  "));
  const index = require(path.join(OUT, "civs", "greek.json")).index, cDir = find(OUT, "Conquests");
  for (const f of cDir ? fs.readdirSync(cDir).filter(f => /\.bfhp$/i.test(f)) : []) {
    const bfhp = path.join(cDir, f), buf = fs.readFileSync(bfhp), e = hpfs(buf).find(x => /^territories\.xml$/i.test(x.path)), raw = e && e.read().toString("latin1");
    const out = raw && raw.replace(/(<territory\b[^>]*\bid="Greece"[^>]*\binterface=")\d+"/, (_m, a) => `${a}${index}"`);
    if (!out || out === raw) continue;
    try { e.write(Buffer.from(out, "latin1")); fs.rmSync(bfhp); fs.writeFileSync(bfhp, buf); console.log(`conquest ${f}: Greece plays as greek (interface ${index})`); }
    catch (err) { console.log(`conquest ${f}: Greece interface not set (${err.message})`); }
  }
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
// the engine writes .fingerprint in an installed mod's folder (and Windows leaves desktop.ini): never part of the port
for (const f of walk(OUT).filter(f => /(^|\/)(\.fingerprint|desktop\.ini|thumbs\.db)$/i.test(f))) fs.rmSync(path.join(OUT, f));
{
  // the room's set of civilizations is named after "name" (imperivm-resurrected#38): with the version, so it is not confused with the 1.8's or CGWAR's. The id stays.
  const mp = path.join(OUT, "mod.json"), j = { ...require(mp) };   // a malformed file stops the build here, on purpose
  j.name = "Greek Civilization Mod 4.2";
  delete j.incompatibleWith; fs.rmSync(mp); fs.writeFileSync(mp, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("done");
