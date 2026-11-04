// The lobby pages (UI/MENU/B1F..B10F.BMP): the page row (row 1) of each picture has, above the page, a strip with ALL TEN tab icons painted (its own one highlighted) and the page title. The ten
// pictures are buttons of one radio group at the same place; the hit test of a button reads the opaque pixels of its CURRENT row, so an open page n covers the icons of the other pages with the
// icons painted in its strip: in the main menu the icons of the pages listed before it get no hover and no click (seen in game, experiment B). The other pages draw their own icon in their row 0.
// This makes transparent, with the key the picture already uses, the icon cells of the OTHER pages in row 1, so that every tab keeps hover and click from its own row 0 and the open page keeps
// its title, its body, its border and its own highlighted icon.
//   eraseOtherTabs(dir)  -> [{ file, n, changed, bbox, outside }]   dir has B1F..B10F.BMP of one language (after the chat frame was erased); rewrites them in place
// Measured on all 30 files (3 languages x 10 pages), 3 columns each (normal, hover, pressed; 1930 wide; rows of 786):
//   row 0, column 0 holds one icon: the 10 cells are (x0,y0,x1,y1) CELLS below, the same in the 3 languages (35x35 for B2..B9; B1 and B10 are 37x37: the corner ornament of the page frame is part of the icon)
//   row 1 has the title bar (x 169..407, y 0..17) and, in y 28..64, nothing but the 10 icons: no opaque pixel in y 18..27 or 65..66, none in y 28..64 outside the cells; the page begins at y 67
//   in row 1 each OTHER page's icon is pixel-equal to its row 0 column 0 (the 16-bit pictures exactly; B10 is 24 bit: the same pixels to within the 5-bit rounding, 4.06 of 255 at most)
//   the three columns of row 1 have the same strip but for the own icon (pressed shading): so the cells of the other pages are erased in the three columns
// Everything is checked before a pixel is touched, and afterwards that nothing outside the erased cells changed (header, padding, every other pixel).
const fs = require("fs"), path = require("path");
const FW = 1930, FH = 786, COLS = 3;
const CELLS = [[91, 28, 127, 64], [133, 30, 167, 64], [173, 30, 207, 64], [213, 30, 247, 64], [253, 30, 287, 64], [293, 30, 327, 64], [333, 30, 367, 64], [373, 30, 407, 64], [413, 30, 447, 64], [453, 28, 489, 64]];
const TITLE = [169, 0, 407, 17], STRIP_Y0 = 28, STRIP_Y1 = 64, PAGE_Y0 = 67, TOL = 8;

function open(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString("latin1", 0, 2) !== "BM") throw new Error(`${file}: not a BMP`);
  const off = buf.readUInt32LE(10), w = buf.readInt32LE(18), hh = buf.readInt32LE(22), bpp = buf.readUInt16LE(28), comp = buf.readUInt32LE(30), h = Math.abs(hh);
  if (comp !== 0 || (bpp !== 16 && bpp !== 24) || w !== FW * COLS || h !== FH * 2 || hh < 0) throw new Error(`${file}: ${w}x${hh} ${bpp}bpp compression ${comp}: not the 5790x1572 bottom-up 16/24 bit BMP of the pages`);
  const Bp = bpp / 8, stride = Math.ceil(w * bpp / 32) * 4, at = (x, y) => off + (h - 1 - y) * stride + x * Bp;
  const raw = (x, y) => { const p = at(x, y); return Bp === 2 ? buf.readUInt16LE(p) : (buf[p] | buf[p + 1] << 8 | buf[p + 2] << 16); };
  const key = raw(0, 0); if (key !== (Bp === 2 ? 0x03e0 : 0x00ff00)) throw new Error(`${file}: the pixel at 0,0 is 0x${key.toString(16)}, not the green key`);
  // 8-bit rgb of a pixel (5 bits expanded by x*255/31), or null for the key
  const rgb = (x, y) => { const v = raw(x, y); if (v === key) return null; return Bp === 2 ? [((v >> 10) & 31) * 255 / 31, ((v >> 5) & 31) * 255 / 31, (v & 31) * 255 / 31] : [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  return { file, buf, off, w, h, Bp, stride, at, raw, key, rgb, isKey: (x, y) => raw(x, y) === key };
}

// the row 0 icon cell of page k (column 0) of an opened picture: its pixels, and a check that its opaque bounding box is exactly CELLS[k-1] and the rest of row 0 is empty
function ownCell(im, k) {
  const [x0, y0, x1, y1] = CELLS[k - 1], b = [1e9, 1e9, -1, -1];
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (!im.isKey(x, y)) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
  if (b.join() !== CELLS[k - 1].join()) throw new Error(`${im.file}: the icon of row 0 spans ${b.join(",")}, not the cell ${CELLS[k - 1].join(",")}`);
  const px = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px.push(im.rgb(x, y));
  return px;
}
const near = (a, b) => (!a && !b) || (a && b && Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])) <= TOL);

