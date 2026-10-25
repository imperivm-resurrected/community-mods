# La Reconquista 2010 (JVLIVS CAESAR)

Row 8. `MOD_LARECONQUISTA_2010.rar` (3.5 MB, forum t172) holds `MOD_LARECONQUISTA.exe`, a WinZip self-extractor (a zip: `bsdtar` opens it) with 803 loose files for a 1.40 install (`DATA`, `UNITS`, `UI`, `OUTLINES`, `CURRENTLANG`) and a `.url` to the forum. It is the mod the MCI was built on (row 7). Its `COPYRIGHTS.TXT` says "MOD LA RECONQUISTA Copyleft (k) 2010 Jvlivs Caesar" and nothing else: no licence to name, so `mod.json` quotes that line.

**This port is the game's eight civilizations as the mod changed them, each a civilization of its own next to the game's** (AGENTS.md, *Civilizations are independent*). The mod adds no civilization. The game's own are untouched.

## Rebuild

```bash
mkdir /tmp/lr && bsdtar -xf originals/forum/la-reconquista-2010/files/MOD_LARECONQUISTA_2010.rar -C /tmp/lr
mkdir originals/la-reconquista-2010 && bsdtar -xf /tmp/lr/MOD_LARECONQUISTA.exe -C originals/la-reconquista-2010
node tools/port-140.js originals/la-reconquista-2010 ported/la-reconquista-2010 --id la-reconquista-2010 --name "La Reconquista 2010" --version 2010 --category "Gameplay & Balance"
node tools/reconquista-2010.js
```

`ported/la-reconquista-2010/` is not in git (`.gitignore`). It needs `originals/game-data/` and `originals/game-140/` (docs/SETUP.md). `tools/reconquista-2010.js` is not idempotent: it works on the output of `port-140.js`, so rebuild from the first command.

## The civilizations

