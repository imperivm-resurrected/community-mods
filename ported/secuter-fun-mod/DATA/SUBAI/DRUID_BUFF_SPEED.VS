// void, Obj This

ObjList ol;
int i, s, time;

EnvWriteInt(This.player, "Druid/BuffSpeed", 1);

time = This.GetStaminaDecTime();  
ol = ObjsInSight(This, "Unit").GetObjList();
i=0;

while (i<ol.count) {
    if (This.IsEnemy(ol[i]) || ol[i].IsDead())
        ol.Remove(ol[i]);
    else {
        ol[i].AsUnit.SetSpeedFactor(ol[i].AsUnit.speed_factor + 30);
        CreateFeedback("Ceasefire", ol[i].AsUnit);
        i+=1;
    }
}

s=0;

while (This.stamina > 0) {
    Sleep(134);
    s+=134;
    for (i=0; i<ol.count; i+=1)
        CreateFeedback("Ceasefire", ol[i].AsUnit);
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
    ol[i].AsUnit.SetSpeedFactor(ol[i].AsUnit.speed_factor - 30);
}

EnvWriteInt(This.player, "Druid/BuffSpeed2", 1);
  
if (!This.IsValid || This.IsDead()) 
	return;

This.Damage(This.health);     
return;
