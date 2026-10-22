//bool, ObjList objs, str OUT reasonText

Building this;

this = objs[0].AsBuilding();

if (.IsValid) {
	int race;

	race = GetPlayerRace(.player);

	if (race == RepublicanRome) {
		if (cmdparam != "ShipRome")
			return false;
	}
	else if (race == Egypt) {
		if (cmdparam != "ShipEgypt")
			return false;
	}
	else if (cmdparam != "ShipL")
		return false;

	{
		int nRace;
		Settlement this;
		nRace = GetPlayerRace(bld.player);
		this = bld.settlement;			
		if(.IsValid)
		{
			if(.gold < cmdcost_gold)
			{
				reasonText = rollover(bld,true);
				return true;
			}
		}
	}
}

return false;