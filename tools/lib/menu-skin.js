// The menu skin of a mod: its images (currentlang/*.bmp, ui/menu/*.bmp) stay at the game's paths, which is cosmetic: with several mods the content
// manager offers "Use the files of <mod>" and the player picks the skin. Its layout (data/interface/menu/*.ini: where the buttons go, which image is
// the background) becomes a patch of only the keys it changed, so that two skins add up instead of being "use only one".
// WHERE the patch goes matters: the engine applies a patch only if its path is exactly the one the game opens (src/mods/patch.cpp, PatchApply(rel)), and the
// game opens the menu INIs as menuini/<name>.ini (seen in the game log: "opens menuini/mainmenu.ini"), not as data/interface/menu/<name>.ini. Patches at
// patches/DATA/INTERFACE/MENU/ were never applied except template.ini, which the engine opens (and patches) under both names. So: every patch goes to
// patches/menuini/, and template.ini also to patches/DATA/INTERFACE/MENU/ (as the Mediterranevm 3.6 port does, seen working in game: "menuini/mainmenu.ini applied").
//   skinToPatches({ OUT, HD })     returns how many files became patches
const fs = require("fs"), path = require("path"), { iniChanged } = require("./ported-patch.js");
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
function skinToPatches({ OUT, HD }) {
  const mine = find(OUT, "DATA/INTERFACE/MENU"), hd = find(HD, "DATA/INTERFACE/MENU"); let n = 0;
  if (!mine || !hd) return 0;
  const hdFiles = new Map(fs.readdirSync(hd).map(f => [f.toLowerCase(), f]));
  for (const f of fs.readdirSync(mine).filter(f => /\.ini$/i.test(f))) {
    const h = hdFiles.get(f.toLowerCase()), p = path.join(mine, f);
    if (h) {
      const r = iniChanged(fs.readFileSync(path.join(hd, h), "latin1"), fs.readFileSync(p, "latin1"));
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
module.exports = { skinToPatches };
