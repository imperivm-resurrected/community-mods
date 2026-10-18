// Check every download link in raw/forum.json + raw/discord.json -> raw/links.json { url: {ok, status, size?, name?, checked} }
// ok: true = alive, false = dead, null = unknown (needs a manual look)
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "../raw/links.json");
const DEAD_HOSTS = /megaupload|rapidshare|hotfile|fileserve|filesonic|uploaded\.to|zippyshare|depositfiles|yfrog|iespana|webcindario|palimpalem|es\.tl/i;
const UA = { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/150 Safari/537.36" };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function mega(url) {
  // mega.nz/file/ID#key | mega.nz/#!ID!key | mega.nz/folder/ID#key | mega.nz/#F!ID!key
  const folder = /\/folder\/|#F!/.test(url);
  const id = url.match(/(?:\/(?:file|folder)\/|#F?!)([\w-]{8})/)?.[1];
  if (!id) return { ok: null, status: "mega: id?" };
  const api = folder ? `https://g.api.mega.co.nz/cs?id=0&n=${id}` : "https://g.api.mega.co.nz/cs?id=0";
  const body = folder ? [{ a: "f", c: 1, r: 1 }] : [{ a: "g", p: id }];
  const r = await fetch(api, { method: "POST", body: JSON.stringify(body) });
  const j = await r.json();
  const res = Array.isArray(j) ? j[0] : j;
  if (typeof res === "number") return { ok: false, status: `mega ${res}` }; // -9 not found, -16 blocked (ToS), -2 bad
  if (folder) return { ok: true, status: "mega folder", files: res.f?.filter(n => n.t === 0).length };
  return { ok: true, status: "mega", size: res.s };
}

async function http(url) {
  const r = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(30000) });
  const html = r.headers.get("content-type")?.includes("text") ? await r.text() : "";
  if (r.status >= 400) return { ok: false, status: `http ${r.status}` };
  if (/mediafire/.test(url)) {
    if (/downloadButton|download_link|aria-label="Download file"/.test(html)) return { ok: true, status: "mediafire" };
    if (/error\.php/i.test(r.url)) return { ok: false, status: "mediafire removed" };
    return { ok: null, status: "mediafire ?" };
  }
  if (/box\.com/.test(url) && /removed|not found|ha sido eliminado|no longer available/i.test(html)) return { ok: false, status: "box removed" };
  if (/dropbox/.test(url) && /deleted|no longer|not found/i.test(html.slice(0, 20000))) return { ok: false, status: "dropbox removed" };
  if (/drive\.google/.test(url) && /not found|no existe|ServiceLogin/i.test(r.url + html.slice(0, 5000))) return { ok: false, status: "drive gone/private" };
  return { ok: true, status: `http ${r.status}` };
}

async function check(url) {
  if (DEAD_HOSTS.test(url)) return { ok: false, status: "host muerto" };
  if (/cdn\.discordapp|discordapp\.com\/attachments/.test(url)) return { ok: null, status: "discord cdn (caduca)" };
  try { return /mega(\.co)?\.nz/.test(url) ? await mega(url) : await http(url); }
  catch (e) { return { ok: null, status: "error " + (e.cause?.code || e.name) }; }
}

(async () => {
  let done = {};
  try { done = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch { /* first run */ }
  const forum = Object.values(require("../raw/forum.json")).flatMap(t => t.posts.flatMap(p => p.links));
  const discord = Object.values(require("../raw/discord.json")).flat().flatMap(m => m.content.match(/https?:\/\/[^\s)>]+/g) || []);
  const isDownload = u => /mega|mediafire|box\.com|dropbox|drive\.google|moddb|megaupload|rapidshare|hotfile|fileserve|4shared|terabox|myairbridge|altervista|docs\.google/.test(u);
  const urls = [...new Set([...forum, ...discord].filter(isDownload))].filter(u => !done[u] || process.argv.includes("--all"));
  console.log(urls.length, "to check");
  for (const u of urls) {
    done[u] = { ...(await check(u)), checked: new Date().toISOString().slice(0, 10) };
    fs.writeFileSync(OUT, JSON.stringify(done, null, 1));
    await sleep(/mega/.test(u) ? 700 : 1200);
  }
  const v = Object.values(done);
  console.log("vivos", v.filter(x => x.ok).length, "muertos", v.filter(x => x.ok === false).length, "dudosos", v.filter(x => x.ok === null).length);
})();
