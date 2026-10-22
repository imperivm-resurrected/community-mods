// void, Settlement set
int  AIPlayer;
int  i;
ObjList olAssasin,olShamans,olJavelineers;

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
SetAIVar(AIPlayer, AIV_BuildArmy,  0);
SetAIVar(AIPlayer, AIV_Research,   0);

// Set skills
aSkills[0] = hsWisdom;    aSkillLevels[0] = 10;
aSkills[1] = hsFrenzy;    aSkillLevels[1] = 10;

// hire hero & research Free trade & Slavery
{
	int nSlavery = 0;
	bool bFreeTrade = false;
	while (!hero.IsValid || !bFreeTrade || nSlavery<1)
	{
		if (!hero.IsValid())
			hero = set.TSRecruitHero();
		else
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
		if (!bFreeTrade && set.gold>3000)
			bFreeTrade = set.TSResearch("Free Trade");
	
		if (set.population>60)
		{
			set.TSResearch("Slavery");
			nSlavery+=1;
		}

		Sleep(10456 + rand(10)*100);
	}
}
if (EnvReadInt(set,"StopTacticScript") == 1)
{
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

SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value

//Forge swords
{
	bool bFSwords = false;
	while (!bFSwords)
	{
		if (!bFSwords)
			bFSwords = set.TSResearch("Forge swords");
		Sleep(10456 + rand(13)*100);
	}	
}
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

// 20 berber assasin
{
	int nAssasin = 20;
	while (olAssasin.count<nAssasin)
	{
		int nCount;
		nCount = nAssasin - olAssasin.count;
		olAssasin.AddList(set.TSRecruitArmy("CBerberAssassin",nCount));

		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// stop script
			if (bHeroSc)
				AIBreakScript(heroScId);
			// set ai flag
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			olAssasin.ClearDead();
			SetNoAIFlag(olAssasin,false);
			// set vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}

		Sleep(14456 + rand(15)*100);
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
	olAssasin.SetCommand("attach", hero);
	ol.Add(hero);
	heroScId = AIRun("TS_AttackAtWill.vs", set, ol,oDummy, 0);
}

// peoples assembly & Spoils of war 
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
			olAssasin.ClearDead();
			SetNoAIFlag(olAssasin,false);
			// set vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}
		Sleep(5456 + rand(10)*100);
	}	
}
if (hero.IsValid)
		hero.TSAdvHeroSkills(aSkills, aSkillLevels);	

set.TSResearch("StopSpecialization");
// forge javelins & barrack level 1
{
	bool bBarrack1 = false;
	bool bFJavelins = false;
	while (!bBarrack1 ||!bFJavelins)
	{
		if (!bBarrack1 && set.gold>500)
			bBarrack1 = set.TSResearch("Barrack Level 1");
		if (!bFJavelins && set.gold>600)
			bFJavelins = set.TSResearch("Forge javelins");

		Sleep(3456 + rand(11)*100);
	}	
}

if (EnvReadInt(set,"StopTacticScript") == 1)
{
	// stop script
	if (bHeroSc)
		AIBreakScript(heroScId);
	// set ai flag
	if (hero.IsValid)
		hero.SetNoAIFlag(false);
	olAssasin.ClearDead();
	SetNoAIFlag(olAssasin,false);
	// set vars
	SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
	SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
	SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
	SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
	SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
	return;
}
if (hero.IsValid)
		hero.TSAdvHeroSkills(aSkills, aSkillLevels);	
// 30 javelins
// 5 shamans
{
	int nJavelins = 30;
	int nShamans = 5;
	while (olJavelineers.count<nJavelins || olShamans.count<nShamans)
	{
		int nCount;
		if (olJavelineers.count<nJavelins)
		{
			nCount = nJavelins - olJavelineers.count;
			olJavelineers.AddList(set.TSRecruitArmy("CJavelinThrower",nCount));
		}
		if (olShamans.count<nShamans)
		{
			nCount = nShamans - olShamans.count;
			olShamans.AddList(set.TSTempleRecruit(nCount));
		}
		if (EnvReadInt(set,"StopTacticScript") == 1)
		{
			// stop script
			if (bHeroSc)
				AIBreakScript(heroScId);
			// set ai flag
			if (hero.IsValid)
				hero.SetNoAIFlag(false);
			olAssasin.ClearDead();
			olShamans.ClearDead();
			olJavelineers.ClearDead();
			SetNoAIFlag(olAssasin,false);
			SetNoAIFlag(olShamans,false);
			SetNoAIFlag(olJavelineers,false);
			// set vars
			SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
			SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
			SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
			SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value
			return;
		}
		Sleep(7456 + rand(7)*100);
	}
}

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

olAssasin.ClearDead();
olShamans.ClearDead();
olJavelineers.ClearDead();
SetNoAIFlag(olAssasin,false);
SetNoAIFlag(olShamans,false);
SetNoAIFlag(olJavelineers,false);

SetAIVar(AIPlayer, AIV_DonateGold, nDonateGold); // Return variable to its value
SetAIVar(AIPlayer, AIV_DonatePop,  nDonatePop); // Return variable to its value
SetAIVar(AIPlayer, AIV_DonateFood, nDonateFood); // Return variable to its value
SetAIVar(AIPlayer, AIV_BuildArmy,  nBuildArmy); // Return variable to its value
SetAIVar(AIPlayer, AIV_Research,   nResearch); // Return variable to its value

EnvWriteInt(set, "CarthageTactic",1);
