// void, Obj This

Building bld;
Settlement this;
int units;

EnvWriteString(This.AsBuilding, "researching", "yes");

This.Progress();

EnvWriteString(This.AsBuilding, "researching", "no");

units = 100;
bld = This.AsBuilding();
if (bld.IsValid) {
	this = bld.settlement;
	if (.IsValid) {
		ObjList l;
		int i,j;
		Ship ship;

        l = .ObjectsAround("ShipBattle");
		
		for (j=3; j>0; j+=1) {
			int max;
		
			if (units<=0) break;
			if (l.count==0) break;
			max = units / l.count;
			if (max<10)
			if (units<10) max=units;
			else max=10;
			
			for (i=0; i<l.count && l.count>0;) {
				int add,c;
				add=max;
				ship = l[i].AsShip();
				
				if (units<=0) break;
				if (bld.IsEnemy(ship)) l.Remove(ship);
				else {
					if (ship.UnitsMax-ship.UnitsCount < max) {
						add= ship.UnitsMax-ship.UnitsCount;
						l.Remove(ship);
					}
					else 
						i+=1;
					
					for (c=0; c<add; c+=1)
						Place("RVillager",ship.pos,.player).AsUnit.EnterHolder(ship);
					units-=add;
				}
			}
		}
	}
}
