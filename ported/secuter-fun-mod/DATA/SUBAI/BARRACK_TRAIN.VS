// void, Obj This

Unit newunit;
Barrack this;
point ptExit, ptEnter;
int perc, level;
Query qEnemies;

str carCmdParam, cdrCmdParam; 

carCmdParam = ParseStr(cmdparam, cdrCmdParam); 

this = This.AsBarrack();
qEnemies = Intersect(ObjsInSight(.settlement.GetCentralBuilding(),"Object"),EnemyObjs(.player(),"Object"));

perc = 100 - EnvReadInt(.settlement, "BarrackTrainTimeDecrease");
.Progress((.cmddelay * perc) / 100);

// Create unit
ptExit = .GetExitPoint(.settlement.GetCentralBuilding.pos, false);
if (ptExit.x==-1 && ptExit.y==-1) {
	newunit = Place(carCmdParam, Point(0,0), this.player);
	.settlement.AddUnit(newunit);
} else {
	newunit = Place(carCmdParam, ptExit, this.player);
	if (qEnemies.IsEmpty())
		newunit.SetCommand("enter", .settlement.GetCentralBuilding);
	else
		newunit.SetCommand("advanceenter", .settlement.GetCentralBuilding);
}

// Set level
level = 1;
if( GetClassRace(carCmdParam) == Carthage ) {
	if (!newunit.IsHeirOf("BaseMage"))
	  {	
		if( EnvReadString(.settlement, "Shared Strength") == "researched" ) {
			int nThisClass;
			nThisClass = Count(.player, carCmdParam);
			if( nThisClass > 12 )
				level = 6;
		}
		if( EnvReadString(.settlement, "Shared Triumph") == "researched" ) {
			int nThisClass;
			nThisClass = Count(.player, carCmdParam);
			if( nThisClass > 24 )
				level = 12;
		}
	  }
}
{
    int l2;
    l2 = EnvReadInt(.settlement, "levels/" + carCmdParam);
    if (l2 > level) level = l2;
}

// standartization
{
	if (!newunit.IsHeirOf("BaseMage") && !newunit.IsHeirOf("Hero"))
	  {	
		int l2;
		l2 = EnvReadInt(.player, "standard_spawn_level");
		if (l2 > level) level = l2;
      }
}

// Tribuni potenziati
if (EnvReadString(.player, "Tribune Swords") == "researched" && newunit.class == "RTribune")
	newunit.AddBonus(10,0,0,0,0);

//Olympic Games
{
	if (!newunit.IsHeirOf("BaseMage") && EnvReadString(.settlement,"Olympic Games")=="researched"){
		if(level<5){	
			level=5;
		}
	}
}

newunit.SetLevel(level);
if (!newunit.IsHeirOf("BaseMage") && !newunit.IsHeirOf("Hero"))
  {	
	if (EnvReadInt(.settlement, "items/Bear teeth amulet") == 1)
		newunit.AddItem("Bear teeth amulet");
	if (EnvReadInt(.settlement, "items/Herb amulet of luck") == 1)
		newunit.AddItem("Herb amulet of luck");
	if (EnvReadInt(.settlement, "items/Belt of might") == 1)
		newunit.AddItem("Belt of might");
	if (EnvReadInt(.settlement, "items/God's Gift") == 1)
		newunit.AddItem("God's Gift");
	if (EnvReadInt(.settlement, "items/Veteran Guild") == 1)
		newunit.AddItem("Veteran Guild");
	if (EnvReadInt(.settlement, "skills/Revenge") ==  1 && !newunit.IsHeirOf("CNoble"))
		newunit.SetSpecial(23, true);
  }