@before newunit.SetLevel(level);
//Olympic Games (Greek Mod 1.8): the research is the mod's own, so only its players reach this
{
	if (!newunit.IsHeirOf("BaseMage") && EnvReadString(.settlement,"Olympic Games")=="researched"){
		if(level<5){
			level=5;
		}
	}
}
