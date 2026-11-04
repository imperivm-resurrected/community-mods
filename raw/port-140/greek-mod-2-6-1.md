# greek-mod-2-6-1: to check by hand

121 items. In each conflict the mod's side was used.

## 1. DATA/COPYRIGHTS.TXT

```text
<<<<<<< HD
Haemimont Games, FX Interactive, ImperivmWorld (2021)
||||||| 1.40

Copyright(c) 2002-2004 Haemimont Games
=======
HaemimontGames, RattlesMake, GreekModTeam, I.E.C.
>>>>>>> mod
```

## 2. DATA/AI/CALCGAIKAPRIORITY.VS

```text
<<<<<<< HD
nActualPerc = 30;
if (!bExplored)
	nActualPerc = 70;
else if (set.IsStronghold())
	nActualPerc = 50;
else if (set.IsVillage())
	nActualPerc = 50;
else if (set.IsTeutonTent())
	nActualPerc = 100;
else if (set.IsOutpost())
{
	nActualPerc = 80;
	if (set.IsIndependent())
		nActualPerc = 90;
	if (AIVar(idPlayer, AIV_DonateGold) > 0)
	if (AIVar(idPlayer, AIV_TradeGold) > 0)
	{
		int nRace; nRace = set.GetCentralBuilding.race;
		if (nRace == RepublicanRome || nRace == Egypt)
||||||| 1.40
nActualPerc = 30;
if (!bExplored)
	nActualPerc = 70;
else if (set.IsStronghold())
	nActualPerc = 100;
else if (set.IsVillage())
	nActualPerc = 90;
else if (set.IsTeutonTent())
	nActualPerc = 80;
else if (set.IsOutpost())
{
	nActualPerc = 60;
	if (set.IsIndependent())
		nActualPerc = 80;
	if (AIVar(idPlayer, AIV_DonateGold) > 0)
	if (AIVar(idPlayer, AIV_TradeGold) > 0)
	{
		int nRace; nRace = set.GetCentralBuilding.race;
		if (nRace == RepublicanRome || nRace == Egypt)
=======
	if (AIVar(idPlayer, AIV_LuckyExplore) == 0)
		if (g.Explored(idPlayer))
			explored = true;

	if (!explored)
		nActualPerc = 70;
	else if (set.IsStronghold)
		nActualPerc = 100;
	else if (set.IsVillage) {
		nActualPerc = 90;
		if (set.IsIndependent)
>>>>>>> mod
```

## 3. DATA/AI/GETTACTICSCRIPT.VS

```text
<<<<<<< HD
int nRace;
int player;
int rnd;

if (!set.IsStronghold)
	return TS_NONE;

nRace = set.GetCentralBuilding.race;
player = set.player;
if (GetTime<2000)
{
	rnd = rand(100);
	if (nRace == Gaul)
	{
		if (rnd<100)	
			return TS_GaulTactic;
	}
	
	if (nRace == Iberia)
	{
		if (rnd<33)	
			return TS_IberianTactic;
		if (rnd<66)	
			return TS_IberianTactic2;
	}

	if (nRace == Germany)
	{
		if (rnd<33)	
			return TS_GermanyTactic;
		if (rnd<66)	
			return TS_GermanyTactic2;
	}

	if (nRace == Egypt)
	{
		if (rnd<50)	
			return TS_EgyptTactic;
	}

	if (nRace == Britain)
	{
		if (rnd<50)	
			return TS_BritishTactic;
	}

	if (nRace == Carthage)
	{
		if (rnd<33)	
			return TS_CarthageTactic;		
		if (rnd<66)	
			return TS_CarthageTactic2;					
	}
	if (nRace == RepublicanRome)
	{
		if (rnd<50)	
			return TS_RRomeTactic;		
	}
	if (nRace == ImperialRome)
	{
		if (rnd<33)	
			return TS_MRomeTactic;		
		if (rnd<66)	
			return TS_MRomeTactic;
	}
||||||| 1.40
int nRace;
int player;
int rnd;

if (!set.IsStronghold)
	return TS_NONE;

nRace = set.GetCentralBuilding.race;
player = set.player;
if (GetTime<2000)
{
	rnd = rand(100);
	if (nRace == Gaul)
	{
		if (rnd<33)	
			return TS_GaulTactic;
		if (rnd<66)	
			return TS_GaulTactic2;
	}
	
	if (nRace == Iberia)
	{
		if (rnd<33)	
			return TS_IberianTactic;
		if (rnd<66)	
			return TS_IberianTactic2;
	}

	if (nRace == Germany)
	{
		if (rnd<33)	
			return TS_GermanyTactic;
		if (rnd<66)	
			return TS_GermanyTactic2;
	}

	if (nRace == Egypt)
	{
		if (rnd<50)	
			return TS_EgyptTactic;
	}

	if (nRace == Britain)
	{
		if (rnd<50)	
			return TS_BritishTactic;
	}

	if (nRace == Carthage)
	{
		if (rnd<33)	
			return TS_CarthageTactic;		
		if (rnd<66)	
			return TS_CarthageTactic2;					
	}
	if (nRace == RepublicanRome)
	{
		if (rnd<50)	
			return TS_RRomeTactic;		
	}
	if (nRace == ImperialRome)
	{
		if (rnd<33)	
			return TS_MRomeTactic;		
		if (rnd<66)	
			return TS_MRomeTactic2;
	}
=======
if (set.IsStronghold) {
    if (GetTime() < 2000) {
        int nRace, rnd;
        nRace = set.GetCentralBuilding().race;
        rnd = rand(100);
        
        if (nRace == Gaul) {
            if (rnd < 30)         // 30% per TS_GaulTactic
                return TS_GaulTactic;
            if (rnd < 90)         // 60% per TS_GaulTactic2
                return TS_GaulTactic2;
            // 10% rimanente: nessuna tattica specifica
        }
        
        if (nRace == Iberia) {
            if (rnd < 30)         // 30% per TS_IberianTactic
                return TS_IberianTactic;
            if (rnd < 90)         // 60% per TS_IberianTactic2
                return TS_IberianTactic2;
        }
        
        if (nRace == Germany) {
            if (rnd < 30)         // 30% per TS_GermanyTactic
                return TS_GermanyTactic;
            if (rnd < 90)         // 60% per TS_GermanyTactic2
                return TS_GermanyTactic2;
        }
        
        if (nRace == Egypt) {
            if (rnd < 30)         // 30% per TS_EgyptTactic 
                return TS_EgyptTactic;
            if (rnd < 90)         // 60% per TS_EgyptTactic2 
                return TS_EgyptTactic2;
        }
        
        if (nRace == Britain) {
            if (rnd < 30)         // 30% per TS_BritishTactic
                return TS_BritishTactic;
            if (rnd < 90)         // 60% per TS_BritishTactic2
                return TS_BritishTactic2;
        }
        
        if (nRace == Carthage) {
            if (rnd < 100)
                return TS_CarthageTactic;
        }
        
        if (nRace == RepublicanRome) {
            /* L'AI SCEGLIE SE GIOCARE CON ROMA REPUBBLICANA O CON ROMA IMPERIALE O CON ROMA PUNICA: */
            if (EnvReadInt(set, "ChooseRomanRace") == 0) {
                int random;
                int REPUBLICAN = 0;
                int IMPERIAL = 1;
                int PUNIC = 2;
                
                if (EnvReadString(set, "AI_AIlovesRome") == "Republican") {
                    random = REPUBLICAN;
                }
                else if (EnvReadString(set, "AI_AIlovesRome") == "Imperial") {
                    random = IMPERIAL;
                }
                else if (EnvReadString(set, "AI_AIlovesRome") == "Punic") {
                    random = PUNIC;
                }
                else {
                    random = rand(3);
                }
                
                if (random == REPUBLICAN) {
                    EnvWriteString(set, "ChooseRepublicanRome", "researched");
                    EnvWriteInt(set, "ChooseRomanRace", 1);
                }
                if (random == IMPERIAL) {
                    EnvWriteString(set, "ChooseImperialRome", "researched");
                    EnvWriteInt(set, "ChooseRomanRace", 1);
                }
                if (random == PUNIC) {
                    EnvWriteString(set, "ChoosePunicRome", "researched");
                    EnvWriteInt(set, "ChooseRomanRace", 1);
                }
            }
            
            /* ESECUZIONE DI UNA TATTICA ROMANA DA PARTE DELLA AI: */
            if (EnvReadString(set, "ChooseRepublicanRome") == "researched") {
                if (rnd < 50)
                    return TS_RRomeTactic;
                else
                    return TS_RRomeTactic2;
            }
            
            if (EnvReadString(set, "ChoosePunicRome") == "researched") {
                if (rnd < 50)
                    return TS_PRomeTactic;
                else
                    return TS_PRomeTactic2;
            }
            
            if (EnvReadString(set, "ChooseImperialRome") == "researched") {
                if (rnd < 50)
                    return TS_MRomeTactic;
                else
                    return TS_MRomeTactic2;
            }
        }
        
        // Grecia = ImperialRome
        if (nRace == ImperialRome) {
            if (rnd < 30)         // 30% per TS_GreekTactic
                return TS_GreekTactic;
            if (rnd < 90)         // 60% per TS_GreekTactic2
                return TS_GreekTactic2;
            // 10% rimanente: nessuna tattica specifica
        }
    }
>>>>>>> mod
```

## 4. DATA/AI/GS_CAPTURE.VS

```text
<<<<<<< HD
				{
					i = squad.Count("Military");
					nMilAll += i;
					if (i > 0)
						if (squad.State == SS_Catapult)
							nMilInCats += i;
						else
							if (squad.State != SS_KillAll)
								squad.SetCmd(SS_KillAll, 0, SF_ADVCHOOSER, "ai_killall");
				}

			if (state == SS_Capture){
				if (!squad.Leader.AsHero.IsValid){
					if(squad.State != state){
						squad.SetCmd(state, 0, SF_ADVCHOOSER, "capture", set.GetCentralBuilding);
					}
				}
				else{
					if(squad.State != state){
						squad.SetCmd(state, 0, SF_ADVCHOOSER, "capture", set.GetCentralBuilding);
					}
				}
			}
||||||| 1.40
				{
					i = squad.Count("Military");
					nMilAll += i;
					if (i > 0)
						if (squad.State == SS_Catapult)
							nMilInCats += i;
						else
							if (squad.State != SS_KillAll)
								squad.SetCmd(SS_KillAll, 0, SF_ADVCHOOSER, "ai_killall");
				}

			if (state == SS_Capture)
			if (squad.State != SS_Capture || !squad.Leader.AsHero.IsValid)
				squad.SetCmd(SS_Capture, 0, SF_ADVCHOOSER, "capture", set.GetCentralBuilding);
=======
					break;
			if (state == SS_Capture)
				if (own + ally < 2000)
					if (ownC + allyC < 5)
						if (!set.IsIndependent)
							break;
		}
		if (state == SS_Capture)
			if (nEnemyInsidePerc < 50)
				if (ownC < enemyC * 8)
					state = SS_KillAll;
>>>>>>> mod
```

## 5. DATA/AI/HEROSKILL DEFAULT.VS

```text
<<<<<<< HD
    "Defensive cry.vs",
	"Administration.vs",
	"Team attack.vs",
	"Team defense.vs",
	"Quick March.vs",
	"Epic endurance.vs",
	"Discipline.vs",
	"Leadership.vs",
	"Epic attack.vs",
	"Battle cry.vs",
	"Healing.vs",
	"Ceasefire.vs",
	"Vigor.vs",
	"Frenzy.vs",
	"Rush.vs",
	"Egoism.vs",
	"Wisdom.vs",
	"Recovery.vs",
	"Survival.vs",
	"Charge.vs",
	"Scout.vs",
	"Assault.vs",
	"Epic armor.vs",
	"Concealment.vs",
	"Euphoria.vs"
||||||| 1.40
	"Administration.vs",
	"Team attack.vs",
	"Team defense.vs",
	"Quick March.vs",
	"Epic endurance.vs",
	"Discipline.vs",
	"Leadership.vs",
	"Epic attack.vs",
	"Battle cry.vs",
	"Healing.vs",
	"Ceasefire.vs",
	"Vigor.vs",
	"Frenzy.vs",
	"Rush.vs",
	"Egoism.vs",
	"Wisdom.vs",
	"Recovery.vs",
	"Survival.vs",
	"Charge.vs",
	"Scout.vs",
	"Assault.vs",
	"Epic armor.vs",
	"Concealment.vs",
	"Defensive cry.vs",
	"Euphoria.vs"
=======
NOTES ABOUT HEKO SKILL SCRIPTS:
- skill_points contains the current/goal skill points
- weight contains a default value (100) and affects the development of a skill (weight = 0 stops it, be careful with that)
- the chance to develop a skill is equal to the weight divided by the sum of all hero skill weights
- Every such script file should have the same params of "Default.vs"
- it is possible to use different scripts for different AI profiles in their respective folders

This is the list of all possible hero skill scripts:
- "Default.vs", which is run when there is no script file for the respective skill
- "Administration.vs"
- "Team attack.vs"
- "Team defense.vs"
- "Quick March.vs"
- "Epic endurance.vs"
- "Discipline.vs"
- "Leadership.vs"
- "Epic attack.vs"
- "Battle cry.vs"
- "Healing.vs"
- "Ceasefire.vs"
- "Vigor.vs"
- "Frenzy.vs"
- "Rush.vs"
- "Egoism.vs"
- "Wisdom.vs"
- "Recovery.vs"
- "Survival.vs"
- "Charge.vs"
- "Scout.vs"
- "Assault.vs"
- "Epic armor.vs"
- "Concealment.vs"
- "Defensive cry.vs"
- "Euphoria.vs"
>>>>>>> mod
```

## 6. DATA/AI/TS_GAULTACTIC.VS

```text
<<<<<<< HD

||||||| 1.40
	int i=0;
	int nDruids = 2;
	cmd = "trainGArcher";
	while(!hero.IsValid() || olDruids.count<nDruids || i<5)
	{
		int nCount;
		if (!hero.IsValid())
			hero = set.TSRecruitHero();
		if (olDruids.count<nDruids)
		{
			nCount = nDruids - olDruids.count;			 
			olDruids.AddList(set.TSTempleRecruit(nCount));
		}
		
		if (i<5)
		{
			point ptDummy; Obj objDummy;
			Barrack barrack;
			barrack = set.BestBarrack(5);
			if (barrack.IsValid)
			if (GetCmdCost(cmd, gold, food))
			{
				set.SpentGoldOnArmy((gold + (food / 2)));
				barrack.ExecCmd(cmd, ptDummy, objDummy, false);
			}	
			i+=1;			
		}
		Sleep(3020 + rand(15)*130);		
	}
=======
	int i=0;
	int nDruids = 2;
	bool bFreeBeer = false;
	bool bFoodTax = false;
	cmd = "trainGArcher";
	while(!hero.IsValid() || olDruids.count<nDruids || i<5 || !bFreeBeer || !bFoodTax)
	{
		int nCount;
		
		// Ricerca Free Beer
		if (!bFreeBeer)
			bFreeBeer = set.TSResearch("Free Beer");
		
		// Ricerca Food Tax (solo dopo Free Beer)
		if (bFreeBeer && !bFoodTax)
			bFoodTax = set.TSResearch("Food Tax");
		
		if (!hero.IsValid())
			hero = set.TSRecruitHero();
		if (olDruids.count<nDruids)
		{
			nCount = nDruids - olDruids.count;			 
			olDruids.AddList(set.TSTempleRecruit(nCount));
		}
		
		if (i<5)
		{
			point ptDummy; Obj objDummy;
			Barrack barrack;
			barrack = set.BestBarrack(5);
			if (barrack.IsValid)
			if (GetCmdCost(cmd, gold, food))
			{
				set.SpentGoldOnArmy((gold + (food / 2)));
				barrack.ExecCmd(cmd, ptDummy, objDummy, false);
			}	
			i+=1;			
		}
		Sleep(3020 + rand(15)*130);		
	}
>>>>>>> mod
```

## 7. DATA/AI HELPERS/SIEGE.VS

