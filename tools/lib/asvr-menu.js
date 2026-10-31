// The main menu skin of AsvrMod VII inside the port: the original GameBanana menu (stone wall, green buttons at the right of the window, tips panel, scrolling strip of
// generals, title). It is the explicit exception to "patches only" that the maintainer approved for the menu skin (cosmetic, one skin shows at a time; precedent: the Greek
// Mod 1.8 ships MAINMENU.INI and TEMPLATE.INI whole). Tried in game by the maintainer on 2026-10-31: the main menu looks like the original and the log has no errors.
//   asvrMenu({ SRC, OUT }) -> { files: [...], edits: [...] }
// SRC is the unpacked rar (the folder with DATA, UI, CURRENTLANG), OUT the port. Written, deterministic, nothing under originals/:
//   DATA/INTERFACE/MENU/MAINMENU.INI, MENUBACK.INI   the rar's, with the edits HD needs (below), CRLF as the rar has them. The other nine menu INIs of the rar are NOT shipped
//   UI/MENU/*.BMP                                    the 20 pictures of the rar, byte for byte (the green buttons and frames: they show on every menu screen)
//   CURRENTLANG/titulo.bmp, CREDITS.bmp, TIPS.XML    byte for byte (MENUBACK.INI reads titulo.bmp and CREDITS.bmp; HD reads currentlang/tips.xml)
//   CURRENTLANG/MENUBACKGROUND.bmp                   the mod's titulo.bmp (1920x1080) with the first 1024x768 frame of GENERALS.bmp pasted at (448, 156), so that the window is not
//                                                    green behind the screens that read MenuBackground.bmp. 24-bit, written here (the pixels are copied; no ImageMagick)
//   CURRENTLANG/GENERALS.bmp (8192x768, the scrolling strip), titulo3.bmp (1024x768, pure green 0,255,0 = transparent, the title)   byte for byte
// Not shipped (on purpose): GAME.LOC.XML and TRANSLATION.LOC.XML (the Spanish text table of the whole game, 755 KB each: it would translate the game for everybody), the
// other menu INIs, MENUBACKGROUNDIMPERIVM.bmp, and anything else of UI/.
// The edits of the rar's two INIs (each must apply exactly once, or the build stops):
//   MAINMENU.INI  [MainMenu Params]: ButtonXStart = 790 and ButtonYStart = 20 after the line TmplIni=Menuini/template.ini, before ButtonSpace (the buttons go to the right of the window); [TipsBackFrame] RectWH
//                 140, 260, 450, 248 -> 25, 25, 450, 248 (the tips panel inside the 1024x768 window, not at 1920x1080 coordinates)
//   MENUBACK.INI  [MenuBack] RectWH 0, 0, 1920, 1080 -> 0, 0, %Larghezza%, %Altezza% (the screen's size, whatever it is)
const fs = require("fs"), path = require("path");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const wr = (f, b) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, b); };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { const n = ci(p, part); if (!n) return null; p = path.join(p, n); } return p; };

// a 24-bit uncompressed BMP: { w, h, px: Buffer of h rows of w*3 bytes, top row first, BGR }
function readBmp(file) {
  const b = fs.readFileSync(file);
  if (b.toString("latin1", 0, 2) !== "BM") throw new Error(`${file}: not a BMP`);
  const off = b.readUInt32LE(10), w = b.readInt32LE(18), hh = b.readInt32LE(22), bpp = b.readUInt16LE(28), comp = b.readUInt32LE(30), h = Math.abs(hh);
  if (bpp !== 24 || comp !== 0) throw new Error(`${file}: only 24-bit uncompressed BMP (bpp ${bpp}, compression ${comp})`);
  const stride = Math.ceil(w * 3 / 4) * 4, px = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) { const s = off + (hh > 0 ? h - 1 - y : y) * stride; b.copy(px, y * w * 3, s, s + w * 3); }
  return { w, h, px };
}
// the same, written as a BITMAPINFOHEADER (54-byte header) bottom-up file
function bmpBytes({ w, h, px }) {
  const stride = Math.ceil(w * 3 / 4) * 4, out = Buffer.alloc(54 + stride * h);
  out.write("BM", 0); out.writeUInt32LE(out.length, 2); out.writeUInt32LE(54, 10); out.writeUInt32LE(40, 14);
  out.writeInt32LE(w, 18); out.writeInt32LE(h, 22); out.writeUInt16LE(1, 26); out.writeUInt16LE(24, 28); out.writeUInt32LE(stride * h, 34); out.writeInt32LE(2835, 38); out.writeInt32LE(2835, 42);
  for (let y = 0; y < h; y++) px.copy(out, 54 + (h - 1 - y) * stride, y * w * 3, y * w * 3 + w * 3);
  return out;
}

