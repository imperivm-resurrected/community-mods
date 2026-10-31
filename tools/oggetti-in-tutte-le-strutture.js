// Secuter's "Oggetti in tutte le strutture" (row 310 area) and its variant with balanced forts (row 311) as WORLD RULES PACKS (AGENTS.md, "World rules packs"):
// no clones and no civilizations. Both mods only change the game's own classes and values (neutral map objects, the capacity of Wagon / BaseVillage /
// Outpost, and for the second one the neutral forts and their garrison script), so they are patches on top of the game and they change it for every
// player while the pack is on (the descriptions say so). Rebuild with
//   G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/oggetti-in-tutte-le-strutture.js [id ...]    (no id: both)
// For each pack: the mod's zip is unpacked in a temporary folder (nothing is written under originals/), tools/port-140.js merges it with HD, and then
//   1. items.xml: the items the mod ADDS become a patch, with ids of their own ("o"/"q" + the mod's id), and the item scripts they name get the same prefix
//   2. every class the mod edited becomes a patch of that class: <add> for a property the game lacks, <set> for a value (never a whole class file)
//   3. forts only: OUTPOST_BEHAVIOR.VS becomes @-directives applied to the game's script in place (a copy cannot replace it, see NOTES.md)
// Nothing is shipped at a path the game uses. The two packs edit the same classes and cannot be used together (NOTES.md; no incompatibleWith).
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const { xmlAdded } = require("./lib/ported-patch.js");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "originals", "forum", "oggetti-in-tutte-le-strutture-e-forti-bilanciati-2017", "files");
const HD = path.join(ROOT, "originals", "game-data", "paks", "DATA"), GAME = process.env.G;
const PACKS = {
  "oggetti-in-tutte-le-strutture": { tag: "o", zip: "MOD solo oggetti.zip" },
  "oggetti-in-tutte-le-strutture-e-forti-bilanciati": { tag: "q", zip: "MOD oggetti e forti.zip" },
};
if (!GAME || !fs.existsSync(path.join(GAME, "rle.mmp"))) { console.error('set G to the HD game folder, e.g. G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"'); process.exit(1); }
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
// scripts with an accent in a comment (Italian) go out as UTF-8: the validator refuses Latin-1
const wrU = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "utf8"); };
const ci = (d, n) => { const x = fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase()); return x && path.join(d, x); };
const want = process.argv.slice(2).filter(x => PACKS[x]);