```text
<<<<<<< HD
	ol = qryDef.GetObjList();
	if (set.UnitsCount == 0)
		bToSiege = false;
	else {
		Query ProtectiveArea, EnemyUnits;
		ProtectiveArea = ObjsInSight(set.GetCentralBuilding, "Unit");
		EnemyUnits = Intersect(ProtectiveArea, EnemyObjs(AIPlayer, "Unit"));
		nEnemies = set.UnitsCount + EnemyUnits.count;
		bToSiege = ol.count < 2 * nEnemies;
	}
	bSieging = false;
	while (1)
	{
		bool bCat = false;	
		ol = qryDef.GetObjList();
		if (ol.count <= 0)
			break;
		if (!oTarget.IsEnemy(ol[0]))
			break;
		/// siege logic
		if (set.UnitsCount == 0)
			bToSiege = false; /// siege when there are many enemies
		else
		{	/// calculate enemies
			Query ProtectiveArea, EnemyUnits;
			ProtectiveArea = ObjsInSight(set.GetCentralBuilding, "Unit");
			EnemyUnits = Intersect(ProtectiveArea, EnemyObjs(AIPlayer, "Unit"));
			nEnemies = set.UnitsCount + EnemyUnits.count;
			if (ol.count <= nEnemies)
				bToSiege = true; /// siege when there are many enemies
		}
		if (bSieging) if (ol.count > 4 * nEnemies)
			{ bSieging = false;	bToSiege = false; } /// capture when our army is too larger
		if (!bSieging) if (bToSiege)
		{	/// start sieging
			nMaxCatapults = ol.count / 15;
			if (nMaxCatapults <= 0)
				nMaxCatapults = 1;
			ol.Siege(oTarget, nMaxCatapults, 0);
			bSieging = true;
		}
		bToSiege = bSieging;
		for (j = 0; j < ol.count; j += 1)
		{
			u = ol[j].AsUnit;
			if (!u.IsValid)
				continue;
			if (u.hero.IsValid)
				 continue;
			if (u.InHolder)	{
				bCat = true;
				if (bSieging)
					continue;
				u.SetCommand("advance", oTarget.pos);
			}
			if (u.command == "build_catapult")
				bCat = true;
			if (u.command == "engage")
				uEnemy = u.BestTargetInSquadSight.AsUnit;
			if (u.command != "idle" && u.command != "attack" && u.command != "move" && u.command != "advance")
				continue;
			if (uEnemy.IsAlive)	if (rand(3) == 0)
				{ u.SetCommand("advance", uEnemy.pos); continue; }
			if (!bSieging)
				if (u.DistTo(oTarget) < 500)
					if (u.command != "capture")
						u.SetCommand("capture", oTarget);
				else
					if (u.command != "advance")
						u.SetCommand("advance", oTarget.pos);
			else
			{
				pt = u.pos - oTarget.pos;
				n = pt.Len + 1;
				if (n < 900 || n > 1000) {
					pt = pt * (900 + rand(100)) / n;
					pt = pt + oTarget.pos;
					pt.IntoRect(rcMap);
					u.SetCommand("advance", pt);
				}
			}
		}
		if (bSieging && !bCat)
			bSieging = false;	
		Sleep(2000);
	}
	/// stop catapults
	for (j = 0; j < ol.count; j += 1)
	{
		u = ol[j].AsUnit;
		if (!u.IsValid) continue;
		if (u.hero.IsValid) continue;
		if (u.GetHolderSett.IsValid)	{
			Catapult cat;	cat = u.GetHolderSett.GetCentralBuilding.AsCatapult;
			if (cat.IsValid) cat.SetCommand("stop");
		}
	}
||||||| 1.40
	ol = qryDef.GetObjList();
	if (set.UnitsCount == 0)
		bToSiege = false;
	else {
		Query ProtectiveArea, EnemyUnits;
		ProtectiveArea = ObjsInSight(set.GetCentralBuilding, "Unit");
		EnemyUnits = Intersect(ProtectiveArea, EnemyObjs(AIPlayer, "Unit"));
		nEnemies = set.UnitsCount + EnemyUnits.count;
		bToSiege = ol.count < 2 * nEnemies;
	}
	bSieging = false;
	while (1)
	{
		bool bCat = false;	
		ol = qryDef.GetObjList();
		if (ol.count <= 0)
			break;
		if (!oTarget.IsEnemy(ol[0]))
			break;
		/// siege logic
		if (set.UnitsCount == 0)
			bToSiege = false; /// siege when there are many enemies
		else
		{	/// calculate enemies
			Query ProtectiveArea, EnemyUnits;
			ProtectiveArea = ObjsInSight(set.GetCentralBuilding, "Unit");
			EnemyUnits = Intersect(ProtectiveArea, EnemyObjs(AIPlayer, "Unit"));
			nEnemies = set.UnitsCount + EnemyUnits.count;
			if (ol.count <= nEnemies)
				bToSiege = true; /// siege when there are many enemies
		}
		if (bSieging) if (ol.count > 4 * nEnemies)
			{ bSieging = false;	bToSiege = false; } /// capture when our army is too larger
		if (!bSieging) if (bToSiege)
		{	/// start sieging
			nMaxCatapults = ol.count / 15;
			if (nMaxCatapults <= 0)
				nMaxCatapults = 1;
			ol.Siege(oTarget, nMaxCatapults, 0);
			bSieging = true;
		}
		bToSiege = bSieging;
		for (j = 0; j < ol.count; j += 1)
		{
			u = ol[j].AsUnit;
			if (!u.IsValid)
				continue;
			if (u.hero.IsValid)
				 continue;
			if (u.InHolder)	{
				bCat = true;
				if (bSieging)
					continue;
				u.SetCommand("advance", oTarget.pos);
			}
			if (u.command == "build_catapult")
				bCat = true;
			if (u.command == "engage")
				uEnemy = u.BestTargetInSquadSight.AsUnit;
			if (u.command != "idle" && u.command != "attack" && u.command != "move" && u.command != "advance")
				continue;
			if (uEnemy.IsAlive)	if (rand(3) == 0)
				{ u.SetCommand("advance", uEnemy.pos); continue; }
			if (!bSieging)
				if (u.DistTo(oTarget) < 500)
					u.SetCommand("capture", oTarget);
				else
					u.SetCommand("advance", oTarget.pos);
			else
			{
				pt = u.pos - oTarget.pos;
				n = pt.Len + 1;
				if (n < 900 || n > 1000) {
					pt = pt * (900 + rand(100)) / n;
					pt = pt + oTarget.pos;
					pt.IntoRect(rcMap);
					u.SetCommand("advance", pt);
				}
			}
		}
		if (bSieging && !bCat)
			bSieging = false;	
		Sleep(2000);
	}
	/// stop catapults
	for (j = 0; j < ol.count; j += 1)
	{
		u = ol[j].AsUnit;
		if (!u.IsValid) continue;
		if (u.hero.IsValid) continue;
		if (u.GetHolderSett.IsValid)	{
			Catapult cat;	cat = u.GetHolderSett.GetCentralBuilding.AsCatapult;
			if (cat.IsValid) cat.SetCommand("stop");
		}
	}
=======
	if (main_target.IsValid) {
		Query q_siegers;
		ObjList ol_siegers;
>>>>>>> mod
```

## 8. DATA/AI HELPERS/SIEGE.VS

```text
<<<<<<< HD
	ol = qryDef.GetObjList();
	if (ol.count <= 0)
		return;
	oTarget = set.GetCentralBuilding;
	for (j = 0; j < ol.count; j += 1)
	{
		u = ol[j].AsUnit;
		if (!u.IsValid) continue;
		if (u.hero.IsValid) continue;
		if (u.GetHolderSett.IsValid)	{
			Catapult cat;	cat = u.GetHolderSett.GetCentralBuilding.AsCatapult;
			if (cat.IsValid) cat.SetCommand("stop");
		}
		pt.Set(0, oTarget.radius + rand(60));
		pt.Rot(rand(360));
		pt = pt + oTarget.pos;
		pt.IntoRect(rcMap);
		u.SetCommand("advance", pt);
	}
	while (1)
	{
		ol = qryDef.GetObjList();
		if (ol.count <= 0)
			return;
		if (!oTarget.IsEnemy(ol[0]))
			break;
		for (j = 0; j < ol.count; j += 1)
		{
			u = ol[j].AsUnit;
			if (!u.IsValid) continue;
			if (u.hero.IsValid) continue;
			if (u.command != "idle")
			if (u.command != "stand_position")
			if (u.command != "capture")
				continue;
			if (rand(30) == 0)
			{
				pt.Set(0, oTarget.radius + rand(60));
				pt.Rot(rand(360));
				pt = pt + oTarget.pos;
				pt.IntoRect(rcMap);
				if (u.command != "advance")
					u.SetCommand("advance", pt);
			} else
				if (u.command != "capture")
					u.SetCommand("capture", oTarget);
		}
		Sleep(2000);
	}
	return;
}	/// end Townhall
||||||| 1.40
	ol = qryDef.GetObjList();
	if (ol.count <= 0)
		return;
	oTarget = set.GetCentralBuilding;
	for (j = 0; j < ol.count; j += 1)
	{
		u = ol[j].AsUnit;
		if (!u.IsValid) continue;
		if (u.hero.IsValid) continue;
		if (u.GetHolderSett.IsValid)	{
			Catapult cat;	cat = u.GetHolderSett.GetCentralBuilding.AsCatapult;
			if (cat.IsValid) cat.SetCommand("stop");
		}
		pt.Set(0, oTarget.radius + rand(60));
		pt.Rot(rand(360));
		pt = pt + oTarget.pos;
		pt.IntoRect(rcMap);
		u.SetCommand("advance", pt);
	}
	while (1)
	{
		ol = qryDef.GetObjList();
		if (ol.count <= 0)
			return;
		if (!oTarget.IsEnemy(ol[0]))
			break;
		for (j = 0; j < ol.count; j += 1)
		{
			u = ol[j].AsUnit;
			if (!u.IsValid) continue;
			if (u.hero.IsValid) continue;
			if (u.command != "idle")
			if (u.command != "stand_position")
			if (u.command != "capture")
				continue;
			if (rand(30) == 0)
			{
				pt.Set(0, oTarget.radius + rand(60));
				pt.Rot(rand(360));
				pt = pt + oTarget.pos;
				pt.IntoRect(rcMap);
				u.SetCommand("advance", pt);
			} else
				u.SetCommand("capture", oTarget);
		}
		Sleep(2000);
	}
	return;
}	/// end Townhall
=======
						gate = set.BestGate(ol_siegers[0].pos);
>>>>>>> mod
```

## 9. DATA/CLASSES/CNUMIDIANRIDER.SC.XML

```text
<<<<<<< HD
	<sounds command="data/sound entities/VoiceCNumidianRider.xml"/>
	<method sig="ondie" vs="data/subai/cmercenary_ondie.vs"/>
    <behavior script="data/subai/keensight_observe.vs"/>
||||||| 1.40
	<sounds command="data/sound entities/VoiceCNumidianRider.xml"/>
	<method sig="ondie" vs="data/subai/cmercenary_ondie.vs"/>
	<behavior script="data/subai/keensight_observe.vs"/>
=======
    <method sig="ondie" vs="data/subai/cmercenary_ondie.vs"/>
	<sounds command="data/sound entities/VoiceCHorseman.xml"/>
	<!--given ONLY by the behaviour script-->
	<method sig="enter_tent" vs="data/subai/teuton_enter_tent.vs"/>
>>>>>>> mod
```

## 10. DATA/CLASSES/HERO.SC.XML

```text
<<<<<<< HD
<class id="Hero" cpp_class="CVXHero" parent="Military" entity="">
	<properties range="17" min_range="2"/>
	<properties damage_type="slash"/>
	<properties heroarmyexpgain="40"/>
	<properties maxhealth="1000"/>
	<properties sight="600" speed="120"/>
	<properties max_army="50"/>
	<properties formation_priority="1100"/>
	<properties formation_radius="45"/>
	<properties radius="30" selection_radius="32"/>
	<properties damage="40" armor_slash="20" armor_pierce="20"/>
	<properties target_factor="200"/>
	<properties interface="thumb,hero,items,holder"/>
	<properties healthbar_type="3"/>
	<behavior script="data/subai/hero_skill_behaviour.vs"/>
	<method sig="sleep" vs="data/subai/object_idle.vs"/>
	<method sig="idle" vs="data/subai/hero_idle.vs"/>
	<method sig="uiadvance" vs="data/subai/hero_advance.vs"/>
	<method sig="uipatrol" vs="data/subai/hero_patrol.vs"/>
	<method sig="uimove" vs="data/subai/hero_smartmove.vs"/>
	<method sig="patrol" vs="data/subai/hero_patrol.vs"/>
	<method sig="advance" vs="data/subai/hero_advance.vs"/>
	<method sig="attack" vs="data/subai/hero_attack.vs" verify="data/subai/unit_attack_verify.vs"/>
	<method sig="attack" vs="data/subai/hero_advance.vs"/>
	<method sig="smartmove" vs="data/subai/hero_smartmove.vs"/>
	<method sig="move" vs="data/subai/hero_move.vs"/>
	<method sig="enter" vs="data/subai/hero_enter.vs" verify="data/subai/unit_enter_verify.vs"/>
    <method sig="hero_set_final_party_orientation" vs="data/subai/hero_set_final_party_orientation.vs"/>
	<method sig="formation" vs="data/subai/hero_formation.vs"/>
||||||| 1.40
<class id="Hero" cpp_class="CVXHero" parent="Military" entity="">
	<properties range="17" min_range="2"/>
	<properties damage_type="slash"/>
	<properties heroarmyexpgain="40"/>
	<properties maxhealth="1000"/>
	<properties sight="600" speed="120"/>
	<properties max_army="50"/>
	<properties formation_priority="1100"/>
	<properties formation_radius="45"/>
	<properties radius="30" selection_radius="32"/>
	<properties damage="40" armor_slash="20" armor_pierce="20"/>
	<properties target_factor="200"/>
	<properties interface="thumb,hero,items,holder"/>
	<properties healthbar_type="3"/>
	<behavior script="data/subai/hero_skill_behaviour.vs"/>
	<method sig="sleep" vs="data/subai/object_idle.vs"/>
	<method sig="idle" vs="data/subai/hero_idle.vs"/>
	<method sig="uiadvance" vs="data/subai/hero_advance.vs"/>
	<method sig="uipatrol" vs="data/subai/hero_patrol.vs"/>
	<method sig="uimove" vs="data/subai/hero_smartmove.vs"/>
	<method sig="patrol" vs="data/subai/hero_patrol.vs"/>
	<method sig="advance" vs="data/subai/hero_advance.vs"/>
	<method sig="attack" vs="data/subai/hero_attack.vs" verify="data/subai/unit_attack_verify.vs"/>
	<method sig="attack" vs="data/subai/hero_advance.vs"/>
	<method sig="smartmove" vs="data/subai/hero_smartmove.vs"/>
	<method sig="move" vs="data/subai/hero_move.vs"/>
	<method sig="enter" vs="data/subai/hero_enter.vs" verify="data/subai/unit_enter_verify.vs"/>
	<method sig="formation" vs="data/subai/hero_formation.vs"/>
=======
<class id="Hero" parent="Military" cpp_class="CVXHero">
	<properties maxhealth="1000" />
	<properties damage="40" damage_type="slash" />
	<properties armor_slash="20" armor_pierce="20" />
	<properties sight="600" speed="120" />
	<properties range="17" min_range="2" />
	<properties target_factor="200" />
	<properties formation_priority="1100" formation_radius="45" />
	<properties max_army="50" />
	<properties heroarmyexpgain="40" />
	<properties radius="30" selection_radius="32" />
	<properties healthbar_type="3" />
	<properties interface="thumb,hero,items,holder" />
	<properties inventory_size="5" />
<!-- custom ability  <behavior script="data/subai/hero_endurance_skill_behavior.vs"/> -->
	<behavior script="data/subai/hero_skill_behaviour.vs" />
	<behavior script="data/subai/hero_discipline_skill_behavior.vs"/>  
	<method sig="sleep" vs="data/subai/hero_sleep.vs" />
	<method sig="idle" vs="data/subai/hero_idle.vs" />
	<method sig="uiadvance" vs="data/subai/hero_advance.vs" />
	<method sig="uipatrol" vs="data/subai/hero_patrol.vs" />
	<method sig="uimove" vs="data/subai/hero_smartmove.vs" />
	<method sig="patrol" vs="data/subai/hero_patrol.vs" />
	<method sig="advance" vs="data/subai/hero_advance.vs" />
	<method sig="attack" vs="data/subai/hero_attack.vs" verify="data/subai/unit_attack_verify.vs" />
	<method sig="attack" vs="data/subai/hero_advance.vs" />
	<method sig="smartmove" vs="data/subai/hero_smartmove.vs" />
	<method sig="move" vs="data/subai/hero_move.vs" />
	<method sig="enter" vs="data/subai/hero_enter.vs" verify="data/subai/unit_enter_verify.vs" />
	<method sig="hero_set_final_party_orientation" vs="data/subai/hero_set_final_party_orientation.vs"/>
	<method sig="formation" vs="data/subai/hero_formation.vs" />
>>>>>>> mod
```

## 11. DATA/CLASSES/IMOUNTAINEER.SC.XML

```text
<<<<<<< HD
    <behavior script="data/subai/sneak_behavior.vs"/>
||||||| 1.40
	<behavior script="data/subai/sneak_behavior.vs"/>
=======

>>>>>>> mod
```

- `DATA/CLASSES/ISCOUT.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 13. DATA/CLASSES/RCATAPULT.SC.XML

```text
<<<<<<< HD
	<defaultcmd target="Building">
		<cmd name="catapult_attack"/>
		<cmd name="catapult_attack" ctrl="1"/>
	</defaultcmd>
	<defaultcmd target="Unit">
		<cmd name="catapult_attack"/>
		<cmd name="catapult_attack" ctrl="1"/>
	</defaultcmd>
	<value1
		icon="gameres/infobar/common/attack ico.bmp"
		script="return .damage;"
		help="/contents/stats/attack"
		rollover="Damage"/>
	<value2
		icon="gameres/infobar/common/stamina ico.bmp"
		script="return 10;"
		help="/contents/stats/stamina"
		rollover="Stamina"/>
	<value3
		icon="gameres/infobar/common/defense ico.bmp"
		script="return 20;"
		help="/contents/stats/defense"
		rollover="Armor"/>
	<value4
		icon="gameres/infobar/common/health ico.bmp"
		script="return .health + '/' + .maxhealth;"
		help="/contents/stats/health"
		rollover="Health"/>
||||||| 1.40
	<defaultcmd target="Building">
		<cmd name="catapult_attack"/>
		<cmd name="catapult_attack" ctrl="1"/>
	</defaultcmd>
	<defaultcmd target="Unit">
		<cmd name="catapult_attack"/>
		<cmd name="catapult_attack" ctrl="1"/>
	</defaultcmd>
=======

>>>>>>> mod
```

- `DATA/CLASSES/RHERO4.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/CLASSES/TGUARDPOSTSENTRY.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 16. DATA/CLASSES/THUNTRESS.SC.XML

```text
<<<<<<< HD
	<sounds command="data/sound entities/VoiceTHuntress.xml"/>
    <behavior script="data/subai/sneak_behavior.vs"/>
||||||| 1.40
	<sounds command="data/sound entities/VoiceTHuntress.xml"/>
	<behavior script="data/subai/sneak_behavior.vs"/>
=======
	<sounds die="data/sound entities/UNITDEATHFEMALE.xml" 
			attack="MyrmidonFight"
			command="data/sound entities/VoiceTHuntress.xml"/>
	<!-- <value4
		icon="gameres/infobar/unit specials/resilient attack.bmp"
		script="return .AsUnit.health + '/' + .AsUnit.maxhealth;"
		help="/contents/stats/health"
		rollover="Health | This unit have the special 'Hard Train' that add +1 damage and +10 max health every 5 levels. "/>
	<behavior script="data/subai/Hard_Train_behavior.vs"/> -->
>>>>>>> mod
```

