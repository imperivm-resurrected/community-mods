# Greek Civilization Mod 1.8 (Rattlesmake)

Row 4. `GreekMod_1.8.rar` (2.7 GB, forum t1207) is a full copy of the game (1.40 base): `Packs\*.pak` (17, with `zGreek.pak` over `data.pak`), `Local\{czech,english,italian,spanish}.pak`, its own `rle.mmp` (438 MB), `Movies`, `Music`, `Scenarios`, `Adventures`, `Conquests`, plus `gbr.exe`, the launcher and DLLs.

**This port is Greece as a civilization of its own** (AGENTS.md, *Civilizations are independent*), with the maps, adventures, videos, music and menu skin of the mod. The game's 8 civilizations are untouched. What the mod did to them is listed under *Left out*.

## Rebuild

```bash
mkdir originals/greek-mod-1.8-full && bsdtar -xf originals/forum/t1207/files/GreekMod_1.8.rar -C originals/greek-mod-1.8-full
node tools/flatten-paks.js originals/greek-mod-1.8-full/GreekMod_1.8 originals/greek-mod-1.8-flat
ln -s $PWD/originals/greek-mod-1.8-full/GreekMod_1.8/rle.mmp originals/greek-mod-1.8-flat/rle.mmp
node tools/port-140.js originals/greek-mod-1.8-flat ported/greek-mod-1-8 --id greek-mod-1-8 --name "Greek Civilization Mod 1.8" --version 1.8 --category Civilizations
node tools/greek-1-8.js
node tools/greek-1-8-civs.js
```

`shrink-mod.js` is not used: it compares against the HD game and would undo its fixes (this mod is 1.40). `tools/flatten-paks.js` unpacks the packages in name order (the greater name wins, as in the game) and lays the mod's loose files over them. `port-140.js` merges with HD. `tools/greek-1-8.js` then makes Greece independent (below). `ported/greek-mod-1-8/` is not in git. It needs `originals/game-data/paks/` with every HD pack extracted (README, *Setup*), `Minimap.pak` and `Fonts.pak` included.

## What `tools/greek-1-8.js` does

