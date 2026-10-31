# asvrmod-vii: to check by hand

28 items. In each conflict the mod's side was used.

- `CURRENTLANG/MENUBACKGROUND.bmp`: 10240x768 over HD's 1920x1080: left out, HD's stays

## 2. DATA/COPYRIGHTS.TXT

```text
<<<<<<< HD
Haemimont Games, FX Interactive, ImperivmWorld (2021)
||||||| 1.40

Copyright(c) 2002-2004 Haemimont Games
=======

AsvrMod VII (2014-2017)
>>>>>>> mod
```

## 3. DATA/ITEMS.XML

```text
<<<<<<< HD
	  <bonus health="0" damage="0" armor_slash="4" armor_pierce="4" level="0" experience="0"/>
	</item>
	<item id="Rye spikes"
	      image="gameres/icons/items/Rye Spikes.bmp"
	      sound="data/sound entities/ItemUse.xml"
	      level="0"
	      usecount="1000"
	      name="Rye spikes"
	      description="Distributes up to 1000 food among nearby allies"
	      use_script="file://data/ItemScripts/rye spikes.vs"
	      important="yes">
||||||| 1.40
	  <bonus health="0" damage="0" armor_slash="4" armor_pierce="4" level="0" experience="0"/>
	</item>
	<item id="Rye spikes"
	      image="gameres/icons/items/Rye Spikes.bmp"
	      sound="data/sound entities/ItemUse.xml"
	      level="0"
	      usecount="200"
	      name="Rye spikes"
	      description="Distributes up to 200 food among nearby allies"
	      use_script="file://data/ItemScripts/rye spikes.vs"
	      important="yes">
=======

>>>>>>> mod
```

## 4. DATA/ITEMS.XML

```text
<<<<<<< HD
	      name="Finger of death"
	      description="Kills 3 nearby enemies. Does not affect heroes"
	      usecount="5"
	      use_script="file://data/ItemScripts/finger of death.vs"
	      important="yes">
||||||| 1.40
	      name="Finger of death"
	      description="Kills 3 nearby enemies. Does not affect heroes"
	      usecount="6"
	      use_script="file://data/ItemScripts/finger of death.vs"
	      important="yes">
=======
	      name="Valeroso"
	      description="La unidad no sufre miedo."
	      cursed="1"
	      important="no">
>>>>>>> mod
```

## 5. DATA/ITEMS.XML