## 17. DATA/CLASSES/TTENT.SC.XML

```text
<<<<<<< HD
	<behavior script="data/subai/ttent_feeding_behavior.vs"/>
	<method sig="createfoodmulesmall" vs="data/subai/create_food_mule_small.vs"/>
	<method sig="createfoodmulebig"   vs="data/subai/create_food_mule_big.vs"/>
	<method sig="creategoldmulebig"   vs="data/subai/create_gold_mule_big.vs"/>
	<method sig="teutonProduction"    vs="data/subai/ttent_teuton_production.vs"/>
||||||| 1.40
	<behavior script="data/subai/ttent_feeding_behavior.vs"/>
=======
	<behavior script="data/subai/tent_feeding_behavior.vs"/>
	<method sig="unitsout"            vs="data/subai/townhall_unitsout.vs"/>
	<method sig="createfoodmulesmall" vs="data/subai/create_food_mule_small.vs"/>
	<method sig="createfoodmulebig"   vs="data/subai/create_food_mule_big.vs"/>
	<method sig="creategoldmulebig"   vs="data/subai/create_gold_mule_big.vs"/>
	<method sig="teutonProduction"    vs="data/subai/ttent_teuton_production.vs"/>
>>>>>>> mod
```

- `DATA/CLASSES/TTEUTONWOLF.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 19. DATA/CLASSES/UNIT.SC.XML

```text
<<<<<<< HD
	<value0
		icon="gameres/infobar/common/level ico.bmp"
		script="return .AsUnit.level;"
		help="/contents/stats/level"
		rollover="Level"/>
	<value1
		icon="gameres/infobar/common/attack ico.bmp"
		script="return .AsUnit.damage;"
		help="/contents/stats/attack"
		rollover="Damage"/>
	<value2
		icon="gameres/infobar/common/stamina ico.bmp"
		script="return .AsUnit.stamina +' | '+.AsUnit.speed;"
		help="/contents/stats/stamina"
		rollover="Stamina | Speed"/>
	<value3
		icon="gameres/infobar/common/defense ico.bmp"
		script="return .AsUnit.armor_slash;"
		help="/contents/stats/defense"
		rollover="Armor"/>
	<value4
		icon="gameres/infobar/common/health ico.bmp"
		script="return .AsUnit.health + '/' + .AsUnit.maxhealth;"
		help="/contents/stats/health"
		rollover="Health"/>
	<value5
		icon="gameres/infobar/common/food ico.bmp"
		script="return .AsUnit.food + '/' + .AsUnit.maxfood + ' | ' +.AsUnit.sight;"
		help="/contents/feeding"
		rollover="Food | Sight"/>
||||||| 1.40
	<method sig="hero_set_final_party_orientation" vs="data/subai/hero_set_final_party_orientation.vs"/>
	<value0
		icon="gameres/infobar/common/level ico.bmp"
		script="return .AsUnit.level;"
		help="/contents/stats/level"
		rollover="Level"/>
	<value1
		icon="gameres/infobar/common/attack ico.bmp"
		script="return .AsUnit.damage;"
		help="/contents/stats/attack"
		rollover="Damage"/>
	<value2
		icon="gameres/infobar/common/stamina ico.bmp"
		script="return .AsUnit.stamina;"
		help="/contents/stats/stamina"
		rollover="Stamina"/>
	<value3
		icon="gameres/infobar/common/defense ico.bmp"
		script="return .AsUnit.armor_slash;"
		help="/contents/stats/defense"
		rollover="Armor"/>
	<value4
		icon="gameres/infobar/common/health ico.bmp"
		script="return .AsUnit.health + '/' + .AsUnit.maxhealth;"
		help="/contents/stats/health"
		rollover="Health"/>
	<value5
		icon="gameres/infobar/common/food ico.bmp"
		script="return .AsUnit.food + '/' + .AsUnit.maxfood;"
		help="/contents/feeding"
		rollover="Food"/>
=======
	<method sig="hero_set_final_party_orientation" vs="data/subai/hero_set_final_party_orientation.vs"/>
	<behavior script="data/subai/keensight_observe_and_sneak_behavior.vs"/>
	<value0 icon="gameres/infobar/common/level ico.bmp"
		script="return .AsUnit().level;"
		help="contents/stats/level"
		rollover="Level"
	/>
	<value1 icon="gameres/infobar/common/attack ico.bmp"
		script="return .AsUnit().damage;"
		help="contents/stats/attack"
		rollover="Damage"
	/>
	<value2 icon="gameres/infobar/common/stamina ico.bmp"
		script="return .AsUnit().stamina + '|' + .AsUnit().speed;"
		help="contents/stats/stamina"
		rollover="Stamina|Speed"
	/>
	<value3 icon="gameres/infobar/common/defence ico.bmp"
		script="return .AsUnit().armor_slash + '|' + .AsUnit().sight;"
		help="contents/stats/defense"
		rollover="Armor|Sight"
	/>
	<value4 icon="gameres/infobar/common/health ico.bmp"
		script="return .AsUnit().health + '/' + .AsUnit().maxhealth;"
		help="contents/stats/health"
		rollover="Health"
	/>
	<value5 icon="gameres/infobar/common/food ico.bmp"
		script="return .AsUnit().food + '/' + .AsUnit().maxfood;"
		help="contents/feeding"
		rollover="Food"
	/>
>>>>>>> mod
```

- `DATA/CLASSES/WHORSE.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 21. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	param="SetsSet, levels/Hero, 4, NameSet, Gladiator Shows, default">
	<src obj="MArena"/>
||||||| 1.40
	param="NameSet, Gladiator Shows, default">
	<src obj="MArena"/>
=======
	param="NameSet, Gladiator Shows, default, NameSet, RGladiator, default" >
	<src obj="RArena"/>
>>>>>>> mod
```

## 22. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, SetsPlr, standard_spawn_level, 12, NamePlr, Standartization III, default">
	<src obj="MArena"/>
||||||| 1.40
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, NamePlr, Flexibility, default">
	<src obj="MArena"/>
=======
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, SetsPlr, standard_spawn_level, 12, NamePlr, Flexibility, default">
	<src obj="RArena"/>
</cmd>
<cmd name="Veteran's guild" priority="6"
	button="upgrades/veteran roman.bmp"
	key="v"
	queueicon="gameres/icons/upgrades/veteran roman.bmp"
	costgold = "3000"
	costfood = "0"
	execdelay = "30000"
	groupverifier="data/subai/verify_research.vs"
	rollover="Veteran's guild"
	description="The newly equipped warriors become stronger after their first kill"
	method="research"
	researchcommand="yes"
	param="ReqSet, Gladiator Shows, default, NameSet, Veteran's guild, default, SetsSet, items/Veteran Guild, 1">
	<src obj="RArena"/>
>>>>>>> mod
```

- `DATA/COMMANDS/TTENT.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 24. DATA/COMMANDS/UNIT.XML

```text
<<<<<<< HD
</cmd>
<cmd name="reveal" priority="8"
	button="Actions/reveal.bmp"
	groupverifier="data/subai/unit_reveals_verify.vs"
	voidgroupdispatch="1"
	groupdispatch="data/subai/unit_reveals.vs"
	key="q"
	rollover="Reveal"
	description="Show this unit if hidden"
>
	<src obj="Unit" sticky="yes"/>
||||||| 1.40
	<nsrc obj="RChariot"/>
	<nsrc obj="RLiberatus"/>
=======
	<nsrc obj="RChariot"/>
</cmd>
<cmd name="reveal" priority="8"
	button="Actions/reveal.bmp"
	groupverifier="data/subai/unit_reveals_verify.vs"
	voidgroupdispatch="1"
	groupdispatch="data/subai/unit_reveals.vs"
	key="q"
	rollover="Reveal"
	description="Show this unit if hidden"
>
	<src obj="Unit" sticky="yes"/>
>>>>>>> mod
```

## 25. DATA/COMMANDS/VILLAGE.XML

```text
<<<<<<< HD
<!-- 
<cmd name="routpost_interest" priority="1"
	button="states/trade.bmp"
	immediate="yes"
	traincommand="no"
	method="routpost_interest"
	groupverifier="data/subai/group_routpost_interest_verifiy.vs"
	param="yes"
	rollover="Start trade"
	costgold="500">
	<src obj="ROutpost"/>
</cmd>
<cmd name="routpost_no_interest" priority="1"
	button="states/Stop Trade.bmp"
	immediate="yes"
	traincommand="no"
	method="routpost_interest"
	groupverifier="data/subai/group_routpost_no_interest_verifiy.vs"
	param="no"
	rollover="Stop trade">
	<src obj="ROutpost"/>
</cmd>
-->
<!--
<cmd name="callIScout" priority="4"
	button="actions/train IScout.bmp"
	queueicon="gameres/icons/IScout.bmp"
	groupverifier="data/subai/verify_scout_train.vs"
	transpicon="1"
	traincommand="yes"
||||||| 1.40
<!-- 
<cmd name="routpost_interest" priority="1"
	button="states/trade.bmp"
	immediate="yes"
	traincommand="no"
	method="routpost_interest"
	groupverifier="data/subai/group_routpost_interest_verifiy.vs"
	param="yes"
	rollover="Start trade"
	costgold="500">
	<src obj="ROutpost"/>
</cmd>
<cmd name="routpost_no_interest" priority="1"
	button="states/Stop Trade.bmp"
	immediate="yes"
	traincommand="no"
	method="routpost_interest"
	groupverifier="data/subai/group_routpost_no_interest_verifiy.vs"
	param="no"
	rollover="Stop trade">
	<src obj="ROutpost"/>
</cmd>
-->
<cmd name="goutpost_sellfood" priority="1"
	button="states/sell food.bmp"
	immediate="yes"
	traincommand="no"
	method="goutpost_sellfood"
	param="yes"
	groupverifier="data/subai/group_goutpost_sell_food_verifiy.vs"
	key="s"
	rollover="Sell food"
	description="Slowly exchanges stored food for gold">
	<src obj="GOutpost"/>
	<src obj="TOutpost"/>
</cmd>
<cmd name="goutpost_no_sellfood" priority="1"
	button="states/Stop Selling Food.bmp"
	immediate="yes"
	traincommand="no"
	method="goutpost_sellfood"
	param="no"
	groupverifier="data/subai/group_goutpost_no_sell_food_verifiy.vs"
=======
<cmd name="callIScout" priority="4"
	button="actions/train IScout.bmp"
	queueicon="gameres/icons/IScout.bmp"
	groupverifier="data/subai/verify_scout_train.vs"
	transpicon="1"
	traincommand="yes"
>>>>>>> mod
```

- `DATA/GAMESCRIPTS/5 ALTERNATIVE.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 27. DATA/SOUND ENTITIES/VOICERGLADIATOR.XML

```text
<<<<<<< HD
      <sound file="CurrentLang/voices/RGladiator/1.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/2.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/3.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/4.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/5.wav" frequency="20"/>
||||||| 1.40
      <sound file="CurrentLang/voices/RGladiator/There's no weapon like mine.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/We fight to the death.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/We live to win.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/We mortals salute you.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RGladiator/We win to live.wav" frequency="20"/>
=======
      <sound file="CurrentLang/voices/RGladiator/There's no weapon like mine.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/We fight to the death.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/We live to win.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/We mortals salute you.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/We win to live.wav" frequency="10"/>
	  <sound file="CurrentLang/voices/RGladiator/6.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/7.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/8.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/9.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RGladiator/10.wav" frequency="10"/>
>>>>>>> mod
```

## 28. DATA/SOUND ENTITIES/VOICERHASTATUS.XML

```text
<<<<<<< HD
      <sound file="CurrentLang/voices/RHastatus/1.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/2.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/3.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/4.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/5.wav" frequency="20"/>
||||||| 1.40
      <sound file="CurrentLang/voices/RHastatus/Following your orders.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/Look out for danger.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/Ready as always.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/Shields in front.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RHastatus/Swords ready.wav" frequency="20"/>
=======
      <sound file="CurrentLang/voices/RHastatus/Following your orders.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/Look out for danger.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/Ready as always.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/Shields in front.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/Swords ready.wav" frequency="10"/>
	  <sound file="CurrentLang/voices/RHastatus/6.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/7.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/8.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/9.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RHastatus/10.wav" frequency="10"/>
>>>>>>> mod
```

## 29. DATA/SOUND ENTITIES/VOICERPRINCIPLE.XML

```text
<<<<<<< HD
      <sound file="CurrentLang/voices/RPrinciple/1.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/2.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/3.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/4.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/5.wav" frequency="20"/>
||||||| 1.40
      <sound file="CurrentLang/voices/RPrinciple/Be ready for anything.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/Move quietly.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/We fight to the end.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/We'll win again.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RPrinciple/We've won many battles.wav" frequency="20"/>
=======
      <sound file="CurrentLang/voices/RPrinciple/Be ready for anything.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/Move quietly.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/We fight to the end.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/We'll win again.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/We've won many battles.wav" frequency="10"/>
	  <sound file="CurrentLang/voices/RPrinciple/6.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/7.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/8.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/9.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RPrinciple/10.wav" frequency="10"/>
>>>>>>> mod
```

## 30. DATA/SOUND ENTITIES/VOICERSCOUT.XML

```text
<<<<<<< HD
      <sound file="CurrentLang/voices/RScout/1.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/2.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/3.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/4.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/5.wav" frequency="20"/>
||||||| 1.40
      <sound file="CurrentLang/voices/RScout/Let's ride.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/Riding on horseback.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/Scouting the area.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/Scouts Here.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RScout/Speed is of essence.wav" frequency="20"/>
=======
      <sound file="CurrentLang/voices/RScout/Let's ride.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/Riding on horseback.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/Scouting the area.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/Scouts Here.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/Speed is of essence.wav" frequency="10"/>
	  <sound file="CurrentLang/voices/RScout/6.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/7.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/8.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/9.wav" frequency="10"/>
      <sound file="CurrentLang/voices/RScout/10.wav" frequency="10"/>
>>>>>>> mod
```

## 31. DATA/SUBAI/ACTIVATE_HERO_SKILL.VS

```text
<<<<<<< HD
if (objs.count != 1)
	return;

this = objs[0].AsHero;
if (!.IsValid)
	return;

if(!ControllableObjs(player,"Hero").Contains(this))
	return;

if (cmdcost_stamina > .stamina)
	return;

if (.UseSkill(HeroSkillId(cmdparam))) {
//	.AddCommand(true, "taunt");
	.SetStamina(.stamina - cmdcost_stamina);
//	.SetCommand("taunt");
}
||||||| 1.40
if (objs.count != 1)
	return;

this = objs[0].AsHero;
if (!.IsValid)
	return;

if (cmdcost_stamina > .stamina)
	return;

if (.UseSkill(HeroSkillId(cmdparam))) {
//	.AddCommand(true, "taunt");
	.SetStamina(.stamina - cmdcost_stamina);
//	.SetCommand("taunt");
}
=======
	this = objs[0].AsHero();
>>>>>>> mod
```

## 32. DATA/SUBAI/BUILD_CATAPULT.VS

```text
<<<<<<< HD
builders = objs.FilterClosest(pt,maxunits);
//if(builders.count < minunits) return;

//Removing non-military units to prevent some bugs
for (i = builders.count - 1; i >= 0; i -= 1) {
	if (!builders[i].IsHeirOf("Military") || builders[i].IsHeirOf("ShipBattle") || builders[i].IsHeirOf("Hero"))
	{
		builders.Remove(builders[i]);
	}
}

for (i = builders.count - 1; i >= 0; i -= 1) {
	race_num[builders[i].race] += 1;
}
||||||| 1.40
builders = objs.FilterClosest(pt,maxunits);
//if(builders.count < minunits) return;

for (i = builders.count - 1; i >= 0; i -= 1) {
	race_num[builders[i].race] += 1;
}
=======
builders = objs.FilterClosest(pt, 10);
>>>>>>> mod
```

## 33. DATA/SUBAI/BUILD_CATAPULT.VS

```text
<<<<<<< HD
if(builders.count>0){
	cat = PlaceCatapult(pt.x, pt.y, builders[0].AsUnit().player, race);
}
||||||| 1.40
cat = PlaceCatapult(pt.x, pt.y, builders[0].AsUnit().player, race);
=======
//catapult race depends on amount and distance of the selected units
if (builders.count > 0)
	cat = PlaceCatapult(pt.x, pt.y, builders[0].player, race);
>>>>>>> mod
```

## 34. DATA/SUBAI/CATAPULT_DISBAND.VS

```text
<<<<<<< HD
//void, Obj This

Catapult this;
point ptBase, pt;
ObjList units;
int i;

this = This.AsCatapult();

units = .settlement().Units();

while(units.count>0)
{
	ptBase = .CalcEscapeDirection();
	ptBase.SetLen( .radius * 4);

	for(i = 0; i < units.count(); i = i + 1)
	{
		pt= ptBase;
		pt.Rot(30-rand(60));
		units[i].ClearCommands();
		units[i].AddCommand(false,"move",pt+.pos());
		units[i].KillCommand();
	}
	units = .settlement().Units();
}
||||||| 1.40
//void, Obj This

Catapult this;
point ptBase, pt;
ObjList units;
int i;

this = This.AsCatapult();

units = .settlement().Units();

ptBase = .CalcEscapeDirection();
ptBase.SetLen( .radius * 4);

for(i = 0; i < units.count(); i = i + 1)
{
	pt= ptBase;
	pt.Rot(30-rand(60));
	units[i].ClearCommands();
	units[i].AddCommand(false,"move",pt+.pos());
	units[i].KillCommand();
}
=======
//void, Obj This

Catapult this;

this = This.AsCatapult();

if (.IsValid)
	if (.IsAlive) {
		Settlement set;
		ObjList units;
		Obj o;
		point pt_pos, pt_escape, pt_move;
		str cmd;

		set = .settlement;
		pt_pos = .pos;

		pt_escape = .CalcEscapeDirection();
		pt_escape.SetLen(.radius * 5);

		units = set.Units;

		while (units.count > 0) {
			o = units[0];
			if (o.IsAlive) {
				cmd = o.command;
				if (cmd != "attach")
					if (cmd != "move")
						if (cmd != "advance")
							if (cmd != "attack")
								if (cmd != "engage") {
									pt_move = pt_escape;
									pt_move.Rot(30 - rand(61));
									o.SetCommand("move", pt_move + pt_pos);
								}
			}

			Sleep(1000);//this must be greater than or equal to the exit_interval property of the catapult class

			units = set.Units;
		}
	}
>>>>>>> mod
```

