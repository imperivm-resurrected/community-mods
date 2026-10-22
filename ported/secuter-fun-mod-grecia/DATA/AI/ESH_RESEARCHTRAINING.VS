// void, Settlement set

StrArray temRes;
int AIPlayer, nRace;
str strTech = "", strTech2 = "";
int nMaxLevelTraining;

// Nuove ricerche nel tempio
temRes[0]="Canto di guerra";
temRes[1]="Protezione di Nettuno";
temRes[2]="Disidratazione";
temRes[3]="Azzera difesa";
if (GetConst("GreekMod")) temRes[4]="Favore di Zeus";
else temRes[4]=temRes[1];
temRes[5]="Vento del Nord";
temRes[6]="Sciame di locuste";
temRes[7]="Saggezza degli antenati";

AIPlayer = set.player;
nRace = set.GetCentralBuilding.race;
nMaxLevelTraining = EnvReadInt(AIPlayer, "maxtrainlevel");

/// take care! some of the upgrades are per stronghold...other per player!

if (nRace == Gaul)
{
	strTech = "Fights";
	if (IsResearched(set, strTech))
	{
		if (nMaxLevelTraining < 12)
		{
			if (nMaxLevelTraining < 4)
				strTech = "Gaul Training 1";
			else if (nMaxLevelTraining < 8)
				strTech = "Gaul Training 2";
			else
				strTech = "Gaul Training 3";
		}
		else
		{
			strTech = "Warrior Tales";
			if (IsResearched(AIPlayer, strTech))
			{
				strTech = "Gambler's Test";
				if (IsResearched(AIPlayer, strTech))
				{
					strTech = "Nordic trade routes";
					if (IsResearched(set, strTech))
					{
						strTech = "Belts of Might";
						if (IsResearched(set, strTech))
						{
							strTech = "Razzia";
							if (IsResearched(set, strTech))
							{
								strTech = "Torneo di Fand";
								if (IsResearched(set, strTech))
								{
									strTech = "Campione di Fand";
									if (GetGroupSize("Player"+AIPlayer+"GTridentHero") > 0)
										strTech = "";
								}
							}
						}
					}
				}
			}	
		}	
	}
	else if (EnvReadInt(AIPlayer, "ModeOldSchoolCostsV2") == 1)
		strTech = "Fights Imp2";
	if (EnvReadInt(AIPlayer, "ModeOldSchoolCostsV2") == 1)
	{
		if (strTech == "Gaul Training 1") strTech = "Gaul Training 1 Imp2 Cost";
		else if (strTech == "Gaul Training 2") strTech = "Gaul Training 2 Imp2 Cost";
		else if (strTech == "Gaul Training 3") strTech = "Gaul Training 3 Imp2 Cost";
		else if (strTech == "Warrior Tales" || strTech == "Druidic herbs") strTech = "";
	}
}

if( (nRace == RepublicanRome) && (EnvReadString(set, "ChooseRepublicanRome") == "researched") )
{
	strTech = "RGladiator Shows";
	if (IsResearched(set, strTech))
	{
		if (nMaxLevelTraining < 8)
		{
			if (IsResearched(set, strTech))
				if (nMaxLevelTraining < 4)
					strTech = "Rome Training 1";
				else
					strTech = "Rome Training 2";
		
		}
		else 
		{
			if (IsResearched(set, "Roman Full Armor") && !IsResearched(AIPlayer, "Tribune Swords"))
				strTech = "Roman Tribune Swords";
			else
				{
				strTech = "Veteran Offence";
					if (IsResearched(AIPlayer, strTech))
				
				strTech = "Veteran Offence";
				if (IsResearched(AIPlayer, strTech))
				{
					strTech = "Veteran Defence";
					if (IsResearched(AIPlayer, strTech))
					{
						strTech = "Veteran Health";
						if (IsResearched(AIPlayer, strTech))
						{
							strTech = "Trionfo dell'Imperatore";
							if (IsResearched(set, strTech))
							{
								strTech = "Recluta Imperatore";
								if (GetGroupSize("Player"+AIPlayer+"RChariotHero") > 0)
								{
									strTech = "Roman Chariot Training";
									if (IsResearched(set, strTech))
										strTech = "";
								}
							}
						}
					}
				}
			}	
		}
	}
}

