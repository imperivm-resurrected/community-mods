// raw/forum.json (full crawl, local only) -> raw/forum-entries.json: topics where the author posted links, without post texts
const fs = require("fs");
const forum = require("../raw/forum.json");
// a Mega link posted without its key ("…/file/4EI0kJoL", then "clave de descarga: Z834…" in the text): the key is the
// token of the same post with the length Mega uses (43 characters for a file, 22 for a folder) that is not part of a URL
const withKey = (link, text) => {
  const m = link.match(/mega(?:\.co)?\.nz\/(file|folder)\/[\w-]+$/);
  if (!m) return link;
  const len = m[1] === "file" ? 43 : 22;
  const key = text.replace(/https?:\/\/\S+/g, " ").match(new RegExp(`(?<![\\w-])[\\w-]{${len}}(?![\\w-])`));
  return key ? `${link}#${key[0]}` : link;
};
const out = {};
for (const t of Object.values(forum)) {
  const links = [...new Set(t.posts.filter(p => p.author === t.author).flatMap(p => p.links.map(l => withKey(l, p.text))))];
  if (links.length) out[t.id] = { id: t.id, path: t.path, title: t.title, subforum: t.subforum, author: t.author, links };
}
fs.writeFileSync(__dirname + "/../raw/forum-entries.json", JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, "topics with links");
