//bool, ObjList objs, str OUT reasonText

Building bld;
Settlement this;
int count_units;

count_units = 0;
bld = objs[0].AsBuilding();
if (!bld.IsValid) return false;
this = bld.settlement;

if (EnvReadString(objs[0].AsBuilding(), "researching") == "yes")
  {
	reasonText = rollover(objs[0].AsBuilding(), true);
	return false;
  }


if (.IsValid) {
	ObjList l;
	int i;
	Ship ship;

	l = .ObjectsAround("ShipBattle");
	for (i = l.count; i > 0;) {
		i -= 1;
		ship = l[i].AsShip();
		if (!bld.IsEnemy(u) && ship.UnitsCount<ship.UnitsMax)
            count_units+= ship.UnitsMax-ship.UnitsCount;
	}	
}

if (count_units < 30)
  {
	reasonText = rollover(objs[0].AsBuilding(), false) + "\n<color 255 0 0 >" + Translate("Richiede almeno 1 nave con spazio disponibile vicino al porto");
	return false;
  }
else if ((cmdcost_gold > .gold) || (cmdcost_food > .food) || (cmdcost_pop>0 && cmdcost_pop + GetConst("MinPopulation") > .population) )
  {
	reasonText = rollover(objs[0].AsBuilding(), true);
	return true; 
  }
else
  {	
	reasonText = rollover(objs[0].AsBuilding(), true);
	return true;
  }  
return true;