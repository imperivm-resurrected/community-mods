// Wrap a Discord map/adventure (raw/discord-entries.json) as an Imperivm Resurrected mod in ported/<slug>/
//   node tools/wrap-map.js [channel/]<slug> [--players "2-4 players"] [--no-redistributable]
// Nothing in the map changes, so the original author is the only author (no porter credit).
// .rar/.zip are unpacked with bsdtar: it is the system `tar` on Windows 10+ and macOS; on Linux install it
// (libarchive-tools / libarchive). BSDTAR=<path> overrides it.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith("--")) opt[args[i].slice(2)] = args[i + 1]?.startsWith("--") || i + 1 >= args.length ? true : args[++i]; else opt._ = args[i];
if (!opt._) { console.error('usage: node tools/wrap-map.js [channel/]<slug> [--players "4 players"] [--no-redistributable]'); process.exit(1); }

const [want, chan] = opt._.split("/").reverse();
const found = require("../raw/discord-entries.json").filter(x => x.slug === want && (!chan || x.channel === chan));
if (found.length !== 1) { console.error(found.length ? `ambiguous, use channel/slug: ${found.map(x => x.channel + "/" + x.slug).join(" ")}` : `not found: ${opt._}`); process.exit(1); }
const e = found[0];
const id = (e.channel === "saga-imperivm" ? "saga-" : "") + e.slug;
const isAdv = e.channel === "aventuras" || /AVENTURAS/.test(e.section);
const SMALL = new Set(["de", "del", "la", "las", "el", "los", "en", "y", "a", "por", "al", "un", "una", "con", "of", "the"]);
const titleCase = s => s.toLowerCase().split(/(\s+)/).map((w, i) => i && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))
  .join("").replace(/\b(i{1,3}|iv|vi{0,3}|ix|x{1,3})\b/gi, m => m.toUpperCase()).replace(/(\d)v(\d)/gi, "$1v$2");

