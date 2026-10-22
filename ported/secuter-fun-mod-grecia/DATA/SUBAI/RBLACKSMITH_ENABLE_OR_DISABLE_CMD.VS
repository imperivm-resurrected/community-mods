// void, Obj This

Building this;

this = This.AsBuilding();

if( (EnvReadString(.settlement, "ChooseRepublicanRome") == "researched") || (EnvReadString(.settlement, "ChooseImperialRome") == "researched") )
{
	.CmdEnable("Roman Archers");
	Sleep(50);
	.CmdEnable("Roman Principle");
	Sleep(50);
	.CmdEnable("Roman Scout");
	Sleep(50);
	.CmdEnable("Strenghten Stronghold Defences I");
	Sleep(50);
	.CmdEnable("Strenghten Stronghold Defences II");
	Sleep(50);
	.CmdEnable("Strenghten Stronghold Defences III");
	Sleep(50);
	.CmdEnable("Strengthen Stronghold Gates");
	Sleep(50);

	if(EnvReadString(.settlement, "ChooseRepublicanRome") == "researched")
	{
		.CmdEnable("Roman Full Armor");
		Sleep(50);
		.CmdEnable("Roman Tribune Swords");
		Sleep(50);
		.CmdEnable("Roman Chariot Wheels");
		Sleep(50);
		.CmdEnable("Roman Chariot Training");
		Sleep(50);
		.CmdDisable("Roman Velit");
		Sleep(50);
		.CmdDisable("Roman Praetorian");
		Sleep(50);
	}	//End if.
	else
	{
		.CmdDisable("Roman Full Armor");
		Sleep(50);
		.CmdDisable("Roman Tribune Swords");
		Sleep(50);
		.CmdDisable("Roman Chariot Wheels");
		Sleep(50);
		.CmdDisable("Roman Chariot Training");
		Sleep(50);
		.CmdEnable("Roman Velit");
		Sleep(50);
		.CmdEnable("Roman Praetorian");
		Sleep(50);
	}	//End else.
}	//End if.
else
{
	.CmdDisable("Roman Archers");
	Sleep(50);
	.CmdDisable("Roman Principle");
	Sleep(50);
	.CmdDisable("Roman Scout");
	Sleep(50);
	.CmdDisable("Strenghten Stronghold Defences I");
	Sleep(50);
	.CmdDisable("Strenghten Stronghold Defences II");
	Sleep(50);
	.CmdDisable("Strenghten Stronghold Defences III");
	Sleep(50);
	.CmdDisable("Strengthen Stronghold Gates");
	Sleep(50);
	.CmdDisable("Roman Full Armor");
	Sleep(50);
	.CmdDisable("Roman Tribune Swords");
	Sleep(50);
	.CmdDisable("Roman Chariot Wheels");
	Sleep(50);
	.CmdDisable("Roman Chariot Training");
	Sleep(50);
	.CmdDisable("Roman Velit");
	Sleep(50);
	.CmdDisable("Roman Praetorian");
	Sleep(50);
}	//End else.

Sleep(1000);

// Edit by Riccardo "Highlander" Tedesco (Alias Ricky1996, Ricky96Highlander)