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
  // read a file, or (data given) write it back in place: any length that fills the same number of pages (the length is
  // the first word of the file's root page; its data pages stay where they are).
  // A write NEVER loses bytes silently: a Buffer cannot grow, and a container saved by the game ends inside its last page (HD's own Mediterranean does), so the
  // last bytes of a file that grew used to fall off the end of the Buffer (a renamed conquest lost the end of its territories.xml: "</conquestmap>" cut to
  // "</conques", the engine could not finish the last territory). It throws when a page of the file lies past the end of the buffer (pad it first: hpfs.pad)
  // and when what is read back is not what was written.
  const read = (h, data) => {
    let len = buf.readUInt32LE(h * page);
    const depth = buf.readUInt16LE(h * page + 4), out = Buffer.alloc(len), old = len;
    if (data && Math.ceil(data.length / page) !== Math.ceil(len / page)) throw new Error(`in-place write: ${data.length} bytes don't fit the ${Math.ceil(len / page)} page(s) of ${len}`);
    if (data) len = data.length;
    const spans = [];
    for (let p = 0; p * page < len; p++) {
      const idx = []; let q = p;
      for (let i = depth; i >= 1; i--) { idx[i] = q % per; q = Math.floor(q / per); }
      idx[0] = q + 2;
      let cur = h;
      for (let l = 0; l < depth; l++) cur = word(cur, idx[l]);
      const from = word(cur, idx[depth]) * page;
      const n = Math.min(page, len - p * page);
      if (data && from + n > buf.length) throw new Error(`in-place write: page ${Math.floor(from / page)} of the file ends ${from + n - buf.length} byte(s) past the end of the container (pad it to whole pages first: hpfs.pad(buf))`);
      spans.push([p * page, from, n]);
    }
    for (const [at, from, n] of spans) { if (data) data.copy(buf, from, at, at + n); else buf.copy(out, at, from, from + n); }
    if (!data) return out;
    buf.writeUInt32LE(data.length, h * page);
    if (!read(h).equals(data)) { buf.writeUInt32LE(old, h * page); throw new Error("in-place write: what is read back is not what was written"); }
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
// The container as whole pages (a file saved by the game ends inside its last page): call it before hpfs() when files will be written back.
hpfs.pad = buf => { const page = buf.readUInt32LE(4), r = buf.length % page; return r ? Buffer.concat([buf, Buffer.alloc(page - r)]) : buf; };
module.exports = hpfs;
