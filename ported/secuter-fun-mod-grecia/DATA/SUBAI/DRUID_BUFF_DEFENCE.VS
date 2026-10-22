// void, Obj This

ObjList ol;
int i, s, time;

EnvWriteInt(This.player, "Druid/BuffDefence", 1);

time = This.GetStaminaDecTime();
ol = ObjsInSight(This, "Unit").GetObjList();
i=0;

while (i<ol.count) {
    if (This.IsEnemy(ol[i]) || ol[i].IsDead())
        ol.Remove(ol[i]);
    else {
        ol[i].AsUnit.AddBonus(0,10,10,0,0);
        CreateFeedback("DefensiveCry", ol[i].AsUnit);
        i+=1;
    }
}

s=0;

while (This.stamina > 0) {
    Sleep(134);
    s+=134;
    for (i=0; i<ol.count; i+=1)
        CreateFeedback("DefensiveCry", ol[i].AsUnit);
    if (s > time) {
		s -= time;
        if(This.stamina > 1)
            This.SetStamina(This.stamina - 1);
        else
			break;
	}
}

for (i=0; i<ol.count; i+=1) {
    if (ol[i].IsDead()) continue;
    ol[i].AsUnit.AddBonus(0,-10,-10,0,0);
}

EnvWriteInt(This.player, "Druid/BuffDefence2", 1);
  
if (!This.IsValid || This.IsDead()) 
	return;

This.Damage(This.health);
return;
