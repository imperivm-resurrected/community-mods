# community-mods

Port the community's mods, maps and adventures to [Imperivm Resurrected](https://github.com/imperivm-resurrected/imperivm-resurrected)
and publish them on [GameBanana](https://gamebanana.com/games/26069), crediting each author.

- `MODS.md`: the table of what can be ported. It is the source of truth and is edited by hand.
- `MISSING.md`: the rows with no working download (dead links or none). `node tools/split-missing.js` moves rows between both files after editing a download.
- `PENDING.md`: what is left to port, grouped by what holds it back, with where its files are. `node tools/pending.js` regenerates it from `MODS.md`.
- `originals/`: downloads, untouched (not in git). Screenshots for the GameBanana page: of each Discord entry in `originals/discord/<channel>/<slug>/screenshots/`, and of forum topics in `originals/forum/t<id>/screenshots/` (`node tools/download-forum-shots.js`, images in the opening post); 📷 in `MODS.md`.
- `ported/<id>/`: each ported mod, with its `mod.json`.
- `raw/`: the mod entries pulled from Discord and the forum, and the link checks. The full crawls (`forum.json`, `discord.json`) stay local: they hold unrelated messages.
- `tools/`: scripts to regenerate `raw/` (see below).
- `AUTHORS.md`: modders and editors, with their Discord account when found, to contact them.

## Authors and removal requests

Every mod is published with full credit to its original author. Many of these modders and editors are no longer active, so reaching them is often hard. In any case, if a modder or editor asks for their mod to be removed, it will be removed from GameBanana and from this repository, no questions asked.

## For each mod

1. **Author.** Try to reach the author (Discord, see `AUTHORS.md`, or forum) and note the answer in the *Permission* column. If they cannot be reached, publish with full credit; remove it if they ask (see above). If the license allows it (e.g. CC BY-SA), there is no need to ask, but the author must be credited.
2. **Download** to `originals/<id>/`.
3. **Discord maps and adventures** (Type *wrap*): creates `ported/<id>/` with the `.bfhp` and `mod.json`:
   ```bash
   node tools/wrap-map.js [channel/]<slug>    # Discord entry
   node tools/wrap-map.js forum/t<topic id>   # forum topic, after tools/download-forum.js
   ```
   `.rar`/`.zip` are unpacked with bsdtar: it is the system `tar` on Windows 10+ and macOS; on Linux install `libarchive-tools` (Debian/Ubuntu) or `libarchive` (Arch, Fedora, Nix). `BSDTAR=<path>` points to another binary.
   **Compatibility (1.40, 1.56 and HD).** Resurrected runs on the HD game, so a map made for 1.40/1.56 or for a mod breaks if it places a unit or object the HD game does not have. `wrap-map.js` checks every class the map places against the game data, if extracted once (from `imperivm-resurrected/sdk/en`):
   ```bash
   node tools/extract-data.js "<game>" <community-mods>/originals/game-data
   ```
   Also copy the game's `Scenarios/` and `Adventures/` folders there: a map the HD game already ships (same bytes) is not wrapped.
   Big mods change that set too: copy each one's `mod.json`, `hidden.txt` and `DATA/**/*.sc.xml` to `originals/mods/<mod id>/` (the Community Mod and the Caesar Mod hide game files, e.g. the wild horse). A GameBanana mod with no `mod.json` gets the id `gamebanana-<id>` in the game; a mod still to port goes in as `forum-t<topic>`. Then each map gets `requires` if a mod has every class it lacks (with several, the first of Community Mod, Greek Mod, Caesar Mod), and `incompatibleWith` for each mod that hides an HD class it uses; `MODS.md` shows both in *Type*. A map that needs a mod not ported yet (⏳), or classes nobody has (❌, *requires ? mod*), is reported and left out of `ported/`. Parts of the `.bfhp` are compressed and mangle some names, so an unknown name only counts if placed at least twice.
   Classes are also known by their `altid`, the old name the HD game still accepts (`RWallsN` is `Rwalls2` in Imperivm II maps). Imperivm I classes the HD game dropped come from the shared mod `imperivm1-legacy` (see [Maps with Imperivm I classes](#maps-with-imperivm-i-classes)): any class mod in `ported/` counts as known, so those maps get `requires: ["imperivm1-legacy"]`. For a one-off fix, files in `extras/<id>/` are copied into that mod and their classes count as known. Players are the lobby slots (playerdata ids 0–7) a human can take.
   A `.bfhp` with the same file name as one in another ported mod is renamed `<name> (<id>).bfhp`, or one would hide the other. Videos (`.avi`) go to `movies/`. Saga entries are credited to Haemimont Games and FX Interactive.

   Nothing in the map changes, so the original author is the only author (no porter credit). The slug comes from `raw/discord-entries.json`. `--players` overrides the players tag; `--file <text>` keeps only the downloads whose name has it.

   **Mods with `.pak`** (Type *reduce*): from `imperivm-resurrected/sdk/en`:
   ```bash
   node tools/shrink-mod.js <original> "<game>" <community-mods>/ported/<id> --id <id> --name "<Name>" --version 1.0 --category "Maps"
   ```
4. **`mod.json`** with `"authors": ["<Original author>"]` (add `"<your name> (port)"` only for real adaptation work: Type *reduce* or *rewrite*), `category`, `tags` (players or language) and `"redistributable": true` (the room host can send it; `--no-redistributable` if the author asks not to).
5. **Validate** (from `imperivm-resurrected/sdk/en`): `node tools/validate-mod.js <folder> --game "<game>"`.
6. **Test** in the game (`mods\`, Additional content) and check `Logs\imperivm\imperivm-mod.log`.
7. **Publish**: zip the folder, *Add → Mod* on GameBanana, same category, tags and version. Under **Credits**, the author as *Original Creator*; you as *Porter* only for *reduce*/*rewrite* mods (for *wrap*, being the submitter is enough). Link the original thread.
8. `node tools/sync-table.js` sets *Type* and *Status* of every wrapped row from its `mod.json` (`raw/ported.json` says which row each mod comes from). Add the GameBanana link by hand. If a download turns out dead, run `node tools/split-missing.js`.

## Mods made for 1.40

Most big mods (MCI, CGWAR, AsvrMod, La Reconquista, GBR Tactics) were copied over an Imperivm III 1.40 install: loose `DATA`, `UNITS`, `UI`… folders and often their own `rle.mmp`. On HD they would undo its fixes, and their `.rle.mmp` sprites only work with their own `rle.mmp`. `tools/port-140.js` turns one into a Resurrected mod:

```bash
# once: every HD pack, the HD Spanish texts, and the 1.40 patch's packs (forum t731, Imperium_3_official_patch.zip >
# "Imperivm III-1.40-ES.exe" > Cab3.cab), each with extract-data.js
node tools/port-140.js <old mod folder> ported/<id> --id <id> --name "<Name>" --version <v> --category "<Category>"
```

Each file is compared with HD **and** with 1.40, the version the mod was made on:

- same as HD, or same as 1.40 (the mod didn't touch it): left out, the HD one stays;
- only the mod changed it: the mod's;
- both changed it: 3-way merge (`git merge-file`, 1.40 as base). Where both touched the same lines, XML is merged attribute by attribute and `.ini` key by key over the whole file (HD moved blocks around), and the mod wins a value both changed (a balance mod is about those values). Anything else goes to `raw/port-140/<id>.md`;
- `.rle.mmp`: rebuilt as standalone `.rle` from the mod's `rle.mmp`, and left out if the pixels are the HD ones (a mod can't replace a game sprite anyway);
- texts: only the entries that differ from the HD Spanish table, as `loc/spanish.loc.xml` (added to the game's, so HD's own new texts stay);
- a menu background drawn for 1024x768 is fitted to the three HD sizes the game picks from (menubackground 1366x768, menu_16_9 1920x1080, menu_4_3 1600x1200: scaled to the height, the left half and the right border kept, the parchment between stretched), classes saved as Latin-1 become UTF-8 (otherwise HD skips them without a word), and item/victory scripts get the signature line HD needs.

Conflicts are resolved by hand in `extras/<id>/` (the final files, plus `mod.json` with credits and description); the tool copies them over its output, so the port can be rebuilt from the original download. `ported/<id>/` of these mods isn't in git: it's mostly the authors' files and game data.

The MCI (`extras/mci/`) is the first one: 1104 files from the 9.0 zip, 123 merged with HD, 27 resolved by hand (the HD guard post, gold selling, AI-only parry mode, kill statistics and sentry guards kept alongside the MCI's tributes, stances and veterans). Its own bugs from 1.40 are kept as they were (scripts it references but never shipped); only `GreatTavern`, a class that doesn't exist, is dropped from the random map, where HD would hang.

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

## Regenerating the data

```bash
python3 tools/scrape-forum.py      # forum -> raw/forum.json (local; resumes if interrupted)
node tools/parse-forum.js          # raw/forum.json -> raw/forum-entries.json (topics with the author's links)
node tools/parse-discord.js        # raw/discord.json (local) -> raw/discord-entries.json
node tools/download-discord.js     # Discord attachments -> originals/discord/ (URLs expire after ~24 h)
node tools/download-forum.js       # files behind the live links of rows with no local copy -> originals/forum/<t id>/files/
                                   #   (Mega needs megadl; ModDB needs a browser on CDP port 9333 for its Cloudflare check)
node tools/download-forum-shots.js # screenshots of forum topics -> originals/forum/t<id>/screenshots/
node tools/check-links.js [--all]  # checks the downloads -> raw/links.json
node tools/build-table.js --force  # draft of MODS.md + MISSING.md (overwrites manual edits)
```

The data was gathered from the *Imperivm III Editores* Discord server and the [imperivmgbr.foroactivo.com](https://imperivmgbr.foroactivo.com) forum.

## License

The scripts in `tools/` are GPL-3.0 (see `LICENSE`), like Imperivm Resurrected. The maps, adventures and mods, and their names and descriptions, belong to their authors and are not covered by it.
