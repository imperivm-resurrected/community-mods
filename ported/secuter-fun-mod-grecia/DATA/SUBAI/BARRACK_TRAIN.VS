// void, Obj This
Unit newunit;
Barrack this;
point ptExit, ptEnter, mo;
int perc, level;
Query qEnemies;
str carCmdParam, cdrCmdParam; 
carCmdParam = ParseStr(cmdparam, cdrCmdParam); 
// I comandi esclusivi Old School antepongono al parametro reale
// "ReqModeImp2, , ,". Il verifier lo rimuoveva, ma l'esecutore tentava poi
// di creare un'unita' chiamata ReqModeImp2.
if (carCmdParam == "ReqModeImp2")
{
	ParseStr(cdrCmdParam, cdrCmdParam);
	ParseStr(cdrCmdParam, cdrCmdParam);
	carCmdParam = ParseStr(cdrCmdParam, cdrCmdParam);
}
this = This.AsBarrack();
qEnemies = Intersect(ObjsInSight(.settlement.GetCentralBuilding(),"Object"),EnemyObjs(.player(),"Object"));
perc = 100 - EnvReadInt(.settlement, "BarrackTrainTimeDecrease");
// Mobilitazione Numida: Fante Numida, Schermagliatore Numida e Lanciere
// libico si addestrano molto piu' in fretta
if (EnvReadString(.settlement, "Numidian Mobilization") == "researched")
	if (carCmdParam == "CLibyanFootman" || carCmdParam == "CHorseman" || carCmdParam == "CJavelinThrower")
		perc = perc / 2;
.Progress((.cmddelay * perc) / 100);
// Create unit
ptExit = .GetExitPoint(.settlement.GetCentralBuilding.pos, false);
if (ptExit.x==-1 && ptExit.y==-1) {
	newunit = Place(carCmdParam, Point(0,0), this.player);
	.settlement.AddUnit(newunit);
} else {
	newunit = Place(carCmdParam, ptExit, this.player);

	// Punto di raccolta (AsurMod): se impostato, l'unita' va li' e non al foro
	if (EnvReadInt(this, "Punto") == 0)
	{
		if (qEnemies.IsEmpty())
			newunit.SetCommand("enter", .settlement.GetCentralBuilding);
		else
			newunit.SetCommand("advanceenter", .settlement.GetCentralBuilding);
	}
	else
	{
		mo = Point(EnvReadInt(this, "X"), EnvReadInt(this, "Y"));
		if (qEnemies.IsEmpty())
			newunit.SetCommand("move", mo);
		else
			newunit.SetCommand("advance", mo);
	}
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
		// Veterani della Tribu' (Mauritana): oltre 99 di popolazione le
		// nuove unita' partono almeno al livello 6, oltre 125 almeno al 12
		if( EnvReadString(.settlement, "Tribal Veterans") == "researched" ) {
			if (.settlement.population > 125) {
				if (level < 12) level = 12;
			}
			else if (.settlement.population > 99) {
				if (level < 6) level = 6;
			}
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
