// void, Obj This

int duration, it;
str s;

PlaySound("data/Sound Entities/StonehengeSpell.xml");

EnvWriteInt("/StonehengeGhost", 1);
duration = GetConst("StonehengeGhostTime")/1000;

for (it = duration; it > 0; it -= 1) {
	if (it%60 > 10) s=""; else s="0";
	ShowAnnouncement("ghost","Manto spettrale - "+(it/60)+":"+s+(it%60)+"s");
	Sleep(1000);
}
HideAnnouncement("ghost");
EnvWriteInt("/StonehengeGhost", 0);
