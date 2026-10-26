// Greek Civilization Mod 4.2: the source of tools/greek-4-2.js, from Gabbo's package (GameBanana 731819, "Greek Civilization Mod - Original",
// greekmod_42_completa_<date>.zip). The package is a standalone distribution: it ships a fork of the engine (winmm.dll, steam_api.dll, an Extra menu...) next
// to the mod's own folder, `mods/GreekMod-4.2-Resurrected`, which is what this takes. Usage:
//   node tools/greek-4-2-source.js [--zip <package.zip>] [--out <folder>] [--game <HD game folder>] [--keep-from <old source folder>] [--force]
// Writes originals/greek-4-2-pristine-731819 (the port's source: tools/greek-4-2.js reads it). What it does to the mod's folder:
//   - leaves out what only works with the fork or with the old engine's tricks: its variant civilizations (civs/, ours are made by greek-4-2.js), the Extra menu
//     (patches/menuini, mod/), the editor free play (loc/, the marker in the modes' scripts), update.xml, the .vx copies of the game's victory scripts,
//     local/czech (English voices under Czech names) and rules/game.json (global: greek-4-2.js writes its own, scoped to this port's classes, see NOTES.md)
//   - keeps modes/*.json (greek-4-2.js rewrites the civilizations of Old school with the ids of this port)
//   - the music identical to the game's is left out; the three sounds the package replaced with one file (stamina_boost, townhall healing, townhall refreshment)
//     are the old source's (--keep-from)
//   - what tools/greek-mod-fixes.js does (misspelled ids as altid, the victory scripts the old pack hid, 00_Ludus_Martis of the Community Mod)
// The mod.json and the civilizations' base declaration (civs/greek.json) are extras/greek-civilization-mod/'s.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const ZIP = path.resolve(arg("--zip", path.join(ROOT, "originals", "gamebanana", "731819", "greekmod_42_completa_20261026_c205a.zip")));
const OUT = path.resolve(arg("--out", path.join(ROOT, "originals", "greek-4-2-pristine-731819")));
const GAME = arg("--game", process.env.G || path.join(process.env.HOME || "", ".local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"));
const KEEP = path.resolve(arg("--keep-from", path.join(ROOT, "originals", "greek-4-2-pristine")));
const INNER = "mods/GreekMod-4.2-Resurrected";
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const at = (base, rel) => { let p = base; for (const part of rel.split("/")) { const n = ci(p, part); if (!n) return null; p = path.join(p, n); } return p; };
const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };

if (!fs.existsSync(ZIP)) { console.error(`no ${ZIP}: download GameBanana 731819 (docs/PORTING.md, step 2)`); process.exit(1); }
if (fs.existsSync(OUT)) {
  if (!process.argv.includes("--force")) { console.error(`${OUT} exists: pass --force to replace it`); process.exit(1); }
  fs.rmSync(OUT, { recursive: true, force: true });
}
fs.mkdirSync(OUT, { recursive: true });
const x = cp.spawnSync("bsdtar", ["-xf", ZIP, "-C", OUT, "--strip-components=2", INNER], { stdio: "inherit" });
if (x.status !== 0) { console.error(`bsdtar could not read ${INNER} in ${ZIP}`); process.exit(1); }
console.log(`${INNER}: ${walk(OUT).length} files from ${path.basename(ZIP)}`);

