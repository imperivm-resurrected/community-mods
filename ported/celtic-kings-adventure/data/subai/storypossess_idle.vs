// void, Obj This

int i;
ObjList ol;
Sacrifice this;
Unit u;
int sight, life, price;

sight = GetConst("PossessSight");
price = GetConst("PossessToll");

this = This.AsSacrifice;
ol = ObjsInCircle(.pos, sight, "BaseAnimal").GetObjList;

for(i=0;i<ol.count;i+=1)
	{
    if(ol[i].class=="Hen")
		{
        ol.Remove(ol[i]);
        i-=1;
		}
	}

if(ol.count == 0)
	ol.Add(Place("Eagle", .pos + Point(0, 50), .player));
else
	{
		u = ol[rand(ol.count)];
		ol = ObjsInSight(u, u.class).GetObjList;
		ol.Add(u);
	}
ol.SetPlayer(CurPlayer);
ol.SetCommand("move", .pos);
life = 1;

while (life > 0) {
	life = .Consume(price, 1000, true);
	ol.ClearDead;
	if (ol.count==0)
		break;
}
ol.SetPlayer(15);
.Erase;