if( (nRace == RepublicanRome) && (EnvReadString(set, "ChooseImperialRome") == "researched") )
{
	strTech = "RGladiator Shows2";
	if (IsResearched(set, strTech))	
	{
		strTech = "Standartization I";
		if (IsResearched(set, strTech))	
		{
			strTech = "Standartization II";
			if (IsResearched(set, strTech))	
			{
				strTech = "Flexibility";
				if (IsResearched(set, strTech))
				{
					strTech = "Trionfo dell'Imperatore";
					if (IsResearched(set, strTech))
					{
						strTech = "Recluta Imperatore";
						if (GetGroupSize("Player"+AIPlayer+"RChariotHero") > 0)
							strTech = "";
					}
				}
			}
		}
	}
}

if( (nRace == RepublicanRome) && (EnvReadString(set, "ChoosePunicRome") == "researched") )
{
	strTech = "RGladiator Shows2";
	if (IsResearched(set, strTech))
	{
			strTech = "Rome Training 1";
		if (IsResearched(set, strTech))	
		{
			strTech = "Rome Training 2";
			if (IsResearched(set, strTech))	
			{
				strTech = "Veteran's guild";
				if (IsResearched(set, strTech))
					
			    {
				strTech = "Call Socii";
				if (IsResearched(set, strTech))
					strTech = "";
			    }
			}
		}
	}
}
// paralel research
if (nRace == RepublicanRome)
if (strTech == "" || set.gold > AIVar(AIPlayer, AIV_SquanderGoldAmount))
if (!IsResearched(set, "Import horses"))
{
	strTech2 = "Free Wine";
	if (IsResearched(set, strTech2))
		strTech2 = "Import horses";
	if (strTech == "") strTech = strTech2;
	else 
	{
		EnvWriteString(set, "strTech", strTech2);
		set.AIRun("ESH_NeedTech.vs");
	}
}

if (nRace == Carthage)
{
	strTech = "People's Assembly";
	if (IsResearched(set, strTech)) {
		strTech = "CHero level 8";
		if (IsResearched(set, strTech)) {
			strTech = "Shared Strength";
			if (IsResearched(set, strTech)) {
				strTech = "Shared Triumph";
				if (IsResearched(set, strTech)) {
					strTech = "Dark Rituals";
					if (IsResearched(set, strTech)) {
						strTech = "Revenge";
						if (IsResearched(set, strTech)) {
							strTech = "Assemblea dei mahout";
							if (IsResearched(set, strTech)) {
								strTech = "Train War Elephant Lord";
								if (GetGroupSize("Player"+AIPlayer+"CElephantHero") > 0)
									strTech = "";
							}
						}
					}
				}
			}
		}
	}
}

if (nRace == Iberia)
{
	strTech = "Warriors' Wisdom";
	if (IsResearched(AIPlayer, strTech)) 
	{
		strTech = "Ancestral Knowledge";
		if (IsResearched(set, strTech)) 
		{
			strTech = "";
			if (set.gold >= AIVar(AIPlayer, AIV_ExcessGold))
			if (!IsResearched(set, "Nobility"))
				strTech = "Nobility"; // arena also could research this
			if (strTech == "")
			{
				strTech = "Adunata dei guerriglieri";
				if (IsResearched(set, strTech))
				{
					strTech = "Capoclan dei guerriglieri";
					if (GetGroupSize("Player"+AIPlayer+"IMountaineerHero") > 0)
						strTech = "";
				}
			}
		} else {
			strTech2 = "Code of Valor";
			if (!IsResearched(set, strTech2))
				strTech = strTech2;
		}
	}
	else
	{
		strTech2 = "Tournaments";
		if (!IsResearched(set, strTech2))
			strTech = strTech2;
		else 
		{
			strTech2 = "Heroes' Wisdom";
			if (!IsResearched(AIPlayer, strTech2))
				strTech = strTech2;
		}
	}
}

