//void, Obj This

Building this;

Sleep(rand(1000) + 500);

// truppe per le diverse tipologie di accampamento
str TroopA, TroopB;
StrArray TroopClsA, TroopClsB;
IntArray InitialArmy, ActiveArmy, FoodCost;
int BaseSpawnRate = 320000;

// 0:Gaul, 1:RepublicanRoma, 2:Carthage, 3:Iberia, 4:Greece, 5:Britain, 6:Egypt, 7:Germany
TroopClsA[0] = "GTridentWarrior"; TroopClsB[0] = "BVikingLord"; InitialArmy[0] = 7; ActiveArmy[0] = 4; FoodCost[0] = 1200;
TroopClsA[1] = "RGladiator"; TroopClsB[1] = "RLiberatus"; InitialArmy[1] = 13; ActiveArmy[1] = 8; FoodCost[1] = 600;
TroopClsA[2] = "CNumidianRider"; TroopClsB[2] = "CNumidianRider"; InitialArmy[2] = 18; ActiveArmy[2] = 11; FoodCost[2] = 400;
TroopClsA[3] = "ICavalry"; TroopClsB[3] = "IEliteGuard"; InitialArmy[3] = 18; ActiveArmy[3] = 11; FoodCost[3] = 450;
TroopClsA[4] = "HMyrmidon_Javelin"; TroopClsB[4] = "HHoplite"; InitialArmy[4] = 22; ActiveArmy[4] = 13; FoodCost[4] = 360;
TroopClsA[5] = "BShieldBearer"; TroopClsB[5] = "BHighlander"; InitialArmy[5] = 13; ActiveArmy[5] = 8; FoodCost[5] = 600;
TroopClsA[6] = "EHorusWarrior"; TroopClsB[6] = "EAnubisWarrior"; InitialArmy[6] = 15; ActiveArmy[6] = 9; FoodCost[6] = 500;
TroopClsA[7] = "TTeutonWolf"; TroopClsB[7] = "TTeutonArcher"; InitialArmy[7] = 20; ActiveArmy[7] = 12; FoodCost[7] = 400;
//--------------------------------------------------------

this = This.AsBuilding();

nArmy = InitialArmy[.race];
nActiveArmy = ActiveArmy[.race];
nUnitSpawnRate = BaseSpawnRate / nArmy;

TroopA = TroopClsA[.race];
TroopB = TroopClsB[.race];

if (.class != "TTent") // blocca il comportamento automatico per CTent e altri
    while (1)
        Sleep(3600000);
else {
    Settlement set;
    ObjList all_teutons, teutons_1, teutons_2, teutons_out, enemies, garrison;
    Unit u;
    Hero h;
    point pos, pt1, pt2;
    rect rc;
    int i, j, sight, player, initial_army, active_army, spawn_rate, last_spawn_time, delay, exp_gain, old_exp_gain;
    int eff_rate;
    bool freeprod;
    bool first_time_independent;
    bool release;

    set = .settlement;

    set.SetLoyalty(100); // impossibile catturare fino a quando la guarnigione non viene sconfitta

    rc = GetMapRect();

    sight = .sight;
    pos = .pos;

    initial_army = GetConst("TTentInitialArmy");
    active_army = GetConst("TTentActiveArmy");
    spawn_rate = GetConst("TTentUnitSpawnRate");

    last_spawn_time = spawn_rate * initial_army / 2; // spawn di metà esercito all’inizio
    delay = 0;
    first_time_independent = set.IsIndependent;

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

        // PRODUZIONE MANUALE CONTINUA
        delay += 1000;
        // Imperivm 2: produzione gratuita a 60s per QUALSIASI proprietario (non solo
        // Germania); + default della produzione (Teutone) se non impostata.
        freeprod = (GetPlayerRace(player) == Germany) || (EnvReadInt(player, "ModeInverno") == 1);
        eff_rate = spawn_rate;
        if (freeprod)
            eff_rate = 60000;
        if (delay >= eff_rate) {
            str class_prod;
            if (EnvReadInt(player, "ModeInverno") == 1)
                if (EnvReadString(set, "ENV_TProd") == "" || EnvReadString(set, "ENV_TProd") == "Nothing")
                    EnvWriteString(set, "ENV_TProd", "TTeutonRider");
            class_prod = EnvReadString(set, "ENV_TProd");

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

                    u = Place(class_prod, pos, player);
                    u.SetFood(u.maxfood);
                    u.SetFeeding(false);
                    set.ForceAddUnit(u);
                    u.SetExperience(old_exp_gain);
                    all_teutons.Add(u);

                    delay = 0; // reset delay per il prossimo ciclo di produzione
                }
                // Se non c'è abbastanza cibo, la produzione si ferma momentaneamente,
                // ma non viene disattivata, quindi quando il cibo è sufficiente, riprenderà.
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
                                t = 3; // richiesta: la tenda teutonica consegna 3 cavalieri + 3 arcieri alla conquista (la tenda numidica resta al const TTentCapturedArmy)
                                for (i = 0; i < t; i += 1) {
                                    u = Place("TTeutonRider", pos, j);
                                    u.SetFood(u.maxfood);
                                    u.SetFeeding(false);
                                    set.ForceAddUnit(u);
                                    u.SetExperience(old_exp_gain);
                                    all_teutons.Add(u);
                                    u = Place("TTeutonArcher", pos, j);
                                    u.SetFood(u.maxfood);
                                    u.SetFeeding(false);
                                    set.ForceAddUnit(u);
                                    u.SetExperience(old_exp_gain);
                                    all_teutons.Add(u);
                                }
                                set.SetFood(set.food + 1200);
                                first_time_independent = false;
                            }
                    }
            }
        }
        Sleep(1000);
    }
}
