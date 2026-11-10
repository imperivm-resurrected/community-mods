// The art of the package root by class (community-mods#53 "Art rule", community-mods#66): 1 a civilization's, 2 global in-game (it replaces the game's: belongs to the ruleset layer),
// 3 outside the match (the menu skin). Two things:
//   rootClass2({ OUT, GAME })       the files of the root that replace the game's own and are not menu skin: the build stops on any (a layer does not always win over another package's root,
//                                   and the SDK validator warns about it)
//   routeSkin({ OUT, ... })         OFF BY DEFAULT (`CM_SKINS=1`): moves the class 3 files of the root to skins/community-mod/ with the path they have in the root, and declares the skin in
//                                   mod.json. The engine feature (imperivm-resurrected#55) is not merged: the `skins` entry below is PROVISIONAL (id, name, path, as `rulesets`), and where the engine wants
//                                   each file (menuini/ against data/interface/menu/) is its open question. With the option off, the skin stays in the root and loads as today.
const fs = require("fs"), path = require("path");
const L = require("./community-layer.js");

const SKIN_ID = L.ID;
// class 3 files of the root, by the path they have in the port
const SKIN_ROOT = [/^patches\/menuini\//i, /^patches\/DATA\/INTERFACE\/MENU\//i, /^UI\/MENU\//i, /^UI\/INTERFACE\/(MenuMod[^/]*\.bmp|CurrentLang\/)/i, /^currentlang\/(conquestdefault|adventuredefault|menubackground|menu_16_9|menu_4_3|logo[^/]*)\.bmp$/i, /^Local\/[^/]+\/UI\/MENU\//i, /^Local\/[^/]+\/(tips|help)\.xml$/i];
const isSkinRoot = rel => SKIN_ROOT.some(re => re.test(rel));

function rootClass2({ OUT, GAME }) {
  const game = new Set();
  for (const base of [path.join(GAME, "paks"), GAME]) for (const f of L.walk(base)) if (base === GAME ? /^DATA\//i.test(f) : true) game.add(f.toLowerCase());
  const bad = [];
  for (const f of L.walk(OUT)) {
    if (/^(patches|loc|civs|rulesets)\//i.test(f) || f === "mod.json") continue;
    if (isSkinRoot(f)) continue;
    const g = L.gamePath(f);
    if (game.has(f.toLowerCase()) || game.has(g)) bad.push(f);
  }
  return bad;
}

function skinFiles(OUT) { return L.walk(OUT).filter(f => !/^rulesets\//i.test(f) && isSkinRoot(f)); }

function routeSkin({ OUT, modJson }) {
  const moved = [], dest = path.join(OUT, "skins", SKIN_ID);
  for (const f of skinFiles(OUT)) { const to = path.join(dest, f); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.renameSync(path.join(OUT, f), to); moved.push(f); }
  let mj; try { mj = JSON.parse(fs.readFileSync(modJson, "utf8")); } catch (e) { throw new Error(`${modJson}: ${e.message}`); }
  mj.skins = [{ id: SKIN_ID, name: { english: "Community Mod menus", spanish: "Menús de Community Mod", italian: "Menu di Community Mod" }, path: `skins/${SKIN_ID}` }];   // provisional, see the top of this file
  fs.writeFileSync(modJson, JSON.stringify(mj, null, 2) + "\n");
  const left = skinFiles(OUT);
  if (left.length) throw new Error(`menu files left in the root: ${left.slice(0, 5).join(", ")}`);
  return moved;
}

module.exports = { rootClass2, routeSkin, skinFiles, isSkinRoot, SKIN_ID };