function eraseOtherTabs(dir) {
  const names = [];
  for (let n = 1; n <= 10; n++) { const f = fs.readdirSync(dir).find(x => x.toLowerCase() === `b${n}f.bmp`); if (!f) throw new Error(`${dir}: no B${n}F.BMP`); names.push(path.join(dir, f)); }
  // 1. the ten cells of row 0 (one picture at a time: they are 18 to 27 MB each)
  const cellPx = names.map((f, i) => ownCell(open(f), i + 1));
  const out = [];
  for (let n = 1; n <= 10; n++) {
    const im = open(names[n - 1]), orig = Buffer.from(im.buf), { Bp } = im; let changed = 0; const bbox = [1e9, 1e9, -1, -1];
    for (let c = 0; c < COLS; c++) {
      const X0 = c * FW, inCell = (x, y) => CELLS.findIndex(r => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]);
      // row 1 above the page: the title bar (x 169..407, y 0..17) and the cells, nothing else
      for (let y = 0; y < PAGE_Y0; y++) for (let x = 0; x < FW; x++) {
        if (im.isKey(X0 + x, FH + y)) continue;
        const inTitle = x >= TITLE[0] && x <= TITLE[2] && y >= TITLE[1] && y <= TITLE[3];
        if (!inTitle && inCell(x, y) < 0) throw new Error(`${im.file}: column ${c}, an opaque pixel at ${x},${y} above the page that is neither the title bar nor an icon cell`);
      }
      // each other page's cell is pixel-equal to its row 0 (to within the 5-bit rounding)
      for (let k = 1; k <= 10; k++) {
        if (k === n) continue;
        const [x0, y0, x1, y1] = CELLS[k - 1]; let i = 0;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++, i++) if (!near(im.rgb(X0 + x, FH + y), cellPx[k - 1][i])) throw new Error(`${im.file}: column ${c}, the icon of page ${k} in the strip differs at ${x},${y} from the icon its own row 0 draws`);
      }
      // erase them
      for (let k = 1; k <= 10; k++) {
        if (k === n) continue;
        const [x0, y0, x1, y1] = CELLS[k - 1];
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          if (im.isKey(X0 + x, FH + y)) continue;
          const p = im.at(X0 + x, FH + y); for (let b = 0; b < Bp; b++) im.buf[p + b] = orig[im.at(0, 0) + b];
          changed++; bbox[0] = Math.min(bbox[0], X0 + x); bbox[1] = Math.min(bbox[1], FH + y); bbox[2] = Math.max(bbox[2], X0 + x); bbox[3] = Math.max(bbox[3], FH + y);
        }
      }
    }
    // nothing outside the erased cells changed
    let outside = 0;
    for (let y = 0; y < im.h; y++) {
      const a = im.at(0, y), len = im.w * Bp, inBand = y >= FH + STRIP_Y0 && y <= FH + STRIP_Y1;
      if (!inBand) { if (!im.buf.subarray(a, a + len).equals(orig.subarray(a, a + len))) outside++; continue; }
      for (let x = 0; x < im.w; x++) {
        const c = Math.floor(x / FW), xx = x - c * FW, k = CELLS.findIndex(r => xx >= r[0] && xx <= r[2] && y - FH >= r[1] && y - FH <= r[3]);
        if (k >= 0 && k + 1 !== n) continue;                              // an erased cell: any change is allowed there
        const p = im.at(x, y); for (let b = 0; b < Bp; b++) if (im.buf[p + b] !== orig[p + b]) outside++;
      }
    }
    if (!im.buf.subarray(0, im.off).equals(orig.subarray(0, im.off)) || im.buf.length !== orig.length) outside++;
    if (outside) throw new Error(`${im.file}: ${outside} places outside the erased icon cells changed`);
    fs.writeFileSync(names[n - 1], im.buf);
    out.push({ file: names[n - 1], n, changed, bbox, outside });
  }
  return out;
}
module.exports = { eraseOtherTabs, CELLS, TITLE };

