//bool, ObjList objs, str OUT reasonText
int i;

if (objs.count == 0) 
	return false;

if (EnvReadString(objs[0].player, "Licantropia2")!="researched")
  {	 
	reasonText = rollover(objs[0], true) + "\n<color 255 0 0>" + Translate(cmdparam);
	return false;
  }

for(i = 0; i < objs.count(); i += 1)
{
	if(!objs[i].IsHeirOf("TWereBear"))
	{
		return false;
	}
}
return true;