// Lobby slots = playerdata entries a human can take (control="Both"/"Human"); the XML is stored uncompressed in the .bfhp.
// Checked against the lobby: El muro -> 6 ("Map for 6").
const slots = f => (fs.readFileSync(f, "latin1").match(/control="(Both|Human)"/g) || []).length;
// The map's own description (game.xml <properties description="...">), used when the Discord post has none.
// Long texts are split across container blocks, so binary junk can follow: cut at the first control byte or
// run of spaces and, if cut, back off to the last full sentence. Editors saved UTF-8 or Latin-1: try UTF-8 first.
const XML = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
const mapDesc = f => {
  const m = fs.readFileSync(f, "latin1").match(/<properties[^>]*?\sdescription="([^"]*)"/);
  if (!m) return "";
  let raw = m[1];
  const cut = raw.search(/[\x00-\x09\x0b-\x1f]| {4,}/);
  if (cut >= 0) { raw = raw.slice(0, cut); const end = Math.max(...[".", "!", "?"].map(c => raw.lastIndexOf(c))); raw = end > 0 ? raw.slice(0, end + 1) : raw.trim() + "…"; }
  const u = Buffer.from(raw, "latin1").toString("utf8");
  return (u.includes("\ufffd") ? raw : u).replace(/&(#\d+|\w+);/g, (x, k) => k[0] === "#" ? String.fromCharCode(+k.slice(1)) : XML[k] ?? x)
    .replace(/\\n|\s+/g, " ").replace(/ +([,.!?])/g, "$1").trim()
    .replace(/^(Partida de estrategia|Partida de aventura|Scenario Game)$/i, ""); // editor defaults, not the author's
};
// Compatibility: Resurrected runs on the HD game, so a 1.40/1.56 map (or one made for a mod) breaks if it uses a class
// the HD data doesn't define. Needs originals/game-data (sdk/en: node tools/extract-data.js "<game>" originals/game-data).
// Big mods in originals/mods/<mod id>/ (their mod.json, hidden.txt and DATA/**/*.sc.xml) change that set: a mod's classes
// are HD's minus the files its hidden.txt hides, plus its own. A map needs a mod ("requires") if only that mod has a
// class it uses, and can't run with a mod ("incompatibleWith") if that mod hides a class it uses.
const CLASS_ID = /<class\b[^>]*?\bid\s*=\s*"([^"]+)"/g;
const classFiles = dir => { // class id (lowercase) -> "data/classes/x.sc.xml"
  const r = {};
  if (!fs.existsSync(dir)) return r;
  for (const f of fs.readdirSync(dir, { recursive: true })) if (/\.sc\.xml$/i.test(f))
    for (const m of fs.readFileSync(path.join(dir, f), "latin1").matchAll(CLASS_ID)) r[m[1].toLowerCase()] = ("data/" + f).replace(/\\/g, "/").toLowerCase();
  return r;
};
const DATA = path.join(ROOT, "originals", "game-data", "DATA"), MODS = path.join(ROOT, "originals", "mods");
const hdFiles = fs.existsSync(DATA) ? classFiles(DATA) : null;
const hdClasses = hdFiles && new Set(Object.keys(hdFiles));
const bigMods = !hdFiles || !fs.existsSync(MODS) ? [] : fs.readdirSync(MODS).map(m => {
  const dir = path.join(MODS, m), hiddenTxt = path.join(dir, "hidden.txt");
  const hidden = new Set(fs.existsSync(hiddenTxt) ? fs.readFileSync(hiddenTxt, "utf8").split(/\r?\n/)
    .map(l => l.trim().toLowerCase().replace(/\\/g, "/")).filter(l => l && !l.startsWith(";")) : []);
  const own = Object.keys(classFiles(path.join(dir, "DATA")));
  return { mod: m, own: new Set(own), classes: new Set([...Object.keys(hdFiles).filter(c => !hidden.has(hdFiles[c])), ...own]) };
});
// Classes a map uses: placed objects (class="X") and classes its scripts create or look up (Place("X"...)). Parts of the
// .bfhp are LZ-compressed, which mangles some names ("GAxema718"): those show up once, a real unit several times, so an
// unknown placed name only counts if seen at least twice.
const usedClasses = f => {
  const s = fs.readFileSync(f, "latin1");
  const known = c => hdClasses.has(c.toLowerCase()) || bigMods.some(m => m.own.has(c.toLowerCase()));
  const own = new Set([...s.matchAll(CLASS_ID)].map(m => m[1].toLowerCase())); // classes the map defines itself
  const seen = {};
  for (const m of s.matchAll(/\bclass="([A-Za-z_][\w.-]{0,60})"/g)) seen[m[1]] = (seen[m[1]] || 0) + 1;
  // script calls that create or look up objects by class; a bare string could be a character or group name ("Fisherman")
  for (const m of s.matchAll(/\b(?:Place|_PlaceEx|CreateFeedback|ClassPlayerObjs|ClassPlayerAreaObjs)\(\s*"([A-Za-z]\w{2,40})"/g)) if (known(m[1])) seen[m[1]] = (seen[m[1]] || 0) + 2;
  // a known class counts even once (heroes are unique); an unknown name needs 2 sightings (mangled names show up once)
  return Object.keys(seen).filter(c => (seen[c] >= 2 || known(c)) && !own.has(c.toLowerCase()));
};

const out = path.join(ROOT, "ported", id), dest = path.join(out, isAdv ? "adventures" : "scenarios");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const f of e.files) {
  const src = path.join(ROOT, f.local);
  if (/\.(rar|zip|7z)$/i.test(f.name)) execFileSync(process.env.BSDTAR || (process.platform === "linux" ? "bsdtar" : "tar"), ["-xf", src, "-C", dest]);
  else fs.copyFileSync(src, path.join(dest, f.name));
}
// flatten folders inside archives, keep only what the game reads next to a map
for (const f of fs.readdirSync(dest, { recursive: true })) {
  const p = path.join(dest, f);
  if (fs.statSync(p).isDirectory()) continue;
  if (/\.(bfhp|bmp)$/i.test(f)) { if (path.dirname(f) !== ".") fs.renameSync(p, path.join(dest, path.basename(f))); }
  else fs.rmSync(p);
}
for (const f of fs.readdirSync(dest)) if (fs.statSync(path.join(dest, f)).isDirectory()) fs.rmSync(path.join(dest, f), { recursive: true });
// "Mapa..BFHP" (common typo) -> "Mapa.BFHP": the SDK rejects ".." in paths
for (const f of fs.readdirSync(dest)) if (f.includes("..")) fs.renameSync(path.join(dest, f), path.join(dest, f.replace(/\.{2,}/g, ".")));
const maps = fs.readdirSync(dest).filter(f => /\.bfhp$/i.test(f));
if (!maps.length) { console.error("no .bfhp in", e.files.map(f => f.name)); process.exit(1); }
const counts = maps.map(f => slots(path.join(dest, f))).filter(Boolean);
const used = hdClasses ? [...new Set(maps.flatMap(f => usedClasses(path.join(dest, f))))] : null;
const missing = used?.filter(c => !hdClasses.has(c.toLowerCase())) || []; // not in the HD game
// needs = the big mods that have every missing class; none -> the map needs a mod we don't have
const needs = missing.length ? bigMods.filter(m => missing.every(c => m.classes.has(c.toLowerCase()))).map(m => m.mod) : [];
const unknown = missing.length && !needs.length ? missing : [];
// incompatible = big mods (other than the one it needs) that hide a class the map uses and would otherwise have
// (from the HD game or the mod it needs); classes nobody has are already reported as unknown
const available = c => hdClasses.has(c.toLowerCase()) || bigMods.some(m => needs.includes(m.mod) && m.own.has(c.toLowerCase()));
const breaks = used ? bigMods.filter(m => !needs.includes(m.mod))
  .map(m => ({ mod: m.mod, lost: used.filter(c => available(c) && !m.classes.has(c.toLowerCase())) })).filter(x => x.lost.length) : [];
