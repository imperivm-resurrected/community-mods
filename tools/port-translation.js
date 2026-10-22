// A mod's translation made for 1.40 (its own CURRENTLANG/GAME.LOC.XML in another language) -> a loc/<language>.loc.xml for Resurrected,
// with only the texts it really translated: the ones that differ from the mod's own file, which is the language the mod ships.
//   node tools/port-translation.js <translation GAME.LOC.XML> <the mod's own GAME.LOC.XML> <out loc file> [--stats]
// Both files have the same <translationtableentry text= context= result=> lines (the English text is the key); a line whose result is the
// same as the mod's, or empty, was not translated (work in progress) and is left out: the game shows the base language for it.
const fs = require("fs");
const [tr, own, out] = process.argv.slice(2);
if (!tr || !own || !out) { console.error("usage: node tools/port-translation.js <translation GAME.LOC.XML> <mod's own GAME.LOC.XML> <out loc file>"); process.exit(1); }
const read = f => {
  const t = new TextDecoder("utf-8", { fatal: true }).decode(fs.readFileSync(f)); // the 1.40 files are UTF-8
  const m = new Map();
  for (const [, a] of t.matchAll(/<translationtableentry\b([^>]*?)\/>/g)) {
    const at = k => (a.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1];
    m.set(`${at("text")}\u0000${at("context") || ""}`, { text: at("text"), context: at("context") || "", result: at("result") ?? "" });
  }
  return m;
};
const a = read(tr), b = read(own);
const keep = [...a].filter(([k, e]) => e.result.trim() && e.result !== b.get(k)?.result);
const lines = keep.map(([, e]) => `  <translationtableentry text="${e.text}"${e.context ? ` context="${e.context}"` : ""} result="${e.result}"/>`);
fs.mkdirSync(require("path").dirname(out), { recursive: true });
fs.writeFileSync(out, `<translationtable>\n${lines.join("\n")}\n</translationtable>\n`);
console.log(`${keep.length} of ${a.size} texts translated -> ${out}` + (a.size - keep.length ? ` (${a.size - keep.length} left to the base language: same as the mod's own or empty)` : ""));
