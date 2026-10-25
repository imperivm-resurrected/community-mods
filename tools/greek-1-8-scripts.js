// Greek Mod 1.8: the mod's edits of the game's behavior scripts (UNIT_ATTACK, MILITARY_ONDIE...), kept for the mod's civilizations only.
// Run last, after tools/greek-1-8-civs.js:   node tools/greek-1-8-scripts.js
//
// The mod edited scripts every unit of the game uses (parry only for the AI, no attack on allies, random stamina when a unit dies...). A file of the
// mod at the game's path would change them for every civilization (AGENTS.md, "Civilizations are independent"). Here each one is a COPY of its own,
// NAME_G18.VS, and the classes of the mod's civilizations point to the copy; the game's script stays as it is.
//   - The copy is HD's script with the mod's edits: git merge-file (HD, the 1.40 the mod started from, the mod's). HD fixed these scripts after 1.40,
//     so the mod's file as it is would lose the fixes. A conflict is decided in RESOLVE below and never left to the tool: an undecided one stops the run.
//   - A class that defines the method or behavior itself (the civilization's copy of a game class) just points to the copy.
//   - A class that inherits it from a class of the game gets the <method> written inside, with every <method> of the same `sig` of the class that
//     defines it (HD restates a whole sig when it redefines it, e.g. Hero's attack), the changed script swapped. Inheritance is read through the
//     port's classes, then the game's with the mod's edits (originals/greek-1-8-merged), then HD's.
// Left out (NOTES.md): behaviors a class inherits (BaseTownhall's TOWNHALL_BEHAVIOR_GUARD would run twice), TTENT_BEHAVIOR (the Teuton camp of the
// maps is no class of a civilization), HERO_FORMATION_VERIFY (a command of the game's HERO.XML, shared by every hero).
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.join(__dirname, ".."), ORIG = path.join(ROOT, "originals"), PORT = path.join(ROOT, "ported", "greek-mod-1-8");
const TAG = "_G18";
const SCRIPTS = ["UNIT_ATTACK", "UNIT_ATTACH", "UNIT_ATTACH_VERIFY", "UNIT_STAND_POSITION", "HERO_MOVE", "MILITARY_ONDIE"];
// the conflicts of git merge-file, in order: "cur" = HD's side, "oth" = the mod's, or the text to write
const RESOLVE = {
  UNIT_ATTACK: ["cur"],                       // HD added "a village or a house of an ally is not attacked"; the mod's line is somewhere else
  UNIT_ATTACH_VERIFY: [null],                 // HD's text, plus the mod's line about the share of control (see below)
  HERO_MOVE: ["cur"],                         // blank lines
  MILITARY_ONDIE: ["exp = 1; // level to add\r\nrandom = rand(4);\r\n"],   // HD's comment, the mod's random
};
const rd = f => fs.readFileSync(f, "latin1"), wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.rmSync(f, { force: true }); fs.writeFileSync(f, s, "latin1"); };
const find = (dir, name) => { const f = fs.existsSync(dir) && fs.readdirSync(dir).find(x => x.toLowerCase() === name.toLowerCase()); return f ? path.join(dir, f) : null; };
const HD = path.join(ORIG, "game-data", "paks", "DATA"), B140 = path.join(ORIG, "game-140", "paks", "DATA"), MOD = path.join(ORIG, "greek-mod-1.8-flat", "DATA");

// ---- 1. the copies -------------------------------------------------------------------------------------------------------------------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "g18s-"));
const report = [], same = [], copied = [];
for (const S of SCRIPTS) {
  const cur = find(path.join(HD, "SUBAI"), S + ".VS"), base = find(path.join(B140, "SUBAI"), S + ".VS"), oth = find(path.join(MOD, "SUBAI"), S + ".VS");
  if (!cur || !base || !oth) { report.push(`${S}: not found (HD ${!!cur}, 1.40 ${!!base}, mod ${!!oth})`); continue; }
  const r = cp.spawnSync("git", ["merge-file", "-p", "-L", "cur", "-L", "base", "-L", "oth", cur, base, oth], { encoding: "latin1", maxBuffer: 1 << 26 });
  if (r.status < 0 || r.status > 100) { report.push(`${S}: git merge-file failed: ${r.stderr}`); continue; }
  let text = r.stdout;
  if (r.status > 0) {
    const want = RESOLVE[S] || [];
    let i = 0;
    text = text.replace(/<<<<<<< cur\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> oth\r?\n?/g, (_m, a, b) => {
      const w = want[i++];
      if (w === "cur") return a; if (w === "oth") return b;
      if (typeof w === "string") return w;
      if (S === "UNIT_ATTACH_VERIFY" && w === null) return a.replace(/(return true;)/, b.match(/^.*DiplGetShareControl.*\r?\n/m)[0] + "$1");
      report.push(`${S}: conflict ${i} has no decision in RESOLVE`); return a;
    });
    if (i !== want.length) report.push(`${S}: ${i} conflicts, RESOLVE has ${want.length}`);
  }
  // HD already has the edits (it took several of them from this mod): no copy, the class keeps the game's script
  const flat = t => t.replace(/\s+/g, "");
  if (flat(text) === flat(rd(cur))) { same.push(S); continue; }
  wr(path.join(PORT, "DATA", "SUBAI", S + TAG + ".VS"), text);
  copied.push(S);
}