```text
<<<<<<< HD
	      name="Gem of Wisdom"
	      description="Every attached warrior that dies has a 40% chance of giving experience to the hero"
	      attacheddie_script="file://data/ItemScripts/gem of wisdom.vs"
||||||| 1.40
	      name="Gem of Wisdom"
	      description="Every attached warrior that dies has a 50% chance of giving experience to the hero"
	      attacheddie_script="file://data/ItemScripts/gem of wisdom.vs"
=======
	      name="Anillo de la fuerza"
	      description="Aumenta en 15 el ataque"
	      important="no">
	  <bonus health="0" damage="15" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Eagle feather"
	      image="gameres/icons/items/anillo3.bmp"
	      sound=""
	      level="0"
	      name="Anillo de la vitalidad"
	      description="Aumenta en 100 la salud"
	      important="no">
	  <bonus health="100" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>	
	<item id="Anillo de la sabiduria"
	      image="gameres/icons/items/anillo4.bmp"
	      sound=""
	      level="0"
	      name="Anillo de la sabiduria"
	      description="Aumenta en 5 el nivel"
	      important="no">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="5" experience="0"/>
	</item>	
<!--   Epicos  -->
	<item id="Roca supurante"
	      image="gameres/icons/items/POISON STONE.bmp"
	      sound=""
	      level="10"
	      name="Roca supurante"
	      description="Si el portador muere se de desatara una terrible plaga."
	      usecount="0"
	      die_script="file://data/ItemScripts/RocaSupurante.vs"
	      important="no">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Mascara de los sacrificios"
	      image="gameres/icons/items/Mascara de los sacrificios.bmp"
	      sound=""
	      level="10"
	      name="Mascara de los sacrificios"
	      description="El portador recupera una pequeña cantidad de vida cada vez que una de sus unidades asignadas mueren."
	      attacheddie_script="file://data/ItemScripts/mascarasacrificios.vs"
	      usecount="0"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Impetu faraonico"
	      image="gameres/icons/items/coraza egipcia.bmp"
	      sound=""
	      level="10"
	      name="Impetu faraonico"
	      description="Aumenta en un 25% la velocidad de ataque y de carga."
	      usecount="0"
	      equip_script="file://data/ItemScripts/impetu.vs"
	      remove_script="file://data/ItemScripts/impetu2.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Hoplon de las embestidas"
	      image="gameres/icons/items/Escudo Toro.bmp"
	      sound=""
	      level="10"
	      name="Hoplon de las embestidas"
	      description="Otorga la habilidad carga al heroe que lo porte."
	      usecount="0"
	      equip_script="file://data/ItemScripts/hoplon.vs"
	      remove_script="file://data/ItemScripts/hoplon2.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Hombreras punzantes"
	      image="gameres/icons/items/hombreras.bmp"
	      sound=""
	      level="10"
	      name="Hombreras punzantes"
	      description="Otorga la habilidad dano reflejado al heroe que lo porte."
	      usecount="0"
	      equip_script="file://data/ItemScripts/hombreras.vs"
	      remove_script="file://data/ItemScripts/hombreras2.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="King's Belt"
	      image="gameres/icons/items/amuleto.bmp"
	      sound=""
	      level="10"
	      name="Amuleto ancestral"
	      description="Aumenta en 100 la vida, en 15 el ataque, en 10 la defensa y en 5 el nivel de su portador."
	      important="yes">
	  <bonus health="100" damage="15" armor_slash="10" armor_pierce="10" level="5"/>
	</item>
	<item id="Daga de la manticora"
	      image="gameres/icons/items/daga.bmp"
	      name="Daga de la manticora"
	      description="Al ser usada, envenena, deja sin energia y causa dano al objetivo ignorando su defensa."
	      level="10"
	      object_script="file://data/ItemScripts/Daga de la manticora.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Pocion extraordinaria"
	      image="gameres/icons/items/pocion7.bmp"
	      sound="data/sound entities/ItemUse.xml"
	      name="Pocion extraordinaria"
	      description="Al usarse aumenta permanentemente el nivel, el ataque y la defensa de su portador."
	      level="10"
	      usecount="1"
	      use_script="file://data/ItemScripts/pocion extraordinaria.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Yelmo ceremonial"
	      image="gameres/icons/items/Yelmoceremonial.bmp"
	      sound=""
	      level="10"
	      name="Yelmo ceremonial"
	      description="El portador adquirira el rango [Leyenda] tras matar al proximo enemigo, despues desaparecera."
	      cursed="0"
	      kill_script="file://data/ItemScripts/yelmoceremonial.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Hoz de oro de Litha"
	      image="gameres/icons/items/hoz de oro.bmp"
	      sound=""
	      level="10"
	      name="Hoz de oro de Litha"
	      description="Si su portador es un sacerdote, aumenta en 20 su nivel."
	      cursed="0"
	      equip_script="file://data/ItemScripts/hozdeoro.vs"
	      remove_script="file://data/ItemScripts/hozdeoro2.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Secreto del bosque"
	      image="gameres/icons/items/secreto.bmp"
	      sound="data/sound entities/ItemUse_ClinkAndSpell.xml"
	      level="10"
	      name="Secreto del bosque"
	      description="Al usarse invoca un poderoso oso guardian."
	      usecount="1"
	      use_script="file://data/ItemScripts/secreto.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Conjuro oscuro"
	      image="gameres/icons/items/scroll of death.bmp"
	      sound="data/sound entities/ItemUse_DarkChant.xml"
	      level="10"
	      name="Conjuro oscuro"
	      description="Al usarse invoca una aterradora momia."
	      usecount="1"
	      use_script="file://data/ItemScripts/conjuro.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Pluma de fenix"
	      image="gameres/icons/items/plumafenix.bmp"
	      sound="data/sound entities/ItemUse_WaterAura.xml"
	      level="10"
	      name="Pluma de Fenix"
	      description="Devuelve a la vida a su portador, despues desaparece"
	      usecount="0"
		  die_script="file://data/ItemScripts/plumadefenix.vs"  
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Ojo de las grayas"
	      image="gameres/icons/items/Ojo de las grayas.bmp"
	      sound=""
	      level="10"
	      name="Ojo de las grayas"
	      description="Aumenta el campo de vision de su portador y le permite revelar las unidades enemigas ocultas."
	      usecount="0"
	      equip_script="file://data/ItemScripts/ojograyas.vs"
	      remove_script="file://data/ItemScripts/ojograyas2.vs"
		  cursed="0"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Bubo el buho mecanico"
	      image="gameres/icons/items/buhomecanico.bmp"
	      sound="data/sound entities/ItemUse.xml"
	      level="10"
	      name="Bubo, el buho mecanico"
	      description="Al usarse permite usar a Bubo para explorar, cuando su energia se acabe deberas esperar a que se recargue."
	      usecount="100"
	      equip_script="file://data/ItemScripts/bubo2.vs"
	      use_script="file://data/ItemScripts/bubo.vs"
	      important="yes">
	  <bonus health="0" damage="0" damage_percent="0" armor_slash="0" armor_pierce="0" armor_slash_percent="0"  armor_pierce_percent="0" level="0" experience="0"/>
	</item>
	<item id="Amuleto de los heroes caidos"
	      image="gameres/icons/items/skull2.bmp"
	      sound=""
	      level="10"
	      name="Amuleto de los heroes caidos"
	      description="Las unidades asignadas al portador duplican los puntos de rango que ganan en combate."
	      usecount="0"
	      important="yes">
	  <bonus health="0" armor_slash="0" armor_pierce="0" level="0"/>
	</item>
	<item id="Odre del agua inagotable"
	      image="gameres/icons/items/WINE SKIN 01.bmp"
	      sound="data/sound entities/ItemUse.xml"
	      name="Odre del agua inagotable"
	      description="Se llena constantemente de agua, pudiendo distribuir hasta 1000 puntos de salud entre las unidades aliadas cercanas cada vez que se usa."
	      level="10"
	      usecount="1000"
	      equip_script="file://data/ItemScripts/bota.vs"
	      use_script="file://data/ItemScripts/bota2.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Colgante estelar"
	      image="gameres/icons/items/Colgante estelar.bmp"
	      name="Colgante estelar"
	      description="Permite a su portador teletransportarse instantaneamente a cualquier punto del mapa. Tras cada uso debe esperarse a que se recargue su poder."
	      level="10"
	      usecount="100"
	      location_script="file://data/ItemScripts/Colgante estelar.vs"
	      equip_script="file://data/ItemScripts/Colgante estelar2.vs"
	      important="yes">
	  <bonus health="0" damage="0" armor_slash="0" armor_pierce="0" level="0" experience="0"/>
	</item>
	<item id="Golden Ankh"
	      image="gameres/icons/items/golden ankh.bmp"
	      sound=""
	      level="10"
	      name="Ankh de oro"
		description="Aumenta en 500 la salud de su portador. \n[Ankh Sagrados]: Si se posee tambien el Ankh de plata y el Ankh de cobre, puede formar el Talisman de los tres ankhs que mejora un 50% los beneficios de los tres ankh."
	      equip_script="file://data/ItemScripts/ankh.vs"
	      important="yes"
	      cursed="0">
	  <bonus health="500"/>
	</item>
	<item id="Ankh de plata"
	      image="gameres/icons/items/silver ankh.bmp"
	      sound=""
	      level="10"
	      name="Ankh de plata"
	      description="Aumenta en 10 el nivel de su portador. \n[Ankh Sagrados]: Si se posee tambien el Ankh de oro y el Ankh de cobre, puede formar el Talisman de los tres ankhs que mejora un 50% los beneficios de los tres ankh."
	      equip_script="file://data/ItemScripts/ankh.vs"
	      important="yes"
	      cursed="0">
	  <bonus level="10"/>
	</item>
	<item id="Ankh de cobre"
	      image="gameres/icons/items/ankh cobre.bmp"
	      sound=""
	      level="10"
	      name="Ankh de cobre"
	      description="Aumenta en 20 el ataque y en 10 la defensa de su portador. \n[Ankh Sagrados]: Si se posee tambien el Ankh de plata y el Ankh de oro, puede formar el Talisman de los tres ankhs que mejora un 50% los beneficios de los tres ankh."
	      equip_script="file://data/ItemScripts/ankh.vs"
>>>>>>> mod
```

