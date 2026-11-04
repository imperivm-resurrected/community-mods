// The LISTS of a menu skin (this stack's own copy of the rule the maintainer put in tools/lib/menu-skin.js on main, commit a61f84f3; written here so the stack does not depend on it).
// iniChanged() (tools/lib/ported-patch.js) only sees `Key = value` lines, but what a menu SHOWS is decided by the lists of bare names ([MainMenu Objects]: Caption, IniBackFrame, TipsBackFrame,
// Version...). A skin that adds a panel to the list lost it: the 4.2 showed "Next" and "More Info" with no Tips panel, no frame behind the buttons and no version text.
// listChanges() turns a changed list into `-line` for every line of the game's list and `+line` for every line of the mod's, in the mod's order (sdk/patches.md: "+Line adds a bare line if it
// isn't there", "-Line removes the line that is exactly that text").
//   listChanges(hdText, modText) -> [{ sec, lines }]       the sections whose list of bare names differs (a mod made from the game's HD files)
//   listChanges(hdText, modText, baseText)                 3-way, for a mod made from the 1.40 files (the 2.x line): only what the MOD edited against the 1.40 (`baseText`) is applied to HD's list
//                                                          (lines it removed are taken out, lines it added go after the line that precedes them in the mod's list). Without it, the lines HD
//                                                          itself changed since 1.40 (the Tips panel, "Versionn") would look like the mod's edits and the patch would undo HD's own work.
//   mergeLists(patchText|null, lists) -> text              the patch with the list lines inside the same section as its Key = value lines (a section that already has -/+ lines is left alone)
//   skinLists({ OUT, HD }) -> Map(fileName -> lists)       call BEFORE skinToPatches (which removes the mod's whole file): the lists of every menu INI of the port that differs from the game's
//   addLists({ OUT, lists }) -> number of files            call AFTER the patches are at patches/menuini/: merges the lists into them (template.ini: both places)
const fs = require("fs"), path = require("path");
const find = (base, rel) => { let p = base; for (const part of rel.split("/")) { if (!fs.existsSync(p)) return null; const n = fs.readdirSync(p).find(x => x.toLowerCase() === part.toLowerCase()); if (!n) return null; p = path.join(p, n); } return p; };
// the bare lines (no =, not a comment, not a header) of each section, in order: Map(section -> [raw line without CR])
const bareLists = text => { const m = new Map(); let sec = null; for (const raw of text.replace(/\r/g, "").split("\n")) { const h = raw.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; if (!m.has(sec)) m.set(sec, []); continue; } if (sec && raw.trim() && !/^\s*;/.test(raw) && !raw.includes("=")) m.get(sec).push(raw); } return m; };
function listChanges(hdText, modText, baseText) {
  const A = bareLists(hdText), B = bareLists(modText), C = baseText == null ? null : bareLists(baseText), out = [], t = l => l.trim();
  for (const [sec, mod] of B) {
    const hd = A.get(sec) || [];
    let target = mod;
    if (C) {
      const base = C.get(sec) || [], inBase = new Set(base.map(t)), inMod = new Set(mod.map(t));
      target = hd.filter(l => !(inBase.has(t(l)) && !inMod.has(t(l))));                       // what the mod removed from the 1.40's list
      mod.forEach((l, i) => {                                                                   // what the mod added to it: after the line that precedes it in the mod's list
        if (inBase.has(t(l)) || target.some(x => t(x) === t(l))) return;
        let at = 0; for (let j = i - 1; j >= 0; j--) { const k = target.findIndex(x => t(x) === t(mod[j])); if (k >= 0) { at = k + 1; break; } }
        target = [...target.slice(0, at), l, ...target.slice(at)];
      });
    }
    const same = hd.length === target.length && hd.every((l, i) => t(l) === t(target[i]));
    if (!target.length || same) continue;
    out.push({ sec, lines: [...hd.map(l => "-" + l.replace(/\s+$/, "")), ...target.map(l => "+" + t(l))] });
  }
  return out;
}
function mergeLists(text, lists) {
  const blocks = []; let cur = null;
  for (const l of (text || "").split(/\r?\n/)) { const h = l.match(/^\[([^\]]+)\]/); if (h) { cur = { sec: h[1], lines: [] }; blocks.push(cur); } else if (l && cur) cur.lines.push(l); }
  for (const { sec, lines } of lists) {
    const b = blocks.find(x => x.sec.toLowerCase() === sec.toLowerCase());
    if (b) { if (!b.lines.some(l => /^[+-]/.test(l))) b.lines.push(...lines); } else blocks.push({ sec, lines });
  }
  return blocks.map(b => `[${b.sec}]\r\n${b.lines.join("\r\n")}`).join("\r\n") + "\r\n";
}
function skinLists({ OUT, HD, MOD, BASE }) {
  // MOD: the folder that has the mod's own Data/Interface/Menu (default: the port's, which is only right when a step has not rewritten it); BASE: the 1.40's, for a 1.40-based mod
  const mine = find(MOD || OUT, "DATA/INTERFACE/MENU"), hd = find(HD, "DATA/INTERFACE/MENU"), base = BASE && find(BASE, "DATA/INTERFACE/MENU"), res = new Map();
  if (!mine || !hd) return res;
  const hdFiles = new Map(fs.readdirSync(hd).map(f => [f.toLowerCase(), f])), baseFiles = new Map(base ? fs.readdirSync(base).map(f => [f.toLowerCase(), f]) : []);
  for (const f of fs.readdirSync(mine).filter(f => /\.ini$/i.test(f))) {
    const h = hdFiles.get(f.toLowerCase()); if (!h) continue;
    const b = baseFiles.get(f.toLowerCase());
    const l = listChanges(fs.readFileSync(path.join(hd, h), "latin1"), fs.readFileSync(path.join(mine, f), "latin1"), b ? fs.readFileSync(path.join(base, b), "latin1") : null);
    if (l.length) res.set(h, l);
  }
  return res;
}
function addLists({ OUT, lists }) {
  let n = 0;
  for (const [h, l] of lists) {
    const dirs = [["patches", "menuini"], ...(/^template\.ini$/i.test(h) ? [["patches", "DATA", "INTERFACE", "MENU"]] : [])];
    for (const d of dirs) {
      const dst = path.join(OUT, ...d, h), had = fs.existsSync(dst);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.writeFileSync(dst, mergeLists(had ? fs.readFileSync(dst, "latin1") : "", l), "latin1");
    }
    n++;
  }
  return n;
}

