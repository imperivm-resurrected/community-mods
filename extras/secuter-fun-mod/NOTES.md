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

`node tools/shared-paths.js secuter-fun-mod` → `no collisions` (against HD and every port: the 12 with classes that the build sees, listed in its output, from the main checkout's `ported/` and this tree's: Mediterranevm, the MCI, both Imperivm Legacy builds, CGWAR, the 1.8 and the 4.2, and four map/adventure ports that carry classes; the Greece version is never looked at by this pack). Class ids, entity folders and files outside `patches/` shared with another port: none.

**What the build renamed (tag `ses`) because another port has it with other bytes** — this is the result of the cross-check of the first review, which found two Legacy hits and one MCI hit that the first build (made from a worktree that did not see those ports) had not renamed:
- classes `MediumRanged` and `ShortestRanged` (`_ses`);
- pictures `STRONGHOLD DEFENSE3_ses.BMP` and `UI/CMDBAR/STATES/ALAS DEL INFIERNO FORM_ses.bmp` (the MCI has a picture of that name with other bytes; it is renamed here, not left to the merge order; the MCI's other three formation pictures are byte for byte the same and stay shared);
- the script `DRUID_HIDE_VERIFY_ses.VS` (Imperivm Legacy has `druid_hide_verify.vs` with other bytes);
- the random-map template `AFRICA.RM_ses.XML` and its bitmaps in `RANDOMMAP/AFRICA_ses/` (the MCI has `AFRICA.RM.XML` and `RANDOMMAP/AFRICA/`);
- 10 orders (`form-alasdelinfierno (ses)`, `form-cucaracha (ses)`, `form-hilera (ses)`, `form-ranged (ses)`, `form-retaguardia (ses)` and their `-menu`: the MCI defines orders with the same names).
The references were checked after the renames (0 had to be put back). Not checked by `ownNames`: names of formations (`Fila`…) — none is in the MCI, Mediterranevm, Legacy, CGWAR or the Greek mods (grep).

**Determinism** (review fix). The build reads the other ports from the main checkout (the parent of the git common dir) **and** from this tree, so that a worktree under `.wt/` renames the same names as the main checkout. If a port that exists in the main checkout today (`mci`, `mediterranevm-alpha`, `imperivm-legacy`, `imperivm1-legacy`, `cgwar`, `greek-mod-1-8`, `greek-civilization-mod`) is not found, the build **stops** with a message; `SECUTER_NO_OTHERS=1` builds without them (different bytes). The plain pack does not look at the Greece one (the Greece one looks at both), and neither looks at the rules pack. The SDK is found next to the main checkout too. The scratch extractions are deleted at the end (`SECUTER_KEEP_SCRATCH=1` keeps them). Proof: see the PR body.


## Pictures, sounds and entities: references checked

After `tagCollisions` (which rewrites a renamed file's references by file name alone) every picture, sound entity and `entity=` of the port's classes, commands and patches is resolved against the port and the game's packs (`tools/secuter-fun-mod.js`, step 6b/8; the build stops on one that does not resolve). 6 references do not resolve and did not before: HD's own `queueicon="gameres/icons/upgrades/wbreast.bmp"` (named in HD's `BLACKSMITH.XML`; left alone as asked). The entities of the mod's animation objects are not in the zip: see *Left out*.

## Bug found in game: `Mod_TrueRace(This)` in a group verifier (2026-11-02)

The maintainer's log of the Community port (same generator idea) showed `compilation error: (220, 52): No matching function with name This`. Here the same text was in `verify_research_ses.vs` line 194 (`.race==Carthage || Mod_TrueRace(This) == Scarthage`), and in the Greece version's `verify_research_sez.vs`. A group verifier (`//bool, ObjList objs, str OUT reasonText`) has no `This` parameter: it declares `Building this;` and assigns `this = objs[0].AsBuilding();` (line 7, before the use). `objOf` only looked for `Obj <name>` in the header, found nothing and fell back to `This`, so the script did not compile and every order whose `groupverifier` is `verify_research` (the research orders of the clones) would have failed with "Cannot run script". **Not caught by the names check** (`This` is a known name to it) **nor by the balance checks.** Fixed in `tools/secuter-fun-mod.js`: the receiver is the header's object parameter (any spelling: `THIS`), else the local `this` if the script declares and assigns it, else `This`. The only changed line in each pack is that one (`Mod_TrueRace(This)` → `Mod_TrueRace(this)`). The other uses (`onfinish_research_*`, `military_ondie_*`) have `Obj This` / `Obj THIS` in the header and are unchanged. The transformer writes only `Mod_TrueRace(<receiver>)` for `.race`; it adds no `Mod_PlayerCiv`, and does not touch `.player`. 

**Scan in the build (step 9b)**: every `.vs` under `DATA/` and `patches/DATA/` (a patch is read together with the game's script it patches) is checked: a bare `This`/`THIS`/`this` must be declared by the header or by a local. Result: plain 55 scripts, Greece 118 scripts, 0 undeclared; the build stops on a hit. The scan reads identifiers case-sensitively (the language allows `Building this` next to `Obj This`, as HD's `TTENT_BEHAVIOR.VS` does). Not tried in game.

## Update with main (2026-11-02): what #56, #60 and the others changed here

`origin/main` (Caesar #49, Community #46, the Greek chain, the 4.2 #62, MCI #45, the English help) was merged into this branch (merge commit, no force-push). Conflicts were only `.gitignore` and the EN/ES `CIVILIZATIONS.md` rows: both sides kept.
- **#56 (renamed conquests keep territories.xml's end)**: this pack ships **no conquest** (the maps of `conquista-africana-secuter` are not its). `tools/check-conquests.js` on the build: 0 conquests, 0 damaged. The build runs it.
- **#60 (tagCollisions renames the strategic-map bitmaps with the entity)**: `tools/check-minimap.js` on the build, before the merge and after: plain **255 entities, 0 missing (0 rename / 0 absent)**; Greece **282 entities, 27 missing, all "absent" (0 rename)**: the 27 are the Greek walls (`ZgrWalls*`, `ZgrGate*`…) whose bitmaps the 1.8 never had. Not invented. The build runs it and stops on a "rename". No own picture renaming of mine became redundant (the only own post-pass is the random-map template's bitmap folder, which #60 does not touch).
- **Default commands (right click, `tools/lib/default-cmds.js`)**: the check on the build: 0 unit classes lack a target of their reference (counts per target: Hero 0, Wagon 0, WildHorse 0, ShipBattle 0), 0 shadowed — in both packs. The clones are copies of HD's classes with the mod's, and Greece comes from the 1.8, whose classes carry no map of their own. The build runs the check and stops on a shadowed target.
- **Radius (Caesar's crash, gbr.exe+3fffd)**: the check (`tools/lib/caesar-radius.js`, class by class against the HD class it comes from): plain 0 of 507 classes lack a radius their HD class has (232 carry one); Greece 0 of 572 (272 carry one). Walls, gates, villages and outposts included. A build check now.
- Ports compared by `tagCollisions` (the build prints them; read from the main checkout's `ported/` and this tree's): plain 20 — arena-asurmod, asvrmod-vii-civs, caesar-mod-civs, celtic-kings-adventure, cesare-e-le-7-mogli-asurmod, cgwar, community-mod-civs, greek-civilization-mod (4.2), greek-mod-1-8, greek-mod-2-3, greek-mod-2-5-3, greek-mod-2-6-1, imperivm-legacy, imperivm1-legacy, l-avventura-di-maximus, la-battaglia-del-fosso-di-helm, mci, mediterranevm-3-6, mediterranevm-alpha, nuclear-fazioni-equilibrate; Greece 21 (those and the plain pack). The build stops if any of the merged ports is missing. **Result: the same bytes as before the merge** (the merged ports share no name with these packs): plain `a9c5843086ce`, Greece `0c1873f99b2d`, twice in the worktree and once from a clean worktree outside `.wt/`.
- Layout patch of a menu (`RectWH`): this pack ships none.
- **What the maintainer tried in game** (his statement, 2026-11-02): the packs load with 0 compilation errors (after the `This` fix). **Not tried**: a match with each civilization, Greece in a match, the rules pack together with the civilizations, the strategic map, the two packs with the 1.8 on.

## Deviations from the original

- **`LOAD_PAESANTS_VERIFY.VS`** (the mod's own script, the game has none; the verifier of the order that loads peasants on the ships next to a port): line 28 read `if (!bld.IsEnemy(u) && ship.UnitsCount<ship.UnitsMax)` in a loop whose variable is `ship`, with no `u` declared anywhere. The game's compiler stops the script ("Cannot run script" in game; `tools/secuter-names.js` finds it: `"u" is no variable...`). Fixed in the copy as `!bld.IsEnemy(ship)`: the loop counts the free places of the ships of `ShipBattle` around the port that are not the enemy's, `Obj::IsEnemy(Obj, Obj)` (`sdk/game-functions.txt`) takes the ship, and HD's `EBLACKSMITH_CHARMS_VERIFY.VS` has the same shape (`!bld.IsEnemy(u)`, `u` the unit of its loop). The intent is read from the loop, not from the author. Not tried in game.

## Random-map templates

`AFRICA` ("Mappe Conquista Africana") and `RIVER` ( bitmaps `010.BMP…070.BMP`, `010.BMP…060.BMP`). The MCI has an `AFRICA` template too, so `tagCollisions` renamed this pack's: **`AFRICA.RM_ses.XML` is kept as renamed** (as asked), with its bitmaps in `RANDOMMAP/AFRICA_ses/` (the tool puts them back under their numeric names and moves the whole folder: they are named after what they are for, the SDK's `010.bmp … 120.bmp`, and the template names the folder). `RIVER.RM.XML` keeps its name. The Greece version ships both and renames both (`_sez`): see its NOTES. 
## Dependents, broken until #8

- **`conquista-africana-secuter` (row 314)** `requires secuter-fun-mod`. Its conquest (`africamod.BFHP`, checked with `tools/hpfs.js`) places the game's classes (`CMaceman`, `CJavelinThrower`, `COutpost`, `ROutpost`…, `Chest`, `LionThrone`) and **the mod's camps `CTent` (20) and `NTent` (6)**, which no pack of this port ships (they are not in the rules pack either: its NOTES). Its players are the game's races, not the clones. So it does not load as it did and its map needs rewriting to the clones' classes and the set: #8. The old text of its description ("if you do not have the mod it crashes") is now true in a new way. Not touched.
- **`mini-avventura-grecia` (row 320)** `requires secuter-fun-mod-grecia` (and the Greek Mod 4.2 per its row). Its adventure (`GRECIA.BFHP`) places the 1.8-era classes `HHoplite` (66), `HHypaspista` (81), `HMyrmidon_Javelin` (106), `HChariot` (45), `HToxotes` (140), `HPriest`, `HVillage`, `HTemple`…, `Hhouse1-3` and the walls `MWalls*`/`MGate*`: Greece in this pack is `ZgrHoplite`… so **it is broken** (the classes do not exist) until #8. Not touched.

Both maps belong to #8; this pack does not fix them.

**The templates `AFRICA`/`RIVER` are also used by row 314 (`requires secuter-fun-mod`)**: with the template renamed, #8 has to point the map to `AFRICA.RM_ses.XML`.

## Left out because it is global

Everything below changes the game's own objects, scripts or values for **everybody**, so it is not in the clones. It is the content of the rules pack `secuter-fun-mod-rules` (next PR, stacked on this one; plain patches; "use only one" with `oggetti-in-tutte-le-strutture-e-forti-bilanciati`, `q`, which patches the same script in place), **except the camps and the TTent behavior, which not even the rules pack can carry** (its NOTES: the mod's `TTENT_BEHAVIOR.VS` cannot be written as directives):

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
