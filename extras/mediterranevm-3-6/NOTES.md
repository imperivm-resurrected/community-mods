# Mediterranevm 3.6 (MediterranevmTeam)

Row 386. Three RARs (`MediterranevmMod_3.6_ENG.rar`, `_ES.1.rar`, `_ITA.rar`, ModDB, `originals/moddb/mediterranevm-mod-3-6/files/`): each is a full game install (`Packs/*.pak`, loose files over them, the mod's own `rle.mmp` of 420 MB, `local/<language>.pak`), no `.exe`/`.dll`. The `Packs/*.pak` of the ENG one are HD's (flattened and compared: 14531 files, 0 changed, 0 new). The data is the same in the three; only `Currentlang` (voices, texts, menu pictures) differs.

**Tried in game once, very briefly (see *In game*, below); almost nothing is tried.** The maintainer installs and tests. Permission (row 386): `?`, nothing is published.

**This port is the mod's changes to the game's eight civilizations as eight civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*), plus the mod's neutral map objects. The 3.6 has no Greece and no branch scripts, so there are eight clones, like the alpha (row 200).

| `id` | Prefix (derived) | Base | Lobby name |
|---|---|---|---|
| `ggaul` | `Gga` | Gaul | Gaul (Med 3.6) |
| `grome` | `Gro` | RepublicanRome | Rep. Rome (Med 3.6) |
| `gimperial` | `Gim` | ImperialRome | Imp. Rome (Med 3.6) |
| `gcarthage` | `Gca` | Carthage | Carthage (Med 3.6) |
| `gbritain` | `Gbr` | Britain | Britain (Med 3.6) |
| `giberia` | `Gib` | Iberia | Iberia (Med 3.6) |
| `gegypt` | `Geg` | Egypt | Egypt (Med 3.6) |
| `ggermany` | `Gge` | Germany | Germany (Med 3.6) |

