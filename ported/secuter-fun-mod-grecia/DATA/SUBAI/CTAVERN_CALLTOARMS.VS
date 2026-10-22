// void, Obj this

int gametime;
int pop;
int militamen;
int level;
Unit u;
bool add_revenge_skill;
StrArray units;

units[0] = "CLibyanFootman";
units[1] = "CJavelinThrower";
units[2] = "CBerberAssassin";
units[3] = "CMaceman";
units[4] = "CNumidianRider";

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

if (EnvReadInt(.AsBuilding.settlement, "skills/Revenge") == 1)
	add_revenge_skill = true;
else
	add_revenge_skill = false;

//spawn mercenari
while (militamen) {
	u = Place(units[rand(units.size)], .pos, .player);
	u.SetLevel(level);
	u.SetFood(0);
	if (add_revenge_skill)
		u.AsUnit.SetSpecial(23, true);
	.AsBuilding.settlement.ForceAddUnit(u);
	militamen -= 1;
}