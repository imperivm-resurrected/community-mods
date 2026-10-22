//void, Obj This

Building this;
Query qRange, qEnemies, qFriends;
ObjList olAll1,olAll2,olAll3,olAll4, olDefendersOut1,olDefendersOut2,olDefendersOut3,olDefendersOut4, olOurDefenders;
int i;
point p;
rect rc;
int old_level_1,old_level_2,old_level_3,old_level_4, end_level_1,end_level_2,end_level_3,end_level_4;
int beg_time_1,beg_time_2,beg_time_3,beg_time_4, time, interval_1,interval_2,interval_3,interval_4; //Set new level time
bool bNoMore1, bNoMore2, bNoMore3, bNoMore4;

//constants
int nDefendersMax1,	//how much units from cls1 to spawn at max
	nDefendersMax2,	//how much units from cls2 to spawn at max
	nDefendersMax3,	//how much units from cls3 to spawn at max
	nDefendersMax4,	//how much units from cls4 to spawn at max
	nDefendersOut1,	//how much units to keep outside if an enemy comes
	nDefendersOut2,	//how much units to keep outside if an enemy comes
	nDefendersOut3,	//how much units to keep outside if an enemy comes
	nDefendersOut4;	//how much units to keep outside if an enemy comes
int nFoodIn;

str sDefenderCls1,sDefenderCls2,sDefenderCls3,sDefenderCls4;// defender classes

int old_player;

// array con le unità extra
StrArray DefenderCls3, DefenderCls4;
IntArray DefendersMax3, DefendersMax4,  DefendersOut3, DefendersOut4;
int StartLevel = 8, EndLevel = 24;

// 0:Gaul, 1:Rome, 2:Carthage, 3:Iberia, 4:Greece, 5:Britain, 6:Egypt, 7:Germany
DefenderCls3[0] = "GArcher"; DefendersMax3[0] = 16; DefendersOut3[0] = 4;
DefenderCls3[1] = "RPrinciple"; DefendersMax3[1] = 6; DefendersOut3[1] = 4;
DefenderCls3[2] = "CBerberAssassin"; DefendersMax3[2] = 6; DefendersOut3[2] = 4;
DefenderCls3[3] = "IArcher"; DefendersMax3[3] = 12; DefendersOut3[3] = 4;
DefenderCls3[4] = "HHypaspista"; DefendersMax3[4] = 6; DefendersOut3[4] = 3;
DefenderCls3[5] = "BBowman"; DefendersMax3[5] = 8; DefendersOut3[5] = 4;
DefenderCls3[6] = "ESwordsman"; DefendersMax3[6] = 6; DefendersOut3[6] = 4;
DefenderCls3[7] = "TAxeman"; DefendersMax3[7] = 6; DefendersOut3[7] = 3;

DefenderCls4[0] = ""; DefendersMax4[0] = 0; DefendersOut4[0] = 0;
DefenderCls4[1] = ""; DefendersMax4[1] = 0; DefendersOut4[1] = 0;
DefenderCls4[2] = "CMaceman"; DefendersMax4[2] = 6; DefendersOut4[2] = 4;
DefenderCls4[3] = ""; DefendersMax4[3] = 0; DefendersOut4[3] = 0;
DefenderCls4[4] = ""; DefendersMax4[4] = 0; DefendersOut4[4] = 0;
DefenderCls4[5] = "BShieldBearer"; DefendersMax4[5] = 6; DefendersOut4[5] = 4;
DefenderCls4[6] = "EGuardian"; DefendersMax4[6] = 6; DefendersOut4[6] = 4;
DefenderCls4[7] = ""; DefendersMax4[7] = 0; DefendersOut4[7] = 0;

this = This.AsBuilding();
set = .settlement;

radius = .radius + 150;
pos = .pos;

//this manages the cases where the outpost returns independent (with adventure sequences) and where it becomes independent because of other neutral units after the first capture
first_time_independent = EnvReadInt(set, "FirstCaptureReward") != 1;

sDefenderCls1 = .GetDefenderCls(1);
sDefenderCls2 = .GetDefenderCls(2);
sDefenderCls3 = DefenderCls3[.race];
sDefenderCls4 = DefenderCls4[.race];
nFoodIn = .GetOutpostFood();

nDefendersMax1 = .GetDefendersMax(1);
nDefendersMax2 = .GetDefendersMax(2);
nDefendersMax3 = DefendersMax3[.race];
nDefendersMax4 = DefendersMax4[.race];

