//bool, ObjList objs, str OUT reasonText

int numbertotrain, maxnumber, curnmb, queued, build;
str class, group, dest, research, numparam,researchedfrom; 

Building this;


this = objs[0].AsBuilding;


dest = cmdparam;

numbertotrain = Str2Int(ParseStr(dest, dest));

numparam = ParseStr(dest, dest);
class = ParseStr(dest, dest);
group = ParseStr(dest, dest);
research = ParseStr(dest, dest);
researchedfrom = ParseStr(dest, dest);

build = EnvReadInt(this, "Build/"+class);

if( numparam == "elephant" ) {
	maxnumber = EnvReadInt(.player, "MaxElephants") + 1;
}
else if( numparam == "huntress" ) {
	maxnumber = EnvReadInt(.player, "MaxHuntresses");
}
else if( numparam == "axemen" ) {
	maxnumber = EnvReadInt(.player, "MaxAxemen");
}
else if( numparam == "teutonrider" ) {
	maxnumber = EnvReadInt(.player, "MaxTeutonRiders");
}
else if( numparam == "macemen" ) {
	maxnumber = EnvReadInt(.player, "MaxMacemen");
}
else if (numparam == "myrmidon"){
	maxnumber = EnvReadInt(.player, "MaxMyrmidons");
}
else if (numparam == "mountaineer") {
	maxnumber = Str2Int(EnvReadString(.player, "MaxMountaineers"));
	if (maxnumber == 0)
		maxnumber = 20;
}
else if (numparam == "mahout") {
	maxnumber = 20;
	researchedfrom = "";
}
else {
	maxnumber = Str2Int(numparam);
}
	 
if(EnvReadString(.settlement, research) != "researched" &&
   EnvReadString(.player, research) != "researched" )
{
	reasonText = rollover(this,class,false);
	reasonText = reasonText + "\n<color 255 0 0>";
	if (researchedfrom=="")
		reasonText = reasonText + Translatef("Requires %s1", research);
	else	
		reasonText = reasonText + Translatef("Requires %s1 from %s2", research, researchedfrom);
	return false;
}

queued = EnvReadInt(this, "QueuedBuild/"+class);
//curnmb = GetGroupSize("Player"+.player+group) + numbertotrain + build + queued;
curnmb = numbertotrain + Count(.player, class) + queued + build;

if (numparam=="teutonrider")
	curnmb = numbertotrain + Count(.player, "TTeutonRider") + Count(.player, "TTeutonArcher")+ queued + build;
if (numparam=="mahout")
	curnmb = 2 + EnvReadInt(.player, "MaxElephants");
 
if (curnmb > maxnumber)
{
	reasonText = rollover(this,class, false) + "<color 255 0 0>\n" + Translatef("You cannot have more than %s1", maxnumber);
	//reasonText = rollover(this, "No more available");
	return false;
}

if ((cmdcost_gold > .settlement.gold) || (cmdcost_food > .settlement.food) || (cmdcost_pop>0 && cmdcost_pop + GetConst("MinPopulation") > .settlement.population) )
{
	reasonText = rollover(this,class, false) + "\n" + Translatef("(you cannot have more than %s1, currently %s2)", maxnumber, curnmb-numbertotrain);
	if (cmdcost_gold > .settlement.gold)
		reasonText = reasonText + "<color 255 0 0>\n" + Translate("Not enough gold");
	if (cmdcost_food > .settlement.food)
		reasonText = reasonText + "<color 255 0 0>\n" + Translate("Not enough food");
	if (cmdcost_pop>0 && cmdcost_pop + GetConst("MinPopulation") > .settlement.population)
	{
		int nMinPop;
		nMinPop = GetConst("MinPopulation");
		reasonText = reasonText + "<color 255 0 0>\n" + Translatef("The current population is under the minimum of %s1 people",nMinPop);
	}
	
	return true;
}

reasonText = rollover(this,class, false) + "\n" + Translatef("(you cannot have more than %s1, currently %s2)", maxnumber,curnmb-numbertotrain);
return true;