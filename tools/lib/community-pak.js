// Unpacks a .pak the game reads (a file, or a member of an archive) with the SDK's extract-data.js, into a folder of its own, optionally only what matches a filter
// (extract-data.js: `node extract-data.js <game folder> <out> <pak> [filter]`, the filter is part of a path, case-insensitive). The scratch copies are deleted when done.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const walk = (d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const rmDir = d => fs.rmSync(d, { recursive: true, force: true });
// one pak, with a filter, into `out`. The pak is a file of its own (`pakFile`) or a member of an archive (`archive` + `member`, unpacked to a scratch folder that is deleted when done).
function extractPak({ pakFile, archive, member, SDK, SCRATCH, out, filter, pak }) {
  const g = path.join(SCRATCH, "cm-pak-" + path.basename(out)), tmp = path.join(SCRATCH, "cm-pak-x-" + path.basename(out));
  rmDir(g); rmDir(tmp); rmDir(out); fs.mkdirSync(path.join(g, "Packs"), { recursive: true });
  if (archive) {
    fs.mkdirSync(tmp, { recursive: true });
    const r = cp.spawnSync("bsdtar", ["-xf", archive, "-C", tmp, "--include", member], { stdio: "inherit" }); if (r.status) { console.error(`bsdtar could not read ${member} in ${archive}`); process.exit(1); }
    const found = walk(tmp).find(f => path.basename(f).toLowerCase() === path.basename(member).toLowerCase());
    if (!found) { console.error(`${member} is not in ${archive}`); process.exit(1); }
    fs.renameSync(found, path.join(g, "Packs", pak));
  } else fs.symlinkSync(path.resolve(pakFile), path.join(g, "Packs", pak));
  const r = cp.spawnSync("node", [path.join(SDK, "tools", "extract-data.js"), g, out, pak, ...(filter ? [filter] : [])], { encoding: "utf8" });
  rmDir(g); rmDir(tmp);
  if (r.status) { console.error(r.stderr || r.stdout); process.exit(1); }
  return out;
}
module.exports = { extractPak, walk, rmDir };
