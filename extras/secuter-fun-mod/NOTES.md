# Secuter Fun 1.5 (Secuter)

Row 312, issue #19. `Secuter Mod Imperium.zip` (forum t60040716, `originals/forum/fun-mod-civilta-personalizzate-2017/files/`, 495 files: `DATA`, `UI`, `OUTLINES`, `RANDOMMAP`; no README and no licence file in it, and no art of its own: the entities of its animation objects are not in the zip). `authors`: Secuter and `Villoh (port)`. **Permission: the authors' permission was granted to the maintainer, per the maintainer (2026-11-01).** Nothing was asked or answered in this task; there is no document to quote.

**This port is the mod's balance as eight civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*; decided in #15: copies + room set). The game's eight are not touched and nothing here is an exclusive ruleset. The reserved token is `s`: every id starts with it. The Greece version is a different pack, `secuter-fun-mod-grecia` (token `z`); the two can be active together.

| `id` | Prefix (derived) | Base | Lobby name | Classes |
|---|---|---|---|---|
| `sgaul` | `Sga` | Gaul | Gaul (Secuter) | 76 |
| `srome` | `Sro` | RepublicanRome | Rep. Rome (Secuter) | 68 |
| `simperial` | `Sim` | ImperialRome | Imp. Rome (Secuter) | 45 |
| `scarthage` | `Sca` | Carthage | Carthage (Secuter) | 60 |
| `sbritain` | `Sbr` | Britain | Britain (Secuter) | 60 |
| `siberia` | `Sib` | Iberia | Iberia (Secuter) | 61 |
| `segypt` | `Seg` | Egypt | Egypt (Secuter) | 60 |
| `sgermany` | `Sge` | Germany | Germany (Secuter) | 65 |

