// A territory of Greece on the conquest map "1 - GBR Europe" (the game's): the 4.2's Mediterranean declares `Greece` (index 9) but ships the game's map,
// whose territories.bmp has regions 1 (everything that is nobody's) to 8, so Greece could not be clicked. This draws region 9 in a copy of the folder:
// the Greek peninsula, the Aegean islands and Crete, found in global.bmp (land is not blue) inside a polygon, only on pixels that belong to nobody.
//   addGreece(folder)       folder: a copy of the game's ConquestMaps/1 - GBR europe (territories.bmp is changed in place, ShieldGreece.bmp is added)
// territories.bmp is 1024x768, 8 bits (palette), global.bmp 1024x768, 16 bits; rows bottom-up. Returns how many pixels the region has.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ci = (d, n) => fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const INDEX = 9, NOBODY = 1;
// the region, in the picture's own pixels (x, y from the top): north border along Greece's (Albania, Macedonia, Thrace), west the Ionian Sea, the
// Turkish coast is left out (a line east of the Aegean's islands), south to Crete
const POLY = [[640, 388], [668, 388], [700, 398], [740, 405], [786, 405], [786, 465], [812, 470], [815, 505], [640, 505]];
const inside = (x, y) => { let c = false; for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) { const [xi, yi] = POLY[i], [xj, yj] = POLY[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };

function addGreece(folder) {
  const gp = path.join(folder, ci(folder, "global.bmp")), tp = path.join(folder, ci(folder, "territories.bmp"));
  const g = fs.readFileSync(gp), t = Buffer.from(fs.readFileSync(tp));
  const info = b => ({ off: b.readUInt32LE(10), w: b.readInt32LE(18), h: b.readInt32LE(22), bpp: b.readUInt16LE(28), pal: 14 + b.readUInt32LE(14) });
  const G = info(g), T = info(t);
  if (G.w !== 1024 || Math.abs(G.h) !== 768 || G.bpp !== 16 || T.bpp !== 8 || T.w !== 1024 || Math.abs(T.h) !== 768) throw new Error("global.bmp / territories.bmp are not the 1024x768 8-bit pictures the game has");
  const at = (B, I, x, y) => I.off + (I.h > 0 ? 767 - y : y) * I.w + x;                        // rows bottom-up when h > 0
  const rgb = (x, y) => { const v = g.readUInt16LE(G.off + (G.h > 0 ? 767 - y : y) * 2048 + x * 2); return [(v >> 10 & 31) << 3, (v >> 5 & 31) << 3, (v & 31) << 3]; };   // 16 bits: 5-5-5
  // land: the sea is blue (b well above r); coasts have a dark edge, so the mask grows by two pixels
  const land = new Uint8Array(1024 * 768);
  for (let y = 380; y < 520; y++) for (let x = 630; x < 830; x++) { const [r, gg, b] = rgb(x, y); if (r > b - 6 && r + gg + b > 90) land[y * 1024 + x] = 1; }
  const grown = new Uint8Array(land);
  for (let y = 382; y < 518; y++) for (let x = 632; x < 828; x++) if (!land[y * 1024 + x]) for (let dy = -2; dy <= 2 && !grown[y * 1024 + x]; dy++) for (let dx = -2; dx <= 2; dx++) if (land[(y + dy) * 1024 + x + dx]) { grown[y * 1024 + x] = 1; break; }
  let n = 0;
  for (let y = 380; y < 520; y++) for (let x = 630; x < 830; x++) {
    const k = at(t, T, x, y);
    if (grown[y * 1024 + x] && inside(x, y) && t[k] === NOBODY) { t[k] = INDEX; n++; }
  }
  fs.rmSync(tp); fs.writeFileSync(tp, t);
  return n;
}

// The art of the territory is in extras/greek-civilization-mod/conquest/ (made once, see NOTES.md, *Conquests*): hellas-shield.png (the bronze aspis of
// "Aspis hoplite shield" by ninelionar, CC0, cut out and with the name under it, 296x316 with alpha) and hellas-label.png (the name as the map's own
// labels have it, cream with a dark outline).
const ART = path.join(__dirname, "..", "..", "extras", "greek-civilization-mod", "conquest");
const magick = (args, enc) => { const r = cp.spawnSync("magick", args, { maxBuffer: 1 << 26, encoding: enc }); if (r.status !== 0) throw new Error("magick: " + String(r.stderr).slice(0, 200)); return r.stdout; };

// ShieldGreece.bmp: 74x79 24-bit on the green the game's shields have around them, like ShieldItaly.bmp
function drawShield(folder) {
  const out = path.join(folder, "ShieldGreece.bmp");
  fs.rmSync(out, { force: true });
  magick(["-size", "296x316", "xc:#00ff00", path.join(ART, "hellas-shield.png"), "-composite", "-filter", "Lanczos", "-resize", "74x79!", "-type", "TrueColor", `BMP3:${out}`]);
}

// the name on the map, over the Greek peninsula, in global.bmp (16 bits, 5-5-5) as GALLIA, ROMA... are
function writeLabel(folder, cx = 692, cy = 419, width = 60) {
  const gp = path.join(folder, ci(folder, "global.bmp")), g = Buffer.from(fs.readFileSync(gp)), off = g.readUInt32LE(10), h = g.readInt32LE(22), png = path.join(ART, "hellas-label.png");
  const [w, hh] = magick([png, "-filter", "Lanczos", "-resize", `${width}x`, "-format", "%w %h", "info:"], "utf8").split(" ").map(Number);
  const px = magick([png, "-filter", "Lanczos", "-resize", `${width}x`, "-depth", "8", "rgba:-"]), x0 = cx - (w >> 1), y0 = cy - (hh >> 1);
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const a = px[(y * w + x) * 4 + 3] / 255; if (!a) continue;
    const k = off + (h > 0 ? 767 - (y0 + y) : y0 + y) * 2048 + (x0 + x) * 2, v = g.readUInt16LE(k), c = [v >> 10 & 31, v >> 5 & 31, v & 31];
    const n = c.map((d, i) => Math.round(d * (1 - a) + (px[(y * w + x) * 4 + i] >> 3) * a));
    g.writeUInt16LE(n[0] << 10 | n[1] << 5 | n[2], k);
  }
  fs.rmSync(gp); fs.writeFileSync(gp, g);
}
module.exports = { addGreece, drawShield, writeLabel };
