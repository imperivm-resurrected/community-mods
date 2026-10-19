// Wrap a Discord map/adventure (raw/discord-entries.json) or a forum topic (raw/forum-entries.json, downloaded by
// tools/download-forum.js) as an Imperivm Resurrected mod in ported/<slug>/
//   node tools/wrap-map.js [channel/]<slug> | forum/t<topic id> [--players "2-4 players"] [--no-redistributable]
// Nothing in the map changes, so the original author is the only author (no porter credit).
// .rar/.zip are unpacked with bsdtar: it is the system `tar` on Windows 10+ and macOS; on Linux install it
// (libarchive-tools / libarchive). BSDTAR=<path> overrides it.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith("--")) opt[args[i].slice(2)] = args[i + 1]?.startsWith("--") || i + 1 >= args.length ? true : args[++i]; else opt._ = args[i];
if (!opt._) { console.error('usage: node tools/wrap-map.js [channel/]<slug> | forum/t<id> [--players "4 players"] [--no-redistributable]'); process.exit(1); }

const slugify = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const discord = require("../raw/discord-entries.json");
// A forum topic: title without the [TAGS], files from raw/download-log.json, year from the first post (raw/forum.json, local)
const forumEntry = topic => {
  const t = require("../raw/forum-entries.json")[topic];
  if (!t) { console.error("not in raw/forum-entries.json: t" + topic); process.exit(1); }
  const dl = (() => { try { return require("../raw/download-log.json"); } catch { return {}; } })();
  const files = [...new Set(Object.values(dl).filter(v => v.key === "t" + topic).flatMap(v => v.files))]
    .map(local => ({ name: path.basename(local), local }));
  const title = t.title.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  const date = (() => { try { return require("../raw/forum.json")[topic]?.posts[0]?.date || ""; } catch { return ""; } })();
  let slug = slugify(title);
  if (discord.some(x => x.slug === slug)) slug += "-t" + topic; // same title as a Discord entry
  return { channel: "forum", slug, title, author: t.author, year: (date.match(/\b(19|20)\d\d\b/) || [""])[0],
    base: /\bHD\b/.test(t.title) ? "Imperivm HD" : "", desc: "", files, section: t.title };
};
const [want, chan] = opt._.split("/").reverse();
const found = chan === "forum" ? [forumEntry(want.replace(/^t/, ""))] : discord.filter(x => x.slug === want && (!chan || x.channel === chan));
if (found.length !== 1) { console.error(found.length ? `ambiguous, use channel/slug: ${found.map(x => x.channel + "/" + x.slug).join(" ")}` : `not found: ${opt._}`); process.exit(1); }
const e = found[0];
// a Discord entry with links instead of attachments: use what tools/download-forum.js got for its row
if (!e.files.length && e.channel !== "forum") {
  const pre = slugify(`${e.section.replace(/ IMPERIVM /, " ")} ${e.title}`); // row "[AVENTURAS II] TITLE (5 maps)"
  const hit = fs.existsSync(path.join(ROOT, "originals", "forum")) && fs.readdirSync(path.join(ROOT, "originals", "forum")).find(d => d === pre || d.startsWith(pre + "-"));
  // or the forum topic the post links to (downloaded as originals/forum/t<id>/)
  const topic = e.links.map(u => (u.match(/foroactivo\.com\/t(\d+)-/) || [])[1]).find(Boolean);
  const dir = hit ? path.join("originals", "forum", hit) : topic && path.join("originals", "forum", "t" + topic);
  if (dir && fs.existsSync(path.join(ROOT, dir, "files"))) e.files = fs.readdirSync(path.join(ROOT, dir, "files")).map(n => ({ name: n, local: path.join(dir, "files", n) }));
}
// --file <text>: only the downloads whose name has it (a forum topic often has several maps or versions)
if (opt.file) e.files = e.files.filter(f => f.name.toLowerCase().includes(String(opt.file).toLowerCase()));
if (!e.files.length) { console.error("nothing downloaded for", opt._); process.exit(1); }
const id = (e.channel === "saga-imperivm" ? "saga-" : "") + e.slug;
// forum topics: decided after unpacking, from the title or game.xml game_type (0 = skirmish map, 1/2 = adventure)
let isAdv = e.channel === "aventuras" || /AVENTURAS?|adventure/i.test(e.section);
const SMALL = new Set(["de", "del", "la", "las", "el", "los", "en", "y", "a", "por", "al", "un", "una", "con", "of", "the"]);
const titleCase = s => s.toLowerCase().split(/(\s+)/).map((w, i) => i && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))
  .join("").replace(/\b(i{1,3}|iv|vi{0,3}|ix|x{1,3})\b/gi, m => m.toUpperCase()).replace(/(\d)v(\d)/gi, "$1v$2");

