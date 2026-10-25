# Herramientas

[English](../TOOLS.md) · **Español**

| Script | Qué hace |
|---|---|
| **Recopilación** | |
| [`scrape-forum.js`](../../tools/scrape-forum.js) | Foro en español → `raw/forum.json` (no está en git: el rastreo completo contiene mensajes ajenos; se reanuda si se interrumpe). Necesita `FORUM_COOKIE` |
| [`scrape-forum-it.js`](../../tools/scrape-forum-it.js) | Foro en italiano → `raw/forum-it.json` (no está en git) y su tabla de descargas → `raw/forum-it-downloads.json`. Necesita `FORUM_IT_COOKIE` (comparte [`scrape-common.js`](../../tools/scrape-common.js)) |
| [`parse-forum.js`](../../tools/parse-forum.js) | `raw/forum.json` → `raw/forum-entries.json`: temas con los enlaces del autor |
| [`parse-discord.js`](../../tools/parse-discord.js) | `raw/discord.json` (no está en git, como `forum.json`) → `raw/discord-entries.json` |
| [`scrape-moddb.js`](../../tools/scrape-moddb.js) | Todo lo que hay en ModDB sobre los juegos Imperivm → `raw/moddb.json` |
| [`audit-pack.js`](../../tools/audit-pack.js) | Un pack de mapas → `AUDIT.md`: nombre y autor de cada mapa (de su `game.xml`) y si duplica alguno de los nuestros (SHA-256, después archivos compartidos). Necesita `bsdtar` |
| [`download-discord.js`](../../tools/download-discord.js) | Adjuntos de Discord → `originals/discord/<channel>/<slug>/` (las URL caducan a las ~24 h) |
| [`download-forum.js`](../../tools/download-forum.js) | Archivos tras los enlaces activos de las filas sin copia local → `originals/forum/<key>/files/`. Mega necesita `megadl`; ModDB, un navegador en el puerto CDP 9333 (Cloudflare). `--force=<keys>` vuelve a descargar |
| [`download-forum-shots.js`](../../tools/download-forum-shots.js) | Capturas del mensaje inicial de cada tema del foro → `originals/forum/t<id>/screenshots/` |
| [`check-links.js`](../../tools/check-links.js) `[--all]` | Comprueba las descargas → `raw/links.json` |
| **Tablas** | |
| [`build-table.js`](../../tools/build-table.js) `--force` | Primer borrador de `MODS.md` + `MISSING.md`. Sobrescribe las ediciones manuales: solo en una copia de pruebas |
| [`split-missing.js`](../../tools/split-missing.js) | Mueve filas entre `MODS.md` y `MISSING.md` según sus descargas, y los enlaces caídos a `DEAD-LINKS.md` |
| [`sync-table.js`](../../tools/sync-table.js) | *Type* y *Status* de cada fila portada, a partir de su `mod.json` |
| [`pending.js`](../../tools/pending.js) | `PENDING.md` a partir de `MODS.md` |
| **Portado** | |
| [`wrap-map.js`](../../tools/wrap-map.js) | Un mapa o aventura (un mensaje de Discord, un tema del foro o un mapa de un pack) → `ported/<id>/` |
| [`port-140.js`](../../tools/port-140.js) | Un mod de 1.40 con archivos sueltos → `ported/<id>/` |
| [`flatten-paks.js`](../../tools/flatten-paks.js) | Un mod de 1.40 que es una copia completa del juego (paquetes `.pak` enteros) → archivos sueltos, para `port-140.js` (el Greek Mod 1.8) |
| [`greek-1-8.js`](../../tools/greek-1-8.js) | Después de `port-140.js`: la Grecia del Greek Mod 1.8 como civilización independiente (`greek18`, letra `Q`): renombrados, parches, IA como `GR18_*` |
| [`shared-paths.js`](../../tools/shared-paths.js) `<ported id>` | Archivos, ids de clase y carpetas de entidades que un port comparte con el juego y con los demás ports (la comprobación de independencia) |
| [`merge-secuter-fun.js`](../../tools/merge-secuter-fun.js) | El mod Fun de Secuter (filas 312): termina lo que `port-140.js` dejó en conflicto, conservando los cambios de HD y los del mod (las decisiones, en los comentarios) |
| [`port-translation.js`](../../tools/port-translation.js) | La traducción de un mod para 1.40 (`GAME.LOC.XML`) → `loc/<language>.loc.xml` solo con los textos que tradujo |
| [`imperivm1.js`](../../tools/imperivm1.js) | Clases de Imperivm I → `ported/imperivm1-legacy/` |
| [`cgwar-civs.js`](../../tools/cgwar-civs.js) | Después de `port-140.js`, antes de `cgwar-greece.js`: la Roma Imperial (CGWAR) y la Roma Republicana (CGWAR), dos clones de la Roma Republicana, cada uno con los comandos que tenía activos su rama del mod (la elección en la Arena no se porta) |
| [`cgwar-greece.js`](../../tools/cgwar-greece.js) | Después de `cgwar-civs.js`: la Grecia del CGWAR como civilización nueva |
| [`cgwar-independent.js`](../../tools/cgwar-independent.js) | Después de `cgwar-greece.js`: los archivos del juego que reemplazó pasan a ser parches de lo que es griego; el resto se descarta. El monitor de escuadrones de la IA del mod solo lo ejecutan los jugadores de IA de sus civilizaciones (`GR_SquadMonitor.vs`, lo arranca un parche de `Main.vs`), los textos en español de las investigaciones que renombra conservan su traducción, y su conquista pasa a ser una propia junto a la del juego (`tools/lib/conquests.js`) |
| [`celtic-kings-adventure.js`](../../tools/celtic-kings-adventure.js) | La Celtic Kings Adventure (fila 202): los tres zips de ModDB → `ported/celtic-kings-adventure/`; sus clases, comandos y objetos como propios (`CK*`), el `.bfhp` editado en el sitio para usarlos (`hpfs.js`), los textos como `loc/` |
| [`gbr-tactics.js`](../../tools/gbr-tactics.js) | Después de `port-140.js`: las ocho civilizaciones de GBR Tactics 2.4 como civilizaciones propias (ids `<civ>_gbrt`, prefijos derivados), sus objetos nuevos como parches; los scripts del mod que el compilador del juego rechaza se corrigen (véase `extras/gbr-tactics/NOTES.md`) |
| [`antioco-iii.js`](../../tools/antioco-iii.js) | Después de `port-140.js`: Antíoco III el Grande (Falcata) como pack de contenido, sin civilización: descarta la copia del Greek Mod 1.8 con la que venía, convierte en parches los archivos que están en rutas del juego, renombra lo que también nombran el CGWAR, el MCI y el Community Mod (`_ant`, también en los mapas), sigue los nombres `Q*` del 1.8, añade las clases de héroe y los iconos que necesitan los mapas, y coloca las dos aventuras en `Adventures/` |
| [`greek-4-2.js`](../../tools/greek-4-2.js) | El Greek Mod 4.2 como civilizaciones propias (y las ramas de Roma y de Cartago); `tools/lib/` contiene lo que comparte con los demás |
| [`lib/lzis.js`](../../tools/lib/lzis.js) | Decodifica un paquete que el motor guarda comprimido con LZIS (el `Z-RandomMap.pak` de GBR Tactics); lo usa `flatten-paks.js` |
| [`compare-mods.js`](../../tools/compare-mods.js) | Los Greek mods lado a lado, por stdout (`> GREEK-MODS.md`, ignorado por git) |
| [`mod-class-diff.js`](../../tools/mod-class-diff.js) | Qué cambió un mod de 1.40 en las clases del juego, por civilización, respecto al 1.40 oficial |
| [`greek-terrains.js`](../../tools/greek-terrains.js) | Las capas de terreno 41-55 del Greek Mod (del zip del Caesar Mod) → `ported/greek-mod-terrains/`; `wrap-map` hace que los mapas pintados con ellas lo requieran |
| [`hpfs.js`](../../tools/hpfs.js) `<map.bfhp> [outDir]` | Lista o extrae un `.bfhp` de escenario/aventura (HPFS); como módulo, también reescribe un archivo en el sitio (de cualquier longitud dentro de sus páginas) |
