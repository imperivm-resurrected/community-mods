// Lays a 1.40-style mod that ships whole .pak packages (a full game copy: Packs\*.pak, Local\spanish.pak, loose folders)
// out as the loose-file folder tools/port-140.js reads:
//
//   node tools/flatten-paks.js <mod folder> <output folder>
//
// What the game sees with the mod installed is what ends up in the output: the packages of Packs\ are unpacked in name
// order, so the greater name wins (zGreek.pak over data.pak), and the loose files of the mod win over the packages.
// Local\spanish.pak goes to CURRENTLANG (port-140.js only knows the Spanish table). Left out: executables, DLLs,
// installers, launcher files, logs, profiles, the mod's rle.mmp (port-140.js reads it from <mod folder>).
// Uses the SDK's extract-data.js (SDK=<path>).
const fs = require("fs"), path = require("path"), os = require("os"), { spawnSync } = require("child_process");
const SDK = process.env.SDK || path.join(__dirname, "..", "..", "imperivm-resurrected", "sdk");
const [modDir, outDir] = process.argv.slice(2);
if (!modDir || !outDir) { console.error("usage: node tools/flatten-paks.js <mod folder> <output folder>"); process.exit(1); }
if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) { console.error("the output folder has to be empty: " + outDir); process.exit(1); }

const ci = (dir, name) => fs.readdirSync(dir).find(f => f.toLowerCase() === name.toLowerCase());
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "flat-"));
const seen = new Map(); // lowercase relative path -> path as first written (a case-insensitive file system, like the game's)
let n = 0;
const put = (rel, src) => {
  const key = rel.toLowerCase().replace(/\\/g, "/");
  const parts = rel.replace(/\\/g, "/").split("/");
  // keep the first spelling of every folder, so DATA and Data do not become two folders
  const fixed = parts.map((p, i) => { const k = parts.slice(0, i + 1).join("/").toLowerCase(); if (!seen.has("d:" + k)) seen.set("d:" + k, p); return seen.get("d:" + k); }).join("/");
  const dst = path.join(outDir, seen.get("f:" + key) || fixed); seen.set("f:" + key, path.relative(outDir, dst));
  fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); n++;
};
const overlay = root => { for (const f of fs.readdirSync(root, { recursive: true })) { const p = path.join(root, f); if (fs.statSync(p).isFile()) put(f, p); } };
const unpack = (gameDir, pak, out) => {
  const r = spawnSync("node", [path.join(SDK, "tools", "extract-data.js"), gameDir, out, pak], { encoding: "utf8" });
  if (r.status) { console.error(`${pak}: ${r.stderr || r.stdout}`); process.exit(1); }
};

const packs = ci(modDir, "Packs");
const paks = fs.readdirSync(path.join(modDir, packs)).filter(f => /\.pak$/i.test(f)).sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1));
for (const pak of paks) { const out = path.join(tmp, pak); unpack(modDir, pak, out); overlay(out); console.log(pak); }

const local = ci(modDir, "Local");
const sp = local && ci(path.join(modDir, local), "spanish.pak");
if (sp) { // extract-data.js only reads Packs\: give it a folder with the language pack there
  const g = path.join(tmp, "lang"); fs.mkdirSync(path.join(g, "Packs"), { recursive: true });
  fs.copyFileSync(path.join(modDir, local, sp), path.join(g, "Packs", sp)); unpack(g, sp, path.join(tmp, "spanish")); overlay(path.join(tmp, "spanish")); console.log(sp);
}

// loose files over the packages
const SKIP = /\.(exe|dll|x32|bak|sdw|link|retrospy|db)$|^(packs|local|logs|profiles|hof|package|launchertheme|xtras)\//i;
for (const f of fs.readdirSync(modDir, { recursive: true })) {
  const p = path.join(modDir, f), k = f.replace(/\\/g, "/");
  if (!fs.statSync(p).isFile() || SKIP.test(k) || /^(rle\.mmp|update\.xml|config\.ini|settings\.ini|currentadv\.bfhp|license.*)$/i.test(k)) continue;
  put(f, p);
}
fs.rmSync(tmp, { recursive: true });
console.log(`${n} files in ${outDir}`);
