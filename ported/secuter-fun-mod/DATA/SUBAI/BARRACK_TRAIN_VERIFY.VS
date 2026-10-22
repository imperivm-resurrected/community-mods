//bool, ObjList objs, str OUT reasonText

str strText;
str dest,class, research;

dest = cmdparam;

class = ParseStr(dest, dest);
research = ParseStr(dest, dest);

if(EnvReadString(objs[0].AsBuilding.settlement, class) == "researched")
  {
	if ((cmdcost_gold > objs[0].AsBuilding.settlement.gold) || (cmdcost_food > objs[0].AsBuilding.settlement.food) || (cmdcost_pop>0 && cmdcost_pop + GetConst("MinPopulation") > objs[0].AsBuilding.settlement.population) )
	{
		reasonText = rollover(objs[0].AsBuilding, class,true);
		return true;
	}
	reasonText = rollover(objs[0].AsBuilding, class, true);
	return true;
  }

strText = rollover(objs[0].AsBuilding, class, false) + "\n<color 255 0 0>";

if (research!="")
   reasonText = strText + Translatef("Requires %s1 from Blacksmith",research);
else	
   reasonText = strText + Translate("Requires equipment from Blacksmith");

if (class=="RGladiator")
  reasonText = strText + Translatef("Requires %s1 from Arena",research);
if (class=="CNoble")
  reasonText = strText + Translate("Requires Sacred Legion");
if (class=="EChariot")
  reasonText = strText + Translate("Requires research in Temple of Osiris");

if (class=="EAnubisWarrior" || class=="EHorusWarrior")
  reasonText = strText + Translatef("Requires %s1 from Temple of Horus and Anubis",research);
	
if (class=="ELionF" || class=="ELionM")
	reasonText = strText + Translatef("Richiede %s1 da taverna",research);

return false;
