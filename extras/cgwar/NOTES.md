# CGWAR - Greek civilization Mod v6 (Camarada, Gurkhan, Razor, WARRIOR4444)

Row 5. Built with `tools/port-140.js` and then `tools/cgwar-greece.js` (see docs/BIG-MODS.md, *Mods made for 1.40*); this folder is what is done by hand on top. The old notes are in docs/BIG-MODS.md and in `tools/cgwar-greece.js`; this file only has what is pending.

## Rebuild

```bash
mkdir originals/cgwar-src && bsdtar -xf "originals/forum/t1354/files/CGWAR - Greek civilization Mod  v.6.rar" -C originals/cgwar-src
node tools/port-140.js "originals/cgwar-src/CGWAR - Greek civilization Mod  v.6" ported/cgwar --id cgwar --name "CGWAR - Greek civilization Mod" --version 6 --category Civilizations
node tools/cgwar-civs.js
node tools/cgwar-greece.js
node tools/cgwar-independent.js
```

`cgwar-civs.js` goes before `cgwar-greece.js`: that one throws the mod's Rome files away. The port is rebuilt in `ported/cgwar` (git-ignored); `cgwar-civs.js` keeps what it stages in a temporary folder, so it writes nothing in `originals/`.

## What `tools/cgwar-independent.js` does (AGENTS.md, *Civilizations are independent*)

`tools/mod-class-diff.js` against the official 1.40 says the CGWAR changes **no stat of any game civilization**: its classes are Greece's (`K*`), Imperial Rome's walls it redrew, and the Rome branch (`Technology_of_Rome_Buildings.vs` on `RArena`/`RBarracks`/`RBlacksmith`, not ported). So there is nothing to clone from the other civilizations. What it did change are files of the game, for everyone:

