@before while(u.IsAlive() && .IsValidTarget(u))
	// --- Mutation of the Ares guard (CGWAR) ---
	if (.AI)
	if (u.IsAlive()){
		if (this.class == "KAresGuard_C")
		if (!EnemyInRange(this.pos(),250,this)){
			this.StartAnim(21, .pos);
			Sleep(this.TimeToAnimFinish);
			this.AsUnit().Mutate("KAresGuard_A");
		}
	}
