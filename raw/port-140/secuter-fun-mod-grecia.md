# secuter-fun-mod-grecia: to check by hand

23 items. In each conflict the mod's side was used.

## 1. DATA/CLASSES/GOUTPOST.SC.XML

```text
<<<<<<< HD
	<method sig="goutpost_sellfood" vs="data/subai/goutpost_sellfood.vs"/>
    <method sig="goutpost_sellgold" vs="data/subai/goutpost_sellgold.vs"/>
||||||| 1.40
	<method sig="goutpost_sellfood" vs="data/subai/goutpost_sellfood.vs"/>
=======
	<method vs="data/subai/goutpost_sellfood.vs" sig="goutpost_sellfood"/>
>>>>>>> mod
```

## 2. DATA/CLASSES/TOUTPOST.SC.XML

```text
<<<<<<< HD
	<method sig="goutpost_sellfood" vs="data/subai/goutpost_sellfood.vs"/>
    <method sig="goutpost_sellgold" vs="data/subai/goutpost_sellgold.vs"/>
||||||| 1.40
	<method sig="goutpost_sellfood" vs="data/subai/goutpost_sellfood.vs"/>
=======
	<method vs="data/subai/goutpost_sellfood.vs" sig="goutpost_sellfood"/>
>>>>>>> mod
```

## 3. DATA/CLASSES/TTENT.SC.XML

```text
<<<<<<< HD
	<behavior script="data/subai/ttent_behavior.vs"/>
	<behavior script="data/subai/ttent_feeding_behavior.vs"/>
	<method sig="createfoodmulesmall" vs="data/subai/create_food_mule_small.vs"/>
	<method sig="createfoodmulebig"   vs="data/subai/create_food_mule_big.vs"/>
	<method sig="creategoldmulebig"   vs="data/subai/create_gold_mule_big.vs"/>
	<method sig="teutonProduction"    vs="data/subai/ttent_teuton_production.vs"/>
	<properties
		is_central_building="1"
		is_single_building="1"
		can_be_captured="1"
		can_be_attacked="0"
		produces_gold="0"
		produces_food="0"
		settlement_food="2400"
		settlement_gold="0"
		settlement_maxfood="100000000"
		settlement_maxgold="0"
		population="0"
		efficiency="1"
		max_population="0"
		max_units="0"
		settlement_icon_name=""
		minimap_icon_type="color"
	/>
	<value0
		icon="gameres/infobar/common/food ico.bmp"
		script="return .AsBuilding.settlement.food;"
		help=""
		rollover="Each new teuton produced costs 400 food"/>
	/>
	<defaultcmd target="">
		<cmd name="unitsout"/>
	</defaultcmd>
||||||| 1.40
	<behavior script="data/subai/ttent_behavior.vs"/>
	<behavior script="data/subai/ttent_feeding_behavior.vs"/>
	<properties
		is_central_building="1"
		is_single_building="1"
		can_be_captured="1"
		can_be_attacked="0"
		produces_gold="0"
		produces_food="0"
		settlement_food="0"
		settlement_gold="0"
		settlement_maxfood="100000000"
		settlement_maxgold="100000000"
		population="0"
		efficiency="1"
		max_population="0"
		max_units="0"
		settlement_icon_name=""
		minimap_icon_type="color"
	/>
	<value0
		icon="gameres/infobar/common/food ico.bmp"
		script="return .AsBuilding.settlement.food;"
		help=""
		rollover="Each new teuton produced costs 400 food"/>
	/>
	<defaultcmd target="">
		<cmd name="unitsout"/>
	</defaultcmd>
=======

>>>>>>> mod
```

## 4. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	groupverifier="data/subai/antic.vs"
	description="All new warriors and heroes are level 4"
	rollover="Fights"
	method="research"
	param="SetsSet, levels/Hero, 4, SetsSet, levels/BSwordsman, 4, SetsSet, levels/BBowman, 4, SetsSet, levels/BBronzeSpearman, 4, SetsSet,levels/BShieldBearer, 4, SetsSet,levels/BJavelineer, 4,SetsSet,levels/BHighlander, 4,NameSet, Fights, default,">
	<src obj="BMorrigansMonument"/>
