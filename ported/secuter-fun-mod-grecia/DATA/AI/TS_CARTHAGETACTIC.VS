// void, Settlement set
int  AIPlayer;
int openingDeadline;
int  i;

int  nDonateFood, nDonateGold, nDonatePop, nBuildArmy, nResearch; // Variables for controlling AI
Hero hero;
IntArray aSkills, aSkillLevels;
int heroScId;
bool bHeroSc = false;

if (EnvReadInt(set, "CarthageTactic") == 1) 
	return;

if (EnvReadInt(set,"StopTacticScript") == 1)
	return;

AIPlayer = set.player;
openingDeadline = GetTime() + 180000;
// Read variables
nDonateFood = AIVar(AIPlayer, AIV_DonateFood);
nDonateGold = AIVar(AIPlayer, AIV_DonateGold);
nDonatePop  = AIVar(AIPlayer, AIV_DonatePop);
nBuildArmy  = AIVar(AIPlayer, AIV_BuildArmy);
nResearch   = AIVar(AIPlayer, AIV_Research);
// Set new values to disable 
//SetAIVar(AIPlayer, AIV_DonateFood, 0);
SetAIVar(AIPlayer, AIV_DonateGold, 0);
SetAIVar(AIPlayer, AIV_DonatePop,  0);
// Mantieni attive produzione e ricerca generali durante l'apertura.

// Set skills
aSkills[0] = hsWisdom;    aSkillLevels[0] = 10;
aSkills[1] = hsFrenzy;    aSkillLevels[1] = 10;

// L'eroe ha priorita' sulle prime pattuglie: tenta per circa 30 secondi
// prima di iniziare la restante apertura numida.
{
	int heroAttempts = 0;
	while (!hero.IsValid && heroAttempts < 12) {
		hero = set.TSRecruitHero();
		heroAttempts += 1;
		if (!hero.IsValid)
			Sleep(2500);
	}
}

// hire hero & barracks 1 & Free trade & Slavery
{
	int nSlavery = 0;
	bool bFreeTrade = false, bBarrack1 = false;
	while (!hero.IsValid || !bFreeTrade || nSlavery < 1 || !bBarrack1)
	{
		if (!hero.IsValid())
			hero = set.TSRecruitHero();
		else if(!bHeroSc)
		{
			ObjList ol;
			Obj oDummy;
			ol.Add(hero);
			hero.KillCommand();
			hero.TSAdvHeroSkills(aSkills, aSkillLevels);	
			heroScId = AIRun("TS_AttackAtWill.vs", set, ol,oDummy, 0);	
			bHeroSc = true;					
		}	
		if (!bFreeTrade && set.gold>3000)
			bFreeTrade = set.TSResearch("Free Trade");
	
		if (set.population>=60 && nSlavery < 1)
		{
			set.TSResearch("Slavery");
			nSlavery+=1;
		}
		else if (set.max_population < 60)
			nSlavery = 1;

		if (!bBarrack1)
			bBarrack1 = set.TSResearch("Barrack Level 1");

		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// stop script
			if (bHeroSc)
				AIBreakScript(heroScId);
			// set ai flag
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			// set vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}

		// A faction opening may hold troops for at most three minutes.
		if (GetTime() >= openingDeadline || set.player != AIPlayer || EnvReadInt(set, "StopTacticScript") == 1) {
		    if (heroScId > 0) AIBreakScript(heroScId);
		    if (hero.IsValid) hero.SetNoAIFlag(false);
		    SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold);
		    SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood);
		    SetAIVar(AIPlayer, AIV_DonatePop, nDonatePop);
		    SetAIVar(AIPlayer, AIV_BuildArmy, nBuildArmy);
		    SetAIVar(AIPlayer, AIV_Research, nResearch);
		    EnvWriteInt(set, "OpeningReleased", 1);
		    return;
		}
		Sleep(2614 + rand(10)*100);
	}
}

if (hero.IsValid())
if(!bHeroSc)
{
	ObjList ol;
	Obj oDummy;
	ol.Add(hero);
	hero.KillCommand();
	hero.TSAdvHeroSkills(aSkills, aSkillLevels);	
	heroScId = AIRun("TS_AttackAtWill.vs", set, ol,oDummy, 0);	
	bHeroSc = true;					
}	
else
	hero.TSAdvHeroSkills(aSkills, aSkillLevels);	


// peoples assembly & Spoils of war & mercenary pact & barracks 2
{
	bool bSpoils = false;
	bool bPeoplesAssembly = false;
	bool bCHeroLevel8 = false;
	while (!bPeoplesAssembly || !bSpoils || !bCHeroLevel8)
	{
		if (!bPeoplesAssembly)
			bPeoplesAssembly = set.TSResearch("People's Assembly");
		if (bPeoplesAssembly && !bSpoils)
			bSpoils = set.TSResearch("Spoils of war");
		if (bPeoplesAssembly && bSpoils && !bCHeroLevel8)
			bCHeroLevel8 = set.TSResearch("CHero level 8");

		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// stop script
			if (bHeroSc)
				AIBreakScript(heroScId);
			// set ai flag
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			// set vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}
		// A faction opening may hold troops for at most three minutes.
		if (GetTime() >= openingDeadline || set.player != AIPlayer || EnvReadInt(set, "StopTacticScript") == 1) {
		    if (heroScId > 0) AIBreakScript(heroScId);
		    if (hero.IsValid) hero.SetNoAIFlag(false);
		    SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold);
		    SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood);
		    SetAIVar(AIPlayer, AIV_DonatePop, nDonatePop);
		    SetAIVar(AIPlayer, AIV_BuildArmy, nBuildArmy);
		    SetAIVar(AIPlayer, AIV_Research, nResearch);
		    EnvWriteInt(set, "OpeningReleased", 1);
		    return;
		}
		Sleep(2728 + rand(10)*100);
	}	
}
if (hero.IsValid)
		hero.TSAdvHeroSkills(aSkills, aSkillLevels);	

// Give hero to AI
if (bHeroSc)
	AIBreakScript(heroScId);

if (hero.IsValid)
if (hero.IsAlive)
{
	hero.TSAdvHeroSkills(aSkills, aSkillLevels);	
	hero.SetCommand("enter", set.GetCentralBuilding() );
	hero.SetNoAIFlag(false);
}

SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value

EnvWriteInt(set, "CarthageTactic",1);
