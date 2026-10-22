// void, Settlement set

int aiPlayer;
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

aiPlayer = set.player;

bNeedTraining = (EnvReadInt(aiPlayer, "NeedTraining") != 1);

bLogResearch = (AIVar(aiPlayer, AIV_LogResearch) != 0) && UEnabled(AIVar(aiPlayer, AIV_LogPlayer), aiPlayer);
bLogFreezeArmy = (AIVar(aiPlayer, AIV_LogFreezeArmy) != 0) && UEnabled(AIVar(aiPlayer, AIV_LogPlayer), aiPlayer);
EnvWriteInt(set, "NeedTechSucceed", 0);

nRace = set.GetCentralBuilding.race;

if (AIVar(aiPlayer, AIV_Research) == 0) return;

strTech = EnvReadString(set, "strTech");
if (IsResearched(set, strTech))
{
	EnvWriteInt(set, "FreezeArmyBuild", 0);
	if (bLogResearch)
		pr("Player " + aiPlayer + ": Tech already researched! (" + strTech + ")");
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
	if (EnvReadInt(aiPlayer, "ModeOldSchoolCostsV2") == 1)
	{
		if (strTech == "Gaul Axeman") strTech = "Gaul Axeman Imp2 Cost";
		else if (strTech == "Gaul Spearman") strTech = "Gaul Spearman Imp2 Cost";
		else if (strTech == "Gaul Horseman") strTech = "Gaul Horseman Imp2 Cost";
		else if (strTech == "Gaul Iron Axes" || strTech == "Gaul Iron Spearheads" || strTech == "Gaul Fine Armor") strTech = "Gaul Weapons";
		else if (strTech == "Gaul Woman Warrior") strTech = "Gaul Woman Warrior Imp2";
		else if (strTech == "Fights") strTech = "Fights Imp2";
		else if (strTech == "Gaul Training 1") strTech = "Gaul Training 1 Imp2 Cost";
		else if (strTech == "Gaul Training 2") strTech = "Gaul Training 2 Imp2 Cost";
		else if (strTech == "Gaul Training 3") strTech = "Gaul Training 3 Imp2 Cost";
	}
}



if (IsResearching(set, strTech))
{
	if (bLogResearch)
		pr("Player " + aiPlayer + ": is researching " + strTech);
	return;
}

// FIX 1: Aggiungi "Hire Oathsworn warrior" alla lista delle unità arena
if (strTech == "Hire Trident warrior")    bArenaHire = true; // Gaul
else if (strTech == "Hire Oathsworn warrior") bArenaHire = true; // Gaul (nuova unità)
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
		pr("Player " + aiPlayer + ": Tech unknown price! (" + strTech + ")");
	return;
}

//----- TIGHT THE FIRST ARENA OR TEMPLE UPGRADES WITH A FURTHER UPGRADE IN THIS BUILDING

bDoNotRefuse = true;
if (gold > 0 && set.gold < AIVar(aiPlayer, AIV_SquanderGoldAmount))
	bDoNotRefuse = false;
if (food > 0 && set.food < AIVar(aiPlayer, AIV_SquanderFoolAmount))
	bDoNotRefuse = false;