if (nRace == Britain)
{
	strTech = "Britain Fights";
	if (IsResearched(set, strTech))
	{
		strTech = "Tribal Unification";
		if (IsResearched(AIPlayer, strTech))
		{
			strTech = "Noble Offence";
			if (IsResearched(AIPlayer, strTech))
			{
				strTech = "Noble Defence";		
				if (IsResearched(AIPlayer, strTech))
					strTech = "";
			}
		}		
	}
	if (strTech == "") // Gamblings from Tavern
	{
		strTech = "Gambling";
		if (IsResearched(set, strTech))
		{
			strTech = "Gambler's Day";
			if (IsResearched(AIPlayer, strTech))
			{
				strTech = "Gambler's Test";
				if (IsResearched(AIPlayer, strTech))
				{
					strTech = "Gambler's Luck";
					if (IsResearched(AIPlayer, strTech))
						strTech = "";
				}
			}
		}
	}
	if (strTech=="") // Recluta generale
	{
		strTech = "Assemblea dei capi normanni";
		if (IsResearched(set, strTech))
		{
			strTech = "Grande capo normanno";
			if (GetGroupSize("Player"+AIPlayer+"BVikingHero") > 0)
				strTech = "";
		}
	}
}

if (nRace == Germany)
{
	strTech = "TFights";
	if (IsResearched(set, strTech))
	{
		strTech = "Learning";
		if (IsResearched(AIPlayer, strTech))
		{
			strTech = "Attack focus";		
			if (IsResearched(AIPlayer, strTech))
				strTech = "Sovranit&#224; delle valchirie";
				if (IsResearched(set, strTech))
				{
					strTech = "Regina delle valchirie";
					if (GetGroupSize("Player"+AIPlayer+"TValkyrieHero") > 0)
						strTech = "";
				}
		}		
	}
}

if(nRace == Greece)
{
	strTech = "Olympic Games";
	if(IsResearched(set, strTech) == true)
	{
		/* SCELTA DEL TIPO DI GOVERNO: */
		if(EnvReadInt(set, "AI_ChooseGreekGovernment") == 0)
		{
			if(rand(2) == 0) 
			{
				strTech = "Democracy";
			}	//Fine if.	
			else
			{
				strTech = "Oligarchy";
			}	//Fine else.	
			
			EnvWriteInt(set, "AI_ChooseGreekGovernment", 1);
		}	//Fine if.
		/* FINE SCELTA DEL TIPO DI GOVERNO. */
		else
		{
			if(rand(2) == 0)
			{
				if(nMaxLevelTraining < 10)
				{
					strTech = "Spartan Training";
				}	//Fine else if.
				else
				{
					strTech = "Charm of Athena";
					if(IsResearched(AIPlayer, strTech) == true)
					{
						strTech = "Charm of Aegle";
						if (IsResearched(AIPlayer, strTech) == true)
						{
							strTech = "";
						}	//Fine if.
					}	//Fine if.	
				}	//Fine else.
			}	//Fine if.
			else
			{
				if(set.gold > 2500 && EnvReadInt(AIPlayer, "MaxMyrmidons") < GetConst("MaxMyrmidonsValue"))
				{
					strTech = "Forge Elite Equipment";
				}	//Fine if.
			}	//Fine else.
		}	//Fine else.
	}	//Fine if.
}	//Fine if.

if (nRace == Egypt)
{
	strTech = "Cult of Horus";
	if (IsResearched(set, strTech))
	{
		strTech = "Light of Horus I";
		if (IsResearched(set, strTech))
		{	
			strTech = "Light of Horus II";		
			if (IsResearched(set, strTech))
			{
				strTech = "Light of Horus III";		
				if (IsResearched(set, strTech))
					strTech = "";					
		  }		
		}	
	}
	if (strTech == "")
	{
		strTech = "Cult of Anubis";
		if (IsResearched(set, strTech))
		{
			strTech = "Path of the dead I";
			if (IsResearched(AIPlayer, strTech))
			{	
				strTech = "Path of the dead II";		
				if (IsResearched(AIPlayer, strTech))
				{
					strTech = "Path of the dead III";		
					if (IsResearched(AIPlayer, strTech))
						strTech = "";					
			  }		
			}	
		}
	}	
	if (strTech == "")
	{
		strTech = "Statue of Isis, mother of Anubis";
		if (IsResearched(AIPlayer, strTech))
		{
			strTech = "Statue of Osiris, father of Horus";
			if (IsResearched(AIPlayer, strTech))
			{
				strTech = "Statue of Amon-Ra";
				if (IsResearched(AIPlayer, strTech))
				strTech = "";	
			}
		}
	}
	
	if (strTech == "") // Recluta il faraone
	{
		strTech = "Culto del faraone";
		if (IsResearched(set, strTech))
		{
			strTech = "Recluta Faraone";
			if (GetGroupSize("Player"+AIPlayer+"EChariotHero") > 0)
			{
				strTech = "Ruote a raggi osiris";
				if (IsResearched(set, strTech))
					strTech = "";	
			}
		}
	}
}

