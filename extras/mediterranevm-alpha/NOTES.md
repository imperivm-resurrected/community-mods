# Mediterranevm (alpha) (GreekModTeam)

Row 200. `Mediterranevm_Mod_-_components.rar` (289 MB, ModDB, `originals/forum/imperivm-iii-mediterranevm-alpha/files/`): loose files over HD (`Data`, `Units`, `Buildings`, `Currentlang`, `UI`, `Minimap`, `Outlines`, `local/english.pak`, and a 408 MB `rle.mmp`), the ancestor of Imperivm Legacy. No installer, no `.exe`, no `.dll`: nothing the mod did through code is lost. Permission: Gabbo (GreekModTeam) agreed on 2026-10-18 (Discord). No license in the download.

**This port is the mod's changes to the game's eight civilizations as eight civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*), plus the mod's neutral map objects. The game's eight are not touched.

The first port (2026-10-19) shipped the 98 files as they were, at the game's paths. The issue measured "no game civilization changed by class stats", but `node tools/mod-class-diff.js <Data/Classes> --hd` on the mod says otherwise: Britain (BSwordsman speed), Carthage (hero skills, Berber assassin, Libyan footman, Numidian rider speed), Gaul (axeman health), Germany (huntress speed, Teuton archer damage, armor and range), Iberia (slinger range) and Republican Rome (gladiator speed) change by stats, Egypt's and Republican Rome's chariots by `max_food` and `feeds` (and every horse through the `Horse` base class), and every civilization by the commands of its barracks, tavern, village and blacksmith and by 9 base classes (`BaseBarracks`, `BaseTavern`, `BaseTownhall`, `BaseVillage`, `BaseShipyard`, `Horse`, `BaseRuins`, `Shrine`, `Stonehenge`). So all eight are cloned.

