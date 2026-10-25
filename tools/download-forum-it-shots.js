// Screenshots of the Italian forum rows in MODS.md: the images in the topic's opening post (the author's, not the avatar, smileys or
// the forum's own icons) -> originals/forum/<key>/screenshots/ (<key> = the row's name, slugged, like tools/download-forum.js),
// listed in raw/forum-it-shots.json, and "📷 N" added to the row. Polite: one request per second. Dead image hosts (ImageShack,
// TinyPic...) are skipped. Needs FORUM_IT_COOKIE (the topics are behind a login).
//   FORUM_IT_COOKIE=... node tools/download-forum-it-shots.js
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), BASE = "https://imperivmeditor.forumcommunity.net";
const LIST = path.join(ROOT, "raw", "forum-it-shots.json"), MODS = path.join(ROOT, "docs", "MODS.md");
const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sleep = ms => new Promise(r => setTimeout(r, ms));
// the forum's own pictures: smileys, buttons, rank badges, the "download" banner
const UI = /\/emoji\/|\/FORUM-IMPERIVM\/images|\/IMP-EDITOR\/Images|SGA-FORUM|style_images|img\.forumfree\.net|\/images\/download|button\.moddb\.com|trollface|totalwar\.png|\.gif(\?|$)/i;
const cookie = process.env.FORUM_IT_COOKIE;
if (!cookie) { console.error("set FORUM_IT_COOKIE (the browser's forumcommunity.net cookies)"); process.exit(1); }
const UA = { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/154.0 Safari/537.36" };
const abs = u => u.replace(/&amp;/g, "&").replace(/^\/\//, "https://");

(async () => {
  let list = {};
  try { list = JSON.parse(fs.readFileSync(LIST, "utf8")); } catch { /* first run */ }
  const lines = fs.readFileSync(MODS, "utf8").split("\n");
  const start = lines.findIndex(l => l.startsWith("## Italian forum")), end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
  let got = 0;
  for (let i = start; i < end; i++) {
    const c = lines[i].split("|");
    const topic = (c[6] || "").match(/forumcommunity\.net\/\?t=(\d+)/)?.[1];
    if (!topic || !/^\s*\d+\s*$/.test(c[1])) continue;
    const key = slug(c[2].trim());
    if (!list[key]) { // done before: delete the key in raw/forum-it-shots.json to retry it
      let html = "";
      try { html = new TextDecoder("windows-1252").decode(await (await fetch(`${BASE}/?t=${topic}`, { headers: { ...UA, Cookie: cookie }, signal: AbortSignal.timeout(30000) })).arrayBuffer()); }
      catch { console.log("FAIL topic", topic); continue; }
      await sleep(1000);
      const first = html.split(/<li id="ee\d+" class="post/)[1]?.split(/<div class="signature|<tr class="title2 bottom"/)[0] || "";
      const body = first.split('<table class="color"')[1] || "";
      const urls = [...new Set([...body.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m => abs(m[1])))].filter(u => /^https?:/.test(u) && !UI.test(u));
      list[key] = [];
      const dir = path.join(ROOT, "originals", "forum", key, "screenshots");
      for (const [n, u] of urls.entries()) {
        try {
          const r = await fetch(u, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(20000) });
          const type = r.headers.get("content-type") || "", buf = Buffer.from(await r.arrayBuffer());
          if (!r.ok || !type.startsWith("image/")) { list[key].push({ url: u, local: null }); continue; } // dead host
          if (buf.length < 4000) continue; // an icon, not a screenshot
          const ext = (type.split("/")[1] || "img").replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "");
          const name = `${String(n + 1).padStart(2, "0")}-${path.basename(new URL(u).pathname).replace(/\.[^.]*$/, "").replace(/[^\w.-]+/g, "_").slice(0, 60) || "img"}.${ext}`;
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, name), buf);
          list[key].push({ url: u, local: path.relative(ROOT, path.join(dir, name)) });
          got++;
        } catch { list[key].push({ url: u, local: null }); }
        await sleep(400);
      }
      fs.writeFileSync(LIST, JSON.stringify(list, null, 1));
      console.log(key, list[key].filter(s => s.local).length, "of", urls.length);
    }
    const n = (list[key] || []).filter(s => s.local).length;
    if (n && !/📷/.test(c[7])) { c[7] = c[7].replace(/\s+$/, "") + `<br>📷 ${n} `; lines[i] = c.join("|"); }
  }
  fs.writeFileSync(MODS, lines.join("\n"));
  const all = Object.values(list);
  console.log(`${got} new images · rows with screenshots ${all.filter(s => s.some(x => x.local)).length} of ${all.length}`);
})();
