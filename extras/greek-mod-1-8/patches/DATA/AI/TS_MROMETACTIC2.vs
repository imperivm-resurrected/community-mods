@replace bGladiatorShow = set.TSResearch("MGladiator Shows");
// Greek Mod 1.8: the Imperial Rome of the mod researches its own Gladiator Shows
if (Mod_TrueRace(set.GetCentralBuilding) == Empire18)
	bGladiatorShow = set.TSResearch("RGladiator Shows2");
else
	bGladiatorShow = set.TSResearch("MGladiator Shows");
@replace if (nIncPop<1 && set.food>=600)
if (nIncPop<1 && (set.food>=800 || (set.food>=600 && Mod_TrueRace(set.GetCentralBuilding) != Empire18)))
@replace set.TSResearch("MAddPop");
if (Mod_TrueRace(set.GetCentralBuilding) == Empire18)
			set.TSResearch("RAddPop");
		else
			set.TSResearch("MAddPop");
