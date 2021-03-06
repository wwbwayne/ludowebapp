//Extended Phaser.Sprite (check out the examples Sprites -> extending sprite demo 1 & 2)
//Added a function to animate rolling.

Dice = function (game, x, y, gameId, myTurn, uniqueId) {
	Phaser.Sprite.call(this, game.game, x, y, 'die');

	this.blurX = game.add.filter("BlurX");  // Blur filters taken from
	this.blurY = game.add.filter("BlurY");  // Filters -> blur example
	this.game = game;
	this.dieValue = 0;
	this.isPlayed = true;
	this.group = null;
	this.player = null;
	this.anchor.setTo(0.5, 0.5);
	this.inputEnabled = true;
	this.events.onInputDown.add(this.selectDie, this);
	this.uniqueId = uniqueId;
	this.pusher = true;
	this.gameId = gameId;
	this.myTurn = myTurn;

	var i;
	this.pix = [];
	for (i=0; i < 15; i++) {
		this.pix[i] = game.rnd.pick([0,1,2,4,5,6]);
	}

	this.anim = this.animations.add("roll", this.pix);
	this.anim.onComplete.add(this.rollComplete, this); 

	this.frame = 1;
	this.alpha = 0.5;
	this.diceValueIsSet = false;
	this.gameio = null;
	this.randValue = 0;
	this.diceArr = [5,1,6,2,0,4];

	game.add.existing(this);
};

Dice.prototype = Object.create(Phaser.Sprite.prototype);
Dice.prototype.constructor = Dice;

Dice.prototype.setGameIO = function(gameio) {
	this.gameio = gameio;
};


Dice.prototype.roll = function(diceObjects) {

	if (this.pusher)
	{

		var rand = Math.floor(Math.random() * 6);
		this.randValue = this.diceArr[rand];
	


		this.gameio.emitDiceRoll({uniqueId :  this.uniqueId, frame : this.randValue, gameId : this.gameId, playerName : this.player.playerName});
		this.alpha = 1;
		this.isPlayed = false;
		this.filters = [this.blurX, this.blurY];
		this.animations.play("roll", 20);
		
	}else
	{

		var randValue = this.getDiceObject(diceObjects);
		if (randValue < 0)
		{
			return;
		}
		else
		{
			this.randValue = randValue;
			this.alpha = 1;
			this.isPlayed = false;
			this.filters = [this.blurX, this.blurY];
			this.animations.play("roll", 20);
			
		}

	}


};

Dice.prototype.getDiceObject = function(diceObjects) {
	for (var i = 0; i < diceObjects.length; ++i){
		if (diceObjects[i].uniqueId == this.uniqueId){
			return diceObjects[i].frame;
		}
	}

	return -1;
};

Dice.prototype.rollComplete = function(game, value) {
	this.filters = null;
	this.frame = this.randValue;
	var diceObject = {uniqueId: this.uniqueId, value: this.value(), playerName : this.player.playerNames, selected : this.selected()};
	this.player.updateDiceObject(diceObject);
	this.pusher = true;
};



Dice.prototype.select = function() {
	this.alpha = 0.6;
	if (this.player !== null){
		this.player.updateDiceObjectSelection({uniqueId : this.uniqueId, selected : true});
	}
};

Dice.prototype.unSelect = function() {
	this.alpha = 1;
	if (this.player !== null){
		this.player.updateDiceObjectSelection({uniqueId : this.uniqueId, selected : false});
	}
};

Dice.prototype.selected = function() {
	return (this.alpha == 0.6);
};

Dice.prototype.unSelected = function() {
	return (this.alpha == 1);
};



Dice.prototype.update = function() {
	if (this.anim.isPlaying) {
		this.angle = this.game.rnd.angle();
	}
};

Dice.prototype.played = function(){
	this.isPlayed = true;
	this.alpha = 0.6;
	if (this.player !== null && this.gameio !== null && this.game.myTurn){

		this.gameio.emitDiceIsPlayed({uniqueId : this.uniqueId, gameId : this.gameId, playerName : this.player.playerName});
	}

};

Dice.prototype.isSpent = function(){
	return (this.isPlayed);
};


Dice.prototype.setCurrentPlayer = function(currentPlayer){
	this.player = currentPlayer;
};

Dice.prototype.setSavedCurrentPlayer = function(currentPlayer){

	for (var i = 0; i < currentPlayer.diceObject.length; ++i){
		if (currentPlayer.diceObject[i].uniqueId === this.uniqueId){
			this.player = currentPlayer;
			return (this.setValue(currentPlayer.diceObject[i]));
		}
	}
	
	return false;
};

Dice.prototype.selectDie = function() {
	if (this.game.myTurn){
		if (this.player !== null && !this.player.hasMovingPiece()){   
			if (this.selected() && !this.isPlayed){
				this.unSelect();
				this.gameio.emitDiceUnSelection({uniqueId :  this.uniqueId, gameId : this.gameId, selected : false, playerName : this.player.playerName});
			}else if (this.unSelected()){  
				this.select(); 
				this.gameio.emitDiceSelection({uniqueId :  this.uniqueId, gameId : this.gameId, selected : true, playerName : this.player.playerName});
			}   
		}
	}

};

Dice.prototype.value = function() {

	if (this.isPlayed){
		return 0;
	}else{

		switch(this.frame) {
		case 0:
			return 6;
		case 1:
			return 1;
		case 2:
			return 2;
		case 4:
			return 5;
		case 5:
			return 3;
		case 6:
			return 4;
		default:
			return 0;
		}


	}



};

//Used to set dice values from persisted JSON file
Dice.prototype.setValue = function(diceObject) {

	switch(diceObject.value) 
	{
	case 6:
	{
		if (diceObject.selected){
			this.select();
		}else{
			this.unSelect();
		}

		this.frame = 0;
		this.isPlayed = false;
		return true;
	}
	case 1:
	{
		if (diceObject.selected){
			this.select();
		}else{
			this.unSelect();
		}
		this.frame = 1;
		this.isPlayed = false;
		return true;
	}
	case 2:
	{	
		if (diceObject.selected){
			this.select();
		}else{
			this.unSelect();
		}
		this.frame = 2;
		this.isPlayed = false;
		return true;
	}
	case 5:
	{
		if (diceObject.selected){
			this.select();
		}else{
			this.unSelect();
		}
		this.frame = 4;
		this.isPlayed = false;
		return true;
	}
	case 3:
	{
		if (diceObject.selected){
			this.select();
		}else{
			this.unSelect();
		}
		this.frame = 5;
		this.isPlayed = false;
		return true;
	}
	case 4:
	{
		if (diceObject.selected){
			this.select();
		}else{
			this.unSelect();
		}
		this.frame = 6;
		this.isPlayed = false;
		return true;
	}
	case 0:
	{
		this.select();
		this.frame = 1;
		this.isPlayed = true;
		return false;
	}
	}
};


