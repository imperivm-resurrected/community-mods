@replace bGladiatorShow = set.TSResearch("MGladiator Shows");
// Greek Mod 1.8: the Imperial Rome of the mod researches its own Gladiator Shows
if (Mod_TrueRace(set.GetCentralBuilding) == Empire18)
	bGladiatorShow = set.TSResearch("RGladiator Shows2");
else
	bGladiatorShow = set.TSResearch("MGladiator Shows");
