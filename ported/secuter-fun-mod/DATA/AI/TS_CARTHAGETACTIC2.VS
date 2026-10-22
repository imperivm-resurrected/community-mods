// void, Settlement set
int  AIPlayer;
int  i;
ObjList olSpearmen,olNumidians,olJavelineers, olNobles;

int  nDonateFood, nDonateGold, nDonatePop, nBuildArmy, nResearch; // Variables for controlling AI
Hero hero;
IntArray aSkills, aSkillLevels;
bool bAssUnderFire;
int heroScId;
bool bHeroSc = false;

if (EnvReadInt(set, "CarthageTactic") == 1) 
	return;

if (EnvReadInt(set,"StopTacticScript") == 1)
	return;

AIPlayer = set.player;
// Read variables
nDonateFood = AIVar(AIPlayer, AIV_DonateFood);
nDonateGold = AIVar(AIPlayer, AIV_DonateGold);
nDonatePop  = AIVar(AIPlayer, AIV_DonatePop);
nBuildArmy  = AIVar(AIPlayer, AIV_BuildArmy);
nResearch   = AIVar(AIPlayer, AIV_Research);
// Set new values to disable 
//SetAIVar(AIPlayer, AIV_DonateFood, 0);
SetAIVar(AIPlayer, AIV_DonateGold, 0);
//SetAIVar(AIPlayer, AIV_DonatePop,  0);
SetAIVar(AIPlayer, AIV_BuildArmy,  0);
SetAIVar(AIPlayer, AIV_Research,   0);

// Set skills
aSkills[0] = hsWisdom;    aSkillLevels[0] = 10;
aSkills[1] = hsFrenzy;    aSkillLevels[1] = 10;

// hire hero & forge pikes & barrack level 1
{
	bool bBarrack1 = false;
	bool bFPikes = false;
	while (!hero.IsValid || !bFPikes ||!bBarrack1 )
	{
		if (!hero.IsValid())
			hero = set.TSRecruitHero();

		if (!bFPikes)
			bFPikes = set.TSResearch("Forge pikes");
		
		if (!bBarrack1)
			bBarrack1 = set.TSResearch("Barrack Level 1");
			
		Sleep(10456 + rand(10)*100);
	}
}
if (EnvReadInt(set,"StopTacticScript") == 1)
{
	// give army to AI
	if (hero.IsValid)
		hero.SetNoAIFlag(false);
	// set AI vars
	SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
	SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
	SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
	SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
	SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
	return;
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
// train 10 Numidian rider

{
	int nNumidians = 10;
	while (olNumidians.count<nNumidians)
	{
		int nCount;
		nCount = nNumidians- olNumidians.count;
		olNumidians.AddList(set.TSRecruitArmy("CNumidianRider",nCount));

		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// Stop cript
			if (bHeroSc)
				AIBreakScript(heroScId);
			// give army to AI
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			olNumidians.ClearDead();
			SetNoAIFlag(olNumidians,false);
			// set AI vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}

		Sleep(8456 + rand(10)*100);
	}
}
if (hero.IsValid())
if (hero.IsAlive)
{
	ObjList ol;
	Obj oDummy;

	if (bHeroSc)
	  AIBreakScript(heroScId);
	hero.TSAdvHeroSkills(aSkills, aSkillLevels);	
	hero.SetCommand("enter", set.GetCentralBuilding() );
	olNumidians.SetCommand("attach", hero);
	ol.Add(hero);
	heroScId = AIRun("TS_AttackAtWill.vs", set, ol,oDummy, 0);
}

// train 20 more Numidian rider
{
	int nNumidians = 30;
	while (olNumidians.count<nNumidians)
	{
		int nCount;
		nCount = nNumidians- olNumidians.count;
		olNumidians.AddList(set.TSRecruitArmy("CNumidianRider",nCount));

		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// Stop cript
			if (bHeroSc)
				AIBreakScript(heroScId);
			// give army to AI
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			olNumidians.ClearDead();
			SetNoAIFlag(olNumidians,false);
			// set AI vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}

		Sleep(7456 + rand(10)*100);
	}
}

if (hero.IsValid())
if (hero.IsAlive)
	hero.TSAdvHeroSkills(aSkills, aSkillLevels);	

// Spoils of war & peoples assembly
{
	bool bSpoilsOfWar = false;
	bool bPeoplesAssembly = false;
	bool bCHeroLevel8 = false;
	while (!bSpoilsOfWar || !bPeoplesAssembly || !bCHeroLevel8))
	{
		if (!bPeoplesAssembly)
			bPeoplesAssembly = set.TSResearch("People's Assembly");
		if (bPeoplesAssembly && !bSpoils)
			bSpoils = set.TSResearch("Spoils of war");
		if (bPeoplesAssembly && bSpoils && !bCHeroLevel8)
			bCHeroLevel8 = set.TSResearch("CHero level 8");
		
		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// Stop cript
			if (bHeroSc)
				AIBreakScript(heroScId);
			// give army to AI
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			olNumidians.ClearDead();
			SetNoAIFlag(olNumidians,false);
			// set AI vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}

		Sleep(12456 + rand(10)*100);
	}	
}

