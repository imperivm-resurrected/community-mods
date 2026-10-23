@top
StrArray greekBuildName, greekTrainCmd, greekTech;
int isGreek;
@replace nBuildType = RUType(class, nRace);
// Greek Mod 1.8: the AI of a Greek settlement asks for Greek units; the game's table is the Roman one
isGreek = 0;
if (Mod_TrueRace(set.GetCentralBuilding) == Greek18)
	isGreek = 1;
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
else
{
	nBuildType = RUType(class, nRace);
}
@replace cmd = UTrainCmd(nBuildType, nRace);
if (isGreek == 1)
	cmd = greekTrainCmd[nBuildType];
else
	cmd = UTrainCmd(nBuildType, nRace);
@replace tech = UTech(nBuildType, nRace);
if (isGreek == 1)
	tech = greekTech[nBuildType];
else
	tech = UTech(nBuildType, nRace);
