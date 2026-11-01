// What the texts of a Greek 2.x port name (pictures, sounds, entities, renamed files) and whether it exists. Used by tools/greek-2x.js after `tagCollisions`.
//
// Why: tools/lib/ported-patch.js `tagCollisions` renames a file that collides with another port's (UI/CMDBAR/UPGRADES/CSHIELDS.BMP -> CSHIELDS_w23.BMP) and then rewrites
// every text that names it **by file name alone**, in every folder. When the copy that was renamed was another one with the same name (the icon under UI/ICONS/UPGRADES
// stayed as it was, or HD's own file was identical and was dropped), the references that meant THAT file now name `<name>_w23.BMP`, which nobody wrote: the game draws its
// missing-picture placeholder, a solid blue square (found in game in the AsvrMod port, PR #40, `tools/lib/asvr-refs.js`; the same logic, copied here and parameterized
// by the tag because that port's file is not in this branch and ported-patch.js, which is shared, was not touched).
//   fixBmpRefs      a picture reference that does not resolve and ends in `_<tag>` goes back to the name the mod's own text had, if THAT resolves. Nothing else is rewritten.
//   fixClassWords   `tagCollisions` also renames the words of an order or a text that spell a renamed class id when they follow a Capitalized word (`Gaul Spearman` became
//                   `Gaul Spearman_w25` because of the neutral class `Spearman`): they go back.
//   fixSoundRefs    the same rename leaves a class's `sounds attack="MyrmidonFight"` (a bare entity name, no `.xml` for the rewrite to find) pointing to the old name of an
//                   entity that is now `MyrmidonFight_w23`: the unit loses its sound. The reference follows the file.
//   checkRefs       (stops the build) every picture a command, a class or an item names exists in the port or in the game's packs (the engine's rules below); every
//                   sound file and sound entity a text names exists; every `entity=` exists; no text names a `_<tag>` file, folder or class that is not there. What the mod's own
//                   package could not resolve either is allowed by name with the reason (ALLOW), and so is what the build left out on purpose (Imperivm Legacy's files).
//                   Files the engine reads by a name pattern and that the rename broke (a class renamed `X.SC_w23.XML` is not `*.sc.xml`) are returned apart: `patternBroken`.
// Where the engine looks for a picture (gameres/ is the interface's root): gameres/cmdbar|icons|infobar/X -> UI/CMDBAR|ICONS|INFOBAR/X; a plain `button=` value -> UI/CMDBAR/X.
const fs = require("fs"), path = require("path");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const ATTR = /\b(button|queueicon|icon|transpicon|image)\s*=\s*"([^"]*\.bmp)"/gi;
const textsOf = OUT => [...walk(path.join(OUT, "DATA")), ...walk(path.join(OUT, "patches", "DATA"))].filter(f => /\.xml$/i.test(f) && !/[\\/](loc|local)[\\/]/i.test(f));
const relOf = (attr, v) => {
  v = v.replace(/\\/g, "/");
  const g = /^gameres\/(cmdbar|icons|infobar)\/(.*)$/i.exec(v); if (g) return `ui/${g[1]}/${g[2]}`;
  return /^button$/i.test(attr) ? `ui/cmdbar/${v}` : null;
};
// the files that exist, lowercase, relative to the root of the port or of the game's packs
const index = (...roots) => { const s = new Set(); for (const r of roots) for (const f of walk(r)) s.add(path.relative(r, f).replace(/\\/g, "/").toLowerCase()); return s; };

// References the mod's own package already could not resolve (checked in the package and in HD): the build does not stop for these, and nothing is invented.
//   key: the value, lowercase
const ALLOW = new Map([
  ["gameres/icons/upgrades/wbreast.bmp", "HD's own BLACKSMITH.XML names it too; HD has the picture only under UI/HELP/UPGRADES, not where the queue icon looks (not this port's)"],
]);

function fixBmpRefs(OUT, HD, tag) {
  const have = index(OUT, HD), fixed = [], suffix = new RegExp(`_${tag}(\\.bmp)$`, "i");
  for (const f of textsOf(OUT)) {
    const s = fs.readFileSync(f, "latin1");
    const t = s.replace(ATTR, (m, attr, v) => {
      const rel = relOf(attr, v); if (!rel || have.has(rel.toLowerCase())) return m;
      const orig = v.replace(suffix, "$1"); if (orig === v) return m;          // the suffix names a file that was never written
      const r2 = relOf(attr, orig); if (!r2 || !have.has(r2.toLowerCase())) return m;   // the unsuffixed one does not exist either: checkRefs says it
      fixed.push(`${path.basename(f)} ${attr}=${v} -> ${orig}`);
      return m.replace(v, orig);
    });
    if (t !== s) { fs.rmSync(f); fs.writeFileSync(f, t, "latin1"); }
  }
  return fixed;
}

