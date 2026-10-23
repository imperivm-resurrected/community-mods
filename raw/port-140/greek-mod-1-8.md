# greek-mod-1-8: to check by hand

23 items. In each conflict the mod's side was used.

## 1. DATA/COPYRIGHTS.TXT

```text
<<<<<<< HD
Haemimont Games, FX Interactive, ImperivmWorld (2021)
||||||| 1.40

Copyright(c) 2002-2004 Haemimont Games
=======
HaemimontGames, RattlesMake, I.E.C. & RetroSpy(GNU AGPL3.0)
>>>>>>> mod
```

## 2. DATA/AI/GETTACTICSCRIPT.VS

```text
<<<<<<< HD
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
	if (nRace == RepublicanRome) //Roma Repubblicana o Roma Imperiale.
	{	
		/* L'AI SCEGLIE SE GIOCARE CON ROMA REPUBBLICANA O CON ROMA IMPERIALE O CON ROMA PUNICA: */
		if(EnvReadInt(set, "ChooseRomanRace") == 0)
		{
			int random;
			int REPUBLICAN = 0;
			int IMPERIAL = 1;
			int PUNIC = 2;
			                                            
			if (EnvReadString(set, "AI_AIlovesRome") == "Republican")
			{
				random = REPUBLICAN;
			}	//End if.
			else if (EnvReadString(set, "AI_AIlovesRome") == "Imperial")
			{
				random = IMPERIAL;
			}	//End else if.
			else if (EnvReadString(set, "AI_AIlovesRome") == "Punic")
			{
				random = PUNIC;
			}	//End else if.
			else
			{
				random = rand(3);
			}	//End else.

			if (random == REPUBLICAN)
			{
				EnvWriteString(set, "ChooseRepublicanRome", "researched");
				EnvWriteInt(set, "ChooseRomanRace", 1);
				//pr("Il giocatore " + player + " ha scelto Roma Repubblicana");
			}	//End if.
			if (random == IMPERIAL)
			{
				EnvWriteString(set, "ChooseImperialRome", "researched");
				EnvWriteInt(set, "ChooseRomanRace", 1);
				//pr("Il giocatore " + player + " ha scelto Roma Imperiale");
			}	//End if.
			if(random == PUNIC)
			{
				EnvWriteString(set, "ChoosePunicRome", "researched");
				EnvWriteInt(set, "ChooseRomanRace", 1);
				//pr("Il giocatore " + player + " ha scelto Roma Punica");
			}
		}	//End if.
		/* FINE L'AI SCEGLIE SE GIOCARE CON ROMA REPUBBLICANO O CON ROMA IMPERIALE O CON ROMA PUNICA. */

		/* ESECUZIONE DI UNA TATTICA ROMANA DA PARTE DELLA AI: */
		if (EnvReadString(set, "ChooseRepublicanRome") == "researched" || EnvReadString(set, "ChoosePunicRome") == "researched")
		{
			if (rnd < 50)
			{
				return TS_RRomeTactic;	
			}	//End if.
		}	//End if.
		if (EnvReadString(set, "ChooseImperialRome") == "researched")
		{
			if (rnd<33)
			{	
				return TS_MRomeTactic;		
			}	//End if.
			if (rnd<66)	
			{
				return TS_MRomeTactic2;
			}	//End if.
		}	//End if.	
		/* FINE ESECUZIONE DI UNA TATTICA ROMANA DA PARTE DELLA AI. */	
	}	//End if.
	// if(nRace == Greece)
	// {
	// }	//Fine if.
>>>>>>> mod
```

- `DATA/CLASSES/GGUARDPOST.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 4. DATA/CLASSES/IMOUNTAINEER.SC.XML

```text
<<<<<<< HD
    <behavior script="data/subai/sneak_behavior.vs"/>
||||||| 1.40
	<behavior script="data/subai/sneak_behavior.vs"/>
=======

