// The English help (issue #54). HD's English language pack has no help.xml (only its Spanish and Italian packs do), so a skin that brings back the main
// menu's Help button opens nothing in English (log: "opens currentlang/help.xml -> does not exist"). The maintainer decided (2026-11-02) that a skin may ship
// Local/english/HELP.XML (HD English lacks it: nothing is replaced), never for Spanish or Italian and never at CURRENTLANG/.
//
// extras/english-help/HELP.XML is the ONE canonical file, shared by every port that ships it (Greek 4.2, AsvrMod VII): the same bytes, so those ports do not differ
// from each other. It is a model translation (UNREVIEWED, see extras/english-help/NOTES.md) of HD's own Spanish help (originals/game-data/local-spanish/CURRENTLANG/HELP.XML):
// the XML is the original's byte for byte (BOM, CRLF, tabs, ids, links, pictures, comments) and only the text inside <entry>...</entry> is English.
//
//   const { ship } = require("./lib/english-help.js");  ship(OUT)           copies it to OUT/Local/english/HELP.XML after verify() and the pack check
//   node tools/lib/english-help.js [--game <folder>]                          verify only (exit 1 on any problem)
//
// verify() stops on: a missing BOM or a non-CRLF line end, anything but the entry texts that differs from the Spanish file, a topic id list that differs from HD's
// Spanish and Italian, an `&` or `<` inside a text, a link that is not the Spanish file's, a leftover Spanish word list... (the last is only a warning).
const fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.join(__dirname, "..", "..");
const SRC = path.join(ROOT, "extras", "english-help", "HELP.XML");
const GD = path.join(ROOT, "originals", "game-data");
const ES = path.join(GD, "local-spanish", "CURRENTLANG", "HELP.XML"), IT = path.join(GD, "local-italian", "CURRENTLANG", "HELP.XML");
const gameDir = () => process.env.G || process.env.GAME || path.join(os.homedir(), ".local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD");

// the names inside one of the game's packs (HMMSYS pack index, as the SDK's extract-data.js reads it): lower case, forward slashes
function packNames(file) {
  const d = fs.readFileSync(file), c = d.readUInt32LE(0x20), out = new Set();
  let q = 0x28, prev = "";
  for (let i = 0; i < c; i++) { const len = d[q], sh = d[q + 1]; q += 2; const nm = prev.slice(0, sh) + d.toString("latin1", q, q + len - sh); q += len - sh + 8; prev = nm; out.add(nm.toLowerCase().replace(/\\/g, "/")); }
  return out;
}
const text = f => fs.readFileSync(f).toString("utf8");
const entry = /(<entry\b[^>]*?(?<!\/)>)([\s\S]*?)(<\/entry>)/g;   // not <entry .../> (self closing)
// the file with the text of every entry replaced by T (its leading and trailing white space stays): what must be the same in every language
const skeleton = s => s.replace(entry, (m, a, t, z) => a + (t.trim() ? t.slice(0, t.length - t.trimStart().length) + "T" + t.slice(t.trimEnd().length) : t) + z);
const ids = s => [...s.matchAll(/<topic\b[^>]*?\bid\s*=\s*"([^"]+)"/g)].map(m => m[1]);
const links = s => [...s.matchAll(/\blink\s*=\s*"([^"]*)"/g)].map(m => m[1]);
const pictures = s => [...s.matchAll(/\bimage\s*=\s*"([^"]+)"/g)].map(m => m[1]);

