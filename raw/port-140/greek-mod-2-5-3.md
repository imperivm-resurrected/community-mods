# greek-mod-2-5-3: to check by hand

86 items. In each conflict the mod's side was used.

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
	nActualPerc = 90;
else if (set.IsTTent())
	nActualPerc = 80;
else if (set.IsOutpost()) {
	nActualPerc = 60;
	if (set.IsIndependent)
		nActualPerc = 80;
	if (AIVar(idPlayer, AIV_TradeGold) > 0) {
		int nRace;
		nRace = set.GetCentralBuilding().race;
		if (nRace == RepublicanRome)
			nActualPerc += 10;
		else if (nRace == Egypt)
>>>>>>> mod
```

## 3. DATA/AI/GETTACTICSCRIPT.VS

```text
<<<<<<< HD

||||||| 1.40
		if (rnd<66)	
			return TS_GaulTactic2;
=======
		if (rnd<90)	
			return TS_GaulTactic2;
>>>>>>> mod
```

## 4. DATA/AI/GETTACTICSCRIPT.VS

```text
<<<<<<< HD
		if (rnd<33)	
			return TS_MRomeTactic;		
		if (rnd<66)	
			return TS_MRomeTactic;
||||||| 1.40
		if (rnd<33)	
			return TS_MRomeTactic;		
		if (rnd<66)	
			return TS_MRomeTactic2;
=======
		if (rnd<100)	
			return TS_CarthageTactic;					
>>>>>>> mod
```

## 5. DATA/AI/GS_CAPTURE.VS

```text
<<<<<<< HD

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

			if (state == SS_Siege)
			if (squad.State != SS_Catapult)
			if (!squad.Leader.IsHeirOf("CWarElephant"))
			{
				int nMil, nMaxCat;
				nMil = squad.Count("Military");
				nMaxCat = nMil / 15;
				if (nMaxCat <= 0) nMaxCat = 1;
				squad.Siege(set.GetCentralBuilding, nMaxCat, SS_Catapult, SS_Siege);
||||||| 1.40

			if (state == SS_Capture)
			if (squad.State != SS_Capture || !squad.Leader.AsHero.IsValid)
				squad.SetCmd(SS_Capture, 0, SF_ADVCHOOSER, "capture", set.GetCentralBuilding);

			if (state == SS_Siege)
			if (squad.State != SS_Catapult)
			if (!squad.Leader.IsHeirOf("CWarElephant"))
			{
				int nMil, nMaxCat;
				nMil = squad.Count("Military");
				nMaxCat = nMil / 15;
				if (nMaxCat <= 0) nMaxCat = 1;
				squad.Siege(set.GetCentralBuilding, nMaxCat, SS_Catapult, SS_Siege);
=======

>>>>>>> mod
```

## 6. DATA/AI HELPERS/SIEGE.VS

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

## 7. DATA/AI HELPERS/SIEGE.VS

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

## 8. DATA/CLASSES/CNUMIDIANRIDER.SC.XML

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

## 9. DATA/CLASSES/IMOUNTAINEER.SC.XML

```text
<<<<<<< HD
    <behavior script="data/subai/sneak_behavior.vs"/>
||||||| 1.40
	<behavior script="data/subai/sneak_behavior.vs"/>
=======

>>>>>>> mod
```

- `DATA/CLASSES/ISCOUT.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 11. DATA/CLASSES/RCATAPULT.SC.XML

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

## 14. DATA/CLASSES/THUNTRESS.SC.XML

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

- `DATA/CLASSES/TTEUTONWOLF.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/CLASSES/WHORSE.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 17. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	param="SetsSet, levels/Hero, 4, NameSet, Gladiator Shows, default">
	<src obj="MArena"/>
||||||| 1.40
	param="NameSet, Gladiator Shows, default">
	<src obj="MArena"/>
=======
	param="SetsSet, levels/Hero, 4, NameSet, Gladiator Shows, default, NameSet, RGladiator, default" >
	<src obj="RArena"/>
>>>>>>> mod
```

## 18. DATA/COMMANDS/ARENA.XML

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

## 20. DATA/COMMANDS/UNIT.XML

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

## 21. DATA/COMMANDS/VILLAGE.XML

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

## 23. DATA/SOUND ENTITIES/VOICERGLADIATOR.XML

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

## 24. DATA/SOUND ENTITIES/VOICERHASTATUS.XML

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

## 25. DATA/SOUND ENTITIES/VOICERPRINCIPLE.XML

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

## 26. DATA/SOUND ENTITIES/VOICERSCOUT.XML

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

## 27. DATA/SUBAI/ACTIVATE_HERO_SKILL.VS

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

## 28. DATA/SUBAI/BUILD_CATAPULT.VS

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
builders = objs.FilterClosest(pt, GetConst("CatapultMaxUnits"));
>>>>>>> mod
```

## 29. DATA/SUBAI/BUILD_CATAPULT.VS

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

## 30. DATA/SUBAI/CREATE_GOLD_MULE_BIG.VS

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

## 31. DATA/SUBAI/GOUTPOST_SELLFOOD.VS

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

## 33. DATA/SUBAI/HERO_CAPTURE.VS

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

## 34. DATA/SUBAI/HERO_CAPTURE.VS

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

## 40. DATA/SUBAI/MILITARY_ONDIE.VS

```text
<<<<<<< HD
exp = 1; // level to add
||||||| 1.40
exp = 1; // experience to add
=======
exp = 1; // experience to add
random = rand(4);

if(EnvReadString(.player, "Warrior Tales") != "researched")
	return;

ol = ObjsInCircle(.pos, .sight, "Military").GetObjList();

if(random == 1)
	for(i = 0; i < ol.count; i += 1) {
		u = ol[i].AsUnit();
		if (!u.IsValid()) continue;
		if (.IsEnemy(u)) continue;
		if (u.AsHero().IsValid())continue;
		u.SetExperience(u.experience + exp);
		u.SetStamina(10);
		break;
	}

/*

		OLD TYPE 

exp = 1; // experience to add
random = rand(4);
>>>>>>> mod
```

## 41. DATA/SUBAI/ONFINISH_RESEARCH.VS

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
		// Tribute implementation
>>>>>>> mod
```

## 42. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 43. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 44. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
Settlement this;
int min_resource, refresh, food_sales, gold_sales, food_income, required_gold, gold_income, reserved_food;
int i;
||||||| 1.40
Settlement this;
int min_resource, refresh, food_sales, food_income, required_gold, gold_income, reserved_food;
int i;
=======
Settlement this, supplied;
ObjList macemen, hoplites, units_in, units_out;
>>>>>>> mod
```

## 45. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
bool bProduceGold, bSellFood, bSellGold, bWagon;
ObjList olLibyansOut;
ObjList olUnitsOut;
str strCommand;
||||||| 1.40
bool bProduceGold, bSellFood, bWagon;
ObjList olLibyansOut;
ObjList olUnitsOut;
str strCommand;
=======
Unit u;
Building suppliedHall;
int refresh, food_sales, food_income, gold_income, required_gold, min_resource, i;
bool is_gold_outpost = false, is_selling_food, is_selling_gold;
>>>>>>> mod
```

## 46. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
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
||||||| 1.40
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
=======

while (1) {
	//resources production
	is_selling_food = EnvReadString(this, "GOutpostSellFood") == "yes";
	is_selling_gold = EnvReadString(this, "GOutpostSellGold") == "yes";
	if (is_selling_food)
		if (.food >= food_sales) {
			.SetFood(.food - food_sales);
			.SetGold(.gold + food_income);
			.GoldConverted(food_income);
>>>>>>> mod
```

## 47. DATA/SUBAI/STONEHENGE_BLOODLUST_DISPATCH.VS

```text
<<<<<<< HD
.SetCommand("bloodlust");
||||||| 1.40
.SetCommand("bloodlust");

=======
.SetCommand("bloodlust");

//Clean interface
for(i=1;i<=8;i+=1){
	SetPlayerStatus(i, 2, Translate(""), false);
	SetPlayerStatus(i, 3, Translate(""), false);
	SetPlayerStatus(i, 4, Translate(""), false);
}
>>>>>>> mod
```

- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/STONEHENGE_TEUTON_DISASTER_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 50. DATA/SUBAI/TAVERN_INVESTMENT.VS

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

## 52. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
Query qSight, qEnemies, qFriends;
ObjList olAll1,olAll2, olTeutonsOut, olOurTeutons;
int i;
point p;
rect rc;
int exp_gain, old_exp_gain;
int delay;
||||||| 1.40
Query qSight, qEnemies, qFriends;
ObjList olAll1,olAll2, olTeutonsOut, olOurTeutons;
int i;
point p;
rect rc;
int exp_gain, old_exp_gain;
=======

>>>>>>> mod
```

## 53. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
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
||||||| 1.40
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
=======
	first_time_independent = set.IsIndependent;

	while (1) {
		player = .player;
		exp_gain = MAX(0, GetTime() / 120000 - 5);

		//spawn neutral or produced teutons
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
>>>>>>> mod
```

## 54. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
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
||||||| 1.40
		// handle the capturing
		qSight = VisibleObjsInSight(this, "Unit");
		qEnemies = Intersect(qSight, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
		qFriends = Intersect(qSight, ClassPlayerObjs("Military", .player));
		qEnemies.GetObjList().ClearDead;
		qFriends.GetObjList().ClearDead;
		while (!qEnemies.IsEmpty() && olTeutonsOut.count == 0 && qFriends.IsEmpty()) {
			ObjList list1;
			int newplayer, k;
=======

>>>>>>> mod
```

## 55. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
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

}
||||||| 1.40
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
=======
}
>>>>>>> mod
```

## 56. DATA/SUBAI/UNIT_BUILD_CATAPULT.VS

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

## 57. DATA/SUBAI/UNIT_BUILD_CATAPULT.VS

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

## 58. DATA/SUBAI/UNIT_CAPTURE.VS

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

## 59. DATA/SUBAI/UNIT_ON_ENTER.VS

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

## 60. DATA/SUBAI/UNIT_ON_KILL.VS

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

- `DATA/SUBAI/UNIT_REVEALS.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/UNIT_REVEALS_VERIFY.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 63. DATA/SUBAI/VILLAGE_REPOPULATE.VS

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

## 64. DATA/SUBAI/VILLAGE_REPOPULATE.VS

```text
<<<<<<< HD
monpop = GetConst("MonPopulation");
.settlement.SetPopulation(monpop);
||||||| 1.40
minpop = GetConst("MinPopulation");
.settlement.SetPopulation(minpop);
=======
	.Progress();
>>>>>>> mod
```

## 65. DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS

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

## 66. DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS

```text
<<<<<<< HD

dest = cmdparam;
class = ParseStr(dest, dest);
||||||| 1.40
dest = cmdparam;
class = ParseStr(dest, dest);
=======
		reasonText = rollover(this, unaffordable);
>>>>>>> mod
```

## 67. DATA/SUBAI/VILLAGE_REPOPULATE_VERIFY.VS

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
>>>>>>> mod
```

## 68. DATA/SUBAI/VILLAGE_TRIBUTEFOOD_VERIFY.VS

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

## 69. DATA/SUBAI/WAGON_UNLOAD.VS

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

## 70. DATA/SUBAI/WAGON_UNLOAD.VS

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

if (.IsValid) {
	Building bld;

	bld = Bld.AsBuilding();

	if (bld.IsValid)
		if (bld.IsCentralBuliding)
			if (!.IsEnemy(bld)) {
				Settlement set;
				bool carry_food, can_enter = false;

				set = bld.settlement;
				carry_food = .restype == 1;//0 = gold, 1 = food

				if (carry_food) {
					if (set.max_food > 0)
						can_enter = true;
				}
				else if (set.max_gold > 0)//note that tents have 0 so it is not needed to use IsHeirOf/IsTTent
					can_enter = true;

				if (can_enter) {
					point pt;

					.SetEntering(true);

					pt = bld.GetEnterPoint(this);
					while (!.GotoEnter(pt, 0, 2000, false, 2500))
						if (.IsEnemy(bld))
							return;

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
