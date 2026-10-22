//bool, ObjList objs, str OUT reasonText
// cmdparam is like this ReqSet, <research>, <explanation>, ReqPlr, <research>, <explanation>, SetsPlr, <env>, <value>, SetsSet, <env>, <value>, NamePlr, <research>, NameSet, <research>

Building this;
str dest, name, token, value;
dest = cmdparam;
this = objs[0].AsBuilding();

while(dest != "")
{
	token = ParseStr(dest, dest);
	if(token == "NameSet")
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		// Statue of anom-ra implementation - requires 2 researces
        if ((name == "Statue of Amon-Ra" || name == "Culto del faraone") && EnvReadString(.settlement, "Cult of Anubis") != "researched" && EnvReadString(.settlement, "Cult of Horus") != "researched")
		{
			reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Requires Cult of Anubis and Cult of Horus");
			return false;
		}
		if (name == "Mahout School" && EnvReadString(.settlement, "People's Assembly") == "researched")
		{
			int max_elephants;
			max_elephants = EnvReadInt(.player, "MaxElephants");
			if (max_elephants > 18) {
				reasonText = rollover(this,false) + "\nRaggiunto numero massimo di elefanti da guerra";
				return false;
			}
			else
				reasonText = rollover(this,false) + Translatef(" (currently %s1)", max_elephants+1);
		}
		if(EnvReadString(.settlement, name) == "researched")
		{
			if (name == "Mahout School" && EnvReadInt(.player, "MaxElephants") < 19)
				EnvWriteString(.settlement, name, "");
			if(value == "default")
				reasonText = rollover(this, "Already available");
			else
				reasonText = Translate(value);
			return false;
		}
		if(this.AsBuilding.IsValid)
		if(EnvReadString(this, "researching") == "yes")
		{
			reasonText = rollover(this,true);
			return false;
		}
	}	
	if(token == "NamePlr")
	{
		bool bTribute = false;
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);

        if ((name == "Statue of Amon-Ra" || name == "Culto del faraone") && EnvReadString(.settlement, "Cult of Anubis") != "researched" && EnvReadString(.settlement, "Cult of Horus") != "researched")
		{
			reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Requires Cult of Anubis and Cult of Horus");
			return false;
		}

		if (name == "Tribute") {
			int i;
			int delay;
			int time;
			int gold = 0;
			str times, values;
			
			bTribute = true;
			times = GetConstStr("TributeTimes");
			values = GetConstStr("TributeGold");
			delay = GetConst("TributeDuration") * 1000;
			
			i = GetTime() + delay;
			
			while (times != "") {
				int old_gold;
				old_gold = gold;
				time = Str2Int(ParseStr(times, times)) * 60000;
				gold = Str2Int(ParseStr(values, values));
				if (i < time) {
					gold = old_gold;
					break;
				}
			}
			
			reasonText = Translatef(rollover(this,true), "" + gold);
			if (EnvReadString(.player,"Tribute")=="researching")
			{
				reasonText = Translatef(rollover(this,"Collecting tribute"), "" + gold);
				return false;
			}
			if (cmdcost_gold>.settlement.gold && EnvReadString(.player,"Tribute")!="researched" )
			  {
				  return EnvReadString(this,"researching")=="no";
			  }	
		}
		if(EnvReadString(.player, name) == "researched")
		{
			if(value == "default")
				{
					if (name=="Tribute")
						reasonText = rollover_desc(this,"Already collected",false);
					else
						reasonText = rollover(this,"Already available");						
				}
			else
				reasonText = Translate(value);
			return false;
		}
		if(this.AsBuilding.IsValid)
		if(EnvReadString(this, "researching") == "yes")
		{
			if (!bTribute) {
				reasonText = rollover(this,true);
			}
			return false;
		}
	}
	if(token == "ReqSet")
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		if(EnvReadString(.settlement, name) != "researched")
		{
			if (value == "default") {
				while (dest != "") {//Tribute is a special case
					str t;
					str n;
					t = ParseStr(dest, dest);
					n = ParseStr(dest, dest);
					ParseStr(dest, dest);
					if (t  == "NamePlr" && n == "Tribute") {
						int i;
						int delay;
						int time;
						int gold = 0;
						str times, values;
						
						times = GetConstStr("TributeTimes");
						values = GetConstStr("TributeGold");
						delay = GetConst("TributeDuration") * 1000;
						
						i = GetTime() + delay;
						
						while (times != "") {
							int old_gold;
							old_gold = gold;
							time = Str2Int(ParseStr(times, times)) * 60000;
							gold = Str2Int(ParseStr(values, values));
							if (i < time) {
								gold = old_gold;
								break;
							}
						}
						reasonText = Translatef(rollover(this,false),"" + gold);
						reasonText = reasonText + "\n<color 255 0 0>" + Translatef("Requires %s1", name);
						return false;
					}
				}
				reasonText = Translate(rollover(this,false));
				reasonText = reasonText + "\n<color 255 0 0>";
				reasonText = reasonText + Translatef("Requires %s1", name);
			} else
				reasonText = Translate(value);
			return false;
		}
		continue;
	} 
	if(token == "ReqPlr")
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		if(EnvReadString(.player, name) != "researched")
		{
			if(value == "default") {
				reasonText = rollover(this,false);
				reasonText = reasonText + "\n<color 255 0 0>";
				reasonText = reasonText + Translatef("Requires %s1", name);
			} else
				reasonText = Translate(value);
			return false;
		}
		continue;
	}
	if(token == "NReqSet")
	{
		name = ParseStr(dest, dest);
		value = ParseStr(dest, dest);
		if(EnvReadString(.settlement, name) == "researched")
		{
			if (value == "default")
				{
					if (.race==Carthage && name=="Specialization")
					{
						if (EnvReadInt(.settlement, "Specializated") <2)
							continue;
						else
							reasonText = rollover(this,true);
					}
					else
						reasonText = rollover(this,"Already available");
				}
			else
				reasonText = Translate(value);
			return false;
		}
		continue;
	} 
}

if ((cmdcost_gold > .settlement.gold) || (cmdcost_food > .settlement.food) || (cmdcost_pop>0 && cmdcost_pop + GetConst("MinPopulation") > .settlement.population) )
{
	reasonText = rollover(this,true);
	return true;
}
return true;
