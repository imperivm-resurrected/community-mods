# Mod Comunidad Imperivm (MCI) 9.0, as "MCI Comunidad 9.0"

Row 7, issue #18 (revisit with imperivm-resurrected#37 and #38). `MOD Comunidad Imperivm 9.0.zip` (366 MB, forum t262, `originals/forum/t262/files/`; the same download has `MLR + MCI v8.0.zip`, 71 MB, an older release that is not used). 1,104 loose files for a 1.40 install (`DATA`, `UNITS`, `UI`, `SOUNDS`, `OUTLINES`, `RANDOMMAP`, `CURRENTLANG`, `Adventures`, `Scenarios`, `movies`, `music`, a 388 MB `rle.mmp`) and **no executable**. It is built on JVLIVS CAESAR's La Reconquista (row 8, `extras/la-reconquista-2010/`).

**Permission and licence: not settled, nothing assumed.** The *Permission* column of `docs/MODS.md` row 7 is ❔ (no answer on record). The zip has no licence file; its `DATA/COPYRIGHTS.TXT` has the same bytes as the game's, so it says nothing about the mod. `authors` in `mod.json` is the credits list of the forum post plus `Villoh (port)`. Questions for the maintainer are at the end.

**This port is the mod's balance as eight civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*; decided in #15: copies + room set). The game's eight are not touched and the mod is not an exclusive ruleset. The reserved token is `i`: every id starts with it.

| `id` | Prefix (derived) | Base | Lobby name | Classes | Own orders |
|---|---|---|---|---|---|
| `igaul` | `Iga` | Gaul | Gaul (MCI) | 93 | 76 |
| `irome` | `Iro` | RepublicanRome | Rep. Rome (MCI) | 77 | 70 |
| `iimperial` | `Iim` | ImperialRome | Imp. Rome (MCI) | 50 | 61 |
| `icarthage` | `Ica` | Carthage | Carthage (MCI) | 70 | 75 |
| `ibritain` | `Ibr` | Britain | Britain (MCI) | 66 | 64 |
| `iiberia` | `Iib` | Iberia | Iberia (MCI) | 70 | 66 |
| `iegypt` | `Ieg` | Egypt | Egypt (MCI) | 64 | 62 |
| `igermany` | `Ige` | Germany | Germany (MCI) | 69 | 65 |

