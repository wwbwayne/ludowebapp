
var tempPlayer = null;
var playerTurnText = null;
var gameIdText = null;
var diceDisplayText = null;
var ding = null;
var socketIsConnected = true;
var diceBtnReference = null;
var playerTurn = false;
Ludo.Game = function (game) {
};


Ludo.Game.prototype = {

		init : function (gameData, saveFlag, socket, myTurn, owner, isMobile, sockId, screenName, rejoin)
		{

			this.gameData = gameData;
			this.gameId = this.gameData.gameId;
			this.saveFlag = saveFlag;
			this.socket = socket;
			this.playerMode = this.gameData.playerMode;
			this.myTurn = myTurn;
			playerTurn = myTurn;
			this.owner = owner;
			this.isMobile = isMobile;
			this.sockId = sockId;
			this.playerName = screenName;
			this.rejoin = rejoin;
			this.gameMusic = null;
			this.colorClassName = null;
			this.currentPlayer = null;
			

			var chatColor = null;
			for (var i = 0; i < gameData.players.length; ++i)
			{
				if (gameData.players[i].playerName === this.playerName){
					chatColor = gameData.players[i].piecesNames[0];
					break;
				}
			}

			switch(chatColor)
			{
			case 'red':
				this.colorClassName = "text-danger";
				break;
			case 'blue':
				this.colorClassName = "text-primary";
				break;
			case 'yellow':
				this.colorClassName =  "text-warning";
				break;
			case 'green':
				this.colorClassName =  "text-success";
				break;
			default:
				this.colorClassName = "text-info";
			}
		},


		create: function(){

			
			this.redneckRoll = null;
			this.shakeAndroll = null;
			if (this.isMobile === false)
			{
				this.redneckRoll = this.game.add.audio('redneckRoll', 5, false);
				this.shakeAndroll = this.game.add.audio('shakeAndroll', 5, false);
				ding = this.game.add.audio('ding', 5, false);
			}else{
				this.redneckRoll = this.game.add.audio('redneckRoll', 1, false);
				this.shakeAndroll = this.game.add.audio('shakeAndroll', 1, false);
				ding = this.game.add.audio('ding', 1, false);
			}

			this.iddleState = 0;
			this.activeState = 1;
			this.awaitingExitState = 2;
			this.exitState = 3;
			this.cursors = null;
			this.display = null;
			this.diceBtn = null;
			this.dieValueOne = null;
			this.dieValueTwo = null;
			this.play = null;
			this.offset = null;
			this.tween = null;
			this.bmd = null;
			this.dieValueOne = 1;
			this.dieValueTwo = 1;
			this.filter = null;
			this.diceObjects = [];
			this.errorX = 810;
			this.errorY = 600;



			this.sideFragmentSrc = [

			                        "precision mediump float;",

			                        "uniform float     time;",
			                        "uniform vec2      resolution;",
			                        "uniform vec2      mouse;",

			                        "#define MAX_ITER 4",

			                        "void main( void )",
			                        "{",
			                        "vec2 v_texCoord = gl_FragCoord.xy / resolution;",

			                        "vec2 p =  v_texCoord * 8.0 - vec2(20.0);",
			                        "vec2 i = p;",
			                        "float c = 1.0;",
			                        "float inten = .05;",

			                        "for (int n = 0; n < MAX_ITER; n++)",
			                        "{",
			                        "float t = time * (1.0 - (3.0 / float(n+1)));",

			                        "i = p + vec2(cos(t - i.x) + sin(t + i.y),",
			                        "sin(t - i.y) + cos(t + i.x));",

			                        "c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),",
			                        "p.y / (cos(i.y+t)/inten)));",
			                        "}",

			                        "c /= float(MAX_ITER);",
			                        "c = 1.5 - sqrt(c);",

			                        "vec4 texColor = vec4(0.0, 0.01, 0.015, 1.0);",

			                        "texColor.rgb *= (1.0 / (1.0 - (c + 0.05)));",

			                        "gl_FragColor = texColor;",
			                        "}"
			                        ];

			if (this.isMobile === false){
				this.filter = new Phaser.Filter(this.game, null, this.sideFragmentSrc);
				this.filter.setResolution(220, 720);
				this.sprite = this.game.add.sprite();
				this.sprite.width = 220;
				this.sprite.height = 720;
				this.sprite.x = 720;
				this.sprite.filters = [ this.filter ];
			}


			this.diceBtn = this.make.button(770, 440, 'diceBtn', this.rollDice, this, 2, 1, 0);
			this.diceBtn.alpha = 0.5;
			this.diceBtn.scale.x = 0.2;
			this.diceBtn.scale.y = 0.2;
			diceBtnReference = this.diceBtn;
			this.play = this.make.button(763, 540, 'play', this.playDice, this, 2, 1, 0);
			this.play.alpha = 0.5;
			this.play.visible = false;


			/*
			this.savebutton = this.make.button(720, 320, 'savebutton', this.generateGameJson, this, 2, 1, 0);
			this.savebutton.alpha = 0.5;
			this.savebutton.scale.x = 0.3;
			this.savebutton.scale.y = 0.3;
			 */

			this.powerBtn = this.make.button(730, 655, 'power', this.restartGame, this, 2, 1, 0);
			this.powerBtn.scale.x = 0.5;
			this.powerBtn.scale.y = 0.5;
			this.powerBtn.alpha = 0.8;

			this.skipBtn = this.make.button(800, 640, 'skipturn', this.skipTurn, this, 2, 1, 0);
			this.skipBtn.scale.x = 0.2;
			this.skipBtn.scale.y = 0.2;
			this.skipBtn.alpha = 0.8;

			this.report = this.make.button(730, 320, 'report', this.ireport, this, 2, 1, 0);
			this.report.alpha = 0.5;
			this.report.scale.x = 0.3;
			this.report.scale.y = 0.3;

			this.updateBtn = this.make.button(810, 323, 'updateBtn', this.saveGame, this, 2, 1, 0);
			this.updateBtn.alpha = 0.5;
			this.updateBtn.scale.x = 0.6;
			this.updateBtn.scale.y = 0.6;


			this.play.onInputOver.add(this.over, this);
			this.play.onInputOut.add(this.out, this);
			this.play.onInputUp.add(this.up, this);
			this.play.onInputDown.add(this.down, this);

			this.diceBtn.onInputOver.add(this.over, this);
			this.diceBtn.onInputOut.add(this.out, this);
			this.diceBtn.onInputUp.add(this.up, this);
			this.diceBtn.onInputDown.add(this.down, this);


			buttonGroup = this.add.group();
			buttonGroup.add(this.report);
			buttonGroup.add(this.skipBtn);
			buttonGroup.add(this.updateBtn);
			buttonGroup.add(this.play);
			buttonGroup.add(this.diceBtn);
			buttonGroup.add(this.powerBtn);


			this.rule = new Rules(this, this.play, this.myTurn);
			this.buildWorld();
			this.controller = new DiceController(this, this.gameId, this.myTurn, this.gameData.diceIds);
			this.ludo = this.buildPlayers(this.playerMode, this.controller, this.saveFlag);
			this.populateWorld(this.ludo);


			gameIdText = this.add.text(0, 0, this.gameId, gameIdDisplayStyle);
			gameIdText.setTextBounds(720, 290, 175, 30);
			this.initialSetup();
			diceDisplayText = this.add.text(720, 0, "Die1: 0 Die2: 0", diceDisplayStyle);
			playerTurnText = this.add.text(0, 0, this.currentPlayer.playerName+"'s Turn", playerTurnDisplayStyle);
			playerTurnText.setTextBounds(720, 400, 175, 30);

			this.graphics = this.game.add.graphics(0, 0);
			this.drawExitedPieces();
			this.gameio = new Socket(this);
			this.game.input.onTap.add(this.onTap, this);

			this.soundIcon = this.game.add.sprite(850, 30, "soundIcon");
			this.soundIcon.anchor.set(0.5);
			this.soundIcon.alpha = 0.7;
			this.soundIcon.scale.x = 0.2;
			this.soundIcon.scale.y = 0.2;
			this.soundIcon.inputEnabled = true;
			this.soundIcon.input.enableDrag();
			this.soundIcon.events.onInputDown.add(this.muteMusic, this);



			this.redPlayerConnection = this.getConnectionText(70, 30, "red");
			this.bluePlayerConnection = this.getConnectionText(650, 30, "blue");
			this.yellowPlayerConnection = this.getConnectionText(650, 700, "yellow");
			this.greenPlayerConnection = this.getConnectionText(70, 700, "green");

			if (this.myTurn === true && this.currentPlayer !== null){
				this.playDing();
				this.currentPlayer.playerTurn();
			}
			tempPlayer = this.currentPlayer;
			var socket = this.socket;
			var playerName = this.playerName;
			var gameId = this.gameId;
			var colorClassName = this.colorClassName;

			$('#sendBtn').click(function() {
				var message = $('#chat').val();
				if (message && message.length > 0){
					message =  "<p class='" + colorClassName + " italic'><strong>" + playerName + ": </strong>" +  message + "</p>";
					$('#chat').val('');
					socket.emit('onMessage', {gameId : gameId, screenName  : playerName,  message : message}, function(msg){
						$('#chatLog').append(msg);
						var chatLogDiv = document.getElementById("chatLog");
						chatLogDiv.scrollTop = chatLogDiv.scrollHeight;
					});
				}

			});

			$('#chat').keypress(function(e){
				if(e.which == 13){
					e.preventDefault();
					var message = $('#chat').val();
					if (message && message.length > 0){
						message =  "<p class='" + colorClassName + " italic'><strong>" + playerName + ": </strong>" +  message + "</p>";
						$('#chat').val('');
						socket.emit('onMessage', {gameId : gameId, screenName  : playerName,  message : message}, function(msg){
							$('#chatLog').append(msg);
							var chatLogDiv = document.getElementById("chatLog");
							chatLogDiv.scrollTop = chatLogDiv.scrollHeight;
						});
					}
				}
			});

			this.reportBug = function(){

				var socket = this.socket;
				var gameId = this.gameId;
				var playerName = this.playerName;

				bootbox.dialog({
					message: '<div class="well">' +
					'<textarea class="form-control noresize" rows="4" id="comment" placeholder="ENTER DESCRIPTION HERE" maxlength="300">' +
					'</textArea>'+
					'</div>',
					title: "Send Anonymous Bug Report?",
					buttons: {
						danger: {
							label: "DON'T SEND",
							className: "btn-danger",
							callback: function() {							
								Example.show("Report Not Sent");
							}
						},
						success: {
							label: "SEND",
							className: "btn-success",
							callback: function() {
								var message = $('#comment').val();
								if (message !== ''){
									$.ajax({
										type: "POST",
										url: "report",
										data: {gameId : gameId, playerName : playerName,  message : message},
										success: function(msg){
											Example.show(msg);
										},
										error: function(){
											Example.show("Report NOT sent");
										}
									});
								}else{
									Example.show("Report cannot be empty");
								}
							} 
						}
					}
				});
			};

			localStorage.setItem('playerName', this.playerName);
			localStorage.setItem('gameId', this.gameId);
			
		},

		restartGame : function(){

			var socket = this.socket;
			var playerName = this.playerName;
			var gameId = this.gameId;

			bootbox.dialog({
				message: 'Game will restart if all players accept your request',
				title: "Restart Game or Exit Game?",
				buttons: {
					exitgame: {
						label: "EXIT GAME",
						className: "btn-danger btn-sm",
						callback: function() {							
							if (confirm("Exit game? Are you sure?") === true) {
								window.localStorage.clear();
								localStorage.removeItem('playerName');
								localStorage.removeItem('gameId');
								location.reload();
							} 
						}
					},
					cancel: {
						label: "RELOAD",
						className: "btn-warning btn-sm",
						callback: function() {							
							if (confirm("Reload game? Are you sure?") === true) {
								location.reload();
							} 
						}
					},
					restart: {
						label: "RESTART",
						className: "btn-success btn-sm",
						callback: function() {
							socket.emit('restartGameRequest', {gameId : gameId, playerName  : playerName}, function(msg){
								Example.show(msg);
							});
						} 
					}
				}
			});
		},

		ireport : function(){
			this.reportBug();
		},

		drawExitedPieces : function(){

			for (var k = 0; k < this.ludo.length; ++k){
				this.ludo[k].drawSavedExitedPieces(this.graphics);
			}
		},


		generateGameJson : function(){

			this.socket.emit('updateGame', this.gameId, function(data){
				var gameData = data.gameData;
				var dataStr = JSON.stringify(gameData);
				var url = 'data:text/json;charset=utf8,' + encodeURIComponent(dataStr);
				window.open(url, '_blank');
				window.focus();
			});
		},

		getConnectionText : function(x, y, color){

			var text = this.getConnectionTextPlayerName(color);

			var isConnected = this.game.add.text(x, y, text);
			isConnected.anchor.setTo(0.5);
			isConnected.font = 'Revalia';
			isConnected.fontSize = 20;
			var grd = isConnected.context.createLinearGradient(0, 0, 0, isConnected.canvas.height);
			grd.addColorStop(0, '#8ED6FF');   
			grd.addColorStop(1, '#004CB3');
			isConnected.fill = grd;

			isConnected.align = 'center';
			isConnected.stroke = '#000000';
			isConnected.strokeThickness = 2;
			isConnected.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

			isConnected.inputEnabled = true;
			isConnected.input.enableDrag();

			return isConnected;
		},

		getConnectionTextPlayerName : function(color){

			var playerName = "CONNECTED";
			for (var i = 0; i < this.gameData.players.length; ++i)
			{
				var player = this.gameData.players[i];
				if (this.playerHasColor(player, color))
				{
					playerName = player.playerName;
					break;
				}

			}
			return playerName;
		},

		playerHasColor : function(player, color){

			var containsColor = false;
			var playerColors = player.piecesNames;

			for (var i = 0; i < playerColors.length; ++i){
				if (playerColors[i] == color){
					containsColor = true;
				}
			}

			return containsColor;
		},

		connectionNotificationAlert : function(playerName, status){

			for (var i = 0; i < this.gameData.players.length; ++i)
			{
				var player = this.gameData.players[i];
				if (player.playerName === playerName){
					var pieces = player.pieces;
					for (var j = 0; j < pieces.length; ++j){
						var pieceName = pieces[j].piece;
						this.displayConnectionAlert(pieceName, status);
					}
					break;
				}
			}
		},

		displayConnectionAlert : function (piece, status){
			switch(piece){
			case 'red':
			{
				if (status){
					this.redPlayerConnection.visible = true;
				}else{
					this.redPlayerConnection.visible = false;
				}
				break;
			}
			case 'blue':
			{
				if (status){
					this.bluePlayerConnection.visible = true;
				}else{
					this.bluePlayerConnection.visible = false;
				}
				break;
			}
			case 'yellow':
			{
				if (status){
					this.yellowPlayerConnection.visible = true;
				}else{
					this.yellowPlayerConnection.visible = false;
				}
				break;
			}
			case 'green':
			{
				if (status){
					this.greenPlayerConnection.visible = true;
				}else{
					this.greenPlayerConnection.visible = false;
				}
				break;
			}
			default:
				break;
			}

		},

		onTap : function(pointer, doubleTap) {

			if (doubleTap && this.isMobile === false)
			{
				if (this.scale.isFullScreen)
				{
					this.scale.stopFullScreen();
				}
				else
				{
					this.scale.startFullScreen(false);
				}
			}

		},

		rollDiceEmission : function(diceObject){
			this.playShakeAndRoll();
			this.diceObjects.push(diceObject);
			this.diceBtn.visible = false;
			if (this.diceObjects.length > 1){
				this.controller.rollDice(this.currentPlayer, false, this.diceObjects);
				this.diceObjects = [];
			}
		},

		playRedneckRoll : function(){
			this.redneckRoll.play();
		},

		playShakeAndRoll : function(){
			this.shakeAndroll.play();
		},

		rollDice : function(diceObject){
			if (this.myTurn){
				this.playShakeAndRoll();
				this.controller.rollDice(this.currentPlayer, true, diceObject);
				this.diceBtn.visible = false;
			}
		},

		playDice : function(){
			if (this.myTurn){
				this.currentPlayer.play(null);
			}
		},

		playDiceEmission : function(playerPlayed){
			this.currentPlayer.play(playerPlayed);
		},

		restartEmission : function(){
			if (this.currentPlayer !== null){
				this.currentPlayer.releasePlay();
			}
		},

		consumeCurrentPlayerDice : function(){
			if (this.currentPlayer !== null){
				this.currentPlayer.consumeDice();
			}
		},


		skipTurn: function(){

			if (this.myTurn){
				if (confirm("Skip Turn?") === true) {
					if (this.myTurn && this.currentPlayer !== null)
					{
						this.currentPlayer.releasePlay();
						this.socket.emit('releaseGame', {gameId : this.gameId});
					}
				} 

			}else{
				Example.show("You can only skip your turn.");
			}

		},

		prepareForBackgroundUpdate : function(){

			this.controller.consumeDice();
			this.consumeCurrentPlayerDice();
			this.play.visible = false;
			if (this.myTurn){
				diceBtnReference.visible = true;
				diceBtnReference.alpha = 1;
				//console.log("Updating game in background My turn");
			}else{
				//console.log("Updating game in background NOT My turn");
			}
		},

		saveGame : function(){

			if (!this.currentPlayer.hasMovingPiece()){

				var ludo = this.ludo;
				var currentPlayer = this.currentPlayer;
				var play = this.play;
				var diceBtn = this.diceBtn;
				var select = this.select;
				var controller = this.controller;
				var cgame = this;
				var playerName = this.playerName;
				var myTurn = this.myTurn;
				var playDing = this.playDing;
				var playDong = this.playDong;


				this.socket.emit('updateGame', this.gameId, function(data){

					var gameData = data.gameData;
					var currentPlayerName = data.screenName;

					if (gameData !== null && !currentPlayer.hasMovingPiece())
					{

						for (var i = 0; i < ludo.length; ++i)
						{
							ludo[i].updatePlayer(gameData.players);
							if (ludo[i].myTurn())
							{
								currentPlayer = ludo[i];
								currentPlayer.selectAll();
								if (controller.setDiceValue(currentPlayer)){
									play.visible = true;
									diceBtn.visible = false;
									currentPlayer.rolled();
									currentPlayer.playerTurn();
									if (currentPlayer.rolledDoubleSix()){
										currentPlayer.rolledTwoSixes = true;
									}
								}    
							}    
							else{
								ludo[i].deSelectAll();
							}
						}

						if (currentPlayer.selectedPiece !== null){
							select(currentPlayer.selectedPiece, cgame);
						}

						if (playerName === currentPlayerName){
							tempPlayer = currentPlayer;
							console.log("This is me: " + currentPlayerName + " Playername: " + playerName);
							myTurn = true;
							playDing();

						}else {
							console.log("This is NOT me: " + currentPlayerName + " Playername: " + playerName);
							myTurn = false;
							playDong();

						}

						alertMessage("Game Updated Successfully!", "Success", false);
					}else{
						alertMessage("Game Update failed!", "Error!", false);
					}
				});
			}
		},


		onStopMoving : function(piece){
		},


		buildWorld: function(world) {

			arena = this.add.sprite(0, 0,'board');
			arena.inputEnabled = true;
			this.physics.arcade.enable(arena);
			arena.body.enable = false;
			boardGroup = this.add.group();
			boardGroup.add(arena);
			this.bmd = this.add.bitmapData(this.game.width, this.game.height);
			this.bmd.addToWorld();
			this.cursors = this.input.keyboard.createCursorKeys(); 

		},

		buildPlayers : function(mode, controller, retrieveflag){
			var players = [];
			var obj = this.gameData.players; 
			for (var i = 0; i < obj.length; ++i)
			{
				var player = new Player(this, obj[i].playerName, obj[i].turn, obj[i].piecesNames, obj[i].index, obj[i].playerMode, controller, this.gameData.gameId, this.playerName);
				player.setPieces(this, obj[i].pieces, obj[i].playerName);
				player.setDice(obj[i].diceObject);
				player.setSelectedPieceById(obj[i].selectedPieceId);
				player.exitingGraphicsPositions = obj[i].exitingGraphicsPositions;
				player.error = new Error(this, this.errorX, this.errorY);
				players.push(player);
			} 
			return players;
		},


		populateWorld: function(players) {

			for (var i = 0; i < players.length; ++i)
			{
				var pieces = players[i].playerPieces;

				for (var j = 0; j < pieces.length; ++j)
				{
					piece = pieces[j];
					this.physics.enable(piece, Phaser.Physics.ARCADE);
					piece.body.fixedRotation = true;
					piece.inputEnabled = true;
					piece.events.onInputDown.add(this.select, this);
					piece.scale.x = 1.1;
					piece.scale.y = 1.1;
					piece.anchor.y = -0.07;
					piece.anchor.x = -0.07;
					piece.bmd = this.game.add.bitmapData(this.game.width, this.game.height);
					piece.bmd.addToWorld();

					if (!pieces[j].isExited()){
						piece.group.add(piece);
					}
				} 
			}
		},

		select: function(piece, pointer) {

			if (this.myTurn){
				if (this.currentPlayer.selectedPiece === null){
					if (this.currentPlayer.setSelectedPiece(piece)){
						this.game.world.bringToTop(piece.group);
					}
				}
				else{

					if (this.currentPlayer.selectedPiece.parent == piece.parent){
						this.game.world.bringToTop(this.currentPlayer.selectedPiece.group);

					}else{

						if (piece.key != "board"){
							if (this.currentPlayer.setSelectedPiece(piece)){
								this.game.world.bringToTop(this.currentPlayer.selectedPiece.group);
							}  
						}  
					}
				} 
			}

		},

		selectEmiision: function(piece, pointer) {

			if (this.currentPlayer.selectedPiece === null){
				if (this.currentPlayer.setSelectedPiece(piece)){

					this.game.world.bringToTop(piece.group);
				}

			}
			else{

				if (this.currentPlayer.selectedPiece.parent == piece.parent){
					this.game.world.bringToTop(this.currentPlayer.selectedPiece.group);

				}else{

					if (piece.key != "board"){
						if (this.currentPlayer.setSelectedPiece(piece)){

							this.game.world.bringToTop(this.currentPlayer.selectedPiece.group);
						}  
					}  
				}
			} 
		},

		selectPieceEmissionById: function(pieceId) {
			var currentSelectedPiece = this.currentPlayer.getSelectedPieceById(pieceId);
			if (currentSelectedPiece !== null){
				this.selectEmiision(currentSelectedPiece, null);
			}
		},

		setSelectedDieById : function(diceObject) {
			this.currentPlayer.setSelectedDieById(diceObject.uniqueId);
		},

		setUnSelectedDieById : function(diceObject) {
			this.currentPlayer.setUnSelectedDieById(diceObject.uniqueId);
		},

		over: function(p){
			if (p.key == "play"){
				this.play.scale.x = 1.1;
				this.play.scale.y = 1.1;
			}
			else if (p.key == "diceBtn"){
				this.diceBtn.scale.x = 0.23;
				this.diceBtn.scale.y = 0.23;
			}

		},
		out: function(p){

			if (p.key == "play"){
				this.play.scale.x = 1;
				this.play.scale.y = 1;
			}
			else if (p.key == "diceBtn"){
				this.diceBtn.scale.x = 0.2;
				this.diceBtn.scale.y = 0.2;
			}
		},

		up: function(p){
			if (p.key == "play"){
				this.play.alpha = 0.5;
			}
			else if (p.key == "diceBtn"){
				this.diceBtn.alpha = 0.5;
			}
		},

		down: function(p){

			if (p.key == "play"){
				this.play.alpha = 1;
			}
			else if (p.key == "diceBtn"){
				this.diceBtn.alpha = 1;
			}
		},

		getNextActivePiece : function(){
			this.currentPlayer.getNextSelectedPiece();
		},

		unselectUnplayedDie : function(){
			this.controller.unSelectUnplayedDie();
		},

		checkPlayCompleted : function(playerName, peck){
			if (peck !== null){

			}

			if (this.currentPlayer.hasAllPiecesExited()){
				this.exitFullScreen();
				alertMessage(this.currentPlayer.playerName + " Wins!!!", "Winner!", true);
				this.socket.emit('endOfGame', {gameId : this.gameId});
				this.currentPlayer.resetAllPiecesExited();
			}

			this.unselectUnplayedDie();

			if (this.currentPlayer.belongsTo(playerName)){
				this.currentPlayer = this.rule.applyNextPlayerRule(this.currentPlayer);
			}

		},

		exitFullScreen : function(){
			if (this.scale.isFullScreen){
				this.scale.stopFullScreen();
			}
		},

		drawExitingGrahics : function(piece){
			this.currentPlayer.drawExitedPiece(piece, this.graphics);
		},

		getUuid : function(){
			var s = [];
			var hexDigits = "0123456789abcdef";
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);

			}
			s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
			s[8] = s[13] = s[18] = s[23] = "-";
			var uuid = s.join("");
			return uuid;
		},

		randomString : function (length) {
			return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
		},

		resetPlayer : function(gameData){
			this.graphics.clear();
			this.controller.consumeDice();
			this.consumeCurrentPlayerDice();
			//necessary to stop players from emiting next player on reset
			var currentPlayer = this.currentPlayer;
			for (var i = 0; i < this.ludo.length; ++i){
				this.ludo[i].resetPlayer();
			}
			this.updateGame(gameData, function(status){
				console.log("Restart Finished..." + status);
				tempPlayer = currentPlayer;
			});
			this.play.visible = false;
			this.diceBtn.visible = true;
			
			
		},

		updateGame : function(data, callback){

			var gameData = data.gameData;
			var currentPlayerName = data.screenName;
			if (!this.currentPlayer.hasMovingPiece()){

				if (gameData !== null)
				{
					for (var i = 0; i < this.ludo.length; ++i)
					{
						this.ludo[i].updatePlayer(gameData.players);
						if (this.ludo[i].myTurn())
						{
							this.currentPlayer = this.ludo[i];
							this.currentPlayer.selectAll();
							if (this.controller.setDiceValue(this.currentPlayer))
							{
								this.play.visible = true;
								this.diceBtn.visible = false;
								this.currentPlayer.rolled();
								this.currentPlayer.playerTurn();
								if (this.currentPlayer.rolledDoubleSix()){
									this.currentPlayer.rolledTwoSixes = true;
								}
							}
						}    
						else{
							this.ludo[i].deSelectAll();
						} 
					}
					if (this.currentPlayer.selectedPiece !== null){
						this.select(this.currentPlayer.selectedPiece, this);
					}

					if (currentPlayerName === this.playerName){
						//necessary to stop players from emiting next player on update
						tempPlayer = this.currentPlayer;
						console.log("This is me: " + currentPlayerName + " Playername: " + this.playerName);
						this.myTurn = true;
						this.playDing();
					}else {
						console.log("This is NOT me: " + currentPlayerName + " Playername: " + this.playerName);
						this.myTurn = false;
						this.playDong();
					}
				}
				else{
					console.log("Game Data is null");
				}
			}else{
				console.log("Player has moving pieces... ");
			}
			callback(true);

		},

		muteMusic : function(){
			if (this.game.sound.mute === true){
				this.game.sound.mute = false;
				this.soundIcon.scale.x = 0.2;
				this.soundIcon.scale.y = 0.2;
			}else{
				this.game.sound.mute = true;
				this.soundIcon.scale.x = 0.1;
				this.soundIcon.scale.y = 0.1;
			}
		},

		unlock : function(callback){
			if (!this.currentPlayer.hasMovingPiece()){
				callback(true, this.access);
			}
		},

		playDing : function(){
			ding.play();
			playerTurnText.fill = '#00ffff';
			gameIdText.fill = '#00ffff';
			diceDisplayText.fill = '#00ffff';
			if (diceBtnReference !== null){
				diceBtnReference.alpha = 1;
			}
		},

		playDong : function(){
			playerTurnText.fill = '#F70C0C';
			gameIdText.fill = '#F70C0C';
			diceDisplayText.fill = '#F70C0C';
			if (diceBtnReference !== null){
				diceBtnReference.alpha = 0.5;
			}
		},

		getUpdatedGame : function(){

			var gamedef = new Gamedef(this.controller, this.gameData.gameId);
			gamedef.savedef(this.ludo);
			gamedef.gameMode = this.gameData.gameMode;
			return gamedef;

		},

		initialSetup : function(){

			for (var i = 0; i < this.ludo.length; ++i)
			{
				if (this.ludo[i].myTurn())
				{
					this.currentPlayer = this.ludo[i];
					if (this.controller.setDiceValue(this.currentPlayer)){
						this.play.visible = true;
						this.diceBtn.visible = false;
						this.currentPlayer.rolled();
						this.currentPlayer.playerTurn();
						if (this.currentPlayer.rolledDoubleSix()){
							this.currentPlayer.rolledTwoSixes = true;
						}
						break;
					}
				}  
			}

			if (this.currentPlayer === null){
				this.currentPlayer = this.ludo[0];
			}

			if (this.currentPlayer.selectedPiece !== null){
				this.select(this.currentPlayer.selectedPiece, this);
			}

			for (var j = 0; j < this.ludo.length; ++j){
				if (this.currentPlayer !== this.ludo[j]){
					this.ludo[j].deSelectAll();
					this.ludo[j].exitAll();
				}
			}

			this.currentPlayer.exitAll();

		},

		checkConnectivity : function(){
			if(navigator.onLine){
				return true;
			}
			else{
				return false;
			}
		},

		update: function() {

			if (this.isMobile === false){
				this.filter.update();
			}

			if (this.currentPlayer.diceCompleted()){
				//console.log("I was completed");
				this.currentPlayer = this.rule.applyDiceRules(this.currentPlayer);
				this.currentPlayer.diceCompletionReset();
			} 

			var valueOne = 0;
			d1 = this.controller.dice[0];
			d1.group.forEach(function(item) { 
				valueOne += item.value(); 
			});
			this.dieValueOne  = valueOne;

			var valueTwo = 0;
			d2 = this.controller.dice[1];
			d2.group.forEach(function(item) { 
				valueTwo += item.value(); 
			});
			this.dieValueTwo = valueTwo;

			diceDisplayText.setText("Die1: " + this.dieValueOne + " Die2: " + this.dieValueTwo);
			playerTurnText.setText(this.currentPlayer.playerName+"'s Turn");

			if (this.currentPlayer.hasMovingPiece()){
				this.play.visible = false;
			}
			else{
				//this.play.visible = true;
			}

			if (tempPlayer != this.currentPlayer && !tempPlayer.hasMovingPiece()){

				this.playDong();
				this.myTurn = false;
				tempPlayer.emitNextPlayer();
				//console.log("Emiting next player: " + this.currentPlayer.playerName);
				tempPlayer = this.currentPlayer;
			}

			if (!this.socket.connected && socketIsConnected){
				alertMessage("You have been disconnect!", "Failed Connection!", true);
				socketIsConnected = false;
			}
		}

};