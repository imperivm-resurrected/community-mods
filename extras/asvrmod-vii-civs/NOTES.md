# AsvrMod VII Ancient Generals a0.8.1 (Asvr)

Row 6, issue #29. `asvrmod_7a_081.rar` (GameBanana 729311, THIONG's upload, 280 MB, `originals/gamebanana/729311/`): 1.40 files over the game folder (`DATA`, `UNITS`, `BUILDINGS`, `UI`, `SOUNDS`, `OUTLINES`, `MINIMAP`, `RANDOMMAP`, `CURRENTLANG`, a 414 MB `rle.mmp`, and three `.exe`). Permission: OK via Shaul R. No license in the download (the folder has a `NOTAS.txt` that is the author's changelog, not a license). `authors`: Asvr and `Villoh (port)`.

**This port is the mod's balance as eight civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*; decided in #15: copies + room set). The game's eight are not touched, and nothing here is an exclusive ruleset. The reserved token is `a`: every id starts with it.

| `id` | Prefix (derived) | Base | Lobby name | Classes |
|---|---|---|---|---|
| `agaul` | `Aga` | Gaul | Gaul (Asvr) | 92 |
| `arome` | `Aro` | RepublicanRome | Rep. Rome (Asvr) | 85 |
| `aimperial` | `Aim` | ImperialRome | Imp. Rome (Asvr) | 63 |
| `acarthage` | `Aca` | Carthage | Carthage (Asvr) | 80 |
| `abritain` | `Abr` | Britain | Britain (Asvr) | 79 |
| `aiberia` | `Aib` | Iberia | Iberia (Asvr) | 78 |
| `aegypt` | `Aeg` | Egypt | Egypt (Asvr) | 76 |
| `agermany` | `Age` | Germany | Germany (Asvr) | 79 |