// Lobby slots = playerdata entries a human can take (control="Both"/"Human"); the XML is stored uncompressed in the .bfhp.
// Checked against the lobby: El muro -> 6 ("Map for 6").
// The .bfhp always stores 16 playerdata (ids 0-15); only 0-7 are lobby slots (Imperivm II maps leave 8-15 set to Both).
const slots = f => {
  const s = fs.readFileSync(f, "latin1"), seen = new Set();
  let n = 0;
  for (let i = s.indexOf("<playerdata"); i >= 0; i = s.indexOf("<playerdata", i + 1)) {
    const blk = s.slice(i, i + 400).replace(/[^\x20-\x7e]/g, " ");
    const get = k => (blk.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1];
    const id = get("id");
    if (id == null || seen.has(id) || +id > 7) continue;
    seen.add(id);
    if (/^(Both|Human)$/.test(get("control") || "")) n++;
  }
  return n;
};
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
const CLASS_HEAD = /<class\b[^>]*>/g;
const classFiles = dir => { // class id (lowercase) -> "data/classes/x.sc.xml"
  const r = {};
  if (!fs.existsSync(dir)) return r;
  for (const f of fs.readdirSync(dir, { recursive: true })) if (/\.sc\.xml$/i.test(f))
    for (const m of fs.readFileSync(path.join(dir, f), "latin1").matchAll(CLASS_HEAD)) {
      const file = ("data/" + f).replace(/\\/g, "/").toLowerCase();
      // altid: the old name the engine still accepts (RWallsN has altid="Rwalls2", the Imperivm II name)
      for (const k of ["id", "altid"]) { const v = (m[0].match(new RegExp(`\\b${k}\\s*=\\s*"([^"]+)"`)) || [])[1]; if (v) r[v.toLowerCase()] = file; }
    }
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
  // forum-* = a mod downloaded from the forum but not ported to Resurrected yet: a map needing it has to wait
  return { mod: m, ported: !m.startsWith("forum-"), own: new Set(own), classes: new Set([...Object.keys(hdFiles).filter(c => !hidden.has(hdFiles[c])), ...own]) };
}).concat(!hdFiles ? [] : fs.readdirSync(path.join(ROOT, "ported")).filter(m => m !== id && fs.existsSync(path.join(ROOT, "ported", m, "data"))).map(m => {
  // our own class mods (e.g. imperivm1-legacy from tools/imperivm1.js): its id is in its mod.json
  const own = Object.keys(classFiles(path.join(ROOT, "ported", m, "data")));
  let modId = m;
  try { modId = JSON.parse(fs.readFileSync(path.join(ROOT, "ported", m, "mod.json"), "utf8")).id || m; } catch { /* folder name */ }
  return { mod: modId, ported: true, own: new Set(own), classes: new Set([...Object.keys(hdFiles), ...own]) };
}));
// Classes a map uses: placed objects (class="X") and classes its scripts create or look up (Place("X"...)). Parts of the
// .bfhp are LZ-compressed, which mangles some names ("GAxema718"): those show up once, a real unit several times, so an
// unknown placed name only counts if seen at least twice.
// extras/<id>/: files we add to a mod by hand (e.g. a class the map places under an old name), copied in as they are
const EXTRAS = path.join(ROOT, "extras", id);
const extraClasses = new Set(Object.keys(classFiles(path.join(EXTRAS, "data"))));
const usedClasses = f => {
  const s = fs.readFileSync(f, "latin1");
  const known = c => hdClasses.has(c.toLowerCase()) || extraClasses.has(c.toLowerCase()) || bigMods.some(m => m.own.has(c.toLowerCase()));
  const own = new Set([...s.matchAll(CLASS_ID)].map(m => m[1].toLowerCase())); // classes the map defines itself
  const seen = {};
  for (const m of s.matchAll(/\bclass="([A-Za-z_][\w.-]{0,60})"/g)) seen[m[1]] = (seen[m[1]] || 0) + 1;
  // script calls that create or look up objects by class; a bare string could be a character or group name ("Fisherman")
  for (const m of s.matchAll(/\b(?:Place|_PlaceEx|CreateFeedback|ClassPlayerObjs|ClassPlayerAreaObjs)\(\s*"([A-Za-z]\w{2,40})"/g)) if (known(m[1])) seen[m[1]] = (seen[m[1]] || 0) + 2;
  // a known class counts even once (heroes are unique); an unknown name needs 2 sightings (mangled names show up once)
  return Object.keys(seen).filter(c => (seen[c] >= 2 || known(c)) && !own.has(c.toLowerCase()));
};

const out = path.join(ROOT, "ported", id);
let dest = path.join(out, isAdv ? "adventures" : "scenarios");
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
  else if (/\.avi$/i.test(f)) { fs.mkdirSync(path.join(out, "movies"), { recursive: true }); fs.renameSync(p, path.join(out, "movies", path.basename(f))); } // intro/outro videos the adventure plays from Movies\\
  else fs.rmSync(p);
}
for (const f of fs.readdirSync(dest)) if (fs.statSync(path.join(dest, f)).isDirectory()) fs.rmSync(path.join(dest, f), { recursive: true });
// "Mapa..BFHP" (common typo) -> "Mapa.BFHP": the SDK rejects ".." in paths
for (const f of fs.readdirSync(dest)) if (f.includes("..")) fs.renameSync(path.join(dest, f), path.join(dest, f.replace(/\.{2,}/g, ".")));
let maps = fs.readdirSync(dest).filter(f => /\.bfhp$/i.test(f));
if (!maps.length) { console.error("no .bfhp in", e.files.map(f => f.name)); process.exit(1); }
// a map the HD game already ships (same bytes; copy Scenarios/ and Adventures/ of the game to originals/game-data/):
// nothing to port
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const HD = path.join(ROOT, "originals", "game-data");
const shipped = maps.filter(f => ["Scenarios", "Adventures"].some(d => fs.existsSync(path.join(HD, d)) && fs.readdirSync(path.join(HD, d))
  .some(g => g.toLowerCase() === f.toLowerCase() && md5(path.join(HD, d, g)) === md5(path.join(dest, f)))));
