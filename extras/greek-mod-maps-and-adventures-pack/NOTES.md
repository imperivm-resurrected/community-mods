# Greek_MapsAdventures.zip: duplicates and authorship

Source: Telegram channel [imperivmgreekmod](https://t.me/imperivmgreekmod), received 2026-10-19. 156 maps. The per-file verdict is in
[AUDIT.md](AUDIT.md) (`node tools/audit-pack.js`, SHA-256 against every map in `originals/`, `ported/` and the HD game, and 4 KiB-level
comparison of the files inside each map for the rest).

## Duplicates

156 maps. 127 are not worth porting, 14 are another edition of one we have, 15 are new.

| | Maps | What to do |
|---|---|---|
| Identical to a map of the HD game | 5 | Nothing: every player has them |
| Identical to a map inside Greek Mod 1.8 and/or 4.2 | 122: 112 plus 10 that are also copies of another file of the pack (`Gallia - Big` / `Gallia_-_Big`…, keep one). By package: 69 in both, 4 only in 1.8, 49 only in 4.2 | Nothing: they are already on GameBanana inside Greek Mod 4.2 (728851). Includes the 37 `__IWC_*` scenarios by Ferónidas |
| Another edition of a map we have (*compare*) | 14 | See below |
| New | 15 | Port, with the author of the next section |

Two of the 14 editions are Italian translations found by name, not by content: the texts sit inside the big files, so they barely match.

**Editions to compare** (which one to keep, or both under the right language):

| Pack file | Ours | Difference |
|---|---|---|
| `1 L'avventura di Larax` (Haemimont Games, Italian) | row 202, *Celtic Kings Adventure* by Luken_SOD, Italian edition | Same text and start map; 58% of the files in common (627 of 892 are byte-identical), different title ("L'avventura di Larax" / "Imperivm I - La Guerra Gallica"). Also MISSING 1 (`[AVENTURAS I] LÁRAX`, no download) |
| `2 Le Guerre Puniche`, `3 Le Campagne di Annibale` | Greek Mod 1.8 `The Punic Wars`, `Hannibal's Campaigns` | 65% / 74% of the files the same. Rattlesmake remakes of the Imperivm II campaigns, on the 1.8 and here with later fixes |
| `5 Defenders`, `6 Invaders` | Imperivm I originals in `originals/imperivm1`, saga rows 33 and 182 | 84% / 88% |
| `Conquista della Gallia`, `La Rivolta dei Messeni`, `Ribellione di Spartaco` | rows 214, 213, 196 (Mietitore) | The same adventures in **Italian**; ours are the Spanish editions (the texts are in the big files, so only 0-4% / 62-68% match) |
| `ConquestRemake` ("Mare Nostrum") | Greek Mod 1.8 | 63% |
| `Europa` ("Mediterraneo (grande)") | Greek Mod 4.2 | 81% |

## Who signed what

The `author` of each map's `game.xml` is what its author typed, nobody checked it. Certainty: **sure** = same adventure, same name or description in
our own sources; **probable** = a name that matches, nothing else; **unknown** = no other trace.

| In `game.xml` | Maps in the pack | Who | Certainty and evidence |
|---|---|---|---|
| Haemimont Games (also `Heamimont`, `Haemimont games`) | 52: 48 identical to the game or to the Greek Mod packages, 4 editions (Larax, Tutorial, Europa, Defenders) | Haemimont Games / FX Interactive | Official campaigns and scenarios |
| Haemimont Games - RattlesMake, Mordred - RattlesMake, Rattlesmake | 7 | Rattlesmake team on Haemimont's originals | **Sure**: they are the Imperivm II campaigns (Punic Wars, Hannibal, Return to the Throne), Invaders and the tutorials, and `ConquestRemake` ("Mare Nostrum") that the Greek Mod 1.8 ships. Rattlesmake's forum account has one post (t1207) |
| Gabbo, ImperivmWorld-Gabbo, Gabbo-ImperivmWorld | 28 | Gabbo, of the Greek Mod team | **Sure**: GreekModTeam's contact on Discord (`_gabbo.`, consent given 2026-10-18). The "Big/Medium" scenarios, all inside Greek Mod 4.2 |
| ImperivmWorld, Imperivm World | 7 | Staff of the Italian forum *Imperivm World* | **Probable**: forum name, not a person. Same scenarios as Gabbo's |
| Ferónidas | 37 | Ferónidas | **Sure**: the `__IWC_*` and `00_Ludus_Martis` scenarios; he is the Discord's admin (`feronidas`). Inside Greek Mod 4.2 |
| Mietitore, IL Mietitore, Il Mietitore | 4 | Mietitore (forum account, 19 posts) | **Sure**: Italian editions of rows 196, 213 and 214 (his Spanish ones carry the same adventures); `IL` is just how he writes his name. *Mediterraneo Haemimont (grande)* is also his |
| Pablo Marcos Rodríguez | 1 (`La_Primera_Guerra_Punica`) | Pablo2427 | **Sure**: same adventure as the forum topic t1410 and row 229 (Sicily, Eryx, Mesina). Forum account `Pablo2427`, Discord `pablo2427` |
| Hareld (trad. Giuseppe D'Addio) | 1 (`Il popolo di Asclepio`) | Hareld, translated by Giuseppe D'Addio | **Sure** for Hareld: it is MISSING 17 (`[SIN DESCARGA] Aventura: El Pueblo de Asclepio`, forum t768). The Italian text is D'Addio's |
| Giuseppe D'Addio | 9 | Not found | **Unknown**: no Discord or `foroactivo` account with that name. He is the translator on Hareld's map and signs 8 adventures of his own (the *L'unificazione…* series, *L'Egitto maledetto*, *La guerra dei mercenari*, *La discesa di Brenno*) and `La battaglia di Qadesh` (in Greek Mod 4.2). The Italian forum `imperivmeditor` (not crawled) is where to look. Do not assume he is the "Giuseppe Lo Bianco" who posted the Greek Mod 1.8 *Τάρταρος* there |
| Ricky96Highlander (Ricky1996), Riccardo 'Highlander' Tedesco, Captain Highlander | 2 + 1 (in the HD game) + 1 | One person with three spellings | **Probable**: `Ricky` = Riccardo, 1996, "Highlander" in all three; Ricky96Highlander is on the staff of the old *Imperivm World* forum (Wayback 2019); *Il figlio di Ankou* by Riccardo Tedesco ships with the HD game. `Highlander` is also in the Mediterranevm Mod family tree. Not confirmed |
| Consul123 | 2 (`La battaglia di Avarico`, `PVP_dominazione_1`) | Unknown | **Probable** that he is `Consul`, one of the Mediterranevm Mod 1.0 authors in the family tree (same Italian community); nothing else |
| Project Studios Interactive | 1 (`L'Eroe d'Egitto I`) | Unknown | **Unknown**: a studio name, no trace in our data |
| Jorgra2000 y suscriptores | 1 (`La Última Carga Teutónica HD`) | Jorgra2000 | **Sure**: row 187. It is in the HD game's `mods/` folder already |
| Distruptor95 | 1 (`Hunger_Games`) | Distruptor95 | In Greek Mod 1.8 and 4.2 already; no other trace |
| Autore sconosciuto | 1 (`War`) | Unknown | In Greek Mod 4.2 already |

## What changes in the tables

- Row 259 stays one row (the pack), pointing here. The 15 new maps carry their author in `AUTHORS.md`.
- Rows 196, 213, 214, 202 and MISSING 1, 17 now say the pack has another edition of them.
- Not done: porting. `wrap-map.js` takes a Discord post or a forum topic, not a pack; to port these an `--entry` that reads this manifest is needed.
