// void, Obj This, point pt

Druid this;
Sacrifice s;
int mist_range;

this = This.AsDruid();
if (!.IsValid() || .health<=.maxhealth/10) return;

mist_range = GetConst("MistRange");
while (!.Goto(pt, mist_range, 2000, false, 2500));

.PlayAnim(18, pt);
s = Place("Storymist_sacrifice", pt, .player).AsSacrifice();

if (!s.IsValid()) return;

.AddCommand(true, "help-sacrifice", s);
