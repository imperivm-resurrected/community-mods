// Pictures, sounds and entities that a text of the Community Mod port names, and that `tagCollisions` (tools/lib/ported-patch.js, not touched) may have renamed.
// The same bug as tools/lib/asvr-refs.js (a solid blue square where an icon should be): tagCollisions renames a file that collides with the game's or another port's
// (UI/CMDBAR/ACTIONS/FOO.BMP -> FOO_cm.BMP) and then rewrites every text that names it **by file name alone**: any name that ends with the same letters, and any file of
// the same name in another folder, follow. The reference asks for a file nobody wrote. This one is generic in the tag and also looks at sounds and entities.
//   fixRefs({ OUT, HD, TAG })      a reference that does not resolve and ends in `_<tag>` goes back to the name without it, when that resolves; a `<sounds attack="X">` whose
//                                  entity the port has renamed (X_<tag>.xml) names the renamed one (that is what the mod's fight sounds are for). Returns what it did.
//   checkRefs({ OUT, HD, TAG, baseline })  -> problems: every picture / sound entity / sound file / entity a text names must exist in the port or the game, unless the mod's own
//                                  package had the same reference unresolved too (`baseline`, from scan() over the unpacked mod: the game's own broken ones, WBreast, Anibal...,
//                                  are left alone), and no text names a `_<tag>` file, folder or class that is not there.
//   scan(root)                     the references of a folder of the mod: [{ kind, value, rel }]
// Where the engine looks: gameres/ is the interface's root (gameres/cmdbar|icons|infobar/X -> UI/CMDBAR|ICONS|INFOBAR/X); a plain value of button= -> UI/CMDBAR/X; sound files are
// relative to SOUNDS/ (voices: Local/<language>/VOICES/); an entity is a path from the root (Units/X/X.ent.xml); a sound entity is DATA/SOUND ENTITIES/<name>.xml.
const fs = require("fs"), path = require("path");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const rdl = f => fs.readFileSync(f, "latin1");
const ATTR = /\b(button|queueicon|icon|transpicon|image)\s*=\s*"([^"]*\.bmp)"/gi;
const norm = v => v.replace(/\\/g, "/").toLowerCase();
const index = (...roots) => { const s = new Set(); for (const r of roots) for (const f of walk(r)) s.add(path.relative(r, f).replace(/\\/g, "/").toLowerCase()); return s; };
const picRel = (attr, v) => { v = v.replace(/\\/g, "/"); const g = /^gameres\/(cmdbar|icons|infobar)\/(.*)$/i.exec(v); if (g) return `ui/${g[1]}/${g[2]}`; return /^button$/i.test(attr) ? `ui/cmdbar/${v}` : null; };
const dataTexts = root => [...walk(path.join(root, "DATA")), ...walk(path.join(root, "patches", "DATA"))].filter(f => /\.xml$/i.test(f) && !/[\\/](loc|local)[\\/]/i.test(f));
const strip = t => t.replace(/<!--[\s\S]*?-->/g, "");

