# Secuter Fun Greece 1.5 (Secuter)

Row 312, issue #19. `Secuter Mod Imperium - Versione Grecia.zip` (same forum topic t60040716, `originals/forum/fun-mod-civilta-personalizzate-2017/files/`, 493 files: `DATA`, `UI`, `OUTLINES`, `RANDOMMAP`; no README, no licence file, no art of its own). `authors`: Secuter and `Villoh (port)`. **Permission: the authors' permission was granted to the maintainer, per the maintainer (2026-11-01).** No document to quote.

Read `extras/secuter-fun-mod/NOTES.md` first: this pack is built by the same tool (`tools/secuter-fun-mod.js grecia`), with the same rules, and most of what that file says applies here word for word (what a civilization's is, the scripts, the `.race` trap, the checks, *Left out because it is global*). This file says what is different.

**Nine civilizations of their own, next to the game's.** The reserved token is `z`.

| `id` | Prefix (derived) | Base | Lobby name |
|---|---|---|---|
| `zgaul` | `Zga` | Gaul | Gaul (Secuter) |
| `zrome` | `Zro` | RepublicanRome | Rep. Rome (Secuter) |
| `zimperial` | `Zim` | ImperialRome | Imp. Rome (Secuter) |
| `zcarthage` | `Zca` | Carthage | Carthage (Secuter) |
| `zbritain` | `Zbr` | Britain | Britain (Secuter) |
| `ziberia` | `Zib` | Iberia | Iberia (Secuter) |
| `zegypt` | `Zeg` | Egypt | Egypt (Secuter) |
| `zgermany` | `Zge` | Germany | Germany (Secuter) |
| `zgreece` | `Zgr` | ImperialRome (own race) | Greece (Secuter) |

The lobby names are the same as the plain pack's: the set tells them apart (room set **Secuter Fun Greece 1.5**, 22 characters, exactly the limit of the dropdown). No `index`, no `letter` (the nine derived prefixes are distinct, and distinct from the plain pack's `Sga…Sge` and from the Greek mods'), every civilization `ai: true`, no `replacesBase`, `variant` or `ownAi`.

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/secuter-fun-mod.js grecia
```

`ported/secuter-fun-mod-grecia/` is not in git (1453 files, rebuilt). **It reads `ported/greek-mod-1-8/`** (the built port of the Greek Mod 1.8: see `extras/greek-mod-1-8/NOTES.md`, *Rebuild*) and only reads it: Greece of this pack is made from it (below). The tool stops with a message if it is not there. The result depends on that port as it is built; the build of this pack was done against the one in this tree, 2.9 GB. The same build twice gives the same files (md5 of every file, 1453 files). The pack does **not** need the Greek Mod at run time and does not `require` it.

## The base of Secuter's Greece: the Greek Mod 1.8, not the 4.2 (evidence)

The previous port overrode the 4.2's `H*` classes and required `greek-civilization-mod`. The files say Secuter's Greece was made over the **1.8**:

| file of the zip | lines that differ from the 1.8's (`originals/greek-mod-1.8`) | from the 4.2's (`originals/greek-4-2-pristine`) |
|---|---|---|
| `HHoplite.sc.xml` | **0** (byte for byte) | 11 |
| `HHypaspista.sc.xml` | 2 | 15 |
| `HMyrmidon_Javelin.sc.xml` | 9 | 14 |
| `HMyrmidon_Sword.sc.xml` | 2 | **no such class in the 4.2** |
| `HPriest.sc.xml` | 2 | 30 |
| `HToxotes.sc.xml` | 5 | 8 |
| `HChariot.sc.xml` | 10 | 16 |
| `Hero.sc.xml` | 8 | 250 |
| `COMMANDS/GREECE.XML` | 85 | 442 |
| `HOutpost.sc.xml`, `HTent.sc.xml`, `HChariotHero.sc.xml` | not in the 1.8 (Secuter's own) | `HOutpost` exists in the 4.2: 37 lines apart |

Of the zip's 386 files under `DATA`, 26 are the 1.8's byte for byte, 265 differ from the 1.8's and 95 are in neither (the mod's own). The scripts of the Myrmidons that the zip does not ship (`myrmidon_sword.vs`, `myrmidon_javelin.vs`) are the 1.8's (the 1.8 ships them; `centaur_summoning.vs`, named by the Priest's class, is in no download). No ambiguity, so the 4.2 was not taken.

## Greece: `zgreece`

Made by `tools/secuter-greece.js` (read its header):

1. The Greek part of the built 1.8 port, selected by name and by what the Greek classes and commands name (art, sounds, scripts that the game does not have): **674 files**: 62 classes, `GREEK18.XML` → `ZGREECE.XML`, the art (`UNITS/ZGR*`, `BUILDINGS/ZGR*`, `VOICES/ZGR*`), the sound entities, the command bar and info bar skins, the 1.8's scripts for Greek researches (government forms, Apollo, supplies, myrmidons, toxotes...), the 27+27 Greek texts (Spanish, Italian), the Greek towns and villages of the random map (`Greek Secuter Village N` / `Town N`) and the neutral fisherman class the Greek village trains.
2. **Every name that starts with the 1.8's letter `Q` starts with `Zgr`**: 134 names (`QHoplite` → `ZgrHoplite`, `trainQHoplite` → `trainZgrHoplite`, `Units/QHOPLITE` → `Units/ZGRHOPLITE`, `VoiceQHoplite`, `AIV_MaxQHoplite`, `QName000` → `ZgrName000`, `trainpeasantq` → `trainpeasantzgr`, `hireheroQ` → `hireheroZgr`), and the 1.8's own copies of the game's scripts `*_g18.vs` are `*_zgr.vs`. **Not "nothing" is shared with the 1.8** (corrected): no class id, entity folder, order, item, script or gameplay file is; what is shared is cosmetic and byte for byte the same at the same path: `shared-paths.js --all` lists 50 files in common with the 1.8 (42 with the 4.2): the death sounds of the women (`sounds/death/female_death*.wav`), pictures of orders and researches (`ui/cmdbar/actions/buy war slaves.bmp`, `start storing food.bmp`, `research/apollo protection.bmp`…); and 61 with the plain pack (outlines, icons). The colliding ones that are not identical were renamed (`tagCollisions`, tag `sez`: 14 classes, 70+2 files, 39 orders and 4 items get `(sez)`). Names of researches and items that the 1.8 also defines get `(sez)` (`tagNames`: 38 orders, 4 items), so the research state of one mod is not the other's.
3. **Secuter's changes** (three-way `git merge-file` of the 1.8's original, the built class and Secuter's file, with the names put in the same letter; where both changed the same line, Secuter's wins): `ZgrChariot`, `ZgrHypaspista`, `ZgrMyrmidon_Javelin`, `ZgrMyrmidon_Sword`, `ZgrPriest`, `ZgrToxotes`, and `ZGREECE.XML` (4 conflicts, his side: costs; he also **deleted** the Toxotes stance orders and `Strengthen Stronghold Gates` from the Greek commands: the three-way deletes them too, and the scripts of the stances stay unused in the pack). New classes of his: `ZgrChariotHero`, `ZgrOutpost`. The base-class changes of the mod (`Hero`, `Unit`...: 5 elements) are inside every Greek class after the 1.8's own block. The Hero and the Priest orders the mod gave to Greek classes (`buff_balanced` for the Priest, `Recluta Stratega`, `Elezione degli strateghi` for the Gymnasium) have the Zgr classes as sources.
4. **The AI of the 1.8 for Greek settlements only**: 11 scripts as `ZGR_*`, handed over by patches at the top of the game's helpers (`Mod_TrueRace(...) == Zgreece`), the main loop `ZGR_ES_Stronghold` in `[EconomyScripts]` picked by a patch of `GetEconomyScript.vs`, never started with `AIRun` (engine #15), the recruiting table of `TSH_RECRUITARMY.vs` as ONE block patch for Greek settlements (review fix: no `@top`, no declarations and no `@replace`, see *With the 1.8 on too*). The 1.8's Roman branches (`Rome18`, `Empire18`, `Punic18`) are **not** carried: the Roman scripts read `ChooseXxxRome`, a choice that is a civilization of its own now (AGENTS.md); Rome here is the game's Rome, cloned. The copied scripts still contain dead tests of those flags (they read false).
5. The civilization (`civs/zgreece.json`): base `ImperialRome`, `internalName` `ZGreece` (`INFOBAR_ZGREECE.INI`, `CMDBARZGREECE.INI`, the frame in a patch of `FRAMES.INI`), template `Greek Secuter`, `ai: true`.

**Not carried from the 1.8**: its other civilizations, its maps/adventures/conquests/videos/music, the menu skin, its edits of the game's scripts that are not Greek (only the Greek patches of `BARRACK_TRAIN`, `TRAIN_EX`, `VERIFY_TRAINEX`, `UNIT_ON_KILL`, `ONFINISH_RESEARCH`, `DRUID_ONDIE` are carried, renamed), the 1.8's formations except those a Greek order names.

## Bug found in game: `Mod_TrueRace(This)` in a group verifier

Same as the plain pack's NOTES: `verify_research_sez.vs` line 194 (a group verifier with no `This`) now says `Mod_TrueRace(this)`. Scan of the whole port (step 9b): 118 scripts, 0 use `This`/`this` without a declaration; the build stops on a hit. Not tried in game.

## Update with main (2026-11-02; the plain pack's NOTES has the same text: the numbers of both packs are given)

`origin/main` (Caesar #49, Community #46, the Greek chain, the 4.2 #62, MCI #45, the English help) was merged into this branch (merge commit, no force-push). Conflicts were only `.gitignore` and the EN/ES `CIVILIZATIONS.md` rows: both sides kept.
- **#56 (renamed conquests keep territories.xml's end)**: this pack ships **no conquest** (the maps of `conquista-africana-secuter` are not its). `tools/check-conquests.js` on the build: 0 conquests, 0 damaged. The build runs it.
- **#60 (tagCollisions renames the strategic-map bitmaps with the entity)**: `tools/check-minimap.js` on the build, before the merge and after: plain **255 entities, 0 missing (0 rename / 0 absent)**; Greece **282 entities, 27 missing (0 rename / 27 absent) in the first merge build; 0 missing after the fix of 2026-11-04** (below). **The statement that the 27 were "the Greek walls and gates" was WRONG (written without looking): they were the WHOLE Greek city** — see *Strategic map of Greece*. The build runs it and stops on a "rename". No own picture renaming of mine became redundant (the only own post-pass is the random-map template's bitmap folder, which #60 does not touch).
- **Default commands (right click, `tools/lib/default-cmds.js`)**: the check on the build: 0 unit classes lack a target of their reference (counts per target: Hero 0, Wagon 0, WildHorse 0, ShipBattle 0), 0 shadowed — in both packs. The clones are copies of HD's classes with the mod's, and Greece comes from the 1.8, whose classes carry no map of their own. The build runs the check and stops on a shadowed target.
- **Radius (Caesar's crash, gbr.exe+3fffd)**: the check (`tools/lib/caesar-radius.js`, class by class against the HD class it comes from): plain 0 of 507 classes lack a radius their HD class has (232 carry one); Greece 0 of 572 (272 carry one). Walls, gates, villages and outposts included. A build check now.
- Ports compared by `tagCollisions` (the build prints them; read from the main checkout's `ported/` and this tree's): plain 20 — arena-asurmod, asvrmod-vii-civs, caesar-mod-civs, celtic-kings-adventure, cesare-e-le-7-mogli-asurmod, cgwar, community-mod-civs, greek-civilization-mod (4.2), greek-mod-1-8, greek-mod-2-3, greek-mod-2-5-3, greek-mod-2-6-1, imperivm-legacy, imperivm1-legacy, l-avventura-di-maximus, la-battaglia-del-fosso-di-helm, mci, mediterranevm-3-6, mediterranevm-alpha, nuclear-fazioni-equilibrate; Greece 21 (those and the plain pack). The build stops if any of the merged ports is missing. **Result: the same bytes as before the merge** (the merged ports share no name with these packs): plain `a9c5843086ce`, Greece `0c1873f99b2d`, twice in the worktree and once from a clean worktree outside `.wt/`.
- Layout patch of a menu (`RectWH`): this pack ships none.
- **What the maintainer tried in game** (his statement, 2026-11-02): the packs load with 0 compilation errors (after the `This` fix). **Not tried**: a match with each civilization, Greece in a match, the rules pack together with the civilizations, the strategic map, the two packs with the 1.8 on.

## Strategic map of Greece (Space): the whole Greek city was missing (found in game, 2026-11-04)

The Greek city did not show on the strategic map: only terrain. `tools/check-minimap.js --detail` listed **27 entities, 3 zooms each, "absent"**: ZgrAgora, ZgrArena (entity `ZgrGymnasium`), ZgrBarracks, ZgrBlacksmith, ZgrGate0-7, Zgrhouse1-3, ZgrTemple, ZgrTower, ZgrTownhall, ZgrVillage and the eight ZgrWalls. "Absent" meant the **port's own** bitmaps never existed: Secuter's Greek zip has no `BUILDINGS`, `MINIMAP` or art (its Greek city is the Greek Mod 1.8's, copied by `tools/secuter-greece.js` under the new names), and that tool copied the 1.8's classes, art, sounds and scripts but **not** its `MINIMAP/ZOOMn/ENTITIES` bitmaps. My earlier summary ("the Greek walls and gates", "the 1.8 never had") was wrong on both counts: the 1.8 has bitmaps for all of them (`check-minimap` on it says 0 missing).

**Fix** (step 11b of `tools/secuter-fun-mod.js`, this pack's own tool): for every building entity of a Greek class that lacks its bitmaps, the twin is the 1.8's entity with the same name (`zgr` → `q`); it is accepted only if the art is the same: every file of the entity's folder except the `.ent.xml` is byte for byte the 1.8's, and the `.ent.xml` is the 1.8's with the names changed (the one allowed difference is the barracks' exit point, moved by `secuter-greece.js`), and the 1.8 has its bitmaps in the three zooms. Then **the 1.8's own bitmaps** (the game's art of the same buildings) are copied under the Greek name in zoom 8, 16 and 32, and its outlines where it has them (town hall, village: HD's kind). **Result: 27 of 27 got bitmaps (81 files, byte for byte the 1.8's; checked with `cmp` on the temple), 12 outline files (the town hall and village, `BLACK_`/`COLOR_` × 3 zooms); no entity without a twin.** Nothing is drawn or invented. Secuter's own outlines of the Greek blacksmith (`BUILDINGS-HBLACKSMITH-HBLACKSMITH`, in his zip, orphaned by the rename H → Zgr) are renamed to `ZGRBLACKSMITH` (6 files); the 1.8 has no outline for it. `raw/secuter-fun-mod-grecia-minimap-twins.txt` lists them. The build **stops** on an entity that lacks bitmaps and has no twin unless it is named in `NO_TWIN` (empty), and `check-minimap` runs after: `282 entities, 0 missing (0/0), 0 outlines missing`. The pack grows from 1360 to 1453 files (md5 `96d2d3658cc0`, twice). The plain pack has no Greek city; unchanged (255 entities, 0 missing). **Not tried in game** (the strategic map).

## Scripts of the 1.8 that Secuter's replace (review fix)

Two names differed only by case and held different scripts: `military_ondie_sez.vs` (Secuter's) / `MILITARY_ONDIE_sez.VS` (the 1.8's copy), and `unit_attach_verify_sez.vs` / `UNIT_ATTACH_VERIFY_sez.VS`. The Greek classes pointed to the 1.8's, the clones to Secuter's; on Windows or in a zip one would have shadowed the other. The 1.8's copies are now `*_zgr.vs`, and for these two the single script of the pack is Secuter's, because his Greek zip ships the file at that path (what his Greece ran):
- `military_ondie`: **not compatible**. The 1.8: `random = rand(4)`, and only on 1 the Warrior Tales give the experience to ONE nearby unit; Secuter: every unit of the circle, under `if researched`, plus the Stonehenge ghost. Secuter's is kept for all nine; the 1.8's 1-in-4 for Greek units is **not** kept.
- `unit_attach_verify`: compatible, one line each (his `.IsHeirOf("Peasant")` test; the 1.8's `DiplGetShareControl` line, which only acts outside multiplayer). The single script has both, the 1.8's before the final `return true;`. It also reaches the eight clones.
The build stops if two file names differ only by case (checked on every file of the pack: 1453, none).

## With the 1.8 on too (review fix)

Patches add up; two that replace the same line do not. Before, both packs' `patches/DATA/AI/TSH_RECRUITARMY.vs` opened with `@top StrArray greekBuildName, greekTrainCmd, greekTech; int isGreek;` and replaced the same three lines (`nBuildType = RUType…`, `cmd = UTrainCmd…`, `tech = UTech…`), and both of `DRUID_ONDIE.vs` replaced `if (.race == Gaul)`. Now: `TSH_RECRUITARMY` is one block `@before if (num)` (the first `if (num)` of the game's script, after the three assignments, which it overrides for `Mod_TrueRace(set.GetCentralBuilding) == Zgreece` only), with no declaration; `DRUID_ONDIE` is a `@bottom` block with a local `nZgrRestored` and `.class == "ZgrPriest"`. Lines that two mods cannot both patch: **none known any more**. The remaining overlaps with the 1.8 are `@before`/`@bottom`/`@after` additions on the same game scripts (`BARRACK_TRAIN`, `TRAIN_EX`, `TRAINEX_ONADDREMOVE`, `VERIFY_TRAINEX`, `UNIT_ON_KILL`, `ONFINISH_RESEARCH`, the `ESH_*` helpers, `GETECONOMYSCRIPT`) and the same INI key (`MaxMyrmidonsValue = 50`, same value). Their orders and researches have different names (`(sez)`). **Not tried with both on.**

## Inherited from the 1.8, not new

- `ZGREECE.XML` has the Priest's order `centaur_summoning (sez)` with `groupverifier="data/subai/centaur_isresearched_verify.vs"`, which nobody ships (the 1.8's `GREEK18.XML` names it too, and `centaur_summoning.vs`). A command whose verifier script does not exist: the build lets this one name through (the names check prints it) and does not change it.
- The icons of the four Greek items (`Emblem of Democracy`, `Emblem of Oligarchy`, `Charm of Athena`, `Charm of Aegle`: `gameres/icons/items/…`) exist in no pack and not in HD; the 1.8 has the same. The items are alive here (the government forms and the Charm researches give them: `GOVERNMENT_FORM`, `democracy`, `unit_on_kill`), their two item scripts (`CHARM OF ATHENA`, `CHARM OF ATHENA REMOVING`) are shipped now (the closure of the first build stopped at the space in their names). They show without a picture.
- The Greek AI scripts (`ZGR_ESH_*`) test `nRace == Greece` with `int Greece; Greece = ImperialRome;` declared at the top, as the 4.2's do. Does that fire for a Greek settlement of this pack? `sdk/civilizations.md`, *The AI*: "The game's AI scripts compare against `Gaul`, `RepublicanRome`… and don't know yours. With `"ai": true` they see the base." and "Since the AI sees the base, ask for the real civilization with `Mod_TrueRace(set.GetCentralBuilding)`". `nRace = set.GetCentralBuilding.race` is what the AI sees, the base: `ImperialRome`, so the test fires. (The CGWAR port's header says the same: "a Greek AI does see ImperialRome (the base)".) Evidence is the SDK text; **not seen in a game log**. The names check also finds `Greece` as a known name.

## Exit points of the Greek buildings (checked)

Raw output: `raw/secuter-fun-mod-grecia-exit-points.txt`. What was checked: for each type-2 point of the barracks, gymnasium, temple, village (and town hall), the cell of its `.PASS` (column `63 + x/16`, row `64 + ceil(-y/16)`, the mapping of the fix in the Greek 2.x PRs), whether the cell is free, how many of the 3x3 around it are free, and whether a flood fill over the free cells reaches outside the footprint.

- **Barracks**: the same `.PASS` and the same single type-2 point as the barracks that got units stuck in the Greek 2.x ports (the `.PASS` is byte for byte the 1.8's `QBarracks.PASS`, md5 `0273d53b…`; point `(-32,-50)` = cell 61,68, free but at the head of the 1-2 cell dead-end corridor: 4/9 free around it, row 68 has free cells 61, 62, 63 only). **The one-point change tried in game there is made here**: `(-32,-50)` → `(-16,-50)` (cell 62,68: 6/9 free, reaches the outside). Its evidence is the 2.x ports' (maintainer: units out well in both town layouts); it was **not tried with this pack**, and why the engine fails at 61 is not proven.
- **Gymnasium** `(32,-16)` → cell 65,65: free, 8/9, reaches the outside. **Village** `(90,5)` → 69,64: free, 6/9, reaches the outside. **Town hall**: 6 of its 8 points are on free cells that reach the outside (the 2 others are blocked and the engine drops them).
- **Temple**: its single type-2 point `(35,-134)` → cell 65,73 is **blocked** by this mapping. **Unresolved**: the same mapping puts 14 of the 33 buildings of HD's own barracks, arenas, temples, taverns and villages that have a single type-2 point on a blocked cell too (e.g. the Gaul barracks, the Roman arena), and those work in game, so the mapping is not exact; the temple is the 1.8's file, byte for byte. Nothing was changed. If the Greek priests do not come out of the temple in game, this is the first place to look.

## Differences from the plain pack

- 217 class files are identical in the two zips after the merge; the plain one has 22 more (the Carthage, Gaul, Iberia, Roman arenas, barracks, temples, taverns and their animation objects: the Greece version did not carry the mod's changes to them), this one has 11 (the Greek classes, the Balanced buff, `HTent`), and `ShipEgypt`, `ShipL`, `ShipRome` differ. So the **eight civilizations here are not the plain pack's**: they have less of Secuter's changes to buildings. Not enumerated command by command.
- Global things that differ (for the rules pack, which is built from the plain zip): `CONST.INI` keeps `RushDamage = 6` and `DefensePerEpicArmorLevel = 2` (the game's) and adds `MaxMyrmidonsValue = 50`; `OUTPOST_BEHAVIOR.VS` fills slot 3 of race 4 with `HHypaspista` (Greece) instead of nothing; `TTENT_BEHAVIOR.VS` (6 lines) and `UNIT_ON_KILL.VS` (13 lines) differ; `PLACEOBJECTS.XML` (115 lines: the Greek camp `HTent`). Left out here, listed in `raw/secuter-fun-mod-grecia-left-out.txt`; the Greek camp `HTent` and these differences are the rules pack's question (the maintainer decided one rules pack, built from the plain version).
- **Random-map templates**: `AFRICA` and `RIVER` collide with the MCI's and the plain pack's by path. `tagCollisions` renamed them (`DATA/RANDOMMAP/AFRICA.RM_sez.XML`, `RIVER.RM_sez.XML`: kept as renamed) and also their bitmaps one by one (`010_sez.BMP`), which would break them if the engine looks for the number (the SDK writes `010.bmp … 120.bmp`). This tool's post-pass puts the bitmaps back under their names in `RANDOMMAP/AFRICA_sez/` and `RIVER_sez/` and points the templates there. Both templates show the same name in the list ("Mappe Conquista Africana") if both packs are on. Not tried in game.
- The formations (`Fila`…) are `Fila_sez`… here, so that two Secuter packs do not declare the same name twice; the same for the neutral classes the two packs share (`BuffAttack_sez`... 14 classes, 70 + 2 files renamed `_sez`). The pictures/scripts that the MCI and Imperivm Legacy have with other bytes are renamed as in the plain pack's NOTES.
- **Dependents, broken until #8**: row 320 `mini-avventura-grecia` (`requires secuter-fun-mod-grecia`) places `HHoplite`, `HHypaspista`, `HMyrmidon_Javelin`, `HChariot`, `HToxotes`… (checked in `GRECIA.BFHP`): those classes do not exist any more, Greece here is `Zgr…`: **broken** until #8. Row 314 `conquista-africana-secuter` requires the plain pack (see its NOTES).

## Tried in game and not tried

**Nothing was tried in game by the author of this port.** `validate-mod.js` (dev-villoh): 1453 files, **0 errors, 54 warnings**, all of them `rows="15" but UNITS/ZGRTOXOTES/Attack.rle has 14 rows`-type warnings about the sprites of the Greek toxotes, priest, heroes and chariot and two gates (`BUILDINGS/ZGRWALLS/GATEW`, `GATESW`): the sprite files are the 1.8's, copied byte for byte; the validator was not run on the 1.8's port itself (2.9 GB), so I cannot say that the same warnings appear there. `shared-paths.js secuter-fun-mod-grecia`: no collisions (against HD, every port of this tree, the three Greek mods and the plain pack). The build's checks (scripts balanced like their sources, class strings, references, `.race` arrays, file names that differ only by case, **the names the scripts use**: `tools/secuter-names.js`, 205 scripts read, 0 new problems, 1 inherited) pass; 6 references do not resolve and did not in HD (`wbreast`) or in the 1.8.

Not tried: everything the plain NOTES list, plus: Greece in a room (the lobby entry, the random map city and villages, the barracks exit, the temple exit, the Greek AI `ZGR_*` scripts and `compilation error` in `Logs\imperivm\imperivm-mod.log`: **the scripts copied from the 1.8's AI and the Greek patches are the highest risk**), Greece together with the 1.8, the 4.2, CGWAR and the plain pack, and the 8 clones against Secuter's Greece in a mixed room.

## Questions for the maintainer

1. **Permission** is recorded as stated (granted to you, 2026-11-01); the zips have no licence text.
2. The Greece pack **depends at build time** on `ported/greek-mod-1-8` being built (it is not tracked, 2.9 GB). If you prefer the Greece of this pack to be self-contained in git, it can be made a one-time extraction; not done.
3. The temple exit (above): is the mapping wrong or is the temple's point really dropped? Needs one game test of a Greek priest.
