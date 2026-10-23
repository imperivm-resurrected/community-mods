@after u = .BestTargetInSquadSight();

	// --- Mutation of the Ares guard (CGWAR) ---
	if (.AI)
	if (u.attack > 0 || u.IsHeirOf("BaseMage")){
		if (this.class == "KAresGuard_A" || this.class == "KAresGuard_C")
		if (rand(2) < 1 ){
			if (EnemyInRange(this.pos(),150,this) && this.damage_type == 1){
				if (!u.IsSentry()) if (!u.IsWaterUnit()){
					this.StartAnim(22, .pos);
					Sleep(this.TimeToAnimFinish);
					this.AsUnit().Mutate("KAresGuard_C");
				}
			}else
			if (EnemyInRange(this.pos(),500,this) && !EnemyInRange(this.pos(),200,this) && this.damage_type == 0){
				this.StartAnim(21, .pos);
				Sleep(this.TimeToAnimFinish);
				this.AsUnit().Mutate("KAresGuard_A");
			}
		}
	}
