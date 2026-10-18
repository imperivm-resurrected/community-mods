# imperivm-mods-port

Portear los mods, mapas y aventuras de la comunidad a [Imperivm Resurrected](https://github.com/THIONG/imperivm-resurrected)
y publicarlos en [GameBanana](https://gamebanana.com/games/26069) con el crédito de cada autor.

- `MODS.md`: la tabla. Es la fuente de verdad; se edita a mano.
- `originals/`: lo descargado, sin tocar (no se sube a git).
- `ported/<id>/`: cada mod adaptado, con su `mod.json`.
- `raw/`: datos en bruto de Discord y del foro.
- `tools/`: scripts para regenerar `raw/` (ver abajo).

## Por cada mod

1. **Permiso.** Pídeselo al autor (foro o Discord) y guarda la captura. Si la licencia lo permite (p. ej. CC BY-SA), no hace falta pedirlo, pero hay que citar al autor.
2. **Descargar** a `originals/<id>/`.
3. **Mapas y aventuras de Discord** (Tipo *envolver*): crea `ported/<id>/` con el `.bfhp`, `mod.json` y `CREDITOS.txt`:
   ```bash
   BSDTAR=$(nix build --no-link --print-out-paths nixpkgs#libarchive)/bin/bsdtar \
     node tools/wrap-map.js [canal/]<slug> --porter "<tu nombre>" --jugadores "4 players"
   ```
   El slug sale de `raw/discord-entries.json`. El número de jugadores se comprueba en la sala del juego.

   **Mods con `.pak`** (Tipo *reducir*): desde `imperivm-resurrected/sdk/es`:
   ```bash
   node herramientas/reducir-mod.js <original> "<juego>" ../../../imperivm-mods-port/ported/<id> --id <id> --nombre "<Nombre>" --version 1.0 --categoria "Maps"
   ```
4. **`mod.json`** con `"authors": ["<Autor original>", "<tu nombre> (port)"]`, `category`, `tags` (jugadores o idioma) y `"redistributable": true` si el autor lo permite.
5. **Validar**: `node herramientas/validar-mod.js <carpeta>`.
6. **Probar** en el juego (`mods\`, Contenido adicional) y mirar `Logs\imperivm\imperivm-mod.log`.
7. **Publicar**: zip de la carpeta, *Add → Mod* en GameBanana, misma categoría, etiquetas y versión. En **Credits**, el autor como *Original Creator* y tú como *Porter*. Enlaza el hilo original.
8. Actualiza la fila en `MODS.md` (estado y enlace de GameBanana).

## Regenerar los datos

```bash
python3 tools/scrape-forum.py      # foro -> raw/forum.json (reanuda si se corta)
node tools/parse-discord.js        # raw/discord.json -> raw/discord-entries.json
node tools/download-discord.js     # adjuntos de Discord -> originals/discord/ (las URLs caducan en ~24 h)
node tools/check-links.js [--all]  # comprueba las descargas -> raw/links.json
node tools/build-table.js --force  # borrador de MODS.md (machaca las ediciones a mano)
```

Los datos se recopilaron del Discord *Imperivm III Editores* y del foro [imperivmgbr.foroactivo.com](https://imperivmgbr.foroactivo.com).
