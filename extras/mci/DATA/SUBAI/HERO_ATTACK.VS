// void, Obj This, Obj target
Hero this;
point pt;
int x;
this = This.AsHero;

if (!target.IsValid)
	return;

//if(.TimePastLastAttack() > GetConst("HeroTimePastLastAttack")){
if (.InHolder || .PathTo(target, .FormRadius, 0) > .sight) {
	.FormSetupAndMoveTo(target, 0, 0, true);
	while (1)
	{
        	//pr("attack"); 

		if (!.HasPath) break;
		if (!target.IsAlive) break;
		//if (.DistTo(target) <= .sight * 2 / 3) break;
                //if (.DistTo(target) <= .sight+400) break; 
                if(.IsEnemyInSquadSight()) break;
		.FormKeepMoving(1500);	
	}
}

while (!.IsArmyOutside)
	.FormKeepMoving(500);

//pr("hero::attack: target locked!!!");
//}

// HD
if(target.IsValid() == true)
{
	if(target.IsHeirOf("Hero") == true && target.AsHero().army().count() >= 5)
	{
		return;
	}
}
if (!target.IsValid)
	return;
if (target.AsBuilding)
{
	for (x = 0; x < .army.count; x += 1){
		if (.army[x].IsValidTarget(target))
			.army[x].SetCommand("attack", target);
		else
			.army[x].SetCommand("idle");
        }
	if (!.IsValidTarget(target))
		return;
} else {
	for (x = 0; x < .army.count; x += 1){
		if (.army[x].IsRanged())
			.army[x].SetCommand("attack", target);
		else
			.army[x].SetCommand("engage");
                
	}
        //pr("hero attack");
}
while (target.IsAlive)
{
	if (!.IsEnemy(target))
		return;
	//.pr("hero::attack: going to enemy");
	if (.GotoAttack(target, 5000, true, 2500))
	{
		//.pr("hero::attack: fighting");
		while (target.IsAlive)
		{
			if (!.Attack(target)) break;
			Sleep(19);
		}
	}

	Sleep(17);
}
//.AddCommand(true, "advance", target.pos);
.AddCommand(true, "engage");