#!/usr/bin/env node
// List or extract an HPFS container (scenario/adventure .bfhp maps; the game mounts it as currentgame/).
// Format ported from Imperivm Resurrected's src/core/hpfs.cpp.
//   node tools/hpfs.js <file.bfhp>            list: size and path of each file
//   node tools/hpfs.js <file.bfhp> <outDir>   extract everything
const fs = require("fs"), path = require("path");

function hpfs(buf) {
  if (buf.toString("latin1", 0, 4) !== "HPFS") throw new Error("not an HPFS file");
  const page = buf.readUInt32LE(4), per = page / 4, entries = [];
  const word = (p, i) => buf.readUInt32LE(p * page + i * 4);
  // read a file, or (data given, same length) write it back in place
  const read = (h, data) => {
    const len = buf.readUInt32LE(h * page), depth = buf.readUInt16LE(h * page + 4), out = Buffer.alloc(len);
    if (data && data.length !== len) throw new Error("in-place write needs the same length");
    for (let p = 0; p * page < len; p++) {
      const idx = []; let q = p;
      for (let i = depth; i >= 1; i--) { idx[i] = q % per; q = Math.floor(q / per); }
      idx[0] = q + 2;
      let cur = h;
      for (let l = 0; l < depth; l++) cur = word(cur, idx[l]);
      const from = word(cur, idx[depth]) * page;
      const n = Math.min(page, len - p * page);
      if (data) data.copy(buf, from, p * page, p * page + n); else buf.copy(out, p * page, from, from + n);
    }
    return out;
  };
  const list = (h, prefix) => {
    const dir = read(h);
    for (let at = 0; at + 8 <= dir.length;) {
      const eh = dir.readUInt32LE(at), attr = dir.readUInt16LE(at + 4), n = dir.readUInt16LE(at + 6);
      if (!n && !eh) break;
      const p = prefix + dir.toString("latin1", at + 8, at + 8 + n);
      at += 8 + n;
      if (attr & 1) list(eh, p + "/");
      else entries.push({ path: p, size: buf.readUInt32LE(eh * page), read: () => read(eh), write: d => read(eh, d) });
    }
  };
  list(buf.readUInt32LE(0x1c), "");
  return entries;
}

if (require.main === module) {
  const [file, out] = process.argv.slice(2);
  if (!file) { console.error("usage: node tools/hpfs.js <file.bfhp> [outDir]"); process.exit(1); }
  for (const e of hpfs(fs.readFileSync(file))) {
    if (!out) { console.log(String(e.size).padStart(10), e.path); continue; }
    const to = path.join(out, e.path);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, e.read());
  }
}
module.exports = hpfs;
