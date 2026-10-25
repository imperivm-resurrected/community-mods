@before nRace = set.GetCentralBuilding.race;
// Greek Mod 1.8: the branch of each Rome of the mod, for the scripts that read it (ESH_*, TSH_*); the AI sees all three as RepublicanRome
if (Mod_TrueRace(set.GetCentralBuilding) == Rome18)
	EnvWriteString(set, "ChooseRepublicanRome", "researched");
if (Mod_TrueRace(set.GetCentralBuilding) == Empire18)
	EnvWriteString(set, "ChooseImperialRome", "researched");
if (Mod_TrueRace(set.GetCentralBuilding) == Punic18)
	EnvWriteString(set, "ChoosePunicRome", "researched");
@before if (nRace == RepublicanRome)
// Imperial Rome of the mod: the game's Imperial Rome tactics (Republican and Punic keep the Republican one)
if (Mod_TrueRace(set.GetCentralBuilding) == Empire18)
{
	if (rnd<33)
		return TS_MRomeTactic;
	if (rnd<66)
		return TS_MRomeTactic2;
}