## 35. DATA/SUBAI/CREATE_GOLD_MULE_BIG.VS

```text
<<<<<<< HD
wagon = .CreateMuleGold(1000);
if(wagon.IsValid)
{
	if(StrCmp(.GetCentralBuilding().class(), "TTent") != 0)
	{
		ClearSelection(wagon.player);
		wagon.Select(wagon.player);
	}
	
	ptGo.Set(This.radius,This.radius);
	wagon.AddCommand(false,"move",This.pos + ptGo);
	wagon.KillCommand();
}
||||||| 1.40
wagon = .CreateMuleGold(1000);
if(wagon.IsValid)
{
	ClearSelection(wagon.player);
	wagon.Select(wagon.player);

	ptGo.Set(This.radius,This.radius);
	wagon.AddCommand(false,"move",This.pos + ptGo);
	wagon.KillCommand();
}
=======
mule = .settlement.CreateMuleGold(1000);

if (mule.IsValid) {
	point pt_exit;

	ClearSelection(mule.player);
	mule.Select(mule.player);

	if (.IsHeirOf("RomanShipyard")) {
		pt_exit = .GetExitVector();
		pt_exit.Rot(rand(91) - 45);//randomly rotate the destination to reduce the risk of boats getting stuck in the building (they can be moved manually, but it's not nice to look at)
		mule.SetCommand("move", .pos + pt_exit * -5);//go opposite the shipyard direction
	}
	else if (.IsHeirOf("GaulShipyard")) {
		pt_exit = .GetExitVector();
		pt_exit.Rot(rand(91) - 45);//randomly rotate the destination to reduce the risk of boats getting stuck in the building (they can be moved manually, but it's not nice to look at)
		mule.SetCommand("move", .pos + pt_exit * -2);//go opposite the shipyard direction
	}
	else {
		pt_exit = Point(.radius, .radius);
		pt_exit.Rot(rand(91) - 45);//randomly rotate the destination to reduce the risk of boats getting stuck in the building (they can be moved manually, but it's not nice to look at)
		mule.SetCommand("move", .pos + pt_exit);
	}
}
>>>>>>> mod
```

## 36. DATA/SUBAI/GOUTPOST_SELLFOOD.VS

```text
<<<<<<< HD
// void, Obj This 

Building this;
this = This.AsBuilding();
EnvWriteString(.settlement, "GOutpostSellFood", cmdparam);

||||||| 1.40
// void, Obj This 

Building this;
this = This.AsBuilding();
EnvWriteString(.settlement, "GOutpostSellFood", cmdparam);
=======
//void, Obj This

EnvWriteString(This.AsBuilding().settlement, "GOutpostSellFood", cmdparam);
>>>>>>> mod
```