No `index` (the engine assigns it, #37), every civilization `ai: true`, `random` at its default, no `replacesBase`, `variant` or `ownAi`. The set is named after `mod.json` `name`: **AsvrMod VII a0.8.1** (18 characters, #38); the longest lobby name, `Rep. Rome (Asvr)`, is 16.

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/asvrmod-vii.js [id ...]     # no id: all eight
```

It unpacks the rar into `.scratch/asvr-src` (inside the worktree, git-ignored; nothing is written under `originals/`), drops the three `.exe` and `NOTAS.txt`, runs `tools/port-140.js` on it into `.scratch/asvr-pristine` (HD + 1.40 + mod, three-way: `raw/port-140/asvrmod-vii-civs.md` lists the 28 conflicts, in which the mod's side was used), copies that into `ported/asvrmod-vii-civs` and does the rest (below). The same build twice gives the same files (2060 files, checked with md5). `extras/asvrmod-vii-civs/mod.json` is copied over at the end; there are no other hand fixes: the fixes the build applies are in the tool, each with its reason. `raw/asvrmod-vii-civs-left-out.txt` and `raw/asvrmod-vii-civs-own-scripts.txt` list what the build left out and which scripts it copied. Libraries: `tools/lib/asvr-ai.js` (the AI), `tools/lib/asvr-inline.js` (behaviors the clones inherit), and `tools/lib/own-scripts.js` / `clone-civs.js` with the small changes listed in `PR-NOTES.md`.

## What `AsvrMod.exe` changed (nobody had looked)

Nothing that can be ported, and nothing of its own logic. Compared byte by byte (sections and resources) with the HD `gbr.exe`, with the Greek Mod 1.8's `gbr.exe` (`originals/greek-mod-1.8-full/`) and the three:

- `AsvrMod.exe` has exactly the size of `gbr.exe` (4,456,448 bytes). Its `.text` is the 1.40 one: the only four differences with HD are the same seven bytes in four places (the default window `push 0x1e0 / push 0x280`, 480x640, where HD has `0x300 / 0x500`), which the Greek 1.8's `.exe` also has. So it is the stock 1.40 `gbr.exe`, not a patched build.
- `.rdata`/`.data`: 1.40's strings (the GameSpy host names and `gamespy` product strings HD changed to `imperivm`); the 1.8's `.exe` differs from it in the Greece strings, not this one.
- The PE header: the *large address aware* flag is set (`Characteristics` `0x012f`, HD's `0x010f`), which is what `4gb_patch.exe` does (the notes tell to patch `AsvrMod.exe` and `gbr.exe` with it).
- `.rsrc`: another icon (`ICON 1`, 296 -> 16,936 bytes, and its group) and five other cursors (22 resources instead of 30). Nothing else.
- `Arch.EXE` (164 KB, a 2003 tool) packs and unpacks the `.pak` files ("Haemimont Pack File"): the notes say to name a pack `zdata.pak` so it loads after `data.pak`. `4gb_patch.exe` (44 KB) sets the flag above.

So the three executables only let the 1.40 game start from the mod's folder with the mod's loose files, 4 GB of address space and its own icon. A mod cannot ship executables and the port has nothing of them to carry: the engine of Resurrected loads the mod's files itself and does not need the 4 GB patch (it is the HD `gbr.exe`, whose flag is set by the DLL's launcher). The notes' "removed music / arcane market" are covered below.

## What is a civilization's, what is not

- **A civilization's** (the eight): the mod's version of every game class of the civilization (stats, commands, costs, specials, **the 5 skills of the hero variants**), cloned from HD by `clone-civilization.js --all-orders` (`tools/lib/clone-civs.js`). The mod's own classes of a civilization come with it: `?Hero1c..4f` (the hero variants), `?Lider`, `?Lider1-4` (the *leaders* the arenas hire: "Reclutar xLider"), `?Sentry2`, `Boadicea`, `BHorseman`, `Anibal`, `CMERCENARIO`, `NSECUAZ` (Carthage), `GAncientDruid`, `NVAEL`, `Hipatista`, `PINMORTAL`, `GTracio`, `EHOPLITA`, `TaxCollector`. The ones the mod gave a race other than the civilization that trains them (its Macedonian hoplite `EHOPLITA` has race Carthage and is trained in the Republican barracks; `Hipatista` is Carthage's and Imperial Rome's; `PINMORTAL` Carthage's and Egypt's; `GTracio` Iberia's; `TaxCollector` ImperialRome's, trained in both Romes' arenas) are renamed for the civilization that trains them: `clone-civs.js` takes `asBase` for that now (one line, see `PR-NOTES.md`).
- **What the mod changed in the base classes** (`Unit`, `Military`, `Melee`, `Ranged`, `ShortRanged`, `Hero`, `HeroMounted`, `Horse`, `Catapult`, `Sentry`, `Outpost`, `BaseBarracks`, `BaseArena`, `BaseTavern`, `BaseTownhall`, `BaseVillage`, `BaseShipyard`, `BaseTownBuilding`, `BaseAnimal`): written **inside each clone** (81-165 elements each, by civilization), never in HD's class.
- **Scripts the mod edited** (`tools/lib/own-scripts.js`, tag `asv`): 67 copies `<name>_asv.vs` (and `_asv_<id>` where the class ids the script writes as text differ per civilization: `barrack_train`, `unit_on_kill`, `arena_hirehero`, `teuton_convert`...), which only the clones' classes and commands point to; the game's scripts are the game's. The methods the clones inherit from the game's classes whose script the mod edited (`unit_attack`, `unit_engage`...) are written inside each clone (3,972 `<method>` in 464 classes).
- **Behaviors the clones inherit and the mod edited** (`arena_behavior.vs` of every barracks and arena, which is where the *Lider* is hired with the civilization's own `?Lider`; `outpost_behavior.vs`, the garrison of the outposts; `village_behavior_givefood.vs`): a copy cannot replace an inherited behavior (the game lets a class list 8 and counts the same path once), so each goes as one block per civilization **inside a patch of the game's script** (`patches/DATA/SUBAI/`, `tools/lib/asvr-inline.js`), at the first line of code, `if (Mod_TrueRace(This) == Agaul) { <the mod's body with the clone's class ids> return; }`. The game's civilizations never enter a block. **A compilation error in one of these three patches stops the script for every civilization**: read `imperivm-mod.log` for `compilation error` first.
- **The tests of the civilization in the mod's scripts**: the mod wrote `.race == Gaul` (98 scripts do something like it); the race of a clone's object is the clone's, so each test also accepts the clone: `(X.race == Gaul || Mod_TrueRace(X) == Agaul)`, and `IsHeirOf("CLider2")` / `Count(player, "GArcher")` also accept the clones' classes. `GetPlayerRace` is left alone (it returns the base for a clone).
- **Items** (`patches/DATA/ITEMS.XML`): the **141 items the mod adds** (new ids; `Anillo de la fuerza`, `Roca supurante`, the *Elegidos*, the ranks `Guerrero..Leyenda`, the Lider items...) with their item scripts (117 files in `DATA/ITEMSCRIPTS`), icons and sounds. The 20 game items it edits are left out (list below).
- **The mod's own neutral classes** (nobody's): `Lider` (the base of every `?Lider`: it carries `especialidad.vs`), `GreatTavern`, `IronMine` (renamed `IronMine_asv`: the MCI has the same id), `MercadoArcano` (the arcane market: the mod itself removed it from standard games; here it is only in the editor, with its 5 scripts), `Momia`, `AnubisGhost`, `Bubo`, `Fenrir`, `LionNemea`, `OsoGuardian`, `Perro`, `Vision`, `BearSummoned`/`Melee3`/`Pt3`/`Ruins2` (renamed `_asv`), `AxeRanged`, `Manto`, `Melee2`, `Ranged1`, `Pt1`, `Pt2`, `LionSummoned`. The summons that the item scripts place by name (`Momia`, `AnubisGhost`...) stay as they are so the scripts find them whoever owns the item. The iron mine is placed by the random maps through a patch of `PLACEOBJECTS.XML` (3 lines).
- **Commands**: each civilization's file (`DATA/COMMANDS/A<CIV>.XML`, 57-73 commands), the shared orders (barracks, temple, tavern, arena...) patched to name the clones, `ASVRMODVII.XML` for the neutral classes (10 commands) and the base classes (13).
- **Other additions as patches**: `CONST.INI` (17 keys of its own, the Stonehenge and outpost constants), `FORMATIONS.XML` (4 formations), `BONUS.XML` (7 bonuses of the clones' spearmen against horses).
- **Sounds, art, voices**: 15 sounds and 732 interface pictures (the icons of the commands, researches, items and help), the sprites of the new units (`UNITS/<id>_asv/*.rle`, 110 new sprites; the 86 the mod ships that are HD's own are not carried), `VoiceHipatista`. All additive; names the other ports have with other bytes are renamed `_asv` (`tagCollisions`: 5 classes, 7 art folders, ~170 files, 15 orders).
- **Random maps**: the 12 new templates (`Hispania`, `Galia`, `Britania`...) and their bitmaps are additive and stay; the changes to the game's own (`COASTAL.RM.XML`, the counts in `PLACEOBJECTS.XML`) do not.

## The AI

The AI is the main risk of this port (31 files in `AI/`, and the economy loops); read engine issue #15 (a `Sleep` inside a script run by `AIRun` crashes the game) before touching it. What the mod's AI changes, against HD: the AI **uses items** (`SquadMonitor`: the potions, `Odre del agua inagotable`...; `TS_AttackAtWill`: `Bubo`, `Amuleto de Nemea`...), buys and researches the mod's new things (`ESH_ResearchTraining` and `ES_Stronghold`: the Arena units `Hipatista`, `PINMORTAL`, `NVAEL`, `GTracio`, the leaders, `Generales`, `Banquete de Belenos`...), gives the Market a free income, picks the tactic of each civilization (`GetTacticScript`), and the Teuton tent / army-need timings. The game's AI sees a clone as its base (`"ai": true`), so these scripts name the game's classes and the engine translates them; the mod's new classes are named by the id the clone step gave them (`MHipatista` for Imperial Rome's `Hipatista`).

Done as `tools/lib/asvr-ai.js` does, with the rules of #15:

1. **The economy loops** `ES_Stronghold`, `ES_Village`: copies `ASV_ES_Stronghold` / `ASV_ES_Village` in `[EconomyScripts]` (patch of `AI.INI`), returned by a patch of `GetEconomyScript.vs` only for the eight civilizations (`Mod_TrueRace(set.GetCentralBuilding)`). They are **never started with `AIRun`**. The mod's `ES_Village` says `Settlement set, Obj This` in its first line and uses neither the second parameter nor that signature: the copy has the game's (`void, Settlement set`).
2. **The helpers** the loops start with `set.AIRun` (`ESH_ArenaUnits`, `ESH_BuildArmy`, `ESH_BuildGermanArmy`, `ESH_CombatMagic`, `ESH_Market`, `ESH_NeedTech`, `ESH_ResearchTraining`): copies `ASV_ESH_*`, declared in `AI.INI`, started by the copies of the loops (the build writes the names of the copies into each other, so `ASV_ES_Stronghold` runs `set.AIRun("ASV_ESH_NeedTech.vs")`). None of them calls `Sleep` (checked: they do their work and return, as the game's do), the game's own helpers are not patched, and a game AI never reaches them.
3. **The tactics**: `ASV_TS_GaulTactic2`, `TS_IberianTactic2`, `TS_GermanyTactic2`, `TS_EgyptTactic`, `TS_BritishTactic`, `TS_CarthageTactic2`, `TS_RRomeTactic`, `TS_MRomeTactic2` in `[TacticScripts]`, picked by a patch of `GetTacticScript.vs` for each civilization in the first 5 seconds (the mod's own value; HD's is 2), and `ASV_TS_AttackAtWill` (the tactics `AIRun` it, with its `Sleep`, as HD's own do).
4. **`SquadMonitor`** (the items): `ASV_SquadMonitor`, started by a patch of `Main.vs` for the AI players of the eight civilizations together with the game's other five monitors (`Mod_PlayerCiv(AIGetPlayer)`); it sleeps, and HD starts it the same way.
5. **What the engine calls by name** and returns a value: `CalcGAIKAPriority` (70 % instead of 100 %), `GetArmyNeed` (the timings), `TSH_ArenaRecruit`: the mod's body as a block inside the game's script that only runs for the eight civilizations (`Mod_PlayerCiv(idPlayer)`); a compilation error there stops that script for every AI.
6. **AI variables**: the mod adds one the game lacks (`AIV_MaxNSECUAZ`) and no copy reads it, so no key is added. **The mod's tuning of `AI.INI` is not ported** (26 values of keys the game has, *global*, below).
7. Not ported: `AIOSendSquad` (the engine calls it by name with no player), `GS_KillEnemies` and `GSH_SynchApproach` (log lines and one constant; the engine picks the strategy), the mod's `AI/DEFENSIVE/` profile (`Main`, `EvalRecruit`, `AI.INI`).

## Left out because it is global

What the mod changes that cannot be scoped to a clone (AGENTS.md, *World rules packs*): a rules pack (`asvrmod-vii-civs-rules`) can carry it later; it is not built in this task. Originals are the HD game's values; the mod's are what the original ships (its 1.40 values where the mod did not touch the key are not listed).

#### `DATA/CONST.INI`: 16 values

| Section | Key | Game (HD) | Mod |
|---|---|---|---|
| GamePlay | `EgoismSkillCost` | 1 | 0 |
| GamePlay | `RageCost` | 4 | 2 |
| GamePlay | `CripplingAttackCost` | 1 | 2 |
| GamePlay | `RegenerationCost` | 4 | 2 |
| GamePlay | `TriumphCost` | 3 | 0 |
| GamePlay | `LearningCost` | 1 | 0 |
| GamePlay | `DiseaseCost` | 3 | 4 |
| GamePlay | `ToughnessHealthIncrease` | 5 | 10 |
| GamePlay | `RegenerationHealth` | 40 | 50 |
| GamePlay | `DiseaseHealthDecrease` | 40 | 60 |
| GamePlay | `DiseaseMinHealthPercent` | 50 | 25 |
| GamePlay | `GhostMinHealthPercent` | 20 | 0 |
| GamePlay | `TTentInitialArmy` | 20 | 15 |
| GamePlay | `TTentCapturedArmy` | 3 | 5 |
| GamePlay | `TTentActiveArmy` | 12 | 10 |
| GamePlay | `TTentUnitSpawnRate` | 16000 | 20000 |

#### `DATA/AI/AI.INI`: 26 values

| Section | Key | Game (HD) | Mod |
|---|---|---|---|
| Vars.All | `AIV_MaxMilUnits` | -1 | 400 |
| Vars.All | `AIV_MilHeavyWant` | 10000 | 30000 |
| Vars.All | `AIV_Druids` | 10 | 20 |
| Vars.All | `AIV_Training` | 60 | 30 |
| Vars.All | `AIV_FeedWithWagons` | 0 | 1 |
| Vars.All | `AIV_UseRuins` | 0 | 1 |
| Vars.All | `AIV_TimeStrongholdDefences1` | 40 | 30 |
| Vars.All | `AIV_TimeStrongholdDefences2` | 60 | 40 |
| Vars.Easy | `AIV_Druids` | 0 | 20 |
| Vars.Easy | `AIV_MaxMilUnits` | 100 | 250 |
| Vars.Easy | `AIV_UseForts` | 0 | 1 |
| Vars.Easy | `AIV_MaxAttentionPoints` | 1 | 2 |
| Vars.Easy | `AIV_Tribute` | 0 | 1 |
| Vars.Easy | `AIV_MaxIMountaineers` | 0 | -1 |
| Vars.Normal | `AIV_Druids` | 10 | 30 |
| Vars.Normal | `AIV_DruidAttach` | 15 | 90 |
| Vars.Normal | `AIV_TradeGold` | 1 | 2 |
| Vars.Normal | `AIV_Training` | 60 | 20 |
| Vars.Normal | `AIV_Tribute` | 0 | 1 |
| Vars.Hard | `AIV_Druids` | 20 | 30 |
| Vars.Hard | `AIV_DruidAttach` | 25 | 90 |
| Vars.Hard | `AIV_TradeGold` | 2 | 3 |
| Vars.Hard | `AIV_TrainingRush` | 40 | 20 |
| Vars.Hard | `AIV_ArenaHire` | 40 | 45 |
| Vars.Hard | `AIV_ArenaRush` | 7 | 9 |
| Vars.Hard | `AIV_ArenaUpgradeHires` | -1 | 1 |

#### `DATA/UNIT_SPECIALS.INI`: keys of the game's own specials

| Special | Key | Game (HD) | Mod |
|---|---|---|---|
| Regeneration | `stamina_cost` | 4 | 1 |
| Rage | `stamina_cost` | 4 | 2 |
| Triumph | `stamina_cost` | 3 | 0 |
| Disease attack | `stamina_cost` | 3 | 4 |
| Sneak | `name` | Sneak | Revitalizar |
| Sneak | `stamina_cost` | 0 | 1 |
| Invisibility | `stamina_cost` | 2 | 1 |
| Learning | `stamina_cost` | 1 | 0 |
| Cripple | `stamina_cost` | 1 | 2 |

Not listed above and also global: the mod's `UNIT_SPECIALS.INI` changes the *text* of the Health, Sneak (it renames "Sneak" to "Revitalizar") and others; `SKILLS.INI`, `COUNTERUNITS.XML` and `ZBINS.XML` are not changed by the mod.

**Items.** 20 items of the game with other contents (`Spoils of War`, `Veteran Guild`, `Veteran Medal`, `Veteran Offence`, `Veteran Defence`, `Veteran Health`, `Noble Offence`, `Noble Defence`, `Bear teeth amulet`, `Belt of might`, `Rye spikes`, `Poison mushroom`, `Healing herbs`, `Snake skin`, `Belt of snakes`, `Eagle feather`, `King's belt`, `Golden Ankh`, `Fur gloves of health`, `Concentration stone`): 13 of them keep the id and become another item (`Eagle feather` is *Anillo de la vitalidad*, `Healing herbs` *Pocion curativa*...); `ITEMS.XML` goes from 42 game items to 162 and the mod **drops 21 of the game's** (`Gold`, `Finger of death`, `Gem of Wisdom`, `Bloodstone`, `Scroll of Death`, `God's Gift` is kept but edited, ...). `Gem of Power`, `Ring of Power`, `Horn of victory`, `Elephant Tusk`... stay in the game: a mod cannot remove them. The script of `God's Gift` (the mod adds a check of `RLider3`) and `ITEMSCRIPTS/` of the other game items are the game's.

**The game's neutral classes** (only what differs from HD, from `DATA/CLASSES`; the respawn items name the mod's items):

| Class | What the mod changes | Game | Mod |
|---|---|---|---|
| `baseruins` | `interface` | thumb,building,items | thumb,building,items,holder |
| `baseruins` | `minlevel` | 4 | 5 |
| `baseruins` | `levelperitem` | 4 | 5 |
| `basewell` | `respawn_time` | - | 500000 |
| `basewell` | `respawn_item` | - | Healing water |
| `bearunit` | `maxhealth` | 400 | 700 |
| `bearunit` | `damage` | 16 | 30 |
| `bearunit` | `armor_slash` | 2 | 4 |
| `bearunit` | `armor_pierce` | 2 | 4 |
| `bearunit` | `speed` | 50 | 60 |
| `boarunit` | `damage` | 16 | 20 |
| `boulder` | `respawn_item` | Snake skin | Anillo misterioso |
| `boulder` | `respawn_time` | 600000 | 500000 |
| `catapulttower` | `range` | 800 | 1000 |
| `catapulttower` | `sight` | 0 | 1000 |
| `chest` | `respawn_item` | - | Anillo misterioso |
| `chest` | `respawn_time` | - | 500000 |
| `deadtree` | `respawn_item` | Eagle feather | Rye spikes |
| `facepillar` | `respawn_item` | - | Anillo misterioso |
| `facepillar` | `respawn_time` | - | 500000 |
| `lionf` | `maxhealth` | 300 | 500 |
| `lionf` | `damage` | 16 | 50 |
| `lionfunit` | `maxhealth` | 300 | 500 |
| `lionfunit` | `damage` | 16 | 50 |
| `lionm` | `maxhealth` | 300 | 600 |
| `lionm` | `damage` | 16 | 60 |
| `lionmunit` | `maxhealth` | 300 | 600 |
| `lionmunit` | `damage` | 16 | 60 |
| `lionthrone` | `respawn_time` | - | 750000 |
| `lionthrone` | `respawn_item` | - | Hechizo misterioso |
| `obelisk1` | `respawn_time` | - | 1000000 |
| `obelisk1` | `respawn_item` | - | Hechizo misterioso |
| `obelisk2` | `respawn_time` | - | 1000000 |
| `obelisk2` | `respawn_item` | - | Hechizo misterioso |
| `ribcage` | `respawn_time` | - | 500000 |
| `ribcage` | `respawn_item` | - | Pocion misteriosa |
| `ruins1` | `itemtype` | - | Daga de la manticora |
| `sculltree` | `respawn_time` | - | 500000 |
| `sculltree` | `respawn_item` | - | Pocion misteriosa |
| `shipbattle` | `sight` | 700 | 850 |
| `shipbattle` | `damage` | 100 | 200 |
| `shipbattle` | `splash_radius` | - | 100 |
| `shipbattle` | `range` | 700 | 800 |
| `shipbattle` | `max_units_to_board` | 120 | 70 |
| `shipbattle` | `unit_specials` |  | Penetration, Freedom |
| `shipbattle` | `healthbar_type` | 0 | 1 |
| `shipbattle` | `maxstamina` | - | 100 |
| `shipbattle` | `damage_type` | pierce | siege |
| `ships` | `healthbar_type` | 0 | 1 |
| `stonehenge` | <method sig="abundancia" vs="data/subai/stonehenge_abundancia.vs"/> | - | added |
| `stonehenge` | <method sig="estertor" vs="data/subai/stonehenge_estertor.vs"/> | - | added |
| `stonehenge` | <method sig="locura" vs="data/subai/stonehenge_locura.vs"/> | - | added |
| `stonehenge` | <method sig="momia" vs="data/subai/stonehenge_momia.vs"/> | - | added |
| `stonehenge` | <method sig="oso" vs="data/subai/stonehenge_oso.vs"/> | - | added |
| `stonehenge` | <method sig="paz" vs="data/subai/stonehenge_paz.vs"/> | - | added |
| `stonehenge` | <method sig="suicidio" vs="data/subai/stonehenge_suicidio.vs"/> | - | added |
| `stonehenge` | <method sig="terremoto" vs="data/subai/stonehenge_terremoto.vs"/> | - | added |
| `stonehenge` | <method sig="tormenta" vs="data/subai/stonehenge_tormenta.vs"/> | - | added |
| `stonepile` | `respawn_item` | Poison Mushroom | Pocion misteriosa |
| `stonepile` | `respawn_time` | 300000 | 500000 |
| `tombstone` | `respawn_time` | 120000 | 500000 |
| `tombstone` | `respawn_item` | Healing water | Anillo misterioso |
| `treetrunk` | `respawn_item` | Healing herbs | Poison Mushroom |
| `treetrunk` | `respawn_time` | 120000 | 600000 |
| `ttent` | `settlement_food` | 2400 | 0 |
| `ttent` | `settlement_maxgold` | 0 | 100000000 |
| `wolfsummoned` | `stamina_dec_time` | 18000 | 5000 |
| `wolfsummoned` | `inventory_size` | - | 1 |
| `wolfsummoned` | <behavior script="data/subai/miedo.vs"/> | - | added |
| `wolfunit` | `maxhealth` | 240 | 150 |
| `wolfunit` | `damage` | 16 | 30 |
| `witch hut` | `respawn_time` | 300000 | 500000 |
| `witch hut` | `respawn_item` | Rye spikes | Pocion misteriosa |

**Scripts of the game edited at their own path, not scoped:** `ruin_behavior.vs` (`BaseRuins`: the ruins), the `BONUSSCRIPTS` (`001 Wealth`, `002 Riches`, `003 Hero`: the starting bonuses), `GAMESCRIPTS` (the game modes). The mod's `RANDOMMAP/PLACEOBJECTS.XML` changes the counts of the game's own objects (`ROutpost` `max 2 -> 1`, `Stonehenge1/2`, `Ruins1` min/max and a `RaceAlternative` of `Ruins2`, `Shrine`), `COASTAL.RM.XML` loses `no_ruins`, and `DATA/INTERFACE/` (the help and editor lists and the menu INIs but two), the loading, credits, help and options screens of `Currentlang/` (`CARGAR`, `CREDITS.TXT`, `HELP`, `OPTIONS`, `CONQUESTDEFAULT`: HD does not read them by those paths) and the other menu INIs of the rar do nothing or re-skin the game: left out. The main menu skin (two INIs, `UI/MENU`, the wall) is the exception, below.  The 26 walk sounds `SOUNDS/WALK/HORSE_ARMY_*` and the icons the mod redrew at the game's paths (`UI/ICONS`, `UI/CMDBAR`, `UI/INFOBAR`, `UI/HELP`: 22 files) replace the game's own: left out (`raw/asvrmod-vii-civs-left-out.txt` has the list).

**Not global but not ported either.** The three game modes the mod adds (`6 Destruccion`, `9 Portuacion`, `10 Rey de los bandidos`) and the two starting bonuses it adds (`004 Wealth`, `005 People`): the modes say "By El Jüsticiero Misteryoso, no plagiar", so they are another author's code that the Asvr permission does not cover; their numbers (`6`...`10`, `004`, `005`) are the ones the 4.2's modes and bonuses take, so the room could not tell them apart; and none belongs to a civilization. The build drops them.

## The main menu (the one exception to "patches only")

**Why it is an exception.** AGENTS.md: what is not a civilization's goes only as a patch that adds its own part, never as a whole file at the game's path. A menu skin cannot be a patch: it is the pictures of every menu screen and two whole layout files. The maintainer approved it explicitly for this mod, as **cosmetic**: it changes no rule, no unit and no text of the game; **only one menu skin shows at a time** (whichever mod loads first wins, the player orders the mods in the content manager); and it is the same trade the other menu skins make (Imperivm Legacy ships `MAINMENU.INI` whole; the 1.8 and the 4.2 patch the menu files and ship pictures at the game's paths). It replaces the first try (`patches/menuini/MAINMENU.INI`: a patch that scrolls the strip), which cannot coexist with a whole `MAINMENU.INI`.

`tools/lib/asvr-menu.js` writes it from the rar (deterministic; nothing under `originals/`; no ImageMagick: a node BMP writer). It is written at the end of step 6, after the steps that compare files with the game's, which would remove them. The build stops if a file is missing, an edit does not apply exactly once, a text table or another menu INI would ship, or `UI/MENU` is not 20 pictures.

| File | What it is |
|---|---|
| `DATA/INTERFACE/MENU/MAINMENU.INI` | the rar's, with **two edits for HD** (CRLF as the rar has it): `ButtonXStart = 790` and `ButtonYStart = 20` added in `[MainMenu Params]`, after `TmplIni=Menuini/template.ini` (the green buttons go to the right of the window); `[TipsBackFrame]` `RectWH` `140, 260, 450, 248` -> `25, 25, 450, 248` (the tips panel inside the 1024x768 window) |
| `DATA/INTERFACE/MENU/MENUBACK.INI` | the rar's, with one edit: `[MenuBack]` `RectWH` `0, 0, 1920, 1080` -> `0, 0, %Larghezza%, %Altezza%` (the size of the screen, whatever it is) |
| `UI/MENU/*.BMP` (20) | the rar's, byte for byte: the green buttons and frames (they show on every menu screen) |
| `CURRENTLANG/titulo.bmp`, `CREDITS.bmp`, `TIPS.XML` | byte for byte (`MENUBACK.INI` reads `titulo.bmp` and `CREDITS.bmp`; HD reads `currentlang/tips.xml`) |
| `CURRENTLANG/MENUBACKGROUND.bmp` (1920x1080) | the mod's `titulo.bmp` (the stone wall) with the first 1024x768 frame of `GENERALS.bmp` pasted at (448, 156), so the window is not green behind the screens that read `MenuBackground.bmp`; 24-bit |
| `CURRENTLANG/GENERALS.bmp` (8192x768), `titulo3.bmp` (1024x768, pure green 0,255,0 = transparent) | byte for byte: the strip of generals that scrolls, and the title *AsvrMod VII: Ancient Generals* |

The two INIs were checked byte for byte against the files the maintainer tried (they were made from the converted package; these are generated from the rar with the three edits above, and are identical, CRLF included).

**Not shipped, on purpose**: `GAME.LOC.XML` and `TRANSLATION.LOC.XML` (the Spanish text table of the whole game, 755 KB each: it would translate the game for everybody), the other nine menu INIs of the rar, `MENUBACKGROUNDIMPERIVM.bmp`, `CARGAR`, `HELP`, `OPTIONS`, `CONQUESTDEFAULT`, `CREDITS.TXT`, `HELP.XML`, and anything else of `UI/`.

**Tried in game on 2026-10-31 (the maintainer, a prototype with these files installed in `asvrmod-vii-civs`)**: the main menu looks like the original GameBanana one (green buttons at the right of the window, tips panel, `1.40`, the wall, the scrolling generals, the title) and `imperivm-mod.log` has no errors and no compilation errors. **Not looked at**: the other screens that use the green buttons and frames (conquest, options, multiplayer, lobby, load game).

**What differs from the original menu**:
- The labels are the game's language: the original showed Spanish ones because of the text tables, which are not shipped.
- The tip text is Spanish (`TIPS.XML` is the original's).
- The line at the bottom reads *Haemimont Games, FX Interactive, ImperivmWorld (2021)* (HD's `data/copyrights.txt`) instead of the original's *AsvrMod VII (2014-2017)*: not fixed. `1.40` shows, as in the original.
- Resurrected's heart and Discord icons are bottom-left.
- The wall has the first general baked in (the pasted frame), and the strip scrolls over it.

**Overlap (`node tools/shared-paths.js asvrmod-vii-civs`)**: one skin shows at a time, and the winner of each file is chosen by the load order of the mods or by the player in the content manager ("Use the files of ...", per pair of mods and per file); no `incompatibleWith`. The patches of another skin's INI stack on top of whichever file wins: not tried.
- `DATA/INTERFACE/MENU/MAINMENU.INI`: shipped whole by **Imperivm Legacy** (other bytes). The Greek Mod 1.8 and the 4.2 do not ship it whole in this repository: they patch it (`patches/DATA/INTERFACE/MENU/MAINMENU.INI`, `TEMPLATE.INI`; the 4.2 also `MENUBACK.INI`), so their patches would apply on top of whichever file wins. That combination has not been tried.
- `DATA/INTERFACE/MENU/MENUBACK.INI`: shipped whole by no other port; patched by the 4.2.
- `UI/MENU/*`: **the 1.8** has 16 of the same names with other bytes (`BIGGOLD`, `BUTTON`, `BUTTON60`, `CHECKBUTTON`, `DOWNARROW`, `FRAME`, `HERO`, `MMENBUT`, `SCROLLBACK`, `SMALLGOLD`, `TAPAL`, `TAPAR`, `TEAMS`, `UPARROW`, `BONUSES`, `VOLUME_CONTROL`); `BONUSES.BMP` is also shipped by Imperivm Legacy and the MCI, `FOOD.BMP` and `PEOPLE.BMP` by the MCI. The 4.2's pictures have other names.
- `CURRENTLANG/titulo.bmp`, `CREDITS.bmp`, `TIPS.XML`, `GENERALS.bmp`, `titulo3.bmp`: no other port.
- `CURRENTLANG/MENUBACKGROUND.bmp`: CGWAR, the 4.2, the 1.8, Imperivm Legacy, the MCI and Mediterranevm (other bytes).

## Not ported, and why

- **The music.** The mod removed its own new music ("la nueva musica, sospechosa de generar crasheos, eliminada") and ships none.
- **The mod's `.exe`s**: see above.
- **The old engine's tricks**: no `rand(776+player)` sentinel, launcher or town hall choice in this mod; no branch to choose (nothing of `Choose*`).
- **`Punto`**, the feedback object of the rally point: it names an entity (`Visuals/Punto/Punto.ent.xml`) that nobody has (the mod does not ship it either; validate-mod.js said so); the class is dropped. The rally-point *commands* (`PUNTO`, `ANULAR_PUNTO`) stay and `Place("Pt3_asv")` places the mod's own marker.
- **The IronMine entity** has 10 `<state>` and the engine allows 8 (validator): the last two (copies of the others, every row 0) are cut.
- **`outpost_idle`'s `gold_sales`**: the mod's declaration dropped it and the script still reads it: 1.40 let it pass, HD's compiler does not. The declaration is put back in the three copies.
- **Unit art with frames the rows do not have** (`NSECUAZ`, `NVAEL`, `HIPATISTA`, `CMERCENARIO`, `EHOPLITA`, the `*Sentry2` entities): the validator warns (19 warnings, all of the mod's art: rows, frames, empty `.pass`). The game does not stop; a unit can look wrong.
- **The Italian translation** (`ported/asvrmod-vii-traduzione-italiana`, a `loc/` file made on a0.7) and the **three maps that `require` the mod**: #8, see below.

## Maps and the translation that need this mod (not done here: #8, last)

The three maps `require` `gamebanana-729311`, which is the old `originals/mods` class copy and not a mod for Resurrected. They must be pointed at this port and the classes below rewritten to the clones' (and need the set of civilizations of the mod). The classes each places, from the `.bfhp` (`node tools/hpfs.js`):

| Map | Classes of the mod it places | They become |
|---|---|---|
| `arena-asurmod` (row 283) | `CMERCENARIO`, `EHOPLITA`, `Hipatista`, `NSECUAZ`, `NVAEL`, `PINMORTAL` | `AcaMERCENARIO`, `AroEHOPLITA`, `AimHipatista`, `AcaNSECUAZ`, `AgeNVAEL`, `AegPINMORTAL` (a map that places them for another player needs the civilization that trains them) |
| | `Bubo`, `Fenrir`, `GreatTavern`, `LionNemea`, `Momia`, `Perro`, `IronMine` | the same (neutral; `IronMine` is `IronMine_asv`) |
| `cesare-e-le-7-mogli-asurmod` (289) | `CMERCENARIO`, `GTracio`, `NSECUAZ`, `NVAEL`, `PINMORTAL`, `TLider` | `AcaMERCENARIO`, `AibGTracio`, `AcaNSECUAZ`, `AgeNVAEL`, `AegPINMORTAL`, `AgeLider` |
| | `LionNemea`, `IronMine` | neutral |
| `cneo-poza` (188) | `Anibal`, `BHorseman`, `CHero4a`, `EHOPLITA`, `GAncientDruid`, `GLider1`, `GLider3`, `GTracio`, `Hipatista`, `NVAEL`, `PINMORTAL`, `THero1e` | `AcaAnibal`, `AbrHorseman`, `AcaHero4a`, `AroEHOPLITA`, `AgaAncientDruid`, `AgaLider1`, `AgaLider3`, `AibGTracio`, `AimHipatista`, `AgeNVAEL`, `AegPINMORTAL`, `AgeHero1e` |
| | `Lider` | neutral |

(The two `ported/*-asurmod` folders also ship `data/classes/` guards of their own (`BGuardia`...); they are the maps' own and are not touched.)

The mod's version of the class ids is in `ported/asvrmod-vii-civs/civs/*.json` (`alias.classes`: the id the clone step started from, so `MHipatista`, `REHOPLITA`, `GTracio`... are the keys for the renamed ones). `ported/asvrmod-vii-traduzione-italiana` translates by text (its `loc/` keys are the Spanish strings, not class ids), so it should still match the commands and items; the 15 orders renamed with `(asv)` and the 3,887 vs 3,474 texts of a0.7/a0.8.1 are to check then.

## imperivm-resurrected #37 and #38

- **#37**: prefixes derived from the ids by the SDK (first three characters: `Aga`, `Aro`, `Aim`, `Aca`, `Abr`, `Aib`, `Aeg`, `Age`), no `index`. They are not in the table of `docs/CIVILIZATIONS.md` or in `sdk/prefixes.md` of the SDK (rows for the maintainer are in `PR-NOTES.md`). They need a DLL of `dev-villoh`.
- **#38**: the set is `AsvrMod VII a0.8.1`; every civilization has `ai: true`.
- **#45** (a conquest with a mod civilization): the mod ships no conquest.
- Prefix clash: none of the eight prefixes is another port's (checked against `docs/CIVILIZATIONS.md` and the ports in `ported/`).

## Independence check

`node tools/shared-paths.js asvrmod-vii-civs` (with every other port in `ported/` linked: CGWAR, the 1.8, the 4.2, Mediterranevm, MCI, Imperivm Legacy, Secuter Fun, Community Mod, Caesar Mod...):

```text
no collisions
```

0 class ids in common with the game and with every port; the paths shared are the menu skin's (cosmetic, one skin shows at a time: *The main menu*). Not run: two civilization mods active together in game.

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`): **2060 files checked, 0 errors, 19 warnings** (the unit art: 5 empty footprints, frame and row counts that do not match, in the mod's own units). The validator ignores what the patches do (engine #6) and does not read the code of script patches, so the build checks every script it writes (`tools/lib/script-checks.js`, step 8 of `tools/asvrmod-vii.js`; **the build stops** on any failure):

- **(a) every shipped script, absolute** (333 copies and rewrites, and the mod's own): in the text without comments and strings, no `)`, `}` or `]` ever closes nothing, every `(`, `{` and `[` is closed at the end, and no `return` is followed by another statement of the same block (the engine's *"Code after return operator - skipped"* is a compilation error). It does not compare with the mod's script: the mod's own scripts are sometimes broken. A second check compares the balance with the source's (after the repair below) to catch what a rewrite adds, and rejects `Mod_TrueRace` without an object.
- **(b) patches**: each of the 9 patches of the game's scripts is applied to the HD script with the engine's algorithm (`PatchScriptText`, `src/mods/patchxml.cpp`): every anchor is found, every block is balanced, the result has the game's balance, and the result has no problem of (a) that the game's own script does not have.
- **(c) classes written as text**: every class named in `Place`, `GetRandomHeroClass`, `IsHeirOf`, `Count`, `Mutate`... (2,589 literals) is a class of the game or of this port, and every `GetRandomHeroClass` base (`AgaLider`...`AgeLider`) has a descendant with an entity (`PickRandomHeroClass`, `00531060.c`, draws until a candidate has one). Two literals are allowed by name in the tool: `IsHeirOf("RArcher2")` in `RCHARIOT2_MUTATE_GV.VS` (the mod's; no class has that id and nothing names the script) and `Count(..., "TTeutonRiders")` in the Germany tactic (HD's own script has the same typo).

**These are not a compiler.** They reproduce the errors that the game's compiler has reported so far (a `}` that closes nothing, code after a `return`) and the shapes that broke earlier builds, nothing more: an undeclared variable, a wrong type, a function that does not exist or a wrong number of arguments pass them. The test is the game's log (`compilation error`).

What went wrong, and is fixed:

1. First build: the `.race == X` rewrite wrote `Mod_TrueRace(() == Acarthage)` 332 times in 34 files; the arena patch hired `GetRandomHeroClass("CLider")`, `"BLider"`... (the mod's ids, which do not exist here). Now only the comparison is matched and the object is the script's own, and each civilization's block hires its own `AcaLider`... The `Place("CSentry2")` of the outposts and the `Count("MHipatista")` of the AI are the clone's classes too (3 scripts).
2. First game test (`imperivm-mod.log`, 18:53): `unit_on_kill_asv*.vs (56, 3) Closing } without correspond opening`. **The mod's `UNIT_ON_KILL.VS` has two `}` that close nothing** (lines 56 and 71; 46 `{` against 48 `}`; HD's script, 20/20): the mod removed the `if (!Victim.IsSentry) {` of the Egyptian *Path of the dead* block and of the *Spoils of war* block (its sentries now get those too) and left their closing braces. 1.40's compiler tolerated it, this one does not. The build removes a `}` that closes nothing from every script of the mod before any copy is made (`removeStrayBraces`): the two in `UNIT_ON_KILL.VS` (3 copies shipped), and one in `TTENT_BEHAVIOR.VS` (line 550; the tent's script is left out as global, so nothing shipped has it). No other script of the port had the defect. I had called the first finding a false alarm because it equalled the original's balance: wrong, the original was broken.
3. First game test: `data/ai/CalcGAIKAPriority.vs(55, 3)` and `GetArmyNeed.vs(151, 3)` *Code after return operator*: the block of a patch always ended with `return;`, after the mod's own `return nPriority;` / `return nEval;`. The block gets a `return;` only when its body does not end in a return of its own (`tools/lib/asvr-inline.js`). The other seven patches end in `return;` after a loop or an `if`, not after a return.
4. Found in game by the maintainer (Imperial Rome (Asvr), *Gladiator shows*: a solid blue square instead of the icon; the tooltip was fine). `AIMPERIAL.XML` and `AROME.XML` said `Upgrades/Gladiator show_asv.bmp`, a file that exists nowhere: the rar's own command says `Gladiator show.bmp` and the picture is HD's. **The suffix was ours.** `tagCollisions` (`tools/lib/ported-patch.js`, step 6) renames a file that collides with another port's and then rewrites **every text that names it by file name alone**; the rar's `UI/CMDBAR/ACTIONS/show.bmp` collides, so `Gladiator show.bmp` (a name that only ends in `show.bmp`) became `Gladiator show_asv.bmp`. The same shape renamed 16 references to pictures that were never renamed: a name that only ends the same way (`Wall of SHIELDS`, `train BSHIELDBEARER`, `hire CWARELEPHANT`, from `SHIELDS.BMP`, `BSHIELDBEARER.BMP`, `CWARELEPHANT.BMP`) and a file of the same name in another folder (the mod's `UI/ICONS/ITEMS/SPOILS OF WAR.BMP`, `CHARM OF ISIS.bmp`, `VETERAN OFFENCE.BMP` against HD's `UI/CMDBAR/...` pictures that the commands mean; `actions/HEAVY HORSESHOES.BMP`, which was not renamed, against `UI/ICONS/UPGRADES/HEAVY HORSESHOES.BMP`, which was). The shared library does not know where the engine looks for a picture, so `tools/lib/asvr-refs.js` does, right after it: a picture reference that does not resolve and ends in `_asv` goes back to the mod's own name (the engine's rule: `gameres/cmdbar|icons|infobar/X` is `UI/CMDBAR|ICONS|INFOBAR/X`, a plain `button=` is `UI/CMDBAR/X`). 17 references were put back (the build log lists them): `train BSHIELDBEARER`, `HEAVY HORSESHOES` (Britain); `hire CWARELEPHANT`, `SPOILS OF WAR` x2 (Carthage); `CHARM OF ISIS` x2 (Egypt); `Gladiator show` x2 (Imperial Rome) and x2 (Rome); `VETERAN OFFENCE` x2, `Wall of SHIELDS` x2 (Rome); and the two gate queue icons (below). The library is not changed: other ports rely on it.
   A **check that stops the build** (same file) reads every picture named by a command, a class or an item (`button`, `queueicon`, `icon`, `transpicon`, `image`: 2,182 references) and requires it in the port or in HD's packs, and requires every text that names an `_asv` file, folder or class to find it. Four references are allowed by name, because **the mod's own package already lacks them** (checked in the rar and in HD; nothing was invented): `gameres/icons/upgrades/WBreast.bmp` (HD's own `BLACKSMITH.XML` names it too, HD has the picture only under `UI/HELP/UPGRADES`); the queue icons `gameres/icons/upgrades/OPEN GATE PER.BMP` and `CLOSE GATE PER.BMP` (the rar ships them only as `UI/CMDBAR/ACTIONS/`, the button); and the item image `gameres/icons/items/CHARM OF OSIRIS.bmp` (the rar's file is `CHARM OF OSIRIS .BMP`, with a space before the dot). Each shows in game as the same blue square the original would. Sounds, entity folders (`UNITS/<name>_asv`), class ids and item scripts were scanned the same way: every `_asv` name they carry resolves (the folder renames follow a different, path-aware rule in `tagCollisions`). The names of the random-map templates are inconsistent: four are `AFRICA.RM_asv.XML`, `ALEATORIO`, `BRITANIA` and `ITALIA` (the MCI and Secuter ship the same paths) and the other eight are plain; they work (below). What happens with the MCI or Secuter active together was not tried. The rar's `RANDOMMAP/ALEATORIO` has 51 files and the port 50: the missing one is `Thumbs.db`, dropped on purpose.

## In game

**Tried in game**: 2026-10-31, Linux/Wine, `dev-villoh` DLL, a profile with only this mod.

- (a) First build: the game's compiler reported 3 errors (`unit_on_kill_asv*.vs`: stray braces; `CalcGAIKAPriority` and `GetArmyNeed`: *code after return*). Fixed in the tool (*What went wrong*, above). The build after the fix loaded with 0 errors and 0 compilation errors in `imperivm-mod.log` (session 20:51). The patches that touch every player (`ARENA_BEHAVIOR`, `OUTPOST_BEHAVIOR`, `VILLAGE_BEHAVIOR_GIVEFOOD`) compiled without error in that session, but their behavior was not played.
- (b) The main menu looks like the original GameBanana one (green buttons, tips panel, `1.40`, scrolling generals, title); the maintainer compared screenshots.
- (c) Random maps, 2026-10-31 (the maintainer): a skirmish with each of Africa, Aleatorio, Britania and Italia (the four renamed `.RM_asv.XML`, pictures `NNN_asv.BMP`) and Hispania (control, plain names). All five generated a real map with the right shape (Africa, a large landmass with a gulf; the British Isles; Italy; Iberia), and the game lists them in *Map type* (22 entries in `imperivm-mod.log`). The two kinds of names work. Not tried: the MCI or Secuter active together with this mod (they ship the same template paths).

**Not tried**: the eight `(Asvr)` civilizations in the lobby, a room with only this set, a skirmish (barracks, hero hire, the arena's `*Lider`, items, the iron mine), the AI `(Asvr)` playing, the other screens with the green buttons (conquest, options, multiplayer, lobby), two civilization mods together, save and load, the three maps that require the mod and the Italian translation.

**To try, in this order** (copy `ported/asvrmod-vii-civs` to `$G/mods`; a room with only this set):

1. The main menu (looks right, tried) and **the other screens with the green buttons** (conquest, options, multiplayer, lobby, load game: not looked at). The lobby: the eight `(Asvr)` civilizations show, with their names, and the game's eight are as they were. The dropdowns list only the eight, Random draws one of them.
2. `Logs\imperivm\imperivm-mod.log`: `compilation error` (the three inherited-behavior patches, `GetEconomyScript`, `GetTacticScript`, `Main.vs`, `CalcGAIKAPriority`, `GetArmyNeed`, `TSH_ArenaRecruit`) and `Logs\comp_out.txt` / `vxlog.log` for the scripts of the mod.
3. A skirmish with an `(Asvr)` civilization on a random map: a barracks trains, a hero is hired, **a Lider is hired at the arena** (the `?Lider` classes with the nominated-leader sound and its items), the mod's new units are trained, the iron mine shows on the map, a captured outpost fills with its villagers (the inherited `outpost_behavior`).
4. The AI: an `(Asvr)` AI player plays for several minutes (economy loop, tactic, army). If it hangs or stops buying, `imperivm-mod.log` and `Logs\\vxlog.log` say which `ASV_*` script.
5. The same skirmish with the game's civilizations too, and with another civilization mod active (the 1.8, GBR Tactics, Mediterranevm); a second player in a filtered room; saving and loading.
6. Items: use an item of the mod (`Fauces pavorosas` summons `Momia`, `Convocar espiritus` `AnubisGhost`) as an `(Asvr)` hero and as a hero of the game.

## Pending

- **The id (done).** The port is `asvrmod-vii-civs`: `asvrmod-vii` is the id the game's GameBanana downloader gives the original 7a 0.8 package (it overwrote the first build of this port on 2026-10-31). Profiles that listed `asvrmod-vii` for this port must now list `asvrmod-vii-civs`. The three maps and the Italian translation still `require` `gamebanana-729311` (the original), see #8.
- **Permission** is "via Shaul R.", not confirmed directly with Asvr.

- *Pending: independence*: none known; the sprites are standalone `.rle` (no `rle.mmp.tail`), so there is no graphics-tail conflict with the 4.2 or Imperivm Legacy.
- The tuning of `AI.INI`, the game's items it edited, the neutral classes and the other global changes wait for a rules pack.
- The three maps and the Italian translation (#8).
- The game modes and bonuses it adds are another author's and collide by number (above): to decide with the maintainer.
- Nothing to credit under *Licenses*: no third-party file other than the mod's own.
