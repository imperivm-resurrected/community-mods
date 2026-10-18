# imperivm-mods-port

Port the community's mods, maps and adventures to [Imperivm Resurrected](https://github.com/THIONG/imperivm-resurrected)
and publish them on [GameBanana](https://gamebanana.com/games/26069), crediting each author.

- `MODS.md`: the table. It is the source of truth and is edited by hand.
- `originals/`: downloads, untouched (not in git).
- `ported/<id>/`: each ported mod, with its `mod.json`.
- `raw/`: raw data from Discord and the forum.
- `tools/`: scripts to regenerate `raw/` (see below).

## For each mod

1. **Permission.** Ask the author (forum or Discord) and keep a screenshot. If the license allows it (e.g. CC BY-SA), there is no need to ask, but the author must be credited.
2. **Download** to `originals/<id>/`.
3. **Discord maps and adventures** (Type *wrap*): creates `ported/<id>/` with the `.bfhp` and `mod.json`:
   ```bash
   BSDTAR=$(nix build --no-link --print-out-paths nixpkgs#libarchive)/bin/bsdtar \
     node tools/wrap-map.js [channel/]<slug> --porter "Villoh"
   ```
   The slug comes from `raw/discord-entries.json`. Players are read from the `.bfhp` (slots with `control="Both"`/`"Human"`); `--players` overrides it.

   **Mods with `.pak`** (Type *reduce*): from `imperivm-resurrected/sdk/es`:
   ```bash
   node herramientas/reducir-mod.js <original> "<game>" ../../../imperivm-mods-port/ported/<id> --id <id> --nombre "<Name>" --version 1.0 --categoria "Maps"
   ```
4. **`mod.json`** with `"authors": ["<Original author>", "<your name> (port)"]`, `category`, `tags` (players or language) and `"redistributable": true` (the room host can send it; `--no-redistributable` if the author asks not to).
5. **Validate**: `node herramientas/validar-mod.js <folder>`.
6. **Test** in the game (`mods\`, Additional content) and check `Logs\imperivm\imperivm-mod.log`.
7. **Publish**: zip the folder, *Add → Mod* on GameBanana, same category, tags and version. Under **Credits**, the author as *Original Creator* and you as *Porter*. Link the original thread.
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