- **Scripts** at the game's paths: only the Greek insertions stay, as patches (`BARRACK_TRAIN_VERIFY` and `VILLAGE_TRAINPEASANT` by hand in `extras/cgwar/patches/`: their Greek code needs variables the mod declared at the top; `RPRIEST_IDLE`, `UNIT_ADVANCE`, `UNIT_ATTACK`, `UNIT_ENGAGE`, `UNIT_STAND_POSITION`, `UNIT_ON_KILL`, `SQUADMONITOR`: the Ares guard mutation, Combative Spirit, the oracle...). **Left out**: the mod's general tuning of `GROUP_DETACH`, `HERO_LEAVE_ARMY`, `HORSE_IDLE` (galop instead of move), `ONFINISH_RESEARCH`, `UNIT_ATTACH`, the non-Greek parts of the others (healing items in the AI's squad monitor, the Teuton mutation in `UNIT_ADVANCE`/`ATTACK`: the Teutons are the game's).
- **`items.xml`, `counterunits.xml`, `placeobjects.xml`, the editor's INI lists**: only what the mod added (16 items, the counters of the game's units against Greek ones, the Greek outpost in the three blocks of the random map, 33 editor icons and sounds), as patches.
- **Left out**: the animations the mod added to units of the Britons, Egyptians, Germans, Gauls and Romans (`units/*/*.ent.xml`, a `ToAttack` row), the Roman arena, houses and temple art, `baseruins` and the two fountains (other items), `mainmenu.ini`, `copyrights.txt`. They change the game's units for every civilization.
- **Own names**: `GreekHero` is `KGreekHero`; the commands file is `GREECE_CGWAR.XML`; the icons `greek_frame`, `imperial` and `olympic games` are `*_cgwar` (the 1.8's are `*_g18`); the references follow (`tools/lib/ported-patch.js`, `tagFiles`).

Checked 2026-10-23: `shared-paths.js` finds nothing shared with HD (the menu skin, `currentlang/`, aside), and nothing with the Greek Mod 1.8. Re-checked 2026-10-25 against the 4.2 as it is built now (`ported/greek-civilization-mod`): 0 class ids in common, and the only shared paths are the menu skin (`currentlang/menubackground*.bmp`). No `incompatibleWith`.

## Imperial Rome (CGWAR) (`tools/cgwar-civs.js`)

The mod let Republican Rome become Imperial or Republican by researching `Imperial_Administration` / `Republican_Administration` at the Arena, and `Technology_of_Rome_Buildings.vs` (a behavior of `RArena`, `RBarracks`, `RBlacksmith`) switched commands on and off. The choice is not ported (the lobby is the choice). `civs/cgwarimperial.json` ("Imp. Rome (CGWAR)") is a clone of HD's Republican Rome (`tools/lib/clone-civs.js`) with the Imperial branch from the start:

- On: what the script enables for the Imperial branch, as the mod has it (sources `RArena`/`RBarracks`/`RBlacksmith`, which in HD were Imperial Rome's `MArena`…): `hireheroM` (hero `ImperialRomanHero` and its `MHero*` children), `MGladiator Shows`, Hire Liberati, Liberati guild, Military Academy, Standartization I-III, Roman Velit, Roman Praetorian, `trainMVelit`, `trainMPraetorian`.
- Off: the 14 commands the script keeps off for it, read from the script by the tool (`hireheroR`, `RGladiator Shows`, Rome Training 1/2, Veteran Offence/Defence/Health, Roman Full Armor, Roman Chariot Wheels, `trainRGladiator`, `trainRTribune`, Equip Chariot, and the two choosing researches). The Republican hero children (`RHero*`) are still cloned, as in the 4.2's Imperial Rome.
- `RVelit`, `RPraetorian`, `ImperialRomanHero` (race `ImperialRome` in HD) have the Republican Rome race in the staged data so the clone takes them; the game's classes are not touched.
- The requirements on "Imperial Administration" (`ReqSet` in the researches, and in the Liberati's `trainex` parameter) are removed: nothing researches it. `verify_trainex.vs` and `verify_research.vs` are the game's (the mod's checks of the choice are not shipped).
- Prefix `Cgw` derived from the id `cgwarimperial` (an id `imperial_…` would give `Imp`, GBR Tactics'); no `index`: the engine assigns it. Greece keeps `K` and 30.
- The mod changes no other class of Republican Rome (only the three above, by adding that behavior), so there are no base-class changes inside the copy.

**Republican Rome (CGWAR) is not made.** The mod's Republican side is HD's Republican Rome with the Arena/Blacksmith/Barracks costs and requirements of `ARENA.XML` and `BLACKSMITH.XML` changed (Veteran Offence 2000→3000, Gladiator Shows without the level-4 heroes...). If it is wanted, it is one more entry in `CIVS` of `tools/cgwar-civs.js` (`hide` the Imperial set); decision for the maintainer.

### Checked / tried

- Built 2026-10-25: `port-140.js` → `cgwar-civs.js` → `cgwar-greece.js` → `cgwar-independent.js`. `validate-mod.js` of `dev-villoh` (`--game`, `--data originals/game-data/DATA`): 0 errors, 29 warnings (animation frames of the Greek units, as before). The rest of the port is byte-for-byte what it was without this step (the only new files are `civs/cgwarimperial.json`, `DATA/COMMANDS/CGWARIMPERIAL.XML` and 82 `DATA/CLASSES/CGW*.SC.XML`).
- `node tools/shared-paths.js cgwar`: 0 class ids in common with the game and with every other port; the only shared paths are the menu skin (`currentlang/menubackground*.bmp`).
- **Tried in game** (2026-10-25, Wine, `dev-villoh` DLL, log level `debug`, profile "No profile" with `cgwar` installed from `ported/cgwar`): Imperial Rome (CGWAR) and Greece (CGWAR) both show in the room dropdowns ("2 mod civilizations added"); the engine gave `cgwarimperial` index 10 (no `index` in its `civs/*.json`), `greece` keeps 30. Two skirmishes of about 35 s each, one with Imperial Rome as the human player against the Greek AI and one with the roles swapped (Imperial Rome as AI): they load (5.4 s and 2.8 s), the 82 `Cgw*` classes resolve to race 10, and the log has no `compilation error` and no script error. The maintainer saw nothing wrong on screen.
- Log notes: `gameres/cmdbar/corners/imperialrome0-3.rle` are looked up and do not exist when Greece is the human player. They are optional corner decorations; HD ships only `GAUL1.RLE` and `GAUL3.RLE`, the original CGWAR has none, and the name is the base race's (`imperialrome`), so it cannot be fixed for Greece alone without a file at a path the game's Imperial Rome shares. Left as it is.
- **Not tried in game**: the full list of commands of Imperial Rome (CGWAR) one by one (hire hero, Liberati, Military Academy, Velit/Praetorian in the barracks) beyond what the maintainer saw; a long game (the AI runs HD's Republican Rome AI: it does not know Velites/Praetorians/Liberati and may ask for orders this civilization does not have: check it past minute 35 s); save/load; rooms with two sets and the set filter (#38); Greek AI against Greece (4.2) and Greece (CGWAR) in a full game; the three Greek mods together (#3, #4).

## Pending
- The 4.2 comes from the same line (`KAresGuard_*`, `KPeltast`, `KSlinger`, `KToxotai`, `KWalls`, `NSecuaz`, `NVael`, the voice, `greece.xml`) and renames its own (`tools/greek-4-2.js`, `tagCollisions`); checked with `shared-paths.js`, see above. `NSecuaz` and `NVael` are race `Egypt` here (editor units) and 300 Espartanos places `NSecuaz`. Maps that `requires` the CGWAR were not re-checked after this change (no class they place was renamed: `cgwar-civs.js` only adds `Cgw*` classes).
- Research and command names two Greek mods define (`Olympic Games`, `Greek archers`, `convert_to_melee`; items `Charm of Athena`...): the names are the game's keys; shown by `node /tmp/names.js`-style checks (no tool yet).
- Not tried in game with another civilization mod active (the 1.8 is the one to try it with).
