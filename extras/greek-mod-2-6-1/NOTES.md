# Greek Mod 2.6.1: notes before porting

Source: Telegram channel [imperivmgreekmod](https://t.me/imperivmgreekmod), received 2026-10-19.

| File | SHA-256 |
|---|---|
| `Greek261.zip` (863 MB) | `d67bfd7e6c47a31a292c93756b18cbaceea04a78a6e861fd5a2d5c2bab92329b` |
| `Greek_MapsAdventures.zip` (1.6 GB) | `c72cb668a42899bd…` (full hash in `originals/…/files/`, `sha256sum`) |

ClamAV 1.5.4 (signatures of 2026-10-19): 0 detections in both zips and in everything extracted.

## `gbr.exe` is patched

`Greek261/gbr.exe` has the text `GBR.exe Patched by AlexiusItaly` in its DOS stub and differs from the Steam HD `gbr.exe` by 532 bytes
(the 1.8 one by 332, the 2.5.3 one by 162), 476 of them against 2.5.3. Same size, same 258 imported functions as the HD exe (nothing new:
no process, network or registry calls beyond the game's own), same sections.

What the 37 changed places do (read from the disassembly, not run):

| Where | What |
|---|---|
| 7 `jmp` sites in `.text` → code in the free space at the end of `.text` (`0x3aa98b…0x3aaac0`) | Guards: `test esi,esi`, `cmp reg,0x100000` (a pointer below 1 MiB is treated as null), default `1` when a field is 0. These look like crash fixes |
| 2 `jz` → `jmp`, 1 `jl` → `nop nop` | Skip a check |
| ~20 edits at `0x2bcb3d…0x2be5d8` | A structure grows by `0x10` bytes (`0x1c→0x2c`, `0x20→0x30`, `0x28→0x38`) and a limit goes from 5 to 9/10 (`cmp ecx,5` → `cmp ecx,0xa`). Some engine table is bigger |
| `0x2c312f` | `mov esi,[0x826bf8]; call …` → `xor esi,esi; jmp +0x38`: it skips a call |
| `0x3c71b0…0x3c7490` (`.rdata`) | The names `Greek`, `Greek Town`, `Greek Village` become `Imperial Roman`, `Imperial Roman Town`, `Imperial Roman Village` |

## Why it matters for the port

- A Resurrected mod carries data only: `shrink-mod.js` leaves executables out, and the game runs the HD `gbr.exe`. None of the above reaches the port.
- The guards are probably only needed because this exe's own data trips the original code; the HD exe may have fixed some of them.
- The bigger table and the limit 5 → 9/10 are the risk: if 2.6.1's data needs them (more entries than the HD exe allows), the ported mod could crash or drop content.
  Find out which table it is (the structure at `+0x2c`/`+0x3c`, loops compared with `5`) before porting, or check the data against the HD limits with `validate-mod.js --game`.
- The race names in the exe are not used by the data: Resurrected gives the mod its own civilization (as CGWAR does, `civs/greece.json`).
