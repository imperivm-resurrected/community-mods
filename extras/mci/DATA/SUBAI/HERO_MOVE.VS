// void, Obj This, point pt
Hero this;
Unit u;
ObjList ol;
point dpt;  
int x, e, c;
//.pr("hero::move");
this = This.AsHero();

if(.IsValid() == false)
{
	return;
}



if(.InShip() == true)
{
	Ship s;
	s = .GetShip();
	
	if(s.IsValid() == true && s.IsAlive() == true)
	{
		if(s.player() != .player() && DiplGetShareControl(s.player(), .player()) == false)
		{
			s.SetCommand("unboardall", s.pos());
			return;
		}	//Fine if.
	}	//Fine if.
	else
	{
		return;
	}	//Fine else.
}	//Fine if.

if(.DistTo(pt) > 1000){
	if(.army.count  >= 20){
	        ol = ObjsInCircle(pt, 600, "Military").GetObjList;
                if(ol.count > 100) c = 100;
                else c = ol.count;
                
	        for(x = 0; x < c; x += 1) {
	                u = ol[x].AsUnit();
	                if (!u.IsValid()) continue;
	                if (.IsEnemy(u)) e += 1;
                                
	                if(e >= 40){
	                	e = 0;
	                        .AddCommand(false, "advance", pt);
	                        .AddCommand(false, "engage");
	                        return;
	                }
                        Sleep(10);
	                
	        }
	}
}

// Ivko: Always walk in formation, so newly attached units automatically enter formation
.FormSetupAndMoveTo (pt, 0, 0, true);
while (.HasPath ())
{
  
  .FormKeepMoving (1500);
  
}


dpt = .GetFinalPartyOrientation() - Point(1024, 1024);
if (dpt.x != 0 || dpt.y != 0)
	.Face(.pos + dpt);
	
	
if (.IsAlive)
if (.HasArmy)
if (.CmdCount == 1)
{
	.army.SetCommand("stand_position");
	.AddCommand(false, "stand_position");
        if(.army.count >= 40){
        	for (x = 0; x < .army.count; x += 1){
        		.army[x].AsUnit.PlaySound("data/Sound Entities/UNIT_CONFIRM.XML");
                        Sleep(5);
                }
        } 
}
