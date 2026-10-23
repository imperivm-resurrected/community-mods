# AGENTS.md

Rules for agents and contributors working on this repo. [README.md](README.md) has the full detail of how to port a mod and what each tool does.

## What this repo is

The table of community mods, maps and adventures for Imperivm, the tools that port them to [Imperivm Resurrected](https://github.com/imperivm-resurrected/imperivm-resurrected), and the hand fixes each port needs (`extras/`). The SDK tools (`shrink-mod.js`, `extract-data.js`, `validate-mod.js`) live in `imperivm-resurrected/sdk/tools/`, not here.

## Commits

Conventional Commits, in English, imperative mood, lowercase after the type, no trailing period.

```text
<type>(<scope>): <short summary>
```

- Types: `feat` (a mod ported or a new tool), `fix` (a port or a tool that was wrong), `docs` (tables and notes), `chore`.
- Scope (optional): the tool, e.g. `fix(wrap-map): …`. Name the mod or the table row otherwise (`docs: MODS.md row 384 …`).
- One logical change per commit. A table edited by a tool goes in the same commit as the change that caused it.
- Small changes go straight to `main`. Big ones (a new tool, a change in how every port is built) go through a pull request.
- Issues and pull requests are written in English.

## Tables

- `MODS.md` is the source of truth and is edited by hand. `MISSING.md` and `DEAD-LINKS.md` are kept with `node tools/split-missing.js`.
- `PENDING.md` is generated: change `MODS.md` or `tools/pending.js` and run `node tools/pending.js`. Never edit it by hand.
- `node tools/sync-table.js` sets *Type* and *Status* from each `mod.json`. The GameBanana link is added by hand.
- `node tools/build-table.js --force` overwrites manual edits. Only in a scratch copy.
- `OUTREACH.md` and `SCREENSHOTS.md` are not in git.

## Porting

- Pick the tool by the row's *Type*: `wrap-map.js`, `shrink-mod.js`, `port-140.js` or `imperivm1.js` (table in the README).
- Hand fixes go in `extras/<id>/` (the final files, `mod.json` with credits, and a `NOTES.md` that says what was changed and why), never only in `ported/<id>/`. The port must be rebuilable from the original download plus the repo.
- Compare against the original before saying a port is complete: files identical to the game are left out on purpose, so a file missing from `ported/` is not a missing file.
- Validate with `validate-mod.js --game`, then try it in the game and read `Logs\imperivm\imperivm-mod.log`. Say in the notes what was tried in-game and what was not. A comparison of files does not prove a mod works.
- A mod cannot ship executables or DLLs. Say in the notes what the original did through its `.exe` or `winmm.dll` that the port cannot carry.

## Credits and permissions

- `"authors"` in `mod.json` is the original author. Add `"<name> (port)"` only for real adaptation work (*reduce*, *rewrite*), not for *wrap*.
- Note the author's answer in the *Permission* column. If they can't be reached, publish with full credit and remove it if they ask.
- If a modder or editor asks for their mod to be removed, remove it from GameBanana and from the repo, no questions asked.
- Check the license of the original (e.g. CC BY-NC-ND) before changing its files, and put it in `mod.json`.

## Files that never go in git

- `originals/`: downloads and extracted game data.
- Third-party binaries in `ported/` (`.bfhp`, `.bmp`, `.pak`, `.avi`, `*.zip`) and the whole folder of the big mods rebuilt by a tool (`ported/mci/`, `cgwar/`, `greek-civilization-mod/`…). `.gitignore` lists them: add a new one there with the command that rebuilds it.
- `raw/forum.json`, `raw/forum-it.json`, `raw/discord.json`.
- Anything from the game itself, cookies (`FORUM_COOKIE`, `FORUM_IT_COOKIE`) and `.browser-profile/`.

## Tools

- Node, no dependencies. `.rar`/`.zip` are unpacked with `bsdtar`.
- A tool that rebuilds a port must give the same result run twice. If a decision is not obvious, put the reason in a comment next to it.
- Add a new tool to the Tools table in the README.