No `index` (the engine assigns it, #37), no `letter` written by hand, every civilization `ai: true`, `random` at its default, no `replacesBase`, `variant` or `ownAi`. The set is named after `mod.json` `name`: **MCI Comunidad 9.0** (17 characters; `Mod Comunidad Imperivm (MCI) 9.0` was too long for the room list, and a bare `MCI 9.0` would be taken for row 319 "MCI MOD (2017)", another mod). The longest lobby name, `Rep. Rome (MCI)`, is 15 characters. **Prefix check:** `Iga Iro Iim Ica Ibr Iib Ieg Ige` are distinct from each other, from every prefix in `docs/CIVILIZATIONS.md` (the nearest are `Ibe` and `Imp` of GBR Tactics / La Reconquista 2010) and from the other tokens of this batch (`s`, `z`, `k`, `f`, and `a`, `m`, `n`, `w`, `g`). Rows for `sdk/prefixes.md` of the SDK repo are in the PR description.

## What changed against the old port

The old port (`tools/port-140.js` alone, no `NOTES.md`) put 355 files at the game's paths: 173 class ids the game also has, 7 civilizations and 20 base classes changed for every player, 86 of the game's behavior scripts and 26 AI files replaced, the game's `CONST.INI`, `ITEMS.XML`, `SKILLS.INI`, `FORMATIONS.XML`, `BONUS.XML`, menu INI and random map object list replaced. Now:

- the mod's version of each of the game's civilizations is a clone from HD (`tools/lib/clone-civs.js`, `cloneAllOrders`), and the base-class changes (`Unit`, `Hero`, `Ranged`, `Melee`, `Outpost`, `BaseVillage`, `BaseTownhall`...: 646 elements in the Gaul clone, 291 to 561 in the others) are written **inside each clone's own classes**, never in HD's;
- the scripts the mod edited are copies of their own (`_mci`) that only the clones point to, or blocks inside three of the game's scripts that only run for the clones;
- the shared tables only contribute what the mod **adds**, as patches;
- everything global is left out and listed below, for the rules pack `mci-rules` (a follow-up, not in this PR).

`node tools/shared-paths.js mci`: see *Independence check*.

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" SDK=<imperivm-resurrected>/sdk node tools/mci.js [id ...]     # no id: all eight
```

It unpacks the zip into `.scratch/mci-unpack` (inside the worktree, git-ignored; nothing is written under `originals/`), runs `tools/port-140.js` on it into `.scratch/mci-pristine` (HD + 1.40 + mod, three-way; `raw/port-140/mci.md` lists 0 conflicts to check by hand), copies that into `ported/mci` (git-ignored) and does the rest. `extras/mci/` is the input of `port-140.js` as before: **30 files the mod and HD both changed, merged by hand** (`DATA/CLASSES/UNIT.SC.XML`, the six hero classes, `DATA/COMMANDS/{ARENA,GBARRACKS,VILLAGE}.XML`, the scripts `UNIT_ON_KILL.VS`, `UNIT_ATTACK.VS`, `HERO_MOVE.VS`... that keep the HD guard post, gold selling, kill statistics and sentry guards next to the MCI's tributes, stances and veterans; see `docs/BIG-MODS.md`) and `Adventures/Gartomix.bmp`. They are the **mod's version of the game's classes and scripts that the clones are made from**: none of them is shipped at the game's path. `mod.json` is the only file of `extras/mci/` copied into the port at the end. The same build twice gives the same files (1,362 files, checked with md5; the three lists in `raw/mci-*.txt` too). Libraries: `tools/lib/mci-refs.js` (the picture, sound and path post-pass, below), and `clone-civs.js`, `own-scripts.js`, `asvr-ai.js`, `asvr-inline.js`, `script-checks.js`, `ported-patch.js`, **unchanged**.

## What is a civilization's, what is not

- **A civilization's:** the mod's version of every game class of the civilization (stats, costs, specials, hero skills, the sentries' guard), the orders (`cloneAllOrders`: every order the clone shares with its base is its own copy with the mod's costs and texts: `generals school Igaul`, `MercenariesGuild Igaul`, `auto_call_gpeasants_start Igaul`...), and the mod's new classes of its race: the long bowman, the captain, the outpost guard, the ship and the transport, the extra heroes `?Hero1c..8b`, the second sentry `?Sentry2`, and for the Germans the `RebelJavelinThrower`, `RebelLiberatus` and the `GVillagerRescue` of the Gauls.
- **Classes the mod gave to one race and several civilizations train** (`asBase`, `neutral` in `tools/mci.js`; read from the Mercenaries Guild and the arenas): `EHOPLITA` (race Egypt) is hired by Gaul and Rome, `Hipatista` (race Carthage) by Imperial Rome and Iberia, `PINMORTAL` (race Egypt) by Britain and Carthage, `CMERCENARIO` (race Carthage) by Egypt and Germany, `TaxCollector` (race ImperialRome) by both Romes. Each of those civilizations has its own copy with its base's race (`IgaEHOPLITA`, `IroEHOPLITA`, `IimHipatista`...); the civilization whose race names the class and does not hire it has none.
- **The mod's own neutral classes** (nobody's), kept with the tag `_mci`: `CaptainOutpost`, `LongRanged`, `Piked`, `SentryOutpost` (bases of the captain, the long bowmen and the outpost guards), `ShipTransport`, `ShipSFishing`, `TraderRescue`, `IronMine`, `Main` (a tent the random map places) and `CarroHierro` (the iron cart; nobody else has the id). The tag is there because La Reconquista 2010 (which the MCI is built on) and GBR Tactics define the same ids (below).
- **Orders on the game's base classes** (tribute, burn, stances `pasivo`/`defensivo`/`agresivo`/`sed_de_sangre`, `retreat_notai`, gate levels, `great_charge`): their sources become the classes of this port under the base class (37 orders; the game's own `Unit`, `Hero`... never get them): `patches/DATA/COMMANDS/{UNIT,VILLAGE,OUTPOST,CATAPULT,SHIP,TTENT}.XML` and the commands of the clones.
- **Items** (`patches/DATA/ITEMS.XML`): the 82 items the mod adds (the hero ranks `Captain`, `Officer`, `General`, `Leader`; the armoury and assassin items; the `Meat` and `HeroFavoriteUnit` items...), 16 item scripts, icons (`UI/ICONS`, `UI/FAVOURITE`).
- **Other additions as patches:** `CONST.INI` (17 keys the game lacks), `FORMATIONS.XML` (4 formations: `Hilera`, `Retaguardia`, `Cucaracha`, `Alas Del Infierno`; shared with the Secuter mods, see *Overlap*), `BONUS.XML` (6 bonuses of the clones' spearmen and javelin men against horses), `RANDOMMAP/PLACEOBJECTS.XML` (5 lines: the Main tent and the iron mine in the `stonehenge` blocks).
- **Sounds, art, music:** 59 sounds, 291 interface pictures (command icons, favourites, help), the sprites of the new units (`UNITS/{CMERCENARIO,EHOPLITA,HIPATISTA,PINMORTAL}_mci`: 48 standalone `.rle`, no `rle.mmp.tail`, so no graphics-tail conflict with the 4.2 or Imperivm Legacy), the entities of the 7 second sentries and of 8 game units whose animation the mod edited (the clones use those; they are in the game's folders under `<name>.ENT_mci.XML`), the `Hipatista` voices, 8 music tracks (`GBR_TRACK_8..15_mci.ogg`), 6 random-map templates and their previews.
- **The mod's maps:** 9 scenarios and 10 adventures (see *Maps*).

## Names that are also defined by La Reconquista 2010, GBR Tactics, Asvr or the Secuter mods

`originals/la-reconquista-2010-merged/shared-names.txt` listed 66: 30 orders and 36 items. Checked against: La Reconquista 2010 (its original files in `originals/la-reconquista-2010`, because its port is not built in this worktree), GBR Tactics (`originals/gbr-tactics-2-4-pristine`), the names the commands and items of the Asvr rar define (`DATA/COMMANDS`, `ITEMS.XML` only), and the ports built in `ported/` (the Secuter mods, Imperivm Legacy, the 1.8, the 4.2, CGWAR...). `tools/mci.js` compares with those stand-ins at every build, so the names do not depend on which ports exist.

- **The 30 orders of the 66** (`generals school`, `MercenariesGuild`, `modernize_army`, `auto_call_*peasants_*`, `Hire ...`, `equip_in_iron`...) are **not shared any more**: they are orders of the clones, so each civilization has its own (`generals school Igaul`...).
- **Orders left on the base classes and the neutral ones, and the 36 items, got the tag** `(mci)`: 38 orders (`tribute_food (mci)`, `burn (mci)`, `retreat_notai (mci)`, `form-ranged (mci)`... the `form-*` ones are the Secuter mods' too, `burn` Imperivm Legacy's, `createfoodmule3` the Secuter Grecia's, `Punto de reunion` and `Anular punto de reunion` Asvr's) and 36 items (`Captain`, `Officer`, `General`, `Leader`, `HeroFavoriteUnit0..10`, `Armoury *`, `Meat 1..4`...), in 63 files; `raw/mci-shared-names.txt` is the list. `tagNames` of the library renames every quoted string equal to a name, which also changes `sig="auto_add_pop_start"` (what the engine dispatches by) and `display_name="Captain"` (a unit is called like the item). The tool hides `sig`, `display_name`, `display_name_plural`, `edittree_pos`, `help`, `rollover` and `descr` from it for the call, and puts them back. **Checked in the output:** 0 order or item names in common with La Reconquista 2010, GBR Tactics, Asvr, Mediterranevm, Imperivm Legacy and the Greek terrains after the rename; the method `sig="retreat_notai"` of `Hero` is untouched, the command it dispatches is `retreat_notai (mci)`.
- **Class ids and files:** 0 class ids in common with any of them; the files that have the same bytes at the same path are cosmetic (icons, sounds, outlines: 179 with La Reconquista 2010, 236 with GBR Tactics) and none is a gameplay file.
- **Not tried:** the mod active together with La Reconquista 2010, GBR Tactics or Asvr.

## Scripts

`tools/lib/own-scripts.js` (tag `mci`): **69 scripts copied** as `<name>_mci.vs` (and `_mci_<id>` where the class ids the script writes as text differ per civilization: 195 files in `DATA/SUBAI`, the list in `raw/mci-own-scripts.txt`), which only the clones' classes and commands point to; the game's scripts are the game's. The methods the clones inherit from the game's classes whose script the mod edited (`unit_attack`, `unit_engage`...) are written inside each clone (8,202 `<method>` in 567 classes). The mod wrote its civilization tests as `.race == Gaul`; for a clone the race is the clone's own, so each test also accepts the clone (`Mod_TrueRace`), 33 scripts. `GetPlayerRace` is left alone.

Three behaviors the clones inherit and the mod edited cannot be copies (a class lists 8 at most and the same path counts once): `arena_behavior.vs`, `outpost_behavior.vs`, `village_behavior_givefood.vs` go as one block per civilization inside a **patch of the game's script** (`patches/DATA/SUBAI/`, `tools/lib/asvr-inline.js`), at the first line of code, `if (Mod_TrueRace(This) == Igaul) { ... return; }`. The game's civilizations never enter a block. **A compilation error in one of these three patches stops the script for every civilization.** The other inherited behaviors the mod edited (`hero_skill_behaviour.vs`, `stamina_counter.vs`, `gate_patrol.vs`, `outpost_behavior_guard.vs`, `townhall_behavior_guard.vs`, `settlement_behavior_ambient.vs`, `townhall_autotrain.vs`, `townhall_sentries_control.vs`, `wall_patrol.vs`) stay the game's: *Not ported* below.

**Checks the build makes** (`tools/lib/script-checks.js`, **the build stops** on any failure): every copy has the parens, braces and brackets of the mod's script it comes from and no code after a `return`; each of the 9 patches of the game's scripts is applied to HD's script with the engine's algorithm (`PatchScriptText`) and the result is balanced; 401 class ids written as text in scripts are classes of the game or of this port. **These are not a compiler.** An undeclared variable, a wrong type or a function that does not exist pass them. The test is `Logs\imperivm\imperivm-mod.log`, `compilation error`.

## The AI

13 scripts as `MCI_*` copies, started only for the clones: the economy loop `ES_Village` (picked by a patch of `GetEconomyScript.vs`; **never started with `AIRun`**: it calls `Sleep`, and a `Sleep` inside a script run by `AIRun` crashes the game, engine #15), the helpers `ESH_BuildArmy` and `ESH_Market` (no `Sleep`, they do their work and return, as the game's do; they start other scripts with `AIRun` as HD's own `ESH_BuildArmy` does), `SquadMonitor` (started by a patch of `Main.vs` with the player's `AIRun` like the game's other monitors; it sleeps, HD does the same), `TS_AttackAtWill` and the eight tactics `TS_GaulTactic2`, `TS_IberianTactic2`, `TS_GermanyTactic2`, `TS_EgyptTactic`, `TS_BritishTactic`, `TS_CarthageTactic2`, `TS_RRomeTactic`, `TS_MRomeTactic2` (picked per civilization by a patch of `GetTacticScript.vs` in the first 5 seconds, the mod's own value). What the engine calls by name and returns a value (`CalcGAIKAPriority`: 70 % instead of 100 %, `GetArmyNeed`: timings, `TSH_ArenaRecruit`) is a block inside the game's script that only runs for the clones (`Mod_PlayerCiv`). The game's AI sees a clone as its base (`ai: true`). `ES_Stronghold` and the other helpers are the game's: the mod did not edit them.

Not ported: the tuning of `AI.INI` (27 values of keys the game has, global, below), `AI/DEFENSIVE/` (the mod's profile), `AIOSendSquad`, `GS_KillEnemies`, `GSH_SynchApproach`, `GS_Capture` (the engine picks the strategy; log lines and constants).

## Left out because it is global

What the mod changes that cannot be scoped to a clone (AGENTS.md, *World rules packs*). A rules pack `mci-rules` can carry it; **it is not built in this PR** (decided by the maintainer; AsvrMod precedent). Game values are HD's.

- **`DATA/CONST.INI`, 36 values:** `CatapultBuildSpeed` 15→25, `ExpertiseCost` 4→6, `RushDamage` 6→1, `ExpFromArmyDivider` 3→5, `DiseaseHealthDecrease` 40→10, `TimePerCeasefireLevel` 1000→2000, `DiseaseCost` 3→6, `ProductionGoldBase` 24→40, `TrainingExpChance` 100→85, `BleedingAttackCost` 1→2, `DiseaseMinHealthPercent` 50→80, `HeroApproachDistance` 400→500, `SightPerScoutLevel` 100→10, `ArcherAgainstHeroChance` 30→40, `TimePerFrenzyLevel` 1000→5000, `HealthDecreaseStep` 5→10, `CatapultBaseFireRate` 40→600, `ProductionFoodBase` 24→30, `GOutpostGoldReturn` 10→25, `ROutpostGoldReturn` 8→9, `EuphoriaStamina` 3→2, `LearningCost` 1→0, `DrainCost` 1→2, `FrenzyBaseTime` 1000→5000, `RegenerationCost` 4→2, `CatapultDecaySpeed` 10→20, `SlaveryGold` 2000→3000, `CatapultAddFireRate` 28→280, `PowerStrikeCost` 4→6, `RegenerationHealth` 40→50, `CripplingAttackCost` 1→4, `CeasefireBaseTime` 1000→2000, `GOutpostFoodSales` 20→30, `UIBars.CmdBarMaxButtons` 16→40, `RandomMap.SYMinDistSameBound` and `SYMinDistDiffBound` 48→68.
- **`DATA/SKILLS.INI`:** the skill `Scout` becomes "Favoritismo" (name, text and icon). The clones' heroes list `Scout` (the mod's hero skill lists put it first), so on a clone's hero it is the game's Scout, and the **favourite unit mechanism of the mod** (`HeroFavoriteUnit*` items, `UI/FAVOURITE`, the favourite scripts) has no skill to level it.
- **`DATA/AI/AI.INI`, 27 values:** `Vars.All` `AIV_MaxMilUnits` -1→400, `AIV_MilHeavyWant` 10000→30000, `AIV_Druids` 10→20, `AIV_Training` 60→30, `AIV_FeedWithWagons` 0→1, `AIV_UseRuins` 0→1, `AIV_UseTeleports` 1→0, `AIV_TimeStrongholdDefences1` 40→30, `...2` 60→40; `Vars.Easy` `AIV_Druids` 0→20, `AIV_MaxMilUnits` 100→250, `AIV_UseForts` 0→1, `AIV_MaxAttentionPoints` 1→2, `AIV_Tribute` 0→1, `AIV_MaxIMountaineers` 0→-1; `Vars.Normal` `AIV_Druids` 10→30, `AIV_DruidAttach` 15→90, `AIV_TradeGold` 1→2, `AIV_Training` 60→20, `AIV_Tribute` 0→1; `Vars.Hard` `AIV_Druids` 20→30, `AIV_DruidAttach` 25→90, `AIV_TradeGold` 2→3, `AIV_TrainingRush` 40→20, `AIV_ArenaHire` 40→45, `AIV_ArenaRush` 7→9, `AIV_ArenaUpgradeHires` -1→1.
- **34 items of the game with other contents** (`ITEMS.XML`; the patch only adds the 82 new ones): `Rye spikes`, `Snake skin`, `Belt of snakes`, `Eagle feather`, `King's belt`, `Poison mushroom`, `Healing herbs`, `Healing water`, `Elephant Tusk`, `Boar teeth`, `Horn of victory`, `Ash of druid heart`, `Finger of death`, `Fur gloves of health`, `Concentration stone`, `God's Gift`, `Spoils of War`, `Gold`, `Veteran Guild`, `Veteran Medal`, `Veteran Offence`, `Veteran Defence`, `Veteran Health`, `Noble Offence`, `Noble Defence`, `Damage charm`, `Armor charm`, `Health charm`, `Knowledge charm`, `Amulet of triumph`, `Golden Ankh`, `Scroll of Death`, `Gem of Wisdom`, `Ring of Power`. Their item scripts are not shipped either.
- **`FORMATIONS.XML`:** the mod edits the game's `Ranged wings` (Height 1→2, BonusDamage in place of BonusAttack, offsets...). Its 4 new formations are carried.
- **`RANDOMMAP/PLACEOBJECTS.XML`:** the counts of the game's own objects (villages `mindist` 2500→5000 and 2 per player, the outposts `ROutpost`/`EOutpost`, the teleports replaced by `Ruins1`, `Stonehenge`...) change every random map for everybody. Only the Main tent and the iron mine lines are carried.
- **The game's neutral classes** (28 the mod redefines and no clone inherits): `BaseRuins` (14 elements: the `itemtype` list with the mod's items), `Chest`, `FacePillar`, `Fountain2`, `LionThrone`, `Obelisk1`, `Obelisk2`, `RibCage`, `ScullTree`, `WELL`, `well1`, `well2`, `fountain` (the item and time they respawn: `Belt of might`, `Damage charm`, `Knowledge charm`, `Bloodstone`, `Bear teeth amulet`, `Simple boar tooth`, `Watch Eye I`, `Apple of feeding`, `Noble Defence`, `Noble Offence`, `Armor charm`, `Health charm`, 300000 to 600000), `Camel` (maxhealth 800, sight 1000), `CartTrader` and `Trader` (health, radius, speed), `Tradecar_Donkey` (health 800 + `sneak_behavior.vs`), `catapult_placing`, `CatapultTower` (range 1200, `Fire_Arrow`), `ShipS` (health 500, speed 100), `MPeasantMulti` (icon), `TOutpost` (the German outpost: race `German`, which the SDK does not clone; its range, settlements and `TSentry2` guard), `TTent` (maxhealth 5000, sight 900, 13 elements: the tent's new orders and `ttent_idle.vs`), `Stonehenge` (the four orders `tormenta`, `suicidio`, `estertor`, `locura` and their scripts: `raw/mci-base-orders-left-out.txt`), and the commands and scripts of `Animal`, `BearUnit`, `BoarUnit`, `WolfUnit`.
- **Scripts of the game edited at their own path** (86 in `DATA/SUBAI`, the AI files above, `BONUSSCRIPTS/002 Riches`...): `raw/mci-left-out.txt` lists the 110 files. The ones the clones need are copies (above); the others are the game's.
- **`DATA/SCDEBUG.XML`** (a debug key `F8` that selects the hero), the picture `UI/HELP/LEVEL ICO.BMP` and the 26 walk sounds `SOUNDS/WALK/HORSE_ARMY_*` that the mod redrew or re-recorded at the game's paths (they would replace the game's own).

## Not shipped on purpose (listed in `raw/mci-left-out.txt`)

- **Game modes `6 Destruccion`, `9 Portuacion`, `10 Zona teutona` and starting bonuses `004 Wealth`, `005 People`** (`DATA/GAMESCRIPTS`, `DATA/BONUSSCRIPTS`), with the lobby list that offers the bonuses (`DATA/INTERFACE/MENU/MPGAMEMENU.INI`) and their pictures (`UI/MENU/BONUSES.BMP`, `FOOD.BMP`, `PEOPLE.BMP`): by El Jüsticiero Misteryoso, a co-author, and the numbers `6`, `9`, `10`, `004`, `005` are the ones the 4.2's modes and bonuses take (decided by the maintainer; same as Asvr).
- **Text tables:** `local/spanish/HELP.XML`, `TIPS.XML` and `loc/spanish.loc.xml` (decided by the maintainer: a table translates the game for everybody). The last one has 111 entries: 81 are keys HD's table does not have (the names and texts of the mod's new orders, items and classes), 20 repeat HD's, **10 change HD's own text** (`Cover of Mercy`, the main menu's `Multiplayer` and `News`, `Not enough stamina`...). Without the 81, the mod's new content shows its keys in Spanish and English. The 1.8 keeps the additive ones and writes them again for the clones' renamed orders (`tools/greek-1-8-civs.js`); here they are **not** carried: a question below.
- **The three videos** `movies/intro.avi`, `Creditos.avi`, `Cesar_vs_Mixt.avi` (maintainer's decision).
- **`DATA/INTERFACE/COMBO/ITEMICONS.INI`:** the editor's item list; HD has no `COMBO` folder.
- **The old engine's tricks:** the mod has none of the town hall branch choices, no launcher and no `gbr.exe` (checked by grep in `DATA/`: no `Choose*` flag, no `_Enable_Or_Disable_Cmd`, no `rand(776`). It ships no executable or DLL, so there is nothing to say about what an `.exe` did.

## The menu skin (the one exception to "patches only")

AGENTS.md, *Menu skin*; approved for this mod by the maintainer. Whole files, no text table, no menu INI (the mod ships no INI its skin needs: `MPGAMEMENU.INI` is the bonuses' list):

| File | What it is |
|---|---|
| `CURRENTLANG/MENUBACKGROUND.BMP` (1920x1080, 24-bit, 5.9 MB) | the mod's 4:3 background, **widened by `port-140.js` to HD's size** (the left half and the right border as drawn, the band between them stretched) |
| `CURRENTLANG/MENUBACKGROUNDIMPERIVM.bmp` (1024x768, 24-bit, 2.3 MB) | the zip's, byte for byte |
| `CURRENTLANG/GAMESPYBACKGROUND.BMP` (1024x768, 16-bit, 1.5 MB) | the zip's, byte for byte (the multiplayer screen of the old engine) |

**Shared with:** `MENUBACKGROUND.bmp` and `MENUBACKGROUNDIMPERIVM.bmp` with CGWAR and the 4.2, `MENUBACKGROUND.bmp` with the 1.8, Imperivm Legacy and Mediterranevm (other bytes), and with Asvr (it ships its own `MENUBACKGROUND.bmp`); `GAMESPYBACKGROUND.BMP` has the same bytes in La Reconquista 2010. Only one skin shows at a time; the winner of each file is chosen by the load order or by the player in the content manager (*Use the files of ...*), and there is no `incompatibleWith`. **Not tried:** which of the three pictures HD reads on which screen (HD may read only `MENUBACKGROUND`), the screens the skin touches (conquest, options, multiplayer, lobby), any combination with another skin.

## Maps and adventures

**The mod's own: 9 scenarios and 10 adventures** (`Scenarios/`, `Adventures/`; the zip's `.bfhp`, unchanged except for the class ids below). They place the mod's new classes by the 1.40 mod's ids (`RebelLiberatus`, `Hipatista`, `IronMine`, `Main`, `TraderRescue`...), which do not exist any more: `clone-civs.js` rewrites them in the maps, but its in-place write cannot make a map longer than its pages, and two maps failed for some civilizations (`La grán Romana`: Imperial Rome, Iberia and Germany; `Mar mediterraneo V.2 Conquest`: Germany), and `tagCollisions` does not open a `.bfhp` (the tagged neutral classes, which `Gartomix` places: the iron mine). `tools/mci.js` finishes it (step 6b): every old id left in a map is written as the new one (72 civilization classes, 9 tagged), and a map whose text grew past its last page gets the indentation of its XML squeezed and its last page padded with blanks. Only those three maps place any of them; the others place the game's classes.

- **They place the game's classes, with HD's stats,** for everything the mod only rebalanced (the game's `GArcher`, `RPraetorian`...): the maps do not become MCI-balanced by themselves. A map that places a mod class (`IgeRebelLiberatus`...) needs this pack active, which it is (same pack).
- **Not tried:** any of the 19 maps in game. `Mar mediterraneo V.2 Conquest` is in `Scenarios/` as a scenario, not a conquest (the zip ships it so); the zip has no `Conquests/`.
- **Two ported mods `require` the MCI** (`grep -l '"mci"' ported/*/mod.json`): **`haenor-rescate-de-viriato`** (adventure `Haenor_conoce_a_Viriatocomienzo_de_una_historia_sin_mod`, row 133) places `CMERCENARIO` (58), `Hipatista` (32), `EHOPLITA` (32), `PINMORTAL` (32), `IDefenderGuard` (9), `GaulCaptain` (2), `IberianCaptain`, `ImperialRomanCaptain` and `GHero8`; **`italia`** (scenario `Italia.BFHP`, row 50) places `RebelLiberatus` (102), `RebelJavelinThrower` (122), `GVillagerRescue` (111), `TraderRescue` (34), `RArcherLongBow` (5) and `Main`. Their ids are now `IgeRebelLiberatus`, `IceCMERCENARIO`... (the clone's, from `ported/mci/civs/*.json` `alias.classes`) or `TraderRescue_mci`, `Main_mci`: **both maps load classes that no longer exist when this port replaces the old one, until #8 rewrites them** (decided in #15, 2-A). Not touched here.

## Random maps

6 templates (`AFRICA`, `ALEATORIO`, `BRITANIA`, `ESPANA`, `ESPIRAL`, `ITALIA`) and their previews. **`AFRICA.RM_mci.XML` is kept as renamed** (`tagCollisions` found the same path with other bytes in a port present at build time; I did not check which); the other five are not renamed. Asvr tried the same two kinds of names in game and both worked (`extras/asvrmod-vii-civs/NOTES.md`); not tried with this pack. The `GreatTavern` the old port dropped from the random map is not in the template now (it never was a class).

## Overlap with other packs

- **Orders and items:** above.
- **The nine patches of the game's scripts** (`ARENA_BEHAVIOR`, `OUTPOST_BEHAVIOR`, `VILLAGE_BEHAVIOR_GIVEFOOD`, `GetEconomyScript`, `GetTacticScript`, `Main`, `CalcGAIKAPriority`, `GetArmyNeed`, `TSH_ArenaRecruit`, plus `AI.INI`) are the same set Asvr patches, at the same anchors, each block guarded by its own civilizations. Patches of several mods add up and the second finds the anchor still there; **not tried with both active.** `patches/DATA/CONST.INI`, `ITEMS.XML`, `FORMATIONS.XML`, `BONUS.XML`, `RANDOMMAP/PLACEOBJECTS.XML` add keys or elements. The Secuter mods define the orders `form-cucaracha`, `form-hilera`... too, which is why these got the `(mci)` tag; whether their *formations* (`FormationClass` names) are the same as this pack's `Hilera`, `Retaguardia`, `Cucaracha`, `Alas Del Infierno` was **not checked**.
- **The rules pack** `mci-rules` will overlap with the rules packs of Asvr and Balanced Factions on `CONST.INI`, `AI.INI` and `UNIT_SPECIALS.INI` values; that pack does not exist yet.

## Not ported, and why

- **Behaviors over the engine's 8 per class** (a class takes 8 in all, the inherited ones included): the build drops the mod's own ones last-first, 18 of them from 14 classes. The mod's `BURN_BEHAVIOR` goes from the outposts of Britain, Carthage, Egypt, Gaul, Iberia and Rome and from the German villages (the `burn` / `stopburn` orders there do nothing); `VILLAGE_AUTO_CALL_PEASANTS` from the villages of Britain, Carthage, Egypt, Gaul, Iberia and Rome (the `auto_call_*peasants_*` orders do nothing there; the German village keeps it); `ioutpost_behavior` from the Briton and Iberian outposts; `OUTPOST_CONVERTS` and `OUTPOST_SENTRY_GUARD` from the Gaul guard post. The list is in the build log; a fix needs a script that merges two behaviors.
- **The Stonehenge orders** (`tormenta`, `suicidio`, `estertor`, `locura`): the Stonehenge is the game's neutral class.
- **The favourite unit** (skill `Favoritismo`): see `SKILLS.INI` above.
- **Inherited behaviors the mod edited** (list in *Scripts*) stay the game's.
- **`TOutpost`** (the German outpost) and **`TTent`**: the SDK does not clone them (race `German`, no race); the Germans use the game's.
- **Entity files with `.ENT_mci.XML`:** `tagCollisions` renames `X.ENT.XML` to `X.ENT_mci.XML` (the tag goes before the last extension), so the 15 entities in the game's unit folders no longer match `*.ent.xml`. The clones name them by path and the validator finds them; whether the editor lists them was not looked at.
- **Unit art with frames the rows do not have** (`CMERCENARIO`, `EHOPLITA`, `HIPATISTA`; 10 validator warnings, all the mod's own art): a unit can look wrong.
- **Mod files the mod's own package lacks** (the original did not resolve them either, nothing is invented): the icon `gameres/icons/Egbert.bmp` of `BHero3C`; the sound entities `VoiceShipBarb`, `VoiceShipArab`, `VoiceShipRoman` (the ships' command voice) and `VoiceRebelLiberatus`; they are named in `OWN_BUGS` in `tools/mci.js`. HD's own broken references (`WBreast`, `Anibal`) are left alone.

## Exit points of buildings

The task asked to check that every type-2 exit point of the barracks, gym, temple and village the port ships lands on a free, reachable cell of its `.PASS`. **The port ships none:** `UNITS/` has the unit art and the sentries' entities only; there is no `BUILDINGS/` or `MAPOBJECTS/` folder at all, the iron mine uses the game's `Teleport_1` entity and the Main tent the game's `tent01`. Checked with `find ported/mci -ipath '*buildings*' -o -ipath '*mapobjects*'` (only two `OUTLINES` bitmaps) and by listing every `entity=` of the classes: the ones that resolve inside the port are the 15 unit entities and the four new units' folders. The clones' buildings use the game's entities, with the game's exits.

## References (pictures, sounds, entities)

`tagCollisions` renames a file that collides with another port's and then rewrites every text that names it **by file name alone, in every folder** (the blue square that appeared in the Asvr port). `tools/lib/mci-refs.js` (the same logic as `asvr-refs.js` and `greek-2x-refs.js`, with the tag as a parameter and one more repair) checks after the rename and **stops the build** on a reference that does not resolve: 2,981 pictures, sounds and entities checked; fixed by the build: **5 sound paths** (the sound entity read `CurrentLang/voices/Hipatista_mci/N.wav`, a folder nobody renamed, because the art folder `UNITS/HIPATISTA` was), 0 picture references, 0 class words, and 1 display name (`Main_mci Tent` → `Main Tent`). Allowed by name (10 in the build): the five the mod's own package already lacked (*Not ported*, last item) and five that HD's own classes name the same way and do not resolve in HD either (`VoiceBDruid`, `VoiceGDruid`, `VoiceTEnchantress`, `VoiceIEnchantress` and `nothing`). HD's own `WBreast` is not referenced by this port.

## Independence check

`node tools/shared-paths.js mci` (against the game and the ports in this worktree's `ported/`: CGWAR, the 1.8 and the 4.2 linked, the Secuter mods, Imperivm Legacy 1.x and the maps tracked in git):

```text
cgwar: 2 files in the same path with other bytes, 0 class ids in common
  currentlang/menubackground.bmp
  currentlang/menubackgroundimperivm.bmp
greek-civilization-mod: 2 files in the same path with other bytes, 6 identical, 0 class ids in common
  currentlang/menubackground.bmp
  currentlang/menubackgroundimperivm.bmp
greek-mod-1-8: 1 files in the same path with other bytes, 0 class ids in common
  currentlang/menubackground.bmp
5 collisions
```

**0 class ids in common with the game and with every port; the 5 paths are the menu skin** (cosmetic, one skin shows at a time: *The menu skin*). Also compared by a scratch script with the ports that are built only in the main checkout (`ported/mediterranevm-alpha`, `imperivm-legacy`, `greek-mod-terrains`: 0 class ids, the one path is `menubackground.bmp`), and with the originals of La Reconquista 2010 and GBR Tactics and the Asvr rar (0 class ids, 0 orders or items in common, 0 gameplay files with the same bytes). **Not run:** `shared-paths.js` against the ports of this batch (Secuter, Caesar, Community) that are not in `ported/` yet; two civilization mods active together in game.

## Validation

`validate-mod.js` (`dev-villoh`, `--game` and `--data originals/game-data/DATA`): **1362 files checked, 0 errors, 10 warnings** (the unit art above). The validator ignores what the patches do and does not read the code of script patches.

## In game

**Tried: nothing.** This port was built and validated by the tool only; it has not been loaded in the game by anyone, and `imperivm-mod.log` has not been read. Do not read the validator's 0 errors as "works".

**To try, in this order** (copy `ported/mci` to `$G/mods`; a room with only the set `MCI Comunidad 9.0`), reading `Logs\imperivm\imperivm-mod.log`:

1. The log: `compilation error` first (the three behavior patches, `GetEconomyScript`, `GetTacticScript`, `Main.vs`, `CalcGAIKAPriority`, `GetArmyNeed`, `TSH_ArenaRecruit`, the `MCI_*` and `_mci` scripts), patch errors, missing files.
2. The lobby: the eight `(MCI)` civilizations, the game's eight as they were; the room with only this set (dropdowns, Random draws one of the eight, the AI picks one).
3. A skirmish with `igaul`: town, barracks, a hero (rank items), the long bowman, the captain at the arena, the Mercenaries Guild (`Hire Hoplita` in the Gaul tavern), an outpost with its guards, a ship, the stances, tribute between settlements, the iron.
4. Two of the mod's civilizations against each other, one with the game's, and an `(MCI)` AI as opponent for a while (the economy loop and the tactics).
5. The menu: the three backgrounds, the screens the skin touches.
6. The mod's maps (`La grán Romana`, `Mar mediterraneo V.2 Conquest` and `Gartomix` first: the ones that place its classes).
7. The pack with another civilization mod (the 1.8, GBR Tactics, Asvr, La Reconquista 2010) and the random map templates.

## Questions for the maintainer

1. **Permission and licence** (row 7 ❔): nothing on record.
2. **`loc/spanish.loc.xml`:** ship the 81 keys HD lacks (as the 1.8 does, written again for the clones' orders) and leave out the 10 that change HD's text? Without them the new content shows keys.
3. **The three videos and `ITEMICONS.INI`** are out; the maps `haenor-rescate-de-viriato` and `italia` break until #8.
4. **Behaviors over 8:** worth a script that merges `BURN_BEHAVIOR` and `VILLAGE_AUTO_CALL_PEASANTS` into one, or accept the loss?
5. **The three skin pictures:** `MENUBACKGROUNDIMPERIVM` and `GAMESPYBACKGROUND` may not be read by HD; ship them anyway?

## Pending

- *Pending: independence:* none known by class id, order or item name; the menu skin is shared by choice; two civilization mods active together was not tried.
- `mci-rules` (everything under *Left out because it is global*), after this PR.
- The two ports that `require` the MCI and the 19 maps' use of the clones (#8).
- Engine: a `.bfhp` cannot be rewritten longer than its pages (`hpfs.js`, shared); the 8-behavior cap per class; no clone of `TOutpost` and `TTent`. Not opened as issues here.
