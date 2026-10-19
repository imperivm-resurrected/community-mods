# community-mods

Port the community's mods, maps and adventures to [Imperivm Resurrected](https://github.com/imperivm-resurrected/imperivm-resurrected)
and publish them on [GameBanana](https://gamebanana.com/games/26069), crediting each author.

## Repository layout

| Path | What it is |
|---|---|
| [MODS.md](MODS.md) | The table of what can be ported: the source of truth, edited by hand. Its legend (*Type*, *Status*, link marks) is under [How to read the tables](MODS.md#how-to-read-the-tables) |
| [MISSING.md](MISSING.md) | Rows with no working download (dead links or none) |
| [DEAD-LINKS.md](DEAD-LINKS.md) | Dead links of rows that stay in `MODS.md` (they have another working one) |
| [PENDING.md](PENDING.md) | What is left to port, grouped by what holds it back, with where its files are. Generated: don't edit |
| [AUTHORS.md](AUTHORS.md) | Modders and editors, with their Discord account when found, to contact them |
| [ported/](ported/) | Each ported mod, with its `mod.json`. Third-party binaries (`.bfhp`, `.bmp`, `.pak`, `.avi`) and the folders rebuilt by `port-140.js` aren't in git |
| [extras/](extras/) | Our own changes to a mod: hand-resolved files, fixes, preview images, `mod.json` with credits. The tools copy them into `ported/<id>/` |
| [raw/](raw/) | Mod entries pulled from Discord, the forum and ModDB (`*-entries.json`, `moddb.json`), link checks (`links.json`), downloads (`download-log.json`), which row each ported mod comes from (`ported.json`), Imperivm I equivalents, `port-140` reports |
| [tools/](tools/) | The scripts (see [Tools](#tools)) |

Downloads and extracted game data go in `originals/`, outside git (see [Setup](#setup-once)).

## Authors and removal requests

Every mod is published with full credit to its original author. Many of these modders and editors are no longer active, so reaching them is often hard. In any case, if a modder or editor asks for their mod to be removed, it will be removed from GameBanana and from this repository, no questions asked.

## Setup (once)

The tools compare each mod with the game's data, so extract it first. `extract-data.js` is in the SDK, `imperivm-resurrected/sdk/en/tools/`; `<game>` is the HD game folder.

| What | Command | Used by |
|---|---|---|
| HD `DATA` | `node extract-data.js "<game>" originals/game-data` | `wrap-map`, `validate-mod` |
| The HD maps | copy the game's `Scenarios/` and `Adventures/` to `originals/game-data/` | `wrap-map` (skips maps the game already ships) |
| Every HD pack | `node extract-data.js "<game>" originals/game-data/paks <Name>.pak`, for each `Packs\*.pak` | `port-140` |
| HD Spanish texts | `extract-data.js` on `local\spanish.pak` (copy it into a `Packs\` folder first), output `originals/game-data/local-spanish` | `port-140` |
| The 1.40 packs | `data.pak`, `Units.pak`, `Buildings.pak`, `MapObjects.pak` from `Cab3.cab` inside `Imperivm III-1.40-ES.exe` (forum t731, `Imperium_3_official_patch.zip`), extracted to `originals/game-140/paks` | `port-140` |
| Big mods' classes | each one's `mod.json`, `hidden.txt` and `DATA/**/*.sc.xml` in `originals/mods/<mod id>/` | `wrap-map` (`requires`, `incompatibleWith`) |
| Imperivm I data | `node tools/imperivm1.js setup <patch.exe> <demo.zip>` (see [Maps with Imperivm I classes](#maps-with-imperivm-i-classes)) | `imperivm1` |

`.rar`/`.zip` are unpacked with bsdtar: it is the system `tar` on Windows 10+ and macOS; on Linux install `libarchive-tools` (Debian/Ubuntu) or `libarchive` (Arch, Fedora, Nix). `BSDTAR=<path>` points to another binary.

## Porting a mod

1. **Author.** Try to reach the author (Discord, see [AUTHORS.md](AUTHORS.md), or forum) and note the answer in the *Permission* column. If they cannot be reached, publish with full credit; remove it if they ask (see above). If the license allows it (e.g. CC BY-SA), there is no need to ask, but the author must be credited.
2. **Download**: `node tools/download-discord.js` (Discord attachments) or `node tools/download-forum.js` (forum, Mega, MediaFire, ModDB…).
3. **Port**, with the tool for its *Type*:

   | Type | What the mod is | Tool |
   |---|---|---|
   | *wrap* | A map or adventure, untouched | `node tools/wrap-map.js [channel/]<slug>` (Discord) or `forum/t<topic id>` |
   | *reduce* | A mod with whole `.pak` packages | `node shrink-mod.js <original> "<game>" ported/<id> --id <id> …` (SDK) |
   | *rewrite* | A loose-file mod made for 1.40 | `node tools/port-140.js <folder> ported/<id> --id <id> …` (see [Mods made for 1.40](#mods-made-for-140)) |
   | *wrap · requires imperivm1-legacy* | A map with Imperivm I classes | `node tools/imperivm1.js add <map.bfhp>`, then `wrap-map.js` |

4. **`mod.json`**: `"authors": ["<Original author>"]`; add `"<your name> (port)"` only for real adaptation work (*reduce*, *rewrite*). Plus `category`, `tags` (players or language) and `"redistributable": true` (the room host can send it; `--no-redistributable` if the author asks not to).
5. **Validate** (from the SDK): `node validate-mod.js <folder> --game "<game>" --data originals/game-data/DATA`.
6. **Test** in the game (`mods\`, Additional content) and check `Logs\imperivm\imperivm-mod.log`. `LogFiles=1` under `[Debug]` in `imperivm-mod.ini` logs every file the game opens.
7. **Publish**: zip the folder, *Add → Mod* on GameBanana, same category, tags and version. Under **Credits**, the author as *Original Creator*; you as *Porter* only for *reduce*/*rewrite* mods (for *wrap*, being the submitter is enough). Link the original thread.
8. **Update the tables**: `node tools/sync-table.js` sets *Type* and *Status* from each `mod.json`; add the GameBanana link by hand; `node tools/split-missing.js` after editing a download; `node tools/pending.js` regenerates `PENDING.md`.

### Maps and adventures (`wrap-map.js`)

Resurrected runs on the HD game, so a map made for 1.40, 1.56, a mod or an older Imperivm breaks if it places a unit or object HD doesn't have. `wrap-map.js` checks every class the map places (and the ones its scripts create) against the HD data, the big mods in `originals/mods/` and the class mods in `ported/`:

- a mod that has every class the map lacks goes in `requires` (with several, the first of Community Mod, Greek Mod, Caesar Mod); one that hides an HD class the map uses goes in `incompatibleWith`. `MODS.md` shows both in *Type*;
- a map that needs a mod not ported yet (⏳, ids `forum-t<topic>`) or classes nobody has (❌) is reported and left out of `ported/`;
- classes are also known by their `altid`, the old name HD still accepts (`RWallsN` is `Rwalls2` in Imperivm II maps); parts of the `.bfhp` are compressed and mangle some names, so an unknown name only counts if placed at least twice;
- a map HD already ships (same bytes) is skipped; a file name another ported mod has is renamed `<name> (<id>).bfhp`; videos go to `movies/`; players are the lobby slots (playerdata ids 0–7) a human can take;
- files in `extras/<id>/` are copied into the mod, and their classes count as known.

Nothing in the map changes, so the original author is the only author (no porter credit). Saga entries are credited to Haemimont Games and FX Interactive. `--players` overrides the players tag; `--file <text>` keeps only the downloads whose name has it. A GameBanana mod with no `mod.json` gets the id `gamebanana-<id>` in the game.

## Mods made for 1.40

Most big mods (MCI, CGWAR, AsvrMod, La Reconquista, GBR Tactics) were copied over an Imperivm III 1.40 install: loose `DATA`, `UNITS`, `UI`… folders and often their own `rle.mmp`. On HD they would undo its fixes, and their `.rle.mmp` sprites only work with their own `rle.mmp`. `tools/port-140.js` compares each file with HD **and** with 1.40, the version the mod was made on:

| The file | Result |
|---|---|
| Same as HD, or same as 1.40 (the mod didn't touch it) | Left out: the HD one stays |
| Only the mod changed it | The mod's |
| Both changed it | 3-way merge (`git merge-file`, 1.40 as base). Where both touched the same lines, XML is merged attribute by attribute and the mod wins a value both changed (a balance mod is about those values). Anything else goes to `raw/port-140/<id>.md` for review ([MCI's](raw/port-140/mci.md)) |
| `.ini` | Key by key over the whole file (HD moved blocks around). `[Resolutions]` is always HD's: a 1.40 list starts the game at 640x480 |
| `.rle.mmp` sprites | Rebuilt as standalone `.rle` from the mod's `rle.mmp`; left out if the pixels are HD's (a mod can't replace a game sprite anyway) |
| `currentlang\*.loc.xml` | Only the entries that differ from the HD Spanish table, as `loc/spanish.loc.xml` (added to the game's, so HD's own texts stay) |
| Menu background | Drawn for 1024x768; fitted to the HD one, 1920x1080 on Steam (a loose `Currentlang/MENUBACKGROUND.bmp` over the pack's 1366x768): scaled to the height, the left half and the right border kept, the parchment between stretched |
| Classes in Latin-1 | Saved as UTF-8 (otherwise HD skips them without a word) |
| Item and victory scripts | Get the signature line HD needs |

Conflicts are resolved by hand in `extras/<id>/` (the final files, plus `mod.json` with credits and description); the tool copies them over its output, so the port can be rebuilt from the original download plus the repo. `ported/<id>/` of these mods isn't in git: it's mostly the authors' files and game data.

```bash
node tools/port-140.js <old mod folder> ported/<id> --id <id> --name "<Name>" --version <v> --category "<Category>"
```

The MCI ([extras/mci/](extras/mci/)) is the first one: 1104 files from the 9.0 zip, 123 merged with HD, 30 resolved or fixed by hand (the HD guard post, gold selling, AI-only parry mode, kill statistics and sentry guards kept alongside the MCI's tributes, stances and veterans). Its own bugs from 1.40 are kept as they were (scripts it references but never shipped), except where HD would break: `GreatTavern`, a class that doesn't exist, is dropped from the random map (it would hang), and `beh_punto.vs` calls `CreateFeedback` instead of `PlaceFeedback`, which no game version has.

## Maps with Imperivm I classes

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

## Tools

| Script | What it does |
|---|---|
| **Gathering** | |
| [`scrape-forum.py`](tools/scrape-forum.py) | Forum → `raw/forum.json` (not in git: the full crawl holds unrelated messages; resumes if interrupted) |
| [`parse-forum.js`](tools/parse-forum.js) | `raw/forum.json` → `raw/forum-entries.json`: topics with the author's links |
| [`parse-discord.js`](tools/parse-discord.js) | `raw/discord.json` (not in git, like `forum.json`) → `raw/discord-entries.json` |
| [`scrape-moddb.js`](tools/scrape-moddb.js) | Everything on ModDB for the Imperivm games → `raw/moddb.json` |
| [`download-discord.js`](tools/download-discord.js) | Discord attachments → `originals/discord/<channel>/<slug>/` (URLs expire after ~24 h) |
| [`download-forum.js`](tools/download-forum.js) | Files behind the live links of rows with no local copy → `originals/forum/<key>/files/`. Mega needs `megadl`; ModDB a browser on CDP port 9333 (Cloudflare). `--force=<keys>` downloads again |
| [`download-forum-shots.js`](tools/download-forum-shots.js) | Screenshots in each forum topic's opening post → `originals/forum/t<id>/screenshots/` |
| [`check-links.js`](tools/check-links.js) `[--all]` | Checks the downloads → `raw/links.json` |
| **Tables** | |
| [`build-table.js`](tools/build-table.js) `--force` | First draft of `MODS.md` + `MISSING.md`. Overwrites manual edits: only in a scratch copy |
| [`split-missing.js`](tools/split-missing.js) | Moves rows between `MODS.md` and `MISSING.md` by their downloads, and dead links to `DEAD-LINKS.md` |
| [`sync-table.js`](tools/sync-table.js) | *Type* and *Status* of every ported row from its `mod.json` |
| [`pending.js`](tools/pending.js) | `PENDING.md` from `MODS.md` |
| **Porting** | |
| [`wrap-map.js`](tools/wrap-map.js) | A map or adventure → `ported/<id>/` |
| [`port-140.js`](tools/port-140.js) | A loose-file 1.40 mod → `ported/<id>/` |
| [`imperivm1.js`](tools/imperivm1.js) | Imperivm I classes → `ported/imperivm1-legacy/` |

The SDK tools (`extract-data.js`, `shrink-mod.js`, `validate-mod.js`, `read-rle.js`…) are in `imperivm-resurrected/sdk/en/tools/`.

## Sources and license

The data was gathered from the *Imperivm III Editores* Discord server, the [imperivmgbr.foroactivo.com](https://imperivmgbr.foroactivo.com) forum, [ModDB](https://www.moddb.com) and [GameBanana](https://gamebanana.com/games/26069).

The scripts in `tools/` are GPL-3.0 (see [LICENSE](LICENSE)), like Imperivm Resurrected. The maps, adventures and mods, and their names and descriptions, belong to their authors and are not covered by it.
