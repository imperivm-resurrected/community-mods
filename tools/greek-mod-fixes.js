// Greek Civilization Mod 4.2: what shrink-mod.js leaves broken in ported/greek-civilization-mod. Run after shrink-mod.js and the copy
// of extras/greek-civilization-mod/ (see its NOTES.md):
//   node tools/greek-mod-fixes.js
//
// Game modes. 4.2 replaced the game's five victory scripts ("1 ELIMINATION.VS" ... "5 ALTERNATIVE.VS") with nine of its own ("1 VARIOS.VS" ...
// "9 CUSTOM.VS") and kept its edited copies of the old five inside data.pak as ".VX", which nothing reads; the old pack also hid the
// game's. Most maps (the community's and 4.2's own, like 00_Ludus_Martis) say victory_condition="1 Elimination" (228 of the 415 maps
// here; a few say "3 Time limit (military rating)", "4 Time limit (score)" or "5 Alternative"): with that script hidden the game starts
// the map and goes back to the menu at once, with nothing in the log. So 4.2's copies of the five go in as .VS under the game's names and the
// game's are no longer hidden. The lobby lists them next to 4.2's own nine.
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const MOD = path.join(ROOT, "ported", "greek-civilization-mod");
const ZIP = path.join(ROOT, "originals", "gamebanana", "728851", "greekcivilizationmod42_ac8f2.zip");
const GS = path.join(MOD, "DATA", "GAMESCRIPTS");

// the .VX are inside Packs/data.pak ("HMMSYS PackFile": prefix-compressed names, then offset and size of each file)
const b = spawnSync("bsdtar", ["-xOf", ZIP, "Packs/data.pak"], { maxBuffer: 1 << 29 }).stdout;
const n = b.readUInt32LE(0x20);
let p = 0x28, prev = "", restored = 0;
for (let i = 0; i < n; i++) {
  const len = b[p], sh = b[p + 1];
  p += 2;
  const name = prev.slice(0, sh) + b.toString("latin1", p, p + len - sh);
  p += len - sh;
  const off = b.readUInt32LE(p), size = b.readUInt32LE(p + 4);
  p += 8;
  prev = name;
  const m = /^DATA\\GAMESCRIPTS\\([^\\]+)\.VX$/i.exec(name);
  if (m) { fs.writeFileSync(path.join(GS, `${m[1]}.VS`), b.subarray(off, off + size)); restored++; }
}
for (const f of fs.readdirSync(GS).filter(f => /\.VX$/i.test(f))) fs.rmSync(path.join(GS, f));
const hp = path.join(MOD, "hidden.txt");
const lines = fs.readFileSync(hp, "utf8").split(/\r?\n/);
const kept = lines.filter(l => !/^data\/gamescripts\/[1-5] [^/]*\.vs$/i.test(l.trim()));
fs.writeFileSync(hp, kept.join("\n"));
console.log(`game modes: ${restored} restored as .VS, ${lines.length - kept.length} lines out of hidden.txt`);
