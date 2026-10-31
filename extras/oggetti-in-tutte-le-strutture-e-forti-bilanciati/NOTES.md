# Items in every structure and balanced forts 1.0 (Secuter)

Row 311, `MOD oggetti e forti.zip` in `originals/forum/oggetti-in-tutte-le-strutture-e-forti-bilanciati-2017/files/` (Google Drive). Loose files over 1.40 (18 classes, `ITEMS.XML`, 4 item scripts, `OUTPOST_BEHAVIOR.VS`). No installer, no `.exe`, no `.dll`: nothing the mod did through code is lost. Permission: not asked yet (see `docs/MODS.md`). No license in the download.

**This is a world rules pack, not a civilization mod** (AGENTS.md, *World rules packs*; maintainer's decision, 2026-10-30): no clones, no `civs/` folder, no set of civilizations. The pack id stays the original one. While it is on, it **changes the game's own classes, values and one script for every player in the match**, and its description says so in the three languages. It ships patches (`patches/`) and files with names of its own; nothing is at a path the game uses.

It is `oggetti-in-tutte-le-strutture` (`o`, see its `NOTES.md`: the respawn items on the neutral objects, the 4 items and their scripts, the capacities of `BaseVillage` / `Outpost` / `Wagon`) **plus the forts**. Its items and scripts are `q...` (`qGold1000`, `Q_DEPOSIT_GOLD.VS`...).

## The forts

The seven neutral outposts (`GOutpost`, `ROutpost`, `COutpost`, `IOutpost`, `BOutpost`, `EOutpost`, `TOutpost`) get, by `<set select="/class/properties[@range]" .../>` on the game's class (`patches/DATA/CLASSES/<CLASS>.SC.XML`):

| Fort | In the game (HD) | In the mod |
|---|---|---|
| `GOutpost` | 4 `GTridentWarrior` (2 out, levels 12-24); food 500, gold 1000 | 12 `GAxeman` (8 out, 8-24) + 6 `GWomanWarrior` (3 out, 8-24); food 1000, gold 1000 |
| `ROutpost` | 20 `RLiberatus` (8 out, 4-12); gold 1000 | 4 `RTribune` (2 out, 8-24) + 12 `RVelit` (4 out, 8-24); gold 2000 |
| `COutpost` | 24 `CMacemen` (12 out, level 1); food 2000 | 10 `CLibyanFootman` (6 out, 4-24) + 16 `CJavelinThrower` (4 out, 4-24); food 2000 |
| `IOutpost` | 12 `ISlinger` (4 out, 8-20) + 10 `IDefender` (10 out, level 8); gold 1000 | 8 `ISlinger` (4 out, 8-24) + 10 `IDefender` (6 out, 8-24); food 1000, gold 1000 |
| `BOutpost` | 10 `BHighlander` (6 out, 1-12); food 2000 | 8 `BBronzeSpearman` (4 out, 8-24) + 8 `BJavelineer` (3 out, 8-24); food 1000, gold 1000 |
| `EOutpost` | no garrison; food 500, gold 500 | 14 `EArcher` (4 out, 8-24) + 6 `EAxetrower` (2 out, 8-24); gold 2000 |
| `TOutpost` | 10 `TValkyria` (10 out, 8-24); gold 1000 | 6 `TValkyria` (3 out, 8-24) + 12 `TArcher` (6 out, 8-24); food 1000, gold 1000 |

(The keys are the game's own: `defender_cls_*`, `defenders_max_*`, `defenders_out_*`, `start_level_*`, `end_level_*`, `settlement_food/gold`; the exact values are in the patches.) Two more defender classes per race, 3 and 4 (the table in the script: Gaul archers 16, Republican Rome principes 6, Carthage Berber assassins 6 and macemen 6, Iberia archers 12, Britain bowmen 8 and shield bearers 8, Egypt Horus warriors 4 and Anubis warriors 4, Germany axemen 6), are not class keys: the mod's script reads them from arrays indexed by the building's race.

`TOutpost` and `GOutpost` in the mod lost HD's `goutpost_sellgold` method in the merge (`raw/port-140/oggetti-in-tutte-le-strutture-e-forti-bilanciati.md`, the commit message of the first port says it was put back by hand): not an issue now, **only `<properties>` are patched**, so every `<method>` and `<behavior>` stays the game's.

## `OUTPOST_BEHAVIOR.VS`: patched in place, not copied (read in the engine export)

The first plan was a copy `OUTPOST_BEHAVIOR_Q.VS` that the seven fort classes point to. Does a `<behavior>` of a child class replace the inherited `outpost_behavior.vs` or run next to it? **It runs next to it.** `CVXScriptClass::ResolveMethods` (`imperivm-iii-research/export/decomp/005a/005a5fd0.c`, address `005a5fd0`):

```c
/* [P21.tsv] recursive (flag +0x218): inherits the behaviors (max 8) from the parent ... */
...
uVar1 = *(uint *)(param_1 + 0x1ec);          // the child's own behavior count
if (7 < uVar1) break;
*(uint *)(param_1 + 0x1ec) = uVar1 + 1;
std::string::assign_str_pos_n(uVar1*0x1c + 0x10c + param_1, parent + 0x10c + i*0x1c, ...);   // the parent's i-th behavior goes after the child's
...
"class can't inherit behavior from parent. Too many behavior scripts"
```

and `CVXScriptObj::Start` (`005a/005aec40.c`) starts every entry of the list in order (`for (i = 0; i < count; i++) StartScriptByName(...)`). So a child's behavior and its parent's both run (at most 8; the same is why `BOutpost`, `COutpost` and `IOutpost` list their own behavior scripts next to the inherited `outpost_behavior.vs`). A copy would put a second garrison script on every fort, and both would place defenders. The mod's script is therefore applied **to the game's script in place**, as `@replace` / `@before` / `@after` directives (`patches/DATA/SUBAI/OUTPOST_BEHAVIOR.VS`; the directive set is in `sdk/patches.md`, *Script patches*, and the matching code in `src/mods/patchxml.cpp`, `PatchScriptText`). It changes the garrison script for every outpost that runs it, for everybody, while the pack is on.

- **How it is generated and checked**: `tools/oggetti-in-tutte-le-strutture.js` diffs HD's script against the mod's (the HD one plus the mod's edit through `port-140.js`, `git merge-file`) and writes 25 directives from the bottom up (an anchor is a line whose text no earlier line of the game's script holds). It then applies them with a copy of the engine's algorithm and requires the mod's script as the result (blank lines aside). If the game's script changes, the build stops.
- **One insertion moved**: two `ClearDead` calls (`olDefendersOut3/4`) the mod puts before `olAll1.ClearDead();` go before the next line only this place has (the `if (!qEnemies...` line), two statements lower: they act on lists nothing between them touches. The build compares that script as the same lines, not in the same order, and says so.
- **One change of mine**: the mod indexes its arrays with `.race`. A building of a civilization of another mod has a race of 10 or more (the game's are 0-7). `nRaceIdx` clamps that index to 4 (Imperial Rome, whose entries are empty) before the arrays are read; otherwise it would read outside them. The original had no such guard. Not tried in game (it only matters for an outpost of another mod's civilization that starts independent).
- The patch is ASCII plus one Italian comment (`unità`); it is saved as UTF-8 (the validator refuses Latin-1).

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/oggetti-in-tutte-le-strutture.js [id ...]
```

See `extras/oggetti-in-tutte-le-strutture/NOTES.md` (same tool, both packs). It replaces `ported/<id>/` (the first port, 19 files at the game's paths, is gone). Built twice: the same `md5sum` of every file.

## Overlap: `q` and `o` cannot be used together

`oggetti-in-tutte-le-strutture` (`o`) patches the same 11 classes with the same values and the same holders get a second `respawn_item` under another item id; with both on, the order decides which one a holder gives. **Use only one**; no `incompatibleWith` (AGENTS.md). `ported/secuter-fun-mod` and `ported/secuter-fun-mod-grecia` (row 312, not this task) ship the same author's edits as whole files at the game's paths, and `secuter-fun-mod` even ships its own `OUTPOST_BEHAVIOR.VS`: the patches of this pack would apply on top of those files, and the anchors of the script directives were chosen for the game's script, not for that one. Do not combine them.

## imperivm-resurrected#15

**It does not touch this pack.** `OUTPOST_BEHAVIOR.VS` is a class behavior (started by the engine when the building is created, never with `AIRun`), it loops with `Sleep` as the game's does, and the item scripts are item scripts.

## Independence check

`node tools/shared-paths.js oggetti-in-tutte-le-strutture-e-forti-bilanciati`: **no collisions**.

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`): **OK, 25 files checked, no problems**. The validator does not check the code of a script patch (`sdk/patches.md`); the game loaded it without a compilation error (see *In game*).

## In game

**Tried** (maintainer, 2026-10-30, Linux/Wine, `dev-villoh` DLL, log read by him): the new build installed and loaded in one skirmish on a random map (two matches of about 8 seconds each).

- **20 of 20 patches applied**: `basevillage`, `basewell`, `chest`, `facepillar`, `lionthrone`, `obelisk1`, `obelisk2`, `outpost`, `ribcage`, `sculltree`, `wagon`, the 7 `*outpost` classes, `data/items.xml` and `data/subai/outpost_behavior.vs`.
- **0 compilation errors**, no anchor failures (so the 25 directives of the script patch found their lines and the patched script compiled).

**Not verified in game** (the two short matches do not show it):

- the forts' defenders (the new garrisons, coming out when an enemy is in range, the levels climbing);
- the item respawn on the neutral objects;
- the 100000 capacity of villages and outposts, and the wagon load of 5000;
- the race clamp (`nRaceIdx`);
- the three new items.

**Not tried:**

1. The game's other outposts (the Gaul guard post, a captured fort) behave as before.
2. Not with `o` active (it cannot be used together).

## Pending

- The patched garrison script compiled in the game, but its behaviour (defenders, levels, the race clamp) has not been seen.
- Maps that `require` this pack: none (`docs/MODS.md` has no `requires` on it); row 312 lists it only as an incompatibility.
