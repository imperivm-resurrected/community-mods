# Greek Mod 2.3 (MediterranevmTeam, Rattlesmake's Greek Mod continued)

Row 385. `Greek23.zip` (845 MB, ModDB, 2024-04-14, MD5 `e25ffddcab10f002a413441bccc1884d`, `originals/moddb/greek-mod-2-3/files/`): a full copy of the game (1.40 base, `Packs\\*.pak` with `zGreek.pak` over `data.pak`, `Local\\{czech,english,italian,spanish}.pak`, its own 457 MB `rle.mmp`, `Conquests`, `ConquestMaps`, `Music`) plus `gbr.exe`, `Launcher.exe` and the dxwrapper DLLs. Same structure as the 1.8 (Greece in Imperial Rome's slot with the letter H, the Roman branches chosen at the town hall), so it is ported with the 1.8's steps and the 4.2's scripts, AI and conquests.

**This port is the mod as ten civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*). The set is named `Greek Mod 2.3` (`mod.json`), every civilization is `ai: true`, the lobby names end with `(Greek 2.3)`.

| `id` | Prefix (derived) | Base | Lobby name |
|---|---|---|---|
| `wgreece` | `Wgr` | Imperial Rome (own race) | Greece (Greek 2.3) |
| `wrome` | `Wro` | Republican Rome | Rep. Rome (Greek 2.3) |
| `wimperial` | `Wim` | Republican Rome | Imp. Rome (Greek 2.3) |
| `wpunic` | `Wpu` | Republican Rome | Pun. Rome (Greek 2.3) |
| `wgaul` | `Wga` | Gaul | Gaul (Greek 2.3) |
| `wcarthage` | `Wca` | Carthage | Carthage (Greek 2.3) |
| `wbritain` | `Wbr` | Britain | Britain (Greek 2.3) |
| `wiberia` | `Wib` | Iberia | Iberia (Greek 2.3) |
| `wegypt` | `Weg` | Egypt | Egypt (Greek 2.3) |
| `wgermany` | `Wge` | Germany | Germany (Greek 2.3) |