// ---- class patches -------------------------------------------------------------------------------------------------------------------------------
const strip = s => s.replace(/<!--[\s\S]*?-->/g, "");
const body = s => strip(s).replace(/^[\s\S]*?<class\b[^>]*>/, "").replace(/<\/class>[\s\S]*$/, "");
const attrs = s => [...s.matchAll(/([A-Za-z_][\w:-]*)\s*=\s*"([^"]*)"/g)].map(m => [m[1], m[2]]);
const els = s => [...body(s).matchAll(/<([A-Za-z_][\w-]*)\b([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g)].map(m => ({ tag: m[1].toLowerCase(), attrs: attrs(m[2]), text: m[0], key: m[1].toLowerCase() + "|" + attrs(m[2]).map(a => a.join("=")).sort().join("|") + "|" + m[3].replace(/\s+/g, " ").replace(/<\/?[^>]+>/g, "") }));
const esc = v => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const asAttrs = l => l.map(([k, v]) => `${k}="${esc(v)}"`).join(" ");
// ops that take the game's class to the mod's: only <properties> are edited (the other elements must be the game's, or it is reported)
function classPatch(hdText, modText, label, report) {
  const hd = els(hdText), mod = els(modText), ops = [], hdKeys = new Set(hd.map(e => e.key)), modKeys = new Set(mod.map(e => e.key));
  const hdProps = hd.filter(e => e.tag === "properties"), modProps = mod.filter(e => e.tag === "properties");
  for (const e of mod) if (e.tag !== "properties" && !hdKeys.has(e.key)) report.push(`${label}: <${e.tag}> differs from the game's, not patched: ${e.text.replace(/\s+/g, " ").slice(0, 90)}`);
  for (const e of hd) if (e.tag !== "properties" && !modKeys.has(e.key)) report.push(`${label}: the mod has no <${e.tag}> like the game's (kept as the game's): ${e.text.replace(/\s+/g, " ").slice(0, 90)}`);
  const modAll = new Set(modProps.flatMap(e => e.attrs.map(a => a[0].toLowerCase())));
  for (const e of modProps) {
    const hv = new Map(hdProps.flatMap(h => h.attrs.map(a => [a[0].toLowerCase(), a[1]])));
    if (e.attrs.every(([k, v]) => hv.get(k.toLowerCase()) === v)) continue;                              // the game's own element
    // the game's element that shares the most attributes with this one
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
// The directives are emitted from the bottom of the file to the top, so that what an earlier one inserted never holds the text a later anchor looks for.
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
    const out = []; let sortAt = at;
    if (k === 0) {
      if (at >= A.length) out.push(["@bottom", ins]);
      else if (safe(at)) out.push([`@after ${A[at - 1].trim()}`, ins]);
      else {                                                                       // blank lines between the anchor and the insertion do not matter
        let j = at + 1; while (j < A.length && !A[j - 1].trim()) j++;
        if (safe(j)) out.push([`@before ${A[j - 1].trim()}`, ins]);
        else {
          // ponytail: the game's lines around it repeat elsewhere (olAll2.ClearDead();): the insertion moves down to the next line only this place has, past at most
          // 3 statements that do not depend on it (checked by hand for OUTPOST_BEHAVIOR.VS: ClearDead calls on other lists); applyVs() then compares as a multiset of lines
          j = at + 1; while (j <= at + 4 && !safe(j)) j++;
          if (!safe(j)) throw new Error(`${label}: no safe anchor at line ${at}`);
          out.push([`@before ${A[j - 1].trim()}`, ins]); moved = true; sortAt = j + 0.5;   // done before the directive that replaces that line
        }
      }
    } else {
      for (let j = 0; j < k; j++) {                                               // the j-th deleted line (line at+j) is replaced; the last one takes what is left
        if (!safe(at + j)) throw new Error(`${label}: no safe anchor for the replaced line ${at + j}: ${A[at + j - 1]}`);
        out.push([`@replace ${A[at + j - 1].trim()}`, j < k - 1 ? ins.slice(j, j + 1) : ins.slice(j)]);
      }
    }
    hunks.push({ at: sortAt, out });
  }
  const text = hunks.sort((x, y) => y.at - x.at).flatMap(h => h.out.slice().reverse()).map(([dir, body]) => [dir, ...body].join("\r\n")).join("\r\n");
  return { text: text + "\r\n", moved };
}
// the engine's algorithm (src/mods/patchxml.cpp, PatchScriptText), to prove that the directives give the mod's script
function applyVs(hdText, patch) {
  const lines = hdText.replace(/\r/g, "").split("\n"), ops = [];
  for (const l of patch.replace(/\r/g, "").split("\n")) {
    if (l.startsWith("@")) { const sp = l.search(/[ \t]/), word = l.slice(1, sp < 0 ? undefined : sp); ops.push({ kind: word, anchor: sp < 0 ? "" : l.slice(sp).trim(), body: [] }); }
    else if (ops.length) ops[ops.length - 1].body.push(l);
  }
  for (const op of ops) {
    while (op.body.length && !op.body[op.body.length - 1].trim()) op.body.pop();
    if (op.kind === "bottom") { while (lines.length && !lines[lines.length - 1].trim()) lines.pop(); lines.push(...op.body); continue; }
    const i = lines.findIndex(l => l.includes(op.anchor)); if (i < 0) throw new Error("no line contains " + op.anchor);
    if (op.kind === "before") lines.splice(i, 0, ...op.body); else if (op.kind === "after") lines.splice(i + 1, 0, ...op.body); else lines.splice(i, 1, ...op.body);
  }
  return lines.join("\n");
}

// ---- the packs -----------------------------------------------------------------------------------------------------------------------------------
for (const [ID, P] of Object.entries(PACKS).filter(([id]) => !want.length || want.includes(id))) {
  const OUT = path.join(ROOT, "ported", ID), EXTRAS = path.join(ROOT, "extras", ID), T = P.tag;
  const WORK = fs.mkdtempSync(path.join(os.tmpdir(), `${T}-oggetti-`)), SRC = path.join(WORK, "zip"), MERGED = path.join(WORK, "out"), report = [];
  fs.mkdirSync(SRC);
  if (cp.spawnSync("bsdtar", ["-xf", path.join(DIR, P.zip), "-C", SRC], { stdio: "inherit" }).status) process.exit(1);
  const r = cp.spawnSync("node", [path.join(__dirname, "port-140.js"), SRC, MERGED, "--id", ID, "--version", "1.0", "--category", "Gameplay & Balance"], { stdio: "inherit", env: { ...process.env, GAME } });
  if (r.status) process.exit(1);
  fs.rmSync(OUT, { recursive: true, force: true });

  // 1. items
  const ids = new Map();                                                                  // the mod's new item ids -> ours
  {
    const itemsFile = ci(MERGED + "/DATA", "ITEMS.XML"), hdItems = ci(HD, "ITEMS.XML");
    const x = xmlAdded(rd(hdItems), rd(itemsFile), "items", report, "ITEMS.XML");
    let xml = x.xml;
    for (const m of xml.matchAll(/<item\b[^>]*?\bid\s*=\s*"([^"]+)"/g)) ids.set(m[1], T + m[1]);
    xml = xml.replace(/(<item\b[^>]*?\bid\s*=\s*")([^"]+)"/g, (_m, a, id) => `${a}${ids.get(id)}"`);
    const scripts = new Set();
    xml = xml.replace(/file:\/\/data\/ItemScripts\/([\w.]+)/gi, (_m, f) => { scripts.add(f.toLowerCase()); return `file://data/ItemScripts/${T}_${f.toLowerCase()}`; });
    wr(path.join(OUT, "patches", "DATA", "ITEMS.XML"), xml);
    // the item scripts are the mod's own files (the game has none of these names), with the prefix in their name
    for (const f of fs.readdirSync(path.join(MERGED, "DATA", "ITEMSCRIPTS"))) {
      if (ci(path.join(HD, "ITEMSCRIPTS"), f)) { report.push(`ITEMSCRIPTS/${f} is the game's name: not shipped`); continue; }
      if (!scripts.has(f.toLowerCase())) { report.push(`ITEMSCRIPTS/${f} is named by no new item: not shipped`); continue; }
      wrU(path.join(OUT, "DATA", "ITEMSCRIPTS", `${T}_${f}`.toUpperCase()), rd(path.join(MERGED, "DATA", "ITEMSCRIPTS", f)));
    }
    console.log(`${ID}: ${x.count} new items (${[...ids.values()].join(", ")}), ${scripts.size} item scripts`);
  }
  // 2. classes
  let nClasses = 0;
  for (const f of fs.readdirSync(path.join(MERGED, "DATA", "CLASSES")).filter(f => /\.sc\.xml$/i.test(f)).sort()) {
    const hd = ci(HD + "/CLASSES", f);
    if (!hd) { report.push(`CLASSES/${f}: the game has no such class: not patched`); continue; }
    const ops = classPatch(rd(hd), rd(path.join(MERGED, "DATA", "CLASSES", f)), f, report).map(o => o.replace(/\brespawn_item="([^"]*)"/g, (m, v) => ids.has(v.replace(/&quot;/g, '"')) ? `respawn_item="${ids.get(v)}"` : m));
    if (!ops.length) continue;
    wr(path.join(OUT, "patches", "DATA", "CLASSES", f.toUpperCase()), `<patch>\n${ops.join("\n")}\n</patch>\n`); nClasses++;
  }
  console.log(`${ID}: ${nClasses} classes patched`);
  // 3. scripts
  for (const f of fs.existsSync(path.join(MERGED, "DATA", "SUBAI")) ? fs.readdirSync(path.join(MERGED, "DATA", "SUBAI")) : []) {
    const hd = ci(HD + "/SUBAI", f); if (!hd) { report.push(`SUBAI/${f}: not the game's: not patched`); continue; }
    let mod = rd(path.join(MERGED, "DATA", "SUBAI", f));
    // The mod's tables of the extra defenders are indexed by the building's race (0..7). The race of a class of a civilization of another mod (a guard post of a
    // clone, 10 and up) would read outside them: it is clamped to Imperial Rome's, whose entries are empty.
    if (/outpost_behavior\.vs$/i.test(f)) {
      const n = mod.length;
      mod = mod.replace(/^(StrArray DefenderCls3, DefenderCls4;[ \t]*\r?\n)/m, "$1int nRaceIdx;\r\n")
        .replace(/^([ \t]*)(sDefenderCls3 = DefenderCls3\[\.race\];)/m, "$1nRaceIdx = .race;\r\n$1if (nRaceIdx < 0 || nRaceIdx > 7) nRaceIdx = 4;   // 4: Imperial Rome, no extra defenders\r\n$1$2")
        .replace(/\[\.race\]/g, "[nRaceIdx]");
      if (mod.length === n || !/nRaceIdx = \.race/.test(mod) || /\[\.race\]/.test(mod)) throw new Error(`${f}: the race guard did not apply`);
    }
    const { text: p, moved } = vsDirectives(rd(hd), mod, f);
    const norm = s => s.replace(/\r/g, "").split("\n").filter(l => l.trim()).map(l => l.trimEnd());
    const got = norm(applyVs(rd(hd), p)), exp = norm(mod);
    if (moved ? got.slice().sort().join("\n") !== exp.slice().sort().join("\n") : got.join("\n") !== exp.join("\n")) throw new Error(`${f}: the directives do not give the mod's script`);
    if (moved) report.push(`SUBAI/${f}: one insertion (two ClearDead calls) sits a few lines lower than in the mod's script; same lines, checked as a multiset`);
    wrU(path.join(OUT, "patches", "DATA", "SUBAI", f.toUpperCase()), p);
    console.log(`${ID}: SUBAI/${f} as ${p.split("\n").filter(l => l.startsWith("@")).length} directives (checked against the mod's script)`);
  }
  // 4. mod.json from extras
  for (const f of fs.readdirSync(EXTRAS)) if (f !== "NOTES.md") fs.copyFileSync(path.join(EXTRAS, f), path.join(OUT, f));
  if (report.length) console.log(`to check:\n  ${report.join("\n  ")}`);
  fs.rmSync(WORK, { recursive: true, force: true });
}
console.log("done");
