//bool, ObjList objs, str OUT reasonText

if(objs.count)
{
	Building bld;
	bld = objs[0].AsBuilding();
	if(bld.IsValid)
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
return true;