- `DATA/SUBAI/GOUTPOST_SELLGOLD.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 38. DATA/SUBAI/HERO_CAPTURE.VS

```text
<<<<<<< HD
	// capture building
	if (b.settlement.IsOutpost())
		if (b.settlement.IsIndependent())
			return;

	if (.player == u.player)
		return;
	//all checks are player based, not relation based, to allow capture of allied settlements
	//move near the building
	if (.PathTo(b, .FormRadius, 0) > nRange)
	{
		.FormSetupAndMoveTo(b, 100, 100, false);
		while (.HasPath && .DistTo(b) > nRange && .IsAlive && .IsValidCaptureTarget(b))
			.FormKeepMoving(1500);
	}
	if (.player == u.player)
		return;

	//command the army first
	.army.ClearDead;
	for (i = 0; i < .army.count; i += 1)
		if (.army[i].IsValidCaptureTarget(b))
			.army[i].SetCommand("capture", b);
		else
			.army[i].SetCommand("idle");
		
	while (u.IsAlive && .player != u.player && .IsValidCaptureTarget(u))
		if (.Goto(u, 250, 5000, true, 2500))
		{
			if(.player == b.player) return;
			/*
			// heroes can't capture allied human settlements until allied player is not been eliminated
			if( (DiplAreAllied(.player(), b.player()) == true) && (EnvReadInt(b.player(), "elimination") != 1) && (IsAIPlayer(b.player()) == false) )
			{
				return;
			}
			*/
			bEnemy = .IsEnemy(u);
			if (!bEnemy)
			if (!u.IsEnemy(this))
			{
				b.settlement.SetPlayer(.player);
				return;
||||||| 1.40
	// capture building
	if (b.settlement.IsOutpost())
		if (b.settlement.IsIndependent())
			return;

	if (.player == u.player)
		return;
	//all checks are player based, not relation based, to allow capture of allied settlements
	//move near the building
	if (.PathTo(b, .FormRadius, 0) > nRange)
	{
		.FormSetupAndMoveTo(b, 100, 100, false);
		while (.HasPath && .DistTo(b) > nRange && .IsAlive && .IsValidCaptureTarget(b))
			.FormKeepMoving(1500);
	}
	if (.player == u.player)
		return;

	//command the army first
	.army.ClearDead;
	for (i = 0; i < .army.count; i += 1)
		if (.army[i].IsValidCaptureTarget(b))
			.army[i].SetCommand("capture", b);
		else
			.army[i].SetCommand("idle");
		
	while (u.IsAlive && .player != u.player && .IsValidCaptureTarget(u))
		if (.Goto(u, 250, 5000, true, 2500))
		{
			if(.player == b.player) return;
			// allied units capture settlements at once
			bEnemy = .IsEnemy(u);
			if (!bEnemy)
			if (!u.IsEnemy(this))
			{
				b.settlement.SetPlayer(.player);
				return;
=======
this = me.AsHero();

if (.IsValid) {
	if (.player != u.player) {
		b = u.AsBuilding();

		if (b.IsValid) {
			if (!b.AsCatapult().IsValid) {
				Settlement set;
				bool is_tent_or_independent_outpost = false, is_enemy;

				set = b.settlement;

				if (!b.IsCentralBuliding)
					b = set.GetCentralBuilding();

				if (.PathTo(b, .FormRadius, 0) > 500) {
					.FormSetupAndMoveTo(b, 100, 100, false);
					while (.IsAlive) {
						if (!.HasPath())
							break;
						if (.DistTo(b) <= 500)
							break;
						if (!.IsValidCaptureTarget(b))
							break;
						.FormKeepMoving(1500);
					}
				}
				if (.player == b.player)
					return;

				army = .army;
				army.ClearDead();
				for (i = 0; i < army.count; i += 1)
					if (army[i].IsValidCaptureTarget(b))
						army[i].SetCommand("capture", b);
					else
						army[i].SetCommand("idle");

				if (set.IsTTent)
					is_tent_or_independent_outpost = true;
				else if (set.IsOutpost())
					if (set.IsIndependent())
						is_tent_or_independent_outpost = true;

				while (.player != b.player) {
					if (!.IsValidCaptureTarget(b))
						return;
					if (.Goto(b, 250, 5000, true, 2500)) {
						if (.player == b.player)
							return;
						is_enemy = .IsEnemy(b);
						if (!is_enemy)
							if (!b.IsEnemy(this)) {
								set.SetPlayer(.player);//allied players management (note that it's different from using DiplAreAllied)
								return;
							}
						if (is_tent_or_independent_outpost) {
							if (!.IsVisible)
								.SetVisible(true);
							if (.HasSpecial(sneak))//a hero might receive the special from an adventure sequence
								.SetLastAttackTime();
							.AddCommand(true, "engage");
							return;
						}
						while (is_enemy == .IsEnemy(b)) {
							if (set.loyalty <= 0) {
								set.SetPlayer(.player);
								set.SetLoyalty(11);
								return;
							}
							if (.IsEnemy(b))
								UserNotification("building attacked", "", b.pos, b.player);
							else if (b.IsEnemy(this))
								UserNotification("building attacked", "", b.pos, b.player);

							if (!.IsVisible)
								.SetVisible(true);
							if (.HasSpecial(sneak))//a hero might receive the special from an adventure sequence
								.SetLastAttackTime();

							.Face(b.pos);
							army = .army;
							army.ClearDead();
							for (i = 0; i < army.count; i += 1)//new units might be attached during the capture
								if (army[i].command == "idle")
									if (army[i].IsValidCaptureTarget(b))
										army[i].SetCommand("capture", b);
							.Taunt(2000);
							if (.IsEnemy(b))//loyalty sometimes decreases even after the capture
								set.DecreaseLoyalty(1);
						}
					}
				}
>>>>>>> mod
```

## 39. DATA/SUBAI/HERO_CAPTURE.VS

```text
<<<<<<< HD
}
else if( u.IsHeirOf("Wagon") ) 
{
	Wagon w;
	w = u.AsWagon;

	.army.ClearDead;
	for (i=0; i<.army.count; i+=1)
		.army[i].SetCommand("capture", u);
			
	while( w.IsAlive && !w.InHolder )
	{
		if(.player == w.player) return;
		if(.Goto(u, 150, 5000, true, 2500))
		{
			if (!w.IsAlive) return;
			if (.player == u.player) return;
			// heroes can't capture allied human wagon until allied player is not been eliminated
			if( (DiplAreAllied(.player(), w.player()) == true) && (EnvReadInt(w.player(), "elimination") != 1) && (IsAIPlayer(w.player()) == false) )
			{
				return;
			}
			if (!u.IsEnemy(me))
			if (!me.IsEnemy(u))
			{
				w.SetPlayer(.player);
||||||| 1.40
}
else if( u.IsHeirOf("Wagon") ) 
{
	Wagon w;
	w = u.AsWagon;

	.army.ClearDead;
	for (i=0; i<.army.count; i+=1)
		.army[i].SetCommand("capture", u);
			
	while( w.IsAlive && !w.InHolder )
	{
		if(.player == w.player) return;
		if(.Goto(u, 150, 5000, true, 2500))
		{
			if (!w.IsAlive) return;
			if (.player == u.player) return;
			// allied units capture at once
			if (!u.IsEnemy(me))
			if (!me.IsEnemy(u))
			{
				w.SetPlayer(.player);
=======
		else if (u.IsHeirOf("WildHorse")) {
			// PARTE CAVALLI MIGLIORATA
			if (EnvReadString(.player, "Tame horses") != "researched") {
				Sleep(100);
>>>>>>> mod
```

- `DATA/SUBAI/HORSE_ENTER.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/HORSE_ENTER_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/HORSE_IDLE.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/HORSE_TROT.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/IBERIAN_VILLAGE_TRAINISCOUT.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 45. DATA/SUBAI/MILITARY_ONDIE.VS

```text
<<<<<<< HD
//Warior Tales
exp = 1; // level to add
||||||| 1.40
//Warior Tales
exp = 1; // experience to add
=======
this = THIS.AsUnit();

if (.IsValid) {
	//this is to avoid damaging units with trample and constantly creating useless visual effects
	.SetSpecial(revenge, false);
	.SetSpecial(spike_armor, false);
	.SetSpecial(defense_skill, false);
	.SetSpecial(defensive_tactics, false);
	.SetSpecial(deflection, false);
	.SetSpecial(determination, false);

	.SetNoAIFlag(true);

	if (!.IsSentry) {
		int player;

		player = .player;
>>>>>>> mod
```

## 46. DATA/SUBAI/MILITARY_ONDIE.VS

```text
<<<<<<< HD
if(EnvReadString(.player, "Warrior Tales") != "researched")
return;
||||||| 1.40
if(EnvReadString(.player, "Warrior Tales") != "researched")
	return;
=======
		if (.AsHero().IsValid) {
			if (.inherentlevel > EnvReadInt(player, "BestHeroLevel"))
				EnvWriteInt(player, "BestHeroLevel", .inherentlevel);
		}
		else if (.IsHeirOf("IMountaineer")) {
			if (.inherentlevel > EnvReadInt(player, "BestMountaineerLevel"))
				EnvWriteInt(player, "BestMountaineerLevel", .inherentlevel);
		}
		else if (.IsHeirOf("RLiberatus")) {
			if (.inherentlevel > EnvReadInt(player, "BestLiberatusLevel"))
				EnvWriteInt(player, "BestLiberatusLevel", .inherentlevel);
		}
		else if (.IsHeirOf("TValkyrie")) {
			if (.inherentlevel > EnvReadInt(player, "BestValkyrieLevel"))
				EnvWriteInt(player, "BestValkyrieLevel", .inherentlevel);
		}
		else if (.IsHeirOf("HMyrmidon_Javelin"))
			if (.inherentlevel > EnvReadInt(player, "BestMyrmidonLevel"))
				EnvWriteInt(player, "BestMyrmidonLevel", .inherentlevel);
>>>>>>> mod
```

## 47. DATA/SUBAI/MILITARY_ONDIE.VS

```text
<<<<<<< HD
ol = ObjsInCircle(.pos, .sight, "Military").GetObjList();
for(i = 0; i < ol.count; i += 1) {
	u = ol[i].AsUnit();
	if (!u.IsValid()) continue;
	if (.IsEnemy(u)) continue;
	if (u.AsHero().IsValid())continue;
	if (.race==Gaul) continue;
	u.SetLevel(u.inherentlevel + exp);
	break;
}
||||||| 1.40
ol = ObjsInCircle(.pos, .sight, "Military").GetObjList();
for(i = 0; i < ol.count; i += 1) {
	u = ol[i].AsUnit();
	if (!u.IsValid()) continue;
	if (.IsEnemy(u)) continue;
	if (u.AsHero().IsValid())continue;
	u.SetExperience(u.experience + exp);
	break;
}
=======
		if (IsResearched(player, "Warrior Tales"))
			if (!.InHolder) {
				int i, exp;
>>>>>>> mod
```

## 48. DATA/SUBAI/ONFINISH_RESEARCH.VS

```text
<<<<<<< HD
		// Tribute implementation
||||||| 1.40
		//Tribute implementation
=======
		// Supplies implementation
		if (name == "Supplies") {
			StartPlayerScript(.player, "data/subai/greek_supplies.vs");
			continue;
		}
		// Protection of Apollo implementation
		if (name == "Protection of Apollo") {
			StartPlayerScript(.player, "data/subai/Apollo_Protection.vs");
			continue;
		}
		// Tribute implementation
>>>>>>> mod
```

## 49. DATA/SUBAI/ONFINISH_RESEARCH.VS

```text
<<<<<<< HD
		if(name == "Gambling")
		{	// Gambling implementation
			int CHANCE;
			CHANCE = GetConst("GamblingChance");
			if(rand(100) < CHANCE)
			{
				.settlement().SetFood(.settlement().food() + 2500); //Get 2500 of food.
				//.settlement.GoldConverted(5000);
			}
			ExploreCircle(.player(), .pos(), 4500); //Explore a large area around stronghold.
||||||| 1.40
		if (name == "Gambling"){	// Gambling implementation
            int chance;
			chance = GetConst("GamblingChance");
			if (rand(100) < chance)
			  {
				.settlement.SetGold(.settlement.gold+5000);
				.settlement.GoldConverted(5000);
			  }
=======
		if (name == "Gambling"){	// Gambling implementation
            int chance;
			chance = GetConst("GamblingChance");
			if (rand(100) < chance)
			  {
				.settlement.SetGold(.settlement.gold+5000);
				.settlement.GoldConverted(5000);
			  }
              ExploreCircle(.player(), .pos(), 4500); //Explore a large area around stronghold.
>>>>>>> mod
```

## 50. DATA/SUBAI/ONFINISH_RESEARCH.VS

```text
<<<<<<< HD
			ExploreCircle(.player, .pos, 4500);
||||||| 1.40
				ExploreCircle(.player, .pos, 6000);
=======
			ExploreCircle(.player, .pos, 6000);
		}
		else if (name == "Trade Routes") {// Trade Routes implementation
			int i;
			ObjList villages;
	
			villages=ClassPlayerObjs("BaseVillage",.player).GetObjList();
			for(i=0;i<villages.count;i=i+1){
				if(villages[i].AsBuilding().IsValid() && villages[i].AsBuilding().player==.player && !villages[i].AsBuilding().IsBroken()){
					villages[i].AsBuilding().settlement.SetFood(villages[i].AsBuilding().settlement.food+1000);
				}
			}
			continue;
		}
		else if (name == "Strengthen Stronghold Gates") {// Strengthen Stronghold Gates implementation
			int i;
			ObjList gates;
	
			gates=.settlement.ObjectsAround("Gate");
			for(i=0;i<gates.count;i=i+1){
				if(gates[i].AsBuilding().IsValid()){
					int percent;

					percent=(gates[i].AsBuilding().health*100)/gates[i].AsBuilding().maxhealth;
					if(!gates[i].AsGate().IsBroken){
						if(percent<=0){
							percent=29;
						}
					}
					gates[i].AsBuilding().SetMaxHealth(7500);
					gates[i].AsBuilding().SetHealth(gates[i].AsBuilding().maxhealth*percent/100);
				}
			}
			continue;
>>>>>>> mod
```

## 51. DATA/SUBAI/OUTPOST_ATTACK.VS

```text
<<<<<<< HD
if (!.IsValid)
	return;


if(.IsValid() && target.IsValid())
{
	if(target.IsHeirOf("Hero") == true && target.AsHero().army().count() >= 5)
	{
		return;
	}
}

if (.settlement.IsIndependent())
	return;
if (.IsValid() && target.IsValid()) {
	sett = .settlement();
	blds = sett.Buildings;
	for (i = 0; i < blds.count(); i += 1) {
||||||| 1.40
if (!.IsValid)
	return;
if (.settlement.IsIndependent())
	return;
if (.IsValid() && target.IsValid()) {
	sett = .settlement();
	blds = sett.Buildings;
	for (i = 0; i < blds.count(); i += 1) {
=======
if (!.IsIndependent)
	if (target.AsUnit().IsValid) {
		ObjList blds;
>>>>>>> mod
```

## 52. DATA/SUBAI/OUTPOST_ATTACK_VERIFY.VS

```text
<<<<<<< HD
if (sett.IsIndependent())
	return false;
if (sett.UnitsCount() == 0) 
	return false;
if(other.AsUnit().IsValid() == true)
{
	if(other.IsHeirOf("Hero") == true && other.AsHero().army().count() >= 5)
	{
		return false;
	}
}
||||||| 1.40
if (sett.IsIndependent())
	return false;
if (sett.UnitsCount() == 0) 
	return false;
=======
if (!set.IsIndependent)
	if (set.UnitsCount > 0)
		if (other.AsUnit().IsValid)
			if (other.IsAlive)
				if (.IsEnemy(other)) {
					ObjList blds;
					Tower t;
					int i;
>>>>>>> mod
```

## 53. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
Settlement this;
int min_resource, refresh, food_sales, gold_sales, food_income, required_gold, gold_income, reserved_food;
int i;
Wagon wagon;
bool bProduceGold, bSellFood, bSellGold, bWagon;
ObjList olLibyansOut;
ObjList olUnitsOut;
str strCommand;

this = This.AsBuilding().settlement;

refresh = GetConst("OutpostRefresh");
food_sales = GetConst("GOutpostFoodSales");
gold_sales = food_sales;
food_income = GetConst("GOutpostGoldReturn");
gold_income = GetConst("ROutpostGoldReturn");
required_gold = GetConst("ROutpostRequiredGold");
min_resource = GetConst("MinResQtyToTransport");
bProduceGold = This.IsHeirOf("ROutpost") || This.IsHeirOf("EOutpost");

while (1) {
	if (.IsIndependent())
	{
			Sleep(refresh);
			continue;
	}

	Sleep(refresh);
	//Gaul outpost behaviour
	//Food selling
	bSellFood = EnvReadString(this, "GOutpostSellFood") == "yes";
    
    // food_sales = gold_sales = 20
    // food_income = 10
    
	if (!bProduceGold && bSellFood && .food > food_sales) {
		.SetFood(.food - food_sales);
		.SetGold(.gold + food_income);
		.GoldConverted(food_income);
	}
	
    //Gold selling
    bSellGold = EnvReadString(this, "GOutpostSellGold") == "yes";
	if (!bProduceGold && bSellGold && .gold > gold_sales) {
		.SetGold(.gold - food_income);
		.SetFood(.food + gold_sales - 4);
	}

	// roman outpost behaviour
	if(bProduceGold && .gold >= required_gold) {
		.SetGold(.gold + gold_income);
		.GoldConverted(gold_income);
	}
	// send resources
	if (.supplied == this)
		.StopSupply();
	if (!.supplied.IsValid()) continue;
	if (!DiplGetCeaseFire(.player, .supplied.player)) continue;
	bWagon = false;
	if (.gold > min_resource && !bSellGold) {
		int gold;
		gold = 1000;
		if (bProduceGold && .gold > required_gold && .gold - required_gold < 1000)
			gold = .gold - required_gold;
		if (gold > min_resource) {
			wagon = .CreateMuleGold(gold);
			wagon.SetCommand("unload", .supplied.GetCentralBuilding());
			bWagon = true;
		}
	}
	if (.Units.count)
		reserved_food = 100;
	else
		reserved_food = 0;	
	if (!bWagon && .food > (min_resource + reserved_food) && !bSellFood) {
		if (.food - reserved_food > 1000)
			wagon = .CreateMuleFood(1000);
		else
			wagon = .CreateMuleFood(.food - reserved_food);
		wagon.SetCommand("unload", .supplied.GetCentralBuilding());
	}
	olLibyansOut.Clear;
	for(i=0; i<.Units.count; i+=1) {
		if( .Units[i].IsHeirOf("CMaceman") && !.Units[i].AsUnit.GetCommanded ) {
			olLibyansOut.Add(.Units[i]);
		}
	}

	if( !.supplied.GetCentralBuilding.IsHeirOf("BaseVillage") ) {
		if( olLibyansOut.count >= 5 )
			olLibyansOut.SetCommand("enter", .supplied.GetCentralBuilding());
	}

	if( .Units.count ) 
	{
		point pt;

		olUnitsOut.Clear;
		for(i=0; i<.Units.count; i+=1) {
			if( This.AsBuilding.IsEnemy(.Units[i] ) ) {
				olUnitsOut.Add(.Units[i]);
			}
			if (i % 50 == 49) Sleep(1);
		}
		olUnitsOut.ClearDead;

		pt.Set(1,0);
		pt.SetLen(This.AsBuilding.radius);
		pt.Rot(rand(360));
		pt = pt + This.AsBuilding.pos;
		olUnitsOut.SetCommand("advance", pt);
	}
	
}
||||||| 1.40
Settlement this;
int min_resource, refresh, food_sales, food_income, required_gold, gold_income, reserved_food;
int i;
Wagon wagon;
bool bProduceGold, bSellFood, bWagon;
ObjList olLibyansOut;
ObjList olUnitsOut;
str strCommand;

this = This.AsBuilding().settlement;

refresh = GetConst("OutpostRefresh");
food_sales = GetConst("GOutpostFoodSales");
food_income = GetConst("GOutpostGoldReturn");
gold_income = GetConst("ROutpostGoldReturn");
required_gold = GetConst("ROutpostRequiredGold");
min_resource = GetConst("MinResQtyToTransport");
bProduceGold = This.IsHeirOf("ROutpost") || This.IsHeirOf("EOutpost");

while (1) {
	if (.IsIndependent())
	{
			Sleep(refresh);
			continue;
	}

	Sleep(refresh);
	bSellFood = EnvReadString(this, "GOutpostSellFood") == "yes";
	// gaul outpost behaviour
	if (!bProduceGold && bSellFood && .food > food_sales) {
		.SetFood(.food - food_sales);
		.SetGold(.gold + food_income);
		.GoldConverted(food_income);
	}
	// roman outpost behaviour
	if(bProduceGold && .gold >= required_gold) {
		.SetGold(.gold + gold_income);
		.GoldConverted(gold_income);
	}
	// send resources
	if (.supplied == this)
		.StopSupply();
	if (!.supplied.IsValid()) continue;
	if (!DiplGetCeaseFire(.player, .supplied.player)) continue;
	bWagon = false;
	if (.gold > min_resource) {
		int gold;
		gold = 1000;
		if (bProduceGold && .gold > required_gold && .gold - required_gold < 1000)
			gold = .gold - required_gold;
		if (gold > min_resource) {
			wagon = .CreateMuleGold(gold);
			wagon.SetCommand("unload", .supplied.GetCentralBuilding());
			bWagon = true;
		}
	}
	if (.Units.count)
		reserved_food = 100;
	else
		reserved_food = 0;	
	if (!bWagon && .food > (min_resource + reserved_food) && !bSellFood) {
		if (.food - reserved_food > 1000)
			wagon = .CreateMuleFood(1000);
		else
			wagon = .CreateMuleFood(.food - reserved_food);
		wagon.SetCommand("unload", .supplied.GetCentralBuilding());
	}
	olLibyansOut.Clear;
	for(i=0; i<.Units.count; i+=1) {
		if( .Units[i].IsHeirOf("CMaceman") && !.Units[i].AsUnit.GetCommanded ) {
			olLibyansOut.Add(.Units[i]);
		}
	}

	if( !.supplied.GetCentralBuilding.IsHeirOf("BaseVillage") ) {
		if( olLibyansOut.count >= 5 )
			olLibyansOut.SetCommand("enter", .supplied.GetCentralBuilding());
	}

	if( .Units.count ) 
	{
		point pt;

		olUnitsOut.Clear;
		for(i=0; i<.Units.count; i+=1) {
			if( This.AsBuilding.IsEnemy(.Units[i] ) ) {
				olUnitsOut.Add(.Units[i]);
			}
			if (i % 50 == 49) Sleep(1);
		}
		olUnitsOut.ClearDead;

		pt.Set(1,0);
		pt.SetLen(This.AsBuilding.radius);
		pt.Rot(rand(360));
		pt = pt + This.AsBuilding.pos;
		olUnitsOut.SetCommand("advance", pt);
	}
	
}
=======
while (1)
	Sleep(3600000);
>>>>>>> mod
```

## 54. DATA/SUBAI/PEACEFUL_MOVE.VS

```text
<<<<<<< HD
if(.IsValid() == false)
{
	return;
}
if(.InShip() == true)
{
	Ship s;
	s = .GetShip();
	
	if(s.IsValid() == true && s.IsAlive() == true)
	{
		if(s.player() != .player() && DiplGetShareControl(s.player(), .player()) == false)
		{
			s.SetCommand("unboardall", s.pos());
			return;
		}	//Fine if.
	}	//Fine if.
	else
	{
		return;
	}	//Fine else.
}	//Fine if.

//.pr("peaceful::move: move to a point");
||||||| 1.40
//.pr("peaceful::move: move to a point");
=======
if (.IsValid) {
	if (.InShip) {
		Ship s;
>>>>>>> mod
```

## 55. DATA/SUBAI/RUIN_BEHAVIOR.VS

```text
<<<<<<< HD
//void, Obj This

bool bRespawn;
str items, item; 
Building this;
int count, idx, minlevel, timetorest;
Item item_obj;
Hero hero;

this = This.AsBuilding;
minlevel = .minlevel;
EnvWriteInt(this, "minlevel", minlevel);
bRespawn = true;
timetorest = 0;

Sleep(rand(1000) + 500);

while(1)
{
	if(bRespawn)
	{
		// first count 'em
		count = 0;
		items = .itemtypes;
		while(items != "")
		{
			item = ParseStr(items, items);
			count += 1;
		}
		idx = rand(count);

		items = .itemtypes;
		while(idx > 0)
		{
			item = ParseStr(items, items);
			idx -= 1;
		}
		.AddItem(item);
		item_obj = .FindItem(item);
		bRespawn = false;
	}
	if(.settlement.UnitsCount > 0)
	{
		hero = .settlement.Units[0].AsHero();
		if (hero.IsAlive)
		{
			hero.Deselect();
			Sleep(10000);
			if (hero.IsAlive)
			if (hero.InHolder)
			{
				bool bCanGetItem = false;
				//if (10 * hero.health >= 9 * hero.maxhealth)
				if (hero.level >= minlevel)
				if (hero.item_count < hero.max_items)
					bCanGetItem = true;
				if (hero.health > hero.maxhealth * 50 / 100)
					hero.Damage(hero.health - hero.maxhealth * 50 / 100);
				if(hero.CmdCount == 1)
					hero.AddCommand(true, "move", .GetExitPoint(hero, .pos)+Point(10, 50));
				hero.KillCommand();
				if (timetorest == 0 && bCanGetItem)
				{
					minlevel += .levelperitem;
					EnvWriteInt(this, "minlevel", minlevel);
					Sleep(250);
					.GiveItem(item_obj, hero);
					timetorest = 600;
				} else
				{
					continue;
				}
			}
		}
	}
	if(timetorest == 1 && !bRespawn)
	{
		bRespawn = true;
	}		
	if(timetorest > 0)
		timetorest -= 1;

	Sleep(1000);
}
||||||| 1.40
//void, Obj This

bool bRespawn;
str items, item; 
Building this;
int count, idx, minlevel, timetorest;
Item item_obj;
Hero hero;

this = This.AsBuilding;
minlevel = .minlevel;
EnvWriteInt(this, "minlevel", minlevel);
bRespawn = true;
timetorest = 0;

Sleep(rand(1000) + 500);

while(1)
{
	if(bRespawn)
	{
		// first count 'em
		count = 0;
		items = .itemtypes;
		while(items != "")
		{
			item = ParseStr(items, items);
			count += 1;
		}
		idx = rand(count);

		items = .itemtypes;
		while(idx > 0)
		{
			item = ParseStr(items, items);
			idx -= 1;
		}
		.AddItem(item);
		item_obj = .FindItem(item);
		bRespawn = false;
	}
	if(.settlement.UnitsCount > 0)
	{
		hero = .settlement.Units[0].AsHero();
		if (hero.IsAlive)
		{
			hero.Deselect();
			Sleep(10000);
			if (hero.IsAlive)
			if (hero.InHolder)
			{
				bool bCanGetItem = false;
				//if (10 * hero.health >= 9 * hero.maxhealth)
				if (hero.level >= minlevel)
				if (hero.item_count < hero.max_items)
					bCanGetItem = true;
				if (hero.health > hero.maxhealth * 20 / 100)
					hero.Damage(hero.health - hero.maxhealth * 20 / 100);
				if(hero.CmdCount == 1)
					hero.AddCommand(true, "move", .GetExitPoint(hero, .pos)+Point(10, 50));
				hero.KillCommand();
				if (timetorest == 0 && bCanGetItem)
				{
					minlevel += .levelperitem;
					EnvWriteInt(this, "minlevel", minlevel);
					Sleep(250);
					.GiveItem(item_obj, hero);
					timetorest = 600;
				} else
				{
					continue;
				}
			}
		}
	}
	if(timetorest == 1 && !bRespawn)
	{
		bRespawn = true;
	}		
	if(timetorest > 0)
		timetorest -= 1;

	Sleep(1000);
}
=======
//void, Obj This

Building this;
Settlement set;
Item item_treasure;
int item_spawn_timer;
bool spawn_item = true;

this = This.AsBuilding();

set = .settlement;

EnvWriteInt(this, "minlevel", .minlevel);

Sleep(rand(501) + 500);

while (1) {
	if (spawn_item) {
		if (item_spawn_timer > 0)
			item_spawn_timer -= 1;
		if (item_spawn_timer <= 0) {
			str item_id, item_types;
			int i;

			item_types = .itemtypes;
			while (item_types != "") {
				item_id = ParseStr(item_types, item_types);
				i += 1;
			}
			item_types = .itemtypes;
			i = rand(i);
			while (i > 0) {
				item_id = ParseStr(item_types, item_types);
				i -= 1;
			}

			if (.AddItem(item_id)) {
				item_treasure = .FindItem(item_id);
				spawn_item = false;
			}
		}
	}

	if (set.UnitsCount > 0) {
		Hero h;

		h = set.Units[0].AsHero();

		if (h.IsValid)
			if (h.IsAlive) {
				h.Deselect();
				Sleep(10000);//this time must be lesser than the one in "hero_sleep.vs"
				if (h.IsAlive)
					if (h.GetHolderSett() == set) {
						int i;

						i = h.health - h.maxhealth / 5;
						if (i > 0)
							h.Damage(i);

						if (h.free_item_slots > 0) {
							i = EnvReadInt(this, "minlevel");
							if (h.inherentlevel >= i)
								if (.GiveItem(item_treasure, h)) {
									EnvWriteInt(this, "minlevel", i + .levelperitem);
									spawn_item = true;
									item_spawn_timer = 600;
								}
						}

						h.SetCommand("move", .GetExitPoint(h, .pos) + Point(10, 80));
					}
			}
	}

	Sleep(1000);
}
>>>>>>> mod
```

- `DATA/SUBAI/START_TARCHER_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/START_TRIDER_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/START_TWOLF_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 59. DATA/SUBAI/STONEHENGE_BLOODLUST.VS

```text
<<<<<<< HD
// void, Obj This
Building this;
this = This.AsBuilding();
PlaySound("data/Sound Entities/StonehengeSpell.xml");
||||||| 1.40
// void, Obj This

PlaySound("data/Sound Entities/StonehengeSpell.xml");
=======
//void, Obj This

Building this;
>>>>>>> mod
```

## 60. DATA/SUBAI/STONEHENGE_BLOODLUST.VS

```text
<<<<<<< HD
SetGlobalBloodlust(true);
Sleep(GetConst("StonehengeBloodlustTime"));
SetGlobalBloodlust(false);
EnvWriteInt(this, "StonehengeStart", 0);
||||||| 1.40
SetGlobalBloodlust(true);
Sleep(GetConst("StonehengeBloodlustTime"));
SetGlobalBloodlust(false);
=======
this = This.AsBuilding();

if (.IsValid) {
	ObjList owning_player_units, tmp_units;
	Unit u;
	int bonus_damage, owning_player, i, j, c;

	bonus_damage = GetConst("StonehengeBloodlustBonusDamage");

	owning_player = EnvReadInt(this, "OwningPlayer");

	PlaySound("Data/Sound Entities/StonehengeSpell.xml");

	SetGlobalBloodlust(true);

	for (i = 1; i <= 16; i += 1) {//check all players because GetPlayerUnits does not return units attached to other players' heroes
		tmp_units = GetPlayerUnits(i, "Military");
		c = tmp_units.count;
		for (j = 0; j < c; j += 1) {
			u = tmp_units[j].AsUnit();
			if (u.IsValid)
				if (u.IsAlive)
					if (u.player == owning_player)//check unit player instead of i because GetPlayerUnits takes units from other players that are attached to player i's heroes
						if (!u.IsRanged)
							owning_player_units.Add(u);
		}
	}
	c = owning_player_units.count;
	for (i = 0; i < c; i += 1) {
		u = owning_player_units[i].AsUnit();
		if (u.IsValid)
			if (u.IsAlive)
				u.AddBonus(bonus_damage, 0, 0, 0, 0);
	}

	Sleep(GetConst("StonehengeBloodlustTime"));

	SetGlobalBloodlust(false);

	c = owning_player_units.count;
	for (i = 0; i < c; i += 1) {
		u = owning_player_units[i].AsUnit();
		if (u.IsValid)
			if (u.IsAlive)
				u.RemoveBonus(bonus_damage, 0, 0, 0, 0);
	}
}
>>>>>>> mod
```

## 61. DATA/SUBAI/STONEHENGE_BLOODLUST_DISPATCH.VS

```text
<<<<<<< HD
if (!.IsValid()) return;
if(EnvReadInt(this, "StonehengeStart") == 1) return;
EnvWriteInt(this, "StonehengeStart", 1); 
||||||| 1.40
if (!.IsValid()) return;
=======

>>>>>>> mod
```

## 62. DATA/SUBAI/STONEHENGE_BLOODLUST_DISPATCH.VS

```text
<<<<<<< HD
.SetCommand("bloodlust");
||||||| 1.40
.SetCommand("bloodlust");

=======
	cost = GetCmdStaminaCost("bloodlust");
	if (.stamina >= cost) {
		.SetStamina(.stamina - cost);

		.GlobalSpellStart(gsBloodlust, player);

		.SetCommand("bloodlust");

		EnvWriteInt(this, "OwningPlayer", player);
	}
}
>>>>>>> mod
```

## 63. DATA/SUBAI/STONEHENGE_BLOODLUST_VERIFY.VS

```text
<<<<<<< HD
if (EnvReadInt(this, "StonehengeStart") == 1) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("bloodlust")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
||||||| 1.40
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("bloodlust")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
=======
if (.IsValid)
	if (.command == "idle")
		if (.IsStonehengeControlable())
			if (.stamina >= GetCmdStaminaCost("bloodlust"))
				return true;
			else
				reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
		else
			reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	else
		reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
>>>>>>> mod
```

## 64. DATA/SUBAI/STONEHENGE_SACRIFICE.VS

```text
<<<<<<< HD
	
	Sleep(time_step);
}
EnvWriteInt(this, "StonehengeStart", 0);
||||||| 1.40
	
	Sleep(time_step);
}
=======
}
>>>>>>> mod
```

## 65. DATA/SUBAI/STONEHENGE_SACRIFICE_DISPATCH.VS

```text
<<<<<<< HD
if (!.IsValid()) return;
if(EnvReadInt(this, "StonehengeStart") == 1) return;
EnvWriteInt(this, "StonehengeStart", 1);
||||||| 1.40
if (!.IsValid()) return;
=======

>>>>>>> mod
```

## 66. DATA/SUBAI/STONEHENGE_SACRIFICE_VERIFY.VS

```text
<<<<<<< HD
if (EnvReadInt(this, "StonehengeStart") == 1) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("sacrifice")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
||||||| 1.40
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("sacrifice")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
=======
if (.IsValid)
	if (.command == "idle")
		if (.IsStonehengeControlable())
			if (.stamina >= GetCmdStaminaCost("sacrifice"))
				return true;
			else
				reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
		else
			reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	else
		reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
>>>>>>> mod
```

## 67. DATA/SUBAI/STONEHENGE_SOOTHING.VS

```text
<<<<<<< HD
	
	Sleep(time_step);
}
EnvWriteInt(this, "StonehengeStart", 0);
||||||| 1.40
	
	Sleep(time_step);
}
=======
}
>>>>>>> mod
```

## 68. DATA/SUBAI/STONEHENGE_SOOTHING_DISPATCH.VS

```text
<<<<<<< HD
if (!.IsValid()) return;
if(EnvReadInt(this, "StonehengeStart") == 1) return;
EnvWriteInt(this, "StonehengeStart", 1);
||||||| 1.40
if (!.IsValid()) return;
=======

>>>>>>> mod
```

## 69. DATA/SUBAI/STONEHENGE_SOOTHING_VERIFY.VS

```text
<<<<<<< HD
if (EnvReadInt(this, "StonehengeStart") == 1) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("soothing")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
||||||| 1.40
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("soothing")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
=======
if (.IsValid)
	if (.command == "idle")
		if (.IsStonehengeControlable())
			if (.stamina >= GetCmdStaminaCost("soothing"))
				return true;
			else
				reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
		else
			reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	else
		reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
>>>>>>> mod
```

## 70. DATA/SUBAI/STONEHENGE_SOOTHING_VERIFY.VS

```text
<<<<<<< HD
return true;
||||||| 1.40
return true;
=======
return false;
>>>>>>> mod
```

## 71. DATA/SUBAI/STONEHENGE_STARVATION.VS

```text
<<<<<<< HD

	Sleep(time_step);
}
EnvWriteInt(this, "StonehengeStart", 0);
||||||| 1.40

	Sleep(time_step);
}
=======
}
>>>>>>> mod
```

## 72. DATA/SUBAI/STONEHENGE_STARVATION_DISPATCH.VS

```text
<<<<<<< HD
if (!.IsValid()) return;
if(EnvReadInt(this, "StonehengeStart") == 1) return;
EnvWriteInt(this, "StonehengeStart", 1);
||||||| 1.40
if (!.IsValid()) return;
=======

>>>>>>> mod
```

## 73. DATA/SUBAI/STONEHENGE_STARVATION_VERIFY.VS

```text
<<<<<<< HD
if (EnvReadInt(this, "StonehengeStart") == 1) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("starvation")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
||||||| 1.40
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("starvation")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
=======
if (.IsValid)
	if (.command == "idle")
		if (.IsStonehengeControlable())
			if (.stamina >= GetCmdStaminaCost("starvation"))
				return true;
			else
				reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
		else
			reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	else
		reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
>>>>>>> mod
```

## 74. DATA/SUBAI/STONEHENGE_STARVATION_VERIFY.VS

```text
<<<<<<< HD
return true;
||||||| 1.40
return true;
=======
return false;
>>>>>>> mod
```

- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 77. DATA/SUBAI/STONEHENGE_WISDOM.VS

```text
<<<<<<< HD
int start_time, k, l, c, cost;
ObjList player_units;
Unit unit;
int level_limit;
||||||| 1.40
int start_time, k, l, c;
ObjList player_units;
Unit unit;
int level_limit;
=======

>>>>>>> mod
```

## 78. DATA/SUBAI/STONEHENGE_WISDOM_DISPATCH.VS

```text
<<<<<<< HD
if (!.IsValid()) return;
if(EnvReadInt(this, "StonehengeStart") == 1) return;
EnvWriteInt(this, "StonehengeStart", 1);
||||||| 1.40
if (!.IsValid()) return;
=======

>>>>>>> mod
```

## 79. DATA/SUBAI/STONEHENGE_WISDOM_DISPATCH.VS

```text
<<<<<<< HD
.SetCommand("wisdom");
||||||| 1.40
.SetCommand("wisdom");
=======
	cost = GetCmdStaminaCost("wisdom");
	if (.stamina >= cost) {
		.SetStamina(.stamina - cost);

		.GlobalSpellStart(gsWindOfWisdom, player);

		.SetCommand("wisdom");

		EnvWriteInt(this, "OwningPlayer", player);
	}
}
>>>>>>> mod
```

## 80. DATA/SUBAI/STONEHENGE_WISDOM_VERIFY.VS

```text
<<<<<<< HD
if (EnvReadInt(this, "StonehengeStart") == 1) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("wisdom")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
||||||| 1.40
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("wisdom")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
=======
if (.IsValid)
	if (.command == "idle")
		if (.IsStonehengeControlable())
			if (.stamina >= GetCmdStaminaCost("wisdom"))
				return true;
			else
				reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
		else
			reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	else
		reasonText = rollover(this, true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
>>>>>>> mod
```

## 81. DATA/SUBAI/STONEHENGE_WISDOM_VERIFY.VS

```text
<<<<<<< HD
return true;
||||||| 1.40
return true;
=======
return false;
>>>>>>> mod
```

## 82. DATA/SUBAI/TAVERN_INVESTMENT.VS

```text
<<<<<<< HD
gold = GetConst("InvestmentGoldRevenue");
.settlement.GoldSpent(-2000);
.settlement.SetGold(.settlement.gold + gold);
.settlement.GoldConverted(gold - 2000);
||||||| 1.40
gold = GetConst("InvestmentGoldRevenue");
.settlement.GoldSpent(-4000);
.settlement.SetGold(.settlement.gold + gold);
.settlement.GoldConverted(gold - 4000);
=======
set = .settlement;

gain = GetConst("InvestmentGoldRevenue");

set.GoldSpent(-4000);
set.SetGold(set.gold + gain);
set.GoldConverted(gain - 4000);
>>>>>>> mod
```

- `DATA/SUBAI/TELEPORT_FORCE_EXIT.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 84. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
Query qSight, qEnemies, qFriends;
ObjList olAll1,olAll2, olTeutonsOut, olOurTeutons;
int i;
point p;
rect rc;
int exp_gain, old_exp_gain;
int delay;

//constants
int nArmy,			//how much units to spawn at max
	nActiveArmy,	//how much units to keep outside if an enemy comes
	nUnitSpawnRate;	//how often a new unit appears if nobody is around

int nTimeFromLastSpawn;
int nGroupSpawn;
int old_player;

this = This.AsBuilding();
nArmy = GetConst("TTentInitialArmy");// max armmy of TeutonArchers and TeutonRiders
nActiveArmy = GetConst("TTentActiveArmy");
nUnitSpawnRate= GetConst("TTentUnitSpawnRate");

rc = GetMapRect();

.settlement.SetLoyalty(100); //will not be able to capture it the normal way
||||||| 1.40
Query qSight, qEnemies, qFriends;
ObjList olAll1,olAll2, olTeutonsOut, olOurTeutons;
int i;
point p;
rect rc;
int exp_gain, old_exp_gain;

//constants
int nArmy,			//how much units to spawn at max
	nActiveArmy,	//how much units to keep outside if an enemy comes
	nUnitSpawnRate;	//how often a new unit appears if nobody is around

int nTimeFromLastSpawn;
int nGroupSpawn;
int old_player;

this = This.AsBuilding();
nArmy = GetConst("TTentInitialArmy");// max armmy of TeutonArchers and TeutonRiders
nActiveArmy = GetConst("TTentActiveArmy");
nUnitSpawnRate= GetConst("TTentUnitSpawnRate");

rc = GetMapRect();

.settlement.SetLoyalty(100); //will not be able to capture it the normal way
=======

>>>>>>> mod
```

## 85. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
nGroupSpawn = 2;
nTimeFromLastSpawn = nUnitSpawnRate * nArmy ; // this will cause respawn of half the army in the beggining

qSight = VisibleObjsInSight(this, "Unit");
qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
old_player = .player;

//---------------[ main loop ]------------------------------------

old_exp_gain = 0;
while (1) {
	bool bCanSpawn;
	bool bHasFood;
	bool bIsIndependent;
	int foodcost;

	exp_gain = GetTime() / 120000 - 5;
	if (exp_gain < 0)
		exp_gain = 0;
	
	// respawn
	bCanSpawn = true;
	bIsIndependent = .settlement.IsIndependent();
	foodcost = 400;
	
	olAll1.ClearDead();
	olAll2.ClearDead();
    
    if (bIsIndependent){
        while (nTimeFromLastSpawn > nUnitSpawnRate * nGroupSpawn && bCanSpawn) 
        {
            int nSpawn;
            nSpawn = 0;
            nTimeFromLastSpawn -= nUnitSpawnRate * nGroupSpawn;
            
            while (nSpawn<nGroupSpawn && bCanSpawn)
            {
                if (olAll1.count>=nArmy && olAll2.count>=nArmy)
                {
                    bCanSpawn = false;
                    break;
                }
                if (olAll1.count<nArmy)
                {
                    Unit u1;
                    u1 = Place("TTeutonArcher", .pos, .player);
                    u1.SetFood(u1.maxfood);
                    u1.SetFeeding(false);
                    .settlement.ForceAddUnit(u1);
                    u1.SetExperience(old_exp_gain);
                    olAll1.Add(u1);
                    nSpawn+=1;
                }
                if (olAll2.count<nArmy )
                {
                    Unit u2;
                    u2 = Place("TTeutonRider", .pos, .player);
                    u2.SetFood(u2.maxfood);
                    u2.SetFeeding(false);
                    .settlement.ForceAddUnit(u2);
                    u2.SetExperience(old_exp_gain);
                    olAll2.Add(u2);
                    nSpawn+=1;
                }
            }
        }
        
    olTeutonsOut.ClearDead();
	// clear the teutons that were commanded from our list
	for (i = olTeutonsOut.count - 1; i >= 0; i -= 1)
		if (olTeutonsOut[i].AsUnit().GetCommanded())
			olTeutonsOut.Remove(olTeutonsOut[i]);
	//increase experience
	if ((exp_gain != 0) && (exp_gain > old_exp_gain)) {
		Unit u;
		olOurTeutons = olTeutonsOut;
		olOurTeutons.AddList(.settlement.Units());
		for (i = olOurTeutons.count() - 1; i >= 0; i -= 1) {
			u = olOurTeutons[i];
			u.SetExperience(u.experience + exp_gain - old_exp_gain);
		}
		old_exp_gain = exp_gain;
	}
	if (qEnemies.IsEmpty()) { // no threat around
		// command all that are out to come back in
		for (i = 0; i < olTeutonsOut.count; i += 1)
			olTeutonsOut[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olTeutonsOut.Clear();
	} else {
		// do not allow our teutons to wander too far
		for (i = 0; i < olTeutonsOut.count; i += 1) {
			Unit u;
			u = olTeutonsOut[i].AsUnit();
			if (.DistTo(u) > .sight) { // move to closer random position
				point pos;
				pos = u.pos - .pos;
				pos.SetLen(.sight / 2);
				p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			}
		}
		// get out more teutons if needed
		while (olTeutonsOut.count < nActiveArmy && .settlement.UnitsCount() > 0) {
			point pos;
			Unit u;
			u = .settlement.Units()[0];
			olTeutonsOut.Add(u);
			pos.Set(0, .sight / 2);
			pos.Rot(rand(360));	p = pos + .pos; p.IntoRect(rc);	u.SetCommand("advance", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			nTimeFromLastSpawn += 200;
			Sleep(200);
		}
		// handle the capturing
		qSight = VisibleObjsInSight(this, "Unit");
		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
		qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
		qEnemies.GetObjList().ClearDead;
		qFriends.GetObjList().ClearDead;
		while (qEnemies.count > 15 && olTeutonsOut.count == 0 && qFriends.IsEmpty()) {
			ObjList list1;
			int newplayer, k;

			list1 = .settlement.Units();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k >= 0) break;

			list1 = qEnemies.GetObjList();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k < 0) break;
			
			
			// Set captured army if it was independent 
			qEnemies = Subtract(qEnemies,EnemyObjs(.player, "Hero"));
			newplayer = qEnemies.GetObjList()[0].player;
			if (.settlement.IsIndependent())
			{
  
				int nCapturedArmy,i;
				nCapturedArmy = GetConst("TTentCapturedArmy");			
				for (i = 0; i<nCapturedArmy; i+=1)
				{
					Unit u;
					u = Place("TTeutonArcher", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll1.Add(u);
					
					u = Place("TTeutonRider", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll2.Add(u);					
				}
}
			
			.SetPlayer(qEnemies.GetObjList()[0].player);

			// redefine enemies and friends
  		qSight = VisibleObjsInSight(this, "Unit");
  		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
	  	qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
			old_player = .player;
			break;
		}
		while (qEnemies.count > 0 && qEnemies.count <= 15 && olTeutonsOut.count == 0 && qFriends.IsEmpty()) {
			ObjList list1;
			int newplayer, k;

			list1 = .settlement.Units();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k >= 0) break;

			list1 = qEnemies.GetObjList();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k < 0) break;
			
			// Set captured army if it was independent
			newplayer = qEnemies.GetObjList()[0].player;
			if (newplayer>8)
			   {
					Sleep(10);
					continue;
			   }
			if (.settlement.IsIndependent())
			{
				int nCapturedArmy,i;
				nCapturedArmy = GetConst("TTentCapturedArmy");			
				for (i = 0; i<nCapturedArmy; i+=1)
				{
					Unit u;
					u = Place("TTeutonArcher", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll1.Add(u);
					
					u = Place("TTeutonRider", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll2.Add(u);					
				}
			}
			
			.SetPlayer(qEnemies.GetObjList()[0].player);
||||||| 1.40
nGroupSpawn = 2;
nTimeFromLastSpawn = nUnitSpawnRate * nArmy ; // this will cause respawn of half the army in the beggining

qSight = VisibleObjsInSight(this, "Unit");
qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
old_player = .player;

//---------------[ main loop ]------------------------------------

old_exp_gain = 0;
while (1) {
	bool bCanSpawn;
	bool bHasFood;
	bool bIsIndependent;
	int foodcost;

	exp_gain = GetTime() / 120000 - 5;
	if (exp_gain < 0)
		exp_gain = 0;
	
	// respawn
	bCanSpawn = true;
	bIsIndependent = .settlement.IsIndependent();
	foodcost = 400;
	
	olAll1.ClearDead();
	olAll2.ClearDead();
	while (nTimeFromLastSpawn > nUnitSpawnRate * nGroupSpawn && bCanSpawn) 
	{
		int nSpawn;
		nSpawn = 0;
		nTimeFromLastSpawn -= nUnitSpawnRate * nGroupSpawn;
		
        while (nSpawn<nGroupSpawn && bCanSpawn)
        {
			if (olAll1.count>=nArmy && olAll2.count>=nArmy)
			{
				bCanSpawn = false;
				break;
			}
			
			if (olAll1.count<nArmy)
			{
				Unit u1;
				if (!bIsIndependent)
					if (.settlement.food <= foodcost)
					{
						bCanSpawn = false;
						break;
					}
					else
						.settlement.SetFood(.settlement.food - foodcost);
				
				u1 = Place("TTeutonArcher", .pos, .player);
				u1.SetFood(u1.maxfood);
				u1.SetFeeding(false);
				.settlement.ForceAddUnit(u1);
				u1.SetExperience(old_exp_gain);
				olAll1.Add(u1);
				nSpawn+=1;
			}
			if (olAll2.count<nArmy )
			{
				Unit u2;
				if (!bIsIndependent)
					if (.settlement.food <= foodcost)
					{
						bCanSpawn = false;
						break;
					}
					else
						.settlement.SetFood(.settlement.food - foodcost);

				u2 = Place("TTeutonRider", .pos, .player);
				u2.SetFood(u2.maxfood);
				u2.SetFeeding(false);
				.settlement.ForceAddUnit(u2);
				u2.SetExperience(old_exp_gain);
				olAll2.Add(u2);
				nSpawn+=1;
			}
		}
	}

	olTeutonsOut.ClearDead();
	// clear the teutons that were commanded from our list
	for (i = olTeutonsOut.count - 1; i >= 0; i -= 1)
		if (olTeutonsOut[i].AsUnit().GetCommanded())
			olTeutonsOut.Remove(olTeutonsOut[i]);
	//increase experience
	if ((exp_gain != 0) && (exp_gain > old_exp_gain)) {
		Unit u;
		olOurTeutons = olTeutonsOut;
		olOurTeutons.AddList(.settlement.Units());
		for (i = olOurTeutons.count() - 1; i >= 0; i -= 1) {
			u = olOurTeutons[i];
			u.SetExperience(u.experience + exp_gain - old_exp_gain);
		}
		old_exp_gain = exp_gain;
	}
	if (qEnemies.IsEmpty()) { // no threat around
		// command all that are out to come back in
		for (i = 0; i < olTeutonsOut.count; i += 1)
			olTeutonsOut[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olTeutonsOut.Clear();
	} else {
		// do not allow our teutons to wander too far
		for (i = 0; i < olTeutonsOut.count; i += 1) {
			Unit u;
			u = olTeutonsOut[i].AsUnit();
			if (.DistTo(u) > .sight) { // move to closer random position
				point pos;
				pos = u.pos - .pos;
				pos.SetLen(.sight / 2);
				p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			}
		}
		// get out more teutons if needed
		while (olTeutonsOut.count < nActiveArmy && .settlement.UnitsCount() > 0) {
			point pos;
			Unit u;
			u = .settlement.Units()[0];
			olTeutonsOut.Add(u);
			pos.Set(0, .sight / 2);
			pos.Rot(rand(360));	p = pos + .pos; p.IntoRect(rc);	u.SetCommand("advance", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
			nTimeFromLastSpawn += 200;
			Sleep(200);
		}
		// handle the capturing
		qSight = VisibleObjsInSight(this, "Unit");
		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
		qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
		qEnemies.GetObjList().ClearDead;
		qFriends.GetObjList().ClearDead;
		while (!qEnemies.IsEmpty() && olTeutonsOut.count == 0 && qFriends.IsEmpty()) {
			ObjList list1;
			int newplayer, k;

			list1 = .settlement.Units();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k >= 0) break;

			list1 = qEnemies.GetObjList();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k < 0) break;
			
			// Set captured army if it was independent
			newplayer = qEnemies.GetObjList()[0].player;
			if (newplayer>8)
			   {
					Sleep(10);
					continue;
			   }
			if (.settlement.IsIndependent())
			{
				int nCapturedArmy,i;
				nCapturedArmy = GetConst("TTentCapturedArmy");			
				for (i = 0; i<nCapturedArmy; i+=1)
				{
					Unit u;
					u = Place("TTeutonArcher", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll1.Add(u);
					
					u = Place("TTeutonRider", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll2.Add(u);					
				}
			}
			
			.SetPlayer(qEnemies.GetObjList()[0].player);
=======
this = This.AsBuilding();
>>>>>>> mod
```

## 86. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
			// redefine enemies and friends
  		qSight = VisibleObjsInSight(this, "Unit");
  		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
	  	qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
			old_player = .player;
			break;
		}
		if (old_player != .player) 
		{
			// redefine enemies and friends
			qSight = VisibleObjsInSight(this, "Unit");
			qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
			qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
			old_player = .player;
		}
	}
 	// SetFeeding of commanded teutons
 	if (!.settlement.IsIndependent())
 	{
 		olAll1.ClearDead();
 		olAll2.ClearDead();
 		for(i=0; i<olAll1.count;i+=1)
 		{
 			Unit u;
 			u = olAll1[i];
 			if (u.IsValid)
 			if (u.AsUnit().GetCommanded())
 			{
 				u.SetFeeding(true);
 				olAll1.Remove(u);
 			}
 		}
 		for(i=0; i<olAll2.count;i+=1)
 		{
 			Unit u;
 			u = olAll2[i];
 			if (u.IsValid)
 			if (u.AsUnit().GetCommanded())
 			{
 				u.SetFeeding(true);
 				olAll2.Remove(u);
 			}
 		}
 	}
	
	nTimeFromLastSpawn += 1000;
	Sleep(1000);  
    
    }
    
    else {
        
        while (delay <= nUnitSpawnRate){     
            
            if (delay == nUnitSpawnRate){
                if (.settlement.food >= 400 && (EnvReadString(.settlement, "ENV_TProd") == "TTeutonRider" || EnvReadString(.settlement, "ENV_TProd") == "TTeutonArcher")){
                    Unit teuton;
                    .settlement.SetFood(.settlement.food - 400);
                    teuton = Place(EnvReadString(.settlement, "ENV_TProd"), .pos, .player);
                    teuton.SetFood(teuton.maxfood);
                    teuton.SetFeeding(false);
                    .settlement.ForceAddUnit(teuton);
                    teuton.SetExperience(old_exp_gain);
                    delay=0;
                }
                if (.settlement.food >= 500 && EnvReadString(.settlement, "ENV_TProd") == "TTeutonWolf"){
                    Unit teuton;
                    .settlement.SetFood(.settlement.food - 500);
                    teuton = Place(EnvReadString(.settlement, "ENV_TProd"), .pos, .player);
                    teuton.SetFood(teuton.maxfood);
                    teuton.SetFeeding(false);
                    .settlement.ForceAddUnit(teuton);
                    teuton.SetExperience(old_exp_gain);
                    delay=0;
                }
               
            }
            
            olTeutonsOut.ClearDead();
            // clear the teutons that were commanded from our list
            for (i = olTeutonsOut.count - 1; i >= 0; i -= 1)
                if (olTeutonsOut[i].AsUnit().GetCommanded())
                    olTeutonsOut.Remove(olTeutonsOut[i]);
            //increase experience
            if ((exp_gain != 0) && (exp_gain > old_exp_gain)) {
                Unit u;
                olOurTeutons = olTeutonsOut;
                olOurTeutons.AddList(.settlement.Units());
                for (i = olOurTeutons.count() - 1; i >= 0; i -= 1) {
                    u = olOurTeutons[i];
                    u.SetExperience(u.experience + exp_gain - old_exp_gain);
                }
                old_exp_gain = exp_gain;
            }
            if (qEnemies.IsEmpty()) { // no threat around
                // command all that are out to come back in
                for (i = 0; i < olTeutonsOut.count; i += 1)
                    olTeutonsOut[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
                olTeutonsOut.Clear();
            } else {
                // do not allow our teutons to wander too far
                for (i = 0; i < olTeutonsOut.count; i += 1) {
                    Unit u;
                    u = olTeutonsOut[i].AsUnit();
                    if (.DistTo(u) > .sight) { // move to closer random position
                        point pos;
                        pos = u.pos - .pos;
                        pos.SetLen(.sight / 2);
                        p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
                        pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                        pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                        pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                        pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                    }
                }
                // get out more teutons if needed
                while (olTeutonsOut.count < nActiveArmy && .settlement.UnitsCount() > 0) {
                    point pos;
                    Unit u;
                    u = .settlement.Units()[0];
                    olTeutonsOut.Add(u);
                    pos.Set(0, .sight / 2);
                    pos.Rot(rand(360));	p = pos + .pos; p.IntoRect(rc);	u.SetCommand("advance", p);
                    pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                    pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                    pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                    pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "patrol", p);
                    nTimeFromLastSpawn += 200;
                    Sleep(200);
                }
                // handle the capturing
                qSight = VisibleObjsInSight(this, "Unit");
                qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
                qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
                qEnemies.GetObjList().ClearDead;
                qFriends.GetObjList().ClearDead;
              while (qEnemies.count > 15 && olTeutonsOut.count == 0 && qFriends.IsEmpty()) {
			ObjList list1;
			int newplayer, k;

			list1 = .settlement.Units();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k >= 0) break;

			list1 = qEnemies.GetObjList();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k < 0) break;
			

			// Set captured army if it was independent
			qEnemies = Subtract(qEnemies,EnemyObjs(.player, "Hero"));
			newplayer = qEnemies.GetObjList()[0].player;
			if (.settlement.IsIndependent())
			{
  
				int nCapturedArmy,i;
				nCapturedArmy = GetConst("TTentCapturedArmy");			
				for (i = 0; i<nCapturedArmy; i+=1)
				{
					Unit u;
					u = Place("TTeutonArcher", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll1.Add(u);
					
					u = Place("TTeutonRider", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll2.Add(u);					
				}
}
			
			.SetPlayer(qEnemies.GetObjList()[0].player);

			// redefine enemies and friends
  		qSight = VisibleObjsInSight(this, "Unit");
  		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
	  	qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
			old_player = .player;
			break;
		}
		while (qEnemies.count > 0 && qEnemies.count <= 15 && olTeutonsOut.count == 0 && qFriends.IsEmpty()) {
			ObjList list1;
			int newplayer, k;

			list1 = .settlement.Units();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k >= 0) break;

			list1 = qEnemies.GetObjList();
			for (k = list1.count - 1; k >= 0; k -= 1) {
				if (list1[k].IsAlive())
				if (list1[k].IsVisible())
					break;
			}
			if (k < 0) break;
			
			// Set captured army if it was independent
			newplayer = qEnemies.GetObjList()[0].player;
			if (newplayer>8)
			   {
					Sleep(10);
					continue;
			   }
			if (.settlement.IsIndependent())
			{
				int nCapturedArmy,i;
				nCapturedArmy = GetConst("TTentCapturedArmy");			
				for (i = 0; i<nCapturedArmy; i+=1)
				{
					Unit u;
					u = Place("TTeutonArcher", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll1.Add(u);
					
					u = Place("TTeutonRider", .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll2.Add(u);					
				}
			}
			
			.SetPlayer(qEnemies.GetObjList()[0].player);

			// redefine enemies and friends
  		qSight = VisibleObjsInSight(this, "Unit");
  		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
	  	qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
			old_player = .player;
			break;
		}
                if (old_player != .player) 
                {
                    // redefine enemies and friends
                    qSight = VisibleObjsInSight(this, "Unit");
                    qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
                    qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
                    old_player = .player;
                }
            }
            // SetFeeding of commanded teutons
            if (!.settlement.IsIndependent())
            {
                olAll1.ClearDead();
                olAll2.ClearDead();
                for(i=0; i<olAll1.count;i+=1)
                {
                    Unit u;
                    u = olAll1[i];
                    if (u.IsValid)
                    if (u.AsUnit().GetCommanded())
                    {
                        u.SetFeeding(true);
                        olAll1.Remove(u);
                    }
                }
                for(i=0; i<olAll2.count;i+=1)
                {
                    Unit u;
                    u = olAll2[i];
                    if (u.IsValid)
                    if (u.AsUnit().GetCommanded())
                    {
                        u.SetFeeding(true);
                        olAll2.Remove(u);
                    }
                }
            }
            
            
            
            if (delay<nUnitSpawnRate){
                delay=delay+1000;
            }
            else {
                delay=0;
            }
            Sleep(1000);
        }
        
    }

||||||| 1.40
			// redefine enemies and friends
  		qSight = VisibleObjsInSight(this, "Unit");
  		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
	  	qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
			old_player = .player;
			break;
		}
		if (old_player != .player) 
		{
			// redefine enemies and friends
			qSight = VisibleObjsInSight(this, "Unit");
			qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
			qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
			old_player = .player;
		}
	}
 	// SetFeeding of commanded teutons
 	if (!.settlement.IsIndependent())
 	{
 		olAll1.ClearDead();
 		olAll2.ClearDead();
 		for(i=0; i<olAll1.count;i+=1)
 		{
 			Unit u;
 			u = olAll1[i];
 			if (u.IsValid)
 			if (u.AsUnit().GetCommanded())
 			{
 				u.SetFeeding(true);
 				olAll1.Remove(u);
 			}
 		}
 		for(i=0; i<olAll2.count;i+=1)
 		{
 			Unit u;
 			u = olAll2[i];
 			if (u.IsValid)
 			if (u.AsUnit().GetCommanded())
 			{
 				u.SetFeeding(true);
 				olAll2.Remove(u);
 			}
 		}
 	}
	
	nTimeFromLastSpawn += 1000;
	Sleep(1000);
=======
if (.class != "TTent") // blocca il comportamento automatico per CTent e altri
    while (1)
        Sleep(3600000);
else {
    Settlement set;
    ObjList all_teutons, teutons_1, teutons_2, teutons_out, enemies;
    Unit u;
    point pos, pt1, pt2;
    rect rc;
    int i, j, sight, player, initial_army, active_army, spawn_rate, last_spawn_time, delay, exp_gain, old_exp_gain;
    bool first_time_independent;

    set = .settlement;

    set.SetLoyalty(100); // impossibile catturare fino a quando la guarnigione non viene sconfitta

    rc = GetMapRect();

    sight = .sight;
    pos = .pos;

    initial_army = GetConst("TTentInitialArmy");
    active_army = GetConst("TTentActiveArmy");
    spawn_rate = GetConst("TTentUnitSpawnRate");

    last_spawn_time = spawn_rate * initial_army / 2; // spawn di metÃ  esercito allâinizio
    delay = 0;
    first_time_independent = set.IsIndependent;

    while (1) {
        player = .player;
        exp_gain = MAX(0, GetTime() / 120000 - 5);

        // Spawn neutral o unitÃ  giÃ  prodotte
        if (set.IsIndependent) {
            teutons_1.ClearDead();
            teutons_2.ClearDead();
            while (last_spawn_time > spawn_rate) {
                last_spawn_time -= spawn_rate;
                if (teutons_1.count >= initial_army)
                    if (teutons_2.count >= initial_army)
                        break;
                if (teutons_1.count < initial_army) {
                    u = Place("TTeutonRider", pos, player);
                    u.SetFeeding(false);
                    set.ForceAddUnit(u);
                    u.SetExperience(old_exp_gain);
                    teutons_1.Add(u);
                    all_teutons.Add(u);
                }
                if (teutons_2.count < initial_army) {
                    u = Place("TTeutonArcher", pos, player);
                    u.SetFeeding(false);
                    set.ForceAddUnit(u);
                    u.SetExperience(old_exp_gain);
                    teutons_2.Add(u);
                    all_teutons.Add(u);
                }
            }
            last_spawn_time += 1000;
        }

        // PRODUZIONE MANUALE CONTINUA
        delay += 1000;
        if (delay >= spawn_rate) {
            str class_prod;
            class_prod = EnvReadString(set, "ENV_TProd");

            if (class_prod != "" && class_prod != "Nothing") {
                if (set.food >= 400) {
                    set.SetFood(set.food - 400); // scala solo quando si produce lâunitÃ 

                    u = Place(class_prod, pos, player);
                    u.SetFeeding(false);
                    set.ForceAddUnit(u);
                    u.SetExperience(old_exp_gain);
                    all_teutons.Add(u);

                    delay = 0; // reset delay per il prossimo ciclo di produzione
                }
                // Se non c'Ã¨ abbastanza cibo, la produzione si ferma momentaneamente,
                // ma non viene disattivata, quindi quando il cibo Ã¨ sufficiente, riprenderÃ .
            }
        }

        // Feeding delle unitÃ  comandate
        all_teutons.ClearDead();
        for (i = all_teutons.count - 1; i >= 0; i -= 1) {
            u = all_teutons[i].AsUnit();
            if (u.IsValid)
                if (u.GetCommanded()) {
                    u.SetFeeding(true);
                    all_teutons.Remove(u);
                }
        }
        teutons_out.ClearDead();
        for (i = teutons_out.count - 1; i >= 0; i -= 1) {
            u = teutons_out[i].AsUnit();
            if (u.IsValid)
                if (u.GetCommanded()) {
                    u.SetFeeding(true);
                    teutons_out.Remove(u);
                }
        }

        // Aumento esperienza
        if (exp_gain > 0)
            if (exp_gain > old_exp_gain) {
                for (i = all_teutons.count - 1; i >= 0; i -= 1) {
                    u = all_teutons[i].AsUnit();
                    if (u.IsValid)
                        u.SetExperience(u.experience + exp_gain - old_exp_gain);
                }
                old_exp_gain = exp_gain;
            }

        // Controllo minacce intorno
        teutons_out.ClearDead();
        enemies = Intersect(
            VisibleObjsInSight(this, "Unit"),
            Subtract(
                Union(EnemyObjs(player, "Military"), EnemyObjs(player, "BaseMage")),
                EnemyObjs(player, "Sentry")
            )
        ).GetObjList();
        enemies.ClearDead();
        if (enemies.count <= 0) {
            teutons_out.SetCommand("enter_tent", this);
            teutons_out.Clear();
        }
        else {
            for (i = 0; i < teutons_out.count; i += 1) {
                u = teutons_out[i].AsUnit();
                if (.DistTo(u) > sight) {
                    pt1 = u.pos - pos;
                    pt1.SetLen(sight / 2);
                    pt2 = pt1 + pos;
                    pt2.IntoRect(rc);
                    u.SetCommand("move", pt2);
                    for (j = 0; j < 4; j += 1) {
                        pt1.Rot(90);
                        pt2 = pt1 + pos;
                        pt2.IntoRect(rc);
                        u.AddCommand(false, "patrol", pt2);
                    }
                }
            }

            while (teutons_out.count < active_army && set.UnitsCount() > 0) {
                u = set.Units()[0];
                teutons_out.Add(u);
                pt1.Set(0, sight / 2);
                pt1.Rot(rand(360));
                pt2 = pt1 + pos;
                pt2.IntoRect(rc);
                u.SetCommand("advance", pt2);
                for (j = 0; j < 4; j += 1) {
                    pt1.Rot(90);
                    pt2 = pt1 + pos;
                    pt2.IntoRect(rc);
                    u.AddCommand(false, "patrol", pt2);
                }
            }

            all_teutons.ClearDead();
            if (all_teutons.count <= 0) {
                enemies.ClearDead();
                i = enemies.count;
                if (i > 0)
                    if (Intersect(VisibleObjsInSight(this, "Unit"), FriendlyObjs(player, "Military")).IsEmpty()) {
                        j = enemies[rand(i)].player;
                        .SetPlayer(j);
                        if (first_time_independent)
                            if (!set.IsIndependent) {
                                int t;
                                t = GetConst("TTentCapturedArmy");
                                for (i = 0; i < t; i += 1) {
                                    u = Place("TTeutonRider", pos, j);
                                    set.ForceAddUnit(u);
                                    u.SetExperience(old_exp_gain);
                                    u.SetFeeding(false);
                                    all_teutons.Add(u);
                                    u = Place("TTeutonArcher", pos, j);
                                    set.ForceAddUnit(u);
                                    u.SetExperience(old_exp_gain);
                                    u.SetFeeding(false);
                                    all_teutons.Add(u);
                                }
                                first_time_independent = false;
                            }
                    }
            }
        }
        Sleep(1000);
    }
>>>>>>> mod
```

## 87. DATA/SUBAI/UNIT_ATTACH_VERIFY.VS

```text
<<<<<<< HD
if (.IsHeirOf("Peasant")) return false;
return true;
||||||| 1.40
return true;
=======
if (.IsHeirOf("Peasant")) return false;

// *** SE LA MODALITÃ ALTERNATIVA Ã ATTIVA, APPLICA IL CONTROLLO DI RAZZA ***
if (EnvReadInt("modo") == 1)
{
    // Elenco unitÃ  escluse dal controllo (reclutabili in insediamenti neutrali)
    if (this.class == "HHoplite" ||
        this.class == "CMaceman" ||
        this.class == "CCamelRider" ||
        this.class == "CHorseman" ||
        this.class == "CNumidianRider" ||
        this.class == "TTeutonWolf" ||
        this.class == "TTeutonRider" ||
        this.class == "TTeutonArcher")
    {
        return true;   // queste possono essere assegnate a qualsiasi eroe
    }
    
    // Controllo di razza
    if (GetClassRace(this.class) != hero.race)
        return false;
}

// Se siamo arrivati qui, tutto ok
return true;
>>>>>>> mod
```

## 88. DATA/SUBAI/UNIT_BUILD_CATAPULT.VS

```text
<<<<<<< HD
.SetEntering(true);
pt = building.GetEnterPoint(this);
while (bld.IsValid && bld.IsAlive() == true)
{
	if (.GotoEnter(pt, 0, 1000, false, 0))
		break;
}
||||||| 1.40
.SetEntering(true);
pt = building.GetEnterPoint(this);
while (bld.IsValid)
	if (.GotoEnter(pt, 0, 1000, false, 0))
		break;
=======
	.SetEntering(true);
	building = bld.AsBuilding();
	pt = building.GetEnterPoint(this);
>>>>>>> mod
```

## 89. DATA/SUBAI/UNIT_BUILD_CATAPULT.VS

```text
<<<<<<< HD
//.pr("unit::enter: entering");
if (bld.IsValid && bld.IsAlive() == true)
	building.settlement.AddUnit(this);
else
	.AddCommand(false, "move", pt + Point(0, 1)); /// prevent moving all units on the same place
||||||| 1.40
//.pr("unit::enter: entering");
if (bld.IsValid)
	building.settlement.AddUnit(this);
else
	.AddCommand(false, "move", pt + Point(0, 1)); /// prevent moving all units on the same place
=======
	while (bld.IsValid) {
		if (bld.IsAlive) {
			if (.GotoEnter(pt, 0, 1000, false, 0))
				break;
		}
		else
			break;
	}

	if (bld.IsValid)
		if (bld.IsAlive) {
			building.settlement.AddUnit(this);
			return;
		}

	.AddCommand(false, "move", pt + Point(0, 1));//prevent moving all units to the same place
}
>>>>>>> mod
```

## 90. DATA/SUBAI/UNIT_CAPTURE.VS

```text
<<<<<<< HD
			/*
			// units can't capture allied human settlements until allied player is not been eliminated
			if( (DiplAreAllied(.player(), b.player()) == true) && (EnvReadInt(b.player(), "elimination") != 1) && (IsAIPlayer(b.player()) == false) )
			{
				return;
			}
			*/
||||||| 1.40
			// allied units capture settlements at once
=======
			/*
			// units can't capture allied human settlements until allied player is not been eliminated
			if( (DiplAreAllied(.player(), b.player()) == true) && (EnvReadInt(b.player(), "elimination") != 1) && (IsAIPlayer(b.player()) == false) )
			{
				return;
			}
			*/
			//modified by GureTaiga for ParryMode
			while(.GetParryMode() == 1)
          		{
                	return;
            	}
			//modified by GureTaiga for Cessfire
			while(.hero.SkillInEffect(hsCeasefire))
          		{
                	return;
            	}
>>>>>>> mod
```

## 91. DATA/SUBAI/UNIT_ON_ENTER.VS

```text
<<<<<<< HD
if( sett.GetCentralBuilding.IsHeirOf("BaseRuins") )
	return;
	
if( sett.GetCentralBuilding.IsHeirOf("Teleport") )
	return;
||||||| 1.40
if( sett.GetCentralBuilding.IsHeirOf("BaseRuins") )
	return;
=======
				if (i > 0) {
					int gold;
>>>>>>> mod
```

## 92. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
//
if (!Victim.IsSentry)
{
||||||| 1.40
//
=======
// Carthage
>>>>>>> mod
```

## 93. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
if (!Victim.IsSentry)
{
if (.AsUnit().inherentlevel > 3)
||||||| 1.40
if (.AsUnit().inherentlevel > 12)
=======
if (.AsUnit().inherentlevel >= 12)
>>>>>>> mod
```

## 94. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
	if (Victim.AsUnit)
	if (!Victim.IsSentry)
		if (.AsUnit().inherentlevel < Victim.AsUnit().inherentlevel)
		{
			int chance;
			chance = EnvReadInt(.player, "GamblersDayChance");
			if (rand(100) < chance)
			{
				.AsUnit.SetLevel(Victim.AsUnit.inherentlevel);
			} 
		}
	
||||||| 1.40
	if (Victim.AsUnit)
	if (!Victim.IsSentry)
		if (.AsUnit().inherentlevel < Victim.AsUnit().inherentlevel)
		{
			int chance;
			chance = EnvReadInt(.player, "GamblersDayChance");
			if (rand(100) < chance)
			{
				.AsUnit.SetLevel(Victim.AsUnit.inherentlevel);
			}
		}
=======
    if (Victim.AsUnit)
    if (!Victim.IsSentry)
        if (.AsUnit().inherentlevel < Victim.AsUnit().inherentlevel)
        {
            int chance;
            chance = EnvReadInt(.player, "GamblersDayChance");
            if (rand(100) < chance)
            {
                .AsUnit.SetLevel(Victim.AsUnit.inherentlevel);
            }
        }

// Statue of Zeus
if (EnvReadString(.player, "Statue of Zeus") == "researched")
    if (Victim.AsUnit)
    if (!Victim.IsSentry)
        if (.AsUnit().health>=1 && .AsUnit().health<=.AsUnit().maxhealth/10){
            int chance;
            chance = 50;
            if (rand(100) < chance){
                CreateFeedback("Heal", .AsUnit());
                .AsUnit.SetHealth(.AsUnit.maxhealth);
            }
        }

// Hero skills - VERSIONE FINALE CORRETTA
if (.AsUnit().hero.IsValid)
{
    // Battle Knowledge (come nel tuo originale)
    scoutPts = .AsUnit().hero.GetSkill(hsScout);
    if (scoutPts > 0) {
        ol = Intersect(ObjsInCircle(.pos, .range, "Military"), ClassPlayerObjs("Military", .player)).GetObjList();

        if (ol.Contains(this)) {
            ol.Remove(this);
        }
        
        if (ol.count > 0) {
            j = rand(ol.count-1); 
            u = ol[j].AsUnit();
            if (u.IsValid()) {
                if (u.IsAlive()) {
                    // CONDIZIONE ORIGINALE CORRETTA
                    if (!.AsHero().IsValid()) {
                        if (rand(100) <= scoutPts * 10) {
                            u.SetLevel(u.inherentlevel + 1);
                            CreateFeedback("Experience", u);
                        }
                    }
                }
            }
        }
    }
    
    // Egoism
    egoismPts = .AsUnit().hero.GetSkill(hsEgoism);
    if (egoismPts > 0) {
        ol = Intersect(ObjsInCircle(.pos, .range, "Hero"), EnemyObjs(.player, "Hero")).GetObjList();
        for(k = 0; k < ol.count; k += 1) {
            u = ol[k].AsUnit();
            exp = 1;
            if (!u.IsValid()) continue;
            if (u.IsDead()) continue;
            if (u.level <= 12) continue;
            if (rand(100) < egoismPts * 5) {
                u.SetExperience(u.experience - exp); 
                CreateFeedback("Damage1", u); 
            }   
            break;
        }
    }
    
    // Epic armor (3% per livello)
    epicArmorPts = .AsUnit().hero.GetSkill(hsEpicArmor);
    if (epicArmorPts > 0) {
        if (rand(100) <= epicArmorPts * 2) {
            .AsUnit().AddBonus(0, 1, 0, 0, 0);
            CreateFeedback("DefensiveStand", .AsUnit());
        }
    }
}
>>>>>>> mod
```

- `DATA/SUBAI/UNIT_REVEALS.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/UNIT_REVEALS_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 97. DATA/SUBAI/VILLAGE_REPOPULATE.VS

```text
<<<<<<< HD
ObjList olBuildings;
Building bld;
int i, monpop;
||||||| 1.40
ObjList olBuildings;
Building bld;
int i, minpop;
=======

>>>>>>> mod
```

## 98. DATA/SUBAI/VILLAGE_REPOPULATE.VS

```text
<<<<<<< HD
.Progress();

if(!.IsValid()) return;

monpop = GetConst("MonPopulation");
.settlement.SetPopulation(monpop);

olBuildings = .settlement.Buildings();
for (i = 0; i < olBuildings.count; i += 1)
{
	bld = olBuildings[i].AsBuilding();
	if (bld == this)
		continue;
	if (!bld.IsValid())
		continue;
	bld.RRepair();
}
.RRepair();
||||||| 1.40
.Progress();

if(!.IsValid()) return;

minpop = GetConst("MinPopulation");
.settlement.SetPopulation(minpop);

olBuildings = .settlement.Buildings();
for (i = 0; i < olBuildings.count; i += 1)
{
	bld = olBuildings[i].AsBuilding();
	if (bld == this)
		continue;
	if (!bld.IsValid())
		continue;
	bld.RRepair();
}
.RRepair();
=======

if (.IsValid) {
	Settlement set;
	int min_pop;

	.Progress();

	set = .settlement;

	min_pop = GetConst("MinPopulation") + 1;

	if (set.population < min_pop)
		set.AddToPopulation(min_pop - set.population);//do not use SetPopulation in order to manage villages whose maximum population is below MinPopulation

	//if the repair command is executed when the village hall is broken, the cost is paid back because of a possible bug in the source code, so the health is set directly
	if (.IsBroken)
		.SetHealth(.maxhealth / 3);

	//using .RRepair() terminates the script, making it impossible to force the cost after the repairs (this is why health is set directly)
}
>>>>>>> mod
```

## 99. DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS

```text
<<<<<<< HD
str class, dest;
int monpop,i,damagedhouse,damagedvillage;
ObjList olBuildings;
bool bBrokenVillage;

this = objs[0].AsBuilding;
if (!.IsValid())
	return false;

monpop = GetConst("MonPopulation");
damagedhouse = GetConst("HouseHealth");
damagedvillage = GetConst("VillageHealth");

bBrokenVillage = true;
if (.settlement.population>=monpop)
	return false;
	
if (!.IsBroken() && !.IsVeryBroken())
bBrokenVillage = false;

olBuildings = .settlement.Buildings();
for (i=0; i<olBuildings.count;i+=1)
{
	Building b;
	b = olBuildings[i];
	if (!b.IsValid) continue;
if (b.settlement.GetCentralBuilding.health<damagedvillage)
	bBrokenVillage = true;
if (b.health<damagedhouse)
  bBrokenVillage = true;  // checks if house health is lower than HouseHealth and returns true to bBrokenVillage.
	if ((b.IsBroken() || b.IsVeryBroken()))
	  bBrokenVillage = true;	
}
||||||| 1.40
str class, dest;
int minpop,i;
ObjList olBuildings;
bool bBrokenVillage;

this = objs[0].AsBuilding;
if (!.IsValid())
	return false;

minpop = GetConst("MinPopulation");

bBrokenVillage = true;
if (.settlement.population>=minpop)
	return false;
	
if (!.IsBroken() && !.IsVeryBroken())
	bBrokenVillage = false;

olBuildings = .settlement.Buildings();
for (i=0; i<olBuildings.count;i+=1)
{
	Building b;
	b = olBuildings[i];
	if (!b.IsValid) continue;
	if ((b.IsBroken() || b.IsVeryBroken()))
	  bBrokenVillage = true;	
}
=======

>>>>>>> mod
```

## 100. DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS

```text
<<<<<<< HD

dest = cmdparam;
class = ParseStr(dest, dest);
||||||| 1.40
dest = cmdparam;
class = ParseStr(dest, dest);
=======
			reasonText = rollover(this, in_need_unaffordable);
>>>>>>> mod
```

## 101. DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS

```text
<<<<<<< HD
this = objs[0].AsBuilding;
if ((cmdcost_gold > .settlement.gold) || (cmdcost_food > .settlement.food) || (cmdcost_pop>0 && cmdcost_pop + monpop > .settlement.population) )
{
	if (class!="")
		reasonText = rollover(this,class,true);
	else	
		reasonText = rollover(this,true);
	return true;
||||||| 1.40
this = objs[0].AsBuilding;
if ((cmdcost_gold > .settlement.gold) || (cmdcost_food > .settlement.food) || (cmdcost_pop>0 && cmdcost_pop + minpop > .settlement.population) )
{
	if (class!="")
		reasonText = rollover(this,class,true);
	else	
		reasonText = rollover(this,true);
	return true;
=======
			return true;
		}
	}
>>>>>>> mod
```

## 102. DATA/SUBAI/VILLAGE_TRIBUTEFOOD_VERIFY.VS

```text
<<<<<<< HD
if (!me.IsValid() || !it.IsValid())
	return false;
	
if(it.IsHeirOf("GGuardPost") == true || me.IsHeirOf("GGuardPost") == true)
	return false;

return me.player == it.player || DiplGetShareSupport(me.player, other.player);
||||||| 1.40
if (!me.IsValid() || !it.IsValid())
	return false;

return me.player == it.player || DiplGetShareSupport(me.player, other.player);
=======
return false;
>>>>>>> mod
```

## 103. DATA/SUBAI/WAGON_UNLOAD.VS

```text
<<<<<<< HD
Building bld;
point pt;
int FOOD = 1;
int GOLD = 0;
||||||| 1.40
Building bld;
point pt;
=======

>>>>>>> mod
```

## 104. DATA/SUBAI/WAGON_UNLOAD.VS

```text
<<<<<<< HD
bld = Bld.AsBuilding();

if(.IsValid() == false || bld.IsValid() == false)
{
	return;
}
if(.IsEnemy(bld) == true)
{
	return; /// the next command should be to return back
}
if(.restype() == FOOD && bld.IsHeirOf("GGuardPost") == true)
{
	return;
}
if(.restype() == GOLD && bld.IsHeirOf("TTent") == true)
{
	return;
}

.SetEntering(true);
pt = bld.GetEnterPoint(this);
while(!.GotoEnter(pt, 0, 2000, false, 2500))
{
	if (.IsEnemy(bld))
		return; /// the next command should be to return back
}

if (.restype == 1) { // food
  bld.settlement.SetFood(bld.settlement.food + .amount);
} else { // gold
  bld.settlement.SetGold(bld.settlement.gold + .amount);
}
.SetFood(0);//WTF?
.SetGold(0);
.Erase();
||||||| 1.40
bld = Bld.AsBuilding();

.SetEntering(true);
pt = bld.GetEnterPoint(this);
while(!.GotoEnter(pt, 0, 2000, false, 2500))
{
	if (.IsEnemy(bld))
		return; /// the next command should be to return back
}

if (.restype == 1) { // food
  bld.settlement.SetFood(bld.settlement.food + .amount);
} else { // gold
  bld.settlement.SetGold(bld.settlement.gold + .amount);
}
.SetFood(0);//WTF?
.SetGold(0);
.Erase();
=======

if (.IsValid)
	if (.IsAlive) {
		Building bld;

		bld = other.AsBuilding();

		if (bld.IsValid)
			if (bld.IsCentralBuliding)
				if (!.IsEnemy(bld)) {
					Settlement set;
					bool carry_food, can_enter = false;

					set = bld.settlement;
					carry_food = .restype == 1;

					if (carry_food) {
						if (set.max_food > 0)
							can_enter = true;
					}
					else if (set.max_gold > 0)
						can_enter = true;

					if (can_enter) {
						point pt;

						pt = bld.GetEnterPoint(this);

						.SetEntering(true);

						while (!.GotoEnter(pt, 0, 1000, false, 2500))
							if (.IsEnemy(bld))
								break;

						if (!.IsEnemy(bld)) {
							if (carry_food)
								set.SetFood(set.food + .amount);
							else
								set.SetGold(set.gold + .amount);

							.SetFood(0);
							.SetGold(0);
							.Erase();
						}
					}
				}
	}

Sleep(30);//prevent possible loops with other commands
>>>>>>> mod
```

- `UNITS/CNUMIDIANRIDER/ATTACK.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/ATTACK_SHADOW.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/DIE.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/DIE_SHADOW.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/IDLE.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/IDLE_SHADOW.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/TAUNT.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/TAUNT_SHADOW.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/TOATTACK.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/TOATTACK_SHADOW.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/WALK.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/CNUMIDIANRIDER/WALK_SHADOW.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/ISCOUT/DIE.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/ISCOUT/IDLE.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/ISCOUT/WALK.RLE.MMP`: changes an HD sprite: a mod cannot replace it (the game keeps its own); needs a new unit folder

- `UNITS/TTEUTONWOLF/TTEUTONWOLF.ENT.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

- `UNITS/WHORSE/WHORSE.ENT.XML`: changed, but 1.40 has no such file to compare: the mod's version was used
