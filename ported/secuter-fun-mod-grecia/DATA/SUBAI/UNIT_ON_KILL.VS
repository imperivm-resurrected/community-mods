//void, Obj this, Obj Victim

Unit u;
Hero h;
Item item;
ObjList ol;
bool condition = false;
int exp, skillpoints, scoutPts, egoismPts, epicArmorPts, i, j, k, l, food;

if (!.IsValid())
    return;

// Kills statistic
if (.AsUnit.IsValid)
    if (!.AsUnit.IsDead())
    {
        .AsUnit.IncKills(1);
    }

// Caccia (tutte le civilta'): quando un'unita' uccide un ANIMALE qualsiasi,
// viene ripristinato +1 di cibo alle unita' militari dell'esercito
// dell'uccisore, fino a un massimo di 50 unita'. Stessa logica di
// GREEK_SUPPLIES.VS: solo unita' che usano il cibo (maxfood>0) e non gia' piene.
if (Victim.AsUnit().IsValid())
    if (Victim.AsUnit().IsHeirOf("BaseAnimal"))
    {
        ObjList army;
        Unit au;
        int fed;
        army = ClassPlayerObjs("Military", .player).GetObjList();
        army.ClearDead();
        fed = 0;
        for (i = 0; i < army.count; i += 1)
        {
            if (fed >= 50)
                break;
            au = army[i].AsUnit();
            if (au.IsValid())
                if (au.IsAlive())
                    if (au.maxfood > 0)
                    {
                        if (au.food != au.maxfood)
                            au.SetFood(au.food + 1);
                        fed += 1;
                    }
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

// Gloria del Condottiero (Cartagine Mauritana): ora si SBLOCCA nel Colosseo con
// l'upgrade "Warlord's Glory". Quando un'unita' agganciata a un eroe mauritano
// uccide un nemico, l'eroe guadagna esperienza (livello vittima/LevelExpDivider+1).
if (EnvReadString(.player, "Warlord's Glory") == "researched")
if (.AsUnit.IsValid)
    if (!.AsUnit.IsDead())
        if (.AsUnit().hero.IsValid())
            if (.AsUnit().hero.IsHeirOf("MauritanianHero"))
            {
                h = .AsUnit().hero;
                // Nerf (DA SISTEMARE "nerfa i livelli che genera warlord s glory"):
                // esperienza dimezzata e NULLA sulle vittime deboli, cosi' l'eroe
                // sale di livello molto piu' lentamente.
                exp = 0;
                if (Victim.AsUnit().IsValid())
                    exp = (Victim.AsUnit().inherentlevel / GetConst("LevelExpDivider") + 1) / 2;
                if (exp > 0)
                {
                    h.SetExperience(h.experience + exp);
                    CreateFeedback("Experience", h);
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

if (EnvReadString(.player, "Blood of the Arena") == "researched") {
    if (.AsUnit().class == "RGladiator" && !.HasItem("Blood of the Arena"))
        .AddItem("Blood of the Arena");
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

// Greece
if (.AsUnit().inherentlevel >= 10 && .AsUnit().free_item_slots>0){
	if (EnvReadString(.player, "Charm of Athena") == "researched") {
		if (!.AsHero().IsValid && !.HasItem("Charm of Athena"))
			.AddItem("Charm of Athena");
	}

	if (EnvReadString(.player, "Charm of Aegle") == "researched") {
		if (!.AsHero().IsValid && !.HasItem("Charm of Aegle"))
  		.AddItem("Charm of Aegle");
	}
}

// Gambler's Day
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
	