- **Own names.** Greece in 1.8 sat in Imperial Rome's slot with the letter `H`. Here it is `greek18` (`civs/greek18.json`, index 32, letter `Q`, `internalName` `Greek18`, template `Greek Rattlesmake`, `ai: true`). 129 names change one letter for another: classes (`HHoplite` → `QHoplite`, `HeroHHoplite` → `HeroQHoplite`, `GreekHero` → `QGreekHero`), commands (`trainHHoplite` → `trainQHoplite`, `hireheroH` → `hireheroQ`, `trainpeasanth` → `trainpeasantq`), entity folders and sprites (`Units/HHOPLITE` → `Units/QHOPLITE`), icons, voices and sound entities. The engine builds names from the letter (`GetRaceStrPref`), so a literal `"H"` in a script is changed too. The classes have `race="greek18"`.
- **Base classes.** The 1.8 edited the game's `Melee`, `Ranged`, `Hero`, `Horse`, `Unit`, `BaseVillage`…, which every civilization inherits. Those edits are written **inside each Greek class** (`<!-- changes the 1.8 made to its base classes -->`, 149 elements); the game's base classes stay as they are.
- **The Greek walls, gates and tower** the mod drew over Imperial Rome's `M*` ids are `Q*` classes (`QWallsN`, `QGate0`, `QTower`); Imperial Rome keeps the game's. `QTavern`, `QTavern2` and `QArena` (the city builder asks for them by letter) are copies of the Agora and the Gymnasium.
- **Commands**: the Greek ones in `DATA/COMMANDS/GREEK18.XML`; what the 1.8 added to the game's command files (a Greek barracks source, a research…) is a patch that adds only that `<src>`.
- **Game files it edited**: Greek behavior in `ONFINISH_RESEARCH.vs` and `UNIT_ON_KILL.vs` (Supplies, Charm of Athena, Charm of Aegle, Statue of Zeus), the Greek items and formations, and the Greek hero names are **patches** that add; hero names are `QName00x` in `const.ini`.
- **AI variables**: `AIV_MaxQHoplite`, `AIV_MaxQMyrmidon`… (per difficulty) and `AIV_TimeStrenghtenStrongholdGates` are declared in the `AI.INI` patch. A script that reads one that is not declared does not compile.
- **AI recruiting**: `extras/greek-mod-1-8/patches/DATA/AI/TSH_RECRUITARMY.vs` (by hand): a Greek settlement asks for `trainQHoplite`… and the Greek researches; every other civilization takes the game's branch. It is a patch because the game calls this helper from its tactics, not through `AIRun`.
- **AI**: the 11 helper scripts and the main loop (`ES_Stronghold`) the mod rewrote for "Greece = Imperial Rome" run as `GR18_*` for Greek settlements only: a patch at the top of each game helper hands a Greek settlement over with `AIRun` (as the CGWAR does); `ES_Stronghold`, which `Sleep()`s and crashes inside `AIRun`, goes in `[EconomyScripts]` and `GetEconomyScript.vs` picks it. Every other civilization keeps HD's AI.
- **Interface**: `INFOBAR_GREEK18.INI`, `CMDBARGREEK18.INI` and the frame in `FRAMES.INI` (a patch) are what the game looks up by `internalName`.
- **Maps** (`Scenarios`, `Adventures`, `Conquests`, `ConquestMaps`, `Movies`: 124 `.bfhp`): kept. 10 of them place Greek classes; they are rewritten inside the HPFS container (1111 names, one letter for another, in place), so they place `QHoplite`, not `HHoplite`. **Open: the Greek players of those maps have race 4 (Imperial Rome), which in 1.8 *was* Greece; now it is the game's Imperial Rome.** A human can still play them (the commands come from the classes); an AI in a Greek slot plays as Imperial Rome. Needs a decision on how a map names a mod civilization.
- **Menu skin** (`CURRENTLANG/*` and, by hand, `DATA/INTERFACE/MENU/MAINMENU.INI` and `TEMPLATE.INI`, 1920x1080): kept. It is the one thing that is a whole file at the game's path, on purpose: it is cosmetic and only one skin can show at a time. It is also what tells the player that the mod is loaded.
- **Random map**: the mod's own Greek towns and villages (`Packs/RandomMapSettlements.bfhp`) are `Greek Rattlesmake Town N` / `Village N`, with the renamed classes, as a patch of `randommapsettlements`.
- References to 24 scripts the mod never shipped (`hero_gives_double_items`, `return_range_unit`, `centaur_summoning`, `paeceful_idle`…) are removed from the classes: the game could not run them, and the validator reports them as errors.

## Left out (and what happens to it)

| What | Why / next |
|---|---|
| The game's other civilizations as the mod changed them (Gauls 9 classes, Britain 6, Carthage 8, Egypt 2, Germany 9, Iberia 7, Republican Rome 14) | Each becomes its own civilization, "<civ> (Greek Mod 1.8)", cloned from HD with the mod's changes on top. Not done |
| The Republican/Imperial/Punic choice at the town hall (`RHT_SCELTA_ROMA.XML`, `R*_Enable_Or_Disable_Cmd.vs`, `ChooseXxxRome`) | The choosing is not ported, **the content behind it is still to port**: one civilization per branch, with its commands built in (AGENTS.md, *What a civilization is, it is from the start*). Today only the Republican one exists (`rome18`), without the Imperial and Punic units |
| The mod's AI for the other civilizations (`GetTacticScript.vs`, `TSH_*`, the `ESH_*` parts about Rome) | Part of the other civilizations above. The Greek AI uses the `GR18_*` copies |
| Game-wide edits: `const.ini` values, game scripts (kills and losses statistics), `terrains.xml`, `vxnotifications.xml`, interface menus, `MAINMENU.INI`, `TEMPLATE.INI` | Not a civilization's: a mod that replaces them hides every other one's. They come back only as patches if a decision says so |
| 122 sounds, animations and decorations whose path is the game's, with other bytes (death, fight and selection sounds…) | They would replace the game's for every civilization |
| `music/` (43 tracks) is kept, except where a track has the game's path | See *Pending: independence* |
| `gbr.exe` (332 bytes different from the HD one), the launcher, the DLLs, `Settings.ini`, `config.ini`, RetroSpy (AGPL-3.0), `profiles/`, `hof/`, `Logs/`, `package/`, `update.xml` | A mod cannot carry them. The 332 bytes of the exe have not been read: see `extras/greek-mod-2-6-1/NOTES.md` for what the later ones change |

