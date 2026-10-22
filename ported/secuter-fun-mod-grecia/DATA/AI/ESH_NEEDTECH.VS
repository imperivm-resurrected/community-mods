// void, Settlement set

int AIPlayer;
int nRace;
str strTech;
int gold, food;
bool bNeedTraining = false;
bool bRefuseTech = false;
bool bReserving = false;
bool bArenaHire = false;
bool bExcessGold = false;
bool bLogResearch = false;
bool bLogFreezeArmy = false;
bool bDoNotRefuse = false;
bool bGoldOnTech = false;

// -> La Grecia ha per razza la vecchia Roma Imperiale!!!!
int Greece;
Greece = ImperialRome;

AIPlayer = set.player;

bNeedTraining = (EnvReadInt(AIPlayer, "NeedTraining") != 1);

bLogResearch = (AIVar(AIPlayer, AIV_LogResearch) != 0) && UEnabled(AIVar(AIPlayer, AIV_LogPlayer), AIPlayer);
bLogFreezeArmy = (AIVar(AIPlayer, AIV_LogFreezeArmy) != 0) && UEnabled(AIVar(AIPlayer, AIV_LogPlayer), AIPlayer);
EnvWriteInt(set, "NeedTechSucceed", 0);

nRace = set.GetCentralBuilding.race;

if (AIVar(AIPlayer, AIV_Research) == 0)
if (bLogResearch)
	pr("Player " + AIPlayer + ": Tech researching disabled! (" + strTech + ")");

strTech = EnvReadString(set, "strTech");
if (IsResearched(set, strTech))
{
	EnvWriteInt(set, "FreezeArmyBuild", 0);
	if (bLogResearch)
		pr("Player " + AIPlayer + ": Tech already researched! (" + strTech + ")");
	return;
}

/// research from ESH_BuildArmy.vs
if (strTech == "Sacred Legion") if (!IsResearched(set, "Dark Rituals"))
	strTech = "Dark Rituals";
if (nRace == Gaul)
{
	if (strTech == "Gaul Iron Axes") if (!IsResearched(set, "Gaul Axeman"))
		strTech = "Gaul Axeman";
	if (strTech == "Gaul Iron Spearheads") if (!IsResearched(set, "Gaul Spearman"))
		strTech = "Gaul Spearman";
	if (strTech == "Gaul Fine Armor") if (!IsResearched(set, "Gaul Woman Warrior"))
		strTech = "Gaul Woman Warrior";
}



if (IsResearching(set, strTech))
{
	if (bLogResearch)
		pr("Player " + AIPlayer + ": is researching " + strTech);
	return;
}

if (strTech == "Hire Trident warrior")    bArenaHire = true; // Gaul
else if (strTech == "Hire Liberati")      bArenaHire = true; // ImperialRome
else if (strTech == "Equip Chariot")      bArenaHire = true; // RepublicanRome
else if (strTech == "Train War Elephant") bArenaHire = true; // Carthage
else if (strTech == "Call Mountaineer")   bArenaHire = true; // Iberia
else if (strTech == "Hire Viking Lord")   bArenaHire = true; // Britain
else if (strTech == "Chariot of Osiris")  bArenaHire = true; // Egypt
else if (strTech == "Call Valkyries")     bArenaHire = true; // Germany
else if (strTech == "trainHMyrmidon")     bArenaHire = true; // Greece.

if (!GetCmdCost(strTech, gold, food))
{
	EnvWriteInt(set, "FreezeArmyBuild", 0);
	if (bLogResearch)
		pr("Player " + AIPlayer + ": Tech unknown price! (" + strTech + ")");
	return;
}

//----- TIGHT THE FIRST ARENA OR TEMPLE UPGRADES WITH A FURTHER UPGRADE IN THIS BUILDING

bDoNotRefuse = true;
if (gold > 0 && set.gold < AIVar(AIPlayer, AIV_SquanderGoldAmount))
	bDoNotRefuse = false;
if (food > 0 && set.food < AIVar(AIPlayer, AIV_SquanderFoolAmount))
	bDoNotRefuse = false;

