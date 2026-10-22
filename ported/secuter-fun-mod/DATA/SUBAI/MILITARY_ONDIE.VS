// void, Obj THIS

Unit this;
Unit u;
ObjList ol;
int exp, i;
int bestHeroLevel,level;

this = THIS.AsUnit;

//Mumification
if (THIS.AsHero)
  {
	bestHeroLevel = EnvReadInt(.player, "BestHeroLevel");
	level = THIS.AsHero.inherentlevel;
	if ( level > bestHeroLevel)
	{
		EnvWriteInt(.player, "BestHeroLevel", level);
	}
  }

//Warior Tales
exp = 1; // level to add
if(EnvReadString(.player, "Warrior Tales") == "researched")
{
ol = ObjsInCircle(.pos, .sight, "Military").GetObjList();
for(i = 0; i < ol.count; i += 1) {
	u = ol[i].AsUnit();
	if (!u.IsValid()) continue;
	if (.IsEnemy(u)) continue;
	if (u.AsHero().IsValid())continue;
	if (.race==Gaul) continue;
	u.SetLevel(u.inherentlevel + exp);
	break;
}
}

//Ghost altar
if(EnvReadInt("/StonehengeGhost"))
if(!.InHolder)
{
	u = Place("GGhost", .pos, .player);
	u.SetStamina(5);
	u.SetLevel(.level);
	u.SetCommand("spawn");
	SwapSelectedObj(this, u);
}
