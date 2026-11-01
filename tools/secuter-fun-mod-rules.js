// Secuter's Fun mod 1.5, its GLOBAL part, as a WORLD RULES PACK (AGENTS.md, "World rules packs"): `secuter-fun-mod-rules`. No clones, no civilizations, no set. What the
// civilizations packs (tools/secuter-fun-mod.js) leave out because a clone cannot carry it: the game's neutral objects the mod edited, the garrison of the forts (the
// per-civilization outposts and OUTPOST_BEHAVIOR.VS), the Stonehenge, the items, the constants. Only patches, and it changes the game's own classes and values
// for every player while it is on (the descriptions say so). Rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/secuter-fun-mod-rules.js
// From the plain version's zip (the maintainer decided one rules pack, built from it; the Greece version's differences are in NOTES.md):
//   1. ITEMS.XML: the items the mod ADDS, with ids of their own ("s" + the mod's id), and the item scripts they name (S_*.VS)
//   2. every global class the mod edited becomes a patch of that class: <add>/<set> on its <properties> (never a whole class file); the mod's new neutral classes (the camps,
//      the Pyramid) are additive files with ids the game does not have
//   3. OUTPOST_BEHAVIOR.VS and ARENA_BEHAVIOR.VS as @-directives applied to the game's script in place (a copy cannot replace an inherited behavior: the
//      engine runs it NEXT to the parent's, CVXScriptClass::ResolveMethods 005a5fd0). The arrays the first one indexes with `.race` are guarded: a race above 7 (a civilization
//      of another mod) reads the entry of Imperial Rome, which is empty (the trap of the issue; `q` does the same)
//   4. CONST.INI and UNIT_SPECIALS.INI: the values the mod changed and the keys it added, as INI patches; the Stonehenge's orders
// NOT here: the camps (classes, TTENT_BEHAVIOR.VS, their lines in PLACEOBJECTS.XML). The mod's TTENT_BEHAVIOR.VS is a rewrite of the game's (80 lines added, 39 removed, most of the
// replaced lines repeat elsewhere in the script, and a directive's anchor is a single line the first time it occurs): no directives can express it, and the game's script would
// run next to a copy. NOTES.md says what would be needed.
// The directives are checked with a copy of the engine's algorithm: the result must be the mod's script (with the guard). The pack overlaps with `q`
// (oggetti-in-tutte-le-strutture-e-forti-bilanciati): same script, same classes. The content manager treats it as "use only one" (it compares paths); no incompatibleWith.
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const { xmlAdded, iniChanged } = require("./lib/ported-patch.js");
const { applyPatch } = require("./lib/script-checks.js");
const ROOT = path.join(__dirname, "..");
const ID = "secuter-fun-mod-rules", T = "s", OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID);
const ZIP = path.join(ROOT, "originals", "forum", "fun-mod-civilta-personalizzate-2017", "files", "Secuter Mod Imperium.zip");
const HD = path.join(ROOT, "originals", "game-data", "paks", "DATA"), GAME = process.env.G;
const SCRATCH = path.join(ROOT, ".scratch"), SRC = path.join(SCRATCH, "secuter-rules-src"), P140 = path.join(SCRATCH, "secuter-rules-p140"), M = path.join(SCRATCH, "secuter-rules-merged");
if (!GAME || !fs.existsSync(path.join(GAME, "rle.mmp"))) { console.error('set G to the HD game folder, e.g. G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"'); process.exit(1); }
if (!fs.existsSync(ZIP)) { console.error("no " + ZIP + " (node tools/download-forum.js)"); process.exit(1); }
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const wrU = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "utf8"); };   // accents in comments: the validator wants UTF-8
const ci = (d, n) => { const x = fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase()); return x && path.join(d, x); };
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const report = [];