// 1. what is not the mod's civilizations': the fork, the old engine's variants
const dropped = [];
const drop = rel => { const p = at(OUT, rel); if (p) { fs.rmSync(p, { recursive: true, force: true }); dropped.push(rel); } };
// local/czech: its 22 files are English voices of other units copied under Czech names (the package's own asset plan says so), not a translation
for (const rel of ["civs", "rules", "mod", "update.xml", "loc", "patches/menuini", "local/czech"]) drop(rel);
{
  const gs = at(OUT, "data/gamescripts");
  for (const f of gs ? fs.readdirSync(gs).filter(f => /\.vx$/i.test(f)) : []) { fs.rmSync(path.join(gs, f)); }
  if (gs) dropped.push("data/gamescripts/*.vx");
}
// the editor free play marker: only the fork sets it (an unset key reads 0, so the scripts ran as they do here), and the Old school check has to read as the
// game's own for tools/greek-4-2.js to find it
{
  const gs = at(OUT, "data/gamescripts"); let n = 0;
  for (const f of gs ? fs.readdirSync(gs).filter(f => /\.vs$/i.test(f)) : []) {
    const p = path.join(gs, f), t0 = rd(p);
    const t = t0.replace(/(?:\/\/ Editor Test Play[^\r\n]*\r?\n)?if \(EnvReadInt\("\/GreekMod\/EditorFreePlay"\) == 1\) return;\r?\n(?:\r?\n)?/g, "")
      .replace(/if \(EnvReadInt\("\/GreekMod\/EditorFreePlay"\) != 1 &&\s*(\(nRace[^\r\n]*\))\)/g, "if $1");
    if (t !== t0) { wr(p, t); n++; }
  }
  const left = walk(OUT).filter(f => /\.(vs|xml|ini)$/i.test(f) && rd(f).includes("/GreekMod/"));
  console.log(`editor free play marker out of ${n} game mode scripts${left.length ? "; STILL IN: " + left.map(f => path.relative(OUT, f)).join(", ") : ""}`);
}
// music the game already has, byte for byte
{
  const mine = at(OUT, "music"), theirs = GAME && at(GAME, "Music");
  let n = 0;
  if (mine && theirs) for (const f of fs.readdirSync(mine)) { const g = ci(theirs, f); if (g && fs.statSync(path.join(mine, f)).size === fs.statSync(path.join(theirs, g)).size && fs.readFileSync(path.join(mine, f)).equals(fs.readFileSync(path.join(theirs, g)))) { fs.rmSync(path.join(mine, f)); n++; } }
  console.log(theirs ? `music identical to the game's: ${n} files left out` : `no game folder (--game, or G): the music is not compared with the game's`);
}

// 2. the three sounds the package replaced with a single file: the old source's
{
  let n = 0;
  for (const rel of ["sounds/effects/stamina_boost.wav", "sounds/notifications/townhall healing.wav", "sounds/notifications/townhall refreshment.wav"]) {
    const from = at(KEEP, rel), to = at(OUT, rel);
    if (from && to) { fs.rmSync(to); fs.copyFileSync(from, to); n++; } else console.log(`  ${rel}: not in ${fs.existsSync(KEEP) ? "both sources" : "the old source (" + KEEP + " is missing): the package's stays"}`);
  }
  console.log(`sounds: ${n} of 3 are the old source's`);
}

// 3. the port's own declarations and what greek-mod-fixes.js leaves right
{
  const EX = path.join(ROOT, "extras", "greek-civilization-mod");
  fs.mkdirSync(path.join(OUT, "civs"), { recursive: true });
  for (const f of fs.readdirSync(path.join(EX, "civs"))) fs.copyFileSync(path.join(EX, "civs", f), path.join(OUT, "civs", f));
  fs.rmSync(path.join(OUT, "mod.json"), { force: true });
  fs.copyFileSync(path.join(EX, "mod.json"), path.join(OUT, "mod.json"));
  // the credits and the Caesar Mod's license: what the package took from the Caesar Mod is CC BY-SA 4.0 and has to travel with the mod
  fs.mkdirSync(path.join(OUT, "Licenses"), { recursive: true });
  for (const f of fs.readdirSync(path.join(EX, "Licenses"))) fs.copyFileSync(path.join(EX, "Licenses", f), path.join(OUT, "Licenses", f));
  console.log(`extras: mod.json, the credits and licenses, and ${fs.readdirSync(path.join(EX, "civs")).length} declarations of civilizations`);
}
const fx = cp.spawnSync(process.execPath, [path.join(__dirname, "greek-mod-fixes.js"), OUT], { stdio: "inherit" });
if (fx.status !== 0) { console.error("greek-mod-fixes.js failed"); process.exit(1); }
console.log(`left out: ${dropped.join(", ")}\nsource: ${OUT}`);
