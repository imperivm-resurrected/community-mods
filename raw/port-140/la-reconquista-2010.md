# la-reconquista-2010: to check by hand

30 items. In each conflict the mod's side was used.

## 1. DATA/COPYRIGHTS.TXT

```text
<<<<<<< HD
Haemimont Games, FX Interactive, ImperivmWorld (2021)
||||||| 1.40

Copyright(c) 2002-2004 Haemimont Games
=======

MOD LA RECONQUISTA Copyleft (k) 2010 Jvlivs Caesar
>>>>>>> mod
```

## 2. DATA/AI/GETTACTICSCRIPT.VS

```text
<<<<<<< HD
		if (rnd<100)	
			return TS_GaulTactic;
||||||| 1.40
		if (rnd<33)	
			return TS_GaulTactic;
		if (rnd<66)	
			return TS_GaulTactic2;
=======
		//if (rnd<33)	
			//return TS_GaulTactic;
		//if (rnd<66)	
			return TS_GaulTactic2;
>>>>>>> mod
```

## 3. DATA/AI/GETTACTICSCRIPT.VS

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
		//if (rnd<33)	
			//return TS_MRomeTactic;		
		//if (rnd<66)	
			return TS_MRomeTactic2;
>>>>>>> mod
```

## 4. DATA/CLASSES/CARTHAGINIANHERO.SC.XML

```text
<<<<<<< HD
	<properties HeroSkills="Vigor, Frenzy, Administration, Quick March, Wisdom"/>
||||||| 1.40
	<properties HeroSkills="Vigor, Frenzy, Rush, Egoism, Wisdom"/>
=======

>>>>>>> mod
```

- `DATA/CLASSES/GHERO7.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 6. DATA/CLASSES/IMPERIALROMANHERO.SC.XML

```text
<<<<<<< HD
	<properties HeroSkills="Administration, Team attack, Team defense, Quick March, Leadership"/>
||||||| 1.40
	<properties HeroSkills="Administration, Team attack, Team defense, Quick March, Discipline"/>
=======

>>>>>>> mod
```

## 7. DATA/CLASSES/REPUBLICANROMANHERO.SC.XML

```text
<<<<<<< HD
	<properties HeroSkills="Administration, Team attack, Team defense, Quick March, Leadership"/>
||||||| 1.40
	<properties HeroSkills="Administration, Team attack, Team defense, Quick March, Epic endurance"/>
=======

>>>>>>> mod
```

- `DATA/CLASSES/RHERO4.SC.XML`: changed, but 1.40 has no such file to compare: the mod's version was used

## 9. DATA/CLASSES/UNIT.SC.XML

```text
<<<<<<< HD

||||||| 1.40
	<method sig="hero_set_final_party_orientation" vs="data/subai/hero_set_final_party_orientation.vs"/>
=======
	<method sig="in_battle" vs="data/subai/unit_idle.vs"/>
	<method sig="hero_set_final_party_orientation" vs="data/subai/hero_set_final_party_orientation.vs"/>
>>>>>>> mod
```

## 10. DATA/COMMANDS/ARENA.XML

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

## 11. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
<cmd name="Rome Training 2" priority="3"
	button="research/Advanced training.bmp"
	key="t"
	queueicon="gameres/icons/upgrades/atrain.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/antic.vs"
	rollover="Advanced training"
	description="Allows warriors to train to level 8"
	method="research"
	researchcommand="yes"
	param="ReqSet, Gladiator Shows, , ReqPlr, Training, ,SetsPlr, maxtrainlevel, 8, NamePlr, Advanced Training, default">
	<src obj="RArena"/>
</cmd>
||||||| 1.40
<cmd name="Rome Training 2" priority="3"
	button="research/Advanced training.bmp"
	key="t"
	queueicon="gameres/icons/upgrades/atrain.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "25000"
	groupverifier="data/subai/verify_research.vs"
	rollover="Advanced training"
	description="Allows warriors to train to level 8"
	method="research"
	researchcommand="yes"
	param="ReqSet, Gladiator Shows, , ReqPlr, Training, ,SetsPlr, maxtrainlevel, 8, NamePlr, Advanced Training, default">
	<src obj="RArena"/>
</cmd>
=======