// 0. the mod, merged with HD (the same steps as tools/secuter-fun-mod.js plain)
for (const d of [SRC, P140, M]) fs.rmSync(d, { recursive: true, force: true });
fs.mkdirSync(SRC, { recursive: true });
if (cp.spawnSync("bsdtar", ["-xf", ZIP, "-C", SRC], { stdio: "inherit" }).status) process.exit(1);
for (const [script, args] of [["port-140.js", [SRC, P140, "--id", "secuter-fun-mod", "--name", "Secuter Fun 1.5", "--version", "1.5", "--category", "Gameplay & Balance"]], ["merge-secuter-fun.js", [SRC, P140, M]]])
  if (cp.spawnSync("node", [path.join(__dirname, script), ...args], { stdio: "ignore", env: { ...process.env, GAME } }).status) { console.error(script + " failed"); process.exit(1); }
fs.rmSync(OUT, { recursive: true, force: true });

// ---- class patches (the same as tools/oggetti-in-tutte-le-strutture.js: only <properties> are edited) ----------------------------------------------
const strip = s => s.replace(/<!--[\s\S]*?-->/g, "");
const body = s => strip(s).replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, "");
const attrs = s => [...s.matchAll(/([A-Za-z_][\w:-]*)\s*=\s*"([^"]*)"/g)].map(m => [m[1], m[2]]);
const els = s => [...body(s).matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)].map(m => ({ tag: m[1].toLowerCase(), attrs: attrs(m[2]), text: m[0], key: m[1].toLowerCase() + "|" + attrs(m[2]).map(a => a.join("=")).sort().join("|") + "|" + m[3].replace(/\s+/g, " ").replace(/<\/?[^>]+>/g, "") }));
const esc = v => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const asAttrs = l => l.map(([k, v]) => `${k}="${esc(v)}"`).join(" ");
function classPatch(hdText, modText, label) {
  const hd = els(hdText), mod = els(modText), ops = [], hdKeys = new Set(hd.map(e => e.key)), modKeys = new Set(mod.map(e => e.key));
  const hdProps = hd.filter(e => e.tag === "properties"), modProps = mod.filter(e => e.tag === "properties");
  // a <method> the game's class lacks (the Stonehenge's show and ghost) is added; any other element that differs is reported
  for (const e of mod) if (e.tag === "method" && !hdKeys.has(e.key) && !hd.some(h => h.tag === "method" && h.attrs.some(([k, v]) => k.toLowerCase() === "sig" && e.attrs.some(([x, y]) => x.toLowerCase() === "sig" && y === v)))) ops.push(`  <add select="/class">${e.text.trim()}</add>`);
  for (const e of mod) if (e.tag !== "properties" && e.tag !== "method" && !hdKeys.has(e.key)) report.push(`${label}: <${e.tag}> differs from the game's, not patched: ${e.text.replace(/\s+/g, " ").slice(0, 90)}`);
  for (const e of hd) if (e.tag !== "properties" && !modKeys.has(e.key)) report.push(`${label}: the mod has no <${e.tag}> like the game's (kept as the game's): ${e.text.replace(/\s+/g, " ").slice(0, 90)}`);
  const modAll = new Set(modProps.flatMap(e => e.attrs.map(a => a[0].toLowerCase())));
  for (const e of modProps) {
    const hv = new Map(hdProps.flatMap(h => h.attrs.map(a => [a[0].toLowerCase(), a[1]])));
    if (e.attrs.every(([k, v]) => hv.get(k.toLowerCase()) === v)) continue;
    let best = null, n = 0;
    for (const h of hdProps) { const c = e.attrs.filter(([k]) => h.attrs.some(([x]) => x.toLowerCase() === k.toLowerCase())).length; if (c > n) { best = h; n = c; } }
    if (!best) { ops.push(`  <add select="/class">${e.text.trim()}</add>`); continue; }
    const uniq = best.attrs.map(a => a[0]).find(k => e.attrs.some(([x]) => x.toLowerCase() === k.toLowerCase()) && hdProps.filter(h => h.attrs.some(([x]) => x.toLowerCase() === k.toLowerCase())).length === 1);
    if (!uniq) { report.push(`${label}: no attribute selects the game's <properties> for ${e.text.trim().slice(0, 80)}`); continue; }
    const changed = e.attrs.filter(([k, v]) => best.attrs.every(([x, y]) => x.toLowerCase() !== k.toLowerCase() || y !== v));
    const gone = best.attrs.map(a => a[0]).filter(k => !modAll.has(k.toLowerCase()));
    if (changed.length || gone.length) ops.push(`  <set select="/class/properties[@${uniq}]" ${asAttrs(changed)}${gone.length ? ` unset="${gone.join(" ")}"` : ""}/>`);
  }
  return ops;
}

