// int, Settlement set, int idPlayer

int nRace;
int player;
int rnd;

if (!set.IsStronghold)
	return TS_NONE;

nRace = set.GetCentralBuilding.race;
player = set.player;
if (GetTime<5000)
{
	//rnd = rand(100);
	if (nRace == Gaul)
	{
		//if (rnd<33)	
			//return TS_GaulTactic;
		//if (rnd<66)	
			return TS_GaulTactic2;
	}
	
	if (nRace == Iberia)
	{
		//if (rnd<33)	
			//return TS_IberianTactic;
		//if (rnd<66)	
			return TS_IberianTactic2;
	}

	if (nRace == Germany)
	{
		//if (rnd<33)	
			//return TS_GermanyTactic;
		//if (rnd<66)	
			return TS_GermanyTactic2;
	}

	if (nRace == Egypt)
	{
		//if (rnd<50)	
			return TS_EgyptTactic;
	}

	if (nRace == Britain)
	{
		//if (rnd<50)	
			return TS_BritishTactic;
	}

	if (nRace == Carthage)
	{
		//if (rnd<33)	
			//return TS_CarthageTactic;		
		//if (rnd<66)	
			return TS_CarthageTactic2;					
	}
	if (nRace == RepublicanRome)
	{
		//if (rnd<50)	
			return TS_RRomeTactic;		
	}
	if (nRace == ImperialRome)
	{
		//if (rnd<33)	
			//return TS_MRomeTactic;		
		//if (rnd<66)	
			return TS_MRomeTactic2;
	}
}
return TS_NONE;
