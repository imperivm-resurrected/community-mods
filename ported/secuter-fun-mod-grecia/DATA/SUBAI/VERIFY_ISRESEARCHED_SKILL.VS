//bool, ObjList objs, str OUT reasonText

Obj this;
int i;
str dest, name, reason;
this = objs[0];
dest = cmdparam;

name = ParseStr(dest, dest);
reason = ParseStr(dest, dest);

if (reason == "")
{
	reason = rollover(this,false) + "\n<color 255 0 0>";
	reason = reason + Translatef("Requires %s1", name);
}
else
	reason = rollover(this,false) + "\n<color 255 0 0>" + Translatef(reason,name);

if(EnvReadString(.player, name) != "researched")
	if(this.AsBuilding.IsValid)
	{
		if(EnvReadString(this.AsBuilding.settlement, name) != "researched")
		{
			reasonText = reason;
			return false;
		}
	} else
	{
		reasonText = reason;
		return false;
	}

if (name == "Saggezza degli antenati" && EnvReadInt(.player, "Druid/BuffLevel") == 1) {
	if (EnvReadInt(.player, "Druid/BuffLevel2") == 1) {
		EnvWriteInt(.player, "Druid/BuffLevel", 0);
		EnvWriteInt(.player, "Druid/BuffLevel2", 0);
	}
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Skill already in effect");
	return false;
}
else if (name == "Protezione di Nettuno" && EnvReadInt(.player, "Druid/BuffDefence") == 1) {
	if (EnvReadInt(.player, "Druid/BuffDefence2") == 1) {
		EnvWriteInt(.player, "Druid/BuffDefence", 0);
		EnvWriteInt(.player, "Druid/BuffDefence2", 0);
	}
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Skill already in effect");
	return false;
}
else if (name == "Canto di guerra" && EnvReadInt(.player, "Druid/BuffAttack") == 1) {
	if (EnvReadInt(.player, "Druid/BuffAttack2") == 1) {
		EnvWriteInt(.player, "Druid/BuffAttack", 0);
		EnvWriteInt(.player, "Druid/BuffAttack2", 0);
	}
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Skill already in effect");
	return false;
}
else if (name == "Vento del Nord" && EnvReadInt(.player, "Druid/BuffSpeed") == 1) {
	if (EnvReadInt(.player, "Druid/BuffSpeed2") == 1) {
		EnvWriteInt(.player, "Druid/BuffSpeed", 0);
		EnvWriteInt(.player, "Druid/BuffSpeed2", 0);
	}
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Skill already in effect");
	return false;
}
else if (name == "Azzera difesa" && EnvReadInt(.player, "Druid/ZeroDefence") == 1) {
	if (EnvReadInt(.player, "Druid/ZeroDefence2") == 1) {
		EnvWriteInt(.player, "Druid/ZeroDefence", 0);
		EnvWriteInt(.player, "Druid/ZeroDefence2", 0);
	}
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Skill already in effect");
	return false;
}
else if (name == "Disidratazione" && EnvReadInt(.player, "Druid/DrainStamina") == 1) {
	if (EnvReadInt(.player, "Druid/DrainStamina2") == 1) {
		EnvWriteInt(.player, "Druid/DrainStamina", 0);
		EnvWriteInt(.player, "Druid/DrainStamina2", 0);
	}
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Skill already in effect");
	return false;
}
else if (name == "Favore di Zeus" && EnvReadInt(.player, "Druid/BuffBalanced") == 1) {
	if (EnvReadInt(.player, "Druid/BuffBalanced2") == 1) {
		EnvWriteInt(.player, "Druid/BuffBalanced", 0);
		EnvWriteInt(.player, "Druid/BuffBalanced2", 0);
	}
	reasonText = rollover(this,false) + "\n<color 255 0 0>" + Translate("Skill already in effect");
	return false;
}

if(this.AsBuilding.IsValid)
	if ((cmdcost_gold > this.AsBuilding.settlement.gold) || (cmdcost_food > this.AsBuilding.settlement.food) || (cmdcost_pop>0 && cmdcost_pop + GetConst("MinPopulation")> this.AsBuilding.settlement.population) )
	{
		reasonText = rollover(this,true);
		return true;
	}

return true;