// ---- script patch: HD's script -> the mod's, as directives of the engine's PatchScriptText (patches.md, "Script patches") --------------------------
// (tools/oggetti-in-tutte-le-strutture.js: directives from `diff -U0`, anchored on lines no earlier line repeats, emitted from the bottom up)
function vsDirectives(hdText, modText, label) {
  const A = hdText.replace(/\r/g, "").split("\n"), B = modText.replace(/\r/g, "").split("\n");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vsd-")), a = path.join(tmp, "a"), b = path.join(tmp, "b");
  fs.writeFileSync(a, A.join("\n")); fs.writeFileSync(b, B.join("\n"));
  const d = cp.spawnSync("diff", ["-U0", a, b], { encoding: "utf8" }).stdout; fs.rmSync(tmp, { recursive: true });
  const safe = i => i >= 1 && i <= A.length && A[i - 1].trim().length >= 6 && A.findIndex(l => l.includes(A[i - 1].trim())) === i - 1;
  const hunks = []; let moved = false;
  for (const h of d.split(/^(?=@@ )/m).slice(1)) {
    const m = h.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/), at = +m[1], k = m[2] === undefined ? 1 : +m[2];
    const lines = h.split("\n").slice(1).filter(l => l !== "\\ No newline at end of file");
    const ins = lines.filter(l => l.startsWith("+")).map(l => l.slice(1));
    if (k === 0 && ins.every(l => !l.trim())) continue;                          // blank lines only: nothing to say
    const out = []; let sortAt = at;
    if (k === 0) {
      if (at >= A.length) out.push(["@bottom", ins]);
      else if (safe(at)) out.push([`@after ${A[at - 1].trim()}`, ins]);
      else {
        let j = at + 1; while (j < A.length && !A[j - 1].trim()) j++;
        if (safe(j)) out.push([`@before ${A[j - 1].trim()}`, ins]);
        else {
          // ponytail: the game's lines around it repeat elsewhere (olAll2.ClearDead();): the insertion moves down to the next line only this place has, past at most 3
          // statements that do not depend on it; the check compares as a multiset of lines then
          j = at + 1; while (j <= at + 4 && !safe(j)) j++;
          if (!safe(j)) throw new Error(`${label}: no safe anchor at line ${at}`);
          out.push([`@before ${A[j - 1].trim()}`, ins]); moved = true; sortAt = j + 0.5;
        }
      }
    } else {
      for (let j = 0; j < k; j++) {
        if (!safe(at + j)) throw new Error(`${label}: no safe anchor for the replaced line ${at + j}: ${A[at + j - 1]}`);
        out.push([`@replace ${A[at + j - 1].trim()}`, j < k - 1 ? ins.slice(j, j + 1) : ins.slice(j)]);
      }
    }
    hunks.push({ at: sortAt, out });
  }
  const text = hunks.sort((x, y) => y.at - x.at).flatMap(h => h.out.slice().reverse()).map(([dir, bodyL]) => [dir, ...bodyL].join("\r\n")).join("\r\n");
  return { text: text + "\r\n", moved };
}

