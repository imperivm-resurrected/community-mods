// CGWAR: Greece as a new civilization (civs\greece.json) instead of in place of Imperial Rome, as the 1.40 mod did.
// Run after tools/port-140.js has built ported/cgwar:
//   node tools/cgwar-greece.js
// What it does to ported/cgwar (HD's own files come back wherever the mod's go away):
//   - Greek classes: race="greece"; the Greek-drawn Imperial pieces (MWalls*, MGate*, MTower, MVillager…) become K*
//     copies, since a mod civilization builds its city from the classes of its letter (KWallsN, KTavern2, KArena…)
//   - Imperial Rome and the "Rome" merge (Republican Rome turning Republican or Imperial in the Arena) go: the M* classes,
//     RArena/RBarracks/RBlacksmith, VERIFY_*, the official adventures and conquest it edited, the random map towns and the texts renaming both Romes
//   - the mod's AI settlement scripts run as GR_* for Greek settlements only (HD's hand over to them through a patch)
//   - shared command files become patches that only add the Greek commands and sources
//   - Greek interface: INFOBAR_GREEK.INI, CMDBARGREEK.INI and the frame in FRAMES.INI (internalName "Greek")
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "ported", "cgwar"), HD = path.join(ROOT, "originals", "game-data", "paks");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s, "latin1"); };
// case-insensitive path inside a folder ("DATA/CLASSES/MWALLSN.SC.XML" -> real name), or null
const find = (base, rel) => { let p = base;
  for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); }
  return p; };
const rm = rel => { const p = find(OUT, rel); if (p) fs.rmSync(p, { recursive: true, force: true }); return !!p; };
const CLASSES = find(OUT, "DATA/CLASSES"), HD_CLASSES = find(HD, "DATA/CLASSES");
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const hdClassIds = new Set(fs.readdirSync(HD_CLASSES).filter(f => /\.sc\.xml$/i.test(f)).map(f => (classOf(rd(path.join(HD_CLASSES, f))) || "").toLowerCase()));

