// Secuter's Fun mod (rows 312, forum t60040716) on top of the HD game, by hand where tools/port-140.js could not decide.
//   node tools/merge-secuter-fun.js <extracted mod folder> <port-140 output> <out DATA parent folder> [--greek]
// Starts from the port-140 output (everything it merged without a conflict) and replaces the files it left in conflict with a
// real 3-way merge: HD's changes and Secuter's, both kept. Where both changed the same value the mod wins (it is a balance mod)
// unless HD's change is a fix. The decisions are in the comments below; raw/port-140/secuter-fun-mod.md lists the conflicts.
// With --greek, run tools/merge-fun-greek.js on its output afterwards: it merges the files the Greece version shares with the Greek Mod 4.2.
const fs = require("fs"), path = require("path"), os = require("os"), { spawnSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const [modDir, portDir, outDir] = process.argv.slice(2);
const greek = process.argv.includes("--greek");
if (!modDir || !portDir || !outDir) { console.error("usage: node tools/merge-secuter-fun.js <mod folder> <port-140 output> <out folder> [--greek]"); process.exit(1); }
const HD = path.join(ROOT, "originals/game-data/paks/DATA"), OLD = path.join(ROOT, "originals/game-140/paks/DATA"), MOD = path.join(modDir, "DATA");
const rd = p => fs.readFileSync(p, "latin1");
const crlf = s => s.replace(/\r?\n/g, "\r\n");
const lf = s => s.replace(/\r\n/g, "\n");
fs.cpSync(portDir, outDir, { recursive: true });
const put = (rel, text) => { const p = path.join(outDir, "DATA", rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, crlf(text), "latin1"); };

// git merge-file with the conflicts left in, then every conflict replaced by what `fix` returns ({hd, base, mod, i}).
const merge3 = (rel, fix) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "m3-"));
  fs.writeFileSync(path.join(tmp, "hd"), lf(rd(path.join(HD, rel))), "latin1");
  fs.writeFileSync(path.join(tmp, "b"), lf(rd(path.join(OLD, rel))), "latin1");
  fs.writeFileSync(path.join(tmp, "m"), lf(rd(path.join(MOD, rel))), "latin1");
  const r = spawnSync("git", ["merge-file", "-p", "--diff3", "-L", "HD", "-L", "base", "-L", "mod", path.join(tmp, "hd"), path.join(tmp, "b"), path.join(tmp, "m")], { encoding: "latin1", maxBuffer: 1 << 28 });
  let i = 0;
  const text = r.stdout.replace(/<<<<<<< HD\n([\s\S]*?)\|\|\|\|\|\|\| base\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> mod\n/g,
    (_m, hd, base, mod) => { const out = fix({ hd, base, mod, i: i++ }); if (out == null) throw new Error(`${rel}: no decision for conflict ${i - 1}`); return out; });
  return { text, n: i };
};
const take = (rel, ...decisions) => { // decisions: "hd" | "mod" | string | ({hd,base,mod}) => string, one per conflict
  const { text, n } = merge3(rel, c => { const d = decisions[c.i]; return d === "hd" ? c.hd : d === "mod" ? c.mod : typeof d === "function" ? d(c) : d; });
  if (n !== decisions.length) throw new Error(`${rel}: ${n} conflicts, ${decisions.length} decisions`);
  put(rel, text);
  console.log(`  ${rel}: ${n} conflict(s) merged`);
};

// --- classes -----------------------------------------------------------------------------------------------------
// GOUTPOST/TOUTPOST: the mod only reordered the attributes of a method HD also has, and HD added a second method (sellgold): HD's.
const SELL = '\t<method sig="goutpost_sellfood" vs="data/subai/goutpost_sellfood.vs"/>\n    <method sig="goutpost_sellgold" vs="data/subai/goutpost_sellgold.vs"/>\n';
take("CLASSES/GOUTPOST.SC.XML", "hd");
// TOUTPOST: HD renamed the defender class (TValkyrie -> TValkyria), the mod cut its numbers (10/10 -> 4/2): both.
take("CLASSES/TOUTPOST.SC.XML", c => c.hd.replace(/defenders_max_1 = "\d+"/, 'defenders_max_1 = "4"').replace(/defenders_out_1 = "\d+"/, 'defenders_out_1 = "2"'), "hd");