## 6. DATA/AI/GETTACTICSCRIPT.VS

```text
<<<<<<< HD
		if (rnd<100)	
			return TS_GaulTactic;
||||||| 1.40
		if (rnd<33)	
			return TS_GaulTactic;
		if (rnd<66)	
			return TS_GaulTactic2;
=======
		//if (rnd<33)	
			//return TS_GaulTactic;
		//if (rnd<66)	
			return TS_GaulTactic2;
>>>>>>> mod
```

## 7. DATA/AI/GETTACTICSCRIPT.VS

```text
<<<<<<< HD
		if (rnd<33)	
			return TS_MRomeTactic;		
		if (rnd<66)	
			return TS_MRomeTactic;
||||||| 1.40
		if (rnd<33)	
			return TS_MRomeTactic;		
		if (rnd<66)	
			return TS_MRomeTactic2;
=======
		//if (rnd<33)	
			//return TS_MRomeTactic;		
		//if (rnd<66)	
			return TS_MRomeTactic2;
>>>>>>> mod
```

## 8. DATA/CLASSES/BASERUINS.SC.XML

```text
<<<<<<< HD
	<properties minlevel="4"/>
	<properties levelperitem="4"/>
	<properties itemtype="Elephant Tusk"/>
	<properties itemtype="Boar teeth"/>
	<properties itemtype="Horn of victory"/>
	<properties itemtype="Ash of druid heart"/>
	<properties itemtype="Finger of death"/>
	<properties itemtype="Fur gloves of health"/>
	<properties itemtype="Concentration stone"/>
	<properties itemtype="Amulet of Triumph"/>
	<properties itemtype="Golden Ankh"/>
	<properties itemtype="Scroll of Death"/>
	<properties itemtype="Gem of Wisdom"/>
	<properties itemtype="Ring of Power"/>
	<properties icon="gameres/icons/Oracul.bmp"/>
	<properties description="Allows heroes of the specified level to enter and obtain the item inside. Upon exiting the hero is at 50% of his full health"/>
||||||| 1.40
	<properties minlevel="4"/>
	<properties levelperitem="4"/>
	<properties itemtype="Elephant Tusk"/>
	<properties itemtype="Boar teeth"/>
	<properties itemtype="Horn of victory"/>
	<properties itemtype="Ash of druid heart"/>
	<properties itemtype="Finger of death"/>
	<properties itemtype="Fur gloves of health"/>
	<properties itemtype="Concentration stone"/>
	<properties itemtype="Amulet of Triumph"/>
	<properties itemtype="Golden Ankh"/>
	<properties itemtype="Scroll of Death"/>
	<properties itemtype="Gem of Wisdom"/>
	<properties itemtype="Ring of Power"/>
	<properties icon="gameres/icons/Oracul.bmp"/>
	<properties description="Allows heroes of the specified level to enter and obtain the item inside. Upon exiting the hero is at 10% of his full health"/>
=======
	<properties minlevel="5"/>
	<properties levelperitem="5"/>
	<properties description="Allows heroes of the specified level to enter and obtain the item inside. Upon exiting the hero is at 10% of his full health"/>
>>>>>>> mod
```

