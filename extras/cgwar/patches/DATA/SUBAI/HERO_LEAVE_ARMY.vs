@top
ObjList ol;
Unit u;
int i;
@before this.AsHero().DetachArmy();
// the bonuses of the CGWAR's relics end when the army leaves the hero: the army is detached here, so the units are still in the list
if (this.HasItem("Relic_of_a_ancient_battle") || this.HasItem("Reliquary_of_the_fallen") || this.HasItem("Ark_of_the_Damned"))
{
	ol = this.AsHero().army();
	this.AsHero().DetachArmy();
	for (i = 0; i < ol.count; i += 1)
	{
		u = ol[i].AsUnit();
		if (this.HasItem("Ark_of_the_Damned"))
			u.RemoveBonus(5,5,0,100,0);
		else
		{
			if (this.HasItem("Relic_of_a_ancient_battle"))
				u.RemoveBonus(5,0,0,25,0);
			if (this.HasItem("Reliquary_of_the_fallen"))
				u.RemoveBonus(0,5,0,25,0);
		}
	}
}
