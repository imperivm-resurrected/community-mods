# Balanced Factions 2.6 (Nucl3arW1nter)

Row 288, `Nucl3arW1nter MOD UFFICIALE 2.6.rar` (MediaFire, `originals/forum/fazioni-equilibrate-mod-v-ufficiale-2017/files/`; row 282 is its older 1.8 and is superseded). Loose files over 1.40 (1533 identical to HD, 228 identical to 1.40, 27 merged, 6 only the mod's). No installer, no `.exe`, no `.dll`: nothing the mod did through code is lost. Permission: not asked yet (see `docs/MODS.md`). No license in the download.

**This port is a balance mod as copies (1-C, community-mods#15): eight civilizations of its own next to the game's, labelled "(Nuclear)".** The game's eight are not touched, and the mod is not an exclusive ruleset. The room's set is named **Balanced Factions 2.6** (`mod.json` `name`, 21 characters): the host allows only that set and the lobby is not flooded.

| `id` | Prefix (derived) | Base | Lobby name |
|---|---|---|---|
| `ngaul` | `Nga` | Gaul | Gaul (Nuclear) |
| `nrome` | `Nro` | RepublicanRome | Rep. Rome (Nuclear) |
| `nimperial` | `Nim` | ImperialRome | Imp. Rome (Nuclear) |
| `ncarthage` | `Nca` | Carthage | Carthage (Nuclear) |
| `nbritain` | `Nbr` | Britain | Britain (Nuclear) |
| `niberia` | `Nib` | Iberia | Iberia (Nuclear) |
| `negypt` | `Neg` | Egypt | Egypt (Nuclear) |
| `ngermany` | `Nge` | Germany | Germany (Nuclear) |

`n` is this port's reserved token (the other two balance ports of this task have `o` and `q`): every id starts with it. The prefixes are derived by the SDK, the index is assigned by the game (imperivm-resurrected#37), and `docs/CIVILIZATIONS.md` has no letter to reserve. Every civilization has `ai: true`; `random` is at its default; no `replacesBase`, `variant` or `ownAi`.

## What the mod changed (and where it went)

Against HD (`node tools/mod-class-diff.js ported/.../DATA/CLASSES --hd` on the merge):

- **22 unit classes** (health, damage, armor, speed, range, specials): Britain 2, Carthage 5 (hero included), Egypt 4, Gaul 4, Germany 2, Iberia 3, Republican Rome 1 (gladiator speed); Imperial Rome none. They are in each clone's own class (`NgaAxeman` has `maxhealth="280"`).
- **9 command files** (costs of barracks, temples, tavern, arena orders) and the new arena order **`CHero level 8`** (2000 gold: every new hero starts at level 8; `CArena`, Carthage only): in each clone's commands, with the mod's cost over HD's. The `1 added in the shared ones` in the build log is that order (`CHero level 8 Ncarthage`).
- Nothing in the base classes (`Hero`, `Melee`...): `base-changes.json` is empty.

## Rebuild

```bash
G="$HOME/.local/share/Steam/steamapps/common/Imperivm - Great Battles of Rome HD" node tools/nuclear-fazioni-equilibrate.js [id ...]
```

It unpacks the rar in a temporary folder (`bsdtar`, nothing under `originals/`), runs `tools/port-140.js` on it (merge with HD against 1.40), keeps the mod's classes and commands apart and clones each civilization with `tools/lib/clone-civs.js` (`cloneAllOrders`), then copies `extras/nuclear-fazioni-equilibrate/mod.json`. It replaces `ported/nuclear-fazioni-equilibrate/` (the first port, 31 files at the game's paths, is gone). The folder (500 files) is git-ignored (`.gitignore`), like Mediterranevm's: only the tool and `extras/` are in git. The same result twice (checked with `md5sum` of every file).

## Left out because it is global

What the mod changes that cannot be scoped to a clone (AGENTS.md, *World rules packs*). **No `nuclear-fazioni-equilibrate-rules` pack is built** (maintainer's decision, 2026-10-30): this list is what such a pack would have if it is ever wanted. Each item is a patch-only change that would apply to every player while it is on.

| What | In the original | Why it is global |
|---|---|---|
| `DATA/SUBAI/UNIT_ON_KILL.VS` | 1.40's `inherentlevel > 12` becomes `>= 12` (one level); HD already rewrote that line (`> 3`) | A script at its own path, run by the game's `onkill` of every unit; HD's rewrite conflicts with the edit |
| `DATA/UNIT_SPECIALS.INI`, `[Disease attack]` `stamina_cost` | 3 → 7 (line 207 of the game's file) | A value of a global INI the game already has; every civilization shares the section |
| `skill_frenzy` in `DATA/COMMANDS/HERO.XML` | `coststamina` 4 → 6 | The order's source is the game's base class `Hero`, and `SKILLS.INI` names it (`[Frenzy] command = skill_frenzy`) |

## Not ported, and why

- **`DATA/SUBAI/UNIT_ON_KILL.VS`**: the mod's only script change (1.40's `inherentlevel > 12` becomes `>= 12`, one level) conflicts with HD's rewrite of the same line (HD says `> 3`, so HD already moved that threshold far beyond the mod's edit); `port-140.js` takes the mod's side there, and the file would have replaced the game's script **at the game's path** (AGENTS.md: never). Left out: HD's script stays (a copy `UNIT_ON_KILL_N.VS` that the clones' `onkill` method pointed to would have had to choose between HD's rewrite and the mod's one-level edit, and HD's is the newer decision).
- **`DATA/UNIT_SPECIALS.INI`**: one value, `[Disease attack] stamina_cost` 3 → 7 (line 207 of the game's file; maintainer's decision, 2026-10-30). The INI patch can only add keys the game lacks, and the section is the game's own and shared by every civilization: left out.
- **`skill_frenzy` in `DATA/COMMANDS/HERO.XML`**: `coststamina` 4 → 6 (the mod's only change in that file). Its source is the game's base class `Hero`, so changing it would change the hero skill of the game's civilizations too, and the skill names its command in the game's `SKILLS.INI` (`[Frenzy] command = skill_frenzy`, line 79-84), a shared table the mod cannot change: a per-clone copy of the order would have nothing pointing to it (not tried). Left out. It is the only balance change of the mod that is not in the clones: Frenzy costs 4 stamina in the clones, as in the game.
- Nothing of the rest of the original folder is at a different path from the game's (1533 files identical to HD, 228 to 1.40).

## imperivm-resurrected#15 (`Sleep` inside a script started with `AIRun`)

**It does not touch this port.** The mod ships no AI script (no `DATA/AI`, no `AIRun`: `grep -rn AIRun ported/nuclear-fazioni-equilibrate` finds nothing) and no game mode. The clones play with the game's AI through their classes (`ai: true`). The only scripts in the port are the two copies of the game's `townhall_buildingsbehavior` that `clone-civs.js` makes for Egypt and Germany (`TOWNHALL_BUILDINGSBEHAVIOR_NEGYPT.VS`, `..._T_NGERMANY.VS`): the base civilization's race test is removed because a clone's race is not its base's, and a behavior script that returns without `Sleep` is restarted forever. They are behaviors of buildings, not started with `AIRun`, and loop with `Sleep`.

## imperivm-resurrected#37, #38 and the others

- **#37**: prefixes derived, no `index`. Needs the Resurrected build that supports multi-character prefixes (`dev-villoh`).
- **#38**: set named `Balanced Factions 2.6`; the lobby names carry `(Nuclear)` so that the longest, `Rep. Rome (Nuclear)` (19 characters), fits the 22 of the dropdown.
- **Conquests**: the mod ships none. **Maps that `require` it** (rewritten to the clones' classes in #8, out of scope here): none: no row of `docs/MODS.md` has `requires nuclear-fazioni-equilibrate`. Row 312 (Secuter's Fun mod, not ported) lists it as an incompatibility only.

## Independence check

`node tools/shared-paths.js nuclear-fazioni-equilibrate`:

```text
no collisions
```

0 class ids, entity folders or file paths in common with the game and with every other port. The clones use the game's entity folders (`Units/GAxeman/...`) and sprites as they are: the mod ships no art. No graphics tail, no `currentlang` file.

## Validation

`validate-mod.js --game "$G" --data originals/game-data/DATA` (SDK of `dev-villoh`): **OK, 500 files checked, no problems**.

## In game

**Tried** (maintainer, 2026-10-30, Linux/Wine, `dev-villoh` DLL, log read by him): the new build (`civs/` + `patches/`) installed over the old loose-files port, a profile with only this mod.

- The log shows the 8 civilizations registered (indices 10-17, prefixes `Nbr`..`Nro`) and the 8 mod civilizations added to the dropdowns.
- The AI plays with them.
- A match was played with `nbritain` vs `nimperial`; **0 compilation errors**.
- He played a while and says it seems fine.

**Not itemised** (the report does not say, so none of it counts as tried):

- the costs and stats of the mod, one by one (Gaul's woman warrior at 350 where the game says 220; Carthage's Libyan footman at 70 instead of 90 and its macemen at 90 instead of 130; the arena of Carthage offering "Eroi di livello 8");
- a room with only this set (#38) and the Random draw.

**Not tried:**

1. A skirmish with the set alone and with the game's civilizations too; that the game's civilizations keep HD's numbers.
2. Saving and loading a game.
3. Another civilization mod active together (Mediterranevm, the 1.8).

## Pending

- *Pending: independence*: none. Overlap with the other balance ports (Community Mod, Caesar Mod, MCI, Secuter's two): they change the same game units, so a room that allows two of those sets has two versions of the same unit; each is its own civilization, so they do not conflict.
- The Frenzy stamina cost, `UNIT_ON_KILL` and the Disease attack stamina cost (above).
