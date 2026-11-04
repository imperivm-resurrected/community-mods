// The lobby information pages of Community Mod 12: UI/MENU/B1F..B10F.BMP (5790x1572, three frames of 1930; the mod's "General changes" pages that MPCHAT.INI shows), one set per language in
// the rar's Local/<language>.pak. They go to OUT/Local/<language>/UI/MENU/ (= currentlang/UI/MENU/ of that language), so that each player sees the pages of the language he chose.
//   pages({ SRC, SDK, SCRATCH, OUT, langs, transform, after })  -> [{ lang, files, bytes, stats, post }]   `transform(file)` (optional) is applied to each page after it is copied and returns its stats
const fs = require("fs"), path = require("path");
const { extractPak, walk, rmDir } = require("./community-pak.js");
const rel = (root, p) => path.relative(root, p).replace(/\\/g, "/");
function pages({ SRC, SDK, SCRATCH, OUT, langs, transform, after }) {
  const loc = fs.readdirSync(SRC).find(d => d.toLowerCase() === "local"), done = [];
  if (!loc) { console.error("no Local/ in the mod"); process.exit(1); }
  for (const lang of langs) {
    const pak = fs.readdirSync(path.join(SRC, loc)).find(f => f.toLowerCase() === `${lang}.pak`); if (!pak) { console.error(`no Local/${lang}.pak`); process.exit(1); }
    const out = extractPak({ pakFile: path.join(SRC, loc, pak), SDK, SCRATCH, out: path.join(SCRATCH, "cm-pages-" + lang), filter: "MENU\\B", pak: `${lang}.pak` });
    const files = walk(out).filter(f => /^UI\/MENU\/B(10|[1-9])F\.BMP$/i.test(rel(out, f))).sort();
    if (files.length !== 10) { console.error(`Local/${lang}.pak: ${files.length} pages of the lobby, 10 expected`); process.exit(1); }
    const dest = path.join(OUT, "Local", lang, "UI", "MENU"); fs.mkdirSync(dest, { recursive: true });
    const stats = [];
    for (const f of files) { const d = path.join(dest, path.basename(f).toUpperCase()); fs.rmSync(d, { force: true }); fs.copyFileSync(f, d); if (transform) stats.push(transform(d)); }
    const bytes = walk(dest).reduce((n, f) => n + fs.statSync(f).size, 0); rmDir(out); const post = after ? after(dest, lang) : null;     // `after(folder, lang)` (optional): a step over the ten pictures of one language, once they are all copied and transformed
    done.push({ lang, files: files.length, bytes, stats, post });
  }
  return done;
}
module.exports = { pages };
