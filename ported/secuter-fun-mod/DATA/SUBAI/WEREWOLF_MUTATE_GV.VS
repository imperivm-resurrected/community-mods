//bool, ObjList objs, str OUT reasonText
int i;

if (objs.count == 0) 
	return false;

for(i = 0; i < objs.count(); i += 1)
{
	if(!objs[i].IsHeirOf("TWereWolf") && !objs[i].IsHeirOf("TWereBear"))
	{
		return false;
	}
}
return true;