// 1. items
const ids = new Map();
{
  const x = xmlAdded(rd(ci(HD, "ITEMS.XML")), rd(ci(path.join(M, "DATA"), "ITEMS.XML")), "items", report, "ITEMS.XML");
  let xml = x.xml;
  for (const m of xml.matchAll(/<item\b[^>]*?\bid\s*=\s*"([^"]+)"/g)) ids.set(m[1], T + m[1]);
  xml = xml.replace(/(<item\b[^>]*?\bid\s*=\s*")([^"]+)"/g, (_m, a, id) => `${a}${ids.get(id)}"`);
  const scripts = new Set();
  xml = xml.replace(/file:\/\/data\/ItemScripts\/([\w.]+)/gi, (_m, f) => { scripts.add(f.toLowerCase()); return `file://data/ItemScripts/${T}_${f.toLowerCase()}`; });
  wrU(path.join(OUT, "patches", "DATA", "ITEMS.XML"), xml);
  for (const f of fs.readdirSync(path.join(M, "DATA", "ITEMSCRIPTS"))) {
    if (ci(path.join(HD, "ITEMSCRIPTS"), f)) { report.push(`ITEMSCRIPTS/${f} is the game's name: not shipped`); continue; }
    if (!scripts.has(f.toLowerCase())) { report.push(`ITEMSCRIPTS/${f} is named by no new item: not shipped`); continue; }
    wrU(path.join(OUT, "DATA", "ITEMSCRIPTS", `${T}_${f}`.toUpperCase()), rd(path.join(M, "DATA", "ITEMSCRIPTS", f)));
  }
  console.log(`${x.count} new items (${[...ids.values()].join(", ")}), ${scripts.size} item scripts`);
}

// 2. classes
const GLOBAL = /^(Chest|FacePillar|LionThrone|Obelisk1|Obelisk2|RibCage|ScullTree|Shrine|Stonehenge|Stonehenge2|Tombstone|Wagon|BaseWell|ShipEgypt|ShipL|ShipRome|Outpost|[GRCIMBET]Outpost)$/;
{
  let n = 0; const names = [];
  for (const f of fs.readdirSync(path.join(M, "DATA", "CLASSES")).filter(f => /\.sc\.xml$/i.test(f)).sort()) {
    const mod = rd(path.join(M, "DATA", "CLASSES", f)), id = classOf(mod), hd = ci(path.join(HD, "CLASSES"), f);
    if (!id || !GLOBAL.test(id)) continue;
    if (!hd) { report.push(`CLASSES/${f}: the game has no such class: not patched`); continue; }
    const ops = classPatch(rd(hd), mod, f).map(o => o.replace(/\brespawn_item="([^"]*)"/g, (m, v) => ids.has(v.replace(/&quot;/g, '"')) ? `respawn_item="${ids.get(v)}"` : m));
    if (!ops.length) continue;
    wrU(path.join(OUT, "patches", "DATA", "CLASSES", f.toUpperCase()), `<patch>\n${ops.join("\n")}\n</patch>\n`); n++; names.push(id);
  }
  console.log(`${n} classes patched (${names.join(", ")})`);
  // the mod's new neutral class the game does not have, an additive file (the Pyramid, a Stonehenge of Egypt)
  const added = [];
  for (const f of fs.readdirSync(path.join(M, "DATA", "CLASSES")).filter(f => /\.sc\.xml$/i.test(f)).sort()) {
    const mod = rd(path.join(M, "DATA", "CLASSES", f)), id = classOf(mod);
    if (!id || ci(path.join(HD, "CLASSES"), f) || !/^Pyramid$/.test(id)) continue;
    wrU(path.join(OUT, "DATA", "CLASSES", f.toUpperCase()), mod); added.push(id);
  }
  console.log(`${added.length} new classes: ${added.join(", ")}`);
}

