// Checks of the Greek Civilization Mod 4.2 build that the shared libs do not do (tools/greek-4-2.js stops on `problems`). Own file: nothing shared is edited.
//
//   conquestData(OUT)  -> { list: [{ bfhp, data, territories }], problems }
//       for each Conquests/*.bfhp of the port: it must end in </conquestmap> (a renamed container that lost its last bytes made Germany unselectable, PR #56), name a
//       data= folder of the port that has global.bmp, territories.bmp, territories.xml, ShieldArrow.bmp and Shield<id>.bmp of EVERY <territory> of the .bfhp (the engine
//       reads them from the folder the .bfhp names; a renamed folder does not fall back to the game's, so a missing file is a map that does not show: Community's lacked 10),
//       and every territory's index must be a colour that territories.bmp really has (a territory with no region cannot be clicked: Greece on the game's map had none).
//   coverage({ OUT, HD, size }) -> { text, problems }
//       the conquest screen as shipped (HD's CONQUESTGAME.INI + the port's patch, HD's TEMPLATE.INI + the port's) at `size`: which share of each territory's pixels lies under
//       the right column (info frame, buttons) or the shields strip. A problem: the territory `Greece` has a pixel under any of them (HD's layout hid it), or a territory is
//       more covered than in HD's own layout.
const fs = require("fs"), path = require("path");
const hpfs = require("../hpfs.js"), menu = require("./caesar-menu.js");
const ci = (d, n) => d && fs.existsSync(d) ? fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase()) : undefined;
const at = (base, rel) => rel.split(/[\\/]/).filter(Boolean).reduce((p, s) => p && (ci(p, s) ? path.join(p, ci(p, s)) : null), base);

// the 8-bit BMP's pixels: Map(colour index -> [[x, y]...])
function pixels8(file) {
  const b = fs.readFileSync(file), off = b.readUInt32LE(10), w = b.readInt32LE(18), h = b.readInt32LE(22), bpp = b.readUInt16LE(28), H = Math.abs(h), st = Math.ceil(w * 8 / 32) * 4;
  if (bpp !== 8) throw new Error(`${path.basename(file)} is not an 8-bit bitmap`);
  const m = new Map();
  for (let y = 0; y < H; y++) { const row = off + (h > 0 ? H - 1 - y : y) * st; for (let x = 0; x < w; x++) { const v = b[row + x]; (m.get(v) || m.set(v, []).get(v)).push([x, y]); } }
  return { m, w, h: H };
}

