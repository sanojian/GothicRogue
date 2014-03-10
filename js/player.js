function init_Player() {

	Crafty.c('Player', {
		level: 1,
		xp: 0,

		Player: function(x, y, type, controls) {
			this.requires('Keyboard, Mob')
				.bind('KeyDown', function(evt) {
					var movement = {x: 0, y: 0};
					if (evt.key == controls.charCodeAt(1)) {
						movement.x = -1;
					}
					else if (evt.key == controls.charCodeAt(3)) {
						movement.x = 1;
					}
					else if (evt.key == controls.charCodeAt(0)) {
						movement.y = -1;
					}
					else if (evt.key == controls.charCodeAt(2)) {
						movement.y = 1;
					}
					else {
						var validKey = false;
						for (var i=0;i<g_game.wizard.playerControls.length;i++) {
							if (evt.key == g_game.wizard.playerControls.charCodeAt(i)) {
								validKey = true;
							}
						}
						if (!validKey) {
							fadeOutControls();
						}
						return;
					}
					this.performMove(movement);
				}).bind('Move', function() {
					for (var y=Math.max(0, this.locY-8);y<Math.min(g_game.mapTiles[0].length, this.locY+8);y++) {
						for (var x=Math.max(0, this.locX-8);x<Math.min(g_game.mapTiles.length, this.locX+8);x++) {
							if (x >= 0 && x < g_game.mapTiles.length && y >= 0 && y < g_game.mapTiles[0].length
								&& Math.sqrt(Math.pow(this.locX - x, 2) + Math.pow(this.locY - y, 2)) < 6) {

								g_game.mapReveal[y][x] = true;
							}
						}
					}

					centerOnPlayers();
				}).bind('EnterFrame', function(frameObj) {
					if (frameObj.frame % 19 == 0) {
						this.mana = Math.min(this.maxMana, this.mana + 1);
						if (type == 'wizard') {
							this.checkSpellMana();
						}
						this.showHealth(type);
					}
					else if (frameObj.frame % 51 == 0) {
						this.health = Math.min(this.maxHealth, this.health + 1);
						this.showHealth(type);
					}

				}).Mob(x, y, type)

			this.playerType = type;
			this.maxHealth = GAME.CHARLEVELS[this.playerType][0].health;
			this.maxMana = GAME.CHARLEVELS[this.playerType][0].mana;

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 12*TILE_WIDTH);
			this.attach(lightSource);

			this.playerControls = controls;

			// meters
			this.posCharBox = $('#imgCharBox').offset();
			this.$healthBar = $('#divCharHealth');
			this.$manaBar = $('#divCharMana');
			this.$xpBar = $('#divCharXP');
			var nameText = $('#divCharNameText');
			nameText.css({ left: this.posCharBox.left + 54*2, top: this.posCharBox.top + 7*2, 'font-family': GAME_FONT, 'font-size': '12pt', 'font-weight': 'bold' });
			nameText.html('Pidgeon<br>&nbsp;&nbsp;&nbsp;Jack');

			this.$charSlot0 = $('#charSlot0');
			this.$charSlot1 = $('#charSlot1');
			for (var key in this.equipment) {
				if (key) {
					this[key] = Crafty.e('2D, ' + RENDERING_MODE + ', ' + key + '_' + this.equipment[key])
						.attr({ x: this.x, y: this.y, z: this.z + 10 });
					this.attach(this[key]);
				}
			}

			this.dressInEquipment();

			return this;
		},
		showHealth: function() {
			var width = Math.floor(80 * this.health/this.maxHealth);
			this.$healthBar.css({ width: width, left: this.posCharBox.left + 36*2, top: this.posCharBox.top + 55*2 });
			var height = this.maxMana == 0 ? '0' : Math.floor(42 * this.mana/this.maxMana);
			this.$manaBar.css({ height: height, left: this.posCharBox.left + 67*3, top: this.posCharBox.top + 31*3 + 42 - height });

			var divisor = 0;
			for (var i=0;i<this.level;i++) {
				divisor += Math.pow(2, 2+i);
			}
			var subtract = 0;
			for (var i=0;i<this.level-1;i++) {
				subtract += Math.pow(2, 2+i);
			}
			var width = Math.floor(60 * (this.xp - subtract)/(divisor - subtract));
			this.$xpBar.css({ width: width, left: this.posCharBox.left + 3*3, top: this.posCharBox.top + 40*3 });

		},
		addXP: function(amt) {
			this.xp += amt;
			var level = 1;
			if (this.xp >= 4 + 8 + 16 + 32 + 64 + 128 + 256 + 512 + 1024 + 2048)
				level = 11;
			else if (this.xp >= 4 + 8 + 16 + 32 + 64 + 128 + 256 + 512 + 1024)
				level = 10;
			else if (this.xp >= 4 + 8 + 16 + 32 + 64 + 128 + 256 + 512)
				level = 9;
			else if (this.xp >= 4 + 8 + 16 + 32 + 64 + 128 + 256)
				level = 8;
			else if (this.xp >= 4 + 8 + 16 + 32 + 64 + 128)
				level = 7;
			else if (this.xp >= 4 + 8 + 16 + 32 + 64)
				level = 6;
			else if (this.xp >= 4 + 8 + 16 + 32)
				level = 5;
			else if (this.xp >= 4 + 8 + 16)
				level = 4;
			else if (this.xp >= 4 + 8)
				level = 3;
			else if (this.xp >= 4)
				level = 2;

			if (this.level != level) {
				// ding!
				this.maxHealth = GAME.CHARLEVELS[this.playerType][Math.min(GAME.CHARLEVELS[this.playerType].length-1,level-1)].health;
				this.maxMana = GAME.CHARLEVELS[this.playerType][Math.min(GAME.CHARLEVELS[this.playerType].length-1,level-1)].mana;
			}
			this.level = level;
			this.showHealth();
		},
		searchForTreasure: function() {
			var treasures = this.hit('Treasure');
			if (treasures) {
				for (var i=0;i<treasures.length;i++) {
					var treasure = treasures[0].obj;
					if (GAME.EQUIPMENT[treasure.treasureType].classes.indexOf(this.class) != -1 && treasure.treasureLevel > this.equipment[treasure.treasureType]) {
						//this[treasure.treasureType].sprite(GAME.EQUIPMENT[treasure.treasureType].slot*TILE_WIDTH, treasure.treasureLevel*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
						this.equipment[treasure.treasureType] = treasure.treasureLevel;
						treasure.destroy();
						g_game.sounds.pickup.play();
						Crafty.e('FloatingText').FloatingText(this.locX-1, this.locY
							, getTextForLoot(treasure.treasureLevel)
							, '#A3CE27');

						this.dressInEquipment();
					}
				}
			}
		},
		dressInEquipment: function() {
			for (var key in this.equipment) {
				//this[key].sprite(GAME.EQUIPMENT[key].slot*TILE_WIDTH, this.equipment[key]*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
				// remove defining class
				this['$charSlot' + GAME.EQUIPMENT[key].slot].removeClass (function (index, css) {
						return (css.match (/\bicon-\S+/g) || []).join(' ');
					}).addClass('icon-' + key + '-' + this.equipment[key]);

			}
			this.calcStats();
		},
		lookForExit: function() {
			var exits = this.hit('exit');
			if (exits) {
				g_game.curLevel = Math.min(GAME.DUNGEONLEVELS.length-1, parseInt(g_game.curLevel, 10) + 1);
				Crafty.scene("splash");
				return
			}
			var exits = this.hit('entrance');
			if (exits) {
				g_game.curLevel = Math.max(0, parseInt(g_game.curLevel, 10) - 1);
				Crafty.scene("splash");
				return
			}
		},
		calcStats: function() {
			var offense = 0;
			var defense = 0;
			for (var key in this.equipment) {
				if (key) {
					offense += GAME.EQUIPMENT[key].offense[this.equipment[key]];
					defense += GAME.EQUIPMENT[key].defense[this.equipment[key]];
				}
			}
			this.offense = offense;
			this.defense = defense;

			this.showHealth();
		},
		attackMob: function(mob, movement) {
			if (mob.has('Creature')) {
				mob.takeDamage(this.calcDamageTo(mob), this);
				g_game.slashEffects.getNextEffect().showSlash(mob.x, mob.y, movement);
				g_game.sounds['swing' + Math.ceil(Math.random()*3)].play();
			}
		},
		doDestroy: function() {
			g_game.wizard.destroy();
			setTimeout(function() {
				Crafty.scene("death");
			}, 3000);
		}
		/*syncSprites: function() {
		 for (var key in this.equipment) {
		 if (key) {
		 this[key].attr({ x: this.x, y: this.y});
		 }
		 }
		 }*/
	});

	Crafty.c('Wizard', {
		bCasting: false,

		Wizard: function(x, y, controls) {
			this.requires('Player')
				.bind('KeyDown', function(evt) {
					if (evt.key == Crafty.keys['1'] && this.mana >= GAME.SPELLS.Missle.mana) {
						this.bCasting = true;
						this.mana -= GAME.SPELLS.Missle.mana;
						this.spell = 'Missle';
						this.showHealth('wizard');
						Crafty.e('FloatingText')
							.FloatingText(this.locX-1, this.locY,	'Ort Por', '#31A2F2', 50);

					}
					else if (evt.key == Crafty.keys['2'] && this.mana >= GAME.SPELLS.Fireball.mana) {
						this.bCasting = true;
						this.mana -= GAME.SPELLS.Fireball.mana;
						this.spell = 'Fireball';
						this.showHealth('wizard');
						Crafty.e('FloatingText')
							.FloatingText(this.locX-1, this.locY,	'Vas Flam', '#31A2F2', 50);
					}
					else if (evt.key == Crafty.keys['3'] && this.mana >= GAME.SPELLS.Sleep.mana) {
						this.bCasting = true;
						this.mana -= GAME.SPELLS.Sleep.mana;
						this.spell = 'Sleep';
						this.showHealth('wizard');
						Crafty.e('FloatingText')
							.FloatingText(this.locX-1, this.locY,	'Kal Zu', '#31A2F2', 50);
					}
					else if (evt.key == Crafty.keys['4'] && this.mana >= GAME.SPELLS.Lightening.mana) {
						this.bCasting = true;
						this.mana -= GAME.SPELLS.Lightening.mana;
						this.spell = 'Lightening';
						this.showHealth('wizard');
						Crafty.e('FloatingText')
							.FloatingText(this.locX-1, this.locY,	'Grav Ex', '#31A2F2', 50);
					}
				})

			this.class = 'wizard';

			this.equipment = {
				robe: 0,
				hat: 0,
				staff: 0
			}

			this.Player(x, y, 'wizard', controls);
			this.calcStats();


			return this;
		},
		checkSpellMana: function() {
			for (var key in GAME.SPELLS) {
				$('#imgSpell_' + key).css({ visibility: (this.mana >= GAME.SPELLS[key].mana) ? 'visible' : 'hidden' });
			}
		},
		performMove: function(movement) {
			if (this.bCasting) {
				Crafty.e(this.spell)
					[this.spell](this.locX, this.locY, movement, this, 'Creature');
				this.bCasting = false;
			}
			else {
				this.moveMob(movement);
				this.searchForTreasure();
				this.lookForExit();
			}
		}
	});

	Crafty.c('Gunman', {
		bShooting: false,
		bReadyToFire: false,

		Gunman: function(x, y, controls) {
			this.requires('Player, Delay')
				.bind('KeyDown', function(evt) {
					if (evt.key == Crafty.keys['1'] && !this.bShooting) {
						this.bShooting = true;
						this.spell = 'Missle';
						Crafty.e('FloatingText')
							.FloatingText(this.locX-1, this.locY,	'click', '#31A2F2', 50);

						this.delay(function() {
							this.bReadyToFire = true;
						}, 500);
					}
				});

			this.equipment = {
				pistol: 0
			}

			this.class = 'gunman';

			this.Player(x, y, 'gunman', controls);
			this.calcStats();

			return this;
		},
		performMove: function(movement) {
			if (this.bReadyToFire) {
				Crafty.e(this.spell)
					[this.spell](this.locX, this.locY, movement, this, 'Creature');
				this.bReadyToFire = this.bShooting = false;
			}
			else {
				this.moveMob(movement);
				this.searchForTreasure();
				this.lookForExit();
			}
		}
	});

	Crafty.c('Fighter', {

		Fighter: function(x, y, controls) {
			this.requires('Player');

			this.equipment = {
				shirt: 0,
				pants: 0,
				boots: 0,
				helm: 0,
				shield: 0,
				sword: 0
			}

			this.class = 'fighter';

			this.Player(x, y, 'fighter', controls);
			this.calcStats();

			return this;
		},
		performMove: function(movement) {
			this.moveMob(movement);
			this.searchForTreasure();
			this.lookForExit();
		}
	});

}