@top
Building kb;
Settlement kset;
@before if(EnvReadString(objs[0].AsBuilding.settlement, class) == "researched")
kb = objs[0].AsBuilding();
kset = kb.settlement;
if(EnvReadString(kb.player, "Fanaticism towards Ares") == "researched")
{
	if(EnvReadString(kset, "KAresGuard_A") != "researched")
		EnvWriteString(kset, "KAresGuard_A", "researched");
}
else
	if(EnvReadString(kset, "KAresGuard_A") == "researched")
		EnvWriteString(kset, "KAresGuard_A", "");

@after reasonText = strText + Translatef("Requires %s1 from Temple of Horus and Anubis",research);

if (class=="KAresGuard_A")
  reasonText = strText + Translate("Requires Fanaticism towards Ares");