## 9. DATA/CLASSES/BRITONHERO.SC.XML

```text
<<<<<<< HD
	<properties HeroSkills="Charge, Leadership, Assault, Concealment, Recovery"/>
	<properties projectile_class="Arrow"/>
	<properties building_projectile_class="Fire_Arrow"/>
	<properties help="/contents/units/BHero"/>
	<sounds command="data/sound entities/VoiceBHero.xml"/>
	<sounds attack="UnitArrowFight"/>
	<value1
		icon="gameres/infobar/common/piercing ico.bmp"
		script="return .AsUnit.damage + ' | ' +.AsUnit.range;"
		help="/contents/stats/rangedattack"
		rollover="Ataque | Alcance"/>
||||||| 1.40
	<properties HeroSkills="Charge, Leadership, Assault, Epic armor, Epic attack"/>
	<properties projectile_class="Arrow"/>
	<properties building_projectile_class="Fire_Arrow"/>
	<properties help="/contents/units/BHero"/>
	<sounds command="data/sound entities/VoiceBHero.xml"/>
	<sounds attack="UnitArrowFight"/>
	<value1
		icon="gameres/infobar/common/piercing ico.bmp"
		script="return .AsUnit.damage;"
		help="/contents/stats/rangedattack"
		rollover="Ranged damage"/>
=======
	<properties max_food="25"/>
	<properties HeroSkills="Charge, Scout, Assault, Quick March, Epic attack"/>
>>>>>>> mod
```

## 10. DATA/CLASSES/CNUMIDIANRIDER.SC.XML

```text
<<<<<<< HD
	<method sig="ondie" vs="data/subai/cmercenary_ondie.vs"/>
    <behavior script="data/subai/keensight_observe.vs"/>
||||||| 1.40
	<method sig="ondie" vs="data/subai/cmercenary_ondie.vs"/>
	<behavior script="data/subai/keensight_observe.vs"/>
=======
	<behavior script="data/subai/Rastreo.vs"/>
	<behavior script="data/subai/keensight_observe.vs"/>
>>>>>>> mod
```

## 11. DATA/CLASSES/IMOUNTAINEER.SC.XML

