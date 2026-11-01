//bool, ObjList objs, str OUT reasonText

Building this;

this = objs[0].AsBuilding();
if (!.IsValid()) return false;

if (.command != "idle") {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("You must wait for the current spell to be completed");
	return false;
}
if (!.IsStonehengeControlable()) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge isn't under your control");
	return false;
}
if (.stamina < GetCmdStaminaCost("ghost")) {
	reasonText = rollover(this,true) + "<color 255 0 0>\n" + Translate("Stonehenge is insufficiently charged");
	return false;
}

return true;