// a bare sound entity name in a class (`<sounds attack="MyrmidonFight"/>`) that does not resolve, whose renamed entity `<name>_<tag>.XML` is in the port
function fixSoundRefs(OUT, HD, tag) {
  const names = new Set([...walk(path.join(OUT, "DATA", "SOUND ENTITIES")), ...walk(path.join(HD, "DATA", "SOUND ENTITIES"))].map(p => path.basename(p).replace(/\.xml$/i, "").toLowerCase()));
  const fixed = [];
  for (const f of walk(path.join(OUT, "DATA", "CLASSES")).filter(p => /\.xml$/i.test(p))) {
    const s = fs.readFileSync(f, "latin1");
    const t = s.replace(/(<sounds\b)([^>]*)/gi, (m, a, attrs) => a + attrs.replace(/\b(\w+)(\s*=\s*")([A-Za-z0-9_ ]+)"/g, (mm, k, eq, v) => { if (names.has(v.toLowerCase()) || !names.has(`${v}_${tag}`.toLowerCase())) return mm; fixed.push(`${path.basename(f)}: sounds ${k}=${v} -> ${v}_${tag}`); return `${k}${eq}${v}_${tag}"`; }));
    if (t !== s) { fs.rmSync(f); fs.writeFileSync(f, t, "latin1"); }
  }
  return fixed;
}

// `ids`: the class ids `tagCollisions` renamed (the files DATA/CLASSES/<ID>_<tag>.SC.XML)
function fixClassWords(OUT, tag) {
  const ids = walk(path.join(OUT, "DATA", "CLASSES")).map(p => (fs.readFileSync(p, "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1]).filter(x => x && x.toLowerCase().endsWith(`_${tag}`)).map(x => x.slice(0, -tag.length - 1));
  if (!ids.length) return [];
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), fixed = [];
  const re = new RegExp(`((?<![A-Za-z0-9_])[A-Z][a-z0-9]+ )(${ids.map(esc).join("|")})_${tag}(?![A-Za-z0-9_])`, "g");
  for (const f of walk(OUT).filter(p => /\.(xml|json)$/i.test(p) && !/[\\/]UNITS[\\/]|[\\/]BUILDINGS[\\/]|[\\/]MAPOBJECTS[\\/]/i.test(p))) {
    const s = fs.readFileSync(f, "latin1"), t = s.replace(re, (_m, a, id) => { fixed.push(`${path.basename(f)}: ${a}${id}_${tag} -> ${a}${id}`); return `${a}${id}`; });
    if (t !== s) { fs.rmSync(f); fs.writeFileSync(f, t, "latin1"); }
  }
  return fixed;
}

// -> { problems, allowed, checked, patternBroken }. `legacy`: relative paths (any case) left out on purpose.
function checkRefs(OUT, HD, tag, { legacy = [], extraRoots = [], hdClasses = null, ownBugs = new Map() } = {}) {
  const have = index(OUT, HD, ...extraRoots), problems = [], allowed = new Map(), left = new Set(legacy.map(x => x.replace(/\\/g, "/").toLowerCase())); let n = 0;
  const bad = (f, what, why) => problems.push(`${path.relative(OUT, f).replace(/\\/g, "/")}: ${what} ${why}`);
  // pictures
  for (const f of textsOf(OUT)) {
    const s = fs.readFileSync(f, "latin1").replace(/<!--[\s\S]*?-->/g, "");
    for (const m of s.matchAll(ATTR)) {
      const rel = relOf(m[1], m[2]); if (!rel) continue; n++;
      if (have.has(rel.toLowerCase())) continue;
      const v = m[2].replace(/\\/g, "/").toLowerCase();
      if (ALLOW.has(v) || ownBugs.has(v)) { allowed.set(m[2], ALLOW.get(v) || ownBugs.get(v)); continue; }
      if (left.has(rel.toLowerCase()) || left.has(rel.toLowerCase().replace(new RegExp(`_${tag}(\\.bmp)$`), "$1"))) { allowed.set(m[2], "left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder"); continue; }
      bad(f, `${m[1]}="${m[2]}"`, `-> ${rel} is not in the port or in the game`);
    }
  }
  // sounds: a sound entity's files, a class's entity and sound entities
  const soundHave = p => { p = p.replace(/\\/g, "/").toLowerCase(); if (have.has(p)) return true; const m = /^currentlang\/(.*)$/.exec(p); return !!m && [...have].some(x => /^local\/[^/]+\/(.*)$/.test(x) && x.replace(/^local\/[^/]+\//, "") === m[1]); };
  for (const f of walk(path.join(OUT, "DATA", "SOUND ENTITIES"))) for (const m of fs.readFileSync(f, "latin1").matchAll(/<sound\b[^>]*?\bfile\s*=\s*"([^"]+)"/gi)) {
    n++; if (soundHave(m[1])) continue;
    const v = m[1].replace(/\\/g, "/"), k = v.toLowerCase();
    if (left.has(k) || left.has(k.replace(/^currentlang\//, ""))) { allowed.set(v, "left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled)"); continue; }
    if (ownBugs.has(k)) { allowed.set(v, ownBugs.get(k)); continue; }
    if (v.includes("'") && soundHave(v.replace(/'/g, "_"))) { allowed.set(v, "the mod's package names the file with `_` where its own sound entity has `'` (HD's files keep the apostrophe): the original did not resolve either"); continue; }
    bad(f, `file="${m[1]}"`, "is not in the port or in the game");
  }
  const entName = new Set([...have].filter(x => x.startsWith("data/sound entities/")).map(x => x.slice(20).replace(/\.xml$/, "")));
  for (const f of walk(path.join(OUT, "DATA", "CLASSES")).filter(p => /\.xml$/i.test(p))) {
    const s = fs.readFileSync(f, "latin1").replace(/<!--[\s\S]*?-->/g, "");
    for (const m of s.matchAll(/\bentity(?:_winter)?\s*=\s*"([^"]+\.ent\.xml)"/gi)) { n++; if (!have.has(m[1].replace(/\\/g, "/").toLowerCase())) bad(f, `entity="${m[1]}"`, "is not in the port or in the game"); }
    for (const m of s.matchAll(/<sounds\b([^>]*)\/?>/gi)) for (const a of m[1].matchAll(/\b(\w+)\s*=\s*"([^"]+)"/g)) {
      n++; const raw = a[2].replace(/\\/g, "/"), v = raw.replace(/^data\/sound entities\//i, "").replace(/\.xml$/i, "");
      if (/\.wav$/i.test(raw) ? have.has(raw.toLowerCase()) : entName.has(v.toLowerCase())) continue;
      if (hdClasses && hdClasses.has(`${a[1]}=${raw}`.toLowerCase())) { allowed.set(raw, "the game's own classes name it the same way and it does not resolve in HD either"); continue; }
      bad(f, `sounds ${a[1]}="${a[2]}"`, "is not a sound entity or sound of the port or the game");
    }
  }
  // any `_<tag>` name must be something the port has: a file (any folder), a folder, or a class
  const all = walk(OUT), files = new Set(all.flatMap(p => [path.basename(p).toLowerCase(), path.basename(p, path.extname(p)).toLowerCase()])), dirs = new Set();   // a sound entity is named without its .xml
  for (const p of all) for (const part of path.relative(OUT, p).split(path.sep).slice(0, -1)) dirs.add(part.toLowerCase());
  const classes = new Set(walk(path.join(OUT, "DATA", "CLASSES")).map(p => (fs.readFileSync(p, "latin1").match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1]).filter(Boolean).map(x => x.toLowerCase()));
  const re = new RegExp(`(["'=,\\s>])([^"'<>=,;\\r\\n]*_${tag}(?:\\.[A-Za-z0-9]+)?)(?=["'<>,;\\s)]|$)`, "g");
  for (const p of all.filter(p => /\.(xml|ini|vs|txt|json)$/i.test(p))) {
    const rel = path.relative(OUT, p).replace(/\\/g, "/"); if (/^(loc|local)\//i.test(rel)) continue;
    const text = fs.readFileSync(p, "latin1"), body = /\.vs$/i.test(p) ? text.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ") : text;   // a comment names nothing
    for (const m of body.matchAll(re)) {
      const v = m[2].trim().replace(/\\/g, "/"), b = v.split("/").pop().toLowerCase();
      const last = b.split(" ").pop();            // a parameter `SetSet CHorseman_w23` names the class after its verb
      if (!files.has(b) && !dirs.has(b) && !classes.has(b) && !classes.has(last) && !have.has(v.toLowerCase())) problems.push(`${rel}: "${v}" names a file, folder or class that does not exist`);
    }
  }
  // classes are read by the name pattern *.sc.xml; a rename that moves the tag before the extension may break it (the random-map templates `X.RM_<tag>.XML` are NOT reported: kept on purpose, see NOTES.md)
  const patternBroken = all.map(p => path.relative(OUT, p).replace(/\\/g, "/")).filter(r => new RegExp(`^data/classes/.*\\.sc_${tag}\\.xml$`, "i").test(r));
  return { problems: [...new Set(problems)], allowed, checked: n, patternBroken };
}

// the values `sounds` carries in the game's own classes, `attr=value` lowercase
const hdSounds = HD => { const s = new Set(); for (const f of walk(path.join(HD, "DATA", "CLASSES")).filter(p => /\.xml$/i.test(p))) for (const m of fs.readFileSync(f, "latin1").matchAll(/<sounds\b([^>]*)/gi)) for (const a of m[1].matchAll(/\b(\w+)\s*=\s*"([^"]+)"/g)) s.add(`${a[1]}=${a[2].replace(/\\/g, "/")}`.toLowerCase()); return s; };

module.exports = { fixBmpRefs, fixSoundRefs, fixClassWords, checkRefs, hdSounds, ALLOW };

// self-test: node tools/lib/greek-2x-refs.js
if (require.main === module) {
  const assert = require("assert"), os = require("os");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "g2x-refs-")), O = path.join(T, "port"), H = path.join(T, "hd"), put = (r, p, s = "x") => { fs.mkdirSync(path.dirname(path.join(r, p)), { recursive: true }); fs.writeFileSync(path.join(r, p), s); };
  put(H, "UI/ICONS/UPGRADES/ZOMBIFY.BMP"); put(O, "UI/ICONS/UPGRADES/CSHIELDS.BMP"); put(O, "UI/CMDBAR/UPGRADES/CSHIELDS_w23.BMP"); put(O, "UI/CMDBAR/UPGRADES/OTHER_w23.BMP");
  put(O, "DATA/CLASSES/SPEARMAN_w23.SC.XML", '<class id="Spearman_w23" parent="Melee"/>');
  put(O, "DATA/COMMANDS/A.XML", ['<cmd queueicon="gameres/icons/upgrades/CSHIELDS_w23.BMP" button="upgrades/CSHIELDS_w23.BMP" name="Gaul Spearman_w23"/>', '<cmd queueicon="gameres/icons/upgrades/ZOMBIFY_w23.BMP"/>', '<cmd button="upgrades/OTHER_w23.BMP"/>', '<cmd param="SetSet Spearman_w23"/>'].join("\n"));
  assert(checkRefs(O, H, "w23").problems.length >= 2, "the broken references are found");
  assert.strictEqual(fixBmpRefs(O, H, "w23").length, 2);   // CSHIELDS under ICONS and ZOMBIFY; the button CSHIELDS_w23 and OTHER_w23 exist: untouched
  assert.strictEqual(fixClassWords(O, "w23").length, 1);    // "Gaul Spearman_w23" is a name; "SetSet Spearman_w23" is the class
  assert.deepStrictEqual(checkRefs(O, H, "w23").problems, [], "after the fix nothing is missing");
  const a = fs.readFileSync(path.join(O, "DATA/COMMANDS/A.XML"), "latin1"); assert(/icons\/upgrades\/CSHIELDS\.BMP/.test(a) && /button="upgrades\/CSHIELDS_w23\.BMP"/.test(a) && /name="Gaul Spearman"/.test(a) && /SetSet Spearman_w23/.test(a));
  put(O, "DATA/COMMANDS/B.XML", '<cmd queueicon="gameres/icons/upgrades/nothing.bmp"/>'); assert.strictEqual(checkRefs(O, H, "w23").problems.length, 1, "a reference nobody has stops the build");
  assert.strictEqual(checkRefs(O, H, "w23", { legacy: ["UI/ICONS/UPGRADES/NOTHING.BMP"] }).problems.length, 0, "a Legacy file left out on purpose is allowed");
  put(O, "DATA/CLASSES/WINTER/X.SC_w23.XML"); assert.strictEqual(checkRefs(O, H, "w23", { legacy: ["UI/ICONS/UPGRADES/NOTHING.BMP"] }).patternBroken.length, 1);
  console.log("greek-2x-refs self-test ok");
}