```text
<<<<<<< HD
    <behavior script="data/subai/sneak_behavior.vs"/>
||||||| 1.40
	<behavior script="data/subai/sneak_behavior.vs"/>
=======
	<behavior script="data/subai/Emboscada.vs"/>
	<behavior script="data/subai/Supervivencia.vs"/>
	<behavior script="data/subai/sneak_behavior.vs"/>
>>>>>>> mod
```

## 12. DATA/CLASSES/THUNTRESS.SC.XML

```text
<<<<<<< HD
    <behavior script="data/subai/sneak_behavior.vs"/>
||||||| 1.40
	<behavior script="data/subai/sneak_behavior.vs"/>
=======
	<behavior script="data/subai/Emboscada.vs"/>
	<behavior script="data/subai/sneak_behavior.vs"/>
>>>>>>> mod
```

## 13. DATA/CLASSES/TOUTPOST.SC.XML

```text
<<<<<<< HD
	<method sig="goutpost_sellfood" vs="data/subai/goutpost_sellfood.vs"/>
    <method sig="goutpost_sellgold" vs="data/subai/goutpost_sellgold.vs"/>
||||||| 1.40
	<method sig="goutpost_sellfood" vs="data/subai/goutpost_sellfood.vs"/>
=======
	<method sig="toutpost_sellgold" vs="data/subai/toutpost_sellgold.vs"/>
>>>>>>> mod
```

## 14. DATA/COMMANDS/ARENA.XML

```text
<<<<<<< HD
	description="All warriors above level 3 receive a Noble Defense artifact (+4 armor) at their first kill"
||||||| 1.40
	description="All warriors above level 12 receive a Noble Defense artifact (+4 armor) at their first kill"
=======
	description="Tras derrotar al primer enemigo, los guerreros con nivel superior a 12 reciben el Favor de Dagda que aumenta su defensa en 4 y su salud en 20 puntos"
	method="research"
	researchcommand="yes"
	param="ReqSet, Culto a Morrigan, default, NamePlr, Noble Defence, default">
	<src obj="BMorrigansMonument"/>
</cmd>
<cmd name="Hermandad del norte" priority="10"
	queueicon="gameres/icons/upgrades/hermandad2.bmp"
	key="b"
	button="upgrades/hermandad2.bmp"
	researchcommand="yes"
	groupverifier="data/subai/verify_research.vs"
	costgold = "4000"
	costfood = "0"
	execdelay = "40000"
	rollover="Hermandad del norte"
	description="Permite reclutar jinetes normandos en el cuartel"
>>>>>>> mod
```

## 15. DATA/COMMANDS/BLACKSMITH.XML

```text
<<<<<<< HD
	costgold = "500"
||||||| 1.40
	costgold = "600"
=======
	costgold = "1500"
	costfood = "0"
	execdelay = "6000"
	rollover="Talisman de Sobek"
	description="Da a hasta 50 guerreros cercanos al foro un talisman de Sobek que aumenta en 50 su salud."
	method="getcharm"
	param="Talisman de Sobek" >
	<src obj="EBlacksmith"/>
</cmd>
<cmd name="Charm of Isis" priority="1"
	queueicon="gameres/icons/upgrades/charm of neith.bmp"
	key="i"
	button="research/charm of neith.bmp"
	researchcommand="yes"
	groupverifier="data/subai/eblacksmith_charms_verify.vs"
	costgold = "1500"
>>>>>>> mod
```

## 16. DATA/COMMANDS/UNIT.XML

```text
<<<<<<< HD
	<nsrc obj="BVikingLord"/>
	<nsrc obj="CWarElephant"/>
	<nsrc obj="EChariot"/>
	<nsrc obj="GTridentWarrior"/>
	<nsrc obj="IMountaineer"/>
</cmd>
<cmd name="reveal" priority="8"
	button="Actions/reveal.bmp"
	groupverifier="data/subai/unit_reveals_verify.vs"
	voidgroupdispatch="1"
	groupdispatch="data/subai/unit_reveals.vs"
	key="q"
	rollover="Reveal"
	description="Show this unit if hidden"
>
	<src obj="Unit" sticky="yes"/>
||||||| 1.40
	<nsrc obj="BVikingLord"/>
	<nsrc obj="CWarElephant"/>
	<nsrc obj="EChariot"/>
	<nsrc obj="GTridentWarrior"/>
	<nsrc obj="IMountaineer"/>
	<nsrc obj="RChariot"/>
	<nsrc obj="RLiberatus"/>
=======

>>>>>>> mod
```

## 17. DATA/COMMANDS/UNIT.XML

