// void, Obj This

Building this, this2;
int i, j, k, l, m, n, c, r, Teuton = 4, player, exp_gain, n_Clock, n_Min, n_Sec;
ObjList things, tents, ol;
str name, secPad;
PlaySound("data/Sound Entities/StonehengeSpell.xml");

this2 = This.AsBuilding();
name = Translate("Teuton Uprising");
exp_gain = GetTime() / 60000;

DiplCeaseFire(13, 15, true);
DiplCeaseFire(15, 13, true);
DiplCeaseFire(13, 16, true);
DiplCeaseFire(16, 13, true);
AIStart(13, "CHAOTIC", 2);

n_Clock = 180;

for(r=0;r<=180;r+=1){
    
	n_Min = n_Clock / 60;
	n_Sec = n_Clock % 60;

	if (n_Sec < 10) {
		secPad = "0";
	} else {
		secPad = "";
	}

	ShowAnnouncement("teuton_count", Translatef("Teuton uprising - %s1:%s2%s3", n_Min, secPad, n_Sec) + "s");

	if ((n_Clock == 170) || (n_Clock == 110) || (n_Clock == 50)) {
		things = GetSettlements("TTent", 0);
		c = things.count();
		for (l = 0; l < c; l += 1) {
			things[l].SetPlayer(13);
		}

		tents = ClassPlayerObjs("TTent", 13).GetObjList();

		for (m = 0; m < tents.count; m = m + 1) {
			if (tents[m].AsBuilding().IsValid() && tents[m].AsBuilding().player == 13) {
				this = tents[m].AsBuilding();
				ol = this.settlement.Units.ObjClass("Unit");
				ol.SetPlayer(13);
				for (n = 1; n <= 1; n += 1) {
					Unit u1;
					u1 = Place("NHero1", .pos, .player);
					u1.SetFood(u1.maxfood);
					u1.SetFeeding(false);
					u1.SetExperience(exp_gain * 2);
					u1.AddItem("Battle Drums of Rage");
					u1.AsHero().SetSkill(hsLeadership , 10);
					u1.AsHero().SetSkill(hsEpicAttack , 10);
					u1.AsHero().SetSkill(hsEpicEndurance , 10);
					u1.AsHero().SetSkill(hsDefensiveCry , 10);
					u1.AsHero().SetSkill(hsBattleCry , 10);
					.settlement.ForceAddUnit(u1);
				}

				for (i = 1; i <= Teuton; i += 1) {
					Unit u2;
					u2 = Place("TTeutonArcher", .pos, .player);
					u2.SetFood(u2.maxfood);
					u2.SetFeeding(false);
					u2.SetExperience(exp_gain);
					u2.AddItem("Bear teeth amulet");
					u2.AddItem("Belt of might");
					u2.AddItem("Herb amulet of luck");
					.settlement.ForceAddUnit(u2);
				}

				for (j = 1; j <= Teuton; j += 1) {
					Unit u3;
					u3 = Place("TTeutonRider", .pos, .player);
					u3.SetFood(u3.maxfood);
					u3.SetFeeding(false);
					u3.SetExperience(exp_gain);
					u3.AddItem("Bear teeth amulet");
					u3.AddItem("Belt of might");
					u3.AddItem("Herb amulet of luck");
					.settlement.ForceAddUnit(u3);
				}

				for (k = 1; k <= Teuton; k += 1) {
					Unit u4;
					u4 = Place("TTeutonWolf", .pos, .player);
					u4.SetFood(u4.maxfood);
					u4.SetFeeding(false);
					u4.SetExperience(exp_gain);
					u4.AddItem("Bear teeth amulet");
					u4.AddItem("Belt of might");
					u4.AddItem("Herb amulet of luck");
					.settlement.ForceAddUnit(u4);
				}
			}	
		}
	}

	n_Clock = n_Clock-1;
	Sleep(1000);
	HideAnnouncement("teuton_count");
}

EnvWriteInt(this2, "TeutonDisasterCasted", 1);
EnvWriteInt(this2, "StonehengeStart", 0);