//void, Obj owner

Unit this;
ObjList army, army_added;
int i;

this = owner.AsHero;
if (!.IsValid) return;

army = .AsHero.army;
for (i=0; i<army.count; i+=1)
	army[i].AsUnit.AddBonus(4,0,0,0,0);
army_added = army;

while (true)
{
	Sleep(10);
	
	//rimuove il bonus se togli un unità'
	for (i=0; i<army.count; i+=1)
		if (army[i].AsUnit.hero != this)
			army[i].AsUnit.RemoveBonus(4,0,0,0,0);
	
	army = .AsHero.army;
	for (i=0; i<army.count; i+=1)
		if(!army_added.Contains(army[i]))
			army[i].AsUnit.AddBonus(4,0,0,0,0);
	army_added = army;
}