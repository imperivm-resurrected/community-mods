//bool, ObjList objs, str OUT reasonText
// cmdparam is like this ReqSet, <research>, <explanation>, ReqPlr, <research>, <explanation>, SetsPlr, <env>, <value>, SetsSet, <env>, <value>, NamePlr, <research>, NameSet, <research>

Building this;
str dest, name, token, value;
str subScan, subTok, subPrev, subFac;
dest = cmdparam;
this = objs[0].AsBuilding();

// Le copie Old school vengono scartate prima dei controlli di razza e
// sottofazione: fuori modalita' non devono mostrare "Wrong civilization".
subScan = cmdparam;
token = ParseStr(subScan, subScan);
if ((token == "ReqModeImp2" && EnvReadInt(.player, "ModeOldSchoolCostsV2") != 1) ||
    (token == "NReqModeImp2" && EnvReadInt(.player, "ModeOldSchoolCostsV2") == 1))
{
	reasonText = "";
	return false;
}

// Restrict foreign civilization research only in standard strategy modes.
// Alternative and editor/scenario defaults leave this restriction disabled.
if (EnvReadInt("StrategyCivilizationLimits") == 1)
if (objs[0].race != GetPlayerRace(objs[0].player))
{
    reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Wrong civilization");
    return false;
}

// Controllo SOTTO-FAZIONE (Roma e Cartagine).
// Roma (Repubblicana/Imperiale/Punica) e Cartagine (Numidia/Mauritania)
// condividono lo stesso slot di razza, percio' il controllo razza qui sopra
// non le distingue. Gli script *_ENABLE_OR_DISABLE_CMD.VS nascondono i comandi
// della sotto-fazione sbagliata con CmdEnable/CmdDisable, ma non sono un blocco
// ferreo: una fucina appena costruita (o conquistata) puo' restare col comando
// abilitato e permettere upgrade della fazione sbagliata. Qui la ricerca viene
// bloccata davvero se non appartiene alla sotto-fazione scelta nel settlement
// (flag Choose*Rome / Choose*Carthage, uno solo "researched" per volta).
// La sotto-fazione dell'upgrade si riconosce dalla classe unita' impostata col
// token NameSet nel param: solo NameSet, perche' gli StopSpecialization di
// Cartagine usano SetsSet/ReqSet e devono restare condivisi.
subFac = "";
subPrev = "";
subScan = cmdparam;
if (objs[0].race == RepublicanRome)
{
	while (subScan != "")
	{
		subTok = ParseStr(subScan, subScan);
		if (subPrev == "NameSet")
		{
			if (subTok=="RVelit" || subTok=="RPrinciple" || subTok=="RHorseman" || subTok=="RPraetorian" || subTok=="RArcher")
				subFac = "ChooseImperialRome";
			else if (subTok=="MPrinciple" || subTok=="RTribune" || subTok=="RChariot" || subTok=="RToxotai" || subTok=="HMyrmidon_Javelin" || subTok=="RScout")
				subFac = "ChooseRepublicanRome";
			else if (subTok=="RTriarius" || subTok=="RCavaliere" || subTok=="RBalearSlinger" || subTok=="RTesserarius" || subTok=="RCenturion")
				subFac = "ChoosePunicRome";
		}
		subPrev = subTok;
	}
}
else if (objs[0].race == Carthage && EnvReadInt(objs[0].player, "ModeInverno") != 1)
{
	while (subScan != "")
	{
		subTok = ParseStr(subScan, subScan);
		if (subPrev == "NameSet")
		{
			if (subTok=="CLibyanFootman" || subTok=="CJavelinThrower" || subTok=="CNumidianRider" || subTok=="CHorseman")
				subFac = "ChooseNumidianCarthage";
			else if (subTok=="CBerberAssassin" || subTok=="CMauritanianWrestler" || subTok=="NSECUAZ" || subTok=="CMaceman" || subTok=="CCamelArcher")
				subFac = "ChooseMauritanianCarthage";
		}
		subPrev = subTok;
	}
}
if (subFac != "" && EnvReadString(.settlement, subFac) != "researched")
{
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Wrong civilization");
	return false;
}


while(dest != "")
{
	token = ParseStr(dest, dest);
	// Filtri di modalita usati dalle varianti di costo. Devono essere
	// verificati qui, prima che il motore inserisca il comando nel pannello:
	// CmdDisable non e' persistente quando si sblocca un nuovo livello.
	if(token == "ReqModeImp2")
	{
		ParseStr(dest, dest);
		ParseStr(dest, dest);
		if(EnvReadInt(.player, "ModeOldSchoolCostsV2") != 1)
		{
			reasonText = "";
			return false;
		}
		continue;
	}
	if(token == "NReqModeImp2")
	{
		ParseStr(dest, dest);
		ParseStr(dest, dest);
		if(EnvReadInt(.player, "ModeOldSchoolCostsV2") == 1)
		{
			reasonText = "";
			return false;
		}
		continue;
	}
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
				reasonText = "<color 0 255 0>" + Translate("Researched") + "\n" + rollover(this, "Already available");
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
		// Razzie: stesso trattamento speciale del tributo, ma in cibo
		if (name == "Raids") {
			int i;
			int delay;
			int time;
			int food = 0;
			str times, values;

			bTribute = true;
			times = GetConstStr("RaidsTimes");
			values = GetConstStr("RaidsFood");
			delay = GetConst("RaidsDuration") * 1000;

			i = GetTime() + delay;

			while (times != "") {
				int old_food;
				old_food = food;
				time = Str2Int(ParseStr(times, times)) * 60000;
				food = Str2Int(ParseStr(values, values));
				if (i < time) {
					food = old_food;
					break;
				}
			}

			reasonText = Translatef(rollover(this,true), "" + food);
			if (EnvReadString(.player,"Raids")=="researching")
			{
				reasonText = Translatef(rollover(this,"Collecting raids"), "" + food);
				return false;
			}
			if (cmdcost_food>.settlement.food && EnvReadString(.player,"Raids")!="researched" )
			  {
				  return EnvReadString(this,"researching")=="no";
			  }
		}
		if(EnvReadString(.player, name) == "researched")
		{
			if(value == "default")
				{
					if (name=="Tribute" || name=="Raids")
						reasonText = rollover_desc(this,"Already collected",false);
					else
						reasonText = "<color 0 255 0>" + Translate("Researched") + "\n" + rollover(this,"Already available");
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
					if (t == "NamePlr" && n == "Raids") {
						int i;
						int delay;
						int time;
						int food = 0;
						str times, values;

						times = GetConstStr("RaidsTimes");
						values = GetConstStr("RaidsFood");
						delay = GetConst("RaidsDuration") * 1000;

						i = GetTime() + delay;

						while (times != "") {
							int old_food;
							old_food = food;
							time = Str2Int(ParseStr(times, times)) * 60000;
							food = Str2Int(ParseStr(values, values));
							if (i < time) {
								food = old_food;
								break;
							}
						}
						reasonText = Translatef(rollover(this,false),"" + food);
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
						reasonText = "<color 0 255 0>" + Translate("Researched") + "\n" + rollover(this, "Already available");

					if (.race==Carthage && name=="Specialization2")
						reasonText = rollover(this,true);
					else
						reasonText = "<color 0 255 0>" + Translate("Researched") + "\n" + rollover(this, "Already available");
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
