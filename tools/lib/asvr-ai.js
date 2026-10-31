// The AI of AsvrMod VII for the mod's civilizations only (AGENTS.md, "Civilizations are independent"; engine issue #15).
//   asvrAi({ OUT, HD, SRC, prefix, civs, tactics, loops, helpers, monitors, inline }) -> { forks, inlined, tactics }
// HD is the game's DATA folder, SRC the mod's DATA/AI (HD + mod, three-way), OUT the port. `civs` are the constants of the mod's civilizations (Agaul...).
// The game's AI sees a clone as its base (`"ai": true`, sdk/civilizations.md): the scripts below name the game's classes and orders and the engine translates them.
//   1. loops (ES_Stronghold, ES_Village): copies <prefix><name> in [EconomyScripts], picked by a patch of GetEconomyScript.vs. They are NEVER started with
//      AIRun: a Sleep inside a script run by Settlement.AIRun crashes the game (imperivm-resurrected#15), and the loops never return.
//   2. helpers the loops start with set.AIRun (ESH_*: they do their work and return, no Sleep) and the other scripts the mod edited that the forks start: copies,
//      with the names of the copies written into each other. The game's own helpers (the ones the mod did not edit) stay the game's.
//   3. tactics: the mod's choice per civilization (GetTacticScript.vs of the mod) as copies in [TacticScripts], picked by a patch of GetTacticScript.vs.
//   4. monitors (SquadMonitor): copies that a patch of Main.vs starts with the player's AIRun (the game does the same: the monitors sleep) for the AI players of
//      the mod's civilizations, together with the game's other monitors.
//   5. what the engine calls by name and that returns a value or gets no script to start (CalcGAIKAPriority, GetArmyNeed, TSH_ArenaRecruit): the mod's body goes
//      inside the game's script, in a block that only runs for the mod's civilizations (tools/lib/asvr-inline.js).
// An AI variable (AIV_*) a copy reads that the game's AI.INI lacks is declared from the mod's AI.INI (a key the game has keeps its value for everybody).
const fs = require("fs"), path = require("path");
const inlineBehavior = require("./asvr-inline.js");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());