</cmd>
<cmd name="MGladiator Shows" priority="2"
	button="Upgrades/Gladiator Show.bmp"
	key="s"
	queueicon="gameres/icons/upgrades/Gladiator Show.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/antic.vs"
	description="Allows Liberati to be hired. New heroes are level 4."
	rollover="Gladiator shows"
	method="research"
	researchcommand="yes"
	param="SetsSet, levels/Hero, 4, NameSet, Gladiator Shows, default">
	<src obj="MArena"/>
</cmd>
<cmd name="RGladiator Shows" priority="2"
	button="Upgrades/Gladiator Show.bmp"
	key="s"
	queueicon="gameres/icons/upgrades/Gladiator Show.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/antic.vs"
	description="Allows Gladiators to be hired and all new heroes are level 4"
	rollover="Gladiator shows"
	method="research"
	researchcommand="yes"
	param="SetsSet, levels/Hero, 4, NameSet, Gladiator Shows, default, NameSet, RGladiator, default">
	<src obj="RArena"/>
</cmd>
<cmd name="People's Assembly" priority="2"
	button="Upgrades/Peoples assembly.bmp"
	key="a"
	queueicon="gameres/icons/upgrades/peoples assembly.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/antic.vs"
	description="Allows the training of War Elephants"
	rollover="People's Assembly"
||||||| 1.40
	groupverifier="data/subai/verify_research.vs"
	description="All new warriors are level 4"
	rollover="Fights"
	method="research"
	param="SetsSet, levels/BSwordsman, 4, SetsSet, levels/BBowman, 4, SetsSet, levels/BBronzeSpearman, 4, SetsSet,levels/BShieldBearer, 4, SetsSet,levels/BJavelineer, 4,SetsSet,levels/BHighlander, 4,NameSet, Fights, default,">
	<src obj="BMorrigansMonument"/>
</cmd>
<cmd name="MGladiator Shows" priority="2"
	button="Upgrades/Gladiator Show.bmp"
	key="s"
	queueicon="gameres/icons/upgrades/Gladiator Show.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/verify_research.vs"
	description="Allows Liberati to be hired"
	rollover="Gladiator shows"
	method="research"
	researchcommand="yes"
	param="NameSet, Gladiator Shows, default">
	<src obj="MArena"/>
</cmd>
<cmd name="RGladiator Shows" priority="2"
	button="Upgrades/Gladiator Show.bmp"
	key="s"
	queueicon="gameres/icons/upgrades/Gladiator Show.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/verify_research.vs"
	description="Allows Gladiators to be hired"
	rollover="Gladiator shows"
	method="research"
	researchcommand="yes"
	param="NameSet, Gladiator Shows, default, NameSet, RGladiator, default">
	<src obj="RArena"/>
</cmd>
<cmd name="People's Assembly" priority="2"
	button="Upgrades/Peoples assembly.bmp"
	key="a"
	queueicon="gameres/icons/upgrades/peoples assembly.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/verify_research.vs"
	description="Allows the training of War Elephants"
	rollover="People's Assembly"
=======
	groupverifier="data/subai/verify_research.vs"
	description="Permette di reclutare il campione di Fand"
	rollover="Torneo di Fand"
>>>>>>> mod
```

## 5. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	execdelay = "30000"
	groupverifier="data/subai/antic.vs"
	description="Allows Mountaineers to be hired"
	rollover="Tournaments"
	method="research"
	researchcommand="yes"
	param="NameSet, Tournaments, default">
	<src obj="IArena"/>
||||||| 1.40
	execdelay = "30000"
	groupverifier="data/subai/verify_research.vs"
	description="Allows Mountaineers to be hired"
	rollover="Tournaments"
	method="research"
	researchcommand="yes"
	param="NameSet, Tournaments, default">
	<src obj="IArena"/>
=======
	costpop = "1"
	execdelay = "60000"
	rollover="Campione di Fand"
	description="Recluta un Campione di Fand"
	method="trainex"
	param="1, 1, GTridentHero, GTridentHero, Torneo di Fand">
	<src obj="GArena1"/>
	<src obj="GArena2"/>
>>>>>>> mod
```

