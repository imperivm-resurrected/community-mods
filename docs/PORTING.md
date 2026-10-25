# Porting a mod

**English** · [Español](es/PORTING.md)

1. **Author.** Try to reach the author (Discord, see [AUTHORS.md](AUTHORS.md), or forum) and note the answer in the *Permission* column. If they cannot be reached, publish with full credit; remove it if they ask (see [Authors and removal requests](../README.md#authors-and-removal-requests)). If the license allows it (e.g. CC BY-SA), there is no need to ask, but the author must be credited.
2. **Download**: `node tools/download-discord.js` (Discord attachments) or `node tools/download-forum.js` (forum, Mega, MediaFire, ModDB…).
3. **Port**, with the tool for its *Type*:

   | Type | What the mod is | Tool |
   |---|---|---|
   | *wrap* | A map or adventure, untouched | `node tools/wrap-map.js [channel/]<slug>` (Discord), `forum/t<topic id>`, or `pack:<pack>/<map> --author "…"` for one map of a downloaded pack (see below) |
   | *reduce* | A mod with whole `.pak` packages | `node shrink-mod.js <original> "<game>" ported/<id> --id <id> …` (SDK) |
   | *rewrite* | A loose-file mod made for 1.40 | `node tools/port-140.js <folder> ported/<id> --id <id> …` (see [Mods made for 1.40](BIG-MODS.md#mods-made-for-140)) |
   | *wrap · requires imperivm1-legacy* | A map with Imperivm I classes | `node tools/imperivm1.js add <map.bfhp>`, then `wrap-map.js` |

4. **`mod.json`**: `"authors": ["<Original author>"]`; add `"<your name> (port)"` only for real adaptation work (*reduce*, *rewrite*). Plus `category` (`Scenarios`, `Adventures`, `Conquests`… as on GameBanana), `tags` in the SDK's form (`Players: 2-4` for scenarios, 2 to 8; `Language: Spanish` for adventures; `Type: <category>` for anything else the mod also is) and `"redistributable": true` (the room host can send it; `--no-redistributable` if the author asks not to).
   **Civilizations are independent, 100%.** The game's 8 are never modified: a mod that adds a civilization, or changes one (stats, sprites, sounds, behaviors, commands), ships it as **its own civilization next to the game's** ("Gauls" is HD's, "Gauls (Greek Mod 1.8)" the mod's), with its own `civs/<id>.json` (`id`, `index`, `letter`, `race`) and its own class, entity, command and script names. What is not a civilization's (`const.ini`, `items.xml`, game scripts…) goes as a patch that adds only its part, never as a file in the same path as another mod's. So any civilization mods can be combined. `incompatibleWith` between them is only a temporary state for an unfinished port. Rules and the check to run: [AGENTS.md](../AGENTS.md#civilizations-are-independent); letters and indices in use: [Civilization mods](CIVILIZATIONS.md).
5. **Validate** (from the SDK): `node validate-mod.js <folder> --game "<game>" --data originals/game-data/DATA`.
6. **Test** in the game (`mods\`, Additional content) and check `Logs\imperivm\imperivm-mod.log`. `LogFiles=1` under `[Debug]` in `imperivm-mod.ini` logs every file the game opens.
7. **Publish**: zip the folder, *Add → Mod* on GameBanana, same category, tags and version. Under **Credits**, the author as *Original Creator*; you as *Porter* only for *reduce*/*rewrite* mods (for *wrap*, being the submitter is enough). Link the original thread.
8. **Update the tables**: `node tools/sync-table.js` sets *Type* and *Status* from each `mod.json`; add the GameBanana link by hand; `node tools/split-missing.js` after editing a download; `node tools/pending.js` regenerates `PENDING.md`.

## Maps and adventures (`wrap-map.js`)

Resurrected runs on the HD game, so a map made for 1.40, 1.56, a mod or an older Imperivm breaks if it places a unit or object HD doesn't have. `wrap-map.js` checks every class the map places (and the ones its scripts create) against the HD data, the big mods in `originals/mods/` and the class mods in `ported/`:

**Packs and other languages.** A pack of maps with no post (`originals/forum/<pack>/files/*.zip`, e.g. the Greek Mod's `Greek_MapsAdventures.zip`) is audited first: `node tools/audit-pack.js <extracted pack> extras/<pack>/AUDIT.md --game "<game>"` says which maps we already have (so they are skipped), which are another edition and which are new. A new one is wrapped with `node tools/wrap-map.js "pack:<pack>/Adventures/<file>.BFHP" --author "Name; Other name" [--lang Italian]`: only that map, its preview and the videos it plays are unpacked, `--author` is required (the credits, separated by `;`) and `--lang` is the language of its texts (the card gets an Italian description too when it is Italian). The same adventure in another language goes **into the mod we already have** with `--add pack:<pack>/<map>`: both maps are listed in the game as `<name> (Español)` and `<name> (Italiano)`, and a video the entry already has is never replaced. Rows made this way have no post to match, so they name their `ported/` folder in parentheses (`… (guerra-dei-mercenari)`) and `sync-table.js` finds them by that.

- a mod that has every class the map lacks goes in `requires` (with several, the first of Community Mod, Greek Mod, Caesar Mod); one that hides an HD class the map uses goes in `incompatibleWith`. `MODS.md` shows both in *Type*;
- a map that needs a mod not ported yet (⏳, ids `forum-t<topic>`) or classes nobody has (❌) is reported and left out of `ported/`;
- classes are also known by their `altid`, the old name HD still accepts (`RWallsN` is `Rwalls2` in Imperivm II maps); parts of the `.bfhp` are compressed and mangle some names, so an unknown name only counts if placed at least twice;
- a map HD already ships (same bytes) is skipped; a file name another ported mod has is renamed `<name> (<id>).bfhp`; videos go to `movies/`; players are the lobby slots (playerdata ids 0–7) a human can take;
- files in `extras/<id>/` are copied into the mod, and their classes count as known.

Nothing in the map changes, so the original author is the only author (no porter credit). Saga entries are credited to Haemimont Games and FX Interactive. `--players` overrides the players tag; `--file <text>` keeps only the downloads whose name has it. A GameBanana mod with no `mod.json` gets the id `gamebanana-<id>` in the game.
