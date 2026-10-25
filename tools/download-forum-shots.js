// Screenshots of each forum topic in MODS.md/MISSING.md: images in the opening post (the author's), without the signature
// or the forum's own icons -> originals/forum/t<id>/screenshots/, listed in raw/forum-entries.json ("shots").
// Polite: one request per second. Many 2009-2013 image hosts are gone, so dead images are skipped.
//   node tools/download-forum-shots.js
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), FORUM = "https://imperivmgbr.foroactivo.com";
const OUT = path.join(ROOT, "raw", "forum-entries.json");
const entries = require(OUT);
const UI = /(^|\.)(2img\.net|illiweb\.com|forumotion\.com|foroactivo\.com|hitskin\.com|googleusercontent\.com\/proxy)$/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hostOf = u => { try { return new URL(u).hostname; } catch { return ""; } }; // "" = malformed, skipped
const get = async u => { const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow", signal: AbortSignal.timeout(20000) }); return r; };

(async () => {
  // forum-only rows: rows from Discord already have their screenshots
  const ids = new Set();
  for (const f of ["MODS.md", "MISSING.md"]) for (const l of fs.readFileSync(path.join(ROOT, "docs", f), "utf8").split("\n")) {
    const m = !l.includes("[Discord](") && l.match(/^\| \d+ \|.*foroactivo\.com\/t(\d+)-/);
    if (m) ids.add(m[1]);
  }
  let got = 0;
  for (const id of [...ids].filter(i => entries[i])) {
    const e = entries[id];
    if (e.shots) continue; // done before (delete "shots" from the entry to retry it)
    let html;
    try { html = await (await get(FORUM + e.path)).text(); } catch { console.log("FAIL topic", id); continue; }
    await sleep(1000);
    const first = html.split('<div class="postbody">')[1]?.split(/class="signature_div"|<div class="sign/)[0] || "";
    const urls = [...new Set([...first.matchAll(/<img\b[^>]*\bsrc="(https?:\/\/[^"]+)"/g)].map(m => m[1].replace(/&amp;/g, "&")))]
      .filter(u => hostOf(u) && !UI.test(hostOf(u)));
    e.shots = [];
    const dir = path.join(ROOT, "originals", "forum", `t${id}`, "screenshots");
    for (const [i, u] of urls.entries()) {
      try {
        const r = await get(u);
        const type = r.headers.get("content-type") || "";
        const buf = Buffer.from(await r.arrayBuffer());
        if (!r.ok || !type.startsWith("image/")) { e.shots.push({ url: u, local: null }); continue; } // dead host
        if (buf.length < 4000) continue; // icon (rating stars, smileys, bullets), not a screenshot
        const ext = (type.split("/")[1] || "img").replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "");
        const name = `${String(i + 1).padStart(2, "0")}-${path.basename(new URL(u).pathname).replace(/\.[^.]*$/, "").replace(/[^\w.-]+/g, "_").slice(0, 60) || "img"}.${ext}`;
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, name), buf);
        e.shots.push({ url: u, local: path.relative(ROOT, path.join(dir, name)) });
        got++;
      } catch { e.shots.push({ url: u, local: null }); }
      await sleep(400);
    }
    fs.writeFileSync(OUT, JSON.stringify(entries, null, 1));
  }
  const all = [...ids].map(i => entries[i]).filter(Boolean);
  console.log(`${got} new images · topics with screenshots ${all.filter(e => e.shots?.some(s => s.local)).length} of ${all.length}`);
})();
