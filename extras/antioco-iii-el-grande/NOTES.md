# Antíoco III el Grande (row 215, `antioco-iii-el-grande`)

Falcata, forum t1326. Downloads: `imperium_mod.zip` (365 MB, the unit/decor mod), `ANTIOCO3_p1.BFHP` and `ANTIOCO3_p2.BFHP` (the adventures),
`NemesisBmpToMmp_fixed.zip` (a Windows `.exe`, not ported). Author's answer: none yet. License: not stated.

## What it is

**It adds no civilization** (the issue's "Seleucid civilization" is not in the data): no `civs/`, no new race, no buildings or orders that make a
faction. The Seleucid army is placed by the maps with the Greek Mod's classes (`HHoplite`, `HHypaspista`, `HHero3`…), the player is `Carthage` or
`Random`. So #37 (prefixes, indices) and #38 (sets in a room) do not apply: there is nothing to derive a prefix for, and no set shows in a room.
`tools/lib/clone-civs.js` was not needed and is not changed.

What it ships: 413 classes (378 decor: `ADORNO*`, `E*`, `OBJETO*`, `BODY*`, `WEAPON*`, statues; a few units `ARGIRASPIDES`, `HOPLITA2`, `HHoplite3`,
`CCATAFRACTA2`, `Cjinete1-8`, `KAresGuard_A/C`, `CMERCENARIO`; the hero `RHERO_N1` Antioco III), 226 items with their 187 item scripts, icons, the
editor's icon lists, and the two adventures (`Adventures/`: "Antioco III El Grande", 3 maps, and "Egipto en armas – 58 a.C.", 1 map; the second one
is Haemimont's adventure with Greek Mod units, author kept as Haemimont Games in its `game.xml`, credited in `mod.json`).

## How it is built

```bash
GAME="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD"
bsdtar -xf originals/forum/t1326/files/imperium_mod.zip -C <tmp>      # -> <tmp>/imperium_mod
node tools/port-140.js <tmp>/imperium_mod ported/antioco-iii-el-grande --id antioco-iii-el-grande --name "Antíoco III el Grande" --version 1.0 --category Adventures
node tools/antioco-iii.js            # needs originals/forum/t1326 (the adventures), ported/greek-mod-1-8 and originals/greek-mod-1.8-flat (see extras/greek-mod-1-8/NOTES.md, Rebuild)
                                     # and the other ports in ported/ (what it renames); the output folder of port-140 has to be empty
```

`shrink-mod.js` was tried first (row 215 says *reduce*) and dropped: it keeps the sprites in `rle.mmp.tail`, and only one active pack can have one
(the Greek Mod 4.2 has it). `port-140.js` makes standalone `.rle` sprites, so the mod combines. Hence *rewrite*, with the porter credited.
Hand fix in `extras/`: `BUILDINGS/IRONMINE/IRONMINE.ENT.XML` (10 `<state>`, the engine allows 8: the two last ones, all identical, are removed) and
`patches/DATA/COMMANDS/OUTPOST_COMMERCIAL.XML` (his trade post sells food: the order was in his `village.xml`).

What `tools/antioco-iii.js` does, and what it leaves out on purpose:

- The zip is a copy of the Greek Mod 1.8 with Falcata's work on top. Left out: the menu skin (`Currentlang`), 869 `.rle.bmp` (the sources of the sprites,
  already `.rle`), `Thumbs.db`, and 175 files that a Greek Mod port has too (hero icons, the `Voice*H*` sounds, editor icons): his copies are older.
- Files at the game's paths: `items.xml` and the two editor lists become patches with only his items (226) and icons; the 5 items the Greek Mods also
  define (Testudo, Emblem of Democracy/Oligarchy, Charm of Athena/Aegle) stay theirs. Left out: what he changed in the game's items (Rye spikes
  1000 → 200 uses, damage and bonus numbers of three items), `voicerliberatus.xml`, `village.xml` (Greek fisherman and peasants commands), 12 icons that
  redraw the game's (Augustus, Cleopatra, Vercingetorix, Viriato, `rarcher`…) and `winlosef.bmp`.
- Item scripts and victory scripts got the signature line HD needs (`port-140.js`).
- `race=` of his units is `ImperialRome`/`Carthage`/… as he wrote it: they are classes the maps place, not a civilization.

## Independence check (AGENTS.md)