## 6. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
<cmd name="Rome Training 1" priority="3"
	button="research/training.bmp"
	key="t"
	queueicon="gameres/icons/upgrades/btrain.bmp"
	costgold = "1000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/antic.vs"
	rollover="Training"
	description="Allows warriors to train to level 4"
	method="research"
	researchcommand="yes"
	param="ReqSet, Gladiator Shows, default, SetsPlr, maxtrainlevel, 4, NamePlr, Training, ">
	<src obj="RArena"/>
</cmd>
||||||| 1.40
<cmd name="Rome Training 1" priority="3"
	button="research/training.bmp"
	key="t"
	queueicon="gameres/icons/upgrades/btrain.bmp"
	costgold = "1000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/verify_research.vs"
	rollover="Training"
	description="Allows warriors to train to level 4"
	method="research"
	researchcommand="yes"
	param="ReqSet, Gladiator Shows, default, SetsPlr, maxtrainlevel, 4, NamePlr, Training, ">
	<src obj="RArena"/>
</cmd>
=======

>>>>>>> mod
```

## 7. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	execdelay = "30000"
	groupverifier="data/subai/antic.vs"
	rollover="Veteran Offense"
	description="Warriors receive a Veteran Offense medal (+20% damage) at their first kill"
	method="research"
||||||| 1.40
	execdelay = "30000"
	groupverifier="data/subai/verify_research.vs"
	rollover="Veteran Offense"
	description="Warriors receive a Veteran Offense medal (+20% damage) at their first kill"
	method="research"
=======
	costpop = "1"
	execdelay = "10000"
	rollover="Hire Trident Warrior"
	description="Hires a Trident Warrior"
	method="trainex"
	param="1, 10, GTridentWarrior, GTridentWarrior, Fights">
	<src obj="GArena1"/>
	<src obj="GArena2"/>
</cmd>
<cmd name="Trident Warrior Exp1" priority="5"
	button="research/trident warrior exp 1.bmp"
	key="e"
	queueicon="gameres/icons/upgrades/trident warrior exp 1.bmp"
	costgold = "800"
	costfood = "0"
	execdelay = "10000"
	groupverifier="data/subai/verify_research.vs"
	rollover="Trident Warrior Experience I"
	description="All new Trident Warriors are level 12"
>>>>>>> mod
```

## 8. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	execdelay = "30000"
	groupverifier="data/subai/antic.vs"
	rollover="Heroes' Wisdom"
	description="Increases heroes' experience with time"
	method="research"
	researchcommand="yes"
	param = "ReqSet, Tournaments, default, NamePlr, Heroes' Wisdom, "
	>
	<src obj="IArena"/>
||||||| 1.40
	execdelay = "30000"
	groupverifier="data/subai/verify_research.vs"
	rollover="Heroes' Wisdom"
	description="Increases heroes' experience with time"
	method="research"
	researchcommand="yes"
	param = "ReqSet, Tournaments, default, NamePlr, Heroes' Wisdom, "
	>
	<src obj="IArena"/>
=======
	costpop = "1"
	execdelay = "20000"
	param = "BritonHero"
	method="hirehero"
	help="/contents/units/BHero"
	rollover="Hire hero">
	<src obj="BMorrigansMonument"/>
>>>>>>> mod
```

## 9. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	researchcommand="yes"
	param = "ReqSet, Tournaments, , ReqPlr, Heroes' Wisdom, , NamePlr, Warriors' Wisdom, default "
	>
	<src obj="IArena"/>
</cmd>
<cmd name="Mahout School" priority="3"
	button="upgrades/Mahout school.bmp"
	key="t"
	queueicon="gameres/icons/upgrades/Mahout School.bmp"
	costgold = "500"
	costfood = "0"
	execdelay = "30000"
	groupverifier="data/subai/mahout_verify.vs"
	rollover="Mahout School"
	description="Increases the number of elephants you can support by 1"
	method="mahout_school"
	traincommand="yes"
	param = "People's Assembly"
	>
	<src obj="CArena"/>
||||||| 1.40
	researchcommand="yes"
	param = "ReqSet, Tournaments, , ReqPlr, Heroes' Wisdom, , NamePlr, Warriors' Wisdom, default "
	>
	<src obj="IArena"/>
</cmd>
<cmd name="Mahout School" priority="3"
	button="upgrades/Mahout school.bmp"
	key="t"
	queueicon="gameres/icons/upgrades/Mahout School.bmp"
	costgold = "800"
	costfood = "0"
	execdelay = "30000"
	groupverifier="data/subai/mahout_verify.vs"
	rollover="Mahout School"
	description="Increases the number of elephants you can support by 1"
	method="mahout_school"
	traincommand="yes"
	param = "People's Assembly"
	>
	<src obj="CArena"/>
=======
	param="ReqSet, Fights, default, SetsSet, levels/BVikingHero, 20, NameSet, Assemblea dei capi normanni, default">
	<src obj="BMorrigansMonument"/>
>>>>>>> mod
```