if (strTech == "")
	EnvWriteInt(set, "ResearchTrainingComplete", 1);
else
	EnvWriteInt(set, "ResearchTrainingComplete", 0);

if( (nRace == RepublicanRome) && (EnvReadString(set, "ChooseImperialRome") == "researched" || EnvReadString(set, "ChoosePunicRome") == "researched") )
if (strTech == "") 
if (!IsResearched(set, "Military Academy"))
if ((rand(10) == 0 && nMaxLevelTraining >= 8) || set.gold >= AIVar(AIPlayer, AIV_ExcessGold))
	strTech = "Military Academy";
	
if (nRace == Carthage)
if (strTech == "") 
if (rand(30) == 0)
if (!IsResearched(set, "Ferocity"))
	strTech = "Ferocity";
else if (!IsResearched(set, "CGrainTrade"))
	strTech = "CGrainTrade";

if (nRace == Egypt)
if (strTech == "") 
if (rand(20) <= (EnvReadInt(AIPlayer, "BestHeroLevel") / 5) || set.gold > AIVar(AIPlayer, AIV_SquanderGoldAmount))
{
	if (!IsResearched(set, "Mumification"))
		strTech = "Mumification";
}

// Ricerche aggiuntive nel tempio
if (strTech == "")
if (rand(30) == 0)
if (!IsResearched(set, temRes[nRace]))
	strTech = temRes[nRace];

if (strTech == "")
{
	if (IsResearched(set, "Strenghten Stronghold Defences II") && set.gold > AIVar(AIPlayer, AIV_SquanderGoldAmount))
		strTech = "Strenghten Stronghold Defences III";
}
	
if (nRace == Egypt)
if (strTech == "") 
if (rand(20) == 0 || set.gold > AIVar(AIPlayer, AIV_SquanderGoldAmount))
{
	ObjList l;
	int i,j, nCount;
	Unit u;
	Building b;
	StrArray asItems, asTech;
	
	asItems[0] = "Damage charm";
	asItems[1] = "Armor charm";
	asItems[2] = "Health charm";
	asItems[3] = "Knowledge charm";

	asTech[0] = "Charm of Seth";
	asTech[1] = "Charm of Thoth";
	asTech[2] = "Charm of Ra";
	asTech[3] = "Charm of Isis";
	
	j = rand(4);
	b = set.GetCentralBuilding;
	l = set.ObjectsAround("Military");
	nCount = 0;
	for (i = l.count; i > 0;) 
	{
		i -= 1;
		u = l[i].AsUnit();
		if (b.IsEnemy(u)) continue;
		if (u.AsHero().IsValid) continue;
		if (u.IsSentry) continue;
		if (u.HasItem(asItems[j])) continue;
		nCount += 1;
	}
	
	if (nCount > 30)
		strTech = asTech[j];
}

/// test whether it happens!!!
if (set.gold > 8000)
if (strTech == "") 
{
	ObjList l;
	Unit u;
	Building b;
	int i, nCount, nMinToRes = 40;

	b = set.GetCentralBuilding;
	l = set.ObjectsAround("Unit");
	nCount = 0;
	for (i = l.count; i > 0;)
	{
		i -= 1;
		u = l[i].AsUnit();
		if (b.IsEnemy(u)) continue;
		if (u.IsSentry) continue;
		if (u.IsPeaceful) continue;
		if (u.inherentlevel >= 10) continue;
		nCount += 1;
		if (nCount > nMinToRes) 
		{
			strTech = "townhall_military_training";
			break;
		}
	}
}

if (strTech != "")
{
	EnvWriteString(set, "strTech", strTech);
	set.AIRun("ESH_NeedTech.vs");
	return;
}
