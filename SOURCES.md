# Where to look for more mods

Places that host, or hosted, Imperivm III (*Great Battles of Rome*) mods, maps and adventures. Use it to find rows missing from
[MODS.md](MODS.md). Checked on 2026-10-19: **live** = opened today, **Wayback** = only an archived copy, **dead** = gone, **?** = not checked.
"Scraped" says how much of it is already in the tables (see [Tools](README.md#tools)).

## Spanish

| Place | State | What is there | Scraped |
|---|---|---|---|
| [JVLIVS CAESAR MODS FORUM](https://imperivmgbr.foroactivo.com) (also `imperivmgbr.forumotion.com`, same forum) | live | The main archive: maps, adventures, MCI, La Reconquista, AsvrMod, CGWAR, Greek Mod. Guests can't see the links: log in, and `tools/scrape-forum.py` needs the cookie in `FORUM_COOKIE`. The staff moved the chat to Discord ([f9](https://imperivmgbr.foroactivo.com/f9-nos-mudamos-a-discord)) | Yes, all 26 subforums (1,132 topics, 2026-10-21). **Gap**: [t1412](https://imperivmgbr.foroactivo.com/t1412-greek-civilization-mod-v2-0-by-mediterranevm) (Greek Mod v2.0) is in a forum only admins can read, so no scrape reaches it |
| Discord *Imperivm III Editores* ([invite](https://discord.gg/qV3x6PEfaK), ~2,070 members) | live | Where most current Spanish-speaking modders post. Maps, adventures and mods in channels (`#chat-mapas`, `aventuras`…) | Yes, the channels in `raw/discord.json` |
| Steam guides ([app 752580](https://steamcommunity.com/app/752580/guides/)) | live | Not mods: install guides ("Guía completa de Imperivm en Español", "El Quijote del Imperivm III", "Como jugar campañas antiguas") that name mods and where to get them | No |
| [Guía Imperivm](https://guiaimperivm.foroactivo.com) | live (2026-10-20, public to guests) | Small forum (83 members, 328 posts, active 2010-2012): game guides, strategies, bugs and balance, tournaments, clan forums (GOH, NDG). No mods section. Worth a look for old links and tournament maps | No. Low value |
| [imperiummods.net23.net](http://imperiummods.net23.net) (36 links in our data) | dead, [Wayback 2010](http://web.archive.org/web/20100314061800/http://imperiummods.net23.net:80/) | Old texture and unit tutorials with the files | Links only |
| [imperivmplus.webcindario.com](https://imperivmplus.webcindario.com), `clanimperivmiii.webcindario.com` | dead, Wayback [2022](http://web.archive.org/web/20221206023954/https://imperivmplus.webcindario.com/) / [2018](http://web.archive.org/web/20180314055013/http://clanimperivmiii.webcindario.com/) | Imperivm Plus and a clan's site | Links only |

## Italian

| Place | State | What is there | Scraped |
|---|---|---|---|
| [Imperium III GBR Editor & Mod Forum](https://imperivmeditor.forumcommunity.net) (ex *Imperivm World*, `imperivm-world.forumcommunity.net`) | live again (2026-10-20; sections and profiles need a login, the member list is public), [Wayback 2025-12-02](https://web.archive.org/web/20251202/https://imperivmeditor.forumcommunity.net/) | The Italian archive, active until Dec 2025. *Avventure & Conquiste* (96 topics, every user's maps), *Archivio Mods Imperivm World* (19 topics: staff mods, among them "Greek Civilization MOD v 1.8 'Τάρταρος'" by Giuseppe Lo Bianco, Aug 2020), *Altre MOD* (15, e.g. Nemesis of the Roman Empire 1600x900), *Collaborazioni Mappe* (24) | Yes, 2026-10-22 (`tools/scrape-forum-it.py`, needs login): 650 topics in 37 content sections + the Downloads table (87 rows) in `raw/forum-it.json` and `raw/forum-it-downloads.json`. Not in the tables yet. No access: *Wikimperivm*, *Private LAB*, *Graphic LAB*, *Materiale grafico* |
| Discord *Imperivm GBR* ([invite](https://discord.gg/czP4GMyAbA), ~771 members) | live, checked | "La community italiana di Imperivm GBR". Italian players and modders | No |
| Discord *Lega Ellenica* ([invite](https://discord.com/invite/g2c45ZC4E3), ~291 members; the old [Disboard](https://disboard.org/server/707915204444553249) invite expired) | live, checked 2026-10-21 (invite never expires) | "Server italiano dedicato a Imperivm GBR – Greek Mod": multiplayer games, tournaments, events and mod discussion | No |
| Telegram [imperivmgreekmod](https://t.me/imperivmgreekmod) | live, files hidden | Official public channel of the Greek Mod: `Greek261.zip` (2.6.1) and `Greek_MapsAdventures.zip`. The web preview shows no files: use a Telegram client | Yes, by hand (rows 258 and 259). Check it for newer posts |
| [imperivmworld.altervista.org](http://imperivmworld.altervista.org) (16 links in our data) | dead, [Wayback 2019](http://web.archive.org/web/20190718121701/http://imperivmworld.altervista.org:80/) | The old Imperivm World site | Links only |
| Steam guide "COME INSTALLARE LA MOD LEGACY" and "COME GIOCARE ONLINE" | live | Not a mod, but names what the Italian players use | No |

## English and international

| Place | State | What is there | Scraped |
|---|---|---|---|
| [ModDB, *Imperium: Great Battles of Rome*](https://www.moddb.com/games/imperivm-great-battles-of-rome) (mods, [downloads](https://www.moddb.com/games/imperivm-great-battles-of-rome/downloads), addons) | live, Cloudflare (needs a browser) | Legacy 2.4.1 (ENG, ESP, ITA), Mediterranevm alpha, GBR Plus, Epic Battle Music, AsvrMod patch, Mietitore's adventures (addons). Its [Greek Civilization MOD](https://www.moddb.com/mods/greek-civilization-mod) page has 396 comments with news and dead links | Yes, `tools/scrape-moddb.js` → `raw/moddb.json`. Re-run it for new uploads |
| [GameBanana, *Imperivm Hub*](https://gamebanana.com/games/26069) | live | Where we publish. Others upload there too: check it before porting something, to avoid duplicates | Partly (our own rows) |
| Steam Community ([app 752580](https://steamcommunity.com/app/752580)) | live | Discussions ("Install mods/maps and use them online", Axaros's Greek Mod thread, Sep 2025) and guides in English, Spanish and Italian. The Workshop shows no items | No |
| [GreekModTeam on itch.io](https://greekmodteam.itch.io) | live | Greek Mod 2.5.3 installer (649 MB) | Yes, row 257 |
| Discord *Imperivm HD* ([game page](https://discord.com/game/imperivm-great-battles-of-rome-hd-edition-1124360478072787044)) | live | The official server (FX Interactive). Mods are banned there, so it is only useful for HD fixes and news | No |
| [forum.imperivmworld.com](https://forum.imperivmworld.com) | **503 today**, [Wayback 2026-04-17](https://web.archive.org/web/20260417/https://forum.imperivmworld.com/) (full of spam) | English/Spanish MyBB: *Imperivm HD* (13 threads), *Editor Help*, *Multiplayer* | No. Low value |
| [FX Interactive](https://www.fxinteractive.com) | live | The publisher: patches and the HD changelog. No mods | Links only |
| Reddit, Nexus Mods | ? | Both block automatic access (403). I found no page for the game | No |

## Dead hosts you will see in old links

`megaupload`, `rapidshare`, `hotfile`, `4shared`, `box.com` and old Mega links. They are in [DEAD-LINKS.md](DEAD-LINKS.md) and [MISSING.md](MISSING.md);
the Wayback copy of the page that held the link is worth trying before giving up on a row.

## What to do next

1. Crawl the Italian forum through Wayback (`web.archive.org/web/20251202/…`), starting with *Archivio Mods Imperivm World*, *Altre MOD* and *Avventure & Conquiste*.
2. Re-run `tools/scrape-forum.py` with `FORUM_COOKIE` to fill the gaps (t1412 and any other missing topic).
3. Re-run `tools/scrape-moddb.js` every few weeks.
4. Ask in *Imperivm GBR* (Italian) and *Lega Ellenica* for adventures and the Greek Mod pack, and look in the Telegram channel with a client.
