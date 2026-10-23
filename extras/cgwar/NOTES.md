# CGWAR - Greek civilization Mod v6 (Camarada, Gurkhan, Razor, WARRIOR4444)

Row 5. Built with `tools/port-140.js` and then `tools/cgwar-greece.js` (see the README, *Mods made for 1.40*); this folder is what is done by hand on top. The old notes are in the README and in `tools/cgwar-greece.js`; this file only has what is pending.

## Pending: independence (AGENTS.md, *Civilizations are independent*)

The closest of the three to the goal: Greece is its own civilization (`greece`, index 30, letter `K`, own race) and the shared command files are patches. Not done yet:

- It is `incompatibleWith` the Greek Civilization Mod 4.2 and, in practice, the Greek Mod 1.8 (16 files in the same path in `DATA`, 3 in `units`, 4 in `ui`, class `GreekHero`, the `Greek` template name). Those have to become patches or be renamed here, and the other two have to stop sharing them.
- 3 HD classes are shipped as whole files, changing what every civilization sees: `BaseRuins`, `fountain`, `Fountain2`. They must be patches, or new classes the mod's own objects use.
- `tools/cgwar-greece.js` **drops** what the 1.40 mod changed in the game's Romes (Imperial Rome's `M*` classes, `RArena`, `RBarracks`, `RBlacksmith`, the Republican/Imperial merge, the official adventures it edited). By the rule, anything in there that differs from HD in parameters or assets (not the merge trick, which is not ported) is kept as a civilization of its own, "Rome (CGWAR)". Not measured yet.
- Its Greek pieces are `K*`; the letters and indices in use are in the README (*Civilization mods*).
- Not tried in game with another civilization mod active.
