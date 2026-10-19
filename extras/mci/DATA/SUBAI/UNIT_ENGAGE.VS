// void, Obj me

	Unit this;
	Obj u;
	str modo;
	bool modado;
	int max;
	point pt;

	this = me.AsUnit();

	modado = (EnvReadInt(.player, "Modo/Lista") != 0);
	if(modado){
		int i;
		bool es=false;
		max = EnvReadInt(.player, "Modo/Lista");
		for(i=0;i<=max;i+=1)
			if(EnvReadObj(.player, "Modo/Unidad" + i) == this){
				es = true;
				break;
			}
		if(es)
			modo = EnvReadString(.player, "Modo/Unidad" + i + "Modo");
		else
			modado = false;
	}

	if(modo == "pasivo"){
		.SetCommand("idle");
		return;
	}
	pt = .pos;

	if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command (HD: AI only)
		.SetParryMode(false);

	//pr("engage: searching for new enemy");
	u = .BestTargetInSquadSight();
	if(u.IsAlive())	
	{
		//pr("engage: target found!");
		while (u.IsAlive() && .IsValidTarget(u)) 
		{
			if(modo == "defensivo")
				if(u.DistTo(pt) > .sight){
					.SetCommand("idle");
					break;
				}
			Sleep(rand(80) + 20); // Disperse the times
			while(!.GotoAttack(u, 1500, true, 15000)) 
			{
				//pr("engage: approaching target!");
				u = .BestTargetInSquadSight();
				if(!u.IsAlive() || !.IsValidTarget(u)) break;
				if(modo == "defensivo")
					if(u.DistTo(pt) > .sight){
						.SetCommand("idle");
						break;
					}
			}
			//pr("engage: attacking target!");
			if(modo == "defensivo")
				if(u.DistTo(pt) > .sight){
					.SetCommand("idle");
					break;
				}
			if (u.IsAlive() && .IsValidTarget(u))
			{
				while (.Attack(u));
			}
			u = .BestTargetInSquadSight();
		}
	} 