// TTent: the mod makes TTent an abstract class (BASETENT.SC.XML, no model) and the Teuton camp becomes TTent2, a child of it
// (TTENT.SC.XML), so the camps of other civilizations can share its behavior. HD's TTent body (mules, teuton production, food
// stock) moves into the abstract class: HD's changes to it applied to the mod's copy.
fs.copyFileSync(path.join(MOD, "CLASSES/TTENT.SC.XML"), path.join(outDir, "DATA/CLASSES/TTENT.SC.XML"));
{
  const p = path.join(outDir, "DATA/CLASSES/BASETENT.SC.XML");
  let t = rd(p);
  const nl = /\r\n/.test(t) ? "\r\n" : "\n";
  const behaviors = '<behavior script="data/subai/ttent_feeding_behavior.vs"/>';
  if (!t.includes(behaviors)) throw new Error("BASETENT.SC.XML changed shape");
  t = t.replace(behaviors, behaviors + nl + [
    '\t<method sig="createfoodmulesmall" vs="data/subai/create_food_mule_small.vs"/>',
    '\t<method sig="createfoodmulebig"   vs="data/subai/create_food_mule_big.vs"/>',
    '\t<method sig="creategoldmulebig"   vs="data/subai/create_gold_mule_big.vs"/>',
    '\t<method sig="teutonProduction"    vs="data/subai/ttent_teuton_production.vs"/>'].join(nl))
    .replace('settlement_food="0"', 'settlement_food="2400"').replace('settlement_maxgold="100000000"', 'settlement_maxgold="0"');
  fs.writeFileSync(p, t, "latin1");
  console.log("  CLASSES/BASETENT.SC.XML: HD's TTent changes applied to the mod's abstract TTent");
}
// WolfUnit: the mod's WARWOLF.SC.xml is its version of HD's WOLFUNIT.SC.XML (HD did not change it): the same id twice otherwise.
{
  const src = path.join(MOD, "CLASSES/WARWOLF.SC.xml");
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, "DATA/CLASSES/WOLFUNIT.SC.XML"));
    for (const f of fs.readdirSync(path.join(outDir, "DATA/CLASSES"))) if (/^warwolf\.sc\.xml$/i.test(f)) fs.rmSync(path.join(outDir, "DATA/CLASSES", f));
    console.log("  CLASSES/WOLFUNIT.SC.XML: the mod's WolfUnit (WARWOLF.SC.xml renamed: one id, one file)");
  }
}

// --- scripts ---------------------------------------------------------------------------------------------------
take("SUBAI/MILITARY_ONDIE.VS", // HD: levels instead of experience (and not for the Gauls); the mod: the whole block under `if researched`
  'exp = 1; // level to add\nif(EnvReadString(.player, "Warrior Tales") == "researched")\n{\n');
take("SUBAI/ONFINISH_RESEARCH.VS", ...(greek ? ["mod", "hd"] : ["hd"])); // Food Tax: the same line; the Greek version adds "Supplies"
take("SUBAI/UNIT_ON_ENTER.VS", // HD: camps with a Teleport do not take gold; the mod: ruins do, and gold is checked
  '//if(sett.GetCentralBuilding.IsHeirOf("BaseRuins")) return;\n\nif( sett.GetCentralBuilding.IsHeirOf("Teleport") )\n\treturn;\n\nsett.SetGold(sett.gold+1);\nif (sett.gold) sett.SetGold(sett.gold-1);\nelse return;\n');
take("SUBAI/UNIT_ON_KILL.VS", // HD wraps each block in `if (!Victim.IsSentry)` (the closing braces are in the merged text already)
  c => "if (!Victim.IsSentry)\n{\n" + c.mod,        // Spoils of war: HD's guard, the mod's rules
  "hd",                                              // Noble items: HD's level (3), the mod only wrote >= for >
  "mod");                                            // Statue of Zeus: the mod's heal (the Gambler's day text is HD's own, above)