if (!bDoNotRefuse)
if (nRace == Gaul)
{
	if (bNeedTraining) if (strTech == "Ritual Chamber") if (IsResearched(set, "Fights"))
		if (!IsResearched(set, "Gaul Training 1"))      if (set.CanResearch("Gaul Training 1"))
		if (!IsResearched(set, "Warrior Tales"))        if (set.CanResearch("Warrior Tales"))
		if (!IsResearched(set, "Battle tactics"))       if (set.CanResearch("Battle tactics"))
		if (!IsResearched(set, "Trident Warrior Exp1")) if (set.CanResearch("Trident Warrior Exp1"))
		//if (!IsResearched(set, "Trident Warrior Exp2")) if (set.CanResearch("Trident Warrior Exp2"))
		//if (!IsResearched(set, "Trident Warrior Exp3")) if (set.CanResearch("Trident Warrior Exp3"))
			bRefuseTech = true;
	if (strTech == "Fights") if (IsResearched(set, "Ritual Chamber"))
		if (!IsResearched(set, "Ghoul Summoning")) if (set.CanResearch("Ghoul Summoning"))
		//if (!IsResearched(set, "Restoration"))     if (set.CanResearch("Restoration"))
			bRefuseTech = true;
}
else if ( (nRace == RepublicanRome) && (EnvReadString(set, "ChooseRepublicanRome") == "researched") )
{
	if (bNeedTraining) if (strTech == "Altar of Jupiter") if (IsResearched(set, "RGladiator Shows"))
		if (!IsResearched(set, "Rome Training 1")) if (set.CanResearch("Rome Training 1"))
		if (!IsResearched(set, "Veteran Offence")) if (set.CanResearch("Veteran Offence"))
		if (!IsResearched(set, "Veteran Defence")) if (set.CanResearch("Veteran Defence"))
		if (!IsResearched(set, "Veteran Health"))  if (set.CanResearch("Veteran Health"))
			bRefuseTech = true;
	if (strTech == "RGladiator Shows") if (IsResearched(set, "Altar of Jupiter"))
		if (!IsResearched(set, "Cloud of Plague"))  if (set.CanResearch("Cloud of Plague"))
		//if (!IsResearched(set, "Wrath of Jupiter")) if (set.CanResearch("Wrath of Jupiter"))
				bRefuseTech = true;
}
else if( (nRace == RepublicanRome) && (EnvReadString(set, "ChooseImperialRome") == "researched") )
{
	if (bNeedTraining) if (strTech == "Altar of Jupiter") if (IsResearched(set, "MGladiator Shows"))
		//if (!IsResearched(set, "Liberati guild"))     if (set.CanResearch("Liberati guild"))
		//if (!IsResearched(set, "Military Academy"))   if (set.CanResearch("Military Academy"))
		//if (!IsResearched(set, "Standartization I"))  if (set.CanResearch("Standartization I"))
		if (!IsResearched(set, "Standartization II")) if (set.CanResearch("Standartization II"))
			bRefuseTech = true;
	if (strTech == "RGladiator Shows2") if (IsResearched(set, "Altar of Jupiter"))
		if (!IsResearched(set, "Cloud of Plague"))  if (set.CanResearch("Cloud of Plague"))
		//if (!IsResearched(set, "Wrath of Jupiter")) if (set.CanResearch("Wrath of Jupiter"))
				bRefuseTech = true;
}
else if (nRace == Carthage)
{
	if (bNeedTraining) if (strTech == "Dark Rituals") if (IsResearched(set, "People's Assembly"))
		if (!IsResearched(set, "Shared Strength")) if (set.CanResearch("Shared Strength"))
		//if (!IsResearched(set, "Shared Triumph"))  if (set.CanResearch("Shared Triumph"))
		if (!IsResearched(set, "Spoils of war"))   if (set.CanResearch("Spoils of war"))
		if (!IsResearched(set, "CHero level 8"))  if (set.CanResearch("CHero level 8"))
			bRefuseTech = true;
	if (strTech == "People's Assembly") if (IsResearched(set, "Dark Rituals"))
		if (!IsResearched(set, "Zombify")) if (set.CanResearch("Zombify"))
			bRefuseTech = true;
}
else if (nRace == Iberia)
{
	if (bNeedTraining) if (strTech == "Code of Valor") if (IsResearched(set, "Tournaments"))
		if (!IsResearched(set, "Heroes' Wisdom"))   if (set.CanResearch("Heroes' Wisdom"))
		//if (!IsResearched(set, "Warriors' Wisdom")) if (set.CanResearch("Warriors' Wisdom"))
		if (!IsResearched(set, "Mountain Clan"))    if (set.CanResearch("Mountain Clan"))
		if (!IsResearched(set, "Nobility"))         if (set.CanResearch("Nobility"))
			bRefuseTech = true;
	if (strTech == "Tournaments") if (IsResearched(set, "Code of Valor"))
		if (!IsResearched(set, "Ancestral Knowledge")) if (set.CanResearch("Ancestral Knowledge"))
		if (!IsResearched(set, "Cover of Mercy"))      if (set.CanResearch("Cover of Mercy"))
		//if (!IsResearched(set, "Iberian Mass Heal"))   if (set.CanResearch("Iberian Mass Heal"))
			bRefuseTech = true;
}
else if (nRace == Britain)
{
	if (bNeedTraining) if (strTech == "Britain chamber") if (IsResearched(set, "Britain Fights"))
		if (!IsResearched(set, "Shrine of Thor")) if (set.CanResearch("Shrine of Thor"))
		if (!IsResearched(set, "BNobility"))      if (set.CanResearch("BNobility"))
		if (!IsResearched(set, "Noble Offence"))  if (set.CanResearch("Noble Offence"))
		if (!IsResearched(set, "Noble Defence"))  if (set.CanResearch("Noble Defence"))
			bRefuseTech = true;
		if (strTech == "Britain Fights") if (IsResearched(set, "Britain chamber"))
			if (!IsResearched(set, "Britain Ghoul Summoning")) if (set.CanResearch("Britain Ghoul Summoning"))
			//if (!IsResearched(set, "Britain Mass Heal"))     if (set.CanResearch("Britain Mass Heal"))
				bRefuseTech = true;
}
else if (nRace == Egypt)
{
	if (bNeedTraining) if (strTech == "Cult of Osiris") if (IsResearched(set, "Cult of Anubis"))
		//if (!IsResearched(set, "Statue of Isis, mother of Anubis")) if (set.CanResearch("Statue of Isis, mother of Anubis"))
		//if (!IsResearched(set, "Path of the dead I"))      if (set.CanResearch("Path of the dead I"))
		if (!IsResearched(set, "Path of the dead II"))     if (set.CanResearch("Path of the dead II"))
		if (!IsResearched(set, "Path of the dead III"))    if (set.CanResearch("Path of the dead III"))
			bRefuseTech = true;

	if (strTech == "Cult of Anubis") if (IsResearched(set, "Cult of Osiris"))
		if (!IsResearched(set, "ECloud of Plague")) if (set.CanResearch("ECloud of Plague"))
		//if (!IsResearched(set, "EZombify"))         if (set.CanResearch("EZombify"))
			bRefuseTech = true;
}
else if (nRace == Germany)
{
	if (bNeedTraining) if (strTech == "German chamber") if (IsResearched(set, "TFights"))
		if (!IsResearched(set, "Learning"))      if (set.CanResearch("Learning"))
		if (!IsResearched(set, "Attack focus"))  if (set.CanResearch("Attack focus"))
		//if (!IsResearched(set, "Legendary Valkyries")) if (set.CanResearch("Legendary Valkyries"))
			bRefuseTech = true;
	if (strTech == "TFights") if (IsResearched(set, "TGrainTrade") || IsResearching(set, "TGrainTrade"))
		if (!IsResearched(set, "TFoodTax") && !IsResearching(set, "TFoodTax"))
			bRefuseTech = true;
	if (strTech == "Learning" || strTech == "Attack focus" || strTech == "Legendary Valkyries")
		if (!IsResearched(set, "TFoodTax") && !IsResearching(set, "TFoodTax") && set.food < 2000)
			bRefuseTech = true;
}
if (bRefuseTech) { 
	if (bLogResearch)
		pr("Player " + AIPlayer + " refuses to research " + strTech);
	//EnvWriteInt(set, "FreezeArmyBuild", 0); 
	return; 
}

