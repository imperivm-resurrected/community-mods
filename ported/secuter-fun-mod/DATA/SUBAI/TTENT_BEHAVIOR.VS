// void, Obj This

Building this;
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

// truppe per le diverse tipologie di accampamento
str TroopA, TroopB;
StrArray TroopClsA, TroopClsB;
IntArray InitialArmy, ActiveArmy, FoodCost;
int BaseSpawnRate = 320000;

// 0:Gaul, 1:RepublicanRoma, 2:Carthage, 3:Iberia, 4:ImperialRome, 5:Britain, 6:Egypt, 7:Germany
TroopClsA[0] = "GTridentWarrior"; TroopClsB[0] = "BVikingLord"; InitialArmy[0] = 7; ActiveArmy[0] = 4; FoodCost[0] = 1200;
TroopClsA[1] = "RGladiator"; TroopClsB[1] = "RLiberatus"; InitialArmy[1] = 13; ActiveArmy[1] = 8; FoodCost[1] = 600;
TroopClsA[2] = "CNumidianRider"; TroopClsB[2] = "CNumidianRider"; InitialArmy[2] = 18; ActiveArmy[2] = 11; FoodCost[2] = 400;
TroopClsA[3] = "ICavalry"; TroopClsB[3] = "IEliteGuard"; InitialArmy[3] = 18; ActiveArmy[3] = 11; FoodCost[3] = 450;
TroopClsA[4] = "ELionM"; TroopClsB[4] = "ELionF"; InitialArmy[4] = 19; ActiveArmy[4] = 11; FoodCost[4] = 400;
TroopClsA[5] = "BShieldBearer"; TroopClsB[5] = "BHighlander"; InitialArmy[5] = 13; ActiveArmy[5] = 8; FoodCost[5] = 600;
TroopClsA[6] = "EHorusWarrior"; TroopClsB[6] = "EAnubisWarrior"; InitialArmy[6] = 15; ActiveArmy[6] = 9; FoodCost[6] = 500;
TroopClsA[7] = "TTeutonRider"; TroopClsB[7] = "TTeutonArcher"; InitialArmy[7] = 20; ActiveArmy[7] = 12; FoodCost[7] = 400;
//--------------------------------------------------------

this = This.AsBuilding();

nArmy = InitialArmy[.race];
nActiveArmy = ActiveArmy[.race];
nUnitSpawnRate = BaseSpawnRate / nArmy;

TroopA = TroopClsA[.race];
TroopB = TroopClsB[.race];

rc = GetMapRect();

.settlement.SetLoyalty(100); //will not be able to capture it the normal way

Sleep(rand(1000) + 500);

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
	foodcost = FoodCost[.race];
	if (foodcost < 100) foodcost = 400;
	
	olAll1.ClearDead();
	olAll2.ClearDead();
    
    if (bIsIndependent || .race != Germany){
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
				nCapturedArmy = ActiveArmy[.race] / 2;
				for (i = 0; i<nCapturedArmy; i+=1)
				{
					Unit u;
					u = Place(TroopA, .pos, newplayer);
					.settlement.ForceAddUnit(u);
					u.SetExperience(old_exp_gain);
					u.SetFood(u.maxfood);
					u.SetFeeding(false);
					olAll1.Add(u);
					
					u = Place(TroopB, .pos, newplayer);
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
