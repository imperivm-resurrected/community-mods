// The menu skin of the Caesar Mod, as patches (AGENTS.md, "Civilizations are independent", the one cosmetic exception: the maintainer decided to ship it, 2026-11-02).
// The rules are the ones the other ports learnt in game (the 4.2, the 1.8, the Greek 2.x; tools/lib/menu-skin.js on main, tools/lib/menu-lists.js of the Greek 2.x stack), written
// here so this port does not depend on a shared file that is still changing:
//   - WHERE: the engine applies a patch only if its path is exactly the one the game opens, and the game opens the menu INIs as menuini/<name>.ini: every patch is
//     patches/menuini/<NAME>.INI; template.ini ALSO at patches/DATA/INTERFACE/MENU/ (the engine opens it under both names).
//   - LISTS: a menu is decided by the lists of bare names ([MainMenu Objects]...): `Key = value` patches do not carry them; each changed list is written as `-line` for every
//     line of the game's list and `+line` for every line of the mod's, in the mod's order, inside the section (tools/lib/menu-skin.js on main: listChanges). The WHOLE list of the mod
//     is the skin's composition (the 4.2 lost its Tips panel keeping HD's list); a section the list names that the game does not have is written whole from the mod's file.
//   - 3-WAY for the KEYS: the Caesar Mod's INIs are the 1.40 files with the mod's edits (the mod's file equals the 1.40 one in MPCHAT, OB_LOBBY, OKMSGBOX), and HD changed things since
//     1.40 (the widescreen layout...). Only what the MOD changed against the 1.40 is applied to HD's file; a key the mod did not touch stays HD's. Section by
//     section and key by key (tools/port-140.js merges "by key" and once gave a [Back] Type to [CaptionImp]); the mod's own file is read from the zip, not from that merge.
//   - Values are compared without the spaces around commas ("255, 255, 255" is "255,255,255") so that re-spacing is not an edit.
//   - The engine builds the sized template from the game's file WITHOUT the mod's template patch, so the column of buttons of the mod's template is also written in
//     [MainMenu Params] (ButtonXStart / ButtonYStart / ButtonSpacing), as the 4.2's and the 1.8's are.
//   build({ OUT, HD, BASE, MOD }) -> { written: [...], skipped: [...], report: "text", problems: [...] }
//     HD: the game's DATA/INTERFACE/MENU; BASE: the 1.40's; MOD: the mod's own DATA/INTERFACE/MENU (raw, from the zip)
const fs = require("fs"), path = require("path");
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!p || !fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
const nv = v => v.replace(/\s*,\s*/g, ",").replace(/\s+/g, " ").trim();            // the value as compared
const same = (a, b) => nv(a) === nv(b);
const trim = v => v.replace(/\s*;.*$/, "").trim();                                    // the engine does not strip a comment at the end of a line: the patch carries none

function parse(text) {
  const secs = new Map(); let cur = null;
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const h = raw.match(/^\s*\[([^\]]+)\]/);
    if (h) { const k = h[1].trim().toLowerCase(); if (!secs.has(k)) secs.set(k, { name: h[1].trim(), keys: new Map(), list: [] }); cur = secs.get(k); continue; }
    if (!cur || !raw.trim() || /^\s*;/.test(raw)) continue;
    const kv = raw.match(/^\s*([^=]*?)\s*=\s*(.*)$/);
    if (kv) cur.keys.set(kv[1].trim().toLowerCase(), { key: kv[1].trim(), val: trim(kv[2]) }); else cur.list.push(raw.trim());
  }
  return secs;
}

