// void, Obj This

Druid this;
Obj obj;

this = This.AsDruid();
if (!.IsValid()) return;

.PlayAnim(18, .pos);
if (EnvReadInt(.player, "Druid/ZeroDefence") == 1) return;
obj = Place("ZeroDefence", .pos, .player);
obj.SetStamina(10);
.Damage(.health);