No `index` (the engine assigns it, #37), every civilization `ai: true`, `random` at its default, no `replacesBase`, `variant` or `ownAi`. The prefixes are distinct among themselves and in [CIVILIZATIONS.md](../../docs/CIVILIZATIONS.md) (none of the ports in this branch has `S…` or `Z…`; the Greek mods' one-letter `S`/`Z` letters are not these: `Z` is the 4.2's Iberia, a different prefix from `Zib`/`Zgr`). The set is named after `mod.json` `name`, **Secuter Fun 1.5** (15 characters, #38); the longest lobby name, `Imp. Rome (Secuter)`, is 19.

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/secuter-fun-mod.js plain
```

`ported/secuter-fun-mod/` is not in git (665 files, rebuilt). The tool unpacks the zip in `.scratch/` (nothing is written under `originals/`), runs `tools/port-140.js` and `tools/merge-secuter-fun.js` on it (HD + 1.40 + mod, three-way; `raw/port-140/secuter-fun-mod.md` lists the 24 items to check, in which the mod's side was used, with the decisions in the comments of `merge-secuter-fun.js`) and does the rest (below). The same build twice gives the same files (md5 of every file, 665 files). `extras/secuter-fun-mod/mod.json` is copied over at the end. `raw/secuter-fun-mod-own-scripts.txt`, `-left-out.txt` and `-left-out-commands.txt` list what the build did.

## What is a civilization's, what is not

- **A civilization's**: the mod's version of every class of the game's eight civilizations (stats, hero skills, costs, specials, commands), cloned from HD by `clone-civilization.js --all-orders` (`tools/lib/clone-civs.js`), and the mod's own classes of each people (the hero variants, `GTridentHero`, `RChariotHero`, `MCaesar`, `CElephantHero`, `BVikingHero`, `IMountaineerHero`, `EChariotHero`, the lions `ELionF`/`ELionM`, `THumanWolf`, `TWereWolf`, `TWereBear`, `TValkyrieHero`, `WolfUnit`). What the mod changed in the **base classes** (`Hero`, `Unit`, `BaseTavern`, `BaseVillage`, `BaseShipyard`, `Outpost`) is written **inside each clone** (1 to 9 elements each), never in HD's. 13 commands the mod gave to base classes (`Hero`'s formations, the gate, the village) have the port's classes as their sources (never the game's). Two research orders of the Druid House name it by its altid (`DruidHouse`, HD's `GDruidHouse`): the build maps them to the clone.
- **Scripts the mod edited**: 27 copies `<name>_ses.vs` (and `_ses_<id>` where the class ids the script writes as text differ per civilization) that only the clones' classes and commands point to (`tools/lib/own-scripts.js`): `barrack_train`, `barrack_train_ex`, `barrack_train_verify`, `verify_research`, `verify_trainex`, `onfinish_research`, `immediate_research`, `train_ex`, `military_ondie`, `unit_on_kill`, `unit_on_enter`, `unit_attach_verify`, `hero_formation_verify`, `cmercenary_ondie`, `itavern_calltoarms`. `unit_on_kill`, `unit_on_enter`, `military_ondie`, `research`'s `onfinish` and the like are **methods** the clones inherit from the game's classes: 1443 `<method>` are written inside 310 classes, pointing to the copies. The mod's new scripts (the druid's buffs, the were-forms, `load_paesants`, `verify_isresearched_skill`...) stay under their own names and the class ids they write as text (`THumanWolf`) are the clone's (`SgeHumanWolf`: 5 scripts rewritten; the build stops if a literal names a class neither the game nor the port has).
- **The tests of the civilization** in the copies (`.race==Gaul`, `.race==Germany`, `.race==Carthage`: 7 scripts) also accept the clone: `(.race==Gaul || Mod_TrueRace(THIS) == Sgaul)`. `GetPlayerRace` is left alone.
- **Items, formations**: the 5 formations the mod adds (`Fila`, `Arcieri ai lati`, `Retroguardia`, `Stella`, `Ali infernali`, used by the new formation orders of `Hero`) are a patch of `FORMATIONS.XML` that only adds.
- **Art**: 28 pictures of orders, researches, states and notifications (`UI/CMDBAR`, `UI/ICONS`, `UI/NOTEICONS`), 36 outlines of buildings (`OUTLINES/ZOOM8|16|32`, the same pixels for everybody: they are drawn for the game's own buildings, cosmetic) and the two random-map templates `AFRICA` and `RIVER` ("Mappe Conquista Africana") with their bitmaps. No new sprites (the mod's zip has none).

## Independence check (AGENTS.md)

`node tools/shared-paths.js secuter-fun-mod` → `no collisions` (against HD, every port of this tree including the three Greek mods, and the Greece version). Class ids, entity folders and files outside `patches/` shared with another port: none. Names another port already had with other bytes were renamed by `tagCollisions` (tag `ses`): the classes `MediumRanged` and `ShortestRanged` (`_ses`) and one picture (`STRONGHOLD DEFENSE3_ses.BMP`, the other port is in this tree; the references were checked after the rename: 0 had to be put back). **The build order matters**: the plain pack does not look at the Greece one (the Greece one looks at both), so that the same build gives the same files whatever is in `ported/`; the rules pack is not looked at either.

## Pictures, sounds and entities: references checked

After `tagCollisions` (which rewrites a renamed file's references by file name alone) every picture, sound entity and `entity=` of the port's classes, commands and patches is resolved against the port and the game's packs (`tools/secuter-fun-mod.js`, step 6b/8; the build stops on one that does not resolve). 6 references do not resolve and did not before: HD's own `queueicon="gameres/icons/upgrades/wbreast.bmp"` (named in HD's `BLACKSMITH.XML`; left alone as asked). The entities of the mod's animation objects are not in the zip: see *Left out*.

## Random-map templates

`AFRICA.RM.XML` and `RIVER.RM.XML` (+ `RANDOMMAP/AFRICA/010.BMP…070.BMP`, `RIVER/010.BMP…060.BMP`) are additive and keep their names here. The Greece version ships the same two templates; there they are renamed by `tagCollisions` (`AFRICA.RM_sez.XML`, bitmaps in `RANDOMMAP/AFRICA_sez/`): see its NOTES. **The templates are used by the map `conquista-africana-secuter` (row 314) through `requires secuter-fun-mod`; rewriting that map to the clones' classes is #8, not this task.**

## Left out because it is global

Everything below changes the game's own objects, scripts or values for **everybody**, so it is not in the clones. It is the content of the rules pack `secuter-fun-mod-rules` (a separate PR, stacked on this one; plain patches; "use only one" with `oggetti-in-tutte-le-strutture-e-forti-bilanciati`, `q`, which patches the same script in place):

- **The camps** (`GTent`, `BTent`, `CTent`, `ETent`, `ITent`, `NTent`, `RTent`, `ATTent`, `TTent2`: 9 classes) and the redefinition of the game's `TTent` as an abstract class under them (`BASETENT.SC.XML`, `altid="BaseTent"`), `TTENT_BEHAVIOR.VS` (**indexes `InitialArmy[.race]`, `TroopClsA[.race]`... with the camp's race**: the trap of the issue, see below) and the lines of `RANDOMMAP/PLACEOBJECTS.XML` that place them (`<ifdef id="teutontents">`). Its commands' texts for `TTent` (`<cmdtext target="TTent">`) are in `UNIT.XML` and `VILLAGE.XML`.
- **The outposts' garrison**: `OUTPOST_BEHAVIOR.VS`, a whole script at the game's path with 2 more defender slots whose classes are arrays indexed by `.race` (0-7) with the game's class names (`GArcher`, `RPrinciple`...). The clones' outposts carry the mod's values for the 2 slots the game has (their class properties are inside the clones); slots 3 and 4 need the script and are not active in the clones.
- **The neutral objects the mod edited**: `Chest`, `FacePillar`, `LionThrone`, `Obelisk1`, `Obelisk2`, `RibCage`, `ScullTree`, `Shrine`, `Stonehenge`, `Stonehenge2`, `Tombstone`, `Wagon`, `BaseWell`, the ships `ShipEgypt`, `ShipL`, `ShipRome` (stats), and the Pyramid (a Stonehenge of Egypt, new) with the Stonehenge's scripts and the `ghost` order (`STONEHENGE_*.VS`).
- **`ARENA_BEHAVIOR.VS`**: a behavior of `BaseBarracks` and `BaseArena` (a copy cannot replace an inherited behavior): `Sleep(1000)` → `Sleep(2500)` and heroes excluded from a check. Left the game's.
- **Items and constants**: `ITEMS.XML` (new items `Gold1000`, `Teschio dell'eroe`, `Gemma dell'energia`, `Gemma della furia`, Greek items, and the removed `use_script` of one of the game's), `ITEMSCRIPTS/` (3 gem scripts), `CONST.INI` (`RushDamage` 6→5, `DefensePerEpicArmorLevel` 2→3, `RankPoints10` 2→250: **values the game has**; and new keys `SecuterMod`, `StonehengeShowTime`, `StonehengeShowTimeStep`, `StonehengeGhostTime`), `UNIT_SPECIALS.INI` (`stamina_cost` of a special the game has, 3→4), `SKILLS.INI` (a description), the descriptions of the game's formations, `RANKS.XML` (whitespace), and the editor's lists (`DATA/INTERFACE/EDITOR/*`).
- **The mod's animation objects** (`CArenaAnim`, `CArenaAnim2`, `CBarracksAnim`, `EBarracksAnim`, `GArenaAnim`, `MArenaAnim`, `RArenaAnim`, `RArenAnim`, `RBarracksAnim`, `RTempleAnim`) and the arena spawns `GArenaBear`, `IArenaElite`, `IArenaMount`, `IArenaMountaineer`, with their nine `*_ANIM.VS` scripts: their entities (`Buildings/CArena/CArena_Anim.ent.xml`, …) are not in the zip and no class starts the scripts. Not in either pack; if Secuter's art turns up they go to the rules pack.
- **The AI** (`DATA/AI/`: `AI.INI` + `DruidSkills.vs` started from `MAIN.VS`, `ESH_NeedTech` (one line), `ESH_ResearchTraining` (161 lines: the druid researches by race, **`temRes[nRace]` and `res[.race]` arrays**), `TS_CarthageTactic` and `TS_CarthageTactic2`, `DEFENSIVE/`). **Not ported**: the clones play with HD's AI (`ai: true`, they are seen as their base). What that means: the AI does not use the druid buffs of the mod and does not research its new things. The scripts index arrays with `.race`; a port needs `Mod_TrueRace` and the `ASV_`-style copies (`tools/lib/asvr-ai.js`).
- **Orders whose source is a game class that is global**: `ghost` (`Stonehenge`).
- Full lists: `raw/secuter-fun-mod-left-out.txt` (79 files) and `raw/secuter-fun-mod-left-out-commands.txt`.

**The `.race` trap (issue update 2026-10-30).** Secuter indexes arrays with `.race` (0-7); an object of another mod's civilization has a race of 10 or more and reads outside the array. Checked: the scripts **this pack ships** index no array with the object's race (the build checks every script for `[...race]` and stops on one; the only `.race` uses are the three comparisons above, which are not array reads). The scripts that do index (`OUTPOST_BEHAVIOR.VS`, `TTENT_BEHAVIOR.VS`, the AI's `DruidSkills.vs`, `ESH_NeedTech.vs`, `ESH_ResearchTraining.vs`) are not shipped here. The rules pack ships the first two (clamped as `q` does: a race above 7 → the empty entry of Imperial Rome); the AI is not ported. Why the clones themselves are safe in the camps: their classes do not inherit from `TTent`.

## Not carried on purpose

- No game modes, no `rules/game.json`, no `incompatibleWith`: the old `mod.json` listed four packs as incompatible; what overlaps is the rules pack (above), not the civilizations.
- Executables: none in the zip.

## Tried in game and not tried

**Nothing was tried in game by the author of this port** (it cannot play). What was done instead: `validate-mod.js` (dev-villoh) on the port: 665 files, no problems; `shared-paths.js`: no collisions; the build's own checks (every script copy has the parens, braces and brackets of the mod's script; no code after a `return`; every class a script names as text is a class of the game or of the port; every picture/sound/entity reference resolves). The validator does not compile scripts: a compilation error would only show in `Logs\imperivm\imperivm-mod.log`.

Not tried: a room with only this set (dropdowns, random, AI), a skirmish with the set alone and with the game's civilizations too, the lobby labels, each clone's town and units, the new orders (formations, buy food, the druid and were-form orders), `Logs\imperivm\imperivm-mod.log` for `compilation error` (the 27 copies and the 5 rewritten scripts are the risk), the AI of the clones with the mod's new classes, the two random-map templates, and the combination with `secuter-fun-mod-grecia` and with the other balance ports.

## Engine issues noticed (not opened)

- Nothing new. `tagCollisions` renames the bitmaps of a random-map template one by one (`010.BMP` → `010_sez.BMP`), which breaks them if the engine looks for the number: the Greece build puts them back in a folder of their own (this tool, not the shared library).
