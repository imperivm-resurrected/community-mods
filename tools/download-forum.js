// Download the files behind the live links of the MODS.md rows with no local copy (💾) into originals/forum/<key>/files/,
// where <key> is t<forum topic id>, or the slugged row name for rows with no forum topic. Resumable: what is already on disk is skipped.
//   node tools/download-forum.js [--only mega,mediafire,dropbox,drive,moddb,terabox]
// Needs: megadl (megatools) for Mega. ModDB sits behind a Cloudflare challenge: a browser on CDP port 9333 with
// agent-browser (`agent-browser connect 9333`) solves it, then curl downloads with the browser's cookies.
const fs = require("fs"), path = require("path"), { execFileSync, spawnSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "raw", "download-log.json");
const links = require("../raw/links.json");
const only = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const HOSTS = { mega: /mega(\.co)?\.nz/, mediafire: /mediafire\.com/, dropbox: /dropbox\.com/, drive: /drive\.google\.com/, moddb: /moddb\.com/, terabox: /terabox/ };
const hostOf = u => Object.keys(HOSTS).find(k => HOSTS[k].test(u));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const readLog = () => { // url -> { key, files: [...], error }
  if (!fs.existsSync(OUT)) return {};
  try { return JSON.parse(fs.readFileSync(OUT, "utf8")); } catch { console.log("raw/download-log.json unreadable: starting over"); return {}; }
};
const log = readLog();
const save = () => fs.writeFileSync(OUT, JSON.stringify(log, null, 1));

