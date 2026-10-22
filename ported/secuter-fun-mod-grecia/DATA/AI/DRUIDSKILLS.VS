// void
// 0:Gaul, 1:RepublicanRoma, 2:Carthage, 3:Iberia, 4:Greece, 5:Britain, 6:Egypt, 7:Germany
StrArray res, cmd, con;
int id;

res[0]="Canto di guerra";
res[1]="Protezione di Nettuno";
res[2]="Disidratazione";
res[3]="Azzera difesa";
if (GetConst("GreekMod")) res[4]="Favore di Zeus";
else res[4]=res[1];
res[5]="Vento del Nord";
res[6]="Sciame di locuste";
res[7]="Saggezza degli antenati";

cmd[0]="buff_attack";
cmd[1]="buff_defence";
cmd[2]="drain_stamina";
cmd[3]="zero_defence";
if (GetConst("GreekMod")) cmd[4]="buff_balanced";
else cmd[4]=cmd[1];
cmd[5]="buff_speed";
cmd[6]="half_food";
cmd[7]="buff_level";

con[0]="BuffAttack";
con[1]="BuffDefence";
con[2]="DrainStamina";
con[3]="ZeroDefence";
if (GetConst("GreekMod")) con[4]="BuffBalanced";
else con[4]=con[1];
con[5]="BuffSpeed";
con[6]="NONE";
con[7]="BuffLevel";

Sleep(rand(1000) + 500);

id = AIGetPlayer();

while (true)
{
	ObjList ol;
	int i;
	
	Sleep(500);
		
	ol = ClassPlayerObjs(cBaseMage,id).GetObjList;
		
	for (i=0; i<ol.count; i+=1)
	{
		Druid this;

		this=ol[i].AsDruid;
		if (EnvReadString(.player, res[.race]) == "researched")
		if (.race==6 || EnvReadInt(.player, "Druid/" +con[.race]) !=1)
		{
			ObjList units;
			int j, al_c, en_c, size_a, size_e;

			units = ObjsInRange(this, cMilitary, 600).GetObjList;

			if(.race!=6)
			for (j=0; j<units.count; j+=1)
				if (.IsEnemy(units[j])) en_c+=1;
				else al_c+=1;
			else
			for (j=0; j<units.count; j+=1)
				if (.IsEnemy(units[j])) en_c+=units[j].AsUnit.food;
			
			if (.race==6) {
				if (en_c>1000)
				{
					.SetCommand(cmd[.race]);
					Sleep(.GetAnimDuration(18)+500);
					break;
				}
			}
			else {
				if (.race==2 || .race==3) {
					size_a = .GetSquad.Size *1/2;
					size_e = .GetSquad.Size;
				}
				else {
					size_a = .GetSquad.Size -1;
					size_e = .GetSquad.Size *3/4;
				}
				
				if (al_c>size_a && en_c>size_e)
					{
						.SetCommand(cmd[.race]);
						Sleep(.GetAnimDuration(18)+500);
						break;
					}
			}
		}
	}
}
