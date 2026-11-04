// The mod's own texts (loc/spanish.loc.xml) for the MCI port: the keys the game's Spanish table does not have, written again for the clones; and a scan of every text the
// port's classes, orders and items name.
//
// The engine reads loc/<language>.loc.xml of a mod (sdk/languages.md); an entry is `text="<English>@<context>"` and the result. English needs no file (the key is the English
// text). The mod ships a whole 1.40 Spanish table (GAME.LOC.XML and TRANSLATION.LOC.XML); tools/port-140.js keeps the entries that differ from HD's GAME.LOC.XML. Of those:
//   fresh     the key (text + context) is not in HD's table (GAME and TRANSLATION)       -> shipped, rewritten for the clones
//   same      HD's table has the key with the same result                               -> not shipped
//   override  HD's table has the key with another result (Cover of Mercy, Multiplayer...) -> not shipped: it would change the game's own text for everybody
// The rewrite is the rule of tools/greek-1-8-civs.js (an entry whose context is the name of an order a civilization cloned is written again for each clone's order, with the
// text of the mod), extended to the class names (the game builds them as `<display_name>@<class id> class name`, `... class name plural`): the context of a class the clone step
// renamed (or that tagCollisions tagged) is written again for each class it became. The old entry is dropped when it was rewritten: nothing in the port has the old context.
const fs = require("fs"), path = require("path");
const rd = f => fs.readFileSync(f, "latin1");
const decode = b => { const u = b.toString("utf8"); return u.includes("\ufffd") ? b.toString("latin1") : u; };
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const unesc = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// entries of a table: { line, text (with @context), base (the text before it), ctx, key, result }
function entries(src) {
  const out = [];
  for (const m of src.matchAll(/<translationtableentry\b[^>]*?\/>/g)) {
    const at = n => { const r = new RegExp(`\\b${n}="([^"]*)"`).exec(m[0]); return r ? r[1] : undefined; };
    const text = at("text"); if (text === undefined) continue;
    const cattr = at("context") || "";
    // the context is the attribute when there is one, else what follows the last "@" (a text may hold an "@" of its own only before it)
    const i = text.lastIndexOf("@"), inText = i >= 0 && (!cattr || text.endsWith("@" + cattr));
    const ctx = cattr || (i >= 0 ? text.slice(i + 1) : ""), base = inText ? text.slice(0, i) : text;
    out.push({ line: m[0], text, base, ctx, key: ctx ? `${base}@${ctx}` : base, result: at("result"), justtext: at("justtext") });
  }
  return out;
}
const tableKeys = files => { const s = new Map(); for (const f of files) if (fs.existsSync(f)) for (const e of entries(decode(fs.readFileSync(f)))) s.set(e.key, e.result); return s; };

// -> { fresh, same, override } from the mod's entries and HD's keys (Map key -> result)
function split(mod, hd) {
  const r = { fresh: [], same: [], override: [] };
  for (const e of mod) (!hd.has(e.key) ? r.fresh : hd.get(e.key) === e.result ? r.same : r.override).push(e);
  return r;
}

// `maps`: { commands: Map oldName(lowercase) -> [new names], classes: Map oldId(lowercase) -> [new ids] }
// -> { entries: [entry lines], log: [{ from, to: [keys], why }] }
function rewrite(fresh, maps) {
  const lines = [], log = [], seen = new Set();
  const add = (line, key) => { if (!seen.has(key)) { seen.add(key); lines.push(line); } };
  for (const e of fresh) {
    let ctxs = null, why = "";
    const cm = /^(.+?) class name( plural)?$/.exec(e.ctx);
    if (cm && maps.classes.has(cm[1].toLowerCase())) { ctxs = maps.classes.get(cm[1].toLowerCase()).map(id => `${id} class name${cm[2] || ""}`); why = "class"; }
    else if (e.ctx && maps.commands.has(e.ctx.toLowerCase())) { ctxs = maps.commands.get(e.ctx.toLowerCase()); why = "order"; }
    if (!ctxs) { add(e.line, e.key); log.push({ from: e.key, to: [e.key], why: "" }); continue; }
    const to = [];
    for (const c of ctxs) {
      const key = `${e.base}@${c}`; to.push(key);
      const line = e.line.replace(/\btext="[^"]*"/, () => `text="${esc(unesc(e.base))}@${esc(c)}"`).replace(/\bcontext="[^"]*"/, () => `context="${esc(c)}"`);
      add(line, key);
    }
    log.push({ from: e.key, to, why });
  }
  return { entries: lines, log };
}

const fileText = lines => "\ufeff<translationtable>\n" + lines.join("\n") + "\n</translationtable>\n";