// One edit of an INI: inside [section], the first line that is exactly `from` (ignoring its line end) is replaced by `to` (a list of lines), or `to` is inserted after it
// (`after`). Throws unless it finds exactly one such line in the section.
function editIni(text, section, from, to, mode) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n", lines = text.split(/\r?\n/), end = lines[lines.length - 1] === "";
  if (end) lines.pop();
  let sec = "", hit = -1, n = 0;
  lines.forEach((l, i) => { const m = /^\s*\[([^\]]+)\]/.exec(l); if (m) sec = m[1]; else if (sec === section && l.trim() === from) { hit = i; n++; } });
  if (n !== 1) throw new Error(`MENU edit: [${section}] "${from}" found ${n} times (expected 1)`);
  if (mode === "after") lines.splice(hit + 1, 0, ...to); else lines.splice(hit, 1, ...to);
  return lines.join(eol) + (end ? eol : "");
}
const EDITS = {
  "MAINMENU.INI": t => {
    t = editIni(t, "MainMenu Params", "TmplIni=Menuini/template.ini", ["ButtonXStart = 790", "ButtonYStart = 20"], "after");
    return editIni(t, "TipsBackFrame", "RectWH = 140, 260, 450, 248", ["RectWH = 25, 25, 450, 248"], "replace");
  },
  "MENUBACK.INI": t => editIni(t, "MenuBack", "RectWH = 0, 0, 1920, 1080", ["RectWH = 0, 0, %Larghezza%, %Altezza%"], "replace"),
};

module.exports = function asvrMenu({ SRC, OUT, at = [448, 156], frame = [1024, 768] }) {
  const files = [], put = (rel, buf) => { wr(path.join(OUT, rel), buf); files.push(rel); };
  const need = rel => { const f = find(SRC, rel); if (!f) throw new Error(`the mod has no ${rel}`); return f; };
  // the wall with the first frame of the strip
  const wall = readBmp(need("CURRENTLANG/titulo.bmp")), strip = readBmp(need("CURRENTLANG/GENERALS.bmp")), [fw, fh] = frame, [x0, y0] = at;
  if (strip.w < fw || strip.h !== fh || x0 + fw > wall.w || y0 + fh > wall.h) throw new Error(`the frame ${fw}x${fh} does not fit: strip ${strip.w}x${strip.h}, wall ${wall.w}x${wall.h} at ${at}`);
  for (let y = 0; y < fh; y++) strip.px.copy(wall.px, ((y0 + y) * wall.w + x0) * 3, y * strip.w * 3, y * strip.w * 3 + fw * 3);
  put("CURRENTLANG/MENUBACKGROUND.bmp", bmpBytes(wall));
  for (const n of ["GENERALS.bmp", "titulo3.bmp", "titulo.bmp", "CREDITS.bmp", "TIPS.XML"]) put(`CURRENTLANG/${n}`, fs.readFileSync(need(`CURRENTLANG/${n}`)));
  // the two INIs
  const edits = [];
  for (const [name, fn] of Object.entries(EDITS)) {
    const src = fs.readFileSync(need(`DATA/INTERFACE/MENU/${name}`), "latin1"), out = fn(src);
    if (out === src) throw new Error(`MENU edit of ${name} changed nothing`);
    put(`DATA/INTERFACE/MENU/${name}`, Buffer.from(out, "latin1")); edits.push(name);
  }
  // the pictures of the buttons and frames
  const ui = need("UI/MENU"); let pics = 0;
  for (const f of fs.readdirSync(ui).filter(f => /\.bmp$/i.test(f)).sort()) { put(`UI/MENU/${f}`, fs.readFileSync(path.join(ui, f))); pics++; }
  if (pics !== 20) throw new Error(`UI/MENU: ${pics} pictures in the rar, expected 20`);
  return { files, edits };
};
