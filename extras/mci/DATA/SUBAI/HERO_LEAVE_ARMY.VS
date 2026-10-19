//void, Obj this
Item item;
Hero h;
int i;

h = this.AsHero();

for(i = 0; i < h.army.count; i += 1)
{     
	Unit u;
        u = h.army[i].AsUnit;
        if(u.IsValid){
        	if(u.stamina > 0){ 
	                u.SetStamina(0);
	                CreateFeedback("StaminaLoss", u);
	        }
        }
        Sleep(10);
}
if(h.IsValid() == true && h.army().count() >= 1)
	h.army().SetCommand("idle"); // HD
h.DetachArmy();
item = .GetItem(2);
.ExchangeItem(item, "UnknownFavourite"); 

