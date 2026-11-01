# Secuter Fun rules 1.5 (`secuter-fun-mod-rules`)

Row 312, issue #19, the global part of Secuter's Fun mod. Stacked on the PR of the civilizations packs (`secuter-fun-mod`, `secuter-fun-mod-grecia`, branch `secuter-37-38`). Built from the plain version's zip (`Secuter Mod Imperium.zip`), as the maintainer decided (one rules pack, the Greece version's differences below). **Permission: the authors' permission was granted to the maintainer, per the maintainer (2026-11-01)**; there is no document to quote.

**This pack changes the game's own classes, scripts and values for EVERY player in the match while it is on** (AGENTS.md, *World rules packs*; its `mod.json` says so in the three languages). It is optional, never offered as a civilization, adds no civilization and no set. It is only patches (`patches/`), plus new files with names of their own (`S_*.VS` item scripts, `Pyramid`, the Stonehenge's scripts). Nothing is shipped at a path the game uses.

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/secuter-fun-mod-rules.js
```

38 files, tracked (small). It unpacks the zip in `.scratch/`, runs `tools/port-140.js` and `tools/merge-secuter-fun.js` (HD + 1.40 + mod) and writes the patches. The same build twice gives the same files (md5 of every file). Every script patch is applied to HD's script with a copy of the engine's algorithm (`PatchScriptText`, `src/mods/patchxml.cpp`) and the build stops unless the result is the mod's script.

## What it carries

| Patch | What |
|---|---|
| `patches/DATA/ITEMS.XML` | The 8 items the mod adds, ids `s` + the mod's (`sGold1000`, `sTeschio dell'eroe`, `sGemma dell'energia`, `sGemma della furia`, and the Greek Mod 1.8's `sEmblem of Democracy`, `sEmblem of Oligarchy`, `sCharm of Athena`, `sCharm of Aegle` that the plain zip carries), and their 3 item scripts as `DATA/ITEMSCRIPTS/S_*.VS`. The mod's edit of the game's `Spoils of War` item (one `use_script` line removed) is not patched. |
| `patches/DATA/CLASSES/*.SC.XML` (20) | `<set>` / `<add>` on the `<properties>` of the game's own classes: the neutral objects `Chest` (respawns `sGold1000`), `FacePillar`, `LionThrone`, `Obelisk1`, `Obelisk2`, `RibCage`, `ScullTree`, `Wagon`, `BaseWell`, the ships `ShipEgypt`, `ShipL`, `ShipRome`, **the forts**: `Outpost` (capacity) and the per-civilization `GOutpost`, `ROutpost`, `COutpost`, `IOutpost`, `BOutpost`, `EOutpost`, `TOutpost` (food, gold, the garrison: slots 1 and 2), and the Stonehenge's two `<method>` (`show`, `ghost`). `Pyramid` (a Stonehenge of Egypt, new class) is an additive file. |
| `patches/DATA/SUBAI/OUTPOST_BEHAVIOR.VS` | The garrison of the forts, 25 directives (`@before`/`@after`/`@replace`) on HD's script: two more defender slots, arrays indexed by the fort's race. **Race guard**: see below. |
| `patches/DATA/SUBAI/ARENA_BEHAVIOR.VS` | 2 directives: `Sleep(1000)` → `Sleep(2500)` and heroes excluded from a check. A behavior of `BaseBarracks` and `BaseArena`: every barracks and arena of the game, for everybody. |
| `patches/DATA/CONST.INI` | `RushDamage` 6→5, `DefensePerEpicArmorLevel` 2→3, `RankPoints10` 2→250 (**values the game has**) and `SecuterMod`, `StonehengeShowTime`, `StonehengeShowTimeStep`, `StonehengeGhostTime`. |
| `patches/DATA/UNIT_SPECIALS.INI` | `[Disease attack]` `stamina_cost` 3→4 (an existing section and key; no section is added: AGENTS.md warns an unknown one can crash the game). |
| `patches/DATA/COMMANDS/STONEHENGE.XML` + `DATA/SUBAI/STONEHENGE_{SHOW,GHOST}*.VS` | The Stonehenge's orders `show` (Vista di lince) and `ghost` (Manto spettrale), 6 scripts. `MILITARY_ONDIE` of the civilizations packs spawns a ghost when `/StonehengeGhost` is set. |

## The `.race` trap (issue update 2026-10-30)

Secuter indexes arrays with `.race` (0-7). `OUTPOST_BEHAVIOR.VS` reads `DefenderCls3[.race]`, `DefendersMax3[.race]`... (6 reads). An object of another mod's civilization has a race of 10 or more and would read outside the arrays. The patch (as `q` does) puts `int nRaceIdx;` next to the arrays' declaration and, before the first read, `nRaceIdx = .race; if (nRaceIdx < 0 || nRaceIdx > 7) nRaceIdx = 4;` (4 is Imperial Rome, whose entries are empty); all the reads use `nRaceIdx`. Consequence: **the forts of the clones (`Sgaul`…) and of any other mod's civilization get no 3rd and 4th defender** — they keep the game's two slots (the clones carry the mod's values for those two in their own classes). The build checks that no `[.race]` is left in the patched script. The other scripts of the mod that index arrays with `.race` (`TTENT_BEHAVIOR.VS`, the AI's `DruidSkills.vs`, `ESH_NeedTech`, `ESH_ResearchTraining`) are not in this pack (below).

## Not carried, and why

- **The camps** (`GTent`, `BTent`, `CTent`, `ETent`, `ITent`, `NTent`, `RTent`, `ATTent`, `TTent2`), the mod's redefinition of `TTent`, `TTENT_BEHAVIOR.VS` and the lines of `PLACEOBJECTS.XML` that place them. **The engine's script patches cannot express the mod's `TTENT_BEHAVIOR.VS`**: it is a rewrite of the game's (80 lines added, 39 removed), a directive's anchor is a single line, the first time it occurs, and the replaced lines repeat in the script (`{`, `}`). A copy named in the camps' classes would run next to the game's, which the camps inherit (`CVXScriptClass::ResolveMethods`). Without the script the camps would spawn the game's Teuton army for every people. So none of the camps is shipped. What it would take (engine, not opened): a directive that replaces a whole inherited behavior (or a patch with multi-line anchors).
- **The Greece version's global differences** (the Greek camp `HTent`, the Greek outposts, `HHypaspista` in slot 3 of race 4 of `OUTPOST_BEHAVIOR.VS`, `MaxMyrmidonsValue = 50`, keeps `RushDamage = 6` and `DefensePerEpicArmorLevel = 2`, 13 lines of `UNIT_ON_KILL.VS`, 115 lines of `PLACEOBJECTS.XML`): not here, as decided. Greece (`zgreece`) is in the civilizations pack; its outpost class `ZgrOutpost` has the garrison of slots 1 and 2.
- The mod's `UNIT_ON_KILL.VS` / `UNIT_ON_ENTER.VS` / `MILITARY_ONDIE.VS` are *methods* inherited by every unit: they are copies named in the clones (civilizations packs); the game's units keep the game's. Not here on purpose: a method of a game class is not an additive patch.
- `RANKS.XML` (whitespace), `SKILLS.INI` (a description in Italian), the descriptions of the game's formations, the editor lists, `Shrine`'s removed behavior (the mod has no `shrine_behavior.vs` on `Shrine`; kept as the game's), the mod's AI.

## Overlaps ("use only one", no `incompatibleWith`)

The content manager compares paths. With **`oggetti-in-tutte-le-strutture-e-forti-bilanciati` (`q`)** it overlaps on `patches/DATA/SUBAI/OUTPOST_BEHAVIOR.VS` (`q` patches the same script in place with 25 directives anchored on HD's text) and on `patches/DATA/ITEMS.XML` (different ids, same file) and on `patches/DATA/CLASSES/` of `BaseWell`, `BOutpost`, `Chest`, `COutpost`, `EOutpost`, `FacePillar`, `GOutpost`, `IOutpost`, `LionThrone`, `Obelisk1`, `Obelisk2`, `Outpost`, `RibCage`, `ROutpost`, `ScullTree`, `TOutpost`, `Wagon` (the mod includes the items and forts of that mod; `q` also patches `BaseVillage`, this pack does not: that edit of the plain version is in the clones). With `oggetti-in-tutte-le-strutture` (`o`) it overlaps on the neutral classes. With `nuclear-fazioni-equilibrate`: nothing in common (that pack carries `UNIT_ON_KILL.VS` and `UNIT_SPECIALS.INI` in its own *Left out*; whoever builds its rules pack must compare with `[Disease attack] stamina_cost` here). The item ids are `s…` and the scripts `S_…`, so no name is shared with `o` and `q`. The overlap is a path overlap: the two scripts' anchors were not compared line by line against each other.

## Checks, tried and not tried

- `validate-mod.js`: **38 files checked, no problems.** `shared-paths.js secuter-fun-mod-rules`: no collisions (it excludes `patches/`, the overlaps above are patches).
- The script patches are proved by applying them to HD's script with the engine's algorithm (copy in `tools/lib/script-checks.js`): the result is the mod's script (OUTPOST: with the race guard; one insertion of two `ClearDead` calls sits three lines lower than in the mod's script, same lines, checked as a multiset).
- **Not tried in game** (the author of this port cannot play): the patches loading (`imperivm-mod.log` for a patch that fails to apply: INI patches, `<set select>` of 20 classes), the forts (slots 3 and 4 spawning, a clone's fort not reading outside the array), the chests respawning `sGold1000`, the Stonehenge's two orders, the arena's `Sleep`, the constants, the pack together with and without `q`.
- Engine issues noticed (not opened): a directive to replace a whole inherited behavior (camps, above).