`node tools/shared-paths.js antioco-iii-el-grande`: **no collisions** with the game, `cgwar`, `greek-mod-1-8`, `greek-civilization-mod`, the MCI, Imperivm
Legacy, the Secuter mods or any other port. Also checked by class id against the Caesar Mod and the Community Mod (`originals/mods/`): none (apart from the one renamed below).
Found and renamed (suffix `_ant`, in the classes, folders, commands and in the maps' `map.obj.xml`):

| Was | Shared with | Now |
|---|---|---|
| `KOutpost`, `Free_House01`, `Free_House03`, `Free_Village`, `KAresGuard_A`, `KAresGuard_C` | CGWAR (other bytes) | `<id>_ant`; folders `BUILDINGS/KOUTPOST_ant`… `UNITS/KARESGUARD_ant` |
| `CMERCENARIO` | MCI (class) and the 4.2 (unit folder) | `CMERCENARIO_ant`, `UNITS/CMERCENARIO_ant` |
| `IronMine` | MCI (another file name, so `tagCollisions` does not see it) | `IronMine_ant` |
| `GTridentWarrior2` | Community Mod | `GTridentWarrior2_ant` |
| `RLiberatus2`, `BVikingLord2` | `altid` of the game's `RLiberatus`/`BVikingLord` (copied) | `altid` removed |

The maps place some of those (`KOutpost`, `Free_House0x`, `Free_Village`, `GTridentWarrior2`): rewritten in place in the `.BFHP` (same length, the
attributes' indentation squeezed and trailing spaces for room).

## What it needs: the Greek Mod 1.8 and its terrains (`requires: greek-mod-1-8, greek-mod-terrains`)

Falcata's post (t1326, 4 Feb 2021): "Para poder jugarlo deben tener instalado el GreekMod", credits "GreekMod (RattlesMake Team)". So it was made for
Rattlesmake's Greek Mod 1.8 (the AsvrMod's item scripts, Camarada's units and Gurkhan's icons are in it too). The adventures need 22 classes that are not
his (`HHoplite`, `HHero1-3`, `HPriest`, `Hhouse1-3`, `HBarracks`, `HTownhall`…, `Poseidon`, `Thermae`); the 1.8 port has all of them, but its Greece is
`Q`, not `H` (`tools/greek-1-8.js`: `HHoplite` → `QHoplite`, `Units/HHERO3` → `Units/QHERO3`, one letter for another). So his references follow the
1.8's names: `tools/antioco-iii.js` changes a name `H…` to `Q…` where the 1.8 has the Q one and he does not ship the H one (`HHoplite3`, `HPriest2`, the
hero icons `HHero10`… are his), in his classes, item scripts, patches and in the maps (`class=`, and the Sequences). The 4 classes that
reuse a Greek entity (`CCATAFRACTA2`, `Cjinete1`, `Cjinete2`, `HPriest2`) now point to `Units/QHero1-3` and `Units/QPriest` of the 1.8: the `validate-mod.js` of
`dev-villoh` before imperivm-resurrected#43 only looked in the game and in this mod, and reported them (4 errors). Since #43 it reads `requires`: with the
1.8 and the terrains next to the mod (or `--mods`), **0 errors, 30 warnings** (the animation rows and footprints of his own sprites). Checked by script: every class the maps place, every entity and every icon
his classes name is in this mod, in the game or in the 1.8.
The 1.8's `Q` classes are the 1.8's own (its base-class edits, `race` `greek18`), not the `H` ones of 2021: the stats of the Greek units in his maps are
the 1.8's here. Not compared one by one. A map does not choose a civilization for them: the players of his maps are `Carthage`, `Gaul`, `Britain`… or `Random`.
The other Greek mods are not needed: the 4.2 and the Caesar Mod have `H*`, which his maps no longer place.

What else the maps needed, found by trying them in the game (each one was a crash or a silent return to the menu):

- **Terrains.** The four maps are painted with layers 41-54 (the Greek Mod's). HD stops at 40 and crashes drawing them (`gbr.exe+22094c`, a tiled blit
  with a null texture, at the first frame). The 1.8 port has the `.vq` files but not the layers: `greek-mod-terrains` adds them (identical bytes), as
  `wrap-map.js` does for any map with layers above 40.
- **`GreekHero`.** His three heroes (`RHERO_N1-3`) hang from it; the 1.8 port calls it `QGreekHero`. With no parent the game drops to the menu on Start, with
  nothing in the log.
- **Hero versions of the game's units** (`HeroCNoble`, `HeroESwordsman`, `HeroRTribune`, `HeroRScout`, `HeroRChariot`): the 1.8 defined them, its port does not
  carry them. Copied from the 1.8's files as `<id>_ant`; the maps place those.
- **Icons the maps name** (`Icon="gameres/icons/hhero7.bmp"`): `hhero2-9` are `qhero2-9` in the 1.8; nine more are his own and the 4.2 has them with other
  bytes (`chero9`, `chero11`, `nhero10-12`, `nhero15`, `mhero8`, `mhero9`, `rhero10`) plus `caesar2`: `<name>_ant.bmp`.
- **`classoffirstbuilding=`** in the maps' settlements also names a class (`KOutpost`, `Free_Village`): renamed with the classes.

## Tried in game

Tried by the maintainer (Linux/Wine, profile with `greek-mod-1-8`, `greek-mod-terrains` and this mod): both adventures now start and play. Only that:
not looked at one by one the units' sprites, the items and their scripts and the trade post's order, and nothing past the first minutes. Not tried: a room
(no civilization: no set to filter) and the game with the CGWAR, the 4.2 and the MCI active together with this one.
(Validation: `validate-mod.js` of `dev-villoh` with imperivm-resurrected#43, 0 errors.) Not tried either: the sprites of the units (the `.rle` come from his `rle.mmp`).

## What the original did that this port cannot carry

- `NemesisBmpToMmp_fixed.exe` is the tool he made the sprites with: not needed (they are `.rle` here), not shipped.
- It was installed over a Greek Mod 1.8 game: the old versions of that mod's icons, sounds and menu are not here (the 1.8 port has its own).
- The sequence script `seq0.vs` inside `ANTIOCO3_p1` (chat commands `nobles`, `hoplitas`, `homero`… spawn groups for testing) is part of the map and stays.

## Pending: independence

None of its own. It depends (`requires`) on the Greek Mod 1.8, the mod it was made for; it shares no id or path with any other port. Its Greek
units are the 1.8's `Q*`: with the 1.8 not active the adventures do not load (as for any map that requires a mod).
