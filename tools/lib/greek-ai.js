// The AI scripts a mod rewrote for "Greece = Imperial Rome" run only for Greek settlements (AGENTS.md, "Civilizations are independent"):
//   greekAi({ OUT, HD, prefix, constName, varRe })
// Each settlement script of the mod's DATA/AI that tests ImperialRome becomes <prefix><name> (GR42_ES_Stronghold); a patch at the top of the
// game's own helper hands a Greek settlement over to it with set.AIRun. The main loops (ES_*) never return, so they go in [EconomyScripts] and a
// patch of GetEconomyScript.vs picks them. `constName` is the civilization's constant in scripts (Greek), `varRe` the AI variables of its units
// (AIV_MaxH...: a script that reads one that is not declared in AI.INI does not compile). Every other file of the mod's AI folder edited the
// game's scripts (or another civilization's tactics) and goes. Returns the names it handed over.
// `civs` (constants: Greek, Gaul42...) are the civilizations the economy and the helpers are handed to: with the mod's branches of Rome and Carthage
// (their scripts read the old ChooseXxx flags) they are left out. `tactics` { Civ: [[upTo, "TS_Name"], ...] } is the mod's GetTacticScript for each
// civilization (a civilization with an empty list gets no tactic, as the mod gives it none; `guards` { Civ: "condition" } is when it gets none): the tactic scripts (and TS_AttackAtWill, which they start)
// become <prefix>TS_Name, are declared in AI.INI and a patch of GetTacticScript.vs picks them, only for those civilizations, in the first 2 seconds as the
// game does (the SDK's way to give a civilization its own tactic, sdk/civilizations.md, *The AI*).
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); }   // rm first: the file may be a hard link to the pristine copy;
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };

module.exports = function greekAi({ OUT, HD, prefix, constName, varRe, civs = [constName], tactics = {}, guards = {}, extra = { ini: {}, vars: new Set() } }) {
  const isMine = `(${civs.map(c => `Mod_TrueRace(set.GetCentralBuilding) == ${c}`).join(" || ")})`;
  const AI = find(OUT, "DATA/AI"), HD_AI = find(HD, "DATA/AI");
  if (!AI) return { names: [], loops: [] };
  const aiIni = rd(path.join(HD_AI, "AI.INI"));
  const aiName = f => (aiIni.match(new RegExp(`^(${f.replace(/\.VS$/i, "")}\\.vs)\\s*=`, "im")) || [])[1];
  const DECL = /^\s*(int|str|bool|point|Obj|ObjList|Settlement|Building|Unit|StrArray|IntArray|Hero|GAIKA|Squad|Item)\b[^(]*;\s*(\/\/.*)?$/;
  const names = [];
  for (const f of fs.readdirSync(AI).filter(f => /\.vs$/i.test(f))) {
    const hdp = path.join(HD_AI, fs.readdirSync(HD_AI).find(x => x.toLowerCase() === f.toLowerCase()) || f);
    if (!fs.existsSync(hdp)) continue;
    const hd = rd(hdp).split(/\r?\n/), name = aiName(f);
    if (!name || !/^\/\/\s*void,\s*Settlement set\s*$/i.test(hd[0]) || !/\b(ImperialRome|race\s*==\s*4)\b/.test(rd(path.join(AI, f)))) continue;
    let i = 1; while (i < hd.length && (!hd[i].trim() || hd[i].trim().startsWith("//") || DECL.test(hd[i]))) i++;
    fs.renameSync(path.join(AI, f), path.join(AI, prefix + f));
    if (!/^ES_/i.test(name)) wr(path.join(OUT, "patches", "DATA", "AI", f), `@before ${hd[i].trim()}\r\nif ${isMine}\r\n{\r\n\tset.AIRun("${prefix}${name}");\r\n\treturn;\r\n}\r\n`);
    names.push(name);
  }
  const loops = names.filter(n => /^ES_/i.test(n)).map(n => prefix + n.replace(/\.vs$/i, ""));
  wr(path.join(OUT, "patches", "DATA", "AI", "GETECONOMYSCRIPT.VS"), `@before if (set.IsVillage)\r\nif ${isMine}\r\n{\r\n`
    + loops.map(n => `\tif (set.Is${/village/i.test(n) ? "Village" : "Stronghold"})\r\n\t\treturn ${n};\r\n`).join("") + "}\r\n");
  // the tactics: the mod's GetTacticScript for each civilization, as scripts of its own
  const iniVars = text => { const out = new Map(); let sec = ""; for (const l of text.split(/\r?\n/)) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; continue; } const v = l.match(/^\s*(AIV_[A-Za-z0-9]+)\s*=\s*(-?\d+)/); if (v) out.set(`${sec}|${v[1]}`, v[2]); } return out; };
  const modIni = rd(path.join(AI, "AI.INI")), hdVars = iniVars(aiIni), tacticNames = [...new Set(Object.values(tactics).flat().map(t => t[1]))];
  const sigOf = n => (modIni.match(new RegExp(`^${n}\\.vs\\s*=\\s*(.+?)\\s*$`, "im")) || [])[1];
  const wanted = [...tacticNames, "TS_AttackAtWill"], tsScripts = [], need = new Set();
  for (const n of wanted) {
    const f = fs.readdirSync(AI).find(x => x.toLowerCase() === `${n}.vs`.toLowerCase());
    if (!f || !sigOf(n)) { console.log(`  tactic ${n}: not in the mod's AI`); continue; }
    let t = rd(path.join(AI, f));
    t = t.replace(/(AIRun\(\s*["'])TS_AttackAtWill\.vs/gi, `$1${prefix}TS_AttackAtWill.vs`);
    for (const m of t.matchAll(/\bAIV_[A-Za-z0-9]+/g)) need.add(m[0]);
    wr(path.join(AI, prefix + f), t); tsScripts.push(n);
  }
  for (const f of fs.readdirSync(AI).filter(f => new RegExp(`^${prefix}`, "i").test(f) && /\.vs$/i.test(f))) for (const m of rd(path.join(AI, f)).matchAll(/\bAIV_[A-Za-z0-9]+/g)) need.add(m[0]);
  for (const v of extra.vars) need.add(v);
  // an AI variable the game does not have and that one of these scripts reads is declared (a key the game has keeps its value for everybody)
  const vars = [];
  for (const [k, val] of iniVars(modIni)) { const [sec, name] = k.split("|"); if (!hdVars.has(k) && ![...hdVars.keys()].some(h => h.endsWith(`|${name}`)) && (varRe.test(name) || need.has(name))) vars.push([sec, `${name} = ${val}`]); }
  const varLines = []; for (const sec of [...new Set(vars.map(x => x[0]))]) varLines.push(`[${sec}]`, ...vars.filter(x => x[0] === sec).map(x => x[1]));
  const tsLines = tsScripts.map(n => `${prefix}${n}.vs = ${sigOf(n)}`);
  wr(path.join(OUT, "patches", "DATA", "AI", "AI.INI"), ["[EconomyScripts]", ...loops.map(n => "+" + n), "[TacticScripts]", ...tsScripts.filter(n => n !== "TS_AttackAtWill").map(n => `+${prefix}${n}`), ...((extra.ini.GAIKAStrat || []).length ? ["[GAIKAStrat]", ...extra.ini.GAIKAStrat] : []), "[Scripts]", ...names.map(n => `${prefix}${n} = void, Settlement set`), ...tsLines, ...(extra.ini.Scripts || []), ...varLines, ""].join("\r\n"));
  if (Object.keys(tactics).length) {
    const body = Object.entries(tactics).map(([civ, picks]) => !picks.length ? `if (Mod_TrueRace(set.GetCentralBuilding) == ${civ})\r\n\treturn TS_NONE;\r\n` : `if (Mod_TrueRace(set.GetCentralBuilding) == ${civ})\r\n{\r\n${guards[civ] ? `\tif (${guards[civ]})\r\n\t\treturn TS_NONE;\r\n` : ""}\tif (GetTime() < 2000)\r\n\t{\r\n\t\trnd = rand(100);\r\n${picks.map(([upTo, n]) => `\t\tif (rnd < ${upTo})\r\n\t\t\treturn ${prefix}${n};\r\n`).join("")}\t}\r\n\treturn TS_NONE;\r\n}\r\n`).join("");
    wr(path.join(OUT, "patches", "DATA", "AI", "GETTACTICSCRIPT.VS"), `@before nRace = set.GetCentralBuilding.race;\r\n// The mod's own tactics, only for its civilizations (the game's AI sees their base)\r\n${body}`);
  }
  fs.rmSync(path.join(AI, "AI.INI"));
  for (const f of fs.readdirSync(AI).filter(f => !new RegExp(`^${prefix}`, "i").test(f))) fs.rmSync(path.join(AI, f), { recursive: true });
  return { names, loops };
};
