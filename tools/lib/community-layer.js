// The ruleset layer of the Community Mod 12 package (community-mods#53, "Building a mod's layer"): everything the inventory calls GLOBAL, in `rulesets/community-mod/` next to
// the civilizations at the root. Called at the end of tools/community-mod.js (or alone, tools/community-layer.js, on a port that is already built).
//
// The contract is extras/community-mod-civs/inventory-global.csv: one row per GLOBAL file or container member of the inventory (path, level, kind, status, art class, reason).
// The build goes through the rows: GLOBAL must end as files of the layer (every one is listed in raw/community-mod-civs-layer.txt with how it was made), DROPPED-ON-PURPOSE
// as a cited reason; a row that produces nothing, or a file of the layer no row asked for, stops the build.
//
// How a file of the original that is the game's own file edited gets in (sdk/patches.md; AGENTS.md: patches, not whole files, where a patch can say it):
//   XML  (classes, orders, items, formations, tables, sound entities)  -> `patches/DATA/...` (<set> / <add> / <remove>, tools/lib/community-patch.js), proved against the game's file
//   INI  (CONST, UNIT_SPECIALS, SKILLS, editor lists)                  -> `patches/DATA/...` (Key = value, -Key, +Line); no section is ever added (UNIT_SPECIALS.INI)
//   .vs  (SUBAI, ITEMSCRIPTS, AI, GAMESCRIPTS)                         -> `patches/DATA/...` directives when the game's first-line anchor can say it; otherwise the mod's script whole at the
//                                                                         game's path INSIDE THE LAYER (listed, with the reason). A new script (no game file at the path) is a plain file.
//   texts (GAME.LOC.XML)                                               -> `loc/<language>.loc.xml`, only the keys the mod adds or changes
//   art, voices, packs                                                 -> loose files at the paths the original gave them (class 2: the game's own, the host chooses the layer)
//   hidden.txt                                                         -> `hidden.txt` of the layer
// Class 3 (menu skin) is NOT here: it stays in the root (the skin routing, off by default, is `skins: true`, tools/lib/community-skin.js).
const fs = require("fs"), path = require("path"), cp = require("child_process");
const P = require("./community-patch.js");

const ID = "community-mod";
const rd = f => fs.readFileSync(f, "latin1");
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
// a text file as the characters it holds: UTF-8 if it is valid UTF-8, else Latin-1 (the mod's items and tables are in both). Patches are written as UTF-8 (the validator wants it).
const text = f => { const b = fs.readFileSync(f); try { return new TextDecoder("utf-8", { fatal: true }).decode(b).replace(/^\uFEFF/, ""); } catch { return b.toString("latin1"); } };

