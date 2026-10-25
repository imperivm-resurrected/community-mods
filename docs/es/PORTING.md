# Portar un mod

[English](../PORTING.md) · **Español**

1. **Autor.** Intentar contactar con el autor (Discord, véase [AUTHORS.md](../AUTHORS.md), o el foro) y anotar la respuesta en la columna *Permission*. Si no se le puede localizar, se publica con todo el crédito; se retira si lo pide (véase [Autores y peticiones de retirada](../../README.es.md#autores-y-peticiones-de-retirada)). Si la licencia lo permite (p. ej. CC BY-SA), no hace falta preguntar, pero hay que dar crédito al autor.
2. **Descargar**: `node tools/download-discord.js` (adjuntos de Discord) o `node tools/download-forum.js` (foro, Mega, MediaFire, ModDB…).
3. **Portar**, con la herramienta que corresponda a su *Type* (tipo):

   | Type | Qué es el mod | Herramienta |
   |---|---|---|
   | *wrap* | Un mapa o una aventura, sin tocar | `node tools/wrap-map.js [channel/]<slug>` (Discord), `forum/t<topic id>`, o `pack:<pack>/<map> --author "…"` para un solo mapa de un pack descargado (véase más abajo) |
   | *reduce* | Un mod con paquetes `.pak` completos | `node shrink-mod.js <original> "<game>" ported/<id> --id <id> …` (SDK) |
   | *rewrite* | Un mod de archivos sueltos hecho para 1.40 | `node tools/port-140.js <folder> ported/<id> --id <id> …` (véase [Mods hechos para 1.40](BIG-MODS.md#mods-hechos-para-140)) |
   | *wrap · requires imperivm1-legacy* | Un mapa con clases de Imperivm I | `node tools/imperivm1.js add <map.bfhp>`, y después `wrap-map.js` |

4. **`mod.json`**: `"authors": ["<Original author>"]`; añadir `"<your name> (port)"` solo si hay un trabajo real de adaptación (*reduce*, *rewrite*). Además `category` (`Scenarios`, `Adventures`, `Conquests`… como en GameBanana), `tags` en la forma del SDK (`Players: 2-4` para escenarios, de 2 a 8; `Language: Spanish` para aventuras; `Type: <category>` para cualquier otra cosa que el mod también sea) y `"redistributable": true` (el anfitrión de la sala puede enviarlo; `--no-redistributable` si el autor pide que no).
   **Las civilizaciones son independientes, al 100 %.** Las 8 del juego no se modifican nunca: un mod que añade una civilización, o cambia una (estadísticas, sprites, sonidos, comportamientos, comandos), la entrega como **una civilización propia junto a las del juego** ("Gauls" es la de HD, "Gauls (Greek Mod 1.8)" la del mod), con su propio `civs/<id>.json` (`id`, `index`, `letter`, `race`) y sus propios nombres de clases, entidades, comandos y scripts. Lo que no es de una civilización (`const.ini`, `items.xml`, scripts del juego…) va como un parche que añade solo su parte, nunca como un archivo en la misma ruta que el de otro mod. Así, cualquier mod de civilizaciones se puede combinar con otro. `incompatibleWith` entre ellos es solo un estado temporal de un port sin terminar. Reglas y comprobación que hay que ejecutar: [AGENTS.md](../../AGENTS.md#civilizations-are-independent); letras e índices en uso: [Mods de civilizaciones](CIVILIZATIONS.md).
5. **Validar** (desde el SDK): `node validate-mod.js <folder> --game "<game>" --data originals/game-data/DATA`.
6. **Probar** en el juego (`mods\`, Additional content) y revisar `Logs\imperivm\imperivm-mod.log`. `LogFiles=1` bajo `[Debug]` en `imperivm-mod.ini` registra cada archivo que abre el juego.
7. **Publicar**: comprimir la carpeta en zip, *Add → Mod* en GameBanana, con la misma categoría, etiquetas y versión. En **Credits**, el autor como *Original Creator*; quien porta el mod, como *Porter*, solo en los mods *reduce*/*rewrite* (en *wrap* basta con ser quien lo envía). Enlazar el hilo original.
8. **Actualizar las tablas**: `node tools/sync-table.js` establece *Type* y *Status* a partir de cada `mod.json`; el enlace de GameBanana se añade a mano; `node tools/split-missing.js` tras editar una descarga; `node tools/pending.js` regenera `PENDING.md`.

## Mapas y aventuras (`wrap-map.js`)

Resurrected se ejecuta sobre el juego HD, así que un mapa hecho para 1.40, 1.56, un mod o un Imperivm anterior se rompe si coloca una unidad u objeto que HD no tiene. `wrap-map.js` comprueba cada clase que coloca el mapa (y las que crean sus scripts) con los datos de HD, los mods grandes de `originals/mods/` y los mods de clases de `ported/`:

**Packs y otros idiomas.** Un pack de mapas sin post (`originals/forum/<pack>/files/*.zip`, p. ej. el `Greek_MapsAdventures.zip` del Greek Mod) se audita primero: `node tools/audit-pack.js <extracted pack> extras/<pack>/AUDIT.md --game "<game>"` indica qué mapas ya tenemos (y se omiten), cuáles son otra edición y cuáles son nuevos. Uno nuevo se envuelve con `node tools/wrap-map.js "pack:<pack>/Adventures/<file>.BFHP" --author "Name; Other name" [--lang Italian]`: solo se descomprimen ese mapa, su vista previa y los vídeos que reproduce; `--author` es obligatorio (los créditos, separados por `;`) y `--lang` es el idioma de sus textos (la ficha también recibe una descripción en italiano cuando es italiano). La misma aventura en otro idioma va **dentro del mod que ya tenemos** con `--add pack:<pack>/<map>`: ambos mapas aparecen en el juego como `<name> (Español)` y `<name> (Italiano)`, y un vídeo que la entrada ya tiene nunca se reemplaza. Las filas creadas así no tienen post con el que emparejarse, así que nombran su carpeta de `ported/` entre paréntesis (`… (guerra-dei-mercenari)`) y `sync-table.js` las encuentra por ese nombre.

- un mod que tenga todas las clases que le faltan al mapa va en `requires` (si son varios, el primero de Community Mod, Greek Mod, Caesar Mod); uno que oculte una clase de HD que usa el mapa va en `incompatibleWith`. `MODS.md` muestra ambos en *Type*;
- un mapa que necesita un mod aún no portado (⏳, ids `forum-t<topic>`) o clases que nadie tiene (❌) se notifica y se deja fuera de `ported/`;
- las clases también se conocen por su `altid`, el nombre antiguo que HD sigue aceptando (`RWallsN` es `Rwalls2` en los mapas de Imperivm II); partes del `.bfhp` están comprimidas y estropean algunos nombres, así que un nombre desconocido solo cuenta si se coloca al menos dos veces;
- un mapa que HD ya incluye (mismos bytes) se omite; un nombre de archivo que ya tiene otro mod portado se renombra a `<name> (<id>).bfhp`; los vídeos van a `movies/`; los jugadores son los huecos del lobby (ids de playerdata 0–7) que puede ocupar una persona;
- los archivos de `extras/<id>/` se copian en el mod, y sus clases cuentan como conocidas.

Nada del mapa cambia, así que el autor original es el único autor (sin crédito de porter). Las entradas de las sagas se acreditan a Haemimont Games y FX Interactive. `--players` sustituye la etiqueta de jugadores; `--file <text>` conserva solo las descargas cuyo nombre lo contiene. Un mod de GameBanana sin `mod.json` recibe el id `gamebanana-<id>` en el juego.
