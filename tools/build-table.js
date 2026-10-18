// raw/*.json -> MODS.md (first draft). After you start editing MODS.md by hand, don't re-run without --force.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "MODS.md");
if (fs.existsSync(OUT) && !process.argv.includes("--force")) { console.error("MODS.md already exists; use --force to overwrite it"); process.exit(1); }

const entries = require("../raw/discord-entries.json");
const forum = require("../raw/forum-entries.json");
const links = (() => { try { return require("../raw/links.json"); } catch { return {}; } })();
const FORUM = "https://imperivmgbr.foroactivo.com";
const cell = s => String(s ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const mark = u => { const l = links[u]; return !l ? "❔" : l.ok ? "✅" : l.ok === false ? "❌" : "⚠️"; };
const host = u => u.replace(/^https?:\/\/(www\.)?/, "").split(/[/.]/)[0];
const dl = us => us.length ? us.map(u => `${mark(u)} [${host(u)}](${u})`).join("<br>") : "—";
const forumId = u => u.match(/foroactivo\.com\/t(\d+)/)?.[1];
const HEAD = "| # | Name | Author(s) | Base | Source | Download | Permission | Status | GameBanana |\n|---|---|---|---|---|---|---|---|---|";
const out = [];
let n = 0;
const row = (name, author, base, source, download, permission = "❔") =>
  `| ${++n} | ${cell(name)} | ${cell(author)} | ${cell(base)} | ${source} | ${download} | ${permission} | 📋 to port | |`;

out.push(`# Mods to port to Imperivm Resurrected

Generated on ${new Date().toISOString().slice(0, 10)} from the Discord server *Imperivm III Editores* and [${FORUM.replace("https://", "")}](${FORUM}).
Edited by hand from here on.

**Download**: ✅ alive · ❌ dead · ⚠️ doubtful (check by hand) · ❔ not checked · 💾 local copy in \`originals/\`.
**Permission**: ✅ granted or free license · ❌ denied · ❔ not asked · 🕐 asked, waiting.
**Status**: 📋 to port · 🔧 ported (not uploaded) · ✅ on GameBanana · 🚫 cannot be ported.
`);

// --- Big mods (hand-picked list: there are few and each one is its own world)
const v12 = "https://mega.nz/file/bB1UUYYB#m1swkkwZ5SUsU4WWIl4yBZ1OjBM-CZ2DJMkN5dYReYE";
const ch = id => `https://discord.com/channels/479629904657514526/${id}`;
const topicLinks = id => forum[id]?.links || [];
out.push("## Mods\n", HEAD,
  row("Community Mod v12", "Ferónidas and community", "HD vRelease 1.0", `[Discord](${ch("915050595713429534")})`, dl([v12])),
  row("Caesar Mod 1.1.0", "Paulus Ludorum (Paolo Lamberto) + Greek Mod creators", "HD", `[Discord](${ch("1416185549873610823")})`,
    dl(["https://www.moddb.com/mods/caesar-mod/downloads/caesar-mod-110"]), "✅ CC BY-SA 4.0"),
  row("Imperivm Legacy 2.4.1", "Nicoghiro31", "HD 1.0", `[Discord](${ch("1142861080880763060")})`, dl(["https://www.moddb.com/mods/imperivm-legacy/downloads"])),
  row("Greek Civilization Mod v1.8", "Rattlesmake", "1.40 and 1.5+ (Steam)", `[forum](${FORUM}/t1207)`, dl(topicLinks("1207"))),
  row("CGWAR Greek Civilization Mod v6", "Camarada and the CGWAR team", "1.40 only", `[forum](${FORUM}/t1354)`, dl(topicLinks("1354"))),
  row("AsvrMod VI: Wrath of the Gods", "Asvr", "1.40", `[forum](${FORUM}/t731)`, dl(topicLinks("731"))),
  row("Mod Comunidad Imperivm (MCI) 2010-2013", "forum community", "1.40", `[forum](${FORUM}/t262)`, dl(topicLinks("262"))),
  row("La Reconquista 2010", "JVLIVS CAESAR", "1.40", `[forum](${FORUM}/f44-descarga-e-informacion)`,
    dl(Object.values(forum).filter(t => t.subforum.startsWith("f44")).flatMap(t => topicLinks(String(t.id))))),
  "");
const bigMods = new Set(["1207", "1354", "731", "262"]);

// --- Discord: maps and adventures (already curated by Ferónidas, with the attachment downloaded)
const covered = new Set();
const groups = [["saga-imperivm", "Imperivm saga (maps and adventures from Imperivm I and II)"], ["mapas", "Maps"], ["aventuras", "Adventures"]];
for (const [chan, title] of groups) {
  out.push(`## ${title}\n`, HEAD);
  for (const e of entries.filter(x => x.channel === chan)) {
    const f = e.links.filter(u => forumId(u)); f.forEach(u => covered.add(forumId(u)));
    const other = e.links.filter(u => !forumId(u));
    const files = e.files.map(x => `💾 \`${x.name}\``);
    const name = (chan === "saga-imperivm" ? `[${e.section.replace(/ IMPERIVM /, " ")}] ` : "") + e.title + (e.count > 1 ? ` (${e.count} maps)` : "") + (e.year ? ` (${e.year})` : "");
    const src = [`[Discord](${e.discord})`, ...f.map(u => `[forum](${u})`)].join(" · ");
    out.push(row(name, e.author || "? (saga original)", e.base?.replace("Imperivm ", "") || "?", src, [...files, dl(other).replace(/^—$/, "")].filter(Boolean).join("<br>") || "—"));
  }
  out.push("");
}

// --- Forum: topics with downloads that are not on Discord
const SECT = { f37: "Forum · Map downloads (not on Discord)", other: "Forum · Modding, contributions and resources (review whether they are mods)" };
for (const [key, title] of Object.entries(SECT)) {
  const ts = Object.values(forum).filter(t => (key === "f37") === t.subforum.startsWith("f37-") && !covered.has(String(t.id)) && !bigMods.has(String(t.id))
    && !t.subforum.match(/^f4[47]-|^f[56]-|^f41-/))
    .map(t => ({ t, us: topicLinks(String(t.id)) })).filter(x => x.us.length).sort((a, b) => a.t.id - b.t.id);
  out.push(`## ${title}\n`, HEAD);
  for (const { t, us } of ts) out.push(row(t.title, t.author, "?", `[forum](${FORUM}${t.path})`, dl(us)));
  out.push("");
}

fs.writeFileSync(OUT, out.join("\n"));
const s = Object.values(links);
console.log(`MODS.md: ${n} rows · links alive ${s.filter(x => x.ok).length}, dead ${s.filter(x => x.ok === false).length}, doubtful ${s.filter(x => x.ok === null).length}`);
