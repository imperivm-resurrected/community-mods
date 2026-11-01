// The menu skin of a mod: its images (currentlang/*.bmp, ui/menu/*.bmp) stay at the game's paths, which is cosmetic: with several mods the content
// manager offers "Use the files of <mod>" and the player picks the skin. Its layout (data/interface/menu/*.ini: where the buttons go, which image is
// the background) becomes a patch of only the keys it changed, so that two skins add up instead of being "use only one".
// WHERE the patch goes matters: the engine applies a patch only if its path is exactly the one the game opens (src/mods/patch.cpp, PatchApply(rel)), and the
// game opens the menu INIs as menuini/<name>.ini (seen in the game log: "opens menuini/mainmenu.ini"), not as data/interface/menu/<name>.ini. Patches at
// patches/DATA/INTERFACE/MENU/ were never applied except template.ini, which the engine opens (and patches) under both names. So: every patch goes to
// patches/menuini/, and template.ini also to patches/DATA/INTERFACE/MENU/ (as the Mediterranevm 3.6 port does, seen working in game: "menuini/mainmenu.ini applied").
// LISTS: iniChanged only sees `Key = value` lines, but what a menu shows is decided by the lists of bare names ([MainMenu Objects]: Caption, IniBackFrame,
// TipsBackFrame, Version...). A skin that adds a panel to the list lost it (the 4.2 showed "Next" and "More Info" with no Tips panel, no frame behind the buttons
// and no "4.2"). listChanges() turns a changed list into -line for every line of the game's list and +line for every line of the mod's, in the mod's order
// (the patch language: "+Line adds a bare line if it isn't there", "-Line removes the line that is exactly that text", sdk/patches.md).
//   skinToPatches({ OUT, HD })     returns how many files became patches
const fs = require("fs"), path = require("path"), { iniChanged } = require("./ported-patch.js");
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
// the bare lines (no =, not a comment, not a header) of each section, in order: Map(section -> [raw line without CR])
const bareLists = text => { const m = new Map(); let sec = null; for (const raw of text.replace(/\r/g, "").split("\n")) { const h = raw.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; if (!m.has(sec)) m.set(sec, []); continue; } if (sec && raw.trim() && !/^\s*;/.test(raw) && !raw.includes("=")) m.get(sec).push(raw); } return m; };
// -> [{ sec, lines: ["-x", ..., "+y", ...] }] for every section whose list of bare names differs
function listChanges(hdText, modText) {
  const A = bareLists(hdText), B = bareLists(modText), out = [];
  for (const [sec, mod] of B) {
    const hd = A.get(sec) || [], same = hd.length === mod.length && hd.every((l, i) => l.trim() === mod[i].trim());
    if (!mod.length || same) continue;
    out.push({ sec, lines: [...hd.map(l => "-" + l.replace(/\s+$/, "")), ...mod.map(l => "+" + l.trim())] });
  }
  return out;
}
// the text of an iniChanged patch plus the list changes (a section that is in both gets the list lines inside it)
function withLists(r, lists) {
  if (!lists.length) return r;
  const blocks = []; let cur = null;
  for (const l of (r ? r.text : "").split(/\r?\n/)) { const h = l.match(/^\[([^\]]+)\]/); if (h) { cur = { sec: h[1], lines: [] }; blocks.push(cur); } else if (l && cur) cur.lines.push(l); }
  for (const { sec, lines } of lists) { const b = blocks.find(x => x.sec.toLowerCase() === sec.toLowerCase()); if (b) b.lines.push(...lines); else blocks.push({ sec, lines }); }
  return { text: blocks.map(b => `[${b.sec}]\r\n${b.lines.join("\r\n")}`).join("\r\n") + "\r\n", count: (r ? r.count : 0) + lists.length };
}
function skinToPatches({ OUT, HD }) {
  const mine = find(OUT, "DATA/INTERFACE/MENU"), hd = find(HD, "DATA/INTERFACE/MENU"); let n = 0;
  if (!mine || !hd) return 0;
  const hdFiles = new Map(fs.readdirSync(hd).map(f => [f.toLowerCase(), f]));
  for (const f of fs.readdirSync(mine).filter(f => /\.ini$/i.test(f))) {
    const h = hdFiles.get(f.toLowerCase()), p = path.join(mine, f);
    if (h) {
      const hdText = fs.readFileSync(path.join(hd, h), "latin1"), modText = fs.readFileSync(p, "latin1");
      const r = withLists(iniChanged(hdText, modText), listChanges(hdText, modText));
      if (r) {
        const dirs = [["patches", "menuini"], ...(/^template\.ini$/i.test(h) ? [["patches", "DATA", "INTERFACE", "MENU"]] : [])];
        for (const d of dirs) { const dst = path.join(OUT, ...d, h); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.writeFileSync(dst, r.text, "latin1"); }
        n++;
      }
      fs.rmSync(p);
    }
  }
  return n;
}
module.exports = { skinToPatches, listChanges, withLists };
