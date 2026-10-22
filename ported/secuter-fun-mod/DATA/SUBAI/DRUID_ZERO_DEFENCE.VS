// void, Obj This

ObjList ol;
IntArray def;
int i, s, time, d;

EnvWriteInt(This.player, "Druid/ZeroDefence", 1);

time = This.GetStaminaDecTime();  
ol = ObjsInSight(This, "Unit").GetObjList();
i=0;

while (i<ol.count) {
	if (ol[i].IsDead())
        ol.Remove(ol[i]);
    else if (This.IsEnemy(ol[i])) {
		d = ol[i].armor_slash;
		def[i] = d;
        ol[i].AsUnit.AddBonus(0,-d,-d,0,0);
        CreateFeedback("Curse", ol[i].AsUnit);
        i+=1;
	}
	else
        ol.Remove(ol[i]);
}

s=0;

while (This.stamina > 0) {
    Sleep(134);
    s+=134;
    for (i=0; i<ol.count; i+=1)
        CreateFeedback("Curse", ol[i].AsUnit);
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
    ol[i].AsUnit.AddBonus(0,def[i],def[i],0,0);
}

EnvWriteInt(This.player, "Druid/ZeroDefence2", 1);
  
if (!This.IsValid || This.IsDead()) 
	return;

This.Damage(This.health);     
return;