// ---- the art class of a row: 1 a civilization's, 2 global in-game (it replaces the game's), 3 outside the match (menu skin), 0 not art. The three of "Art rule" in #53; the class 3 paths
// are the SDK's (sdk/tools/lib/assetclass.js, MENU_SKIN) plus the conquest screen's picture, which the validator does not list yet.
const VOLUMES = [["gameres/", "ui/"], ["gameini/", "data/interface/"], ["commonres/", "ui/common/"], ["commonini/", "data/interface/common/"], ["menures/", "ui/menu/"], ["menuini/", "data/interface/menu/"], ["cursors/", "ui/cursors/"], ["editorres/", "ui/editor/"], ["editorini/", "data/interface/editor/"]];
const gamePath = rel => { const p = rel.replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase(), m = p.match(/^local\/[^/]+\/(.+)$/); if (m) return "currentlang/" + m[1]; const v = VOLUMES.find(([n]) => p.startsWith(n)); return v ? v[1] + p.slice(v[0].length) : p; };
const MENU_SKIN = [/^data\/interface\/menu\//, /^ui\/menu\//, /^currentlang\/(menubackground|menu_16_9|menu_4_3)\.bmp$/, /^currentlang\/logo[^/]*\.bmp$/, /^currentlang\/(tips|help)\.xml$/, /^currentlang\/(conquestdefault|adventuredefault)\.bmp$/, /^ui\/interface\/(menumod|currentlang\/)/];
const isMenuSkin = rel => { const g = gamePath(rel); return MENU_SKIN.some(re => re.test(g)); };
const ART_KINDS = new Set(["unit-entity", "building-entity", "voice", "sound", "sound-entity", "ui-art", "ui-cmdbar", "mapobject-art", "outline-art", "randommap-art", "menu-skin-art", "menu-skin-ini", "lobby-page", "container-pages", "text-table", "menu-ini-layout", "map-pack"]);
function artClass({ path: rel, kind, status }) {
  if (!ART_KINDS.has(kind)) return 0;
  const inner = rel.includes("::") ? rel.split("::")[1] : rel;
  if (kind === "map-pack") return 0;                                                                // random-map generation data, not art
  if (isMenuSkin(inner) || isMenuSkin(rel) || kind === "menu-skin-art" || kind === "menu-skin-ini" || kind === "lobby-page" || kind === "container-pages" || kind === "menu-ini-layout") return 3;
  if (status === "GLOBAL") return 2;                                                                // the game's own file with other contents, or a text table of the whole game
  return 1;                                                                                         // the art of the civilizations and of the content under names of its own
}
// where a class 3 row goes when the skin routing is switched on (engine imperivm-resurrected#55 merged): skins/<id>/ with the path it has in the root today
const skinPath = (rel, kind) => { const inner = rel.includes("::") ? rel.split("::")[1] : rel; if (kind === "menu-skin-ini" || kind === "menu-ini-layout") return `skins/${ID}/patches/menuini/${path.basename(inner)}`; if (kind === "lobby-page") return `skins/${ID}/${rel.replace(/^Local\/(\w+)\.pak::/i, "Local/$1/")}`; return `skins/${ID}/${inner}`; };

// ---- the contract ------------------------------------------------------------------------------------------------------------------------------------------------------------
const parseCsv = t => { const rows = []; let row = [], f = "", q = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; } else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; } else if (c !== "\r") f += c; } if (f || row.length) { row.push(f); rows.push(row); } return rows; };
const csvCell = v => /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
function readContract(file) {
  const rows = parseCsv(fs.readFileSync(file, "utf8")), head = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

function build({ ROOT, OUT, SRC, GAME, HDDATA, SDK, SCRATCH, EXTRAS, log = console.log }) {
  const LAYER = path.join(OUT, "rulesets", ID);
  const contract = readContract(path.join(EXTRAS, "inventory-global.csv"));
  fs.rmSync(path.join(OUT, "rulesets"), { recursive: true, force: true });
  fs.mkdirSync(LAYER, { recursive: true });
  const problems = [], made = new Map();                         // layer file (lower case) -> inventory path that asked for it
  const manifest = [];                                           // { path, dest: [..], how, note }
  const wrB = (rel, buf, owner) => { const f = path.join(LAYER, rel), k = rel.toLowerCase(); if (made.has(k) && made.get(k) !== owner) problems.push(`${rel}: asked for by ${owner} and ${made.get(k)}`); made.set(k, owner); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, buf); return rel; };
  const wr = (rel, str, owner) => wrB(rel, Buffer.from(str, "utf8"), owner);
  const cpf = (from, rel, owner) => wrB(rel, fs.readFileSync(from), owner);
  const modFile = rel => find(SRC, rel);
  // the package's own root patch of a game file: the layer is mounted above the package, so its patches run after the root's
  const rootPatch = rel => { const p = find(path.join(OUT, "patches"), rel); return p ? text(p) : null; };
  const notes = [];

  const handlers = {
    // an XML file of the game the mod edited: a patch of the elements it changed. `rel` is DATA/...; `skipNew`: elements the root already adds (items, formations)
    xml(row, { skipNew = false } = {}) {
      const mod = modFile(row.path), hd = find(HDDATA, row.path.replace(/^DATA\//i, ""));
      if (!mod) return { error: "the original has no such file" };
      if (!hd) return { dest: [wrB(row.path, fs.readFileSync(mod), row.path)], how: "new file under a name of its own, plain file of the layer" };
      let modText = text(mod); const hdText = text(hd);
      if (skipNew) modText = withoutNew(hdText, modText, rootPatch(row.path), row.path);
      let kept = [];
      if (row.kind === "commands") ({ text: modText, kept } = keepReferenced(hdText, modText, row.path));
      const r = P.xmlPatch(hdText, modText);
      if (r.error) return { error: r.error };
      if (!r.patch) return { dest: [], how: kept.length ? `no change: the mod's only edit is removing the order ${kept.join(", ")}, which the game's classes or AI still name (kept)` : "no change against the game's file (whitespace or comments only)" };
      const base = rootPatch(row.path);
      if (base) { const rr = P.applyXmlPatch(hdText, base); const again = P.applyXmlPatch(rr.text, r.patch); if (again.errors.length) return { error: "the patch does not apply after the package's own patch of the file: " + again.errors[0] }; }
      return { dest: [wr(`patches/${row.path}`, r.patch, row.path)], how: `XML patch, ${r.ops} operations${r.indexed ? `, ${r.indexed} selected by position` : ""}${r.reordered ? ", children of the same tag in the game's order" : ""}${kept.length ? `; the order ${kept.join(", ")} is not removed: the game still names it` : ""}` };
    },
    ini(row, { noNewSections = true } = {}) {
      const mod = modFile(row.path), hd = find(HDDATA, row.path.replace(/^DATA\//i, ""));
      if (!mod || !hd) return { error: "no file" };
      const hdText = text(hd), modText = text(mod), r = P.iniPatch(hdText, modText, { noNewSections });
      if (!r) return { dest: [], how: "no change against the game's file" };
      const bad = P.iniProve(hdText, r.patch, modText); if (bad.length) return { error: "the INI patch does not give the mod's file: " + bad[0] };
      return { dest: [wr(`patches/${row.path}`, r.patch, row.path)], how: `INI patch, ${r.changed} keys${r.removed ? `, ${r.removed} removed` : ""}${r.skipped.length ? `, sections not added: ${r.skipped.join(" ")}` : ""}` };
    },
    script(row) {
      const mod = modFile(row.path), hd = find(HDDATA, row.path.replace(/^DATA\//i, ""));
      if (!mod) return { error: "the original has no such file" };
      if (!hd) return { dest: [cpf(mod, row.path, row.path)], how: "new script under a name of its own, plain file of the layer" };
      const hdText = rd(hd), modText = rd(mod), r = P.scriptPatch(hdText, modText);
      const base = rootPatch(row.path);
      if (r.error || !r.patch) {
        if (!r.error) return { dest: [], how: "no change against the game's script" };
        notes.push(`${row.path}: whole script in the layer, the directives cannot say it (${r.error})`);
        if (base) return { error: `the package's own patch also edits this script and a whole file would drop it (${r.error})` };
        return { dest: [cpf(mod, row.path, row.path)], how: `the mod's script whole at the game's path, inside the layer: ${r.error.slice(0, 110)}`, whole: true };
      }
      if (base) { const rr = require("./script-patch.js").applyScriptPatch(hdText, base); const again = require("./script-patch.js").applyScriptPatch(rr.text, r.patch); if (again.errors.length) return { error: "the directives do not apply after the package's own patch of the script: " + again.errors[0] }; }
      return { dest: [wr(`patches/${row.path}`, r.patch, row.path)], how: `script patch, ${r.directives} directives` };
    },
    copy(row, destOf) {
      const mod = modFile(row.path); if (!mod) return { error: "the original has no such file" };
      return { dest: [cpf(mod, destOf ? destOf(row.path) : row.path, row.path)], how: "loose file at the path the original gave it" };
    },
  };

  // the items the root already adds (patches/DATA/ITEMS.XML) are left out of the mod's file before the diff: the layer only edits the game's own
  function withoutNew(hdText, modText, rootPatchText, label) {
    const hd = P.parseXml(hdText), mod = P.parseXml(modText), ids = new Set(hd.kids.filter(k => typeof k !== "string").map(k => k.tag.toLowerCase() + "|" + ((k.attrs.find(([a]) => /^(id|name|class)$/i.test(a)) || [])[1] || "").toLowerCase()));
    const rootText = (rootPatchText || "").toLowerCase();
    mod.kids = mod.kids.filter(k => {
      if (typeof k === "string") return true;
      const key = k.tag.toLowerCase() + "|" + ((k.attrs.find(([a]) => /^(id|name|class)$/i.test(a)) || [])[1] || "").toLowerCase();
      if (ids.has(key)) return true;
      const id = ((k.attrs.find(([a]) => /^(id|name|class)$/i.test(a)) || [])[1] || "").toLowerCase();
      if (!id || !rootText.includes(id.toLowerCase())) problems.push(`${label}: new element "${id}" is not in the package's own patch`);
      return false;
    });
    return P.serialize(mod);
  }

  // An order the mod removes from the game's command file but that the game's own classes, AI or scripts still name (trainCMacemen, Gambling, buyfoodforgold...): the engine's AI calls
  // orders by name (sdk/patches.md) and a class that lists a missing order is a button that does nothing. The civilizations of this package carry their own copies of the orders, so the
  // game's stay for the game's civilizations (the ones a host adds with Edit civilizations). Listed in raw/community-mod-civs-layer-notes.txt.
  let hdCorpus = null;
  function keepReferenced(hdText, modText, label) {
    const hd = P.parseXml(hdText), mod = P.parseXml(modText), isEl = k => typeof k !== "string", name = n => (n.attrs.find(([a]) => a.toLowerCase() === "name") || [])[1];
    hdCorpus ||= walk(HDDATA).filter(f => /\.(xml|vs|ini)$/i.test(f) && !/^(COMMANDS|INTERFACE|RANDOMMAP)\//i.test(f)).map(f => fs.readFileSync(path.join(HDDATA, f), "latin1").toLowerCase()).join("\n");
    const have = new Set(mod.kids.filter(isEl).map(k => (name(k) || "").toLowerCase())), kept = [];
    for (const k of hd.kids.filter(isEl)) {
      const n = name(k); if (!n || have.has(n.toLowerCase())) continue;
      if (new RegExp(`(?<![a-z0-9_])${n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9_])`).test(hdCorpus)) { mod.kids.push(k); kept.push(`"${n}"`); notes.push(`${label}: the mod removes the order "${n}"; kept, the game's classes or AI still name it`); }
    }
    return { text: P.serialize(mod), kept };
  }

  // the mod's constants: its patch (comments after a value cut: the engine does not strip them), applied to the game's file, as the keys that differ + the Limit entries of the renumbered modes
  function constPatch(row) {
    const hd = find(HDDATA, "CONST.INI"), src = modFile(row.path); if (!hd || !src) return { error: "no file" };
    const hdText = text(hd), lines = text(src).replace(/\r/g, "").split("\n"), out = [];
    let sec = null, kept = 0, cut = 0;
    for (const raw of lines) {
      if (/^\s*\[/.test(raw)) { sec = raw.trim(); out.push("", sec); continue; }
      let l = raw.trim(); if (!l || l.startsWith(";") || !sec) continue;
      const c = l.replace(/\s*(;|\/\/).*$/, ""); if (c !== l) cut++; l = c;
      if (l) { out.push(l); kept++; }
    }
    const got = out.join("\r\n").replace(/^\r\n/, "") + "\r\n";
    // the Limit entries: the lobby reads [GamePlay] <mode file name with _><N> for a mode; the game's score/time modes were renumbered 2,3,4 -> 4,5,6 and the patch has none for them
    const hdKeys = []; { let s = null; for (const l of hdText.replace(/\r/g, "").split("\n")) { const h = l.match(/^\s*\[([^\]]+)\]/); if (h) { s = h[1]; continue; } const k = l.match(/^\s*(\d+_[^=]*?)\s*=\s*(.*)$/); if (k && s && /^gameplay$/i.test(s)) hdKeys.push([k[1], k[2].trim()]); } }
    const modes = walk(path.join(LAYER, "DATA", "GAMESCRIPTS")).filter(f => /\.vs$/i.test(f)).map(f => f.replace(/\.vs$/i, ""));
    const hdModes = walk(find(HDDATA, "GAMESCRIPTS")).filter(f => /\.vs$/i.test(f)).map(f => f.replace(/\.vs$/i, ""));
    const limits = [];
    for (const m of modes) {
      const name = m.replace(/^\d+\s+/, ""), num = m.match(/^\d+/)[0], hdName = hdModes.find(h => h.replace(/^\d+\s+/, "").toLowerCase() === name.toLowerCase());
      if (!hdName || hdName.toLowerCase() === m.toLowerCase()) continue;
      const hdPre = hdName.replace(/ /g, "_").toLowerCase();
      // the key keeps the game's spelling after the number (2_Score_limit3 -> 4_Score_limit3): the lobby compares without case
      for (const [k, v] of hdKeys) if (k.toLowerCase().startsWith(hdPre) && /^\d+$/.test(k.slice(hdPre.length))) limits.push(`${num}_${k.replace(/^\d+_/, "")}=${v}`);
    }
    // the patch is one text: the mod's sections, then the limits in [GamePlay]
    const secs = []; let cur = null;
    for (const l of got.replace(/\r/g, "").split("\n")) { const h = l.match(/^\[([^\]]+)\]/); if (h) { cur = { name: h[1], lines: [] }; secs.push(cur); } else if (l && cur) cur.lines.push(l); }
    let gp = secs.find(s => /^gameplay$/i.test(s.name)); if (!gp) { gp = { name: "GamePlay", lines: [] }; secs.push(gp); }
    gp.lines.push(...limits);
    const patch = secs.map(s => `[${s.name}]\r\n${s.lines.join("\r\n")}`).join("\r\n\r\n") + "\r\n";
    // proof: applied to the game's file, every key of the patch has its value and every -Key is gone
    { const got = P.applyIniPatch(hdText, patch); let s = null;
      for (const l of patch.replace(/\r/g, "").split("\n")) {
        const h = l.match(/^\[([^\]]+)\]/); if (h) { s = got.find(x => x.name.toLowerCase() === h[1].toLowerCase()); continue; } if (!l.trim() || !s) continue;
        const val = (k) => { const m = s.lines.find(x => x.includes("=") && x.split("=")[0].trim().toLowerCase() === k.toLowerCase()); return m ? m.split("=").slice(1).join("=").trim() : undefined; };
        if (l[0] === "-") { if (val(l.slice(1).trim()) !== undefined) return { error: `CONST patch: ${l} did not remove the key` }; }
        else { const k = l.split("=")[0].trim(), v = l.split("=").slice(1).join("=").trim(); if (val(k) !== v) return { error: `CONST patch: ${k} is ${val(k)} instead of ${v}` }; }
      } }
    return { dest: [wr("patches/DATA/CONST.INI", patch, row.path)], how: `INI patch of the mod's constants (${kept} lines, a comment cut after ${cut} of them) + ${limits.length} Limit entries for the renumbered modes`, limits: limits.length };
  }

  // hidden.txt: the original's list. What the package's own root names is reported (the layer hides the game's file, the civilizations still ask for it).
  // The game as it is with the layer mounted: HD's DATA texts with the layer's patches and files over them, and the package's own root (patches and DATA, not civs/*.json: they only
  // alias the game's class names for the maps).
  function postLayerCorpus() {
    const out = []; const sim = { x: P.applyXmlPatch, s: require("./script-patch.js").applyScriptPatch };
    for (const f of walk(HDDATA).filter(f => /\.(xml|vs|ini)$/i.test(f))) {
      const key = `DATA/${f}`, loose = find(LAYER, key), pat = find(path.join(LAYER, "patches"), key);
      let t;
      if (loose) t = rd(loose);
      else { t = rd(path.join(HDDATA, f)); if (pat) { try { t = /\.xml$/i.test(f) ? sim.x(t, rd(pat)).text : /\.vs$/i.test(f) ? sim.s(t, rd(pat)).text : P.applyIniPatch(t, rd(pat)).map(s => `[${s.name}]\n${s.lines.join("\n")}`).join("\n"); } catch { /* keep the game's */ } } }
      out.push([`HD:${key}`, t.toLowerCase()]);
    }
    for (const f of walk(OUT).filter(f => !/^(rulesets|civs|Local|loc)\//i.test(f) && /\.(xml|ini|vs|txt)$/i.test(f))) out.push([`root:${f}`, rd(path.join(OUT, f)).toLowerCase()]);
    return out;
  }
  function hidden(row) {
    const src = modFile(row.path); if (!src) return { error: "no file" };
    const t = text(src), keep = [], corpus = postLayerCorpus(), lines = t.replace(/\r/g, "").split("\n");
    const entries = lines.map(l => l.trim()).filter(l => l && !l.startsWith(";") && !/^\[.+\]$/.test(l)), hiddenBase = new Set(entries.map(l => l.split("/").pop().toLowerCase()));
    let sec = "", n = 0; const named = [];
    for (const raw of lines) {
      const l = raw.trim(); if (!l || l.startsWith(";")) { keep.push(raw); continue; }
      if (/^\[.+\]$/.test(l)) { sec = l; keep.push(raw); continue; }
      n++;
      // an entry the game or the package still names (outside the files that are hidden themselves) stays visible: a class or an order that lists a missing script or picture is broken
      let by = null; const base = l.split("/").pop().toLowerCase();
      if (/^(data\/(subai|classes|gamescripts|sound entities)\/|ui\/)/i.test(l)) {
        const stem = base.replace(/\.sc\.xml$/, ""), re = /\.sc\.xml$/.test(base) ? new RegExp(`(?<![a-z0-9_])${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9_])`) : null;
        const needle = /^ui\//i.test(l) ? l.toLowerCase().replace(/^ui\//, "") : base;
        const hit = corpus.find(([f, x]) => !hiddenBase.has(path.basename(f).toLowerCase()) && (re ? re.test(x) : x.includes(needle)));
        if (hit) by = hit[0];
      }
      if (by) { named.push(`${l} (${sec || "global"}) named by ${by}`); continue; }
      keep.push(raw);
    }
    notes.push(`hidden.txt: ${n} entries, ${n - named.length} carried; kept visible because a file of the game or of the package still names them: ${named.length}`, ...named.map(x => "  " + x));
    return { dest: [wr("hidden.txt", keep.join("\r\n").replace(/\r?\n?$/, "\r\n"), row.path)], how: `the original's list, ${n - named.length} of ${n} entries (${named.length} stay visible, they are still named: raw/community-mod-civs-layer-notes.txt)`, named };
  }

  const loc = row => {
    const m = row.path.match(/^Local\/(\w+)\/GAME\.LOC\.XML$/i); if (!m) return { error: "not a text table" };
    const lang = m[1].toLowerCase(), mod = modFile(row.path), hdDir = { spanish: "local-spanish", italian: "local-italian" }[lang];
    const modText = text(mod);
    if (!hdDir) {                                                  // English: HD's table is not in originals/: every key of the mod's is carried (7)
      const keep = P.locPatch("<translationtable/>", modText);
      return { dest: [wr(`loc/${lang}.loc.xml`, keep.xml, row.path)], how: `texts patch: all ${keep.added} keys of the mod's table (the game's English table is not in originals/)` };
    }
    const hd = find(GAME, `${hdDir}/CURRENTLANG/GAME.LOC.XML`); if (!hd) return { error: "the game's table is missing" };
    const r = P.locPatch(text(hd), modText);
    return { dest: [wr(`loc/${lang}.loc.xml`, r.xml, row.path)], how: `texts patch: ${r.added} keys added, ${r.changed} changed; the ${r.missing} keys of the game's table the mod lacks are NOT removed` };
  };

  const route = row => {
    switch (row.kind) {
      case "class-neutral": case "commands": case "table": case "randommap-table": case "sound-entity": case "interface-list": return /\.ini$/i.test(row.path) ? handlers.ini(row, { noNewSections: false }) : handlers.xml(row);
      case "formations": case "items": return handlers.xml(row, { skipNew: true });
      case "ini-skills": case "ini-specials": return handlers.ini(row);
      case "ini-const": return constPatch(row);
      case "script-subai": case "script-item": case "script-ai": case "game-mode": return handlers.script(row);
      case "text-table": return loc(row);
      case "hidden": return hidden(row);
      case "voice": case "mapobject-art": case "outline-art": case "randommap-art": case "ui-art": case "map-pack": return handlers.copy(row);
      default: return { error: `no handler for kind ${row.kind}` };
    }
  };

  // the game modes first (the CONST patch reads the modes the layer holds)
  const order = r => (r.kind === "game-mode" ? 0 : r.kind === "ini-const" ? 2 : r.kind === "hidden" ? 3 : 1);
  const todo = contract.filter(r => r.status === "GLOBAL" && r.level === "file").sort((a, b) => order(a) - order(b));
  const packMembers = contract.filter(r => r.level === "member" && r.kind === "map-pack-member");
  for (const row of todo) {
    let res; try { res = route(row); } catch (e) { res = { error: e.stack.split("\n").slice(0, 2).join(" ") }; }
    if (res.error) { problems.push(`${row.path}: ${res.error}`); manifest.push({ path: row.path, dest: [], how: "FAILED: " + res.error }); continue; }
    manifest.push({ path: row.path, dest: res.dest, how: res.how, named: res.named, whole: res.whole });
  }
  // container members: carried inside the pack file the layer holds
  for (const row of packMembers) {
    const pack = row.path.split("::")[0], e = manifest.find(m => m.path === pack);
    if (!e || !e.dest.length) { problems.push(`${row.path}: its pack ${pack} is not in the layer`); continue; }
    manifest.push({ path: row.path, dest: e.dest, how: `member of ${path.basename(pack)}, carried in the pack file` });
  }
  // the one picture inside Local/spanish.pak: the game's path, since a layer cannot put a file at the game's ui/ path for one language only
  for (const row of contract.filter(r => r.status === "GLOBAL" && r.level === "member" && r.kind === "ui-art")) {
    const [pak, member] = row.path.split("::"), lang = pak.match(/Local\/(\w+)\.pak/i)[1];
    const dir = require("./community-pak.js").extractPak({ pakFile: modFile(pak), SDK, SCRATCH, out: path.join(SCRATCH, "cm-layer-pak"), filter: path.basename(member), pak: path.basename(pak) });
    const f = require("./community-pak.js").walk(dir).find(x => x.toLowerCase().endsWith(member.toLowerCase().replace(/\//g, path.sep)));
    if (!f) { problems.push(`${row.path}: not found in the pak`); continue; }
    manifest.push({ path: row.path, dest: [cpf(f, member, row.path)], how: `${lang} pak member, at the game's own path ${member} for every language (Local/${lang}/ would be currentlang/, not ui/)` });
    require("./community-pak.js").rmDir(dir);
  }
  // rows that are not carried: DROPPED-ON-PURPOSE with a reason
  for (const row of contract.filter(r => r.status === "DROPPED-ON-PURPOSE")) { if (!row.reason) problems.push(`${row.path}: dropped without a reason`); manifest.push({ path: row.path, dest: [], how: "DROPPED-ON-PURPOSE: " + row.reason }); }
  // every contract row is accounted for
  for (const row of contract) if (row.status === "GLOBAL" && !manifest.some(m => m.path === row.path)) problems.push(`${row.path}: GLOBAL and not carried`);
  for (const m of manifest) if (!m.how.startsWith("DROPPED") && !m.how.startsWith("FAILED") && !m.dest.length && !/no change|whitespace/.test(m.how)) problems.push(`${m.path}: carried nowhere`);
  // and every file of the layer is asked for by a row
  const asked = new Set(manifest.flatMap(m => m.dest).map(x => x.toLowerCase()));
  for (const f of walk(LAYER)) if (!asked.has(f.toLowerCase())) problems.push(`${f}: a file of the layer no row of the inventory asked for`);
  return { LAYER, manifest, problems, notes, contract, artClass, skinPath };
}

module.exports = { build, artClass, skinPath, gamePath, isMenuSkin, readContract, csvCell, parseCsv, ID, text, walk, find };
