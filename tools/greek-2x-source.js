// The source of tools/greek-2x.js: a Greek Mod 2.x standalone game folder (a 1.40 game with `zGreek.pak` over `data.pak`, its own `rle.mmp`, `gbr.exe`...)
// laid out as the loose-file folder tools/port-140.js reads, and HD + the mod merged into ported/<id>:
//   node tools/greek-2x-source.js <2.3|2.5.3|2.6.1>     then   node tools/greek-2x.js <version>
// Everything goes to work/ (git-ignored; nothing is written under originals/):
//   work/greek-<v>-full/   the game folder as the download has it (a .zip is unpacked with bsdtar; the 2.5.3 is an Inno Setup installer that innoextract 1.9
//                          cannot read ("unexpected setup loader revision": it is 6.5): it is run silently under wine in a throwaway prefix)
//   work/greek-<v>-raw/    tools/flatten-paks.js: the packages in name order (the greater name wins: zGreek.pak over data.pak), the loose files over them
//   work/greek-<v>-flat/   the same, without the files byte-identical to Imperivm Legacy's (2.5.3 and 2.6.1: extras/<id>/legacy-left-out.txt)
// The executables, DLLs, the launcher and the installer's uninstaller are left out by flatten-paks.js: a mod cannot ship them (NOTES.md says what they did).
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { ROOT, WORK, VERSIONS } = require("./lib/greek-2x-versions.js");
const VER = process.argv[2], V = VERSIONS[VER];
if (!V) { console.error("usage: node tools/greek-2x-source.js <" + Object.keys(VERSIONS).join("|") + ">"); process.exit(1); }
const run = (cmd, args, opt = {}) => { const r = cp.spawnSync(cmd, args, { stdio: "inherit", ...opt }); if (r.status) { console.error(`${cmd} ${args.join(" ")} failed (${r.status})`); process.exit(1); } };
const FULL = path.join(WORK, `${V.work}-full`), RAW = path.join(WORK, `${V.work}-raw`), FLAT = path.join(WORK, `${V.work}-flat`), OUT = path.join(ROOT, "ported", V.dir), SRC = path.join(ROOT, V.download);
const GAME = V.inner ? path.join(FULL, V.inner) : FULL;
fs.mkdirSync(WORK, { recursive: true });
if (!fs.existsSync(SRC)) { console.error(`no ${SRC}: see extras/${V.dir}/NOTES.md (Source)`); process.exit(1); }
// 1. the game folder
if (!fs.existsSync(GAME)) {
  fs.mkdirSync(FULL, { recursive: true });
  if (/\.zip$/i.test(SRC)) run("bsdtar", ["-xf", SRC, "-C", FULL]);
  else {
    const prefix = path.join(WORK, `wine-${V.work}`);
    // Z:\ is the root of the Linux file system under wine
    run("wine", [SRC, "/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART", "/SP-", `/DIR=Z:${GAME.replace(/\//g, "\\")}`], { env: { ...process.env, WINEPREFIX: prefix, WINEDEBUG: "-all", WINEDLLOVERRIDES: "mscoree,mshtml=d" } });
    fs.rmSync(prefix, { recursive: true, force: true });
  }
}
// 2. the flat folder: work/<v>-raw is what the download has; work/<v>-flat is what port-140.js reads. They differ only by the files that are left out because
// they are byte-identical to Imperivm Legacy's (extras/<id>/legacy-left-out.txt, made by tools/greek-2x-legacy.js): a file the 2.3 has too is replaced by the
// 2.3's (the earlier version of the same file), one that is new is dropped.
fs.rmSync(RAW, { recursive: true, force: true }); fs.rmSync(FLAT, { recursive: true, force: true });
run("node", [path.join(__dirname, "flatten-paks.js"), GAME, RAW]);
for (const f of ["dxwrapper.ini", "unins000.dat"]) fs.rmSync(path.join(RAW, f), { force: true });
fs.symlinkSync(path.join(GAME, "rle.mmp"), path.join(RAW, "rle.mmp"));                    // port-140.js reads the mod's sprites from it
run("cp", ["-al", RAW, FLAT]);                                                              // hard links: the replacements below remove the file first
{
  const list = path.join(ROOT, "extras", V.dir, "legacy-left-out.txt");
  if (V.legacyLeft && fs.existsSync(list)) {
    const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { const n = fs.existsSync(p) && fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
    const base23 = path.join(WORK, "greek-2-3-raw");
    let dropped = 0, replaced = 0;
    for (const rel of fs.readFileSync(list, "utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#"))) {
      const mine = find(FLAT, rel); if (!mine) { console.error(`${rel}: not in ${FLAT}`); process.exit(1); }
      fs.rmSync(mine);
      const old = fs.existsSync(base23) && find(base23, rel);
      if (old) { fs.copyFileSync(old, mine); replaced++; } else dropped++;
    }
    console.log(`Legacy: ${dropped} files dropped, ${replaced} replaced by the 2.3's`);
  }
}
// 2b. the voices of each language pack: flatten-paks.js merges only Local\spanish.pak, so the English and Italian recordings (other takes, 44.1 kHz 16 bit against
// the Spanish pack's 22 kHz 8 bit) never reached the port. work/<v>-lang/<language>/CURRENTLANG/VOICES is what greek-2x.js reads (czech.pak is not a language of the game).
{
  const LANG = path.join(WORK, `${V.work}-lang`), SDK = process.env.SDK || path.join(__dirname, "..", "..", "imperivm-resurrected", "sdk");
  fs.rmSync(LANG, { recursive: true, force: true });
  const local = fs.readdirSync(GAME).find(f => /^local$/i.test(f));
  for (const pak of local ? fs.readdirSync(path.join(GAME, local)).filter(f => /^(english|spanish|italian)\.pak$/i.test(f)) : []) {
    const g = path.join(LANG, `_pkg-${pak}`), out = path.join(LANG, pak.replace(/\.pak$/i, "").toLowerCase());
    fs.mkdirSync(path.join(g, "Packs"), { recursive: true }); fs.copyFileSync(path.join(GAME, local, pak), path.join(g, "Packs", pak));
    run("node", [path.join(SDK, "tools", "extract-data.js"), g, out, pak]); fs.rmSync(g, { recursive: true, force: true });
  }
}
// 3. HD + the mod
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
run("node", [path.join(__dirname, "port-140.js"), FLAT, OUT, "--id", V.dir, "--name", V.name, "--version", V.version, "--category", "Civilizations"]);
console.log(`next: node tools/greek-2x.js ${VER}`);
