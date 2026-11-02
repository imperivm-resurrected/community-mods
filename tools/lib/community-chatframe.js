// The lobby pages (UI/MENU/B1F..B10F.BMP) carry, in the bottom-left of the page row, a picture of the lobby's "Chat" frame (a title bar with ornaments and the top of a box with a small
// scroll arrow) and, between the page and that frame, a strip of the lobby background: the author's screenshot of the classic lobby. In the main menu (where the pages show, the engine's
// new lobby replaces the classic screen) there is no chat, so it is an empty frame. This erases it, with the transparency key the picture already uses, and nothing else.
//   eraseChatFrame(file)  -> { file, bpp, key, changed, bbox, outside: 0 }  rewrites the file in place; throws if the picture is not the one the constants describe
// The picture is 3 columns (normal, hover, pressed: 1930 wide) by 2 rows (786 high): row 0 is a 34x36 icon, row 1 the page (1279 wide, opaque down to y 571 with its bottom border) and, below it,
// in the same x range 0..578, the chat frame. Measured on all 30 files (10 pages x English, Spanish, Italian) and each of the 3 columns: below y 571 of row 1 the only opaque pixels are
//   - the rectangle x 0..578, y 572..651 (36,656 pixels in every cell; its bounding box is exactly that): the frame and the strip of background above it
//   - 108 pixels at x 922..1278, y 572..574: the lower tips of the page's own border (the bottom-right corner) and a 24x3 bump of background: not the frame, left as they are
// and row 0 has nothing below y 69. The page's bottom-left corner tip is in rows 572..574 at x 1..~23, merged with the strip: those rows are erased only from x 25, so the corner stays.
// Erased: x 0..578 x y 575..651, and x 25..578 x y 572..574, in each of the 3 cells of row 1. Every pixel outside that is checked to be byte-identical afterwards.
const fs = require("fs");
const COLS = 3, ROWS = 2, FW = 1930, FH = 786, X_MAX = 578, Y_TOP = 572, Y_CORNER_END = 574, Y_LAST = 651, CORNER_X = 24, ICON_ROW_END = 69;

function eraseChatFrame(file) {
  const buf = fs.readFileSync(file), orig = Buffer.from(buf);
  if (buf.toString("latin1", 0, 2) !== "BM") throw new Error(`${file}: not a BMP`);
  const off = buf.readUInt32LE(10), w = buf.readInt32LE(18), hh = buf.readInt32LE(22), bpp = buf.readUInt16LE(28), comp = buf.readUInt32LE(30), h = Math.abs(hh);
  if (comp !== 0 || (bpp !== 16 && bpp !== 24) || w !== FW * COLS || h !== FH * ROWS || hh < 0) throw new Error(`${file}: ${w}x${hh} ${bpp}bpp compression ${comp}: not the 5790x1572 bottom-up 16/24 bit BMP of the pages`);
  const Bp = bpp / 8, stride = Math.ceil(w * bpp / 32) * 4, at = (x, y) => off + (h - 1 - y) * stride + x * Bp;     // x, y from the top left of the picture
  const kb = buf.subarray(at(0, 0), at(0, 0) + Bp), key = Bp === 2 ? kb.readUInt16LE(0) : (kb[0] | kb[1] << 8 | kb[2] << 16);
  if (!(Bp === 2 ? key === 0x03e0 : key === 0x00ff00)) throw new Error(`${file}: the pixel at 0,0 is 0x${key.toString(16)}, not the green key`);
  const same = (p, q) => { for (let i = 0; i < Bp; i++) if (buf[p + i] !== buf[q + i]) return false; return true; };
  const isKey = (x, y) => same(at(x, y), at(0, 0));
  let changed = 0; const bbox = [1e9, 1e9, -1, -1];
  for (let c = 0; c < COLS; c++) {
    const X0 = c * FW;
    // row 0: only the icon
    for (let y = ICON_ROW_END + 1; y < FH; y++) for (let x = 0; x < FW; x++) if (!isKey(X0 + x, y)) throw new Error(`${file}: column ${c}, an opaque pixel at ${x},${y} in the icon row below y ${ICON_ROW_END}`);
    // row 1: below the page's bottom border (the border is there: rows 570 and 571 are opaque in the middle)
    if (isKey(X0 + 640, FH + 570) || isKey(X0 + 640, FH + 571)) throw new Error(`${file}: column ${c}, the page's bottom border is not where it was measured`);
    const r = [1e9, 1e9, -1, -1];
    for (let y = Y_TOP; y < FH; y++) for (let x = 0; x < FW; x++) {
      if (isKey(X0 + x, FH + y)) continue;
      if (x <= X_MAX && y <= Y_LAST) { r[0] = Math.min(r[0], x); r[1] = Math.min(r[1], y); r[2] = Math.max(r[2], x); r[3] = Math.max(r[3], y); }
      else if (!(x > X_MAX && y <= Y_CORNER_END)) throw new Error(`${file}: column ${c}, an opaque pixel at ${x},${y} that is neither in the frame rectangle nor a tip of the page's border`);
    }
    if (r.join() !== [0, Y_TOP, X_MAX, Y_LAST].join()) throw new Error(`${file}: column ${c}, the opaque pixels below the page span ${r.join(",")}, not 0,${Y_TOP},${X_MAX},${Y_LAST}: this is not the frame the constants describe`);
    // erase
    for (let y = Y_TOP; y <= Y_LAST; y++) for (let x = (y <= Y_CORNER_END ? CORNER_X + 1 : 0); x <= X_MAX; x++) {
      if (isKey(X0 + x, FH + y)) continue;
      const p = at(X0 + x, FH + y); for (let i = 0; i < Bp; i++) buf[p + i] = orig[at(0, 0) + i];
      changed++; bbox[0] = Math.min(bbox[0], X0 + x); bbox[1] = Math.min(bbox[1], FH + y); bbox[2] = Math.max(bbox[2], X0 + x); bbox[3] = Math.max(bbox[3], FH + y);
    }
  }
  // everything that is not in an erased cell range is byte-identical: header, the rest of every row, every row above y 786 + 572 and below 786 + 651
  let outside = 0;
  for (let y = 0; y < h; y++) {
    const a = at(0, y), n = w * Bp;                                      // the pixels of the row (the padding after them is compared with the row below)
    if (y < FH + Y_TOP || y > FH + Y_LAST) { if (!buf.subarray(a, a + n).equals(orig.subarray(a, a + n))) outside++; continue; }
    for (let c = 0; c < COLS; c++) {
      const x1 = c * FW + X_MAX + 1, x2 = (c + 1) * FW;                    // from the right of the frame's rectangle to the end of the cell
      if (!buf.subarray(at(x1, y), at(x2, y)).equals(orig.subarray(at(x1, y), at(x2, y)))) outside++;
      const lo = c * FW; const cEnd = y - FH <= Y_CORNER_END ? lo + CORNER_X + 1 : lo;
      if (cEnd > lo && !buf.subarray(at(lo, y), at(cEnd, y)).equals(orig.subarray(at(lo, y), at(cEnd, y)))) outside++;
    }
  }
  if (!buf.subarray(0, off).equals(orig.subarray(0, off)) || buf.length !== orig.length) outside++;
  if (outside) throw new Error(`${file}: ${outside} places outside the frame's rectangle changed`);
  fs.writeFileSync(file, buf);
  return { file, bpp, key: `0x${key.toString(16).padStart(Bp === 2 ? 4 : 6, "0")}`, changed, bbox, outside };
}
module.exports = { eraseChatFrame, CONST: { COLS, ROWS, FW, FH, X_MAX, Y_TOP, Y_CORNER_END, Y_LAST, CORNER_X } };

