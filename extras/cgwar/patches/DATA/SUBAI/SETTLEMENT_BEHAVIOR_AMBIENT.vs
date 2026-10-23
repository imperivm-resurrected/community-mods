@top
int rc;
@after strMaleVillager = .GetCentralBuilding.raceStrPref;

// ---- For Free_Village (CGWAR) ----
if (This.class == "Free_Village"){
	rc = GetPlayerRace(This.player);
	strMaleVillager = GetRaceStrPref(rc);
}
