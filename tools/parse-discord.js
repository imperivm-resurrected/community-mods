// raw/discord.json -> raw/discord-entries.json (one entry per map/adventure/mod post)
const fs = require("fs");
const d = require("../raw/discord.json");
const GUILD = "479629904657514526";
const CH = { "saga-imperivm": "1414409056830885920", mapas: "1413782299786608682", aventuras: "1413800335213985836" };
const isFile = a => !/\.(png|jpe?g|gif|webp)$/i.test(a.name);
const urls = s => (s.match(/https?:\/\/[^\s)>]+/g) || []).filter(u => !u.includes("discord.com/channels"));

const entries = [];
for (const [chan, id] of Object.entries(CH)) {
  let section = "", cur = null;
  for (const m of d[chan]) {
    const head = m.content.match(/^\s*[-•]\s*\*\*(.+?)\*\*(.*)$/m);
    if (head) head[2] = head[2].match(/por\s+([^_\n]+)/)?.[1];
    const count = head?.input.match(/\((\d+) mapas\)/)?.[1];
    if (head) {
      cur = { channel: chan, section, title: head[1].trim(), author: head[2]?.replace(/_/g, "").trim() || "",
        discord: `https://discord.com/channels/${GUILD}/${id}/${m.id}`, year: "", base: "", links: [], files: [], shots: [], desc: "", count: count ? +count : 1 };
      const desc = m.content.split("\n").find(l => /^_.+_$/.test(l.trim()));
      if (desc) cur.desc = desc.trim().replace(/^_|_$/g, "");
      entries.push(cur);
    } else if (!m.attachments.length && m.content.trim() && !/^\s*\d{4}/.test(m.content) && !/Link:/.test(m.content)) {
      section = m.content.replace(/[*_\u200e]/g, "").trim().split("\n").pop().trim(); // headings like "MAPAS IMPERIVM I"
      cur = null;
      continue;
    }
    if (!cur) continue;
    const yv = m.content.match(/(\d{4})\s*_?\((.+?)\)_?/);
    if (yv && !cur.year) { cur.year = yv[1]; cur.base = yv[2]; }
    cur.links.push(...urls(m.content));
    cur.files.push(...m.attachments.filter(isFile).map(a => ({ name: a.name, size: a.size, url: a.url })));
    cur.shots.push(...m.attachments.filter(a => !isFile(a)).map(a => ({ name: a.name.replace(/^SPOILER_/, ""), size: a.size, url: a.url })));
  }
}
fs.writeFileSync(__dirname + "/../raw/discord-entries.json", JSON.stringify(entries, null, 1));
const by = {}; entries.forEach(e => (by[e.channel] = (by[e.channel] || 0) + 1));
console.log(entries.length, by, "no file:", entries.filter(e => !e.files.length).length,
  "MB:", (entries.flatMap(e => e.files).reduce((s, f) => s + f.size, 0) / 1e6).toFixed(0));