if (hero.IsValid)
		hero.TSAdvHeroSkills(aSkills, aSkillLevels);	

set.TSResearch("StopSpecialization");

// forge javelins
{
	bool bFJavelins = false;
	while (!bFJavelins)
	{
		if (!bFJavelins)
			bFJavelins = set.TSResearch("Forge javelins");

		Sleep(4456 + rand(1530));
	}	
}
if (EnvReadInt(set,"StopTacticScript") == 1)
{
	// Stop cript
	if (bHeroSc)
		AIBreakScript(heroScId);
	// give army to AI
	if (hero.IsValid)
		hero.SetNoAIFlag(false);
	olNumidians.ClearDead();
	SetNoAIFlag(olNumidians,false);
	// set AI vars
	SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
	SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
	SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
	SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
	SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
	return;
}


if (hero.IsValid)
		hero.TSAdvHeroSkills(aSkills, aSkillLevels);	
// 50 javelins
{
	int nJavelins = 50;
	while (olJavelineers.count<nJavelins)
	{
		int nCount;
		if (olJavelineers.count<nJavelins)
		{
			nCount = nJavelins - olJavelineers.count;
			olJavelineers.AddList(set.TSRecruitArmy("CJavelinThrower",nCount));
		}
		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// Stop cript
			if (bHeroSc)
				AIBreakScript(heroScId);
			// give army to AI
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			olNumidians.ClearDead();
			SetNoAIFlag(olNumidians,false);
			olJavelineers.ClearDead();
			SetNoAIFlag(olJavelineers,false);
			// set AI vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}

		Sleep(13456 + rand(10)*100);
	}
}

if (hero.IsValid)
		hero.TSAdvHeroSkills(aSkills, aSkillLevels);	

//dark ritual & sacred legion
{
	bool bDarkRitual = false;
	bool bSacredLegion = false;
	while (!bDarkRitual ||!bSacredLegion)
	{
		if (!bDarkRitual)
			bDarkRitual = set.TSResearch("Dark Rituals");
		if (!bSacredLegion)
			bSacredLegion = set.TSResearch("Sacred Legion");

		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// Stop cript
			if (bHeroSc)
				AIBreakScript(heroScId);
			// give army to AI
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			olNumidians.ClearDead();
			SetNoAIFlag(olNumidians,false);
			olJavelineers.ClearDead();
			SetNoAIFlag(olJavelineers,false);
			// set AI vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}

		Sleep(11456 + rand(10)*100);
	}	
}
if (hero.IsValid)
		hero.TSAdvHeroSkills(aSkills, aSkillLevels);	

/*// 25 nobles
{
	int nNobles = 25;
	while (olNobles.count<nNobles)
	{
		int nCount;
		if (olNobles.count<nNobles)
		{
			nCount = nNobles - olNobles.count;
			olNobles.AddList(set.TSArmyRecruit("CNoble",nCount));
		}
		Sleep(2456 + rand(30));
	}
}*/

// Give army to AI
if (bHeroSc)
	AIBreakScript(heroScId);

if (hero.IsValid)
if (hero.IsAlive)
{
	hero.TSAdvHeroSkills(aSkills, aSkillLevels);	
	hero.SetCommand("enter", set.GetCentralBuilding() );
	hero.SetNoAIFlag(false);
}

olNumidians.ClearDead();
olJavelineers.ClearDead();
olNobles.ClearDead();
SetNoAIFlag(olNumidians,false);
SetNoAIFlag(olJavelineers,false);
SetNoAIFlag(olNobles,false);

SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value

EnvWriteInt(set, "CarthageTactic",1);
