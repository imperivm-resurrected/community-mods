// Patches of a mod's edits of the game's own files, for a ruleset layer (community-mods#53, "Building a mod's layer"): the mod's file against the game's file ->
// a patch that, applied to the game's file by the engine's algorithm, gives the mod's. Every patch is applied again here and compared with the mod's file before it is
// returned; a file whose edit cannot be said as a patch comes back with `null` and the reason (the caller decides: ask, ship a copy under its own name, or report).
//   xmlPatch(hdText, modText)      -> { patch, ops, indexed } | { error }      <set> / <add> / <remove> (sdk/patches.md); recursive, so a patch by another mod or by the
//                                       package's own root on the same element keeps working (a command's <src> list is not replaced as a whole)
//   iniPatch(hdText, modText)      -> { patch, changed, removed } | null       changed or added keys, -Key for the keys the mod removed (no section is ever added: UNIT_SPECIALS.INI)
//   scriptPatch(hdText, modText)   -> { patch, directives } | { error }       @replace / @before / @after, bottom to top; the anchor of a line is its text when no earlier line holds it
//   locPatch(hdText, modText)      -> { xml, added, changed, missing }         only the keys the mod adds or changes in a GAME.LOC.XML (the game's keys it lacks are NOT removed)
//   applyXmlPatch(xml, patch)      -> { text, errors }                         the engine's operations, to prove a patch
// Self-test: node tools/lib/community-patch.js
const cp = require("child_process"), fs = require("fs"), os = require("os"), path = require("path");
const { applyScriptPatch } = require("./script-patch.js");

