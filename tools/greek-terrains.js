#!/usr/bin/env node
// The Greek Mod's extra terrains (layers 41-55 of DATA/TERRAINS.XML: grass 3-5, rocks 3, shore rocks 2, ground 4, two waters)
// as a mod of their own -> ported/greek-mod-terrains/. HD stops at layer 40; a map painted with these crashes it when drawn
// (MareNostrum, TheWitcher). Taken from the Caesar Mod's GameBanana zip (CC BY-SA 4.0), which ships them as loose files.
//   node tools/greek-terrains.js [caesar_mod.zip]
// wrap-map.js makes every map using layer > 40 require this mod (unless it requires a mod that has them).
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), ID = "greek-mod-terrains", OUT = path.join(ROOT, "ported", ID);
const ZIP = process.argv[2] || path.join(ROOT, "originals/gamebanana/728740/caesar_mod.zip");
const BSDTAR = process.env.BSDTAR || (process.platform === "linux" ? "bsdtar" : "tar");
const PREFIX = "Caesar Mod 1.1.0/";

const xml = execFileSync(BSDTAR, ["-xOf", ZIP, PREFIX + "DATA/TERRAINS.XML"], { encoding: "latin1" });
const layers = [...xml.matchAll(/<layer\b[^>]*\/>/g)].map(m => m[0]).filter(l => +l.match(/\bz="(\d+)"/)[1] > 40);
if (layers.length !== 15) throw new Error(`expected layers 41-55, found ${layers.length}`);
// the files those layers name: terrain/<x>.vq and its minimap tiles (minimap/zoomN/terrain/<x>.bmp); %season% = each season
const seasons = ["Spring", "Autumn", "Winter"], files = new Set();
for (const l of layers) {
  const [img, mini] = ["image", "minimap"].map(a => l.match(new RegExp(`\\b${a}="([^"]+)"`))[1]);
  for (const s of /%season%/i.test(img) ? seasons : [null]) {
    const sub = p => s ? p.replace(/%season%/i, s) : p;
    files.add(sub(img));
    for (const z of [8, 16, 32]) files.add(`minimap/zoom${z}/terrain/${sub(mini)}`);
  }
}
const inZip = new Map(execFileSync(BSDTAR, ["-tf", ZIP], { encoding: "latin1" }).split("\n").map(f => [f.toLowerCase(), f]));

fs.rmSync(OUT, { recursive: true, force: true });
let n = 0;
for (const f of files) {
  const src = inZip.get((PREFIX + f).toLowerCase());
  if (!src) continue; // swater.vq / dwater.vq and their tiles: HD's own
  const to = path.join(OUT, f.toUpperCase());
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, execFileSync(BSDTAR, ["-xOf", ZIP, src], { maxBuffer: 1 << 26 }));
  n++;
}
// a patch, not a copy: it adds up with other mods' TERRAINS.XML (the Caesar Mod ships its own with the same layers: the
// optional removes keep them from doubling)
const patch = `<patch>\n${layers.map(l => `  <remove select="/terrain/layer[@z='${l.match(/\bz="(\d+)"/)[1]}']" optional="yes"/>`).join("\n")}\n  <add select="/terrain">\n${layers.map(l => "    " + l.replace(/\s+/g, " ")).join("\n")}\n  </add>\n</patch>\n`;
fs.mkdirSync(path.join(OUT, "patches/DATA"), { recursive: true });
fs.writeFileSync(path.join(OUT, "patches/DATA/TERRAINS.XML"), patch, "latin1");
fs.cpSync(path.join(ROOT, "extras", ID), OUT, { recursive: true });
console.log(`${OUT}: ${layers.length} layers, ${n} files`);