// -> Map(section lowercase -> { name, lines: ["Key = value"...], list: ["-x", "+y"...] })
function diff(hdText, baseText, modText) {
  const H = parse(hdText), B = baseText == null ? null : parse(baseText), M = parse(modText), out = new Map();
  const listed = new Set([...M.values()].flatMap(x => x.list.map(l => l.toLowerCase())));          // every bare name any list of the mod has
  for (const [sk, ms] of M) {
    const target = H.get(sk), bs = B && B.get(sk), entry = { name: ms.name, lines: [], list: [] };
    const edited = !B || !bs || [...ms.keys].some(([k, e]) => !bs.keys.has(k) || !same(bs.keys.get(k).val, e.val));
    if (!target) {
      // a section the game does not have (the mod's own, or the 1.40's that HD dropped): written whole if the mod edited it or one of its lists names it ([Version], [TipsBackFrame]...)
      if (edited || listed.has(sk)) for (const [, e] of ms.keys) entry.lines.push(`${e.key} = ${e.val}`);
    } else {
      for (const [k, e] of ms.keys) {
        if (target.keys.has(k) && same(target.keys.get(k).val, e.val)) continue;                                                 // HD has it already
        if (bs && bs.keys.has(k) && same(bs.keys.get(k).val, e.val)) continue;                                                   // the mod did not change it: HD's stays
        entry.lines.push(`${e.key} = ${e.val}`);
      }
    }
    const hd = target ? target.list : [], mod = ms.list;
    if (mod.length && !(hd.length === mod.length && hd.every((l, i) => l === mod[i]))) entry.list = [...hd.map(l => "-" + l), ...mod.map(l => "+" + l)];
    if (entry.lines.length || entry.list.length) out.set(sk, entry);
  }
  return out;
}
const text = d => [...d.values()].map(e => `[${e.name}]\r\n${[...e.lines, ...e.list].join("\r\n")}`).join("\r\n") + "\r\n";

// the keys of the template's column of buttons, for [MainMenu Params]
function buttonParams(modTemplate, hdTemplate, ownMain) {
  const T = parse(modTemplate).get("params"), H = parse(hdTemplate).get("params"), own = ownMain && parse(ownMain).get("mainmenu params");
  if (!T || !H) return [];
  const out = [];
  for (const k of ["ButtonXStart", "ButtonYStart"]) { const a = T.keys.get(k.toLowerCase()), b = H.keys.get(k.toLowerCase()); if (a && b && !same(a.val, b.val) && !(own && own.keys.has(k.toLowerCase()))) out.push(`${k} = ${a.val}`); }
  // the mod's template has no ButtonSpacing: its ButtonSpacing1 is the step (ButtonSpacingN = ButtonSpacing(N-1) + ButtonSpacing1), the same as HD's ButtonSpacing = that value
  const s1 = T.keys.get("buttonspacing1"), sh = H.keys.get("buttonspacing");
  if (s1 && !T.keys.has("buttonspacing") && sh && !same(s1.val, sh.val) && !(own && own.keys.has("buttonspacing"))) out.push(`ButtonSpacing = ${s1.val}`);
  return out;
}

