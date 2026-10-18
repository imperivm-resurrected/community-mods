// raw/forum.json (full crawl, local only) -> raw/forum-entries.json: topics where the author posted links, without post texts
const fs = require("fs");
const forum = require("../raw/forum.json");
const out = {};
for (const t of Object.values(forum)) {
  const links = [...new Set(t.posts.filter(p => p.author === t.author).flatMap(p => p.links))];
  if (links.length) out[t.id] = { id: t.id, path: t.path, title: t.title, subforum: t.subforum, author: t.author, links };
}
fs.writeFileSync(__dirname + "/../raw/forum-entries.json", JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, "topics with links");
