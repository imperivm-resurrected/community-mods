// Wrap a Discord map/adventure (raw/discord-entries.json) or a forum topic (raw/forum-entries.json, downloaded by
// tools/download-forum.js) as an Imperivm Resurrected mod in ported/<slug>/
//   node tools/wrap-map.js [channel/]<slug> | forum/t<topic id> | it/<key> | pack:<pack>/<map> [--players "2-4"] [--file <text>] [--add <entry>[:<text>]] [--adventure] [--title <name>] [--desc <text>]
//                                                                 [--author "A; B"] [--lang Italian] [--version 1.1] [--no-redistributable]
// pack:<pack>/<map>: one map of a pack we downloaded (originals/forum/<pack>/files/*.zip, e.g. pack:greek-mod-maps-and-adventures-pack/Adventures/X.BFHP).
// Only that map, its preview and the videos it plays are unpacked. A pack has no post to take the author from: --author is required
// (several credits separated by ";"). --lang is the language of the pack's adventures ("Italian", "English,Italian"; default Italian).
// --add pack:<...> next to an entry that has the same adventure in another language (e.g. forum/t1300 --add pack:<pack>/La Rivolta ...):
// both go in one mod and the pack's edition is called "<name> (Italiano)" in the game's list.
// Nothing in the map changes, so the original author is the only author (no porter credit).
// .rar/.zip are unpacked with bsdtar: it is the system `tar` on Windows 10+ and macOS; on Linux install it
// (libarchive-tools / libarchive). BSDTAR=<path> overrides it.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2), opt = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith("--")) opt[args[i].slice(2)] = args[i + 1]?.startsWith("--") || i + 1 >= args.length ? true : args[++i]; else opt._ = args[i];
if (!opt._) { console.error('usage: node tools/wrap-map.js [channel/]<slug> | forum/t<id> [--players "2-4"] [--no-redistributable]'); process.exit(1); }

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
// pack:<pack>/<map>: see the header. Files carry `members`: only those are unpacked (the pack is gigabytes)
const BSDTAR = process.env.BSDTAR || (process.platform === "linux" ? "bsdtar" : "tar");
const packEntry = (spec, primary) => {
  const m = spec.match(/^pack:([^/]+)\/(.+)$/);
  if (!m) { console.error("usage: pack:<pack folder in originals/forum>/<map path inside the pack>"); process.exit(1); }
  const dir = path.join("originals", "forum", m[1], "files");
  const zip = fs.existsSync(path.join(ROOT, dir)) && fs.readdirSync(path.join(ROOT, dir)).find(n => /\.(zip|rar|7z)$/i.test(n));
  if (!zip) { console.error(`no archive in ${dir}`); process.exit(1); }
  if (primary && !opt.author) { console.error("a pack has no post: give the author with --author"); process.exit(1); }
  const list = execFileSync(BSDTAR, ["-tf", path.join(ROOT, dir, zip)], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\n").filter(Boolean);
  const member = list.find(n => n.toLowerCase().endsWith("/" + m[2].toLowerCase()) || n.toLowerCase() === m[2].toLowerCase()); // at the root of the archive too
  if (!member) { console.error(`not in ${zip}: ${m[2]}`); process.exit(1); }
  const bmp = list.find(n => n.toLowerCase() === member.replace(/\.[^./]+$/, "").toLowerCase() + ".bmp");
  const title = path.basename(member).replace(/\.[^.]+$/, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
  return { channel: "pack", slug: slugify(primary && opt.title ? opt.title : title), title, author: opt.author || "", year: "", base: "", desc: "", links: [],
    section: /\/Adventures\//i.test(member) ? "Adventure" : "", files: [{ name: zip, local: path.join(dir, zip), members: [member, ...(bmp ? [bmp] : [])] }] };
};
// it/<key>: a row of the Italian forum section of MODS.md (no forum topic file of its own). <key> is the folder tools/download-forum.js
// made in originals/forum/ (the row's name, slugged); the title, year and author come from the row. Italian texts, like a pack.
const italianEntry = key => {
  const dl = (() => { try { return require("../raw/download-log.json"); } catch { return {}; } })();
  const rows = Object.values(dl).filter(v => v.key === key);
  if (!rows.length) { console.error("nothing downloaded for", key); process.exit(1); }
  const files = [...new Set(rows.flatMap(v => v.files))].map(local => ({ name: path.basename(local), local }));
  const name = rows[0].name, m = name.match(/^(.*?)\s*\((\d{4})\)$/);
  const title = typeof opt.title === "string" ? opt.title : (m ? m[1] : name).replace(/^./, c => c.toUpperCase()); // --title, or the row's name with a capital
  const row = fs.readFileSync(path.join(ROOT, "MODS.md"), "utf8").split("\n").map(l => l.split("|")).find(c => c[2]?.trim() === name);
  const ported = (() => { try { return require("../raw/ported.json"); } catch { return {}; } })();
  // another mod already has this title: add the author, then the key
  const free = s => !fs.existsSync(path.join(ROOT, "ported", s)) || (ported[s] || "").split(" --")[0] === opt._; // the entry stores its options too
  const slug = [slugify(title), slugify(`${title} ${row?.[3] || ""}`), key].find(free);
  return { channel: "pack", slug, title, verbatim: true, author: row?.[3]?.trim() || "", year: m?.[2] || "", base: "", desc: "", links: [], section: name, files };
};
const [want, chan] = opt._.split("/").reverse();
const found = opt._.startsWith("pack:") ? [packEntry(opt._, true)] : opt._.startsWith("it/") ? [italianEntry(opt._.slice(3))] : chan === "forum" ? [forumEntry(want.replace(/^t/, ""))] : discord.filter(x => x.slug === want && (!chan || x.channel === chan));
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
// --add <entry>[:<text>]: also the downloads of another entry (whose name has <text>), e.g. more maps of the same series
// posted in another topic
const ownFiles = e.files.length;
// language of a pack's maps (--lang, first of the list), and a hash to tell maps apart by content
const packLangs0 = String(opt.lang === true || !opt.lang ? "Italian" : opt.lang).split(",")[0].trim();
const hashFile = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
if (opt.add) {
  const [spec, text = ""] = String(opt.add).startsWith("pack:") ? [String(opt.add)] : String(opt.add).split(/:(.*)/);
  const [w, c] = spec.split("/").reverse();
  const x = spec.startsWith("pack:") ? packEntry(spec, false) : c === "forum" ? forumEntry(w.replace(/^t/, "")) : discord.find(d => d.slug === w && (!c || d.channel === c));
  if (!x) { console.error("--add: not found:", spec); process.exit(1); }
  // a pack's map added to an entry that has the same adventure in another language: an "edition" of it
  // (only if the entry has files of its own: a dead download rescued from the pack is not an edition of anything)
  e.files.push(...x.files.filter(f => f.name.toLowerCase().includes(text.toLowerCase())).map(f => spec.startsWith("pack:") && ownFiles ? { ...f, edition: packLangs0 } : f));
}
if (!e.files.length) { console.error("nothing downloaded for", opt._); process.exit(1); }
const id = (e.channel === "saga-imperivm" ? "saga-" : "") + e.slug;
// the md5 of the pack maps that are an "edition" (--add pack:...) of what the entry already has: told apart by content, because
// file names and game.xml change below
const editionMd5 = new Map();
const editionVideos = new Set(); // videos unpacked for an edition: they never replace one the entry has (same name, another file)
const editionKept = new Set(); // the ones placed so far (an own video of the same name, unpacked later, replaces them)
const videoAlias = new Map(); // a pack's mangled video name -> the name the map plays
// forum topics: decided after unpacking, from the title or game.xml game_type (0 = skirmish map, 1/2 = adventure)
// --adventure: a single-player story map made as a normal map (game_type 0) whose post doesn't say so
let isAdv = e.channel === "aventuras" || /AVENTURAS?|adventure/i.test(e.section) || /\[aventura\]/i.test(e.title) || !!opt.adventure;
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
// the HD data doesn't define. Needs originals/game-data (sdk: node tools/extract-data.js "<game>" originals/game-data).
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
// a ported mod's data folder, any case (DATA from old mods)
const dataDir = m => { const d = path.join(ROOT, "ported", m); const n = fs.statSync(d).isDirectory() && fs.readdirSync(d).find(x => x.toLowerCase() === "data"); return n ? path.join(d, n) : null; };
const bigMods = !hdFiles || !fs.existsSync(MODS) ? [] : fs.readdirSync(MODS).map(m => {
  const dir = path.join(MODS, m), hiddenTxt = path.join(dir, "hidden.txt");
  const hidden = new Set(fs.existsSync(hiddenTxt) ? fs.readFileSync(hiddenTxt, "utf8").split(/\r?\n/)
    .map(l => l.trim().toLowerCase().replace(/\\/g, "/")).filter(l => l && !l.startsWith(";")) : []);
  const own = Object.keys(classFiles(path.join(dir, "DATA")));
  // forum-* = a mod downloaded from the forum but not ported to Resurrected yet: a map needing it has to wait
  return { mod: m, ported: !m.startsWith("forum-"), own: new Set(own), classes: new Set([...Object.keys(hdFiles).filter(c => !hidden.has(hdFiles[c])), ...own]) };
}).concat(!hdFiles ? [] : fs.readdirSync(path.join(ROOT, "ported")).filter(m => m !== id && dataDir(m)).map(m => {
  // our own class mods (e.g. imperivm1-legacy from tools/imperivm1.js): its id is in its mod.json
  const own = Object.keys(classFiles(dataDir(m)));
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
  if (/\.(rar|zip|7z)$/i.test(f.name)) {
    execFileSync(BSDTAR, ["-xf", src, "-C", dest, ...(f.members || [])], { maxBuffer: 1 << 28 });
    if (f.edition) for (const m of f.members.filter(m => /\.bfhp$/i.test(m))) editionMd5.set(hashFile(path.join(dest, m)), f.edition);
    if (f.members) { // the videos the unpacked maps play, if the pack has them
      const have = execFileSync(BSDTAR, ["-tf", src], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\n");
      const names = new Set(fs.readdirSync(dest, { recursive: true }).filter(g => /\.bfhp$/i.test(g))
        .flatMap(g => [...fs.readFileSync(path.join(dest, g), "latin1").matchAll(/PlayMovie\((?:Translate\()?"([^"]+\.avi)"/gi)].map(m => path.basename(m[1].replace(/\\+/g, "/")).toLowerCase())));
      // a pack's file names are often mangled ("L_eroe d_Egitto.avi" for "L'eroe d'Egitto.avi"): match without punctuation and
      // unpack it under the name the map plays
      const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const vids = [];
      for (const n of names) {
        const exact = have.filter(h => path.basename(h).toLowerCase() === n);
        const alt = !exact.length && have.find(h => /\.avi$/i.test(h) && norm(path.basename(h)) === norm(n));
        if (exact.length) vids.push(...exact);
        else if (alt) { vids.push(alt); videoAlias.set(path.basename(alt).toLowerCase(), n); console.log(`  🎬 plays ${n}: the pack has it as ${path.basename(alt)}`); }
        else console.log(`  ⚠️ plays ${n}, which the pack does not have`);
      }
      if (vids.length) execFileSync(BSDTAR, ["-xf", src, "-C", dest, ...vids], { maxBuffer: 1 << 28 });
      if (f.edition) for (const v of vids) editionVideos.add(v.replace(/\\/g, "/"));
    }
  }
  else fs.copyFileSync(src, path.join(dest, f.name));
}
// videos go where the maps' PlayMovie("…") looks for them ("Movies//Intro.avi", "Adventures/videohistoriakiller/x.avi"),
// Movies\ when no map names one
const played = new Map();
for (const f of fs.readdirSync(dest, { recursive: true }).filter(f => /\.bfhp$/i.test(f)))
  for (const m of fs.readFileSync(path.join(dest, f), "latin1").matchAll(/PlayMovie\((?:Translate\()?"([^"]+\.avi)"/gi)) {
    const rel = m[1].replace(/\\+|\/+/g, "/");
    played.set(path.basename(rel).toLowerCase(), rel.replace(/^(\w+)\//, (_m, d) => d.toLowerCase() + "/"));
  }
for (const [alt, n] of videoAlias) if (played.has(n)) played.set(alt, played.get(n));
// A conquest's folder (territories.xml, territories.bmp, global.bmp, Shield<Name>.bmp...): the game reads it from
// conquestmaps/<the folder name its .bfhp stores>, so it is kept whole, not flattened with the maps' previews. The same for the
// UI/ pictures a map uses (UI/NOTEICONS/...): they keep their path.
// the name as the .bfhp spells it ("2 - GBR Europe MOD"): the folder has to match it exactly, an archive may say "europe"
const cmName = new Map();
for (const f of fs.readdirSync(dest, { recursive: true }).filter(f => /\.bfhp$/i.test(f)))
  for (const m of fs.readFileSync(path.join(dest, f), "latin1").matchAll(/ConquestMaps[\\/]([^"\0\r\n<>]+)/gi)) cmName.set(m[1].trim().toLowerCase(), m[1].trim());
const cmDirs = new Set(fs.readdirSync(dest, { recursive: true }).filter(f => /(^|[\\/])(territories\.xml|global\.bmp)$/i.test(f) && path.dirname(f) !== ".").map(f => path.dirname(f)));
for (const f of fs.readdirSync(dest, { recursive: true })) {
  const p = path.join(dest, f);
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) continue;
  const to = cmDirs.has(path.dirname(f)) ? path.join(out, "conquestmaps", cmName.get(path.basename(path.dirname(f)).toLowerCase()) || path.basename(path.dirname(f)), path.basename(f))
    : /^ui[\\/]/i.test(f) ? path.join(out, "UI", f.slice(3)) : null;
  if (to) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.renameSync(p, to); }
}
// flatten folders inside archives, keep only what the game reads next to a map
for (const f of fs.readdirSync(dest, { recursive: true })) {
  const p = path.join(dest, f);
  if (fs.statSync(p).isDirectory()) continue;
  if (/\.(bfhp|bmp)$/i.test(f)) { if (path.dirname(f) !== ".") fs.renameSync(p, path.join(dest, path.basename(f))); }
  else if (/\.avi$/i.test(f)) {
    const to = path.join(out, played.get(path.basename(f).toLowerCase()) || path.join("movies", path.basename(f)));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    // two editions play the same file names: the entry's own video stays, whichever is unpacked first
    const fromEdition = editionVideos.has(f.replace(/\\/g, "/"));
    if (fromEdition && fs.existsSync(to) && !editionKept.has(to)) {
      if (hashFile(to) !== hashFile(p)) console.log(`  ⚠️ kept the entry's ${path.basename(to)}: the pack's is another file with the same name`);
      fs.rmSync(p); continue;
    }
    fs.renameSync(p, to);
    if (fromEdition) editionKept.add(to); else editionKept.delete(to);
  }
  else fs.rmSync(p);
}
for (const f of fs.readdirSync(dest)) if (fs.statSync(path.join(dest, f)).isDirectory()
  && !fs.readdirSync(path.join(dest, f), { recursive: true }).some(g => /\.avi$/i.test(g))) fs.rmSync(path.join(dest, f), { recursive: true }); // keep the videos placed above
// "Mapa..BFHP" (common typo) -> "Mapa.BFHP": the SDK rejects ".." in paths
for (const f of fs.readdirSync(dest)) if (f.includes("..")) fs.renameSync(path.join(dest, f), path.join(dest, f.replace(/\.{2,}/g, ".")));
// "VersiÃ³n" (a UTF-8 name read as Latin-1 somewhere on the way) -> "Versión"
for (const f of fs.readdirSync(dest)) {
  const u = /[\u0080-\u00ff]/.test(f) && !/[^\u0000-\u00ff]/.test(f) ? Buffer.from(f, "latin1").toString("utf8") : f;
  if (u !== f && !u.includes("\ufffd")) fs.renameSync(path.join(dest, f), path.join(dest, u));
}
let maps = fs.readdirSync(dest).filter(f => /\.bfhp$/i.test(f));
if (!maps.length) { console.error("no .bfhp in", e.files.map(f => f.name)); process.exit(1); }
// an Italian row often repeats maps we have from the Discord, the Greek Mod pack or another row: leave out what is byte for byte
// in another mod's folder or in a download of another row
if (opt._.startsWith("it/")) {
  const mine = path.join("originals", "forum", opt._.slice(3)), hashes = new Set();
  const scan = d => { if (fs.existsSync(d)) for (const f of fs.readdirSync(d, { recursive: true })) if (/\.bfhp$/i.test(f)) hashes.add(hashFile(path.join(d, f))); };
  scan(path.join(ROOT, "originals", "discord"));
  for (const d of fs.readdirSync(path.join(ROOT, "originals", "forum"))) if (d !== path.basename(mine)) scan(path.join(ROOT, "originals", "forum", d));
  for (const m of fs.readdirSync(path.join(ROOT, "ported")).filter(m => m !== id)) scan(path.join(ROOT, "ported", m));
  const seen = new Set();
  for (const f of maps) {
    const h = hashFile(path.join(dest, f));
    if (hashes.has(h) || seen.has(h)) { // seen: the same map twice in this row
      console.log(`  = ${f} is already in another mod: left out`);
      for (const b of fs.readdirSync(dest).filter(b => b.replace(/\.\w+$/, "").toLowerCase() === f.replace(/\.bfhp$/i, "").toLowerCase())) fs.rmSync(path.join(dest, b));
    }
    seen.add(h);
  }
  maps = fs.readdirSync(dest).filter(f => /\.bfhp$/i.test(f));
  if (!maps.length) { fs.rmSync(out, { recursive: true, force: true }); console.error("every map of this row is already in another mod"); process.exit(3); }
}
// a picture with no map of that name (a cover the author zipped, icons) is not read by the game: the previews are <map>.bmp
for (const f of fs.readdirSync(dest)) if (/\.bmp$/i.test(f) && !maps.some(m => m.replace(/\.bfhp$/i, "").toLowerCase() === f.replace(/\.bmp$/i, "").toLowerCase())) fs.rmSync(path.join(dest, f));
// a map the HD game already ships (same bytes; copy Scenarios/ and Adventures/ of the game to originals/game-data/):
// nothing to port
const md5 = f => require("crypto").createHash("md5").update(fs.readFileSync(f)).digest("hex");
const HD = path.join(ROOT, "originals", "game-data");
const shipped = maps.filter(f => ["Scenarios", "Adventures"].some(d => fs.existsSync(path.join(HD, d)) && fs.readdirSync(path.join(HD, d))
  .some(g => g.toLowerCase() === f.toLowerCase() && md5(path.join(HD, d, g)) === md5(path.join(dest, f)))));
// --keep: port it anyway (the author's own copy is worth having in the mod list)
if (shipped.length === maps.length && !opt.keep) { fs.rmSync(out, { recursive: true, force: true }); console.error(`already in the HD game: ${shipped.join(", ")}`); process.exit(3); }
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
// each map to the folder of the kind it states (game.xml game_type: 0 scenario, 1 adventure, 2 conquest; adventure="1" in
// old maps): the Scenarios list only shows type 0 and conquests only show up in conquests/. A type 0 map of an adventure
// entry (a mission made as a normal map) stays in adventures/, which the SDK allows.
const FOLDERS = ["scenarios", "adventures", "conquests"], where = {};
const kindOf = f => {
  const p = (fs.readFileSync(path.join(dest, f)).subarray(0, 65536).toString("latin1").match(/<properties\b[^>]*>/) || [""])[0];
  const a = n => (p.match(new RegExp(`\\s${n}="([^"]*)"`)) || [])[1];
  const k = Math.max(0, ["0", "1", "2"].indexOf(a("game_type") ?? "0"));
  return k === 0 && Number(a("adventure") || 0) ? 1 : k;
};
for (const f of maps) {
  const k = kindOf(f), to = FOLDERS[k === 0 && isAdv ? 1 : k];
  where[f] = to;
  if (to === path.basename(dest)) continue;
  fs.mkdirSync(path.join(out, to), { recursive: true });
  for (const b of fs.readdirSync(dest).filter(b => b.replace(/\.\w+$/, "").toLowerCase() === f.replace(/\.bfhp$/i, "").toLowerCase()))
    fs.renameSync(path.join(dest, b), path.join(out, to, b)); // the map and its .bmp preview
}
if (!fs.readdirSync(dest).length) fs.rmdirSync(dest);
const at = f => path.join(out, where[f], f);
const has = k => Object.values(where).includes(k);
const edOf = new Map(maps.map(f => [f, editionMd5.get(hashFile(at(f)))])); // before anything rewrites a map: language of the pack's editions
// players: the human slots of the skirmish maps (an adventure or a conquest is played alone)
const counts = maps.filter(f => where[f] === "scenarios").map(f => slots(at(f))).filter(Boolean);
const used = hdClasses ? [...new Set(maps.flatMap(f => usedClasses(at(f))))] : null;
// the CGWAR's own M* pieces (1.40: Greece replaced Imperial Rome) are its K* ones here: MVillager, which HD doesn't have, is
// KVillager; M* walls, towers and gates HD does have, but the CGWAR redrew them Greek (both switched below)
const CG = path.join(ROOT, "ported", "cgwar", "DATA", "CLASSES");
const kIds = new Set(fs.existsSync(CG) ? fs.readdirSync(CG).flatMap(f => [...fs.readFileSync(path.join(CG, f), "latin1").matchAll(/<class\b[^>]*?\bid="([^"]+)"/g)].map(m => m[1])) : []);
const kOf = c => /^M/.test(c) && !hdClasses?.has(c.toLowerCase()) && kIds.has("K" + c.slice(1)) ? "K" + c.slice(1) : c;
const missing = used?.map(kOf).filter(c => !hdClasses.has(c.toLowerCase()) && !extraClasses.has(c.toLowerCase())) || []; // not in the HD game or extras/
// needs = the big mods that have every missing class; none -> the map needs a mod we don't have
const needs = missing.length ? bigMods.filter(m => missing.every(c => m.classes.has(c.toLowerCase()))).map(m => m.mod) : [];
// no single mod has them all (a Greek Mod map that also places Imperivm I classes): the ported mods that together do, most classes first.
// Then the map requires every one of them, not one of several
const PREFER = ["community-mod", "greek-civilization-mod", "caesar-mod"];
const cover = [];
if (missing.length && !needs.length) {
  let left = [...missing];
  while (left.length) {
    const best = bigMods.filter(m => m.ported && !cover.includes(m.mod))
      .map(m => ({ mod: m.mod, got: left.filter(c => m.classes.has(c.toLowerCase())) }))
      .sort((a, b) => b.got.length - a.got.length || PREFER.indexOf(b.mod) - PREFER.indexOf(a.mod))[0];
    if (!best || !best.got.length) break;
    cover.push(best.mod);
    left = left.filter(c => !best.got.includes(c));
  }
  if (!left.length) needs.push(...cover); else cover.length = 0;
}
const unknown = missing.length && !needs.length ? missing : [];
const waits = needs.length && !needs.some(m => bigMods.find(b => b.mod === m).ported) ? needs : []; // only unported mods have them
if (!waits.length) needs.splice(0, needs.length, ...needs.filter(m => bigMods.find(b => b.mod === m).ported));
// incompatible = big mods that hide (hidden.txt) a class of the HD game the map uses
const breaks = used ? bigMods.filter(m => !needs.includes(m.mod))
  .map(m => ({ mod: m.mod, lost: used.filter(c => hdClasses.has(c.toLowerCase()) && !m.classes.has(c.toLowerCase())) })).filter(x => x.lost.length) : [];
// terrain layers past HD's 40 (the Greek Mod's, painted with it or the Caesar Mod): HD crashes drawing them, so the map
// requires ported/greek-mod-terrains (tools/greek-terrains.js) unless it already requires a mod that has them
const TERRAIN_MODS = ["greek-civilization-mod", "caesar-mod"];
const extraTerrain = maps.some(f => { try {
  return require("./hpfs.js")(fs.readFileSync(at(f))).some(x => /maps\/\d+\/terrain\.terrain\.grid$/i.test(x.path) && x.read().subarray(20).some(v => v > 40));
} catch { return false; } });
const lo = Math.min(...counts), hi = Math.max(...counts);
// "Players: 2" / "Players: 2-4": the SDK and GameBanana take 2 to 8, so a map for one human (against the AI) gets none
const pLo = Math.max(2, lo), pHi = Math.min(8, hi);
const players = opt.players ? `Players: ${opt.players}` : counts.length && hi >= 2 ? `Players: ${pLo === pHi ? pLo : `${pLo}-${pHi}`}` : null;
// maps for the CGWAR: in the 1.40 mod Greece replaced Imperial Rome, and its M* walls, towers and gates were redrawn Greek.
// Ported, Greece is a civilization of its own with K* pieces and M* is Roman again: switch them so the maps look as their
// authors saw them (same name length: rewritten in place). That is an edit of the map, so the porter is credited.
let greekWalls = 0;
if (needs.includes("cgwar")) {
  for (const f of maps) {
    const p = at(f), buf = fs.readFileSync(p);
    for (const x of require("./hpfs.js")(buf).filter(x => /map\.obj\.xml$/i.test(x.path))) {
      let n = 0;
      const s = x.read().toString("latin1").replace(/class="M(\w+)"/g, (m, c) => kIds.has("K" + c) && (/^(Walls\w*|Tower|Gate\d)$/.test(c) || kOf("M" + c) !== "M" + c) ? (n++, `class="K${c}"`) : m);
      if (n) { x.write(Buffer.from(s, "latin1")); greekWalls += n; }
    }
    fs.writeFileSync(p, buf);
  }
}

// the saga: the maps and adventures of Imperivm I and II that came with the games, collected by Ferónidas on Discord
const saga = e.channel === "saga-imperivm";
// a saga entry with an author is a community remake of the original (e.g. OskaOtzuna's Imperivm II adventures)
const credits = (saga ? e.author || "Haemimont Games" : opt.author || e.author || "?").split(";").map(s => s.trim()).filter(Boolean); // --author "A; B": a pack's maps carry several
const author = credits.join(", ");
// languages of the adventure's texts: a forum or Discord post is Spanish; a pack's maps are what --lang says (default Italian)
const packLangs = String(opt.lang === true || !opt.lang ? "Italian" : opt.lang).split(",").map(s => s.trim());
// (an entry with no download of its own, whose files all come from a pack, has the pack's language only)
const langs = [...new Set([...(e.channel !== "pack" && ownFiles ? ["Spanish"] : []), ...(e.channel === "pack" || !ownFiles || e.files.some(f => f.edition) ? packLangs : [])])];
const sagaGame = saga && (/ II$/.test(e.section) ? "Imperivm II" : "Imperivm I");
// --title: the mod's name when the post's title is wrong (a typo: "Kilelrgoldfer" for Killergoldfer)
// a pack's map has its real name in game.xml (typed by its author, with its own capitals); a post's title needs titleCase
const nameOf = f => { // name= of a map's game.xml, as text
  try {
    const x = require("./hpfs.js")(fs.readFileSync(at(f))).find(x => /^game\.xml$/i.test(x.path));
    const v = x && (x.read().toString("latin1").match(/\sname="([^"]*)"/) || [])[1];
    return v ? Buffer.from(v, "latin1").toString("utf8").replace(/&(\w+);/g, (m, k) => XML[k] ?? m) : "";
  } catch { return ""; }
};
const editionOf = f => edOf.get(f); // language of a pack edition, undefined for the entry's own maps
const primary = maps.find(f => !editionOf(f)) || maps[0];
const modName = (saga ? `${sagaGame}: ` : "") + (e.verbatim ? e.title : opt.title ? titleCase(opt.title) : e.channel === "pack" || (!ownFiles && e.files.some(f => f.members)) ? nameOf(primary) || titleCase(e.title) : titleCase(e.title));
const LABEL = { Spanish: "Español", Italian: "Italiano", English: "English" };
// the editor's defaults ("Mapa modelo", "Aventura modelo", "Autor desconocido", "Partida de estrategia") are what the game
// lists: each map gets its real name (the mod's, or its file's when there are several) and author. game.xml is rewritten in
// place: putting its attributes on one line makes room
const DEF_NAME = /^(mapa|aventura) modelo\d*$/i, DEF_AUTHOR = /^(autor desconocido|unknown author|)$/i, DEF_DESC = /^partida de estrategia$/i;
const xmlEsc = v => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
let renamed = 0;
for (const f of maps) {
  const p = at(f), buf = fs.readFileSync(p);
  let x; try { x = require("./hpfs.js")(buf).find(x => /^game\.xml$/i.test(x.path)); } catch { continue; }
  if (!x) continue;
  const g = x.read().toString("latin1"), attr = k => (g.match(new RegExp(`\\s${k}="([^"]*)"`)) || [])[1];
  const set = {};
  if (DEF_NAME.test(attr("name") ?? "-"))
    set.name = maps.length === 1 ? modName : f.replace(/\.bfhp$/i, "").replace(/ \([a-z0-9-]+\)$/, "").replace(/_/g, " ");
  if (DEF_AUTHOR.test(attr("author") ?? "-") && author !== "?") set.author = author;
  if (editionMd5.size) { // the same adventure in two languages in one mod: both show in the game's list, so say which is which
    const cur = set.name ?? Buffer.from(attr("name") ?? "", "latin1").toString("utf8");
    set.name = `${cur} (${LABEL[editionOf(f) || "Spanish"] || editionOf(f)})`;
  }
  if (opt.desc && maps.length === 1) set.description = opt.desc; // --desc: the post has none and the editor's default is shown
  else if (DEF_DESC.test(attr("description") ?? "-")) set.description = "";
  if (!Object.keys(set).length) continue;
  let t = g;
  for (const [k, v] of Object.entries(set)) t = t.replace(new RegExp(`(\\s${k}=")[^"]*"`), (_m, a) => a + Buffer.from(xmlEsc(v), "utf8").toString("latin1") + '"');
  t = t.replace(/\r?\n\t*(?=[\w.]+=)/g, " ");
  const room = Math.ceil(g.length / 512) * 512; // HPFS pages are 512 bytes or more: growing within them is free
  if (t.length > room) { console.log(`  ⚠️ ${f}: no room for its name/description in game.xml (${t.length} > ${room})`); continue; }
  try { x.write(Buffer.from(t, "latin1")); } catch (err) { console.log(`  ⚠️ ${f}: ${err.message}`); continue; }
  fs.writeFileSync(p, buf);
  renamed++;
}
const desc = opt.desc || e.desc || (maps.length === 1 || editionMd5.size ? mapDesc(at(primary)) : "");
// the map's own description is in the language of its texts (first of --lang, Spanish for a post): it goes on that language's card only
const italian = langs.includes("Italian"); // a mod with Italian texts gets an Italian card too
const descLang = e.channel === "pack" || !ownFiles ? packLangs[0] : "Spanish";
const descIt = !italian ? "" : editionMd5.size ? mapDesc(at(maps.find(f => editionOf(f) === "Italian") || primary)) : descLang === "Italian" ? desc : "";
const notEs = langs.length && !langs.includes("Spanish") ? "en " + langs.map(l => ({ Italian: "italiano", English: "inglés" }[l] || l)).join(" e ") : ""; // "en italiano"
const notEn = langs.length && !langs.includes("English") && !langs.includes("Spanish") ? "in " + langs.join(" and ") : "";
const meta = saga ? (e.author ? `versión mejorada de la aventura de ${sagaGame} de Haemimont Games, recopilada por Ferónidas` : `${sagaGame}, recopilado por Ferónidas`) : [e.year, e.base].filter(Boolean).join(", ");
const metaEn = saga ? (e.author ? `improved version of the ${sagaGame} adventure by Haemimont Games, collected by Ferónidas` : `${sagaGame}, collected by Ferónidas`) : meta;
// the main category: what most of it is (adventures over conquests over scenarios on a tie); the rest go as "Type: …" tags
const CATS = { scenarios: "Scenarios", adventures: "Adventures", conquests: "Conquests" };
const byCount = FOLDERS.filter(has).sort((a, b) => maps.filter(f => where[f] === b).length - maps.filter(f => where[f] === a).length || FOLDERS.indexOf(b) - FOLDERS.indexOf(a));
const main = byCount[0];
isAdv = main === "adventures";
const what = main === "adventures" ? "Aventura" : main === "conquests" ? "Conquista" : maps.length > 1 ? `${maps.length} mapas` : "Mapa";
const cmClash = [];
if (fs.existsSync(path.join(out, "conquestmaps"))) {
  const mine = fs.readdirSync(path.join(out, "conquestmaps")).map(d => d.toLowerCase());
  for (const m of fs.readdirSync(path.join(ROOT, "ported")).filter(m => m !== id)) {
    const dir = path.join(ROOT, "ported", m, "conquestmaps");
    if (fs.existsSync(dir) && fs.readdirSync(dir).some(d => mine.includes(d.toLowerCase()))) {
      let modId = m;
      try { modId = JSON.parse(fs.readFileSync(path.join(ROOT, "ported", m, "mod.json"), "utf8")).id || m; } catch { /* folder name */ }
      cmClash.push(modId);
    }
  }
}
const mod = {
  id,
  name: modName,
  version: typeof opt.version === "string" ? opt.version : "1.0", // --version 1.1 when the author reposts a map
  authors: saga ? [...(e.author ? [e.author] : []), "Haemimont Games", "FX Interactive"] : [...credits, ...(greekWalls ? ["Villoh (port)"] : [])],
  description: {
    ...(italian ? { italian: `${descIt ? descIt.replace(/([^.!?…])$/, "$1.") + " " : ""}${{ Aventura: "Avventura", Conquista: "Conquista", Mapa: "Mappa" }[what] || maps.length + " mappe"} di ${author}.` } : {}),
    spanish: `${desc && descLang === "Spanish" ? desc.replace(/([^.!?…])$/, "$1.") + " " : ""}${what} de ${author}${[meta, notEs].filter(Boolean).length ? ` (${[meta, notEs].filter(Boolean).join(", ")})` : ""}.${greekWalls ? " Piezas griegas del CGWAR (murallas, torres, puertas, aldeanos) adaptadas a Grecia como civilización propia." : ""}`,
    english: `${desc && descLang === "English" ? desc.replace(/([^.!?…])$/, "$1.") + " " : ""}${{ Aventura: "Adventure", Conquista: "Conquest", Mapa: "Map" }[what] || maps.length + " maps"} by ${author}${[metaEn, notEn].filter(Boolean).length ? ` (${[metaEn, notEn].filter(Boolean).join(", ")})` : ""}.${greekWalls ? " The CGWAR's Greek pieces (walls, towers, gates, villagers), adapted to Greece as a civilization of its own." : ""}`,
  },
  category: CATS[main],
  // Players only counts for scenarios and Language for adventures (the SDK's filters); every adventure here is in Spanish
  tags: [...byCount.slice(1).map(k => `Type: ${CATS[k]}`), ...(has("scenarios") && players ? [players] : []), ...(has("adventures") ? langs.map(l => `Language: ${l}`) : [])],
  // requires means "all of these": with several candidates, take one (the most used first)
  ...(needs.length || extraTerrain ? { requires: [
    ...(cover.length ? cover : needs.length ? [[...PREFER, ...needs].find(m => needs.includes(m))] : []),
    ...(extraTerrain && !needs.some(m => TERRAIN_MODS.includes(m)) ? ["greek-mod-terrains"] : []),
  ] } : {}),
  // two conquests that keep their images in the same conquestmaps/<folder> would overwrite each other
  ...((cmClash.length || breaks.length) ? { incompatibleWith: [...breaks.map(b => b.mod), ...cmClash] } : {}),
  redistributable: !opt["no-redistributable"], // publishing on GameBanana already redistributes it; false only if the author asks
};
if (fs.existsSync(EXTRAS)) fs.cpSync(EXTRAS, out, { recursive: true });
fs.writeFileSync(path.join(out, "mod.json"), JSON.stringify(mod, null, 2) + "\n");
// raw/ported.json: which entry each ported mod comes from (tools/sync-table.js uses it to update MODS.md)
const SRC = path.join(ROOT, "raw", "ported.json");
const src = (() => { try { return JSON.parse(fs.readFileSync(SRC, "utf8")); } catch { return {}; } })();
src[id] = opt._ + (opt.file ? ` --file ${opt.file}` : "") + (opt.add ? ` --add ${opt.add}` : "") + (opt.author ? ` --author ${opt.author}` : "") + (opt.lang ? ` --lang ${opt.lang}` : "") + (opt.adventure ? " --adventure" : "") + (opt.title ? ` --title ${opt.title}` : "") + (opt.desc ? ` --desc ${opt.desc}` : "") + (opt.keep ? " --keep" : ""); // what to run to wrap it again
fs.writeFileSync(SRC, JSON.stringify(Object.fromEntries(Object.entries(src).sort()), null, 1) + "\n");
console.log(`${out}\n  ${maps.join(", ")} -> ${[...new Set(maps.map(f => where[f]))].join(", ")}/\n  category ${mod.category}, tags ${JSON.stringify(mod.tags)}${counts.length < maps.filter(f => where[f] === "scenarios").length ? "  ⚠️ some scenario has no readable players" : ""}${has("scenarios") && !players ? "  ⚠️ no Players tag (one human slot, or --players)" : ""}${renamed ? `\n  🏷️ ${renamed} map(s): the editor's default name/author in game.xml replaced` : ""}${greekWalls ? `\n  🏛️ ${greekWalls} M* pieces (walls, towers, gates, villagers) -> K* (Greek): porter credited` : ""}`
  + (used === null ? "\n  ⚠️ compatibility not checked (no originals/game-data)" : unknown.length ? `\n  ❌ not in the HD game nor in a known mod: ${unknown.join(", ")}` : "")
  + (waits.length ? `\n  ⏳ blocked: needs ${waits.join(" or ")}, not ported to Resurrected yet (${missing.join(", ")})` : needs.length ? `\n  🧩 needs ${needs.join(" or ")} (${missing.join(", ")})${cover.length ? " -> requires all of them" : needs.length > 1 ? " -> requires " + mod.requires[0] : ""}` : "")
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