// The forum often has a link twice, whole and cut at the first space ("/s/<id>/Le"): the file id is what counts.
const fileId = u => (u.match(/dropbox\.com\/s\/(\w+)/) || u.match(/mega(?:\.co)?\.nz\/(?:#!|file\/|#F!|folder\/)([\w-]+)/)
  || u.match(/mediafire\.com\/(?:file\/|download\/|\?)(\w+)/) || u.match(/\/d\/([\w-]+)/) || [])[1] || u;
const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// rows -> targets
const targets = [], seenIds = new Set();
for (const l of fs.readFileSync(path.join(ROOT, "MODS.md"), "utf8").split("\n")) {
  const c = l.split("|");
  if (c.length < 11 || !/^\s*\d+\s*$/.test(c[1]) || l.includes("💾") || /✅/.test(c[9])) continue; // local copy, or already on GameBanana
  const topic = (c[6].match(/foroactivo\.com\/t(\d+)-/) || [])[1];
  const key = topic ? `t${topic}` : slug(c[2]); // row numbers change, names do not
  // links in the table may carry forum BBCode leftovers ("...#key[/descarga")
  for (const u of [...c[7].matchAll(/\]\((https?:[^)]+)\)/g)].map(m => m[1].replace(/\[\/?\w*$/, "")))
    if (hostOf(u) && links[u]?.ok !== false && !/mega\.nz\/?$/.test(u) && (!only.length || only.includes(hostOf(u))) && !seenIds.has(fileId(u)) && seenIds.add(fileId(u)))
      targets.push({ key, name: c[2].trim(), u });
}

const curl = (url, dir, extra = []) => { // -> saved file path; name from Content-Disposition or the URL
  fs.mkdirSync(dir, { recursive: true });
  const r = spawnSync("curl", ["-sSL", "--fail", "-A", UA, "-OJ", "--retry", "2", "--max-time", "3600", "-w", "%{filename_effective}", ...extra, url], { cwd: dir, encoding: "utf8" });
  if (r.status !== 0) throw new Error((r.stderr || "curl failed").trim().split("\n").pop());
  return path.join(dir, r.stdout.trim());
};
const page = async u => { const r = await fetch(u, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(`http ${r.status}`); return r.text(); };
const browser = expr => { // run JS in the CDP browser (ModDB), return its value
  const r = spawnSync("agent-browser", ["eval", expr], { encoding: "utf8", timeout: 120000 });
  const out = (r.stdout || "").trim().split("\n").pop();
  try { return JSON.parse(JSON.parse(out)); } catch { throw new Error("browser: " + (r.stderr || out).slice(0, 200)); }
};
const moddbCookies = () => {
  let j;
  try { j = JSON.parse(spawnSync("agent-browser", ["cookies", "get", "--json"], { encoding: "utf8" }).stdout); }
  catch { throw new Error("could not read the browser cookies (is agent-browser connected?)"); }
  return (j?.data?.cookies || []).filter(c => /moddb\.com$/.test(c.domain)).map(c => `${c.name}=${c.value}`).join("; ");
};

const get = {
  mega: (u, dir) => {
    fs.mkdirSync(dir, { recursive: true });
    const before = new Set(fs.readdirSync(dir));
    execFileSync(process.env.MEGADL || "megadl", ["--no-progress", "--path", dir, u], { stdio: "pipe", timeout: 3 * 3600e3 });
    return fs.readdirSync(dir, { recursive: true }).filter(f => !before.has(f) && fs.statSync(path.join(dir, f)).isFile()).map(f => path.join(dir, f));
  },
  mediafire: async (u, dir) => {
    const html = await page(u);
    const direct = (html.match(/href="(https:\/\/download\d*\.mediafire\.com\/[^"]+)"/) || html.match(/aria-label="Download file"[^>]*href="([^"]+)"/) || [])[1];
    if (!direct) throw new Error("no download button");
    return [curl(direct, dir)];
  },
  dropbox: (u, dir) => [curl(u.replace(/([?&])dl=0/, "$1dl=1") + (/[?&]dl=/.test(u) ? "" : (u.includes("?") ? "&" : "?") + "dl=1"), dir)],
  drive: (u, dir) => {
    if (/\/folders\//.test(u)) { // folders need gdown (pip install gdown / nix shell nixpkgs#gdown)
      fs.mkdirSync(dir, { recursive: true });
      const before = new Set(fs.readdirSync(dir, { recursive: true }));
      execFileSync(process.env.GDOWN || "gdown", ["--folder", "-q", "-O", dir, u], { stdio: "pipe", timeout: 3600e3 });
      return fs.readdirSync(dir, { recursive: true }).filter(f => !before.has(f) && fs.statSync(path.join(dir, f)).isFile()).map(f => path.join(dir, f));
    }
    const id = (u.match(/\/d\/([\w-]+)/) || u.match(/[?&]id=([\w-]+)/) || [])[1];
    if (!id) throw new Error("no file id");
    return [curl(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`, dir)];
  },
  moddb: (u, dir) => {
    const rel = u.replace(/^https?:\/\/(www\.)?moddb\.com/, "");
    // a /downloads list page: take every file in it; a file page: just that one
    const files = browser(`(async()=>{const h=await (await fetch(${JSON.stringify(rel)})).text();
      const list=[...new Set([...h.matchAll(/href="(\\/(?:mods|games)\\/[^"]+\\/(?:downloads|addons)\\/[a-z0-9-]+)"/g)].map(m=>m[1]))].filter(p=>!/\\/(downloads|addons)\\/(page|feed|add)/.test(p));
      return JSON.stringify(/(downloads|addons)\\/start\\/\\d+/.test(h)?[${JSON.stringify(rel)}]:list)})()`);
    const saved = [];
    for (const f of files) {
      const r = browser(`(async()=>{const h=await (await fetch(${JSON.stringify(f)})).text();const s=(h.match(/href="(\\/(?:downloads|addons)\\/start\\/\\d+[^"]*)"/)||[])[1];
        if(!s)return JSON.stringify({});const t=await (await fetch(s)).text();return JSON.stringify({start:s,mirror:(t.match(/href="(\\/(?:downloads|addons)\\/mirror\\/[^"]+)"/)||[])[1]})})()`);
      if (!r.mirror) continue;
      const ua = browser("JSON.stringify(navigator.userAgent)");
      const loc = spawnSync("curl", ["-s", "-o", "/dev/null", "-A", ua, "-H", `Cookie: ${moddbCookies()}`, "-H", `Referer: https://www.moddb.com${r.start}`,
        "-w", "%{redirect_url}", `https://www.moddb.com${r.mirror.replace(/&amp;/g, "&")}`], { encoding: "utf8" }).stdout.trim();
      if (!loc) throw new Error("no mirror redirect");
      saved.push(curl(loc, dir));
    }
    if (!saved.length) throw new Error("no files on the page");
    return saved;
  },
  terabox: () => { throw new Error("terabox needs a login: download by hand"); },
};

(async () => {
  console.log(targets.length, "links");
  for (const t of targets) {
    if (log[t.u]?.files?.length && log[t.u].files.every(f => fs.existsSync(path.join(ROOT, f)))) continue; // done
    const dir = path.join(ROOT, "originals", "forum", t.key, "files");
    process.stdout.write(`${t.key} ${hostOf(t.u)} ${t.name.slice(0, 40)} ... `);
    try {
      const files = (await get[hostOf(t.u)](t.u, dir)).map(f => path.relative(ROOT, f));
      log[t.u] = { key: t.key, name: t.name, files };
      console.log(files.map(f => path.basename(f)).join(", "));
    } catch (e) {
      log[t.u] = { key: t.key, name: t.name, files: [], error: String(e.message || e).slice(0, 200) };
      console.log("FAIL", log[t.u].error);
    }
    save();
    await sleep(2000);
  }
  const v = Object.values(log);
  console.log(`done: ${v.filter(x => x.files.length).length} ok, ${v.filter(x => !x.files.length).length} failed`);
})();
