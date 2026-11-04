# Greek Mod 2.x line: 2.3 (row 385) — first of four (2.5.3, 2.6.1, Mediterranevm 3.6 follow)

Part of #14 (does not close it). Opened with **Greek Mod 2.3** only, tested in game by the maintainer; 2.5.3, 2.6.1 and Mediterranevm 3.6 are added to this branch one at a time, each after its own test, and this description grows with them.

## What it is

`ported/greek-mod-2-3` (git-ignored, rebuilt by `node tools/greek-2x-source.js 2.3 && node tools/greek-2x.js 2.3`, hash-identical twice): Greece and the game's civilizations as the Greek Mod 2.3 has them, ten civilizations of their own, set name `Greek Mod 2.3`, every civilization `ai: true`. Details, what was left out and why, what was not tried: `extras/greek-mod-2-3/NOTES.md`.

## New tools (the shared ones are untouched)

- `tools/greek-2x-source.js <version>`: standalone game folder -> `work/` (git-ignored; nothing under `originals/`) -> `flatten-paks.js` -> `port-140.js`.
- `tools/greek-2x.js <version>`: the civilizations (Greece's prefix, the clones, scripts as copies, AI, conquests, collisions). One tool for the three Greek 2.x versions.
- `tools/lib/greek-2x-versions.js`: the table of versions and the by-hand decisions on the conflicts `port-140.js` settled with the mod's side.
- `tools/lib/script-patch.js` (new): the engine's `PatchScriptText` in JavaScript (same algorithm as `applyVs` of `tools/oggetti-in-tutte-le-strutture.js`, branch `nuclear-oggetti-37-38`).
- `tools/lib/greek-2x-checks.js` (new): offline checks at the end of a build: every script patch applied to the game's script, braces/parentheses, `GetRandomHeroClass` / `hirehero` bases (must have a descendant with an entity: `PickRandomHeroClass` hangs otherwise), class names, `GetConst` keys.
- **Changes to shared tools (minimal; the other ports must be rebuilt to see them):**
  - `tools/lib/ported-patch.js` `vsPatch`: (1) a deleted line removes ONE inserted copy of itself, not every inserted line with that text (the bug that emptied the body of the `if` in `OUTPOST_IDLE.vs`, which broke every outpost for everybody); (2) the directives are emitted bottom to top; (3) the patch is applied to the game's script with `script-patch.js` and compared with what the kept hunks say: a difference throws (`PATCH_CHECK=warn` only reports it). Other ports that use `vsPatch` (4.2, CGWAR, 1.8, `independent.js`) get the check on their next build.
  - `tools/lib/clone-civs.js`: one line: an `asBase` class whose id does not start with the base's letter is renamed like an extra (`MHero1` -> `RMHero1` -> `WimMHero1`).
  - `ported-patch.js`: four lint-only edits (unused names, `walk` written as `if/else`), no behavior change.
  - `tools/lib/own-scripts.js` line 105 (flag folding): for a script copy with no `civ` (the one every civilization without branch flags gets) `civ && ...` was `undefined`, and `undefined === (op === "==")` made every `!= "researched"` test `false` instead of `true`. In `ARENA_HIREHERO.VS` the "no branch chosen" case never fired, so no hero was placed for any clone but the Roman ones (Greek 2.3 test: heroes never left the arena). Now `civ?.flags?.[name] === true`. The 4.2, CGWAR and 1.8 ports use this tool: rebuild and re-check scripts with `!= "researched"` before relying on them.
- `clone-civs.js`, `own-ai.js`, `greek-ai.js`, `conquests.js`, `independent.js`: otherwise used as they are.
- `.gitignore`: `ported/greek-mod-2-3/`, `-2-5-3/`, `-2-6-1/`.
- `docs/TOOLS.md` / `docs/es/TOOLS.md`: the five new tools (`greek-2x-source.js`, `greek-2x.js`, `greek-2x-legacy.js`, `lib/script-patch.js`, `lib/greek-2x-checks.js`).

## Rows for the maintainer (not edited here)

`sdk/prefixes.md` (engine repo), one per prefix:

| Prefix | Civilization | Pack |
|---|---|---|
| `Wgr` | Greece (Greek 2.3) | greek-mod-2-3 |
| `Wro` | Rep. Rome (Greek 2.3) | greek-mod-2-3 |
| `Wim` | Imp. Rome (Greek 2.3) | greek-mod-2-3 |
| `Wpu` | Pun. Rome (Greek 2.3) | greek-mod-2-3 |
| `Wga` | Gaul (Greek 2.3) | greek-mod-2-3 |
| `Wca` | Carthage (Greek 2.3) | greek-mod-2-3 |
| `Wbr` | Britain (Greek 2.3) | greek-mod-2-3 |
| `Wib` | Iberia (Greek 2.3) | greek-mod-2-3 |
| `Weg` | Egypt (Greek 2.3) | greek-mod-2-3 |
| `Wge` | Germany (Greek 2.3) | greek-mod-2-3 |

`docs/CIVILIZATIONS.md` (and `docs/es/`): the same ten as `(engine)` rows (`wgreece` ... `wgermany`, base, mod `Greek Mod 2.3`, `tools/greek-2x.js`).

`docs/MODS.md` row 385: status `🔧 ported (not uploaded)` once tested; permission: "authors' permission: granted to the maintainer, per the maintainer 2026-11-02" (the Greek Team / MediterranevmTeam, and Nicoghiro31 and Gargolus for Imperivm Legacy's assets); `redistributable: true`; license: none in the download, no licence name recorded (see NOTES.md, *License and permission*). `docs/AUTHORS.md`: the GreekModTeam row says the same. Nothing is published.

## Validation

- `validate-mod.js --game --data`: 2585 files, 0 errors, 68 warnings (sprite animation frame counts of the mod's own art).
- `node tools/shared-paths.js greek-mod-2-3`: 0 class ids in common with the game and every port; only the menu skin shares a path (cosmetic, as among the other Greek mods).
- Same build twice: same hash of every file.
- Script checks (`raw/greek-mod-2-3-script-checks.txt`): 0 errors, 33 warnings (benign, listed in NOTES.md).
- **Tried in game by the maintainer:** the 2.3 and the 2.5.3 run with only this set against the Roman AIs; heroes now come out of the arena; troops come out of Greece's barracks in both Greek town layouts (single exit point at `-16,-50`, 2.3 and 2.5.3).
- **NOT tried yet (the maintainer is still on it):** the long game against the Roman AIs, the icons (the pictures put back by `greek-2x-refs.js`) and the attack sounds of this build; the Italian and Spanish voices; the conquests (`interface=15` assumes this set alone in the profile); `wimperial`'s Imperial heroes; two civilization mods active together; the 2.6.1; the gymnasium/arena, temple and village exits (same single-exit shape, untouched); `THERMAE.SC_w23.XML` (its name no longer ends in `.sc.xml`, loader not checked); that *Competitive* / *Real World* (renamed templates, kept on purpose) show and generate with this set.
- `tools/lib/script-checks.js` was added to `main` by the AsvrMod port while this branch was open: this one is `tools/lib/greek-2x-checks.js` now, and `tools/lib/asvr-refs.js` (the same picture post-pass with `_asv` written into it) was not unified with `tools/lib/greek-2x-refs.js`, to keep the AsvrMod build as it is (maintainer's call).
- **Names check (added after the 2.6.1's first in-game test, which showed three compilation errors the build had not caught):** `tools/lib/greek-2x-names.js`, run by every build through `greek-2x-checks.js`, **stops the build** on a bare name or a call that nothing defines (against `sdk/game-functions.txt`, specials, AI.INI, classes), a script file named by a class, a command or `AIRun("X.vs")` that is in neither the port nor the game, and an order (`AddCommand`, `SetCommand`, `ExecCmd`...) that no command or method has. Scripts nothing points to are not read. It **cannot see** types and signatures, a typo after a dot, `Mod_*` names, names built at run time, `if (false)` code, or whether a script does what it should. What it found in the 2.3 (the folder installed before this fix): `GRW23_TS_HGreeceTactic` ran `AIRun("GRW23_TS_AttackAtWill.vs")` twice, a script the 2.3 does not ship: now the game's `TS_AttackAtWill.vs`. The Greek AI would have failed at that call; **not seen in game** (the 2.3's tests had no long game against the Roman AIs). The 2.3 built at this commit is byte-identical to the folder the maintainer installed from the final tip of the stack (`diff -rq`, 0 differences ignoring NOTES.md).
- **Reproducible builds:** The build renames what it shares with another port, so its bytes depend on the ports it sees. A clean worktree under `community-mods/.wt/` built the 2.3 with **176 files different** from the installed one: the tool looked for Imperivm Legacy at `ROOT/../community-mods/ported/`, which does not exist there, and went on without it (so the 2.3's `GRASS4.BMP`, the `CHorseman` classes... kept names that collide with Legacy's other bytes; the output with Legacy is the right one, the other has a real independence gap). Fixed in the tool of this layer (not shared): Legacy and the SDK are looked up from the main checkout (`LEGACY_PORTED`, `SDK` override), and **a build with no Imperivm Legacy stops** (`GREEK2X_NO_LEGACY=1` to build without it on purpose). Needed in `ported/`: the branch's tracked ports; `cgwar`, `greek-civilization-mod`, `greek-mod-1-8`, `mediterranevm-alpha` (git-ignored: link the main checkout's); `imperivm-legacy` in the main checkout; and the lower versions of the line for the upper ones (NOTES.md, *Rebuild*). Checked: the three versions at the tip of #43 built in a worktree next to the main checkout and in a clean one under `.wt/` give identical bytes, and 0 differences against the installed folders.

- In game (maintainer, profile with only this set, random map, Greece against the three Roman AIs), four defects found and fixed, each in NOTES.md, *In game*:
  1. `OUTPOST_IDLE.vs` patch lost the body of an `if` (compilation error; the `vsPatch` bug above);
  2. hang in `GetRandomHeroClass` for `wimperial` (a hero base with no entity and no children);
  3. no hero ever left the arena of Greece (the `own-scripts.js` flag folding above);
  4. troops stuck on the barracks' steps in one of the two Greek town layouts: the barracks' only exit point (type 2, `-32,-50`) is the end of a dead-end corridor of its `.pass`. Fixed by moving that one point to `-16,-50`, found and tried in game by the maintainer (2.5.3, both layouts). Why the engine fails at the original is not proven. Also tried in the 2.3 with the single point (maintainer, 2026-11-01): the barracks "also works". Not tried: the 2.6.1, the gymnasium/arena, temple and village (same shape, untouched); the long game against the Roman AIs, and the icons and attack sounds of this build.
- Pictures (maintainer's review, same bug as AsvrMod PR #40): `tagCollisions` renames by file name alone, so references that meant another copy of the name pointed to `<name>_w23.BMP`, which was never written (blue square). `tools/lib/greek-2x-refs.js` (new, run by `greek-2x.js` after `tagCollisions`; `ported-patch.js` untouched) puts those names back, puts back 7 sound-entity names the rename never reached (`attack="MyrmidonFight"`) and the order names that spell a renamed class (`Gaul Spearman`), and **stops the build** when a picture, sound, sound entity or `entity=` does not resolve (allow-list with reasons in NOTES.md). 2.3 after the fix: 3329 references, 0 unresolved, 16 allowed. The renamed random-map templates (`COMPETITIVE.RM_w23.XML`, `REAL WORLD.RM_w23.XML`) are kept on purpose (maintainer's decision, evidence: the AsvrMod test of PR #40, another mod); not tried with this set. `THERMAE.SC_w23.XML` is an open question, see NOTES.md.
- Voices: the port had only the Spanish pack's takes for every language; now `currentlang/voices` has the English pack's, `local/spanish` and `local/italian` their own (NOTES.md, *What was ported*). **Not heard in game.**
- Not tried in game: conquests (`interface=15` assumes this set alone in the profile), the Imperial heroes in `wimperial`'s arena, two civilization mods active together, the Italian and Spanish voices.

## Fix after the 3.6 review: the menu skin lost its 24 `UI/MENU/*.BMP` (rebuilt, 2.3)

`tools/greek-2x.js` passed `keep: /^(currentlang|ui\/menu)\//` **without the `i` flag** to `gameFilesToPatches`, and the mod's folders are upper case (`UI/MENU/...`), so the skin's own pictures (buttons, frames, arrows, scroll bars: 24 files, 632 to 144,152 bytes) were dropped from the port while its `MENU` layout patches stayed. Fixed in #39 (the owning layer; same flag on the `tagCollisions` skip, which already ignored case itself). The tool now also **stops** if `work/greek-2-3-raw` is missing when the 2.5.3 or 2.6.1 is built (before, the Legacy exclusion silently dropped 22/28 files instead of putting the 2.3's back), and every line of `raw/greek-mod-2-3-left-out.txt` has its reason (`MAPPLACE.INI` and `VIEWCONQUESTMAP.INI` stay out: the editor's own INIs, global, not the skin).

**Proof (rebuilt from this branch, one build at a time):** `diff -rq` against the folder installed from the earlier build, ignoring `NOTES.md` and `.fingerprint`, gives exactly **one** line: `Only in ported/greek-mod-2-3/UI: MENU` (the 24 files, the same bytes in the three versions). Rebuilt from a clean worktree under `community-mods/.wt/` it gives the same result and no other difference with this worktree's build but `NOTES.md` (edited after the build). `validate-mod.js --game --data`: 2609 files, 0 errors, 68 warnings. Names check: 230 scripts read, 0 problems. `shared-paths.js`: the 24 files collide only with the game's (approved cosmetic exception), 0 class ids in common. Not installed in `$G`; the new files are not tried in game.

## Fix after the 3.6's in-game test: the menu patches were at the wrong path (rebuilt, 2.3)

The skin's 11 layout INIs were written to `patches/DATA/INTERFACE/MENU/`, where they are in `data.pak`. The engine matches a patch by the exact path the game **opens** (`PatchApply(rel)` in `src/mods/patch.cpp`, called from `src/mods/vfs.cpp`; no alias between the folders) and the game opens the screens as `menuini/<name>.ini`. The maintainer's log of the 3.6 showed it: only `data/interface/menu/template.ini` was applied (23:34); after that port's patches moved to `patches/menuini/` the log (23:52) reads `patch: (mediterranevm-3-6) menuini/mainmenu.ini applied`, `menuini/template.ini`, `data/interface/menu/template.ini`, `menuini/mpgamemenu.ini`, `menuini/settings.ini`. So in these ports **10 of the 11 patches were dead** (never read; only the template had a path the game opens). `tools/greek-2x.js` (#39) now writes every skin INI patch to `patches/menuini/<name>.ini` and keeps `template.ini` in both places; same rule as `tools/lib/menu-skin.js` on main (maintainer's commit `bd47ba31`), written here so this stack does not depend on it; idempotent when #39 is rebased on main.

**Proof (rebuilt from this branch, one build at a time):** against the folder installed from the earlier build (ignoring `NOTES.md` and `.fingerprint`) the only differences are the 11 patches moved with identical bytes (`ADVENTUREMENU`, `CONQUESTGAME`, `GSCHAT`, `MAINMENU`, `MPGAMEMENU`, `MPMENU`, `OB_HALLOFFAME`, `OB_LOGIN`, `PREADVENTUREMENU`, `PROFILE`, `TEMPLATE`), `TEMPLATE.INI` also still at the old path, and nothing else. A clean worktree under `community-mods/.wt/` gives the same bytes. Names check: 230 scripts read, 0 problems. **Not tried in game for this port**: the 3.6's log proves the rule, not this port (the 2.x skin screens were never seen).

## Fix: the skin's lists of names (rebuilt, 2.3)

`iniChanged` only sees `Key = value` lines, but what a menu draws is decided by the **lists of bare names** (`[MainMenu Objects]`: `Caption`, `IniBackFrame`, `TipsBackFrame`, `Version`...); a section the skin defines but does not list is never drawn. Found with the 4.2: its menu showed "Next" and "More Info" with no Tips panel, no frame behind the buttons and no version text, and the maintainer saw it fixed in game after the fix on main (`a61f84f3`, `tools/lib/menu-skin.js`). `tools/lib/menu-lists.js` is **this stack's own copy of the rule** (no dependency on that commit): for every list that differs it writes `-line` for every line of the game's list and `+line` for every line of the target list, in order (`sdk/patches.md`), inside the same `patches/menuini/<name>.ini` as the keys.

**Made from the 1.40 files, so the lists are compared 3-way with the 1.40's** (only what the mod itself edited is applied to HD's list). Against HD alone, MAINMENU would show the mod "dropping" `Versionn` and "adding" `Version`/`Copyright`/`TipsBackFrame`, which are HD's own changes since 1.40; a plain `-HD/+mod` would have undone them. Measured on the original (read-only): the mod edited the lists of **5** menu INIs: `CONQUESTGAME` (+`Shield8`..`Shield11`), `GSCHAT` (+`PlayerLogDarkBack`), `MAINMENU` (removes `NextTipButton` and `MoreInfoButton`; no Tips panel), `OB_LOGIN` (+`SocialText`, `Back`), `OB_PROFILE` (+`T1Race9`). `PREADVENTUREMENU` differs from HD only by HD's own `Caption`. Visible loss in the first build: the extra shields on the conquest screen, the dark back of the chat log, the online login/profile extras and two orphan buttons; the version text and the main frame were NOT lost (HD's are kept).

**Proof (one build at a time, from this branch):** against the folder installed from the earlier build (ignoring `NOTES.md` and `.fingerprint`) the only differences are the INIs that gained list lines (and the path move of the previous fix); `work/menuprove2.js` checks that every old line is still there and every added one is a section header or a `+`/`-` line. `CONQUESTGAME`, `GSCHAT`, `MAINMENU`, `OB_LOGIN`, `OB_PROFILE` (new as a patch) changed.. A clean worktree under `community-mods/.wt/` gives the same bytes (`diff -rq` 0, `NOTES.md` aside). Names check: 230 scripts read, 0 problems. `validate-mod`: 0 errors. **Not tried in game for this port.**

## Fix: the main menu was not faithful to the original (rebuilt, 2.3)

The maintainer's screenshot of the installed 2.6.1 main menu: sepia background, button column at x~565-811 from y~10 (HD's), no logo. Two causes, both checked against the original (2.3's `zGreek.pak`/`data.pak` or flat folder), read-only first.

**1. Keys mixed up by the merge.** `tools/port-140.js` (shared, not touched) merges a 1.40-based mod's INI into HD's with a by-key fallback: a key whose section HD lacks lands on the *last* section of HD that has a key of that name. Against the original, **10 of the 119 patch keys** were wrong: `[CaptionImp] Type = BmpScroll` (the original's is `Type = Button`: a static logo at 90, H-156, 556x66; the scroll with `Speed`/`UpdateTime` is its `[Back]`, commented out of the list), a loose `[back] Speed/UpdateTime`, `[InfoList] Style/VAlign`, `[Shield7] RectWH`, four of `[NickList*]`; and the mod's `Width = 360` of the conquest screen was missing. `tools/lib/menu-lists.js` `modKeys()` (#39) now writes the Key = value lines from the mod's own file section by section, 3-way with the 1.40 (no fallback; HD's section with the same `Id` stands in for a renamed one: the mod's `[Version]` is HD's `[Versionn]`, both `Id = 0x1022`). The only line left that the original does not have under that name is the deliberate `[Versionn]` text/rect.

**2. The button column.** The original TEMPLATE has `ButtonSpacing=42`, `ButtonXStart=%ScreenRight% - 272`, `ButtonYStart=25` (HD: 40 / 564 / 10), and our `patches/menuini/TEMPLATE.INI` had exactly those. The game's own cache shows what the engine does: `imperivm-resurrected/_cache/patched/menuini/template.ini` HAS them; `imperivm-resurrected/_cache/template/1920x1080/template.ini` (the file the main menu reads: `TmplIni=data/interface/menu/template-1920x1080.ini`) is HD's unpatched 564/10/40. Fix on the mod side: the same three values are also written in `[MainMenu Params]` of `patches/menuini/MAINMENU.INI` (what the 4.2's and 1.8's columns do; screen Params are patched normally); the template patch stays. The other screens of the original carry their own `ButtonSpace`/`ButtonXStart`/`Button<N>Rect` and are patched with them; `MPMENU` and `PREADVENTUREMENU` only read the template's rects and still get HD's column from the mod side (they could be given the same Params).

The original has no frame behind the buttons (its list has no `IniBackFrame`), and `[Copyright]` has no `Text` in it, in HD or in the 1.40; whether the engine fills `Id = 0x1020` itself is unknown.

**Proof (one build at a time, from this branch):** against the folder installed from the earlier build, the only differences are `patches/menuini/CONQUESTGAME.INI` (where present), `GSCHAT.INI` and `MAINMENU.INI` (`work/menuprove3.js`: nothing outside `patches/menuini/*.INI` differs). Compared again with the original: only the deliberate `[Versionn]` and the three new `[MainMenu Params]` keys are not in it. Clean worktree under `community-mods/.wt/`: same bytes. Names check: 230 scripts read, 0 problems. `validate-mod`: 0 errors. **Not tried in game.**

## Validation after the permission change (2.3; this supersedes the counts above)

`validate-mod.js --game --data`: 2611 files, 0 errors, 68 warnings. References (stops the build): 3329 checked, 0 unresolved, 16 allowed. Names check: 230 scripts read, 0 problems. Build hash `c2ed8590ee9d` (the whole folder, with the NOTES.md of this commit): the same from my worktree and from a clean worktree under `community-mods/.wt/` that built the stack bottom up (2.3, 2.5.3, 2.6.1, 3.6), `diff -rq` 0 outside `NOTES.md`. The builds depend on the ports below them (what the build shares with another port is renamed), so the clean check builds the layers in order. Not installed in `$G`.

## Update 2026-11-02: main merged, the default commands, the checks (2.3)

- Merged `origin/main` (#56, #60, #55/#57/#58, #46, #49). `validate-mod`: 2611 files, 0 errors, 68 warnings. Names check: 230 scripts, 0 problems. Hash `2c5e218922f3` (before the conquest-screen fix of 2026-11-03; now `af6dad9650b9`).
- `tools/check-conquests.js`: **2 conquests, 0 damaged** (before: `mediterranean (w23).BFHP` was cut, 'NUL bytes from 6574'). Conquest folders complete: both 12 files (8 territories each).
- `tools/check-minimap.js`: **6 missing (4 renamed + 2 absent) -> 0**.
- Default commands: the 2.3's clones have no map of their own (0 of 186), so nothing needed fixing; the check is in the build and finds **0** (troops linked in game: the peltasts).
- Against the installed folder: +30 minimap/outline bitmaps, 30 renamed, 2 conquests changed; classes and scripts identical.
- Tried in game (maintainer): the menus, short matches, peltasts linking. NOT tried: the strategic map with the renamed bitmaps, the conquests after the fix, wagons/wild horses/ships by right click.

Merge commits only (main -> #39 -> #42 -> #43 -> #51); nothing force-pushed. Hashes are of the folder without `NOTES.md` (the NOTES carries them); each was built in my worktree and again, bottom layers first, in a clean worktree under `community-mods/.wt/`: same bytes. Not installed in `$G`.

## Update 2026-11-03: the conquest screen's shields strip, Greece's index (2.3)

- **Found in game** (`mediterranean (w23)`, `1c2ecebf`): the shields strip drew the Roma shield over the Hellas shield in slot 1 and left slot 2 empty (Caesar's conquest: `[Hellas] -> arrow -> [selected]`).
- **Bisect (maintainer):** removing Shield8..11 (duplicated `Id = 0x1037`): no change. Seven `Test` conquests (one factor each: `state` in the folder's xml, the 4.2's picture folder, `user_interface`, Greece last, Greece `interface` 4, HD's and Caesar's Mediterraneans) under the 2.3's layout: overlap in all seven. With the 2.3's `CONQUESTGAME.INI` deleted (HD's layout): right. So the cause is the mod's own patch; which key exactly was not isolated, and I could not explain it from the decompilation. HD's layout covers Hellas with the info frame.
- **Fix:** `tools/lib/conquest-layout.js` replaces the patch with a **layout-only** one from Caesar Mod 1.1.0's numbers (PR #49): 17 sections, only `RectWH`/`Width`, no list lines, no Shield8..11 (153 lines -> 41). **Greece:** explicit `"index": 60` in `civs/wgreece.json` and `interface="60"` in the Greece territory of both conquests; `docs/CIVILIZATIONS.md` (EN, ES): 60 = `wgreece`, 61-63 reserved.
- **Checks:** `validate-mod` 2611 files, 0 errors, 68 warnings; names 230 scripts, 0 problems; `check-conquests` 2 conquests, 0 damaged, folders complete; `check-minimap` 0; default commands 0; Legacy: 97 same bytes, 4 other, 0 class ids. Hash (without `NOTES.md`) `af6dad9650b9`: my worktree = clean worktree.
- **NOT tried:** Caesar's layout on the 2.3 (the maintainer installs it next); **starting a 2.3 conquest as Greece**; `ConquestRemake (w23)`. The 2.5.3, 2.6.1 and 3.6 ship their own `CONQUESTGAME.INI` patches (not changed): whether they overlap is unknown.

## Update 2026-11-03 (2): Quit at the corner (0,0) in the 2.3's conquest screen

- **Found in game:** with the layout-only patch, Quit was drawn at (0,0). **Cause:** the engine evaluates `RectWH` formulas in the order of `[ConquestGame Objects]` (HD: BackImage, GameMap, Start, Save, Quit, Select); a control not created yet is 0. Caesar's `#left(Save)#` formulas work there only because its patch reorders the list; mine does not. My mistake.
- **Fix:** `[Start]`, `[Select]`, `[Quit]` are absolute (`#%ScreenRight%-305#`, `#%Altezza%/2+200+44#` / `+88`). **Build check:** `forwardRefs` in `tools/lib/conquest-layout.js` stops the build if any section of the patched list uses a control created later (rule: *a layout patch must not reference a control created later*). The other 16 sections audited: none.
- **Other ports (installed, read-only):** Caesar, CGWAR, Community, 4.2, 2.5.3, 2.6.1, 3.6, Legacy: no forward reference; the 1.8 has no patch of this screen.
- **Checks:** `validate-mod` 2611 files, 0 errors; names 230, 0 problems; `check-conquests` 2, 0 damaged; hash without `NOTES.md` `af7324c71dea` (mine = clean worktree). **NOT tried in game:** this fix.