// the root of DATA may be written in any case (DATA, data): the index lower-cases it all
function scan(root) {
  const out = [];
  for (const f of dataTexts(root)) {
    const s = strip(rdl(f)), rel = path.relative(root, f).replace(/\\/g, "/");
    for (const m of s.matchAll(ATTR)) { const r = picRel(m[1], m[2]); if (r) out.push({ kind: "picture", value: m[2], need: r, rel }); }
    if (/\.sc\.xml$/i.test(f)) {
      for (const m of s.matchAll(/<class\b[^>]*?\bentity\s*=\s*"([^"]+)"/gi)) out.push({ kind: "entity", value: m[1], need: m[1], rel });
      for (const el of s.matchAll(/<sounds\b([^>]*)\/?>/gi)) for (const a of el[1].matchAll(/\b\w+\s*=\s*"([^"]*)"/g)) {
        const v = a[1].trim(); if (!v) continue;
        out.push({ kind: "soundentity", value: v, need: /[\\/]/.test(v) ? v : `data/sound entities/${v}.xml`, rel });
      }
    }
    if (/[\\/]sound entities[\\/]/i.test(f)) for (const m of s.matchAll(/<sound\b[^>]*?\bfile\s*=\s*"([^"]+)"/gi)) { const v = m[1].replace(/\\/g, "/"); out.push({ kind: "soundfile", value: m[1], need: /^currentlang\/voices\//i.test(v) ? null : v, voice: /^currentlang\/voices\/(.*)$/i.exec(v)?.[1], rel }); }
  }
  return out;
}
// does it resolve? roots: the port (OUT) and the game's packs
const resolves = (r, have, voices) => {
  if (r.kind === "soundfile" && r.voice !== undefined) return voices.has(r.voice.toLowerCase());
  const n = norm(r.need);
  return have.has(n) || have.has(n.replace(/^sounds\//, "sounds/")) || have.has(n.replace(/^data\//, "data/"));
};
const voiceSet = (OUT) => { const s = new Set(); const L = path.join(OUT, "Local"), l2 = fs.existsSync(L) ? L : (fs.existsSync(path.join(OUT, "local")) ? path.join(OUT, "local") : null); if (l2) for (const f of walk(l2)) { const m = /[\\/]voices[\\/](.*)$/i.exec(f); if (m) s.add(m[1].replace(/\\/g, "/").toLowerCase()); } return s; };
const HDVOICES = ["local-spanish/CURRENTLANG/VOICES", "local/english/VOICES", "local/spanish/VOICES"];

function resolver(OUT, HD) {
  const have = index(OUT, HD), voices = voiceSet(OUT);
  // the game's own voices (not extracted for English): a voice file of the game cannot be checked, so a path under voices/ that the port does not have is not a problem on its own
  return { have, voices, ok: r => resolves(r, have, voices) };
}

function fixRefs({ OUT, HD, TAG }) {
  const { have, ok } = resolver(OUT, HD), done = [], tail = new RegExp(`_${TAG}(?=\\.[A-Za-z0-9]+$|$)`, "i");
  const sounds = new Set([...have].filter(f => new RegExp(`^data/sound entities/.*_${TAG}\\.xml$`, "i").test(f)).map(f => f.replace(/^data\/sound entities\//, "").replace(/\.xml$/, "")));
  for (const f of dataTexts(OUT)) {
    const s = rdl(f); let t = s;
    t = t.replace(ATTR, (m, attr, v) => {
      const r = picRel(attr, v); if (!r || have.has(r.toLowerCase())) return m;
      const orig = v.replace(tail, ""); if (orig === v) return m;
      const ro = picRel(attr, orig); if (!ro || !have.has(ro.toLowerCase())) return m;
      done.push(`${path.basename(f)} ${attr}=${v} -> ${orig}`); return m.replace(v, orig);
    });
    if (/\.sc\.xml$/i.test(f)) {
      t = t.replace(/(<class\b[^>]*?\bentity\s*=\s*")([^"]+)"/gi, (m, a, v) => {
        if (have.has(norm(v))) return m; const orig = v.replace(/_cm(?=\.[A-Za-z0-9.]+$)/i, "").replace(new RegExp(`_${TAG}(?=\\.ent\\.xml$)`, "i"), "");
        if (orig !== v && have.has(norm(orig))) { done.push(`${path.basename(f)} entity=${v} -> ${orig}`); return `${a}${orig}"`; } return m;
      });
      // the sound entities the port has renamed (UnitEMaceFight_cm.xml): <sounds attack="UnitEMaceFight"> names the mod's
      t = t.replace(/<sounds\b([^>]*)(\/?)>/gi, (m, attrs, close) => {
        const u = attrs.replace(/(\b\w+\s*=\s*")([^"\/\\]+)"/g, (mm, a, v) => (sounds.has(`${v}_${TAG}`.toLowerCase()) || [...sounds].some(x => x.toLowerCase() === `${v}_${TAG}`.toLowerCase())) ? (done.push(`${path.basename(f)} sounds ${v} -> ${v}_${TAG}`), `${a}${v}_${TAG}"`) : mm);
        return u === attrs ? m : `<sounds${u}${close}>`;
      });
    }
    if (t !== s) { fs.rmSync(f); fs.writeFileSync(f, t, "latin1"); }
  }
  return done;
}

function checkRefs({ OUT, HD, TAG, baseline = new Set() }) {
  const { have, ok } = resolver(OUT, HD), problems = [], allowed = new Set(); let n = 0;
  for (const f of dataTexts(OUT)) { /* scanned below through scan() on the port */ }
  // the review's BSHIELDS case: a reference that names the plain file while the port ships that same path renamed (X.BMP and X_<tag>.BMP) shows the game's picture, not the mod's
  const twinOf = v => (/\.ent\.xml$/i.test(v) ? v.replace(/\.ent\.xml$/i, `.ent_${TAG}.xml`) : v.replace(/(\.[A-Za-z0-9]+)$/, `_${TAG}$1`)).toLowerCase(), mine = index(OUT);
  for (const r of scan(OUT)) {
    n++;
    if (r.need && (r.kind === "picture" || r.kind === "entity") && !new RegExp(`_${TAG}\\.`, "i").test(r.need) && mine.has(twinOf(norm(r.need)))) problems.push(`${r.rel}: ${r.kind} "${r.value}" names the plain file and the port ships ${twinOf(norm(r.need))} for the same path`);
    if (ok(r)) continue;
    if (baseline.has(`${r.kind}|${norm(r.value)}`)) { allowed.add(r.value); continue; }
    // a Currentlang voice the port does not carry is the game's own (not in originals): only a renamed one (_cm) is a problem
    if (r.kind === "soundfile" && r.voice !== undefined) { if (new RegExp(`_${TAG}/`, "i").test(r.voice)) problems.push(`${r.rel}: ${r.value} is not in Local/<language>/VOICES`); continue; }
    problems.push(`${r.rel}: ${r.kind} "${r.value}" -> ${r.need} is not in the port or in the game`);
  }
  // any `_<tag>` name must be something the port has: a file (any folder), a folder, or a class
  const all = walk(OUT), files = new Set(all.map(p => path.basename(p).toLowerCase())), dirs = new Set();
  for (const p of all) for (const part of path.relative(OUT, p).split(path.sep).slice(0, -1)) dirs.add(part.toLowerCase());
  const classes = new Set(walk(path.join(OUT, "DATA", "CLASSES")).map(p => (rdl(p).match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1]).filter(Boolean).map(x => x.toLowerCase()));
  const re = new RegExp(`(["'=,\\s>])([^"'<>=,;]*_${TAG}(?:\\.[A-Za-z0-9]+)?)(?=["'<>,;\\s)]|$)`, "g");
  for (const p of all.filter(p => /\.(xml|ini|vs|txt|json)$/i.test(p))) {
    const rel = path.relative(OUT, p).replace(/\\/g, "/"); if (/^(loc|local)\//i.test(rel)) continue;
    for (const m of rdl(p).matchAll(re)) {
      const v = m[2].trim().replace(/\\/g, "/"), b = v.split("/").pop().toLowerCase();
      if (!files.has(b) && !dirs.has(b) && !classes.has(b) && !have.has(v.toLowerCase()) && !have.has(`data/sound entities/${b}.xml`)) problems.push(`${rel}: "${v}" names a file, folder or class that does not exist`);
    }
  }
  return { problems: [...new Set(problems)], checked: n, allowed: [...allowed] };
}
const baselineOf = (root, HD) => { const { ok } = resolver(root, HD); return new Set(scan(root).filter(r => !ok(r)).map(r => `${r.kind}|${norm(r.value)}`)); };

module.exports = { scan, fixRefs, checkRefs, baselineOf };

// self-test: node tools/lib/community-refs.js
if (require.main === module) {
  const assert = require("assert"), os = require("os");
  const T = fs.mkdtempSync(path.join(os.tmpdir(), "cm-refs-")), O = path.join(T, "port"), H = path.join(T, "hd"), put = (r, p, s = "x") => { fs.mkdirSync(path.dirname(path.join(r, p)), { recursive: true }); fs.writeFileSync(path.join(r, p), s); };
  put(H, "UI/CMDBAR/UPGRADES/GLADIATOR SHOW.BMP"); put(H, "DATA/SOUND ENTITIES/UnitEMaceFight.xml"); put(O, "UI/CMDBAR/ACTIONS/HEAVY HORSESHOES.BMP"); put(O, "DATA/SOUND ENTITIES/UnitEMaceFight_cm.xml");
  put(O, "DATA/COMMANDS/A.XML", '<cmd button="Upgrades/Gladiator show_cm.bmp" queueicon="gameres/icons/upgrades/nothing.bmp"/>\n<cmd button="actions/HEAVY HORSESHOES_cm.BMP"/>');
  put(O, "DATA/CLASSES/X.SC.XML", '<class id="X" entity="Units/X/X_cm.ent.xml">\n<sounds attack="UnitEMaceFight"/>\n</class>'); put(O, "UNITS/X/X.ENT.XML");
  const base = baselineOf(O, H);
  assert(checkRefs({ OUT: O, HD: H, TAG: "cm", baseline: new Set() }).problems.length >= 3, "the broken references are found");
  const d = fixRefs({ OUT: O, HD: H, TAG: "cm" }); assert.strictEqual(d.length, 4, d.join("\n"));
  put(O, "UI/CMDBAR/UPGRADES/BSHIELDS_cm.BMP"); put(O, "DATA/COMMANDS/C.XML", '<cmd button="upgrades/BSHIELDS.BMP"/>');
  assert(checkRefs({ OUT: O, HD: H, TAG: "cm", baseline: base }).problems.some(p => /names the plain file/.test(p)), "a plain reference with a renamed twin of the same path is found");
  fs.rmSync(path.join(O, "DATA/COMMANDS/C.XML")); fs.rmSync(path.join(O, "UI/CMDBAR/UPGRADES/BSHIELDS_cm.BMP"));
  const c = checkRefs({ OUT: O, HD: H, TAG: "cm", baseline: base }); assert.strictEqual(c.problems.length, 0, c.problems.join("\n") + " (`nothing.bmp` was unresolved in the mod's own text: allowed)");
  put(O, "DATA/COMMANDS/B.XML", '<cmd queueicon="gameres/icons/upgrades/new_missing.bmp"/>'); assert.strictEqual(checkRefs({ OUT: O, HD: H, TAG: "cm", baseline: base }).problems.length, 1, "a new one stops the build");
  assert(/UnitEMaceFight_cm/.test(rdl(path.join(O, "DATA/CLASSES/X.SC.XML"))), "the renamed sound entity is named");
  console.log("community-refs self-test ok");
}