if (!bDoNotRefuse)
if (nRace == Gaul)
{
	if (bNeedTraining) if (strTech == "Ritual Chamber") if (IsResearched(set, "Fights"))
		if (!IsResearched(set, "Gaul Training 1"))      if (set.CanResearch("Gaul Training 1"))
		if (!IsResearched(set, "Warrior Tales"))        if (set.CanResearch("Warrior Tales"))
		if (!IsResearched(set, "Battle tactics"))       if (set.CanResearch("Battle tactics"))
		if (!IsResearched(set, "Trident Warrior Exp1")) if (set.CanResearch("Trident Warrior Exp1"))
			bRefuseTech = true;
	if (strTech == "Fights") if (IsResearched(set, "Ritual Chamber"))
		if (!IsResearched(set, "Ghoul Summoning")) if (set.CanResearch("Ghoul Summoning"))
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
			bRefuseTech = true;
}
else if( (nRace == RepublicanRome) && (EnvReadString(set, "ChooseImperialRome") == "researched") )
{
	if (bNeedTraining) if (strTech == "Altar of Jupiter") if (IsResearched(set, "RGladiator Shows2"))
			bRefuseTech = true;
	if (strTech == "RGladiator Shows2") if (IsResearched(set, "Altar of Jupiter"))
		if (!IsResearched(set, "Cloud of Plague"))  if (set.CanResearch("Cloud of Plague"))
			bRefuseTech = true;
}
else if (nRace == Carthage)
{
	if (bNeedTraining) if (strTech == "Dark Rituals") if (IsResearched(set, "People's Assembly"))
		if (!IsResearched(set, "Shared Strength")) if (set.CanResearch("Shared Strength"))
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
		if (!IsResearched(set, "Mountain Clan"))    if (set.CanResearch("Mountain Clan"))
		if (!IsResearched(set, "Nobility"))         if (set.CanResearch("Nobility"))
			bRefuseTech = true;
	if (strTech == "Tournaments") if (IsResearched(set, "Code of Valor"))
		if (!IsResearched(set, "Ancestral Knowledge")) if (set.CanResearch("Ancestral Knowledge"))
		if (!IsResearched(set, "Cover of Mercy"))      if (set.CanResearch("Cover of Mercy"))
			bRefuseTech = true;
}
else if (nRace == Britain)
{
	// MODIFICATO: Allineato con CombatMagic - Mass Heal e Mass Concealment (NO Ghoul Summoning)
	if (bNeedTraining) if (strTech == "Britain Chamber") if (IsResearched(set, "Britain Fights"))
		if (!IsResearched(set, "Shrine of Thor")) if (set.CanResearch("Shrine of Thor"))
		if (!IsResearched(set, "Tribal Unification"))      if (set.CanResearch("Tribal Unification"))
		if (!IsResearched(set, "Noble Offence"))  if (set.CanResearch("Noble Offence"))
		if (!IsResearched(set, "Noble Defence"))  if (set.CanResearch("Noble Defence"))
			bRefuseTech = true;
	
	// Mass Heal dopo Britain Fights
	if (strTech == "Britain Fights") 
		if (IsResearched(set, "Britain Chamber"))
			if (!IsResearched(set, "Britain Mass Heal")) 
				if (set.CanResearch("Britain Mass Heal"))
					bRefuseTech = true;
	
	// Mass Concealment dopo Mass Heal
	if (strTech == "Britain Mass Heal") 
		if (IsResearched(set, "Britain Fights"))
			if (!IsResearched(set, "Mass Concealment")) 
				if (set.CanResearch("Mass Concealment"))
					bRefuseTech = true;
}
else if (nRace == Egypt)
{
	if (bNeedTraining) if (strTech == "Cult of Osiris") if (IsResearched(set, "Cult of Anubis"))
		if (!IsResearched(set, "Path of the dead II"))     if (set.CanResearch("Path of the dead II"))
		if (!IsResearched(set, "Path of the dead III"))    if (set.CanResearch("Path of the dead III"))
			bRefuseTech = true;

	if (strTech == "Cult of Anubis") if (IsResearched(set, "Cult of Osiris"))
		if (!IsResearched(set, "ECloud of Plague")) if (set.CanResearch("ECloud of Plague"))
			bRefuseTech = true;
}
else if (nRace == Germany)
{
	if (bNeedTraining) if (strTech == "German Chamber") if (IsResearched(set, "TFights"))
		if (!IsResearched(set, "Learning"))      if (set.CanResearch("Learning"))
		if (!IsResearched(set, "Attack focus"))  if (set.CanResearch("Attack focus"))
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
		pr("Player " + aiPlayer + " refuses to research " + strTech);
	return; 
}

