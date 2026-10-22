// bool, Obj me, Obj h

Unit this;
Hero hero;
int i;


hero = h.AsHero();
this = me.AsUnit();

if (!.IsValid()) return false;
if (me == h) return false;
if (!this.IsValid()) return false;
if (!hero.IsValid()) return false;
if (.IsEnemy(hero)) return false;
if (.HasFreedom) return false;
if (.IsHeirOf("Peasant")) return false;
//if (.AsHero().IsValid()) return false;
if (.hero == hero) return false;
if (.IsHeirOf("Peasant")) return false;
return true;