No `index`, no `letter` (derived by the engine, imperivm-resurrected#37). Token `w` is reserved for this line (issue #14). Needs the DLL of `dev-villoh`.

## Rebuild

\`\`\`bash
node tools/greek-2x-source.js 2.3    # unpacks the zip into work/, flatten-paks.js, port-140.js (HD + the mod) into ported/greek-mod-2-3
node tools/greek-2x.js 2.3           # the civilizations (stages in the header of the tool)
\`\`\`

`work/` is git-ignored (nothing is written under `originals/`). The same result twice (checked: the hash of every file of `ported/greek-mod-2-3` is equal). `raw/greek-mod-2-3-{left-out,own-scripts,global}.txt|md` and `raw/port-140/greek-mod-2-3.md` are the build's reports.

## What the mod changed (against the 1.8, the previous version of the line already ported)

Measured on the flattened folders (`work/greek-2-3-flat` against `originals/greek-mod-1.8-flat`): the 2.3 has no maps, adventures or videos (the 1.8 had 124 `.bfhp`); it has 2 conquests. New: the Numidian tent and what it hires (`CTent`, `CHorseman`, `CCamelRider`), the Greek garrison `HOutpost`, the fisherman, the Roman units `RAstatus`, `RTriarius`, `RHorseman`, `RExtrordina`, the Peltast and the Cataphract of Greece, 40 new command-bar pictures, 45 icons, 53 voices of Greece, 35 classes and 23 scripts; changed: 117 files of the Greek walls, 70 classes, 44 scripts, 19 command files, the interface bars.

## What was ported

- **Greece** (`wgreece`): its classes, commands (`DATA/COMMANDS/WGREECE.XML`, with the sources the mod added to the game's commands as patches), art, voices (`CurrentLang/Voices/WGR*`), items and formations (patches), the hero names (`WgrName00x` in a `CONST.INI` patch), the city and villages of the random map (`Greek Wgr Town N`, a patch of `randommapsettlements`), its interface (`INFOBAR_WGREECE.INI`, `CMDBARWGREECE.INI`, the frame in a `FRAMES.INI` patch), its AI (`GRW23_ES_Stronghold` and the helpers, started only for Greek settlements; the tactic `TS_HGreeceTactic` as `GRW23_TS_HGreeceTactic`, `extras/greek-mod-2-3/tactics.json`). The H of its 135 names became the prefix (`HHoplite` -> `WgrHoplite`, `trainpeasanth` -> `trainpeasantwgr`, art folders `WGRHOPLITE`).
- **The game's civilizations as the mod has them**, cloned from HD with the mod's stats, costs, commands and specials (`tools/lib/clone-civs.js`, `--all-orders`), and what the mod changed in the base classes (`Unit`, `Melee`, `Hero`, `Horse`, `Ranged`, `Sentry`, `BaseVillage`...) written inside each clone: 73 / 74 / 85 / 75 / 63 / 59 / 64 / 57 / 60 classes (Republican, Imperial and Punic Rome, Gaul, Carthage, Britain, Iberia, Egypt, Germany). **Rome is three civilizations** (`ChooseRepublicanRome`, `ChooseImperialRome`, `ChoosePunicRome`, the `R*_Enable_Or_Disable_Cmd.vs` scripts and `RHT_SCELTA_ROMA` are not ported: AGENTS.md); each has the commands its branch left visible (`tools/lib/branch.js`). The Imperial and Punic Velit and Praetorian are copies with the branch's race (`asBase`).
- **The mod's behavior scripts** (`unit_attack`, `unit_on_kill`, `barrack_train`, `onfinish_research`, `druid_*`, `shaman_*`...): copies of their own, `NAME_w23.vs`, that the clones' classes point to (68 copied, `raw/greek-mod-2-3-own-scripts.txt`; the ones that read the branch flags are written with the flags as true or false for each civilization, the class ids a script writes as text are each clone's own: `tools/lib/own-scripts.js`). Each is HD's script plus the mod's edits (port-140.js merges HD, 1.40 and the mod); the conflicts it settled with the mod's side are in `raw/port-140/greek-mod-2-3.md` (54 items). The ones that cannot stay so are decided in `tools/lib/greek-2x-versions.js` (`RESOLVE_23`): `unit_on_kill` (the mod's side left an unbalanced brace: it would not compile), `onfinish_research`, `military_ondie`, `unit_attach_verify`, `unit_capture`, `RCatapult`. Checked: no script of the port has unbalanced braces or parentheses. The Gaul guard post's Greek test (`pRace == ImperialRome -> "H"`) is out of its copy.
- **The mod's AI** (`tools/lib/own-ai.js`): `TSH_RecruitArmy`, `TSH_HeroRecruit` and `TSH_ArenaRecruit` as blocks inside the game's scripts that only run for the mod's civilizations other than Rome's three (they read the old branch flags: Rome keeps the game's AI). The mod's `GS_Capture` is not ported (the engine picks the group strategy by name).
- **Conquests**: `ConquestRemake` and `mediterranean`, renamed by `tools/lib/conquests.js` before `tagCollisions` (`ConquestRemake (w23).bfhp`, `mediterranean (w23).BFHP`, folders `ConquestRemake (w23)`... the Mediterranean's own folder is the game's `1 - GBR Europe` copied under its new name, as in the 4.2; `(Greek 2.3)` in the menu). Their Greek classes are renamed inside the `.bfhp`. **The Greece territory plays as `wgreece`: `interface` = 15**, which is the index the engine gives it with this set alone in the profile (lowest free number from 10, ids in order: `wbritain` 10 ... `wgreece` 15 ... `wrome` 19). With another civilization mod active the number changes and the territory would play another civilization: read the `imperivm-mod.log` line `starting city of player 1 (civilization N ...)` and tell me. Needs a DLL with imperivm-resurrected#45; with the 1.0 release the value is ignored. Not tried.
- **Neutral content** (nobody's, shipped as is, renamed `_w23` because the alpha, the 4.2 and Imperivm Legacy have the same ids): the Numidian tent and its horsemen (`CTent`, `CHorseman`, `CCamelRider`), the Greek garrison post `HOutpost`, the fisherman, `Crixus`, `Gannicus`, `GOathsworn`... their voices (`Voices/CHORSEMAN_w23`, `FISHERMAN_w23`) 14 classes, 14 art folders and 170 other files in all (`tagCollisions`, tag `w23`; list in the log of the build).
- **Voices per language**: the mod's 11 voice folders (Greece's units, the fisherman and the Numidian horseman) come from each language pack of the download: `currentlang/voices` (every language) has the English pack's takes (44.1 kHz 16 bit; the Spanish pack's are 22 kHz 8 bit, other takes), `local/spanish/voices` and `local/italian/voices` their own pack's. The English pack has no recording of the Greek villagers: `currentlang/voices/WGRVILLAGER` keeps the Spanish pack's for everybody. Until 2026-10-30 the port had only the Spanish pack's, for every language (`tools/flatten-paks.js` reads `spanish.pak` only); not heard in game, only compared as files. `czech.pak` is not a language of the game and is left out.
- **Italian and Spanish texts**: `loc/italian.loc.xml` (314 entries) and `loc/spanish.loc.xml` (339), without what changes the game's own texts for everybody (7 Spanish and 25 Italian entries, 13 kept for the clones' commands).
- **Menu skin** (`CURRENTLANG/*`, `DATA/INTERFACE/MENU` as patches of the keys it changed): kept, cosmetic.
- **Music**: the tracks of the mod that are not the game's.

## What the original did through its `.exe` and DLLs (not shipped: a mod carries data only)

- `gbr.exe` (149 bytes different from HD's, read by comparing both): the race names of slot 4 (`Imperial Rome` -> `Greece`, `Imperial Roman` -> `Greek`, `Imperial Roman Town` -> `Greek Town`, `Imperial Roman Village` -> `Greek Village`), its letter (`M`/`m` -> `H`/`h` at `0x3c8ea0`) and 4 bytes of the PE header. It is the old engine trick (Greece = Imperial Rome); here Greece is a race of its own.
- `Launcher.exe` (66 MB, a Godot program), `config.ini`, `Settings.ini`: the mod's launcher and its settings (resolution, language, window). Nothing of the game's data.
- `d3d8.dll`, `dinput8.dll`, `dsound.dll`, `dxwrapper.dll` + `dxwrapper.ini`: the dxwrapper compatibility layer for the 2003 engine on modern Windows (DirectX 8 to 9, input, sound). Resurrected's DLL does that.

## License and permission

The download has **no license and no readme**; `CURRENTLANG/CREDITS.TXT` (shipped, `local/`) lists the team: original ideators Axaros, Consul123, Nicoghiro31, Taiga; programming Axaros, Camarada, Taiga, IL_PRINS, Nicoghiro31, Consul123, Vjenko; asset creation, modelling and animation Nicoghiro31; graphic design IL_PRINS, Nicoghiro31, Vjenko, CellTV; voice dubbing Coom Slayer, Manuel Esposito; translations Coom Slayer, Axaros; maps Il Mietitore. Nicoghiro31 is the author of Imperivm Legacy. Measured against `ported/imperivm-legacy` (Legacy 2.4.1): 603 files of the 2.3 are byte-identical to Legacy's (sounds 106, minimap 58, UI 73, terrain 19, `local/spanish` 248, map objects 22, buildings 13, units 33...: loose files only; the sprites of both live in `rle.mmp` / `rle.mmp.tail` and were not compared). The maintainer's instruction: the 2.3 has no flagged assets (the diagram of the line marks the Legacy assets without permission from 2.5), so it is ported in full. Permission: not asked yet (column *Permission* of row 385: `?`). `mod.json` credits MediterranevmTeam and Rattlesmake, with "Villoh (port)".

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`): **2479 files checked, 0 errors, 68 warnings** (animations whose `frames` do not match their rows, in the mod's own sprites).

`node tools/shared-paths.js greek-mod-2-3`: **0 class ids in common** with the game and with the CGWAR, the 4.2, the 1.8 and Mediterranevm alpha. The files at the same path with other bytes:

\`\`\`text
cgwar: 1 files in the same path with other bytes, 1 identical, 0 class ids in common
  currentlang/menubackground.bmp

greek-civilization-mod: 3 files in the same path with other bytes, 576 identical, 0 class ids in common
  currentlang/logo.bmp
  currentlang/menubackground.bmp
  currentlang/menu_16_9.bmp

greek-mod-1-8: 1 files in the same path with other bytes, 516 identical, 0 class ids in common
  currentlang/menubackground.bmp

mediterranevm-alpha: 1 files in the same path with other bytes, 10 identical, 0 class ids in common
  currentlang/menubackground.bmp

6 collisions
\`\`\`

Only the menu skin (`currentlang/menubackground.bmp`, `logo.bmp`, `menu_16_9.bmp`): cosmetic, the content manager lets the player choose (as already among the Greek mods). Not checked against Imperivm Legacy (it is not in this worktree's `ported/`): the names that collide with it were renamed (`tagCollisions` also compares with the main checkout's `ported/imperivm-legacy`).

## Pictures, sounds and references (checked offline)

`tools/lib/greek-2x-refs.js`, run by `tools/greek-2x.js` after `tagCollisions`, **stops the build** when a picture (`button`, `queueicon`, `icon`, `transpicon`, `image` of the commands, classes and `patches/DATA/ITEMS.XML`), a sound file of a sound entity, a class's sound entity or sound, or an `entity=` does not resolve in the port or in HD's packs (`gameres/cmdbar|icons|infobar/X` -> `UI/CMDBAR|ICONS|INFOBAR/X`; a plain `button=` -> `UI/CMDBAR/X`), or when a text names a `_w23` file, folder or class that does not exist. Result of the last build: **3329 references checked, 0 that do not resolve**, 16 allowed (below).

**What went wrong and is fixed.** `tagCollisions` (`tools/lib/ported-patch.js`, shared, NOT changed) renames a file that collides with another port's and then rewrites every text that names it by **file name alone**, in every folder. When the renamed copy was another one (the icon under `UI/CMDBAR/UPGRADES` was renamed, the one under `UI/ICONS/UPGRADES` was not; HD's own `ZOMBIFY.BMP` was identical and dropped), every reference that meant the other file now asked for `<name>_w23.BMP`, which nobody wrote: the game draws its placeholder, a solid blue square in the command bar. Found by the maintainer's scan after the same bug in the AsvrMod port (PR #40); the logic of its `asvr-refs.js` is copied here, with the tag as a parameter, because that file is not in this branch and `ported-patch.js` is shared. When that PR merges, both can use one module.

| Reference (what the port named) | File the mod's own text meant | Owner | Fixed as |
|---|---|---|---|
| `queueicon="gameres/icons/upgrades/CSHIELDS_w23.BMP"` (WCARTHAGE.XML) | `gameres/icons/upgrades/CSHIELDS.BMP` | ours | name put back |
| `queueicon="gameres/icons/upgrades/ZOMBIFY_w23.BMP"` (WCARTHAGE.XML) | `gameres/icons/upgrades/ZOMBIFY.BMP` | ours | name put back |
| `button="research/ZOMBIFY_w23.BMP"` (WCARTHAGE.XML) | `research/ZOMBIFY.BMP` | ours | name put back |
| `queueicon="gameres/icons/upgrades/MAHOUT MASTERY_w23.BMP"` (WCARTHAGE.XML) | `gameres/icons/upgrades/MAHOUT MASTERY.BMP` | ours | name put back |
| `button="actions/train RASTATUS_w23.BMP"` (WPUNIC.XML) | `actions/train RASTATUS.BMP` | ours | name put back |
| `button="actions/train RTRIARIUS_w23.BMP"` (WPUNIC.XML) | `actions/train RTRIARIUS.BMP` | ours | name put back |

All the rows above are **ours** (the rename broke them: the unsuffixed name resolves in the port or in HD). The same pass also put back **7 sound entity names** (`sounds attack="MyrmidonFight"`: `MyrmidonFight` is the mod's entity, renamed `MyrmidonFight_w23.XML` because 1.8 and 4.2 ship the same path; the class named it without `.xml`, so the rewrite never reached it and `W..Javelineer`, `Sentry`, `Velit`, `Huntress`, `Slinger`... lost their attack sound) and 6 **order and text names** that spell a renamed class id (`Gaul Spearman`, `Roman Thermae`...; `Roman Thermae` showed as `Roman Thermae_w23` in the editor and in the translation key).

**Allowed (the original's own bugs, or left out on purpose):**

- `gameres/icons/upgrades/WBreast.bmp`: HD's own BLACKSMITH.XML names it too; HD has the picture only under UI/HELP/UPGRADES, not where the queue icon looks (not this port's).
- `CurrentLang/voices/TTeutonWolf/1.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/2.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/3.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/4.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/5.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/WgrVillager/Don't underestimate peon's words.wav`: the mod's package names the file with `_` where its own sound entity has `'` (HD's files keep the apostrophe): the original did not resolve either.
- `CurrentLang/voices/WgrPriest/I'll help the injured.wav`: the mod's package names the file with `_` where its own sound entity has `'` (HD's files keep the apostrophe): the original did not resolve either.
- `CurrentLang/voices/WgrPriest/I'll invoke the power of the Gods!.wav`: the mod's package names the file with `_` where its own sound entity has `'` (HD's files keep the apostrophe): the original did not resolve either.
- `Sounds/entities/VoiceBDruid.xml`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/selection/briton_morrigansmonument.wav`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/selection/Egyptian_market.wav`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/entities/VoiceGDruid.xml`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/entities/VoiceTEnchantress.xml`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/selection/German_SanctuaryOfVotan.wav`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/entities/VoiceIEnchantress.xml`: the game's own classes name it the same way and it does not resolve in HD either.

**Renamed random-map templates and the winter Thermae.** `DATA/RANDOMMAP/COMPETITIVE.RM_w23.XML` and `REAL WORLD.RM_w23.XML` (and the 8 pictures of `RANDOMMAP/COMPETITIVE|REAL WORLD`, renamed `010_w23.BMP`...) are the 1.8's (byte-identical), renamed by `tagCollisions` because the 1.8, the 4.2 and the Caesar Mod ship the same path. **Kept on purpose, the maintainer decided** (no change to the build). Evidence: **another mod, not this one**. In the AsvrMod port (PR #40) four templates renamed the same way (`AFRICA.RM_asv.XML`..., pictures `010_asv.BMP`) were tried in game on 2026-10-31: the lobby's *Map type* listed them (22 entries; the log shows `opens data/randommap/africa.rm_asv.xml`) and all four generated a real map with the right shape. HD does not ship them, so they could only come from the renamed files. That contradicts the reading of `FillRandomMapTemplateCombo` (decomp `006c7b60`: the name is cut at the first `.` and `rm.xml` is compared); why it works is not known, and the observation wins.

**Not tried for this port:** that *Competitive* and *Real World* show in the lobby and generate a map with this set active; and what the lobby shows when this set is active together with the 1.8 or the 4.2, which ship byte-identical templates (probably the same name twice in the list).

**`DATA/CLASSES/WINTER/THERMAE.SC_w23.XML` is an open question.** Its name no longer ends in `.sc.xml`, and the class loader is a different one from the random-map list: the AsvrMod test does not cover it. Not claimed to work; not checked in game. If the winter Thermae is not read, the summer class still exists (`ThermaeWinter` only sets the winter sprite of the ruin).

## Maps that `require` this mod

None: `requires` on `greek-mod-2-3` in `docs/MODS.md`: none (the 2.3 has no maps of its own). Out of scope (#8).

## In game

**First test (maintainer, 2026-10-30, profile with only this set, random map, `wgreece` against the `wimperial`, `wrome` and `wpunic` AIs):** it hung. The log (`imperivm-mod.crashed.log`) had two defects, both of this port and both fixed; **the scripts copies (`*_w23`) and the script patches are the first thing the game compiled and ran of this port**, so more can show up.

1. `COMPILATION ERROR (90, 5): Unexpected starting token for factor` right after `data/subai/outpost_idle.vs applied`. `patches/DATA/SUBAI/OUTPOST_IDLE.vs` (a patch on the game\'s script, which every outpost of every player runs) was three lines: the mod\'s `if (IsHeirOf("WgrHoplite") ...) {` had lost its body. The mod had re-indented the game\'s `olLibyansOut.Add(.Units[i]);` (trailing spaces) and added a second `olLibyansOut.Add(.Units[i]);`; `vsPatch` (`tools/lib/ported-patch.js`) dropped *every* inserted line with the text of a deleted one, so the second went with the first. Fixed: one inserted copy per deleted line. And the build now **applies every script patch to the game\'s script with the engine\'s algorithm** (`tools/lib/script-patch.js`, the same as `PatchScriptText` of `src/mods/patchxml.cpp`: the first line that contains the anchor, the body below, trailing blank lines dropped) and compares the result with what the kept hunks say; any difference stops the build. The directives are emitted from the bottom of the file to the top so that what one inserts never holds the anchor of the next. `tools/lib/script-checks.js` repeats it on the finished port (every anchor exists, braces and parentheses balance, no `if (...) {` is followed at once by the game\'s `}`).
2. `HANG` (`PickRandomHeroClass`, `gbr.exe+1313de`, called by `GetRandomHeroClass`). Read in `export/decomp/0053/00531060.c` and `00530e40.c`: `CollectDerivedClasses` keeps the classes `c` with `IsKindOfName(c, base)`, which walks `c`\'s parent chain and so includes the base itself; `PickRandomHeroClass` then draws from them at random until `CVXScriptClass::HasEntity` (the class\'s own entity name or the station\'s is not empty) is true. A base that exists, has `entity=""` and has no descendant with an entity is a candidate list of one with no entity: the loop never ends. A base that does not exist gives an empty list and "No heroes found" (no hang). `arena_hirehero.vs` of the mod chose the hero base by the branch flags (`GetRandomHeroClass("ImperialRomanHero", ...)`), and the copy for `wimperial` asked for `WimImperialRomanHero`, which is such a class: the Imperial branch hires `MHero1..4`, the game\'s Imperial Rome heroes (race ImperialRome), and the clone of Republican Rome never had them. The same string rule was broken in the other two: `wpunic` asked for `AncientRomanHero` (not a class of the game: "No heroes found"; the clone\'s is `WpuAncientRomanHero`) and `wrome` for `RepublicanRomanHero`, **the game\'s** class (it would have hired the game\'s heroes). Fixed: each copy names its own hero base (`WromeHero`, `WimImperialRomanHero`, `WpuAncientRomanHero`; the other branches\' strings are `if (false)` and name the same one); `wimperial` now has the Imperial heroes (`WimMHero1`...`WimMHero4`, the children of `WimImperialRomanHero`, `asBase` in `tools/greek-2x.js` plus one line in `tools/lib/clone-civs.js` that renames an `asBase` class like an extra, `RMHero1` -> `WimMHero1`, since the SDK would turn both `RHero1` and `MHero1` into `WimHero1`); `wpunic`\'s hire order now carries `WpuAncientRomanHero` as its parameter (as the 4.2 does). Not changed, found while reading it: the mod\'s dangling `else` in that script binds to the last `if`, so with the branch flags written in, a hero is placed twice per hire (the live branch and the `cmdparam` one). It is the mod\'s own script; to confirm in game.

**Second test (same day), two more defects:**

- Defect 3: **No hero ever left Greece's arena** (and no clone's but the Roman ones). `ARENA_HIREHERO.VS` places a hero when `ChooseXxx != "researched"` for the three Roman branches ("none chosen"). `tools/lib/own-scripts.js` folds those tests into `true`/`false` at build time; for a copy with no civilization entry the `!=` test came out `false` (`undefined === false`), so the copy read `if ((false) && (false) && (false))` and nothing was placed. Fixed in the tool (`civ?.flags?.[name] === true`): the copy now reads `(true) && (true) && (true)`. Confirmed in game: the hero comes out.
- Defect 4: **Troops stuck on the barracks' steps in one of the two Greek town layouts** (barracks north-west of the town hall, "Greek Town 2"; with the barracks south-west, "Greek Town 1", they came out). The barracks had ONE exit point (type 2, `-32,-50` = cell 61,68 of its `.pass`, read with the SDK's `pass.js`), the very end of a 1-2 cell dead-end corridor. **Fixed: tried in game (maintainer, 2.5.3, Greek Town 2 and Greek Town 1).** The fix is minimal: that point moves to `-16,-50` (cell 62,68); the points of type 10 and 12 stay at `-32,-50` and nothing else changes (checked with `diff` against the previous build: the barracks entity is the only file that differs). Tried, one run each, not repeated: `-32,-50` (original) stuck in Town 2 (2.5.3, as in 2.3); `-16,-50` out well in Town 2 **and** Town 1; `0,-34` (cell 63,67) also worked in Town 2; three door points (`64,22`, `80,34`, `96,45`) worked in the 2.3 but are not needed; two tries outside the building (200 units south; at the mouth of the corridor) made the troops come out but far from the door. Row 68 of the `.pass` has free cells 61, 62 and 63 only; 61 is the end of the corridor (free 3x3: 4/9, against 6/9 for 62): that fits, but **why the engine fails there is NOT proven**. **The 2.3 with the single moved point `-16,-50`: tried in game (maintainer, 2026-11-01, installed from this build): the barracks "also works"** (it had been tried before with the three-point version, which worked too). **Not tried:** the 2.6.1; and the gymnasium (arena), temple and village, which have the same single-exit shape and were not touched.

**Still to try after the fixes:** a room with only this set and the three Roman AIs for long enough that each hires a hero at its arena (`imperivm-mod.log` for `compilation error` and a hang), `wimperial`\'s Imperial heroes (`WimMHero1..4`) in its arena, outposts of every civilization (the patched `outpost_idle.vs`), the Greek hoplites of the garrison, the icons and the attack sounds of this build (the renames put back, *Pictures, sounds and references*); the 2.6.1 and the gymnasium, temple and village exits are not tried either; then the list below.

**The offline check** (`tools/lib/script-checks.js`, in the build; `raw/greek-mod-2-3-script-checks.txt`): every `GetRandomHeroClass("X")` and every `hirehero` order\'s parameter must name a class of the port or the game with at least one descendant (or itself) that has an entity; otherwise the build stops. It also checks `Place("X")`, `IsHeirOf("X")`, `ClassPlayerObjs("X")`, `ObjsInCircle(..., "X")`, `GetPlayerUnits(.., "X")` and the random map\'s `GameObj class="X"` (a warning: they do not hang) and every `GetConst("K")` (an error: the key must be in the game\'s or the port\'s `CONST.INI`). Code under `if (false) { }` is not read (what a branch flag becomes). **What it found in the 2.3 beyond the two defects:** 0 more errors; 33 warnings, all of two kinds: (a) `"BHorseman"` in `iberian_village_trainIScout.vs`, a class that neither the game nor the mod has (the mod\'s own bug: its Britain branch of the Iberian scout script places nothing); (b) a clone\'s copy that names the game\'s class of **another** civilization in a branch it never takes (`onfinish_research`: `GGuardPost`, `IEnchantress`; `outpost_idle`: `ROutpost`, `EOutpost`, `CMaceman`): the civilization whose class it is has its own copy with its own id, the others never reach the line.

## Pending: independence

- `currentlang/menubackground.bmp` (and `logo.bmp`, `menu_16_9.bmp` with the 4.2) with the other Greek mods: cosmetic.
- The graphics tail: this port has none (the 2.3's sprites became standalone `.rle` files), so it does not clash with the 4.2 or Imperivm Legacy; Mediterranevm alpha does.
- What the maps of the 1.8 / 4.2 / CGWAR place and the 2.3 shares by name was renamed (`_w23`).

## Left out because it is global

(AGENTS.md, *World rules packs*: not built in this task.) What the mod changes and no clone can carry stays out of the civilizations pack. Generated by `tools/greek-2x.js` (`raw/greek-mod-2-3-global.md`), the game's value is HD's, the mod's is what port-140.js merged. The mod's `CONST.INI` also adds 18 keys the game lacks (read only by its own scripts): those ARE shipped, as a patch that only adds keys.

What the mod changes that cannot be scoped to a clone (generated by tools/greek-2x.js; the game's value is HD's, the mod's is what port-140.js merged: HD plus the mod's edits).

What the mod changes that cannot be scoped to a clone (generated by tools/greek-2x.js; the game's value is HD's, the mod's is what port-140.js merged: HD plus the mod's edits).

### DATA/CONST.INI

15 values the game has and the mod changed (game -> mod), 22 keys the game lacks (those are added by patches/ when a script of the mod reads them).

| section | key | game | mod |
|---|---|---|---|
| GamePlay | FastMetabolismSpeed | 5 | 5 //not used |
| PlayerColors | id2 | 255, 255, 0 | 240, 244, 279 |
| PlayerColors | id5 | 237, 160, 255 | 240, 190, 214 |
| PlayerColors | id9 | 16, 155, 18 | 16, 168, 18 |
| PlayerColors | id4 | 0, 232, 232 | 135, 206, 235 |
| PlayerColors | id3 | 0, 255, 0 | 124, 252, 0 |
| PlayerColors | id12 | 159, 154, 0 | 0, 139, 139 |
| PlayerColors | id11 | 196, 13, 198 | 152, 16, 120 |
| PlayerColors | id7 | 174, 0, 0 | 205, 92, 92 |
| PlayerColors | id1 | 255, 23, 23 | 255, 36, 0 |
| PlayerColors | id10 | 0, 0, 248 | 65, 105, 225 |
| PlayerColors | id8 | 249, 155, 32 | 255, 140, 0 |
| Ranks | RankPoints10 | 2 | 250 |
| RandomMap | SYMinDistSameBound | 48 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on same sea/land border | 96 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on same sea/land border |
| RandomMap | SYMinDistDiffBound | 48 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on different sea/land borders | 96 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on different sea/land borders |

### Other files of the game the mod replaced (data tables, scripts, game modes, item scripts, random map lists)

Scripts the civilizations of the port use are not here: they are copies of their own (`_w23`). These are the files at the game's own path; the ones with Greek content became patches (step 8).

- `DATA/BONUSSCRIPTS/003 HERO.VS`: 1 lines of the game's changed or removed, 8 added by the mod
- `DATA/COPYRIGHTS.TXT`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/FORMATIONS.XML`: 0 lines of the game's changed or removed, 14 added by the mod
- `DATA/GAMESCRIPTS/1 ELIMINATION.VS`: 12 lines of the game's changed or removed, 44 added by the mod
- `DATA/GAMESCRIPTS/2 SCORE LIMIT.VS`: 25 lines of the game's changed or removed, 54 added by the mod
- `DATA/GAMESCRIPTS/3 TIME LIMIT (MILITARY RATING).VS`: 20 lines of the game's changed or removed, 45 added by the mod
- `DATA/GAMESCRIPTS/4 TIME LIMIT (SCORE).VS`: 22 lines of the game's changed or removed, 49 added by the mod
- `DATA/GAMESCRIPTS/5 ALTERNATIVE.VS`: 44 lines of the game's changed or removed, 13 added by the mod
- `DATA/INTERFACE/EDITOR/COMBO/ITEMICONS.INI`: 0 lines of the game's changed or removed, 4 added by the mod
- `DATA/INTERFACE/EDITOR/COMBO/UNITICONS.INI`: 2 lines of the game's changed or removed, 202 added by the mod
- `DATA/INTERFACE/EDITOR/MAPPLACE.INI`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/INTERFACE/EDITOR/VIEWCONQUESTMAP.INI`: 12 lines of the game's changed or removed, 13 added by the mod
- `DATA/ITEMS.XML`: 6 lines of the game's changed or removed, 51 added by the mod
- `DATA/ITEMSCRIPTS/FINGER OF DEATH.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/ITEMSCRIPTS/GEM OF WISDOM.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/RANDOMMAP/COASTAL.RM.XML`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/RANDOMMAP/PLACEOBJECTS.XML`: 2 lines of the game's changed or removed, 16 added by the mod
- `DATA/RANDOMMAP/PLACETREES.XML`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SOUND ENTITIES/ARENASELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/BARRACKSSELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/BLACKSMITHSELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/CAMELDEATH.XML`: 14 lines of the game's changed or removed, 3 added by the mod
- `DATA/SOUND ENTITIES/HORSEUNITDEATH.XML`: 16 lines of the game's changed or removed, 16 added by the mod
- `DATA/SOUND ENTITIES/HORSEWALK.XML`: 8 lines of the game's changed or removed, 4 added by the mod
- `DATA/SOUND ENTITIES/HOUSESELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/TAVERNSELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/TEMPLESELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/TOWNHALLSELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/UNITARROWFIGHT.XML`: 23 lines of the game's changed or removed, 32 added by the mod
- `DATA/SOUND ENTITIES/UNITDEATH.XML`: 10 lines of the game's changed or removed, 44 added by the mod
- `DATA/SOUND ENTITIES/UNITMACEFIGHT.XML`: 6 lines of the game's changed or removed, 11 added by the mod
- `DATA/SOUND ENTITIES/UNITPIKEFIGHT.XML`: 10 lines of the game's changed or removed, 29 added by the mod
- `DATA/SOUND ENTITIES/UNITSWORDFIGHT.XML`: 25 lines of the game's changed or removed, 50 added by the mod
- `DATA/SOUND ENTITIES/VILLAGESELECT.XML`: 4 lines of the game's changed or removed, 9 added by the mod
- `DATA/SOUND ENTITIES/VOICERGLADIATOR.XML`: 5 lines of the game's changed or removed, 10 added by the mod
- `DATA/SOUND ENTITIES/VOICERHASTATUS.XML`: 5 lines of the game's changed or removed, 10 added by the mod
- `DATA/SOUND ENTITIES/VOICERPRIEST.XML`: 5 lines of the game's changed or removed, 10 added by the mod
- `DATA/SOUND ENTITIES/VOICERPRINCIPLE.XML`: 5 lines of the game's changed or removed, 10 added by the mod
- `DATA/SOUND ENTITIES/VOICERSCOUT.XML`: 5 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/ARENA_BEHAVIOR.VS`: 0 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/ARENA_HIREHERO.VS`: 0 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/ATTACK_INDEPENDENT_VERIFY.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/BARRACK_TRAIN.VS`: 0 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/BARRACK_TRAIN_EX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BDRUID_IDLE.VS`: 3 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BDRUID_STAND_POSITION.VS`: 3 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/CREATE_BOAT_VERIFY.VS`: 2 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/DRUID_HIDE_GROUND.VS`: 7 lines of the game's changed or removed, 45 added by the mod
- `DATA/SUBAI/DRUID_ONDIE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/GDRUID_IDLE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/GDRUID_STAND_POSITION.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/GGUARDPOST_SENTRIES.VS`: 5 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/HEROGRAVE_BEHAVIOR.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/HERO_CAPTURE.VS`: 0 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/HERO_FORMATION_VERIFY.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/HORSE_ENTER.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/HORSE_IDLE.VS`: 7 lines of the game's changed or removed, 0 added by the mod
- `DATA/SUBAI/IBERIAN_VILLAGE_TRAINISCOUT.VS`: 1 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/MILITARY_ONDIE.VS`: 0 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/ONFINISH_RESEARCH.VS`: 0 lines of the game's changed or removed, 21 added by the mod
- `DATA/SUBAI/OUTPOST_BEHAVIOR.VS`: 0 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/OUTPOST_IDLE.VS`: 0 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/SETTLEMENT_BEHAVIOR_AMBIENT.VS`: 2 lines of the game's changed or removed, 0 added by the mod
- `DATA/SUBAI/SHAMAN_ADVANCE.VS`: 1 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/SHAMAN_IDLE.VS`: 5 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/SHAMAN_STAND_POSITION.VS`: 3 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/STONEHENGE_BLOODLUST_DISPATCH.VS`: 1 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/TOWNHALL_BEHAVIOR_GUARD.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TOWNHALL_SENTRIES_CONTROL.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/TRAINEX_ONADDREMOVE.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TRAIN_EX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TTENT_BEHAVIOR.VS`: 0 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/UNIT_ATTACH_VERIFY.VS`: 0 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/UNIT_ATTACK.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/UNIT_CAPTURE.VS`: 2 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/UNIT_ENTER_PARRY_MODE.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_ENTER_PARRY_MODE_VERIFY.VS`: 12 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_LEAVE_PARRY_MODE.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_LEAVE_PARRY_MODE_VERIFY.VS`: 4 lines of the game's changed or removed, 13 added by the mod
- `DATA/SUBAI/UNIT_ON_KILL.VS`: 1 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/UNIT_REVEALS.VS`: 13 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/UNIT_REVEALS_VERIFY.VS`: 6 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_TRAIN.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/VERIFY_RESEARCH.VS`: 0 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/VERIFY_TRAINEX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/VILLAGE_TRAINPEASANT.VS`: 2 lines of the game's changed or removed, 3 added by the mod
- `DATA/TERRAINS.XML`: 0 lines of the game's changed or removed, 45 added by the mod
- `DATA/VXNOTIFICATIONS.XML`: 2 lines of the game's changed or removed, 13 added by the mod

### The game's classes the mod changed that no civilization of the port took

Neutral objects and classes of no clone (their changed attributes are in the mod's classes under work/: not ported).

- Catapult
- Chest
- HeroGrave
- Horse
- ImperialRomanHero (race RepublicanRome)
- Melee
- MGate7 (race ImperialRome)
- MGate1 (race ImperialRome)
- MGate0 (race Imperial Rome)
- MGate2 (race Imperial Rome)
- MGate4 (race Imperial Rome)
- MGate5 (race Imperial Rome)
- MGate6 (race Imperial Rome)
- MGate3 (race ImperialRome)
- MPeasantMulti
- MTavern (race ImperialRome)
- MTavern2 (race ImperialRome)
- MTemple (race ImperialRome)
- MTower (race Imperial Rome)
- MWallsE (race Imperial Rome)
- MWallsN (race Imperial Rome)
- MWallsNE (race Imperial Rome)
- MWallsNW (race Imperial Rome)
- MWallsS (race Imperial Rome)
- MWallsSE (race Imperial Rome)
- MWallsSW (race Imperial Rome)
- MWallsW (race Imperial Rome)
- PeasantFemale
- Ranged
- Sentry
- ShipBattle
- Shrine
- Stonehenge
- Teleport
- TOutpost (race German)
- TTent
- Unit
- WildHorse
- WolfSummoned

Not in any list above and global too: the 109 classes of the game the mod re-defined were cloned into the ten civilizations (the clone carries the mod's version); the art of the game's units the mod redrew (`Units/CNumidianRider`, `TTeutonWolf`, `WHorse`, `RHouse01/02`, `RArena`, `RTemple`, `GGuardPost`...: 357 files in `raw/greek-mod-2-3-left-out.txt`) stays the game's for everybody, as in the 1.8 and the 4.2.
