// Clones the game's civilizations into a port as civilizations of their own, with what a mod changed in them (AGENTS.md, "Civilizations are
// independent"). Used by tools/greek-1-8-civs.js and tools/greek-4-2-civs.js; the configuration says where the merged classes are:
//   cloneCivs({ PORT, MERGED, SUFFIX, LABEL, CIVS, cloneAllOrders, want })
// MERGED holds what the mod did to the game's own classes and commands (classes/, commands/, base-changes.json): HD plus its changes.
// For each civilization of CIVS:
//   1. the SDK's clone-civilization.js clones it from HD, starting from the mod's version of its classes and of the command files that
//      are its alone (stats, costs, specials)
//   2. what the mod changed in the base classes it inherits (Ranged, Hero, Catapult...) is written inside each copy
//   3. behavior scripts the civ says to drop (a choice of branch), scripts the mod never shipped, "Hero<unit>" classes (Hero<letter><unit>)
//   4. the copies go into the port: classes, commands, patches that add the copy to shared commands (merged with the port's own)
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process"), { hiddenBy } = require("./branch.js");
const ROOT = path.join(__dirname, "..", "..");
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); }   // rm first: the file may be a hard link to the pristine copy;
const classOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1];
const parentAttr = s => (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1];
const files = (d, re) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isFile() && re.test(e.name)).map(e => e.name) : [];
const walk = (d, base = d, out = []) => { if (!fs.existsSync(d)) return out; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); } return out; };
const ci = (d, name) => fs.readdirSync(d).find(f => f.toLowerCase() === name.toLowerCase());
const norm = s => s.replace(/\s+/g, " ").trim();
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.error(`${f}: ${e.message}`); process.exit(1); } };

const HD = path.join(ROOT, "originals", "game-data", "DATA"), SDK = process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk");
const DROP_BEHAVIOR = /_Enable_Or_Disable_Cmd\.vs$/i, NEVER = /(?!)/;

