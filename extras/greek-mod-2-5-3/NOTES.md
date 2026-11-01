# Greek Mod 2.5.3 (GreekModTeam / MediterranevmTeam, Rattlesmake's Greek Mod continued)

Row 257. `GreekModInstaller.exe` (649.5 MB, itch.io, MD5 `9e706191ac1c193b74b1fcb63edf1b27`, SHA-256 `1d005d4fb49d88e0c7316f7ed7ea120e10d3d703bfb85be7a432db16ef98aaee`, `originals/forum/greek-mod-2-5-3/files/`): an Inno Setup 6.5 installer of a full copy of the game (1.40 base, `Packs\*.pak` with `zGreek.pak` over `data.pak`, `Local\{czech,english,italian,spanish}.pak`, its own 456 MB `rle.mmp`, `gbr.exe`, a WPF launcher with its DLLs). innoextract 1.9 cannot read it ("unexpected setup loader revision"): `tools/greek-2x-source.js` runs it silently under wine in a throwaway prefix inside `work/` and removes the prefix after. Same structure as the 2.3 (Greece in Imperial Rome's slot with the letter H, the Roman branches chosen at the town hall), so the same tool builds it (`tools/greek-2x.js`, versions table in `tools/lib/greek-2x-versions.js`).

**This port is the mod as ten civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*). The set is named `Greek Mod 2.5.3` (`mod.json`), every civilization is `ai: true`, the lobby names end with `(Greek 2.5.3)`.

| `id` | Letter (explicit) | Base | Lobby name |
|---|---|---|---|
| `w5greece` | `W5gr` | Imperial Rome (own race) | Greece (Greek 2.5.3) |
| `w5rome` | `W5ro` | Republican Rome | Rep. Rome (Greek 2.5.3) |
| `w5imperial` | `W5im` | Republican Rome | Imp. Rome (Greek 2.5.3) |
| `w5punic` | `W5pu` | Republican Rome | Pun. Rome (Greek 2.5.3) |
| `w5gaul` | `W5ga` | Gaul | Gaul (Greek 2.5.3) |
| `w5carthage` | `W5ca` | Carthage | Carthage (Greek 2.5.3) |
| `w5britain` | `W5br` | Britain | Britain (Greek 2.5.3) |
| `w5iberia` | `W5ib` | Iberia | Iberia (Greek 2.5.3) |
| `w5egypt` | `W5eg` | Egypt | Egypt (Greek 2.5.3) |
| `w5germany` | `W5ge` | Germany | Germany (Greek 2.5.3) |