| `id` | Prefix (derived) | Base | Lobby name |
|---|---|---|---|
| `mgaul` | `Mga` | Gaul | Gaul (Mediterr.) |
| `mrome` | `Mro` | RepublicanRome | Rep. Rome (Mediterr.) |
| `mimperial` | `Mim` | ImperialRome | Imp. Rome (Mediterr.) |
| `mcarthage` | `Mca` | Carthage | Carthage (Mediterr.) |
| `mbritain` | `Mbr` | Britain | Britain (Mediterr.) |
| `miberia` | `Mib` | Iberia | Iberia (Mediterr.) |
| `megypt` | `Meg` | Egypt | Egypt (Mediterr.) |
| `mgermany` | `Mge` | Germany | Germany (Mediterr.) |

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/mediterranevm-alpha.js [id ...]
```

It unpacks the rar in a temporary folder (nothing is written under `originals/`; `bsdtar`), uppercases the folder names to the game's (`DATA/CLASSES`...), runs the SDK's `shrink-mod.js` on it against `$G` (what is identical to the game stays out: 425 files; the sprites go to `rle.mmp.tail`), rebuilds `ported/mediterranevm-alpha` from that and removes the temporary folder. The same result twice (checked). `extras/mediterranevm-alpha/mod.json` is copied over at the end. `raw/mediterranevm-alpha-left-out.txt` lists what the build left out.

## What is a civilization's, what is not

- **A civilization's** (the eight): the mod's version of each game class of the civilization (stats, commands, costs, specials), cloned from HD by `clone-civilization.js --all-orders` (`tools/lib/clone-civs.js`); its own classes (`BritonHero2`, `BHero5`, `BHero5a` are Britain's; `CBerberAssassin`, `CLibyanFootman`... Carthage's); what the mod changed in the base classes (`BaseBarracks`' `atrainex`/`research` methods, `BaseTavern`'s `invest`/`Call peasants`, `BaseTownhall`'s `sacred_healing`, `BaseVillage`'s tribute on the tent, `BaseShipyard`'s fish counter and `ShipyardFoodProduction`, `Horse`' `max_food`/`feeds`) written **inside each clone**, never in HD's; and the `<method>`/`<behavior>` elements of the game's classes that run a script the mod edited in place (`UNIT_CAPTURE`, `BARRACK_TRAIN_EX`, `ONFINISH_RESEARCH`, `OUTPOST_BEHAVIOR`, `ARENA_BEHAVIOR`, `VERIFY_*`, the shaman ones), which in the clone run the mod's copy under a name of its own. Per civilization: 72 / 66 / 43 / 59 / 62 / 60 / 57 / 60 classes (Gaul, Republican Rome, Imperial Rome, Carthage, Britain, Iberia, Egypt, Germany).
- **Neutral** (nobody's, shipped as they are, renamed `_med` because Imperivm Legacy has the same ids): the **Numidian tent** `CTent` and the two mercenaries it hires, `CHorseman` and `CMercenaryTuareg` (the tent's scripts place them by name for whoever owns it; `CHorseman` and `CMercenaryTuareg` look like Carthage's by letter and race, so `clone-civs.js` has a new optional `neutral` setting that keeps them out of the clone), the **Greek garrison** `HOutpost` with its `HHoplite` (placed by the random maps), and the **fisherman** `Fisherman` (every village trains one). The random maps place the tent and the garrison again through a patch (`patches/DATA/RANDOMMAP/PLACEOBJECTS.XML`, six lines).
- **Not ported**, by AGENTS.md ("what is not a civilization's is a patch that adds its own part"): the mod's changes to the game's neutral objects (`Shrine`'s mini-map icon, `Stonehenge`'s five orders and `BaseRuins`' two treasure items, and the outline pictures of the first two); `const.ini` (`DiseaseCost`), two `stamina_cost` values of `UNIT_SPECIALS.INI`, the `Gem of wisdom` item and its script (edits of the game's own items and values, for everybody); the cost of the village and tavern `repair` orders (1000 and 500 gold instead of 100: their source is the game's base class, so a clone would offer two buttons); `hidden.txt` (the old mod hid 193 game voices by replacing a pack: it would hide them for the game's civilizations too). The Sound Forge peak files (`*.sfk`) next to the voices are left out (the game does not use them).
- **Voices are the clones' own** (`tools/mediterranevm-alpha.js`, step 3c). The mod replaced the game's voice files at the game's own paths (`Currentlang/Voices/<unit>/`: 311 of its 407 `.wav` overwrote a game file with other bytes), which would make the game's civilizations sound like the mod. Each folder that an entity played by a clone's class names becomes `Currentlang/Voices/<unit>_med/` with an entity of its own (`DATA/SOUND ENTITIES/Voice<unit>_med.xml`, 69 of them, 333 files) and the clones' classes name it; the game's paths are the game's again. Where HD's entity names files the mod does not have (HD names the slinger's lines "Best eye in the land.wav"; the mod has `1.WAV`..`5.WAV`, which 1.40's entity named: 5 entities) the new entity lists the mod's files. A file of the entity the mod does not have stays the game's (not shipped). Not ported: the voices of units no civilization of the port plays (`BDruid`, `GDruid`, `IEnchantress`, `TEnchantress`, `RVelit`, `RPraetorian`, `GVikingLord`, `RebelLiberatus`), `Local/english.pak` (its 47 files are under `<unit>/...`, a path no entity of the game names: the game's entities say `CurrentLang/voices/<unit>/...`) and the Sound Forge peak files. The neutral horseman's voices (`Voices/CHORSEMAN`, entity `VoiceCHorseman_med.XML`) stay as they are: the mod's own.
- **Cosmetic, left at the game's paths**: only `Currentlang/MENUBACKGROUND.bmp` (the menu skin, which the content manager lets the player choose).

## imperivm-resurrected#37 and #38

- **#37**: the prefixes are derived by the SDK from the ids (first three characters) and there is no `index`: the engine assigns it. The ids start with `m` and differ in their first three characters so that none of the prefixes is another port's (GBR Tactics and La Reconquista 2010, both derived from ids that start with `gau`, `car`..., already share `Gau`, `Car`, `Bri`...: not this port's business). They need the Resurrected build that supports multi-character prefixes (`dev-villoh`). The letters table in `docs/CIVILIZATIONS.md` has no row for them; the rows for the maintainer are in `PR-NOTES.md`.
- **#38**: the set is named `Mediterranevm (alpha)` (`mod.json`, 21 characters), the only version of the mod in the repository; the 3.6 (row 386) will be another mod with the version in its name. Every civilization has `ai: true`; `random` is left at its default; no `replacesBase`, `variant` or `ownAi`. The lobby names carry `(Mediterr.)` so that the longest, `Rep. Rome (Mediterr.)` (21 characters), fits the 22 of the dropdown.

## Independence check

`node tools/shared-paths.js mediterranevm-alpha`: **no class id** shared with the game or with any port, and no entity folder or script path outside the mod's own names. What remains:

- `currentlang/menubackground.bmp` with the CGWAR, the 1.8, the 4.2, Imperivm Legacy and the MCI: the menu skin. Cosmetic: the content manager lets the player choose (as already among the Greek mods).
- `rle.mmp.tail` with the 4.2 and Imperivm Legacy: the engine allows **one** pack with a graphics tail among the active ones (`sdk/reference.md`). This mod's tail holds the sprites of its new and changed units (the Numidian tent, the garrison, the hoplite, the horsemen...), so this mod and those two cannot be active together until the engine merges tails. That already holds between the 4.2 and Legacy. No `incompatibleWith` is declared: the engine reports it.

Names that another port already had with other bytes and were renamed here (`tagCollisions`, tag `med`): the classes `CHorseman`, `CTent`, `Fisherman`, `HHoplite`, `HOutpost`, the art folders `CHORSEMAN`, `HHOPLITE`, `HOUTPOST`, `NUMIDIAN_TENT` (with their outline and mini-map pictures), 25 scripts, 18 icons and pictures, the sound entity of the horseman; two orders (`StartCHorsemanTrain (med)`, `StopCHorsemanTrain (med)`). The units' entity files are renamed one by one inside the game's folders (`BBOWMAN.ENT_med.XML`): the folder stays the game's, so the sprites the mod did not change are still the game's.

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`, with #43): **OK, 1129 files checked, no problems** (0 errors, 0 warnings).

