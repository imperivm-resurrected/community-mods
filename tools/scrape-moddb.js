// List everything on ModDB for the Imperivm games (mods, addons, downloads, and each mod's own files) -> raw/moddb.json
//   node tools/scrape-moddb.js
// ModDB sits behind a Cloudflare check: open https://www.moddb.com in a browser on CDP port 9333 and run
// `agent-browser connect 9333` first; curl then reuses that browser's cookies and user agent.
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const OUT = path.join(__dirname, "..", "raw", "moddb.json");
// Imperivm III (GBR/HD), and Imperivm I and II under their English names (their mods do not run on GBR, but
// some are adventures ported to it)
const GAMES = ["imperivm-great-battles-of-rome", "celtic-kings-the-punic-wars", "celtic-kings-rage-of-war"];

const ab = (...a) => spawnSync("agent-browser", a, { encoding: "utf8" }).stdout;
let cookies, ua;
try {
  cookies = JSON.parse(ab("cookies", "get", "--json")).data.cookies.filter(c => /moddb\.com$/.test(c.domain)).map(c => `${c.name}=${c.value}`).join("; ");
  ua = JSON.parse(ab("eval", "navigator.userAgent"));
} catch { console.error("no browser: open moddb.com on CDP port 9333 and run `agent-browser connect 9333`"); process.exit(1); }
const get = rel => {
  const r = spawnSync("curl", ["-s", "-A", ua, "-H", `Cookie: ${cookies}`, "-w", "\n%{http_code}", "https://www.moddb.com" + rel], { encoding: "utf8", maxBuffer: 64e6 });
  const code = +r.stdout.slice(r.stdout.lastIndexOf("\n") + 1);
  if (code === 403) { console.error("403 from Cloudflare: reload moddb.com in the browser"); process.exit(1); }
  return code === 200 ? r.stdout : "";
};
const decode = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
// one listing row: <h4><a href="...">title</a>, last update <time datetime>, then the summary <p>
const rows = html => html.split(/<div class="row rowcontent/).slice(1).map(r => ({
  url: (r.match(/<h4><a href="([^"]+)"/) || [])[1],
  title: decode((r.match(/<h4><a href="[^"]+">([^<]*)/) || [])[1] || ""),
  updated: (r.match(/<time datetime="([^"]+)"/) || [])[1]?.slice(0, 10),
  released: (r.match(/<time datetime="([^"]+)">Released/) || [])[1],
  summary: decode((r.match(/<p>([^<]*)<\/p>/) || [])[1] || ""),
})).filter(x => x.url);
const list = base => { // every page of a listing
  const all = [];
  for (let p = 1; ; p++) {
    const got = rows(get(p === 1 ? base : `${base}/page/${p}`)).filter(x => !all.some(y => y.url === x.url));
    if (!got.length) return all;
    all.push(...got);
  }
};

const items = [];
const add = (kind, where, xs) => { for (const x of xs) if (!items.some(y => y.url === x.url)) items.push({ kind, where, ...x }); };
for (const g of GAMES) {
  for (const kind of ["mods", "addons", "downloads"]) add(kind.replace(/s$/, ""), g, list(`/games/${g}/${kind}`));
  console.log(g, items.filter(x => x.where === g).length);
}
for (const m of items.filter(x => x.kind === "mod")) {
  for (const kind of ["addons", "downloads"]) add(kind.replace(/s$/, ""), m.url, list(`${m.url}/${kind}`));
  console.log(m.url, items.filter(x => x.where === m.url).length);
}
fs.writeFileSync(OUT, JSON.stringify(items, null, 1) + "\n");
console.log(items.length, "items ->", path.relative(process.cwd(), OUT));