if (!bDoNotRefuse)
if (EnvReadInt(set, "Reserve" + (AIPlayer - 1)) > 0)
{
	str strReserving; strReserving = EnvReadString(set, "ReserveFor" + (AIPlayer - 1));
	bReserving = (strReserving == strTech);
	if (bReserving) EnvWriteInt(set, "ReserveCounter", 50);
	else {
		int i; i = EnvReadInt(set, "ReserveCounter");
		if (i > 0) {
			i = i - 1; EnvWriteInt(set, "ReserveCounter", i);
			if (i == 0) {
				set.StopReserving;
				if (bLogFreezeArmy)
					pr("Player " + AIPlayer + " stops reserving for " + (EnvReadString(set, "ReserveFor" + (AIPlayer - 1))) + " (gave up)");
			} else if (!bArenaHire) {
				if (bLogResearch)
					pr("Player " + AIPlayer + " refuses to research " + strTech + " reserving for " + strReserving);
				return;
			}
		}
	}
} else if (!bArenaHire) if (AIVar(AIPlayer, AIV_TechReserve) > 0) if (gold >= AIVar(AIPlayer, AIV_TechReserve)) {
	bReserving = set.ReserveFor(strTech, AIVar(AIPlayer, AIV_TechBudget));
	if (bReserving) {
		if (bLogFreezeArmy || bLogResearch)
			pr("Player " + AIPlayer + " starts reserving for " + strTech + ". Current Budget=" + set.gold);
		EnvWriteInt(set, "ReserveCounter", 50);
	}
}