>>>>>>> mod
```

- `DATA/CLASSES/TGUARDPOSTSENTRY.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 6. DATA/CLASSES/THUNTRESS.SC.XML

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
>>>>>>> mod
```

- `DATA/CLASSES/TTEUTONWOLF.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 8. DATA/COMMANDS/ARENA.XML

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

- `DATA/COMMANDS/TTENT.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 10. DATA/COMMANDS/VILLAGE.XML

```text
<<<<<<< HD
<!--
<cmd name="callIScout" priority="4"
	button="actions/train IScout.bmp"
	queueicon="gameres/icons/IScout.bmp"
	groupverifier="data/subai/verify_scout_train.vs"
	transpicon="1"
	traincommand="yes"
||||||| 1.40
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

## 11. DATA/SOUND ENTITIES/VOICERGLADIATOR.XML

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

## 12. DATA/SOUND ENTITIES/VOICERHASTATUS.XML

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

## 13. DATA/SOUND ENTITIES/VOICERPRINCIPLE.XML

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

## 14. DATA/SOUND ENTITIES/VOICERSCOUT.XML

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

- `DATA/SUBAI/GGUARDPOST_SENTRIES.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/HORSE_IDLE.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 17. DATA/SUBAI/MILITARY_ONDIE.VS

```text
<<<<<<< HD
exp = 1; // level to add
||||||| 1.40
exp = 1; // experience to add
=======
exp = 1; // experience to add
random = rand(4);
>>>>>>> mod
```

## 18. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 19. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 20. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
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
	Sleep(1000);
=======
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

>>>>>>> mod
```

## 21. DATA/SUBAI/UNIT_ATTACH_VERIFY.VS

```text
<<<<<<< HD
// bool, Obj me, Obj h

Unit this;
Hero hero;
int i;


hero = h.AsHero();
this = me.AsUnit();

if (!.IsValid()) return false;
if (me == h) return false;
if (!this.IsValid()) return false;
if (!hero.IsValid()) return false;
if (.IsEnemy(hero)) return false;
if (.HasFreedom) return false;
//if (.AsHero().IsValid()) return false;
if (.hero == hero) return false;
if (.IsHeirOf("Peasant")) return false;
return true;
||||||| 1.40
// bool, Obj me, Obj h

Unit this;
Hero hero;

hero = h.AsHero();
this = me.AsUnit();

if (!.IsValid()) return false;
if (me == h) return false;
if (!this.IsValid()) return false;
if (!hero.IsValid()) return false;
if (.IsEnemy(hero)) return false;
if (.HasFreedom) return false;
//if (.AsHero().IsValid()) return false;
if (.hero == hero) return false;
return true;
=======
// bool, Obj me, Obj h

Unit this;
Hero hero;

hero = h.AsHero();
this = me.AsUnit();

if (!.IsValid()) return false;
if (me == h) return false;
if (!this.IsValid()) return false;
if (!hero.IsValid()) return false;
if (.IsEnemy(hero)) return false;
if (.HasFreedom) return false;
if (.hero == hero) return false;
if (.IsHeirOf("Peasant")) return false;
if (hero.player != .player && DiplGetShareControl(hero.player, .player) == false && DiplGetShareControl(.player, hero.player) == false && IsMultiplayer() == false) return false;
return true;
>>>>>>> mod
```

## 22. DATA/SUBAI/UNIT_ATTACK.VS

```text
<<<<<<< HD
if (b.IsHeirOf("BaseVillage") && !b.IsEnemy(this)) return;
if (b.IsHeirOf("BaseHouse") && !b.IsEnemy(this)) return;

if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command
	.SetParryMode(false);
 
if(.HasSpecial(26) ) {
	.SetVisible(true);
}
||||||| 1.40
.SetParryMode(false); // leave parry mode at new command
=======
if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command
	.SetParryMode(false);
 
if(.HasSpecial(26) ) {
	.SetVisible(true);
}
>>>>>>> mod
```

## 23. DATA/SUBAI/UNIT_ON_KILL.VS

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