// --- 1. Greek copies of the Imperial pieces the mod redrew (before the M* files go) ---
const toK = (src, id, edit = s => s) => {
  const s = edit(src.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${id}"`).replace(/\s+altid\s*=\s*"[^"]*"/, ""));
  wr(path.join(CLASSES, `${id.toUpperCase()}.SC.XML`), s);
};
const renamed = {};
for (const f of fs.readdirSync(CLASSES).filter(f => /^M(WALLS|GATE|TOWER|VILLAGER|WVILLAGER|VILLAGERAMBIENT|WVILLAGERAMBIENT)\w*\.SC\.XML$/i.test(f))) {
  const s = rd(path.join(CLASSES, f)), m = classOf(s), k = "K" + m.slice(1);
  toK(s, k); renamed[m] = k;
}
const cls = id => { const f = fs.readdirSync(CLASSES).find(f => classOf(rd(path.join(CLASSES, f))) === id); return f && rd(path.join(CLASSES, f)); };
// pieces of Imperial Rome's city the mod didn't redraw: the city builder asks for them by letter
toK(cls("KTavern"), "KTavern2");                                   // the second tavern of the template: another Greek tavern
toK(cls("KGymnos"), "KArena");                                     // where the Imperial city has its arena, the Greek one has the gymnasium
toK(rd(find(HD, "DATA/CLASSES/MGUARDPOSTSENTRY.SC.XML")), "KGuardPostSentry",
  s => s.replace(/(<class\b[^>]*?\bentity\s*=\s*")[^"]*"/, `$1${(cls("KSentry").match(/\bentity\s*=\s*"([^"]*)"/) || [])[1]}"`));

// --- 2. Imperial Rome and the Rome merge go back to HD ---
for (const f of fs.readdirSync(CLASSES).filter(f => /^(M\w+|RARENA|RBARRACKS|RBLACKSMITH)\.SC\.XML$/i.test(f))) fs.rmSync(path.join(CLASSES, f));
const WINTER = find(CLASSES, "WINTER");
if (WINTER) { for (const f of fs.readdirSync(WINTER).filter(f => /^M/i.test(f))) fs.rmSync(path.join(WINTER, f)); if (!fs.readdirSync(WINTER).length) fs.rmdirSync(WINTER); }
// AI: the mod's settlement scripts assume "Imperial Rome = Greece", and a Greek AI does see ImperialRome (the base), so
// they work as they are for Greece: each goes in as GR_<name>.
// - ESH_* helpers: HD's own script hands a Greek settlement over to it with set.AIRun.
// - ES_* main loops (ES_Stronghold, ES_Village) never return and Sleep(): run through AIRun they crashed the game as soon
//   as an AI got a Greek town (gbr.exe+2945fa). They go in [EconomyScripts] and GetEconomyScript.vs picks them instead.
// Every other civilization keeps HD's AI.
const AI = find(OUT, "DATA/AI"), HD_AI = find(HD, "DATA/AI");
const aiIni = rd(path.join(HD_AI, "AI.INI"));
const aiName = f => (aiIni.match(new RegExp(`^(${f.replace(/\.VS$/i, "")}\\.vs)\\s*=`, "im")) || [])[1];  // "ESH_BuildArmy.vs"
const DECL = /^\s*(int|str|bool|point|Obj|ObjList|Settlement|Building|Unit|StrArray|IntArray|Hero|GAIKA|Squad|Item)\b[^(]*;\s*(\/\/.*)?$/;
const greekAi = [];
for (const f of fs.readdirSync(AI).filter(f => /\.vs$/i.test(f))) {
  const hd = rd(path.join(HD_AI, f)).split(/\r?\n/), name = aiName(f);
  if (!name || !/^\/\/\s*void,\s*Settlement set/i.test(hd[0]) || !/\b(ImperialRome|race\s*==\s*4)\b/.test(rd(path.join(AI, f)))) continue;
  let i = 1; while (i < hd.length && (!hd[i].trim() || hd[i].trim().startsWith("//") || DECL.test(hd[i]))) i++; // first line of code
  fs.renameSync(path.join(AI, f), path.join(AI, "GR_" + f));
  if (!/^ES_/i.test(name)) wr(path.join(OUT, "patches", "DATA", "AI", f), `@before ${hd[i].trim()}\r\nif (Mod_TrueRace(set.GetCentralBuilding) == Greece)\r\n{\r\n\tset.AIRun("GR_${name}");\r\n\treturn;\r\n}\r\n`);
  greekAi.push(name);
}
const greekLoops = greekAi.filter(n => /^ES_/i.test(n)).map(n => "GR_" + n.replace(/\.vs$/i, "")); // GR_ES_Stronghold, GR_ES_Village
wr(path.join(OUT, "patches", "DATA", "AI", "GETECONOMYSCRIPT.VS"), `@before if (set.IsVillage)\r\nif (Mod_TrueRace(set.GetCentralBuilding) == Greece)\r\n{\r\n`
  + greekLoops.map(n => `\tif (set.Is${/village/i.test(n) ? "Village" : "Stronghold"})\r\n\t\treturn ${n};\r\n`).join("") + "}\r\n");
for (const f of ["CALCGAIKAPRIORITY.VS", "ESH_GOLDTRADE.VS"]) rm("DATA/AI/" + f); // only the Rome merge
const modIni = rd(path.join(AI, "AI.INI")); rm("DATA/AI/AI.INI");
const iniVal = (s, sec, k) => { const b = s.split(new RegExp(`^\\[${sec.replace(".", "\\.")}\\]`, "m"))[1]; return b && (b.split(/^\[/m)[0].match(new RegExp(`^${k}\\s*=\\s*(\\S+)`, "m")) || [])[1]; };
const maxK = [...modIni.matchAll(/^(AIV_MaxK\w+)\s*=\s*(-?\d+)/gm)].map(m => `${m[1]} = ${m[2]}`);
wr(path.join(OUT, "patches", "DATA", "AI", "AI.INI"), ["[EconomyScripts]", ...greekLoops.map(n => "+" + n),
  "[Scripts]", ...greekAi.map(n => `GR_${n} = void, Settlement set`),
  "[Vars.All]", ...maxK,
  // the mod's economy tuning, for every AI as in the mod (HD has these keys twice in [Vars.All])
  "-AIV_SquanderGoldAmount", "-AIV_SquanderFoolAmount", "-AIV_ExcessGold",
  ...["AIV_SquanderGoldAmount", "AIV_SquanderFoolAmount", "AIV_ExcessGold"].map(k => `${k} = ${iniVal(modIni, "Vars.All", k)}`),
  "[Vars.Hard]", ...["AIV_SquanderGoldAmount", "AIV_SquanderFoolAmount"].map(k => `${k} = ${iniVal(modIni, "Vars.Hard", k)}`), ""].join("\r\n"));

// its WildHorse (1.40 had none) is defined again by HD in WHORSE.SC.XML, with the same stats and art plus capturing: two
// classes with one id; HD's is kept
for (const r of ["DATA/CLASSES/WILDHORSE.SC.XML", "UNITS/WILDHORSE", "UI/ICONS/WILDHORSE.bmp"]) rm(r);
for (const r of ["DATA/SUBAI/Technology_of_Rome_Buildings.vs", "DATA/SUBAI/VERIFY_RESEARCH.VS", "DATA/SUBAI/VERIFY_TRAINEX.VS",
  "Adventures/GreatBattles", "Adventures/GreatChallenges", "Conquests", "ConquestMaps", "DATA/INTERFACE/MENU/CONQUESTGAME.INI",
  "Packs/RandomMapSettlements.bfhp"]) rm(r);
for (const d of ["Adventures", "Packs"]) { const p = find(OUT, d); if (p && !fs.readdirSync(p).length) fs.rmSync(p, { recursive: true }); }

// --- 3. classes: Greek race, Greek editor folder ---
for (const f of fs.readdirSync(CLASSES).filter(f => /\.sc\.xml$/i.test(f))) {
  const p = path.join(CLASSES, f); let s = rd(p);
  const id = classOf(s) || "";
  if (/^(K|Greek)/i.test(id)) s = s.replace(/\brace\s*=\s*"(ImperialRome|RepublicanRome)"/, 'race="greece"');
  s = s.replace(/Stronghold \(Imperial Rome\)/g, "Stronghold (Greek)");
  // the free village has race="", which no game version uses: HD's any-race village is race="Mutable" (MutableVillage),
  // and a building of no race is race="None"
  s = s.replace(/\brace\s*=\s*""/, /cpp_class\s*=\s*"CVXTownHall"/.test(s) ? 'race="Mutable"' : 'race="None"');
  wr(p, s);
}

// --- 4. scripts the mod changed for "Imperial Rome = Greece" ---
const vs = (rel, fn) => { const p = find(OUT, rel); if (p) wr(p, fn(rd(p))); };
vs("DATA/SUBAI/VILLAGE_TRAINPEASANT.VS", s => s.replace(/\/\/if \(\.race == ImperialRome\)(\r?\n)\s*\/\/strMaleVillager = GetRaceStrPref\(RepublicanRome\);/,
  "if (.race == ImperialRome)$1\tstrMaleVillager = GetRaceStrPref(RepublicanRome);"));
vs("DATA/SUBAI/RPRIEST_IDLE.VS", s => s.replace("if (.race == ImperialRome)\r\n\tif (IsResearched(.player, \"Offering", "if (Mod_TrueRace(this) == Greece)\r\n\tif (IsResearched(.player, \"Offering")
  .replace("if (.race == ImperialRome)\n\tif (IsResearched(.player, \"Offering", "if (Mod_TrueRace(this) == Greece)\n\tif (IsResearched(.player, \"Offering"));

// --- 5. shared commands -> patches with only what is Greek (commands or sources naming a class the HD game doesn't have) ---
const modClass = c => !hdClassIds.has(c.toLowerCase());
const cmds = s => [...s.matchAll(/<cmd\b([^>]*)>([^]*?)<\/cmd>/g)].map(m => ({ text: m[0], name: (m[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1], src: [...m[2].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]) }));
const HD_CMDS = find(HD, "DATA/COMMANDS"), MOD_CMDS = find(OUT, "DATA/COMMANDS");
const hdFiles = Object.fromEntries(fs.readdirSync(HD_CMDS).filter(f => /\.xml$/i.test(f)).map(f => [f.toUpperCase(), cmds(rd(path.join(HD_CMDS, f)))]));
const where = name => Object.keys(hdFiles).find(f => hdFiles[f].some(c => c.name === name)); // a command HD moved to another file
const ops = {}, own = []; // file -> [patch lines]; whole Greek commands
const sel = n => n.includes("'") ? `/commands/cmd[@name="${n}"]` : `/commands/cmd[@name='${n}']`;
const addSrc = (file, name, obj) => { (ops[file] ||= []); const l = `  <add select="${sel(name)}"><src obj="${obj}"/></add>`; if (!ops[file].includes(l)) ops[file].push(l); };
for (const f of fs.readdirSync(MOD_CMDS).filter(f => hdFiles[f.toUpperCase()])) {
  for (const c of cmds(rd(path.join(MOD_CMDS, f)))) {
    const greek = c.src.filter(modClass);
    if (!greek.length) continue;
    const home = where(c.name);
    if (home) for (const o of greek) { if (!hdFiles[home].find(h => h.name === c.name).src.includes(o)) addSrc(home, c.name, o); }
    else own.push(c.text);                                         // only Greek: its own file, no patch needed
  }
  fs.rmSync(path.join(MOD_CMDS, f));
}
// the new Greek pieces take the commands of what they stand for
const also = { KTavern2: "KTavern", KArena: "KGymnos" };
for (const [k, like] of Object.entries(also))
  for (const f of fs.readdirSync(MOD_CMDS)) { let s = rd(path.join(MOD_CMDS, f)); const n = s.replace(new RegExp(`(\\s*)<src obj="${like}"/>`, "g"), `$1<src obj="${like}"/>$1<src obj="${k}"/>`); if (n !== s) wr(path.join(MOD_CMDS, f), n); }
for (const [file, list] of Object.entries(hdFiles)) for (const c of list) {
  for (const [m, k] of Object.entries(renamed)) if (c.src.includes(m)) addSrc(file, c.name, k);   // repair walls, gates, towers
  if (c.src.includes("KTavern")) addSrc(file, c.name, "KTavern2");
  if (c.src.includes("GOutpost")) addSrc(file, c.name, "KOutpost");                                // the Greek outpost sells food and gold
}
wr(path.join(MOD_CMDS, "GREECE.XML"), `<commands>\n\n${own.join("\n\n")}\n\n</commands>\n`);
for (const [file, list] of Object.entries(ops)) wr(path.join(OUT, "patches", "DATA", "COMMANDS", file), `<patch>\n${list.join("\n")}\n</patch>\n`);

// --- 6. Greek interface: files the game looks up by the civilization's internalName ---
const mv = (from, to, fn = s => s) => { const p = find(OUT, from); if (p) { wr(path.join(path.dirname(p), to), fn(rd(p))); fs.rmSync(p); } };
mv("DATA/INTERFACE/INFOBAR/INFOBAR_IROME.INI", "INFOBAR_GREEK.INI");
mv("DATA/INTERFACE/CMDBAR/CMDBARIROME.INI", "CMDBARGREEK.INI");
rm("DATA/INTERFACE/CMDBAR/FRAMES.INI");
wr(path.join(OUT, "patches", "DATA", "INTERFACE", "CMDBAR", "FRAMES.INI"), "[Images]\nGreek = gameres/cmdbar/frames/greek_frame.bmp, 10, 10\ngreece = gameres/cmdbar/frames/greek_frame.bmp, 10, 10\n");

// --- 7. texts: no renaming the two Romes; the Greek walls get their own name ---
const LOC = path.join(OUT, "loc", "spanish.loc.xml");
const drop = /text="(Republican Rome@race|Imperial Rome@race|Imperial Roman walls|[^"]*Administration[^"]*|You can only have one[^"]*)"/;
let loc = rd(LOC).split(/\r?\n/).filter(l => !drop.test(l)).join("\n")
  .replace('text="Stronghold (Imperial Rome)@editortree/Structures"', 'text="Stronghold (Greek)@editortree/Structures"');
wr(LOC, loc);

// the port-140 report: the shared command files it couldn't merge are patches now
const REPORT = path.join(ROOT, "raw", "port-140", "cgwar.md");
if (fs.existsSync(REPORT)) {
  const parts = fs.readFileSync(REPORT, "utf8").split(/(?=^## \d+\. )/m);
  const kept = parts.slice(1).filter(p => !/^## \d+\. DATA\/COMMANDS\//.test(p));
  fs.writeFileSync(REPORT, parts[0].replace(/^\d+ items\./m, `${kept.length} items.`) + kept.join(""));
}

const n = Object.values(ops).reduce((a, l) => a + l.length, 0);
console.log(`cgwar: ${Object.keys(renamed).length + 3} Greek city pieces, ${n} command patches in ${Object.keys(ops).length} files`);