nDefendersOut1 = .GetDefendersOut(1);
nDefendersOut2 = .GetDefendersOut(2);
nDefendersOut3 = DefendersOut3[.race];
nDefendersOut4 = DefendersOut4[.race];

	range = .range;
	player = .player;

	defenders_max_1 = .GetDefendersMax(1);
	defenders_max_2 = .GetDefendersMax(2);

	defenders_out_1 = .GetDefendersOut(1);
	defenders_out_2 = .GetDefendersOut(2);

	defenders_class_1 = .GetDefenderCls(1);
	defenders_class_2 = .GetDefenderCls(2);

	old_level_1 = .GetStartLevel(1);
	old_level_2 = .GetStartLevel(2);

	end_level_1 = .GetEndLevel(1);
	end_level_2 = .GetEndLevel(2);

end_level_1 = .GetEndLevel(1);
end_level_2 = .GetEndLevel(2);
end_level_3 = EndLevel;
end_level_4 = EndLevel;

old_level_1 = .GetStartLevel(1);
old_level_2 = .GetStartLevel(2);
old_level_3 = StartLevel;
old_level_4 = StartLevel;

if (end_level_1 != old_level_1)
  interval_1 = 3600000 / (end_level_1 - old_level_1);
else
  interval_1 = 0;
  
if (end_level_2 != old_level_2)
  interval_2 = 3600000 / (end_level_2 - old_level_2);
else
  interval_2 = 0;
  
if (end_level_3 != old_level_3)
  interval_3 = 3600000 / (end_level_3 - old_level_3);
else
  interval_3 = 0;
  
if (end_level_4 != old_level_4)
  interval_4 = 3600000 / (end_level_4 - old_level_4);
else
  interval_4 = 0;

beg_time_1 = GetTime();
beg_time_2 = beg_time_1;
beg_time_3 = beg_time_1;
beg_time_4 = beg_time_1;
time = beg_time_1;

if (sDefenderCls1!="")
	for (i=0;i<nDefendersMax1; i+=1)
	{
		Unit u1;
		u1 = Place(sDefenderCls1, .pos, .player);
		.settlement.ForceAddUnit(u1);
		u1.SetFood(20);
		u1.SetFeeding( false );
		u1.SetLevel(old_level_1);
		olAll1.Add(u1);
	}
if (sDefenderCls2!="")
	for (i=0;i<nDefendersMax2; i+=1)
	{
		Unit u2;
		u2 = Place(sDefenderCls2, .pos, .player);
		.settlement.ForceAddUnit(u2);
		u2.SetFood(20);
		u2.SetFeeding( false );
		u2.SetLevel(old_level_2);
		olAll2.Add(u2);
	}
if (sDefenderCls3!="")
	for (i=0;i<nDefendersMax3; i+=1)
	{
		Unit u3;
		u3 = Place(sDefenderCls3, .pos, .player);
		.settlement.ForceAddUnit(u3);
		u3.SetFood(20);
		u3.SetFeeding( false );
		u3.SetLevel(old_level_3);
		olAll3.Add(u3);
	}
if (sDefenderCls4!="")
	for (i=0;i<nDefendersMax4; i+=1)
	{
		Unit u4;
		u4 = Place(sDefenderCls4, .pos, .player);
		.settlement.ForceAddUnit(u4);
		u4.SetFood(20);
		u4.SetFeeding( false );
		u4.SetLevel(old_level_4);
		olAll4.Add(u4);
	}

