// Crawl the subforums of imperivmgbr.foroactivo.com (the Spanish forum) -> raw/forum.json.
// Links are hidden from guests: export the browser's forum cookies as FORUM_COOKIE ("name=value; name=value").
// Every external link of every post is kept with its poster, so later updates by the author are not lost.
// Resumable: topics already in raw/forum.json are skipped.
//   FORUM_COOKIE=... node tools/scrape-forum.js [f<id> ...]   (only those subforums)
const path = require("path");
const { unescape, text, makeGet, crawl } = require("./scrape-common");

const BASE = "https://imperivmgbr.foroactivo.com";
const SUBFORUMS = ["f37-descarga-de-mapas", "f24-modificacion-de-estructuras-tecnologias-unidades-y-objetos",
  "f1-creacion-de-nuevas-unidades-y-edificios", "f23-proyectos-sugerencias-y-reparacion-de-bugs",
  "f31-guias-y-recursos-para-el-editor", "f3-cgwar-greek-civilization-mod", "f6-descarga-e-informacion",
  "f4-rattlesmake-greek-civilization-mod", "f5-descarga-e-informacion", "f46-asvrmod-wrath-of-the-gods",
  "f47-descarga-e-informacion", "f40-mod-de-la-comunidad-imperivm-mci", "f41-descarga-e-informacion",
  "f25-aportes-de-la-comunidad", "f43-imperium-iii-mod-la-reconquista", "f44-descarga-e-informacion",
  // support and general sections (added 2026-10-21). t1412 (Greek Mod v2.0) is in an admin-only forum: no scrape reaches it
  "f32-ayuda-con-el-editor-scripts-y-programacion", "f38-proyectos-preguntas-y-sugerencias",
  "f42-consultas-sugerencias-y-reporte-de-bugs", "f45-consultas-sugerencias-y-reporte-de-bugs",
  "f48-consultas-sugerencias-y-reporte-de-bugs", "f49-temas-generales", "f50-imperium-gbr-hd-steam",
  "f7-consultas-sugerencias-y-reporte-de-bugs", "f8-consultas-sugerencias-y-reporte-de-bugs", "f9-nos-mudamos-a-discord"];
const SKIP_HOSTS = /foroactivo|forumotion|servimg|2img\.net|ibb\.co|imgur|imageshack|photobucket|tinypic|postimg|consentframework|illipro|directorio-foros|gstatic|googleapis|facebook|twitter|phpbb9|youtube|youtu\.be/i;
const OUT = path.join(__dirname, "..", "raw", "forum.json");
const get = makeGet(BASE, { "User-Agent": "Mozilla/5.0", Cookie: process.env.FORUM_COOKIE || "" }, "utf-8");

async function topicsOf(sub) {
  const [fid, slug] = [sub.split("-")[0], sub.slice(sub.indexOf("-") + 1)];
  const seen = new Map();
  for (let page = 0; ; page += 50) {
    const s = await get(`/${fid}${page ? "p" + page : ""}-${slug}`);
    let fresh = 0;
    for (const m of s.matchAll(/href="\/(t(\d+)-[^"#?]*)"[^>]*class="topictitle"[^>]*>(.*?)<\/a>|class="topictitle"[^>]*href="\/(t(\d+)-[^"#?]*)"[^>]*>(.*?)<\/a>/gs)) {
      const [p, tid, title] = m[1] ? [m[1], m[2], m[3]] : [m[4], m[5], m[6]];
      if (!seen.has(tid)) { seen.set(tid, { id: +tid, path: "/" + p, title: text(title), subforum: sub }); fresh++; }
    }
    if (!fresh || !s.includes(`/${fid}p${page + 50}-`)) return [...seen.values()];
  }
}

async function postsOf(topic) {
  const posts = [], pageOf = n => topic.path.replace(/^\/t(\d+)-/, `/t$1p${n}-`);
  for (let page = 0; ; ) {
    const s = await get(page ? pageOf(page) : topic.path);
    const chunks = s.split('<tr class="post post--').slice(1);
    for (const ch of chunks) {
      const pid = ch.match(/^(\d+)/), author = ch.match(/<span class="name">.*?<strong>(.*?)<\/strong>/s);
      const date = ch.match(/Tema: .*?\/>\s*([^<]+?)<\/span>/s);
      const body = ch.match(/<div class="postbody">(.*?)<div class="clear">/s)?.[1] || "";
      const plain = text(body.replace(/<br\s*\/?>/g, "\n"));
      const found = [...body.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => m[1])
        .concat(plain.match(/https?:\/\/[\w\-.~:/?#[\]@!$&'()*+,;=%]+/g) || []);
      const links = [...new Set(found.filter(u => !SKIP_HOSTS.test(u)).map(u => unescape(u).replace(/[.,;)\]]+$/, "")))].sort();
      posts.push({ id: pid ? +pid[1] : 0, author: author ? text(author[1]) : "", date: date ? text(date[1]) : "", links,
        text: links.length ? plain : posts.length ? "" : plain.slice(0, 600) });
    }
    page += 25;
    if (!chunks.length || !s.includes(pageOf(page))) return posts;
  }
}

const only = process.argv.slice(2);
crawl(OUT, SUBFORUMS.filter(s => !only.length || only.includes(s.split("-")[0])).map(sub => ({ topics: () => topicsOf(sub) })), postsOf);
