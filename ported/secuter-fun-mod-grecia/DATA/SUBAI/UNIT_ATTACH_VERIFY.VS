// bool, Obj me, Obj h
Unit this;
Hero hero;
int i;
int heroRome, unitRome;
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
// Editor/scenario maps allow mixed civilizations by default, including upgraded units.
// Strategy game scripts opt into their existing civilization restrictions.
// Scenario authors may restore those restrictions with EditorCivilizationLimits = 1.
if (EnvReadInt("StrategyCivilizationLimits") != 1 &&
    EnvReadInt("EditorCivilizationLimits") != 1) return true;


// Myrmidon (HMyrmidon_Javelin): riportato alla civilta' greca (caserma greca).
// Niente piu' caso speciale: il controllo di razza generico qui sotto lo vincola
// agli eroi greci (razza ImperialRome), come tutte le altre unita' greche.

// Unita escluse dal controllo razza (mercenari e unita di mappa).
// Elenco chiuso: ogni altra unita' resta vincolata alla razza del suo eroe.
// (2026-07-17: tolti CMaceman - la mazza cartaginese non deve piu' essere
// equipaggiabile dalle altre civilta' - e HHoplite.)
if (this.class != "TTeutonArcher" &&
    this.class != "TTeutonRider" &&
    this.class != "CHorseman" &&
    this.class != "CNumidianRider" &&
    // Il Tuareg riusa CCamelRider, la cui classe tecnica e' marcata Egypt
    // pur essendo reclutata dalla Cartagine Numida in Old School.
    this.class != "CCamelRider" &&
    this.class != "EHOPLITA" &&
    this.class != "CMERCENARIO")
{
    // No mix di civilta sotto lo stesso eroe
    if (GetClassRace(this.class) != hero.race) return false;

    // No mix tra le tre Rome: tutte usano la razza RepublicanRome, quindi
    // il controllo sopra non le distingue. La sotto-fazione dell'eroe si
    // ricava dal parent, quella dell'unita' dalla classe.
    // 1 = Punica (Antica), 2 = Repubblicana, 3 = Imperiale, 0 = neutro/condiviso
    heroRome = 0;
    if (hero.IsHeirOf("AncientRomanHero")) heroRome = 1;
    else if (hero.IsHeirOf("RepublicanRomanHero")) heroRome = 2;
    else if (hero.IsHeirOf("ImperialRomanHero")) heroRome = 3;

    if (heroRome != 0)
    {
        unitRome = 0;
        // Roma Punica (Antica): Miles (RMiles) e Cavaliere (RCavaliere) sono
        // esclusivi dell'Antica.
        if (this.class == "RTesserarius" ||
            this.class == "RTriarius" ||
            this.class == "RCenturion" || this.class == "RBalearSlinger" ||
            this.class == "RCavaliere" || this.class == "RMiles" ||
            this.class == "RExtrordina")
            unitRome = 1;
        // Roma Repubblicana: Scout (RScout) e Fante/Hastato (RAstatus) sono
        // esclusivi qui (oltre a Veterano=MPrinciple, Toxotai, Tribuno, Carro).
        else if (this.class == "RToxotai" || this.class == "MPrinciple" ||
            this.class == "RTribune" || this.class == "RChariot" ||
            this.class == "RScout" || this.class == "RAstatus")
            unitRome = 2;
        // Roma Imperiale (il Princeps = RPrinciple e' solo Imperiale)
        else if (this.class == "RHastatus" || this.class == "RVelit" ||
            this.class == "RHorseman" || this.class == "RPraetorian" ||
            this.class == "RArcher" || this.class == "RPrinciple")
            unitRome = 3;

        // Il Miles (RMiles) ora e' esclusivo di Roma Punica (Antica): la Roma
        // Repubblicana non lo addestra piu'. E' incluso nella lista Punica
        // sopra (unitRome = 1) e viene gestito dal controllo generico qui sotto.
        // Princeps (RPrinciple, solo Imperiale) e Veterano (MPrinciple, solo
        // Repubblicano) restano esclusivi via lo stesso controllo.
        if (unitRome != 0 && unitRome != heroRome)
            return false;
    }
}
return true;
