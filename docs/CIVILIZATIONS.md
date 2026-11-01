# Civilization mods

**English** · [Español](es/CIVILIZATIONS.md)

`node tools/compare-mods.js` prints a comparison of the ported civilization mods (civilizations, Greek rosters, what each changed in the game's civilizations, researches). It is not kept in git: it goes stale with every port; redirect it to `GREEK-MODS.md` (git-ignored) if you want a copy.

Letters and indices are unique across all the ports (the SDK allows indices 10-99; a letter prefixes the civilization's classes and commands). A new port takes the next free ones and adds its row here. Ports that are not uploaded can still change theirs.

| Index | `id` | Letter | Base | Mod | State |
|---|---|---|---|---|---|
| 30 | `greece` | `K` | ImperialRome | CGWAR | Own race; independent of the game, the 1.8 and the 4.2 (`tools/cgwar-independent.js`; `tools/shared-paths.js` finds no class ids in common) |
| 31 | `greek` | `H` | ImperialRome (own race) | 4.2 | Greece of the 4.2, in no one's slot (`tools/greek-4-2.js`); the room's set of the 4.2 is named after the mod, *Greek Civilization Mod 4.2* |
| 32 | `greek18` | `Q` | ImperialRome (own race) | 1.8 | Greece independent of the game's and of the 4.2/CGWAR classes; still shares neutral content (fisherman, scripts, music) with the 4.2, Imperivm Legacy and the MCI |
| 33 | `rome18` | `J` | RepublicanRome | 1.8 | Republican Rome with the 1.8's stats, costs and branch, cloned from HD (`tools/greek-1-8-civs.js`) |
| 34 | `gaul18` | `L` | Gaul | 1.8 | Gaul with the 1.8's stats and barracks costs |
| 35 | `carthage18` | `P` | Carthage | 1.8 | Same (elephant, javelin thrower, noble; barracks and temple costs) |
| 36 | `britain18` | `O` | Britain | 1.8 | Same (shield bearer, bronze spearman, bowman, hero) |
| 37 | `iberia18` | `U` | Iberia | 1.8 | Same (archer, slinger, cavalry speeds) |
| 38 | `egypt18` | `V` | Egypt | 1.8 | Same (outpost) |
| 39 | `germany18` | `F` | Germany | 1.8 | Same (axeman; barracks, Temple of Neptune and tent commands) |
| 40 | `gaul42` | `X` | Gaul | 4.2 | Gaul with the 4.2's balance |
| 41 | `britain42` | `Y` | Britain | 4.2 | Same |
| 42 | `iberia42` | `Z` | Iberia | 4.2 | Same |
| 43 | `egypt42` | `1` | Egypt | 4.2 | Same (a digit is a letter too: the 26 ran out) |
| 44 | `germany42` | `3` | Germany | 4.2 | Same |
| 45 | `romerep42` | `4` | RepublicanRome | 4.2 | Republican Rome: the commands the mod's Republican branch left visible |
| 46 | `romeimp42` | `5` | RepublicanRome | 4.2 | Imperial Rome: the Imperial branch (own hero) |
| 47 | `romepun42` | `6` | RepublicanRome | 4.2 | Punic Rome: the Punic branch (Ancient Roman hero) |
| 48 | `carthnum42` | `7` | Carthage | 4.2 | Numidian Carthage |
| 49 | `carthmau42` | `8` | Carthage | 4.2 | Mauritanian Carthage (Mauritanian hero) |
| (engine) | `cgwarimperial` | `Cgw` (derived) | RepublicanRome | CGWAR | Imperial branch of the mod's Rome, its commands already in it (the Arena choice is not ported): `tools/cgwar-civs.js` |
| (engine) | `cgwarrepublic` | `Cgr` | RepublicanRome | CGWAR | Republican branch of the mod's Rome: `tools/cgwar-civs.js` |
| (engine) | `gaul_gbrt` | `Gau` (derived) | Gaul | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `republic_gbrt` | `Rep` (derived) | RepublicanRome | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `imperial_gbrt` | `Imp` (derived) | ImperialRome | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `carthage_gbrt` | `Car` (derived) | Carthage | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `britain_gbrt` | `Bri` (derived) | Britain | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `iberia_gbrt` | `Ibe` (derived) | Iberia | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `egypt_gbrt` | `Egy` (derived) | Egypt | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `germany_gbrt` | `Ger` (derived) | Germany | GBR Tactics | `tools/gbr-tactics.js` |
| (engine) | `gaul2010` | `Gau` (derived) | Gaul | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `britain2010` | `Bri` (derived) | Britain | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `carthage2010` | `Car` (derived) | Carthage | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `egypt2010` | `Egy` (derived) | Egypt | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `germany2010` | `Ger` (derived) | Germany | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `iberia2010` | `Ibe` (derived) | Iberia | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `rome2010` | `Rom` (derived) | RepublicanRome | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `imperial2010` | `Imp` (derived) | ImperialRome | La Reconquista 2010 | `tools/reconquista-2010.js` |
| (engine) | `mgaul` | `Mga` (derived) | Gaul | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `mrome` | `Mro` (derived) | RepublicanRome | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `mimperial` | `Mim` (derived) | ImperialRome | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `mcarthage` | `Mca` (derived) | Carthage | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `mbritain` | `Mbr` (derived) | Britain | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `miberia` | `Mib` (derived) | Iberia | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `megypt` | `Meg` (derived) | Egypt | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `mgermany` | `Mge` (derived) | Germany | Mediterranevm (alpha) | `tools/mediterranevm-alpha.js` |
| (engine) | `ngaul` | `Nga` (derived) | Gaul | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `nrome` | `Nro` (derived) | RepublicanRome | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `nimperial` | `Nim` (derived) | ImperialRome | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `ncarthage` | `Nca` (derived) | Carthage | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `nbritain` | `Nbr` (derived) | Britain | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `niberia` | `Nib` (derived) | Iberia | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `negypt` | `Neg` (derived) | Egypt | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `ngermany` | `Nge` (derived) | Germany | Balanced Factions 2.6 | `tools/nuclear-fazioni-equilibrate.js` |
| (engine) | `agaul` | `Aga` (derived) | Gaul | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `arome` | `Aro` (derived) | RepublicanRome | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `aimperial` | `Aim` (derived) | ImperialRome | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `acarthage` | `Aca` (derived) | Carthage | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `abritain` | `Abr` (derived) | Britain | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `aiberia` | `Aib` (derived) | Iberia | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `aegypt` | `Aeg` (derived) | Egypt | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `agermany` | `Age` (derived) | Germany | AsvrMod VII | `tools/asvrmod-vii.js` |
| (engine) | `sgaul` | `Sga` (derived) | Gaul | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `srome` | `Sro` (derived) | RepublicanRome | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `simperial` | `Sim` (derived) | ImperialRome | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `scarthage` | `Sca` (derived) | Carthage | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `sbritain` | `Sbr` (derived) | Britain | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `siberia` | `Sib` (derived) | Iberia | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `segypt` | `Seg` (derived) | Egypt | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `sgermany` | `Sge` (derived) | Germany | Secuter Fun 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zgaul` | `Zga` (derived) | Gaul | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zrome` | `Zro` (derived) | RepublicanRome | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zimperial` | `Zim` (derived) | ImperialRome | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zcarthage` | `Zca` (derived) | Carthage | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zbritain` | `Zbr` (derived) | Britain | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `ziberia` | `Zib` (derived) | Iberia | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zegypt` | `Zeg` (derived) | Egypt | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zgermany` | `Zge` (derived) | Germany | Secuter Fun Greece 1.5 | `tools/secuter-fun-mod.js` |
| (engine) | `zgreece` | `Zgr` (derived) | ImperialRome (own race) | Secuter Fun Greece 1.5 | The 1.8's Greece with Secuter's changes, independent of the three Greek ports (`tools/secuter-greece.js`) |

A civilization with no `letter` (derived prefix: the first three letters of the `id`, imperivm-resurrected#37) and no `index` (the engine assigns it) reserves nothing in this table; its rows say `(engine)` and are here to spot clashes. **Two ports cannot be active together if they share a derived prefix: the engine ignores the second civilization.** Today GBR Tactics and La Reconquista 2010 clash on `Gau`, `Bri`, `Car`, `Egy`, `Ger`, `Ibe` and `Imp`.

So are the 1.8's Imperial and Punic Rome (`empire18`, `punic18`): prefixes `Emp` and `Pun` derived from the id, indices assigned by the engine.

The 4.2's eleven civilizations play with the mod's own scripts and AI, and only they do: the mod's versions of the game's behavior scripts are copies named `<name>_g42.vs` that only its classes and commands use, its AI runs as `GR42_*` (economy for Greece, Gaul, Britain, Iberia, Egypt and Germany; tactics for all but the Roman branches and Mauritanian Carthage, which the mod gives none; the monitors, the group strategies and what the engine calls by name for all eleven) behind patches that ask `Mod_TrueRace` or `Mod_PlayerCiv`, and its game modes only reach its civilizations (Old school's Imperivm 2 costs and kits for Gaul 4.2, Iberia 4.2, Imperial Rome 4.2 and Numidian Carthage; Varios' rule for all). What is not applied to the clones yet is in `extras/greek-civilization-mod/NOTES.md`, *Pending*.

The three Greek mods are independent of the game and of each other (checked with `tools/shared-paths.js` and the content manager); what is left is in each mod's `NOTES.md`, *Pending*.
