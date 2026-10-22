//void, int player, str param
Query q;
int i, nTime, nMaxEnemyTimeout;
bool bEnemiesLosing;
str s;

q = ClassPlayerObjs("BaseTownhall", player);
s =  '\n';
EnvWriteInt(player, "elimination", 0);

EnvWriteInt(player, "EEE_TotUnitsKilled", 0); //Number of killed units.
EnvWriteInt(player, "EEE_TotUnitsDeath", 0); //Number of killed units.

SetPlayerStatus(player, 0, Translate("Elimination"), false);

while(1) 
{
	/* --- KILLS, LOSSES, K/L RATIO STATISTICS --- */
	int killed = 0;
	int death = 0;
	killed = EnvReadInt(player, "EEE_TotUnitsKilled");
	death = EnvReadInt(player, "EEE_TotUnitsDeath");
	SetPlayerStatus(player, 2, Translatef("Kills: %s1", killed), false);
	SetPlayerStatus(player, 3, Translatef("Deaths: %s1", death), false);
	if(killed >= 1 && death >= 1)
	{
		float K = 0;
		float D = 0;
		float KD = 0;
		K = killed;
		D = death;
		KD = K/D;
		SetPlayerStatus(player, 4, Translatef("K/D ratio: %s1.%s2", Int(KD), Int((KD - Int(KD)) * 10)), false);	
	}
	else
	{
		SetPlayerStatus(player, 4, "K/D ratio: NaN", false);
	}	//Fine else.
		
	Sleep(1000);
	SetPlayerStatus(player, 0, false);
	SetPlayerStatus(player, 1, false);
	//check if all others will lose
	nMaxEnemyTimeout = 0;
	bEnemiesLosing = true;
	for (i=1; i<=8; i+=1) 
	{
		if (i != player && !DiplAreAllied(i, player)) 
		{
			int nEnemyTimeout;
			nEnemyTimeout = EnvReadInt(i, "elimination");
			if (nEnemyTimeout != 0) 
			{
				if (nEnemyTimeout > nMaxEnemyTimeout) 
				{
					nMaxEnemyTimeout = nEnemyTimeout;
				}
			} 
			else 
			{
				bEnemiesLosing = false;
			}
		}
	}
	if (bEnemiesLosing && nMaxEnemyTimeout > 1) 
	{
		if (nMaxEnemyTimeout % 60 < 10)
		{
			SetPlayerStatus(player, 1, Translatef("You win after %s1:0%s2 minutes", nMaxEnemyTimeout/60, nMaxEnemyTimeout%60), true);
		}
		else
		{
			SetPlayerStatus(player, 1, Translatef("You win after %s1:%s2 minutes", nMaxEnemyTimeout/60, nMaxEnemyTimeout%60), true);
		}
		SetPlayerStatus(player, 0, true);
	}

	if (!q.IsEmpty())
	{
		continue;
	}
	
	nTime = GetConst("EliminationTimeout");
	while (nTime>0) 
	{
		/* --- KILLS, LOSSES, K/L RATIO STATISTICS --- */
		int killed = 0;
		int death = 0;
		killed = EnvReadInt(player, "EEE_TotUnitsKilled");
		death = EnvReadInt(player, "EEE_TotUnitsDeath");
		SetPlayerStatus(player, 2, Translatef("Kills: %s1", killed), false);
		SetPlayerStatus(player, 3, Translatef("Deaths: %s1", death), false);
		if(killed >= 1 && death >= 1)
		{
			float K = 0;
			float D = 0;
			float KD = 0;
			K = killed;
			D = death;
			KD = K/D;
			SetPlayerStatus(player, 4, Translatef("K/D ratio: %s1.%s2", Int(KD), Int((KD - Int(KD)) * 10)), false);	
		}
		else
		{
			SetPlayerStatus(player, 4, "K/D ratio: NaN", false);
		}	//Fine else.
		if (MilUnits(player)==0) 
		{
			/* //PLAYER BUILDINGS BECAME NEUTRALS WHEN PLAYER IS BEEN ELIMINATED: 
			ClassPlayerObjs("Building", player).AddToGroup("Player" + player + "BuildingTransfer");
			ClassPlayerObjs("Stonehenge", player).RemoveFromGroup("Player" + player + "BuildingTransfer");
			ClassPlayerObjs("BaseRuins", player).RemoveFromGroup("Player" + player + "BuildingTransfer");
			ClassPlayerObjs("Teleport", player).RemoveFromGroup("Player" + player + "BuildingTransfer");
			Group("Player" + player + "BuildingTransfer").SetPlayer(15);
			Group("Player" + player + "BuildingTransfer").RemoveFromGroup("Player" + player + "BuildingTransfer");
			*/
			
			SetPlayerStatus(player, 1, Translate("You were eliminated"), true);
			SetPlayerStatus(player, 0, true);
			EnvWriteInt(player, "elimination", 1);
			EndGame(player, true); //true = lose
			
			return;
		}
		EnvWriteInt(player, "elimination", nTime);
		if (nTime%60 < 10)
		{
			SetPlayerStatus(player, 1,Translatef("You lose after %s1:0%s2 minutes", nTime/60, nTime%60), true);
		}
		else
		{
			SetPlayerStatus(player, 1,Translatef("You lose after %s1:%s2 minutes", nTime/60, nTime%60), true);
		}
		SetPlayerStatus(player, 0, true);
		Sleep(1000);
		if (!q.IsEmpty()) 
		{
			break;
		}
		nTime -= 1;
	}
	if (nTime==0) 
	{
		/* //PLAYER BUILDINGS BECAME NEUTRALS WHEN PLAYER IS BEEN ELIMINATED: 
		ClassPlayerObjs("Building", player).AddToGroup("Player" + player + "BuildingTransfer");
		ClassPlayerObjs("Stonehenge", player).RemoveFromGroup("Player" + player + "BuildingTransfer");
		ClassPlayerObjs("BaseRuins", player).RemoveFromGroup("Player" + player + "BuildingTransfer");
		ClassPlayerObjs("Teleport", player).RemoveFromGroup("Player" + player + "BuildingTransfer");
		Group("Player" + player + "BuildingTransfer").SetPlayer(15);
		Group("Player" + player + "BuildingTransfer").RemoveFromGroup("Player" + player + "BuildingTransfer");
		*/
		
		SetPlayerStatus(player, 1,Translate("You were eliminated"), true);
		SetPlayerStatus(player, 0, true);
		EnvWriteInt(player, "elimination", 1);
		EndGame(player, true); //true = lose
		return;
	}
	EnvWriteInt(player, "elimination", 0); //managed to recapture
}

