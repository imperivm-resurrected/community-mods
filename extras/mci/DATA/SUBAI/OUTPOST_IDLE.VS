// void, Obj This

Settlement this;
int min_resource_food, min_resource_gold, refresh, food_sales, gold_sales, food_income, required_gold, gold_income, reserved_food;
int i, p;
Wagon wagon;
bool bProduceGold, bSellFood, bSellGold, bWagon;
ObjList olUnitsTributeOut;
ObjList olUnitsOut;
str strCommand;

this = This.AsBuilding().settlement;


p = .player;

refresh = GetConst("OutpostRefresh");
food_sales = GetConst("GOutpostFoodSales");
gold_sales = food_sales;
food_income = GetConst("GOutpostGoldReturn");
gold_income = GetConst("ROutpostGoldReturn");
required_gold = GetConst("ROutpostRequiredGold");
min_resource_food = GetConst("MinResQtyToTransportFood");
min_resource_gold = GetConst("MinResQtyToTransportGold");
bProduceGold = This.IsHeirOf("ROutpost") || This.IsHeirOf("EOutpost");

while (1) {
	if( .Units.count ) 
	{
		point pt;

		olUnitsOut.Clear;
		for(i=0; i<.Units.count; i+=1) {
			if( This.AsBuilding.IsEnemy(.Units[i] ) ) {
				olUnitsOut.Add(.Units[i]);
			}
			if (i % 50 == 49) Sleep(1);
		}
		olUnitsOut.ClearDead;

		pt.Set(1,0);
		pt.SetLen(This.AsBuilding.radius);
		pt.Rot(rand(360));
		pt = pt + This.AsBuilding.pos;
		olUnitsOut.SetCommand("advance", pt);
	}
        
	if (.IsIndependent())
	{
			Sleep(refresh);
			continue;
	}
	Sleep(refresh);

        if(p != .player){
        	EnvWriteString(this, "tribute_food", "off");
	        EnvWriteString(this, "tribute_gold", "off");
	        EnvWriteString(this, "tribute_people", "off");
	                                
	        EnvWriteString(this, "stoptribute_food", "on");
	        EnvWriteString(this, "stoptribute_gold", "on");
	        EnvWriteString(this, "stoptribute_people", "on");
	        .StopSupply();
	        break;
        }
        
	bSellFood = EnvReadString(this, "GOutpostSellFood") == "yes";
	bSellGold = EnvReadString(this, "GOutpostSellGold") == "yes"; // HD
	// gaul outpost behaviour
        if (.gold > 120 && !bSellFood && !bSellGold && (This.AsBuilding().class == "GOutpost" ||
        	            		  This.AsBuilding().class == "TOutpost")) {
                .SetGold(.gold - 10);
                .SetFood(.food + 10);         
        }
        
	if (!bProduceGold && bSellFood && .food > food_sales) {
		.SetFood(.food - food_sales);
		.SetGold(.gold + food_income);
		.GoldConverted(food_income);
	}
	// HD: gold selling
	if (!bProduceGold && bSellGold && .gold > gold_sales) {
		.SetGold(.gold - food_income);
		.SetFood(.food + gold_sales - 4);
	}
	// roman outpost behaviour
	if(bProduceGold && .gold >= required_gold) {
		.SetGold(.gold + gold_income);
		.GoldConverted(gold_income);
	}
	// send resources
	if (.supplied == this)
		.StopSupply();
	if (!.supplied.IsValid()) continue;
	if (!DiplGetCeaseFire(.player, .supplied.player)) continue;
	bWagon = false;
	if (.gold > min_resource_gold && !bSellGold) {
		int gold;
		gold = 1000;
		if (bProduceGold && .gold > required_gold && .gold - required_gold < 1000)
			gold = .gold - required_gold;
		if (gold > min_resource_gold) {
                	if(EnvReadString(this, "tribute_gold") == "on"){
                        	Settlement sett_target;
				str target_name;
                        	
                		target_name = EnvReadString(this, "tribute_gold_target");
                		sett_target = GetNamedObj(target_name).obj.AsBuilding.settlement;
                         
				wagon = .CreateMuleGold(gold);
	                        wagon.SetCommand("unload", sett_target.GetCentralBuilding());
                                wagon.AddCommand(false, "unload", .GetCentralBuilding());
	                        bWagon = true;
                        }
		}
	}
	if (.Units.count)
		reserved_food = 500;
	else
		reserved_food = 0;	
	if (!bWagon && .food > (min_resource_food + reserved_food) && !bSellFood) {
        	if(EnvReadString(this, "tribute_food") == "on"){
                	Settlement sett_target;
			str target_name;
                        	
                	target_name = EnvReadString(this, "tribute_food_target");
                	sett_target = GetNamedObj(target_name).obj.AsBuilding.settlement;
                                
			if (.food - reserved_food > 1000)
	                        wagon = .CreateMuleFood(1000);
	                else
	                        wagon = .CreateMuleFood(.food - reserved_food);
	                wagon.SetCommand("unload", sett_target.GetCentralBuilding());
                        wagon.AddCommand(false, "unload", .GetCentralBuilding());   
                }
	}
	olUnitsTributeOut.Clear;
     
	for(i=0; i<.Units.count; i+=1) {
		if( .Units[i].IsMilitary ) {
                	if( !.Units[i].IsHeirOf("SentryOutpost") && !.Units[i].IsHeirOf("CaptainOutpost") ) {
				olUnitsTributeOut.Add(.Units[i]);
                        }
		}
	}

	if( !.supplied.GetCentralBuilding.IsHeirOf("BaseVillage") ) {
        	if(EnvReadString(this, "tribute_people") == "on"){
                	Settlement sett_target;
			str target_name;
                        	
                	target_name = EnvReadString(this, "tribute_people_target");
                	sett_target = GetNamedObj(target_name).obj.AsBuilding.settlement;
                         
			if( olUnitsTributeOut.count >= 1 ){
                        	if(sett_target.GetCentralBuilding.IsHeirOf("Outpost") ||
                                   sett_target.GetCentralBuilding.IsHeirOf("BaseShipyard") ||
                                   sett_target.GetCentralBuilding.IsHeirOf("BaseTownhall"))
	                        	olUnitsTributeOut.SetCommand("enter", sett_target.GetCentralBuilding());
                        }
		}
        }

	
	
}
