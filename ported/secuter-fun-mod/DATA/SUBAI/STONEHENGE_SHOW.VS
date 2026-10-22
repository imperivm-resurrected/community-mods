// void, Obj This

Building this;
int it, k, l, c;
ObjList player_units;
Unit unit;
int duration, time_step;

this = This.AsBuilding();
if (!.IsValid()) return;

duration = GetConst("StonehengeShowTime")/1000;
time_step = GetConst("StonehengeShowTimeStep")/1000;

PlaySound("data/Sound Entities/StonehengeSpell.xml");

for (it = duration; it > 0; it -= 1) {
str s;
	if (it%time_step ==0)
	for (k = 1; k <= 16; k += 1) {
		player_units = GetPlayerUnits(k);
		player_units.ClearDead();
		c = player_units.count();
		for (l = 0; l < c; l += 1) {
			unit = player_units[l].AsUnit();
			if (!unit.IsVisible)
				unit.SetVisible(true);
			if (l % 30 == 0) Sleep(10);
		}
	}
	
	if (it%60 > 10) s=""; else s="0";
	ShowAnnouncement("show","Vista di lince - "+(it/60)+":"+s+(it%60)+"s");
	Sleep(1000);
}
HideAnnouncement("show");