function build({ OUT, HD, BASE, MOD, conquestPanel = "screen-right", version }) {
  const hdDir = find(HD, "DATA/INTERFACE/MENU"), baseDir = BASE && find(BASE, "DATA/INTERFACE/MENU"), modDir = find(MOD, "DATA/INTERFACE/MENU");
  const written = [], skipped = [], problems = [], rep = ["# Caesar Mod: the menu skin as patches, key by key (generated by tools/lib/caesar-menu.js)", "", "Every line of a patch is listed with the game's value (HD), the 1.40's and the mod's for the same section and key; `list` lines are the bare names of the section.", ""];
  const fileOf = (d, f) => d && fs.readdirSync(d).find(x => x.toLowerCase() === f.toLowerCase());
  const all = new Map();                                                    // file -> diff, so that the template can be completed after the other files are known
  const ctx = new Map();
  for (const f of fs.readdirSync(modDir).filter(f => /\.ini$/i.test(f)).sort()) {
    const h = fileOf(hdDir, f);
    if (!h) { skipped.push(`${f}: the game has no such file`); continue; }
    const b = fileOf(baseDir, f), hdT = fs.readFileSync(path.join(hdDir, h), "latin1"), baseT = b ? fs.readFileSync(path.join(baseDir, b), "latin1") : null, modT = fs.readFileSync(path.join(modDir, f), "latin1");
    const d = diff(hdT, baseT, modT);
    let extra = [];
    if (/^mainmenu\.ini$/i.test(f)) {
      const tf = fileOf(modDir, "TEMPLATE.INI");
      extra = buttonParams(fs.readFileSync(path.join(modDir, tf), "latin1"), fs.readFileSync(path.join(hdDir, fileOf(hdDir, "TEMPLATE.INI")), "latin1"), modT);
      if (extra.length) { const e = d.get("mainmenu params") || { name: "MainMenu Params", lines: [], list: [] }; e.lines.unshift(...extra); d.set("mainmenu params", e); }
    }
    const adjusted = new Set(), why = new Map();
    if (/^conquestgame\.ini$/i.test(f) && conquestPanel === "screen-right" && d.get("save")) {
      // The mod's panel starts at right(GameMap)-348 (the 1.40 had no room to its right): on a 1920x1080 screen that is x 1124, over the Greek territory of both conquests (see conquestNumbers).
      // Save is the anchor of the whole column (the frame, the titles, the texts and the buttons are relative to it): it goes to the right edge of the screen, as the mod's own main menu
      // buttons do (%ScreenRight%), so the frame ends at the edge and starts to the right of the map. The rest of the mod's layout is untouched.
      const e = d.get("save"); e.lines = e.lines.map(l => { if (!/^RectWH = /i.test(l)) return l; const n = l.replace(/^RectWH = #right\(GameMap\)-328#/i, "RectWH = #%ScreenRight%-305#"); if (n !== l) adjusted.add(n); return n; });
    }
    // The corner text of the main menu ([Version] Text = Caesar Mod 1.1.0) is the author's: the 1.1.1 zip still says 1.1.0 (he did not update it; mod.json says 1.1.1). `version` (the version of the
    // zip being built, passed by tools/caesar-mod.js) replaces the number in that ONE value, and only that key is allowed to differ from the mod's file below (ADJUSTED in the report and the log).
    if (version && /^mainmenu\.ini$/i.test(f) && d.get("version")) {
      const e = d.get("version"); e.lines = e.lines.map(l => { if (!/^Text = Caesar Mod \d+(\.\d+)+$/i.test(l)) return l; const n = `Text = Caesar Mod ${version}`; if (n !== l) { adjusted.add(n); why.set(n, `the mod has \`${l.slice(7)}\`; the author did not update the text in the ${version} zip, the port shows the version of the zip it was built from`); } return n; });
    }
    // No eighth shield button (Shield8, Id 0x1039): the engine fills the buttons 0x1031..0x1037 and the arrow 0x1038 only (UpdateTerritoryButtons loops 7), and the 4.2's Hellas selects without it.
    if (!d.size) { skipped.push(`${f}: nothing the mod edited against the 1.40 (${b ? "same as the 1.40's or only re-spaced" : "no 1.40 file"})`); continue; }
    all.set(f, d); ctx.set(f, { h, hdT, baseT, modT, extra, adjusted, why });
  }
  // a section a shipped one names with `Template = %TmplIni%, X` must exist in the patched template: the mod's own, if the game dropped it (MenuTitle, ThinFrameTitle)
  {
    const tf = fileOf(modDir, "TEMPLATE.INI"), M = parse(fs.readFileSync(path.join(modDir, tf), "latin1")), H = parse(fs.readFileSync(path.join(hdDir, fileOf(hdDir, "TEMPLATE.INI")), "latin1"));
    const td = all.get(tf) || new Map(), have = n => H.has(n) || td.has(n);
    for (const [, d] of all) for (const e of d.values()) for (const l of e.lines) { const m = l.match(/^Template = %TmplIni%,\s*([A-Za-z0-9_]+)/i); if (m && !have(m[1].toLowerCase()) && M.has(m[1].toLowerCase())) { const ms = M.get(m[1].toLowerCase()); td.set(m[1].toLowerCase(), { name: ms.name, lines: [...ms.keys.values()].map(k => `${k.key} = ${k.val}`), list: [] }); } }
    if (td.size) { all.set(tf, td); if (!ctx.has(tf)) ctx.set(tf, { h: fileOf(hdDir, "TEMPLATE.INI"), hdT: fs.readFileSync(path.join(hdDir, fileOf(hdDir, "TEMPLATE.INI")), "latin1"), baseT: null, modT: fs.readFileSync(path.join(modDir, tf), "latin1"), extra: [], adjusted: new Set(), why: new Map() }); }
  }
  for (const [f, d] of all) {
    const { h, hdT, baseT, modT, extra, adjusted, why = new Map() } = ctx.get(f);
    // (d) verify each line against the mod's own file, section by section
    const H = parse(hdT), M = parse(modT), B = baseT ? parse(baseT) : new Map();
    rep.push(`## ${h}`, "");
    for (const [sk, e] of d) {
      const ms = M.get(sk), hs = H.get(sk) || [...H.values()].find(x => x.name.toLowerCase() === e.name.toLowerCase());
      const bs = B.get(sk);
      for (const l of e.lines) {
        const m = l.match(/^(.*?) =(?: (.*))?$/), k = m[1].toLowerCase(), v = m[2] || "";
        const mk = ms && ms.keys.get(k), isExtra = extra.includes(l) || adjusted.has(l);
        if (!isExtra && !(mk && mk.val === v)) problems.push(`${h} [${e.name}] ${l}: the mod's section [${ms ? ms.name : "-"}] does not have this value`);
        const hk = hs && hs.keys.get(k), bk = bs && bs.keys.get(k);
        rep.push(`- [${e.name}] \`${m[1]}\`: HD \`${hk ? hk.val : "-"}\` | 1.40 \`${bk ? bk.val : "-"}\` -> \`${v}\`${adjusted.has(l) ? (why.has(l) ? ` (ADJUSTED: ${why.get(l)})` : ` (ADJUSTED: the mod has \`${mk.val}\`, see raw/caesar-mod-civs-conquest-layout.md)`) : isExtra ? " (from the mod's template: the sized template ignores its patch)" : ""}${!ms ? " (new section)" : ""}`);
      }
      if (e.list.length) {
        const mods = e.list.filter(l => l[0] === "+").map(l => l.slice(1)), hds = e.list.filter(l => l[0] === "-").map(l => l.slice(1));
        if (hs && hds.join("|") !== hs.list.join("|")) problems.push(`${h} [${e.name}]: the "-" lines are not the game's list`);
        rep.push(`- [${e.name}] list: HD ${hds.length} lines -> ${mods.length} lines; added ${mods.filter(x => !hds.includes(x)).join(", ") || "none"}; removed ${hds.filter(x => !mods.includes(x)).join(", ") || "none"}`);
      }
    }
    rep.push("");
    const dirs = [["patches", "menuini"], ...(/^template\.ini$/i.test(h) ? [["patches", "DATA", "INTERFACE", "MENU"]] : [])];
    for (const dd of dirs) { const dst = path.join(OUT, ...dd, h.toUpperCase()); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.rmSync(dst, { force: true }); fs.writeFileSync(dst, text(d), "latin1"); }
    written.push(h);
  }  rep.push("## Not written", "", ...skipped.map(s => `- ${s}`), "");
  return { written, skipped, problems, report: rep.join("\n") };
}

// ---- applying a patch (the patch language of sdk/patches.md) and reading the layout it gives ----------------------------------------------------------------------------------
// apply(iniText, patchText) -> iniText: `Key = value` sets or adds, `-Key` / `-Line` removes, `+Line` adds a bare line if absent; a section the file lacks is created at the end
function apply(ini, patch) {
  const secs = []; let cur = null;
  for (const raw of ini.replace(/\r/g, "").split("\n")) {
    const h = raw.match(/^\s*\[([^\]]+)\]/);
    if (h) { cur = { name: h[1].trim(), lines: [] }; secs.push(cur); continue; }
    if (cur) cur.lines.push(raw);
  }
  const keyOf = l => { const k = l.match(/^\s*([^=;]*?)\s*=/); return k && !/^\s*;/.test(l) ? k[1].toLowerCase() : null; };
  const put = (p, line) => { let e = p.lines.length; while (e > 0 && !p.lines[e - 1].trim()) e--; p.lines.splice(e, 0, line); };
  let p = null;
  for (const raw of patch.replace(/\r/g, "").split("\n")) {
    const h = raw.match(/^\s*\[([^\]]+)\]/);
    if (h) { p = secs.find(x => x.name.toLowerCase() === h[1].trim().toLowerCase()); if (!p) { p = { name: h[1].trim(), lines: [] }; secs.push(p); } continue; }
    if (!p || !raw.trim() || /^\s*;/.test(raw)) continue;
    const kv = raw.match(/^([^=+-][^=]*?)\s*=\s*(.*)$/);
    if (kv) { const i = p.lines.findIndex(l => keyOf(l) === kv[1].toLowerCase()); if (i >= 0) p.lines[i] = `${kv[1]} = ${kv[2]}`; else put(p, `${kv[1]} = ${kv[2]}`); }
    else if (raw[0] === "+") { const v = raw.slice(1).trim(); if (!p.lines.some(l => l.trim() === v)) put(p, v); }
    else if (raw[0] === "-") { const v = raw.slice(1).trim(), i = p.lines.findIndex(l => l.trim() === v || keyOf(l) === v.toLowerCase()); if (i >= 0) p.lines.splice(i, 1); }
  }
  return secs.map(x => `[${x.name}]\n${x.lines.join("\n")}`).join("\n");
}

// + - * / % and parentheses over numbers (no eval): the arithmetic of a #...# field once the left()/right() calls are numbers
function arith(e, what) {
  const t = e.match(/\d+(?:\.\d+)?|[-+*/%()]|\S/g) || []; let i = 0;
  const fail = () => { throw new Error(`cannot read "${what}" -> "${e}"`); };
  const prim = () => { const x = t[i++]; if (x === "(") { const v = sum(); if (t[i++] !== ")") fail(); return v; } if (x === "-") return -prim(); if (x === "+") return prim(); if (x !== undefined && /^\d/.test(x)) return +x; return fail(); };
  const prod = () => { let v = prim(); while (t[i] === "*" || t[i] === "/" || t[i] === "%") { const o = t[i++], r = prim(); v = o === "*" ? v * r : o === "/" ? v / r : v % r; } return v; };
  const sum = () => { let v = prod(); while (t[i] === "+" || t[i] === "-") { const o = t[i++], r = prod(); v = o === "+" ? v + r : v - r; } return v; };
  const v = sum(); if (i !== t.length) fail(); return v;
}
// the rectangles of a screen: { objs: its list of names, rectOf(name) -> [l, t, w, h] | null | { error } }, with the template's variables (size: [w, h] overrides Larghezza / Altezza)
function rects(screenText, templateText, screen, size) {
  const S = parse(screenText), T = parse(templateText), vars = new Map();
  for (const sec of [T.get("params"), S.get(`${screen} params`.toLowerCase())]) if (sec) for (const [k, e] of sec.keys) vars.set(k, e.val);
  vars.set("larghezza", String(size ? size[0] : vars.get("larghezza") || 1920)); vars.set("altezza", String(size ? size[1] : vars.get("altezza") || 1080));
  const expand = t => { for (let i = 0; i < 30 && /%[A-Za-z0-9_]+%/.test(t); i++) t = t.replace(/%([A-Za-z0-9_]+)%/g, (m, k) => (vars.has(k.toLowerCase()) ? vars.get(k.toLowerCase()) : m)); return t; };
  const cache = new Map(), stack = new Set();
  function rectOf(name) {
    const k = name.toLowerCase(); if (cache.has(k)) return cache.get(k);
    if (stack.has(k)) throw new Error(`loop at ${name}`);
    stack.add(k);
    const sec = S.get(k); let r = null;
    if (sec) {
      const rw = sec.keys.get("rectwh"), rc = sec.keys.get("rect");
      const parts = txt => { const f = []; let d = 0, c = ""; for (const ch of expand(txt)) { if (ch === "#") d ^= 1; if (ch === "," && !d) { f.push(c); c = ""; } else c += ch; } f.push(c); return f.map(x => x.trim()); };
      const val = x => { const e = x.replace(/^#|#$/g, "").replace(/\b(left|right|top|bottom|width|height)\(\s*([A-Za-z0-9_.]+)\s*\)/gi, (_m, fn, n) => { const q = rectOf(n); if (!q || q.error) throw new Error(`no rect for ${n}`); const [l, t, w, h] = q; return ({ left: l, top: t, right: l + w, bottom: t + h, width: w, height: h })[fn.toLowerCase()]; }); return arith(e, x); };
      try {
        if (rw) { const f = parts(rw.val).map(val); r = f.length === 4 ? f : null; }
        else if (rc) { const f = parts(rc.val).map(val); r = f.length === 4 ? [f[0], f[1], f[2] - f[0], f[3] - f[1]] : null; }
      } catch (e) { r = { error: `${name}: ${e.message}` }; }
    }
    stack.delete(k); cache.set(k, r); return r;
  }
  return { objs: (S.get(`${screen} objects`.toLowerCase()) || { list: [] }).list, rectOf, vars };
}

// Where the info panel of the conquest screen is and what it covers. layouts: [[label, conquestgame text, template text]]; maps: [[name, territories.bmp path]]; sizes: [[w, h]];
// readBmp(path) -> Map(index -> [[x, y]...]). The map control is 1024x768 centered, drawn 1:1; a territory is the set of pixels of territories.bmp with its index (2..9).
// Covered = under a control of the right column (frame, buttons) or the shields frame. -> { text, cover: { "label|map|WxH": Greek pixels covered } }
function conquestNumbers({ layouts, maps, sizes, readBmp }) {
  const names = { 2: "Egypt", 3: "Iberia", 4: "Britain", 5: "Germany", 6: "Carthage", 7: "Rome", 8: "Gaul", 9: "Greece" }, out = [], cover = {};
  const BLOCK = /^(DescriptionFrame|Save|Start|Quit|Select|ShieldsFrame)$/i;
  for (const [mapName, bmp] of maps) {
    const px = readBmp(bmp);
    for (const [w, h] of sizes) {
      out.push(`### ${mapName} at ${w}x${h}`, "");
      for (const [label, game, tmpl] of layouts) {
        const r = rects(game, tmpl, "ConquestGame", [w, h]), map = r.rectOf("GameMap");
        const blockers = r.objs.filter(n => BLOCK.test(n)).map(n => [n, r.rectOf(n)]).filter(([, q]) => q && q.length === 4 && q[2] > 0);
        const bx = q => `x ${q[0]}..${q[0] + q[2]} y ${q[1]}..${q[1] + q[3]}`;
        out.push(`- **${label}**: map ${bx(map)}; ${blockers.map(([n, q]) => `${n} ${bx(q)}`).join("; ")}`);
        for (const [id, pts] of px) {
          const hit = pts.filter(([x, y]) => blockers.some(([, q]) => map[0] + x >= q[0] && map[0] + x < q[0] + q[2] && map[1] + y >= q[1] && map[1] + y < q[1] + q[3])).length;
          if (id !== 9 && !hit) continue;
          const xs = pts.map(p => map[0] + p[0]), ys = pts.map(p => map[1] + p[1]);
          out.push(`  - ${names[id]}: ${pts.length} px, covered ${hit} (${(100 * hit / pts.length).toFixed(1)}%); x ${Math.min(...xs)}..${Math.max(...xs)} y ${Math.min(...ys)}..${Math.max(...ys)}`);
          if (id === 9) cover[`${label}|${mapName}|${w}x${h}`] = hit;
        }
      }
      out.push("");
    }
  }
  return { text: out.join("\n"), cover };
}
module.exports = { build, diff, parse, text, buttonParams, nv, apply, rects, conquestNumbers };
