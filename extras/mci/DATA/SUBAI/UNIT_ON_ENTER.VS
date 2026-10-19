//void, Obj this, Settlement sett
int money;
int meat1, meat2, meat3, meat4;
int cost_meat1, cost_meat2, cost_meat3, cost_meat4;
int gold;
int idx;
int i;
Item item;

if (!.AsUnit.IsValid) 
	return; 
 
if (!sett.IsValid)
	return;

if (sett.GetCentralBuilding.AsCatapult)
	return;

if( sett.GetCentralBuilding.IsHeirOf("BaseRuins") )
	return;

if( sett.GetCentralBuilding.IsHeirOf("Teleport") )
	return;        

// spoils of war

gold = GetConst("SpoilsOfWarGold");
money = .AsUnit.RemoveItemsOfType("Spoils of War");
if (money) {
	sett.SetGold(sett.gold + money * gold);
	sett.GoldConverted(money * gold);
}

if(.AsUnit.IsValid){
	if(.AsUnit.IsHeirOf("Military") && .AsUnit.player != 15){
		if(.HasItem("Pouch Gold")){
	                for (i=1; i<=.item_count; i+=1)
	                {
	                        item = .GetItem(i);
	                        if (!item.IsValid) 
	                        	continue;       
	                        if (item.name == "Pouch Gold")
	                        {
	                                sett.SetGold(sett.gold + item.use_count);
	                                sett.GoldConverted(item.use_count);
	                                //item.SetUseCount(0);
	                        }       
	                }
	                .AsUnit.RemoveItemsOfType("Pouch Gold");
	        }
	                  
	        cost_meat1 = 600;
	        cost_meat2 = 400;
	        cost_meat3 = 300;
	        cost_meat4 = 200;

	        meat1 = .AsUnit.RemoveItemsOfType("Meat 1");
	        if (meat1) sett.SetFood(sett.food + cost_meat1);

	        meat2 = .AsUnit.RemoveItemsOfType("Meat 2");
	        if (meat2) sett.SetFood(sett.food + cost_meat2);

	        meat3 = .AsUnit.RemoveItemsOfType("Meat 3");
	        if (meat3) sett.SetFood(sett.food + cost_meat3);

	        meat4 = .AsUnit.RemoveItemsOfType("Meat 4");
	        if (meat4) sett.SetFood(sett.food + cost_meat4);

	        // mercenary pact
	        if (EnvReadString(.player, "Mercenary pact")=="researched")
	          {
	                for (i=1; i<=.item_count; i+=1)
	                  {
	                        item = .GetItem(i);
	                        if (!item.IsValid) 
	                        	continue;     
	                        if (item.name == "Gold")
	                          {
	                                sett.SetGold(sett.gold + item.use_count);
	                                sett.GoldConverted(item.use_count);
	                                item.SetUseCount(0);
	                          }       
	                  }
	          }
        } else if(.AsUnit.IsHeirOf("BaseAnimal")){
	        if(.AsUnit.class == "Deer"){
	                sett.SetFood(sett.food + cost_meat1);
	                .Damage(100000);
	        } else if(.AsUnit.class == "Bear" || .AsUnit.class == "BearUnit"
	        || .AsUnit.class == "Boar" || .AsUnit.class == "BoarUnit"){
	                sett.SetFood(sett.food + cost_meat2);
	                .Damage(100000);
	        } else if(.AsUnit.class == "LionM" || .AsUnit.class == "LionMUnit"
	        || .AsUnit.class == "LionF" || .AsUnit.class == "LionFUnit"){
	                sett.SetFood(sett.food + cost_meat3);
	                .Damage(100000);
	        } else if(.AsUnit.class == "Wolf" || .AsUnit.class == "WolfUnit"){
	                sett.SetFood(sett.food + cost_meat4);
	                .Damage(100000);
	        }
        }
}