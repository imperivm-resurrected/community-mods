@top
int rc;
@after strMaleVillager = .raceStrPref;
if (this.class == "Free_Village")
{
	rc = GetPlayerRace(this.player);
	strMaleVillager = GetRaceStrPref(rc);
}
