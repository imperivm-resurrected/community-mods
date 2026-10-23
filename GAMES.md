# The games: where to get them, their patches, and running them on Linux

Notes on the Haemimont/FX real-time conquest games (Imperivm I, II and III) that many ported mods and maps
come from or depend on, and how to run them on Linux.

> The games belong to their owners (Haemimont Games, FX Interactive, Strategy First, Enlight).
> This file does not link to copies of the games. The patches it links were given away for free by their publishers.

## Which game is which

One game has up to three names, depending on the country. Same engine and same map format (`.bfhp`).

| Imperivm | International name | Languages |
|---|---|---|
| I: La Guerra de las Galias (2002) | *Celtic Kings: Rage of War* | ES / EN, FR, DE |
| II: La conquista de Hispania (2003) | *Celtic Kings: The Punic Wars* = *Nemesis of the Roman Empire* | ES / EN |
| III: Las Grandes Batallas de Roma (2004) | *Imperivm: Great Battles of Rome* | ES, EN, IT |

*Imperivm II* and *Nemesis of the Roman Empire* are the same game: after patch 1.02 both executables have the same hash
(`Imperivm II.exe` and `tpw.exe`) and the data packs match. Only the language package changes
(`spanish.pak` + `Spanish_Voices.pak` against `us.pak` + `US_voices.pak`). Nemesis also ships two more adventures
(*Opposite* and *Osca*).

## Where to get them

