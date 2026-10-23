// What a branch script leaves visible at the start of the game, with every mode off.
//   const { hiddenBy } = require("./branch.js");  hiddenBy(scriptText, { researched: ["ChooseImperialRome"], ints: {} }) -> Set of commands
// The 4.2 lets Rome (and Carthage) pick a branch at the town hall, and per-building scripts (R*_Enable_Or_Disable_Cmd.vs) turn commands on and
// off with .CmdEnable / .CmdDisable depending on which "ChooseXxx" was researched. Each branch is a civilization of its own here (AGENTS.md,
// "What a civilization is, it is from the start"), so what the script would have hidden for that branch is not in its commands at all.
// The script is run once, statically: `if` / `else if` on EnvReadString / EnvReadInt are evaluated against the branch's flags (everything
// else is "not researched" / 0), `while` bodies run once, nested blocks and `nConfig += n` style assignments work; calls it does not know
// are ignored. It is a reader for these scripts, not an interpreter of the game's language.

function tokenize(src) {
  const s = src.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const out = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '"') { let j = i + 1; while (j < s.length && s[j] !== '"') j++; out.push({ t: "str", v: s.slice(i + 1, j) }); i = j + 1; continue; }
    if (/[A-Za-z_.]/.test(c)) { let j = i; while (j < s.length && /[A-Za-z0-9_.]/.test(s[j])) j++; out.push({ t: "id", v: s.slice(i, j) }); i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (j < s.length && /[0-9]/.test(s[j])) j++; out.push({ t: "num", v: s.slice(i, j) }); i = j; continue; }
    const two = s.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||", "+=", "-="].includes(two)) { out.push({ t: "op", v: two }); i += 2; continue; }
    out.push({ t: "op", v: c }); i++;
  }
  return out;
}

function hiddenBy(src, env) {
  const toks = tokenize(src); let p = 0;
  const researched = new Set((env.researched || []).map(x => x.toLowerCase())), ints = env.ints || {};
  const vars = {}, disabled = new Set(), enabled = new Set();
  const peek = () => toks[p], next = () => toks[p++];
  // The condition of an `if (` / `while (`, up to its matching ")": a small recursive-descent evaluator (|| && == != < > <= >= + - * % ! and
  // parentheses; EnvReadString / EnvReadInt read the branch's flags; an unknown name is 0)
  const op = v => peek() && peek().t === "op" && peek().v === v;
  const primary = () => {
    const t = next();
    if (!t) return 0;
    if (t.t === "op" && t.v === "(") { const v = orExpr(); if (op(")")) next(); return v; }
    if (t.t === "op" && t.v === "!") return primary() ? 0 : 1;
    if (t.t === "op" && t.v === "-") return -primary();
    if (t.t === "str") return t.v;
    if (t.t === "num") return +t.v;
    if (t.t === "id" && /^(true|false)$/.test(t.v)) return t.v === "true" ? 1 : 0;
    if (t.t === "id" && /^EnvReadString$/i.test(t.v)) { next(); next(); next(); const k = next().v; next(); return researched.has(String(k).toLowerCase()) ? "researched" : ""; }   // ( obj , "key" )
    if (t.t === "id" && /^EnvReadInt$/i.test(t.v)) { next(); next(); next(); const k = next().v; next(); return ints[k] || 0; }
    if (t.t === "id" && peek() && peek().v === "(") { let d = 0; do { const x = next(); if (x.v === "(") d++; else if (x.v === ")") d--; } while (d > 0 && peek()); return 0; }   // a call we do not know
    return vars[t.v] || 0;
  };
  const binary = (sub, ops) => () => {
    let l = sub();
    while (peek() && peek().t === "op" && ops[peek().v]) { const f = ops[next().v], r = sub(); l = f(l, r); }
    return l;
  };
  const mul = binary(primary, { "*": (a, b) => a * b, "%": (a, b) => (b ? a % b : 0) });
  const add = binary(mul, { "+": (a, b) => a + b, "-": (a, b) => a - b });
  const cmp = binary(add, { "<": (a, b) => +(a < b), ">": (a, b) => +(a > b), "<=": (a, b) => +(a <= b), ">=": (a, b) => +(a >= b) });
  const eq = binary(cmp, { "==": (a, b) => +(a === b), "!=": (a, b) => +(a !== b) });
  const andExpr = binary(eq, { "&&": (a, b) => +(!!a && !!b) });
  const orExpr = binary(andExpr, { "||": (a, b) => +(!!a || !!b) });
  const expr = () => { const v = !!orExpr(); if (op(")")) next(); return v; };
  let stopped = false;
  const stmt = run => {
    const t = peek(); if (!t) return;
    if (t.t === "op" && t.v === "{") { next(); while (peek() && !(peek().t === "op" && peek().v === "}")) stmt(run); next(); return; }
    if (t.t === "op" && t.v === ";") { next(); return; }
    if (t.t === "id" && /^(if|while)$/.test(t.v)) {
      next(); next(); const c = expr();
      stmt(run && c);
      if (t.v === "if" && peek() && peek().t === "id" && peek().v === "else") { next(); stmt(run && !c); }
      return;
    }
    if (t.t === "id" && /(^|\.)(CmdEnable|CmdDisable)$/i.test(t.v)) {
      next(); next(); const name = next().v; while (peek() && !(peek().t === "op" && peek().v === ";")) next(); next();
      if (run && !stopped) { if (/Enable$/i.test(t.v)) { disabled.delete(name); enabled.add(name); } else disabled.add(name); }
      return;
    }
    if (t.t === "id" && /^return$/i.test(t.v)) { next(); while (peek() && !(peek().t === "op" && peek().v === ";")) next(); next(); if (run) stopped = true; return; }
    // `x = n;` / `x += n;` with a plain number
    if (t.t === "id" && toks[p + 1] && toks[p + 1].t === "op" && /^(=|\+=|-=)$/.test(toks[p + 1].v)) {
      const name = next().v, op = next().v, parts = [];
      while (peek() && !(peek().t === "op" && peek().v === ";")) parts.push(next());
      next();
      if (run && parts.length === 1 && parts[0].t === "num") { const n = +parts[0].v; vars[name] = op === "=" ? n : op === "+=" ? (vars[name] || 0) + n : (vars[name] || 0) - n; }
      return;
    }
    // anything else: skip to the end of the statement
    while (peek() && !(peek().t === "op" && (peek().v === ";" || peek().v === "{" || peek().v === "}"))) next();
    if (peek() && peek().v === ";") next();
  };
  while (p < toks.length) stmt(true);
  return { disabled, enabled };
}

module.exports = { hiddenBy };
