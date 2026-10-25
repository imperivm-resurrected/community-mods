<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.webp">
    <img src="assets/banner-light.webp" alt="Imperivm Community Mods" width="640">
  </picture>
</p>

<p align="center"><a href="README.md">English</a> · <b>Español</b></p>

<p align="center">
  <a href="LICENSE"><img alt="Licencia: GPL-3.0" src="https://img.shields.io/badge/licencia-GPL--3.0-blue"></a>
  <a href="https://github.com/imperivm-resurrected/community-mods/commits/main"><img alt="Último commit" src="https://img.shields.io/github/last-commit/imperivm-resurrected/community-mods?label=%C3%BAltimo%20commit"></a>
  <a href="https://github.com/imperivm-resurrected/community-mods/issues"><img alt="Issues" src="https://img.shields.io/github/issues/imperivm-resurrected/community-mods"></a>
  <img alt="Node.js, sin dependencias" src="https://img.shields.io/badge/node-sin%20dependencias-339933?logo=nodedotjs&logoColor=white">
  <a href="https://gamebanana.com/games/26069"><img alt="GameBanana" src="https://img.shields.io/badge/GameBanana-Imperivm%20Hub-f5c518"></a>
  <a href="https://discord.gg/6kCatX3Zbc"><img alt="Discord" src="https://img.shields.io/badge/Discord-Imperivm%20Resurrected-5865F2?logo=discord&logoColor=white"></a>
</p>

# Community Mods

Portar los mods, mapas y aventuras de la comunidad a [Imperivm Resurrected](https://github.com/imperivm-resurrected/imperivm-resurrected)
y publicarlos en [GameBanana](https://gamebanana.com/games/26069), dando crédito a cada autor.

## Por dónde empezar

| Quiero… | Ir a |
|---|---|
| Ver qué se puede portar y qué está hecho | [`docs/MODS.md`](docs/MODS.md) (en inglés) |
| Ver qué falta por portar | [`docs/PENDING.md`](docs/PENDING.md) (en inglés) |
| Portar un mod | [`docs/es/SETUP.md`](docs/es/SETUP.md) y después [`docs/es/PORTING.md`](docs/es/PORTING.md) |
| Encontrar el script adecuado | [`docs/es/TOOLS.md`](docs/es/TOOLS.md) |
| Contribuir, como persona o como agente | [`AGENTS.md`](AGENTS.md) (estilo de commits, tablas, créditos; en inglés) |
| Encontrar más mods | [`docs/es/SOURCES.md`](docs/es/SOURCES.md) |
| Conseguir los juegos originales | [`docs/es/GAMES.md`](docs/es/GAMES.md) |

El índice completo está en [`docs/es/README.md`](docs/es/README.md).

## Estructura del repositorio

| Ruta | Qué es |
|---|---|
| [`docs/`](docs/README.md) | Toda la documentación: guías y tablas. Las guías en español están en [`docs/es/`](docs/es/README.md) |
| [`ported/`](ported/) | Cada mod portado, con su `mod.json`. Los binarios de terceros (`.bfhp`, `.bmp`, `.pak`, `.avi`) y las carpetas que reconstruye `port-140.js` no están en git |
| [`extras/`](extras/) | Nuestros cambios a un mod: archivos resueltos a mano, correcciones, imágenes de vista previa y `mod.json` con los créditos. Las herramientas los copian a `ported/<id>/` |
| [`raw/`](raw/) | Entradas de mods sacadas de Discord, del foro y de ModDB (`*-entries.json`, `moddb.json`), comprobaciones de enlaces (`links.json`), descargas (`download-log.json`), de qué fila sale cada mod portado (`ported.json`), equivalentes de Imperivm I e informes de `port-140` |
| [`tools/`](tools/) | Los scripts, ver [`docs/es/TOOLS.md`](docs/es/TOOLS.md) |
| [`assets/`](assets/) | Banners de este README |

Las descargas y los datos extraídos del juego van en `originals/`, fuera de git (ver [`docs/es/SETUP.md`](docs/es/SETUP.md)).

## Autores y peticiones de retirada

Cada mod se publica con todo el crédito para su autor original. Muchos de estos modders y editores ya no están activos, así que contactar con ellos suele ser difícil. En cualquier caso, si un modder o editor pide que se retire su mod, se retirará de GameBanana y de este repositorio, sin preguntas.

## Fuentes y licencia

Los datos se recogieron del servidor de Discord *Imperivm III Editores*, del foro [imperivmgbr.foroactivo.com](https://imperivmgbr.foroactivo.com), de [ModDB](https://www.moddb.com) y de [GameBanana](https://gamebanana.com/games/26069). Hay más sitios donde buscar en [`docs/es/SOURCES.md`](docs/es/SOURCES.md).

Los scripts de `tools/` son GPL-3.0 (ver [LICENSE](LICENSE)), igual que Imperivm Resurrected. Los mapas, aventuras y mods, y sus nombres y descripciones, pertenecen a sus autores y no los cubre esa licencia.