| Game | Availability |
|---|---|
| Celtic Kings: Rage of War (= Imperivm I; English, French, German) | For sale: [Steam](https://store.steampowered.com/app/827000/) (4.99 € when checked, Oct 2026) and [GOG](https://www.gog.com/en/game/celtic_kings_rage_of_war). No Spanish |
| Imperivm III HD (= Great Battles of Rome, remastered) | For sale on [Steam](https://store.steampowered.com/app/752580/). It is the edition the community keeps up |
| Imperivm I and II in Spanish | No longer for sale |
| Celtic Kings: The Punic Wars / Nemesis of the Roman Empire | No longer for sale |

If you own the original discs of the ones no longer sold, you can make your own ISO image.

## Official patches

FX's own pages for them (`fxinteractive.com/p014`, `/p049`) are gone and redirect to the home page.
The files can still be fetched from the Wayback Machine's copies; their MD5 matches the patches that were applied and tested.

| Game | Version | File | MD5 | Where |
|---|---|---|---|---|
| Imperivm I | 1.16 | `Imperivm116.exe` | `ab09cbf02e952a3b063b8617b5486aa6` | [Wayback](https://web.archive.org/web/20200317022559id_/http://www.fxinteractive.com/p014/img/Imperivm116.exe) |
| Imperivm II | 1.02 | `Imperivm_II_1.02_Esp.exe` | `9857ddffd2016d1a9298cb671fb9d859` | [Wayback](https://web.archive.org/web/2020id_/https://www.fxinteractive.com/p049/images/Imperivm_II_1.02_Esp.exe) |
| Celtic Kings | 1.10 | `CelticKingsPatch110.exe` (in `celtickings110.zip`) | `1225a26d56cb46be4411993b9004cb6d` | [patches-scrolls](https://www.patches-scrolls.com/celtic_kings_rage_of_war.php) (third-party mirror) |
| Celtic Kings | 1.16 | `CelticKingsPatch116.exe` (in `ckings116.zip`) | `d68ad6291921b980f9f0c1ee82091d99` | [ModDB](https://www.moddb.com/games/celtic-kings-rage-of-war/downloads) (free; needs a browser, Cloudflare), or [patches-scrolls](https://www.patches-scrolls.com/celtic_kings_rage_of_war.php) (third-party mirror) |
| Nemesis / Punic Wars (EN) | 1.02 | `TPWNATPatch102.exe` (in `tpwnatpatch102.zip`) | `0395bc1e5ff449d8e2f71a47d681d801` | [DS-Servers](https://en.ds-servers.com/gf/celtic-kings-the-punic-wars/official-patches/celtic-kings-the-punic-wars-us-1-02-patch.html) · [patches-scrolls](https://www.patches-scrolls.com/whatsold2005.php) (third-party mirrors) |

The Celtic Kings and Nemesis patches are third-party mirrors of the Strategy First and Enlight originals. On patches-scrolls
the download needs a visit to its page first (session cookie). The MD5 above is of the `.exe` inside the zip. I could not open the ModDB page
from the command line (403 from Cloudflare), so I did not check its file against the hash.

The patches are 7-Zip self-extractors that run `patch.exe`. To check one was applied, compare the game's executable:

| Game | Executable | MD5 after patching |
|---|---|---|
| Imperivm I 1.16 | `Imperivm.exe` | `171020e0442ef3e80daf9ffc835ec74b` |
| Imperivm II 1.02 | `Imperivm II.exe` | `30fbba8c8c82b9fc28e3a20334771500` |
| Celtic Kings 1.16 | `Celtic kings.exe` | `015e82db80688cbf75c9a04d3b876742` |
| Nemesis 1.02 | `tpw.exe` | `30fbba8c8c82b9fc28e3a20334771500` |

### Patch traps

- **Celtic Kings**: 1.16 needs 1.10 first. Without it the patch says it needs a more recent version. Apply 1.10, then 1.16.
- **Nemesis**: the patch looks for `HKLM\SOFTWARE\Wow6432Node\Haemimont Games\The Punic Wars`, which Enlight's installer did not create under Wine (not checked on Windows).
  Without it, it says "The Punic Wars is not installed!". Create it with `InstallPath` (the path to `tpw.exe`) and `Version=0x10000`.
- **Nemesis, installer**: run `SETUP.EXE`. `NESETUP.EXE` is only a launcher and exits without installing.

## Linux (GE-Proton)

Tested on NixOS + Hyprland with GE-Proton 11-7, October 2026. Everything here is about Wine/Proton.

### Installing with umu-run

One prefix per game, each one isolated, as Steam and Lutris do.

```bash
export WINEPREFIX=~/Games/<game>/prefix GAMEID=umu-0 PROTONPATH=GE-Proton
umu-run /path/to/the/installer/Instalar.exe     # Imperivm I and II
umu-run /path/to/the/disc/SETUP.EXE             # Celtic Kings and Nemesis
```

- `PROTONPATH=GE-Proton` downloads the latest version. On NixOS you can point it at `pkgs.proton-ge-bin.steamcompattool`.
- Run the installer from a folder with the disc's contents (extract the ISO, e.g. with `bsdtar`).
- The prefix is created on first launch.
- The DirectX error at the end of the installers ("this version of DirectX is not compatible") can be ignored: Proton ships its own.

### The game asks for the CD

Imperivm I (and maybe the others) checks with `GetDriveType` and `GetVolumeInformation` that a CD with a given label is present.
A "virtual CD" in the prefix solves it:

1. `dosdevices/d:` is a symlink to the folder with the disc's contents.
2. A `.windows-label` file in that folder, with the volume label.
3. In `system.reg` (not `user.reg`): `[Software\\Wine\\Drives]` → `"d:"="cdrom"`.
   Edit it with the prefix closed: Wine rewrites it on exit.

| Game | Label |
|---|---|
| Imperivm I | `IMPERIVM` |
| Imperivm II | `IMPERIVM_II` |
| Celtic Kings | `Celtic Kings` |
| Nemesis | `NEW` |

### Playing from Steam

Add the installed `.exe` as a non-Steam game and force GE-Proton under *Properties → Compatibility*.
If the prefix is already made, copy it to `~/.local/share/Steam/steamapps/compatdata/<appid>/` and use that `appid`
(Steam then manages it as its own). Do it with Steam closed, and keep a copy of `shortcuts.vdf` and `config.vdf`.

### Screen on Hyprland (gamescope)

Imperivm II opens in a tiled window and, forced to fullscreen, it is drawn cut off and duplicated
(the game cannot resize). `gamescope` fixes it. Launch options:

```text
gamescope -f -w 1024 -h 768 -W 1920 -H 1080 -S fit -- %command%
```

Set `-W` and `-H` to your monitor. `-S fit` keeps the 4:3 with black bars. Imperivm I looked fine without it.
