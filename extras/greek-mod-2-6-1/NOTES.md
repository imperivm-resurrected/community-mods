# Greek Mod 2.6.1 (GreekModTeam, exe patched by AlexiusItaly; Rattlesmake's Greek Mod continued)

Row 258. Source: Telegram channel [imperivmgreekmod](https://t.me/imperivmgreekmod), received 2026-10-19. `Greek261.zip` (823 MB on disk, `originals/forum/greek-mod-2-6-1/files/`; texts say "Greek Mod 2.6"), SHA-256 `d67bfd7e6c47a31a292c93756b18cbaceea04a78a6e861fd5a2d5c2bab92329b`; `Greek_MapsAdventures.zip` (1.6 GB, separate, **not ported here**: maps and adventures are #8). ClamAV 1.5.4 (signatures of 2026-10-19): 0 detections in both zips and in everything extracted. A full copy of the game as in the 2.5.3 (`Packs\*.pak` with `zGreek.pak` over `data.pak`, `Local\*.pak`, its own `rle.mmp`, `gbr.exe`, the WPF launcher), plus DirectMusic and XACT DLLs. Same structure as the 2.3 and the 2.5.3, so the same tool builds it (`tools/greek-2x.js 2.6.1`, versions table in `tools/lib/greek-2x-versions.js`).

**This port is the mod as ten civilizations of its own, next to the game's** (AGENTS.md). The set is named `Greek Mod 2.6.1`, every civilization is `ai: true`, the lobby names end with `(Greek 2.6.1)`.

| `id` | Letter (explicit) | Base | Lobby name |
|---|---|---|---|
| `w6greece` | `W6gr` | Imperial Rome (own race) | Greece (Greek 2.6.1) |
| `w6rome` | `W6ro` | Republican Rome | Rep. Rome (Greek 2.6.1) |
| `w6imperial` | `W6im` | Republican Rome | Imp. Rome (Greek 2.6.1) |
| `w6punic` | `W6pu` | Republican Rome | Pun. Rome (Greek 2.6.1) |
| `w6gaul` | `W6ga` | Gaul | Gaul (Greek 2.6.1) |
| `w6carthage` | `W6ca` | Carthage | Carthage (Greek 2.6.1) |
| `w6britain` | `W6br` | Britain | Britain (Greek 2.6.1) |
| `w6iberia` | `W6ib` | Iberia | Iberia (Greek 2.6.1) |
| `w6egypt` | `W6eg` | Egypt | Egypt (Greek 2.6.1) |
| `w6germany` | `W6ge` | Germany | Germany (Greek 2.6.1) |

No `index`. Explicit 4-character letters because the derived prefixes (`W6g` x3) would clash (AGENTS.md, *Prefixes*, exception; maintainer's decision). Checked case-insensitively against `docs/CIVILIZATIONS.md` and the engine's `sdk/prefixes.md`: none is listed. Token `w6` is reserved for this version.

## Rebuild

```bash
node tools/greek-2x-source.js 2.6.1   # unpacks the zip into work/, flatten-paks.js, leaves out the Legacy files, port-140.js (HD + the mod)
node tools/greek-2x.js 2.6.1
```

`work/` is git-ignored. Same hash twice (checked). Reports: `raw/greek-mod-2-6-1-{left-out,own-scripts,global,whole-scripts,script-checks}` and `raw/port-140/greek-mod-2-6-1.md`.

**What has to be there to get the same bytes** (the build renames what it shares with another port, `_w26`, so the result depends on the ports it sees): the ports the branch tracks; `ported/cgwar`, `ported/greek-civilization-mod`, `ported/greek-mod-1-8` and `ported/mediterranevm-alpha` (git-ignored: build them or link the main checkout's); **`ported/greek-mod-2-3` and `ported/greek-mod-2-5-3`, built by `tools/greek-2x.js` of the layers below**; and Imperivm Legacy, `ported/imperivm-legacy`, which the tool looks for in the main checkout (or `LEGACY_PORTED=<ported/ folder>`) and **stops without** (`GREEK2X_NO_LEGACY=1` builds without it on purpose). The SDK is the one next to the main checkout (`SDK=` overrides). Details in `extras/greek-mod-2-3/NOTES.md`.

## What the mod changed (against the 2.5.3)

Measured by MD5 on the unpacked folders: 86 new files, 297 changed, 10 removed. No conquests (as in the 2.5.3). Greece's random-map towns and villages are named **"Imperial Roman Town N" / "Imperial Roman Village N"** in this version's `RandomMapSettlements.bfhp` (the patched `gbr.exe` gave slot 4 the names of Imperial Rome again), with Greek classes inside: `tools/greek-2x.js` finds them by their classes, as it finds the 2.3's and the 2.5.3's "Greek Town N" (7 templates; before this fix the build wrote none and Greece had no city on a random map).

## What was ported

- **Greece** (`w6greece`): as in the 2.5.3 (classes, commands, art, voices, items, formations, hero names, the city and villages of the random map `Greek Mod Two Six One N`, interface, AI `GRW26_*`; tactics `TS_GreekTactic` / `TS_GreekTactic2` from `extras/greek-mod-2-6-1/tactics.json`).
- **The game's civilizations as the mod has them**, cloned from HD with the mod's changes (`tools/lib/clone-civs.js`). **Rome is three civilizations** (`w6rome`, `w6imperial`, `w6punic`): the branch scripts are not ported (AGENTS.md). The mod's classes not Greek or Roman-branch are listed per civilization in the build log.
- **The mod's behavior scripts**: copies of their own, `NAME_w26.vs` (168 copied). **47 scripts took the mod's whole script** because `git merge-file` (HD, 1.40, mod) left conflicts nobody decided by hand (`raw/greek-mod-2-6-1-whole-scripts.txt`): the price is HD's later fixes to those copies. **4 scripts differ from HD's only in comments** (`HEROSKILL DEFAULT.VS`, `HERO_ATTACK.VS`, `HERO_MOVE.VS`, `UNIT_ATTACK_VERIFY.VS`) and stay HD's (nothing of the mod to carry; the first of them had produced a patch that wrapped HD's own comments in the mod's civilizations' block). The build checks that every script has balanced braces and that every patch applies to HD's script with the engine's algorithm; **no script of this version has run in game**.
- **The mod's AI**: `GRW26_*` copies and `TSH_*` blocks inside the game's scripts, only for the mod's civilizations. `GS_EnterSettlement`, `GS_Capture`, `GS_KillEnemies` and `GS_Siege` are **not ported** (the engine picks a group strategy by name).
- **Neutral content** renamed `_w26` (the other ports and Imperivm Legacy have the same ids).
- **Voices per language**: English pack's takes in `currentlang/voices`, the Spanish and Italian packs' in `local/<language>/voices`; not heard in game.
- **Greece's barracks**: the type-2 exit point moves from `-32,-50` to `-16,-50` (same entity, `.pass` and points as the 2.3's: checked byte-identical in the 2.6.1 download). Tried in game in the 2.3 and the 2.5.3, **not in this version**.
- **Three classes used by nothing** (`FArena`, `FTemple`, `FTownhall`, parents the game's `MArena`, `MTemple`, `MTownhall`) come with the mod and are shipped as they are (`FTownhall` renamed `_w26`); they name winter entities that nobody ships (allow-listed below). Whether to leave them out is the maintainer's call.

## `gbr.exe` is patched and cannot be carried

`Greek261/gbr.exe` has the text `GBR.exe Patched by AlexiusItaly` in its DOS stub and differs from the Steam HD `gbr.exe` by 532 bytes (the 1.8's by 332, the 2.5.3's by 162), 476 of them against the 2.5.3. Same size, same 258 imported functions as the HD exe (no process, network or registry calls beyond the game's own), same sections. What the 37 changed places do (read from the disassembly, not run):

| Where | What |
|---|---|
| 7 `jmp` sites in `.text` -> code in the free space at the end of `.text` (`0x3aa98b...0x3aaac0`) | Guards: `test esi,esi`, `cmp reg,0x100000` (a pointer below 1 MiB is treated as null), default `1` when a field is 0. These look like crash fixes |
| 2 `jz` -> `jmp`, 1 `jl` -> `nop nop` | Skip a check |
| ~20 edits at `0x2bcb3d...0x2be5d8` | A structure grows by `0x10` bytes (`0x1c->0x2c`, `0x20->0x30`, `0x28->0x38`) and a limit goes from 5 to 9/10 (`cmp ecx,5` -> `cmp ecx,0xa`). Some engine table is bigger |
| `0x2c312f` | `mov esi,[0x826bf8]; call ...` -> `xor esi,esi; jmp +0x38`: it skips a call |
| `0x3c71b0...0x3c7490` (`.rdata`) | The names `Greek`, `Greek Town`, `Greek Village` become `Imperial Roman`, `Imperial Roman Town`, `Imperial Roman Village` |

A Resurrected mod carries data only: the game runs the HD `gbr.exe`, so **none of this reaches the port**. The guards are probably only needed because this exe's own data trips the original code (the HD exe may have fixed some). **The bigger table and the limit 5 -> 9/10 are the risk**: if this version's data needs them (more entries than the HD exe allows) the ported mod could crash or drop content. Which table it is was **not** found; `validate-mod.js --game` finds nothing over the HD limits, and nothing was run in game. The race names in the exe are not used by the data (Greece is a race of its own here); they did change the names of Greece's random-map templates (above). Also in the download and not carried: the WPF launcher and its DLLs, `config.ini`, `Settings.ini`, `update.xml`, DirectMusic (`dm*.dll`) and XACT (`xactengine*.dll`, `X3DAudio1_7.dll`) DLLs: the mod's launcher, settings and audio runtime.

## License and permission

The download has no license text. `CURRENTLANG/CREDITS.TXT` lists the team. `mod.json` credits GreekModTeam, MediterranevmTeam and Rattlesmake with "Villoh (port)", names Nicoghiro31 (Imperivm Legacy) and Gargolus for the assets, and `redistributable: false`. The `gbr.exe` was patched by AlexiusItaly (not carried). Permission: not asked (column *Permission* of row 258: `?`).

**Imperivm Legacy (Nicoghiro31): the license question is NOT closed, and it is the maintainer's to decide, not this port's.** *Question for the maintainer:* may the 55 listed files (and, once compared, the sprites in `rle.mmp`) be published, or must they stay out? Until then they are out and nothing here goes to GameBanana or anywhere else. The files of this version that are new or changed against the **2.3** (the baseline of the line) and byte-identical to a file of Imperivm Legacy 2.4.1 are **not in this port**: 55 files (`extras/greek-mod-2-6-1/legacy-left-out.txt`, made by `tools/greek-2x-legacy.js`): 27 are new and were dropped, 28 exist in the 2.3 and keep the 2.3's version. The comparison covers **loose files only**: the sprites in `rle.mmp` were **not compared**, so Legacy sprites may still be in the port. Files left out:

- `DATA/AI/_TEUTON/AI.INI`
- `DATA/AI/_TEUTON/ES_OUTPOSTARMY.VS`
- `DATA/AI/_TEUTON/GETARMYNEED.VS`
- `DATA/AI/_TEUTON/GS_CAPTURE.VS`
- `DATA/AI/_TEUTON/GS_SIEGE.VS`
- `DATA/AI/_TEUTON/TSH_HEROSKILLS.VS`
- `DATA/SUBAI/DRUID_REVITALIZE_GROUND.VS`
- `DATA/SUBAI/HDRUID_ADVANCE.VS`
- `SOUNDS/EFFECTS/STAMINA_BOOST.WAV`
- `SOUNDS/NOTIFICATIONS/TOWNHALL REFRESHMENT.WAV`
- `UI/CMDBAR/ACTIONS/HIRE CHORSEMAN.BMP`
- `UI/CMDBAR/ACTIONS/HIRE HEROM.BMP`
- `UI/CMDBAR/ACTIONS/HIRE HEROR.BMP`
- `UI/CMDBAR/ACTIONS/HOVER.BMP`
- `UI/CMDBAR/ACTIONS/IMPERIAL TRAINING.BMP`
- `UI/CMDBAR/ACTIONS/INVISIBILITY.BMP`
- `UI/CMDBAR/ACTIONS/MILITARY TRAINING FOOD.BMP`
- `UI/CMDBAR/ACTIONS/NATURE.BMP`
- `UI/CMDBAR/ACTIONS/REVITALIZE.BMP`
- `UI/CMDBAR/ACTIONS/SOOTHING RAIN.BMP`
- `UI/CMDBAR/ACTIONS/STOP_CHORSEMAN.BMP`
- `UI/CMDBAR/ACTIONS/TRAIN CHORSEMAN.BMP`
- `UI/CMDBAR/ACTIONS/TRAINING.BMP`
- `UI/CMDBAR/CMDBARIBERIA.BMP`
- `UI/CMDBAR/CMDBARRROME.BMP`
- `UI/CMDBAR/RESEARCH/TBATTLESONG.BMP`
- `UI/CMDBAR/RIGHTRROME.BMP`
- `UI/CMDBAR/UPGRADES/BFIGHTS.BMP`
- `UI/CMDBAR/UPGRADES/BSPEARS.BMP`
- `UI/CMDBAR/UPGRADES/CPIKES.BMP`
- `UI/CMDBAR/UPGRADES/CSHIELDS.BMP`
- `UI/CMDBAR/UPGRADES/GAUL_AXE IRON.BMP`
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
- `UI/ICONS/UPGRADES/BFIGHTS.BMP`
- `UI/ICONS/UPGRADES/BSPEARS.BMP`
- `UI/ICONS/UPGRADES/CARNYX.BMP`
- `UI/ICONS/UPGRADES/GAUL_AXE IRON.BMP`
- `UI/INFOBAR/BRITAIN/BUTTON ATTACH.BMP`
- `UI/INFOBAR/BRITAIN/BUTTON SKILLS.BMP`
- `UI/INFOBAR/BRITAIN/QI_FRAME1.HI.BMP`
- `UI/INFOBAR/BRITAIN/QI_FRAME2.HI.BMP`
- `UI/INFOBAR/SKILLS/BATTLEKNOWLEDGE.BMP`
- `UI/INFOBAR/UNIT SPECIALS/DETERMINATION GLOW.BMP`
- `UI/INFOBAR/UNIT SPECIALS/DETERMINATION.BMP`
- `UNITS/NHERO1/NHERO1.ENT.XML`

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`): **2837 files checked, 0 errors, 59 warnings** (animations whose `frames` do not match their rows, in the mod's own sprites).

`node tools/shared-paths.js greek-mod-2-6-1`: **0 class ids in common** with the game and the other ports (also 0 files at the same path with other bytes against the 2.3 and the 2.5.3):

```text
cgwar: 1 files in the same path with other bytes, 1 identical, 0 class ids in common
  currentlang/menubackground.bmp
greek-civilization-mod: 4 files in the same path with other bytes, 630 identical, 0 class ids in common
  currentlang/conquerbackground.bmp
  currentlang/logo.bmp
  currentlang/menubackground.bmp
  currentlang/menu_16_9.bmp
greek-mod-1-8: 1 files in the same path with other bytes, 510 identical, 0 class ids in common
  currentlang/menubackground.bmp
mediterranevm-alpha: 1 files in the same path with other bytes, 10 identical, 0 class ids in common
  currentlang/menubackground.bmp
7 collisions
```

Only the menu skin: cosmetic. **The 24 `UI/MENU/*.BMP` of the skin (buttons, frames, arrows, scroll bars) were dropped by the first builds** (the keep filter in `tools/greek-2x.js` had no `i` flag; fixed in the 2.3's layer) and are in the port now; they replace the game's at the game's paths (the approved cosmetic exception; `shared-paths.js` lists them only against HD). Not tried in game. `DATA/INTERFACE/EDITOR/MAPPLACE.INI` and `VIEWCONQUESTMAP.INI` stay out, with their reason in `raw/greek-mod-2-6-1-left-out.txt` (the editor's own INIs, global, not the skin). Script checks (`raw/greek-mod-2-6-1-script-checks.txt`): 351 scripts, 0 errors, 69 warnings (the kinds of the 2.3 and the 2.5.3).

**The 11 layout patches were at the wrong path, and are moved** (found in the 3.6's first in-game test, 2026-11-01; see the 2.3's NOTES for the log lines). They were written to `patches/DATA/INTERFACE/MENU/`, but the engine matches a patch by the exact path the game opens, and the game opens the screens as `menuini/<name>.ini`: the 10 patches other than `TEMPLATE.INI` were dead (never read) in this port. Now every skin INI patch is at `patches/menuini/<name>.ini` and `template.ini` is at both places (same bytes as before; `tools/greek-2x.js`, in the 2.3's layer). **Not tried in game for this version**; the 3.6's log (23:52) proves the rule, not this port.

## Pictures, sounds and references (checked offline)

`tools/lib/greek-2x-refs.js`, run by `tools/greek-2x.js` after `tagCollisions`, **stops the build** when a picture (`button`, `queueicon`, `icon`, `transpicon`, `image` of the commands, classes and `patches/DATA/ITEMS.XML`), a sound file of a sound entity, a class's sound entity or sound, or an `entity=` does not resolve in the port or in HD's packs (`gameres/cmdbar|icons|infobar/X` -> `UI/CMDBAR|ICONS|INFOBAR/X`; a plain `button=` -> `UI/CMDBAR/X`), or when a text names a `_w26` file, folder or class that does not exist. Result of the last build: **4287 references checked, 0 that do not resolve**, 28 allowed (below).

**What went wrong and is fixed.** `tagCollisions` (`tools/lib/ported-patch.js`, shared, NOT changed) renames a file that collides with another port's and then rewrites every text that names it by **file name alone**, in every folder. When the renamed copy was another one (the icon under `UI/CMDBAR/UPGRADES` was renamed, the one under `UI/ICONS/UPGRADES` was not; HD's own `ZOMBIFY.BMP` was identical and dropped), every reference that meant the other file now asked for `<name>_w26.BMP`, which nobody wrote: the game draws its placeholder, a solid blue square in the command bar. Found by the maintainer's scan after the same bug in the AsvrMod port (PR #40); the logic of its `asvr-refs.js` is copied here, with the tag as a parameter, because that file is not in this branch and `ported-patch.js` is shared. When that PR merges, both can use one module.

| Reference (what the port named) | File the mod's own text meant | Owner | Fixed as |
|---|---|---|---|
| `queueicon="gameres/icons/upgrades/CSHIELDS_w26.BMP"` (W6CARTHAGE.XML) | `gameres/icons/upgrades/CSHIELDS.BMP` | ours | name put back |
| `queueicon="gameres/icons/upgrades/ZOMBIFY_w26.BMP"` (W6CARTHAGE.XML) | `gameres/icons/upgrades/ZOMBIFY.BMP` | ours | name put back |
| `button="research/ZOMBIFY_w26.BMP"` (W6CARTHAGE.XML) | `research/ZOMBIFY.BMP` | ours | name put back |
| `queueicon="gameres/icons/upgrades/MAHOUT MASTERY_w26.BMP"` (W6CARTHAGE.XML) | `gameres/icons/upgrades/MAHOUT MASTERY.BMP` | ours | name put back |
| `button="actions/train RASTATUS_w26.BMP"` (W6PUNIC.XML) | `actions/train RASTATUS.BMP` | ours | name put back |
| `button="actions/train RTRIARIUS_w26.BMP"` (W6PUNIC.XML) | `actions/train RTRIARIUS.BMP` | ours | name put back |

All the rows above are **ours** (the rename broke them: the unsuffixed name resolves in the port or in HD). The same pass also put back **7 sound entity names** (`sounds attack="MyrmidonFight"`: `MyrmidonFight` is the mod's entity, renamed `MyrmidonFight_w26.XML` because 1.8 and 4.2 ship the same path; the class named it without `.xml`, so the rewrite never reached it and `W..Javelineer`, `Sentry`, `Velit`, `Huntress`, `Slinger`... lost their attack sound) and 11 **order and text names** that spell a renamed class id (`Gaul Spearman`, `Roman Thermae`...; `Roman Thermae` showed as `Roman Thermae_w26` in the editor and in the translation key).

**Allowed (the original's own bugs, or left out on purpose):**

- `gameres/icons/TeutonChieftain.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `Upgrades/BFights.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `gameres/icons/upgrades/BFights.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `gameres/icons/upgrades/BSpears.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `upgrades/BSpears.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `gameres/icons/upgrades/CARNYX_w26.BMP`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `gameres/icons/upgrades/WBreast.bmp`: HD's own BLACKSMITH.XML names it too; HD has the picture only under UI/HELP/UPGRADES, not where the queue icon looks (not this port's)
- `gameres/icons/upgrades/gaul_axe iron.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `upgrades/gaul_axe iron.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `actions/Military training food.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `actions/hire heroM.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `gameres/icons/hire heroM.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `actions/Imperial training.bmp`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `gameres/icons/items/CARNYX_w26.BMP`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled); the game draws its placeholder
- `sounds/notifications/townhall refreshment.wav`: left out on purpose: byte-identical to a file of Imperivm Legacy (license not settled)
- `CurrentLang/voices/TTeutonWolf/1.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either
- `CurrentLang/voices/TTeutonWolf/2.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either
- `CurrentLang/voices/TTeutonWolf/3.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either
- `CurrentLang/voices/TTeutonWolf/4.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either
- `CurrentLang/voices/TTeutonWolf/5.wav`: the mod's VoiceTTTeutonWolf.xml names five voice files that no package of the mod or the game has: the original did not resolve either
- `CurrentLang/voices/W6grVillager/Don't underestimate peon's words.wav`: the mod's package names the file with `_` where its own sound entity has `'` (HD's files keep the apostrophe): the original did not resolve either
- `Buildings/MArena/MArena_w.ent.xml`: the 2.6.1's class FArena (parent MArena, used by nothing) name a winter entity that no package of the mod or the game has: the original did not resolve either
- `Buildings/MTemple/MTemple_w.ent.xml`: the 2.6.1's class FTemple (parent MTemple, used by nothing) name a winter entity that no package of the mod or the game has: the original did not resolve either
- `Buildings/MTownhall/MTownhall_w.ent.xml`: the 2.6.1's class FTownhall (parent MTownhall, used by nothing) name a winter entity that no package of the mod or the game has: the original did not resolve either
- `Sounds/entities/VoiceBDruid.xml`: the game's own classes name it the same way and it does not resolve in HD either
- `Sounds/entities/VoiceGDruid.xml`: the game's own classes name it the same way and it does not resolve in HD either
- `Sounds/entities/VoiceTEnchantress.xml`: the game's own classes name it the same way and it does not resolve in HD either
- `Sounds/entities/VoiceIEnchantress.xml`: the game's own classes name it the same way and it does not resolve in HD either

**Renamed random-map templates and the winter Thermae.** `DATA/RANDOMMAP/COMPETITIVE.RM_w26.XML` and `REAL WORLD.RM_w26.XML` (and the 8 pictures of `RANDOMMAP/COMPETITIVE|REAL WORLD`, renamed `010_w26.BMP`...) are the 1.8's (byte-identical), renamed by `tagCollisions` because the 1.8, the 4.2 and the Caesar Mod ship the same path. **Kept on purpose, the maintainer decided** (no change to the build). Evidence: **another mod, not this one**. In the AsvrMod port (PR #40) four templates renamed the same way (`AFRICA.RM_asv.XML`..., pictures `010_asv.BMP`) were tried in game on 2026-10-31: the lobby's *Map type* listed them (22 entries; the log shows `opens data/randommap/africa.rm_asv.xml`) and all four generated a real map with the right shape. HD does not ship them, so they could only come from the renamed files. That contradicts the reading of `FillRandomMapTemplateCombo` (decomp `006c7b60`: the name is cut at the first `.` and `rm.xml` is compared); why it works is not known, and the observation wins.

**Not tried for this port:** that *Competitive* and *Real World* show in the lobby and generate a map with this set active; and what the lobby shows when this set is active together with the 1.8 or the 4.2, which ship byte-identical templates (probably the same name twice in the list).

**`DATA/CLASSES/WINTER/THERMAE.SC_w26.XML` is an open question.** Its name no longer ends in `.sc.xml`, and the class loader is a different one from the random-map list: the AsvrMod test does not cover it. Not claimed to work; not checked in game. If the winter Thermae is not read, the summer class still exists (`ThermaeWinter` only sets the winter sprite of the ruin).

## Names the scripts use (checked offline, added after the 2.6.1's first test)

The 2.6.1's first in-game test (maintainer, 2026-11-01, only this set, installed from the build) loaded and showed three compilation errors that the build had not caught (script checks: 0 errors). `tools/lib/greek-2x-names.js` (run by `tools/lib/greek-2x-checks.js`, so by every build) now reads the port's scripts and the game's scripts that a class or command of the port points to, and **stops the build** on: a bare name or a call that is no variable, member, game function or constant (`sdk/game-functions.txt`), special, AI name, strategy or class; a script file named by a `vs=` / `verify=` or an `AIRun("X.vs")` that is in neither the port nor the game; an order (`AddCommand`, `SetCommand`, `ExecCmd`, `GetCmdStaminaCost`...) that no command or method of the port or the game has. Scripts that nothing points to are not read (counted in the note). What it **cannot** see: the type of an expression and the signature of a call (`x.nme`, a typo after a dot, passes); `Mod_*` names (any passes); a name a string builds at run time; code under `if (false)`; whether a script does what it should. It is calibrated on the game's own live scripts, so it can miss a name that only the game's dead scripts define.

What it found, and what was done (2.6.1; the 2.3 and the 2.5.3 had the first and the second kind too, below):

| Where | What | Cause | Fix |
|---|---|---|---|
| `GRW26_SquadMonitor.vs` (152, 84), 2 places | `StratRunning(...) == GRW26_GS_EnterSettlement`: "No matching function with name GRW26_GS_EnterSettlement" | `own-ai.js` forked the monitor and wrote the prefix into the name of the strategy; the build then left the mod's `GS_*` strategies out (the engine picks a strategy by name, `GetGAIKAStrat` returns the game's) but the monitor kept the renamed constant | the game's own constant `GS_EnterSettlement` (same compare, the strategy that runs is the game's: the mod's variant of that strategy, a different script, is still **not ported**) |
| `GRW26_ES_Stronghold.vs`, `AIRun("ESH_BuildCarthaginianArmy.vs")`, `AIRun("ESH_UpgradeBarracks.vs")` | two scripts of the mod's own AI that are in neither the game nor the port: the Stronghold economy would fail when it reaches them (a Carthaginian-style army request, the barrack upgrades) | `greek-ai.js` only carries scripts that the game also has | shipped as `GRW26_ESH_BuildCarthaginianArmy.vs` and `GRW26_ESH_UpgradeBarracks.vs`, registered in the AI.INI patch |
| `GRW26_ES_Village.vs`, `ExecCmd("repair village ai")` | an order the mod added to the game's `VILLAGE.XML` (`src BaseVillage`, "used only by AI") that the clones do not carry | the game's command files stay the game's | `repair village ai (w26)`, a command of the port's own (`DATA/COMMANDS/W6GRVILLAGEAI.XML`) offered by the 10 village classes of the port; the script names it so |
| HD's `DRUID_REVITALIZE_GROUND.VS` (`(9, 28): No matching function with name revitalize`), run by the priest's right-click on the ground | `.HasSpecial(revitalize)` | **not the rename**: there is no special `revitalize` in HD or in the 1.40 (`UNIT_SPECIALS.INI` has 36 sections in both) and the mod's own copy of that script is HD's text; the mod fixed the sibling `DRUID_REVITALIZE.VS` (the same order on a unit: `.HasSpecial(determination) // fake skill to make revitalize work`) and the priest has Determination, but left this one | `druid_revitalize_ground_w26.vs`: the same one-word fix; its orders were `"revitalize"` and are `"revitalize (w26)"` as the class and the command now call them |

Not run in game: nothing of the above has been tried after the fix. Each of these stopped one script only (the error text says which), the rest of the port kept loading.

## Maps that `require` this mod

None known. `Greek_MapsAdventures.zip` is not ported here (#8).

## In game

**Two tests so far (maintainer, profile with only this set):**
1. 2026-11-01 20:43: it loaded, and the log had three compilation errors (`GRW26_SquadMonitor.vs` twice and HD's `DRUID_REVITALIZE_GROUND.VS`), described and fixed in *Names the scripts use*.
2. 2026-11-01 about 22:01, the build with those fixes (what `ported/` has): **it loads and plays, with no script errors in that session.** The log of the session (about 1.5 minutes) shows the set `Greek Mod 2.6.1` loaded, the AI scripts `GRW26_ESH_UpgradeBarracks` and `GRW26_ESH_BuildCarthaginianArmy` and the `SquadMonitor` opened, 0 compilation errors and 0 `E` lines. **The maintainer did not detail what he exercised**, and 1.5 minutes is not a long AI game.

**NOT tried (not told, so not claimed):** the long game against the Roman AIs, the hero of each arena, the barracks in both Greek town layouts, the 168 script copies (47 whole), the random-map city of Greece (new in this build), the priest's revitalize (both the unit and the ground variant), the icons and attack sounds, the voices, `THERMAE.SC_w26.XML`, the renamed templates, the `gbr.exe` table limits above, two civilization mods together, and the gymnasium, temple and village exits.

## Pending: independence

- `currentlang/*.bmp` menu skin with the other Greek mods: cosmetic.

## Left out because it is global

(AGENTS.md, *World rules packs*: not built in this task.) What the mod changes and no clone can carry stays out of the civilizations pack. Generated by `tools/greek-2x.js` (`raw/greek-mod-2-6-1-global.md`). The mod's `CONST.INI` also adds keys the game lacks (read only by its own scripts): those ARE shipped, as a patch that only adds keys.

What the mod changes that cannot be scoped to a clone (generated by tools/greek-2x.js; the game's value is HD's, the mod's is what port-140.js merged: HD plus the mod's edits).

### DATA/CONST.INI

35 values the game has and the mod changed (game -> mod), 20 keys the game lacks (those are added by patches/ when a script of the mod reads them).

| section | key | game | mod |
|---|---|---|---|
| GamePlay | DisciplineBonusBase | 10 | 0 |
| GamePlay | RushDamage | 6 | 5 |
| GamePlay | DiseaseHealthDecrease | 40 | 60 |
| GamePlay | StonehengeWisdomLevelLimit | 20 | 40 |
| GamePlay | SpeedPercentPerQuickMarchLevel | 5 | 3 |
| GamePlay | HealthInHolderFactor | 4 | 5 |
| GamePlay | SightPerScoutLevel | 100 | 0 |
| GamePlay | MistDamage | 25 | 45 |
| GamePlay | DisciplineBonusStep | 1 | 0 |
| GamePlay | GOutpostGoldReturn | 10 | 20 |
| GamePlay | HealAmount | 19 | 20 |
| GamePlay | LearningCost | 1 | 0 |
| GamePlay | ArrowsInvisibleDist | 100 ; draw the arrow only if distance is more than this | 10 ; draw the arrow only if distance is more than this |
| GamePlay | LoyaltyRadiusTownhall | 850 | 400 |
| GamePlay | LoyaltyRadius | 1000 | 800 |
| GamePlay | StonehengeSacrificeTimeStep | 2000 | 4000 |
| GamePlay | EgoismSkillCost | 1 | 0 |
| GamePlay | StonehengeStarvationPercentFood | 1 | 2 |
| GamePlay | StonehengeWisdomTime | 30000 | 20000 |
| GamePlay | GOutpostFoodSales | 20 | 40 |
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
| UIBars | CmdBarMaxButtons | 16 | 25 |
| RandomMap | SYMinDistSameBound | 48 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on same sea/land border | 96 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on same sea/land border |
| RandomMap | SYMinDistDiffBound | 48 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on different sea/land borders | 96 ;3072/TERRAIN_TILE_SIZE - distance between two shipyards on different sea/land borders |

### DATA/UNIT_SPECIALS.INI

3 values the game has and the mod changed (game -> mod), 0 keys the game lacks (those are added by patches/ when a script of the mod reads them).

| section | key | game | mod |
|---|---|---|---|
| Determination | descr | Increases the warrior's stamina by 1 each time an enemy hits him | The unit with this skill receives 1 point of stamina each time an enemy hits them and is also able to restore 4 stamina points to the target (does not work on heroes) |
| Determination | stamina_cost | 0 | 1 |
| Invisibility | stamina_cost | 2 | 4 |

### DATA/SKILLS.INI

9 values the game has and the mod changed (game -> mod), 0 keys the game lacks (those are added by patches/ when a script of the mod reads them).

| section | key | game | mod |
|---|---|---|---|
| Quick March | descr | Increases the speed of every attached warrior by 5% per skill point | Increases the speed of every attached warrior by 3% per skill point |
| Discipline | descr | Increases the level of every attached warrior so it is at least 2 plus the number of skill points | Attached warriors passively recover 5 health points per skill point every 10 seconds while fighting |
| Egoism | descr | Once every 5 seconds the hero steals up to 20 health points per skill point from a random warrior attached to him | Once every 5 seconds the hero steals up to 20 health points per skill point from a random warrior attached to him. Additionally, when an attached warrior kills an enemy unit, it has a chance to reduce a nearby enemy hero's experience by 1 point (by 5% per skill point) |
| Scout | rollover | Scout | Battle Knowledge |
| Scout | help_ref | Scout | Battle Knowledge |
| Scout | descr | Increases the hero's sight by 100 per skill point | Attached warriors have a 10% chance per skill point to grant 1 additional level to a nearby ally after killing an enemy unit (does not target heroes) |
| Scout | icon | gameres/InfoBar/Skills/Scout.bmp | gameres/InfoBar/Skills/BattleKnowledge.bmp |
| Epic armor | help_ref | Apic Armor | Epic Armor |
| Epic armor | descr | Increases the hero's armor by 2 per skill point | Increases the hero's armor by 2 per skill point. Additionally, when an attached warrior kills an enemy unit, it has a chance to permanently gain 1 armor point (by 2% per skill point) |

### Other files of the game the mod replaced (data tables, scripts, game modes, item scripts, random map lists)

Scripts the civilizations of the port use are not here: they are copies of their own (`_w26`). These are the files at the game's own path; the ones with Greek content became patches (step 8).

- `DATA/AI HELPERS/GUARD AREA.VS`: 50 lines of the game's changed or removed, 32 added by the mod
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
- `DATA/ITEMS.XML`: 6 lines of the game's changed or removed, 60 added by the mod
- `DATA/ITEMSCRIPTS/FINGER OF DEATH.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/ITEMSCRIPTS/GEM OF WISDOM.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/RANDOMMAP/COASTAL.RM.XML`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/RANDOMMAP/EMPTY.RM.XML`: 10 lines of the game's changed or removed, 10 added by the mod
- `DATA/RANDOMMAP/PLACEOBJECTS.XML`: 171 lines of the game's changed or removed, 179 added by the mod
- `DATA/RANDOMMAP/PLACETREES.XML`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/RANDOMMAP/TERRAINMIX.XML`: 35 lines of the game's changed or removed, 24 added by the mod
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
- `DATA/SUBAI/ANIM.VS`: 2 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/ARENA_BEHAVIOR.VS`: 0 lines of the game's changed or removed, 22 added by the mod
- `DATA/SUBAI/ARENA_HIREHERO.VS`: 0 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/ATTACK_INDEPENDENT_VERIFY.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/AXEMAN_SCHOOL.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/BARRACK_IDLE.VS`: 2 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/BARRACK_TRAIN.VS`: 0 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/BARRACK_TRAIN_EX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BASEMAGE_DO_NOTHING.VS`: 1 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BBLACKSMITH_ANIM.VS`: 6 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/BDRUID_IDLE.VS`: 3 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BDRUID_STAND_POSITION.VS`: 3 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/BUILDING_REPAIR.VS`: 2 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/BUILDING_REPAIR_VERIFY.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/BUILD_CATAPULT.VS`: 24 lines of the game's changed or removed, 21 added by the mod
- `DATA/SUBAI/BUILD_CATAPULT_VERIFY.VS`: 6 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/CATAPULT_ATTACK.VS`: 25 lines of the game's changed or removed, 35 added by the mod
- `DATA/SUBAI/CATAPULT_ATTACK_GROUND.VS`: 19 lines of the game's changed or removed, 17 added by the mod
- `DATA/SUBAI/CATAPULT_ATTACK_GROUND_VERIFY.VS`: 3 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/CATAPULT_ATTACK_VERIFY.VS`: 7 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/CATAPULT_AUTOFIRE.VS`: 35 lines of the game's changed or removed, 38 added by the mod
- `DATA/SUBAI/CATAPULT_DISBAND.VS`: 13 lines of the game's changed or removed, 24 added by the mod
- `DATA/SUBAI/CATAPULT_IDLE.VS`: 65 lines of the game's changed or removed, 48 added by the mod
- `DATA/SUBAI/CATAPULT_STOP.VS`: 4 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/CATAPULT_TOWER_GUARD.VS`: 13 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/CBLACKSMITH_ANIM.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/CMERCENARY_ONDIE.VS`: 14 lines of the game's changed or removed, 26 added by the mod
- `DATA/SUBAI/COUTPOST_BEHAVIOR.VS`: 16 lines of the game's changed or removed, 13 added by the mod
- `DATA/SUBAI/COVEROFMERCY_IDLE.VS`: 5 lines of the game's changed or removed, 5 added by the mod
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
- `DATA/SUBAI/DO_NOTHING_OBJ.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/DO_NOTHING_VOID.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/DRUID_EAGLE_SUMMONING.VS`: 3 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/DRUID_GHOUL_SUMMONING.VS`: 3 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/DRUID_HIDE_GROUND.VS`: 7 lines of the game's changed or removed, 45 added by the mod
- `DATA/SUBAI/DRUID_LEARN.VS`: 28 lines of the game's changed or removed, 31 added by the mod
- `DATA/SUBAI/DRUID_ONDIE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/DRUID_REVITALIZE.VS`: 19 lines of the game's changed or removed, 25 added by the mod
- `DATA/SUBAI/DRUID_REVITALIZE_VERIFY.VS`: 6 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/DRUID_WOLF_SUMMONING.VS`: 3 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/EAGLE_HOVER.VS`: 21 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/EAGLE_IDLE.VS`: 10 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/EAGLE_LESSER_HOVER.VS`: 21 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/EAGLE_MOVE.VS`: 66 lines of the game's changed or removed, 40 added by the mod
- `DATA/SUBAI/EBLACKSMITH_ANIM.VS`: 6 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/EBLACKSMITH_CHARMS.VS`: 24 lines of the game's changed or removed, 24 added by the mod
- `DATA/SUBAI/EBLACKSMITH_CHARMS_VERIFY.VS`: 27 lines of the game's changed or removed, 30 added by the mod
- `DATA/SUBAI/ECHARIOT_ENGAGE.VS`: 23 lines of the game's changed or removed, 26 added by the mod
- `DATA/SUBAI/EMARKET_BUYSLAVES.VS`: 2 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/ETEMPLEOFOSIRIS_ANIM.VS`: 3 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/FISH_IDLE.VS`: 19 lines of the game's changed or removed, 24 added by the mod
- `DATA/SUBAI/GATE_CLOSE.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/GATE_CLOSE_PERMANENT.VS`: 6 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/GATE_IDLE.VS`: 8 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/GATE_OPEN.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/GATE_OPEN_PERMANENT.VS`: 6 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/GDRUID_IDLE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/GDRUID_STAND_POSITION.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/GHOST_ATTACK.VS`: 7 lines of the game's changed or removed, 22 added by the mod
- `DATA/SUBAI/GHOST_IDLE.VS`: 18 lines of the game's changed or removed, 30 added by the mod
- `DATA/SUBAI/GHOST_MOVE.VS`: 6 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/GHOST_SPAWN.VS`: 5 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/GOUTPOST_SELLFOOD.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/GOUTPOST_SELLGOLD.VS`: 4 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/GROUP_UNITSOUT.VS`: 16 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/HEN_IDLE.VS`: 37 lines of the game's changed or removed, 52 added by the mod
- `DATA/SUBAI/HEROGRAVE_BEHAVIOR.VS`: 56 lines of the game's changed or removed, 64 added by the mod
- `DATA/SUBAI/HERO_CAPTURE.VS`: 82 lines of the game's changed or removed, 88 added by the mod
- `DATA/SUBAI/HERO_DIVINEGRACE.VS`: 7 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/HERO_FORMATION_VERIFY.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/HERO_PATROL.VS`: 28 lines of the game's changed or removed, 29 added by the mod
- `DATA/SUBAI/HERO_SKILL_BEHAVIOUR.VS`: 136 lines of the game's changed or removed, 148 added by the mod
- `DATA/SUBAI/HORSE_ANIM.VS`: 3 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/HORSE_ENTER.VS`: 19 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/HORSE_ENTER_VERIFY.VS`: 13 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/HORSE_IDLE.VS`: 40 lines of the game's changed or removed, 47 added by the mod
- `DATA/SUBAI/HORSE_TROT.VS`: 7 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/HUNTRESS_SCHOOL.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/HUNTRESS_VERIFY.VS`: 13 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/IBERIAN_VILLAGE_TRAINISCOUT.VS`: 1 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/IBLACKSMITH_ANIM.VS`: 6 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/IOUTPOST_BEHAVIOR.VS`: 14 lines of the game's changed or removed, 17 added by the mod
- `DATA/SUBAI/ITAVERN_CALLTOARMS.VS`: 28 lines of the game's changed or removed, 18 added by the mod
- `DATA/SUBAI/ITEMPLE_ANIM.VS`: 5 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/LION_ENGAGE.VS`: 52 lines of the game's changed or removed, 38 added by the mod
- `DATA/SUBAI/LION_IDLE.VS`: 49 lines of the game's changed or removed, 32 added by the mod
- `DATA/SUBAI/LION_LEAD.VS`: 48 lines of the game's changed or removed, 47 added by the mod
- `DATA/SUBAI/MACEMEN_SCHOOL.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/MACEMEN_VERIFY.VS`: 13 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/MAGIC_WELL_BEHAVIOR.VS`: 34 lines of the game's changed or removed, 13 added by the mod
- `DATA/SUBAI/MAHOUT_SCHOOL.VS`: 7 lines of the game's changed or removed, 5 added by the mod
- `DATA/SUBAI/MAHOUT_VERIFY.VS`: 23 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/MILITARY_ONDIE.VS`: 23 lines of the game's changed or removed, 47 added by the mod
- `DATA/SUBAI/MIST_IDLE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/OBJECT_IDLE.VS`: 5 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/OBJECT_WAIT.VS`: 2 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/ONFINISH_RESEARCH.VS`: 12 lines of the game's changed or removed, 42 added by the mod
- `DATA/SUBAI/OUTPOST_ATTACK.VS`: 16 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/OUTPOST_ATTACK_VERIFY.VS`: 16 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/OUTPOST_BEHAVIOR.VS`: 145 lines of the game's changed or removed, 198 added by the mod
- `DATA/SUBAI/OUTPOST_IDLE.VS`: 84 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/PEACEFUL_MOVE.VS`: 11 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/PLAYER_HEROES_WISDOM.VS`: 9 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/RAM_ATTACK.VS`: 58 lines of the game's changed or removed, 58 added by the mod
- `DATA/SUBAI/RAM_IDLE.VS`: 5 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/RCATAPULT_ATTACK.VS`: 6 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/RCATAPULT_ATTACK_VERIFY.VS`: 3 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/RCATAPULT_AUTOFIRE.VS`: 21 lines of the game's changed or removed, 27 added by the mod
- `DATA/SUBAI/RESEARCH.VS`: 0 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/RUIN_BEHAVIOR.VS`: 52 lines of the game's changed or removed, 45 added by the mod
- `DATA/SUBAI/SCDOC.XML`: 210 lines of the game's changed or removed, 217 added by the mod
- `DATA/SUBAI/SETTLEMENT_BEHAVIOR_AMBIENT.VS`: 188 lines of the game's changed or removed, 151 added by the mod
- `DATA/SUBAI/SHAMAN_ADVANCE.VS`: 1 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/SHAMAN_IDLE.VS`: 5 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/SHAMAN_STAND_POSITION.VS`: 3 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/SHIP_BOARD_VERIFY.VS`: 3 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/SHRINE_BEHAVIOR.VS`: 5 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/START_TARCHER_VERIFY.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/START_TRIDER_VERIFY.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/START_TWOLF_VERIFY.VS`: 2 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/STONEHENGE_BLOODLUST.VS`: 3 lines of the game's changed or removed, 24 added by the mod
- `DATA/SUBAI/STONEHENGE_BLOODLUST_DISPATCH.VS`: 4 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/STONEHENGE_BLOODLUST_VERIFY.VS`: 9 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/STONEHENGE_IDLE.VS`: 6 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/STONEHENGE_SACRIFICE.VS`: 14 lines of the game's changed or removed, 21 added by the mod
- `DATA/SUBAI/STONEHENGE_SACRIFICE_DISPATCH.VS`: 4 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/STONEHENGE_SACRIFICE_VERIFY.VS`: 9 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/STONEHENGE_SOOTHING.VS`: 15 lines of the game's changed or removed, 19 added by the mod
- `DATA/SUBAI/STONEHENGE_SOOTHING_DISPATCH.VS`: 4 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/STONEHENGE_SOOTHING_VERIFY.VS`: 9 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/STONEHENGE_STARVATION.VS`: 19 lines of the game's changed or removed, 21 added by the mod
- `DATA/SUBAI/STONEHENGE_STARVATION_DISPATCH.VS`: 4 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/STONEHENGE_STARVATION_VERIFY.VS`: 9 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER.VS`: 17 lines of the game's changed or removed, 94 added by the mod
- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER_VERIFY.VS`: 5 lines of the game's changed or removed, 15 added by the mod
- `DATA/SUBAI/STONEHENGE_WISDOM.VS`: 15 lines of the game's changed or removed, 17 added by the mod
- `DATA/SUBAI/STONEHENGE_WISDOM_DISPATCH.VS`: 4 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/STONEHENGE_WISDOM_VERIFY.VS`: 9 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/SUMMONING_BEHAVIOR.VS`: 12 lines of the game's changed or removed, 13 added by the mod
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
- `DATA/SUBAI/TOWER_ATTACK.VS`: 7 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/TOWER_ATTACK_VERIFY.VS`: 8 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/TOWER_GUARD.VS`: 23 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/TOWNHALL_ADDPOP.VS`: 2 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TOWNHALL_BEHAVIOR_GUARD.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TOWNHALL_BUILDINGSBEHAVIOR.VS`: 14 lines of the game's changed or removed, 40 added by the mod
- `DATA/SUBAI/TOWNHALL_SENTRIES_CONTROL.VS`: 23 lines of the game's changed or removed, 17 added by the mod
- `DATA/SUBAI/TRAINEX_ONADDREMOVE.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TRAIN_EX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/TTEMPLEOFNEPTUS_ANIM.VS`: 5 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/TTENT_BEHAVIOR.VS`: 158 lines of the game's changed or removed, 105 added by the mod
- `DATA/SUBAI/UNIT_ATTACH_VERIFY.VS`: 2 lines of the game's changed or removed, 19 added by the mod
- `DATA/SUBAI/UNIT_ATTACK.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/UNIT_BOARD_VERIFY.VS`: 3 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/UNIT_BUILD_CATAPULT.VS`: 10 lines of the game's changed or removed, 9 added by the mod
- `DATA/SUBAI/UNIT_CAPTURE.VS`: 2 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/UNIT_CAPTURE_VERIFY.VS`: 14 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/UNIT_ENTER_PARRY_MODE.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_ENTER_PARRY_MODE_VERIFY.VS`: 12 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_LEAVE_PARRY_MODE.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_LEAVE_PARRY_MODE_VERIFY.VS`: 4 lines of the game's changed or removed, 13 added by the mod
- `DATA/SUBAI/UNIT_ON_ENTER.VS`: 18 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_ON_KILL.VS`: 16 lines of the game's changed or removed, 62 added by the mod
- `DATA/SUBAI/UNIT_PATROL.VS`: 13 lines of the game's changed or removed, 16 added by the mod
- `DATA/SUBAI/UNIT_REVEALS.VS`: 13 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/UNIT_REVEALS_VERIFY.VS`: 6 lines of the game's changed or removed, 14 added by the mod
- `DATA/SUBAI/UNIT_TRAIN.VS`: 0 lines of the game's changed or removed, 7 added by the mod
- `DATA/SUBAI/UNIT_TRANSPORT_VERIFY.VS`: 6 lines of the game's changed or removed, 12 added by the mod
- `DATA/SUBAI/VERIFY_CMDCOST_BUILDING.VS`: 18 lines of the game's changed or removed, 10 added by the mod
- `DATA/SUBAI/VERIFY_CMDCOST_UNIT.VS`: 5 lines of the game's changed or removed, 8 added by the mod
- `DATA/SUBAI/VERIFY_RESEARCH.VS`: 3 lines of the game's changed or removed, 4 added by the mod
- `DATA/SUBAI/VERIFY_TRAINEX.VS`: 0 lines of the game's changed or removed, 2 added by the mod
- `DATA/SUBAI/VILLAGE_IDLE.VS`: 7 lines of the game's changed or removed, 3 added by the mod
- `DATA/SUBAI/VILLAGE_REPOPULATE.VS`: 15 lines of the game's changed or removed, 11 added by the mod
- `DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS`: 31 lines of the game's changed or removed, 19 added by the mod
- `DATA/SUBAI/VILLAGE_STOPTRIBUTE.VS`: 1 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/VILLAGE_TRAINPEASANT.VS`: 42 lines of the game's changed or removed, 38 added by the mod
- `DATA/SUBAI/VILLAGE_TRIBUTEFOOD.VS`: 3 lines of the game's changed or removed, 1 added by the mod
- `DATA/SUBAI/VILLAGE_TRIBUTEFOOD_VERIFY.VS`: 8 lines of the game's changed or removed, 6 added by the mod
- `DATA/SUBAI/WAGON_UNLOAD.VS`: 17 lines of the game's changed or removed, 24 added by the mod
- `DATA/SUBAI/WOLF_ENGAGE.VS`: 49 lines of the game's changed or removed, 38 added by the mod
- `DATA/SUBAI/WOLF_IDLE.VS`: 38 lines of the game's changed or removed, 26 added by the mod
- `DATA/SUBAI/WOLF_LEAD.VS`: 63 lines of the game's changed or removed, 41 added by the mod
- `DATA/TERRAINS.XML`: 131 lines of the game's changed or removed, 58 added by the mod
- `DATA/VXNOTIFICATIONS.XML`: 0 lines of the game's changed or removed, 11 added by the mod

### The game's classes the mod changed that no civilization of the port took

Neutral objects and classes of no clone (their changed attributes are in the mod's classes under work/: not ported).

- BearUnit
- Catapult
- Chest
- DLleldoryn (race Gaul)
- HeroGrave
- Horse
- ImperialRomanHero (race RepublicanRome)
- LionF
- LionFUnit
- LionM
- LionMUnit
- LionThrone
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
- Outpost
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
- WolfUnit
