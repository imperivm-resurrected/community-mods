# Mods de civilizaciones

[English](../CIVILIZATIONS.md) · **Español**

`node tools/compare-mods.js` imprime una comparación de los mods de civilizaciones portados (civilizaciones, plantillas griegas, lo que cambió cada uno en las civilizaciones del juego, investigaciones). No se guarda en git: queda obsoleta con cada port; si se desea una copia, puede redirigirse a `GREEK-MODS.md` (ignorado por git).

Las letras y los índices son únicos en todos los ports (el SDK admite índices del 10 al 99; una letra es el prefijo de las clases y comandos de la civilización). Un port nuevo toma los siguientes libres y añade aquí su fila. Los ports que no se han subido aún pueden cambiar los suyos.

| Índice | `id` | Letra | Base | Mod | Estado |
|---|---|---|---|---|---|
| 30 | `greece` | `K` | ImperialRome | CGWAR | Raza propia; independiente del juego, de la 1.8 y de la 4.2 (`tools/cgwar-independent.js`; `tools/shared-paths.js` no encuentra ids de clase en común) |
| 31 | `greek` | `H` | ImperialRome (raza propia) | 4.2 | Grecia de la 4.2, en el hueco de nadie (`tools/greek-4-2.js`); el set de la 4.2 en la sala se llama como el mod, *Greek Civilization Mod 4.2* |
| 32 | `greek18` | `Q` | ImperialRome (raza propia) | 1.8 | Grecia independiente de la del juego y de las clases de la 4.2/CGWAR; aún comparte contenido neutral (pescador, scripts, música) con la 4.2, Imperivm Legacy y el MCI |
| 33 | `rome18` | `J` | RepublicanRome | 1.8 | Roma Republicana con las estadísticas, costes y rama de la 1.8, clonada de HD (`tools/greek-1-8-civs.js`) |
| 34 | `gaul18` | `L` | Gaul | 1.8 | Galia con las estadísticas de la 1.8 y los costes de los barracones |
| 35 | `carthage18` | `P` | Carthage | 1.8 | Igual (elefante, lanzador de jabalina, noble; costes de barracones y templo) |
| 36 | `britain18` | `O` | Britain | 1.8 | Igual (portaescudo, lancero de bronce, arquero, héroe) |
| 37 | `iberia18` | `U` | Iberia | 1.8 | Igual (arquero, hondero, velocidades de la caballería) |
| 38 | `egypt18` | `V` | Egypt | 1.8 | Igual (puesto avanzado) |
| 39 | `germany18` | `F` | Germany | 1.8 | Igual (hachero; comandos de barracones, Templo de Neptuno y tienda) |
| 40 | `gaul42` | `X` | Gaul | 4.2 | Galia con el equilibrio de la 4.2 |
| 41 | `britain42` | `Y` | Britain | 4.2 | Igual |
| 42 | `iberia42` | `Z` | Iberia | 4.2 | Igual |
| 43 | `egypt42` | `1` | Egypt | 4.2 | Igual (un dígito también es una letra: se agotaron las 26) |
| 44 | `germany42` | `3` | Germany | 4.2 | Igual |
| 45 | `romerep42` | `4` | RepublicanRome | 4.2 | Roma Republicana: los comandos que la rama republicana del mod dejó visibles |
| 46 | `romeimp42` | `5` | RepublicanRome | 4.2 | Roma Imperial: la rama imperial (héroe propio) |
| 47 | `romepun42` | `6` | RepublicanRome | 4.2 | Roma Púnica: la rama púnica (héroe romano antiguo) |
| 48 | `carthnum42` | `7` | Carthage | 4.2 | Cartago Númida |
| 49 | `carthmau42` | `8` | Carthage | 4.2 | Cartago Mauritana (héroe mauritano) |
| (motor) | `cgwarimperial` | `Cgw` (derivado) | RepublicanRome | CGWAR | Rama imperial de la Roma del mod, con sus comandos ya dentro (la elección en la Arena no se porta): `tools/cgwar-civs.js` |
| (motor) | `cgwarrepublic` | `Cgr` | RepublicanRome | CGWAR | Rama republicana de la Roma del mod: `tools/cgwar-civs.js` |
| (motor) | `gaul_gbrt` | `Gau` (derivado) | Gaul | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `republic_gbrt` | `Rep` (derivado) | RepublicanRome | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `imperial_gbrt` | `Imp` (derivado) | ImperialRome | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `carthage_gbrt` | `Car` (derivado) | Carthage | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `britain_gbrt` | `Bri` (derivado) | Britain | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `iberia_gbrt` | `Ibe` (derivado) | Iberia | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `egypt_gbrt` | `Egy` (derivado) | Egypt | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `germany_gbrt` | `Ger` (derivado) | Germany | GBR Tactics | `tools/gbr-tactics.js` |
| (motor) | `gaul2010` | `Gau` (derivado) | Gaul | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `britain2010` | `Bri` (derivado) | Britain | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `carthage2010` | `Car` (derivado) | Carthage | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `egypt2010` | `Egy` (derivado) | Egypt | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `germany2010` | `Ger` (derivado) | Germany | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `iberia2010` | `Ibe` (derivado) | Iberia | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `rome2010` | `Rom` (derivado) | RepublicanRome | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `imperial2010` | `Imp` (derivado) | ImperialRome | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (motor) | `mgaul` | `Mga` (derivado) | Gaul | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `mrome` | `Mro` (derivado) | RepublicanRome | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `mimperial` | `Mim` (derivado) | ImperialRome | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `mcarthage` | `Mca` (derivado) | Carthage | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `mbritain` | `Mbr` (derivado) | Britain | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `miberia` | `Mib` (derivado) | Iberia | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `megypt` | `Meg` (derivado) | Egypt | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `mgermany` | `Mge` (derivado) | Germany | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (motor) | `ngaul` | `Nga` (derivado) | Gaul | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `nrome` | `Nro` (derivado) | RepublicanRome | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `nimperial` | `Nim` (derivado) | ImperialRome | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `ncarthage` | `Nca` (derivado) | Carthage | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `nbritain` | `Nbr` (derivado) | Britain | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `niberia` | `Nib` (derivado) | Iberia | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `negypt` | `Neg` (derivado) | Egypt | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `ngermany` | `Nge` (derivado) | Germany | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (motor) | `agaul` | `Aga` (derivado) | Gaul | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `arome` | `Aro` (derivado) | RepublicanRome | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `aimperial` | `Aim` (derivado) | ImperialRome | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `acarthage` | `Aca` (derivado) | Carthage | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `abritain` | `Abr` (derivado) | Britain | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `aiberia` | `Aib` (derivado) | Iberia | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `aegypt` | `Aeg` (derivado) | Egypt | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `agermany` | `Age` (derivado) | Germany | AsvrMod VII | `tools/asvrmod-vii.js` |
| (motor) | `fgaul` | `Fga` (derivado) | Gaul | Community Mod 12 | `tools/community-mod.js` |
| (motor) | `frome` | `Fro` (derivado) | RepublicanRome | Community Mod 12 | `tools/community-mod.js` |
| (motor) | `fimperial` | `Fim` (derivado) | ImperialRome | Community Mod 12 | `tools/community-mod.js` |
| (motor) | `fcarthage` | `Fca` (derivado) | Carthage | Community Mod 12 | `tools/community-mod.js` |
| (motor) | `fbritain` | `Fbr` (derivado) | Britain | Community Mod 12 | `tools/community-mod.js` |
| (motor) | `fiberia` | `Fib` (derivado) | Iberia | Community Mod 12 | `tools/community-mod.js` |
| (motor) | `fegypt` | `Feg` (derivado) | Egypt | Community Mod 12 | `tools/community-mod.js` |
| (motor) | `fgermany` | `Fge` (derivado) | Germany | Community Mod 12 | `tools/community-mod.js` |

