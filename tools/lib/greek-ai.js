// The AI scripts a mod rewrote for "Greece = Imperial Rome" run only for Greek settlements (AGENTS.md, "Civilizations are independent"):
//   greekAi({ OUT, HD, prefix, constName, varRe })
// Each settlement script of the mod's DATA/AI that tests ImperialRome becomes <prefix><name> (GR42_ES_Stronghold); a patch at the top of the
// game's own helper hands a Greek settlement over to it with set.AIRun. The main loops (ES_*) never return, so they go in [EconomyScripts] and a
// patch of GetEconomyScript.vs picks them. `constName` is the civilization's constant in scripts (Greek), `varRe` the AI variables of its units
// (AIV_MaxH...: a script that reads one that is not declared in AI.INI does not compile). Every other file of the mod's AI folder edited the
// game's scripts (or another civilization's tactics) and goes. Returns the names it handed over.
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); }   // rm first: the file may be a hard link to the pristine copy;
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };

module.exports = function greekAi({ OUT, HD, prefix, constName, varRe }) {
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
    if (!/^ES_/i.test(name)) wr(path.join(OUT, "patches", "DATA", "AI", f), `@before ${hd[i].trim()}\r\nif (Mod_TrueRace(set.GetCentralBuilding) == ${constName})\r\n{\r\n\tset.AIRun("${prefix}${name}");\r\n\treturn;\r\n}\r\n`);
    names.push(name);
  }
  const loops = names.filter(n => /^ES_/i.test(n)).map(n => prefix + n.replace(/\.vs$/i, ""));
  wr(path.join(OUT, "patches", "DATA", "AI", "GETECONOMYSCRIPT.VS"), `@before if (set.IsVillage)\r\nif (Mod_TrueRace(set.GetCentralBuilding) == ${constName})\r\n{\r\n`
    + loops.map(n => `\tif (set.Is${/village/i.test(n) ? "Village" : "Stronghold"})\r\n\t\treturn ${n};\r\n`).join("") + "}\r\n");
  const vars = [];
  { let sec = ""; for (const l of rd(path.join(AI, "AI.INI")).split(/\r?\n/)) {
      const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; continue; }
      const v = l.match(/^\s*(AIV_[A-Za-z]+)\s*=\s*(-?\d+)/);
      if (v && varRe.test(v[1])) vars.push([sec, `${v[1]} = ${v[2]}`]);
    } }
  const varLines = []; for (const sec of [...new Set(vars.map(x => x[0]))]) varLines.push(`[${sec}]`, ...vars.filter(x => x[0] === sec).map(x => x[1]));
  wr(path.join(OUT, "patches", "DATA", "AI", "AI.INI"), ["[EconomyScripts]", ...loops.map(n => "+" + n), "[Scripts]", ...names.map(n => `${prefix}${n} = void, Settlement set`), ...varLines, ""].join("\r\n"));
  fs.rmSync(path.join(AI, "AI.INI"));
  for (const f of fs.readdirSync(AI).filter(f => !new RegExp(`^${prefix}`, "i").test(f))) fs.rmSync(path.join(AI, f), { recursive: true });
  return { names, loops };
};
