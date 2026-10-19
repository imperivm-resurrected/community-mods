// void, Obj me, Obj u

Unit this;
ObjList enemies;
Building b;
ObjList olBall;

this = me.AsUnit();
b = u.AsBuilding;

if (!.IsValid()) return;
if (!u.IsValid()) return;
if( (u.IsEnemy(this) == false && .player() != u.player()) || (u.IsHeirOf("Catapult") && u.IsEnemy(this) == false) || (u.IsHeirOf("RamUnit") && u.IsEnemy(this) == false) )
{
	return;
}

if (b.IsHeirOf("BaseVillage") && !b.IsEnemy(this)) return;
if (b.IsHeirOf("BaseHouse") && !b.IsEnemy(this)) return;

if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command
	.SetParryMode(false);
 
if(.HasSpecial(26) ) {
	.SetVisible(true);
}

//.pr("unit::attack: attacking particular enemy");

if( u.AsBuilding.IsValid ) {
	Sleep(rand(400) + 200);
	if (!u.IsValid()) return; // buildings also can die (catapults)
}


if(u.IsValid() == true)
{
	if(u.IsHeirOf("Hero") == true && u.AsHero().army().count() >= 5)
	{
		return;
	}
}

if(.IsEnemy(u) || u.AsBuilding.IsValid)
{
	while(u.IsAlive() && .IsValidTarget(u))
	{
		if(!.IsEnemy(u))
			return;
		if(!.IsEnemy(u.AsBuilding))
			return;
		//.pr("unit::attack: going to enemy");
		if(.GotoAttack(u, 5000, true, 2500))
		{
			//pr("unit::attack: fighting");
			while(.Attack(u)){
                        	if(.IsHeirOf("ShipBattle")){
                                	if(.stamina >= 1)
                                        	.SetStamina(.stamina - 1);
                                                        
                                        if(.stamina <= 0)
                                        	Sleep(10000);
                                }
                                if(.IsRanged){
                                	olBall = Intersect(ObjsInCircle(.pos, 40, "Military"), ClassPlayerObjs("Military", .player)).GetObjList; 
	                                if(olBall.count >= 2){
	                                        Sleep(olBall.count*1000); 
	                                }
                                } 
                        }
		}
	} 
}
.AddCommand(true, "engage");