function verify(file = SRC) {
  const problems = [], raw = fs.readFileSync(file), en = raw.toString("utf8"), es = text(ES), it = text(IT);
  if (!(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf)) problems.push("no UTF-8 BOM (the original has one)");
  if (/(^|[^\r])\n/.test(en)) problems.push("a line end that is not CRLF");
  if (en.includes("\ufffd")) problems.push("a replacement character (bad encoding)");
  const a = skeleton(es), b = skeleton(en);
  if (a !== b) { let i = 0; while (a[i] === b[i]) i++; problems.push(`the structure is not the Spanish file's (first difference at byte ${i}: "${a.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, " ")}" vs "${b.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, " ")}")`); }
  const ie = ids(en), is = ids(es), ii = ids(it);
  if (ie.join("\n") !== is.join("\n")) problems.push("the topic ids are not the Spanish file's, in the same order");
  if (ii.join("\n") !== is.join("\n")) problems.push("HD's Italian help has other topic ids than the Spanish one (cross-check)");
  if (links(en).join("\n") !== links(es).join("\n")) problems.push("the links are not the Spanish file's");
  for (const m of en.matchAll(entry)) { if (/[<]|&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(m[2])) problems.push(`entry text with "<" or a bare "&": ${m[2].trim().slice(0, 60)}`); }
  // well formed: every tag opens and closes in order
  const stack = [];
  for (const m of en.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<(\/?)([A-Za-z][\w:-]*)\b[^>]*?(\/?)>/g)) {
    if (m[3]) continue;
    if (!m[1]) stack.push(m[2]); else if (stack.pop() !== m[2]) { problems.push(`not well formed near </${m[2]}>`); break; }
  }
  if (stack.length) problems.push(`not well formed: <${stack.pop()}> is never closed`);
  const spanish = [...en.matchAll(entry)].filter(m => /[¿¡ñ]|\b(el|la|los|las|del|para|con|una|por)\s+\w+/.test(m[2]) && !/^\s*$/.test(m[2])).length;
  const unresolved = new Set(links(es).filter(l => !is.includes(l) && !is.includes(l.replace(/\/+$/, "").split("/").pop())));
  return { problems, topics: ie.length, uniqueIds: new Set(ie).size, entries: [...en.matchAll(entry)].length, links: links(en).length, pictures: pictures(en).length, uniquePictures: new Set(pictures(en).map(p => p.toLowerCase())).size, linksNotTopics: [...unresolved], spanishLooking: spanish, bytes: raw.length };
}

// the picture names that the game's files (lower case, relative to its paks: ui/...; `extra` = a port's own files) do not have: HD's Spanish help has the same ones, they are not new.
// A name is looked up as written, under ui/, and with `gameres/` read as `ui/` (that is where HD keeps the skill, special and icon pictures the help names that way)
function pictureGaps(files, file = SRC) {
  const have = new Set(files), want = [...new Set(pictures(text(file)).map(p => p.replace(/\\/g, "/").replace(/^\//, "").toLowerCase()))];
  return want.filter(p => ![p, "ui/" + p, p.replace(/^gameres\//, "ui/")].some(q => have.has(q)));
}

// copies the canonical file to OUT/Local/english/HELP.XML if HD's English pack has no help.xml; stops the build otherwise or if verify() finds a problem
function ship(OUT, { game = gameDir() } = {}) {
  const r = verify();
  if (r.problems.length) throw new Error("extras/english-help/HELP.XML: " + r.problems.join("; "));
  const pak = path.join(game, "local", "english.pak");
  if (!fs.existsSync(pak)) throw new Error(`no ${pak}: set G=<the game's folder>`);
  if (packNames(pak).has("currentlang/help.xml")) throw new Error("HD's English pack now has its own help.xml: Local/english/HELP.XML would replace it, not add to it");
  const dest = path.join(OUT, "Local", "english", "HELP.XML");
  fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.rmSync(dest, { force: true }); fs.copyFileSync(SRC, dest);
  return { dest, ...r };
}
module.exports = { ship, verify, packNames, pictureGaps, SRC };

if (require.main === module) {
  const i = process.argv.indexOf("--game"), game = i > 0 ? process.argv[i + 1] : gameDir();
  const r = verify();
  console.log(`topics ${r.topics} (${r.uniqueIds} ids), entries ${r.entries}, links ${r.links}, pictures ${r.pictures} (${r.uniquePictures} distinct), ${r.bytes} bytes`);
  console.log(`links that are not a topic id (the same ones HD's Spanish help has): ${r.linksNotTopics.length}`);
  const pak = path.join(game, "local", "english.pak");
  console.log(fs.existsSync(pak) ? `HD's English pack has help.xml: ${packNames(pak).has("currentlang/help.xml")} (must be false)` : `no ${pak}: pack not checked`);
  const paks = path.join(GD, "paks"), all = [];
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else all.push(path.relative(paks, p).replace(/\\/g, "/").toLowerCase()); } };
  if (fs.existsSync(path.join(paks, "UI"))) {
    walk(path.join(paks, "UI"));
    const g = pictureGaps(all), gs = pictureGaps(all, ES), same = g.join("|") === gs.join("|");
    console.log(`pictures named that HD's UI does not have: ${g.length}; HD's Spanish help has ${gs.length} (${same ? "the same ones" : "NOT the same"})`);
    if (!same) { console.error("a picture HD's Spanish help does not lack"); process.exit(1); }
  }
  if (r.spanishLooking) console.log(`warning: ${r.spanishLooking} entries still look Spanish`);
  if (r.problems.length) { console.error("PROBLEMS:\n  " + r.problems.join("\n  ")); process.exit(1); }
  console.log("ok");
}
