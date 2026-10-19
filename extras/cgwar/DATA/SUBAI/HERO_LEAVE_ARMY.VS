//void, Obj this

ObjList ol;
Unit u;
int i;

if(this.IsValid() == true && this.AsHero().army().count() >= 1)
	this.AsHero().army().SetCommand("idle");

if (this.HasItem("Relic_of_a_ancient_battle") || this.HasItem("Reliquary_of_the_fallen") || this.HasItem("Ark_of_the_Damned")){

	if (this.HasItem("Ark_of_the_Damned")){
		ol = this.AsHero().army();
		this.AsHero().DetachArmy();

		for(i = 0; i < ol.count; i += 1){
			u = ol[i].AsUnit();
			u.RemoveBonus(5,5,0,100,0);
		}
	}
	else
	{
		if (this.HasItem("Relic_of_a_ancient_battle")){
			ol = this.AsHero().army();
			this.AsHero().DetachArmy();

			for(i = 0; i < ol.count; i += 1){
				u = ol[i].AsUnit();
				u.RemoveBonus(5,0,0,25,0);
			}
		}

		if (this.HasItem("Reliquary_of_the_fallen")){
			ol = this.AsHero().army();
			this.AsHero().DetachArmy();

			for(i = 0; i < ol.count; i += 1){
				u = ol[i].AsUnit();
				u.RemoveBonus(0,5,0,25,0);
			}
		}
	}
}
else
	this.AsHero().DetachArmy();
