// radius / selection_radius of the classes of a port against the game's classes they come from.
//
// Why: the Greek classes of Caesar's pack (KgrWalls*, KgrGate*, KgrVillage) came from the 1.40 mod without `radius` / `selection_radius`; in HD EVERY wall and gate has them
// (8 per race). With two of them on a random map the AI map builder met a settlement without a main building (gbr.exe+3fffd, IsStrongholdSettlement <- SeedSettlementGaikas)
// and the game crashed (7 of 9 games with two kgreece; 0 of 7 with the radii put in: maintainer's test of 2026-11-02, overlays V1..V4).
//
// The HD class a class comes from, in this order:
//   1. COUNTERPART[id]: a class HD does not have under the name of the alias (see below)
//   2. the key of the alias in civs/<civ>.json (`"RWallsN": "KreWallsN"`, `"MWallsN": "KgrWallsN"`): the clone tool's own record of what it cloned
// A class with no HD counterpart (the mod's own: KgrAgora...) is not checked.
const fs = require("fs"), path = require("path");

// KgrVillage: the alias key is MVillage, which HD does not have: the game's Imperial Roman villages are built from RVillage (the 4.2 and the 1.8 copied its two lines too)
// KgrOutpost: the alias key is MOutpost, which HD does not have either; every outpost in HD has 345/350 (ROutpost is the Imperial Roman one) and so have the 4.2's HOutpost and CGWAR's CgrOutpost
// KgrTower: MTower is in HD and has no radius (no tower has one): nothing to copy
const COUNTERPART = { KgrVillage: "RVillage", KgrOutpost: "ROutpost" };

const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else if (/\.xml$/i.test(e.name)) out.push(p); } return out; };

// every <class ...> of a folder: id -> { file, start, end, block }
function classesOf(dir) {
  const map = new Map();
  for (const file of walk(dir)) {
    const text = fs.readFileSync(file, "latin1");
    const starts = [...text.matchAll(/<class\b/g)].map(m => m.index);
    starts.forEach((s, i) => {
      const end = i + 1 < starts.length ? starts[i + 1] : text.length, block = text.slice(s, end), id = (/\bid\s*=\s*"([^"]+)"/i.exec(block.slice(0, block.indexOf(">") + 1)) || [])[1];
      if (id && !map.has(id.toLowerCase())) map.set(id.toLowerCase(), { id, file, block });
    });
  }
  return map;
}

// the values the class ends up with: the last radius and the last selection_radius of its <properties> (HD's RVillage has two lines; the second wins)
function radiusOf(block) {
  const last = re => { let v = null; for (const m of block.matchAll(re)) v = m[1]; return v; };
  return { radius: last(/(?<![\w])radius\s*=\s*"(\d+)"/g), selection: last(/\bselection_radius\s*=\s*"(\d+)"/g) };
}

// the radius lines of a class, as written in the file (so a village keeps both of RVillage's)
function radiusLines(block) {
  const out = [];
  for (const m of block.matchAll(/<properties\b[^>]*?\bradius\s*=\s*"\d+"[^>]*?\/>/g)) { const t = m[0]; if (/(?<![\w])radius\s*=/.test(t) || /selection_radius/.test(t)) out.push(m[0].replace(/\s+/g, " ")); }
  return out;
}

// -> [{ id, file, hdId, hdFile, hd: {radius, selection}, mine, lines }] for each class that lacks a radius or a selection_radius its HD counterpart has
function missing({ portClasses, hdClasses, civsDir }) {
  const aliasOf = new Map();                                                     // port class id (lowercase) -> HD class id
  if (civsDir && fs.existsSync(civsDir)) for (const f of fs.readdirSync(civsDir).filter(f => /\.json$/i.test(f))) {
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(civsDir, f), "utf8")); } catch (e) { throw new Error(`civs/${f}: not valid JSON (${e.message})`); }
    for (const [hd, mine] of Object.entries((j.alias && j.alias.classes) || {})) if (typeof mine === "string") aliasOf.set(mine.toLowerCase(), hd);
  }
  const out = [];
  for (const [key, c] of portClasses) {
    const hdId = COUNTERPART[c.id] || aliasOf.get(key); if (!hdId) continue;
    const hd = hdClasses.get(hdId.toLowerCase()); if (!hd) continue;
    const want = radiusOf(hd.block), mine = radiusOf(c.block);
    if ((want.radius && !mine.radius) || (want.selection && !mine.selection)) out.push({ id: c.id, file: c.file, hdId: hd.id, hdFile: hd.file, hd: want, mine, lines: radiusLines(hd.block) });
  }
  return out;
}

// puts the radius lines of the HD class into the class file, after the `<properties race=... />` line (or after the <class> line), only for what is missing
function fix(problems) {
  const done = [];
  for (const p of problems) {
    let text = fs.readFileSync(p.file, "latin1");
    const nl = text.includes("\r\n") ? "\r\n" : "\n", at = text.search(new RegExp(`<class\\b[^>]*\\bid\\s*=\\s*"${p.id}"`, "i")); if (at < 0) continue;
    const lines = p.lines.filter(l => (/(?<![\w])radius\s*=/.test(l) && !p.mine.radius) || (/selection_radius/.test(l) && !p.mine.selection));
    // after the `<properties race=... />` line of the class; a class without one (KgaArena2) gets them right after its <class ...> tag, with the indentation of the next line
    const rest = text.slice(at), race = /^([ \t]*)<properties race="[^"]*"\s*\/>[ \t]*\r?\n/m.exec(rest), open = /<class\b[^>]*>[ \t]*\r?\n?/.exec(rest);
    let indent, pos;
    if (race && race.index < (rest.indexOf("</class>") < 0 ? rest.length : rest.indexOf("</class>"))) { indent = race[1]; pos = at + race.index + race[0].length; }
    else { const next = /^([ \t]+)\S/m.exec(rest.slice(open.index + open[0].length)); indent = next ? next[1] : "\t"; pos = at + open.index + open[0].length; if (!/\n$/.test(open[0])) throw new Error(`${path.basename(p.file)}: the <class> tag of ${p.id} is not followed by a line break`); }
    const put = lines.map(l => indent + l).join(nl) + nl;
    fs.writeFileSync(p.file, text.slice(0, pos) + put + text.slice(pos), "latin1");
    done.push(`${p.id} <- ${p.hdId}: ${p.lines.map(l => /radius="(\d+)" selection_radius="(\d+)"/.exec(l)).filter(Boolean).map(m => m[1] + "/" + m[2]).join(" then ")}`);
  }
  return done;
}

module.exports = { classesOf, radiusOf, missing, fix, COUNTERPART };

if (require.main === module) {      // read-only: node tools/lib/caesar-radius.js <port folder> <HD DATA/CLASSES folder>
  const [port, hd] = process.argv.slice(2);
  if (!port || !hd) { console.error("usage: node tools/lib/caesar-radius.js <port folder> <the game's DATA/CLASSES folder>"); process.exit(1); }
  const m = missing({ portClasses: classesOf(path.join(port, "DATA/CLASSES")), hdClasses: classesOf(hd), civsDir: path.join(port, "civs") });
  for (const p of m) console.log(`${p.id}: no radius, HD's ${p.hdId} has ${p.hd.radius}/${p.hd.selection}`);
  console.log(`${m.length} classes`); process.exit(m.length ? 1 : 0);
}
