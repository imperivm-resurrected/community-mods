//void, ObjList objs, point pt, Obj obj, bool bReplace, bool bModifier, int player

Building this;
int cost;

this = objs[0].AsBuilding();
if (!.IsValid()) return;

cost = GetCmdStaminaCost("ghost");
if (.stamina < cost) return;
.SetStamina(.stamina - cost);
//.GlobalSpellStart(6, player);

.SetCommand("ghost");

