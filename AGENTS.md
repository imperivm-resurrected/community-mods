# AGENTS.md

Rules for agents and contributors working on this repo. The [docs](docs/README.md) have the full detail of how to port a mod and what each tool does.

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

## Documentation

- English is the base language: `README.md` and `docs/`. Spanish lives in `README.es.md` and `docs/es/`, with the same file names.
- Change a guide, change its Spanish copy in the same commit. The tables (`MODS.md`, `MISSING.md`, `DEAD-LINKS.md`, `PENDING.md`, `AUTHORS.md`) are data and exist only in `docs/`, in English.
- New guide: add it to `docs/README.md` and `docs/es/README.md`.

## Tables

- `docs/MODS.md` is the source of truth and is edited by hand. `docs/MISSING.md` and `docs/DEAD-LINKS.md` are kept with `node tools/split-missing.js`.
- `docs/PENDING.md` is generated: change `docs/MODS.md` or `tools/pending.js` and run `node tools/pending.js`. Never edit it by hand.
- `node tools/sync-table.js` sets *Type* and *Status* from each `mod.json`. The GameBanana link is added by hand.
- `node tools/build-table.js --force` overwrites manual edits. Only in a scratch copy.
- `OUTREACH.md` and `SCREENSHOTS.md` are not in git.

## Porting

- Pick the tool by the row's *Type*: `wrap-map.js`, `shrink-mod.js`, `port-140.js` or `imperivm1.js` (table in [docs/PORTING.md](docs/PORTING.md)).
- Hand fixes go in `extras/<id>/` (the final files, `mod.json` with credits, and a `NOTES.md` that says what was changed and why), never only in `ported/<id>/`. The port must be rebuilable from the original download plus the repo.
- Compare against the original before saying a port is complete: files identical to the game are left out on purpose, so a file missing from `ported/` is not a missing file.
- Validate with `validate-mod.js --game`, then try it in the game and read `Logs\imperivm\imperivm-mod.log`. Say in the notes what was tried in-game and what was not. A comparison of files does not prove a mod works.
- A mod cannot ship executables or DLLs. Say in the notes what the original did through its `.exe` or `winmm.dll` that the port cannot carry.

## Civilizations are independent

**The game's 8 civilizations are never modified by a mod.** A mod that adds or changes a civilization ships it as **its own civilization, next to the game's**, and it must work on its own and together with any other civilization mod, 100%. The player activates the mods they want and each civilization is one more in the lobby: "Gauls" stays HD's, "Gauls (Greek Mod 1.8)" is the mod's.