if (shipped.length === maps.length) { fs.rmSync(out, { recursive: true, force: true }); console.error(`already in the HD game: ${shipped.join(", ")}`); process.exit(3); }
// same file name as in another ported mod: with both enabled one would hide the other, so rename ours
const taken = new Set(fs.readdirSync(path.join(ROOT, "ported")).filter(m => m !== id)
  .flatMap(m => ["scenarios", "adventures"].flatMap(d => fs.existsSync(path.join(ROOT, "ported", m, d)) ? fs.readdirSync(path.join(ROOT, "ported", m, d)) : []))
  .map(f => f.toLowerCase()));
for (const f of maps.filter(f => taken.has(f.toLowerCase()))) {
  const to = f.replace(/(\.bfhp)$/i, ` (${id})$1`);
  fs.renameSync(path.join(dest, f), path.join(dest, to));
  for (const b of fs.readdirSync(dest).filter(b => b.toLowerCase() === f.replace(/\.bfhp$/i, ".bmp").toLowerCase()))
    fs.renameSync(path.join(dest, b), path.join(dest, to.replace(/\.bfhp$/i, path.extname(b))));
  console.log(`  renamed ${f} -> ${to} (another ported mod has that file name)`);
}
maps = fs.readdirSync(dest).filter(f => /\.bfhp$/i.test(f));
if (e.channel === "forum" && !isAdv && maps.some(f => /<properties[^>]*?\sgame_type="[12]"/.test(fs.readFileSync(path.join(dest, f), "latin1")))) {
  isAdv = true;
  fs.renameSync(dest, path.join(out, "adventures"));
  dest = path.join(out, "adventures");
}
const counts = maps.map(f => slots(path.join(dest, f))).filter(Boolean);
const used = hdClasses ? [...new Set(maps.flatMap(f => usedClasses(path.join(dest, f))))] : null;
const missing = used?.filter(c => !hdClasses.has(c.toLowerCase()) && !extraClasses.has(c.toLowerCase())) || []; // not in the HD game or extras/
// needs = the big mods that have every missing class; none -> the map needs a mod we don't have
const needs = missing.length ? bigMods.filter(m => missing.every(c => m.classes.has(c.toLowerCase()))).map(m => m.mod) : [];
const unknown = missing.length && !needs.length ? missing : [];
const waits = needs.length && !needs.some(m => bigMods.find(b => b.mod === m).ported) ? needs : []; // only unported mods have them
if (!waits.length) needs.splice(0, needs.length, ...needs.filter(m => bigMods.find(b => b.mod === m).ported));
// incompatible = big mods that hide (hidden.txt) a class of the HD game the map uses
const breaks = used ? bigMods.filter(m => !needs.includes(m.mod))
  .map(m => ({ mod: m.mod, lost: used.filter(c => hdClasses.has(c.toLowerCase()) && !m.classes.has(c.toLowerCase())) })).filter(x => x.lost.length) : [];
const PREFER = ["community-mod", "greek-civilization-mod", "caesar-mod"];
const lo = Math.min(...counts), hi = Math.max(...counts);
const players = opt.players || (counts.length ? (lo === hi ? `${lo} players` : `${lo}-${hi} players`) : null);