## In game

**Tried:** nothing yet (built and validated; the maintainer tests).

**Not tried** (to try, in this order):

1. The lobby: the eight `(Mediterr.)` civilizations show, with their names, and the game's eight are as they were.
2. A room with only this set (#38): the dropdowns list only the eight, Random draws one of them, the AI plays one (it uses the game's AI scripts through the classes of the civilization; the mod's AI is not ported, see *Pending*).
3. A skirmish with a `(Mediterr.)` civilization on a random map: the neutral Numidian tent and Greek garrison appear on it, a captured tent hires horsemen and Tuareg mercenaries, the village trains fishermen, a barracks trains.
4. Two civilization mods active together (the 1.8, or GBR Tactics / La Reconquista 2010 when they are in `ported/`; not the 4.2 or Legacy: the graphics tail, above).
5. Saving and loading a game with it; a second player receiving the set in a filtered room.
6. Voices: click a unit of a `(Mediterr.)` civilization (it plays the mod's lines), then the same unit of the game's civilization (the game's lines, as before); a missing file shows up in `Logs\\imperivm\\imperivm-mod.log`.
7. `Logs\comp_out.txt` and `Logs\vxlog.log`: scripts the mod wrote for HD should compile, but the copies `*_<civ>.VS` that `clone-civs.js` makes per civilization (the race test removed) and the patches have not been run. The things the validator cannot see (scripts that call something HD no longer has) show up there.

## Pending

- *Pending: independence*: the graphics tail with the 4.2 and Imperivm Legacy (engine) and the menu background (cosmetic), above. Nothing else overlaps.
- The mod's AI: it has none of its own (the alpha ships no `DATA/AI`).
- The repair costs of the village and tavern, `Stonehenge`'s orders and the other changes to the game's neutral objects (see *Not ported*).
- Maps that place this mod's classes: none of ours requires it (`requires` on `mediterranevm-alpha`: none in `docs/MODS.md`).