// 3. scripts: the three behaviors the classes inherit, patched in place; the Stonehenge's new scripts as they are
const guard = (text, label, declAfter, useBefore) => {
  // a race above 7 (a civilization of another mod) reads outside the tables indexed by `.race`: the index is clamped to Imperial Rome's (4), whose entries are empty
  const n = text.length;
  let t = text.replace(declAfter, "$1int nRaceIdx;\r\n").replace(useBefore, "$1nRaceIdx = .race;\r\n$1if (nRaceIdx < 0 || nRaceIdx > 7) nRaceIdx = 4;   // 4: Imperial Rome\r\n$1$2").replace(/\[\.race\]/g, "[nRaceIdx]");
  if (t.length === n || !/nRaceIdx = \.race/.test(t) || /\[\.race\]/.test(t)) throw new Error(`${label}: the race guard did not apply`);
  return t;
};
{
  const sub = path.join(M, "DATA", "SUBAI");
  for (const f of ["OUTPOST_BEHAVIOR.VS", "ARENA_BEHAVIOR.VS"]) {
    const hd = ci(path.join(HD, "SUBAI"), f); let mod = rd(path.join(sub, f));
    if (/^OUTPOST/i.test(f)) mod = guard(mod, f, /^(StrArray DefenderCls3, DefenderCls4;[ \t]*\r?\n)/m, /^([ \t]*)(sDefenderCls3 = DefenderCls3\[\.race\];)/m);
    const { text: p, moved } = vsDirectives(rd(hd), mod, f);
    const applied = applyPatch(rd(hd), p);
    if (applied.errors.length) throw new Error(`${f}: ${applied.errors.join("; ")}`);
    const norm = s => s.replace(/\r/g, "").split("\n").filter(l => l.trim()).map(l => l.trimEnd());
    const got = norm(applied.text), exp = norm(mod);
    if (moved ? got.slice().sort().join("\n") !== exp.slice().sort().join("\n") : got.join("\n") !== exp.join("\n")) throw new Error(`${f}: the directives do not give the mod's script`);
    if (moved) report.push(`SUBAI/${f}: one insertion sits a few lines lower than in the mod's script; same lines, checked as a multiset`);
    wrU(path.join(OUT, "patches", "DATA", "SUBAI", f.toUpperCase()), p);
    console.log(`SUBAI/${f} as ${p.split("\n").filter(l => l.startsWith("@")).length} directives (the result is the mod's script${/^OUTPOST/i.test(f) ? " with the race guard" : ""})`);
  }
  // the Stonehenge's show and ghost (new scripts, the game has none of these names)
  let n = 0;
  for (const f of fs.readdirSync(sub).filter(f => /^STONEHENGE_(SHOW|GHOST)/i.test(f) && !ci(path.join(HD, "SUBAI"), f))) { wrU(path.join(OUT, "DATA", "SUBAI", f.toUpperCase()), rd(path.join(sub, f))); n++; }
  console.log(`${n} scripts of the Stonehenge`);
}

// 4. orders of the Stonehenge and the Pyramid; constants
{
  const mc = ci(path.join(M, "DATA", "COMMANDS"), "STONEHENGE.XML"), hc = ci(path.join(HD, "COMMANDS"), "STONEHENGE.XML");
  const x = xmlAdded(rd(hc), rd(mc), "commands", report, "COMMANDS/STONEHENGE.XML");
  if (x) { wrU(path.join(OUT, "patches", "DATA", "COMMANDS", "STONEHENGE.XML"), x.xml); console.log(`${x.count} orders of the Stonehenge`); }
  for (const name of ["CONST.INI", "UNIT_SPECIALS.INI"]) {
    const hp = ci(HD, name), mp = ci(path.join(M, "DATA"), name);
    let r = iniChanged(rd(hp), rd(mp));
    if (name === "CONST.INI" && r) r = { ...r, text: r.text.replace(/\[PlayerColors\][\s\S]*?(?=\r?\n\[|\s*$)/, "") };   // (not the mod's content)
    if (r) { wr(path.join(OUT, "patches", "DATA", name), r.text); console.log(`${name}: ${r.count} keys`); }
  }
}

// 5. mod.json from extras
for (const f of fs.existsSync(EXTRAS) ? fs.readdirSync(EXTRAS) : []) if (f !== "NOTES.md") { fs.mkdirSync(OUT, { recursive: true }); fs.copyFileSync(path.join(EXTRAS, f), path.join(OUT, f)); }
if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
console.log("done");
