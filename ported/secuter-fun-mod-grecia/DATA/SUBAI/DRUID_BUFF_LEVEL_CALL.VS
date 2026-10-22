// void, Obj This

Druid this;
Obj obj;

this = This.AsDruid();
if (!.IsValid()) return;

.PlayAnim(18, .pos);
if (EnvReadInt(.player, "Druid/BuffLevel") == 1) return;
obj = Place("BuffLevel", .pos, .player);
obj.SetStamina(10);
.Damage(.health);