if (!set.CanResearch(strTech)) {
	/// researched, researching or impossible to research
	if (bLogResearch)
		pr("ESH_NeedTech: Player " + AIPlayer + ": can not research (" + strTech + ") or the Queue is not empty");
	return;
}

// Check tech budget
bExcessGold = set.gold >= AIVar(AIPlayer, AIV_ExcessGold) && set.gold >= 10000;

if (!bDoNotRefuse)
if (rand(10)==1) bExcessGold = false;
if (!bArenaHire) if (!bExcessGold) if (!set.CheckTechBudget(strTech, AIVar(AIPlayer, AIV_TechBudget))) {
	if (bLogResearch)
		pr("Player " + AIPlayer + " refuses to research " + strTech + " becase of the restricted tech budget");
	return;
}

if (!set.CanAfford(strTech) && gold > 0)
{
	if (bLogFreezeArmy)
		if (EnvReadInt(set, "FreezeArmyBuild") == 0)
			pr("Player " + AIPlayer + " freezes army build, saving for " + strTech);
		else
			pr("Army is freezed coz of the tech: " + strTech);

	EnvWriteInt(set, "FreezeArmyBuild", 10);
	return; 
}

if (bLogResearch) 
	if (bArenaHire) {
		if (strTech == "Hire Trident warrior")    pr("Player " + AIPlayer + " hires Trident warriors");
		else if (strTech == "Hire Liberati")      pr("Player " + AIPlayer + " hires Liberati");
		else if (strTech == "Train War Elephant") pr("Player " + AIPlayer + " train War Elephant");
		else if (strTech == "Call Mountaineer")   pr("Player " + AIPlayer + " calls Mountaineer");
		else if (strTech == "Hire Viking Lord")   pr("Player " + AIPlayer + " hires Thoric");
		else if (strTech == "Chariot of Osiris")  pr("Player " + AIPlayer + " hires Chariot of Osiris");
		else if (strTech == "TValkyrie")          pr("Player " + AIPlayer + " hires Valkyries");
	}
	else pr("Player " + AIPlayer + " is researching " + strTech); 
	
bGoldOnTech = !bArenaHire && !bExcessGold;
if (bGoldOnTech) if (strTech == "GrainTrade")     bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "TGrainTrade")    bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "TFights")        bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "BuySlaves")      bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "ReligiousFeast") bGoldOnTech = false;

if (bArenaHire) set.SpentGoldOnArmy(gold);
else if (bGoldOnTech) set.SpentGoldOnTech(gold);

if (!bArenaHire) if (bLogFreezeArmy) if (EnvReadInt(set, "FreezeArmyBuild") != 0)
	pr("Player " + AIPlayer + " enables army build, researching " + strTech);
EnvWriteInt(set, "FreezeArmyBuild", 0);

if (bReserving) {
	if (bLogFreezeArmy) 
		pr("Player " + AIPlayer + " stops reserving for " + strTech + " (researching)");
	set.StopReserving;
	EnvWriteInt(set, "ReserveCounter", 0);
}

if (EnvReadInt(set, "TestTechSucceed") == 0)
	set.Research(strTech);

EnvWriteInt(set, "NeedTechSucceed", 1);
