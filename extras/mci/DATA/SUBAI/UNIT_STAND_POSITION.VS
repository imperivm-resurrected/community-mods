// void, Obj me

Unit  this, u;
point pt;
int   range;
bool  bSleeped;
bool modado;
int max;
str modo;

this = me.AsUnit();

	modado = (EnvReadInt(.player, "Modo/Lista") != 0);
	if(modado){
		int i;
		bool es=false;
		max = EnvReadInt(.player, "Modo/Lista");
		for(i=0;i<=max;i+=1)
			if(EnvReadObj(.player, "Modo/Unidad" + i) == this){
				es = true;
				break;
			}
		if(es)
			modo = EnvReadString(.player, "Modo/Unidad" + i + "Modo");
		else
			modado = false;
	}

if(.IsValid() == true && IsAIPlayer(.player) == true) // leave parry mode at new command (HD: AI only)
	.SetParryMode(false);

while( ! .Stop( 1000 ));
pt = .posRH;
range = 120;

while(.IsAlive)
{
	if (.CmdCount() > 1)
		break;
	if( .IsRanged )
	{
		u = .BestTargetInRange( pt, .range );
		while( u.IsAlive && .IsValidTarget( u ) && .IsVisible && modo != "pasivo")
		{
			bSleeped = false;
			while( .Attack( u ))
			{
				if( ! .IsVisible ) break;
				bSleeped = true;
			}
			if( ! bSleeped ) Sleep( 50 );
			u = .BestTargetInRange( pt, .range );
		}
	}
	else
	{
		u = .BestTargetInRange( pt, range );
		while( u.IsAlive && .IsValidTarget( u ) && .IsVisible && modo != "pasivo")
		{
			bSleeped = false;
			while( ! .GotoAttack( u, 1500, true, 15000))
			{
				bSleeped = true;
				u = .BestTargetInRange( pt, range );
				if( !u.IsAlive || ! .IsValidTarget( u )) break;
				if( !.IsVisible ) break;
			}
			if( u.IsAlive && .IsValidTarget( u ) && .IsVisible)
			{
				while( .Attack( u ))
				{
					if( ! .IsVisible ) break;
					bSleeped = true;
				}
			}
			if( ! bSleeped ) Sleep( 50 );
			u = .BestTargetInRange( pt, range );
		}
	}
	if( ! u.IsAlive && ( pt.x != .posRH.x || pt.y != .posRH.y ))
	{
		while( ! .Goto( pt, 0, 2000, false, -1 ));
	}
	else
		.Idle(1793);
}
