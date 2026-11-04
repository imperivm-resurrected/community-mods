// The conquest screen's layout, as a patch of ONLY the keys that place things (no list lines, no pictures, no shields).
// The 2.3's own CONQUESTGAME.INI is the 1.40's layout with a map moved to the left and a ShieldsFrame 1024 wide; with it the shields strip draws two shields over each other
// (found in game 2026-11-03; a bisect of 7 conquests with the same layout all failed, and with the patch deleted HD's layout showed it right: the cause is in this patch,
// not in the data). HD's own layout leaves the info frame over the Greek territory (x 1097..1445 at 1920x1080), so the layout is the one Caesar Mod 1.1.0 ships
// (PR #49, its panel at the screen's right edge, tools/caesar-mod.js + tools/lib/caesar-menu.js, `raw/caesar-mod-civs-conquest-layout.md`: Greece covered 0 px of 8916).
// The numbers are copied from the patch that Caesar Mod ships (patches/menuini/CONQUESTGAME.INI, the Key = value lines of its layout sections), written here so this stack does not depend on
// that branch or on its tools. HD's list of objects stays as it is (no "-"/"+" lines) and the section names are HD's.
const fs = require("fs"), path = require("path");
const SECTIONS = [
  ["Save", ["RectWH = #%ScreenRight%-305#, #%Altezza%/2+200#, %ButtonWidth%, %ButtonHeight%"]],
  ["Start", ["RectWH = #left(Save)#, #bottom(Save)+6#, %ButtonWidth%, %ButtonHeight%"]],
  ["Select", ["RectWH = #left(Save)#, #bottom(Save)+6#, %ButtonWidth%, %ButtonHeight%"]],
  ["Quit", ["RectWH = #left(Start)#, #bottom(Start)+6#, %ButtonWidth%, %ButtonHeight%"]],
  ["DescriptionFrame", ["RectWH = #left(Save)-20#, #%Altezza%/2-346#, 325, 520"]],
  ["DescriptionTitle", ["RectWH = #left(DescriptionFrame)+20#, #top(DescriptionFrame)+14#, 280, 22", "Width = 280"]],
  ["DescriptionText", ["RectWH = #left(DescriptionFrame)+20#, #bottom(DescriptionTitle)+4#, 280, 258", "Width = 280"]],
  ["BonusTitle", ["RectWH = #left(DescriptionFrame)+20#, #bottom(DescriptionText)+14#, 280, 22", "Width = 280"]],
  ["BonusText", ["RectWH = #left(DescriptionFrame)+20#, #bottom(BonusTitle)+4#, 280, 102", "Width = 280"]],
  ["LegendTitle", ["RectWH = #left(DescriptionFrame)+20#, #top(DescriptionText)#, 280, 22", "Width = 280"]],
  ["DescriptionText.ScrollUp", ["RectWH = #right(DescriptionFrame)-27#, #top(DescriptionText)#, 18, 18"]],
  ["BonusText.ScrollUp", ["RectWH = #right(DescriptionFrame)-27#, #top(BonusText)#, 18, 18"]],
  ["SelectStartAreaText", ["RectWH = #left(DescriptionFrame)+15#, #top(BonusText)#, 280, 22", "Width = 280"]],
  ["SelectStartAreaTextDesc", ["RectWH = #left(DescriptionFrame)+15#, #bottom(SelectStartAreaText)+4#, 280, 102", "Width = 280"]],
  ["DifficultyTypeText", ["RectWH = #left(DescriptionFrame)+30#, #bottom(BonusText)+24#, 100, 25"]],
  ["DifficultyType", ["RectWH = #right(DifficultyTypeText)+10#, #top(DifficultyTypeText)-2#, 120, 80"]],
  ["ShieldsFrame", ["RectWH = #left(GameMap)+30#, #top(DescriptionFrame)#, 582, 90"]],
];
// replaces the port's patch of the conquest screen with the layout only -> { sections, from: lines of the one it replaced }
function write({ OUT, HD }) {
  const f = path.join(OUT, "patches", "menuini", "CONQUESTGAME.INI"), old = fs.existsSync(f) ? fs.readFileSync(f, "latin1").split(/\r?\n/).length : 0;
  fs.rmSync(path.join(OUT, "patches", "DATA", "INTERFACE", "MENU", "CONQUESTGAME.INI"), { force: true });
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true });
  fs.writeFileSync(f, SECTIONS.map(([s, l]) => `[${s}]\r\n${l.join("\r\n")}\r\n`).join(""), "latin1");
  // every section must exist in HD's file, and every name an expression uses (GameMap, Save...) too: otherwise the patch would add a section the game lacks
  const hd = fs.readFileSync(path.join(HD, "DATA", "INTERFACE", "MENU", "CONQUESTGAME.INI"), "latin1"), have = new Set([...hd.matchAll(/^\[([^\]]+)\]/gm)].map(m => m[1].toLowerCase()));
  const bad = SECTIONS.map(([s]) => s).filter(s => !have.has(s.toLowerCase())).concat(["GameMap", "ShieldsFrame"].filter(s => !have.has(s.toLowerCase())));
  if (bad.length) throw new Error(`conquest layout: HD's CONQUESTGAME.INI has no section ${[...new Set(bad)].join(", ")}`);
  return { sections: SECTIONS.length, from: old };
}
module.exports = { write, SECTIONS };