// -> [{ bfhp, text, data, dir, territories: [{ id, index }] }]
function read(OUT) {
  const cdir = at(OUT, "Conquests"), out = [];
  for (const f of cdir ? fs.readdirSync(cdir).filter(x => /\.bfhp$/i.test(x)) : []) {
    let text = null, bad = null;
    try { const e = hpfs(fs.readFileSync(path.join(cdir, f))).find(x => /^territories\.xml$/i.test(x.path)); text = e ? e.read().toString("latin1") : null; } catch (err) { bad = err.message; }
    const data = text && (/<conquestmap\b[^>]*?\bdata\s*=\s*"([^"]+)"/i.exec(text) || [])[1];
    const territories = text ? [...text.matchAll(/<territory\b([^>]*)>/gi)].map(m => ({ id: (/\bid\s*=\s*"([^"]+)"/i.exec(m[1]) || [])[1], index: +(/\bindex\s*=\s*"(\d+)"/i.exec(m[1]) || [])[1] })) : [];
    out.push({ bfhp: f, text, bad, data, dir: data ? at(OUT, data) : null, territories });
  }
  return out;
}

function conquestData(OUT, greekIndex) {
  const problems = [], list = read(OUT);
  if (!list.length) problems.push("the port ships no conquest");
  for (const c of list) {
    const w = `Conquests/${c.bfhp}`;
    if (c.text === null) { problems.push(`${w}: ${c.bad ? "cannot be read (" + c.bad + ")" : "no territories.xml inside"}`); continue; }
    if (!/<\/conquestmap>\s*$/i.test(c.text)) problems.push(`${w}: territories.xml does not end in </conquestmap> (ends "${c.text.slice(-24).replace(/\s+/g, " ")}")`);
    if (!c.data) { problems.push(`${w}: its territories.xml has no data=`); continue; }
    if (!c.dir) { problems.push(`${w}: data="${c.data}" is not a folder of the port`); continue; }
    if (!c.territories.length) problems.push(`${w}: no <territory> in its territories.xml`);
    // the race of a conquest's player is the `interface` of its <territory>: the mod's Greece plays as the civilization `greek` (its index in civs/greek.json)
    const gi = /<territory\b[^>]*\bid\s*=\s*"Greece"[^>]*\binterface\s*=\s*"(-?\d+)"/i.exec(c.text);
    if (gi && greekIndex !== undefined && +gi[1] !== greekIndex) problems.push(`${w}: Greece has interface="${gi[1]}", the civilization greek is ${greekIndex}`);
    const need = ["global.bmp", "territories.bmp", "territories.xml", "ShieldArrow.bmp", ...c.territories.map(t => `Shield${t.id}.bmp`)], miss = need.filter(n => !ci(c.dir, n));
    if (miss.length) problems.push(`${c.data}: lacks ${miss.join(", ")}`);
    const fx = ci(c.dir, "territories.xml");
    if (fx) {                                          // the folder's own xml (fewer attributes) must list the territories that have a shield and an index; Greece may be only in the .bfhp
      const t = fs.readFileSync(path.join(c.dir, fx), "latin1"), ids = new Set([...t.matchAll(/<territory\b[^>]*?\bid\s*=\s*"([^"]+)"/gi)].map(m => m[1]));
      const extra = [...ids].filter(i => !c.territories.some(x => x.id === i));
      if (extra.length) problems.push(`${c.data}/${fx} names territories the .bfhp does not have: ${extra.join(", ")}`);
    }
    const tb = ci(c.dir, "territories.bmp");
    if (tb) {
      let px; try { px = pixels8(path.join(c.dir, tb)).m; } catch (e) { problems.push(`${c.data}/${tb}: ${e.message}`); continue; }
      const none = c.territories.filter(t => !(px.get(t.index) || []).length).map(t => `${t.id} (index ${t.index})`);
      if (none.length) problems.push(`${c.data}/${tb}: no pixels for ${none.join(", ")}: not clickable`);
    }
  }
  return { list: list.map(c => ({ bfhp: c.bfhp, data: c.data, territories: c.territories.length })), problems };
}

function coverage({ OUT, HD, size = [1920, 1080] }) {
  const problems = [], out = [], mine = f => { const p = at(OUT, `patches/menuini/${f}`); return p ? fs.readFileSync(p, "latin1") : ""; };
  const hdFile = f => fs.readFileSync(at(HD, `DATA/INTERFACE/MENU/${f}`), "latin1");
  const game = menu.apply(hdFile("CONQUESTGAME.INI"), mine("CONQUESTGAME.INI")), tmpl = menu.apply(hdFile("TEMPLATE.INI"), mine("TEMPLATE.INI"));
  const hdGame = hdFile("CONQUESTGAME.INI"), hdTmpl = hdFile("TEMPLATE.INI");
  const base = new Map(), BLOCK = /^(DescriptionFrame|Save|Start|Quit|Select|ShieldsFrame)$/i, bx = q => `x ${q[0]}..${q[0] + q[2]} y ${q[1]}..${q[1] + q[3]}`;
  for (const c of read(OUT)) {
    const tb = c.dir && ci(c.dir, "territories.bmp");
    if (!tb) continue;
    const { m } = pixels8(path.join(c.dir, tb));
    out.push(`### ${c.bfhp} (${c.data}) at ${size[0]}x${size[1]}`, "");
    for (const [label, g, t] of [["HD's layout", hdGame, hdTmpl], ["shipped", game, tmpl]]) {
      const r = menu.rects(g, t, "ConquestGame", size), map = r.rectOf("GameMap");
      const blockers = r.objs.filter(n => BLOCK.test(n)).map(n => [n, r.rectOf(n)]);
      const bad = blockers.filter(([, q]) => !q || q.error || q.length !== 4);
      if (bad.length) { problems.push(`${c.bfhp} (${label}): no rectangle for ${bad.map(([n, q]) => n + (q && q.error ? ` (${q.error})` : "")).join(", ")}`); continue; }
      out.push(`- **${label}**: map ${bx(map)}; ${blockers.map(([n, q]) => `${n} ${bx(q)}`).join("; ")}`);
      for (const tr of c.territories) {
        const pts = m.get(tr.index) || [];
        if (!pts.length) continue;
        const hit = pts.filter(([x, y]) => blockers.some(([, q]) => map[0] + x >= q[0] && map[0] + x < q[0] + q[2] && map[1] + y >= q[1] && map[1] + y < q[1] + q[3])).length;
        if (hit || tr.id === "Greece") out.push(`  - ${tr.id}: ${pts.length} px, covered ${hit} (${(100 * hit / pts.length).toFixed(1)}%)`);
        if (label === "shipped" && tr.id === "Greece" && hit) problems.push(`${c.bfhp}: ${hit} of ${pts.length} pixels of Greece lie under the conquest screen's panel at ${size.join("x")}`);
        // the shields strip is HD's (it covers Veneti of the Italian map in HD too); the patch must not make any territory worse than HD's own layout
        const k = c.bfhp + "|" + tr.id;
        if (label !== "shipped") base.set(k, hit);
        else if (hit > (base.get(k) || 0)) problems.push(`${c.bfhp}: ${tr.id} is more covered than in HD's layout (${hit} px against ${base.get(k) || 0}) at ${size.join("x")}`);
      }
    }
    out.push("");
  }
  return { text: out.join("\n"), problems };
}
module.exports = { conquestData, coverage, pixels8 };
