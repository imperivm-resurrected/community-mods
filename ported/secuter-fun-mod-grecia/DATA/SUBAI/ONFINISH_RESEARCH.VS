// void, Obj This, bool bCanceled
// cmdparam is like this ReqSet, <research>, ReqPlr, <research>, SetsPlr, <env>, <value>, SetsSet, <env>, <value>, NamePlr, <research>, NameSet, <research>

Building this;
str dest, name, token, value;
ObjList ol;
int i;

dest = cmdparam;
this = This.AsBuilding();

if (!GetResearchHack())
{
	//don't fuckup the queue if envoked by the research hack
	EnvWriteString(this, "researching", "no");
}

while(dest != "")
{
	token = ParseStr(dest, dest);
	if(token == "NamePlr")
	if(bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.player, name, "");
		if (name == "Tribute") {
			Building th;
			th = EnvReadObj(.player, "TributeBuilding");
			if (th.IsValid) {
				th.GlobalSpellStop();
			}
		}
		else if (name == "Raids") {
			HideAnnouncement("RaidsP" + .player);
		}
		else if (name == "Protection of Apollo")
			HideAnnouncement("ApolloProtectionP" + .player);
		continue;
	} else
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.player, name, "researched");
		
		// Code of Valor implementation
		if (name == "Code of Valor") {
			Unit ie;
			ol = GetPlayerUnits(.player,"IEnchantress");
			for (i=0; i<ol.count; i+=1)
				{
					if (ol[i].IsValid())
						if (ol[i].IsAlive())
							{
								if (ol[i].AsUnit().inherentlevel < 8)
									ol[i].AsUnit().SetLevel(8);
							}
				}
			// Iberia: primo upgrade del Santuario -> un'incantatrice gratis (Imperivm 2: niente)
			if (EnvReadInt(.player, "ModeInverno") != 1) {
				ie = Place("IEnchantress", .pos, .player);
				if (ie.IsValid())
					.settlement.ForceAddUnit(ie);
			}
			continue;
		}
		// Battle tactics implementation
		if (name == "Battle tactics") {
			int c;
			c = GetConst("BattleTacticsExpModifier");
			SetExperienceModifier(.player, c);
			continue;
		}
		// Heroes' Wisdom implementation
		if (name == "Heroes' Wisdom") {
			StartPlayerScript(.player, "data/subai/player_heroes_wisdom.vs");
			continue;
		}
		// Tradizione Mauritana (Cartagine Mauritana): +velocita' a tutte le
		// unita' del giocatore, presenti e future
		if (name == "Mauritanian Tradition") {
			StartPlayerScript(.player, "data/subai/player_mauritanian_tradition.vs");
			continue;
		}
		// Warriors' Wisdom implementation
		if (name == "Warriors' Wisdom") {
			StartPlayerScript(.player, "data/subai/player_warriors_wisdom.vs");
			continue;
		}
		// Testudo implementation
		if (name == "Testudo") {
			StartPlayerScript(.player, "data/subai/player_testudo.vs");
			continue;
		}
		// Phalanx implementation (Grecia: Opliti +20 attacco in formazione a quadrato)
		if (name == "Phalanx") {
			StartPlayerScript(.player, "data/subai/player_phalanx.vs");
			continue;
		}
		// Spiderweb implementation (Grecia: rigenerazione salute raddoppiata)
		if (name == "Spiderweb") {
			StartPlayerScript(.player, "data/subai/player_spiderweb.vs");
			continue;
		}
		// Promotion implementation (Grecia: avanzamento di grado dentro i forti)
		if (name == "Promotion") {
			StartPlayerScript(.player, "data/subai/player_promotion.vs");
			continue;
		}
		// Matrae Gallae (Gallia: foga permanente alle Guerriere Galliche)
		// Ex "Fury of the Morrigan", rinominato.
		if (name == "Matrae Gallae") {
			StartPlayerScript(.player, "data/subai/player_gaul_rage.vs");
			continue;
		}
		// Blessing of Fand (Gallia: aura passiva dei Guerrieri di Fand dal livello 12)
		if (name == "Blessing of Fand") {
			StartPlayerScript(.player, "data/subai/player_fand_aura.vs");
			continue;
		}
		// Mercenary Edict (Cartagine: bonus alle classi schierate in almeno 200 unita')
		if (name == "Mercenary Edict") {
			StartPlayerScript(.player, "data/subai/player_mercenary_edict.vs");
			continue;
		}
		// Roman Discipline (Roma Punica: i soldati consumano meta' viveri)
		if (name == "Roman Discipline") {
			StartPlayerScript(.player, "data/subai/player_roman_discipline.vs");
			continue;
		}
		// Lord's Challenge (Britannia: i nemici che entrano nell'area di un
		// Viking Lord attaccano prima lui, finche' e' vivo)
		if (name == "Lord's Challenge") {
			StartPlayerScript(.player, "data/subai/player_vikinglord_taunt.vs");
			continue;
		}
		// Elephant's Challenge (Cartagine: come sopra, ma sugli Elefanti da Guerra)
		if (name == "Elephant's Challenge") {
			StartPlayerScript(.player, "data/subai/player_elephant_taunt.vs");
			continue;
		}
		// Nobility implementation
		if (name == "Nobility") {
			ol = GetPlayerUnits(.player,"Military");
		    for (i=0; i<ol.count; i+=1)
	 	      {
				if (ol[i].IsValid())
				  if (ol[i].IsAlive())
				    {
						if (ol[i].AsUnit().inherentlevel>=8 && ol[i].AsUnit().inherentlevel<=12)
					  	  ol[i].AsUnit().SetLevel(12);		
					} 
		      }
			continue;
		}
		// Supplies implementation
		if (name == "Supplies") {
			StartPlayerScript(.player, "data/subai/greek_supplies.vs");
			continue;
		}
		// Protection of Apollo implementation
		if (name == "Protection of Apollo") {
			StartPlayerScript(.player, "data/subai/Apollo_Protection.vs");
			continue;
		}
		// Tribute implementation
		if (name == "Tribute") {
			Building bld;
			Settlement s;
			ObjList l;
			int i;
			int gametime;
			int time;
			int gold = 0;
			str times, values;
			
			times = GetConstStr("TributeTimes");
			values = GetConstStr("TributeGold");
			
			gametime = GetTime();
			
			while (times != "") {
				int old_gold;
				old_gold = gold;
				time = Str2Int(ParseStr(times, times)) * 60000;
				gold = Str2Int(ParseStr(values, values));
				if (gametime < time) {
					gold = old_gold;
					break;
				}
			}

			l = ClassPlayerObjs("Outpost", .player).GetObjList();
			for (i = l.count() - 1; i >= 0; i -= 1) 
			{
				bld = l[i].AsBuilding();
				if (bld.IsValid()) 
				{
					if(bld.IsHeirOf("GGuardPost") == true) continue;
					
					s = bld.settlement;
					if (s.IsValid()) 
					{
						s.SetGold(s.gold + gold);
						s.GoldConverted(gold);
					}
				}
			}
			continue;
		}
		// Razzie: identico al tributo, ma raccoglie cibo invece di oro
		if (name == "Raids") {
			Building bld;
			Settlement s;
			ObjList l;
			int i;
			int gametime;
			int time;
			int food = 0;
			str times, values;

			times = GetConstStr("RaidsTimes");
			values = GetConstStr("RaidsFood");

			gametime = GetTime();

			while (times != "") {
				int old_food;
				old_food = food;
				time = Str2Int(ParseStr(times, times)) * 60000;
				food = Str2Int(ParseStr(values, values));
				if (gametime < time) {
					food = old_food;
					break;
				}
			}

			l = ClassPlayerObjs("Outpost", .player).GetObjList();
			for (i = l.count() - 1; i >= 0; i -= 1) {
				bld = l[i].AsBuilding();
				if (bld.IsValid()) {
					s = bld.settlement;
					if (s.IsValid()) {
						s.SetFood(s.food + food);
					}
				}
			}
			continue;
		}
		if (name == "Gambler's Test") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Gambler's Luck") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Statue of Amon-Ra") {
			ObjList units;
			int k;
			units = GetPlayerUnits(.player, "Military");
			for (k = 0; k < units.count(); k += 1)
				units[k].AsUnit().RecalcBonuses();
			continue;
		}
		if (name == "Statue of Osiris") {
			InvalidateRegenConsts();
			continue;
		}
		if (name == "Statue of Isis") {
			InvalidateRegenConsts();
			continue;
		}
		if (name == "Attack focus") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Learning") {
			InvalidateDamageFormulaParams();
			continue;
		}
		if (name == "Ferocity") {
			InvalidateDamageFormulaParams();
			continue;
		}
		// Hand of Sekhmet implementation
		if (name == "Hand of Sekhmet") {
			ol = GetPlayerUnits(.player, "EAnubisWarrior");
			for (i=0; i<ol.count; i+=1)
				if (ol[i].IsValid())
					if (ol[i].IsAlive())
						ol[i].AsUnit().SetSpecial(9, true);

			ol = GetPlayerUnits(.player, "EHorusWarrior");
			for (i=0; i<ol.count; i+=1)
				if (ol[i].IsValid())
					if (ol[i].IsAlive())
						ol[i].AsUnit().SetSpecial(9, true);

			ol = GetPlayerUnits(.player, "EGuardian");
			for (i=0; i<ol.count; i+=1)
				if (ol[i].IsValid())
					if (ol[i].IsAlive())
						ol[i].AsUnit().SetSpecial(9, true);
			continue;
		}
		// Call to elite arms implementation
		if (name == "Call to elite arms") {
			Unit u;
			int elite;
			int level;
			int gametime;
			bool give_veteran_guild;
			elite = 20;
			gametime = GetTime() / 60000;
			if (gametime >= 20 && gametime < 40)
				level = 4;
			else if (gametime >= 40 && gametime < 60)
				level = 8;
			else if (gametime >= 60)
				level = 12;
			else
				level = 1;
			if (EnvReadInt(this.settlement, "items/Veteran Ring") == 1)
				give_veteran_guild = true;
			else
				give_veteran_guild = false;
			while (elite) {
				u = Place("IEliteGuard", this.pos, .player);
				u.SetLevel(level);
				u.SetFood(0);
				if (give_veteran_guild)
					u.AddItem("Veteran Ring");
				this.settlement.ForceAddUnit(u);
				elite -= 1;
			}
			continue;
		}
		continue;
	}
	if(token == "NameSet")
	if(bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.settlement, name, "");
		continue;
	}  else
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.settlement, name, "researched");
		if(name == "Gambling")
		{	// Gambling implementation
			int CHANCE;
			CHANCE = GetConst("GamblingChance");
			if(rand(100) < CHANCE)
			{
				.settlement().SetFood(.settlement().food() + 2500); //Get 2500 of food.
				//.settlement.GoldConverted(5000);
			}
			ExploreCircle(.player(), .pos(), 4500); //Explore a large area around stronghold.
		}
		else if (name == "Fights" && .race==Germany) {
			.settlement.SetFood(.settlement.food + 2000);
			// Eroi gia' in campo a livello 10...
			ol = GetPlayerUnits(.player, "Hero");
			for (i=0; i<ol.count; i+=1)
				if (ol[i].IsValid())
					if (ol[i].IsAlive())
						if (ol[i].AsHero().inherentlevel < 10)
							ol[i].AsHero().SetLevel(10);
			// ...e anche i nuovi (letto da ARENA_HIREHERO.VS)
			if (EnvReadInt(.settlement, "levels/Hero") < 10)
				EnvWriteInt(.settlement, "levels/Hero", 10);
		}
		else if (name == "Fights" && .race==Gaul) {
			// Fuori Imperivm 2 (arena "Fights" base): i nuovi Spadaccini/Arcieri
			// escono al 4 grazie ai token SetsSet del comando; qui gli eroi vanno a 12.
			// Imperivm 2 (richiesta utente): il gate "Fights Imp2" del colosseo deve
			// SOLO sbloccare gli upgrade, NON portare gli eroi a 12 (le unita' a liv 4
			// le fa "Gaul Weapons" in fucina). Quindi il boost eroi resta solo fuori modalita'.
			if (EnvReadInt(.player, "ModeInverno") != 1) {
				// Eroi gia' in campo subito a livello 12...
				ol = GetPlayerUnits(.player, "Hero");
				for (i=0; i<ol.count; i+=1)
					if (ol[i].IsValid())
						if (ol[i].IsAlive())
							if (ol[i].AsHero().inherentlevel < 12)
								ol[i].AsHero().SetLevel(12);
				// ...e anche i nuovi (letto da ARENA_HIREHERO.VS)
				if (EnvReadInt(.settlement, "levels/Hero") < 12)
					EnvWriteInt(.settlement, "levels/Hero", 12);
			}
		}
		// Cartagine: l'Assemblea del Popolo porta al 10 anche gli eroi gia' in campo
		// (i nuovi escono al 10 grazie al token "SetsSet, levels/Hero, 10" del comando)
		// e chiama 10 Macemen: come "Gladiator Shows Republic" entrano nella coda
		// dell'arena, cosi' ARENA_BEHAVIOR.VS li fa uscire uno alla volta.
		else if (name == "People's Assembly") {
			ol = GetPlayerUnits(.player, "Hero");
			for (i=0; i<ol.count; i+=1)
				if (ol[i].IsValid())
					if (ol[i].IsAlive())
						if (ol[i].AsHero().inherentlevel < 10)
							ol[i].AsHero().SetLevel(10);
			EnvWriteString(this, "Build", "CMaceman");
			EnvWriteString(this, "BuildGroup", "CMaceman");
			EnvWriteInt(this, "Build/CMaceman", EnvReadInt(this, "Build/CMaceman") + 10);
			EnvWriteInt(this, "Build/CMacemanmaxnumber", 60);
		}
		// Assemblea del Popolo della Cartagine NUMIDIA: eroi al livello 10
		// come quella classica, ma costa 2500 e NON evoca i 10 Mazzieri.
		// Il flag "People's Assembly" (prerequisito di elefanti e Spoils)
		// lo scrive il token SetsSet del comando, senza passare da qui.
		else if (name == "Numidian People's Assembly") {
			ol = GetPlayerUnits(.player, "Hero");
			for (i=0; i<ol.count; i+=1)
				if (ol[i].IsValid())
					if (ol[i].IsAlive())
						if (ol[i].AsHero().inherentlevel < 10)
							ol[i].AsHero().SetLevel(10);
		}
		else if (name == "Grain Trade" && .race==Germany) {
			.settlement.SetFood(.settlement.food + 2000);
		}
		// Grecia: l'Offerta agli Dei regala subito un sacerdote oltre ad alzarne il livello
		else if (name == "Offer to Gods") {
			Unit hp;
			hp = Place("HPriest", .pos, .player);
			if (hp.IsValid())
				.settlement.ForceAddUnit(hp);
		}
		// Roma (tutte e tre): l'Altare di Giove regala subito un sacerdote
		else if (name == "Altar of Jupiter") {
			if (EnvReadInt(.player, "ModeInverno") != 1) {
				Unit rp;
				rp = Place("RPriest", .pos, .player);
				if (rp.IsValid())
					.settlement.ForceAddUnit(rp);
			}
		}
		// Ogni edificio che addestra druidi/maghi regala il suo primo druido
		// quando si ricerca il suo primo upgrade (come Offer to Gods e Altar of
		// Jupiter qui sopra, e Code of Valor nel ramo NamePlr).
		// Gallia: Camera Rituale -> un druido
		else if (name == "Ritual Chamber") {
			if (EnvReadInt(.player, "ModeInverno") != 1) {
				Unit gd;
				gd = Place("GDruid", .pos, .player);
				if (gd.IsValid())
					.settlement.ForceAddUnit(gd);
			}
		}
		// Britannia: Camera di Thor -> un druido
		else if (name == "Britain Chamber") {
			Unit bd;
			bd = Place("BDruid", .pos, .player);
			if (bd.IsValid())
				.settlement.ForceAddUnit(bd);
		}
		// Germania: Camera Germanica -> una maga
		else if (name == "German Chamber") {
			Unit te;
			te = Place("TEnchantress", .pos, .player);
			if (te.IsValid())
				.settlement.ForceAddUnit(te);
		}
		// Cartagine: Riti Oscuri -> uno sciamano. La sotto-fazione decide la
		// classe: Numidia -> Sciamano Numida, Mauritana -> Sciamano base.
		// (Il tempio numida generava sempre lo Sciamano mauritano: baco.)
		else if (name == "Dark Rituals") {
			Unit cs;
			str shamanClass;
			shamanClass = "CShaman";
			if (EnvReadString(.settlement, "ChooseNumidianCarthage") == "researched")
				shamanClass = "CShamanNumidian";
			if (EnvReadInt(.player, "ModeInverno") != 1) {
				cs = Place(shamanClass, .pos, .player);
				if (cs.IsValid())
					.settlement.ForceAddUnit(cs);
			}
		}
		// Egitto: Culto di Osiride -> un sacerdote
		else if (name == "Cult of Osiris") {
			Unit ep;
			ep = Place("EPriest", .pos, .player);
			if (ep.IsValid())
				.settlement.ForceAddUnit(ep);
		}
		else if (name == "Food Tax") {
			.settlement.SetFoodProduction(.settlement.FoodProduction+GetConst("StrongholdFoodProduction"));
		}
		else if (name == "Free Beer") {
			.settlement.SetPopulation(.settlement.population + 20);
		}
		else if (name == "Free Trade") {// Free trade implementation
			.settlement.SetPopulation(.settlement.max_population);
		}
		else if (name == "Free Wine"){	// Buy map implementation - in Free Wine now
			ExploreCircle(.player, .pos, 4500);
		}
		else if (name == "Trade Routes") {
			int i;
			ObjList villages;
			villages=ClassPlayerObjs("BaseVillage",.player).GetObjList();
			for(i=0;i<villages.count;i=i+1){
				if(villages[i].AsBuilding().IsValid() && villages[i].AsBuilding().player==.player && !villages[i].AsBuilding().IsBroken()){
					villages[i].AsBuilding().settlement.SetFood(villages[i].AsBuilding().settlement.food+1000);
				}
			}
			continue;
		}
		else if (name == "Strengthen Stronghold Gates") {
			int i;
			ObjList gates;
			gates=.settlement.ObjectsAround("Gate");
			for(i=0;i<gates.count;i=i+1){
				if(gates[i].AsBuilding().IsValid()){
					gates[i].AsBuilding().SetMaxHealth(gates[i].AsBuilding().maxhealth*3/2);
					if(!gates[i].AsGate().IsBroken)
						gates[i].AsBuilding().SetHealth(gates[i].AsBuilding().health+gates[i].AsBuilding().maxhealth/2);
				}
			}
			continue;
		}
		else if (name == "Slavery") {
             int SlaveryGold;
             SlaveryGold = GetConst("SlaveryGold");
			.settlement.SetGold(.settlement.gold + SlaveryGold);
			.settlement.GoldConverted(SlaveryGold);
			EnvWriteString(.settlement, name, "");
		}
		else if (name == "Housing") {
			.settlement.AddToMaxPopulation(20);
		}
		else if (name == "Free Drinks") {//Free Drink implementation
			.settlement.SetPopulation(.settlement.population + 20);
		}
		else if (name == "Mumification") {
            int bestlevel;
            bestlevel = EnvReadInt(.player, "BestHeroLevel");
			ol = GetPlayerUnits(.player, "Hero");
			for (i=0; i<ol.count;i+=1)
			  {
				if (ol[i].IsValid())
				  if (ol[i].AsHero().inherentlevel > bestlevel)
					bestlevel = ol[i].AsHero().inherentlevel;
			  }
			EnvWriteInt(.player, "BestHeroLevel", bestlevel);
		}
		else if (name == "CLibyanFootman") {//Conta le truppe cartaginesi scontate
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CJavelinThrower") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CBerberAssassin") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CMaceman") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CNumidianRider") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "CNumidianRider") {
			EnvWriteInt(.settlement, "Specializated", EnvReadInt(.settlement, "Specializated") + 1);
		}
		else if (name == "Mahout School") {
			EnvWriteInt(.player, "MaxElephants", EnvReadInt(.player, "MaxElephants") + 1);
		}
		continue;
	}
	if(token == "SetsPlr" && !bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.player, name, value);
		continue;
	}
	if(token == "SetsSet" && !bCanceled)
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		EnvWriteString(.settlement, name, value);
		continue;
	}
}