>>>>>>> mod
```

## 12. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	param = "ReqSet, People's Assembly, default, NameSet, Shared Strength, "
	>
	<src obj="CArena"/>
</cmd>
<cmd name="Shared Triumph" priority="3"
	button="research/shared triumph.bmp"
	key="s"
	queueicon="gameres/icons/upgrades/Shared Triumph.bmp"
	costgold = "1000"
	costfood = "0"
	execdelay = "30000"
	groupverifier="data/subai/antic.vs"
	rollover="Shared Triumph"
	description="If you have over 24 warriors of a type the new ones you hire are level 12"
	method="research"
	researchcommand="yes"
	param = "ReqSet, Shared Strength, , NameSet, Shared Triumph, default"
	>
||||||| 1.40
	param = "ReqSet, People's Assembly, default, NameSet, Shared Strength, "
	>
	<src obj="CArena"/>
</cmd>
<cmd name="Shared Triumph" priority="3"
	button="research/shared triumph.bmp"
	key="s"
	queueicon="gameres/icons/upgrades/Shared Triumph.bmp"
	costgold = "2000"
	costfood = "0"
	execdelay = "30000"
	groupverifier="data/subai/verify_research.vs"
	rollover="Shared Triumph"
	description="If you have over 24 warriors of a type the new ones you hire are level 12"
	method="research"
	researchcommand="yes"
	param = "ReqSet, Shared Strength, , NameSet, Shared Triumph, default"
	>
=======
	param = "ReqSet,People's Assembly,default,NameSet,Shared Strength,">
>>>>>>> mod
```

## 13. DATA/COMMANDS/GBARRACKS.XML

```text
<<<<<<< HD
<cmd name="trainGHorseman" priority="7"
	button="actions/train GHorseman.bmp"
	queueicon="gameres/icons/GHorseman.bmp"
	transpicon="1"
	groupverifier="data/subai/barrack_train_verify.vs"
	traincommand="yes"
	key="h"
	help="/contents/units/GHorseman"
	costgold = "170"
	costfood = "0"
	costpop = "1"
	execdelay = "20000"
	rollover="Equip Horseman"
	method="train"
	param="GHorseman, Horseshoes"
	sclass="GHorseman">
	<src obj="GBarracks"/>
</cmd>
<cmd name="trainGWomanWarrior" priority="8"
||||||| 1.40
<cmd name="trainGHorseman" priority="7"
	button="actions/train GHorseman.bmp"
	queueicon="gameres/icons/GHorseman.bmp"
	transpicon="1"
	groupverifier="data/subai/barrack_train_verify.vs"
	traincommand="yes"
	key="h"
	help="/contents/units/GHorseman"
	costgold = "160"
	costfood = "0"
	costpop = "1"
	execdelay = "20000"
	rollover="Equip Horseman"
	method="train"
	param="GHorseman, Horseshoes"
	sclass="GHorseman">
	<src obj="GBarracks"/>
</cmd>
<cmd name="trainGWomanWarrior" priority="8"
=======
<cmd name="trainGWomanWarrior" priority="9"
>>>>>>> mod
```

## 14. DATA/COMMANDS/VILLAGE.XML

```text
<<<<<<< HD
<cmd name="repair guard post" priority="1"
	method="repair"
	button="actions/repair.bmp"
	key="r"
	queueicon="gameres/icons/upgrades/repair.bmp"
	groupverifier="data/subai/verify_cmdcost_building.vs"
	rollover="Repair"
	costgold = "500"
	costfood = "0"
	execdelay = "60000">
	<src obj="GGuardPost"/>
</cmd>

<cmd name="tribute" priority="2"
||||||| 1.40
<cmd name="tribute" priority="2"
=======
<cmd name="tribute_food" priority="2"
>>>>>>> mod
```

## 15. DATA/COMMANDS/VILLAGE.XML

```text
<<<<<<< HD
</cmd>

<cmd name="stoptribute" priority="2"
	immediate="yes"
	groupverifier="data/subai/village_houses_broken_verify.vs"
	button="states/Stop Tribute.bmp"
	key="t"
	rollover="Supply"
	description = "Stop sending resources">
	<src obj="BaseVillage"/>
	<nsrc obj="GGuardPost"/>
	<src obj="Outpost"/>
	<src obj="BaseShipyard"/>
||||||| 1.40
</cmd>

<cmd name="stoptribute" priority="2"
	immediate="yes"
	groupverifier="data/subai/village_houses_broken_verify.vs"
	button="states/Stop Tribute.bmp"
	key="t"
	rollover="Supply"
	description = "Stop sending resources">
	<src obj="BaseVillage"/>
	<src obj="Outpost"/>
	<src obj="BaseShipyard"/>
=======
	<src obj="BaseTownhall"/>
	<src obj="IronMine"/>
>>>>>>> mod
```

