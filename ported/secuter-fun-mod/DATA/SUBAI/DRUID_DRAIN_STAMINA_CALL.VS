// void, Obj This

Druid this;
Obj obj;

this = This.AsDruid();
if (!.IsValid()) return;

.PlayAnim(18, .pos);
if (EnvReadInt(.player, "Druid/DrainStamina") == 1) return;
obj = Place("DrainStamina", .pos, .player);
obj.SetStamina(6);
.Damage(.health);
