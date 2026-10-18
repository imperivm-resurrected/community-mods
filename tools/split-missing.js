// Keep MODS.md for rows that can be ported (a live ✅, local 💾 or not-yet-confirmed ⚠️/❔ download) and move the
// rest (only dead ❌ links, or none) to MISSING.md. Works both ways, keeps sections and renumbers both files.
//   node tools/split-missing.js
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const MODS = path.join(ROOT, "MODS.md"), MISSING = path.join(ROOT, "MISSING.md");
const MISSING_HEAD = `# Mods with no working download

Rows from \`MODS.md\` whose download links are all dead, or that never had one. If you still have a copy of any of these,
open an issue or say it on the *Imperivm III Editores* Discord: the row goes back to \`MODS.md\` with the new link.
Same columns and legend as \`MODS.md\`.
`;

// file -> { head, order: [section], sections: { title: { header, rows: [cells] } } }
function parse(file, fallbackHead) {
  const doc = { head: fallbackHead, order: [], sections: {} };
  if (!fs.existsSync(file)) return doc;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const first = lines.findIndex(l => l.startsWith("## "));
  if (first > 0) doc.head = lines.slice(0, first).join("\n").trimEnd() + "\n";
  let cur = null;
  for (const l of lines.slice(first < 0 ? lines.length : first)) {
    if (l.startsWith("## ")) { cur = l.slice(3).trim(); doc.order.push(cur); doc.sections[cur] = { header: [], rows: [] }; continue; }
    if (!cur || !l.startsWith("|")) continue;
    const c = l.split("|");
    if (/^\s*\d+\s*$/.test(c[1])) doc.sections[cur].rows.push(c); else doc.sections[cur].header.push(l);
  }
  return doc;
}

function split() {
  const mods = parse(MODS, ""), missing = parse(MISSING, MISSING_HEAD);
  const order = [...mods.order, ...missing.order.filter(s => !mods.order.includes(s))];
  const out = { mods: {}, missing: {} };
  for (const s of order) {
    const header = (mods.sections[s] || missing.sections[s]).header;
    const col = header[0].split("|").findIndex(h => h.trim() === "Download");
    for (const r of [...(mods.sections[s]?.rows || []), ...(missing.sections[s]?.rows || [])]) {
      const to = /✅|💾|⚠️|❔/.test(r[col]) ? "mods" : "missing";
      (out[to][s] = out[to][s] || { header, rows: [] }).rows.push(r);
    }
  }
  const write = (file, head, secs) => {
    let n = 0;
    const body = order.filter(s => secs[s]).map(s => [`## ${s}`, "", ...secs[s].header,
      ...secs[s].rows.map(r => { r[1] = ` ${++n} `; return r.join("|"); }), ""].join("\n"));
    fs.writeFileSync(file, [head, ...body].join("\n"));
    return n;
  };
  const a = write(MODS, mods.head, out.mods), b = write(MISSING, missing.head, out.missing);
  console.log(`MODS.md: ${a} rows · MISSING.md: ${b} rows`);
}

module.exports = split;
if (require.main === module) split();
