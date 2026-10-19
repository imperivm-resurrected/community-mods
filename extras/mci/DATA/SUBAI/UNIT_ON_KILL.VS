//void, Obj this, Obj Victim
Item item;
if (!.IsValid())
	return;

// Kills statistic
if (.AsUnit.IsValid)
	if (!.AsUnit.IsDead()){
		int ap;
		str names;

		.AsUnit.IncKills(1);
		if(.name == ""){
			.SetName("Kills"+.player+.class+rand(9999));
			names = "/Veteran/"+.name;
	            	EnvWriteInt(names, EnvReadInt(names)+1);
		} else if(.name != ""){
			names = "/Veteran/"+.name;
			EnvWriteInt(names, EnvReadInt(names)+1);
			ap = EnvReadInt(names);
		}

		if (.AsHero.IsValid){
			if(ap >= 5 && .HasItem("Officer") && !.HasItem("General") && !.HasItem("Leader")){
				item = .GetItem(1);
				.ExchangeItem(item, "General");
			}
		} else if(ap >= 10 && ap < 20 && !.HasItem("Master")){
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			.AddItem("Master");
			if (rand(1000) < 50)
				.AddItem("Promotion on Hero");
		} else if(ap >= 20 && ap < 40 && !.HasItem("Chieftain") && .HasItem("Master")){
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			.AsUnit.RemoveItemsOfType("Master");
			.AddItem("Chieftain");
			if (rand(1000) < 80)
				.AddItem("Promotion on Hero");
		} else if(ap >= 40 && ap <= 45 && !.HasItem("Lord") && .HasItem("Chieftain")){
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			CreateFeedback("DefensiveCry", .AsUnit(), -1);
			.AsUnit.RemoveItemsOfType("Chieftain");
			.AddItem("Lord");
			if (rand(1000) < 100)
				.AddItem("Promotion on Hero");
		} else if(ap == 80 && .HasItem("Lord")){
			.AsUnit.AddBonus(0,20,0,0,0);
		} else if(ap == 160 && .HasItem("Lord")){
			.AsUnit.AddBonus(100,0,0,0,0);
		}
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
if (EnvReadString(.player, "Spoils of war") == "researched") {
	.AddItem("Spoils of War");
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

if (.AsUnit.IsValid){
	if (!.AsUnit.IsDead){                                
		if (Victim.AsUnit){
	                if (Victim.AsUnit.IsHeirOf("BaseAnimal")){        
	                        if (!.HasItem("Meat 1") && !.HasItem("Meat 2") && !.HasItem("Meat 3") && !.HasItem("Meat 4"))
                                {           
	                                if (!.AsUnit.IsSentry){
	                                        if (Victim.AsUnit.class == "Deer"){       
	                                                .AddItem("Meat 1"); 
	                                        } else if (Victim.AsUnit.class == "Bear" 
	                                             || Victim.AsUnit.class == "BearUnit"
	                                             || Victim.AsUnit.class == "Boar" 
	                                             || Victim.AsUnit.class == "BoarUnit"){
	                                                .AddItem("Meat 2");
	                                        } else if (Victim.AsUnit.class == "LionM" 
	                                             || Victim.AsUnit.class == "LionMUnit"
	                                             || Victim.AsUnit.class == "LionF" 
	                                             || Victim.AsUnit.class == "LionFUnit"){
	                                                .AddItem("Meat 3");
	                                        } else if (Victim.AsUnit.class == "Wolf" 
	                                             || Victim.AsUnit.class == "WolfUnit"){
	                                                .AddItem("Meat 4");
	                                        }
                                	}
         			}
                        }
                }                          
	}                                                
}
                                                       