// Every text the port's classes, orders and items name, as the engine builds the key (calibrated on the game's own files: 94 to 100 % of them are in its table):
//   class    display_name@<id> class name, display_name_plural@<id> class name plural, <last part of edittree_pos>@editortree/<the rest>
//   order    rollover@<name>, description@<name>
//   item     name, description (bare)
// -> [{ kind, file, key }]
function scanKeys(dataDirs) {
  const out = [];
  for (const root of dataDirs) {
    for (const f of walk(root).filter(p => /\.xml$/i.test(p))) {
      const rel = path.relative(root, f).replace(/\\/g, "/");
      if (!/(^|\/)(classes|commands)\/|(^|\/)items\.xml$/i.test(rel)) continue;
      const s = rd(f).replace(/<!--[\s\S]*?-->/g, ""), name = path.basename(f);
      if (/(^|\/)classes\//i.test(rel) && /\.sc\.xml$/i.test(f)) {
        const id = (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1]; if (!id) continue;
        for (const m of s.matchAll(/\bdisplay_name\s*=\s*"([^"]*)"/g)) out.push({ kind: "class name", file: name, key: `${unesc(m[1])}@${id} class name` });
        for (const m of s.matchAll(/\bdisplay_name_plural\s*=\s*"([^"]*)"/g)) out.push({ kind: "class plural", file: name, key: `${unesc(m[1])}@${id} class name plural` });
        const e = /\bedittree_pos\s*=\s*"([^"]*)"/.exec(s); if (e) { const p = e[1].split("/"), last = p.pop(); out.push({ kind: "editor tree", file: name, key: `${last}@editortree/${p.join("/")}` }); }
      } else if (/(^|\/)commands\//i.test(rel)) {
        for (const c of s.matchAll(/<cmd\b([^>]*)>/g)) {
          const nm = (c[1].match(/\bname\s*=\s*"([^"]*)"/) || [])[1];
          for (const k of ["rollover", "description"]) { const m = new RegExp(`\\b${k}\\s*=\\s*"([^"]*)"`).exec(c[1]); if (m && m[1].trim()) out.push({ kind: `order ${k}`, file: name, key: `${unesc(m[1])}@${nm}` }); }
        }
      } else if (/items\.xml$/i.test(rel)) {
        for (const c of s.matchAll(/<item\b([^>]*)>/g)) {
          for (const k of ["name", "description"]) { const m = new RegExp(`\\b${k}\\s*=\\s*"([^"]*)"`).exec(c[1]); if (m && m[1].trim()) out.push({ kind: `item ${k}`, file: name, key: unesc(m[1]) }); }
        }
      }
    }
  }
  return out;
}

module.exports = { entries, tableKeys, split, rewrite, fileText, scanKeys, unesc, esc };

// self-test: node tools/lib/mci-texts.js
if (require.main === module) {
  const assert = require("assert");
  const mod = entries('<t><translationtableentry text="Gaul Ship@ShipGaul class name" justtext="Gaul Ship" context="ShipGaul class name" result="Navío galo" comment=""/>\n<translationtableentry text="Long Bow Archer@editortree/Units/Gaul" justtext="x" context="" result="Arquero" comment="editortree"/>\n<translationtableentry text="Allows it@MGladiator Shows" justtext="Allows it" context="MGladiator Shows" result="Permite" comment=""/>\n<translationtableentry text="Multiplayer" result="Otro"/></t>');
  assert.deepStrictEqual(mod.map(e => e.key), ["Gaul Ship@ShipGaul class name", "Long Bow Archer@editortree/Units/Gaul", "Allows it@MGladiator Shows", "Multiplayer"]);
  const s = split(mod, new Map([["Multiplayer", "Varios jugadores"]]));
  assert.deepStrictEqual([s.fresh.length, s.same.length, s.override.length], [3, 0, 1]);
  const r = rewrite(s.fresh, { classes: new Map([["shipgaul", ["IgaShipGaul"]]]), commands: new Map([["mgladiator shows", ["MGladiator Shows Iimperial", "MGladiator Shows Irome"]]]) });
  assert.deepStrictEqual(r.log.map(l => l.to), [["Gaul Ship@IgaShipGaul class name"], ["Long Bow Archer@editortree/Units/Gaul"], ["Allows it@MGladiator Shows Iimperial", "Allows it@MGladiator Shows Irome"]]);
  assert(r.entries[0].includes('context="IgaShipGaul class name"') && r.entries[0].includes('text="Gaul Ship@IgaShipGaul class name"'));
  const back = entries(fileText(r.entries)); assert.strictEqual(back.length, 4); assert.strictEqual(back[0].key, "Gaul Ship@IgaShipGaul class name");
  console.log("mci-texts self-test ok");
}