// self-test: node tools/lib/community-strip.js (a synthetic set with the pages' own layout: ten 5790x1572 pictures, 18 MB each, in a temp folder)
if (require.main === module) {
  const assert = require("assert"), os = require("os");
  const w = FW * COLS, h = FH * 2, stride = Math.ceil(w * 16 / 32) * 4, K = 0x03e0;
  const make = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cm-strip-"));
  for (let n = 1; n <= 10; n++) {
    const buf = Buffer.alloc(54 + stride * h); buf.write("BM", 0); buf.writeUInt32LE(buf.length, 2); buf.writeUInt32LE(54, 10); buf.writeUInt32LE(40, 14); buf.writeInt32LE(w, 18); buf.writeInt32LE(h, 22); buf.writeUInt16LE(1, 26); buf.writeUInt16LE(16, 28);
    const put = (x, y, v) => buf.writeUInt16LE(v, 54 + (h - 1 - y) * stride + x * 2);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) put(x, y, K);
    const icon = (k, x, y) => 0x1000 + k * 16 + ((x + y) & 7);                    // the pixels of page k's icon
    { const r = CELLS[n - 1]; for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) put(x, y, icon(n, x, y)); }                     // row 0, column 0
    for (let c = 0; c < COLS; c++) {
      for (let y = TITLE[1]; y <= TITLE[3]; y++) for (let x = TITLE[0]; x <= TITLE[2]; x++) put(c * FW + x, FH + y, 0x7777);                          // the title bar
      for (let k = 1; k <= 10; k++) { const r = CELLS[k - 1]; for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) put(c * FW + x, FH + y, k === n ? 0x6000 + ((x + y) & 7) : icon(k, x, y)); }
      for (let y = PAGE_Y0; y < 500; y++) for (let x = 0; x < 1280; x++) put(c * FW + x, FH + y, 0x2222);                                              // the page
    }
    fs.writeFileSync(path.join(dir, `B${n}F.BMP`), buf);
  }
  return dir;
  };
  let dir = make();
  const r = eraseOtherTabs(dir);
  assert.strictEqual(r.length, 10);
  const area = c => (c[2] - c[0] + 1) * (c[3] - c[1] + 1), nCells = CELLS.reduce((a, c) => a + area(c), 0);
  for (const s of r) assert.strictEqual(s.changed, (nCells - area(CELLS[s.n - 1])) * COLS, `B${s.n}: the other nine cells in 3 columns`);
  const im3 = open(path.join(dir, "B3F.BMP"));
  assert(im3.isKey(CELLS[0][0] + 5, FH + 40) && !im3.isKey(CELLS[2][0] + 5, FH + 40) && !im3.isKey(100, FH + 100) && !im3.isKey(TITLE[0] + 3, FH + 3), "other cell erased; own cell, page and title kept");
  fs.rmSync(dir, { recursive: true, force: true }); dir = make();
  const im4 = open(path.join(dir, "B4F.BMP")); im4.buf.writeUInt16LE(0x5555, im4.at(300, FH + 20)); fs.writeFileSync(path.join(dir, "B4F.BMP"), im4.buf);
  assert.throws(() => eraseOtherTabs(dir), /neither the title bar nor an icon cell/, "a stray opaque pixel in the strip stops it");
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("community-strip self-test ok");
}
