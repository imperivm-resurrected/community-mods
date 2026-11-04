@before if (!qEnemies.IsEmpty() && olAll1.count==0 && olAll2.count==0 && olDefendersOut1.count == 0 && olDefendersOut2.count == 0 && .settlement.UnitsCount()==0)
		olDefendersOut3.ClearDead();		
		olDefendersOut4.ClearDead();
@replace if (!qEnemies.IsEmpty() && olAll1.count==0 && olAll2.count==0 && olDefendersOut1.count == 0 && olDefendersOut2.count == 0 && .settlement.UnitsCount()==0)
		olAll3.ClearDead();
		olAll4.ClearDead();
		if (!qEnemies.IsEmpty() && olAll1.count==0 && olAll2.count==0 && olAll3.count==0 && olAll4.count==0 && olDefendersOut1.count == 0 && olDefendersOut2.count == 0 && olDefendersOut3.count == 0  && olDefendersOut4.count == 0 && .settlement.UnitsCount()==0) 
@before // handle the capturing
		bNoMore3 = false;
        olDefendersOut3.ClearDead();
		while (olDefendersOut3.count < nDefendersOut3 && .settlement.UnitsCount() > 0 && !bNoMore3) 
		{
			point pos;
			Unit u;
			ObjList olSettUnits;
			
			olSettUnits = .settlement.Units();
			for (i=0; i<olSettUnits.count; i+=1)
	           {
				  if (olSettUnits[i].IsHeirOf(sDefenderCls3)&& olDefendersOut3.count < nDefendersOut3)		
					{
						u = olSettUnits[i];
						
						olDefendersOut3.Add(u);
						pos.Set(0, .range / 2);
						pos.Rot(rand(360));	p = pos + .pos; p.IntoRect(rc);	u.SetCommand("guardadvance", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						bNoMore3 = false;
						Sleep(200);						
						break;
					}
					bNoMore3 = true;
	           }
		}
		
		bNoMore4 = false;
        olDefendersOut4.ClearDead();
		while (olDefendersOut4.count < nDefendersOut4 && .settlement.UnitsCount() > 0 && !bNoMore4)
		{
			point pos;
			Unit u;
			ObjList olSettUnits;
			
			olSettUnits = .settlement.Units();
			for (i=0; i<olSettUnits.count; i+=1)
	           {
				  if (olSettUnits[i].IsHeirOf(sDefenderCls4)&& olDefendersOut4.count < nDefendersOut4)		
					{
						u = olSettUnits[i];
						
						olDefendersOut4.Add(u);
						pos.Set(0, .range / 2);
						pos.Rot(rand(360));	p = pos + .pos; p.IntoRect(rc);	u.SetCommand("guardadvance", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						pos.Rot(90);		p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
						bNoMore4 = false;
						Sleep(200);						
						break;
					}
					bNoMore4 = true;
	           }
		}
		
@before // get out more units if needed
		for (i = 0; i < olDefendersOut3.count; i += 1) 
		{
			Unit u;
			u = olDefendersOut3[i].AsUnit();
			if (.DistTo(u) > .range)  // move to closer random position
			{	
				point pos;
				pos = u.pos - .pos;
				pos.SetLen(.range / 2);
				p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
			}
		}
		for (i = 0; i < olDefendersOut4.count; i += 1) 
		{
			Unit u;
			u = olDefendersOut4[i].AsUnit();
			if (.DistTo(u) > .range)  // move to closer random position
			{	
				point pos;
				pos = u.pos - .pos;
				pos.SetLen(.range / 2);
				p = pos + .pos; p.IntoRect(rc);	u.SetCommand("move", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
				pos.Rot(90);	p = pos + .pos; p.IntoRect(rc);	u.AddCommand(false, "guardpatrol", p);
			}
		}
@before } else {
		for (i = 0; i < olDefendersOut3.count; i += 1)
			olDefendersOut3[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olDefendersOut3.Clear();
		
		for (i = 0; i < olDefendersOut4.count; i += 1)
			olDefendersOut4[i].SetCommand("enter_tent", this); //force add even though the tent does not allow units inside
		olDefendersOut4.Clear();
		
@before if (qEnemies.IsEmpty()) { // no threat around
	
	if (interval_3>0 &&(time - beg_time_3) >= interval_3 && (old_level_3+1)<=end_level_3) // set new level
    {
		Unit u;
		beg_time_3 = time;
		old_level_3+=1;
		for (i = olDefendersOut3.count() - 1; i >= 0; i -= 1) 
		{
			if (!olDefendersOut3[i].IsValid)
				continue;
			u = olDefendersOut3[i];
			if (u.inherentlevel<old_level_3)
				u.SetLevel(old_level_3);
		}
		for (i = olOurDefenders.count() - 1; i >= 0; i -= 1) 
		{
			if (!olOurDefenders[i].IsValid)
				continue;
			u = olOurDefenders[i];
			if (u.IsHeirOf(sDefenderCls3))
				if (u.inherentlevel<old_level_3)
					u.SetLevel(old_level_3);
		}
	}
	
	if (interval_4>0 &&(time - beg_time_4) >= interval_4 && (old_level_4+1)<=end_level_4) // set new level
    {
		Unit u;
		beg_time_4 = time;
		old_level_4+=1;
		for (i = olDefendersOut4.count() - 1; i >= 0; i -= 1) 
		{
			if (!olDefendersOut4[i].IsValid)
				continue;
			u = olDefendersOut4[i];
			if (u.inherentlevel<old_level_4)
				u.SetLevel(old_level_4);
		}
		for (i = olOurDefenders.count() - 1; i >= 0; i -= 1) 
		{
			if (!olOurDefenders[i].IsValid)
				continue;
			u = olOurDefenders[i];
			if (u.IsHeirOf(sDefenderCls4))
				if (u.inherentlevel<old_level_4)
					u.SetLevel(old_level_4);
		}
	}
@after olDefendersOut2.Remove(olDefendersOut2[i]);
	for (i = olDefendersOut3.count - 1; i >= 0; i -= 1)
		if (olDefendersOut3[i].AsUnit().GetCommanded())
			olDefendersOut3.Remove(olDefendersOut3[i]);
	for (i = olDefendersOut4.count - 1; i >= 0; i -= 1)
		if (olDefendersOut4[i].AsUnit().GetCommanded())
			olDefendersOut4.Remove(olDefendersOut4[i]);
@after olDefendersOut2.ClearDead();
	olDefendersOut3.ClearDead();
	olDefendersOut4.ClearDead();
@after olAll2.ClearDead();
	olAll3.ClearDead();
	olAll4.ClearDead();
@before while (1) {
if (sDefenderCls3!="")
	for (i=0;i<nDefendersMax3; i+=1)
	{
		Unit u3;
		u3 = Place(sDefenderCls3, .pos, .player);
		.settlement.ForceAddUnit(u3);
		u3.SetFood(20);
		u3.SetFeeding( false );
		u3.SetLevel(old_level_3);
		olAll3.Add(u3);
	}
if (sDefenderCls4!="")
	for (i=0;i<nDefendersMax4; i+=1)
	{
		Unit u4;
		u4 = Place(sDefenderCls4, .pos, .player);
		.settlement.ForceAddUnit(u4);
		u4.SetFood(20);
		u4.SetFeeding( false );
		u4.SetLevel(old_level_4);
		olAll4.Add(u4);
	}
@after beg_time_2 = beg_time_1;
beg_time_3 = beg_time_1;
beg_time_4 = beg_time_1;
@after interval_2 = 0;
  
if (end_level_3 != old_level_3)
  interval_3 = 3600000 / (end_level_3 - old_level_3);
else
  interval_3 = 0;
  
if (end_level_4 != old_level_4)
  interval_4 = 3600000 / (end_level_4 - old_level_4);
else
  interval_4 = 0;
@after old_level_2 = .GetStartLevel(2);
old_level_3 = StartLevel;
old_level_4 = StartLevel;
@after end_level_2 = .GetEndLevel(2);
end_level_3 = EndLevel;
end_level_4 = EndLevel;
@after nDefendersOut2 = .GetDefendersOut(2);
nDefendersOut3 = DefendersOut3[nRaceIdx];
nDefendersOut4 = DefendersOut4[nRaceIdx];
@after nDefendersMax2 = .GetDefendersMax(2);
nDefendersMax3 = DefendersMax3[nRaceIdx];
nDefendersMax4 = DefendersMax4[nRaceIdx];
@after sDefenderCls2 = .GetDefenderCls(2);
nRaceIdx = .race;
if (nRaceIdx < 0 || nRaceIdx > 7) nRaceIdx = 4;   // 4: Imperial Rome
sDefenderCls3 = DefenderCls3[nRaceIdx];
sDefenderCls4 = DefenderCls4[nRaceIdx];
@before this = This.AsBuilding();
// array con le unità extra
StrArray DefenderCls3, DefenderCls4;
int nRaceIdx;
IntArray DefendersMax3, DefendersMax4,  DefendersOut3, DefendersOut4;
int StartLevel = 8, EndLevel = 24;

// 0:Gaul, 1:RepublicanRoma, 2:Carthage, 3:Iberia, 4:ImperialRome, 5:Britain, 6:Egypt, 7:Germany
DefenderCls3[0] = "GArcher"; DefendersMax3[0] = 16; DefendersOut3[0] = 4;
DefenderCls3[1] = "RPrinciple"; DefendersMax3[1] = 6; DefendersOut3[1] = 4;
DefenderCls3[2] = "CBerberAssassin"; DefendersMax3[2] = 6; DefendersOut3[2] = 4;
DefenderCls3[3] = "IArcher"; DefendersMax3[3] = 12; DefendersOut3[3] = 4;
DefenderCls3[4] = ""; DefendersMax3[4] = 0; DefendersOut3[4] = 0;
DefenderCls3[5] = "BBowman"; DefendersMax3[5] = 8; DefendersOut3[5] = 4;
DefenderCls3[6] = "ESwordsman"; DefendersMax3[6] = 6; DefendersOut3[6] = 4;
DefenderCls3[7] = "TAxeman"; DefendersMax3[7] = 6; DefendersOut3[7] = 3;

DefenderCls4[0] = ""; DefendersMax4[0] = 0; DefendersOut4[0] = 0;
DefenderCls4[1] = ""; DefendersMax4[1] = 0; DefendersOut4[1] = 0;
DefenderCls4[2] = "CMaceman"; DefendersMax4[2] = 6; DefendersOut4[2] = 4;
DefenderCls4[3] = ""; DefendersMax4[3] = 0; DefendersOut4[3] = 0;
DefenderCls4[4] = ""; DefendersMax4[4] = 0; DefendersOut4[4] = 0;
DefenderCls4[5] = "BShieldBearer"; DefendersMax4[5] = 6; DefendersOut4[5] = 4;
DefenderCls4[6] = "EGuardian"; DefendersMax4[6] = 6; DefendersOut4[6] = 4;
DefenderCls4[7] = ""; DefendersMax4[7] = 0; DefendersOut4[7] = 0;

@replace str sDefenderCls1,sDefenderCls2;// defender classes
str sDefenderCls1,sDefenderCls2,sDefenderCls3,sDefenderCls4;// defender classes
@replace nDefendersOut2;	//how much units to keep outside if an enemy comes
	nDefendersOut2,	//how much units to keep outside if an enemy comes
	nDefendersOut3,	//how much units to keep outside if an enemy comes
	nDefendersOut4;	//how much units to keep outside if an enemy comes
@replace nDefendersMax2,	//how much units  from cls1  to spawn at max
	nDefendersMax2,	//how much units from cls2 to spawn at max
	nDefendersMax3,	//how much units from cls3 to spawn at max
	nDefendersMax4,	//how much units from cls4 to spawn at max
@replace bool bNoMore1, bNoMore2;
bool bNoMore1, bNoMore2, bNoMore3, bNoMore4;
@replace int beg_time_1,beg_time_2,time, interval_1, interval_2; //Set new level time
int beg_time_1,beg_time_2,beg_time_3,beg_time_4, time, interval_1,interval_2,interval_3,interval_4; //Set new level time
@replace int old_level_1,old_level_2, end_level_1, end_level_2;
int old_level_1,old_level_2,old_level_3,old_level_4, end_level_1,end_level_2,end_level_3,end_level_4;
@replace ObjList olAll1,olAll2, olDefendersOut1,olDefendersOut2, olOurDefenders;
ObjList olAll1,olAll2,olAll3,olAll4, olDefendersOut1,olDefendersOut2,olDefendersOut3,olDefendersOut4, olOurDefenders;
