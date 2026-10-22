// void, Obj This

Druid this;
Obj obj;

this = This.AsDruid();
if (!.IsValid()) return;

.PlayAnim(19, .pos);
if (EnvReadInt(.player, "Druid/BuffSpeed") == 1) return;
obj = Place("BuffSpeed", .pos, .player);
obj.SetStamina(10);
.Damage(.health);