```text
<<<<<<< HD
<cmd name="to_teuton_rider" priority="13"
	button="actions/train TTeutonRider.bmp"
||||||| 1.40
-->
<cmd name="to_teuton_rider" priority="13"
	button="actions/train TTeutonRider.bmp"
=======
-->
<cmd name="to_rprinciple" priority="13"
	button="actions/TRAIN RPRINCIPLE.bmp"
	key="x"
	voidgroupdispatch="1"
	groupverifier="data/subai/RHASTATUS_MUTATE_GV.vs"
	groupdispatch="data/subai/ASCENSOSI_MUTATE_GD.vs"
	rollover="Asciende a princep (desciende un rango)"
	param="Requiere Ascensos I y que el legionario tenga al menos rango [Veterano]">
	<src obj="RHastatus"/>
</cmd>
<cmd name="to_rpraetorian" priority="13"
	button="actions/TRAIN RPRAETORIAN.bmp"
	key="x"
	voidgroupdispatch="1"
	groupverifier="data/subai/RPRINCIPLE_MUTATE_GV.vs"
	groupdispatch="data/subai/ASCENSOSII_MUTATE_GD.vs"
	rollover="Ascender a pretoriano (desciende dos rangos)"
	param="Requiere Ascensos II y que el princep tenga al menos el rango [Elite]">
	<src obj="RPrinciple"/>
</cmd>
<cmd name="to_rliberatus" priority="13"
	button="actions/hire RLiberati.bmp"
>>>>>>> mod
```

## 18. DATA/COMMANDS/VILLAGE.XML

```text
<<<<<<< HD
<!--
<cmd name="callIScout" priority="4"
	button="actions/train IScout.bmp"
	queueicon="gameres/icons/IScout.bmp"
	groupverifier="data/subai/verify_scout_train.vs"
	transpicon="1"
	traincommand="yes"
||||||| 1.40
<cmd name="goutpost_sellfood" priority="1"
	button="states/sell food.bmp"
	immediate="yes"
	traincommand="no"
	method="goutpost_sellfood"
	param="yes"
	groupverifier="data/subai/group_goutpost_sell_food_verifiy.vs"
	key="s"
	rollover="Sell food"
	description="Slowly exchanges stored food for gold">
	<src obj="GOutpost"/>
	<src obj="TOutpost"/>
</cmd>
<cmd name="goutpost_no_sellfood" priority="1"
	button="states/Stop Selling Food.bmp"
	immediate="yes"
	traincommand="no"
	method="goutpost_sellfood"
	param="no"
	groupverifier="data/subai/group_goutpost_no_sell_food_verifiy.vs"
=======
<cmd name="goutpost_sellfood" priority="1"
	button="states/sell food.bmp"
	immediate="yes"
	traincommand="no"
	method="goutpost_sellfood"
	param="yes"
	groupverifier="data/subai/group_goutpost_sell_food_verifiy.vs"
	key="s"
	rollover="Sell food"
	description="Slowly exchanges stored food for gold">
	<src obj="GOutpost"/>
</cmd>
<cmd name="goutpost_no_sellfood" priority="1"
	button="states/Stop Selling Food.bmp"
	immediate="yes"
	traincommand="no"
	method="goutpost_sellfood"
	param="no"
	groupverifier="data/subai/group_goutpost_no_sell_food_verifiy.vs"
>>>>>>> mod
```

## 19. DATA/COMMANDS/VILLAGE.XML

```text
<<<<<<< HD
	costgold = "0"
	costfood = "0"
	costpop = "5"
	execdelay = "1"
	method = "trainIScout"
	rollover="Call scout"
	description="Call 1 scout"
	sclass="IScout">
	<src obj="IVillage"/>
||||||| 1.40
	rollover="Stop selling food">
	<src obj="GOutpost"/>
	<src obj="TOutpost"/>
=======
	rollover="Stop selling food">
	<src obj="GOutpost"/>
</cmd>
<cmd name="toutpost_sellgold" priority="1"
	button="states/sell gold.bmp"
	immediate="yes"
	traincommand="no"
	method="toutpost_sellgold"
	param="yes"
	groupverifier="data/subai/group_toutpost_sell_gold_verifiy.vs"
	key="s"
	rollover="Cambiar oro"
	description="Poco a poco cambia el oro por viveres">
	<src obj="TOutpost"/>
</cmd>
<cmd name="toutpost_no_sellgold" priority="1"
	button="states/Stop Selling Gold.bmp"
	immediate="yes"
	traincommand="no"
	method="toutpost_sellgold"
	param="no"
	groupverifier="data/subai/group_toutpost_no_sell_gold_verifiy.vs"
	key="s"
	rollover="Parar de cambiar oro">
	<src obj="TOutpost"/>
>>>>>>> mod
```