## 10. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
<cmd name="RNobility" priority="7"
	button="upgrades/nobility.bmp"
	key="n"
	queueicon="gameres/icons/upgrades/nobility.bmp"
	costgold = "3000"
	costfood = "0"
	execdelay = "60000"
	groupverifier="data/subai/antic.vs"
	rollover="Nobility"
	description="All warriors who reach level 8 become level 12"
	method="research"
	researchcommand="yes"
	param="ReqSet, Gladiator Shows, default, NamePlr, Nobility, default">
	<src obj="RArena"/>
</cmd>
<cmd name="Noble Offence" priority="7"
	button="research/noble offence.bmp"
	key="o"
	queueicon="gameres/icons/upgrades/noble offence.bmp"
||||||| 1.40
<cmd name="Noble Offence" priority="7"
	button="research/noble offence.bmp"
	key="o"
	queueicon="gameres/icons/upgrades/noble offence.bmp"
=======
<cmd name="Warriors' Wisdom" priority="3"
	button="upgrades/warriors wisdom.bmp"
	key="w"
	queueicon="gameres/icons/upgrades/Warriors Wisdom.bmp"
>>>>>>> mod
```

## 11. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
<cmd name="Standartization III" priority="2"
	button="Upgrades/flexibility.bmp"
	key="i"
	queueicon="gameres/icons/upgrades/Flexibility.bmp"
	costgold = "3000"
||||||| 1.40
<cmd name="Flexibility" priority="2"
	button="Upgrades/flexibility.bmp"
	key="i"
	queueicon="gameres/icons/upgrades/Flexibility.bmp"
	costgold = "4000"
=======
<!-- EGIPT ARENA -->
<cmd name="hireheroE" priority="1"
	button="actions/hire heroE.bmp"
	queueicon="gameres/icons/hire heroE.bmp"
	groupverifier="data/subai/verify_cmdcost_building.vs"
	traincommand="yes"
	key="h"
	costgold = "800"
	costfood = "0"
	costpop = "1"
	execdelay = "20000"
	param = "EgyptianHero"
	method="hirehero"
	help="/contents/units/EHero"
	rollover="Hire hero">
	<src obj="ETempleOfHorusAndAnubis"/>
</cmd>
<cmd name="Culto del faraone" priority="2"
	button="research/statue of osiris.bmp"
	queueicon="gameres/icons/upgrades/statue of osiris.bmp"
	costgold = "3000"
>>>>>>> mod
```

## 12. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, SetsPlr, standard_spawn_level, 12, NamePlr, Standartization III, default">
	<src obj="MArena"/>
||||||| 1.40
	param="ReqPlr, Standartization II, , SetsPlr, max_battle_level, 0, NamePlr, Flexibility, default">
	<src obj="MArena"/>
=======
	param = "ReqSet, Cult of Anubis, default, ReqSet, Cult of Horus, default, NamePlr, Culto del faraone, default, SetsSet, levels/EChariotHero, 20">
	<src obj="ETempleOfHorusAndAnubis"/>
</cmd>
<cmd name="Recluta Faraone" priority="2"
	button="actions/chariot of osiris.bmp"
	queueicon="gameres/icons/chariot of osiris.bmp"
	transpicon="1"
	groupverifier="data/subai/verify_trainex.vs"
	onaddremovescript="data/subai/trainex_onaddremove.vs"
	traincommand="yes"
	costgold = "2000"
	costfood = "0"
	costpop = "1"
	execdelay = "60000"
 	rollover="Faraone"
    description="Recluta Faraone"
	method="trainex"
	param="1, 1, EChariotHero, EChariotHero, Culto del faraone">
	<src obj="ETempleOfHorusAndAnubis"/>
