# Setup (once)

**English** · [Español](es/SETUP.md)

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
| Imperivm I data | `node tools/imperivm1.js setup <patch.exe> <demo.zip>` (see [Maps with Imperivm I classes](BIG-MODS.md#maps-with-imperivm-i-classes)) | `imperivm1` |

`.rar`/`.zip` are unpacked with bsdtar: it is the system `tar` on Windows 10+ and macOS; on Linux install `libarchive-tools` (Debian/Ubuntu) or `libarchive` (Arch, Fedora, Nix). `BSDTAR=<path>` points to another binary.
