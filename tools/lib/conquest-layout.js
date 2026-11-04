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
  // Start, Select and Quit are ABSOLUTE (Caesar's refer to left(Save)/left(Start)): the engine evaluates the formulas in the order of [ConquestGame Objects] and a control not created yet is 0.
  // HD's order is BackImage, GameMap, Start, Save, Quit, Select; Caesar's patch works only because it reorders the list (Save first), and this one does not (found in game 2026-11-03: Quit at 0,0).
  ["Start", ["RectWH = #%ScreenRight%-305#, #%Altezza%/2+200+44#, %ButtonWidth%, %ButtonHeight%"]],
  ["Select", ["RectWH = #%ScreenRight%-305#, #%Altezza%/2+200+44#, %ButtonWidth%, %ButtonHeight%"]],
  ["Quit", ["RectWH = #%ScreenRight%-305#, #%Altezza%/2+200+88#, %ButtonWidth%, %ButtonHeight%"]],
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
  // the RULE: a layout patch must not reference a control created later in the list (its value is 0 then). The patch is checked applied to HD's file and list, in the order of the list
  const fw = forwardRefs(hd, fs.readFileSync(f, "latin1"));
  if (fw.length) throw new Error(`conquest layout: forward references (a control used before it is created in [ConquestGame Objects]):\n  ${fw.map(x => `[${x.sec}] ${x.key} uses ${x.fn}(${x.ref}) (${x.why})`).join("\n  ")}`);
  return { sections: SECTIONS.length, from: old };
}

// ---- the check ------------------------------------------------------------------------------------------------------------------------------------------------------
const parse = t => { const m = new Map(); let cur = null; for (const raw of t.split(/\r?\n/)) { const l = raw.trim(); if (!l || l[0] === ";") continue; const h = /^\[([^\]]+)\]$/.exec(l); if (h) { cur = { name: h[1], keys: new Map(), lines: [] }; m.set(h[1].toLowerCase(), cur); continue; } if (!cur) continue; cur.lines.push(l); const k = /^([^=]+?)\s*=\s*(.*)$/.exec(l); if (k) cur.keys.set(k[1].toLowerCase(), k[2]); } return m; };
// forwardRefs(hdText, patchText) -> [{ sec, key, fn, ref, why }]: HD's file with the patch applied (the keys of its sections replace HD's; "-name"/"+name" lines of its [ConquestGame Objects] remove from the list / append to it, in order);
// for every section of the resulting list, every left/right/top/bottom/width/height(X) in its values must name a control that comes BEFORE it in the list.
function forwardRefs(hdText, patchText) {
  const H = parse(hdText), P = parse(patchText), key = "conquestgame objects";
  let list = (H.get(key) || { lines: [] }).lines.filter(l => !l.startsWith(";"));
  const pl = (P.get(key) || { lines: [] }).lines;
  for (const l of pl) if (l[0] === "-") list = list.filter(n => n.toLowerCase() !== l.slice(1).trim().toLowerCase());
  for (const l of pl) if (l[0] === "+") list.push(l.slice(1).trim());
  const pos = new Map(list.map((n, i) => [n.toLowerCase(), i])), out = [];
  list.forEach((n, i) => {
    const keys = new Map([...((H.get(n.toLowerCase()) || { keys: new Map() }).keys), ...((P.get(n.toLowerCase()) || { keys: new Map() }).keys)]);
    for (const [k, v] of keys) for (const m of v.matchAll(/\b(left|right|top|bottom|width|height)\(\s*([A-Za-z0-9_.]+)\s*\)/gi)) {
      const j = pos.get(m[2].toLowerCase());
      if (j === undefined) out.push({ sec: n, key: k, fn: m[1], ref: m[2], why: "not in the list" });
      else if (j >= i) out.push({ sec: n, key: k, fn: m[1], ref: m[2], why: j === i ? "itself" : `created later: ${j + 1} of ${list.length}, this one is ${i + 1}` });
    }
  });
  return out;
}
module.exports = { write, SECTIONS, forwardRefs };