>>>>>>> mod
```

## 13. DATA/COMMANDS/UNIT.XML

```text
<<<<<<< HD

||||||| 1.40
	<nsrc obj="RChariot"/>
	<nsrc obj="RLiberatus"/>
=======
	<nsrc obj="RChariot"/>
	<nsrc obj="RLiberatus"/-->
>>>>>>> mod
```

## 14. DATA/SUBAI/MILITARY_ONDIE.VS

```text
<<<<<<< HD
exp = 1; // level to add

if(EnvReadString(.player, "Warrior Tales") != "researched")
return;

||||||| 1.40
exp = 1; // experience to add

if(EnvReadString(.player, "Warrior Tales") != "researched")
	return;

=======
exp = 1; // experience to add
if(EnvReadString(.player, "Warrior Tales") == "researched")
{
>>>>>>> mod
```

## 15. DATA/SUBAI/ONFINISH_RESEARCH.VS

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

## 16. DATA/SUBAI/ONFINISH_RESEARCH.VS

```text
<<<<<<< HD
			.settlement.SetFoodProduction(.settlement.FoodProduction+GetConst("StrongholdFoodProduction"));
||||||| 1.40
			.settlement.SetFoodProduction(GetConst("StrongholdFoodProduction"));
=======
			.settlement.SetFoodProduction(.settlement.FoodProduction + GetConst("StrongholdFoodProduction"));
>>>>>>> mod
```

## 17. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
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
||||||| 1.40
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
=======
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
				
				u1 = Place(TroopA, .pos, .player);
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

				u2 = Place(TroopB, .pos, .player);
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
>>>>>>> mod
```

## 18. DATA/SUBAI/UNIT_ON_ENTER.VS

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
//if(sett.GetCentralBuilding.IsHeirOf("BaseRuins")) return;

sett.SetGold(sett.gold+1);
if (sett.gold) sett.SetGold(sett.gold-1);
else return;
>>>>>>> mod
```

## 19. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
if (!Victim.IsSentry)
{
if (EnvReadString(.player, "Spoils of war") == "researched") {
	.AddItem("Spoils of War");
||||||| 1.40
if (EnvReadString(.player, "Spoils of war") == "researched") {
	.AddItem("Spoils of War");
=======
if (EnvReadString(.player, "Spoils of war")=="researched" && !.IsHeirOf("Sentry") && !Victim.AsUnit.IsHeirOf("BaseAnimal")) {
	if(!.HasItem("Spoils of War"))
		.AddItem("Spoils of War");
	else
	if (.FindItem("Spoils of War").use_count == 0)
		.FindItem("Spoils of War").SetUseCount(2);
	else
		.FindItem("Spoils of War").SetUseCount(.FindItem("Spoils of War").use_count + 1);
>>>>>>> mod
```

## 20. DATA/SUBAI/UNIT_ON_KILL.VS

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

## 21. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
			chance = EnvReadInt(.player, "GamblersDayChance");
			if (rand(100) < chance)
			{
				.AsUnit.SetLevel(Victim.AsUnit.inherentlevel);
			} 
||||||| 1.40
			chance = EnvReadInt(.player, "GamblersDayChance");
			if (rand(100) < chance)
			{
				.AsUnit.SetLevel(Victim.AsUnit.inherentlevel);
			}
=======
			chance = 50;
			if (rand(100) < chance){
				CreateFeedback("Heal", .AsUnit());
				.AsUnit.SetHealth(.AsUnit.maxhealth);
			}
>>>>>>> mod
```

- `DATA/CLASSES/BASETENT.SC.XML`: class "ttent" is also HD's, in TTENT.SC.XML: two classes with one id (drop the mod's, or rename it)

- `DATA/CLASSES/WARWOLF.SC.XML`: class "wolfunit" is also HD's, in WOLFUNIT.SC.XML: two classes with one id (drop the mod's, or rename it)