No `index` (the engine assigns it). The derived prefix of every id is `W5g` / `W5r` / `W5i`...: ids that share their first three characters (`w5gaul`, `w5germany`, `w5greece`) clash, so each has an explicit 4-character letter (AGENTS.md, *Prefixes*, exception; maintainer's decision for the 2.5.3 and the 2.6.1 `w6*`). Token `w5` is reserved for this version; the 2.3 has `w*` with derived prefixes. The letters were checked case-insensitively against `docs/CIVILIZATIONS.md` and the engine's `sdk/prefixes.md`: none is listed. Needs the DLL of `dev-villoh`.

## Rebuild

```bash
node tools/greek-2x-source.js 2.5.3   # runs the installer under wine in work/, flatten-paks.js, leaves out the Legacy files, port-140.js (HD + the mod)
node tools/greek-2x.js 2.5.3          # the civilizations (stages in the header of the tool)
```

`work/` is git-ignored (nothing is written under `originals/`). The same result twice (checked: the hash of every file of `ported/greek-mod-2-5-3` is equal). `raw/greek-mod-2-5-3-{left-out,own-scripts,global,whole-scripts,script-checks}` and `raw/port-140/greek-mod-2-5-3.md` are the build's reports.

**What has to be there to get the same bytes** (the build renames what it shares with another port, `_w25`, so the result depends on the ports it sees): the ports the branch tracks; `ported/cgwar`, `ported/greek-civilization-mod`, `ported/greek-mod-1-8` and `ported/mediterranevm-alpha` (git-ignored: build them or link the main checkout's); **`ported/greek-mod-2-3`, built by `tools/greek-2x.js 2.3` of the layer below**; and Imperivm Legacy, `ported/imperivm-legacy`, which the tool looks for in the main checkout (or `LEGACY_PORTED=<ported/ folder>`) and **stops without** (`GREEK2X_NO_LEGACY=1` builds without it on purpose). The SDK is the one next to the main checkout (`SDK=` overrides). Details and the story of the 176 files in `extras/greek-mod-2-3/NOTES.md`.

## What the mod changed (against the 2.3, the previous version of the line)

Measured on the unpacked folders (`work/greek-2-5-3-raw` against `work/greek-2-3-raw`, by MD5): 62 new files in `data`, 64 in `ui`, 3 in `sounds`, 3 in `currentlang`; changed: 305 in `data` (103 classes, 167 scripts), 88 in `units`, 27 in `ui`, 19 in `buildings`, the `rle.mmp` (not compared). Removed against the 2.3: the 2 conquests (`ConquestRemake`, `mediterranean`) and their 24 map files: **this version has no conquests**, so there is nothing to renumber with `interface`. 4 new classes, 53 new scripts.

## What was ported

- **Greece** (`w5greece`): as in the 2.3: its classes, commands (`DATA/COMMANDS/W5GREECE.XML` with the sources the mod added to the game's commands as patches), art, voices, items and formations (patches), hero names (`CONST.INI` patch), the city and villages of the random map (`Greek Mod Two Five Three N`, a patch of `randommapsettlements`), its interface, its AI (`GRW25_*`; the tactics `TS_GreekTactic` / `TS_GreekTactic2` as `GRW25_TS_*`, `extras/greek-mod-2-5-3/tactics.json`).
- **The game's civilizations as the mod has them**, cloned from HD with the mod's stats, costs, commands and specials (`tools/lib/clone-civs.js`), and what the mod changed in the base classes written inside each clone (57 to 87 classes each). **Rome is three civilizations** (`w5rome`, `w5imperial`, `w5punic`): the branch scripts and `RHT_SCELTA_ROMA` are not ported (AGENTS.md); each has the commands and heroes of its branch from the start. The Imperial heroes are copies with the branch's race (`asBase`).
- **The mod's behavior scripts**: copies of their own, `NAME_w25.vs`, that the clones' classes point to (130 copied, `raw/greek-mod-2-5-3-own-scripts.txt`). Each is HD's script plus the mod's edits. **29 scripts took the mod's whole script** because `git merge-file` (HD, 1.40, mod) left conflicts nobody decided by hand (`wholeOnConflict`, `raw/greek-mod-2-5-3-whole-scripts.txt`): `CALCGAIKAPRIORITY.VS`, `GETTACTICSCRIPT.VS`, `GS_CAPTURE.VS`, `SIEGE.VS`, `GEM OF WISDOM.VS`, `ACTIVATE_HERO_SKILL.VS`, `BUILD_CATAPULT.VS`, `CREATE_GOLD_MULE_BIG.VS`, `GOUTPOST_SELLFOOD.VS`, `HERO_ATTACK.VS`, `HERO_CAPTURE.VS`, `HERO_MOVE.VS`, `MILITARY_ONDIE.VS`, `ONFINISH_RESEARCH.VS`, `OUTPOST_IDLE.VS`, `STONEHENGE_BLOODLUST_DISPATCH.VS`, `TAVERN_INVESTMENT.VS`, `TTENT_BEHAVIOR.VS`, `UNIT_ATTACK.VS`, `UNIT_ATTACK_VERIFY.VS`, `UNIT_BUILD_CATAPULT.VS`, `UNIT_CAPTURE.VS`, `UNIT_ON_ENTER.VS`, `UNIT_ON_KILL.VS`, `VILLAGE_REPOPULATE.VS`, `VILLAGE_REPOPULATE_VERIFY.VS`, `VILLAGE_TRIBUTEFOOD.VS`, `VILLAGE_TRIBUTEFOOD_VERIFY.VS`, `WAGON_UNLOAD.VS`. The price is HD's later fixes to those scripts, in the copies of this mod only (the game's stay as they are). The build checks that every script has balanced braces and that every patch applies to HD's script (`tools/lib/script-patch.js`, `script-checks.js`), not that they behave: they were not run in game.
- **The mod's AI**: `GRW25_*` copies started by `Main.vs` and `TSH_*` blocks inside the game's scripts that only run for the mod's civilizations. The mod's `GS_EnterSettlement`, `GS_Capture`, `GS_KillEnemies` and `GS_Siege` are **not ported** (the engine picks a group strategy by name).
- **Neutral content** (nobody's, renamed `_w25` because the alpha, the 4.2, the 2.3 and Imperivm Legacy have the same ids): the Numidian tent and its horsemen, the Greek garrison post, the fisherman, `Crixus`, `Gannicus`, `Spearman`...: 16 classes, 14 art folders and 204 other files (`tagCollisions`).
- **Voices per language**: `currentlang/voices` has the English pack's takes (44.1 kHz 16 bit), `local/spanish/voices` and `local/italian/voices` their own pack's; the Greek villagers have no English recording, the Spanish one stays for everybody. Not heard in game. `czech.pak` is not a language of the game.
- **Italian and Spanish texts**: `loc/italian.loc.xml`, `loc/spanish.loc.xml`, without what changes the game's own texts for everybody.
- **Menu skin and music**: kept, cosmetic. **The 24 `UI/MENU/*.BMP` of the skin (buttons, frames, arrows, scroll bars) were dropped by the first builds** (the keep filter in `tools/greek-2x.js` had no `i` flag; fixed in the 2.3's layer) and are in the port now; they replace the game's at the game's paths (the approved cosmetic exception; `shared-paths.js` lists them only against HD). Not tried in game. `DATA/INTERFACE/EDITOR/MAPPLACE.INI` and `VIEWCONQUESTMAP.INI` stay out, with their reason in `raw/greek-mod-2-5-3-left-out.txt` (the editor's own INIs, global, not the skin).
- **Greece's barracks**: the type-2 exit point moves from `-32,-50` to `-16,-50` (the same entity, `.pass` and points as the 2.3's: byte-identical in both downloads, checked). Found in the 2.3's test and **tried in game in this version** (Greek Town 2 and Town 1): see Defect 4 in `extras/greek-mod-2-3/NOTES.md`. The 2.3 with this single point also works (maintainer, 2026-11-01). Not tried: the 2.6.1, the gymnasium, temple and village (same single-exit shape, untouched).

## What the original did through its `.exe` and DLLs (not shipped: a mod carries data only)

- `gbr.exe` (162 bytes different from HD's, 476 bytes fewer than the 2.6.1's, read by comparing both): the race names of slot 4 (`Imperial Rome` -> `Greece`...), its letter (`M` -> `H`) and the PE header. The old engine trick; here Greece is a race of its own.
- The WPF launcher (`Hardcodet.Wpf.TaskbarNotification.dll`, `MaterialDesign*.dll`, `NAudio.dll`, `Newtonsoft.Json.dll`), `config.ini`, `Settings.ini`, `update.xml`, the uninstaller: the mod's launcher, settings and updater. Nothing of the game's data.

## License and permission

The installer has no license text. `CURRENTLANG/CREDITS.TXT` (shipped in `local/`) lists the team. `mod.json` credits GreekModTeam, MediterranevmTeam and Rattlesmake, with "Villoh (port)", and names Nicoghiro31 (Imperivm Legacy) and Gargolus for the assets. `redistributable: false`; permission: not asked (column *Permission* of row 257: `?`).

**Imperivm Legacy (Nicoghiro31): the license question is NOT closed, and it is the maintainer's to decide, not this port's.** *Question for the maintainer:* may the 38 listed files (and, once compared, the sprites in `rle.mmp`) be published, or must they stay out? Until then they are out and nothing here goes to GameBanana or anywhere else. The files of this version that are new or changed against the 2.3 and byte-identical to a file of Imperivm Legacy 2.4.1 are **not in this port**: 38 files, listed below (`extras/greek-mod-2-5-3/legacy-left-out.txt`, made by `tools/greek-2x-legacy.js`). 16 of them are new in the 2.5.3 and were dropped; 22 exist in the 2.3 and keep the 2.3's version. The comparison covers **loose files only**: the sprites in `rle.mmp` were **not compared**, so Legacy sprites may still be in the port. Nothing of this goes to GameBanana until the license is settled. Files left out:

- `DATA/AI/_TEUTON/AI.INI`
- `DATA/AI/_TEUTON/ES_OUTPOSTARMY.VS`
- `DATA/AI/_TEUTON/GETARMYNEED.VS`
- `DATA/AI/_TEUTON/GS_CAPTURE.VS`
- `DATA/AI/_TEUTON/GS_SIEGE.VS`
- `DATA/AI/_TEUTON/TSH_HEROSKILLS.VS`
- `DATA/AI/TS_IBERIANTACTIC2.VS`
- `SOUNDS/NOTIFICATIONS/TOWNHALL REFRESHMENT.WAV`
- `UI/CMDBAR/ACTIONS/HIRE CHORSEMAN.BMP`
- `UI/CMDBAR/ACTIONS/HIRE HEROM.BMP`
- `UI/CMDBAR/ACTIONS/HIRE HEROR.BMP`
- `UI/CMDBAR/ACTIONS/IMPERIAL TRAINING.BMP`
- `UI/CMDBAR/ACTIONS/STOP_CHORSEMAN.BMP`
- `UI/CMDBAR/ACTIONS/TRAIN CHORSEMAN.BMP`
- `UI/CMDBAR/CMDBARIBERIA.BMP`
- `UI/CMDBAR/CMDBARRROME.BMP`
- `UI/CMDBAR/RESEARCH/TBATTLESONG.BMP`
- `UI/CMDBAR/RIGHTRROME.BMP`
- `UI/CMDBAR/UPGRADES/CPIKES.BMP`
- `UI/CMDBAR/UPGRADES/CSHIELDS.BMP`
- `UI/CMDBAR/UPGRADES/STOPCPIKES.BMP`
- `UI/CMDBAR/UPGRADES/STOPCSHIELDS.BMP`
- `UI/ICONS/CHORSEMAN.BMP`
- `UI/ICONS/HIRE HEROM.BMP`
- `UI/ICONS/HIRE HEROR.BMP`
- `UI/ICONS/ITEMS/CARNYX.BMP`
- `UI/ICONS/MHERO1.BMP`
- `UI/ICONS/MHERO3.BMP`
- `UI/ICONS/RHERO3.BMP`
- `UI/ICONS/TEUTONCHIEFTAIN.BMP`
- `UI/ICONS/THERO8.BMP`
- `UI/ICONS/UPGRADES/CARNYX.BMP`
- `UI/INFOBAR/BRITAIN/BUTTON ATTACH.BMP`
- `UI/INFOBAR/BRITAIN/BUTTON SKILLS.BMP`
- `UI/INFOBAR/BRITAIN/QI_FRAME1.HI.BMP`
- `UI/INFOBAR/BRITAIN/QI_FRAME2.HI.BMP`
- `UI/INFOBAR/SKILLS/BATTLEKNOWLEDGE.BMP`
- `UNITS/NHERO1/NHERO1.ENT.XML`

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`): **2715 files checked, 0 errors, 68 warnings** (animations whose `frames` do not match their rows, in the mod's own sprites).

`node tools/shared-paths.js greek-mod-2-5-3`: **0 class ids in common** with the game and with the CGWAR, the 4.2, the 1.8 and Mediterranevm alpha:

```text
cgwar: 1 files in the same path with other bytes, 1 identical, 0 class ids in common
  currentlang/menubackground.bmp
greek-civilization-mod: 4 files in the same path with other bytes, 629 identical, 0 class ids in common
  currentlang/conquerbackground.bmp
  currentlang/logo.bmp
  currentlang/menubackground.bmp
  currentlang/menu_16_9.bmp
greek-mod-1-8: 1 files in the same path with other bytes, 511 identical, 0 class ids in common
  currentlang/menubackground.bmp
mediterranevm-alpha: 1 files in the same path with other bytes, 10 identical, 0 class ids in common
  currentlang/menubackground.bmp
7 collisions
```

Only the menu skin: cosmetic. Against the 2.3 (`ported/greek-mod-2-3`, the other port of the line): 0 files at the same path with other bytes, 598 identical (art and sounds both carry), 0 class ids in common. Imperivm Legacy is not in this worktree's `ported/`: the names that collide with it were renamed (`tagCollisions`, tag `w25`, also compares with the main checkout's `ported/imperivm-legacy`).

Script checks (`raw/greek-mod-2-5-3-script-checks.txt`): 258 scripts, 0 errors, 49 warnings: the same two kinds as in the 2.3 (a clone's copy names the game's class of another civilization in a branch it never takes; `"BHorseman"` in `iberian_village_trainIScout.vs`, the mod's own bug) plus `"RomanShipyard"` / `"GaulShipyard"` in the mule scripts and `"TBarrackHorse"`, classes neither the game nor the mod has.

## Pictures, sounds and references (checked offline)

`tools/lib/greek-2x-refs.js`, run by `tools/greek-2x.js` after `tagCollisions`, **stops the build** when a picture (`button`, `queueicon`, `icon`, `transpicon`, `image` of the commands, classes and `patches/DATA/ITEMS.XML`), a sound file of a sound entity, a class's sound entity or sound, or an `entity=` does not resolve in the port or in HD's packs (`gameres/cmdbar|icons|infobar/X` -> `UI/CMDBAR|ICONS|INFOBAR/X`; a plain `button=` -> `UI/CMDBAR/X`), or when a text names a `_w25` file, folder or class that does not exist. Result of the last build: **3399 references checked, 0 that do not resolve**, 19 allowed (below).

**What went wrong and is fixed.** `tagCollisions` (`tools/lib/ported-patch.js`, shared, NOT changed) renames a file that collides with another port's and then rewrites every text that names it by **file name alone**, in every folder. When the renamed copy was another one (the icon under `UI/CMDBAR/UPGRADES` was renamed, the one under `UI/ICONS/UPGRADES` was not; HD's own `ZOMBIFY.BMP` was identical and dropped), every reference that meant the other file now asked for `<name>_w25.BMP`, which nobody wrote: the game draws its placeholder, a solid blue square in the command bar. Found by the maintainer's scan after the same bug in the AsvrMod port (PR #40); the logic of its `asvr-refs.js` is copied here, with the tag as a parameter, because that file is not in this branch and `ported-patch.js` is shared. When that PR merges, both can use one module.

| Reference (what the port named) | File the mod's own text meant | Owner | Fixed as |
|---|---|---|---|
| `queueicon="gameres/icons/upgrades/CSHIELDS_w25.BMP"` (W5CARTHAGE.XML) | `gameres/icons/upgrades/CSHIELDS.BMP` | ours | name put back |
| `queueicon="gameres/icons/upgrades/ZOMBIFY_w25.BMP"` (W5CARTHAGE.XML) | `gameres/icons/upgrades/ZOMBIFY.BMP` | ours | name put back |
| `button="research/ZOMBIFY_w25.BMP"` (W5CARTHAGE.XML) | `research/ZOMBIFY.BMP` | ours | name put back |
| `queueicon="gameres/icons/upgrades/MAHOUT MASTERY_w25.BMP"` (W5CARTHAGE.XML) | `gameres/icons/upgrades/MAHOUT MASTERY.BMP` | ours | name put back |
| `button="actions/train RASTATUS_w25.BMP"` (W5PUNIC.XML) | `actions/train RASTATUS.BMP` | ours | name put back |
| `button="actions/train RTRIARIUS_w25.BMP"` (W5PUNIC.XML) | `actions/train RTRIARIUS.BMP` | ours | name put back |

All the rows above are **ours** (the rename broke them: the unsuffixed name resolves in the port or in HD). The same pass also put back **7 sound entity names** (`sounds attack="MyrmidonFight"`: `MyrmidonFight` is the mod's entity, renamed `MyrmidonFight_w25.XML` because 1.8 and 4.2 ship the same path; the class named it without `.xml`, so the rewrite never reached it and `W..Javelineer`, `Sentry`, `Velit`, `Huntress`, `Slinger`... lost their attack sound) and 11 **order and text names** that spell a renamed class id (`Gaul Spearman`, `Roman Thermae`...; `Roman Thermae` showed as `Roman Thermae_w25` in the editor and in the translation key).

**Allowed (the original's own bugs, or left out on purpose):**

- `gameres/icons/TeutonChieftain.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder.
- `gameres/icons/upgrades/CARNYX_w25.BMP`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder.
- `gameres/icons/upgrades/WBreast.bmp`: HD's own BLACKSMITH.XML names it too; HD has the picture only under UI/HELP/UPGRADES, not where the queue icon looks (not this port's).
- `research/tbattlesong.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder.
- `actions/hire heroM.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder.
- `gameres/icons/hire heroM.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder.
- `actions/Imperial training.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder.
- `gameres/icons/items/CARNYX_w25.BMP`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder.
- `sounds/notifications/townhall refreshment.wav`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled).
- `CurrentLang/voices/TTeutonWolf/1.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/2.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/3.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/4.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/TTeutonWolf/5.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either.
- `CurrentLang/voices/W5grVillager/Don't underestimate peon's words.wav`: the mod's package names the file with `_` where its own sound entity has `'` (HD's files keep the apostrophe): the original did not resolve either.
- `Sounds/entities/VoiceBDruid.xml`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/entities/VoiceGDruid.xml`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/entities/VoiceTEnchantress.xml`: the game's own classes name it the same way and it does not resolve in HD either.
- `Sounds/entities/VoiceIEnchantress.xml`: the game's own classes name it the same way and it does not resolve in HD either.

**Renamed random-map templates and the winter Thermae.** `DATA/RANDOMMAP/COMPETITIVE.RM_w25.XML` and `REAL WORLD.RM_w25.XML` (and the 8 pictures of `RANDOMMAP/COMPETITIVE|REAL WORLD`, renamed `010_w25.BMP`...) are the 1.8's (byte-identical), renamed by `tagCollisions` because the 1.8, the 4.2 and the Caesar Mod ship the same path. **Kept on purpose, the maintainer decided** (no change to the build). Evidence: **another mod, not this one**. In the AsvrMod port (PR #40) four templates renamed the same way (`AFRICA.RM_asv.XML`..., pictures `010_asv.BMP`) were tried in game on 2026-10-31: the lobby's *Map type* listed them (22 entries; the log shows `opens data/randommap/africa.rm_asv.xml`) and all four generated a real map with the right shape. HD does not ship them, so they could only come from the renamed files. That contradicts the reading of `FillRandomMapTemplateCombo` (decomp `006c7b60`: the name is cut at the first `.` and `rm.xml` is compared); why it works is not known, and the observation wins.

**Not tried for this port:** that *Competitive* and *Real World* show in the lobby and generate a map with this set active; and what the lobby shows when this set is active together with the 1.8 or the 4.2, which ship byte-identical templates (probably the same name twice in the list).

**`DATA/CLASSES/WINTER/THERMAE.SC_w25.XML` is an open question.** Its name no longer ends in `.sc.xml`, and the class loader is a different one from the random-map list: the AsvrMod test does not cover it. Not claimed to work; not checked in game. If the winter Thermae is not read, the summer class still exists (`ThermaeWinter` only sets the winter sprite of the ruin).

## Names the scripts use (checked offline, added after the 2.6.1's first test)

The 2.6.1's first in-game test (maintainer, 2026-11-01, only this set, installed from the build) loaded and showed three compilation errors that the build had not caught (script checks: 0 errors). `tools/lib/greek-2x-names.js` (run by `tools/lib/greek-2x-checks.js`, so by every build) now reads the port's scripts and the game's scripts that a class or command of the port points to, and **stops the build** on: a bare name or a call that is no variable, member, game function or constant (`sdk/game-functions.txt`), special, AI name, strategy or class; a script file named by a `vs=` / `verify=` or an `AIRun("X.vs")` that is in neither the port nor the game; an order (`AddCommand`, `SetCommand`, `ExecCmd`, `GetCmdStaminaCost`...) that no command or method of the port or the game has. Scripts that nothing points to are not read (counted in the note). What it **cannot** see: the type of an expression and the signature of a call (`x.nme`, a typo after a dot, passes); `Mod_*` names (any passes); a name a string builds at run time; code under `if (false)`; whether a script does what it should. It is calibrated on the game's own live scripts, so it can miss a name that only the game's dead scripts define.

What it found in this version: `GRW25_ES_Stronghold.vs` calls `ESH_BuildCarthaginianArmy.vs`, a script of the mod's own that the port did not ship: shipped as `GRW25_ESH_BuildCarthaginianArmy.vs`, registered in the AI.INI patch. Not seen in game.

## Maps that `require` this mod

None known: `docs/MODS.md` lists no map that `requires` `greek-mod-2-5-3`. Out of scope (#8).

## In game

**Tried (maintainer, 2026-11-01, installed from this build, profile with this set):** Greece's barracks in both Greek town layouts (Greek Town 1 and Greek Town 2): after moving the type-2 exit point from `-32,-50` to `-16,-50` the troops come out and walk to the town hall (before, they stayed on the steps in Town 2). That is all that has been tried in this version.

**NOT tried yet** (the maintainer is still on the long game against the Roman AIs, the icons and the attack sounds of this build):
- the long game against the Roman AIs, `imperivm-mod.log` for `compilation error` and a hang, the hero of each arena, outposts;
- this version's scripts: 130 copies, **29 of them the mod's whole script** (conflicts nobody decided by hand, see *What was ported*), none ever run in game; the 2.3's first test found four defects in its own scripts;
- the icons (the pictures put back, *Pictures, sounds and references*), the attack sounds of the seven units whose sound entity name was put back, the Gaulish spearman's order and its text;
- the Italian and Spanish voices; *Competitive* / *Real World* with this set (kept renamed on purpose); `THERMAE.SC_w25.XML`; two civilization mods active together;
- the gymnasium (arena), temple and village exits (same single-exit shape as the barracks, untouched).

What the 2.3's test found and this build already carries: the `OUTPOST_IDLE.vs` patch and the other patches are applied to HD's scripts with the engine's algorithm and compared (`tools/lib/ported-patch.js`, `tools/lib/script-patch.js`); every hero base has an entity (`GetRandomHeroClass`); `ARENA_HIREHERO.VS` places a hero for every clone (`tools/lib/own-scripts.js`); the barracks exit point. See the 2.3's *In game*.

## Pending: independence

- `currentlang/*.bmp` menu skin with the other Greek mods: cosmetic.
- The 2.5.3 and the 2.3 were never tried together in game: they share no class id or path with other bytes, per `shared-paths`.

## Left out because it is global

(AGENTS.md, *World rules packs*: not built in this task.) What the mod changes and no clone can carry stays out of the civilizations pack. Generated by `tools/greek-2x.js` (`raw/greek-mod-2-5-3-global.md`); the game's value is HD's, the mod's is what `port-140.js` merged. The mod's `CONST.INI` also adds keys the game lacks (read only by its own scripts): those ARE shipped, as a patch that only adds keys.

What the mod changes that cannot be scoped to a clone (generated by tools/greek-2x.js; the game's value is HD's, the mod's is what port-140.js merged: HD plus the mod's edits).

### DATA/CONST.INI

22 values the game has and the mod changed (game -> mod), 22 keys the game lacks (those are added by patches/ when a script of the mod reads them).

| section | key | game | mod |
|---|---|---|---|
| GamePlay | DisciplineBonusBase | 10 | 0 |
| GamePlay | RushDamage | 6 | 5 |
| GamePlay | DiseaseHealthDecrease | 40 | 60 |
| GamePlay | DefensePerEpicArmorLevel | 2 | 1 |
| GamePlay | SpeedPercentPerQuickMarchLevel | 5 | 3 |
| GamePlay | SightPerScoutLevel | 100 | 0 |
| GamePlay | DisciplineBonusStep | 1 | 0 |
| GamePlay | FastMetabolismSpeed | 5 | 5 //not used |
| PlayerColors | id2 | 255, 255, 0 | 240, 244, 279 |
| PlayerColors | id5 | 237, 160, 255 | 240, 190, 214 |
| PlayerColors | id9 | 16, 155, 18 | 16, 168, 18 |
| PlayerColors | id4 | 0, 232, 232 | 135, 206, 235 |
| PlayerColors | id3 | 0, 255, 0 | 124, 252, 0 |
| PlayerColors | id12 | 159, 154, 0 | 0, 139, 139 |
| PlayerColors | id11 | 196, 13, 198 | 153, 102, 204 |
| PlayerColors | id7 | 174, 0, 0 | 205, 92, 92 |
| PlayerColors | id1 | 255, 23, 23 | 255, 36, 0 |
| PlayerColors | id10 | 0, 0, 248 | 65, 105, 225 |
| PlayerColors | id8 | 249, 155, 32 | 255, 140, 0 |
| Ranks | RankPoints10 | 2 | 250 |
| RandomMap | SYMinDistSameBound | 48 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on same sea/land border | 96 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on same sea/land border |
| RandomMap | SYMinDistDiffBound | 48 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on different sea/land borders | 96 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on different sea/land borders |

### DATA/UNIT_SPECIALS.INI

1 values the game has and the mod changed (game -> mod), 0 keys the game lacks (those are added by patches/ when a script of the mod reads them).

| section | key | game | mod |
|---|---|---|---|
| Invisibility | stamina_cost | 2 | 4 |

### DATA/SKILLS.INI

9 values the game has and the mod changed (game -> mod), 0 keys the game lacks (those are added by patches/ when a script of the mod reads them).

| section | key | game | mod |
|---|---|---|---|
| Quick March | descr | Increases the speed of every attached warrior by 5% per skill point | Increases the speed of every attached warrior by 3% per skill point |
| Epic endurance | descr | Increases the hero's maximum health by 100 health points per skill point | Increases the hero's maximum health by 100 health points per skill point and the attached warriors' health by 8 per skill point |
| Discipline | descr | Increases the level of every attached warrior so it is at least 2 plus the number of skill points | Attached warriors passively recover 5 health points per skill point every 10 seconds while fighting |
| Egoism | descr | Once every 5 seconds the hero steals up to 20 health points per skill point from a random warrior attached to him | Once every 5 seconds the hero steals up to 20 health points per skill point from a random warrior attached to him. Additionally, when an attached warrior kills an enemy unit, it has a chance to reduce a nearby enemy hero's experience by 1 point (by 5% per skill point) |
| Scout | rollover | Scout | Battle Knowledge |
| Scout | help_ref | Scout | Battle Knowledge |
| Scout | descr | Increases the hero's sight by 100 per skill point | Attached warriors have a 10% chance per skill point to grant 1 additional level to a nearby ally after killing an enemy unit (does not target heroes) |
| Scout | icon | gameres/InfoBar/Skills/Scout.bmp | gameres/InfoBar/Skills/BattleKnowledge.bmp |
| Epic armor | descr | Increases the hero's armor by 2 per skill point | Increases the hero's armor by 1 per skill point. Additionally, when an attached warrior kills an enemy unit, it has a chance to permanently gain 1 armor point (by 2% per skill point) |

### Other files of the game the mod replaced (data tables, scripts, game modes, item scripts, random map lists)

Scripts the civilizations of the port use are not here: they are copies of their own (`_w25`). These are the files at the game's own path; the ones with Greek content became patches (step 8).

- `DATA/AI HELPERS/GUARD AREA.VS`: 51 lines of the game's changed or removed, 34 added by the mod
- `DATA/AI HELPERS/GUARD.VS`: 87 lines of the game's changed or removed, 53 added by the mod
- `DATA/AI HELPERS/SIEGE GATE.VS`: 81 lines of the game's changed or removed, 123 added by the mod
- `DATA/AI HELPERS/SIEGE.VS`: 136 lines of the game's changed or removed, 193 added by the mod
- `DATA/BONUSSCRIPTS/003 HERO.VS`: 1 lines of the game's changed or removed, 10 added by the mod
- `DATA/COPYRIGHTS.TXT`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/COUNTERUNITS.XML`: 0 lines of the game's changed or removed, 16 added by the mod
- `DATA/FORMATIONS.XML`: 0 lines of the game's changed or removed, 14 added by the mod
- `DATA/GAMESCRIPTS/1 ELIMINATION.VS`: 12 lines of the game's changed or removed, 44 added by the mod
- `DATA/GAMESCRIPTS/2 SCORE LIMIT.VS`: 25 lines of the game's changed or removed, 54 added by the mod
- `DATA/GAMESCRIPTS/3 TIME LIMIT (MILITARY RATING).VS`: 20 lines of the game's changed or removed, 45 added by the mod
- `DATA/GAMESCRIPTS/4 TIME LIMIT (SCORE).VS`: 22 lines of the game's changed or removed, 49 added by the mod
- `DATA/GAMESCRIPTS/5 ALTERNATIVE.VS`: 44 lines of the game's changed or removed, 13 added by the mod
- `DATA/INTERFACE/EDITOR/COMBO/ITEMICONS.INI`: 0 lines of the game's changed or removed, 4 added by the mod
- `DATA/INTERFACE/EDITOR/COMBO/UNITICONS.INI`: 2 lines of the game's changed or removed, 208 added by the mod
- `DATA/INTERFACE/EDITOR/MAPPLACE.INI`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/INTERFACE/EDITOR/VIEWCONQUESTMAP.INI`: 12 lines of the game's changed or removed, 13 added by the mod
- `DATA/ITEMS.XML`: 6 lines of the game's changed or removed, 61 added by the mod
- `DATA/ITEMSCRIPTS/FINGER OF DEATH.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/ITEMSCRIPTS/GEM OF WISDOM.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/RANDOMMAP/COASTAL.RM.XML`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/RANDOMMAP/PLACEOBJECTS.XML`: 3 lines of the game's changed or removed, 15 added by the mod
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
- `DATA/SUBAI/ACTIVATE_HERO_SKILL.VS`: 9 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/ANIM.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/ARENA_BEHAVIOR.VS`: 0 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/ARENA_HIREHERO.VS`: 0 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/ATTACK_INDEPENDENT_VERIFY.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/AXEMAN_SCHOOL.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/BARRACK_TRAIN.VS`: 0 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/BARRACK_TRAIN_EX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BASEMAGE_DO_NOTHING.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BBLACKSMITH_ANIM.VS`: 6 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/BDRUID_IDLE.VS`: 3 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BDRUID_STAND_POSITION.VS`: 3 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BUILDING_REPAIR.VS`: 2 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/BUILDING_REPAIR_VERIFY.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/BUILD_CATAPULT.VS`: 24 lines of the game's changed or removed, 21 added by the mod
- `DATA/SUBAI/CBLACKSMITH_ANIM.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/CMERCENARY_ONDIE.VS`: 14 lines of the game's changed or removed, 26 added by the mod
- `DATA/SUBAI/COUTPOST_BEHAVIOR.VS`: 16 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/COVEROFMERCY_IDLE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/CREATE_BOAT_VERIFY.VS`: 15 lines of the game's changed or removed, 19 added by the mod
- `DATA/SUBAI/CREATE_FOOD_BOAT_BIG.VS`: 14 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/CREATE_FOOD_BOAT_SMALL.VS`: 14 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/CREATE_FOOD_BOAT_VERIFY.VS`: 14 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/CREATE_FOOD_MULE_BIG.VS`: 13 lines of the game's changed or removed, 18 added by the mod
- `DATA/SUBAI/CREATE_FOOD_MULE_SMALL.VS`: 13 lines of the game's changed or removed, 18 added by the mod
- `DATA/SUBAI/CREATE_GOLD_BOAT_BIG.VS`: 14 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/CREATE_GOLD_BOAT_SMALL.VS`: 14 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/CREATE_GOLD_BOAT_VERIFY.VS`: 14 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/CREATE_GOLD_MULE_BIG.VS`: 14 lines of the game's changed or removed, 18 added by the mod
- `DATA/SUBAI/CREATE_GOLD_MULE_SMALL.VS`: 13 lines of the game's changed or removed, 18 added by the mod
- `DATA/SUBAI/CROW_IDLE.VS`: 68 lines of the game's changed or removed, 72 added by the mod
- `DATA/SUBAI/CROW_MOVE.VS`: 64 lines of the game's changed or removed, 38 added by the mod
- `DATA/SUBAI/DEER_IDLE.VS`: 30 lines of the game's changed or removed, 41 added by the mod
- `DATA/SUBAI/DO_NOTHING_OBJ.VS`: 4 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/DO_NOTHING_VOID.VS`: 4 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/DRUID_HIDE_GROUND.VS`: 7 lines of the game's changed or removed, 45 added by the mod
- `DATA/SUBAI/DRUID_ONDIE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/EAGLE_HOVER.VS`: 21 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/EAGLE_IDLE.VS`: 10 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/EAGLE_LESSER_HOVER.VS`: 21 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/EAGLE_MOVE.VS`: 66 lines of the game's changed or removed, 40 added by the mod
- `DATA/SUBAI/EBLACKSMITH_ANIM.VS`: 6 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/EBLACKSMITH_CHARMS.VS`: 22 lines of the game's changed or removed, 20 added by the mod
- `DATA/SUBAI/EBLACKSMITH_CHARMS_VERIFY.VS`: 23 lines of the game's changed or removed, 26 added by the mod
- `DATA/SUBAI/EMARKET_BUYSLAVES.VS`: 2 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/FISH_IDLE.VS`: 19 lines of the game's changed or removed, 20 added by the mod
- `DATA/SUBAI/GDRUID_IDLE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/GDRUID_STAND_POSITION.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/GOUTPOST_SELLFOOD.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/GOUTPOST_SELLGOLD.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/HEN_IDLE.VS`: 37 lines of the game's changed or removed, 52 added by the mod
- `DATA/SUBAI/HEROGRAVE_BEHAVIOR.VS`: 46 lines of the game's changed or removed, 48 added by the mod
- `DATA/SUBAI/HERO_CAPTURE.VS`: 82 lines of the game's changed or removed, 88 added by the mod
- `DATA/SUBAI/HERO_DIVINEGRACE.VS`: 7 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/HERO_FORMATION_VERIFY.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/HERO_MOVE.VS`: 3 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/HERO_PATROL.VS`: 26 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/HERO_SKILL_BEHAVIOUR.VS`: 123 lines of the game's changed or removed, 144 added by the mod
- `DATA/SUBAI/HORSE_ANIM.VS`: 3 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/HORSE_ENTER.VS`: 19 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/HORSE_ENTER_VERIFY.VS`: 13 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/HORSE_IDLE.VS`: 40 lines of the game's changed or removed, 47 added by the mod
- `DATA/SUBAI/HORSE_TROT.VS`: 7 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/HUNTRESS_SCHOOL.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/HUNTRESS_VERIFY.VS`: 13 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/IBERIAN_VILLAGE_TRAINISCOUT.VS`: 1 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/IBLACKSMITH_ANIM.VS`: 6 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/ITAVERN_CALLTOARMS.VS`: 25 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/ITEMPLE_ANIM.VS`: 5 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/LION_ENGAGE.VS`: 52 lines of the game's changed or removed, 29 added by the mod
- `DATA/SUBAI/LION_IDLE.VS`: 49 lines of the game's changed or removed, 32 added by the mod
- `DATA/SUBAI/LION_LEAD.VS`: 48 lines of the game's changed or removed, 45 added by the mod
- `DATA/SUBAI/MACEMEN_SCHOOL.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/MACEMEN_VERIFY.VS`: 13 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/MAGIC_WELL_BEHAVIOR.VS`: 32 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/MAHOUT_SCHOOL.VS`: 7 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/MAHOUT_VERIFY.VS`: 23 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/MILITARY_ONDIE.VS`: 3 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/MIST_IDLE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/OBJECT_IDLE.VS`: 5 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/OBJECT_WAIT.VS`: 2 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/ONFINISH_RESEARCH.VS`: 12 lines of the game's changed or removed, 34 added by the mod
- `DATA/SUBAI/OUTPOST_BEHAVIOR.VS`: 148 lines of the game's changed or removed, 115 added by the mod
- `DATA/SUBAI/OUTPOST_IDLE.VS`: 62 lines of the game's changed or removed, 65 added by the mod
- `DATA/SUBAI/PLAYER_HEROES_WISDOM.VS`: 9 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/RCATAPULT_AUTOFIRE.VS`: 17 lines of the game's changed or removed, 18 added by the mod
- `DATA/SUBAI/SCDOC.XML`: 210 lines of the game's changed or removed, 217 added by the mod
- `DATA/SUBAI/SETTLEMENT_BEHAVIOR_AMBIENT.VS`: 2 lines of the game's changed or removed, 0 added by the mod
- `DATA/SUBAI/SHAMAN_ADVANCE.VS`: 1 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/SHAMAN_IDLE.VS`: 5 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/SHAMAN_STAND_POSITION.VS`: 3 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/STONEHENGE_BLOODLUST_DISPATCH.VS`: 1 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER.VS`: 17 lines of the game's changed or removed, 94 added by the mod
- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER_VERIFY.VS`: 5 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/TAVERN_INVESTMENT.VS`: 7 lines of the game's changed or removed, 9 added by the mod
- `DATA/SUBAI/TBARRACKS_ANIM.VS`: 9 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/TBLACKSMITH_ANIM.VS`: 6 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/TELEPORT_FORCE_EXIT.VS`: 13 lines of the game's changed or removed, 21 added by the mod
- `DATA/SUBAI/TEMPLEOFTHORFIRE.VS`: 9 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/TEUTONRIDER_SCHOOL.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/TEUTONRIDER_VERIFY.VS`: 13 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/TEUTON_ARCHER_MUTATE_GV.VS`: 1 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/TEUTON_MUTATE_GD.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/TEUTON_RIDER_MUTATE_GV.VS`: 1 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/TOWNHALL_ADDPOP.VS`: 2 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TOWNHALL_BEHAVIOR_GUARD.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TOWNHALL_BUILDINGSBEHAVIOR.VS`: 14 lines of the game's changed or removed, 40 added by the mod
- `DATA/SUBAI/TOWNHALL_SENTRIES_CONTROL.VS`: 23 lines of the game's changed or removed, 17 added by the mod
- `DATA/SUBAI/TRAINEX_ONADDREMOVE.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TRAIN_EX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TTEMPLEOFNEPTUS_ANIM.VS`: 5 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/TTENT_BEHAVIOR.VS`: 157 lines of the game's changed or removed, 104 added by the mod
- `DATA/SUBAI/TTENT_FEEDING_BEHAVIOR.VS`: 14 lines of the game's changed or removed, 18 added by the mod
- `DATA/SUBAI/UNIT_ATTACK.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/UNIT_BUILD_CATAPULT.VS`: 10 lines of the game's changed or removed, 9 added by the mod
- `DATA/SUBAI/UNIT_CAPTURE.VS`: 2 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/UNIT_CAPTURE_VERIFY.VS`: 14 lines of the game's changed or removed, 9 added by the mod
- `DATA/SUBAI/UNIT_ENTER_PARRY_MODE.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_ENTER_PARRY_MODE_VERIFY.VS`: 12 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_LEAVE_PARRY_MODE.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_LEAVE_PARRY_MODE_VERIFY.VS`: 4 lines of the game's changed or removed, 13 added by the mod
- `DATA/SUBAI/UNIT_ON_ENTER.VS`: 18 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_ON_KILL.VS`: 15 lines of the game's changed or removed, 55 added by the mod
- `DATA/SUBAI/UNIT_PATROL.VS`: 13 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/UNIT_REVEALS.VS`: 13 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/UNIT_REVEALS_VERIFY.VS`: 6 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_TRAIN.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_TRANSPORT_VERIFY.VS`: 5 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/VERIFY_CMDCOST_BUILDING.VS`: 18 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/VERIFY_CMDCOST_UNIT.VS`: 5 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/VERIFY_RESEARCH.VS`: 0 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/VERIFY_TRAINEX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/VILLAGE_IDLE.VS`: 7 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/VILLAGE_REPOPULATE.VS`: 15 lines of the game's changed or removed, 9 added by the mod
- `DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS`: 31 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/VILLAGE_STOPTRIBUTE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/VILLAGE_TRAINPEASANT.VS`: 42 lines of the game's changed or removed, 38 added by the mod
- `DATA/SUBAI/VILLAGE_TRIBUTEFOOD.VS`: 3 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/VILLAGE_TRIBUTEFOOD_VERIFY.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/WAGON_UNLOAD.VS`: 15 lines of the game's changed or removed, 20 added by the mod
- `DATA/SUBAI/WOLF_ENGAGE.VS`: 49 lines of the game's changed or removed, 29 added by the mod
- `DATA/SUBAI/WOLF_IDLE.VS`: 38 lines of the game's changed or removed, 26 added by the mod
- `DATA/SUBAI/WOLF_LEAD.VS`: 62 lines of the game's changed or removed, 38 added by the mod
- `DATA/TERRAINS.XML`: 131 lines of the game's changed or removed, 58 added by the mod
- `DATA/VXNOTIFICATIONS.XML`: 0 lines of the game's changed or removed, 12 added by the mod

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
- MGate0 (race ImperialRome)
- MGate2 (race ImperialRome)
- MGate4 (race ImperialRome)
- MGate5 (race ImperialRome)
- MGate6 (race ImperialRome)
- MGate3 (race ImperialRome)
- MHero1b
- MHero1c
- MPeasantMulti
- MTavern (race ImperialRome)
- MTavern2 (race ImperialRome)
- MTemple (race ImperialRome)
- MTower (race ImperialRome)
- MWallsE (race ImperialRome)
- MWallsN (race ImperialRome)
- MWallsNE (race ImperialRome)
- MWallsNW (race ImperialRome)
- MWallsS (race ImperialRome)
- MWallsSE (race ImperialRome)
- MWallsSW (race ImperialRome)
- MWallsW (race ImperialRome)
- NHero1 (race Germany)
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
