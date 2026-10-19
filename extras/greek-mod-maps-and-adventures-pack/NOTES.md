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
| New | 15 | Port, with the author of the next section (+ Invaders = 16) |

Two of the 14 editions are Italian translations found by name, not by content: the texts sit inside the big files, so they barely match.

**The 14 editions: what to do** (checked file by file inside each map, `/tmp` diff of the `.bfhp` contents; texts in `Local/` aside)

| Pack file | Ours | What differs | Decision |
|---|---|---|---|
| `Battaglia_di_Qadesh` | Greek Mod 4.2 | 1 file (`itemscustom.xml`) | **Skip.** Same map |
| `Europa` ("Mediterraneo (grande)") | Greek Mod 4.2 | 2 files (`map.obj.xml`, `terrain.pass.grid`): a small fix of objects and passability | **Skip** (rides with the Greek Mod). Take the pack's if the 2.6.1 port needs it |
| `2 Le Guerre Puniche`, `3 Le Campagne di Annibale` | Greek Mod 1.8 (`The Punic Wars`, `Hannibal's Campaigns`) | 17 / 12 files (5 `map.obj.xml`, scripts) plus Czech texts; the 1.8 has Spanish titles | **Skip.** They are Haemimont's Imperivm II campaigns as the Greek Mod ships them: they go with the Greek Mod port. The Spanish editions by OskaOtzuna are rows 42 and 43 |
| `TTutorial CelticKings`, `TTutorial PunicWars`, `Tutorial` | Greek Mod 1.8 / the game | Only the texts | **Skip.** Official tutorials, they go with the Greek Mod |
| `ConquestRemake` ("Mare Nostrum") | Greek Mod 1.8 | 28 files (`map.obj.xml`, terrain heights): a revised conquest map, Rattlesmake's | **Skip** here; it is part of the Greek Mod. Use the pack's when porting 2.6.1 (it replaces `Conquests/`) |
| `5 Defenders` | `originals/imperivm1` and saga row 33 (*Defensores*) | 23 of 142 files, no new ones: a light edit, Italian texts added | **Skip.** We have it (row 33) and Rubeneitor's HD one (row 182) |
| `6 Invaders` | `originals/imperivm1` only | 22 of 70 files and 8 new (Italian texts) | **Port.** No row covers it: our only copy is the raw Imperivm I data. Credit Haemimont Games and Mordred (Rattlesmake team) |
| `1 L'avventura di Larax` | Row 202 (Luken_SOD, with movies) | Same 17 maps; 272 files changed (objects, scripts), plus a Spanish text pack (+109 MB) | **Skip.** Row 202 has a named author, the movies and three languages. Keep the pack's only as a reference |
| `Conquista della Gallia`, `La Rivolta dei Messeni`, `Ribellione di Spartaco` (Mietitore) | Rows 214, 213, 196 | **Not just a translation**: different dialogues *and* different units and scripts. *Messeni*: tents and outposts swapped. *Spartaco*: walls and towers (`MTower` 69 → 23), arenas | **Port as a second file, "(Italiano)", in the same mod** as the Spanish one, credited to Mietitore. It is the same author, so his answer to the forum PM covers both. We cannot tell which edition is newer: on ModDB Messeni are the same day (2020-09-09), Spartaco ITA is earlier (09-11 vs 09-26) and Gallia ITA later (2021-04-18 vs 02-27) |

So of the 14: **8 ride with the Greek Mod, 2 we already have, 1 is new (Invaders), 3 are Italian editions to add to our mods.**
New to port in total: 15 + Invaders = **16**.

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

## Ported (2026-10-19)

`node tools/wrap-map.js "pack:greek-mod-maps-and-adventures-pack/Adventures/<file>" --author "…"` (see the README). The exact command of each is in `raw/ported.json`.

| | Mods | Notes |
|---|---|---|
| New adventures | 14 (rows 260-273) | D'Addio's 8, Ricky96Highlander's 2, Avarico, *Il Re della Grecia*, *L'Eroe d'Egitto I*, *Invaders*. Italian texts (*Il Re della Grecia* has English too; *Invaders* English and Italian) |
| Recovering a dead download | 2 | *La Primera Guerra Púnica* (row 229, `forum/t1410 --add pack:…`) and *Il popolo di Asclepio* (MISSING 17, `forum/t768 --add pack:…`, credited to Hareld and D'Addio) |
| Italian edition added to a mod we had | 3 | Rows 196, 213, 214. Both maps in the same mod; the game lists them as `<name> (Español)` and `<name> (Italiano)`. The Spanish map changed in `game.xml` only (its name) |

All 19 pass `validate-mod.js --game`. They were **not** run in the game.

What to know:

- **Requirements** come from the class check of `wrap-map.js`: 9 of the 19 mods need `greek-civilization-mod`, 10 need nothing. The 9: 6 new adventures (*La guerra dei mercenari*, *L'unificazione dell'Italia*, *L'unificazione della Gallia*, *Il Re della Grecia*, *L'Eroe d'Egitto I*, *La Primera Guerra Púnica*) and the 3 Italian editions. The other 10 only use classes the HD game already has.
  `greek-civilization-mod` is **Gabbo's Greek Mod 4.2, already on GameBanana** ([728851](https://gamebanana.com/mods/728851), published 2026-10-17 by Ga33o, CC BY-NC-ND 4.0), the mod `originals/mods/greek-civilization-mod` mirrors. Three of them are also **not with Community Mod** (it hides `WildHorse`): *Il Re della Grecia*, *L'Eroe d'Egitto I*, *La Primera Guerra Púnica*.
  That the classes exist in 4.2 does not mean the adventure plays as its author meant: the pack was made for Greek Mod 2.x, and 4.2 (Gabbo's, built on 2.5) changes stats and AI. Nobody has played them yet.
- **Videos.** *L'Eroe d'Egitto I* plays `L'eroe d'Egitto.avi`, which the pack has as `L_eroe d_Egitto.avi` (a mangled name): `wrap-map.js` now matches it and unpacks it under the name the map plays (81 MB). **Still missing: *La Rivolta dei Messeni*'s `Intro_` and `Extro_La Rivolta dei Messeni.avi`**: neither the pack nor Mietitore's Spanish zip (t1300) has them, so the Spanish and Italian editions both play without them. Ask Mietitore (OUTREACH 4c). The other adventures that play videos have them: *La discesa di Brenno* (3), *Il Re della Grecia* (1), and the Gallia and Spartaco mods.
- **Credits are what each map's `game.xml` says.** *Invaders* is credited to Mordred (Rattlesmake team), Haemimont Games and FX Interactive: the adventure is Haemimont's, the Italian texts and the edit come from the Rattlesmake team.
- **`Alexius`** is in the credits of Gabbo's Greek Mod 4.2 as a contributor (with Axaros and Raffaele Luongo, and the Rattlesmake Team as original authors): probably the `AlexiusItaly` who signed the 2.6.1 `gbr.exe`. Not confirmed.
- **Not uploaded.** Authors first: `OUTREACH.md` step 4c.