// ---- a small XML tree ----------------------------------------------------------------------------------------------------------------------------------------------
// { tag, attrs: [[name, rawValue]], kids: [node | string] }. Values are kept as written (entities not decoded) so that a patch writes them back unchanged.
function parseXml(text) {
  const s = text.replace(/^\uFEFF/, "").replace(/\r/g, ""), root = { tag: "#doc", attrs: [], kids: [] }, stack = [root];
  let i = 0;
  const err = m => { throw new Error(`xml: ${m} at ${i}: ${JSON.stringify(s.slice(i, i + 40))}`); };
  while (i < s.length) {
    const lt = s.indexOf("<", i);
    if (lt < 0) { const t = s.slice(i).trim(); if (t) stack[stack.length - 1].kids.push(t); break; }
    const t = s.slice(i, lt).trim(); if (t) stack[stack.length - 1].kids.push(t);
    i = lt;
    if (s.startsWith("<!--", i)) { const e = s.indexOf("-->", i); if (e < 0) err("comment not closed"); i = e + 3; continue; }
    if (s.startsWith("<?", i)) { const e = s.indexOf("?>", i); if (e < 0) err("pi not closed"); i = e + 2; continue; }
    if (s.startsWith("<![CDATA[", i)) { const e = s.indexOf("]]>", i); if (e < 0) err("cdata not closed"); stack[stack.length - 1].kids.push(s.slice(i, e + 3)); i = e + 3; continue; }
    if (s.startsWith("<!", i)) { const e = s.indexOf(">", i); i = e + 1; continue; }
    if (s.startsWith("</", i)) { const e = s.indexOf(">", i); const name = s.slice(i + 2, e).trim(); const top = stack.pop(); if (!top || top.tag.toLowerCase() !== name.toLowerCase()) err(`</${name}> closes <${top && top.tag}>`); i = e + 1; continue; }
    // start tag
    let j = i + 1; const m = /^[^\s/>]+/.exec(s.slice(j)); if (!m) err("tag name"); const node = { tag: m[0], attrs: [], kids: [] }; j += m[0].length;
    for (;;) {
      while (/\s/.test(s[j] || "")) j++;
      if (s[j] === "/" && s[j + 1] === ">") { stack[stack.length - 1].kids.push(node); i = j + 2; node.__done = true; break; }
      if (s[j] === ">") { stack[stack.length - 1].kids.push(node); stack.push(node); i = j + 1; break; }
      const a = /^([^\s=/>]+)\s*=\s*/.exec(s.slice(j)); if (!a) { i = j; err("attribute"); }
      j += a[0].length; const q = s[j]; let v;
      if (q === '"' || q === "'") { const e = s.indexOf(q, j + 1); if (e < 0) { i = j; err("attribute value not closed"); } v = s.slice(j + 1, e); j = e + 1; }
      else { const e = /^[^\s/>]*/.exec(s.slice(j))[0]; v = e; j += e.length; }
      node.attrs.push([a[1], q === "'" ? v.replace(/"/g, "&quot;") : v]);
    }
  }
  if (stack.length !== 1) err(`<${stack[stack.length - 1].tag}> not closed`);
  const el = root.kids.filter(k => typeof k !== "string");
  if (el.length !== 1) err(`${el.length} root elements`);
  return el[0];
}
const isEl = k => typeof k !== "string";
const lc = x => String(x).toLowerCase();
const attr = (n, name) => { const a = n.attrs.find(([k]) => lc(k) === lc(name)); return a ? a[1] : undefined; };
// canonical text of a node: attributes sorted by lower-case name, children in order (orderFree: sorted)
function canon(n, orderFree = false) {
  if (typeof n === "string") return n.replace(/\s+/g, " ");
  const a = n.attrs.map(([k, v]) => `${lc(k)}="${v}"`).sort().join(" ");
  let k = n.kids.map(x => canon(x, orderFree)); if (orderFree) k = k.sort();
  return `<${lc(n.tag)} ${a}>${k.join("")}</>`;
}
const clone = n => typeof n === "string" ? n : { tag: n.tag, attrs: n.attrs.map(a => a.slice()), kids: n.kids.map(clone) };
function serialize(n, ind = "") {
  if (typeof n === "string") return ind + n;
  const a = n.attrs.map(([k, v]) => ` ${k}="${v}"`).join("");
  if (!n.kids.length) return `${ind}<${n.tag}${a}/>`;
  if (n.kids.every(k => typeof k === "string")) return `${ind}<${n.tag}${a}>${n.kids.join("")}</${n.tag}>`;
  return `${ind}<${n.tag}${a}>\n${n.kids.map(k => serialize(k, ind + "\t")).join("\n")}\n${ind}</${n.tag}>`;
}

// ---- the selectors of sdk/patches.md: /a/b[@x='v'][@y][2], // -----------------------------------------------------------------------------------------------------------
function parseSel(sel) {
  const steps = []; const re = /(\/\/?)([^/[\]]+)((?:\[[^\]]*\])*)/y; let m, pos = 0;
  while (pos < sel.length) { re.lastIndex = pos; m = re.exec(sel); if (!m) throw new Error("selector: " + sel); const conds = [...m[3].matchAll(/\[([^\]]*)\]/g)].map(c => { const t = c[1].trim(); let q; if ((q = /^@([^=\s]+)\s*=\s*(?:'([^']*)'|"([^"]*)")$/.exec(t))) return { a: q[1], v: q[2] !== undefined ? q[2] : q[3] }; if ((q = /^@([^=\s]+)$/.exec(t))) return { a: q[1] }; if (/^\d+$/.test(t)) return { n: +t }; throw new Error("selector condition: " + t); }); steps.push({ deep: m[1] === "//", tag: m[2], conds }); pos = re.lastIndex; }
  return steps;
}
function select(root, sel) {
  const steps = parseSel(sel); let cur = [{ tag: "#doc", attrs: [], kids: [root] }];
  for (const st of steps) {
    const next = [];
    for (const n of cur) {
      const pool = []; const walk = (x, deep) => { for (const k of x.kids) if (isEl(k)) { pool.push([x, k]); if (deep) walk(k, true); } }; walk(n, st.deep);
      let cand = pool.filter(([, k]) => st.tag === "*" || lc(k.tag) === lc(st.tag));
      // [n] counts among the elements that passed the conditions before it, per parent
      const byParent = new Map(); for (const c of cand) { if (!byParent.has(c[0])) byParent.set(c[0], []); byParent.get(c[0]).push(c[1]); }
      for (const [, list] of byParent) {
        let l = list;
        for (const c of st.conds) {
          if (c.n) l = l[c.n - 1] ? [l[c.n - 1]] : [];
          else if (c.v !== undefined) l = l.filter(k => attr(k, c.a) !== undefined && lc(dec(attr(k, c.a))) === lc(c.v));
          else l = l.filter(k => attr(k, c.a) !== undefined);
        }
        next.push(...l);
      }
    }
    cur = next;
  }
  return cur;
}
const parentOf = (root, node) => { const f = x => { for (const k of x.kids) if (isEl(k)) { if (k === node) return x; const r = f(k); if (r) return r; } return null; }; return f(root); };

// ---- the engine's operations on a tree -------------------------------------------------------------------------------------------------------------------------------
function applyXmlPatch(xml, patchText) {
  const errors = []; const root = parseXml(xml), patch = parseXml(patchText); let tree = root;
  for (const op of patch.kids.filter(isEl)) {
    const sel = dec(attr(op, "select") || ""), opt = lc(attr(op, "optional") || "") === "yes";
    let hit; try { hit = select(tree, sel); } catch (e) { errors.push(e.message); continue; }
    if (!hit.length) { if (!opt) errors.push(`${op.tag} ${sel}: matches nothing`); continue; }
    const tag = lc(op.tag);
    for (const t of hit) {
      if (tag === "set") {
        for (const [k, v] of op.attrs) { if (["select", "unset", "optional"].includes(lc(k))) continue; const a = t.attrs.find(([x]) => lc(x) === lc(k)); if (a) a[1] = v; else t.attrs.push([k, v]); }
        const un = attr(op, "unset"); if (un) for (const k of un.split(/\s+/).filter(Boolean)) t.attrs = t.attrs.filter(([x]) => lc(x) !== lc(k));
      } else if (tag === "add") {
        const pos = lc(attr(op, "position") || "end"), add = op.kids.map(clone);
        if (pos === "before" || pos === "after") { const p = parentOf(tree, t); if (!p) { errors.push(`${sel}: no parent`); continue; } const i = p.kids.indexOf(t); p.kids.splice(pos === "before" ? i : i + 1, 0, ...add); }
        else if (pos === "start") t.kids.unshift(...add); else t.kids.push(...add);
      } else if (tag === "remove") { const p = parentOf(tree, t); if (!p) { errors.push(`${sel}: cannot remove the root`); continue; } p.kids.splice(p.kids.indexOf(t), 1); }
      else if (tag === "replace") { const p = parentOf(tree, t); if (!p) { tree = clone(op.kids.find(isEl)); continue; } p.kids.splice(p.kids.indexOf(t), 1, ...op.kids.map(clone)); }
      else errors.push(`unknown operation <${op.tag}>`);
    }
  }
  return { text: serialize(tree), tree, errors };
}

// ---- the patch of two XML trees -----------------------------------------------------------------------------------------------------------------------------------------
const IDENT = ["id", "name", "class", "sig", "obj", "script", "type", "text", "key"];
const q = v => v.includes("'") ? `"${v}"` : `'${v}'`;
const dec = v => v.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const sa = sel => `select="${sel.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")}"`;   // the selector holds real characters; the patch is XML
function xmlPatch(hdText, modText) {
  let hd, mod; try { hd = parseXml(hdText); mod = parseXml(modText); } catch (e) { return { error: e.message }; }
  if (lc(hd.tag) !== lc(mod.tag)) return { error: `root <${hd.tag}> against <${mod.tag}>` };
  const cur = clone(hd), ops = []; let indexed = 0;
  // a selector that picks `node` (child of `parent`) and only it, among the elements of its tag, in the tree as it is now
  const selOf = (parent, parentSel, node) => {
    // the identity is used even when the element is alone among its tag now: another patch (the package's own root) may add siblings of the same tag before this one runs
    const same = parent.kids.filter(k => isEl(k) && lc(k.tag) === lc(node.tag)), base = `${parentSel}/${node.tag}`;
    if (same.length === 1 && !node.attrs.length) return base;
    const hits = conds => same.filter(k => conds.every(a => { const v = attr(node, a); return v !== undefined ? attr(k, a) !== undefined && lc(dec(attr(k, a))) === lc(dec(v)) : attr(k, a) === undefined; }));
    const ok = conds => hits(conds).length === 1 && conds.every(a => attr(node, a) !== undefined && !(dec(attr(node, a)).includes("'") && dec(attr(node, a)).includes('"')));
    const names = node.attrs.map(([k]) => k);
    for (const c of IDENT) if (names.some(n => lc(n) === c) && ok([names.find(n => lc(n) === c)])) { const a = names.find(n => lc(n) === c); return `${base}[@${a}=${q(dec(attr(node, a)))}]`; }
    for (const a of names) if (ok([a])) return `${base}[@${a}=${q(dec(attr(node, a)))}]`;
    for (let x = 0; x < names.length; x++) for (let y = x + 1; y < names.length; y++) if (ok([names[x], names[y]])) return `${base}[@${names[x]}=${q(dec(attr(node, names[x])))}][@${names[y]}=${q(dec(attr(node, names[y])))}]`;
    if (names.length && ok(names)) return base + names.map(a => `[@${a}=${q(dec(attr(node, a)))}]`).join("");
    indexed++; return `${base}[${same.indexOf(node) + 1}]`;
  };
  const identity = n => { for (const c of IDENT) { const a = n.attrs.find(([k]) => lc(k) === c); if (a) return `${lc(n.tag)}|${c}|${lc(a[1])}`; } return null; };
  const same = (a, b) => typeof a === "string" ? a === b : typeof b !== "string" && canon(a) === canon(b);
  function diff(c, m, sel) {
    // the attributes
    const setA = m.attrs.filter(([k, v]) => { const a = c.attrs.find(([x]) => lc(x) === lc(k)); return !a || a[1] !== v; });
    const gone = c.attrs.filter(([k]) => !m.attrs.some(([x]) => lc(x) === lc(k))).map(([k]) => k);
    if (setA.length || gone.length) {
      ops.push(`\t<set ${sa(sel)}${setA.map(([k, v]) => ` ${k}="${v}"`).join("")}${gone.length ? ` unset="${gone.join(" ")}"` : ""}/>`);
      for (const [k, v] of setA) { const a = c.attrs.find(([x]) => lc(x) === lc(k)); if (a) a[1] = v; else c.attrs.push([k, v]); }
      c.attrs = c.attrs.filter(([k]) => !gone.some(g => lc(g) === lc(k)));
    }
    // the text, if the element has only text
    if (c.kids.every(k => !isEl(k)) && m.kids.every(k => !isEl(k))) {
      if (c.kids.join("") !== m.kids.join("")) { ops.push(`\t<replace ${sa(sel)}><${c.tag}${c.attrs.map(([k, v]) => ` ${k}="${v}"`).join("")}>${m.kids.join("")}</${c.tag}></replace>`); c.kids = m.kids.slice(); }
      return;
    }
    // the children: equal ones first, then the same identity, then the same tag in order
    const ck = c.kids.filter(isEl), mk = m.kids.filter(isEl), pair = new Map(), usedM = new Set();
    for (const x of ck) { const j = mk.findIndex((y, j) => !usedM.has(j) && same(x, y)); if (j >= 0) { pair.set(x, mk[j]); usedM.add(j); } }
    for (const x of ck) if (!pair.has(x)) { const id = identity(x); if (!id) continue; const j = mk.findIndex((y, j) => !usedM.has(j) && identity(y) === id); if (j >= 0) { pair.set(x, mk[j]); usedM.add(j); } }
    for (const x of ck) if (!pair.has(x) && !identity(x)) { const j = mk.findIndex((y, j) => !usedM.has(j) && !identity(y) && lc(y.tag) === lc(x.tag)); if (j >= 0) { pair.set(x, mk[j]); usedM.add(j); } }
    for (const x of ck) { const y = pair.get(x); if (y && !same(x, y)) diff(x, y, selOf(c, sel, x)); }
    for (const x of ck.filter(x => !pair.has(x)).reverse()) { ops.push(`\t<remove ${sa(selOf(c, sel, x))}/>`); c.kids.splice(c.kids.indexOf(x), 1); }
    // what the mod adds, after the element that precedes it in the mod's file
    const map = new Map([...pair].map(([x, y]) => [y, x])); let prev = null, batch = null;
    const flush = () => { if (!batch) return; ops.push(`\t<add ${sa(batch.sel)}${batch.pos ? ` position="${batch.pos}"` : ""}>\n${batch.items.map(it => serialize(it, "\t\t")).join("\n")}\n\t</add>`); batch = null; };
    mk.forEach((y, j) => {
      if (usedM.has(j)) { flush(); prev = map.get(y); return; }
      const item = clone(y);
      if (batch && batch.last === prev) { batch.items.push(item); c.kids.splice(c.kids.indexOf(prev) + 1, 0, item); prev = item; batch.last = item; return; }
      flush();
      if (!prev) { batch = { sel, pos: "start", items: [item], last: item }; c.kids.unshift(item); }
      else { batch = { sel: selOf(c, sel, prev), pos: "after", items: [item], last: item }; c.kids.splice(c.kids.indexOf(prev) + 1, 0, item); }
      prev = item;
    });
    flush();
  }
  diff(cur, mod, `/${hd.tag}`);
  if (!ops.length) return { patch: null, ops: 0, indexed: 0 };
  const patch = `<patch>\n${ops.join("\n")}\n</patch>\n`;
  // proof: the engine's operations on the game's file give the mod's (children in the same order)
  const r = applyXmlPatch(hdText, patch);
  if (r.errors.length) return { error: "the patch does not apply: " + r.errors[0] };
  // the children in the mod's order, or the same children in another order (the <properties> of a class are merged; the order of the game's own is kept)
  if (canon(r.tree) !== canon(mod) && canon(r.tree, true) === canon(mod, true)) return { patch, ops: ops.length, indexed, reordered: true };
  if (canon(r.tree) !== canon(mod)) return { error: "the patch applied to the game's file is not the mod's file", patch, got: serialize(r.tree), want: serialize(mod) };
  return { patch, ops: ops.length, indexed };
}

// ---- INI -------------------------------------------------------------------------------------------------------------------------------------------------------------
function parseIni(t) {
  const m = new Map(); let sec = null;
  for (const raw of t.replace(/\r/g, "").split("\n")) {
    const h = raw.match(/^\s*\[([^\]]+)\]/); if (h) { sec = h[1]; if (!m.has(lc(sec))) m.set(lc(sec), { name: sec, keys: new Map(), bare: [] }); continue; }
    if (!sec) continue; const x = raw.trim(); if (!x || x.startsWith(";")) continue;
    const k = raw.match(/^\s*([^;=\s][^=]*?)\s*=\s*(.*?)\s*$/); const s = m.get(lc(sec));
    if (k) s.keys.set(lc(k[1]), [k[1], k[2]]); else s.bare.push(x);
  }
  return m;
}
// the keys the mod changes or adds in sections the game has (never a new section when `noNewSections`), -Key for the keys it removes, +Line/-Line for lists of bare names
function iniPatch(hdText, modText, { noNewSections = false } = {}) {
  const A = parseIni(hdText), B = parseIni(modText), out = []; let changed = 0, removed = 0; const skipped = [];
  for (const [ks, b] of B) {
    const a = A.get(ks); if (!a && noNewSections) { skipped.push(`[${b.name}]`); continue; }
    const lines = [];
    for (const [k, [name, v]] of b.keys) { const o = a && a.keys.get(k); if (!o || o[1] !== v) { lines.push(`${name} = ${v}`); changed++; } }
    for (const l of b.bare) if (!a || !a.bare.includes(l)) { lines.push(`+${l}`); changed++; }
    if (a) { for (const l of a.bare) if (!b.bare.includes(l)) { lines.push(`-${l}`); removed++; } }
    if (lines.length) out.push(`[${b.name}]`, ...lines);
  }
  return out.length ? { patch: out.join("\r\n") + "\r\n", changed, removed, skipped } : null;
}
function applyIniPatch(hdText, patch) {
  const secs = []; let cur = null;
  for (const raw of hdText.replace(/\r/g, "").split("\n")) { const h = raw.match(/^\s*\[([^\]]+)\]/); if (h) { cur = { name: h[1], lines: [] }; secs.push(cur); } else if (cur) cur.lines.push(raw); else (secs.pre ||= []).push(raw); }
  let sec = null;
  for (const raw of patch.replace(/\r/g, "").split("\n")) {
    const h = raw.match(/^\s*\[([^\]]+)\]/); if (h) { sec = secs.find(s => lc(s.name) === lc(h[1])); if (!sec) { sec = { name: h[1], lines: [] }; secs.push(sec); } continue; }
    const x = raw.trim(); if (!x || x.startsWith(";") || !sec) continue;
    if (x[0] === "-") { const key = x.slice(1).trim(), i = sec.lines.findIndex(l => lc(l.trim()) === lc(key) || (l.includes("=") && lc(l.split("=")[0].trim()) === lc(key))); if (i >= 0) sec.lines.splice(i, 1); continue; }
    if (x[0] === "+") { const l = x.slice(1).trim(); if (!sec.lines.some(y => y.trim() === l)) { let e = sec.lines.length; while (e > 0 && !sec.lines[e - 1].trim()) e--; sec.lines.splice(e, 0, l); } continue; }
    const k = x.match(/^([^=]+?)\s*=\s*(.*)$/); if (!k) continue;
    const i = sec.lines.findIndex(l => l.includes("=") && !l.trim().startsWith(";") && lc(l.split("=")[0].trim()) === lc(k[1]));
    if (i >= 0) sec.lines[i] = `${k[1]} = ${k[2]}`; else { let e = sec.lines.length; while (e > 0 && !sec.lines[e - 1].trim()) e--; sec.lines.splice(e, 0, `${k[1]} = ${k[2]}`); }
  }
  return secs;
}
const iniMap = secs => { const m = new Map(); for (const s of secs) { const t = new Map(); const bare = []; for (const l of s.lines) { const x = l.trim(); if (!x || x.startsWith(";")) continue; const k = x.match(/^([^=]+?)\s*=\s*(.*)$/); if (k) t.set(lc(k[1]), k[2].trim()); else bare.push(x); } m.set(lc(s.name), { t, bare: bare.sort() }); } return m; };
// proof: HD's file with the patch has every key and list line the mod's file has (keys the mod lacks and the game has are kept only if the patch did not name them)
function iniProve(hdText, patch, modText) {
  const got = iniMap(applyIniPatch(hdText, patch)), want = iniMap(applyIniPatch(modText, "")), problems = [];
  for (const [s, w] of want) { const g = got.get(s); if (!g) { problems.push(`[${s}] missing`); continue; } for (const [k, v] of w.t) if (g.t.get(k) !== v) problems.push(`[${s}] ${k}: ${g.t.get(k)} instead of ${v}`); for (const l of w.bare) if (!g.bare.includes(l)) problems.push(`[${s}] list line ${l}`); }
  return problems;
}

// ---- scripts --------------------------------------------------------------------------------------------------------------------------------------------------------
// The engine takes the FIRST line of the script that holds the directive's text. Applied from the bottom hunk to the top one, the lines above a hunk are still the game's, so a line
// can be an anchor when no EARLIER line of the game's script holds its text. The script is compared line by line with blank lines and indentation ignored (the compiler does not see them).
function scriptPatch(hdText, modText) {
  const A = hdText.replace(/\r/g, "").split("\n"), B = modText.replace(/\r/g, "").split("\n");
  if (A.length && A[A.length - 1] === "") A.pop(); if (B.length && B[B.length - 1] === "") B.pop();
  const ai = [], bi = []; A.forEach((l, i) => { if (l.trim()) ai.push(i); }); B.forEach((l, i) => { if (l.trim()) bi.push(i); });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-")), fa = path.join(tmp, "a"), fb = path.join(tmp, "b");
  fs.writeFileSync(fa, ai.map(i => A[i].trim()).join("\n") + "\n"); fs.writeFileSync(fb, bi.map(i => B[i].trim()).join("\n") + "\n");
  const d = cp.spawnSync("diff", ["-U0", fa, fb], { encoding: "utf8" }).stdout; fs.rmSync(tmp, { recursive: true });
  const anchorable = i => { const t = A[i].trim(); return t.length >= 1 && A.findIndex(l => l.includes(t)) === i; };
  const dirs = [], problems = [];
  const hunks = d.split(/^(?=@@ )/m).slice(1).map(h => {
    const m = h.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/); const at = +m[1], k = m[2] === undefined ? 1 : +m[2], nk = m[4] === undefined ? 1 : +m[4], nat = +m[3];
    const lines = h.split("\n").slice(1).filter(l => l.startsWith("+")).map(l => l.slice(1));
    return { at, k, nat, nk, ins: [] , insTrim: lines };
  });
  for (const h of hunks) {
    // old lines (non-blank index space) [s, s+k) -> the script's line numbers; the new text keeps the mod's own lines (indentation)
    const s = h.k === 0 ? h.at : h.at - 1;
    const delRange = ai.slice(s, s + h.k);
    const newStart = h.nk === 0 ? h.nat : h.nat - 1, newIdx = bi.slice(newStart, newStart + h.nk);
    h.del = delRange; h.ins = newIdx.map(i => B[i]); h.s = s;
  }
  for (const h of hunks.slice().reverse()) {
    const out = [];
    if (h.del.length) {
      // every deleted line needs an anchor; the first one carries the new text, the others are replaced by nothing
      const bad = h.del.filter(i => !anchorable(i));
      if (bad.length) {
        // the new text may stand in for a deleted line that is not an anchor when that line is the same as one of the new lines (a brace that only moved)
        problems.push(`line ${bad[0] + 1} ${JSON.stringify(A[bad[0]].trim().slice(0, 50))} is also in an earlier line`); continue;
      }
      h.del.forEach((i, n) => { out.push(`@replace ${A[i].trim()}`); if (n === 0) out.push(...h.ins); });
    } else {
      // an insertion: after the line before it, or before the line after it
      const before = h.s > 0 ? ai[h.s - 1] : -1, after = h.s < ai.length ? ai[h.s] : -1;
      if (before >= 0 && anchorable(before)) out.push(`@after ${A[before].trim()}`, ...h.ins);
      else if (after >= 0 && anchorable(after)) out.push(`@before ${A[after].trim()}`, ...h.ins);
      else if (after < 0) out.push("@bottom", ...h.ins);
      else { problems.push(`no anchor for an insertion near line ${(before >= 0 ? before : after) + 1}`); continue; }
    }
    dirs.push(out);
  }
  if (problems.length) return { error: problems[0], problems };
  if (!dirs.length) return { patch: null, directives: 0 };
  const patch = dirs.map(x => x.join("\r\n")).join("\r\n") + "\r\n";
  const r = applyScriptPatch(A.join("\n"), patch);
  if (r.errors.length) return { error: "the patch does not apply: " + r.errors[0] };
  const norm = t => t.split("\n").map(l => l.trim()).filter(Boolean), got = norm(r.text), want = norm(B.join("\n"));
  for (let i = 0; i < Math.max(got.length, want.length); i++) if (got[i] !== want[i]) return { error: `the patch applied to the game's script differs from the mod's at line ${i + 1}: ${JSON.stringify(got[i])} / ${JSON.stringify(want[i])}` };
  return { patch, directives: dirs.length };
}

// ---- texts ------------------------------------------------------------------------------------------------------------------------------------------------------------
// GAME.LOC.XML: <translationtableentry text="key@context" justtext=".." result=".." comment=".."/>. Only the keys the mod adds or whose result it changes.
function locEntries(text) {
  const out = new Map(), re = /<translationtableentry\b([^>]*?)\/?>/g, t = text.replace(/\r/g, ""); let m;
  while ((m = re.exec(t))) { const at = {}; for (const a of m[1].matchAll(/([A-Za-z_][\w:-]*)\s*=\s*"([^"]*)"/g)) at[a[1]] = a[2]; if (at.text !== undefined) out.set(at.text, at); }
  return out;
}
function locPatch(hdText, modText) {
  const A = locEntries(hdText), B = locEntries(modText), keep = [], added = [], changed = []; let missing = 0;
  for (const [k, b] of B) { const a = A.get(k); if (!a) { added.push(k); keep.push(b); } else if (a.result !== b.result) { changed.push(k); keep.push(b); } }
  for (const k of A.keys()) if (!B.has(k)) missing++;
  const attrs = e => Object.entries(e).filter(([k, v]) => ["text", "context", "justtext", "result", "comment"].includes(k) && !(v === "" && (k === "context" || k === "comment"))).map(([k, v]) => `${k}="${v}"`).join(" ");
  return { xml: `<translationtable>\n${keep.map(e => `\t<translationtableentry ${attrs(e)}/>`).join("\n")}\n</translationtable>\n`, added: added.length, changed: changed.length, missing };
}

module.exports = { parseXml, serialize, canon, applyXmlPatch, xmlPatch, iniPatch, applyIniPatch, iniProve, scriptPatch, locPatch, locEntries };

if (require.main === module) {
  const assert = require("assert");
  const hd = `<commands>\n\t<cmd name="a" costgold="10">\n\t\t<src obj="X"/>\n\t\t<src obj="Y"/>\n\t</cmd>\n\t<cmd name="b"><check s="1"/></cmd>\n</commands>`;
  const mod = `<commands>\n\t<cmd name="a" costgold="20" key="Q">\n\t\t<src obj="X"/>\n\t\t<src obj="Z"/>\n\t</cmd>\n\t<cmd name="c"/>\n</commands>`;
  const r = xmlPatch(hd, mod); assert(r.patch && !r.error, JSON.stringify(r));
  assert(/<set select="\/commands\/cmd\[@name='a'\]" costgold="20" key="Q"\/>/.test(r.patch), r.patch);
  assert(/<remove select="\/commands\/cmd\[@name='b'\]"\/>/.test(r.patch) && /<add select="\/commands\/cmd\[@name='a'\]\/src\[@obj='X'\]" position="after">/.test(r.patch), r.patch);
  assert(/<add select="\/commands\/cmd\[@name='a'\]" position="after">/.test(r.patch), r.patch);
  const i = iniPatch("[A]\nx = 1\ny = 2\n[B]\nz = 3\n", "[A]\nx = 1\ny = 5\nw = 7\n[B]\nz = 3\n[C]\nq=1\n", { noNewSections: true });
  assert.equal(i.patch, "[A]\r\ny = 5\r\nw = 7\r\n"); assert.deepEqual(i.skipped, ["[C]"]);
  const hs = "// void\nint a;\nif (a) {\n\tx();\n}\nif (b) {\n\ty();\n}\nz();\n", ms = "// void\nint a;\nif (a) {\n\tx();\n\tx2();\n}\nif (b) {\n\ty3();\n}\nz();\n";
  const s = scriptPatch(hs, ms); assert(s.patch && !s.error, JSON.stringify(s)); assert(/@replace y\(\);/.test(s.patch) && /@after x\(\);/.test(s.patch), s.patch);
  const l = locPatch(`<translationtable><translationtableentry text="a" result="1"/><translationtableentry text="b" result="2"/></translationtable>`, `<translationtable><translationtableentry text="a" result="9"/><translationtableentry text="c" result="3"/></translationtable>`);
  assert(l.added === 1 && l.changed === 1 && l.missing === 1);
  console.log("community-patch: self-test ok");
}
