# CGWAR - Greek civilization Mod v6 (Camarada, Gurkhan, Razor, WARRIOR4444)

Row 5. Built with `tools/port-140.js` and then `tools/cgwar-greece.js` (see docs/BIG-MODS.md, *Mods made for 1.40*); this folder is what is done by hand on top. The old notes are in docs/BIG-MODS.md and in `tools/cgwar-greece.js`; this file only has what is pending.

## Rebuild

```bash
mkdir originals/cgwar-src && bsdtar -xf "originals/forum/t1354/files/CGWAR - Greek civilization Mod  v.6.rar" -C originals/cgwar-src
node tools/port-140.js "originals/cgwar-src/CGWAR - Greek civilization Mod  v.6" ported/cgwar --id cgwar --name "CGWAR - Greek civilization Mod" --version 6 --category Civilizations
node tools/cgwar-greece.js
node tools/cgwar-independent.js
```

## What `tools/cgwar-independent.js` does (AGENTS.md, *Civilizations are independent*)

`tools/mod-class-diff.js` against the official 1.40 says the CGWAR changes **no stat of any game civilization**: its classes are Greece's (`K*`), Imperial Rome's walls it redrew, and the Rome branch (`Technology_of_Rome_Buildings.vs` on `RArena`/`RBarracks`/`RBlacksmith`, not ported). So there is nothing to clone from the other civilizations. What it did change are files of the game, for everyone:

- **Scripts** at the game's paths: only the Greek insertions stay, as patches (`BARRACK_TRAIN_VERIFY` and `VILLAGE_TRAINPEASANT` by hand in `extras/cgwar/patches/`: their Greek code needs variables the mod declared at the top; `RPRIEST_IDLE`, `UNIT_ADVANCE`, `UNIT_ATTACK`, `UNIT_ENGAGE`, `UNIT_STAND_POSITION`, `UNIT_ON_KILL`, `SQUADMONITOR`: the Ares guard mutation, Combative Spirit, the oracle...). **Left out**: the mod's general tuning of `GROUP_DETACH`, `HERO_LEAVE_ARMY`, `HORSE_IDLE` (galop instead of move), `ONFINISH_RESEARCH`, `UNIT_ATTACH`, the non-Greek parts of the others (healing items in the AI's squad monitor, the Teuton mutation in `UNIT_ADVANCE`/`ATTACK`: the Teutons are the game's).
- **`items.xml`, `counterunits.xml`, `placeobjects.xml`, the editor's INI lists**: only what the mod added (16 items, the counters of the game's units against Greek ones, the Greek outpost in the three blocks of the random map, 33 editor icons and sounds), as patches.
- **Left out**: the animations the mod added to units of the Britons, Egyptians, Germans, Gauls and Romans (`units/*/*.ent.xml`, a `ToAttack` row), the Roman arena, houses and temple art, `baseruins` and the two fountains (other items), `mainmenu.ini`, `copyrights.txt`. They change the game's units for every civilization.
- **Own names**: `GreekHero` is `KGreekHero`; the commands file is `GREECE_CGWAR.XML`; the icons `greek_frame`, `imperial` and `olympic games` are `*_cgwar` (the 1.8's are `*_g18`); the references follow (`tools/lib/ported-patch.js`, `tagFiles`).

Checked 2026-10-23: `shared-paths.js` finds nothing shared with HD (the menu skin, `currentlang/`, aside), and nothing with the Greek Mod 1.8. With the 4.2 it still does (see below): `incompatibleWith` the 4.2 only.

## Pending

- **Rome's Imperial branch.** The mod lets Republican Rome turn Imperial by researching `Imperial_Administration` at the Arena (`hireheroM`, `trainMVelit`, `trainMPraetorian`, Liberati, Military Academy, Roman Velit/Praetorian...). The choosing is not ported; the content is: an "Imperial Rome (CGWAR)" civilization with those commands built in (AGENTS.md, *What a civilization is, it is from the start*). Not done yet.
- The 4.2 shares files and class ids with this mod (it comes from the same line: `KAresGuard_*`, `KPeltast`, `KSlinger`, `KToxotai`, `KWalls`, `NSecuaz`, `NVael`, the voice, `greece.xml`): it has to rename its own. `NSecuaz` and `NVael` are race `Egypt` here (editor units) and 300 Espartanos places `NSecuaz`.
- Research and command names two Greek mods define (`Olympic Games`, `Greek archers`, `convert_to_melee`; items `Charm of Athena`...): the names are the game's keys; shown by `node /tmp/names.js`-style checks (no tool yet).
- Not tried in game with another civilization mod active (the 1.8 is the one to try it with).
