//void, Obj This

Building this;
Unit newunit;
str class, groupname;
int number, maxnumber;
int level, i;
point ptExit;
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
		if (class == "RLiberatus") {
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

		// Shrine of Thor implementation
		if (EnvReadString(.settlement, "Shrine of Thor") == "researched" && 
			class == "BVikingLord"
		) {
			if (EnvReadInt(.player, "BVikingLordLevel") > level)
				level = EnvReadInt(.player, "BVikingLordLevel");
			if (level < 20)
				{
					EnvWriteInt(.settlement, "levels/BVikingLord", level + 2);
					EnvWriteInt(.player, "BVikingLordLevel", level + 2);
				}	
		}

		// Liberati guild implementation
		if (EnvReadString(.settlement, "Liberati guild") == "researched" && 
		  class == "RLiberatus" && number == 10
		) {
			level += 1;
			if (EnvReadInt(.player, "BestLiberatus") > level)
				level = EnvReadInt(.player, "BestLiberatus");
			EnvWriteInt(.settlement, "levels/RLiberatus", level);
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
			newunit.SetCommand("enter", .settlement.GetCentralBuilding);
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
		  }
		EnvWriteInt(this, "Build/" + class, number-1);
		Sleep(1000);
	}
}