Ids `gaul2010`, `britain2010`, `carthage2010`, `egypt2010`, `germany2010`, `iberia2010`, `rome2010` (Republican Rome), `imperial2010` (Imperial Rome). **No `letter` and no `index` in the table**: the SDK derives the prefix from the id (first three characters: `Gau`, `Bri`, `Car`, `Egy`, `Ger`, `Ibe`, `Rom`, `Imp`) and the game assigns the index (imperivm-resurrected#37). Lobby names: "Galos (Reconq.)", "Rep. Rome (Reconq.)"... at most 19 characters (the dropdown cuts at about 22; with "(Reconquista)" the Roman ones were 23). All eight have `ai: true`, `random` at its default and no `replacesBase`, `variant` or `ownAi` (#38).

**Set name (#38).** The host sees this port as the set `La Reconquista 2010` (`name` in `mod.json`): it names the mod and the year, so it is not confused with the MCI (`Mod Comunidad Imperivm (MCI) 9.0`, built on this mod) nor with the two Reconquista adventures of Kalyga (maps, no civilizations).

| Civilization | Classes | Own orders | Of the mod's own (new classes) |
|---|---|---|---|
| `gaul2010` | 92 | 28 | longbowman, captain, spearman guard, ship, transport, rescue villager, 8 extra heroes, sentry 2 |
| `britain2010` | 65 | 22 | longbowman, captain, bronze spearman guard, ship, transport, sentry 2 |
| `carthage2010` | 69 | 31 | javelin thrower (long javelin), captain, Libyan guard, ship, transport, 4 extra heroes, sentry 2 |
| `egypt2010` | 63 | 17 | longbowman, captain, guardian guard, transport, sentry 2 |
| `germany2010` | 68 | 15 | longbowman, captain, swordsman guard, rebel javelin thrower and liberatus, ship, transport, sentry 2 |
| `iberia2010` | 69 | 18 | longbowman, captain, defender guard, ship, transport, 3 extra heroes, sentry 2 |
| `rome2010` | 75 | 23 | longbowman, captain, principle guard, transport, 2 extra heroes, sentry 2 |
| `imperial2010` | 47 | 8 | 2 extra heroes (the changed heroes: 2600 health, speed 140) |

Plus 32 orders the mod added for several civilizations at once (`DATA/COMMANDS/RECONQUISTA.XML`: generals school, mercenaries guild, hire another people's unit, modernize army, auto population, auto call peasants, equip in iron...), each with the copies of every civilization that has it as sources. 9 base classes with no race that the mod adds and its copies inherit (`LongRanged`, `Piked`, `SentryOutpost`, `CaptainOutpost`, `ShipTransport`, `ShipSFishing`, `TraderRescue`, `IronMine`, `Main`) keep their ids with the tag `_rec` (below). `patches/DATA/ITEMS.XML` adds the 79 items the mod added (the hero ranks Captain, Officer, General, Leader; the armoury and assassin items; the charms...).

## What `tools/reconquista-2010.js` does

It runs after `port-140.js` (3-way merge with HD over 1.40; the report is `raw/port-140/la-reconquista-2010.md`) and follows `greek-1-8.js` + `greek-1-8-civs.js`:

1. The 163 classes of the game the mod re-defined (stats, costs, specials) and its command files leave the port and go to `originals/la-reconquista-2010-merged/` (HD + the mod's changes), with `base-changes.json`: what the mod changed in the base classes (`Unit` 27 elements, `Hero` 29, `Outpost` 21, `BaseTownhall` 19, `BaseVillage` 16, `ShipBattle` 10...).
2. Every file of the game the mod edited is left out, except what it **adds** (items, as a patch): see *Left out*.
3. `tools/lib/clone-civs.js` clones each civilization from HD with the mod's version of its classes and orders on top, and writes the base-class changes inside each copy.
4. `tagCollisions` (tag `rec`) gives the mod's own names where another port has the same path with other bytes or the same gameplay file: 9 classes, 105 files (83 scripts, 12 item scripts, icons, 7 sentry entities in the game's archer folders). The MCI shares almost everything with this mod.

Four fixes in the shared tools, all found building this port (the others rebuild with them):
- `tools/port-140.js`: a mod with no `rle.mmp` stopped at its first `.rle.mmp`. This one ships 86 headers, all byte-identical to HD's (the new units reuse the game's sprites), so they are dropped.
- `tools/lib/clone-civs.js`: the test "is this script in the game or the mod" compared `data/subai/x.vs` with the game's paths without the `data/` prefix, so every reference to a game script that the port did not itself contain was removed from the copies (262 per civilization here). Fixed. Also: `letter` and `index` are optional (SDK prefix and automatic index); a name with an apostrophe in a patch selector stays `@name='People's Assembly'` (an `&quot;` version was tried in game and rejected: the game reads the value between the first and last quote; the validator does not catch it); and orders the mod added for several civilizations (not in the game's file, so the SDK's patch had nothing to patch) become `RECONQUISTA.XML` (`newCommands`).
- `tools/lib/ported-patch.js` `tagCollisions`: a file a mod adds inside a folder the game has (a sentry's `.ent.xml` next to the game's archer art) is renamed alone (`gameDirs`); before, the **folder** was renamed and every reference to the game's folder in every class followed it.
- `tools/compare-mods.js`: I added a column for this mod and took it out again (the report is about the Greek mods).

**First in-game test (2026-10-25): HANG at the start of a skirmish** (random coastal map, 8 players, AI civilizations of the mod, `Logs\imperivm\imperivm-mod.log`: `HANG: the main thread has not responded`, no script error before it). Cause: the game's `townhall_buildingsbehavior_t.vs` (the Germans' town hall) begins with `if (This.AsBuilding.race != Germany) return;`. `germany2010` has a race of its own, so the test is true, the script ends at once and the engine restarts it at once, for ever: the same loop that hung the 1.8 (see `extras/greek-mod-1-8/NOTES.md`). The Egyptian one (`townhall_buildingsbehavior.vs`, `race != Egypt` then `while (1) Sleep(100000)`) did not hang but left `egypt2010` without its Grain Trade and Religious Feast. `tools/lib/clone-civs.js` now gives each copy its own script without that test (`TOWNHALL_BUILDINGSBEHAVIOR_T_GERMANY2010.VS`, `TOWNHALL_BUILDINGSBEHAVIOR_EGYPT2010.VS`). The other game scripts that compare `race` (druid, priest, shaman: `.race == Gaul || ...`) only choose a branch: they do not loop.

By hand in the tool: the mod's `TAVERN.XML` ends with `Hire AnUbis Warriors` never closed (the file does not parse in the original): closed.

## Left out (and what happens to it)

| What | Why / next |
|---|---|
| 119 game files the mod edited: 80 `SUBAI` scripts (unit and hero behavior, outposts, villages, wagons, `unit_on_kill`), 25 AI scripts (`GetTacticsScript`, `TS_*`, `ESH_*`, `AI.INI`), `CONST.INI` (production 24%→40%/30%, `CmdBarMaxButtons`, hero constants...), `SKILLS.INI` (Scout becomes "Favourite Unit"), `PLACEOBJECTS.XML` (a Main Tent in the random map), `SCDEBUG.XML`, `002 RICHES.VS`, `COPYRIGHTS.TXT` | Game-wide: they would change every civilization, the game's included. `originals/la-reconquista-2010-merged/left-out.txt` lists them; `left-out-hunks.txt` the hunks of each script. The classes of the copies keep calling the game's scripts. **The scripts the mod added are shipped** (83) and the base classes' behaviors that name them are inside the copies, but they were written for the mod's own edits of the game's scripts (stamina loss on detach, ranks on kill, outposts selling food...): the copies run them over the game's versions. Open, see *To check* |
| The 163 classes of the game that are no civilization's (`Unit`, `Hero`, `Melee`..., `Well`, `Obelisk`, `Chest`, `Animal`, `Trader`, `Wagon`, `Gate`, `Outpost`...) and the changes to the base classes' own orders (`UNIT.XML`, `HERO.XML`, `OUTPOST.XML`, `VILLAGE.XML` for `BaseVillage`) | The base classes are every civilization's. Their changes are written inside the copies' classes (above); the orders only a base class has are not offered to anyone |
| Changes to the research orders shared by name (`ARENA.XML`, `BLACKSMITH.XML`, `TEMPLE.XML`, `TAVERN.XML`: costs and texts) | Same command for every civilization; the copies are added as sources of the game's definition. Pending, as in the 1.8 |
| `TOutpost` (race `German` in the game itself) and `TTent` (no race): not cloned by the SDK | `germany2010` has no outpost and uses the game's tent. The mod's changes to them are in `-merged/classes` |
| 8 entity files of the game's units (`CNUMIDIANRIDER`, `GHORSEMAN`, `ICAVALRY`, `RSCOUT`, `TAXEMAN`, `TTEUTONARCHER`, `TTEUTONRIDER`, `TVALKYRIE`) | New attack/walk animations whose frames the mod never shipped (no `rle.mmp`); they would replace the game's for everyone |
| Icons, sounds and outlines at a game path with other bytes | Same reason: left out by `gameFilesToPatches` |
| 11 edits of the game's items (`Eagle feather`, `King's belt`, `God's gift`, the charms...) | The game's items; only the 79 new ones are a patch |
| References to `unit_speed.vs` and `unit_food_modifier.vs` (base `Unit`) | The mod never shipped them: the game could not run them, removed from the copies |
| `Hero<unit>` editor classes | The mod has none |
| Maps and adventures | The mod ships none |
| Executables and DLLs | The only `.exe` is the installer (a zip). Nothing else: no `gbr.exe`, no `winmm.dll`, no launcher |

## Independence check (2026-10-24)

`node tools/shared-paths.js la-reconquista-2010` against the game and the six ports in `ported/`: **0 class ids in common with any**, **0 files in the same path with other bytes except the menu skin** (`currentlang/menubackground.bmp`, `menubackgroundimperivm.bmp`: kept on purpose, like the other mods: it is cosmetic and tells the player the mod is loaded). The MCI has 187 files with the same bytes at the same path (icons, `.ent.xml` of the sentries): cosmetic, one of them is used. No `incompatibleWith`.

## Pending: independence

- **66 order and item names are also defined by the MCI** (`originals/la-reconquista-2010-merged/shared-names.txt`: `generals school`, `MercenariesGuild`, `modernize_army`, the rank items `Captain`, `Officer`, `General`, `Leader`...). With both mods active the game has two definitions of each. `tagNames` (`tools/lib/ported-patch.js`) would rename them, but it renames every quoted string equal to the name, so `sig="auto_add_pop_start"` (what the engine dispatches by) and `display_name="Captain"` change too: not used. Needs a rule that renames the key and not the rest.
- **Imperial Rome** (`imperial2010`) trains the Republican units as in the game, and the mod's `trainMArcherLongBow` there trains `RomArcherLongBow`, a class of `rome2010`. Both are in this mod and always go together, but it is a dependency between two civilizations. Same as the game's Imperial Rome using `RVelit`.
- **Maps that place the mod's classes** (`wrap-map.js` `requires`): none in `ported/` places `GArcherLongBow`, `GaulCaptain`, `RebelLiberatus`... today; when one does, the copies are `GauArcherLongBow`... and no `altid` is kept. Decide per case (AGENTS.md, *Open*).
- The order names in the mod have the Roman typo `trainMArcherLongBow` for the Republican one; kept.

## Tried in game

**2026-10-25, Linux (Wine 11, GE-Proton), 1920x1080, profile with `cgwar` and `greek-mod-1-8` also active.**
- First build: skirmish on a random coastal map (huge, 8 players, AI of the mod's civilizations) **hung at the start** (cause and fix above). The log had no script error.
- Build with the fix: **starts and plays** (the maintainer's report). The content manager showed 7 patch errors in an earlier build (selector with `&quot;`, fixed: see the tool notes); none in this one.
- **Second test, 2026-10-25 12:14, `LogLevel=debug`, `LogFiles=1`, profile with only this mod** (the maintainer's report: "seems to work correctly"). Skirmish of 100 s with 5 players, mod civilizations among them (the starting cities were built with `Egy*` classes: 11 objects translated to `EgyHouse…`, `EgyTower`…; the log does not say which other civilizations were in the room), a save `test_la_reconquista`. Log: session ended cleanly, 0 errors, 3 warnings, none from the mod: `winmm` exports, GameBanana 728851 (not available), and `sounds/selection/egyptian_market.wav` not found. That sound is the game's own `EMarket` class pointing at a file HD does not have; `EgyMarket` inherits it. All 23 command patches of the mod and `items.xml` show `applied`; 8 mod civilizations added to the dropdowns (72 items). The only other missing file in the log is `units/ewvillager/ewvillager.pass`; HD's `EWVILLAGER` folder is the game's, not the mod's, and I did not check whether it has that file.
- **Not tried**: a room with only this set (dropdowns, random draw, AI choice), what each unit, hero rank, order and research does compared with the mod's original, two of the mod's civilizations against each other, a long game against the AI, multiplayer. The list below says what to try.

`validate-mod.js --game` (`dev-villoh`): 0 errors, 0 warnings (896 files); every XML of the port parses; `shared-paths.js`: only the menu skin in common.

To try, in this order, reading `Logs\imperivm\imperivm-mod.log`:
1. The mod loads and the lobby shows eight "(Reconq.)" civilizations next to the game's.
2. A skirmish with `gaul2010` against the game's Gauls: town, barracks (longbowman), a hero (rank items), an outpost, a ship at the shipyard.
3. Two civilizations of the mod against each other, and one of the mod with the game's.
4. The mod active with another civilization mod (`greek-mod-1-8`): no clash of names.
5. A copy's AI as opponent for a while (the engine restarts a behavior script that ends at once: `greek-1-8.js` reports the ones that can; here the scripts are the mod's own, not checked for it).
6. `Roma imp. (Reconq.)`: the barracks orders that name `RomArcherLongBow`.

## To check

- `raw/port-140/la-reconquista-2010.md`: 30 conflicts where the mod's side was used. 18 are scripts, AI and `COPYRIGHTS.TXT`: left out now. The 12 class and order ones are fine in `-merged`: the hero skills of the three heroes (the mod's list, with `Scout` first), `UNIT.SC.XML` (`in_battle` method), `ARENA.XML` (the mod's version of Rome Training / Shared Triumph parses), `GBARRACKS.XML` (`trainGHorseman` moved to the end, 160 gold: the mod's), `VILLAGE.XML`.
- The merge took the mod's side in `UNIT_ON_KILL.VS`, `UNIT_MOVE.VS`, `UNIT_ENTER.VS`, `HERO_*`: the game's statistics and fixes are lost *in the file*, but the file is not in the port.
