// void, Obj This

ObjList ol;
IntArray def;
int i, s, time, d;

EnvWriteInt(This.player, "Druid/DrainStamina", 1);

time = This.GetStaminaDecTime();  
ol = ObjsInSight(This, "Unit").GetObjList();
i=0;

while (i<ol.count) {
	if (ol[i].IsDead())
        ol.Remove(ol[i]);
    else if (This.IsEnemy(ol[i]))
        i+=1;
	else
        ol.Remove(ol[i]);
}

s=0;

while (This.stamina > 0) {
    Sleep(134);
    s+=134;
    if (s > time) {
		for (i=0; i<ol.count; i+=1) {
			ol[i].AsUnit.SetStamina(ol[i].AsUnit.stamina - 2);
			CreateFeedback("StaminaLoss",ol[i].AsUnit);
		}
		s -= time;
        if(This.stamina > 1)
            This.SetStamina(This.stamina - 1);
        else
			break;
	}
}

EnvWriteInt(This.player, "Druid/DrainStamina2", 1);
  
if (!This.IsValid || This.IsDead()) 
	return;

This.Damage(This.health);     
return;
