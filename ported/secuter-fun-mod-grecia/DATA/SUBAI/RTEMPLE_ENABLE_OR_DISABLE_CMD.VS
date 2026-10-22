// void, Obj This

Building this;

this = This.AsBuilding();

if( (EnvReadString(.settlement, "ChooseRepublicanRome") == "researched") || (EnvReadString(.settlement, "ChooseImperialRome") == "researched") )
{
	.CmdEnable("trainRPriest");
	Sleep(50);
	.CmdEnable("Altar of Jupiter");
	Sleep(50);
	.CmdEnable("Cloud of Plague");
	Sleep(50);
	.CmdEnable("Wrath of Jupiter");
	Sleep(50);
	.CmdEnable("God's Gift");
	Sleep(50);
	.CmdEnable("Protezione di Nettuno");
	Sleep(50);

}	//End if.
else
{
	.CmdDisable("trainRPriest");
	Sleep(50);
	.CmdDisable("Altar of Jupiter");
	Sleep(50);
	.CmdDisable("Cloud of Plague");
	Sleep(50);
	.CmdDisable("Wrath of Jupiter");
	Sleep(50);
	.CmdDisable("God's Gift");
	Sleep(50);
	.CmdDisable("Protezione di Nettuno");
	Sleep(50);
}	//End else.

Sleep(1000);

// Edit by Riccardo "Highlander" Tedesco (Alias Ricky1996, Ricky96Highlander)