# antioco-iii-el-grande: to check by hand

3 items. In each conflict the mod's side was used.

## 1. DATA/COMMANDS/VILLAGE.XML

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
<cmd name="callIScout" priority="4"
	button="actions/train IScout.bmp"
	queueicon="gameres/icons/IScout.bmp"
	groupverifier="data/subai/verify_scout_train.vs"
	transpicon="1"
	traincommand="yes"
	key="s"
	costgold = "0"
	costfood = "0"
	costpop = "5"
	execdelay = "1"
	method = "trainIScout"
	rollover="Call scout"
	description="Call 1 scout"
	sclass="IScout">
	<src obj="IVillage"/>
</cmd>
-->
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
        <src obj="KOutpost"/>
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

## 2. DATA/COMMANDS/VILLAGE.XML

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
        <src obj="KOutpost"/>
>>>>>>> mod
```

## 3. DATA/SOUND ENTITIES/VOICERLIBERATUS.XML

```text
<<<<<<< HD
      <sound file="CurrentLang/voices/RLiberatus/1.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/2.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/3.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/4.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/5.wav" frequency="20"/>
||||||| 1.40
      <sound file="CurrentLang/voices/RLiberatus/An eye for an eye.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/Don't order me.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/For Mars.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/I smell blood.wav" frequency="20"/>
      <sound file="CurrentLang/voices/RLiberatus/I'm no slave.wav" frequency="20"/>
=======
      <sound file="CurrentLang/voices/BSwordsman/1.wav" frequency="20"/>
      <sound file="CurrentLang/voices/BSwordsman/2.wav" frequency="20"/>
      <sound file="CurrentLang/voices/BSwordsman/3.wav" frequency="20"/>
      <sound file="CurrentLang/voices/BSwordsman/4.wav" frequency="20"/>
      <sound file="CurrentLang/voices/BSwordsman/5.wav" frequency="20"/>
>>>>>>> mod
```