## 16. DATA/SUBAI/GROUP_DETACH.VS

```text
<<<<<<< HD
		if(h.IsValid) 
		{
			/* LE UNITA', SE GUIDATE DA UN EROE CHE STA ENTRANDO IN UNA GROTTA, DOPO ESSERE SVINCOLATE SE SONO FUORI NON VI ENTRANO:  */
			if(h.command() == "teleport" || (h.InHolder() == true && h.GetHolderSett().GetCentralBuilding().IsHeirOf("Teleport") == true) )
			{
				u.SetCommand("idle");
			}
			/* FINE LE UNITA', SE GUIDATE DA UN EROE CHE STA ENTRANDO IN UNA GROTTA, DOPO ESSERE SVINCOLATE SE SONO FUORI NON VI ENTRANO.  */
			
			u.DetachFrom(h);
		}
||||||| 1.40
		if( h.IsValid ) {
			u.DetachFrom(h);
		}
=======
	        if( h.IsValid ) {
	        	//pr("DetachFrom");
	        	u.DetachFrom(h);
                	if(u.stamina > 0){ 
	                        u.SetStamina(0);
	                        CreateFeedback("StaminaLoss", u);
	                }
	        }                        

>>>>>>> mod
```

## 17. DATA/SUBAI/HERO_ATTACK.VS

```text
<<<<<<< HD
//.pr("hero::attack: target locked!!!");


if(target.IsValid() == true)
{
	if(target.IsHeirOf("Hero") == true && target.AsHero().army().count() >= 5)
	{
		return;
	}
}

||||||| 1.40
//.pr("hero::attack: target locked!!!");

=======
//pr("hero::attack: target locked!!!");
//}
>>>>>>> mod
```

## 18. DATA/SUBAI/HERO_LEAVE_ARMY.VS

```text
<<<<<<< HD
//void, Obj This

Hero this;

this = This.AsHero();

if(.IsValid() == true && .army().count() >= 1)
{
	.army().SetCommand("idle");
}
this.AsHero().DetachArmy();
||||||| 1.40
//void, Obj this
this.AsHero().DetachArmy();
=======
//void, Obj this
Hero h;
int i;

h = this.AsHero();

for(i = 0; i < h.army.count; i += 1)
{     
	Unit u;
        u = h.army[i].AsUnit;
        if(u.IsValid){
        	if(u.stamina > 0){ 
	                u.SetStamina(0);
	                CreateFeedback("StaminaLoss", u);
	        }
        }
        Sleep(10);
}
h.DetachArmy(); 

>>>>>>> mod
```

## 19. DATA/SUBAI/HERO_MOVE.VS

```text
<<<<<<< HD
point dpt;

//pr("hero::move");
||||||| 1.40
point dpt;

//.pr("hero::move");
=======
Unit u;
ObjList ol;
point dpt;  
int x, e, c;
//.pr("hero::move");
>>>>>>> mod
```

## 20. DATA/SUBAI/IMILITAMAN_CONVERT.VS

```text
<<<<<<< HD
while (!.Stop(1000))
	;
.Mutate("IVillager");
||||||| 1.40
while (!.Stop(1000))
	;
ptm = .pos;
pl = .player;
u = Place("IVillager", ptm, pl);
if (.InHolder()) {
	.GetHolderSett.ForceAddUnit(u);
}
.Erase();
=======
while (!.Stop(1000));

Sleep(rand(1000)+100);

.Mutate("IVillager");   
//ptm = .pos;
//pl = .player;
//u = Place("IVillager", ptm, pl);
//if (.InHolder()) {
	//.GetHolderSett.ForceAddUnit(u);
//}
//.Erase();
>>>>>>> mod
```

## 21. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
int min_resource, refresh, food_sales, gold_sales, food_income, required_gold, gold_income, reserved_food;
int i;
||||||| 1.40
int min_resource, refresh, food_sales, food_income, required_gold, gold_income, reserved_food;
int i;
=======
int min_resource_food, min_resource_gold, refresh, food_sales, food_income, required_gold, gold_income, reserved_food;
int i, p;
>>>>>>> mod
```

## 22. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
bool bProduceGold, bSellFood, bSellGold, bWagon;
ObjList olLibyansOut;
||||||| 1.40
bool bProduceGold, bSellFood, bWagon;
ObjList olLibyansOut;
=======
bool bProduceGold, bSellFood, bWagon;
ObjList olUnitsTributeOut;
>>>>>>> mod
```

