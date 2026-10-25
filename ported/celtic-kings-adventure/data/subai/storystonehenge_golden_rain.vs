// void, Obj This

int duration;
int j,c,i,i_min,i_sec;
str s_sec;
Building this;
ObjList things;
Settlement settle;

this=This.AsBuilding;

if(!.IsValid())
	return;

duration=120;

PlaySound("data/Sound Entities/StonehengeSpell.xml");

for(i=duration;i>0;i-=1)
	{
	i_min=i/60;
	i_sec=i%60;

	if(i_sec<10)
		s_sec="0";
	else
		s_sec="";

	ShowAnnouncement("golden_rain",Translatef("Golden rain - %s1:%s2%s3s",i_min,s_sec,i_sec));
	
	things=GetSettlements("Building",0);
	c=things.count;
	for(j=0;j<c;j+=1)
		{
		settle=things[j].AsBuilding().settlement();

		if ((!settle.player==13) && (!settle.player==14) && (!settle.player==15) && (!settle.player==16))
			settle.SetGold(settle.gold + 50);

		if(j%30==0) 
			Sleep(10);
		}
	Sleep(1000);
	}

HideAnnouncement("golden_rain");
EnvWriteInt(this,"StonehengeStart",0);
