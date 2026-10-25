# Configuración (una vez)

[English](../SETUP.md) · **Español**

Las herramientas comparan cada mod con los datos del juego, así que hay que extraerlos primero. `extract-data.js` está en el SDK, `imperivm-resurrected/sdk/tools/`; `<game>` es la carpeta del juego HD.

| Qué | Comando | Lo usa |
|---|---|---|
| `DATA` de HD | `node extract-data.js "<game>" originals/game-data` | `wrap-map`, `validate-mod` |
| Los mapas de HD | copiar `Scenarios/` y `Adventures/` del juego a `originals/game-data/` | `wrap-map` (omite los mapas que el juego ya incluye) |
| Todos los paquetes de HD | `node extract-data.js "<game>" originals/game-data/paks <Name>.pak`, para cada `Packs\*.pak` | `port-140` |
| Textos en español de HD | `extract-data.js` sobre `local\spanish.pak` (cópiese antes en una carpeta `Packs\`), salida en `originals/game-data/local-spanish` | `port-140` |
| Textos en italiano de HD | lo mismo sobre `local\italian.pak` (copiado en una carpeta `Packs\`), salida en `originals/game-data/local-italian` | `celtic-kings-adventure` |
| Los paquetes de 1.40 | `data.pak`, `Units.pak`, `Buildings.pak`, `MapObjects.pak` de `Cab3.cab`, dentro de `Imperivm III-1.40-ES.exe` (foro t731, `Imperium_3_official_patch.zip`), extraídos en `originals/game-140/paks` | `port-140` |
| Clases de los mods grandes | el `mod.json`, el `hidden.txt` y los `DATA/**/*.sc.xml` de cada uno en `originals/mods/<mod id>/` | `wrap-map` (`requires`, `incompatibleWith`) |
| Datos de Imperivm I | `node tools/imperivm1.js setup <patch.exe> <demo.zip>` (véase [Mapas con clases de Imperivm I](BIG-MODS.md#mapas-con-clases-de-imperivm-i)) | `imperivm1` |

Los `.rar`/`.zip` se descomprimen con bsdtar: es el `tar` del sistema en Windows 10+ y macOS; en Linux, instálese `libarchive-tools` (Debian/Ubuntu) o `libarchive` (Arch, Fedora, Nix). `BSDTAR=<path>` apunta a otro binario.
