# GBR Tactics 2.4 (zeloslaw)

Row 198. `GBR-Tactics-v.2.4-US.exe` (44.7 MB, [ModDB](https://www.moddb.com/mods/gbr-tactics2/downloads/gbr-tactics-download)), a mod for Imperivm III 1.40 (*Las Grandes Batallas de Roma*, Spanish) that adds a full English translation, new units and tactics, many artefacts and a rebalance. Permission asked: not answered. No license in the download (the Readme only thanks Jvlivs Caesar (sarco) and skipi).

**This port is the mod's balance as eight civilizations of its own, next to the game's** (AGENTS.md, *Civilizations are independent*). The game's eight are not touched.

| `id` | Prefix | Base | Lobby name |
|---|---|---|---|
| `gaul_gbrt` | `Gau` | Gaul | Gaul (GBRT) |
| `republic_gbrt` | `Rep` | RepublicanRome | Rep. Rome (GBRT) |
| `imperial_gbrt` | `Imp` | ImperialRome | Imp. Rome (GBRT) |
| `carthage_gbrt` | `Car` | Carthage | Carthage (GBRT) |
| `britain_gbrt` | `Bri` | Britain | Britain (GBRT) |
| `iberia_gbrt` | `Ibe` | Iberia | Iberia (GBRT) |
| `egypt_gbrt` | `Egy` | Egypt | Egypt (GBRT) |
| `germany_gbrt` | `Ger` | Germany | Germany (GBRT) |

The prefixes are derived from the ids by the SDK (first three letters, so the ids differ in them) and there is no `index`: the engine assigns it. They are multi-character prefixes, so they need the Resurrected build that supports them (the SDK says: automatic indices and multi-character prefixes need the matching new `winmm.dll`). The Readme's letters table has no row for them (no letter or index to reserve); the rows to add to `sdk/prefixes.md` are in `PR-NOTES.md`.

## Rebuild

The installer is a Gentee SFX (not Inno Setup/NSIS: bsdtar and 7z cannot open it). It runs with no window under wine and installs without asking anything, so it was run in a throwaway prefix:

```bash
export WINEPREFIX=$HOME/.cache/wine-gbr
wine originals/forum/gbr-tactics-2-4/files/GBR-Tactics-v.2.4-US.exe        # installs to C:\Program Files\Imperivm - Las Grandes Batallas de Roma
mkdir originals/gbr-tactics-2-4-installed && cp -r "$WINEPREFIX/drive_c/Program Files/Imperivm - Las Grandes Batallas de Roma/." originals/gbr-tactics-2-4-installed/
node tools/flatten-paks.js originals/gbr-tactics-2-4-installed originals/gbr-tactics-2-4-flat
node tools/port-140.js originals/gbr-tactics-2-4-flat originals/gbr-tactics-2-4-pristine --id gbr-tactics --name "GBR Tactics" --version 2.4 --category "Gameplay & Balance"
node tools/gbr-tactics.js
```

The installer also writes a Start-menu entry and a `.desktop` file for its uninstaller into `$HOME` (`~/.local/share/applications/wine/Programs/`, `~/.config/menus/applications-merged/`): delete them after.

- `tools/flatten-paks.js` unpacks the 9 packs in name order. `Z-RandomMap.pak` is **LZIS-compressed** (the engine reads that transparently, `extract-data.js` does not): `tools/lib/lzis.js` decodes it (format from the decompiled `CLzisFile`/`LzisDecompress`, tables read from `gbr.exe`; checked on this pak: it gives a valid `HMMSYS PackFile`).
- `tools/port-140.js` now accepts a mod with no `rle.mmp` of its own when its sprite headers are byte-for-byte the game's (all 86 of this mod are HD's and 1.40's).
- `tools/gbr-tactics.js` makes the civilizations (below). It reuses `tools/lib/clone-civs.js` (now it takes civs with no `letter` and no `index`), `tools/lib/ported-patch.js` (`tagCollisions` learned `gameDirs`: a file the mod put in a folder of the game's is renamed alone, not the folder) and writes `raw/gbr-tactics-left-out.txt`.

## What the `.exe` did, and what the port cannot carry

It copied 9 packs to `Packs\` (`gbrt-data`, `e-data`, `Z-Buildings`, `Z-Units`, `Z-Outlines`, `Z-UI`, `Z-Sounds`, `Z-RandomMap` (LZIS), `Z-GBRT` (empty)) and `local\us.pak` (the English language pack, 438 files: `HELP.XML`, `SRCSTRINGS.XML`, `TIPS.XML`, `CREDITS.TXT`, the English voices), a `Settings.ini` with `Language=US` (and `ChangeLang.bat` to swap it), a player profile, an uninstaller (`uninstall.exe`, registry key `Software\...InstPath`) and `GBRTAutoUpdate.exe`, a network updater. The Readme tells you to start `gbr.exe`, which the installer does not ship (it is the game's). None of the executables, the batch file or the updater can be in a mod. The English texts and voices are not ported: HD has its own English. The menu background is not ported either (cosmetic; it replaces the game's).

## What the port has

- **The eight civilizations**: for each, the game's classes with the mod's version over them (stats, costs, specials, hero skills) cloned from HD (`clone-civilization.js`), plus the mod's own classes for it (long bow archers, guards, captains, transport ships, extra heroes, tax collectors, the Teuton tent...). What the mod changed in the base classes (`Hero`, `Catapult`, `Ranged`, `Sentry`, `Melee`...) is written **inside each copy**, never in HD's classes. The same for the `<method>`/`<behavior>` elements of the base classes that run a script the mod edited (`unit_engage`, `melee_attack`, `unit_on_kill`... 398 of the game's scripts): each copy runs the mod's version, under a name of its own (`..._gbrt.VS`).
- **Classes of nobody's** (`GreatTavern`, `IronMine`, `Prisoner`, `BaseTemple`, `ShipTransport`...): shipped as they are. Their commands are `DATA/COMMANDS/GBRTACTICS.XML` and patches that add them to the game's.
- **Items**: the 112 items the mod adds (all with a new id) as a patch on `ITEMS.XML`, and 4 formation entries on `FORMATIONS.XML`. Item scripts and icons they use are in the port.
- **Sounds and entities**: the new sounds (209), voices (`SOUND ENTITIES`) and 285 interface icons. The 26 sounds and 165 sound entities that replaced the game's are renamed (`..._gbrt`) and only the copies use them.
- **A new random map type**, *Wetland Area* (`DATA/RANDOMMAP/WETLAND AREA.RM.XML` and its mini-map pictures): it is additive.

### Decisions (the maintainer chose these with the table in the issue)

1. All eight civilizations at once.
2. **Shared tables: base-class changes inside the copies; the mod's new items, formations as patches; edits of the game's own are not ported.** Not ported: the 42 game items the mod changed (`Bear teeth amulet`, `Healing herbs`... and their item scripts), 16 lines of `SKILLS.INI` and 5 of `UNIT_SPECIALS.INI`, the `CONST.INI` tuning, the infobar and menu lists in `DATA/INTERFACE`, `BONUS.XML` and `BONUSSCRIPTS`, `COUNTERUNITS.XML` and two formation entries (`line`, `front`).
3. **Sounds, scripts and AI: case by case.**
   - Files of the mod at a game path with other bytes become copies (`_gbrt`) when something of the mod uses them, and are left out when nothing does (343 files, listed in `raw/gbr-tactics-left-out.txt`).
   - The mod's AI (`DATA/AI`, 72 scripts: the economy loops, `SquadMonitor`, the `TS_*Tactic` tactic scripts) is **not** ported: the eight civilizations play with the game's AI (`"ai": true` makes it play with their classes). Doing it would take the `GR18_*` route (a copy of each script plus a patch on each game helper that hands the settlement over), which cannot be tested without running it.
   - `GAMESCRIPTS` (the 4 victory modes, 2 edited), `PATHFINDERINIT.VS`, `TERRAINS.XML`, `SETTINGS.XML`, `CURSORS.XML`, the tutorials, `RANDOM_MAP.OBJ.XML`, the edited random map definitions: they change the game for everybody.
   - The mod's TAxeman entity (`UNITS/TAXEMAN/TAXEMAN.ENT.XML`) is dropped: it says the Walk sprite has 10 rows and animates 20 frames, and the game's has 12 (the validator says it would read rows that do not exist). The Germanic axeman keeps the game's walk timing.
   - `GauDLleldoryn` named `dlleldoryn_follow.vs`, which the mod never shipped: that method is gone.

### What the first games in the engine showed (Logs\vxlog.log, the engine's own log)

The game's compiler and loader are stricter than 1.40's. Found by playing, fixed in `tools/gbr-tactics.js`:

- **Scripts that do not compile**: seven scripts of the mod used a variable they never declare, declared one twice or (the two `ASSASSIN` item scripts) named a header parameter other than the one the body reads. A match does not start while one of the scripts of a chosen civilization fails. Each fix is the missing or duplicate declaration. `OUTPOST_IDLE_gbrt.VS` lost the mod's unfinished *gold selling* block (it reads `gold_sales` and `food_income`, which nothing declares; the line that set one is commented out in the mod itself).
- **Text after `</class>`**: the mod's `BSentry`, `ESentry`, `TSentry`, `ISentry` and `EChariot` end with a stray element after `</class>`. 1.40 stopped reading at `</class>`; HD refuses the whole class and the match falls back to the menu. It is cut.
- **Commands of the mod for the game's base classes** (`Hero`, `Outpost`, `Gate`, `BaseVillage`, `BaseTownhall`, `BaseShipyard`, `BaseTavern`): 32 commands (`retreat_notai`, `great_charge`, `form-*`, `tribute_*`, `burn`, `militia_*`, gate levels, `Buy Sentry`...) were lost by the clone step, which only takes commands whose sources are the civilization's own classes (`Unknown Command: retreat_notai`). They are in `DATA/COMMANDS/GBRTACTICS.XML` with the port's classes under each base class as sources: never the game's, so the game's heroes and outposts do not get them.
- **Doubled behaviors**: the mod's classes list its own version of a `<behavior>` the game's parent class also has (`townhall_behavior_guard.vs`, `outpost_behavior.vs`...). In the mod both were the same path; here the copy has another name, both would run, and a class takes 8 behaviors in all, the inherited ones included (`class can't inherit behavior from parent. Too many behavior scripts`). 215 such copies were removed from 184 classes and the game's behavior stays. **What the mod changed in those behaviors is therefore not ported** (townhall guard and sentry control, settlement ambience, outpost behavior and guard, and the Gaul and Iberian town hall autotrain variants). No class is over 8 now.

Only the warnings that come from the game's own classes remain in `vxlog.log` (icons, `UIShowDelay`, `field02.ogg`, `Could not parse random map xml`): they appear without the mod.

## Independence check

`node tools/shared-paths.js gbr-tactics`: **no collisions** with the game or with any other port. Names that another port of ours already had with other bytes, renamed in this one (`tagCollisions`, tag `gbrt`): the classes `CaptainOutpost`, `IronMine`, `LongRanged`, `Piked`, `SentryOutpost`, `ShipSFishing`, `ShipTransport`, `TraderRescue` (MCI / Imperivm Legacy have the same ids), 464 sound, script and icon files, 6 orders and 32 items (`"<name> (gbrt)"`). The eight civilizations' classes, commands and entity names are theirs by prefix. **Two civilization mods active together has not been tried in game.**

## In game

**Tried (Wine with Proton GE 11 on Linux, HD 1.0.1 build 6add2f25, `mods\gbr-tactics` in *Additional content*):** the lobby lists the eight civilizations; random-map matches start and load (5.3 s, then 1.7 s) with GBR civilizations in the slots, and the maintainer played and found it working (a short impression, not a test plan). The first attempts did not start: see *What the first games in the engine showed*, above; every cause is fixed in `tools/gbr-tactics.js`. `Logs\comp_out.txt` has no compile error and `Logs\vxlog.log` only the game's own warnings.

**Not known to have been tried:** two civilization mods active together (the Greek mods...), multiplayer between two players, the AI playing a GBR civilization (it plays with the game's scripts), saving and loading a game, a long game (the behaviors of the mod only show over time), the Great Tavern, the Iron Mine and the hero skills one by one.

`validate-mod.js --game ... --data originals/game-data/DATA`: **0 errors, 10 warnings** (all in the mod's own entity files: `CCATAPULT` `columns` and frame sentinels, `BSENTRY2` / `ESENTRY2` frame counts, and `Prisoner` without an entity). `node tools/shared-paths.js gbr-tactics`: no collisions.

Things the validator cannot see and may not work:

- the mod's `SUBAI` scripts (units, buildings, heroes) were written for 1.40's functions; those that call something HD no longer has will fail when they run, not when the class loads;
- the scripts may test the civilization by letter or by class name (`GetRaceStrPref`, `"GArcher"`...). The copies have another prefix; `clone-civs.js` rewrote the order names in the scripts it copied per civilization (`*_<CIV>_GBRT.VS`), the others were not read line by line;
- the mod's item scripts (27 new) got the signature line `port-140.js` adds when they lacked it.

## Pending

- **The mod's AI** (see above), the changed items, skills and unit specials, and the *Imperivm 2* old-school mode orders (`ReqModeImp2`, left out by `clone-civs.js`).
- `COUNTERUNITS.XML` of the mod: the counters between the mod's units and the game's. The copies have no counter entries (HD's file knows the game's class ids only); a patch that adds one `<unit class="GauArcher">` per copy with the base's counters would do it.
- `stay_hidden`: the mod's classes name a command no file of the mod or the game defines (`Unknown Command: stay_hidden`); it was already missing in the original.
- The Great Charge of the cavalry and the veteran/leader promotions of the Readme live in `UNIT_ON_KILL_gbrt.VS` and in the base-class hooks above: try them.
- *Pending: independence*: nothing overlaps with another mod. `incompatibleWith` is not used.
- Maps that place the mod's classes: the mod ships none, and no map of ours requires it.
