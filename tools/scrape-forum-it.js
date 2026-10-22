// Crawl the content sections of the Italian forum imperivmeditor.forumcommunity.net (ex Imperivm World) -> raw/forum-it.json,
// plus its Downloads table -> raw/forum-it-downloads.json. Sections need a login: export the browser's forumcommunity.net
// cookies as FORUM_IT_COOKIE ("name=value; name=value"). Every external link of every post is kept with its poster.
// Resumable: topics already in raw/forum-it.json are skipped.
//   FORUM_IT_COOKIE=... node tools/scrape-forum-it.js [f<id> ...]   (only those sections)
const fs = require("fs"), path = require("path");
const { unescape, text, makeGet, crawl } = require("./scrape-common");

const BASE = "https://imperivmeditor.forumcommunity.net";
// id -> name. Left out: rules, introductions, chat (Agorà, Locanda, Spam...), other games, replays and online matches.
// No access with a normal account: Wikimperivm, Private LAB, Graphic LAB, Materiale grafico (the crawl says "no access")
const SUBFORUMS = {
  8926117: "Downloads", 9074753: "Wikimperivm", 8967003: "Tutorial e assistenza generale", 8967171: "Assistenza",
  8558735: "Tutorial", 8902764: "Tutorial di base (editor)", 8902768: "Tutorial avanzati (editor)",
  8904176: "Scenari", 8902833: "Avventure & Conquiste", 8558736: "Mappe degli Eroi", 8562955: "Mappe create da supreme19",
  8563979: "Domande sulle mappe di supreme19", 8562956: "Mappe create da CaptainHighlander",
  8563978: "Domande sulle mappe di CaptainHighlander", 8562957: "Mappe create da TheMaster0017",
  8563977: "Domande sulle mappe di TheMaster0017", 8938371: "Mappe create da Rázor", 8938372: "Domande sulle mappe di Rázor",
  8562958: "Mappe create da Ïmpë", 8563976: "Domande sulle mappe di Ïmpë", 9075002: "Mappe dei Pretoriani",
  9074999: "Mappe dei Nobili", 8632445: "Mappe dei Princeps", 9075000: "Mappe dei Legionari",
  8558738: "Materiale", 8675652: "Sequenze predefinite", 8902898: "Collaborazioni Mappe", 8558737: "Assistenza Editor",
  8572729: "Assistenza per sviluppo di sequenze", 8678404: "Assistenza grafica", 8903391: "Assistenza generica",
  8938224: "Laboratorio", 8926183: "Private LAB", 8904780: "Graphic LAB", 8974473: "Materiale grafico",
  8998642: "Greek Civilization Mod Projects", 8954091: "Old Projects", 8902995: "Archivio Mods Imperivm World",
  8904179: "Altre MOD", 8629973: "Tutorial e utilità Mod", 8938558: "Assistenza Mod",
};
// page furniture, avatars and emoji: not downloads
const SKIP_HOSTS = /forumcommunity|forumfree|illipro|consentframework|gstatic|googleapis|facebook|twitter|youtube|youtu\.be|sgaclangbr\.altervista\.org\/(FORUM|IMP)|imperivmworld\.altervista\.org\/(images|forum)|iubenda|addtoany/i;
const IMG = /\.(png|jpe?g|gif|bmp|webp)(\?|$)/i;
const GUESTBOOK = "58960908"; // "Libro delle visite": pinned in every section, thousands of greetings
const OUT = path.join(__dirname, "..", "raw", "forum-it.json");
const cookie = process.env.FORUM_IT_COOKIE;
if (!cookie) { console.error("set FORUM_IT_COOKIE (the browser's forumcommunity.net cookies)"); process.exit(1); }
const get = makeGet(BASE, { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/154.0 Safari/537.36", Cookie: cookie }, "windows-1252");

async function topicsOf(fid) {
  const seen = new Map(), subforum = `${fid} ${SUBFORUMS[fid] || ""}`.trim();
  for (let st = 0; ; ) {
    const s = await get(`/?f=${fid}${st ? "&st=" + st : ""}`);
    let fresh = 0;
    for (const [, tid, title] of s.matchAll(/<a href="\/\?t=(\d+)(?:&amp;view=getlastpost#lastpost)?"[^>]*>(.*?)<\/a>/gs))
      if (!seen.has(tid) && tid !== GUESTBOOK && !title.includes("help.forumfree")) {
        seen.set(tid, { id: +tid, path: `/?t=${tid}`, title: text(title).replace(/\s+/g, " "), subforum });
        fresh++;
      }
    const pages = s.match(new RegExp(`page_jump\\('[^']*f=${fid}',(\\d+),(\\d+)\\)`));
    st += 30;
    if (!fresh || !pages || st >= pages[1] * pages[2]) return [...seen.values()];
  }
}

async function postsOf(topic) {
  const posts = [], seen = new Set();
  for (let st = 0; ; ) {
    const s = await get(topic.path + (st ? "&st=" + st : ""));
    const pages = s.match(/page_jump\('[^']*',(\d+),(\d+)\)/);
    let fresh = 0;
    for (const [, pid, ch] of s.matchAll(/<li id="ee(\d+)" class="post[^"]*">(.*?)(?=<li id="ee\d+" class="post|<\/ul>|$)/gs)) {
      if (seen.has(pid)) continue;
      seen.add(pid); fresh++;
      const author = ch.match(/<div class="nick">(.*?)<\/div>/s), date = ch.match(/<span class="when" title="([^"]*)"/);
      const body = ch.match(/<table class="color"[^>]*>(.*?)(?=<div class="signature|<tr class="title2 bottom"|$)/s)?.[1] || "";
      const plain = text(body.replace(/<br\s*\/?>/g, "\n")).replace(/[ \t]+/g, " ");
      const found = [...body.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => unescape(m[1]))
        .concat((plain.match(/https?:\/\/[\w\-.~:/?#[\]@!$&'()*+,;=%]+/g) || []).filter(u => !u.includes("...")).map(u => unescape(u).replace(/[.,;)\]]+$/, ""))); // the forum shortens long link texts with "...": only hrefs are whole
      const links = [...new Set(found.filter(u => !SKIP_HOSTS.test(u) && !IMG.test(u)))].sort();
      const shots = [...new Set([...body.matchAll(/<img[^>]*src="(https?:\/\/[^"]+)"/g)].map(m => m[1])
        .filter(u => IMG.test(u) && !SKIP_HOSTS.test(u) && !u.includes("/emoji/")))].sort();
      const inner = [...new Set([...body.matchAll(/href="(\?[ft]=\d+[^"]*)"/g)].map(m => m[1]))].sort(); // "download is in Downloads"
      posts.push({ id: +pid, author: author ? text(author[1]) : "", date: date ? date[1] : "", links, shots, inner,
        text: links.length || !posts.length ? plain.slice(0, 4000) : "" });
    }
    st += 15;
    if (!fresh || !pages || st >= pages[1] * pages[2]) return posts;
  }
}

// The Downloads section is one page with a table (title, author, link) under headings (Avventure, Conquiste...), not topics.
async function downloadsTable() {
  const s = await get("/?f=8926117"), rows = [];
  for (const sec of s.split("<div class='section_wiki'>").slice(1)) { // "1. Aggiornamenti", "2. Avventure", "3. Conquiste"...
    const section = text(sec.split("</div>")[0]).split(".").slice(1).join(".").trim();
    for (const [tr] of sec.matchAll(/<tr class="td_download_normal"[^>]*>.*?<\/tr>/gs)) {
      const cells = [...tr.matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map(m => m[1]), link = tr.match(/href="(https?:\/\/[^"]+)"/);
      if (link && cells.length >= 3) rows.push({ section, title: text(cells[0]), author: text(cells[1]), link: unescape(link[1]) });
    }
  }
  return rows;
}

(async () => {
  const only = process.argv.slice(2).map(a => +a.replace(/^f/, ""));
  if (!only.length || only.includes(8926117)) {
    const rows = await downloadsTable();
    fs.writeFileSync(path.join(path.dirname(process.env.SCRAPE_OUT || OUT), "forum-it-downloads.json"), JSON.stringify(rows, null, 1));
    console.log("downloads table:", rows.length, "rows");
  }
  await crawl(OUT, Object.keys(SUBFORUMS).filter(f => !only.length || only.includes(+f)).map(f => ({ topics: () => topicsOf(+f) })), postsOf);
})();