// TTENT_BEHAVIOR.VS: HD splits it in two: independent camps respawn their army for free, owned ones produce what the player orders
// (ENV_TProd, Teuton units only). The mod: every camp (each civilization has its own troops and cost) respawns units and the owner
// pays. Both: the mod's respawn runs for independent camps and for the owned camps that are not Teuton, HD's production only for
// owned Teuton ones.
// (the conflict's HD side opens the spawn loops (nSpawn...), which the mod's side lacks: HD's opening, then the mod's body)
const FIRST = /^\s*if \(olAll1\.count>=nArmy && olAll2\.count>=nArmy\)/m;
take("SUBAI/TTENT_BEHAVIOR.VS", c => c.hd.slice(0, c.hd.search(FIRST)) + c.mod.slice(c.mod.search(FIRST)));
{
  const p = path.join(outDir, "DATA/SUBAI/TTENT_BEHAVIOR.VS");
  let t = rd(p);
  if (!/if \(bIsIndependent\)\{/.test(t)) throw new Error("TTENT_BEHAVIOR.VS: HD's `if (bIsIndependent){` not found");
  t = t.replace(/if \(bIsIndependent\)\{/, "if (bIsIndependent || .race != Germany){");
  fs.writeFileSync(p, t, "latin1");
}

// The Greek version's Myrmidons and Priest call three scripts its zip does not include (nor the Greek Mod 4.2 has them): the
// methods are commented out in place, the rest of the classes stays as the author made it.
if (greek) for (const f of fs.readdirSync(path.join(outDir, "DATA/CLASSES"))) {
  const p = path.join(outDir, "DATA/CLASSES", f), t = rd(p);
  const r = t.replace(/^([ \t]*)(<method\b[^>]*\bvs="data\/subai\/(?:myrmidon_sword|myrmidon_javelin|centaur_summoning)\.vs"[^>]*\/>)/gim, "$1<!-- script missing in Secuter's zip: $2 -->");
  if (t !== r) { fs.writeFileSync(p, r, "latin1"); console.log(`  CLASSES/${f}: method for a script the zip lacks commented out`); }
}

// --- commands --------------------------------------------------------------------------------------------------
// UNIT.XML: the mod comments out a block (its `-->` is in the conflict); HD only removed two lines of it.
take("COMMANDS/UNIT.XML", "mod");
// ARENA.XML: command by command (they are independent): what only HD changed -> HD's; only the mod -> the mod's; both ->
// attribute by attribute, the mod's value when both changed the same one. Commands only HD has are added; the mod's deletions stay.
{
  const cmds = t => { const m = new Map(); for (const x of t.matchAll(/<cmd\s+name="([^"]+)"[^>]*?(?:\/>|>[\s\S]*?<\/cmd>)/g)) m.set(x[1], x[0]); return m; };
  const split = raw => { const o = raw.match(/^<cmd\s[^>]*?>/)[0]; return { open: o, body: raw.slice(o.length), closed: /\/>$/.test(o) }; };
  const attrs = open => Object.fromEntries([...open.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map(m => [m[1], m[2]]));
  const norm = s => s.replace(/\s+/g, " ").trim();
  const [tb, th, tm] = [OLD, HD, MOD].map(d => rd(path.join(d, "COMMANDS/ARENA.XML")));
  const b = cmds(tb), h = cmds(th), m = cmds(tm);
  let text = tm, both = 0, hdOnly = 0;
  for (const [name, raw] of m) {
    if (!h.has(name) || !b.has(name)) continue; // new in the mod, or HD's gone/new: handled below
    const [B, H, M] = [b.get(name), h.get(name), raw];
    if (norm(H) === norm(M)) continue;
    if (norm(M) === norm(B)) { text = text.replace(raw, () => H); hdOnly++; continue; }
    if (norm(H) === norm(B)) continue; // only the mod changed it
    const [sb, sh, sm] = [split(B), split(H), split(M)];
    const [ab, ah, am] = [attrs(sb.open), attrs(sh.open), attrs(sm.open)];
    let open = sm.open;
    for (const k of new Set([...Object.keys(ab), ...Object.keys(ah), ...Object.keys(am)])) {
      const v = ah[k] === am[k] ? ah[k] : ah[k] === ab[k] ? am[k] : am[k] === ab[k] ? ah[k] : am[k]; // both changed: the mod's
      if (v === am[k]) continue;
      if (v === undefined) open = open.replace(new RegExp(`\\s*\\b${k}\\s*=\\s*"[^"]*"`), "");
      else if (k in am) open = open.replace(new RegExp(`(\\b${k}\\s*=\\s*")[^"]*"`), (_x, a) => `${a}${v}"`);
      else open = open.replace(/(\/?>)$/, `\n\t${k}="${v}"$1`);
    }
    const body = norm(sh.body) === norm(sb.body) ? sm.body : norm(sm.body) === norm(sb.body) ? sh.body : sm.body;
    text = text.replace(raw, () => open + body); both++;
  }
  const extra = [...h].filter(([n]) => !m.has(n) && !b.has(n)).map(([, r]) => r); // commands HD added (RNobility, Standartization III)
  if (extra.length) text = text.replace(/<\/commands>\s*$/, () => extra.join("\r\n\r\n") + "\r\n\r\n</commands>\r\n");
  fs.writeFileSync(path.join(outDir, "DATA/COMMANDS/ARENA.XML"), text, "latin1");
  console.log(`  COMMANDS/ARENA.XML: ${hdOnly} commands only HD changed, ${both} both changed, ${extra.length} added from HD`);
}
