# imperivm-mods-port

Port the community's mods, maps and adventures to [Imperivm Resurrected](https://github.com/THIONG/imperivm-resurrected)
and publish them on [GameBanana](https://gamebanana.com/games/26069), crediting each author.

- `MODS.md`: the table. It is the source of truth and is edited by hand.
- `originals/`: downloads, untouched (not in git).
- `ported/<id>/`: each ported mod, with its `mod.json`.
- `raw/`: raw data from Discord and the forum.
- `tools/`: scripts to regenerate `raw/` (see below).
- `AUTHORS.md`: modders and editors, with their Discord account when found, to contact them (local only, not in git: it holds contact data).

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
   Nothing in the map changes, so the original author is the only author (no porter credit). The slug comes from `raw/discord-entries.json`. Players are read from the `.bfhp` (slots with `control="Both"`/`"Human"`); `--players` overrides it.

   **Mods with `.pak`** (Type *reduce*): from `imperivm-resurrected/sdk/en`:
   ```bash
   node tools/shrink-mod.js <original> "<game>" ../../../imperivm-mods-port/ported/<id> --id <id> --name "<Name>" --version 1.0 --category "Maps"
   ```
4. **`mod.json`** with `"authors": ["<Original author>"]` (add `"<your name> (port)"` only for real adaptation work: Type *reduce* or *rewrite*), `category`, `tags` (players or language) and `"redistributable": true` (the room host can send it; `--no-redistributable` if the author asks not to).
5. **Validate** (from `imperivm-resurrected/sdk/en`): `node tools/validate-mod.js <folder> --game "<game>"`.
6. **Test** in the game (`mods\`, Additional content) and check `Logs\imperivm\imperivm-mod.log`.
7. **Publish**: zip the folder, *Add → Mod* on GameBanana, same category, tags and version. Under **Credits**, the author as *Original Creator*; you as *Porter* only for *reduce*/*rewrite* mods (for *wrap*, being the submitter is enough). Link the original thread.
8. Update the row in `MODS.md` (status and GameBanana link).

## Regenerating the data

```bash
python3 tools/scrape-forum.py      # forum -> raw/forum.json (resumes if interrupted)
node tools/parse-discord.js        # raw/discord.json -> raw/discord-entries.json
node tools/download-discord.js     # Discord attachments -> originals/discord/ (URLs expire after ~24 h)
node tools/check-links.js [--all]  # checks the downloads -> raw/links.json
node tools/build-table.js --force  # draft of MODS.md (overwrites manual edits)
```

The data was gathered from the *Imperivm III Editores* Discord server and the [imperivmgbr.foroactivo.com](https://imperivmgbr.foroactivo.com) forum.
