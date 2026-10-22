// void, Obj this

// "Call to arms" (ITavern, Iberia): arruola 50 contadini e li trasforma in
// Miliziani. Il comando esiste in TAVERN.XML con method="calltoarms" ed e'
// ATTIVO (<src obj="ITavern"/>), ma questo script mancava: il giocatore pagava
// 1000 oro + 50 popolazione, aspettava 20 secondi e non riceveva NULLA.
//
// I 50 contadini sono gia' scalati dal motore tramite costpop="50": qui si
// creano solo i Miliziani. Stesso schema di "Tribal Unification"
// (ONFINISH_RESEARCH.VS), che fa entrare 10 Highlander nella roccaforte.

Building bld;
Unit nu;
int i;

bld = .AsBuilding;

//I could use a simple formula to calculate this, but I decided not to.
if (gametime >= 20 && gametime < 40) {
	level = 4;
}
else if (gametime >= 40 && gametime < 60) {
	level = 8;
}
else if (gametime >= 60) {
	level = 12;
}
else {
	level = 1;
}

if (EnvReadInt(.AsBuilding.settlement, "items/Veteran Guild") == 1)
	give_veteran_guild = true;
else
	give_veteran_guild = false;

if (bld.IsValid)
	for (i = 0; i < 50; i += 1) {
		nu = Place("IMilitiaman", bld.pos, bld.player);
		if (nu.IsValid())
			bld.settlement.ForceAddUnit(nu);
	}
