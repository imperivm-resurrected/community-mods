# Greek Civilization Mod 4.2 (Gabbo)

`ported/greek-civilization-mod/` = `shrink-mod.js` on the GameBanana 728851 zip (`originals/gamebanana/728851/`), then this folder copied over it:

```bash
node shrink-mod.js <unzipped 4.2> "<HD game>" ../community-mods/ported/greek-civilization-mod --id greek-civilization-mod --name "Greek Civilization Mod" --version 4.2 --category Civilizations \
  --exclude "mod/*,logs/*,update.xml,README.txt,LEGGIMI_GREEKMOD.txt,GREEKMOD_MANIFEST.json,imperivm-mod.ini"
```

- `mod.json`: the one in the zip, with the GameBanana category name (`Civilizations`) and the port credited.
- `DATA/CLASSES/BASETAVERN.SC.XML`: the mod's, with the entity path HD itself has broken (`Buildings/Tavern/Tavern_as…`, there is no such folder) pointing to `GTavern`, like Imperivm Legacy's. Nothing else changed.

## What a Resurrected mod cannot carry

The zip also brings an engine hook (`winmm.dll`, which builds `gbr_GreekMod_*.exe` from the player's `gbr.exe`), `imperivm-mod.ini`, `config.ini` and `mod/` (options menu with autosave, language selector, windowed mode: Open Imperivm and Syncrash). A mod cannot ship executables, and Resurrected has its own `winmm.dll`, so those are **not** ported: units, buildings, classes, AI scripts, texts, voices, sounds, music, terrains, graphics and the 2.5-based scenarios/adventures are.

## Greece in the lobby (civs/greek.json)

In 4.2 the Greek faction sits in the Imperial Rome slot: its classes have `race="ImperialRome"` and the letter `H` (`HTownhall`, `HHoplite`), the scripts say `Greece = ImperialRome`, and Gabbo's engine hook shows it in the lobby. A Resurrected mod declares it: `civs/greek.json` (`base: ImperialRome`, `letter: H`, `template: Greek`, `replacesBase: true`, index 31; CGWAR has `greece` 30 with its own race, so the two mods are `incompatibleWith` each other). Greece is its own civilization in the lobby and Imperial Rome no longer shows there, as in 4.2; its classes keep `race="ImperialRome"` so the ~190 script references to ImperialRome keep working untouched. The city and villages are the mod's own "Greek Town N" / "Greek Village N" of `Packs/RandomMapSettlements.bfhp`.