The set is `Mediterranevm 3.6` (17 characters); the longest lobby name is `Rep. Rome (Med 3.6)` (19). The prefixes are derived from the ids (first three characters, all distinct; engine rule in `sdk/prefixes.md`: prefix + uppercase letter, compared case-insensitively), no `index`. Token `g`. Not in `docs/CIVILIZATIONS.md` or `sdk/prefixes.md` (checked, case-insensitive; of 8977 class ids scanned none starts with a prefix + uppercase letter).

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/mediterranevm-3-6.js
```

It unpacks the three RARs in a temporary folder (nothing under `originals/`; `bsdtar`), drops `Packs/`, `local/` and `Settings.ini`, runs the SDK's `shrink-mod.js` on the ENG data against `$G` (what is identical to the game stays out: 536 files), and makes the clones with `tools/lib/clone-civs.js`, the scripts with `tools/lib/own-scripts.js` and `own-ai.js`, and the checks of `tools/lib/greek-2x-refs.js`, `greek-2x-names.js` and `greek-2x-checks.js` (references, names and scripts stop the build). The texts of `loc/spanish.loc.xml` and `loc/italian.loc.xml` come from the ES and ITA archives' `GAME.LOC.XML` (only the entries that are new or for the clones). Names that another port (or the game's adventures) has with other bytes are renamed `_g36` by `tagCollisions`, after comparing with the ports of the worktree **and Imperivm Legacy**, looked up in the main checkout (the build stops without it; `GREEK2X_NO_LEGACY=1` builds without). The same result twice, and from a clean worktree under `.wt/` (checked: same hash).

## What is a civilization's, what is not

- **A civilization's** (the eight): the mod's version of each game class of the civilization (stats, commands, costs, specials), cloned from HD. 166 classes and 30 command files of the mod are kept; 109 of the game's classes changed; the 125 classes of the game's own that the mod only carries are left out.
- **Neutral** (nobody's, shipped as they are, renamed `_g36` because Imperivm Legacy, the alpha or the 2.x line have the same ids or paths): the Numidian tent `CTent` and the mercenaries it hires (`CHorseman`, `CMercenaryTuareg`), the Greek garrison `HOutpost`, `HHoplite`, `Fisherman`, `Snake`, plus `BlackWolf*`, `RThermae`, `Ruins2` and the Desert oracle.
- **Voices are the clones' own** (79 entities of their own, 79 folders copied as `<folder>_g36`: 367 files). Spanish and Italian: only the files that are not the game's own go to `local/<language>/voices` (20 and 25). The 83 voice folders at the root of the ENG archive's `local/spanish.pak` are **HD's own Spanish voices** (388 of 388 files byte-identical to HD's `spanish` voices and to the ES archive's pak), not the mod's: they are not ported.
- **Texts**: 278 texts in each of `spanish` and `italian`; the texts that change the game's own are left out (25 and 35).

## Graphics: `rle.mmp.tail`

The mod's own `rle.mmp` is 419.8 MB. `shrink-mod.js` keeps only the sprites that are new or different from the game's `rle.mmp`: **`rle.mmp.tail`, 30,164,723 bytes (28.8 MB)**, appended after the game's, with the fingerprint of the game's `rle.mmp` it was made for (`sdk/reference.md`, `publishing.md`). The `.rle.MMP` files of the mod are small cells that store a byte offset into that combined file; **renaming an entity folder (`tagCollisions`) does not change them**: checked, 66 cells of the six renamed folders (`CHorseman`, `HHoplite`, `Fisherman`, `HOutpost`, `Numidian_Tent`, `CMercenaryTuareg`) are byte-identical to `shrink-mod.js`'s output before the rename. Not tried in game (the sprites, the offsets).

**Only one active pack can have a graphics tail** (`sdk/reference.md`). With this one it makes the port incompatible with the packs that have one: **Greek Civilization Mod 4.2, Mediterranevm (alpha), Imperivm Legacy and Caesar Mod 1.1.0** (`shared-paths.js` reports `rle.mmp.tail` as the one shared path with each). No `incompatibleWith` is declared, as the alpha does not either: the engine reports it. *Pending: independence*: this, until the engine merges tails.

## Left out because it is global (for a rules pack, later)

- `DATA/CONST.INI`: 3 keys the game lacks are added by a patch (including `DoubleHealAmount`); 12 values of the game's own keys are left out (`raw/mediterranevm-3-6-const-ini.txt`): `DiseaseCost` 3→10, `StonehengeBloodlustTime` 60000→30000, `LoyaltyRadiusTownhall` 850→100, `LoyaltyRadius` 1000→300, and eight `PlayerColors`.
- `DATA/ITEMS.XML`: 2 elements patched in; the two the mod edits in the game's items (`herb amulet of luck`, `gem of wisdom`) are left out; `DATA/ITEMSCRIPTS/` (`GEM OF WISDOM.VS`, `BATTLE DRUMS OF RAGE.VS`) are left out.
- `DATA/RANDOMMAP/PLACEOBJECTS.XML`: the mod places `HOutpost` and `CTent` in every random map. Not ported. The other random-map templates, `UNIT_SPECIALS.INI`, `terrains.xml`, `vxnotifications.xml`, `RANDOM_MAP.OBJ.XML`, three game scripts, `RandomMapSettlements.bfhp` and the 18 interface `.ini` of the menu skin are not ported either.
- The terrain textures (`TERRAIN/`, `MINIMAP/ZOOM*/TERRAIN/`; they go with `terrains.xml`; the mini-map ones replace the game's `grass3.bmp` and others at the game's paths) and the menu pictures (`Currentlang/*.bmp`, which the 4.2, the 1.8, the 2.x and the alpha ship their own).
- The game's texts the mod changes (above) and the game's neutral objects the mod edits in place (`Shrine`'s icon, `Stonehenge`'s orders).
- The whole list: `raw/mediterranevm-3-6-left-out.txt` (200 files), `raw/mediterranevm-3-6-const-ini.txt`.

## AI

The mod's 28 AI scripts at the game's own paths (`ES_STRONGHOLD`, `ESH_*`, `TS_*TACTIC`, `GETGAIKASTRAT`, `GETTACTICSCRIPT`, `EVALRECRUIT`, `SQUADMONITOR`, `AI.INI`...) are **not ported**: the engine calls them by name and a clone cannot own them (`raw/mediterranevm-3-6-ai-left-out.txt`). The clones play with the game's AI. The mod's `DATA/AI/_TEUTON/` (19 files, a second AI) is kept as `_TEUTON_g36`.

- **How the engine picks an AI folder** (from the decompiled `gbr.exe`, `imperivm-iii-research`; the engine's own `src/` was not read): `RegisterAIProfile` @00443190 adds the name in UPPERCASE to `g_aiProfileNames` and loads `data/ai/[name/]ai.ini`; `ScanAIProfiles` @004433b0 lists the default profile plus **one profile per subfolder of `data/ai`**; `LoadAllAIScripts` @0043eb90 loads the scripts of the base folder and of each profile folder. The lobby has an "AI profile" combo. So `_TEUTON_g36` should be listed there as a profile. Not seen in game.
- **GS_\* strategies**: the mod has no `GS_*` script of its own: its five (`GS_CAPTURE`, `GS_ENTERSETTLEMENT`, `GS_GUARD`, `GS_KILLENEMIES`, `GS_SIEGE`) are the game's names with other contents, in the base folder (not ported) and in `_TEUTON` (ported as `_TEUTON_g36/`). Of all the `GS_` names its AI scripts call, the only one that is not a script of the game is `GS_NONE`, which the game defines as a constant (`GS_NONE = 0`). So nothing that only the mod defines is called: the 2.6.1's case (a mod-only strategy or constant, `GS_EnterSettlement`) does not repeat here. Names check: 206 scripts read, 0 problems. Before the AI scripts were left out, `ESH_ENABLEDUNITS` failed on `AIV_MaxRAstatus`, `AIV_MaxRCretanArcher` and others (constants of the mod's `AI.INI`), which is why they stay out.

## Building exit points

Checked against each `.PASS` for the 17 changed or new buildings: all reach outside the building except:

- **`HOutpost`, second point `(100,130)`**: on a blocked cell (the same garrison post as the 2.x line). Blocked cell, untested in game, **unchanged**.
- **`RHouse02`**: the mod moved the point from the game's; the check finds its cell free, but it is listed with the other as asked: untested in game, **unchanged** (this port moves neither).

Barracks and town halls are untouched by the mod.

## Fixes

- `RThermae`: the class named the entity under `Buildings/Thermae/`; the mod ships `Buildings/RThermae/` (its own typo): the path is put on the folder it ships.
- `gameres/icons/upgrades/sacredhealing.bmp` is named by the mod's Sacred Healing research and is in none of the three archives (the original did not resolve either): allowed in the reference check, as the mod's own bug.
- 39 picture references and 6 sound or voice folders that `tagCollisions` renamed are put back to the name the mod's text had (or follow it).

## Overlap with other ports (`node tools/shared-paths.js mediterranevm-3-6`)

0 class ids and 0 entity folders in common with the game and with `cgwar`, `greek-mod-1-8`, `greek-civilization-mod`, `greek-mod-2-3`, `-2-5-3`, `-2-6-1`, `mediterranevm-alpha`, `imperivm-legacy`. The only path shared with other bytes is `rle.mmp.tail` (above). Not compared here: the ports of the other open pull requests are not built in this branch (they were looked at read-only from their worktrees: see the pull request).

## In game

Maintainer, 2026-11-01 23:16-23:18, the build of PR #51 head `71c164be`, profile with only this set. From his report and `imperivm-mod.log`:

- The set **loaded** (`Mediterranevm 3.6 3.6, 1875 files`) and the **eight civilizations registered** (`gbritain` … `grome`, indexes 10-17). The main menu is the game's own: no menu skin is shipped, as designed.
- He started a **skirmish with random civilizations** (slots with 3.6 civilizations: 15, 12, 17, 14); it ran about **13 seconds on screen**. The session ended cleanly (130 s): **0 errors, 0 compilation errors**; the 6 warnings are a `winmm` export note and room slots whose saved civilization no longer exists. His words: "no hubo mayor problema".
- That is: **it loads, starts a match, and shows no script errors in that very short session.** Nothing more.

## Not tried

The test above does **not** show: a long game; the AI playing the 3.6 civilizations for minutes (the log opened only 2 `data/ai` patch lines); heroes; the voices in the three languages; icons; the sprites through the `rle.mmp.tail` (offsets); the new units and orders (`RThermae`, `RAstatus`, `RTriarius`); the `_TEUTON_g36` profile in the lobby; the units and orders the clones changed; two civilization mods active together.
