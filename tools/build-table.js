// raw/*.json -> MODS.md (first draft). After you start editing MODS.md by hand, don't re-run without --force.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "MODS.md");
if (fs.existsSync(OUT) && !process.argv.includes("--force")) { console.error("MODS.md ya existe; usa --force para sobrescribir"); process.exit(1); }

const entries = require("../raw/discord-entries.json");
const forum = require("../raw/forum.json");
const links = (() => { try { return require("../raw/links.json"); } catch { return {}; } })();
const FORO = "https://imperivmgbr.foroactivo.com";
const cell = s => String(s ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const mark = u => { const l = links[u]; return !l ? "❔" : l.ok ? "✅" : l.ok === false ? "❌" : "⚠️"; };
const host = u => u.replace(/^https?:\/\/(www\.)?/, "").split(/[/.]/)[0];
const dl = us => us.length ? us.map(u => `${mark(u)} [${host(u)}](${u})`).join("<br>") : "—";
const forumId = u => u.match(/foroactivo\.com\/t(\d+)/)?.[1];
const HEAD = "| # | Nombre | Autor(es) | Base | Fuente | Descarga | Permiso | Estado | GameBanana |\n|---|---|---|---|---|---|---|---|---|";
const out = [];
let n = 0;
const row = (name, author, base, source, download, permiso = "❔") =>
  `| ${++n} | ${cell(name)} | ${cell(author)} | ${cell(base)} | ${source} | ${download} | ${permiso} | 📋 por portear | |`;

out.push(`# Mods para portear a Imperivm Resurrected

Generado el ${new Date().toISOString().slice(0, 10)} a partir del Discord *Imperivm III Editores* y de [${FORO.replace("https://", "")}](${FORO}).
Desde aquí se edita a mano.

**Descarga**: ✅ vivo · ❌ muerto · ⚠️ dudoso (revisar a mano) · ❔ sin comprobar · 💾 copia local en \`originals/\`.
**Permiso**: ✅ concedido o licencia libre · ❌ denegado · ❔ sin pedir · 🕐 pedido, esperando.
**Estado**: 📋 por portear · 🔧 porteado (falta subir) · ✅ subido a GameBanana · 🚫 no se puede portear.
`);

// --- Mods grandes (lista a mano: son pocos y cada uno es un mundo)
const v12 = "https://mega.nz/file/bB1UUYYB#m1swkkwZ5SUsU4WWIl4yBZ1OjBM-CZ2DJMkN5dYReYE";
const ch = id => `https://discord.com/channels/479629904657514526/${id}`;
const topicLinks = id => [...new Set((forum[id]?.posts || []).filter(p => p.author === forum[id].author).flatMap(p => p.links))];
out.push("## Mods\n", HEAD,
  row("Community Mod v12", "Ferónidas y comunidad", "HD vRelease 1.0", `[Discord](${ch("915050595713429534")})`, dl([v12])),
  row("Caesar Mod 1.1.0", "Paulus Ludorum (Paolo Lamberto) + creadores del Greek Mod", "HD", `[Discord](${ch("1416185549873610823")})`,
    dl(["https://www.moddb.com/mods/caesar-mod/downloads/caesar-mod-110"]), "✅ CC BY-SA 4.0"),
  row("Imperivm Legacy 2.4.1", "Nicoghiro31", "HD 1.0", `[Discord](${ch("1142861080880763060")})`, dl(["https://www.moddb.com/mods/imperivm-legacy/downloads"])),
  row("Greek Civilization Mod v1.8", "Rattlesmake", "1.40 y 1.5+ (Steam)", `[foro](${FORO}/t1207)`, dl(topicLinks("1207"))),
  row("CGWAR Greek Civilization Mod v6", "Camarada y equipo CGWAR", "solo 1.40", `[foro](${FORO}/t1354)`, dl(topicLinks("1354"))),
  row("AsvrMod VI: Wrath of the Gods", "Asvr", "1.40", `[foro](${FORO}/t731)`, dl(topicLinks("731"))),
  row("Mod Comunidad Imperivm (MCI) 2010-2013", "comunidad del foro", "1.40", `[foro](${FORO}/t262)`, dl(topicLinks("262"))),
  row("La Reconquista 2010", forum["71"]?.author || "?", "1.40", `[foro](${FORO}/f44-descarga-e-informacion)`,
    dl(Object.values(forum).filter(t => t.subforum.startsWith("f44")).flatMap(t => topicLinks(String(t.id))))),
  "");
const bigMods = new Set(["1207", "1354", "731", "262"]);

// --- Discord: mapas y aventuras (ya curados por Ferónidas, con archivo adjunto descargado)
const covered = new Set();
const groups = [["saga-imperivm", "Saga Imperivm (mapas y aventuras de Imperivm I y II)"], ["mapas", "Mapas"], ["aventuras", "Aventuras"]];
for (const [chan, title] of groups) {
  out.push(`## ${title}\n`, HEAD);
  for (const e of entries.filter(x => x.channel === chan)) {
    const f = e.links.filter(u => forumId(u)); f.forEach(u => covered.add(forumId(u)));
    const other = e.links.filter(u => !forumId(u));
    const files = e.files.map(x => `💾 \`${x.name}\``);
    const name = (chan === "saga-imperivm" ? `[${e.section.replace(/ IMPERIVM /, " ")}] ` : "") + e.title + (e.count > 1 ? ` (${e.count} mapas)` : "") + (e.year ? ` (${e.year})` : "");
    const src = [`[Discord](${e.discord})`, ...f.map(u => `[foro](${u})`)].join(" · ");
    out.push(row(name, e.author || "? (original de la saga)", e.base?.replace("Imperivm ", "") || "?", src, [...files, dl(other).replace(/^—$/, "")].filter(Boolean).join("<br>") || "—"));
  }
  out.push("");
}

// --- Foro: temas con descargas que no están en Discord
const SECT = { f37: "Foro · Descarga de mapas (no están en Discord)", other: "Foro · Modding, aportes y recursos (revisar si son mods)" };
for (const [key, title] of Object.entries(SECT)) {
  const ts = Object.values(forum).filter(t => (key === "f37") === t.subforum.startsWith("f37-") && !covered.has(String(t.id)) && !bigMods.has(String(t.id))
    && !t.subforum.match(/^f4[47]-|^f[56]-|^f41-/))
    .map(t => ({ t, us: topicLinks(String(t.id)) })).filter(x => x.us.length).sort((a, b) => a.t.id - b.t.id);
  out.push(`## ${title}\n`, HEAD);
  for (const { t, us } of ts) out.push(row(t.title, t.author, "?", `[foro](${FORO}${t.path})`, dl(us)));
  out.push("");
}

fs.writeFileSync(OUT, out.join("\n"));
const s = Object.values(links);
console.log(`MODS.md: ${n} filas · enlaces vivos ${s.filter(x => x.ok).length}, muertos ${s.filter(x => x.ok === false).length}, dudosos ${s.filter(x => x.ok === null).length}`);
