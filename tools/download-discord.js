// Download Discord attachments (signed CDN URLs expire ~24h) into originals/discord/<channel>/<slug>/
const fs = require("fs"), path = require("path");
const entries = require("../raw/discord-entries.json");
const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
(async () => {
  for (const e of entries) {
    e.slug = slug(e.title);
    for (const f of e.files) {
      const dir = path.join(__dirname, "../originals/discord", e.channel, e.slug), out = path.join(dir, f.name);
      f.local = path.relative(path.join(__dirname, ".."), out);
      if (fs.existsSync(out) && fs.statSync(out).size === f.size) continue;
      fs.mkdirSync(dir, { recursive: true });
      const r = await fetch(f.url);
      if (!r.ok) { console.log("FAIL", r.status, e.title, f.name); f.local = null; continue; }
      fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
      await new Promise(r => setTimeout(r, 300));
    }
  }
  fs.writeFileSync(path.join(__dirname, "../raw/discord-entries.json"), JSON.stringify(entries, null, 1));
  console.log("ok", entries.flatMap(e => e.files).filter(f => f.local).length, "files");
})();
