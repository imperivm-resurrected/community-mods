@after u.DetachFrom(h);
			// the bonuses of the CGWAR's relics end when the unit leaves the hero
			if (h.HasItem("Ark_of_the_Damned")){
				u.RemoveBonus(5,5,0,100,0);
			}
			else
			{
				if (h.HasItem("Relic_of_a_ancient_battle"))
					u.RemoveBonus(5,0,0,25,0);

				if (h.HasItem("Reliquary_of_the_fallen"))
					u.RemoveBonus(0,5,0,25,0);
			}
