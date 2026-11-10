# Community Mod 12: inventory summary (completeness audit, art classes, ruleset layer)

The summary of the exhaustive inventory of `community_mod_v12.rar` (GameBanana 730058): every file of the original and every member of its 24 containers (`.pak`, `.bfhp`) has **exactly one status**. The full CSV (1.2 MB, with notes and sha256) stays local in `.scratch/communityrules/` (community-mods#53: "the full CSV stays local"); what is committed is this summary, the contract the build checks (`inventory-global.csv`) and what the build writes (`raw/community-mod-civs-layer*.txt`).

## Counts (after the layer)

| Status | Files | Container members |
|---|---|---|
| CLONED | 1111 | 0 |
| SHIPPED-AS-IS | 174 | 774 |
| IDENTICAL-TO-HD | 0 | 1288 |
| GLOBAL | 435 | 65 |
| DROPPED-ON-PURPOSE | 17 | 0 |
| UNCLASSIFIED | 0 | 0 |
| **Total** | **1737** | **2127** |

| Status | 0 not art | 1 civilization | 2 global in-game | 3 menu skin | rows |
|---|---|---|---|---|---|
| CLONED | 305 | 806 | 0 | 0 | 1111 |
| SHIPPED-AS-IS | 792 | 105 | 0 | 51 | 948 |
| IDENTICAL-TO-HD | 1288 | 0 | 0 | 0 | 1288 |
| GLOBAL | 206 | 0 | 294 | 0 | 500 |
| DROPPED-ON-PURPOSE | 9 | 0 | 0 | 8 | 17 |
| UNCLASSIFIED | 0 | 0 | 0 | 0 | 0 |
| **Total** | 2600 | 911 | 294 | 59 | 3864 |

GLOBAL by kind (files and members), how the layer carries them:

| Kind | Rows | Class | How |
|---|---|---|---|
| class-neutral | 34 | 0 | 32× XML patch, N operations; 1× XML patch, N operations, children of the same tag in the game's order; 1× no change against the game's file |
| commands | 15 | 0 | 8× XML patch, N operations; 6× XML patch, N operations, children of the same tag in the game's order; 1× no change against the game's file |
| formations | 1 | 0 | 1× XML patch, N operations |
| game-mode | 6 | 0 | 1× script patch, N directives; 5× new script under a name of its own, plain file of the layer |
| hidden | 1 | 0 | 1× the original's list, N of N entries |
| ini-const | 1 | 0 | 1× INI patch of the mod's constants |
| ini-skills | 1 | 0 | 1× INI patch, N keys |
| ini-specials | 1 | 0 | 1× INI patch, N keys |
| interface-list | 2 | 0 | 2× INI patch, N keys |
| items | 1 | 0 | 1× XML patch, N operations, children of the same tag in the game's order |
| map-pack | 2 | 0 | 2× loose file at the path the original gave it |
| map-pack-member | 64 | 0 | 32× member of RandomMapSettlements.bfhp, carried in the pack file; 32× member of randommap.BFHP, carried in the pack file |
| mapobject-art | 27 | 2 | 27× loose file at the path the original gave it |
| outline-art | 9 | 2 | 9× loose file at the path the original gave it |
| randommap-art | 14 | 2 | 14× loose file at the path the original gave it |
| randommap-table | 1 | 0 | 1× XML patch, N operations, N selected by position, children of the same  |
| script-ai | 1 | 0 | 1× script patch, N directives |
| script-item | 18 | 0 | 12× new script under a name of its own, plain file of the layer; 4× the mod's script whole at the game's path, inside the layer; 2× script patch, N directives |
| script-subai | 55 | 0 | 14× the mod's script whole at the game's path, inside the layer; 7× new script under a name of its own, plain file of the layer; 34× script patch, N directives |
| sound-entity | 4 | 2 | 3× XML patch, N operations; 1× XML patch, N operations, N selected by position |
| table | 2 | 0 | 2× XML patch, N operations |
| text-table | 3 | 2 | 3× texts patch |
| ui-art | 6 | 2 | 5× loose file at the path the original gave it; 1× spanish pak member, at the game's own path UI/INFOBAR/COMMON/LEVEL ICO |
| voice | 231 | 2 | 231× loose file at the path the original gave it |

Before the layer: GLOBAL 443 files + 65 members, DROPPED-ON-PURPOSE 9. Eight GLOBAL files became DROPPED-ON-PURPOSE with a cited reason (below); nothing else changed status. UNCLASSIFIED is 0, and `check.js` re-derives every total from the rar.

## The format (to reconcile with `tools/audit-completeness.js`)

`INVENTORY.csv`, one row per file (`level=file`) and per container member (`level=member`, path `container::member`). Columns:

| Column | Meaning |
|---|---|
| `path` | path inside the rar's `Community Mod/` folder (member: `container::path inside`) |
| `size`, `sha256`, `level`, `container` | recomputed from the rar by `check.js` |
| `status` | `CLONED` / `SHIPPED-AS-IS` / `IDENTICAL-TO-HD` / `GLOBAL` / `DROPPED-ON-PURPOSE` / `UNCLASSIFIED`. **GLOBAL = carried by the ruleset layer** |
| `kind` | what the file is (`voice`, `script-subai`, `class-neutral`, `menu-skin-art`, `map-pack-member`...) |
| `note` | the evidence or the cited reason (NOTES / AGENTS section, port path, `raw/` report) |
| `group`, `class`, `how` | the first audit's grouping, the balance/cosmetic category of a GLOBAL row, and the advice before the build |
| **`artclass`** | **0 not art, 1 art of a civilization, 2 global in-game (replaces the game's: layer), 3 menu skin (outside the match: root, a skin later)**. Class 3 = the SDK's `MENU_SKIN` list (`sdk/tools/lib/assetclass.js`) plus the conquest/adventure screen pictures, the lobby pages and the tips |
| **`skin`** | class 3 rows: the `skins/community-mod/...` path the mechanical move will use (empty otherwise) |
| **`layer`** | GLOBAL rows: the file(s) of `rulesets/community-mod/` that carry the row (empty if the row needs no change) |
| **`built`** | how the layer carries it: XML/INI/script patch, loose file, script whole inside the layer, texts patch, member of a pack file |

`extras/community-mod-civs/inventory-global.csv` is the contract (`path,level,kind,status,artclass,skin,reason`) for the 508 GLOBAL rows: `tools/community-mod.js` fails if a GLOBAL row produces no file, if a file of the layer has no row, or if a file of the root replaces the game's (class 2).

## Dropped on purpose (new)

- 6 menu INIs that only move buttons and chat boxes (`GSCHAT`, `INGAMECHAT`, `MAINMENU_SCROLLING`, `SELECTMAP`, `SETTINGS`, `_GUIDE`): AGENTS.md *Menu skin* (ship only what the skin changes). Class 3.
- 2 `TIPS.XML` (Spanish, Italian): AGENTS.md *The skin's Tips panel*: never for a language where HD has its own. Class 3.

## Not in the layer, on purpose, as before

`.fingerprint`, the author's `mod.json`, 3 thumbnails, `GHERO7A.SC .XML`, 3 dead scripts (9 files). See `NOTES.md`, *Not carried, for other reasons*.
