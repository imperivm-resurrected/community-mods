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
  redistributable: !opt["no-redistributable"], // publishing on GameBanana already redistributes it; false only if the author asks
};
fs.writeFileSync(path.join(out, "mod.json"), JSON.stringify(mod, null, 2) + "\n");
console.log(`${out}\n  ${maps.join(", ")} -> ${path.basename(dest)}/\n  category ${mod.category}, tags ${JSON.stringify(mod.tags)}${counts.length < maps.length ? "  ⚠️ some map has no readable players" : ""}${!isAdv && !players ? "  ⚠️ missing --players" : ""}`);