const lo = Math.min(...counts), hi = Math.max(...counts);
const players = opt.players || (counts.length ? (lo === hi ? `${lo} players` : `${lo}-${hi} players`) : null);

const author = e.author || "?";
const desc = e.desc || (maps.length === 1 ? mapDesc(path.join(dest, maps[0])) : "");
const meta = [e.year, e.base].filter(Boolean).join(", ");
const what = isAdv ? "Aventura" : maps.length > 1 ? `${maps.length} mapas` : "Mapa";
const mod = {
  id,
  name: titleCase(e.title),
  version: "1.0",
  authors: [author],
  description: {
    spanish: `${desc ? desc.replace(/([^.!?])$/, "$1.") + " " : ""}${what} de ${author}${meta ? ` (${meta})` : ""}.`,
    english: `${what === "Aventura" ? "Adventure" : what === "Mapa" ? "Map" : maps.length + " maps"} by ${author}${meta ? ` (${meta})` : ""}.`,
  },
  category: isAdv ? "Campaigns" : "Maps",
  tags: isAdv ? ["Spanish"] : players ? [players] : [],
  ...(needs.length === 1 ? { requires: needs } : {}),
  ...(breaks.length ? { incompatibleWith: breaks.map(b => b.mod) } : {}),
  redistributable: !opt["no-redistributable"], // publishing on GameBanana already redistributes it; false only if the author asks
};
fs.writeFileSync(path.join(out, "mod.json"), JSON.stringify(mod, null, 2) + "\n");
console.log(`${out}\n  ${maps.join(", ")} -> ${path.basename(dest)}/\n  category ${mod.category}, tags ${JSON.stringify(mod.tags)}${counts.length < maps.length ? "  ⚠️ some map has no readable players" : ""}${!isAdv && !players ? "  ⚠️ missing --players" : ""}`
  + (used === null ? "\n  ⚠️ compatibility not checked (no originals/game-data)" : unknown.length ? `\n  ❌ not in the HD game nor in a known mod: ${unknown.join(", ")}` : "")
  + (needs.length ? `\n  🧩 needs ${needs.join(" or ")} (${missing.join(", ")})` : "")
  + breaks.map(b => `\n  🚫 incompatible with ${b.mod} (hides ${b.lost.join(", ")})`).join(""));
