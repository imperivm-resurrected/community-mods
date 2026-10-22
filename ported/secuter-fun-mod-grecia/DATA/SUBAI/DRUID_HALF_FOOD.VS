// void, Obj This

Druid this;
ObjList ol;
int i;

this = This.AsDruid();
if (!.IsValid()) return;

.PlayAnim(18, .pos);
.SetSight(600);
ol = ObjsInSight(this, "Unit").GetObjList();

for (i=0; i<ol.count; i+=1) {
	if (ol[i].IsDead()) continue;
	if (.IsEnemy(ol[i])) {
		ol[i].AsUnit.SetFood(ol[i].AsUnit.food / 2);
		CreateFeedback("GetItem",ol[i].AsUnit);
	}
}

.Damage(.health);     
return;
