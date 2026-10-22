// void, Obj This

Unit this;
this = This.AsUnit();

while (!.Stop(1000));

if (.IsHeirOf("TWereWolf")) 
	.Mutate("THumanWolf");
else if (.IsHeirOf("THumanWolf")) 
 	.Mutate("TWereWolf");