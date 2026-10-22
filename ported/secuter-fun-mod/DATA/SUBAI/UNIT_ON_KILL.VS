//void, Obj this, Obj Victim

if (!.IsValid())
	return;

// Kills statistic
if (.AsUnit.IsValid)
if (!.AsUnit.IsDead())
	{
	.AsUnit.IncKills(1);
	}

//Statistics:
if(.IsValid() == true)
{
	bool uccisoreOk;
	bool vittimaOk;
	
	//Si considerano solo uccisori/vittime: soldati (no sentinelle (per vittime), navi e arieti), eroi, sacerdoti/drudi/maghe/sciamani:
	uccisoreOk = (.AsUnit().IsHeirOf("Military") == true && .AsUnit().IsHeirOf("ShipBattle") == false && .AsUnit().IsHeirOf("RamUnit") == false) || (.AsUnit().IsHeirOf("BaseMage") == true) || (.AsUnit().IsHeirOf("Hero") == true);
	vittimaOk = (Victim.IsHeirOf("Military") == true && Victim.IsHeirOf("Sentry") == false && Victim.IsHeirOf("ShipBattle") == false && Victim.IsHeirOf("RamUnit") == false) || (Victim.IsHeirOf("BaseMage") == true) || (Victim.IsHeirOf("Hero") == true);
	
	if(uccisoreOk == true && vittimaOk == true)
	{
		int PRIMO_GIOCATORE_NEUTRALE = 13;
		
		EnvWriteInt(Victim.player(), "EEE_TotUnitsDeath", EnvReadInt(Victim.player(), "EEE_TotUnitsDeath") + 1); //Add 1 to number of death units.
		
		//Nelle uccisioni non si conteggiano le unità che presidiano i forti neutrali.
		if(Victim.player() < PRIMO_GIOCATORE_NEUTRALE)
		{
			EnvWriteInt(.player(), "EEE_TotUnitsKilled", EnvReadInt(.player(), "EEE_TotUnitsKilled") + 1); //Add 1 to number of killed units.
		}	//Fine if.
	}	//Fine if.
}	//Fine if.	
	
// Egypt
if (!Victim.IsSentry)
{
.AsUnit.RemoveItemsOfType("Damage charm");
.AsUnit.RemoveItemsOfType("Armor charm");
.AsUnit.RemoveItemsOfType("Health charm");
.AsUnit.RemoveItemsOfType("Knowledge charm");
if (EnvReadString(.player, "Path of the dead I") == "researched")
  {
	if (.AsUnit().inherentlevel < 4 )
	  .AsUnit().SetLevel(4);
  }

if (EnvReadString(.player, "Path of the dead II") == "researched")
  {
	if (.AsUnit().inherentlevel < 8 )
	  .AsUnit().SetLevel(8);
  }

if (EnvReadString(.player, "Path of the dead III") == "researched")
  {
	if (.AsUnit().inherentlevel < 12 )
	  .AsUnit().SetLevel(12);
  }
  }

//
if (!Victim.IsSentry)
{
if (EnvReadString(.player, "Spoils of war")=="researched" && !.IsHeirOf("Sentry") && !Victim.AsUnit.IsHeirOf("BaseAnimal")) {
	if(!.HasItem("Spoils of War"))
		.AddItem("Spoils of War");
	else
	if (.FindItem("Spoils of War").use_count == 0)
		.FindItem("Spoils of War").SetUseCount(2);
	else
		.FindItem("Spoils of War").SetUseCount(.FindItem("Spoils of War").use_count + 1);
}
}

// rArena items
if (!Victim.IsSentry)
{
if (EnvReadString(.player, "Veteran Offence") == "researched") {
	if (!.AsHero().IsValid && !.HasItem("Veteran Offence"))
	  .AddItem("Veteran Offence");
}

if (EnvReadString(.player, "Veteran Defence") == "researched") {
	if (!.AsHero().IsValid && !.HasItem("Veteran Defence"))
  		.AddItem("Veteran Defence");
}

if (EnvReadString(.player, "Veteran Health") == "researched") {
	if (!.AsHero().IsValid && !.HasItem("Veteran Health"))
      	.AddItem("Veteran Health");
}
}
// Britain
if (!Victim.IsSentry)
{
if (.AsUnit().inherentlevel > 3)
{
	if (EnvReadString(.player, "Noble Offence") == "researched") {
		if (!.AsHero().IsValid && !.HasItem("Noble Offence"))
			.AddItem("Noble Offence");
	}

	if (EnvReadString(.player, "Noble Defence") == "researched") {
		if (!.AsHero().IsValid && !.HasItem("Noble Defence"))
  		.AddItem("Noble Defence");
	}
}
}

if (EnvReadString(.player, "Gambler's Day") == "researched")
	if (Victim.AsUnit)
	if (!Victim.IsSentry)
	if (.AsUnit().inherentlevel < Victim.AsUnit().inherentlevel)
	{
		int chance;
		chance = EnvReadInt(.player, "GamblersDayChance");
		if (rand(100) < chance)
		{
			.AsUnit.SetLevel(Victim.AsUnit.inherentlevel);
		}
	}
	
// Gaul

if (EnvReadString(.player, "Razzia") == "researched")
{
	if (Victim.AsUnit)
	if (Victim.AsUnit.feeds)
		.AsUnit.SetFood(.AsUnit.food + Victim.AsUnit.food);
	else
		.AsUnit.SetFood(.AsUnit.food + Victim.AsUnit.food / 2);
}

// Greece

if (EnvReadString(.player, "Statue of Zeus") == "researched")
	if (Victim.AsUnit)
	if (!Victim.IsSentry)
		if (.AsUnit().health>=1 && .AsUnit().health<=.AsUnit().maxhealth/10){
			int chance;
			chance = 50;
			if (rand(100) < chance){
				CreateFeedback("Heal", .AsUnit());
				.AsUnit.SetHealth(.AsUnit.maxhealth);
			}
		}
	