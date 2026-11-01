# Mods hechos para 1.40

[English](../BIG-MODS.md) · **Español**

La mayoría de los mods grandes (MCI, CGWAR, AsvrMod, La Reconquista, GBR Tactics) se copiaron sobre una instalación de Imperivm III 1.40: carpetas sueltas `DATA`, `UNITS`, `UI`… y, a menudo, su propio `rle.mmp`. En HD deshacerían sus correcciones, y sus sprites `.rle.mmp` solo funcionan con su propio `rle.mmp`. `tools/port-140.js` compara cada archivo con HD **y** con 1.40, la versión sobre la que se hizo el mod:

| El archivo | Resultado |
|---|---|
| Igual que en HD, o igual que en 1.40 (el mod no lo tocó) | Se descarta: se queda el de HD |
| Solo lo cambió el mod | El del mod |
| Lo cambiaron ambos | Fusión a tres bandas (`git merge-file`, con 1.40 como base; XML sin líneas en blanco si así encaja mejor, porque HD añadió una entre cada línea de algunas entidades). Donde ambos tocaron las mismas líneas: XML atributo por atributo (las etiquetas repetidas se distinguen por `idx`/`name`/`id`), el mod gana en un valor que cambiaron los dos (un mod de equilibrio trata justo de esos valores), y un bloque que el mod solo reindentó es el de HD. Todo lo demás va a `raw/port-140/<id>.md` para revisarlo ([el de MCI](../../raw/port-140/mci.md)) |
| `.ini` | Clave por clave en todo el archivo (HD movió bloques de sitio). `[Resolutions]` es siempre el de HD: una lista de 1.40 arranca el juego a 640x480 |
| Sprites `.rle.mmp` | Reconstruidos como `.rle` independientes a partir del `rle.mmp` del mod; se descartan si los píxeles son los de HD (un mod no puede reemplazar un sprite del juego de todos modos) |
| `currentlang\*.loc.xml` | Solo las entradas que difieren de la tabla en español de HD, como `loc/spanish.loc.xml` (se añade a la del juego, así que los textos propios de HD se mantienen) |
| Fondo del menú | Dibujado para 1024x768; se ajusta al de HD, 1920x1080 en Steam (un `Currentlang/MENUBACKGROUND.bmp` suelto sobre el de 1366x768 del paquete): se escala a la altura, se conservan la mitad izquierda y el borde derecho, y se estira el pergamino del medio |
| Clases en Latin-1 | Guardadas como UTF-8 (si no, HD las salta sin avisar) |
| Entidades que nombran `SHADOW.RLE` | Pasan a `.rle`: HD solo toma el sprite suelto de un mod si la extensión va en minúscula (si no, busca `SHADOW.RLE.bmp` y, en un edificio, se cuelga) |
| Scripts de objetos y de victoria | Reciben la línea de firma que necesita HD |

Los conflictos se resuelven a mano en `extras/<id>/` (los archivos finales, más `mod.json` con créditos y descripción); la herramienta los copia sobre su salida, de modo que el port se puede reconstruir a partir de la descarga original más el repositorio. `ported/<id>/` de estos mods no está en git: son sobre todo archivos de los autores y datos del juego.

```bash
node tools/port-140.js <old mod folder> ported/<id> --id <id> --name "<Name>" --version <v> --category "<Category>"
```

El MCI ([extras/mci/](../../extras/mci/)) es el primero: 1104 archivos del zip 9.0, 123 fusionados con HD, 30 resueltos o corregidos a mano (el puesto de guardia de HD, la venta de oro, el modo de parada solo para la IA, las estadísticas de bajas y los centinelas se conservan junto a los tributos, las posturas y los veteranos del MCI). Sus propios fallos de 1.40 se mantienen tal cual (scripts que referencia pero nunca incluyó), salvo donde HD se rompería: `GreatTavern`, una clase que no existe, se quita del mapa aleatorio (lo bloquearía), y `beh_punto.vs` llama a `CreateFeedback` en lugar de `PlaceFeedback`, que ninguna versión del juego tiene.

