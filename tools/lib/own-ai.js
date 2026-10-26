// The mod's AI beyond the economy and the tactics (tools/lib/greek-ai.js), for the mod's civilizations only (AGENTS.md, "Civilizations are independent").
//   ownAi({ OUT, HD, SRC, prefix, civs, flat, inline })  ->  { forks, inlined, ini: { Section: [lines] }, vars: Set }
// SRC is the mod's DATA/AI (the pristine port), HD the game's paks folder, OUT the port. Three kinds of script:
//   1. Scripts that Main.vs starts (the monitors) and the ones they start (group strategies GS_*, helpers GSH_*): copies named <prefix><name>, with the names
//      of the copies written into each other (`AIRun("GSH_SynchApproach.vs")`, the constants of [GAIKAStrat]), declared in AI.INI. A patch of Main.vs starts the
//      copies for the AI players of the mod's civilizations and returns (`Mod_PlayerCiv(AIGetPlayer)`, as the CGWAR does for its squad monitor).
//   2. Scripts the engine calls by name and that return a value or are not started by a script (CalcGAIKAPriority, EvalRecruit, GetGAIKAStrat, TSH_*...): there is
//      one for every AI player and no script can call another one, so the mod's body goes inside the game's, in a block that only runs for the mod's civilizations
//      (a patch, `@before` the game's first line of code). `inline` lists them: { name, player (the expression of the AI player's number), set: civs | flat }.
//   3. Scripts the engine calls by name that get no player (the AIO* orders, the AI HELPERS: group name and target): there is nothing to ask, they stay the game's.
// `civs` are the constants of every civilization of the mod (Greek, Gaul42...); `flat` the ones whose AI does not read the old branch flags (Rome's and Carthage's
// branches do, in the TSH_* helpers).
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(x => x.toLowerCase() === n.toLowerCase());
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { const n = ci(p, part); if (!n) return null; p = path.join(p, n); } return p; };
// a declaration ("Type name;", "int a, b = 1;", "Type *p;"): the patch goes after the last one, the first line that is code
const DECL = /^\s*(?!return\b|break\b|continue\b|else\b|if\b|while\b|for\b)[A-Za-z_]\w*\s*\*?\s+\*?[A-Za-z_]\w*(\s*=[^;]*)?(\s*,\s*[A-Za-z_]\w*(\s*=[^;]*)?)*\s*;\s*(\/\/.*)?$/;

const FORKS = ["Prioritize", "Recruiter", "GAIKAMonitor", "SquadMonitor", "EconomyMonitor", "TacticMonitor", "GSH_InterruptPassing", "GSH_SynchApproach", "GSH_CaptureOrder",
  "GS_EnterSettlement", "GS_Capture", "GS_KillEnemies", "GS_Siege", "GS_Guard"];
const STRATS = ["GS_EnterSettlement", "GS_Capture", "GS_KillEnemies", "GS_Siege", "GS_Guard"];

module.exports = function ownAi({ OUT, HD, SRC, prefix, civs, flat, inline }) {
  const outAI = find(OUT, "DATA/AI"), hdAI = find(HD, "DATA/AI"), res = { forks: [], inlined: [], ini: { GAIKAStrat: [], Scripts: [] }, vars: new Set() };
  if (!outAI || !hdAI || !fs.existsSync(SRC)) return res;
  const modIni = rd(path.join(SRC, ci(SRC, "AI.INI")));
  const sigOf = n => (modIni.match(new RegExp(`^${n}\\.vs\\s*=\\s*(.+?)\\s*$`, "im")) || [])[1];
  // the names of the copies in the text
  const have = FORKS.filter(n => ci(SRC, `${n}.vs`) && sigOf(n)), haveStrats = STRATS.filter(n => have.includes(n));   // GS_Guard is not the mod's: it stays the game's constant
  const names = new RegExp(`(["'])(${have.join("|")})\\.vs(["'])`, "gi"), strat = new RegExp(`\\b(${haveStrats.join("|")})\\b`, "g");
  const rename = t => t.replace(names, (_m, a, n, b) => `${a}${prefix}${have.find(x => x.toLowerCase() === n.toLowerCase())}.vs${b}`).replace(strat, `${prefix}$1`);
  const vars = t => { for (const m of t.matchAll(/\bAIV_[A-Za-z0-9]+/g)) res.vars.add(m[0]); };
  // 1. the monitors and what they start
  for (const n of FORKS) {
    const f = ci(SRC, `${n}.vs`), sig = sigOf(n);
    if (!f || !sig) { console.log(`  AI ${n}: not in the mod's AI`); continue; }
    const t = rename(rd(path.join(SRC, f)));
    vars(t);
    wr(path.join(outAI, `${prefix}${n}.VS`), t);
    res.ini.Scripts.push(`${prefix}${n}.vs = ${sig}`);
    if (STRATS.includes(n)) res.ini.GAIKAStrat.push(`+${prefix}${n}`);
    res.forks.push(n);
  }
  const cond = (list, pl) => `(${list.map(c => `Mod_PlayerCiv(${pl}) == ${c}`).join(" || ")})`;
  const patchDir = path.join(OUT, "patches", "DATA", "AI");
  const start = ["Prioritize", "Recruiter", "GAIKAMonitor", "SquadMonitor", "EconomyMonitor", "TacticMonitor"].filter(n => res.forks.includes(n));
  wr(path.join(patchDir, "MAIN.VS"), `@before Prioritize.vs\r\n// The mod's AI monitors, only for the AI players of its civilizations\r\nif ${cond(civs, "AIGetPlayer")}\r\n{\r\n${start.map(n => `\tAIRun('${prefix}${n}.vs');\r\n`).join("")}\treturn;\r\n}\r\n`);
  // 2. the ones the engine calls by name
  for (const { name, player, set } of inline) {
    const m = ci(SRC, `${name}.vs`), h = ci(hdAI, `${name}.vs`);
    if (!m || !h) { console.log(`  AI ${name}: not in the mod's or the game's AI`); continue; }
    const mod = rd(path.join(SRC, m)).split(/\r?\n/), hd = rd(path.join(hdAI, h)).split(/\r?\n/);
    let i = 1; while (i < hd.length && (!hd[i].trim() || hd[i].trim().startsWith("//") || DECL.test(hd[i]))) i++;
    if (i >= hd.length) { console.log(`  AI ${name}: no line of code to anchor the patch`); continue; }
    const body = rename(mod.slice(1).join("\r\n")).replace(/\s+$/, "");
    vars(body);
    wr(path.join(patchDir, `${name.toUpperCase()}.VS`), `@before ${hd[i].trim()}\r\n// The mod's own, only for the mod's civilizations\r\nif ${cond(set === "flat" ? flat : civs, player)}\r\n{\r\n${body}\r\n}\r\n`);
    res.inlined.push(name);
  }
  return res;
};
