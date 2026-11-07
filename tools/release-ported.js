#!/usr/bin/env node
// Publishes the mods of ported/ as a GitHub release: one zip per mod, plus directory.json (the list of every mod and where its zip is).
// Runs on the maintainer's machine, not in Actions: ported/ is git-ignored and built from originals/, which the CI does not have.
//
//   node tools/release-ported.js <tag>                      plan only: what changed since the last release (hashes, no zip)
//   node tools/release-ported.js <tag> --build              also write the zips and directory.json to .release/<tag>/
//   node tools/release-ported.js <tag> --upload             build, then create the release for <tag> (pushed already) and upload
//   --only=id,id                                            restrict to these mods (testing; the directory then lists only them)
//
// A mod whose files did not change since the last release is not uploaded again: its entry keeps the tag and files of the release
// that has them. A zip over GitHub's 2 GiB asset limit is split in <name>.zip.001, .002... (cat them to get the zip back).
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");

const args = process.argv.slice(2);
const tag = args.find(a => !a.startsWith("--"));
const only = (args.find(a => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const upload = args.includes("--upload"), build = upload || args.includes("--build");
if (!tag) { console.error("usage: node tools/release-ported.js <tag> [--only=id,id] [--build|--upload]"); process.exit(2); }

const PART = 1900 * 2 ** 20; // under 2 GiB, with room
const sh = (cmd, a, o = {}) => execFileSync(cmd, a, { encoding: "utf8", maxBuffer: 2 ** 28, ...o }).trim();
const sha = f => { const h = crypto.createHash("sha256"), fd = fs.openSync(f, "r"), b = Buffer.alloc(2 ** 24); let n;
  while ((n = fs.readSync(fd, b, 0, b.length, null)) > 0) h.update(b.subarray(0, n)); fs.closeSync(fd); return h.digest("hex"); };

// hash of the folder's contents (paths, sizes, file hashes), not of the zip: zips are not byte-stable
function treeHash(dir) {
  const h = crypto.createHash("sha256"), out = [];
  (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
    const p = path.join(d, e.name); if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) walk(p); else out.push(p); } })(dir);
  let bytes = 0;
  for (const f of out) { const s = fs.statSync(f).size; bytes += s; h.update(path.relative(dir, f) + "\0" + s + "\0" + sha(f) + "\n"); }
  return { hash: h.digest("hex"), bytes };
}

const repo = sh("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
const last = sh("gh", ["release", "list", "--limit", "1", "--json", "tagName", "--jq", ".[0].tagName // empty"]);
let prev = {};
if (last) { try { for (const m of JSON.parse(sh("gh", ["release", "download", last, "--pattern", "directory.json", "--output", "-"])).mods) prev[m.id] = m; }
  catch { console.error(`warning: release ${last} has no directory.json; every mod counts as new`); } }
if (upload && !sh("git", ["ls-remote", "--tags", "origin", `refs/tags/${tag}`])) { console.error(`tag ${tag} is not on origin: push it first`); process.exit(1); }

const out = path.join(".release", tag);
if (build) fs.mkdirSync(out, { recursive: true });
const mods = [], toUpload = [], skipped = [];
let rawNew = 0, sizeNew = 0;
for (const id of fs.readdirSync("ported").sort()) {
  if (only.length && !only.includes(id)) continue;
  const mj = path.join("ported", id, "mod.json"); if (!fs.existsSync(mj)) continue;
  let meta;
  try { meta = JSON.parse(fs.readFileSync(mj, "utf8")); }
  catch (e) { console.error(`${mj}: ${e.message}`); process.exit(1); } // a broken mod.json stops the release: never publish half a list
  if (meta.redistributable !== true) { skipped.push(id); continue; }
  const { hash, bytes } = treeHash(path.join("ported", id));
  const p = prev[id];
  const info = { id, name: meta.name, version: meta.version, category: meta.category, authors: meta.authors, tags: meta.tags,
    requires: meta.requires, incompatibleWith: meta.incompatibleWith, description: meta.description, treeHash: hash };
  if (p && p.treeHash === hash) { mods.push({ ...info, size: p.size, sha256: p.sha256, tag: p.tag, files: p.files }); continue; }
  rawNew += bytes;
  const entry = { ...info, tag, files: [] }; mods.push(entry);
  console.log(`${p ? "changed" : "new    "} ${id} ${meta.version} (${(bytes / 2 ** 20).toFixed(0)} MiB raw)`);
  if (!build) continue;
  const zip = path.join(out, `${id}-${String(meta.version).replace(/[^\w.-]/g, "_")}.zip`);
  sh("bsdtar", ["--format", "zip", "-cf", zip, "-C", "ported", id]);
  entry.size = fs.statSync(zip).size; entry.sha256 = sha(zip); sizeNew += entry.size;
  if (entry.size <= PART) entry.files = [path.basename(zip)];
  else { sh("split", ["-b", String(PART), "-d", "-a", "3", "--numeric-suffixes=1", zip, zip + "."]); fs.unlinkSync(zip);
    entry.files = fs.readdirSync(out).filter(f => f.startsWith(path.basename(zip) + ".")).sort(); }
  toUpload.push(...entry.files.map(f => path.join(out, f)));
}
for (const m of mods) m.urls = (m.files || []).map(f => `https://github.com/${repo}/releases/download/${m.tag}/${f}`);

const dir = path.join(out, "directory.json");
console.log(`\n${mods.length} mods listed, ${mods.filter(m => m.tag === tag).length} to publish in ${tag} (${(rawNew / 2 ** 30).toFixed(2)} GiB raw)` +
  (skipped.length ? `; not redistributable, left out: ${skipped.join(", ")}` : "") + (last ? `; compared with ${last}` : "; no earlier release"));
if (!build) process.exit(0);
fs.writeFileSync(dir, JSON.stringify({ repo, tag, generated: new Date().toISOString(), mods }, null, 1));
console.log(`zips: ${(sizeNew / 2 ** 30).toFixed(2)} GiB in ${toUpload.length} files; ${dir}`);
if (!upload) process.exit(0);

try { sh("gh", ["release", "view", tag]); } catch { sh("gh", ["release", "create", tag, "--title", tag, "--notes", `Mods of ported/ at ${tag}. directory.json lists every mod and the release that holds its zip.`]); }
for (let i = 0; i < toUpload.length; i += 10) sh("gh", ["release", "upload", tag, "--clobber", ...toUpload.slice(i, i + 10)], { stdio: "inherit" });
sh("gh", ["release", "upload", tag, "--clobber", dir]);
console.log(`published ${tag}`);