// the saga: the maps and adventures of Imperivm I and II that came with the games, collected by Ferónidas on Discord
const saga = e.channel === "saga-imperivm";
// a saga entry with an author is a community remake of the original (e.g. OskaOtzuna's Imperivm II adventures)
const author = saga ? e.author || "Haemimont Games" : e.author || "?";
const sagaGame = saga && (/ II$/.test(e.section) ? "Imperivm II" : "Imperivm I");
const desc = e.desc || (maps.length === 1 ? mapDesc(path.join(dest, maps[0])) : "");
const meta = saga ? (e.author ? `versión mejorada de la aventura de ${sagaGame} de Haemimont Games, recopilada por Ferónidas` : `${sagaGame}, recopilado por Ferónidas`) : [e.year, e.base].filter(Boolean).join(", ");
const metaEn = saga ? (e.author ? `improved version of the ${sagaGame} adventure by Haemimont Games, collected by Ferónidas` : `${sagaGame}, collected by Ferónidas`) : meta;
const what = isAdv ? "Aventura" : maps.length > 1 ? `${maps.length} mapas` : "Mapa";
const mod = {
  id,
  name: (saga ? `${sagaGame}: ` : "") + titleCase(e.title),
  version: "1.0",
  authors: saga ? [...(e.author ? [e.author] : []), "Haemimont Games", "FX Interactive"] : [author],
  description: {
    spanish: `${desc ? desc.replace(/([^.!?…])$/, "$1.") + " " : ""}${what} de ${author}${meta ? ` (${meta})` : ""}.`,
    english: `${what === "Aventura" ? "Adventure" : what === "Mapa" ? "Map" : maps.length + " maps"} by ${author}${metaEn ? ` (${metaEn})` : ""}.`,
  },
  category: isAdv ? "Campaigns" : "Maps",
  tags: isAdv ? ["Spanish"] : players ? [players] : [],
  // requires means "all of these": with several candidates, take one (the most used first)
  ...(needs.length ? { requires: [[...PREFER, ...needs].find(m => needs.includes(m))] } : {}),
  ...(breaks.length ? { incompatibleWith: breaks.map(b => b.mod) } : {}),
  redistributable: !opt["no-redistributable"], // publishing on GameBanana already redistributes it; false only if the author asks
};
if (fs.existsSync(EXTRAS)) fs.cpSync(EXTRAS, out, { recursive: true });
fs.writeFileSync(path.join(out, "mod.json"), JSON.stringify(mod, null, 2) + "\n");
// raw/ported.json: which entry each ported mod comes from (tools/sync-table.js uses it to update MODS.md)
const SRC = path.join(ROOT, "raw", "ported.json");
const src = (() => { try { return JSON.parse(fs.readFileSync(SRC, "utf8")); } catch { return {}; } })();
src[id] = opt._ + (opt.file ? ` --file ${opt.file}` : ""); // what to run to wrap it again
fs.writeFileSync(SRC, JSON.stringify(Object.fromEntries(Object.entries(src).sort()), null, 1) + "\n");
console.log(`${out}\n  ${maps.join(", ")} -> ${path.basename(dest)}/\n  category ${mod.category}, tags ${JSON.stringify(mod.tags)}${counts.length < maps.length ? "  ⚠️ some map has no readable players" : ""}${!isAdv && !players ? "  ⚠️ missing --players" : ""}`
  + (used === null ? "\n  ⚠️ compatibility not checked (no originals/game-data)" : unknown.length ? `\n  ❌ not in the HD game nor in a known mod: ${unknown.join(", ")}` : "")
  + (waits.length ? `\n  ⏳ blocked: needs ${waits.join(" or ")}, not ported to Resurrected yet (${missing.join(", ")})` : needs.length ? `\n  🧩 needs ${needs.join(" or ")} (${missing.join(", ")})${needs.length > 1 ? " -> requires " + mod.requires[0] : ""}` : "")
  + breaks.map(b => `\n  🚫 incompatible with ${b.mod} (hides ${b.lost.join(", ")})`).join(""));
// blocked (needs a mod not ported yet) or uses classes nobody has: report it, but leave nothing in ported/
if (waits.length || unknown.length) {
  fs.rmSync(out, { recursive: true, force: true }); process.exitCode = 2;
  const SRC = path.join(ROOT, "raw", "ported.json");
  let src = {};
  try { src = JSON.parse(fs.readFileSync(SRC, "utf8")); } catch { /* no list yet */ }
  delete src[id];
  fs.writeFileSync(SRC, JSON.stringify(src, null, 1) + "\n");
}