El CGWAR ([extras/cgwar/](../../extras/cgwar/)) puso a Grecia en lugar de la Roma Imperial; aquí es una civilización nueva (`civs/greece.json`, índice 30, letra `K`) y la Roma Imperial sigue siendo la de HD. El mod también dejaba que la Roma Republicana se volviera Imperial o Republicana en la Arena; esa elección no se porta, [`tools/cgwar-civs.js`](../../tools/cgwar-civs.js) (tras `port-140.js`, antes del siguiente) convierte cada rama en una civilización: `cgwarimperial` («Imp. Rome (CGWAR)», prefijo `Cgw` derivado) y `cgwarrepublic` («Rep. Rome (CGWAR)», prefijo `Cgr`), índices asignados por el motor. Después, [`tools/cgwar-greece.js`](../../tools/cgwar-greece.js) hace el cambio: las clases griegas reciben `race="greece"`, las piezas imperiales que el mod redibujó (murallas, puertas, torre, campesinos) pasan a ser copias `K*` para que el constructor de ciudades las encuentre por letra, se descartan la fusión «Roma» (la Roma Republicana que se vuelve Republicana o Imperial en la Arena), sus scripts de IA y las aventuras oficiales y poblaciones del mapa aleatorio que editó (su conquista del Mediterráneo, con un territorio de Grecia, se queda como `mediterranean (cgwar)` junto a la del juego: [`tools/cgwar-independent.js`](../../tools/cgwar-independent.js)), y los comandos compartidos pasan a ser parches que solo añaden las fuentes griegas (los comandos exclusivos de Grecia van a `DATA/COMMANDS/GREECE.XML`). Los scripts de asentamientos de IA del mod suponen que «Roma Imperial = Grecia», y una IA griega sí ve su base, la Roma Imperial: entran como `GR_*.vs`, de modo que el resto de civilizaciones conserva la IA de HD. Lo mismo vale para el monitor de escuadrones de la IA del mod (`GR_SquadMonitor.vs`, que un parche de `Main.vs` arranca solo para los jugadores de IA que eligieron una civilización del mod). Un parche en cada auxiliar de HD (`ESH_*`) entrega los asentamientos griegos con `AIRun`; los dos bucles principales (`ES_Stronghold`, `ES_Village`) hacen `Sleep()`, lo que se cuelga dentro de `AIRun`, así que van en `[EconomyScripts]` y un parche de `GetEconomyScript.vs` los elige. Grecia empieza el mapa aleatorio en las poblaciones griegas propias del mod: `extras/cgwar/patches/randommapsettlements/` se hizo con el `create-template.js --base "Imperial Roman"` del SDK a partir de un volcado del juego (`Dump=randommapsettlements/maps/1/map.obj.xml`) con el `RandomMapSettlements.bfhp` del mod, donde las poblaciones Imperial Roman son las griegas, y sus murallas `M*` pasan a `K*`. Los mapas hechos para él colocan `MWalls*`/`MTower`/`MGate*`, romanos de nuevo aquí: `wrap-map.js` los cambia a `K*` en los mapas que necesitan el CGWAR, lo que los convierte en *reescritura* (con el porter acreditado).

GBR Tactics 2.4 ([extras/gbr-tactics/](../../extras/gbr-tactics/)) no tiene Grecia: son las ocho civilizaciones del juego tal como las tiene el mod, cada una propia junto a las del juego (`tools/gbr-tactics.js`). Su instalador es un SFX de Gentee que ni bsdtar ni 7z abren: se ejecuta sin ventana bajo wine, así que se ejecuta una vez en un prefijo desechable y se toman de allí sus archivos (pasos en su `NOTES.md`). Uno de sus paquetes está comprimido con LZIS (`tools/lib/lzis.js`), y el compilador y el cargador del juego rechazan cosas que aceptaba 1.40 (variables sin declarar, texto después de `</class>`): las correcciones están en la herramienta.

# Mods grandes hechos para HD