// ---- the KEYS of a menu INI, from the mod's own file -----------------------------------------------------------------------------------------------------------------------------
// tools/port-140.js (shared, not touched) merges a 1.40-based mod's INI into HD's with a "by key" fallback (HD "may have moved a key to another section"): a key whose section HD lacks lands on the
// LAST section of HD that has a key of that name. In the menu INIs that mixed sections up ([CaptionImp] Type = BmpScroll from the mod's [Back], [InfoList] Style/VAlign from [Back], [Shield7] RectWH
// from [Shield11], [NickList.*] from the new sections...). modKeys() does it section by section, 3-way, without that fallback:
//   - a key the mod did not change against the 1.40 stays HD's (HD changed things since 1.40 that the mod never knew);
//   - a key HD already has with that value is not written;
//   - a section HD lacks is HD's section with the same `Id` if there is one (HD renamed [Version] to [Versionn]; both are Id 0x1022), else a NEW section, written whole when the mod edited it.
//   modKeys(hdText, baseText|null, modText) -> text of the patch (Key = value lines, CRLF) or ""
const trim = v => v.replace(/\s+;.*$/, "").trim();            // the engine does not strip a comment at the end of a line, so the patch must not carry one
function parseKV(text) {
  const m = new Map(); let cur = null;
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const h = raw.match(/^\s*\[([^\]]+)\]/); if (h) { const k = h[1].trim().toLowerCase(); if (!m.has(k)) m.set(k, { name: h[1].trim(), keys: new Map() }); cur = m.get(k); continue; }
    const kv = raw.match(/^\s*([^;=\s][^=]*?)\s*=\s*(.*)$/); if (kv && cur) cur.keys.set(kv[1].trim().toLowerCase(), { key: kv[1].trim(), val: trim(kv[2]) });
  }
  return m;
}
function modKeys(hdText, baseText, modText) {
  const H = parseKV(hdText), B = baseText == null ? null : parseKV(baseText), M = parseKV(modText), out = [];
  const idOf = sec => sec.keys.get("id") && sec.keys.get("id").val.toLowerCase();
  for (const [sk, ms] of M) {
    let target = H.get(sk);
    if (!target && idOf(ms)) target = [...H.values()].find(h => idOf(h) === idOf(ms) && !M.has(h.name.toLowerCase()));      // HD's section for the same Id, under another name
    const bs = B && B.get(sk), lines = [];
    const edited = !B || !bs || [...ms.keys].some(([k, e]) => !bs.keys.has(k) || bs.keys.get(k).val !== e.val);           // did the mod change this section against the 1.40?
    if (!target && !edited) continue;                                                                                     // a section of the 1.40 that HD dropped and the mod left alone
    for (const [k, e] of ms.keys) {
      if (target ? target.keys.has(k) && target.keys.get(k).val === e.val : false) continue;                              // HD has it already
      if (target && B && bs && bs.keys.has(k) && bs.keys.get(k).val === e.val) continue;                                 // the mod did not change it: HD's stays
      lines.push(`${e.key} = ${e.val}`);
    }
    if (lines.length) out.push(`[${target ? target.name : ms.name}]`, ...lines);
  }
  return out.length ? out.join("\r\n") + "\r\n" : "";
}
// For every menu INI of the mod (MOD/Data/Interface/Menu) that HD has: write patches/menuini/<name>.ini from modKeys() (template.ini also at patches/DATA/INTERFACE/MENU/), replacing what skinToPatches wrote
// from the merged file; a file with nothing to write has no patch. -> { written: [names], removed: [names] }
function menuKeyPatches({ OUT, HD, MOD, BASE }) {
  const mine = find(MOD, "DATA/INTERFACE/MENU"), hd = find(HD, "DATA/INTERFACE/MENU"), base = BASE && find(BASE, "DATA/INTERFACE/MENU"), written = [], removed = [];
  if (!mine || !hd) return { written, removed };
  const hdFiles = new Map(fs.readdirSync(hd).map(f => [f.toLowerCase(), f])), baseFiles = new Map(base ? fs.readdirSync(base).map(f => [f.toLowerCase(), f]) : []);
  for (const f of fs.readdirSync(mine).filter(f => /\.ini$/i.test(f)).sort()) {
    const h = hdFiles.get(f.toLowerCase()); if (!h) continue;
    const b = baseFiles.get(f.toLowerCase());
    const text = modKeys(fs.readFileSync(path.join(hd, h), "latin1"), b ? fs.readFileSync(path.join(base, b), "latin1") : null, fs.readFileSync(path.join(mine, f), "latin1"));
    const dirs = [["patches", "menuini"], ...(/^template\.ini$/i.test(h) ? [["patches", "DATA", "INTERFACE", "MENU"]] : [])];
    for (const d of dirs) {
      const dst = path.join(OUT, ...d, h); fs.rmSync(dst, { force: true });
      if (text) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, text, "latin1"); }
    }
    (text ? written : removed).push(h);
  }
  return { written, removed };
}
// The engine builds the sized template (template-WxH.ini, the one the menus read when "the menus follow the screen's size") from the game's file WITHOUT the mod's patch (src/mods/vfs.cpp OpenSizedTemplate,
// and MenuLayoutIsFixed in src/mods/menuart.cpp decides which: a template whose buttons lean on %ScreenRight% & co. follows the screen), so the column of buttons the mod's TEMPLATE.INI sets is lost. What a
// screen's own [<Screen> Params] sets does apply (seen in game: the 4.2's and the 1.8's columns). So the main menu gets the original template's ButtonSpacing / ButtonXStart / ButtonYStart in its
// [MainMenu Params] when they differ from HD's and the original's MAINMENU does not set them itself (the template patch stays as it is).
//   buttonParams({ MOD, HD }) -> [ "ButtonSpacing = 42", ... ]
function buttonParams({ MOD, HD }) {
  const m = find(MOD, "DATA/INTERFACE/MENU/TEMPLATE.INI"), h = find(HD, "DATA/INTERFACE/MENU/TEMPLATE.INI"), mm = find(MOD, "DATA/INTERFACE/MENU/MAINMENU.INI");
  if (!m || !h) return [];
  const T = parseKV(fs.readFileSync(m, "latin1")).get("params"), H = parseKV(fs.readFileSync(h, "latin1")).get("params"), own = mm && parseKV(fs.readFileSync(mm, "latin1")).get("mainmenu params");
  if (!T || !H) return [];
  return ["ButtonSpacing", "ButtonXStart", "ButtonYStart"].filter(k => { const a = T.keys.get(k.toLowerCase()), b = H.keys.get(k.toLowerCase()); return a && b && a.val !== b.val && !(own && own.keys.has(k.toLowerCase())); }).map(k => `${k} = ${T.keys.get(k.toLowerCase()).val}`);
}
// put `lines` under [<section>] of patches/menuini/<file> (the section is created if the patch has none)
function addToPatch({ OUT, file, section, lines }) {
  if (!lines.length) return false;
  const dst = path.join(OUT, "patches", "menuini", file), text = fs.existsSync(dst) ? fs.readFileSync(dst, "latin1") : "";
  const blocks = []; let cur = null;
  for (const l of text.split(/\r?\n/)) { const h = l.match(/^\[([^\]]+)\]/); if (h) { cur = { sec: h[1], lines: [] }; blocks.push(cur); } else if (l && cur) cur.lines.push(l); }
  let b = blocks.find(x => x.sec.toLowerCase() === section.toLowerCase()); if (!b) { b = { sec: section, lines: [] }; blocks.push(b); }
  b.lines.unshift(...lines.filter(l => !b.lines.some(x => x.toLowerCase().startsWith(l.split("=")[0].trim().toLowerCase() + " ="))));
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, blocks.map(x => `[${x.sec}]\r\n${x.lines.join("\r\n")}`).join("\r\n") + "\r\n", "latin1");
  return true;
}
module.exports = { listChanges, mergeLists, skinLists, addLists, modKeys, menuKeyPatches, buttonParams, addToPatch, parseKV };