## 23. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
    
    // food_sales = gold_sales = 20
    // food_income = 10
    
||||||| 1.40
	// gaul outpost behaviour
=======
	// gaul outpost behaviour
        if (.gold > 120 && !bSellFood && (This.AsBuilding().class == "GOutpost" ||
        	            		  This.AsBuilding().class == "TOutpost")) {
                .SetGold(.gold - 10);
                .SetFood(.food + 10);         
        }
        
>>>>>>> mod
```

## 24. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
	if (.gold > min_resource && !bSellGold) {
||||||| 1.40
	if (.gold > min_resource) {
=======
	if (.gold > min_resource_gold) {
>>>>>>> mod
```

## 25. DATA/SUBAI/UNIT_ATTACK.VS

```text
<<<<<<< HD
ObjList enemies;
Building b;
||||||| 1.40
ObjList enemies;
=======
ObjList olBall;
>>>>>>> mod
```

## 26. DATA/SUBAI/UNIT_ENTER.VS

```text
<<<<<<< HD
if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command
	.SetParryMode(false);
||||||| 1.40
if (.IsValid) // leave parry mode at new command
 .SetParryMode(false);
=======

if(!.IsValid) return;
if (.IsValid) // leave parry mode at new command
 .SetParryMode(false);
>>>>>>> mod
```

## 27. DATA/SUBAI/UNIT_MOVE.VS

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


if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command
	.SetParryMode(false);
||||||| 1.40
if (.IsValid) // leave parry mode at new command
 .SetParryMode(false);
=======
if (.IsValid) // leave parry mode at new command
 .SetParryMode(false);
//pr("move");
>>>>>>> mod
```

## 28. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
//Statistics:
if(.IsValid() == true)
{
	bool uccisoreOk;
	bool vittimaOk;
	
	//Si considerano solo uccisori/vittime: soldati (no sentinelle (per vittime), navi e arieti), eroi, sacerdoti/drudi/maghe/sciamani:
	uccisoreOk = (.AsUnit().IsHeirOf("Military") == true && .AsUnit().IsHeirOf("ShipBattle") == false && .AsUnit().IsHeirOf("RamUnit") == false) || (.AsUnit().IsHeirOf("BaseMage") == true) || (.AsUnit().IsHeirOf("Hero") == true);
	vittimaOk = (Victim.IsHeirOf("Military") == true && Victim.IsHeirOf("Sentry") == false && Victim.IsHeirOf("ShipBattle") == false && Victim.IsHeirOf("RamUnit") == false) || (Victim.IsHeirOf("BaseMage") == true) || (Victim.IsHeirOf("Hero") == true);
	
	if(uccisoreOk == true && vittimaOk == true)
	{
		int PRIMO_GIOCATORE_NEUTRALE = 13;
		
		EnvWriteInt(Victim.player(), "EEE_TotUnitsDeath", EnvReadInt(Victim.player(), "EEE_TotUnitsDeath") + 1); //Add 1 to number of death units.
		
		//Nelle uccisioni non si conteggiano le unitÃ  che presidiano i forti neutrali.
		if(Victim.player() < PRIMO_GIOCATORE_NEUTRALE)
		{
			EnvWriteInt(.player(), "EEE_TotUnitsKilled", EnvReadInt(.player(), "EEE_TotUnitsKilled") + 1); //Add 1 to number of killed units.
		}	//Fine if.
	}	//Fine if.
}	//Fine if.	
	
// Egypt
if (!Victim.IsSentry)
{
||||||| 1.40
// Egypt
=======
           
>>>>>>> mod
```

## 29. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
//
if (!Victim.IsSentry)
{
||||||| 1.40
//
=======

>>>>>>> mod
```

## 30. DATA/SUBAI/VILLAGE_REPOPULATE.VS

```text
<<<<<<< HD
monpop = GetConst("MonPopulation");
.settlement.SetPopulation(monpop);
||||||| 1.40
minpop = GetConst("MinPopulation");
.settlement.SetPopulation(minpop);
=======
minpop = GetConst("MinPopulation");
.settlement.SetPopulation(minpop);
EnvWriteString(.settlement, "burn", "off");
//if(.settlement.gold >= 4000)
//.settlement.SetGold(-1000);
>>>>>>> mod
```
