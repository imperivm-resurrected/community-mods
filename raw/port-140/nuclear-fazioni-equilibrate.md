# nuclear-fazioni-equilibrate: to check by hand

1 items. In each conflict the mod's side was used.

## 1. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
if (!Victim.IsSentry)
{
if (.AsUnit().inherentlevel > 3)
||||||| 1.40
if (.AsUnit().inherentlevel > 12)
=======
if (.AsUnit().inherentlevel >= 12)
>>>>>>> mod
```