Un mod hecho para HD (no para 1.40) se reduce con el `shrink-mod.js` del SDK, que conserva solo lo que difiere del juego. Imperivm Legacy 2.4.1 se distribuye como tres instaladores (ENG, ESP, ITA; Clickteam, no Inno Setup, así que `innoextract` falla): `7z e -t#` divide uno en fragmentos `.bz2`, pero pierde los nombres de archivo, así que lo más sencillo es instalarlo con wine (`WINEPREFIX=/tmp/wine-legacy wine <installer>`, en `C:\legacy`). Los tres instaladores solo se diferencian en el paquete de idioma (`local\<language>.pak`, un fragmento de ~19 MB: el que cambia entre instaladores, hay que pasarle `bunzip2` tras `7z e -t#`), así que se instala uno y se copia el `.pak` de los otros en su `local\` como `spanish.pak` e `italian.pak`.

```bash
G="<la carpeta del juego HD>" SDK="<imperivm-resurrected/sdk>" node tools/imperivm-legacy.js      # desde .scratch/legacy-src, las tres instalaciones en una carpeta
```

Ejecuta `shrink-mod.js` sobre ella, pone encima del resultado los 4 archivos con rutas rotas del mod original (`BASETAVERN`, `RAMUNIT`, `RTHERMAE`, `FOG_OWNER_MARKER`) de `extras/imperivm-legacy/` y crea las ocho civilizaciones del juego como ocho propias, junto a las del juego (`(Legacy)`, prefijos `Lga`…`Lge`). Pasos y lo que se dejó fuera: `extras/imperivm-legacy/NOTES.md`. `ported/imperivm-legacy/` (125 MB) no está en git, igual que los de 1.40.

# Mapas con clases de Imperivm I

Algunos mapas todavía colocan clases de Imperivm I (*Celtic Kings: Rage of War*) que ni Imperivm III 1.40 ni HD tienen: Cartagonova tiene 482 `TeutonWolf`, 311 `GWFighter`, acantilados, rocas y héroes; el mapa Hispania de la saga de Imperivm II tiene el antiguo Viking Lord. `tools/imperivm1.js` construye con ellas el mod compartido `ported/imperivm1-legacy`, de modo que los mapas quedan intactos:

```bash
# once: both are free on ModDB, under Celtic Kings: Rage of War > Downloads (needs a browser: Cloudflare)
#   "Patch 1.16" (celtickingspatch116.exe) and "Celtic Kings: Rage of War Demo" (celtickingsdemo.zip)
node tools/imperivm1.js setup <celtickingspatch116.exe> <celtickingsdemo.zip>
# per map (or class name); then wrap the map as usual
node tools/imperivm1.js add <map.bfhp>
```

Cómo se resuelve cada clase:

1. **Las definiciones de clase** salen del `data.pak` del parche (todas las clases de Imperivm I: nombre, modelo, tipo).
2. **El equivalente en HD** lo da la propia Haemimont. El parche incluye 4 mapas originales de Imperivm I (Ascendency, Return to the Throne, Defenders, The fall of Avalon) que Haemimont convirtió para la saga de Imperivm III, y cada objeto conservó su posición exacta. Emparejar ambas versiones por posición da el reemplazo que eligió Haemimont: `TeutonMetal` → `TTeutonRider`, `GWFighter` → `GWomanWarrior`, `GVikingLord` → `BVikingLord`, `RHero10` → `RHero1`… Las copias de la saga vienen de Discord (`originals/discord/saga-imperivm/`).
3. Las clases que esos 4 mapas no colocan se emparejan por **nombre visible** (`NHero01` «Brand» → `GHero3b` «Brand»), y luego por **compartir un modelo** con una clase ya emparejada (`TeutonWolf` usa el modelo del jinete de `TeutonMetal`, así que → `TTeutonRider`). El resultado es `raw/imperivm1-equivalents.json`.
4. Una clase con equivalente pasa a ser una copia de la clase de HD con el id antiguo (sin su `altid`, que se queda con el original).
5. **Los objetos que el juego HD nunca tuvo** (acantilados `Cliffs*`, `TeleportRocks_*`, `GrObj01`, el almacén) conservan su clase y su arte originales, recuperados de la demo: es un instalador Wise cuyos archivos son flujos deflate en bruto; uno es el `.pak` de la demo (los `.ent.xml`, `.pass` y las cabeceras `.rle.mmp`) y el otro más grande su `rle.mmp` (los píxeles). Cada `.rle.mmp` + `rle.mmp` pasa a ser un `.rle` independiente (el `lib/rle.js` del SDK, `resolveMmp`), que el juego carga desde un mod. Las variantes estacionales que la demo no tiene se descartan (las sustituye el arte principal).

El arte es de Haemimont/FX, de una demo regalada en 2002: si no, sería contenido perdido. No está en git (`ported/imperivm1-legacy/**/*.rle` y `.pass` están ignorados); `setup` + `add` lo reconstruyen. Créditos: Haemimont Games y FX Interactive, con Villoh como porter.

La misma idea sirve para cualquier mapa antiguo: buscar la clase en un `data.pak` más antiguo (los parches oficiales de Imperivm III 1.20–1.40 incluyen el suyo: `Cab3.cab` dentro de `Imperivm III-1.40-ES.exe`), y buscar un mapa oficial convertido por Haemimont para saber cuál es el reemplazo.