- **New civilization (Greece)**: its own `civs/<id>.json` (`id`, `race`; no `index` and no `letter`, see *Prefixes* below), class ids, entity folders, commands and scripts. Nothing is shared with another mod by name or by path.
- **A game civilization the mod changes** (stats, sprites, sounds, behaviors, commands: anything that differs from HD in what it does): the mod ships it as **another civilization**, cloned from HD (`clone-civilization.js` in the SDK) with the mod's changes on top, with its own `id`, `race` and class ids. HD's civilization stays as it is. This is also how a **pure balance mod** (Community Mod, Caesar Mod, AsvrMod VII...) is ported: one clone of each of the game's civilizations, labelled with the mod, and the **room set** (imperivm-resurrected#38) lets the host allow only that set so the lobby is not flooded. The mod is never an exclusive ruleset that edits HD's classes (decided in #15). The model is `tools/mediterranevm-alpha.js`; `tools/lib/clone-civs.js` has the options (`asBase`, `neutral`, `keepImp2`, `cloneAllOrders`, `branch.hide`).
- **Shared base classes** (`Hero`, `Melee`, `Ranged`, `BaseBarracks`…): a mod's change to them is applied **inside the copies' own classes**, never to HD's base class, which every other civilization inherits.
- **What is not a civilization's** (`const.ini`, `items.xml`, `formations.xml`, game scripts, interface): only as a **patch** that adds its own part (`patches/`, as CGWAR does for commands), never as a whole file in the same path as the game's or another mod's. Patches from several mods add up. If the change only existed to make the old civilizations work, it is not ported.
- **What a civilization is, it is from the start; nothing of it is chosen later.** If a mod's civilization has something built into it (a branch, a variant, a unit set, a research that only picks one of several options, a mode that turns it into another), that is the civilization: it is written into the civilization's own classes and commands, and **no town hall, arena, tavern or other building offers to choose it, change it or switch it on afterwards**. A mod that let one Rome become Republican, Imperial or Punic in the game makes **three civilizations**, each with the commands of its branch already in its classes. The lobby is the only choice. Do not port the choosing mechanism (`ChooseXxxRome`, `R*_Enable_Or_Disable_Cmd.vs`, `RHT_SCELTA_ROMA`, `Imperial_Administration`/`Republican_Administration`, `CmdEnable`/`CmdDisable` that open or close what the civilization is), and do not drop the content behind it: each branch is ported as its own civilization. When the original builds a civilization out of such a choice, the ported mod has one civilization per option, never a civilization with a choice inside.
- **Old engine tricks are not ported**: the `rand(776+player)` sentinel, the launcher and its `gbr.exe`, the town hall choices above. They were patches to fit several civilizations in a 1.40 game with no mods. Here each one is a civilization of its own (the lobby is the choice).
- **Names and paths**: if two mods use the same class ids, entity folders, templates (`Greek Town N`) or script names, the one being ported is renamed (as `tools/cgwar-greece.js` did for CGWAR). Never touch another mod's files.
- **Prefixes** (engine #37): a new civilization **derives its prefix from the id** (1 to 4 characters) and has **no `index`** (the engine assigns it); do it as `tools/gbr-tactics.js` does. The one-character letters and explicit indices already published (the three Greek mods, 30-49) stay as they are: renaming a prefix renames every class of the mod. **Two ports with the same derived prefix cannot be active together** (the engine ignores the second): pick an id whose prefix nobody has (Mediterranevm uses `mgaul`, `mrome`... for that) and check [docs/CIVILIZATIONS.md](docs/CIVILIZATIONS.md), which lists them. Add a row there for each new civilization, and the prefix to `sdk/prefixes.md` of the SDK repo.
- **Names the player sees**: the room's set is named after `name` in `mod.json` and carries the mod's **version** (`Greek Civilization Mod 4.2`). The lobby dropdown cuts a name at about 22 characters (`Rep. Rome (Rattlesmake)` is the limit): short names, `<civ> (<author or mod>)`.
- **Scripts of the game that the mod edited** never go at the game's path: each edit is a **copy with a name of its own** (`NAME_G18.VS`, `_g42.vs`) that the mod's classes point to, or a **patch** that only acts on the mod's own researches, commands or classes (`tools/lib/own-scripts.js`, `greek-ai.js`, `own-ai.js`, `mode-rules.js`). Build the copy as HD's script plus the mod's edits (`git merge-file` HD, 1.40, mod): HD often has the edit already. Test the civilization with `Mod_TrueRace(obj)` / `Mod_PlayerCiv`, never `GetPlayerRace` or `.race` (a clone's race is not its base: a behavior script that returns without `Sleep` is restarted forever). The class ids a script writes as text are each clone's own. What the engine calls by name and that returns a value goes as a block inside the game's script that only runs for the mod's civilizations; a compilation error there stops that script for every AI, so read `imperivm-mod.log`. `CONST.INI` / `AI.INI` patches only add keys the game lacks. The same goes for any global `.ini` of the game: a value the game already has (e.g. `stamina_cost` of `Disease attack` in `UNIT_SPECIALS.INI`, read by the section's name) cannot be scoped to a clone, so the change is left out and written in `NOTES.md`; never add unknown sections to `UNIT_SPECIALS.INI` (it can crash the game). Game modes and `rules/game.json` reach only the mod's classes.
- `incompatibleWith` is **not** a solution. It is accepted only as a temporary state for a port that is not finished, and it goes in the mod's `NOTES.md` under *Pending: independence* with what overlaps. A civilization mod is not done while it needs it.
- **Check before saying a port is complete**: list the class ids, entity folders and file paths it shares with every other civilization mod in `ported/` (there must be none outside `patches/`), and keep the result in `NOTES.md`. Then test two of them active together.
- **Maps that place a mod's classes** (`wrap-map.js` `requires`) must keep working when the classes are renamed. For a balance mod ported as copies, the maps that `require` it are **rewritten to the copies' classes** (the `fresh` renaming in `tools/lib/clone-civs.js`; `tools/hpfs.js` scans them) and then need the mod's set of civilizations; the room filter does not override what a map places (decided in #15). For other renames a class can keep its old id as `altid`, but two mods cannot share an `altid`. Write the case in `NOTES.md`. Pending: the maps that `require` the 4.2, the 1.8 or CGWAR (#8).
- Done: `cgwar`, `greek-mod-1-8`, `greek-civilization-mod` (the three Greek mods) and `mediterranevm-alpha` are independent of the game and of each other. The Roman branches are civilizations of their own too (`cgwarimperial`, `cgwarrepublic`, `rome18`, `empire18`, `punic18`; the 4.2's in `greek-4-2.js`). Pending, in each `NOTES.md`: what was not tried in game. Pending as ports: the balance mods (#17-#22, #29).

## World rules packs (what a clone cannot carry)

Some of what a balance mod changes cannot be scoped to a clone: a value of a global `.ini` (`UNIT_SPECIALS.INI`), the game's neutral classes (`Chest`, `Obelisk`, the outposts), the capacity of a base class every civilization inherits, a script edited at its own path (`UNIT_ON_KILL.VS`), the engine's rules read by name. Do not drop it and do not force it into the civilizations: it goes in a **separate pack of its own**, `<id>-rules`, next to the mod's civilizations pack.

- **The civilizations pack never changes the game.** The rules pack does, on purpose, for every player in the match while it is on. It is optional, never offered as a civilization, and says so in its `mod.json` description (in the three languages): "changes the game's own classes/values for everyone".
- **The cut**: if it can be written inside the clone (stats, costs, commands, base-class changes copied into each clone, scripts as copies), it goes to the civilizations pack. If the game reads it by name or from a class of its own that nobody can duplicate, it goes to the rules pack.
- **Only patches** (`patches/`, `<set select=...>`), with the mod's own ids for items, scripts and commands. Never a whole file at the game's path.
- **Two rules packs that edit the same line or class collide.** The manager already treats it as "use only one" (it compares paths). Say in `NOTES.md` which ones overlap; no `incompatibleWith`.
- A mod with nothing global has no rules pack. A mod whose only content is global (`oggetti-in-tutte-le-strutture`) is just a rules pack, with no clones.
- Anything you leave out of a civilizations pack because it is global goes in `NOTES.md` under *Left out because it is global*, so the rules pack can be built later.

## Conquests and the engine

- **A conquest collides by path like an adventure does.** A mod's `Conquests/<name>.bfhp` and `ConquestMaps/<folder>` at the path of the game's (`mediterranean.BFHP`, `1 - GBR europe`) or of another port's replace them, whatever the bytes. They ship next to them: `tools/lib/conquests.js` renames the `.bfhp` and its picture, the folder, both `data=` (the `territories.xml` inside the `.bfhp` and the one in the folder) and adds `(<label>)` to the name in the menu. Call it **before** `tagCollisions`, which renames the files of a folder one by one and leaves the conquest broken.
- `originals/game-data` must have the game's `Conquests/` and `ConquestMaps/` (they are not in the paks: copy them from the game folder), or the collision is not seen. `shared-paths.js` compares with the HD packs and the ports only: a file of the game outside the packs is not in its result.
- **The race of a conquest's player is the `interface` of its `<territory>`**, in the `territories.xml` **inside the `.bfhp`** (the one in `ConquestMaps/` has fewer attributes and no race): 0-7 are the game's races, a civilization of a mod is its `index`. No map file decides it: every battle map of a conquest shares the root `player<N>.xml` (defender player 2). The human's town is the `MutableStronghold` and `MutableVillage` of player 1, replaced by the templates of that race. A mod whose conquest has a territory for its civilization sets `interface` to the civilization's `index` (`tools/greek-1-8-civs.js`). It needs a DLL with imperivm-resurrected#45; with the 1.0 release the value is ignored and the player keeps the room's race. Say it in `NOTES.md`.
- **Show the file or the log line before saying how the game decides something.** Here the first two explanations (a race in the maps, then "no attribute exists") were wrong because only the loose copy of a file was read. Read inside the container (`node tools/hpfs.js`). For the engine, the Ghidra export of `gbr.exe` (same SHA as Steam's) is in `imperivm-iii-research/export/decomp/` and `analysis/modules/P*.md`: look there before opening an engine issue or saying the DLL cannot do it.
- **Testing a change of the DLL**: `tools/build-dll.sh` of the workspace (outside the repos) builds `winmm.dll` with clang-cl from Linux and `--install` copies it. For a worktree run its same `cmake` with `-S <worktree>` and its own build folder, and pass `-DCMAKE_RC_FLAGS` with the xwin include folders (copy the value from the main build's `CMakeCache.txt`, or the `.rc` step fails on `winver.h`). Keep the DLL that was there (`winmm.dll.pre-<change>`). **Restart the game**: it keeps the loaded DLL. Then read `imperivm-mod.log` for the line that proves it (`starting city of player 1 (civilization 32 ...)`), not only the screen.

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
- Add a new tool to the Tools table in [docs/TOOLS.md](docs/TOOLS.md) (and [docs/es/TOOLS.md](docs/es/TOOLS.md)).
