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

## Greece in the lobby

In the 1.40 mod and in 4.2 the Greek faction is the Imperial Rome slot (its classes have `race="ImperialRome"` and the letter `H`: `HTownhall`, `HHoplite`; the game's Imperial art in `UI/INFOBAR/IROME` is the Greek one) and the engine hook renamed it. A Resurrected mod does that by declaring the civilization: `civs/greece.json` has `base: ImperialRome`, `letter: H`, `template: Greek` and `replacesBase: true`, so "Greece" takes the place of "Imperial Rome" in the lobby (the example in the SDK's *Civilizations*, *Variants*). Rome keeps choosing Punic, Republican or Imperial at its town hall (`RHT_SCELTA_ROMA.XML`). Index 31 (CGWAR uses 30). Untested in game.
