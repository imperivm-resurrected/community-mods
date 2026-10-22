// void, Obj This

Building this;
int nConfig;

this = This.AsBuilding();
nConfig = 0;
if (EnvReadString(.settlement, "ChooseRepublicanRome") == "researched") nConfig = 1;
else if (EnvReadString(.settlement, "ChooseImperialRome") == "researched") nConfig = 2;
else if (EnvReadString(.settlement, "ChoosePunicRome") == "researched") nConfig = 3;
if (EnvReadInt(this, "RomeCmdConfigured") == 1)
if (EnvReadInt(this, "RomeCmdConfig") == nConfig)
if (EnvReadInt(this, "RomeCmdPlayer") == .player) {
    if (nConfig % 10 == 0) Sleep(250);
    else Sleep(30000 + rand(10001));
    return;
}

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

EnvWriteInt(this, "RomeCmdConfig", nConfig);
EnvWriteInt(this, "RomeCmdPlayer", .player);
EnvWriteInt(this, "RomeCmdConfigured", 1);
if (nConfig % 10 == 0) Sleep(250);
else Sleep(30000 + rand(10001));
