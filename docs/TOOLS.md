# Tools

**English** · [Español](es/TOOLS.md)

| Script | What it does |
|---|---|
| **Gathering** | |
| [`scrape-forum.js`](../tools/scrape-forum.js) | Spanish forum → `raw/forum.json` (not in git: the full crawl holds unrelated messages; resumes if interrupted). Needs `FORUM_COOKIE` |
| [`scrape-forum-it.js`](../tools/scrape-forum-it.js) | Italian forum → `raw/forum-it.json` (not in git) and its Downloads table → `raw/forum-it-downloads.json`. Needs `FORUM_IT_COOKIE` (shares [`scrape-common.js`](../tools/scrape-common.js)) |
| [`parse-forum.js`](../tools/parse-forum.js) | `raw/forum.json` → `raw/forum-entries.json`: topics with the author's links |
| [`parse-discord.js`](../tools/parse-discord.js) | `raw/discord.json` (not in git, like `forum.json`) → `raw/discord-entries.json` |
| [`scrape-moddb.js`](../tools/scrape-moddb.js) | Everything on ModDB for the Imperivm games → `raw/moddb.json` |
| [`audit-pack.js`](../tools/audit-pack.js) | A pack of maps → `AUDIT.md`: each map's name and author (from its `game.xml`) and whether it duplicates one of ours (SHA-256, then shared files). Needs `bsdtar` |
| [`download-discord.js`](../tools/download-discord.js) | Discord attachments → `originals/discord/<channel>/<slug>/` (URLs expire after ~24 h) |
| [`download-forum.js`](../tools/download-forum.js) | Files behind the live links of rows with no local copy → `originals/forum/<key>/files/`. Mega needs `megadl`; ModDB a browser on CDP port 9333 (Cloudflare). `--force=<keys>` downloads again |
| [`download-forum-shots.js`](../tools/download-forum-shots.js) | Screenshots in each forum topic's opening post → `originals/forum/t<id>/screenshots/` |
| [`check-links.js`](../tools/check-links.js) `[--all]` | Checks the downloads → `raw/links.json` |
| **Tables** | |
| [`build-table.js`](../tools/build-table.js) `--force` | First draft of `MODS.md` + `MISSING.md`. Overwrites manual edits: only in a scratch copy |
| [`split-missing.js`](../tools/split-missing.js) | Moves rows between `MODS.md` and `MISSING.md` by their downloads, and dead links to `DEAD-LINKS.md` |
| [`sync-table.js`](../tools/sync-table.js) | *Type* and *Status* of every ported row from its `mod.json` |
| [`pending.js`](../tools/pending.js) | `PENDING.md` from `MODS.md` |
| **Porting** | |
| [`wrap-map.js`](../tools/wrap-map.js) | A map or adventure (a Discord post, a forum topic or one map of a pack) → `ported/<id>/` |
| [`port-140.js`](../tools/port-140.js) | A loose-file 1.40 mod → `ported/<id>/` |
| [`flatten-paks.js`](../tools/flatten-paks.js) | A 1.40 mod that is a full game copy (whole `.pak` packages) → loose files, for `port-140.js` (the Greek Mod 1.8) |
| [`greek-1-8.js`](../tools/greek-1-8.js) | After `port-140.js`: the Greek Mod 1.8's Greece as an independent civilization (`greek18`, letter `Q`): renames, patches, AI as `GR18_*` |
| [`shared-paths.js`](../tools/shared-paths.js) `<ported id>` | Files, class ids and entity folders a port shares with the game and with the other ports (the independence check) |
| [`merge-secuter-fun.js`](../tools/merge-secuter-fun.js) | Secuter's Fun mod (rows 312): finishes what `port-140.js` left in conflict, keeping HD's changes and the mod's (see the comments for each decision) |
| [`port-translation.js`](../tools/port-translation.js) | A mod's translation for 1.40 (`GAME.LOC.XML`) → `loc/<language>.loc.xml` with only the texts it translated |
| [`imperivm1.js`](../tools/imperivm1.js) | Imperivm I classes → `ported/imperivm1-legacy/` |
| [`cgwar-greece.js`](../tools/cgwar-greece.js) | After `port-140.js`: the CGWAR's Greece as a new civilization |
| [`cgwar-independent.js`](../tools/cgwar-independent.js) | After `cgwar-greece.js`: the game's files it replaced become patches of what is Greek; the rest is left out |
| [`celtic-kings-adventure.js`](../tools/celtic-kings-adventure.js) | The Celtic Kings Adventure (row 202): the three ModDB zips → `ported/celtic-kings-adventure/`; its classes, commands and items as its own (`CK*`), the `.bfhp` edited in place to use them (`hpfs.js`), the texts as `loc/` |
| [`gbr-tactics.js`](../tools/gbr-tactics.js) | After `port-140.js`: GBR Tactics 2.4's eight civilizations as civilizations of their own (ids `<civ>_gbrt`, derived prefixes), its new items as patches; the mod's scripts the game's compiler refuses are fixed (see `extras/gbr-tactics/NOTES.md`) |
| [`antioco-iii.js`](../tools/antioco-iii.js) | After `port-140.js`: Antíoco III el Grande (Falcata) as a content pack, no civilization: leaves out the Greek Mod 1.8 copy it came on, turns the files at the game's paths into patches, renames what the CGWAR, the MCI and the Community Mod also name (`_ant`, in the maps too), follows the 1.8's `Q*` names, adds the hero classes and icons the maps need, and puts the two adventures in `Adventures/` |
| [`greek-4-2.js`](../tools/greek-4-2.js) | The Greek Mod 4.2 as its own civilizations (and Rome's and Carthage's branches); `tools/lib/` has what it shares with the others |
| [`lib/lzis.js`](../tools/lib/lzis.js) | Decodes a package the engine stores LZIS-compressed (GBR Tactics' `Z-RandomMap.pak`); `flatten-paks.js` uses it |
| [`compare-mods.js`](../tools/compare-mods.js) | the Greek mods side by side, to stdout (`> GREEK-MODS.md`, git-ignored) |
| [`mod-class-diff.js`](../tools/mod-class-diff.js) | What a 1.40 mod changed in the game's classes, by civilization, against the official 1.40 |
| [`greek-terrains.js`](../tools/greek-terrains.js) | The Greek Mod's terrain layers 41-55 (from the Caesar Mod zip) → `ported/greek-mod-terrains/`; `wrap-map` makes maps painted with them require it |
| [`hpfs.js`](../tools/hpfs.js) `<map.bfhp> [outDir]` | Lists or extracts a scenario/adventure `.bfhp` (HPFS); as a module, it also rewrites a file in place (any length within its pages) |
