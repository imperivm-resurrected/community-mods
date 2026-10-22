//void, Obj This

Building this;
Unit newunit;
str class, groupname;
int number, maxnumber;
int level, i;
point ptExit, ptRally;
Query qGroup;

this = This.AsBuilding();

Sleep(rand(1000) + 500);

while(1)
{
	class = EnvReadString(this, "Build");
	groupname = EnvReadString(this, "BuildGroup");
	number = EnvReadInt(this, "Build/" + class);
	maxnumber = EnvReadInt(this, "Build/" + class + "maxnumber");
	qGroup = Group("Player" + .player + groupname);
	//.pr("left : " + number + " " + class + "; group :" + groupname);
	
	if(number == 0 || qGroup.GetObjList.count >= maxnumber)
	{
		if (class == "RLiberatus" || class == "RLiberatusOldSchool") {
			// update the best liberatus level for our player
			ObjList ol;
			int i, l, max_level;

			ol = qGroup.GetObjList();
			max_level = EnvReadInt(.player, "BestLiberatus");
			// find the max RLiberati level for the player
			for (i = 0; i < ol.count; i += 1) {
				l = ol[i].AsUnit().inherentlevel;
				if (l > max_level) max_level = l;
			}
			EnvWriteInt(.player, "BestLiberatus", max_level);
		}
		if (class == "TValkyrie") {
			// update the best valkirie level for our player
			ObjList ol;
			int i, l, max_level;

			ol = qGroup.GetObjList();
			max_level = EnvReadInt(.player, "BestValkyries");
			// find the max Valkirie level for the player
			for (i = 0; i < ol.count; i += 1) {
				l = ol[i].AsUnit().inherentlevel;
				if (l > max_level) max_level = l;
			}
			EnvWriteInt(.player, "BestValkyries", max_level);
		}
		Sleep(2500);
	}
	else
	{
		groupname = EnvReadString(this, "BuildGroup");

		ptExit = .GetExitPoint( .settlement.GetCentralBuilding.pos, false );
		level = EnvReadInt(.settlement, "levels/" + class);
		// La variante Old School con Liberta' condivide la progressione del
		// Liberatus standard.
		if (class == "RLiberatusOldSchool")
			level = EnvReadInt(.settlement, "levels/RLiberatus");

		// Shrine of Thor implementation
		// Imperivm 2 (flag ModeInverno): la Gallia usa lo stesso Signore Vichingo
		// ma SENZA tetto al livello 20 (richiesta utente). In Imperivm 2 solo la
		// Gallia puo' avere Signori Vichinghi, quindi il guard su ModeInverno non
		// tocca la Britannia (che nelle altre modalita' resta cappata a 20).
		if (EnvReadString(.settlement, "Shrine of Thor") == "researched" &&
			class == "BVikingLord"
		) {
			if (EnvReadInt(.player, "BVikingLordLevel") > level)
				level = EnvReadInt(.player, "BVikingLordLevel");
			if (level < 20 || EnvReadInt(.player, "ModeInverno") == 1)
				{
					EnvWriteInt(.settlement, "levels/BVikingLord", level + 2);
					EnvWriteInt(.player, "BVikingLordLevel", level + 2);
				}
		}

		// Liberati guild implementation
		if (EnvReadString(.settlement, "Liberati guild") == "researched" && 
		  (class == "RLiberatus" || class == "RLiberatusOldSchool") && number == 10
		) {
			level += 1;
			if (EnvReadInt(.player, "BestLiberatus") > level)
				level = EnvReadInt(.player, "BestLiberatus");
			EnvWriteInt(.settlement, "levels/RLiberatus", level);
		}
		
        // Call socii implementation
        if (EnvReadString(.settlement, "Call Socii") == "researched" &&
         class == "RExtrordina" && number == 10
        ) {
            level += 1;
            if (EnvReadInt(.player, "BestExtrordinaLevel") > level)
                level = EnvReadInt(.player, "BestExtrordinaLevel");
            EnvWriteInt(.settlement, "levels/RExtrordina", level);
        }

		// Eredita' Achemenide (Mauritana): con l'upgrade "Achaemenids Training"
		// del Colosseo, ogni nuovo gruppo di Guerrieri Achemenidi nasce un
		// livello sopra il migliore raggiunto finora (pattern Valchirie/Liberati).
		if (EnvReadString(.settlement, "Achaemenids Training") == "researched")
		if (class == "CAchaemenidWarrior" && number == 10)
		{
			if (EnvReadInt(.player, "BestAchaemenid") > level)
				level = EnvReadInt(.player, "BestAchaemenid");
			level += 1;
			EnvWriteInt(.settlement, "levels/CAchaemenidWarrior", level);
		}

		// Veterani della Tribu' (Mauritana): oltre 99 di popolazione le
		// nuove unita' partono almeno al livello 6, oltre 125 almeno al 12
		if (EnvReadString(.settlement, "Tribal Veterans") == "researched")
		{
			if (.settlement.population > 125) {
				if (level < 12) level = 12;
			}
			else if (.settlement.population > 99) {
				if (level < 6) level = 6;
			}
		}

		// Legendary Valkyrie  implementation
		if (EnvReadString(.settlement, "Legendary Valkyries") == "researched" && 
		  class == "TValkyrie" && number == 5)
		{
			if (EnvReadInt(.player, "BestValkyries") > level)
				level = EnvReadInt(.player, "BestValkyries");
            level += 1; 
			EnvWriteInt(.settlement, "levels/TValkyrie", level);
		}
		
		// Mountaineers
		if(class == "IMountaineer" && EnvReadString(.player, "Mountain Clan Legacy") == "researched") {
			ObjList ol;
			int i, l, max_level;
			level = EnvReadInt(.player, "BestMountaineerLevel");
			ol = qGroup.GetObjList();
			for (i = 0; i < ol.count; i += 1) {
				l = ol[i].AsUnit().inherentlevel;
				if (l > level) level = l;
			}
		}
		// New GHorse Tech  implementation
		if (EnvReadString(.settlement, "Oath of Allegiance") == "researched" && 
		  class == "GOathsworn" && number == 1){
			if (EnvReadInt(.player, "BestOathswornLevel") > level)
				level = EnvReadInt(.player, "BestOathswornLevel");
			level=((level*2)/3);
			if(level>1)
				EnvWriteInt(.settlement, "levels/GOathsworn", level);
			else
				EnvWriteInt(.settlement, "levels/GOathsworn", 1);
		}
		// Standartization
		{
			int l2;
			l2 = EnvReadInt(.player, "standard_spawn_level");
			if (l2 > level) level = l2;
		}
		
		if (ptExit.x==-1 && ptExit.y==-1) 
		{
			newunit = Place(class, Point(0,0), this.player);
			.settlement.AddUnit(newunit);
			newunit.AddToGroup("Player" + .player + groupname);
		} else
		{
			newunit = Place(class, ptExit, this.player);
			// Punto di raccolta (AsurMod): se impostato, l'unita' va li'
			if (EnvReadInt(this, "Punto") == 0)
				newunit.SetCommand("enter", .settlement.GetCentralBuilding);
			else
			{
				ptRally = Point(EnvReadInt(this, "X"), EnvReadInt(this, "Y"));
				newunit.SetCommand("move", ptRally);
			}
			newunit.AddToGroup("Player" + .player + groupname);
		}
		newunit.SetLevel(level);
		// Add item
		if (!newunit.IsHeirOf("BaseMage") && !newunit.IsHeirOf("Hero"))
		  {
			if (EnvReadInt(.settlement, "items/Bear teeth amulet") == 1)
				newunit.AddItem("Bear teeth amulet");
			if (EnvReadInt(.settlement, "items/Herb amulet of luck") == 1)
				newunit.AddItem("Herb amulet of luck");
			if (EnvReadInt(.settlement, "items/Belt of might") == 1)
				newunit.AddItem("Belt of might");
			if (EnvReadInt(.settlement, "items/God's Gift") == 1)
				newunit.AddItem("God's Gift");
			if (EnvReadInt(.settlement, "items/Veteran Guild") == 1)
				newunit.AddItem("Veteran Guild");
			// Doni Tribali (Mauritana): vedi BARRACK_TRAIN.VS
			if (EnvReadInt(.settlement, "items/Ceremonial Blade") == 1)
				newunit.AddItem("Ceremonial Blade");
			if (EnvReadInt(.settlement, "items/Bone Shield") == 1)
			{
				newunit.AddItem("Bone Shield");
				newunit.AddBonus(0, 5, 0, 0, 0);
			}
		  }
		EnvWriteInt(this, "Build/" + class, number-1);
		Sleep(1000);
	}
}
