# Celtic Kings Adventure (Larax, from Imperivm I): notes

MODS.md row 202. By **Luken_SOD** (ModDB [larax-adventure](https://www.moddb.com/mods/larax-adventure/downloads)), permission given on 2026-10-19 (credit him; he plans another update). The adventure is Haemimont Games' and FX Interactive's *Celtic Kings: Rage of War* campaign (maps, videos and music are theirs), adapted to Imperivm HD by Luken_SOD. Credits in `mod.json`: Luken_SOD, Haemimont Games, FX Interactive, and `Villoh (port)` because the maps are edited (see below). The license of the original is not stated on the ModDB page.

Rebuild (same result every run):

```bash
node tools/celtic-kings-adventure.js     # from originals/forum/celtic-kings-adventure-larax-from-imperivm-i/files/ (3 zips) + this folder
node validate-mod.js ported/celtic-kings-adventure --game "<game>" --data originals/game-data/DATA     # SDK
node tools/shared-paths.js celtic-kings-adventure
```

It also needs `originals/game-data/local-spanish` and `local-italian` (HD's texts: `extract-data.js` on `local\spanish.pak` and `local\italian.pak`, copied into a `Packs\` folder first). The folder is 361 MB: three `.bfhp` (20, 137 and 140 MB), the two videos (47 MB), the music (30 MB). `.bfhp`, `.bmp`, `.avi` and `music/` are not in git (`.gitignore`).

## What the download is

Three zips, one per language, each a copy over the game folder: `Adventures/Celtic Kings Adventure.bfhp` (+ `.bmp`), `Movies/CK_Intro.avi`, `CK_Extro.avi`, `Music/CK_TRACK_*.ogg` (1, 2, 4 to 11), `Packs/zCelticKingsAdventure.pak` (68 KB: 36 files in `DATA`, 1 in `UNITS`; identical in the three) and, in Spanish and Italian, `local/<language>.pak` (HD's own pack plus 42 added texts). No `.exe` or `.dll`: nothing the port cannot carry.

The three `.bfhp` are the same 17 maps. The English one has its texts in the maps; the Spanish and Italian ones carry `Local/SPANISH` / `Local/ITALIAN` inside: texts, conversations and 700 voice `.wav` (that is why they are 7 times bigger). Each has its own title in `game.xml` (*Celtic Kings Adventure*, *Imperivm I - La Guerra de las Galias*, *Imperivm I - La Guerra Gallica*), so the three show apart in the adventure list; they are called `Celtic Kings Adventure (English|Español|Italiano).bfhp` in `adventures/` because the zips name them all the same.

## What was done and why

The original was installed by copying files over the game. Seven of them replaced game files; run as they were, they changed HD's own content (the maps of HD that place Larax: *Alesia*, *Tutorial*, *Great Loses Spain*; *DLleldoryn*: *Boudicca*, *Viaje hacia la gloria*; every random map places Stonehenge; *Glowing gem* and *Gem of Power* are in *El hijo del Ankou*). AGENTS.md: the game's content is never modified by a mod. Decision of the maintainer (2026-10-24): **own ids, maps edited in place**.

| In the original | Here |
|---|---|
| `DATA/CLASSES/LARAX.SC.XML` (Larax with parent `GaulHero`) | `CKLarax` (`extras/.../data/classes/cklarax.sc.xml`) |
| `DATA/CLASSES/THORIC.SC.XML` (`Thoric`: HD only has it as the `altid` of `BVikingLord`) | `CKThoric` |
| `DATA/CLASSES/DLLELDORYN.SC.XML` (druid with the story spells) | `CKDLleldoryn` |
| `DATA/CLASSES/STONEHENGE.SC.XML` (two methods added to the base class every Stonehenge inherits) | `CKStonehenge` (parent `Stonehenge`, only the two methods), `CKStonehenge1`, `CKStonehenge2` (copies of HD's, parent `CKStonehenge`) |
| `DATA/COMMANDS/DRUID.XML` (8 commands added at the start of HD's file) | `patches/data/commands/druid.xml`: the same 8, `src obj="DLleldoryn"` -> `CKDLleldoryn` (`GStoryDruid` and `RStoryPriest` are the mod's own) |
| `DATA/COMMANDS/STONEHENGE.XML` (`golden_rain`, `teuton_disaster`) | `patches/data/commands/stonehenge.xml`, `src obj="CKStonehenge"` |
| `DATA/ITEMS.XML` (*Glowing gem* gets `use_script`; *Gem of Power* gets `damage="160"`) | `patches/data/items.xml`: two new items `CK Glowing gem`, `CK Gem of Power`. The name is the id too: the adventure saves what Larax carries by name (`I_item.name`) between maps and gives it back with `AddItem`. `loc/*.loc.xml` translate those names with HD's translation of the old ones |
| `DATA/ITEMSCRIPTS/GLOWING GEM.VS` | `data/itemscripts/ck glowing gem.vs` |
| `DATA/SOUND ENTITIES/VOICELARAX.XML` | **Not carried**: it points to `voices/GHero/1.wav` to `5.wav`, which neither HD nor the mod has (HD's are `Follow my lead.wav`...). `CKLarax` uses HD's `VoiceLarax.xml` |
| `UNITS/DLLELDORYN/DLLELDORYN.ENT.XML` | **Not carried**: only the *Teach* animation is faster (646 ms instead of 1330). The entity names its images relative to its own folder, so a copy in another folder needs HD's 14 sprites (a `../` path was not tried). `CKDLleldoryn` uses HD's entity |
| The other 27 files of the pak (`GStoryDruid`, `RStoryPriest`, `StoryGhost*`, `StoryGWarehouse*`, `DLleldoryn_Map3`, 17 scripts in `SUBAI`, 10 classes) | As they are, paths in lowercase. They are new ids, not HD's |
| `local/<language>.pak` | Only `GAME.LOC.XML` differs from HD's pack: 42 added texts (class names, edit tree, spells, the class choice of the bonus units) -> `loc/spanish.loc.xml`, `loc/italian.loc.xml`. The 2 Italian lines the mod changed (`RArch`, `game spy`) look like HD's later updates (the mod's pack is older), not the mod's work: left out. English has no pack: `loc/english.loc.xml` is only the two item names |
| `Movies`, `Music` | `movies/`, `music/`, identical in the three zips (checked by md5) |

The classes and items are named in the maps. The tool rewrites each `.bfhp` in place (`tools/hpfs.js`, the pages are 512 bytes: a file must keep its length, so what a longer name costs is paid with indentation and blank lines, never code):

- `map.obj.xml`: `class=` and `classoffirstbuilding=` with `Larax`, `Thoric`, `DLleldoryn`, `Stonehenge1`, `Stonehenge2` (130 per edition). `DLleldoryn_Map3` is not HD's and stays.
- `.vs`: the quoted ids that are classes, told apart by the call that holds them: arguments of `AreaObjs`, `ClassPlayerAreaObjs`, `ObjsInSight`, `UnitsAroundSettlement` and the variables `s_larax`, `s_class`. The ones in `GetNamedObj`, `SpawnNamed`, `SetActor`, `CreateNamedObj` are names of placed objects and stay (`Larax` is also the name of the placed object). Any other place stops the tool.
- `.vs`: `"Glowing gem"` and `"Gem of Power"` -> the CK ids (24 per edition).
- Checked: all 51 `map.obj.xml` still parse as XML, the entries of the `.bfhp` keep their sizes, only `map.obj.xml` and `.vs` entries changed (76 per edition), and no HD id is left in them.

## Independence (AGENTS.md)

`node tools/shared-paths.js celtic-kings-adventure`: no collisions with the game or with any mod in `ported/` (the original's `LARAX.SC.XML` clashed with Secuter's Fun mod). It adds no civilization, no letter, no index. HD's `Larax`, `Thoric` (altid), `DLleldoryn`, `Stonehenge*`, `DRUID.XML`, `STONEHENGE.XML`, `ITEMS.XML` are untouched; the patches only add. Class ids it adds: `CKLarax`, `CKThoric`, `CKDLleldoryn`, `CKStonehenge`, `CKStonehenge1`, `CKStonehenge2`, plus the original's own `DLleldoryn_Map3`, `GStoryDruid`, `RStoryPriest`, `StoryGhost`, `StoryGhost_Sacrifice`, `StoryHide_Sacrifice`, `StoryMist_Sacrifice`, `StoryPossess_Sacrifice`, `StoryGWarehouse`, `StoryGWarehouseWinter`. Command names it uses that HD also has (`learn`, `heal`, `hide`, `ghoul_summoning`, `cloud_of_plague`) are added with `src` only for its own classes, as HD does between its own druids.

Its `incompatibleWith` is empty. Maps that place its classes: none outside the mod.

## Row 259 (the pack's `1 L'avventura di Larax`)

Not added. It is another, older edition (Italian and Spanish texts in one 256 MB `.bfhp`, `game.xml` title *L'avventura di Larax*, 272 files different, 58% of the data the same; its `map.obj.xml` places the same HD ids), and it would need the same renames. Luken_SOD's has a named author, the videos and the three languages (decision of the maintainer, 2026-10-24; as `extras/greek-mod-maps-and-adventures-pack/NOTES.md` says). Should it be wanted later: `--add` of `wrap-map.js` does not apply (this is not a wrap); it would be a fourth `.bfhp` in `adventures/` through `rewriteMap()`.

## Tried in game

**Tried (2026-10-25, one session of 69 s, game in English, only the first map and its intro):** the mod loads (`loaded Celtic Kings Adventure 1.0, 59 files`), the three editions are in the adventure list, a game of the English edition starts and map 1 loads in 1.7 s, `CK_Intro.avi` plays from the mod, the three patches (`druid.xml`, `stonehenge.xml`, `items.xml`) apply, `cklarax`, `ckstonehenge`, `ckstonehenge1` and `ckstonehenge2` load. Log: `ended cleanly, 4 warnings, 0 errors`. Warnings: two from the game's own start (`winmm` exports, GameBanana catalog) and `sound NOT found: packs/silence.wav`: the first map's script calls `PlayMusic("packs\\silence.wav")` and no zip nor HD has that file; left as it is (only the silence at the start is missing).

**Not tried** (left to the players, who report what fails): playing beyond the intro, the Spanish and Italian editions in game (the game was in English: `loc/spanish.loc.xml` and `loc/italian.loc.xml` were never read), the later maps, the gem between maps, Stonehenge spells, druid spells, `CK_Extro.avi`, HD's own adventures as without the mod. Checked without the game: validator (0 errors, 0 warnings), `shared-paths.js`, every script and entity path the classes, commands and patches point to exists (HD or mod), the `.bfhp` read back with `hpfs.js`.

What to check, in this order (1 and 2 are the risks):

1. Does each edition start (adventure list shows three entries, `imperivm-mod.log` without `patch`/`class`/`script` errors)? Do Larax, Thoric and the druid appear in map 1 (`Maps/1167`)? A missing class would show in the log as an unknown class.
2. The class ids in the scripts: `ClassPlayerAreaObjs("CKLarax", ...)` triggers (the conversations and the "Larax is out of Tihoma" checks of the first map).
3. Items between maps: Larax keeps the gem when changing map (`CK Gem of Power` is saved and given back by name) and the Spanish/Italian/English names show (`Gema del poder`...).
4. Stonehenge in the maps that have one (`11921`, `11937`, `11939`, `11944`, `1394`, `1395`, `719`, `835`): golden rain and Teuton uprising show up and work; the teuton uprising `nsrc Shrine` is kept as the original had it.
5. Druid spells (`heal`, `hide`, `ghoul_summoning`, `cloud_of_plague`, `beast_control`, `mass_hide`) and `help-sacrifice` of `CKDLleldoryn`/`GStoryDruid`/`RStoryPriest`.
6. The videos (`Movies\CK_Intro.avi` at the start of map 11937, `CK_Extro.avi` at the end of 11945) and that HD's own *Alesia* / random map Stonehenge / *El hijo del Ankou* are as without the mod.

Not tried and not carried:

- `Music/CK_TRACK_*.ogg` are in `music/` as the author shipped them; no script of the adventure names them, so whether the game plays them (and only with the mod on) is unknown.
- The faster *Teach* animation of DLleldoryn and the voices of Larax (above).
- Whether the item name shown in English is *Glowing gem* (comes from `loc/english.loc.xml`).
- The `(translate)` placeholders of the maps' own `Local/*/ITEMS.XML` (keyed by the old item ids) were left as the author had them: they were placeholders already.
- The game's own `.loc` lookup of `CKStonehenge1/2` names: they inherit `Stonehenge`'s display name, whose HD translation is keyed by `Stonehenge class name`.

## Pending

- The title of each edition in `game.xml` has no language label (`wrap-map.js` adds one when editions share a mod); the three titles already differ.
- Version: the zips only say `Vanilla` and `.4` (ModDB's file number); `mod.json` says `1.0`. Update when Luken_SOD publishes the planned update.
