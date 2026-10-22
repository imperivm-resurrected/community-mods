//void, Obj this, Settlement sett
int money;
int gold;
Item item;
int i;

if (!sett.IsValid)
	return;

//if (sett.GetCentralBuilding.AsCatapult) return;

//if(sett.GetCentralBuilding.IsHeirOf("BaseRuins")) return;

if( sett.GetCentralBuilding.IsHeirOf("Teleport") )
	return;

sett.SetGold(sett.gold+1);
if (sett.gold) sett.SetGold(sett.gold-1);
else return;

// spoils of war
if (.FindItem("Spoils of War"))
{
gold = GetConst("SpoilsOfWarGold");
//money = .AsUnit.RemoveItemsOfType("Spoils of War");
money = .FindItem("Spoils of War").use_count;
if (money==0) money=1;
if (money) {
	sett.SetGold(sett.gold + money * gold);
	sett.GoldConverted(money * gold);
	.AsUnit.RemoveItem("Spoils of War");
}
}

// deposita oro
for (i=1; i<=.max_items; i+=1)
{
	item = .GetItem(i);
	if (!item.IsValid)	continue;
	if (item.name == "Gold")
	{
		sett.SetGold(sett.gold + item.use_count);
		sett.GoldConverted(item.use_count);
		item.SetUseCount(0);
	}
	if (item.name == "Gold1000")
	{
		sett.SetGold(sett.gold + item.use_count);
		sett.GoldConverted(item.use_count);
		.RemoveItem(i);
	}			  
}
