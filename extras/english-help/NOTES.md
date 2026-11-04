# English help (`HELP.XML`) for the skins that bring back the Help button

Issue #54. HD's English language pack has **no `help.xml`** (only its Spanish and Italian packs do: `sdk/languages.md`), so a skin that switches the main menu's Help button on opens nothing in English (log: `opens currentlang/help.xml -> does not exist`). Decision of the maintainer (2026-11-02): a skin may ship `Local/english/HELP.XML` (HD's English lacks it: nothing is replaced), never for Spanish or Italian (they keep HD's own) and never at `CURRENTLANG/`.

**`HELP.XML` here is the one canonical file** every port that ships an English help takes (`tools/lib/english-help.js`: `ship(OUT)`). Same bytes in every port, so two ports that ship it do not differ. Ports that use it: Greek Civilization Mod 4.2 (`tools/greek-4-2.js`), AsvrMod VII (`tools/asvrmod-vii.js`, second PR). The Caesar Mod ships its own English help (PR #49, different text): the file collides with it by path, accepted by the maintainer until the skin selector (imperivm-resurrected#55).

## What it is

**A model translation, UNREVIEWED.** Source of truth: HD's own Spanish help (`originals/game-data/local-spanish/CURRENTLANG/HELP.XML`, 294,574 bytes, 225 `<topic>` elements, 222 distinct ids: `IOutpost`, `GOutpost` and `ROutpost` appear twice in the original), cross-checked with HD's Italian one (same topic ids, same order; the build stops if not). The XML is the original's **byte for byte** except the text inside `<entry>...</entry>`: BOM, CRLF line ends, tabs, ids, links, `image=` names, attributes, comments, the empty entries, and the white space before and after each text. 2,049 entry texts (945 distinct) are English; 22 of them were already English in HD's Spanish help (`Bless - ...`, `Fast metabolism - ...`, `Gaul Village hall`...) and are left as they are.

- **Not copied from anywhere.** The Caesar Mod's English help was not opened (it is CC BY-SA 4.0; the licence would propagate). The text is a translation of HD's own help text, done by a model in seven chunks (the 328 texts that repeat in the help first, then six chunks of the rest), each told to use the game's own English names.
- **Names are the game's.** Every unit, building, item, skill, special and order the help names was looked up in HD's own text tables (`GAME.LOC.XML`, `TRANSLATION.LOC.XML` of the Spanish pack: the English `text` of each Spanish `result`) so the help says what the game shows: Foro = *Townhall*, Fortín = *Outpost*, Liderazgo = *Administration*, Gesta = *Assault*, Defensa (the stat) = *Armor*, Vitalidad = *Active*... Where the game's table has the same Spanish for two English names (*Juegos de circo* is *Fights* for the Gaul and British arena and *Gladiator shows* for the others), the help follows the building's own.
- **Done in chunks, none shipped partly**: the build copies the finished file or nothing; `verify()` has no way to accept a half file (it compares every entry's place with the Spanish one).

## Checks (`node tools/lib/english-help.js`, and every build that ships it)

- BOM present, every line end CRLF, no replacement character.
- Everything but the entry texts equals the Spanish file's (the file with each text replaced by `T` is compared whole); topic ids equal HD's Spanish and Italian ones, same order; the 655 `link=` values are the Spanish file's.
- No `<` or bare `&` in a text; the tags open and close in order (no XML library in this repo: a tag stack).
- **Links**: 624 of the 655 are a topic id or a path whose last part is one; the other 31 are not a topic id **in HD's own Spanish help either** (`/contents/healing`, `/contents/buildings/MOutpost`, item names such as `Amulet of Triumph`, which the engine looks up as items): same links, same state.
- **Pictures**: 1,489 names, 631 distinct. Looked up as written, under `ui/`, and with `gameres/` read as `ui/` (that is where HD keeps those icons): 618 exist in HD's own `UI.pak`, **13 do not exist in HD** (`ui/help/mcmdbar/actions/train priest.bmp`, `ui/help/rcmdbar/actions/train peasant.bmp`, `ui/icons/bstorage.bmp`, `cgate`, `estorage`...): they are **the same 13 HD's own Spanish help names**, so it is HD's gap, not new (the check stops if the English names one the Spanish does not).
- HD's English pack (`local/english.pak`, read through its index) has no `currentlang/help.xml`; the build stops if it ever has one (the file would replace it).

## Things a person who knows the game should look at

Doubts the translators flagged, all in this one file:
- **The health-bar key.** The Spanish help says `Ñ` (and `Ctrl + Ñ`); the Italian one says `Ò`: the key to the right of L on each keyboard. The English text says "the key to the right of L (Ñ on a Spanish keyboard)" because the English game's key was not found; check which key the English game binds there.
- Formation names (`En bloque` = *Front*, `En cuadro` = *Block*, `Caballería al centro` = *Cavalry core formation*) come from the game's text table and read as swapped literal translations.
- `Héroe galo` / `Héroe germano` = *Hero of Gaul* / *Hero of Germany* (by analogy with the game's *Hero of Iberia*), `Festival de Baco` = *Free wine*, `Producir corazas` = *Forge Cuirasses*, `Fiereza` = *Ferocity*, `Código de honor` = *Code of Valor*, `la Insignia del combate` = *the Veteran Offense*: no exact match in the table.
- `Héroe egipcio` is *Heroe Egypt* (the game's own typo, kept); the Spanish `druida, hechicera o sacerdotisa` gives "druid, enchantress, or enchantress" because the table maps both to *Enchantress*; `Coste 400` (Roman chariot) has no "gold" in the Spanish either.
- The Italian help names a different research than the Spanish one in one place (Spanish `Armadura de mujer` / Italian `Armi d'acciaio`): the Spanish was followed.

**Not tried in game**: the Help button, the topics, the links, the pictures. To try (English game, a mod that ships it on): main menu -> **Help** opens; the list of topics shows; click topics and **links** (*See also*); long pages scroll; the pictures show (13 names have no file, as in Spanish); the key names read right.
