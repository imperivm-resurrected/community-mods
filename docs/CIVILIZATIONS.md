# Civilization mods

**English** · [Español](es/CIVILIZATIONS.md)

`node tools/compare-mods.js` prints a comparison of the ported civilization mods (civilizations, Greek rosters, what each changed in the game's civilizations, researches). It is not kept in git: it goes stale with every port; redirect it to `GREEK-MODS.md` (git-ignored) if you want a copy.

Letters and indices are unique across all the ports (the SDK allows indices 10-99; a letter prefixes the civilization's classes and commands). A new port takes the next free ones and adds its row here. Ports that are not uploaded can still change theirs.

| Index | `id` | Letter | Base | Mod | State |
|---|---|---|---|---|---|
| 30 | `greece` | `K` | ImperialRome | CGWAR | Own race; independent of the game and of the 1.8 (`tools/cgwar-independent.js`); shares class ids and files with the 4.2 |
| 31 | `greek` | `H` | ImperialRome (own race) | 4.2 | Greece of the 4.2, in no one's slot (`tools/greek-4-2.js`) |
| 32 | `greek18` | `Q` | ImperialRome (own race) | 1.8 | Greece independent of the game's and of the 4.2/CGWAR classes; still shares neutral content (fisherman, scripts, music) with the 4.2, Imperivm Legacy and the MCI |
| 33 | `rome18` | `J` | RepublicanRome | 1.8 | Republican Rome with the 1.8's stats and costs, cloned from HD (`tools/greek-1-8-civs.js`); the other civilizations of the 1.8 follow |
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

GBR Tactics' eight civilizations (`<civ>_gbrt`) have no row: their prefixes are derived from the id (`Gau`, `Rep`, `Imp`, `Car`, `Bri`, `Ibe`, `Egy`, `Ger`) and their indices are assigned by the engine.

The three Greek mods are independent of the game and of each other (checked with `tools/shared-paths.js` and the content manager); what is left is in each mod's `NOTES.md`, *Pending*.
