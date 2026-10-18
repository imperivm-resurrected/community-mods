# community-mods

Port the community's mods, maps and adventures to [Imperivm Resurrected](https://github.com/imperivm-resurrected/imperivm-resurrected)
and publish them on [GameBanana](https://gamebanana.com/games/26069), crediting each author.

- `MODS.md`: the table of what can be ported. It is the source of truth and is edited by hand.
- `MISSING.md`: the rows with no working download (dead links or none). `node tools/split-missing.js` moves rows between both files after editing a download.
- `originals/`: downloads, untouched (not in git). Screenshots of each Discord entry, for the GameBanana page, are in `originals/discord/<channel>/<slug>/screenshots/` (📷 in `MODS.md`).
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
   node tools/wrap-map.js [channel/]<slug>
   ```
   `.rar`/`.zip` are unpacked with bsdtar: it is the system `tar` on Windows 10+ and macOS; on Linux install `libarchive-tools` (Debian/Ubuntu) or `libarchive` (Arch, Fedora, Nix). `BSDTAR=<path>` points to another binary.
   **Compatibility (1.40, 1.56 and HD).** Resurrected runs on the HD game, so a map made for 1.40/1.56 or for a mod breaks if it places a unit or object the HD game does not have. `wrap-map.js` checks every class the map places against the game data, if extracted once (from `imperivm-resurrected/sdk/en`):
   ```bash
   node tools/extract-data.js "<game>" <community-mods>/originals/game-data
   ```
   Big mods change that set too: copy each one's `mod.json`, `hidden.txt` and `DATA/**/*.sc.xml` to `originals/mods/<mod id>/` (the Community Mod and the Caesar Mod hide game files, e.g. the wild horse). Then each map gets `requires` if only that mod has a class it uses, and `incompatibleWith` if that mod hides one; `MODS.md` shows both in *Type*. A map using classes nobody has prints ❌: it needs a mod we do not have (*requires ? mod*). Parts of the `.bfhp` are compressed and mangle some names, so an unknown name only counts if placed at least twice.

   Nothing in the map changes, so the original author is the only author (no porter credit). The slug comes from `raw/discord-entries.json`. Players are read from the `.bfhp` (slots with `control="Both"`/`"Human"`); `--players` overrides it.

   **Mods with `.pak`** (Type *reduce*): from `imperivm-resurrected/sdk/en`:
   ```bash
   node tools/shrink-mod.js <original> "<game>" <community-mods>/ported/<id> --id <id> --name "<Name>" --version 1.0 --category "Maps"
   ```
4. **`mod.json`** with `"authors": ["<Original author>"]` (add `"<your name> (port)"` only for real adaptation work: Type *reduce* or *rewrite*), `category`, `tags` (players or language) and `"redistributable": true` (the room host can send it; `--no-redistributable` if the author asks not to).
5. **Validate** (from `imperivm-resurrected/sdk/en`): `node tools/validate-mod.js <folder> --game "<game>"`.
6. **Test** in the game (`mods\`, Additional content) and check `Logs\imperivm\imperivm-mod.log`.
7. **Publish**: zip the folder, *Add → Mod* on GameBanana, same category, tags and version. Under **Credits**, the author as *Original Creator*; you as *Porter* only for *reduce*/*rewrite* mods (for *wrap*, being the submitter is enough). Link the original thread.
8. Update the row in `MODS.md` (status and GameBanana link). If its download turns out dead, run `node tools/split-missing.js`.

## Regenerating the data

```bash
python3 tools/scrape-forum.py      # forum -> raw/forum.json (local; resumes if interrupted)
node tools/parse-forum.js          # raw/forum.json -> raw/forum-entries.json (topics with the author's links)
node tools/parse-discord.js        # raw/discord.json (local) -> raw/discord-entries.json
node tools/download-discord.js     # Discord attachments -> originals/discord/ (URLs expire after ~24 h)
node tools/check-links.js [--all]  # checks the downloads -> raw/links.json
node tools/build-table.js --force  # draft of MODS.md + MISSING.md (overwrites manual edits)
```

The data was gathered from the *Imperivm III Editores* Discord server and the [imperivmgbr.foroactivo.com](https://imperivmgbr.foroactivo.com) forum.

## License

The scripts in `tools/` are GPL-3.0 (see `LICENSE`), like Imperivm Resurrected. The maps, adventures and mods, and their names and descriptions, belong to their authors and are not covered by it.