if (!bDoNotRefuse)
if (EnvReadInt(set, "Reserve" + (aiPlayer - 1)) > 0)
{
	str strReserving; strReserving = EnvReadString(set, "ReserveFor" + (aiPlayer - 1));
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
					pr("Player " + aiPlayer + " refuses to research " + strTech + " reserving for " + strReserving);
				return;
			}
		}
	}
} else if (!bArenaHire) if (AIVar(AIPlayer, AIV_TechReserve) > 0) if (gold >= AIVar(AIPlayer, AIV_TechReserve)) {
	bReserving = set.ReserveFor(strTech, AIVar(AIPlayer, AIV_TechBudget));
	if (bReserving) {
		if (bLogFreezeArmy || bLogResearch)
			pr("Player " + aiPlayer + " starts reserving for " + strTech + ". Current Budget=" + set.gold);
		EnvWriteInt(set, "ReserveCounter", 50);
	}
}

if (!set.CanResearch(strTech)) {
	/// researched, researching or impossible to research
	if (bLogResearch)
		pr("ESH_NeedTech: Player " + aiPlayer + ": can not research (" + strTech + ") or the Queue is not empty");
	return;
}

// Check tech budget
bExcessGold = set.gold >= AIVar(aiPlayer, AIV_ExcessGold);

if (!bDoNotRefuse)
if (rand(10)==1) bExcessGold = false;
if (!bArenaHire) if (!bExcessGold) if (!set.CheckTechBudget(strTech, AIVar(AIPlayer, AIV_TechBudget))) {
	if (bLogResearch)
		pr("Player " + aiPlayer + " refuses to research " + strTech + " becase of the restricted tech budget");
	return;
}

if (!set.CanAfford(strTech))
{
	if (bLogFreezeArmy)
		if (EnvReadInt(set, "FreezeArmyBuild") == 0)
			pr("Player " + aiPlayer + " freezes army build, saving for " + strTech);
		else
			pr("Army is freezed coz of the tech: " + strTech);

    // Food shortage must not keep saving gold and stopping all basic recruitment.
    if (set.gold < gold && GetTime() >= EnvReadInt(set, "ArmySavingRetryAt")) {
        int since;
        since = EnvReadInt(set, "ArmySavingSince");
        if (since == 0) {
            since = GetTime();
            EnvWriteInt(set, "ArmySavingSince", since);
        }
        if (GetTime() - since < 30000)
            EnvWriteInt(set, "FreezeArmyBuild", 10);
        else {
            EnvWriteInt(set, "FreezeArmyBuild", 0);
            EnvWriteInt(set, "ArmySavingSince", 0);
            EnvWriteInt(set, "ArmySavingRetryAt", GetTime() + 60000);
            EnvWriteInt(set, "ReserveCounter", 0);
            set.StopReserving;
        }
    }
    else EnvWriteInt(set, "FreezeArmyBuild", 0);
	return; 
}

// FIX 2 & 3 & 4: Aggiorna la sezione di logging con tutti i messaggi corretti
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
	else pr("Player " + aiPlayer + " is researching " + strTech); 
	
bGoldOnTech = !bArenaHire && !bExcessGold;
if (bGoldOnTech) if (strTech == "GrainTrade")     bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "TGrainTrade")    bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "TFights")        bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "BuySlaves")      bGoldOnTech = false;
if (bGoldOnTech) if (strTech == "ReligiousFeast") bGoldOnTech = false;

if (bArenaHire) set.SpentGoldOnArmy(gold);
else if (bGoldOnTech) set.SpentGoldOnTech(gold);

if (!bArenaHire) if (bLogFreezeArmy) if (EnvReadInt(set, "FreezeArmyBuild") != 0)
	pr("Player " + aiPlayer + " enables army build, researching " + strTech);
EnvWriteInt(set, "FreezeArmyBuild", 0);

if (bReserving) {
	if (bLogFreezeArmy) 
		pr("Player " + aiPlayer + " stops reserving for " + strTech + " (researching)");
	set.StopReserving;
	EnvWriteInt(set, "ReserveCounter", 0);
}

if (EnvReadInt(set, "TestTechSucceed") == 0)
	set.Research(strTech);

EnvWriteInt(set, "NeedTechSucceed", 1);
