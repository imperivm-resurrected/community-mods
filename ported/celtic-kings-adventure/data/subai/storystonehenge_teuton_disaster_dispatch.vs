//void, ObjList objs, point pt, Obj obj, bool bReplace, bool bModifier, int player

Building this;
int cost;

this = objs[0].AsBuilding();
if (!.IsValid()) return;
if(EnvReadInt(this, "StonehengeStart") == 1) return;
EnvWriteInt(this, "StonehengeStart", 1);

cost = GetCmdStaminaCost("teuton_disaster");
if (.stamina < cost) return;
.SetStamina(.stamina - cost);

.SetCommand("teuton_disaster");