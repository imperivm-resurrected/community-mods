@before else if (name == "Slavery")
		else if (name == "Celebrate the festival of the Antesterias") {// Antesterias implementation (CGWAR)
			.settlement.SetPopulation(.settlement.population + 20);
		}
		else if (name == "Erect statue to Pluto") {// Erect statue to Pluto implementation (CGWAR)
			.settlement.SetFoodProduction(GetConst("StrongholdFoodProduction") - 4);
			.settlement.SetGoldProduction(GetConst("ProductionGoldBase") + 5);
		}
