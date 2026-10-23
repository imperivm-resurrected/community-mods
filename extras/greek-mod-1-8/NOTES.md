# Greek Civilization Mod 1.8 (Rattlesmake)

Row 4. `GreekMod_1.8.rar` (2.7 GB, forum t1207) is a full copy of the game (1.40 base): `Packs\*.pak` (17, with `zGreek.pak` over `data.pak`), `Local\{czech,english,italian,spanish}.pak`, its own `rle.mmp` (438 MB), `Movies`, `Music`, `Scenarios`, `Adventures`, `Conquests`, plus `gbr.exe`, the launcher and DLLs.

## Rebuild

```bash
mkdir originals/greek-mod-1.8-full && bsdtar -xf originals/forum/t1207/files/GreekMod_1.8.rar -C originals/greek-mod-1.8-full
node tools/flatten-paks.js originals/greek-mod-1.8-full/GreekMod_1.8 originals/greek-mod-1.8-flat
ln -s $PWD/originals/greek-mod-1.8-full/GreekMod_1.8/rle.mmp originals/greek-mod-1.8-flat/rle.mmp
node tools/port-140.js originals/greek-mod-1.8-flat ported/greek-mod-1-8 --id greek-mod-1-8 --name "Greek Civilization Mod 1.8" --version 1.8 --category Civilizations
```

`shrink-mod.js` is not used: it compares against the HD game and would undo its fixes (this mod is 1.40: of the 1797 files in its `data.pak`, 1536 are identical to 1.40 and HD's version stays). `port-140.js` wants loose files, so `tools/flatten-paks.js` unpacks the packages in name order (the greater name wins, as in the game) and lays the mod's loose files over them. Result: 2.9 GB, 4447 files; the rest was the game's.

`ported/greek-mod-1-8/` is not in git (it is mostly the author's files).

## What was changed by hand (this folder)

- `mod.json`: credits (Rattlesmake; the port is Villoh's), description, and `incompatibleWith` the Greek Civilization Mod 4.2 and the CGWAR. **That is temporary, see *Pending: independence*.**
- `civs/greek.json`: Greece in the lobby, as in 4.2 (see its NOTES): base `ImperialRome`, letter `H`, `template: Greek`, `replacesBase`, index **32** (31 is 4.2's, 30 CGWAR's). The classes keep `race="ImperialRome"`, and the scripts say `Greece = ImperialRome`, so nothing else changes.
- `DATA/INTERFACE/MENU/TEMPLATE.INI`: the mod's, with `Larghezza`/`Altezza` 1920x1080 instead of 1024x768 (the menus are laid out from them; at 1024x768 the whole menu was drawn small in the middle of the screen).
- `DATA/INTERFACE/MENU/MAINMENU.INI`: the mod's, with `ButtonXStart = 1430` and `ButtonYStart = 185` in `[MainMenu Params]` (the values the 4.2 uses; the template's `%ScreenRight% - 272` put the buttons in the top right corner, under the FPS counter). **The other menus (`MPMENU`, `MPGAMEMENU`, `ADVENTUREMENU`, `PROFILE`, `OB_*`) still have the mod's 1024x768 positions and have not been looked at.**
- Rome's branches: 1.8 picks Republican/Imperial/Punic in game, with a town hall command (`RHT_SCELTA_ROMA.XML`, `ChooseImperialRome`…). Kept as it is (not tried in game); unlike 4.2 there is no lobby sentinel (`776` appears in no script), so no variant civilizations here.

## Left out (a mod cannot carry it)

`gbr.exe` (332 bytes different from the HD one), `ImperivmLauncher-Greek 1.8.exe`, `Inizio del Gioco.exe`, `Uninstall.exe`, the DLLs (`NAudio`, `Newtonsoft.Json`, WPF and `Dirapi`, `Iml32`… in `Data\`), `Settings.ini`, `config.ini`, `update.xml` (a saved web page), RetroSpy files (the launcher's multiplayer: AGPL-3.0, not ported), `profiles/`, `hof/`, `Logs/`, `Xtras/`, `package/`, `currentadv.bfhp`. The 332 bytes of `gbr.exe` have not been read: see `extras/greek-mod-2-6-1/NOTES.md` for what the later ones change.

## Pending: independence (AGENTS.md, *Civilizations are independent*)

The goal is a Greece that works on its own and next to the 4.2 and the CGWAR, each its own civilization in the lobby. Not done: the port is `incompatibleWith` both. What overlaps (measured on `ported/`, 2026-10-23):

| With | Shared |
|---|---|
| 4.2 (`greek-civilization-mod`) | 129 class ids (`HBarracks`, `HChariot`, `GreekHero`…), 277 files in the same path in `DATA` (216 differ), the Imperial Rome slot with letter `H`, `Greek Town N` templates |
| CGWAR | 16 files in `DATA` (`const.ini`, `items.xml`, `copyrights.txt`, `classes/greekhero.sc.xml`, `commands/greece.xml`, `randommap/placeobjects.xml`, `subai/{horse_idle,onfinish_research,unit_attach,unit_attack,unit_on_kill,unit_stand_position,village_trainpeasant}.vs`, `interface/menu/mainmenu.ini`, `interface/editor/combo/{itemicons,uniticons}.ini`), 3 in `units`, 4 in `ui`, class `GreekHero`, the `Greek` template name |

To do: own race, letter and names for the 1.8 (as `tools/cgwar-greece.js` did for CGWAR), its changes to game files as patches, and a test with two of them active. Starts after the 1.8 is tried alone.

## To check

- `validate-mod.js --game`: 0 errors fixed by the port, **4 errors that are the mod's own**: `hero_gives_double_items.vs`, `centaur_summoning.vs`, `return_range_unit.vs` and `paeceful_idle.vs` are referenced by `HERO`, `HPRIEST`, `RANGED` and `WILD_HEN` but are in neither the mod, 1.40, HD, nor 4.2. Kept as the original has them, like the MCI's. 144 warnings (animation frames/rows of the heroes and `HTOXOTES`), also the original's.
- 23 conflicts with HD, where the mod's side was used (`raw/port-140/greek-mod-1-8.md`): `GETTACTICSCRIPT.vs` (the AI's Roman branch choice, 100 lines), `ONFINISH_RESEARCH.vs`, `UNIT_*.vs`, the Roman voices, `COMMANDS/ARENA.XML` and `VILLAGE.XML`, the HD sneak behaviour lost in `IMOUNTAINEER` and `THUNTRESS`. Not reviewed one by one yet.
- Game modes: the mod's 4 victory scripts are HD's with the kills/deaths statistics added; `5 ALTERNATIVE.VS` is HD's. Not the 4.2 case (no scripts hidden), but untried.
- **In game (2026-10-23, Linux, 1920x1080):** the main menu loads with the mod's background, logo and version text, and the buttons sit on the right (after the `TEMPLATE.INI` and `MAINMENU.INI` fixes above; the first try drew the menu at 1024x768 in the middle of the screen). `imperivm-mod.log` registered `greek` (index 32, base ImperialRome, letter H, replaces ImperialRome) and added it to the room dropdowns, no errors. **Not tried yet:** a game against the AI with Greece, Rome's branch choice, the other menus (multiplayer, adventures, profile), the mod's adventures and scenarios, voices and music.
