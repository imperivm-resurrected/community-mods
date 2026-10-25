# community-mods

Port the community's mods, maps and adventures to [Imperivm Resurrected](https://github.com/imperivm-resurrected/imperivm-resurrected)
and publish them on [GameBanana](https://gamebanana.com/games/26069), crediting each author.

## Repository layout

| Path | What it is |
|---|---|
| [`MODS.md`](MODS.md) | The table of what can be ported: the source of truth, edited by hand. Its legend (*Type*, *Status*, link marks) is under [How to read the tables](MODS.md#how-to-read-the-tables) |
| [`MISSING.md`](MISSING.md) | Rows with no working download (dead links or none) |
| [`DEAD-LINKS.md`](DEAD-LINKS.md) | Dead links of rows that stay in `MODS.md` (they have another working one) |
| [`PENDING.md`](PENDING.md) | What is left to port, grouped by what holds it back, with where its files are. Generated: don't edit |
| [`SOURCES.md`](SOURCES.md) | Forums, Discord servers, Telegram and sites (Spanish, Italian, English) where more mods can be found, with their state and what is already scraped |
| [`GAMES.md`](GAMES.md) | Where to get the original games and their patches, which name is which, and how to run them on Linux with GE-Proton |
| [`AUTHORS.md`](AUTHORS.md) | Modders and editors, with their Discord account and forum profile when found, to contact them |
| [`ported/`](ported/) | Each ported mod, with its `mod.json`. Third-party binaries (`.bfhp`, `.bmp`, `.pak`, `.avi`) and the folders rebuilt by `port-140.js` aren't in git |
| [`extras/`](extras/) | Our own changes to a mod: hand-resolved files, fixes, preview images, `mod.json` with credits. The tools copy them into `ported/<id>/` |
| [`raw/`](raw/) | Mod entries pulled from Discord, the forum and ModDB (`*-entries.json`, `moddb.json`), link checks (`links.json`), downloads (`download-log.json`), which row each ported mod comes from (`ported.json`), Imperivm I equivalents, `port-140` reports |
| [`tools/`](tools/) | The scripts (see [Tools](#tools)) |

Downloads and extracted game data go in `originals/`, outside git (see [Setup](#setup-once)).

## Authors and removal requests

Every mod is published with full credit to its original author. Many of these modders and editors are no longer active, so reaching them is often hard. In any case, if a modder or editor asks for their mod to be removed, it will be removed from GameBanana and from this repository, no questions asked.

## Setup (once)

The tools compare each mod with the game's data, so extract it first. `extract-data.js` is in the SDK, `imperivm-resurrected/sdk/tools/`; `<game>` is the HD game folder.

| What | Command | Used by |
|---|---|---|
| HD `DATA` | `node extract-data.js "<game>" originals/game-data` | `wrap-map`, `validate-mod` |
| The HD maps | copy the game's `Scenarios/` and `Adventures/` to `originals/game-data/` | `wrap-map` (skips maps the game already ships) |
| Every HD pack | `node extract-data.js "<game>" originals/game-data/paks <Name>.pak`, for each `Packs\*.pak` | `port-140` |
| HD Spanish texts | `extract-data.js` on `local\spanish.pak` (copy it into a `Packs\` folder first), output `originals/game-data/local-spanish` | `port-140` |
| HD Italian texts | the same on `local\italian.pak` (copied into a `Packs\` folder), output `originals/game-data/local-italian` | `celtic-kings-adventure` |
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
   | *wrap* | A map or adventure, untouched | `node tools/wrap-map.js [channel/]<slug>` (Discord), `forum/t<topic id>`, or `pack:<pack>/<map> --author "…"` for one map of a downloaded pack (see below) |
   | *reduce* | A mod with whole `.pak` packages | `node shrink-mod.js <original> "<game>" ported/<id> --id <id> …` (SDK) |
   | *rewrite* | A loose-file mod made for 1.40 | `node tools/port-140.js <folder> ported/<id> --id <id> …` (see [Mods made for 1.40](#mods-made-for-140)) |
   | *wrap · requires imperivm1-legacy* | A map with Imperivm I classes | `node tools/imperivm1.js add <map.bfhp>`, then `wrap-map.js` |

4. **`mod.json`**: `"authors": ["<Original author>"]`; add `"<your name> (port)"` only for real adaptation work (*reduce*, *rewrite*). Plus `category` (`Scenarios`, `Adventures`, `Conquests`… as on GameBanana), `tags` in the SDK's form (`Players: 2-4` for scenarios, 2 to 8; `Language: Spanish` for adventures; `Type: <category>` for anything else the mod also is) and `"redistributable": true` (the room host can send it; `--no-redistributable` if the author asks not to).
   **Civilizations are independent, 100%.** The game's 8 are never modified: a mod that adds a civilization, or changes one (stats, sprites, sounds, behaviors, commands), ships it as **its own civilization next to the game's** ("Gauls" is HD's, "Gauls (Greek Mod 1.8)" the mod's), with its own `civs/<id>.json` (`id`, `index`, `letter`, `race`) and its own class, entity, command and script names. What is not a civilization's (`const.ini`, `items.xml`, game scripts…) goes as a patch that adds only its part, never as a file in the same path as another mod's. So any civilization mods can be combined. `incompatibleWith` between them is only a temporary state for an unfinished port. Rules and the check to run: [AGENTS.md](AGENTS.md#civilizations-are-independent); letters and indices in use: [Civilization mods](#civilization-mods).
5. **Validate** (from the SDK): `node validate-mod.js <folder> --game "<game>" --data originals/game-data/DATA`.
6. **Test** in the game (`mods\`, Additional content) and check `Logs\imperivm\imperivm-mod.log`. `LogFiles=1` under `[Debug]` in `imperivm-mod.ini` logs every file the game opens.
7. **Publish**: zip the folder, *Add → Mod* on GameBanana, same category, tags and version. Under **Credits**, the author as *Original Creator*; you as *Porter* only for *reduce*/*rewrite* mods (for *wrap*, being the submitter is enough). Link the original thread.
8. **Update the tables**: `node tools/sync-table.js` sets *Type* and *Status* from each `mod.json`; add the GameBanana link by hand; `node tools/split-missing.js` after editing a download; `node tools/pending.js` regenerates `PENDING.md`.

### Maps and adventures (`wrap-map.js`)

Resurrected runs on the HD game, so a map made for 1.40, 1.56, a mod or an older Imperivm breaks if it places a unit or object HD doesn't have. `wrap-map.js` checks every class the map places (and the ones its scripts create) against the HD data, the big mods in `originals/mods/` and the class mods in `ported/`:

**Packs and other languages.** A pack of maps with no post (`originals/forum/<pack>/files/*.zip`, e.g. the Greek Mod's `Greek_MapsAdventures.zip`) is audited first: `node tools/audit-pack.js <extracted pack> extras/<pack>/AUDIT.md --game "<game>"` says which maps we already have (so they are skipped), which are another edition and which are new. A new one is wrapped with `node tools/wrap-map.js "pack:<pack>/Adventures/<file>.BFHP" --author "Name; Other name" [--lang Italian]`: only that map, its preview and the videos it plays are unpacked, `--author` is required (the credits, separated by `;`) and `--lang` is the language of its texts (the card gets an Italian description too when it is Italian). The same adventure in another language goes **into the mod we already have** with `--add pack:<pack>/<map>`: both maps are listed in the game as `<name> (Español)` and `<name> (Italiano)`, and a video the entry already has is never replaced. Rows made this way have no post to match, so they name their `ported/` folder in parentheses (`… (guerra-dei-mercenari)`) and `sync-table.js` finds them by that.

- a mod that has every class the map lacks goes in `requires` (with several, the first of Community Mod, Greek Mod, Caesar Mod); one that hides an HD class the map uses goes in `incompatibleWith`. `MODS.md` shows both in *Type*;
- a map that needs a mod not ported yet (⏳, ids `forum-t<topic>`) or classes nobody has (❌) is reported and left out of `ported/`;
- classes are also known by their `altid`, the old name HD still accepts (`RWallsN` is `Rwalls2` in Imperivm II maps); parts of the `.bfhp` are compressed and mangle some names, so an unknown name only counts if placed at least twice;
- a map HD already ships (same bytes) is skipped; a file name another ported mod has is renamed `<name> (<id>).bfhp`; videos go to `movies/`; players are the lobby slots (playerdata ids 0–7) a human can take;
- files in `extras/<id>/` are copied into the mod, and their classes count as known.

Nothing in the map changes, so the original author is the only author (no porter credit). Saga entries are credited to Haemimont Games and FX Interactive. `--players` overrides the players tag; `--file <text>` keeps only the downloads whose name has it. A GameBanana mod with no `mod.json` gets the id `gamebanana-<id>` in the game.

## Civilization mods

`node tools/compare-mods.js` prints a comparison of the ported civilization mods (civilizations, Greek rosters, what each changed in the game's civilizations, researches). It is not kept in git: it goes stale with every port; redirect it to `GREEK-MODS.md` (git-ignored) if you want a copy.

Letters and indices are unique across all the ports (the SDK allows indices 10-99; a letter prefixes the civilization's classes and commands). A new port takes the next free ones and adds its row here. Ports that are not uploaded can still change theirs.

| Index | `id` | Letter | Base | Mod | State |
|---|---|---|---|---|---|
| 30 | `greece` | `K` | ImperialRome | CGWAR | Own race; independent of the game and of the 1.8 (`tools/cgwar-independent.js`); shares class ids and files with the 4.2 |
| 31 | `greek` | `H` | ImperialRome (own race) | 4.2 | Greece of the 4.2, in no one's slot (`tools/greek-4-2.js`) |
| 32 | `greek18` | `Q` | ImperialRome (own race) | 1.8 | Greece independent of the game's and of the 4.2/CGWAR classes; still shares neutral content (fisherman, scripts, music) with the 4.2, Imperivm Legacy and the MCI |
| 33 | `rome18` | `J` | RepublicanRome | 1.8 | Republican Rome with the 1.8's stats and costs, cloned from HD (`tools/greek-1-8-civs.js`); the other civilizations of the 1.8 follow |
| 34 | `gaul18` | `L` | Gaul | 1.8 | Gaul with the 1.8's stats and barracks costs |
| 35 | `carthage18` | `P` | Carthage | 1.8 | Same (elephant, javelin thrower, noble; barracks and temple costs) |
| 36 | `britain18` | `O` | Britain | 1.8 | Same (shield bearer, bronze spearman, bowman, hero) |
| 37 | `iberia18` | `U` | Iberia | 1.8 | Same (archer, slinger, cavalry speeds) |
| 38 | `egypt18` | `V` | Egypt | 1.8 | Same (outpost) |
| 39 | `germany18` | `F` | Germany | 1.8 | Same (axeman; barracks, Temple of Neptune and tent commands) |
| 40 | `gaul42` | `X` | Gaul | 4.2 | Gaul with the 4.2's balance |
| 41 | `britain42` | `Y` | Britain | 4.2 | Same |
| 42 | `iberia42` | `Z` | Iberia | 4.2 | Same |
| 43 | `egypt42` | `1` | Egypt | 4.2 | Same (a digit is a letter too: the 26 ran out) |
| 44 | `germany42` | `3` | Germany | 4.2 | Same |
| 45 | `romerep42` | `4` | RepublicanRome | 4.2 | Republican Rome: the commands the mod's Republican branch left visible |
| 46 | `romeimp42` | `5` | RepublicanRome | 4.2 | Imperial Rome: the Imperial branch (own hero) |
| 47 | `romepun42` | `6` | RepublicanRome | 4.2 | Punic Rome: the Punic branch (Ancient Roman hero) |
| 48 | `carthnum42` | `7` | Carthage | 4.2 | Numidian Carthage |
| 49 | `carthmau42` | `8` | Carthage | 4.2 | Mauritanian Carthage (Mauritanian hero) |

GBR Tactics' eight civilizations (`<civ>_gbrt`) have no row: their prefixes are derived from the id (`Gau`, `Rep`, `Imp`, `Car`, `Bri`, `Ibe`, `Egy`, `Ger`) and their indices are assigned by the engine.

The three Greek mods are independent of the game and of each other (checked with `tools/shared-paths.js` and the content manager); what is left is in each mod's `NOTES.md`, *Pending*.

## Mods made for 1.40

Most big mods (MCI, CGWAR, AsvrMod, La Reconquista, GBR Tactics) were copied over an Imperivm III 1.40 install: loose `DATA`, `UNITS`, `UI`… folders and often their own `rle.mmp`. On HD they would undo its fixes, and their `.rle.mmp` sprites only work with their own `rle.mmp`. `tools/port-140.js` compares each file with HD **and** with 1.40, the version the mod was made on:

| The file | Result |
|---|---|
| Same as HD, or same as 1.40 (the mod didn't touch it) | Left out: the HD one stays |
| Only the mod changed it | The mod's |
| Both changed it | 3-way merge (`git merge-file`, 1.40 as base; XML without blank lines if that lines up better, as HD added one between every line of some entities). Where both touched the same lines: XML attribute by attribute (repeated tags told apart by `idx`/`name`/`id`), the mod wins a value both changed (a balance mod is about those values), and a hunk the mod only re-indented is HD's. Anything else goes to `raw/port-140/<id>.md` for review ([MCI's](raw/port-140/mci.md)) |
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

The MCI ([extras/mci/](extras/mci/)) is the first one: 1104 files from the 9.0 zip, 123 merged with HD, 30 resolved or fixed by hand (the HD guard post, gold selling, AI-only parry mode, kill statistics and sentry guards kept alongside the MCI's tributes, stances and veterans). Its own bugs from 1.40 are kept as they were (scripts it references but never shipped), except where HD would break: `GreatTavern`, a class that doesn't exist, is dropped from the random map (it would hang), and `beh_punto.vs` calls `CreateFeedback` instead of `PlaceFeedback`, which no game version has.

The CGWAR ([extras/cgwar/](extras/cgwar/)) put Greece in place of Imperial Rome; here it is a new civilization (`civs/greece.json`, index 30, letter `K`) and Imperial Rome stays HD's. After `port-140.js`, [`tools/cgwar-greece.js`](tools/cgwar-greece.js) makes the change: Greek classes get `race="greece"`, the Imperial pieces the mod redrew (walls, gates, tower, peasants) become `K*` copies so the city builder finds them by letter, the "Rome" merge (Republican Rome turning Republican or Imperial in the Arena), its AI scripts and the official adventures, conquest and random map towns it edited go, and the shared commands become patches that only add the Greek sources (the Greek-only commands go to `DATA/COMMANDS/GREECE.XML`). The mod's AI settlement scripts assume "Imperial Rome = Greece", and a Greek AI does see its base, Imperial Rome: they go in as `GR_*.vs`, so every other civilization keeps HD's AI. A patch on each HD helper (`ESH_*`) hands Greek settlements over with `AIRun`; the two main loops (`ES_Stronghold`, `ES_Village`) `Sleep()`, which crashes inside `AIRun`, so they go in `[EconomyScripts]` and a `GetEconomyScript.vs` patch picks them. Greece starts the random map in the mod's own Greek towns: `extras/cgwar/patches/randommapsettlements/` was made with the SDK's `create-template.js --base "Imperial Roman"` from an in-game dump (`Dump=randommapsettlements/maps/1/map.obj.xml`) with the mod's `RandomMapSettlements.bfhp`, where the Imperial Roman towns are the Greek ones, and their `M*` walls made `K*`. The maps made for it place `MWalls*`/`MTower`/`MGate*`, Roman again here: `wrap-map.js` switches them to `K*` in maps that need the CGWAR, which makes them *rewrite* (porter credited).

GBR Tactics 2.4 ([extras/gbr-tactics/](extras/gbr-tactics/)) has no Greece: it is the game's eight civilizations as the mod has them, each its own next to the game's (`tools/gbr-tactics.js`). Its installer is a Gentee SFX that neither bsdtar nor 7z opens: it runs with no window under wine, so it is run once in a throwaway prefix and its files taken from there (steps in its `NOTES.md`). One of its packages is LZIS-compressed (`tools/lib/lzis.js`), and the game's compiler and loader refuse things 1.40's accepted (undeclared variables, text after `</class>`): the fixes are in the tool.

## Big mods made for HD

A mod made for HD (not 1.40) is reduced with the SDK's `shrink-mod.js`, which keeps only what differs from the game. Imperivm Legacy 2.4.1 ships as three installers (ENG, ESP, ITA; Clickteam, not Inno Setup, so `innoextract` fails): `7z e -t#` splits one into `.bz2` chunks, but it loses the file names, so the simplest way is to install it with wine (`WINEPREFIX=/tmp/wine-legacy wine <installer>`, to `C:\legacy`). The three installers only differ in the language package (`local\<language>.pak`, a chunk of ~19 MB: the one that differs between installers, `bunzip2` it after `7z e -t#`), so install one and copy the `.pak` of the others into its `local\` as `spanish.pak` and `italian.pak`.

```bash
node shrink-mod.js <installed mod> "<game>" ported/imperivm-legacy --id imperivm-legacy --name "Imperivm Legacy" --version 2.4.1 --category "Gameplay & Balance"
```

Then copy `extras/imperivm-legacy/` over the result: the 4 files with broken paths in the original mod (`BASETAVERN`, `RAMUNIT`, `RTHERMAE`, `FOG_OWNER_MARKER`) and its `mod.json`. `ported/imperivm-legacy/` (353 MB) isn't in git, like the 1.40 ones.

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
| [`scrape-forum.js`](tools/scrape-forum.js) | Spanish forum → `raw/forum.json` (not in git: the full crawl holds unrelated messages; resumes if interrupted). Needs `FORUM_COOKIE` |
| [`scrape-forum-it.js`](tools/scrape-forum-it.js) | Italian forum → `raw/forum-it.json` (not in git) and its Downloads table → `raw/forum-it-downloads.json`. Needs `FORUM_IT_COOKIE` (shares [`scrape-common.js`](tools/scrape-common.js)) |
| [`parse-forum.js`](tools/parse-forum.js) | `raw/forum.json` → `raw/forum-entries.json`: topics with the author's links |
| [`parse-discord.js`](tools/parse-discord.js) | `raw/discord.json` (not in git, like `forum.json`) → `raw/discord-entries.json` |
| [`scrape-moddb.js`](tools/scrape-moddb.js) | Everything on ModDB for the Imperivm games → `raw/moddb.json` |
| [`audit-pack.js`](tools/audit-pack.js) | A pack of maps → `AUDIT.md`: each map's name and author (from its `game.xml`) and whether it duplicates one of ours (SHA-256, then shared files). Needs `bsdtar` |
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
| [`wrap-map.js`](tools/wrap-map.js) | A map or adventure (a Discord post, a forum topic or one map of a pack) → `ported/<id>/` |
| [`port-140.js`](tools/port-140.js) | A loose-file 1.40 mod → `ported/<id>/` |
| [`flatten-paks.js`](tools/flatten-paks.js) | A 1.40 mod that is a full game copy (whole `.pak` packages) → loose files, for `port-140.js` (the Greek Mod 1.8) |
| [`greek-1-8.js`](tools/greek-1-8.js) | After `port-140.js`: the Greek Mod 1.8's Greece as an independent civilization (`greek18`, letter `Q`): renames, patches, AI as `GR18_*` |
| [`shared-paths.js`](tools/shared-paths.js) `<ported id>` | Files, class ids and entity folders a port shares with the game and with the other ports (the independence check) |
| [`merge-secuter-fun.js`](tools/merge-secuter-fun.js) | Secuter's Fun mod (rows 312): finishes what `port-140.js` left in conflict, keeping HD's changes and the mod's (see the comments for each decision) |
| [`port-translation.js`](tools/port-translation.js) | A mod's translation for 1.40 (`GAME.LOC.XML`) → `loc/<language>.loc.xml` with only the texts it translated |
| [`imperivm1.js`](tools/imperivm1.js) | Imperivm I classes → `ported/imperivm1-legacy/` |
| [`cgwar-greece.js`](tools/cgwar-greece.js) | After `port-140.js`: the CGWAR's Greece as a new civilization |
| [`cgwar-independent.js`](tools/cgwar-independent.js) | After `cgwar-greece.js`: the game's files it replaced become patches of what is Greek; the rest is left out |
| [`celtic-kings-adventure.js`](tools/celtic-kings-adventure.js) | The Celtic Kings Adventure (row 202): the three ModDB zips → `ported/celtic-kings-adventure/`; its classes, commands and items as its own (`CK*`), the `.bfhp` edited in place to use them (`hpfs.js`), the texts as `loc/` |
| [`gbr-tactics.js`](tools/gbr-tactics.js) | After `port-140.js`: GBR Tactics 2.4's eight civilizations as civilizations of their own (ids `<civ>_gbrt`, derived prefixes), its new items as patches; the mod's scripts the game's compiler refuses are fixed (see `extras/gbr-tactics/NOTES.md`) |
| [`greek-4-2.js`](tools/greek-4-2.js) | The Greek Mod 4.2 as its own civilizations (and Rome's and Carthage's branches); `tools/lib/` has what it shares with the others |
| [`lib/lzis.js`](tools/lib/lzis.js) | Decodes a package the engine stores LZIS-compressed (GBR Tactics' `Z-RandomMap.pak`); `flatten-paks.js` uses it |
| [`compare-mods.js`](tools/compare-mods.js) | the Greek mods side by side, to stdout (`> GREEK-MODS.md`, git-ignored) |
| [`mod-class-diff.js`](tools/mod-class-diff.js) | What a 1.40 mod changed in the game's classes, by civilization, against the official 1.40 |
| [`greek-terrains.js`](tools/greek-terrains.js) | The Greek Mod's terrain layers 41-55 (from the Caesar Mod zip) → `ported/greek-mod-terrains/`; `wrap-map` makes maps painted with them require it |
| [`hpfs.js`](tools/hpfs.js) `<map.bfhp> [outDir]` | Lists or extracts a scenario/adventure `.bfhp` (HPFS); as a module, it also rewrites a file in place (any length within its pages) |

The SDK tools (`extract-data.js`, `shrink-mod.js`, `validate-mod.js`, `read-rle.js`…) are in `imperivm-resurrected/sdk/tools/`.

## Sources and license

The data was gathered from the *Imperivm III Editores* Discord server, the [imperivmgbr.foroactivo.com](https://imperivmgbr.foroactivo.com) forum, [ModDB](https://www.moddb.com) and [GameBanana](https://gamebanana.com/games/26069). More places to look are in [SOURCES.md](SOURCES.md).

The scripts in `tools/` are GPL-3.0 (see [LICENSE](LICENSE)), like Imperivm Resurrected. The maps, adventures and mods, and their names and descriptions, belong to their authors and are not covered by it.
