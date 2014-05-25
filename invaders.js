/**
 * Done in ca 10 hours, from scratch
 * contact me via mjurisic(a)gmail.com
 */
game = {
  highScore : 0,
	speed : 20,
	marqueeSpeed : 200,
	enemySize : 15,
	playerSize : 15,
	explosionSize : 14,
	styleWhite : "rgb(255, 255, 255)",
	styleRed : "rgb(255, 0, 0)",
	styleBlack : "rgb(0, 0, 0)",
	runningInterval : null,

	enemyInitialSpeed : 2,
	enemiesInitialY : 50,

	ctx : document.getElementById('gameCanvas').getContext('2d'),

	drawDemo : function() {
		if (!game.ctx) {
			alert('this game requires html5 capable browser');
			return;
		}
		game.drawStars();
		game.runningInterval = window.setInterval(game.drawStars, 1000);
	},

	clear : function() {
		game.ctx.fillStyle = game.styleBlack;
		game.ctx.fillRect(0, 0, 800, 600);
	},

	drawStars : function() {
		game.clear();
		for (var i = 0; i < 80; i++) {
			game.drawStar(Math.floor((Math.random() * 800) + 1), Math.floor((Math.random() * 600) + 1));
		}
		game.ctx.fillText("Press S to start game, space to shoot, left and right arrow to move", 100, 300);
	},

	drawStar : function(x, y) {
		game.ctx.fillStyle = game.styleWhite;
		game.ctx.fillText('*', x, y);
	},

	random : function(from, to) {
		return Math.floor((Math.random() * to) + from);
	},
	randomColor : function() {
		return 'rgb(' + game.random(100, 255) + ',' + game.random(100, 255) + ',' + game.random(100, 255) + ')';
	},

	start : function() {
		if (game.marquee.interval != null) {
			window.clearInterval(game.marquee.interval);
		}
		if (game.runningInterval != null) {
			window.clearInterval(game.runningInterval);
		}
		if (localStorage.invadersHighScore) {
			game.highScore = Number(localStorage.invadersHighScore);
		} else {
			game.highScore = 0;
		}

		game.state.enemies = new Array();
		for (var j = 0; j < 4; j++) {
			for (var i = 0; i < 10; i++) {
				game.state.enemies.push({
					eX : 100 + 50 * i,
					eY : 50 + j * 25,
					size : game.enemySize,
					state : 'alive'
				});
			}
		}
		game.state.bullets = new Array();
		game.state.reachedBottom = false;
		game.playerSize = 15;
		game.state.playerAlive = true;
		game.state.points = 0;
		game.clear();
		game.state.isstarted = 1; //1 started, 0 not started, 2 paused
		game.drawGame();
		game.runningInterval = window.setInterval(game.gameLoop, game.speed);
	},

	gameLoop : function() {
		game.clear();

		game.processEnemies();
		game.processBullets();

		game.checkCollisions();
		game.drawGame();
	},

	drawGame : function() {
		game.drawPlayer();
		game.drawBullets();
		game.drawEnemies();
		game.drawPoints();
	},

	drawEnemies : function() {
		for (var i = 0; i < game.state.enemies.length; i++) {
			enemy = game.state.enemies[i];
			if (enemy.state == 'alive') {
				game.ctx.fillStyle = game.styleWhite;
				game.ctx.fillRect(enemy.eX, enemy.eY, enemy.size, enemy.size);
			} else if (enemy.state == 'explode') {
				if (enemy.size == game.enemySize) { // start explosion
					game.state.enemies[i].size = 3;
				} else if (enemy.size > game.explosionSize) { // mark as dead
					game.state.enemies[i].state = 'dead';
					if (game.state.isstarted == 0) {
						window.clearInterval(game.runningInterval);
						game.clear();
						game.marquee.drawMarquee("Congratulations, you have saved the world! Contact me at mjurisic(a)gmail.com", 20, 300);
					}
				} else { // draw explosion stages
					game.drawExplosion(game.state.enemies[i].eX + game.enemySize / 2, game.state.enemies[i].eY + game.enemySize / 2, game.state.enemies[i].size, '#bb0000');
					game.state.enemies[i].size = game.state.enemies[i].size + 0.5;
				}
			}
		}
	},

	drawPlayer : function() {
		if (game.state.playerAlive === true) {
			game.ctx.fillStyle = game.styleWhite;
			game.ctx.fillRect(game.state.playerX, game.state.playerY, game.playerSize, game.playerSize);
		} else if (game.playerSize < game.explosionSize) {
			game.drawExplosion(game.state.playerX, 505, game.playerSize, '#990099');
			game.playerSize = game.playerSize + 0.5;
		} else {
			//endgame
			window.clearInterval(game.runningInterval);
			game.state.isstarted = 0;
			game.clear();
			console.log(localStorage.invadersHighScore);
			if (game.state.points >= game.highScore) {
				game.highScore = game.state.points;
				localStorage.invadersHighScore = game.state.points;
			}
			game.marquee.drawMarquee("Game over. Press S to start again", 20, 300);
		}
	},

	drawBullets : function() {
		if (game.state.playerBX != null) {
			game.ctx.fillRect(game.state.playerBX, game.state.playerBY, 3, 10);
		}
		for (var i = 0; i < game.state.bullets.length; i++) {
			game.ctx.fillStyle = game.styleRed;
			game.ctx.fillRect(game.state.bullets[i].bx, game.state.bullets[i].by, 3, 10);
			game.ctx.fillStyle = game.styleWhite;
		}
	},
	
	drawExplosion : function(x, y, size, color) {
		game.ctx.beginPath();
		game.ctx.arc(x, y, size, 0, 2 * Math.PI, false);
		game.ctx.fillStyle = color;
		game.ctx.fill();
		game.ctx.strokeStyle = '#330000';
		game.ctx.stroke();
	},
	
	drawPoints : function() {
		game.ctx.fillStyle = game.styleWhite;
		game.ctx.fillText('SCORE', 40, 10);
		game.ctx.fillText(game.state.points, 55, 30);
		
		game.ctx.fillText('HI-SCORE', 700, 10);
		game.ctx.fillText(game.highScore, 725, 30);
	},

	processBullets : function() {
		if (game.state.playerBY <= 50) {
			game.state.playerBY = null;
			game.state.playerBX = null;
		}
		if (game.state.playerBX != null) {
			game.state.playerBY = game.state.playerBY - game.state.shootSpeed;
		}

		doshoot = false;
		if (game.state.bullets.length == 0) {
			doshoot = true;
		}
		for (var i = 0; i < game.state.enemies.length; i++) {
			if (doshoot) {
				if (game.state.enemies[i].state == 'alive') {
					game.state.bullets.push({
						bx : game.state.enemies[i].eX,
						by : game.state.enemies[i].eY
					});
				}
			}
		}

		for (var i = 0; i < game.state.bullets.length; i++) {
			game.state.bullets[i].by = game.state.bullets[i].by + 3;
			if (game.state.bullets[i].by >= 600) {
				game.state.bullets.splice(i, 1);
			}
		}
	},

	processEnemies : function() {
		//move enemies on x axis
		for (var i = 0; i < game.state.enemies.length; i++) {
			if (game.state.enemies[i].state == 'alive') {
				game.state.enemies[i].eX = game.state.enemies[i].eX + game.state.enemiesSpeed;
			}
		}

		changedDirection = false;
		// step movement when edge reached
		for (var i = 0; i < game.state.enemies.length; i++) {
			if (game.state.enemies[i].state == 'alive') {
				if (game.state.enemies[i].eX >= 750 || game.state.enemies[i].eX <= 50) {
					if (changedDirection === false) {
						game.state.enemiesSpeed = -game.state.enemiesSpeed;
						changedDirection = true;
					}
				}
			}
		}
		
		if (changedDirection === true && game.state.reachedBottom === false) {
			for (var i = 0; i < game.state.enemies.length; i++) {
				if (game.state.enemies[i].eY < 400 && changedDirection === true) {
					game.state.enemies[i].eY = game.state.enemies[i].eY + 20;
				}
				if (game.state.enemies[i].eY >= 400) {
					game.state.reachedBottom = true;
				}
			}
		}
	},

	processLeft : function() {
		if (game.state.playerX > 50) {
			game.state.playerX = game.state.playerX - game.state.moveSpeed;
		}
	},

	processRight : function() {
		if (game.state.playerX < 750) {
			game.state.playerX = game.state.playerX + game.state.moveSpeed;
		}
	},

	processShot : function() {
		game.state.playerBX = game.state.playerX;
		game.state.playerBY = game.state.playerY;
	},

	checkCollisions : function() {
		dead = 0;
		for (var i = 0; i < game.state.enemies.length; i++) {
			enemy = game.state.enemies[i];
			if (enemy.state != 'alive') {
				dead++;
				continue;
			}
			//hit something
			if (enemy.eX < game.state.playerBX && (enemy.eX + enemy.size) > game.state.playerBX && //
			enemy.eY < game.state.playerBY && (enemy.eY + enemy.size) > game.state.playerBY) {
				game.state.enemies[i].state = 'explode';
				game.state.playerBX = null;
				game.state.points = game.state.points + Math.floor((Math.random() * 10) + 1); //enemy gives random points 1 to 10
			}
		}

		//killed all enemies
		if (dead == game.state.enemies.length) {
			game.state.isstarted = 0;
		}
		
		//got hit :(
		for (var i = 0; i < game.state.bullets.length; i++) {
			if (game.state.playerX < game.state.bullets[i].bx && game.state.playerX + game.playerSize > game.state.bullets[i].bx &&
					game.state.playerY < game.state.bullets[i].by && game.state.playerY + game.playerSize > game.state.bullets[i].by) {
				game.state.bullets.splice(i, 1);
				game.state.playerAlive = false;
				game.playerSize = 2;
			}
		}
	},

	state : {
		isstarted : 0,
		points : 0,
		shootSpeed : 7,
		moveSpeed : 5,

		playerX : 100,
		playerY : 500,
		playerBX : null,
		playerBY : null,
		bullets : new Array(),
		enemiesSpeed : 2,
		
		reachedBottom : false,
		playerAlive : true
	},

	marquee : {
		mtext : '',
		index : 0,
		interval : null,
		drawMarquee : function(text, x, y) {
			game.marquee.mtext = text;

			game.marquee.interval = window.setInterval(function() {
				game.marquee.index = game.marquee.index + 1;
				for (var i = 0; i < game.marquee.index; i++) {
					game.marquee.drawLetter(game.marquee.mtext[i], x + (i * 10), y);
				}
				if (game.marquee.index == game.marquee.mtext.length) {
					game.marquee.index = 0;
				}
			}, game.marqueeSpeed);
		},
		drawLetter : function(letter, x, y) {
			game.ctx.fillStyle = game.randomColor();
			game.ctx.fillText(letter, x, y);
		}
	},
};

game.drawDemo();
document.onkeydown = function(evt) {
	evt = evt || window.event;
	code = evt.keyCode;

	if (code == 83) {
		game.start();
	} else if (code == 32) { // space - start game
		game.processShot();
	} else if (code == 37) { // left
		game.processLeft();
	} else if (code == 39) { //right
		game.processRight();
	} else if (code == 27) { //esc = pause
		if (game.state.isstarted === 1) {
			window.clearInterval(game.runningInterval);
			game.state.isstarted = 2;
		} else if (game.state.isstarted === 2) {
			game.state.isstarted = 1;
			game.runningInterval = window.setInterval(game.gameLoop, game.speed);
		}
	}
};