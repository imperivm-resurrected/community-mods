//void, Obj b

Building this;
ObjList olBuildings;
Building bld;
int i, monpop;

this = b.AsBuilding();
.Progress();

if(!.IsValid()) return;

monpop = GetConst("MonPopulation");
.settlement.SetPopulation(monpop);
EnvWriteString(.settlement, "burn", "off");
//if(.settlement.gold >= 4000)
//.settlement.SetGold(-1000);

olBuildings = .settlement.Buildings();
for (i = 0; i < olBuildings.count; i += 1)
{
	bld = olBuildings[i].AsBuilding();
	if (bld == this)
		continue;
	if (!bld.IsValid())
		continue;
	bld.RRepair();
}
.RRepair();
	
