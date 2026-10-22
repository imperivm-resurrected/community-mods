// void, Obj This

Building this;
int nConfig;

this = This.AsBuilding();
nConfig = 0;
if (EnvReadString(.settlement, "ChooseRepublicanRome") == "researched") nConfig = 1;
else if (EnvReadString(.settlement, "ChooseImperialRome") == "researched") nConfig = 2;
else if (EnvReadString(.settlement, "ChoosePunicRome") == "researched") nConfig = 3;
if (EnvReadString(.settlement, "BothRome") == "enabled") nConfig += 10;
if (EnvReadInt(.player, "ModeInverno") == 1) nConfig += 20;
if (EnvReadInt(.player, "ModeOldSchoolCostsV2") == 1) nConfig += 40;
if (EnvReadInt(this, "RomeCmdConfigured") == 1)
if (EnvReadInt(this, "RomeCmdConfig") == nConfig)
if (EnvReadInt(this, "RomeCmdPlayer") == .player) {
    if (nConfig % 10 == 0) Sleep(250);
    else Sleep(30000 + rand(10001));
    return;
}

// Le copie economiche Old school non appartengono alle sottofazioni delle
// altre modalita' e devono essere assenti, non mostrate come "Wrong civilization".
if (EnvReadInt(.player, "ModeOldSchoolCostsV2") != 1)
{
	.CmdDisable("Roman Archers Imp2 Cost");
	.CmdDisable("Roman Principle Imp2 Cost");
	.CmdDisable("Roman Horseman Imp2 Cost");
}

// Imperivm 2: "Roman Gladiator" e' un upgrade specifico di questa modalita'; fuori
// Imperivm 2 resta sempre nascosto (in Imperivm 2 lo gestisce MODE_IMPERIVM2_ROME.VS).
if (EnvReadInt(.player, "ModeInverno") != 1)
	.CmdDisable("Roman Gladiator");

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

// Edit by Riccardo "Highlander" Tedesco (Alias Ricky1996, Ricky96Highlander) and Alessandro Rossini (Alias Axaros)
// Upgrade Fucina nuove unita': Roman Miles / Toxotai (Repubblicana), Balearic Slinger / Tesserarius / Centurion (Antica)
