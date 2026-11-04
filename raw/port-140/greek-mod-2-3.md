# greek-mod-2-3: to check by hand

54 items. In each conflict the mod's side was used.

## 1. DATA/COPYRIGHTS.TXT

```text
<<<<<<< HD
Haemimont Games, FX Interactive, ImperivmWorld (2021)
||||||| 1.40

Copyright(c) 2002-2004 Haemimont Games
=======
HaemimontGames, RattlesMake, Mediterranevm, I.E.C.
>>>>>>> mod
```

## 2. DATA/AI/GETTACTICSCRIPT.VS

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

## 3. DATA/AI/GETTACTICSCRIPT.VS

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
		if (EnvReadString(set, "ChooseRepublicanRome") == "researched")
		{
			if (rnd < 50)
			{
				return TS_RRomeTactic;	
			}	//End if.
		}	//End if.
		if (EnvReadString(set, "ChoosePunicRome") == "researched")
		{   
		    if (rnd < 50)
			{
				return TS_MRomeTactic3;	
			}	//End if.
		}   //End if.
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

>>>>>>> mod
```

## 4. DATA/CLASSES/CNUMIDIANRIDER.SC.XML

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
	<!--given ONLY by the behaviour script-->
	<method sig="enter_tent" vs="data/subai/teuton_enter_tent.vs"/>
>>>>>>> mod
```

- `DATA/CLASSES/GGUARDPOST.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 6. DATA/CLASSES/IMOUNTAINEER.SC.XML

```text
<<<<<<< HD
    <behavior script="data/subai/sneak_behavior.vs"/>
||||||| 1.40
	<behavior script="data/subai/sneak_behavior.vs"/>
=======

>>>>>>> mod
```

- `DATA/CLASSES/ISCOUT.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 8. DATA/CLASSES/RCATAPULT.SC.XML

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

## 11. DATA/CLASSES/THUNTRESS.SC.XML

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

- `DATA/CLASSES/WHORSE.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 14. DATA/COMMANDS/ARENA.XML

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

## 15. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, SetsPlr, standard_spawn_level, 12, NamePlr, Standartization III, default">
	<src obj="MArena"/>
||||||| 1.40
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, NamePlr, Flexibility, default">
	<src obj="MArena"/>
=======
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, SetsPlr, standard_spawn_level, 10, NamePlr, Flexibility, default">
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

## 17. DATA/COMMANDS/UNIT.XML

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

## 18. DATA/COMMANDS/VILLAGE.XML

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

- `DATA/GAMESCRIPTS/5 ALTERNATIVE.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 20. DATA/SOUND ENTITIES/VOICERGLADIATOR.XML

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

## 21. DATA/SOUND ENTITIES/VOICERHASTATUS.XML

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

## 22. DATA/SOUND ENTITIES/VOICERPRINCIPLE.XML

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

## 23. DATA/SOUND ENTITIES/VOICERSCOUT.XML

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

- `DATA/SUBAI/HORSE_ENTER.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/HORSE_IDLE.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

- `DATA/SUBAI/IBERIAN_VILLAGE_TRAINISCOUT.VS`: changed, but 1.40 has no such file to compare: the mod's version was used

## 28. DATA/SUBAI/MILITARY_ONDIE.VS

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

## 29. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 30. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 31. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 32. DATA/SUBAI/STONEHENGE_BLOODLUST_DISPATCH.VS

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

## 33. DATA/SUBAI/TTENT_BEHAVIOR.VS

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

## 34. DATA/SUBAI/UNIT_ATTACH_VERIFY.VS

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

## 35. DATA/SUBAI/UNIT_CAPTURE.VS

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

## 36. DATA/SUBAI/UNIT_ON_KILL.VS

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
