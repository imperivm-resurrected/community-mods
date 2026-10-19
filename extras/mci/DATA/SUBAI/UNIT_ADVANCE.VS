// void, Obj me, point pt

Unit this;
Obj u;
bool modado;
int max;
str modo;

this = me.AsUnit();

if(.IsValid() == false)
	return;

if(.IsHeirOf("Animal") == true)
	.SetCommand("move", pt);

if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command (HD: AI only)
	.SetParryMode(false);

modado = (EnvReadInt(.player, "Modo/Lista") != 0);
if(modado){
	int i;
	bool es=false;
	max = EnvReadInt(.player, "Modo/Lista");
	for(i=0;i<=max;i+=1)
		if(EnvReadObj(.player, "Modo/Unidad" + i) == this){
			es = true;
			break;
		}
	if(es)
		modo = EnvReadString(.player, "Modo/Unidad" + i + "Modo");
	else
		modado = false;
}
 
while (1) 
{
	//pr("advance: searching for new enemy");
	u = .BestTargetInSquadSight();
	if (u.IsAlive() && modo != "pasivo")
	if (.IsValidTarget(u))
	{
		if (u.attack > 0)	
		{
			Sleep(rand(80) + 20); // prevent cycling advance->engage->advance->...
			.AddCommand(true, "advance", pt);
			.AddCommand(true, "engage");
			if(.HasSpecial(26) ) {
				.SetVisible(true);
			}
			return;
		}
	} 
	
	//pr("advance: no target in sight - returning to source point!");
	if (.Goto(pt, 0, 2000, true, 0)) return;
	
}
