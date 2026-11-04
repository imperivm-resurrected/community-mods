// Pictures and other resources that a text of the port names, and that `tagCollisions` (tools/lib/ported-patch.js) may have renamed.
//
// The bug this exists for (Imperial Rome (Legacy), "Gladiator shows": a solid blue square instead of the icon): tagCollisions renames a file that collides
// with another port's (UI/ICONS/UPGRADES/SHIELDS.BMP -> SHIELDS_leg.BMP) and then rewrites every text that names it **by file name alone**: any name that
// ends with the same letters (`Wall of SHIELDS.BMP`, `Gladiator show.bmp` because of `show.bmp`), and any file of the same name in another folder
// (`actions/HEAVY HORSESHOES.BMP`, HD's `research/CHARM OF ISIS.BMP`) follows. The reference then asks for a file nobody wrote. The shared library cannot
// tell, it does not know where the engine looks for a picture, so this tool does, after it:
//   fixBmpRefs   a picture reference that does not resolve and ends in `_leg` goes back to the name the mod's own text had. If that resolves (in the port or
//                in the game's packs) the original did too, and the port says the same; if not, the mod's own package was already missing it (allowed below).
//                Nothing else is rewritten.
//   checkRefs    (stops the build) every picture named by a command, a class or an item must exist in the port or in the game's packs, and no text names a
//                `_leg` file, folder or class that is not there (sounds, entities, item scripts...). A reference that is missing in the mod's own package is
//                allowed by name below, with the reason.
// Where the engine looks (gameres/ is the interface's root): gameres/cmdbar|icons|infobar/X -> UI/CMDBAR|ICONS|INFOBAR/X; a plain value of button= -> UI/CMDBAR/X.
const fs = require("fs"), path = require("path");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const ATTR = /\b(button|queueicon|icon|transpicon|image)\s*=\s*"([^"]*\.bmp)"/gi;
const textsOf = OUT => [...walk(path.join(OUT, "DATA")), ...walk(path.join(OUT, "patches", "DATA"))].filter(f => /\.xml$/i.test(f) && !/[\\/](loc|local)[\\/]/i.test(f));
const relOf = (attr, v) => { v = v.replace(/\\/g, "/"); const g = /^gameres\/(cmdbar|icons|infobar)\/(.*)$/i.exec(v); if (g) return `ui/${g[1]}/${g[2]}`; return /^button$/i.test(attr) ? `ui/cmdbar/${v}` : null; };
// the files that exist, lowercase, relative to the root of the port or of the game's packs
const index = (...roots) => { const s = new Set(); for (const r of roots) for (const f of walk(r)) s.add(path.relative(r, f).replace(/\\/g, "/").toLowerCase()); return s; };

// References the mod's own package already could not resolve (checked in the rar and in HD): the build does not stop for these, and nothing is invented.
//   key: the value, lowercase
const ALLOW = new Map([
  ["gameres/icons/upgrades/wbreast.bmp", "HD's own BLACKSMITH.XML names it too; HD has the picture only under UI/HELP/UPGRADES, not where the queue icon looks"],
  ["gameres/icons/items/charm of osiris.bmp", "the rar's ITEMS.XML names it so and the rar's file is `CHARM OF OSIRIS .BMP` (a space before the dot): the original did not resolve either"],
  ["gameres/icons/upgrades/open gate per.bmp", "the rar ships OPEN GATE PER.BMP only as UI/CMDBAR/ACTIONS (the button); the queue icon's path exists neither in the rar nor in HD"],
  ["gameres/icons/upgrades/close gate per.bmp", "the rar ships CLOSE GATE PER.BMP only as UI/CMDBAR/ACTIONS (the button); the queue icon's path exists neither in the rar nor in HD"],
]);

function fixBmpRefs(OUT, HD) {
  const have = index(OUT, HD), fixed = [];
  for (const f of textsOf(OUT)) {
    const s = fs.readFileSync(f, "latin1");
    const t = s.replace(ATTR, (m, attr, v) => {
      const rel = relOf(attr, v); if (!rel || have.has(rel.toLowerCase())) return m;
      const orig = v.replace(/_leg(\.bmp)$/i, "$1"); if (orig === v) return m;      // the suffix names a file that was never written: the mod's own text said `orig`, resolved or not
      fixed.push(`${path.basename(f)} ${attr}=${v} -> ${orig}`);
      return m.replace(v, orig);
    });
    if (t !== s) { fs.rmSync(f); fs.writeFileSync(f, t, "latin1"); }
  }
  return fixed;
}