module.exports = function cloneCivs({ PORT, MERGED, SUFFIX, LABEL, CIVS, cloneAllOrders = false, want = [] }) {
  if (!fs.existsSync(MERGED)) { console.error("run the mod's own step first (it fills " + MERGED + ")"); process.exit(1); }
  const BASE_CHANGES = new Map(Object.entries(readJson(path.join(MERGED, "base-changes.json"))));
  const HD_CLASSES = path.join(HD, ci(HD, "classes")), HD_COMMANDS = path.join(HD, ci(HD, "commands"));
  const PORT_CLASSES = path.join(PORT, "DATA", "CLASSES");
  const hdScripts = new Set([...walk(HD), ...walk(PORT)].map(f => f.toLowerCase()));
  // every class of the mod's version (what the mod changed of the game's, and its own new ones): id -> text, race, parent
  const table = new Map();
  for (const dir of [path.join(MERGED, "classes"), PORT_CLASSES]) for (const f of files(dir, /\.sc\.xml$/i)) {
    const t = rd(path.join(dir, f)), id = classOf(t); if (!id || table.has(id)) continue;
    table.set(id, { text: t, race: (t.match(/<properties\b[^>]*\brace\s*=\s*"([^"]+)"/) || [])[1], parent: parentAttr(t), file: path.join(dir, f) });
  }

  for (const civ of CIVS.filter(c => !want.length || want.includes(c.id))) {
    const bl = civ.baseLetter, Id = civ.id[0].toUpperCase() + civ.id.slice(1);
    const OWN = new RegExp(`^(${bl}[A-Z]|${bl}house|${civ.hero}$)`);
    const report = [];
    // classes of the civilization that do not start with its letter (the mod's Mauritanian hero, MPrinciple, Ancient Roman hero...): the clone
    // tool only takes the base's letter, so they are renamed <letter><id> in the stage, and their children (no race of their own) follow
    const skipExtra = new RegExp(`^Hero[A-Z]${civ.skipExtra ? "|" + civ.skipExtra.source : ""}`);   // the editor heroes have their own step
    const extraIds = new Set();
    for (const [id, c] of table) if (c.race === civ.base && !OWN.test(id) && !skipExtra.test(id)) extraIds.add(id);
    for (let grew = true; grew;) { grew = false; for (const [id, c] of table) if (!OWN.test(id) && !extraIds.has(id) && !c.race && c.parent && (OWN.test(c.parent) || extraIds.has(c.parent)) && !skipExtra.test(id)) { extraIds.add(id); grew = true; } }
    const extraNew = new Map([...extraIds].map(id => [id, `${bl}${id}`]));
    const isOwn = id => OWN.test(id) || extraIds.has(id);
    const extraRe = extraNew.size ? new RegExp(`(?<![A-Za-z0-9_/\\\\.])(${[...extraNew.keys()].sort((a, b) => b.length - a.length).join("|")})(?![A-Za-z0-9_/\\\\.])`, "g") : null;   // not inside a path
    const ren = t => extraRe ? t.replace(extraRe, m => extraNew.get(m)) : t;
    // 1. the staged DATA: HD's classes and commands with the mod's version of the civilization's own over them
    const stage = fs.mkdtempSync(path.join(os.tmpdir(), `civ-${civ.id}-`)), SC = path.join(stage, "CLASSES"), SM = path.join(stage, "COMMANDS");
    fs.mkdirSync(SC); fs.mkdirSync(SM);
    for (const f of files(HD_CLASSES, /\.sc\.xml$/i)) fs.copyFileSync(path.join(HD_CLASSES, f), path.join(SC, f));
    for (const f of files(HD_COMMANDS, /\.xml$/i)) fs.copyFileSync(path.join(HD_COMMANDS, f), path.join(SM, f));
    const stripBehavior = s => s.replace(/^[ \t]*<behavior\b[^>]*\bscript\s*=\s*"([^"]+)"[^>]*\/>[ \t]*\r?\n?/gim, (m, v) => (!civ.keepBehaviors || civ.branch) && DROP_BEHAVIOR.test(v) ? "" : m);
    let overlaid = 0;
    for (const [id, c] of table) {
      if (!isOwn(id)) continue;
      const nid = extraNew.get(id) || id;
      wr(path.join(SC, `${nid.toUpperCase()}.SC.XML`), ren(stripBehavior(c.text))); overlaid++;
      if (!extraNew.has(id)) { const hdf = ci(SC, path.basename(c.file)); if (hdf && hdf.toUpperCase() !== `${nid.toUpperCase()}.SC.XML`) fs.rmSync(path.join(SC, hdf), { force: true }); }
    }
    const dropCmds = s => s.replace(/<cmd\b[^>]*?\bname\s*=\s*"([^"]*)"[\s\S]*?<\/cmd>[ \t]*\r?\n?/g, (m, n) => (civ.dropCmd || NEVER).test(n) ? (report.push(`command ${n} (Rome branch) not ported`), "") : m);
    // the merged command files that are the civilization's alone (every source is one of its classes): its barracks, temples...
    const ownCmds = [];
    for (const f of files(path.join(MERGED, "commands"), /\.xml$/i)) {
      const t = rd(path.join(MERGED, "commands", f)), srcs = [...t.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(m => m[1]);
      if (/SCELTA/i.test(f)) continue;                                      // RHT_SCELTA_ROMA: the Rome branch choice, not ported
      if (srcs.length && srcs.every(isOwn)) { wr(path.join(SM, ci(SM, f) || f), ren(dropCmds(t))); ownCmds.push(f); }
    }
    // the commands of the shared files (ARENA, BLACKSMITH, TEMPLE, TAVERN...) the mod changed or added for this civilization's classes:
    // the mod's version of each replaces HD's in the stage, a new one is appended (the clone only keeps the sources that are the civilization's)
    const mask = t => t.replace(/<!--[\s\S]*?-->/g, m => " ".repeat(m.length));
    const cmdRe = /<cmd\b[^>]*?\bname\s*=\s*"([^"]*)"[\s\S]*?<\/cmd>/g;
    let replaced = 0, appended = [];
    for (const f of files(path.join(MERGED, "commands"), /\.xml$/i)) {
      if (ownCmds.includes(f) || /SCELTA/i.test(f)) continue;
      const mt = mask(rd(path.join(MERGED, "commands", f))), mo = rd(path.join(MERGED, "commands", f));
      for (const m of mt.matchAll(cmdRe)) {
        const text = ren(mo.slice(m.index, m.index + m[0].length)), srcs = [...m[0].matchAll(/<src\s+obj\s*=\s*"([^"]*)"/g)].map(x => x[1]);
        if (!srcs.some(isOwn) || (civ.dropCmd || NEVER).test(m[1])) continue;
        let done = false;
        for (const sf of files(SM, /\.xml$/i)) {
          const st = rd(path.join(SM, sf)), sm = mask(st);
          for (const h of sm.matchAll(cmdRe)) if (h[1] === m[1]) { wr(path.join(SM, sf), st.slice(0, h.index) + text + st.slice(h.index + h[0].length)); done = true; replaced++; break; }
          if (done) break;
        }
        if (!done) appended.push(text);
      }
    }
    if (appended.length) wr(path.join(SM, "MODCMDS.XML"), `<commands>\n${appended.join("\n\n")}\n</commands>\n`);
    console.log(`${civ.id}: ${overlaid} classes, ${ownCmds.join(", ") || "no command files"}, ${replaced} commands replaced and ${appended.length} added in the shared ones, from the mod over HD's`);

    // the mod's "Imperivm 2" game mode (old school costs) is a game mode, not a civilization's: its copies of the orders ("ReqModeImp2") are not
    // in the civilization, and the orders that only show outside the mode ("NReqModeImp2, , ,") lose that prefix of their parameter
    {
      let gone = 0, plain = 0;
      for (const sf of files(SM, /\.xml$/i)) {
        const st = rd(path.join(SM, sf)), sm = mask(st); let o = "", at = 0;
        for (const h of sm.matchAll(cmdRe)) if (/(?<!N)ReqModeImp2/.test(h[0])) { o += st.slice(at, h.index); at = h.index + h[0].length; gone++; }
        o += st.slice(at);
        const t = o.replace(/(\bparam\s*=\s*")NReqModeImp2\s*,\s*,\s*,\s*/g, (m, a) => { plain++; return a; });
        if (t !== st) wr(path.join(SM, sf), t);
      }
      if (gone || plain) console.log(`${civ.id}: ${gone} orders of the old-school mode left out, ${plain} lose its prefix`);
    }
    // a branch of the mod (Imperial Rome, Mauritanian Carthage): what its branch scripts would hide at the start is not in its commands, and
    // the hire order of its own hero takes the name the game asks for (hirehero<letter>)
    if (civ.branch) {
      const hidden = new Set();
      for (const f of files(path.join(PORT, "DATA", "SUBAI"), civ.branch.scripts)) {
        const r = hiddenBy(rd(path.join(PORT, "DATA", "SUBAI", f)), { researched: [civ.branch.flag] });
        for (const n of r.disabled) hidden.add(n);
      }
      let gone = 0;
      for (const sf of files(SM, /\.xml$/i)) {
        const st = rd(path.join(SM, sf)), sm = mask(st); let o = "", at = 0;
        for (const h of sm.matchAll(cmdRe)) if (hidden.has(h[1])) { o += st.slice(at, h.index); at = h.index + h[0].length; gone++; }
        if (at) wr(path.join(SM, sf), o + st.slice(at));
      }
      if (civ.branch.hire) {                                       // { cmd: "hireheroRImperial", hero: "ImperialRomanHero" }
        const hero = extraNew.get(civ.branch.hire.hero) || civ.branch.hire.hero; let done = false;
        for (const sf of files(SM, /\.xml$/i)) {
          const st = rd(path.join(SM, sf)), sm = mask(st);
          for (const h of sm.matchAll(cmdRe)) if (h[1] === civ.branch.hire.cmd) {
            const t = st.slice(h.index, h.index + h[0].length).replace(/(\bname\s*=\s*")[^"]*"/, `$1hirehero${bl}"`).replace(/(\bparam\s*=\s*")[^"]*"/, `$1${hero}"`);
            wr(path.join(SM, sf), st.slice(0, h.index) + t + st.slice(h.index + h[0].length)); done = true; break;
          }
          if (done) break;
        }
        if (!done) report.push(`hire command ${civ.branch.hire.cmd} not found`);
      }
      console.log(`${civ.id}: branch ${civ.branch.flag}: ${gone} commands its scripts hide at the start are not in it`);
    }
    // clone it
    const out = fs.mkdtempSync(path.join(os.tmpdir(), `clone-${civ.id}-`));
    const r = cp.spawnSync("node", [path.join(SDK, "tools", "clone-civilization.js"), stage, out, civ.id, civ.letter, civ.base, String(civ.index), ...(cloneAllOrders ? ["--all-orders"] : [])], { encoding: "utf8" });
    if (r.status) { console.error(r.stdout + r.stderr); process.exit(1); }
    console.log(r.stdout.trim());
    const json = readJson(path.join(out, "civs", `${civ.id}.json`));
    const rename = new Map(Object.entries(json.alias.classes));            // old id -> new id
    const OLD = new Map([...rename].map(([o, n]) => [n.toLowerCase(), o]));

    // 2. base-class changes of the 1.8, inside each copy (the farthest ancestor first, the nearest wins). The copy's own parent, when it is
    // a copy too, has them already
    const parentOf = new Map();
    for (const f of files(SC, /\.sc\.xml$/i)) { const s = rd(path.join(SC, f)), id = classOf(s); if (id) parentOf.set(id.toLowerCase(), parentAttr(s)); }
    const inherited = id => { const o = []; for (let p = parentOf.has(id.toLowerCase()) ? parentOf.get(id.toLowerCase()) : parentOf.get((OLD.get(id.toLowerCase()) || "").toLowerCase()); p && o.length < 20; p = parentOf.get(p.toLowerCase())) { if (rename.has(p)) break; o.push(p.toLowerCase()); } return o; };
    const decorate = (s, from) => {
      const extra = [];
      for (const b of inherited(from).reverse()) for (const e of BASE_CHANGES.get(b) || []) if (!s.includes(norm(e)) && !extra.includes(e)) extra.push(e);
      return extra.length ? [s.replace(/(<class\b[^>]*>)/, `$1\n\t<!-- changes the ${SUFFIX} made to its base classes -->\n\t${extra.join("\n\t")}`), extra.length] : [s, 0];
    };
    // 3. the mod's Hero<unit> classes (unmounted heroes for the editor): Hero<letter><unit>
    const heroes = [];
    for (const f of files(PORT_CLASSES, /^hero.*\.sc\.xml$/i)) {
      const s = rd(path.join(PORT_CLASSES, f)), id = classOf(s);
      if (!id || !new RegExp(`^Hero${bl}[A-Z]`).test(id)) continue;
      const nid = `Hero${civ.letter}${id.slice(5)}`;
      wr(path.join(out, "data", "classes", `${nid}.sc.xml`), s.replace(/(<class\b[^>]*?\bid\s*=\s*")[^"]+"/, `$1${nid}"`).replace(/\s+altid\s*=\s*"[^"]*"/, "").replace(/\brace\s*=\s*"[^"]+"/, `race="${Id}"`));
      parentOf.set(nid.toLowerCase(), parentAttr(s)); OLD.set(nid.toLowerCase(), id); heroes.push(path.join(PORT_CLASSES, f));
    }
    let inlined = 0, gone = 0;
    const classFiles = files(path.join(out, "data", "classes"), /\.sc\.xml$/i);
    for (const f of classFiles) {
      const p = path.join(out, "data", "classes", f); let s = rd(p);
      const nid = classOf(s), [t, n] = decorate(s, nid); s = t; inlined += n;
      // a script neither the mod nor the game has (the 1.8 never shipped them): the game could not run it
      s = s.replace(/^[ \t]*<(behavior|method)\b[^>]*?\b(?:script|vs)\s*=\s*"(data\/[^"]+\.vs)"[^>]*\/>[ \t]*\r?\n?/gim, (m, _t, v) => hdScripts.has(v.toLowerCase()) ? m : (gone++, ""));
      // behavior scripts: a branch civilization has none of the branch switches; the others keep theirs, with the names of its orders
      s = s.replace(/^([ \t]*)<behavior\b([^>]*?)\bscript\s*=\s*"data\/subai\/([^"]+\.vs)"([^>]*)\/>[ \t]*\r?\n?/gim, (m, ind, a, name, b) => {
        if (civ.branch && (DROP_BEHAVIOR.test(name) || /_captured_by_ai\.vs$/i.test(name))) return "";   // a captured town hall picked the branch for the AI
        const src = path.join(PORT, "DATA", "SUBAI", ci(path.join(PORT, "DATA", "SUBAI"), name) || name);
        if (!fs.existsSync(src)) return m;
        const text = rd(src); let mapped = text;
        for (const [oldName, newName] of Object.entries(json.alias.commands || {})) mapped = mapped.split(`"${oldName}"`).join(`"${newName}"`);
        if (mapped === text) return m;
        const copy = name.replace(/\.vs$/i, `_${civ.id}.vs`);
        wr(path.join(PORT, "DATA", "SUBAI", copy.toUpperCase()), mapped);
        return `${ind}<behavior${a}script="data/subai/${copy}"${b}/>\n`;
      });
      // race of the hero children that name the base's race by id
      wr(path.join(PORT_CLASSES, `${nid.toUpperCase()}.SC.XML`), s);
    }
    console.log(`${classFiles.length} classes (${heroes.length} editor heroes), ${inlined} base-class elements inside them, ${gone} references to missing scripts removed`);
    // the mod's own copies of what is cloned now go
    for (const f of heroes) fs.rmSync(f);
    for (const id of extraIds) { const c = table.get(id); if (c) { const hit = ci(PORT_CLASSES, path.basename(c.file)); if (hit) fs.rmSync(path.join(PORT_CLASSES, hit), { force: true }); } }
    for (const [o] of rename) { const hit = ci(PORT_CLASSES, `${o}.SC.XML`); if (hit) { const id = classOf(rd(path.join(PORT_CLASSES, hit))); if (id === o) fs.rmSync(path.join(PORT_CLASSES, hit)); } }

    // the mod's own new classes that its maps place (RVillager_Apollonia...): the maps name the copies
    {
      const hdIds = new Set(files(HD_CLASSES, /\.sc\.xml$/i).map(f => (classOf(rd(path.join(HD_CLASSES, f))) || "").toLowerCase()));
      const origOf = n => { for (const [id, st] of extraNew) if (st === n) return id; return n; };
      const fresh = [...rename].map(([o, n]) => [origOf(o), n]).filter(([o]) => !hdIds.has(o.toLowerCase()));
      if (fresh.length) {
        const hpfs = require("../hpfs.js"), re = new RegExp(`(?<![A-Za-z0-9])(${fresh.map(([o]) => o).join("|")})(?![A-Za-z0-9])`, "g"), to = Object.fromEntries(fresh);
        let touched = 0;
        for (const f of walk(PORT).filter(f => /^(scenarios|adventures|conquests)\/.*\.bfhp$/i.test(f))) {
          const p = path.join(PORT, f), buf = fs.readFileSync(p); let dirty = false;
          try { for (const e of hpfs(buf)) { if (!/\.(xml|vs)$/i.test(e.path)) continue; const t = e.read().toString("latin1"), n = t.replace(re, m => to[m]); if (n !== t) { e.write(Buffer.from(n, "latin1")); dirty = true; } } }
          catch (err) { report.push(`${f}: ${err.message}`); continue; }
          if (dirty) { fs.rmSync(p); fs.writeFileSync(p, buf); touched++; }
        }
        console.log(`${civ.id}: ${fresh.length} classes of the mod's own (${fresh.map(x => x[0]).join(", ")}) renamed in ${touched} maps`);
      }
    }
    // 4. commands and patches
    const cmdFile = path.join(out, "data", "commands", `${Id}.xml`);
    wr(path.join(PORT, "DATA", "COMMANDS", `${Id.toUpperCase()}.XML`), rd(cmdFile));
    for (const f of files(path.join(out, "patches", "data", "commands"), /\.xml$/i)) {
      const add = rd(path.join(out, "patches", "data", "commands", f)).replace(/^[\s\S]*?<patch>\s*/, "").replace(/\s*<\/patch>[\s\S]*$/, "");
      const dest = path.join(PORT, "patches", "DATA", "COMMANDS", f.toUpperCase());
      if (fs.existsSync(dest)) wr(dest, rd(dest).replace(/\s*<\/patch>\s*$/, `\n${add}\n</patch>\n`));
      else wr(dest, `<patch>\n${add}\n</patch>\n`);
    }
    json.name = Object.fromEntries(Object.entries(civ.name).map(([k, v]) => [k, `${v} (${LABEL})`]));
    fs.mkdirSync(path.join(PORT, "civs"), { recursive: true }); fs.rmSync(path.join(PORT, "civs", `${civ.id}.json`), { force: true }); fs.writeFileSync(path.join(PORT, "civs", `${civ.id}.json`), JSON.stringify(json, null, 2) + "\n", "utf8");
    if (report.length) console.log("to check:\n  " + report.join("\n  "));
  }

};