// self-test: node tools/lib/community-chatframe.js
if (require.main === module) {
  const assert = require("assert"), os = require("os"), path = require("path");
  const w = FW * COLS, h = FH * ROWS, stride = Math.ceil(w * 16 / 32) * 4, buf = Buffer.alloc(54 + stride * h);
  buf.write("BM", 0); buf.writeUInt32LE(buf.length, 2); buf.writeUInt32LE(54, 10); buf.writeUInt32LE(40, 14); buf.writeInt32LE(w, 18); buf.writeInt32LE(h, 22); buf.writeUInt16LE(1, 26); buf.writeUInt16LE(16, 28);
  const at = (x, y) => 54 + (h - 1 - y) * stride + x * 2, put = (x, y, v) => buf.writeUInt16LE(v, at(x, y));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) put(x, y, 0x03e0);
  for (let c = 0; c < COLS; c++) {
    for (let y = FH; y <= FH + 571; y++) for (let x = 0; x < 1280; x++) put(c * FW + x, y, 0x1234);        // the page
    for (let y = FH + Y_TOP; y <= FH + Y_LAST; y++) for (let x = 0; x <= X_MAX; x++) put(c * FW + x, y, 0x4321);   // the frame
    put(c * FW + 1000, FH + 573, 0x5555);                                                                      // a tip of the border, outside
  }
  const f = path.join(os.tmpdir(), "cm-chatframe-test.bmp"); fs.writeFileSync(f, buf);
  const r = eraseChatFrame(f), out = fs.readFileSync(f);
  assert.strictEqual(out.readUInt16LE(at(100, FH + 600)), 0x03e0, "the frame is erased");
  assert.strictEqual(out.readUInt16LE(at(10, FH + 573)), 0x4321, "the corner rows are kept up to x 24");
  assert.strictEqual(out.readUInt16LE(at(100, FH + 573)), 0x03e0, "and erased from x 25");
  assert.strictEqual(out.readUInt16LE(at(100, FH + 571)), 0x1234, "the page is kept");
  assert.strictEqual(out.readUInt16LE(at(1000, FH + 573)), 0x5555, "a tip outside the rectangle is kept");
  assert.strictEqual(r.outside, 0);
  put(2000, FH + 700, 0x7777); fs.writeFileSync(f, buf);
  assert.throws(() => eraseChatFrame(f), /neither in the frame rectangle/, "a stray opaque pixel stops it");
  fs.rmSync(f);
  console.log("community-chatframe self-test ok");
}
