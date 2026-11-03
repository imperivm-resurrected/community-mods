#!/usr/bin/env node
// Checks the conquests (Conquests/*.bfhp) of ports or installed mods: the territories.xml inside each one must be whole.
//   node tools/check-conquests.js <dir>...     a pack (it has Conquests/) or a folder of packs (ported/, <game>/mods/); exit 1 if any conquest is damaged
//   node tools/check-conquests.js --self-test  builds a container that ends inside its last page, renames a conquest with tools/lib/conquests.js and checks it
// Damaged = the file does not end in </conquestmap> (a rename used to cut it: "</conques" + NUL bytes, and the engine could not finish the LAST territory, so
// that one could not be selected), has NUL bytes, or has a <territory that is not closed.
const fs = require("fs"), path = require("path"), os = require("os");
const hpfs = require("./hpfs.js");
const ci = (d, n) => fs.existsSync(d) && fs.readdirSync(d).find(f => f.toLowerCase() === n.toLowerCase());

// -> [] if whole, else the reasons
function problems(xml) {
  const out = [], t = xml.toString("latin1");
  if (t.includes("\0")) out.push(`NUL bytes from ${t.indexOf("\0")}`);
  if (!/<\/conquestmap>\s*$/.test(t.replace(/\0+$/, "")) || /\0/.test(t)) out.push(`ends in ${JSON.stringify(t.replace(/\0/g, "\\0").slice(-24))}, not </conquestmap>`);
  const opened = (t.match(/<territory\b/g) || []).length, closed = (t.match(/<territory\b[^>]*\/>/g) || []).length;
  if (opened !== closed) out.push(`${opened} <territory but ${closed} closed`);
  return out;
}

function packsOf(dir) { return ci(dir, "Conquests") ? [dir] : fs.existsSync(dir) ? fs.readdirSync(dir).map(d => path.join(dir, d)).filter(d => fs.statSync(d).isDirectory() && ci(d, "Conquests")) : []; }

function scan(dirs) {
  const rows = [];
  for (const dir of dirs) for (const pack of packsOf(dir)) {
    const cd = path.join(pack, ci(pack, "Conquests"));
    for (const f of fs.readdirSync(cd).filter(f => /\.bfhp$/i.test(f))) {
      let t; try { t = hpfs(fs.readFileSync(path.join(cd, f))).find(e => /^territories\.xml$/i.test(e.path)); } catch (e) { rows.push({ pack, f, bad: [`not read: ${e.message}`] }); continue; }
      rows.push({ pack, f, bad: t ? problems(t.read()) : ["no territories.xml"] });
    }
  }
  return rows;
}

// A container whose last file ends inside its last page, like the game's own: 512-byte pages, files with their data pages after a root page (len, depth, page numbers)
function synthetic(xml, game) {
  const P = 512, pages = [], page = () => { pages.push(Buffer.alloc(P)); return pages.length - 1; };
  const file = data => { const root = page(), n = Math.ceil(data.length / P), ids = []; for (let i = 0; i < n; i++) ids.push(page()); pages[root].writeUInt32LE(data.length, 0); pages[root].writeUInt16LE(0, 4); ids.forEach((id, i) => pages[root].writeUInt32LE(id, 8 + i * 4)); ids.forEach((id, i) => data.copy(pages[id], 0, i * P, Math.min(data.length, (i + 1) * P))); return root; };
  const head = page(), entry = (h, name) => { const b = Buffer.alloc(8 + name.length); b.writeUInt32LE(h, 0); b.writeUInt16LE(0, 4); b.writeUInt16LE(name.length, 6); b.write(name, 8, "latin1"); return b; };
  const dirRoot = page(), dirData = page();                                                                  // the directory first, territories.xml last: its last page is the end of the file
  const g = file(Buffer.from(game, "latin1")), x = file(Buffer.from(xml, "latin1"));
  const dir = Buffer.concat([entry(g, "game.xml"), entry(x, "territories.xml"), Buffer.alloc(8)]);
  pages[dirRoot].writeUInt32LE(dir.length, 0); pages[dirRoot].writeUInt16LE(0, 4); pages[dirRoot].writeUInt32LE(dirData, 8); dir.copy(pages[dirData]);
  pages[head].write("HPFS", 0, "latin1"); pages[head].writeUInt32LE(P, 4); pages[head].writeUInt32LE(dirRoot, 0x1c);
  const all = Buffer.concat(pages); return all.subarray(0, all.length - (P - (xml.length % P || P)));              // cut inside the last page
}

function selfTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "conquests-"));
  try {
    const mk = (root, folder) => { for (const d of ["Conquests", `ConquestMaps/${folder}`]) fs.mkdirSync(path.join(root, d), { recursive: true }); };
    const xml = `\t<conquestmap\r\n\t\tname="T"\r\n\t\tdata="ConquestMaps/Folder"\r\n\t\tinterface="-1">\r\n\t\t<territory\r\n\t\t\tid="A"\r\n\t\t\tindex="2"\r\n\t\t\tstate="1"\r\n\t\t\tdescription="${"x".repeat(430)}"\r\n\t\t\tinterface="0"/>\r\n\t\t<territory\r\n\t\t\tid="Last"\r\n\t\t\tindex="3"\r\n\t\t\tstate="1"\r\n\t\t\tinterface="1"/>\r\n\t</conquestmap>\r\n`;
    const game = `\t<game>\r\n\t\t<properties\r\n\t\t\tname="Forge"\r\n\t\t\tuser_interface="1"/>\r\n\t</game>\r\n`;
    const c = synthetic(xml, game);
    if (c.length % 512 === 0) throw new Error("self-test: the container must end inside its last page");
    const old = hpfs(Buffer.from(c)).find(e => e.path === "territories.xml").read().toString("latin1");
    if (old !== xml) throw new Error("self-test: the synthetic container does not read back");
    // what the tool used to do: a longer text written into a container that ends inside its page loses its end
    const raw = Buffer.from(c); let lost = false;
    try { hpfs(raw).find(e => e.path === "territories.xml").write(Buffer.from(xml.replace("Folder", "Folder (tag)"), "latin1")); } catch (e) { lost = /past the end/.test(e.message); if (!lost) console.error(e.message); }
    if (!lost) throw new Error("self-test: hpfs.js write must refuse a page past the end of the container");
    mk(path.join(tmp, "game"), "Folder"); mk(path.join(tmp, "out"), "Folder");
    fs.writeFileSync(path.join(tmp, "out/Conquests/T.bfhp"), c); fs.writeFileSync(path.join(tmp, "game/Conquests/T.bfhp"), c);
    const r = require("./lib/conquests.js")({ OUT: path.join(tmp, "out"), others: [path.join(tmp, "game")], tag: "tag", label: "Lab" });
    if (r.problems.length || r.done.length !== 1) throw new Error(`self-test: rename gave ${JSON.stringify(r)}`);
    const back = hpfs(fs.readFileSync(path.join(tmp, "out/Conquests/T (tag).bfhp")));
    const t = back.find(e => e.path === "territories.xml").read().toString("latin1"), g = back.find(e => e.path === "game.xml").read().toString("latin1");
    if (t !== xml.replace("ConquestMaps/Folder", "ConquestMaps/Folder (tag)")) throw new Error(`self-test: territories.xml is not what was meant: ${JSON.stringify(t.slice(-40))}`);
    if (!g.includes('name="Forge (Lab)"')) throw new Error("self-test: the name in game.xml was not changed");
    const bad = problems(Buffer.from(xml.slice(0, -6) + "\0".repeat(6), "latin1"));
    if (!bad.length) throw new Error("self-test: a cut territories.xml must be reported");
    if (problems(Buffer.from(t, "latin1")).length) throw new Error("self-test: a whole territories.xml was reported");
    console.log("self-test ok: the rename keeps </conquestmap>, the write that would lose bytes throws, a cut file is reported");
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) { try { selfTest(); } catch (e) { console.error(e.message); process.exit(1); } process.exit(0); }
  if (!args.length) { console.error("usage: node tools/check-conquests.js <dir>... | --self-test"); process.exit(1); }
  const rows = scan(args);
  for (const r of rows) console.log(`${r.bad.length ? "DAMAGED" : "ok     "}  ${path.basename(r.pack)} / ${r.f}${r.bad.length ? "  " + r.bad.join("; ") : ""}`);
  console.log(`${rows.length} conquests, ${rows.filter(r => r.bad.length).length} damaged`);
  process.exit(rows.some(r => r.bad.length) ? 1 : 0);
}
module.exports = { problems, scan, selfTest };