## 20. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
int min_resource, refresh, food_sales, gold_sales, food_income, required_gold, gold_income, reserved_food;
||||||| 1.40
int min_resource, refresh, food_sales, food_income, required_gold, gold_income, reserved_food;
=======
int min_resource, refresh, food_sales, food_income, required_gold, required_food, gold_income, reserved_food, food_income2;
>>>>>>> mod
```

## 21. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
bool bProduceGold, bSellFood, bSellGold, bWagon;
||||||| 1.40
bool bProduceGold, bSellFood, bWagon;
=======
bool bProduceGold, bProduceFood, bSellFood, bSellGold, bWagon;
>>>>>>> mod
```

## 22. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
    
    // food_sales = gold_sales = 20
    // food_income = 10
    
	if (!bProduceGold && bSellFood && .food > food_sales) {
||||||| 1.40
	// gaul outpost behaviour
	if (!bProduceGold && bSellFood && .food > food_sales) {
=======
	// gaul outpost behaviour
	if (!bProduceGold && !bProduceFood && bSellFood && .food > food_sales) {
>>>>>>> mod
```

## 23. DATA/SUBAI/OUTPOST_IDLE.VS

```text
<<<<<<< HD
	if (.gold > min_resource && !bSellGold) {
||||||| 1.40
	if (.gold > min_resource) {
=======
	if (.food > min_resource) {
		int food;
		food = 1000;
		if (bProduceFood && .food > required_food && .food - required_food < 1000)
			food = .food - required_food;
		if (food > min_resource) {
			wagon = .CreateMuleFood(food);
			wagon.SetCommand("unload", .supplied.GetCentralBuilding());
			bWagon = true;
		}
	}

	bWagon = false;
	if (.gold > min_resource) {
>>>>>>> mod
```

## 24. DATA/SUBAI/RUIN_BEHAVIOR.VS

```text
<<<<<<< HD
				if (hero.health > hero.maxhealth * 50 / 100)
					hero.Damage(hero.health - hero.maxhealth * 50 / 100);
				if(hero.CmdCount == 1)
||||||| 1.40
				if (hero.health > hero.maxhealth * 20 / 100)
					hero.Damage(hero.health - hero.maxhealth * 20 / 100);
				if(hero.CmdCount == 1)
=======
				if (hero.health > hero.maxhealth * 20 / 100)
					hero.Damage(hero.health - hero.maxhealth * 20 / 100);
				if ((hero.CmdCount == 1) && (.IsHeirOf("Ruins1")))
>>>>>>> mod
```

## 25. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
	olAll2.ClearDead();
    
    if (bIsIndependent){
        while (nTimeFromLastSpawn > nUnitSpawnRate * nGroupSpawn && bCanSpawn) 
||||||| 1.40
	olAll2.ClearDead();
	while (nTimeFromLastSpawn > nUnitSpawnRate * nGroupSpawn && bCanSpawn) 
	{
		int nSpawn;
		nSpawn = 0;
		nTimeFromLastSpawn -= nUnitSpawnRate * nGroupSpawn;
		
        while (nSpawn<nGroupSpawn && bCanSpawn)
=======
	while (nTimeFromLastSpawn > nUnitSpawnRate * nGroupSpawn && bCanSpawn) 
	{
		int nSpawn;
		nSpawn = 0;
		nTimeFromLastSpawn -= nUnitSpawnRate * nGroupSpawn;
		
        while (nSpawn<nGroupSpawn && bCanSpawn)
>>>>>>> mod
```

## 26. DATA/SUBAI/TTENT_BEHAVIOR.VS

```text
<<<<<<< HD
            int nSpawn;
            nSpawn = 0;
            nTimeFromLastSpawn -= nUnitSpawnRate * nGroupSpawn;
            
            while (nSpawn<nGroupSpawn && bCanSpawn)
            {
                if (olAll1.count>=nArmy && olAll2.count>=nArmy)
                {
                    bCanSpawn = false;
                    break;
                }
                if (olAll1.count<nArmy)
                {
                    Unit u1;
                    u1 = Place("TTeutonArcher", .pos, .player);
                    u1.SetFood(u1.maxfood);
                    u1.SetFeeding(false);
                    .settlement.ForceAddUnit(u1);
                    u1.SetExperience(old_exp_gain);
                    olAll1.Add(u1);
                    nSpawn+=1;
                }
                if (olAll2.count<nArmy )
                {
                    Unit u2;
                    u2 = Place("TTeutonRider", .pos, .player);
                    u2.SetFood(u2.maxfood);
                    u2.SetFeeding(false);
                    .settlement.ForceAddUnit(u2);
                    u2.SetExperience(old_exp_gain);
                    olAll2.Add(u2);
                    nSpawn+=1;
                }
            }
        }
        
    olTeutonsOut.ClearDead();
||||||| 1.40
			if (olAll1.count>=nArmy && olAll2.count>=nArmy)
			{
				bCanSpawn = false;
				break;
			}
			
			if (olAll1.count<nArmy)
			{
				Unit u1;
				if (!bIsIndependent)
					if (.settlement.food <= foodcost)
					{
						bCanSpawn = false;
						break;
					}
					else
						.settlement.SetFood(.settlement.food - foodcost);
				
				u1 = Place("TTeutonArcher", .pos, .player);
				u1.SetFood(u1.maxfood);
				u1.SetFeeding(false);
				.settlement.ForceAddUnit(u1);
				u1.SetExperience(old_exp_gain);
				olAll1.Add(u1);
				nSpawn+=1;
			}
			if (olAll2.count<nArmy )
			{
				Unit u2;
				if (!bIsIndependent)
					if (.settlement.food <= foodcost)
					{
						bCanSpawn = false;
						break;
					}
					else
						.settlement.SetFood(.settlement.food - foodcost);

				u2 = Place("TTeutonRider", .pos, .player);
				u2.SetFood(u2.maxfood);
				u2.SetFeeding(false);
				.settlement.ForceAddUnit(u2);
				u2.SetExperience(old_exp_gain);
				olAll2.Add(u2);
				nSpawn+=1;
			}
		}
	}

	olTeutonsOut.ClearDead();
=======
			if (olAll1.count>=nArmy)
			{
				bCanSpawn = false;
				break;
			}
			
			if (olAll1.count<nArmy)
			{
				Unit u1;
				if (!bIsIndependent)
					if (.settlement.food <= foodcost)
					{
						bCanSpawn = false;
						break;
					}
					else
						.settlement.SetFood(.settlement.food - foodcost);
				
				u1 = Place("TTeutonArcher", .pos, .player);
				u1.SetFood(u1.maxfood);
				u1.SetFeeding(false);
				.settlement.ForceAddUnit(u1);
				u1.SetExperience(old_exp_gain);
				olAll1.Add(u1);
				nSpawn+=1;
			}

		}
	}

	olTeutonsOut.ClearDead();
>>>>>>> mod
```

## 27. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
if (!Victim.IsSentry)
{
.AsUnit.RemoveItemsOfType("Damage charm");
.AsUnit.RemoveItemsOfType("Armor charm");
.AsUnit.RemoveItemsOfType("Health charm");
.AsUnit.RemoveItemsOfType("Knowledge charm");
||||||| 1.40
.AsUnit.RemoveItemsOfType("Damage charm");
.AsUnit.RemoveItemsOfType("Armor charm");
.AsUnit.RemoveItemsOfType("Health charm");
.AsUnit.RemoveItemsOfType("Knowledge charm");

=======

>>>>>>> mod
```

## 28. DATA/SUBAI/UNIT_ON_KILL.VS

```text
<<<<<<< HD
if (!Victim.IsSentry)
{
if (EnvReadString(.player, "Spoils of war") == "researched") {
	.AddItem("Spoils of War");
||||||| 1.40
if (EnvReadString(.player, "Spoils of war") == "researched") {
	.AddItem("Spoils of War");
=======
if ((EnvReadString(.player, "Spoils of war") == "researched") && (!.IsHeirOf("TTeutonArcher")) && (.HasItem("Spoils of War")) && (.FindItem("Spoils of War").use_count<5) && (!.IsHeirOf("Sentry")) && (!Victim.AsUnit.IsHeirOf("BaseAnimal"))){
	.FindItem("Spoils of War").SetUseCount(.FindItem("Spoils of War").use_count+1);
}

if ((EnvReadString(.player, "Spoils of war") == "researched") && (!.IsHeirOf("TTeutonArcher")) && (!.HasItem("Spoils of War")) && (!.IsHeirOf("Sentry")) && (!Victim.AsUnit.IsHeirOf("BaseAnimal"))){
	.AddItem("Spoils of War");}


if ((.IsHeirOf("TTeutonArcher")) && (.HasItem("Spoils of War")) && (.FindItem("Spoils of War").use_count<5) && (!.IsHeirOf("Sentry")) && (!Victim.AsUnit.IsHeirOf("BaseAnimal"))){
	.FindItem("Spoils of War").SetUseCount(.FindItem("Spoils of War").use_count+1);
>>>>>>> mod
```
