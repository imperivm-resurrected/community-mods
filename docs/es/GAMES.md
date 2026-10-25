# Los juegos: dónde conseguirlos, sus parches y cómo ejecutarlos en Linux

[English](../GAMES.md) · **Español**

Notas sobre los juegos de conquista en tiempo real de Haemimont/FX (Imperivm I, II y III), de los que proceden o de los que dependen muchos mods y mapas portados, y sobre cómo ejecutarlos en Linux.

> Los juegos pertenecen a sus propietarios (Haemimont Games, FX Interactive, Strategy First, Enlight).
> Este archivo no enlaza copias de los juegos. Los parches que enlaza los regalaron gratis sus editores.

## Cuál es cada juego

Un mismo juego tiene hasta tres nombres, según el país. Mismo motor y mismo formato de mapa (`.bfhp`).

| Imperivm | Nombre internacional | Idiomas |
|---|---|---|
| I: La Guerra de las Galias (2002) | *Celtic Kings: Rage of War* | ES / EN, FR, DE |
| II: La conquista de Hispania (2003) | *Celtic Kings: The Punic Wars* = *Nemesis of the Roman Empire* | ES / EN |
| III: Las Grandes Batallas de Roma (2004) | *Imperivm: Great Battles of Rome* | ES, EN, IT |

*Imperivm II* y *Nemesis of the Roman Empire* son el mismo juego: tras el parche 1.02, ambos ejecutables tienen el mismo hash
(`Imperivm II.exe` y `tpw.exe`) y los paquetes de datos coinciden. Solo cambia el paquete de idioma
(`spanish.pak` + `Spanish_Voices.pak` frente a `us.pak` + `US_voices.pak`). Nemesis incluye además dos aventuras más
(*Opposite* y *Osca*).

## Dónde conseguirlos

