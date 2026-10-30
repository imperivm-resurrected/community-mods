# Items in every structure 1.0 (Secuter), objects only

Row 310's family; the download is `MOD solo oggetti.zip` in `originals/forum/oggetti-in-tutte-le-strutture-e-forti-bilanciati-2017/files/` (the forum topic of row 311, Google Drive). Loose files over 1.40 (11 classes, `ITEMS.XML`, 4 item scripts). No installer, no `.exe`, no `.dll`: nothing the mod did through code is lost. Permission: not asked yet (see `docs/MODS.md`). No license in the download.

**This is a world rules pack, not a civilization mod** (AGENTS.md, *World rules packs*; maintainer's decision, 2026-10-30). The whole mod is global: it only changes the game's own neutral objects and the capacity of base classes every civilization inherits, so there are **no clones, no `civs/` folder and no set of civilizations**. The pack id stays the original one. While it is on, it **changes the game's own classes and values for every player in the match**, and its description says so in the three languages. It only ships patches (`patches/`) and files with names of its own; nothing is at a path the game uses.

## What the mod changed, and what the pack does

| Class | Game (HD) | Mod |
|---|---|---|
| `Chest` | no item | respawns `oGold1000` (1000 gold, deposited when its bearer enters a settlement) every 10 min |
| `BaseWell` | no item | respawns `Healing water` every 5 min |
| `FacePillar`, `LionThrone`, `ScullTree` | no item | `Herb amulet of luck` 15 min, `Belt of snakes` 20 min, `--Feather amulet--` 15 min |
| `Obelisk1`, `Obelisk2`, `RibCage` | no item | `oGemma dell'energia` 20 min, `oGemma della furia` 20 min, `oTeschio dell'eroe` 10 min |
| `BaseVillage` | `settlement_maxfood/gold` 5000 | 100000 (**every civilization's village, the game's too**) |
| `Outpost` | 10000 | 100000 (every neutral and captured outpost) |
| `Wagon` | `max_load` 1000 | 5000 (every wagon) |

- **New items** (`patches/DATA/ITEMS.XML`, an `<add>`): the mod's four, renamed `oGold1000`, `oTeschio dell'eroe`, `oGemma dell'energia`, `oGemma della furia`, with their scripts renamed `o_deposit_gold.vs`, `o_energy_gem.vs`, `o_attack_gem.vs`, `o_attack_gem_remove.vs` (`DATA/ITEMSCRIPTS/O_*.VS`). The `o` prefix is this pack's: the other pack (`q`) has `q...`, so the two never share an item or a script name.
- **Classes**: `patches/DATA/CLASSES/<CLASS>.SC.XML`, one patch per class: `<add select="/class"><properties respawn_item=... respawn_time=.../></add>` for the item holders and `<set select="/class/properties[@...]" .../>` for the capacities. The game's classes are not replaced. Only `<properties>` are patched: every other element of the mod's classes is HD's (the tool reports it if not).
- The mod's own `GOutpost`... are **not** in this pack (that is the other one's).

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/oggetti-in-tutte-le-strutture.js [id ...]
```

Builds both packs (no id) or the ones named. It unpacks the zip in a temporary folder (`bsdtar`), runs `tools/port-140.js` (merge with HD against 1.40), turns the merged classes into patches by comparing their `<properties>` with HD's, and copies `extras/<id>/mod.json`. It replaces `ported/<id>/` (the first port, 12 files at the game's paths, is gone). Built twice: the same `md5sum` of every file.

## Overlap: `o` and `q` cannot be used together

`oggetti-in-tutte-le-strutture-e-forti-bilanciati` (`q`) patches **the same 11 classes** with the same values (it is this pack plus the forts), and the same respawn items under other ids, so with both on every holder would get a second `respawn_item` / `<set>` of the same property and the order decides. **Use only one**; there is no `incompatibleWith` (AGENTS.md). Also: `ported/secuter-fun-mod` and `ported/secuter-fun-mod-grecia` (row 312, not this task) ship whole files at the game's paths for `Chest`, `BaseVillage`, `Outpost`, `Wagon`, `GOutpost`... (the same edits, from the same author): with this pack on, the patches apply on top of those files (`sdk/patches.md`), same values, so nothing new, but the two should not be used together either. A rules pack of another mod that sets the same classes (Community Mod's, Caesar Mod's, the not-built Nucl3arW1nter one touches none of these) would collide the same way.

## imperivm-resurrected#15

**It does not touch this pack.** No AI script, no `AIRun`. The item scripts (`o_energy_gem.vs`, `o_attack_gem.vs`: `while (true) { Sleep(...) }`) are run by the engine as item scripts (`equip_script`), not started with `AIRun`.

## Independence check

`node tools/shared-paths.js oggetti-in-tutte-le-strutture`: **no collisions** (0 class ids and 0 files in common with the game and every other port outside `patches/`).

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`): **OK, 17 files checked, no problems**.

## In game

**Tried:** nothing. **This build has not been run in the game.** (Only the old loose-files build of this mod was ever run, which proves nothing about this one.)

**Not tried** (to try, in this order):

1. The pack in the manager: card says it changes the game for everyone; no civilization appears in the lobby (it must not add any).
2. A skirmish on a random map: that the patches apply (`Logs\imperivm\imperivm-mod.log`, lines tagged `patch`; no `compilation error`); chests, obelisks, wells, pillars... give their item (walk a hero into one) and respawn.
3. The three new items: `oGold1000` adds 1000 gold to a settlement the hero enters, the energy gem refills the army's stamina faster, the fury gem gives +4 damage and loses it when removed.
4. A village or a fort holds more than 5000 / 10000 (food and gold), a wagon loads 5000.
5. The game's civilizations play as before otherwise.
6. Not with `q` active (above).
