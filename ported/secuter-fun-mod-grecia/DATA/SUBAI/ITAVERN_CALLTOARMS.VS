// void, Obj this

int gametime;
int pop;
int militamen;
int level;
Unit u;
bool give_veteran_guild;

.Progress();

militamen = 50;

gametime = GetTime() / 60000;

//I could use a simple formula to calculate this, but I decided not to.
if (gametime >= 20 && gametime < 40) {
	level = 4;
}
else if (gametime >= 40 && gametime < 60) {
	level = 8;
}
else if (gametime >= 60) {
	level = 12;
}
else {
	level = 1;
}

if (EnvReadInt(.AsBuilding.settlement, "items/Veteran Guild") == 1)
	give_veteran_guild = true;
else
	give_veteran_guild = false;

//spawn militia
while (militamen) {
	u = Place("IMilitiaman", .pos, .player);
	u.SetLevel(level);
	u.SetFood(0);
	if (give_veteran_guild)
		u.AddItem("Veteran Guild");
	.AsBuilding.settlement.ForceAddUnit(u);
	militamen -= 1;
}