// void, Obj This, bool bCanceled
// cmdparam is like this ReqSet, <research>, ReqPlr, <research>, SetsPlr, <env>, <value>, SetsSet, <env>, <value>, NamePlr, <research>, NameSet, <research>

Building this;
str dest, name, token, value;
ObjList ol;
int i;

dest = cmdparam;
this = This.AsBuilding();

if (!GetResearchHack())
{
	//don't fuckup the queue if envoked by the research hack
	EnvWriteString(this, "researching", "no");
}

while(dest != "")
{
	token = ParseStr(dest, dest);
	if(token == "NamePlr")
	if(bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.player, name, "");
		if (name == "Tribute") {
			Building th;
			th = EnvReadObj(.player, "TributeBuilding");
			if (th.IsValid) {
				th.GlobalSpellStop();
			}
		}
		continue;
	} else
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.player, name, "researched");
		
		// Code of Valor implementation
		if (name == "Code of Valor") {
			ol = GetPlayerUnits(.player,"IEnchantress");
			for (i=0; i<ol.count; i+=1)
				{
					if (ol[i].IsValid())
						if (ol[i].IsAlive())
							{
								if (ol[i].AsUnit().inherentlevel < 8)
									ol[i].AsUnit().SetLevel(8);
							}
				}
			continue;
		}
		// Battle tactics implementation
		if (name == "Battle tactics") {
			int c;
			c = GetConst("BattleTacticsExpModifier");
			SetExperienceModifier(.player, c);
			continue;
		}
		// Heroes' Wisdom implementation
		if (name == "Heroes' Wisdom") {
			StartPlayerScript(.player, "data/subai/player_heroes_wisdom.vs");
			continue;
		}
		// Warriors' Wisdom implementation
		if (name == "Warriors' Wisdom") {
			StartPlayerScript(.player, "data/subai/player_warriors_wisdom.vs");
			continue;
		}
		// Nobility implementation
		if (name == "Nobility") {
			ol = GetPlayerUnits(.player,"Military");
		    for (i=0; i<ol.count; i+=1)
	 	      {
				if (ol[i].IsValid())
				  if (ol[i].IsAlive())
				    {
						if (ol[i].AsUnit().inherentlevel>=8 && ol[i].AsUnit().inherentlevel<=12)
					  	  ol[i].AsUnit().SetLevel(12);		
					} 
		      }
			continue;
		}
		// Supplies implementation
		if (name == "Supplies") {
			StartPlayerScript(.player, "data/subai/greek_supplies.vs");
			continue;
		}
		// Tribute implementation
		if (name == "Tribute") {
			Building bld;
			Settlement s;
			ObjList l;
			int i;
			int gametime;
			int time;
			int gold = 0;
			str times, values;
			
			times = GetConstStr("TributeTimes");
			values = GetConstStr("TributeGold");
			
			gametime = GetTime();
			
			while (times != "") {
				int old_gold;
				old_gold = gold;
				time = Str2Int(ParseStr(times, times)) * 60000;
				gold = Str2Int(ParseStr(values, values));
				if (gametime < time) {
					gold = old_gold;
					break;
				}
			}

			l = ClassPlayerObjs("Outpost", .player).GetObjList();
			for (i = l.count() - 1; i >= 0; i -= 1) 
			{
				bld = l[i].AsBuilding();
				if (bld.IsValid()) 
				{
					if(bld.IsHeirOf("GGuardPost") == true) continue;
					
					s = bld.settlement;
					if (s.IsValid()) 
					{
						s.SetGold(s.gold + gold);
						s.GoldConverted(gold);
					}
				}
			}
			continue;
		}
		if (name == "Gambler's Test") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Gambler's Luck") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Statue of Amon-Ra") {
			ObjList units;
			int k;
			units = GetPlayerUnits(.player, "Military");
			for (k = 0; k < units.count(); k += 1)
				units[k].AsUnit().RecalcBonuses();
			continue;
		}
		if (name == "Statue of Osiris") {
			InvalidateRegenConsts();
			continue;
		}
		if (name == "Statue of Isis") {
			InvalidateRegenConsts();
			continue;
		}
		if (name == "Attack focus") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Learning") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Ferocity") {
			InvalidateDamageFormulaParams();
			continue;
		}
		continue;
	}
	if(token == "NameSet")
	if(bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.settlement, name, "");
		continue;
	}  else
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.settlement, name, "researched");
		if(name == "Gambling")
		{	// Gambling implementation
			int CHANCE;
			CHANCE = GetConst("GamblingChance");
			if(rand(100) < CHANCE)
			{
				.settlement().SetFood(.settlement().food() + 2500); //Get 2500 of food.
				//.settlement.GoldConverted(5000);
			}
			ExploreCircle(.player(), .pos(), 4500); //Explore a large area around stronghold.
		}
		else if (name == "Fights" && .race==Germany) {// Fights, Germany implementation
			.settlement.SetFood(.settlement.food + 2000);
		}
		else if (name == "Grain Trade" && .race==Germany) {// Grain Trade - Germany implementation
			.settlement.SetFood(.settlement.food + 2000);
		}
		else if (name == "Food Tax") {// Food Tax implementation
			.settlement.SetFoodProduction(.settlement.FoodProduction+GetConst("StrongholdFoodProduction"));
		}
		else if (name == "Free Beer") {// Free Beer implementation
			.settlement.SetPopulation(.settlement.population + 20);
		}
		else if (name == "Free Trade") {// Free trade implementation
			.settlement.SetPopulation(.settlement.max_population);
		}
		else if (name == "Free Wine"){	// Buy map implementation - in Free Wine now
			ExploreCircle(.player, .pos, 4500);
		}
		else if (name == "Trade Routes") {// Trade Routes implementation
			int i;
			ObjList villages;
	
			villages=ClassPlayerObjs("BaseVillage",.player).GetObjList();
			for(i=0;i<villages.count;i=i+1){
				if(villages[i].AsBuilding().IsValid() && villages[i].AsBuilding().player==.player && !villages[i].AsBuilding().IsBroken()){
					villages[i].AsBuilding().settlement.SetFood(villages[i].AsBuilding().settlement.food+1000);
				}
			}
			continue;
		}
		else if (name == "Strengthen Stronghold Gates") {// Strengthen Stronghold Gates implementation
			int i;
			ObjList gates;
	
			gates=.settlement.ObjectsAround("Gate");
			for(i=0;i<gates.count;i=i+1){
				if(gates[i].AsBuilding().IsValid()){
					gates[i].AsBuilding().SetMaxHealth(gates[i].AsBuilding().maxhealth*3/2);
					if(!gates[i].AsGate().IsBroken)
						gates[i].AsBuilding().SetHealth(gates[i].AsBuilding().health+gates[i].AsBuilding().maxhealth/2);
				}
			}
			continue;
		}
		else if (name == "Slavery") {// Slavery implementation
             int SlaveryGold;
             SlaveryGold = GetConst("SlaveryGold");
			.settlement.SetGold(.settlement.gold + SlaveryGold);
			.settlement.GoldConverted(SlaveryGold);
			EnvWriteString(.settlement, name, "");//reenable research
		}
		else if (name == "Housing") {//Housing implementation
			.settlement.AddToMaxPopulation(20);
		}
		else if (name == "Free Drinks") {//Free Drink implementation
			.settlement.SetPopulation(.settlement.population + 20);
		}
		else if (name == "Mumification") {//Mumification implementation
								
            int bestlevel;
            bestlevel = EnvReadInt(.player, "BestHeroLevel");
			ol = GetPlayerUnits(.player, "Hero");
			for (i=0; i<ol.count;i+=1)
			  {
				if (ol[i].IsValid())
				  if (ol[i].AsHero().inherentlevel > bestlevel)
					bestlevel = ol[i].AsHero().inherentlevel;
			  }
			EnvWriteInt(.player, "BestHeroLevel", bestlevel);
		}
		else if (name == "CLibyanFootman") {//Conta le truppe cartaginesi scontate
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CJavelinThrower") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CBerberAssassin") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CMaceman") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CNumidianRider") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CNumidianRider") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "Mahout School") {
			EnvWriteInt(.player, "MaxElephants", EnvReadInt(.player, "MaxElephants") + 1);
		}
		continue;
	}
	if(token == "SetsPlr" && !bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.player, name, value);
		continue;
	}
	if(token == "SetsSet" && !bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.settlement, name, value);
		continue;
	}
}