Una civilización sin `letter` (prefijo derivado: las 3 primeras letras del `id`, imperivm-resurrected#37) ni `index` (lo asigna el motor) no reserva nada en esta tabla; sus filas dicen `(motor)` y están para detectar choques. **Dos ports no pueden estar activos a la vez si comparten un prefijo derivado: el motor ignora la segunda civilización.** Ahora mismo chocan GBR Tactics y La Reconquista 2010 en `Gau`, `Bri`, `Car`, `Egy`, `Ger`, `Ibe` e `Imp`.

Igual la Roma imperial y la púnica de la 1.8 (`empire18`, `punic18`): prefijos `Emp` y `Pun` derivados del id, índices asignados por el motor.

Las once civilizaciones del 4.2 juegan con los scripts y la IA propios del mod, y solo ellas: las versiones del mod de los scripts de comportamiento del juego son copias `<nombre>_g42.vs` que solo usan sus clases y comandos, su IA corre como `GR42_*` (economía para Grecia, Galia, Britania, Iberia, Egipto y Germania; tácticas para todas menos las ramas de Roma y Cartago mauritana, a las que el mod no da ninguna; los monitores, las estrategias de grupo y lo que el motor llama por nombre para las once) detrás de parches que preguntan `Mod_TrueRace` o `Mod_PlayerCiv`, y sus modos de juego solo alcanzan a sus civilizaciones (los costes y kits de Imperivm 2 de Old school para Galia 4.2, Iberia 4.2, Roma Imperial 4.2 y Cartago Númida; la regla de Varios para todas). Lo que aún no se aplica a los clones está en `extras/greek-civilization-mod/NOTES.md`, apartado *Pending*.

Los tres Greek mods son independientes del juego y entre sí (comprobado con `tools/shared-paths.js` y el gestor de contenido); lo que queda pendiente está en el `NOTES.md` de cada mod, apartado *Pending*.
