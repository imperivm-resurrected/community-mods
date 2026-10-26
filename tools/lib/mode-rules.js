// The rules a game mode of the mod applies to a civilization, for each of the mod's civilizations that has them (AGENTS.md, "Civilizations are independent").
//   modeRules({ OUT, HD, modClasses, clones, rules })  ->  [{ from, to }]
// The mode scripts (data/subai/mode_*.vs) name the game's classes and orders (`ClassPlayerObjs("GBarracks", player)`, `CmdEnable("Barrack Level 2 Imp2 Cost")`).
// A clone has its own (`XBarracks`, `Barrack Level 2 Imp2 Cost Gaul42`): for each civilization of `rules` the script is written once more as
// <name>_<civ id>.vs with the class ids of the clone (tools/lib/own-scripts.js, classMapper) and the order names the clone tool wrote in the civilization's
// `alias.commands` (civs/<id>.json). The game mode starts the copy of each player's civilization (tools/greek-4-2.js).
//   clones: [{ id, letter, from }]   rules: [{ script: "mode_x.vs", civs: ["gaul42", ...] }]
const fs = require("fs"), path = require("path");
const { classMapper } = require("./own-scripts.js");
const rd = f => fs.readFileSync(f, "latin1"), wr = f => (t) => { fs.rmSync(f, { force: true }); fs.writeFileSync(f, t, "latin1"); };
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(x => x.toLowerCase() === n.toLowerCase());

module.exports = function modeRules({ OUT, HD, modClasses, clones, rules }) {
  const SUB = path.join(OUT, "DATA", ci(path.join(OUT, "DATA"), "SUBAI")), map = classMapper({ OUT, HD, modClasses }), done = [];
  for (const { script, civs } of rules) {
    const f = ci(SUB, script); if (!f) { console.log(`  mode rules: ${script} is not in the port`); continue; }
    const text = rd(path.join(SUB, f)), stem = f.replace(/\.vs$/i, ""), ext = f.slice(stem.length);
    for (const id of civs) {
      const clone = clones.find(c => c.id === id), jf = path.join(OUT, "civs", `${id}.json`);
      if (!clone || !fs.existsSync(jf)) { console.log(`  mode rules: ${id} has no declaration`); continue; }
      const alias = Object.fromEntries(Object.entries(require(jf).alias?.commands || {}).map(([k, v]) => [k.toLowerCase(), v]));
      const t = map(text, clone).replace(/(Cmd(?:Enable|Disable)\(\s*")([^"]+)(")/g, (m, a, n, b) => alias[n.toLowerCase()] ? a + alias[n.toLowerCase()] + b : m);
      const to = `${stem}_${id}${ext}`;
      wr(path.join(SUB, to))(t);
      done.push({ from: f, to });
    }
  }
  return done;
};
