@bottom

// Greece (Greek Mod 4.2)
if (.AsUnit().free_item_slots>0){
	if (EnvReadString(.player, "Charm of Athena") == "researched") {
		if (!.AsHero().IsValid && !.HasItem("Charm of Athena"))
			.AddItem("Charm of Athena");
	}

	if (EnvReadString(.player, "Charm of Aegle") == "researched") {
		if (!.AsHero().IsValid && !.HasItem("Charm of Aegle"))
			.AddItem("Charm of Aegle");
	}

	if (EnvReadString(.player, "Promotion") == "researched") {
		if (!.AsHero().IsValid && !.HasItem("Promotion"))
			if (.AsUnit().class == "HPeltast" || .AsUnit().class == "HHoplite")
				.AddItem("Promotion");
	}
}

// Statue of Zeus
if (EnvReadString(.player, "Statue of Zeus") == "researched")
	if (.AsUnit().health>=1 && .AsUnit().health<=.AsUnit().maxhealth/10)
		if (rand(2) < 1) {
			CreateFeedback("Heal", .AsUnit());
			.AsUnit.SetHealth(.AsUnit.maxhealth);
		}
