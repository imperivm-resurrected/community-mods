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

## Game modes (tools/greek-mod-fixes.js)

4.2 replaced the game's five victory scripts with nine of its own (`1 VARIOS` … `9 CUSTOM`), kept its edited copies of the old five inside `data.pak` as `.VX` (nothing reads them) and its old pack hid the game's. Most maps say `victory_condition="1 Elimination"` (228 of the 415 maps in `ported/`), so with that script hidden a map starts and goes back to the menu at once, with nothing in the log. `shrink-mod.js` carries over the hiding; `node tools/greek-mod-fixes.js` takes the five out of `hidden.txt` (the game's own scripts, as the maps were made for) and drops the `.VX`. The lobby lists them next to 4.2's nine.

## Independence (tools/greek-4-2.js, AGENTS.md)

`tools/greek-4-2.js` rebuilds `ported/greek-civilization-mod` from `originals/greek-4-2-pristine` (the port as shrink-mod, the copy of this folder and `greek-mod-fixes.js` leave it; hard links) and makes **every civilization its own**:

- **The game's classes** the mod changed are cloned from HD with the mod's version on top (`tools/lib/clone-civs.js`, the SDK's `clone-civilization.js --all-orders`), and what it changed in the base classes (`Hero`, `Melee`...) is written inside each copy: Gaul `gaul42` (X), Britain `britain42` (Y), Iberia `iberia42` (Z), Egypt `egypt42` (1), Germany `germany42` (3). The mod's own new classes of those races (heroes, Apollonia villagers...) are copies too.
- **Rome and Carthage**: the mod let the player pick the branch at the town hall (`ChooseXxx`), per-building scripts hid what the other branches own. Each branch is a civilization with only the commands its branch left visible (`tools/lib/branch.js` reads the scripts): Republican `romerep42` (4), Imperial `romeimp42` (5, hero `ImperialRomanHero`), Punic `romepun42` (6, `AncientRomanHero`), Numidian `carthnum42` (7), Mauritanian `carthmau42` (8, `MauritanianHero`). Nothing at a town hall offers to change it. The "Imperivm 2" old-school orders (`ReqModeImp2`) are not in them.
- **Greece** (`greek`, H, index 31): its classes have race `greek`, in no one's slot; its walls, gates and tower (the mod drew them over Imperial Rome's ids) are `H*` classes; its AI scripts run as `GR42_*`; its random map towns are "Greek Gabbo Town N"; its hero names are `HName00x`.
- **The game's files** the mod replaced: only what is Greek stays, as patches (Olympic Games, the kill bonuses by hand in `extras/greek-4-2-hand/`, the counters, items, outposts of the random map, the editor icons); the rest, `hidden.txt` and the game packs (`Packs/*.bfhp`) are left out (`raw/greek-4-2-left-out.txt`). The menu skin: images stay at the game's paths (the content manager lets the player choose), its layout is a patch of the keys it changed.
- **Names**: what the CGWAR or the 1.8 also has with other bytes (classes, art folders, icons, researches, items, maps) is renamed `_g42` / `(g42)`; the mod's versions of the game's official adventures stay, with "(Gabbo)" in their title.

Tried in game (2026-10-23, Linux, 1920x1080): the lobby with the three Greek mods active (all the civilizations show, no patch errors, the content manager shows no problem), a skirmish with several civilizations that hung because of script patches of the CGWAR that did not compile (fixed, see its NOTES). **Not tried**: a game with every civilization of the 4.2, the Greek AI, the Roman branches' barracks, heroes.

Left out, to port later: the mod's AI for the game's civilizations (they use HD's), the game modes' rules for the clones (Imperivm 2, Liga), the mod's changes to the game's scripts for everybody (260 of them), HD's `druid_revitalize.vs` for the Greek priest (needs a special only the old engine hook declared: the two `revitalize` methods are gone), `Spartacus`, `Fisherman`... (neutral, renamed).

## Rome's branches and Carthage's (civs/*.json, tools/greek-mod-fixes.js)

In 4.2 Rome (Republican, Imperial, Punic) and Carthage (Numidian, Mauritanian) are picked before the lobby: Gabbo's engine hook leaves the choice in the sentinel `rand(776 + player)`, which five scripts read to research the branch's `ChooseXxx` at the start. Here they are lobby civilizations, variants (`variant`, `replacesBase`) of Republican Rome and Carthage: `RomeRepublican` 21, `RomeImperial` 22, `RomePunic` 23, `CarthageNumidian` 24, `CarthageMauritanian` 25 (Greece is 31). The five scripts ask `Mod_PlayerCiv(player)` instead of the sentinel (`greek-mod-fixes.js` rewrites them). A civilization that is not one of them (a map that fixes plain Rome or Carthage) gets no branch, as before, and the buttons at the town hall are still there.

The same script gives the renamed classes their old HD id as `altid` (HD misspells `TValkyria`, `CMacemen`, `BHighlandar`, `IDefendar`, `GTridentWarriar`, `BaseBoilding`; 4.2 fixes them and drops the old ones, so HD's scripts and maps could not create them).

## 00_Ludus_Martis (the Community Mod's build, tools/greek-mod-fixes.js)

The map is Ferónidas's ("[CM] Ludus Martis"): the Community Mod v12 ships it (1,370,141 bytes) and it plays there. 4.2's package carries another build of it (1,369,117 bytes, adapted by someone: it swaps classes only the Community Mod has for the game's, translates the description and adds items and two sequences). That build has summon items whose scripts place `cRScout56` (and `cGHorseman56`, `cICavalry56`, `cCNumidianRider56`, `cTTeutonRider56`, `cTTeutonWolf56`, `cTValkyrie56`), classes no mod we have defines (4.2, Community Mod v12, Caesar Mod: not there); the game logs `No matching function with name cRScout56` and goes back to the menu one second after starting, also with 4.2's package installed unchanged as a mod (GameBanana 728851), so it is not the port. Seven copies of the game's horses under those ids removed the log errors but not the exit.

So the port ships the Community Mod's own build instead, unmodified, from its v12 package, plus the three hero classes it needs and the game does not have (`CHero5` Candecar, `EHero4` Menhotep, `BHero4` Calgacos; a few lines each over a game hero's entity). Tried in game with the Greek Mod: it works.

## Pending: independence (AGENTS.md, *Civilizations are independent*)

Not independent yet: it is `incompatibleWith` the CGWAR and the Greek Mod 1.8. Greece (`greek`, 31, letter `H`) takes Imperial Rome's slot, and Rome's three branches and Carthage's two (`civs/rome*.json`, `carthage*.json`, 21-25) are variants that replace the base in the lobby. Target: the game's 8 untouched and every civilization the mod adds or changes as its own, next to the game's. Measured against HD (class files with different parameters): Gauls 17, Britain 15, Carthage 17, Egypt 5, Germany 14, Iberia 11, Republican Rome 16, Imperial Rome 23 (the `M*` Greek-art walls among them), 67 shared base classes (`BaseBarracks`, `BaseTownhall`…). Plan as in `extras/greek-mod-1-8/NOTES.md`: each as "<civ> (Greek Mod 4.2)" cloned from HD with the mod's changes, shared base classes changed only inside the copies, game-wide files only as patches. The old-engine trick of the sentinel `rand(776 + player)` and the five scripts that read it goes away: the lobby is the choice.

Open: the ported maps that `require` this mod place its `H*` classes; they must keep working after the rename (see AGENTS.md, *Open*).

