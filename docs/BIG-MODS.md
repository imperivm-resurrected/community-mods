# Mods made for 1.40

**English** · [Español](es/BIG-MODS.md)

Most big mods (MCI, CGWAR, AsvrMod, La Reconquista, GBR Tactics) were copied over an Imperivm III 1.40 install: loose `DATA`, `UNITS`, `UI`… folders and often their own `rle.mmp`. On HD they would undo its fixes, and their `.rle.mmp` sprites only work with their own `rle.mmp`. `tools/port-140.js` compares each file with HD **and** with 1.40, the version the mod was made on:

| The file | Result |
|---|---|
| Same as HD, or same as 1.40 (the mod didn't touch it) | Left out: the HD one stays |
| Only the mod changed it | The mod's |
| Both changed it | 3-way merge (`git merge-file`, 1.40 as base; XML without blank lines if that lines up better, as HD added one between every line of some entities). Where both touched the same lines: XML attribute by attribute (repeated tags told apart by `idx`/`name`/`id`), the mod wins a value both changed (a balance mod is about those values), and a hunk the mod only re-indented is HD's. Anything else goes to `raw/port-140/<id>.md` for review ([MCI's](../raw/port-140/mci.md)) |
| `.ini` | Key by key over the whole file (HD moved blocks around). `[Resolutions]` is always HD's: a 1.40 list starts the game at 640x480 |
| `.rle.mmp` sprites | Rebuilt as standalone `.rle` from the mod's `rle.mmp`; left out if the pixels are HD's (a mod can't replace a game sprite anyway) |
| `currentlang\*.loc.xml` | Only the entries that differ from the HD Spanish table, as `loc/spanish.loc.xml` (added to the game's, so HD's own texts stay) |
| Menu background | Drawn for 1024x768; fitted to the HD one, 1920x1080 on Steam (a loose `Currentlang/MENUBACKGROUND.bmp` over the pack's 1366x768): scaled to the height, the left half and the right border kept, the parchment between stretched |
| Classes in Latin-1 | Saved as UTF-8 (otherwise HD skips them without a word) |
| Entities naming `SHADOW.RLE` | Made `.rle`: HD only takes a mod's loose sprite with a lowercase extension (otherwise it looks for `SHADOW.RLE.bmp` and, for a building, crashes) |
| Item and victory scripts | Get the signature line HD needs |

Conflicts are resolved by hand in `extras/<id>/` (the final files, plus `mod.json` with credits and description); the tool copies them over its output, so the port can be rebuilt from the original download plus the repo. `ported/<id>/` of these mods isn't in git: it's mostly the authors' files and game data.

```bash
node tools/port-140.js <old mod folder> ported/<id> --id <id> --name "<Name>" --version <v> --category "<Category>"
```

The MCI ([extras/mci/](../extras/mci/)) is the first one: 1104 files from the 9.0 zip, 123 merged with HD, 30 resolved or fixed by hand (the HD guard post, gold selling, AI-only parry mode, kill statistics and sentry guards kept alongside the MCI's tributes, stances and veterans). Its own bugs from 1.40 are kept as they were (scripts it references but never shipped), except where HD would break: `GreatTavern`, a class that doesn't exist, is dropped from the random map (it would hang), and `beh_punto.vs` calls `CreateFeedback` instead of `PlaceFeedback`, which no game version has.

The CGWAR ([extras/cgwar/](../extras/cgwar/)) put Greece in place of Imperial Rome; here it is a new civilization (`civs/greece.json`, index 30, letter `K`) and Imperial Rome stays HD's. The mod also let Republican Rome turn Imperial or Republican at the Arena; that choice is not ported, [`tools/cgwar-civs.js`](../tools/cgwar-civs.js) (after `port-140.js`, before the next one) makes the Imperial branch the civilization `cgwarimperial` ("Imp. Rome (CGWAR)", prefix `Cgw` derived, index assigned by the engine). After that, [`tools/cgwar-greece.js`](../tools/cgwar-greece.js) makes the change: Greek classes get `race="greece"`, the Imperial pieces the mod redrew (walls, gates, tower, peasants) become `K*` copies so the city builder finds them by letter, the "Rome" merge (Republican Rome turning Republican or Imperial in the Arena), its AI scripts and the official adventures, conquest and random map towns it edited go, and the shared commands become patches that only add the Greek sources (the Greek-only commands go to `DATA/COMMANDS/GREECE.XML`). The mod's AI settlement scripts assume "Imperial Rome = Greece", and a Greek AI does see its base, Imperial Rome: they go in as `GR_*.vs`, so every other civilization keeps HD's AI. A patch on each HD helper (`ESH_*`) hands Greek settlements over with `AIRun`; the two main loops (`ES_Stronghold`, `ES_Village`) `Sleep()`, which crashes inside `AIRun`, so they go in `[EconomyScripts]` and a `GetEconomyScript.vs` patch picks them. Greece starts the random map in the mod's own Greek towns: `extras/cgwar/patches/randommapsettlements/` was made with the SDK's `create-template.js --base "Imperial Roman"` from an in-game dump (`Dump=randommapsettlements/maps/1/map.obj.xml`) with the mod's `RandomMapSettlements.bfhp`, where the Imperial Roman towns are the Greek ones, and their `M*` walls made `K*`. The maps made for it place `MWalls*`/`MTower`/`MGate*`, Roman again here: `wrap-map.js` switches them to `K*` in maps that need the CGWAR, which makes them *rewrite* (porter credited).

GBR Tactics 2.4 ([extras/gbr-tactics/](../extras/gbr-tactics/)) has no Greece: it is the game's eight civilizations as the mod has them, each its own next to the game's (`tools/gbr-tactics.js`). Its installer is a Gentee SFX that neither bsdtar nor 7z opens: it runs with no window under wine, so it is run once in a throwaway prefix and its files taken from there (steps in its `NOTES.md`). One of its packages is LZIS-compressed (`tools/lib/lzis.js`), and the game's compiler and loader refuse things 1.40's accepted (undeclared variables, text after `</class>`): the fixes are in the tool.

# Big mods made for HD

A mod made for HD (not 1.40) is reduced with the SDK's `shrink-mod.js`, which keeps only what differs from the game. Imperivm Legacy 2.4.1 ships as three installers (ENG, ESP, ITA; Clickteam, not Inno Setup, so `innoextract` fails): `7z e -t#` splits one into `.bz2` chunks, but it loses the file names, so the simplest way is to install it with wine (`WINEPREFIX=/tmp/wine-legacy wine <installer>`, to `C:\legacy`). The three installers only differ in the language package (`local\<language>.pak`, a chunk of ~19 MB: the one that differs between installers, `bunzip2` it after `7z e -t#`), so install one and copy the `.pak` of the others into its `local\` as `spanish.pak` and `italian.pak`.

```bash
node shrink-mod.js <installed mod> "<game>" ported/imperivm-legacy --id imperivm-legacy --name "Imperivm Legacy" --version 2.4.1 --category "Gameplay & Balance"
```

Then copy `extras/imperivm-legacy/` over the result: the 4 files with broken paths in the original mod (`BASETAVERN`, `RAMUNIT`, `RTHERMAE`, `FOG_OWNER_MARKER`) and its `mod.json`. `ported/imperivm-legacy/` (353 MB) isn't in git, like the 1.40 ones.

# Maps with Imperivm I classes

Some maps still place Imperivm I (*Celtic Kings: Rage of War*) classes that neither Imperivm III 1.40 nor HD has: Cartagonova has 482 `TeutonWolf`, 311 `GWFighter`, cliffs, rocks and heroes; the Imperivm II saga map Hispania has the old Viking Lord. `tools/imperivm1.js` builds the shared mod `ported/imperivm1-legacy` with them, so the maps stay untouched:

```bash
# once: both are free on ModDB, under Celtic Kings: Rage of War > Downloads (needs a browser: Cloudflare)
#   "Patch 1.16" (celtickingspatch116.exe) and "Celtic Kings: Rage of War Demo" (celtickingsdemo.zip)
node tools/imperivm1.js setup <celtickingspatch116.exe> <celtickingsdemo.zip>
# per map (or class name); then wrap the map as usual
node tools/imperivm1.js add <map.bfhp>
```

How each class is resolved:

1. **The class definitions** come from the patch's `data.pak` (every Imperivm I class: name, model, type).
2. **The HD equivalent** comes from Haemimont itself. The patch ships 4 original Imperivm I maps (Ascendency, Return to the Throne, Defenders, The fall of Avalon) that Haemimont converted for the Imperivm III saga, and every object kept its exact position. Pairing both versions by position gives the replacement Haemimont chose: `TeutonMetal` → `TTeutonRider`, `GWFighter` → `GWomanWarrior`, `GVikingLord` → `BVikingLord`, `RHero10` → `RHero1`… The saga copies come from Discord (`originals/discord/saga-imperivm/`).
3. Classes those 4 maps don't place are matched by **display name** (`NHero01` "Brand" → `GHero3b` "Brand"), then by **sharing a model** with a matched class (`TeutonWolf` uses the `TeutonMetal` rider model, so → `TTeutonRider`). The result is `raw/imperivm1-equivalents.json`.
4. A class with an equivalent becomes a copy of the HD class under the old id (without its `altid`, which stays with the original).
5. **Objects the HD game never had** (cliffs `Cliffs*`, `TeleportRocks_*`, `GrObj01`, the warehouse) keep their original class and art, recovered from the demo: it is a Wise installer whose files are raw deflate streams; one is the demo's `.pak` (the `.ent.xml`, `.pass` and `.rle.mmp` headers) and the biggest other one its `rle.mmp` (the pixels). Each `.rle.mmp` + `rle.mmp` becomes a standalone `.rle` (the SDK's `lib/rle.js`, `resolveMmp`), which the game loads from a mod. Seasonal variants the demo lacks are dropped (the main art stands in).

The art is Haemimont's/FX's, from a demo given away for free in 2002: lost media otherwise. It is not in git (`ported/imperivm1-legacy/**/*.rle` and `.pass` are ignored); `setup` + `add` rebuild it. Credits: Haemimont Games and FX Interactive, with Villoh as porter.

The same idea works for any old map: look for the class in an older `data.pak` (the official Imperivm III patches 1.20–1.40 ship theirs: `Cab3.cab` inside `Imperivm III-1.40-ES.exe`), and for an official map converted by Haemimont to learn the replacement.
