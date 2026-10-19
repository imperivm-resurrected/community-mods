// void, Obj This

Unit this;

this = This.AsUnit;

if(!.IsValid) return;

if (.InShip())
	return;//ships don't have interface for adding/removing units

while (!.Stop(1000));

Sleep(rand(1000)+100);

.Mutate("IVillager");   
//ptm = .pos;
//pl = .player;
//u = Place("IVillager", ptm, pl);
//if (.InHolder()) {
	//.GetHolderSett.ForceAddUnit(u);
//}
//.Erase();
