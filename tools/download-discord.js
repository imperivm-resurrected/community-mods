// Download Discord attachments (signed CDN URLs expire ~24h) into originals/discord/<channel>/<slug>/
const fs = require("fs"), path = require("path");
const entries = require("../raw/discord-entries.json");
const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// The slug is the mod id (wrap-map.js), so it must be unique across channels (saga ids get a "saga-" prefix there).
// Same title twice -> add the author; same author too -> -2, -3...
const key = e => (e.channel === "saga-imperivm" ? "saga:" : "") + slug(e.title);
const count = {};
for (const e of entries) count[key(e)] = (count[key(e)] || 0) + 1;
const taken = new Set();
for (const e of entries) {
  let s = slug(e.title);
  if (count[key(e)] > 1) s += "-" + slug(e.author || "anon");
  const base = s;
  for (let i = 2; taken.has((e.channel === "saga-imperivm" ? "saga:" : "") + s); i++) s = `${base}-${i}`;
  taken.add((e.channel === "saga-imperivm" ? "saga:" : "") + s);
  e.slug = s;
}
(async () => {
  for (const e of entries) {
    for (const f of [...e.files, ...(e.shots || [])]) {
      const dir = path.join(__dirname, "../originals/discord", e.channel, e.slug, e.shots?.includes(f) ? "screenshots" : ""), out = path.join(dir, f.name);
      const old = f.local && path.join(__dirname, "..", f.local);
      f.local = path.relative(path.join(__dirname, ".."), out);
      fs.mkdirSync(dir, { recursive: true });
      if (old && old !== out && !fs.existsSync(out) && fs.existsSync(old)) fs.renameSync(old, out); // slug changed: move, URLs expire
      // already here: keep it (Discord serves images recompressed, so sizes differ; URLs expire, so never re-fetch)
      if (fs.existsSync(out) && fs.statSync(out).size > 0) continue;
      const r = await fetch(f.url);
      if (!r.ok) { console.log("FAIL", r.status, e.title, f.name); f.local = null; continue; }
      fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
      await new Promise(r => setTimeout(r, 300));
    }
  }
  fs.writeFileSync(path.join(__dirname, "../raw/discord-entries.json"), JSON.stringify(entries, null, 1));
  console.log("ok", entries.flatMap(e => [...e.files, ...(e.shots || [])]).filter(f => f.local).length, "files");
})();
