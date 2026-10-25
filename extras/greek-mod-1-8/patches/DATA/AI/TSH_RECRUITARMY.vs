@top
StrArray greekBuildName, greekTrainCmd, greekTech;
StrArray romeBuildName, romeTrainCmd, romeTech;
int isGreek;
int isRome;
@replace nBuildType = RUType(class, nRace);
// Greek Mod 1.8: the AI of a Greek settlement asks for Greek units; the game's table is the Roman one
// The Imperial and Punic Rome of the mod also have their own table for the sixth units (Velit / Gladiator and Praetorian); the AI sees them as RepublicanRome
isGreek = 0;
isRome = 0;
if (Mod_TrueRace(set.GetCentralBuilding) == Greek18)
	isGreek = 1;
if (Mod_TrueRace(set.GetCentralBuilding) == Empire18)
{
	isRome = 1;
	romeTech[0] = "";
	romeTech[1] = "Roman Archers";
	romeTech[2] = "Roman Velit";
	romeTech[3] = "Roman Principle";
	romeTech[4] = "Roman Scout";
	romeTech[5] = "Roman Praetorian";
	romeTrainCmd[0] = "trainRHastatus";
	romeTrainCmd[1] = "trainRArcher";
	romeTrainCmd[2] = "trainMVelit";
	romeTrainCmd[3] = "trainRPrinciple";
	romeTrainCmd[4] = "trainRScout";
	romeTrainCmd[5] = "trainMPraetorian";
	romeBuildName[0] = "RHastatus";
	romeBuildName[1] = "RArcher";
	romeBuildName[2] = "RVelit";
	romeBuildName[3] = "RPrinciple";
	romeBuildName[4] = "RScout";
	romeBuildName[5] = "RPraetorian";
}
if (Mod_TrueRace(set.GetCentralBuilding) == Punic18)
{
	isRome = 1;
	romeTech[0] = "";
	romeTech[1] = "Roman Archers";
	romeTech[2] = "RGladiator Shows";
	romeTech[3] = "Roman Principle";
	romeTech[4] = "Roman Scout";
	romeTech[5] = "Roman Praetorian";
	romeTrainCmd[0] = "trainRHastatus";
	romeTrainCmd[1] = "trainRArcher";
	romeTrainCmd[2] = "trainRGladiator";
	romeTrainCmd[3] = "trainRPrinciple";
	romeTrainCmd[4] = "trainRScout";
	romeTrainCmd[5] = "trainMPraetorian";
	romeBuildName[0] = "RHastatus";
	romeBuildName[1] = "RArcher";
	romeBuildName[2] = "RGladiator";
	romeBuildName[3] = "RPrinciple";
	romeBuildName[4] = "RScout";
	romeBuildName[5] = "RPraetorian";
}
if (isGreek == 1)
{
	greekTech[0] = "Greek Spears";
	greekTech[1] = "Greek Archers";
	greekTech[2] = "Greek Spears";
	greekTech[3] = "Greek Royal Armor";
	greekTech[4] = "Greek Chariot Wheels";
	greekTech[5] = "Greek Royal Armor";
	greekTrainCmd[0] = "trainQHoplite";
	greekTrainCmd[1] = "trainQToxotes";
	greekTrainCmd[2] = "trainQHoplite";
	greekTrainCmd[3] = "trainQHypaspista";
	greekTrainCmd[4] = "trainQChariot";
	greekTrainCmd[5] = "trainQHypaspista";
	greekBuildName[0] = "QHoplite";
	greekBuildName[1] = "QToxotes";
	greekBuildName[2] = "QHoplite";
	greekBuildName[3] = "QHypaspista";
	greekBuildName[4] = "QChariot";
	greekBuildName[5] = "QHypaspista";
	nBuildType = 0;
	for (i = 0; i < 6; i += 1)
	{
		if (greekBuildName[i] == class)
		{
			nBuildType = i;
			break;
		}
	}
}
else if (isRome == 1)
{
	nBuildType = 0;
	for (i = 0; i < 6; i += 1)
	{
		if (romeBuildName[i] == class)
		{
			nBuildType = i;
			break;
		}
	}
}
else
{
	nBuildType = RUType(class, nRace);
}
@replace cmd = UTrainCmd(nBuildType, nRace);
if (isGreek == 1)
	cmd = greekTrainCmd[nBuildType];
else if (isRome == 1)
	cmd = romeTrainCmd[nBuildType];
else
	cmd = UTrainCmd(nBuildType, nRace);
@replace tech = UTech(nBuildType, nRace);
if (isGreek == 1)
	tech = greekTech[nBuildType];
else if (isRome == 1)
	tech = romeTech[nBuildType];
else
	tech = UTech(nBuildType, nRace);
