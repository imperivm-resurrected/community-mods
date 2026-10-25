@before if( .SameHolderAs( hero ))
	// the bonuses of the CGWAR's relics start when the unit joins the hero (the original attach below runs only if this one did not succeed)
	if( .SameHolderAs( hero ))
		if( .AttachTo( hero ))
		{
			if (hero.HasItem("Ark_of_the_Damned")){
				.AddBonus(5,5,0,100,0);
				.RemoveBonus(0,0,0,0,100);
			}
			else
			{
				if (hero.HasItem("Relic_of_a_ancient_battle")){
					.AddBonus(5,0,0,25,0);
					.RemoveBonus(0,0,0,0,25);
				}
				if (hero.HasItem("Reliquary_of_the_fallen")){
					.AddBonus(0,5,0,25,0);
					.RemoveBonus(0,0,0,0,25);
				}
			}
			break; // success
		}

@before if( !.InHolder && !hero.InHolder
	if( !.InHolder && !hero.InHolder && .posRH.Dist(hero.posRH) < 1500 )
		if( .AttachTo( hero ))
		{
			if (hero.HasItem("Ark_of_the_Damned")){
				.AddBonus(5,5,0,100,0);
				.RemoveBonus(0,0,0,0,100);
			}
			else
			{
				if (hero.HasItem("Relic_of_a_ancient_battle")){
					.AddBonus(5,0,0,25,0);
					.RemoveBonus(0,0,0,0,25);
				}
				if (hero.HasItem("Reliquary_of_the_fallen")){
					.AddBonus(0,5,0,25,0);
					.RemoveBonus(0,0,0,0,25);
				}
			}
			break; // success
		}

