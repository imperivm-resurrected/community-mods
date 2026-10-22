// Shared by scrape-forum.js and scrape-forum-it.js: fetch with retries, HTML text, and the resumable crawl loop.
const fs = require("fs");
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Node has no HTML entity decoder. These are the ones the two forums actually use (checked 2026-10-22); unknown ones stay as they are.
const NAMED = { nbsp: "\u00a0", quot: '"', amp: "&", lt: "<", gt: ">", apos: "'", raquo: "»", laquo: "«", copy: "©", plus: "+",
  egrave: "è", eacute: "é", agrave: "à", igrave: "ì", ograve: "ò", ugrave: "ù", aacute: "á", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ" };
const unescape = s => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (m, d, h, n) =>
  d ? String.fromCodePoint(+d) : h ? String.fromCodePoint(parseInt(h, 16)) : NAMED[n] ?? m);
const text = s => unescape(s.replace(/<[^>]+>/g, " ")).trim();

// get(path) -> page text, "" after 3 failures or when the account has no access (401/403).
const makeGet = (base, headers, charset) => async path => {
  for (let i = 0; i < 3; i++) {
    try {
      await sleep(1000);
      const r = await fetch(base + path, { headers, signal: AbortSignal.timeout(30000) });
      if (r.status === 401 || r.status === 403) { console.log("no access", path); return ""; } // e.g. a private section
      if (!r.ok) throw new Error("HTTP " + r.status);
      return new TextDecoder(charset).decode(await r.arrayBuffer());
    } catch (e) {
      console.log("retry", path, e.message);
      await sleep(5000);
    }
  }
  return "";
};

// Topics of each section, then posts of each topic not yet in `out` (resumable). sections: [{ label, topics: () => Promise<topic[]> }]
async function crawl(out, sections, postsOf) {
  out = process.env.SCRAPE_OUT || out; // SCRAPE_OUT: write somewhere else (to compare with a previous run)
  let data = {};
  try { data = JSON.parse(fs.readFileSync(out, "utf8")); } catch { /* first run */ }
  for (const sec of sections) {
    for (const t of await sec.topics()) {
      if (data[t.id]) continue;
      t.posts = await postsOf(t);
      t.author = t.posts[0]?.author || "";
      data[t.id] = t;
      fs.writeFileSync(out, JSON.stringify(data, null, 1));
      console.log(Object.keys(data).length, t.subforum, "|", t.title.slice(0, 60), "|", t.posts.reduce((n, p) => n + p.links.length, 0), "links");
    }
  }
}

module.exports = { sleep, unescape, text, makeGet, crawl };