while (1) {
	// respawn
	olAll1.ClearDead();
	olAll2.ClearDead();
	olAll3.ClearDead();
	olAll4.ClearDead();
	olDefendersOut1.ClearDead();
	olDefendersOut2.ClearDead();
	olDefendersOut3.ClearDead();
	olDefendersOut4.ClearDead();
	
	// clear the units that were commanded from our list
	for (i = olDefendersOut1.count - 1; i >= 0; i -= 1)
		if (olDefendersOut1[i].AsUnit().GetCommanded())
			olDefendersOut1.Remove(olDefendersOut1[i]);
	for (i = olDefendersOut2.count - 1; i >= 0; i -= 1)
		if (olDefendersOut2[i].AsUnit().GetCommanded())
			olDefendersOut2.Remove(olDefendersOut2[i]);
	for (i = olDefendersOut3.count - 1; i >= 0; i -= 1)
		if (olDefendersOut3[i].AsUnit().GetCommanded())
			olDefendersOut3.Remove(olDefendersOut3[i]);
	for (i = olDefendersOut4.count - 1; i >= 0; i -= 1)
		if (olDefendersOut4[i].AsUnit().GetCommanded())
			olDefendersOut4.Remove(olDefendersOut4[i]);
			
	//increase level
    time = GetTime();
	olOurDefenders = .settlement.Units();
    if (interval_1>0 && (time - beg_time_1) >= interval_1 && (old_level_1+1)<=end_level_1) // set new level
    {
		Unit u;
		beg_time_1 = time;
		old_level_1+=1;
		for (i = olDefendersOut1.count() - 1; i >= 0; i -= 1) 
		{
			if (!olDefendersOut1[i].IsValid)
				continue;
			u = olDefendersOut1[i];
			if (u.inherentlevel<old_level_1)
				u.SetLevel(old_level_1);
		}
	if (defenders_class_2 != "")
		for (i = 0; i < defenders_max_2; i += 1) {
			u = Place(defenders_class_2, pos, player);
			set.ForceAddUnit(u);
			u.SetFeeding(false);
			u.SetLevel(old_level_2);
			u.SetNoAIFlag(true);
			all_defenders_2.Add(u);
		}

	while (player == .player) {
		//send away enemy units inside
		pt1 = Point(radius, 0);
		pt1.Rot(rand(360));
		set.Units.ObjEnemy(.player).SetCommand("advance", pt1 + pos);

		all_defenders_1.ClearDead();
		all_defenders_2.ClearDead();
		defenders_outside_1.ClearDead();
		defenders_outside_2.ClearDead();

		//increase level
		time = GetTime();
		if (interval_1 > 0)
			if (time - start_time_1 >= interval_1)
				if (old_level_1 + 1 <= end_level_1) {
					start_time_1 = time;
					old_level_1 += 1;
					for (i = all_defenders_1.count - 1; i >= 0; i -= 1) {
						u = all_defenders_1[i].AsUnit();
						if (u.IsValid)
							if (u.inherentlevel < old_level_1)
								u.SetLevel(old_level_1);
					}
				}
		if (interval_2 > 0)
			if (time - start_time_2 >= interval_2)
				if (old_level_2 + 1 <= end_level_2) {
					start_time_2 = time;
					old_level_2 += 1;
					for (i = all_defenders_2.count - 1; i >= 0; i -= 1) {
						u = all_defenders_2[i].AsUnit();
						if (u.IsValid)
							if (u.inherentlevel < old_level_2)
								u.SetLevel(old_level_2);
					}
				}

		enemies = Union(
			Intersect(
				VisibleObjsInSight(this, "Unit"),
				Subtract(
					Intersect(
						ObjsInRange(this, "Unit", range),
						Union(EnemyObjs(player, "Military"), EnemyObjs(player, "BaseMage"))
					),
					EnemyObjs(player, "Sentry")
				)
			),
			Intersect(ObjsInRange(this, "Catapult", range), EnemyObjs(player, "Catapult"))
		).GetObjList();
		if (enemies.count <= 0) {
			//no threat around, command all units that are out to come back in
			defenders_outside_1.SetCommand("enter_tent", this);
			defenders_outside_1.Clear();
			defenders_outside_2.SetCommand("enter_tent", this);
			defenders_outside_2.Clear();
		}
		else {
			//do not allow defenders to wander too far
			for (i = 0; i < defenders_outside_1.count; i += 1) {
				u = defenders_outside_1[i].AsUnit();
				if (.DistTo(u) > range) {
					pt1 = u.pos - pos;
					pt1.SetLen(range / 2);
					pt2 = pt1 + pos;
					pt2.IntoRect(rc);
					u.SetCommand("move", pt2);
					for (j = 0; j < 4; j += 1) {
						pt1.Rot(90);
						pt2 = pt1 + pos;
						pt2.IntoRect(rc);
						u.AddCommand(false, "guardpatrol", pt2);
					}
				}
			}
			for (i = 0; i < defenders_outside_2.count; i += 1) {
				u = defenders_outside_2[i].AsUnit();
				if (.DistTo(u) > range) {
					pt1 = u.pos - pos;
					pt1.SetLen(range / 2);
					pt2 = pt1 + pos;
					pt2.IntoRect(rc);
					u.SetCommand("move", pt2);
					for (j = 0; j < 4; j += 1) {
						pt1.Rot(90);
						pt2 = pt1 + pos;
						pt2.IntoRect(rc);
						u.AddCommand(false, "guardpatrol", pt2);
					}
				}
			}

			//get out more units if needed
			all_defenders_1.ClearDead();
			if (all_defenders_1.count > 0) {
				defenders_outside_1.ClearDead();
				if (defenders_outside_1.count < defenders_out_1)
					for (i = 0; i < all_defenders_1.count && defenders_outside_1.count < defenders_out_1; i += 1) {
						u = all_defenders_1[i].AsUnit();
						if (u.InHolder) {
							defenders_outside_1.Add(u);
							pt1.Set(0, range / 2);
							pt1.Rot(rand(360));
							pt2 = pt1 + pos;
							pt2.IntoRect(rc);
							u.SetCommand("guardadvance", pt2);
							for (j = 0; j < 4; j += 1) {
								pt1.Rot(90);
								pt2 = pt1 + pos;
								pt2.IntoRect(rc);
								u.AddCommand(false, "guardpatrol", pt2);
							}
						}
					}
			}
			all_defenders_2.ClearDead();
			if (all_defenders_2.count > 0) {
				defenders_outside_2.ClearDead();
				if (defenders_outside_2.count < defenders_out_2)
					for (i = 0; i < all_defenders_2.count && defenders_outside_2.count < defenders_out_2; i += 1) {
						u = all_defenders_2[i].AsUnit();
						if (u.InHolder) {
							defenders_outside_2.Add(u);
							pt1.Set(0, range / 2);
							pt1.Rot(rand(360));
							pt2 = pt1 + pos;
							pt2.IntoRect(rc);
							u.SetCommand("guardadvance", pt2);
							for (j = 0; j < 4; j += 1) {
								pt1.Rot(90);
								pt2 = pt1 + pos;
								pt2.IntoRect(rc);
								u.AddCommand(false, "guardpatrol", pt2);
							}
						}
					}
			}

			//handle the capturing
			all_defenders_1.ClearDead();
			if (all_defenders_1.count <= 0) {
				all_defenders_2.ClearDead();
				if (all_defenders_2.count <= 0) {
					enemies.ClearDead();
					i = enemies.count;
					if (i > 0)
						.SetPlayer(enemies[rand(i)].player);
				}
			}
		}

		Sleep(1000);
	}
	
	if (interval_3>0 &&(time - beg_time_3) >= interval_3 && (old_level_3+1)<=end_level_3) // set new level
    {
		Unit u;
		beg_time_3 = time;
		old_level_3+=1;
		for (i = olDefendersOut3.count() - 1; i >= 0; i -= 1) 
		{
			if (!olDefendersOut3[i].IsValid)
				continue;
			u = olDefendersOut3[i];
			if (u.inherentlevel<old_level_3)
				u.SetLevel(old_level_3);
		}
		for (i = olOurDefenders.count() - 1; i >= 0; i -= 1) 
		{
			if (!olOurDefenders[i].IsValid)
				continue;
			u = olOurDefenders[i];
			if (u.IsHeirOf(sDefenderCls3))
				if (u.inherentlevel<old_level_3)
					u.SetLevel(old_level_3);
		}
	}
	
	if (interval_4>0 &&(time - beg_time_4) >= interval_4 && (old_level_4+1)<=end_level_4) // set new level
    {
		Unit u;
		beg_time_4 = time;
		old_level_4+=1;
		for (i = olDefendersOut4.count() - 1; i >= 0; i -= 1) 
		{
			if (!olDefendersOut4[i].IsValid)
				continue;
			u = olDefendersOut4[i];
			if (u.inherentlevel<old_level_4)
				u.SetLevel(old_level_4);
		}
		for (i = olOurDefenders.count() - 1; i >= 0; i -= 1) 
		{
			if (!olOurDefenders[i].IsValid)
				continue;
			u = olOurDefenders[i];
			if (u.IsHeirOf(sDefenderCls4))
				if (u.inherentlevel<old_level_4)
					u.SetLevel(old_level_4);
		}
	}

	if (qEnemies.IsEmpty()) { // no threat around
		// command all that are out to come back in		
		for (i = 0; i < olDefendersOut1.count; i += 1)
			olDefendersOut1[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olDefendersOut1.Clear();

		for (i = 0; i < olDefendersOut2.count; i += 1)
			olDefendersOut2[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olDefendersOut2.Clear();
		
		for (i = 0; i < olDefendersOut3.count; i += 1)
			olDefendersOut3[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olDefendersOut3.Clear();
		
		for (i = 0; i < olDefendersOut4.count; i += 1)
			olDefendersOut4[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olDefendersOut4.Clear();
		
	} else {
		// do not allow our teutons to wander too far
		for (i = 0; i < olDefendersOut1.count; i += 1) 
		{
			Unit u;
			u = olDefendersOut1[i].AsUnit();
			if (.DistTo(u) > .range)  // move to closer random position
			{	
				point pos;
				pos = u.pos - .pos;
				pos.SetLen(.range / 2);
				p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
			}
			else if (.class == "HOutpost") {
				for (i = 0; i < 20; i += 1) {
					u = Place("HVillager", pos, j);
					set.ForceAddUnit(u);
				}
			}
			EnvWriteInt(set, "FirstCaptureReward", 1);
		}
		for (i = 0; i < olDefendersOut3.count; i += 1) 
		{
			Unit u;
			u = olDefendersOut3[i].AsUnit();
			if (.DistTo(u) > .range)  // move to closer random position
			{	
				point pos;
				pos = u.pos - .pos;
				pos.SetLen(.range / 2);
				p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
			}
		}
		for (i = 0; i < olDefendersOut4.count; i += 1) 
		{
			Unit u;
			u = olDefendersOut4[i].AsUnit();
			if (.DistTo(u) > .range)  // move to closer random position
			{	
				point pos;
				pos = u.pos - .pos;
				pos.SetLen(.range / 2);
				p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
			}
		}

{
	Settlement supplied;
	ObjList macemen, hoplites, units_in;
	Wagon wagon;
	Unit u;
	Building suppliedHall;
	point pt;
	int refresh, food_sales, food_income, gold_income, required_gold, min_resource;
	bool is_gold_outpost = false, is_selling_food, is_selling_gold;

	refresh = GetConst("OutpostRefresh");
	food_sales = GetConst("GOutpostFoodSales");
	food_income = GetConst("GOutpostGoldReturn");
	gold_income = GetConst("ROutpostGoldReturn");
	required_gold = GetConst("ROutpostRequiredGold");
	min_resource = GetConst("MinResQtyToTransport");

	if (.class == "ROutpost")
		is_gold_outpost = true;
	else if (.class == "EOutpost")
		is_gold_outpost = true;

	while (1) {
		//send away enemy units inside
		pt = Point(radius, 0);
		pt.Rot(rand(360));
		set.Units.ObjEnemy(.player).SetCommand("advance", pt + pos);

		if (set.IsIndependent) {//this is probably impossible to happen, in that case just restart the script and wait for the player check loop to end
			if (set.supplied.IsValid)
				set.StopSupply();
			return;
		}
		else {
			is_selling_food = EnvReadString(set, "GOutpostSellFood") == "yes";
			is_selling_gold = EnvReadString(set, "GOutpostSellGold") == "yes";
	
			if (!.IsBroken) {
				if (is_selling_food)
					if (set.food >= food_sales) {
						int fi;
						fi = food_income;
						if (.class == "GOutpost")
							if (GetPlayerRace(.player) == Gaul)
								fi = fi * 5 / 4;
						set.SetFood(set.food - food_sales);
						set.SetGold(set.gold + fi);
						set.GoldConverted(fi);
					}
				if (is_selling_gold)
					if (set.gold >= food_income) {
						int fs;
						fs = food_sales;
						if (.class == "TOutpost")
							if (GetPlayerRace(.player) == Germany)
								fs = fs * 5 / 4;
						set.SetGold(set.gold - food_income);
						set.SetFood(set.food + fs);
					}
				if (is_gold_outpost)
					if (set.gold >= required_gold) {
						int gi;
						gi = gold_income;
						if (EnvReadString(set, "Oro Rapido") == "researched")
							gi = gi * 2;
						set.SetGold(set.gold + gi);
						set.GoldConverted(gi);
					}
			}

			if (set.supplied == set)
				set.StopSupply();

			supplied = set.supplied;

			if (supplied.IsValid)
				if (!set.IsEnemy(supplied.player)) {
					suppliedHall = supplied.GetCentralBuilding();
	
					if (!is_selling_gold)
						if (set.gold >= min_resource) {
							i = 1000;
							if (is_gold_outpost)
								if (set.gold >= required_gold)
									if (set.gold - required_gold < i)
										i = set.gold - required_gold;//0-999
							if (i >= min_resource) {
								wagon = set.CreateMuleGold(i);
								wagon.SetCommand("unload", suppliedHall);
								wagon.AddCommand(false, "unload", this);//come back if the destination becomes invalid during the travel
							}
						}
					if (!is_selling_food)
						if (set.food >= min_resource) {
							wagon = set.CreateMuleFood(MIN(1000, set.food));
							wagon.SetCommand("unload", suppliedHall);
							wagon.AddCommand(false, "unload", this);//come back if the destination becomes invalid during the travel
						}
	
					macemen.Clear();
					hoplites.Clear();
					units_in = set.Units;
					for (i = 0; i < units_in.count; i += 1) {
						u = units_in[i].AsUnit();
						if (u.IsValid)
							if (u.IsAlive)
								if (!u.GetCommanded())
									if (u.IsHeirOf("CMaceman"))
										macemen.Add(u);
									else if (u.IsHeirOf("HHoplite"))
										hoplites.Add(u);
					}
					bNoMore2 = true;
	           }
		}
		
		bNoMore3 = false;
        olDefendersOut3.ClearDead();
		while (olDefendersOut3.count < nDefendersOut3 && .settlement.UnitsCount() > 0 && !bNoMore3) 
		{
			point pos;
			Unit u;
			ObjList olSettUnits;
			
			olSettUnits = .settlement.Units();
			for (i=0; i<olSettUnits.count; i+=1)
	           {
				  if (olSettUnits[i].IsHeirOf(sDefenderCls3)&& olDefendersOut3.count < nDefendersOut3)		
					{
						u = olSettUnits[i];
						
						olDefendersOut3.Add(u);
						pos.Set(0, .range / 2);
						pos.Rot(rand(360));	p = pos + .pos; p.IntoRect(rc);	u.SetCommand("guardadvance", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						bNoMore3 = false;
						Sleep(200);						
						break;
					}
					bNoMore3 = true;
	           }
		}
		
		bNoMore4 = false;
        olDefendersOut4.ClearDead();
		while (olDefendersOut4.count < nDefendersOut4 && .settlement.UnitsCount() > 0 && !bNoMore4)
		{
			point pos;
			Unit u;
			ObjList olSettUnits;
			
			olSettUnits = .settlement.Units();
			for (i=0; i<olSettUnits.count; i+=1)
	           {
				  if (olSettUnits[i].IsHeirOf(sDefenderCls4)&& olDefendersOut4.count < nDefendersOut4)		
					{
						u = olSettUnits[i];
						
						olDefendersOut4.Add(u);
						pos.Set(0, .range / 2);
						pos.Rot(rand(360));	p = pos + .pos; p.IntoRect(rc);	u.SetCommand("guardadvance", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						bNoMore4 = false;
						Sleep(200);						
						break;
					}
					bNoMore4 = true;
	           }
		}
		
		// handle the capturing
		qRange = ObjsInRange(this, "Unit", .range);
		qEnemies = Intersect(qRange, Union(EnemyObjs(.player, "Military"),EnemyObjs(.player, "BaseMage")));
		qEnemies = Subtract(qEnemies,EnemyObjs(.player, "Sentry"));
		qFriends = Intersect(qRange, ClassPlayerObjs("Military", .player));
		
		qRange = ObjsInRange(this, "Building", .range);
		qRange = Intersect(qRange,EnemyObjs(.player, "Catapult"));
		qEnemies = Union(qEnemies, qRange);

		olDefendersOut1.ClearDead();		
		olDefendersOut2.ClearDead();		
		olDefendersOut3.ClearDead();		
		olDefendersOut4.ClearDead();
		olAll1.ClearDead();
		olAll2.ClearDead();
		olAll3.ClearDead();
		olAll4.ClearDead();
		if (!qEnemies.IsEmpty() && olAll1.count==0 && olAll2.count==0 && olAll3.count==0 && olAll4.count==0 && olDefendersOut1.count == 0 && olDefendersOut2.count == 0 && olDefendersOut3.count == 0  && olDefendersOut4.count == 0 && .settlement.UnitsCount()==0) 
		{
			qEnemies.GetObjList().ClearDead();
			if (qEnemies.GetObjList().count>0)
			  {
				int new_player;
				new_player = qEnemies.GetObjList()[rand(qEnemies.GetObjList().count)].player;
				if (new_player>8)
				  {
					Sleep(10);
					continue;
				  }
				.SetPlayer(new_player);
				.settlement.SetFood(nFoodIn);
				if (.race==Carthage) // spwan 20 villagers
				{
					Unit u1;
					int i;
					for(i=0; i<20; i+=1)
					{
						u1 = Place("CVillager", .pos, new_player);
						u1.SetFood(u1.maxfood);
						.settlement.ForceAddUnit(u1);
					}
				}
		}

		Sleep(refresh);
	}
}