| Juego | Disponibilidad |
|---|---|
| Celtic Kings: Rage of War (= Imperivm I; inglés, francés, alemán) | A la venta: [Steam](https://store.steampowered.com/app/827000/) (4,99 € cuando se comprobó, oct. de 2026) y [GOG](https://www.gog.com/en/game/celtic_kings_rage_of_war). Sin español |
| Imperivm III HD (= Great Battles of Rome, remasterizado) | A la venta en [Steam](https://store.steampowered.com/app/752580/). Es la edición que mantiene la comunidad |
| Imperivm I y II en español | Ya no se venden |
| Celtic Kings: The Punic Wars / Nemesis of the Roman Empire | Ya no se venden |

Quien conserve los discos originales de los que ya no se venden puede crear su propia imagen ISO.

## Parches oficiales

Las páginas propias de FX para ellos (`fxinteractive.com/p014`, `/p049`) ya no existen y redirigen a la página de inicio.
Los archivos aún pueden obtenerse de las copias de la Wayback Machine; su MD5 coincide con el de los parches que se aplicaron y probaron.

| Juego | Versión | Archivo | MD5 | Dónde |
|---|---|---|---|---|
| Imperivm I | 1.16 | `Imperivm116.exe` | `ab09cbf02e952a3b063b8617b5486aa6` | [Wayback](https://web.archive.org/web/20200317022559id_/http://www.fxinteractive.com/p014/img/Imperivm116.exe) |
| Imperivm II | 1.02 | `Imperivm_II_1.02_Esp.exe` | `9857ddffd2016d1a9298cb671fb9d859` | [Wayback](https://web.archive.org/web/2020id_/https://www.fxinteractive.com/p049/images/Imperivm_II_1.02_Esp.exe) |
| Celtic Kings | 1.10 | `CelticKingsPatch110.exe` (en `celtickings110.zip`) | `1225a26d56cb46be4411993b9004cb6d` | [patches-scrolls](https://www.patches-scrolls.com/celtic_kings_rage_of_war.php) (réplica de terceros) |
| Celtic Kings | 1.16 | `CelticKingsPatch116.exe` (en `ckings116.zip`) | `d68ad6291921b980f9f0c1ee82091d99` | [ModDB](https://www.moddb.com/games/celtic-kings-rage-of-war/downloads) (gratis; requiere navegador, Cloudflare), o [patches-scrolls](https://www.patches-scrolls.com/celtic_kings_rage_of_war.php) (réplica de terceros) |
| Nemesis / Punic Wars (EN) | 1.02 | `TPWNATPatch102.exe` (en `tpwnatpatch102.zip`) | `0395bc1e5ff449d8e2f71a47d681d801` | [DS-Servers](https://en.ds-servers.com/gf/celtic-kings-the-punic-wars/official-patches/celtic-kings-the-punic-wars-us-1-02-patch.html) · [patches-scrolls](https://www.patches-scrolls.com/whatsold2005.php) (réplicas de terceros) |

Los parches de Celtic Kings y Nemesis son réplicas de terceros de los originales de Strategy First y Enlight. En patches-scrolls
la descarga exige visitar antes su página (cookie de sesión). El MD5 de arriba es el del `.exe` que hay dentro del zip. No pude abrir la página de ModDB
desde la línea de comandos (403 de Cloudflare), así que no comprobé su archivo con el hash.

Los parches son autoextraíbles de 7-Zip que ejecutan `patch.exe`. Para comprobar que se aplicó uno, se compara el ejecutable del juego:

| Juego | Ejecutable | MD5 tras el parche |
|---|---|---|
| Imperivm I 1.16 | `Imperivm.exe` | `171020e0442ef3e80daf9ffc835ec74b` |
| Imperivm II 1.02 | `Imperivm II.exe` | `30fbba8c8c82b9fc28e3a20334771500` |
| Celtic Kings 1.16 | `Celtic kings.exe` | `015e82db80688cbf75c9a04d3b876742` |
| Nemesis 1.02 | `tpw.exe` | `30fbba8c8c82b9fc28e3a20334771500` |

### Trampas de los parches

- **Celtic Kings**: la 1.16 necesita antes la 1.10. Sin ella, el parche dice que necesita una versión más reciente. Se aplica la 1.10 y después la 1.16.
- **Nemesis**: el parche busca `HKLM\SOFTWARE\Wow6432Node\Haemimont Games\The Punic Wars`, que el instalador de Enlight no creó bajo Wine (no comprobado en Windows).
  Sin esa clave, dice "The Punic Wars is not installed!". Se crea con `InstallPath` (la ruta a `tpw.exe`) y `Version=0x10000`.
- **Nemesis, instalador**: se ejecuta `SETUP.EXE`. `NESETUP.EXE` es solo un lanzador y sale sin instalar nada.

## Linux (GE-Proton)

Probado en NixOS + Hyprland con GE-Proton 11-7, octubre de 2026. Todo lo que sigue es sobre Wine/Proton.

### Instalar con umu-run

Un prefijo por juego, cada uno aislado, como hacen Steam y Lutris.

```bash
export WINEPREFIX=~/Games/<game>/prefix GAMEID=umu-0 PROTONPATH=GE-Proton
umu-run /path/to/the/installer/Instalar.exe     # Imperivm I y II
umu-run /path/to/the/disc/SETUP.EXE             # Celtic Kings y Nemesis
```

- `PROTONPATH=GE-Proton` descarga la última versión. En NixOS se puede apuntar a `pkgs.proton-ge-bin.steamcompattool`.
- Ejecútese el instalador desde una carpeta con el contenido del disco (extráigase la ISO, p. ej. con `bsdtar`).
- El prefijo se crea en el primer arranque.
- El error de DirectX al final de los instaladores ("this version of DirectX is not compatible") puede ignorarse: Proton incluye el suyo.

### El juego pide el CD

Imperivm I (y quizá los demás) comprueba con `GetDriveType` y `GetVolumeInformation` que haya un CD con una etiqueta determinada.
Un «CD virtual» en el prefijo lo resuelve:

1. `dosdevices/d:` es un enlace simbólico a la carpeta con el contenido del disco.
2. Un archivo `.windows-label` en esa carpeta, con la etiqueta del volumen.
3. En `system.reg` (no en `user.reg`): `[Software\\Wine\\Drives]` → `"d:"="cdrom"`.
   Edítese con el prefijo cerrado: Wine lo reescribe al salir.

| Juego | Etiqueta |
|---|---|
| Imperivm I | `IMPERIVM` |
| Imperivm II | `IMPERIVM_II` |
| Celtic Kings | `Celtic Kings` |
| Nemesis | `NEW` |

### Jugar desde Steam

Añádase el `.exe` instalado como juego ajeno a Steam y fuércese GE-Proton en *Properties → Compatibility*.
Si el prefijo ya está hecho, cópiese a `~/.local/share/Steam/steamapps/compatdata/<appid>/` y úsese ese `appid`
(Steam pasa entonces a gestionarlo como propio). Hágase con Steam cerrado y consérvese una copia de `shortcuts.vdf` y `config.vdf`.

### Pantalla en Hyprland (gamescope)

Imperivm II se abre en una ventana en mosaico y, forzado a pantalla completa, se dibuja cortado y duplicado
(el juego no puede redimensionarse). `gamescope` lo arregla. Opciones de lanzamiento:

```text
gamescope -f -w 1024 -h 768 -W 1920 -H 1080 -S fit -- %command%
```

Ajústense `-W` y `-H` a su monitor. `-S fit` mantiene el 4:3 con barras negras. Imperivm I se veía bien sin él.
