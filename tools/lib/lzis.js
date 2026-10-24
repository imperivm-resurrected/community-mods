// Reads a file the engine stores LZIS-compressed (GBR Tactics' Packs\Z-RandomMap.pak is one; the game opens them
// transparently, extract-data.js does not). Layout, from the decompiled CLzisFile / LzisDecompress (imperivm-iii-research
// P29) and checked on that pak:
//   "LZIS", u32 logical size, u32 block size, u8 level, u8 (14 bytes), then one u32 start offset per block (the first
//   one is where the data begins, the last block ends at the end of the file); each block is a deflate-like stream,
//   MSB-first bits: two tables of code lengths, 286 (literal/length) then 60 (distance), each as 2 bits -> width
//   w=v+2 and its lengths of w bits each; canonical codes, then symbols until 285. Literals < 256; 256..284 are lengths (tables below); distance code c
//   gives base[c>>1] + (c&1) + 2*extra, extra read with max(extraBits[c>>1]-1, 0) bits.
//   The tables are in gbr.exe at 0x3d9118 (length base, length extra bits) and 0x3d9208 (distance base) / 0x3d9288.
// A block that did not shrink may be stored: it is copied when its stored size is the block size.
const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 259];
const LEXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0];
const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DEXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

function decoder(lengths) { // canonical code -> symbol, MSB first (codes assigned by length, then symbol order)
  const max = Math.max(...lengths), first = [], count = [], syms = [];
  let code = 0;
  for (let l = 1; l <= max; l++) {
    code <<= 1; first[l] = code; count[l] = 0; syms[l] = [];
    lengths.forEach((n, s) => { if (n === l) { syms[l].push(s); code++; count[l]++; } });
  }
  return { max, first, count, syms };
}

function block(src, out, outPos) {
  let pos = 0, bit = 0; // bit 0 = most significant bit of src[pos]
  const bits = n => { let v = 0; while (n--) { v = v * 2 + ((src[pos] >> (7 - bit)) & 1); if (++bit === 8) { bit = 0; pos++; } } return v; };
  const table = n => { const w = bits(2) + 2; return Array.from({ length: n }, () => bits(w)); }; // each table has its own width
  const litLen = table(286), dist = table(60);
  const sym = d => {
    let code = 0;
    for (let l = 1; l <= d.max; l++) {
      code = code * 2 + bits(1);
      if (code - d.first[l] >= 0 && code - d.first[l] < d.count[l]) return d.syms[l][code - d.first[l]];
    }
    throw new Error("LZIS: bad code");
  };
  const dl = decoder(litLen), dd = decoder(dist);
  for (;;) {
    if (pos >= src.length) throw new Error("LZIS: block ends without the end symbol");
    const s = sym(dl);
    if (s < 256) { out[outPos++] = s; continue; }
    if (s === 285) return outPos;
    const len = LBASE[s - 256] + bits(LEXTRA[s - 256]);
    const c = sym(dd), dist1 = DBASE[c >> 1] + (c & 1) + 2 * bits(Math.max(DEXTRA[c >> 1] - 1, 0));
    // copy byte by byte: the source may overlap what is being written
    for (let i = 0; i < len; i++, outPos++) out[outPos] = out[outPos - dist1];
  }
}

const isLzis = b => b.length > 14 && b.toString("latin1", 0, 4) === "LZIS";

function decode(buf) {
  if (!isLzis(buf)) throw new Error("not an LZIS file");
  const size = buf.readUInt32LE(4), bs = buf.readUInt32LE(8), n = Math.ceil(size / bs);
  const out = Buffer.alloc(size);
  for (let i = 0; i < n; i++) {
    const from = buf.readUInt32LE(14 + 4 * i), to = i + 1 < n ? buf.readUInt32LE(14 + 4 * (i + 1)) : buf.length;
    const want = Math.min(bs, size - i * bs);
    if (to - from === want) { buf.copy(out, i * bs, from, to); continue; } // stored
    const end = block(buf.subarray(from, to), out.subarray(i * bs, i * bs + want), 0);
    if (end !== want) throw new Error(`LZIS: block ${i} gave ${end} bytes, expected ${want}`);
  }
  return out;
}

module.exports = { isLzis, decode };

if (require.main === module) { // node tools/lib/lzis.js <in> <out>
  const fs = require("fs"), [i, o] = process.argv.slice(2);
  fs.writeFileSync(o, decode(fs.readFileSync(i)));
}
