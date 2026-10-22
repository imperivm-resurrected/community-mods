// void, Obj This

Druid this;
Unit tgt;
bool bSleep = true;
int hide_stamina_cost;
ObjList targets;

this = This.AsDruid;
if (!.IsAlive)
	return;
if (!.HasSpecial(invisibility))
	return;
	
targets = ObjsInSight(this, "Unit").GetObjList();

hide_stamina_cost = GetCmdStaminaCost("hide");

while (targets.count>0 && .stamina>0)
{

tgt = targets[rand(targets.count)];

while (1)
{
	if (!.IsAlive)     break;
	if (!tgt.IsAlive)  break;
	if (!tgt.IsVisible) {
		tgt = .FindUnitToHide;
		if (!tgt.IsAlive)  break;
	}
	if (!tgt.IsVisible) break;
	if (.IsEnemy(tgt)) break;
	if (tgt.InHolder)  break;
	if (!.CanSee(tgt)) break;
	if (tgt.IsSentry)  break;
	if (tgt.IsPeasantAmbient) break;
	if (tgt.IsRam) break;

	bSleep = false;
	if (this != tgt && !.InRange(tgt)) {
		.GotoAttack(tgt, 2000, false, 2500);
		continue;
	}
	if (.stamina < hide_stamina_cost) {
		Sleep(200);
		continue;
	}
	.SetLastAttackTime();
	.StartAnim(17, tgt.pos);
	Sleep(.TimeToActionMoment);

	if (tgt.IsAlive)
	if (tgt.IsVisible)
	if (!.IsEnemy(tgt))
	if (!tgt.InHolder)
	if (.CanSee(tgt))
	if (.stamina >= hide_stamina_cost)
	{
		.SetLastAttackTime();
		.SetStamina(.stamina - hide_stamina_cost);
		tgt.SetVisible(false);
		if (tgt.command == "engage" || tgt.command == "attack")
			tgt.KillCommand();
	}
	Sleep(.TimeToAnimFinish);
}

if (bSleep)
	Sleep(17); // otherwise can cycle: Advance->Hide->Advance->Hide...

targets.Remove(tgt);

}