// `ids`: the mod's own classes that the clone step renamed (Hipatista -> MHipatista): the copies name them as the game's AI counts them, by the id of the class the clone came from.
module.exports = function asvrAi({ OUT, HD, SRC, prefix, civs, tactics, loops, helpers, monitors, inline, ids = {} }) {
  const hdAI = path.join(HD, ci(HD, "AI")), res = { forks: [], inlined: [], tactics: [], problems: [] };
  const modIni = rd(path.join(SRC, ci(SRC, "AI.INI"))), hdIni = rd(path.join(hdAI, ci(hdAI, "AI.INI")));
  const sigOf = n => (modIni.match(new RegExp(`^${n}\\.vs\\s*=\\s*(.+?)\\s*$`, "im")) || hdIni.match(new RegExp(`^${n}\\.vs\\s*=\\s*(.+?)\\s*$`, "im")) || [])[1];
  const tacticNames = [...new Set(Object.values(tactics))], attack = "TS_AttackAtWill";
  const forkNames = [...loops, ...helpers, ...monitors, ...tacticNames, attack];
  for (const n of forkNames) if (!ci(SRC, `${n}.vs`) || !sigOf(n)) { res.problems.push(`${n}: not in the mod's AI (or no signature)`); }
  const have = forkNames.filter(n => ci(SRC, `${n}.vs`) && sigOf(n));
  const names = new RegExp(`(["'])(${have.join("|")})\\.vs\\1`, "gi");
  const rename = t => t.replace(names, (_m, q, n) => `${q}${prefix}${have.find(x => x.toLowerCase() === n.toLowerCase())}.vs${q}`);
  const iniVars = text => { const out = new Map(); let sec = ""; for (const l of text.split(/\r?\n/)) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; continue; } const v = l.match(/^\s*(AIV_[A-Za-z0-9]+)\s*=\s*(-?\d+)/); if (v) out.set(`${sec}|${v[1]}`, v[2]); } return out; };
  const need = new Set();
  // 1-4. the copies
  for (const n of have) {
    const sig = sigOf(n);
    let t = rename(rd(path.join(SRC, ci(SRC, `${n}.vs`))));
    t = t.replace(/"(\w+)"/g, (m, id) => ids[id] ? `"${ids[id]}"` : m);
    // the header names the parameters the script gets: the one of AI.INI (the mod's ES_Village says "Settlement set, Obj This" and uses neither This nor the ini's signature)
    t = t.replace(/^\s*\/\/[^\r\n]*/, `// ${sig}`);
    for (const m of t.matchAll(/\bAIV_[A-Za-z0-9]+/g)) need.add(m[0]);
    wr(path.join(OUT, "DATA", "AI", `${prefix}${n}.VS`), t);
    res.forks.push(n);
  }
  const isMine = list => `(${list.join(" || ")})`;
  const patchDir = path.join(OUT, "patches", "DATA", "AI");
  const byTrue = civs.map(c => `Mod_TrueRace(set.GetCentralBuilding) == ${c}`);
  // GetEconomyScript.vs
  const loopLines = loops.filter(n => have.includes(n)).map(n => `\tif (set.Is${/village/i.test(n) ? "Village" : "Stronghold"})\r\n\t\treturn ${prefix}${n};\r\n`);
  wr(path.join(patchDir, "GETECONOMYSCRIPT.VS"), `@before if (set.IsVillage)\r\n// The mod's economy loops, only for the mod's civilizations\r\nif ${isMine(byTrue)}\r\n{\r\n${loopLines.join("")}}\r\n`);
  // GetTacticScript.vs: the mod's pick, in the first 5 seconds like the mod's
  const picks = Object.entries(tactics).filter(([, n]) => have.includes(n));
  wr(path.join(patchDir, "GETTACTICSCRIPT.VS"), `@before nRace = set.GetCentralBuilding.race;\r\n// The mod's own tactic for each of its civilizations (the game's AI sees their base)\r\n`
    + picks.map(([civ, n]) => `if (Mod_TrueRace(set.GetCentralBuilding) == ${civ})\r\n{\r\n\tif (GetTime < 5000)\r\n\t\treturn ${prefix}${n};\r\n\treturn TS_NONE;\r\n}\r\n`).join(""));
  res.tactics = picks.map(([civ, n]) => `${civ}: ${n}`);
  // Main.vs: the player's monitors; the game's, and the mod's copies in place of the ones it edited
  const MAIN = ["Prioritize", "Recruiter", "GAIKAMonitor", "SquadMonitor", "EconomyMonitor", "TacticMonitor"];
  wr(path.join(patchDir, "MAIN.VS"), `@before AIRun('Prioritize.vs' );\r\n// The AI of the mod's civilizations: the game's monitors and the mod's copy of the ones it edited\r\nif ${isMine(civs.map(c => `Mod_PlayerCiv(AIGetPlayer) == ${c}`))}\r\n{\r\n${MAIN.map(n => `\tAIRun('${have.includes(n) ? prefix : ""}${n}.vs');\r\n`).join("")}\treturn;\r\n}\r\n`);
  // 5. by name
  const mapId = (t, _c) => t;
  for (const { name, player } of inline) {
    const r = inlineBehavior({ OUT, HD, SRC, name, dir: "AI", civs: [{ id: "asvr", constant: "" }], mapClasses: mapId, guard: () => isMine(civs.map(c => `Mod_PlayerCiv(${player}) == ${c}`)) });
    if (r) { res.inlined.push(name); const t = rd(path.join(OUT, "patches", "DATA", "AI", `${name.replace(/\.vs$/i, "").toUpperCase()}.VS`)); for (const m of t.matchAll(/\bAIV_[A-Za-z0-9]+/g)) need.add(m[0]); } else res.problems.push(`${name}: not in the mod's or the game's AI`);
  }
  // AI.INI: the lists, the signatures, the variables the game lacks
  const hdVars = iniVars(hdIni), vars = [];
  for (const [k, val] of iniVars(modIni)) { const [sec, nm] = k.split("|"); if (!hdVars.has(k) && ![...hdVars.keys()].some(h => h.endsWith(`|${nm}`)) && need.has(nm)) vars.push([sec, `${nm} = ${val}`]); }
  const varLines = []; for (const sec of [...new Set(vars.map(x => x[0]))]) varLines.push(`[${sec}]`, ...vars.filter(x => x[0] === sec).map(x => x[1]));
  wr(path.join(patchDir, "AI.INI"), ["[EconomyScripts]", ...loops.filter(n => have.includes(n)).map(n => `+${prefix}${n}`), "[TacticScripts]", ...tacticNames.filter(n => have.includes(n)).map(n => `+${prefix}${n}`),
    "[Scripts]", ...have.map(n => `${prefix}${n}.vs = ${sigOf(n)}`), ...varLines, ""].join("\r\n"));
  res.vars = vars.map(v => v[1]);
  return res;
};
