// A conquest of a port that shares a path with the game's or with another port's is renamed, as tagCollisions does with scenarios and adventures
// (the mod manager compares paths, not bytes; a mod must not replace the game's Mediterranean, both have to be in the menu):
//   renameConquests({ OUT, others, tag, label }) -> [{ from, to, folder }]
// A conquest is a Conquests/<name>.bfhp that says in its territories.xml which folder of ConquestMaps/ has its images (data="ConquestMaps/<folder>").
// Collides when Conquests/<name>.bfhp or ConquestMaps/<folder> exists in one of `others` (game folders and ported mods, whatever the bytes).
// Then:  <name> (<tag>).bfhp (and its picture, which shares the name), ConquestMaps/<folder> (<tag>), the data= in the territories.xml inside the
// .bfhp and in the folder, and the name of the conquest in the menu (game.xml) ends with "(<label>)". Written in place in the HPFS container: it
// has to fit the same pages; if the longer text crosses a page, the insignificant whitespace of the XML (the indentation, then the CR) is dropped until it fits;
// otherwise it is reported. NOTHING IS LOST SILENTLY: the container is padded to whole pages first (the game's own ends inside its last page, where the end of
// territories.xml lives: a renamed conquest lost "map>" of "</conquestmap>" and its last territory could not be selected), and every text written is read back,
// must be byte for byte what was meant, and territories.xml must end in </conquestmap>: anything else THROWS, so the build stops.
const fs = require("fs"), path = require("path");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());
const dataRe = /(\bdata\s*=\s*"ConquestMaps[\/\\])([^"]+)"/i;

// a failure to write what is meant (bytes lost, read back different) stops the build; only "does not fit the pages" is reported and the conquest is left as it was
const fatal = e => { if (/read back|past the end of the container/.test(e.message)) throw e; };

// text of an entry of the container -> the same entry with `text`, whitespace squeezed only if it crosses a page, then verified
function put(entry, text, what, page) {
  const pages = n => Math.ceil(n / page);
  let t = text;
  if (pages(t.length) > pages(entry.size)) t = t.replace(/\n[\t ]+/g, "\n");
  if (pages(t.length) > pages(entry.size)) t = t.replace(/\r\n/g, "\n");
  if (pages(t.length) !== pages(entry.size)) throw new Error(`${what}: ${t.length} bytes do not fit the ${pages(entry.size)} page(s) of ${entry.size}, even without indentation`);
  entry.write(Buffer.from(t, "latin1"));
  if (entry.read().toString("latin1") !== t) throw new Error(`${what}: what is read back is not what was written`);
  return t;
}

module.exports = function renameConquests({ OUT, others, tag, label }) {
  const hpfs = require("../hpfs.js"), done = [], problems = [];
  const taken = (rel) => others.some(o => { let p = o; for (const part of rel.split("/")) { const n = ci(p, part); if (!n) return false; p = path.join(p, n); } return true; });
  const cDir = ci(OUT, "Conquests"), mDir = ci(OUT, "ConquestMaps"); if (!cDir) return { done, problems };
  const folderNew = new Map();                                            // old folder (lowercase) -> new name
  for (const file of fs.readdirSync(path.join(OUT, cDir)).filter(f => /\.bfhp$/i.test(f))) {
    const bfhp = path.join(OUT, cDir, file), stem = path.basename(file, path.extname(file));
    let buf, ents; try { buf = hpfs.pad(fs.readFileSync(bfhp)); ents = hpfs(buf); } catch (e) { problems.push(`${file}: not read as HPFS (${e.message})`); continue; }
    const terr = ents.find(e => /^territories\.xml$/i.test(e.path)), folder = terr && (dataRe.exec(terr.read().toString("latin1")) || [])[2];
    const fileTaken = taken(`conquests/${file}`), folderTaken = folder && taken(`conquestmaps/${folder}`);
    if (!fileTaken && !folderTaken) continue;
    const newFolder = folderTaken ? `${folder} (${tag})` : folder;
    let dirty = false;
    if (folderTaken) {
      folderNew.set(folder.toLowerCase(), newFolder);
      try { put(terr, terr.read().toString("latin1").replace(dataRe, (_m, a) => `${a}${newFolder}"`), `${file}: territories.xml`, buf.readUInt32LE(4)); dirty = true; } catch (e) { fatal(e); problems.push(`${file}: territories.xml: ${e.message}`); }
    }
    const game = ents.find(e => /^game\.xml$/i.test(e.path));
    if (game && label) {
      const t = game.read().toString("latin1"), n = t.replace(/(<properties\b[\s\S]*?\bname\s*=\s*")([^"]*)"/, (m, a, v) => v.endsWith(`(${label})`) ? m : `${a}${v} (${label})"`);
      if (n !== t) try { put(game, n, `${file}: game.xml`, buf.readUInt32LE(4)); dirty = true; } catch (e) { fatal(e); problems.push(`${file}: game.xml name: ${e.message}`); }
    }
    if (dirty) {
      const back = (hpfs(buf).find(e => /^territories\.xml$/i.test(e.path)) || { read: () => Buffer.alloc(0) }).read().toString("latin1");
      if (!/<\/conquestmap>\s*$/.test(back)) throw new Error(`${file}: territories.xml does not end in </conquestmap> after the rename (it ends in ${JSON.stringify(back.slice(-24))}): the last territory could not be selected`);
      fs.rmSync(bfhp); fs.writeFileSync(bfhp, buf);
    }
    let to = file;
    if (fileTaken) {
      to = `${stem} (${tag})${path.extname(file)}`;
      for (const f of fs.readdirSync(path.join(OUT, cDir)).filter(f => path.basename(f, path.extname(f)).toLowerCase() === stem.toLowerCase())) {   // its picture and the like follow it
        fs.renameSync(path.join(OUT, cDir, f), path.join(OUT, cDir, `${stem} (${tag})${path.extname(f)}`));
      }
    }
    done.push({ from: file, to, folder: folderTaken ? `${folder} -> ${newFolder}` : folder });
  }
  if (mDir) for (const [old, nw] of folderNew) {
    const real = ci(path.join(OUT, mDir), old); if (!real) { problems.push(`ConquestMaps/${old}: no such folder in the port`); continue; }
    const dir = path.join(OUT, mDir, nw); fs.renameSync(path.join(OUT, mDir, real), dir);
    const t = ci(dir, "territories.xml");
    if (t) { const p = path.join(dir, t), s = fs.readFileSync(p, "latin1"); fs.rmSync(p); fs.writeFileSync(p, s.replace(dataRe, (_m, a) => `${a}${nw}"`), "latin1"); }
  }
  return { done, problems };
};