## What `tools/greek-1-8-civs.js` does: the game's civilizations as the mod changed them

One civilization per row of its table: `rome18` (letter `J`), `gaul18` (`L`), `carthage18` (`P`), `britain18` (`O`), `iberia18` (`U`), `egypt18` (`V`), `germany18` (`F`); indices 33-39. Letters chosen among the ones no game or mod class starts with. It runs after `greek-1-8.js`, which keeps what `port-140.js` merged for the game's classes and commands (HD + the 1.8's changes) in `originals/greek-1-8-merged`.

- **Clone, from the mod's version.** The SDK's `clone-civilization.js` clones the base from a staged DATA: HD's classes and commands with the mod's version of the civilization's own classes and of its barracks commands over them. So the copy has the 1.8's stats and costs.
- **Base classes inside the copy.** What the 1.8 changed in `Ranged`, `Hero`, `Catapult`... (`base-changes.json`) is written inside each copy, as for Greece (50 elements for Rome). A copy whose parent is a copy has it through the parent.
- **The mod's own new classes that its maps place** (`RVillager_Apollonia`, `GVillager_Apollonia`...) become the copy's (`JVillager_Apollonia`) and the map is rewritten inside (HPFS), as for Greece.
- **Command files that are the civilization's alone** (every source one of its classes: `GBARRACKS`, `CBARRACKS`, `CTEMPLE`, `TBARRACKS`, `TTEMPLEOFNEPTUS`, `TTENT`) are staged too, so the copy has the 1.8's costs.
- **Not ported.** The Rome branch (`R*_Enable_Or_Disable_Cmd.vs`, `trainMVelit`, `trainMPraetorian`), references to scripts the mod never shipped (36).
- **The mod's `Hero<unit>` classes** (unmounted heroes for the editor: `HeroRVelit`...) become `Hero<letter><unit>` (`HeroJVelit`), with the civilization's race (the mod's `HeroRVelit` had `ImperialRome`: a mistake of the mod).
- **Republican Rome (`rome18`, letter `J`, index 33)**: 78 classes, 20 commands, 30 shared commands patched (merged with the Greek patch files of the same name), `Rome18Hero` (the generic hero), `RScout` 250 health, `RPrinciple` damage 24, `RChariot` 500 health, `RLiberatus` Freedom/Learning...; trainable-unit costs of `RBARRACKS.XML` as the mod has them.
- **SDK fix.** `clone-civilization.js` had the wrong class id for the generic hero of 6 civilizations (`RomeHero`, `ImperialHero`, `CarthageHero`, `IberiaHero`, `BritainHero`, `EgyptHero`): the hero stayed the base's and the copy's heroes played as the base. Fixed in the SDK.

Still pending for these civilizations: the mod's changes to the shared research commands (`ARENA.XML`, `BLACKSMITH.XML`, `TEMPLE.XML`, `TAVERN.XML`: costs and texts; they are the same command for every civilization), the winter variants of the buildings (`RBarracksWinter`...: the clone tool reads the top folder of `classes` only), the mod's maps (they place the game's `R*` classes), and `unit_specials.ini`/`skills.ini` (global).

## Pending: independence

**Greece and the game's seven others (as the mod changed them) are independent civilizations now** (`greek18` and `rome18`...`germany18`). The classes the mod added with a game race and that no map of the mod needs renamed are left as the mod had them: `Spartacus1`, `Spartacus2` (race `RepublicanRome`).

The port declares `incompatibleWith` the 4.2 and the CGWAR; `node tools/shared-paths.js greek-mod-1-8` says why it still has to (checked 2026-10-23, after the build):

- **CGWAR**: `data/commands/greece.xml` (both name their commands file `GREECE`: this port's is `GREEK18.XML` now, so it should have gone; check), `ui/cmdbar/frames/greek_frame.bmp`, `ui/cmdbar/research/imperial.bmp`, `ui/{cmdbar,icons}/upgrades/olympic games.bmp`.
- **4.2** (it comes from the same line): 16 class ids (`Fisherman`, `Poseidon`, `Thermae`, `Spartacus1/2`, `WildHen`, the Apollonia villagers, the Roman flags…), 78 files in the same path with other bytes (`data/subai/*.vs`: government forms, democracy, myrmidons school…, mapobjects, sounds, music, icons).
- **Imperivm Legacy, MCI, Mediterranevm alpha**: the fisherman, 34 sounds, 8 music tracks, a few icons.

These are neutral things the 1.8 added (not Greece's): a fisherman, decorations, music, government scripts. By the rule each mod must have them under names of its own; the method is the one used for Greece (a one-letter or prefix swap in the file and in what refers to it). Not done.

## To check

- `validate-mod.js --game`: 0 errors, 98 warnings (animation frames/rows of the heroes and `QTOXOTES`, odd extensions, decoration frames), all the original's.
- 23 conflicts with HD where the mod's side was used by `port-140.js` (`raw/port-140/greek-mod-1-8.md`) are mostly files this port no longer ships (Roman voices, `GETTACTICSCRIPT.vs`…); the ones left are in `SUBAI` (`ONFINISH_RESEARCH`, `UNIT_ON_KILL`). Two hunks that edit the game's own lines (`ExploreCircle(…, 6000)` for 4500, `inherentlevel >= 12`) were left out: they are the game's, not Greece's.
- **In game, 2026-10-23, Linux, 1920x1080.**
  - First independent build (no maps, no menu skin), `Crossroads` skirmish with Greece, Republican Rome, Imperial Rome and Greece: Greece in the lobby, the Greek town templates picked, **then the game hung** (`HANG`, main thread inside `CVXScriptObj::StartCurrentCommand` → `StartScriptSlot` → `CInterpreter::Start` → `CMallocPtrPool::Alloc`: a command's script being started again and again, or the pool exhausted). 3 Greek AI scripts did not compile at that point (`AIV_MaxHMyrmidon`, `AIV_MaxHToxotes`, `AIV_TimeStrenghtenStrongholdGates` were not declared); fixed, and the hang was still there on the second build (the AI variables and `TSH_RECRUITARMY` patch included). The `TS_BritishTactic.vs` `nSpearmen` error in the log is the game's own (imperivm-resurrected#12).
  - The first build (Greece in Imperial Rome's slot, letter `H`; kept in `originals/old-installed-greek-mod-1-8-*`) starts and plays. Its `unit_on_kill.vs` has a compile error of its own (`Closing } without corresponding opening`, a bad merge).
  - A player judges a build first by the menu: without the mod's background and logo it is not credible. That is why the menu skin is back.
  - **Cause of the hang (found and confirmed in game, 2026-10-23):** `DATA/SUBAI/TOWNHALL_BUILDINGSBEHAVIOR_H.VS`, attached to the Greek town hall, began with `if (This.AsBuilding.race != ImperialRome) return;`. In the 1.8 Greece *was* Imperial Rome, so it never returned. With Greece on a race of its own the test is true, the script returns at once, and the engine, which restarts a behavior script every time it ends (the game's own end with `Sleep(n)` for that reason, and the keensight one says "prevent behavior script from terminating (this will lockup the game)"), starts it again at once, forever, on the game's one thread. The HANG stacks (`CVXThreadManager::UnlinkThread` ← `DeleteThread` ← `RunScriptThread`; `StartScriptSlot`) are that loop. The test is removed (the script is only attached to Greek classes), and `tools/greek-1-8.js` reports any behavior script of a Greek class that can return before its first `Sleep`. Builds E and F from before the fix hung; E2 (full) and F2 (no Greek AI) have the fix and **start and play**: Greece in the lobby, its town with the Greek buildings, the bars.
  - The interface is the base's (`INFOBAR_GREEK18.INI`, `CMDBARGREEK18.INI` and the `FRAMES.INI` patch do nothing: the log says "bars and menus of civilization 32: with the interface of its base (4)"; the SDK says so too).
- **Menu buttons:** the first build with the menu skin showed the game's own buttons: the mod's are `UI/MENU/BUTTON*.BMP` (`ImgButton200..202` in its `TEMPLATE.INI`), which this tool removed as "replaces the game's own". `UI/MENU/` is part of the skin and stays.
- **Not tried yet:** the Greek AI as an opponent for long, a hero, a hero, the Greek researches, the voices and sounds, the maps and adventures with the renamed classes.
