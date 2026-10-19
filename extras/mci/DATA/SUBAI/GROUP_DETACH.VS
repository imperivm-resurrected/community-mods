//void, ObjList objs, point pt, Obj obj, bool bReplace, bool bModifier, int player

int i;
Unit u;
Hero h;
	
for(i = 0; i < objs.count(); i += 1){
	u = objs[i].AsUnit;
	if(u.IsValid) 
	{
		h = u.hero;
	        if( h.IsValid ) {
	        	//pr("DetachFrom");
	        	if(h.command() == "teleport" || (h.InHolder() == true && h.GetHolderSett().GetCentralBuilding().IsHeirOf("Teleport") == true))
	        		u.SetCommand("idle"); // HD
	        	u.DetachFrom(h);
                	if(u.stamina > 0){ 
	                        u.SetStamina(0);
	                        CreateFeedback("StaminaLoss", u);
	                }
	        }                        

	}
        // no sleep !
}