// -> list of problems (strings); `info.allowed` receives the allowed references that were found
function checkRefs(OUT, HD, info = {}) {
  const have = index(OUT, HD), problems = [], allowed = new Set(); let n = 0;
  for (const f of textsOf(OUT)) {
    const s = fs.readFileSync(f, "latin1").replace(/<!--[\s\S]*?-->/g, "");
    for (const m of s.matchAll(ATTR)) {
      const rel = relOf(m[1], m[2]); if (!rel) continue; n++;
      if (have.has(rel.toLowerCase())) continue;
      if (ALLOW.has(m[2].replace(/\\/g, "/").toLowerCase())) { allowed.add(m[2]); continue; }
      problems.push(`${path.basename(f)}: ${m[1]}="${m[2]}" -> ${rel} is not in the port or in the game`);
    }
  }
  // any `_leg` name must be something the port has: a file (any folder), a folder, or a class
  const all = walk(OUT), files = new Set(all.map(p => path.basename(p).toLowerCase())), dirs = new Set();
  for (const p of all) for (const part of path.relative(OUT, p).split(path.sep).slice(0, -1)) dirs.add(part.toLowerCase());
  const classes = new Set(walk(path.join(OUT, "DATA", "CLASSES")).map(p => (fs.readFileSync(p, "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1]).filter(Boolean).map(x => x.toLowerCase()));
  for (const p of all.filter(p => /\.(xml|ini|vs|txt|json)$/i.test(p))) {
    const rel = path.relative(OUT, p).replace(/\\/g, "/"); if (/^(loc|local)\//i.test(rel)) continue;
    for (const m of fs.readFileSync(p, "latin1").matchAll(/(["'=,\s>])([^"'<>=,;]*_leg(?:\.[A-Za-z0-9]+)?)(?=["'<>,;\s)]|$)/g)) {
      const v = m[2].trim().replace(/\\/g, "/"), b = v.split("/").pop().toLowerCase();
      if (!files.has(b) && !dirs.has(b) && !classes.has(b) && !have.has(v.toLowerCase())) problems.push(`${rel}: "${v}" names a file, folder or class that does not exist`);
    }
  }
  info.checked = n; info.allowed = [...allowed];
  return [...new Set(problems)];
}

// The same bug for every other kind of file (found for Legacy: the item scripts). tagCollisions renamed the mod's MUSHROOM.VS (the game has one with other bytes) to
// MUSHROOM_leg.VS and then rewrote every text that names a file ending in "MUSHROOM.VS" by file name alone: "enlightening MUSHROOM.VS", "toxic MUSHROOM.VS" (files the mod ships
// under that very name) became "enlightening MUSHROOM_leg.VS", which nobody wrote. A name with the suffix whose file is not in the port goes back to the name the mod's text had,
// when that file is in the port or in the game's packs. Pictures are left to fixBmpRefs (they need the engine's folder rules); nothing else is rewritten.
function fixFileRefs(OUT, HD) {
  const names = new Set(), fixed = [];
  for (const r of [OUT, HD]) for (const f of walk(r)) names.add(path.basename(f).toLowerCase());
  const all = walk(OUT), dirs = new Set(); for (const p of all) for (const part of path.relative(OUT, p).split(path.sep).slice(0, -1)) dirs.add(part.toLowerCase());
  const files = all.filter(p => /\.(xml|ini|vs|txt|json)$/i.test(p) && !/[\\/](loc|local)[\\/]/i.test(p));
  for (const f of files) {
    const s = fs.readFileSync(f, "latin1");
    const t = s.replace(/([^"'<>=,;\r\n\\/]*)_leg(\.(?:vs|wav|mp3|xml|ini|txt))(?=["'<>,;\s)]|$)/gi, (m, stem, ext) => {
      const b = (stem + "_leg" + ext).toLowerCase(), orig = (stem + ext).toLowerCase();
      if (names.has(b) || dirs.has(b)) return m;                                        // the renamed file is there
      if (!names.has(orig)) return m;                                                     // nobody has the original either: the check reports it
      fixed.push(`${path.basename(f)} ${stem}_leg${ext} -> ${stem}${ext}`); return stem + ext;
    });
    if (t !== s) { fs.rmSync(f); fs.writeFileSync(f, t, "latin1"); }
  }
  return fixed;
}

// Entities and sounds: the class's `entity=` must be an .ent.xml of the port or the game; each image of an .ent.xml must have its .RLE.MMP next to it (the port's folder, or the game's
// of the same name: the renamed entity files stay in the game's folder and the sprites the mod did not change are the game's); each `<sound file=` of a sound entity must be a
// file of the port or the game (what is under CurrentLang/ is in the language packs, which are not read here: counted, not checked).
// -> { problems, notes }
function checkAssets(OUT, HD) {
  const problems = [], idx = new Map();                                             // lowercase relative path -> true, for the port and the game
  for (const root of [OUT, HD]) for (const f of walk(root)) idx.set(path.relative(root, f).replace(/\\/g, "/").toLowerCase(), true);
  const has = rel => idx.has(rel.replace(/\\/g, "/").toLowerCase());
  let ents = 0, imgs = 0, snd = 0, lang = 0;
  const classes = walk(path.join(OUT, "DATA", "CLASSES")).filter(f => /\.sc\.xml$/i.test(f));
  for (const f of classes) for (const m of fs.readFileSync(f, "latin1").replace(/<!--[\s\S]*?-->/g, "").matchAll(/\bentity\s*=\s*"([^"]+)"/g)) { ents++; if (!has(m[1])) problems.push(`${path.basename(f)}: entity="${m[1]}" is not in the port or the game`); }
  for (const f of walk(OUT).filter(p => /\.ent(_[a-z]+)?\.xml$/i.test(p))) {
    const dir = path.dirname(path.relative(OUT, f)).replace(/\\/g, "/");
    for (const m of fs.readFileSync(f, "latin1").replace(/<!--[\s\S]*?-->/g, "").matchAll(/<image\b[^>]*\bfile\s*=\s*"([^"]+)"/g)) {
      imgs++;
      const n = /\.rle\.mmp$/i.test(m[1]) ? m[1] : /\.rle$/i.test(m[1]) ? `${m[1]}.mmp` : `${m[1]}.rle.mmp`, cand = [`${dir}/${n}`, `${dir.replace(/_[a-z]{2,4}$/i, "")}/${n}`];
      if (!cand.some(has)) problems.push(`${path.relative(OUT, f).replace(/\\/g, "/")}: image "${m[1]}" has no ${n} in its folder, in the port or in the game`);
    }
  }
  const SE = path.join(OUT, "DATA", "SOUND ENTITIES");
  for (const f of walk(SE).filter(p => /\.xml$/i.test(p))) for (const m of fs.readFileSync(f, "latin1").replace(/<!--[\s\S]*?-->/g, "").matchAll(/<sound\b[^>]*\bfile\s*=\s*"([^"]+)"/g)) {
    if (/^currentlang[\\/]/i.test(m[1])) { lang++; continue; }
    snd++; if (!has(m[1])) problems.push(`${path.basename(f)}: sound "${m[1]}" is not in the port or the game`);
  }
  return { problems: [...new Set(problems)], notes: [`assets: ${ents} entity references, ${imgs} images of entities, ${snd} sounds checked; ${lang} sounds under CurrentLang/ are in the language packs (not read)`] };
}

module.exports = { fixBmpRefs, fixFileRefs, checkRefs, checkAssets, ALLOW };

// self-test: node tools/lib/legacy-refs.js
if (require.main === module) {
  const assert = require("assert"), os = require("os");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "legacy-refs-")), O = path.join(T, "port"), H = path.join(T, "hd"), put = (r, p, s = "x") => { fs.mkdirSync(path.dirname(path.join(r, p)), { recursive: true }); fs.writeFileSync(path.join(r, p), s); };
  put(H, "UI/CMDBAR/UPGRADES/GLADIATOR SHOW.BMP"); put(O, "UI/CMDBAR/ACTIONS/HEAVY HORSESHOES.BMP"); put(O, "UI/ICONS/UPGRADES/Wall of shields.bmp"); put(O, "UI/CMDBAR/UPGRADES/OTHER_leg.BMP");
  put(O, "DATA/COMMANDS/A.XML", ['<cmd button="Upgrades/Gladiator show_leg.bmp" queueicon="gameres/icons/upgrades/Wall of SHIELDS_leg.BMP"/>', '<cmd button="actions/HEAVY HORSESHOES_leg.BMP"/>', '<cmd button="upgrades/OTHER_leg.BMP"/>'].join("\n"));
  assert(checkRefs(O, H).length >= 3, "the broken references are found");
  assert.strictEqual(fixBmpRefs(O, H).length, 3);   // OTHER_leg exists: untouched
  assert.deepStrictEqual(checkRefs(O, H), [], "after the fix nothing is missing");
  const a = fs.readFileSync(path.join(O, "DATA/COMMANDS/A.XML"), "latin1"); assert(/Upgrades\/Gladiator show\.bmp/.test(a) && /actions\/HEAVY HORSESHOES\.BMP/.test(a) && /OTHER_leg\.BMP/.test(a), "only the references that did not resolve go back");
  put(O, "DATA/COMMANDS/B.XML", '<cmd queueicon="gameres/icons/upgrades/nothing.bmp"/>'); assert.strictEqual(checkRefs(O, H).length, 1, "a reference nobody has stops the build");
  put(O, "DATA/COMMANDS/B.XML", '<cmd queueicon="gameres/icons/upgrades/wbreast.bmp"/>'); assert.deepStrictEqual(checkRefs(O, H), [], "an allowed one does not");
  console.log("legacy-refs self-test ok");
}
