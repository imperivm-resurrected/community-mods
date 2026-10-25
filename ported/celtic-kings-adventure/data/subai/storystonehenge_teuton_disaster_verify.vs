//bool, ObjList objs, str OUT reasonText

Building this;

this = objs[0].AsBuilding();
if (!.IsValid()) return false;

if (IsMultiplayer())
	if (EnvReadInt("PreventMixing") == 1) 
		return false;	
if (EnvReadInt(this, "StonehengeStart") == 1) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (EnvReadInt(this, "TeutonDisasterCasted") == 1) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("A Teuton uprising has already been summoned");
	return false;
}
if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("teuton_disaster")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}
if (NoTents()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("There are no teuton tents on the map");
	return false;
}
return true;