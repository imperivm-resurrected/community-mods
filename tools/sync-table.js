// Bring the Type and Status of the MODS.md / MISSING.md rows in line with ported/*/mod.json (via raw/ported.json,
// written by tools/wrap-map.js). Rows already on GameBanana (✅) keep their status.
//   node tools/sync-table.js
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const NAME = { "community-mod": "Community Mod", "caesar-mod": "Caesar Mod", "greek-civilization-mod": "Greek Mod 4.2", "gamebanana-729311": "AsvrMod VII", "imperivm1-legacy": "Imperivm I legacy" };
const nm = id => NAME[id] || id;
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (err) { console.error(`${f}: ${err.message}`); process.exit(1); } };
const ported = readJson(path.join(ROOT, "raw", "ported.json"));
const discord = require("../raw/discord-entries.json");
// row source -> wrap-map argument: the Discord post link, or the forum topic
const byDiscord = Object.fromEntries(discord.map(e => [e.discord, `${e.channel}/${e.slug}`]));
const bySource = {};
for (const [id, arg] of Object.entries(ported)) bySource[arg.split(" --")[0]] = id; // "<entry> --file x" -> <entry>
const stale = [];
let changed = 0;
for (const file of ["MODS.md", "MISSING.md"]) {
  const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split("\n");
  let H = null;
  const out = lines.map(l => {
    if (l.startsWith("| # |")) H = l.split("|").map(s => s.trim());
    const c = l.split("|");
    if (!H || !/^\s*\d+\s*$/.test(c[1] || "")) return l;
    const T = H.indexOf("Type"), S = H.indexOf("Status"), SRC = H.indexOf("Source");
    const d = (c[SRC].match(/\((https:\/\/discord\.com\/channels\/[^)]+)\)/) || [])[1];
    const t = (c[SRC].match(/foroactivo\.com\/t(\d+)-/) || [])[1];
    const arg = d ? byDiscord[d] : t ? `forum/t${t}` : null;
    // a row with no post of its own (a map of a pack, a mod we made) names its ported/ folder in parentheses: "... (imperivm1-legacy)"
    const own = (c[2].match(/\(([a-z0-9-]+)\)\s*$/) || [])[1];
    const id = (arg && bySource[arg]) || (own && ported[own] ? own : null);
    if (!id) {
      if (/🔧/.test(c[S]) && !(own && fs.existsSync(path.join(ROOT, "ported", own)))) stale.push(`${file} ${c[1].trim()} ${c[2].trim()}`);
      return l;
    }
    const mod = readJson(path.join(ROOT, "ported", id, "mod.json"));
    // "<porter> (port)" in authors: the map was edited (e.g. the CGWAR maps' walls), so it is a rewrite
    const type = (mod.authors?.some(a => / \(port\)$/.test(a)) ? " rewrite" : " wrap") + (mod.requires ? " · requires " + mod.requires.map(nm).join(", ") : "")
      + (mod.incompatibleWith ? " · not with " + mod.incompatibleWith.map(nm).join(", ") : "") + " ";
    const status = /✅/.test(c[S]) ? c[S] : " 🔧 ported (not uploaded) ";
    if (c[T] === type && c[S] === status) return l;
    c[T] = type; c[S] = status; changed++;
    return c.join("|");
  });
  fs.writeFileSync(path.join(ROOT, file), out.join("\n"));
}
console.log(`${changed} rows updated`);
if (stale.length) console.log(`marked 🔧 but nothing in ported/ (fix by hand):\n  ${stale.join("\n  ")}`);
