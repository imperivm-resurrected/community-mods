// void, Obj This

Building this;

this = This.AsBuilding();

if( (EnvReadString(.settlement, "ChooseRepublicanRome") == "researched") || (EnvReadString(.settlement, "ChooseImperialRome") == "researched") )
{
	if(EnvReadString(.settlement, "ChooseRepublicanRome") == "researched")
	{
		.CmdEnable("hireheroR");
		Sleep(50);
		.CmdEnable("RGladiator Shows");
		Sleep(50);
		.CmdEnable("Trionfo dell'Imperatore");
		Sleep(50);
		.CmdEnable("Recluta Imperatore");
		Sleep(50);
		.CmdEnable("Rome Training 1");
		Sleep(50);
		.CmdEnable("Rome Training 2");
		Sleep(50);
		.CmdEnable("Veteran Offence");
		Sleep(50);
		.CmdEnable("Veteran Defence");
		Sleep(50);
		.CmdEnable("Veteran Health");
		Sleep(50);
		
		.CmdDisable("hireheroRImperial");
		Sleep(50);
		.CmdDisable("RGladiator Shows2");
		Sleep(50);
		.CmdDisable("Standartization I");
		Sleep(50);
		.CmdDisable("Standartization II");
		Sleep(50);
		.CmdDisable("Flexibility");
		Sleep(50);
		.CmdDisable("Hire Liberati");
		Sleep(50);
		.CmdDisable("Liberati guild");
		Sleep(50);
		.CmdDisable("Military Academy");
		Sleep(50);
	}	//End if.
	else
	{
		//Arena Commands
		.CmdDisable("hireheroR");
		Sleep(50);
		.CmdDisable("RGladiator Shows");
		Sleep(50);
		.CmdDisable("Rome Training 1");
		Sleep(50);
		.CmdDisable("Rome Training 2");
		Sleep(50);
		.CmdDisable("Veteran Offence");
		Sleep(50);
		.CmdDisable("Veteran Defence");
		Sleep(50);
		.CmdDisable("Veteran Health");
		Sleep(50);
		
		.CmdEnable("hireheroRImperial");
		Sleep(50);
		.CmdEnable("RGladiator Shows2");
		Sleep(50);
		.CmdEnable("Trionfo dell'Imperatore");
		Sleep(50);
		.CmdEnable("Recluta Imperatore");
		Sleep(50);
		.CmdEnable("Standartization I");
		Sleep(50);
		.CmdEnable("Standartization II");
		Sleep(50);
		.CmdEnable("Flexibility");
		Sleep(50);
		.CmdEnable("Hire Liberati");
		Sleep(50);
		.CmdEnable("Liberati guild");
		Sleep(50);
		.CmdEnable("Military Academy");
		Sleep(50);
	}	//End else.
}	//End if.
else
{
	.CmdDisable("hireheroR");
	Sleep(50);
	.CmdDisable("RGladiator Shows");
	Sleep(50);
	.CmdDisable("Trionfo dell'Imperatore");
	Sleep(50);
	.CmdDisable("Recluta Imperatore");
	Sleep(50);
	.CmdDisable("Rome Training 1");
	Sleep(50);
	.CmdDisable("Rome Training 2");
	Sleep(50);
	.CmdDisable("Veteran Offence");
	Sleep(50);
	.CmdDisable("Veteran Defence");
	Sleep(50);
	.CmdDisable("Veteran Health");
	Sleep(50);
	.CmdDisable("hireheroRImperial");
	Sleep(50);	
	.CmdDisable("RGladiator Shows2");
	Sleep(50);
	.CmdDisable("Standartization I");
	Sleep(50);
	.CmdDisable("Standartization II");
	Sleep(50);
	.CmdDisable("Flexibility");
	Sleep(50);
	.CmdDisable("Hire Liberati");
	Sleep(50);
	.CmdDisable("Liberati guild");
	Sleep(50);
	.CmdDisable("Military Academy");
	Sleep(50);
}	//End else.

Sleep(1000);

// Edit by Riccardo "Highlander" Tedesco (Alias Ricky1996, Ricky96Highlander)