// ---- 2. the classes ------------------------------------------------------------------------------------------------------------------------------
const files = (dir, re) => fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter(f => re.test(f)).map(f => path.join(dir, f)) : [];
const idOf = s => (s.match(/<class\b[^>]*?\bid\s*=\s*"([^"]+)"/) || [])[1], parentOf = s => (s.match(/<class\b[^>]*?\bparent\s*=\s*"([^"]+)"/) || [])[1];
const sigOf = e => ((e.match(/\bsig\s*=\s*"([^"]+)"/) || [])[1] || "").toLowerCase();
const methodsOf = s => [...s.matchAll(/<method\b[^>]*?\/>/gi)].map(m => m[0]);
const game = new Map(), mine = new Map();                    // lowercase id -> { text, parent, methods }
const load = (map, p) => { const s = rd(p), id = idOf(s); if (id && !map.has(id.toLowerCase())) map.set(id.toLowerCase(), { text: s, parent: parentOf(s), methods: methodsOf(s), file: p }); };
for (const p of files(path.join(PORT, "DATA", "CLASSES"), /\.sc\.xml$/i)) load(mine, p);
for (const p of files(path.join(ORIG, "greek-1-8-merged", "classes"), /\.sc\.xml$/i)) load(game, p);
for (const p of files(path.join(HD, "CLASSES"), /\.sc\.xml$/i)) load(game, p);
const get = id => mine.get(id.toLowerCase()) || game.get(id.toLowerCase());
const PATH_RE = new RegExp(`data/subai/(${copied.join("|")})\\.vs`, "gi"), HAS = e => { PATH_RE.lastIndex = 0; return PATH_RE.test(e); };
const swap = s => s.replace(PATH_RE, (_m, n) => `data/subai/${n.toLowerCase()}${TAG.toLowerCase()}.vs`);
// the class that defines `sig` for `id`: its <method> elements (the nearest one up the chain)
const definer = (id, sig) => { for (let c = get(id), n = 0; c && n < 30; c = c.parent && get(c.parent), n++) { const m = c.methods.filter(e => sigOf(e) === sig); if (m.length) return { owner: c, methods: m }; } return null; };
let inPlace = 0, injected = 0, touched = 0;
for (const [id, c] of mine) {
  let s = c.text;
  // sigs of the chain with a changed script that this class does not define itself
  const sigs = new Set(); for (let k = c, n = 0; k && n < 30; k = k.parent && get(k.parent), n++) for (const e of k.methods) if (HAS(e)) sigs.add(sigOf(e));
  const own = new Set(c.methods.map(sigOf)), add = [];
  for (const sig of sigs) {
    if (own.has(sig)) continue;
    const d = definer(id, sig); if (!d || d.owner === c || mine.get((idOf(d.owner.text) || "").toLowerCase()) === d.owner || !d.methods.some(HAS)) continue;   // a class of the mod defines it: it handles it
    add.push(...d.methods.map(swap));
  }
  const t = swap(s); inPlace += t !== s ? 1 : 0; s = t;
  if (add.length) { s = s.replace(/(<class\b[^>]*>)/, `$1\n\t<!-- scripts the 1.8 edited, as copies of its own (the game's stay as they are) -->\n\t${add.join("\n\t")}`); injected += add.length; }
  if (s !== c.text) { wr(c.file, s); touched++; }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${copied.length} scripts copied as *${TAG}.VS (${copied.join(", ")}); the same as HD's, no copy: ${same.join(", ") || "none"}; ${touched} classes changed (${inPlace} point to the copy, ${injected} <method> elements written inside)`);
if (report.length) { console.log("to check:\n  " + report.join("\n  ")); process.exitCode = 1; }
