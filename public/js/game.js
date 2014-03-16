window.g_gameDialog = {
	FatherTim: 'Hello My Child. Your uncle Alistair was a conflicted man but is in a better place now.',
	MissPigeon: 'Mr Van Buren hired my darling Jack as a bodyguard. He is an ace shot. But where has he gone?  *sob*',
	MadameLucard: 'Alistair learned something he should not have known.  I would suggest you stop prying into it.'
};
function init_fx() {


	Crafty.c('FloatingText', {

		FloatingText: function(x, y, txt, color, speed) {
			this.requires('2D, ' + RENDERING_MODE + ', Text, Tween')
				.attr({ w: 320, h: 20, x: x*TILE_WIDTH + TILE_WIDTH/2, y: y*TILE_HEIGHT, z: 200 })
				.textColor(color, 1)
				.text(txt)
				.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
				//.css({ 'font-size': '16pt', 'font-weight': 'bold', 'font-family': GAME_FONT })
				.tween({ y: y*TILE_HEIGHT - 48 }, speed || 25)
				.bind('TweenEnd', function() {
					this.destroy();
				});
			return this;
		}
	});

	Crafty.c('SlashEffect', {
		SlashEffect: function() {
			this.requires('2D, ' + RENDERING_MODE + ', slash_effect, SpriteAnimation')
				.animate('slashE', [[0*TILE_WIDTH, 0], [1*TILE_WIDTH, 0], [2*TILE_WIDTH, 0]])
				.animate('slashW', [[0*TILE_WIDTH, TILE_HEIGHT], [1*TILE_WIDTH, TILE_HEIGHT], [2*TILE_WIDTH, TILE_HEIGHT]])
				.attr({ z: 200 });

			this.visible = false;

			return this;
		},
		showSlash: function(x, y, direction) {
			var reel = 'slashW';
			if (direction.x > 0 || direction.y > 0) {
				reel = 'slashE';
			}
			this.attr({ x: x, y: y }).stop().bind('AnimationEnd', function() {
				this.visible = false;
			});
			;

			this.visible = true;
			this.animate(reel, 3, 0);
		}
	});

	Crafty.c('IchorExplode', {
		IchorExplode: function(x, y) {
			this.requires('2D, ' + RENDERING_MODE + ', ichorExplode, SpriteAnimation')
				.animate('explode', 4, 1, 7)
				.attr({ x: x, y: y, z: 200 })
				.bind('AnimationEnd', function() {
					this.destroy();
				});

			this.animate('explode', 30, 0);
			g_game.sounds.transform.play();

			return this;
		}
	});


	Crafty.c('LightSource', {

		LightSource: function(cx, cy, d, intensity, bSkipFlicker) {
			if (!cy) {
				var parentEl = cx;
				var cx = parentEl.x + parentEl.w/2;
				var cy = parentEl.y + parentEl.h/2;
				var d = TILE_WIDTH*6;
			}

			this.requires('2D, ' + RENDERING_MODE + ', Collision')
				.attr( { x: cx - d/2, y: cy - d/2, w: d, h: d } )
				.collision()
				.bind('EnterFrame', function(frameObj) {
					if (frameObj.frame % 11 == 0) {
						this.lightUp(frameObj.frame);
					}
				});

			this.radius = d;
			this.skipFlicker = bSkipFlicker;
			this.intensity = intensity || 1;
			return this;
		},
		lightUp: function(frame) {
			var d = this.radius;
			var flicker = Math.random();
			//d = d - d/3 + flicker*2*d/3;
			var flicker = this.intensity;
			if (!this.skipFlicker) {
				flicker = Math.min(1, this.intensity - this.intensity/4 + Math.random()*2*this.intensity/4);
			}
			var litObjs = this.hit('LitObject');
			for (var i=0;i<litObjs.length;i++) {
				var dist = Math.sqrt(Math.pow(this.x + d/2 - litObjs[i].obj.x - TILE_WIDTH/2, 2)
					+ Math.pow(this.y + d/2 - litObjs[i].obj.y - TILE_HEIGHT/2, 2));
				litObjs[i].obj.light(flicker*(0.2 + ((d/2) - dist)/(d/2)), frame);
			}
		}
	});

	Crafty.c('LitObject', {

		LitObject: function() {
			this.requires('Collision')
				.collision()
				.bind('EnterFrame', function(frameObj) {
					if (frameObj.frame % 13 == 0) {
						if (this.unlit) {
							this.alpha = 0.0;
						}
						this.unlit = true;
					}
				})

			this.alpha = 0.0;
			this.currentLightingFrame = 0;

			return this;
		},
		light: function(amt, frame) {
			if (this.currentLightingFrame == frame) {
				this.alpha += amt;
			}
			else {
				this.alpha = amt;
				this.currentLightingFrame = frame;
			}
			this.unlit = false;
		}
	});

	Crafty.c('Dialog', {

		Dialog: function(srcX, srcY, text) {
			this.requires('2D, ' + RENDERING_MODE + ', Color, charDialog, Delay')
				.attr({ w: 240, h: 80, z: 200 })
				.attr({ x: srcX - this.w/2, y: srcY - this.h - TILE_HEIGHT/2})
				.color('#aaaaaa');

			this.totalText = text;
			this.currentText = this.totalText.substring(0, 1);
			this.theText = Crafty.e('2D, ' + RENDERING_MODE + ', Text')
				.attr({ w: this.w, h: this.h, x: this.x + 8, y: this.y + 8, z: 210 })
				.text(this.currentText)
				.textColor('#222222', 1)
				.textFont({ size: "12pt", family: GAME_FONT })
				.css({ 'text-align': 'left'});
			this.attach(this.theText);

			this.showNextLetter(1);

			return this;
		},
		showNextLetter: function(c) {
			var self = this;
			this.delay(function() {
				var nextLetter = this.totalText.charAt(c);
				if (nextLetter == '\n') {
					nextLetter = '<br>';
				}
				self.currentText += nextLetter;
				self.theText.text(self.currentText);
				c++;
				if (c <= this.totalText.length) {
					self.showNextLetter(c);
				}
				else {
					self.delay(function() {
						self.destroy();
					}, 2000);
				}
			}, 60);

		}
	});


}
function fadeOutControls() {
	$('div.playerControls').stop().css('opacity', 1);
	$('div.playerControls').animate({ opacity: 0 }, 2000);
}

function updateMiniMap() {
	var drawingCanvas = document.getElementById('canvasMiniMap');
	var context = drawingCanvas.getContext('2d');

	for (var y=0;y<g_game.mapTiles[0].length;y++) {
		for (var x=0;x<g_game.mapTiles.length;x++) {
			context.fillStyle = '#000';
			if (g_game.mapReveal[y][x]) {
				var tile = g_game.mapTiles[x][y];
				if (tile == 1) {
					context.fillStyle = '#005784';
				}
				else if (tile == 2) {
					context.fillStyle = '#31A2F2';
				}
			}
			context.fillRect(x*6,y*3,6,3);
		}
	}
	//if (g_game.mapReveal[g_game.entrance.y/TILE_HEIGHT][g_game.entrance.x/TILE_WIDTH]) {
	//	context.fillStyle = '#44891A';
	//	context.fillRect((g_game.entrance.x/TILE_WIDTH)*6-1,(g_game.entrance.y/TILE_HEIGHT)*3-1,8,4);
	//}
	if (g_game.mapReveal[g_game.exit.y/TILE_HEIGHT][g_game.exit.x/TILE_WIDTH]) {
		context.fillStyle = '#BE2633';
		context.fillRect((g_game.exit.x/TILE_WIDTH)*6-1,(g_game.exit.y/TILE_HEIGHT)*3-1,8,4);
	}

	context.fillStyle = '#fff';
	//context.fillRect(g_game.fighter.locX*6,g_game.fighter.locY*3,6,3);
	context.fillRect(g_game.wizard.locX*6,g_game.wizard.locY*3,6,3);

}

function layoutGUI() {
	$('#divGUI').show();
	var pos = $('#cr-stage').offset();
	$('#imgCharBox').css({
		top: pos.top,
		left: pos.left
	});
	$('#divCharHealth').css({
		left: pos.left + 36*2,
		top: pos.top + 55*2
	});
	$('#divPortrait').css({
		top: pos.top + 15,
		left: pos.left + 16
	});
	$('#charSlot0').css({
		top: pos.top + 53 + 5,
		left: pos.left + 109 + 5
	});
	$('#charSlot1').css({
		top: pos.top + 53 + 5,
		left: pos.left + 165 + 5
	});
	$('#uiNum1').css({
		top: pos.top + 53 + 5 - 3,
		left: pos.left + 109 + 5 + 24
	});
	$('#uiNum2').css({
		top: pos.top + 53 + 5 - 3,
		left: pos.left + 165 + 5 + 24
	});

	$('#imgIchorMeter').css({
		top: pos.top + $('#imgCharBox').height() + 48,
		left: pos.left + 32
	});
	var posMeter = $('#imgIchorMeter').offset();
	$('#divIchorMeter').css({
		top: posMeter.top + 4,
		left: posMeter.left + 4
	});

	$('div.ichorText').css({
		'font-family': GAME_FONT
	})

	$('#canvasMiniMap').css({ width: 64*3, height: 64*3, left: pos.left + $('#cr-stage').width() - 64*3 - 6, top: pos.top + 6 });

}

function showIchorAmount() {
	if (g_game.persona == 0 && g_game.ichorAmount >= 48) {
		g_game.persona = 1;
		loadPersona();
		//g_game.ichorAmount = 0
	}
	else if (g_game.persona == 1 && g_game.ichorAmount >= 90) {
		g_game.persona = 2;
		loadPersona();
	}

	var maxHeight = 153;
	var height = Math.floor(maxHeight * g_game.ichorAmount / 100);
	var posMeter = $('#imgIchorMeter').offset();
	$('#divIchorMeter').css({
		height: height,
		top: posMeter.top + 4 + maxHeight - height
	});
}

function showAddIchor(amt) {
	var id = g_game.nextIchorId || 0 ;
	g_game.nextIchorId = (id + 1) % 6;

	var $txt = $('#ichorText_' + id);
	$txt.text(amt);
	var pos = $('#cr-stage').offset();
	var posMeter = $('#imgIchorMeter').offset();
	$txt.css({
		left: pos.left + VIEW_WIDTH/2,
		top: pos.top + VIEW_HEIGHT/2
	}).show().animate( {
			top: posMeter.top - 20,
			left: posMeter.left + 4
		},
		{
			duration: 600,
			//easing: 'easeOutQuint',
			complete: function() {
				$txt.animate({
						top: posMeter.top + 120
					},
					{
						duration: 1000,
						complete: function() {
							g_game.ichorAmount = Math.min(100, g_game.ichorAmount + amt);
							showIchorAmount();
							$txt.hide();
						}
					}
				)
			}
		}
	);


}

function loadPersona() {
	var xTile = g_game.wizard.x / TILE_WIDTH;
	var yTile = g_game.wizard.y / TILE_HEIGHT;
	Crafty.e('IchorExplode').IchorExplode(g_game.wizard.x, g_game.wizard.y);
	g_game.wizard.destroy();
	if (g_game.persona == 2) {
		g_game.wizard = Crafty.e('Caster')
			.Caster(xTile, yTile, g_game.wizardControls);
		$('#uiNum1').show();
		$('#uiNum2').show();
	}
	else if (g_game.persona == 1) {
		g_game.wizard = Crafty.e('Gunman')
			.Gunman(xTile, yTile, g_game.wizardControls);
		$('#uiNum1').show();
		$('#uiNum2').hide();
	}
	else {
		g_game.wizard = Crafty.e('Peasant')
			.Peasant(xTile, yTile, g_game.wizardControls);
		$('#uiNum1').show();
		$('#uiNum2').hide();
	}

	g_game.wizard.speak('Where am I?')

}
function init_Mob() {

	Crafty.c('Mob', {
		locX: 0,
		locY: 0,
		health: 10,
		maxHealth: 10,
		mana: 4,
		maxMana: 4,
		offense: 6,
		defense: 6,
		level: 1,

		Mob: function(x, y, type) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, Delay');

			if (type) {
				this.addComponent(type.toLowerCase());
			}
			if (x !== undefined) {
				this.attr( { x: x * TILE_WIDTH, y: y * TILE_HEIGHT, z: 100 } );
			}
			if (!this.has('LitObject')) {
				this.addComponent('LitObject');
				this.LitObject();
			}
			// make sure collision box is not too big
			this.collision(new Crafty.polygon([[this.w/2 - TILE_WIDTH/2, this.h - TILE_HEIGHT], [this.w/2 + TILE_WIDTH/2, this.h - TILE_HEIGHT], [this.w/2 + TILE_WIDTH/2, this.h/2 + TILE_HEIGHT/2], [this.w/2 - TILE_WIDTH/2, this.h/2 + TILE_HEIGHT/2]]));

			this.locX = x;
			this.locY = y;

			return this;
		},
		moveMob: function(movement) {
			this.locX += movement.x;
			this.locY += movement.y;
			if (movement.x < 0) {
				this.flip();
			}
			else if (movement.x > 0){
				this.unflip();
			}
			this.moveToLoc();
			var walls = this.hit('solid');
			if (walls) {
				this.locX -= movement.x;
				this.locY -= movement.y;
				this.moveToLoc();
			}
			else {
				var mobs = this.hit('Mob');
				if (mobs) {
					this.attackMob(mobs[0].obj, movement);
					this.locX -= movement.x;
					this.locY -= movement.y;
					this.moveToLoc();
				}
			}
		},
		moveToLoc: function() {
			this.attr({ x: this.locX * TILE_WIDTH - (this.w/2 - TILE_WIDTH/2), y: this.locY * TILE_HEIGHT - (this.h - TILE_HEIGHT) });
		},
		takeDamage: function(amt, from) {

			this.sleeping = false;
			Crafty.e('FloatingText')
				.FloatingText(this.locX, this.locY, amt, '#BE2633');

			this.health = Math.max(0, this.health - amt);
			this.trigger('HealthChanged');
			if (this.health <= 0) {
				from.addXP(getXPforLevel(this.level));
				// loot
				var rand = Math.random();
				if (rand < 0.2) {
					var item = Math.floor(Math.random() * 4);
					var i = 0;
					for (var key in GAME.EQUIPMENT) {
						if (i == item) {
							Crafty.e('Treasure').Treasure(key, this.level, this.locX + 0.25 + (-0.1 + Math.random()*0.2), this.locY + 0.4);
						}
						i++;
					}
				}
				else {
					if (rand > 0.96) {
						Crafty.e('Potion').Potion(this.locX + (-0.1 + Math.random()*0.2), this.locY, 'potion');
					}
					else {
						Crafty.e('Ichor').Ichor(this.locX + (-0.1 + Math.random()*0.2), this.locY, 'ichor', 3 + Math.floor(7 * Math.random()));
					}
				}

				// flying bones
				for (var i=0;i<1 + Math.floor(Math.random()*2);i++) {
					Crafty.e('2D, ' + RENDERING_MODE + ', ' + (i==0 ? 'skull' : 'bone'))
						.attr({ x: this.x - TILE_WIDTH/3 + 2*Math.random()*TILE_WIDTH/3, y: this.y + TILE_WIDTH/4 + Math.random()*TILE_WIDTH/2, z: this.z+1 })
						.bind('EnterFrame', function() {
							this.frameCount = this.frameCount ? this.frameCount + 1 : 1;
							this.dx = this.dx ? this.dx : 2 - Math.random() * 2;
							this.dy = this.dy ? this.dy : -3 - Math.random() * 2;
							this.dy += 0.2;
							this.duration = this.duration ? this.duration : 15 + 30 * Math.random();
							this.attr({ x: this.x + this.dx, y: this.y + this.dy });
							if (this.frameCount > this.duration) {
								this.destroy();
							}
						});
				}

				this.doDestroy();
			}
		},
		sleep: function() {
			this.sleeping = true;

			this.delay(function() {
				this.sleeping = false;
			}, 4000);
		},
		speak: function(text) {
			Crafty.e('FloatingText').FloatingText(this.locX-1, this.locY
				, text
				, '#0F65CD', 120);

		}
	});

	Crafty.c('Creature', {

		Creature: function(x, y, props) {
			this.requires('Mob')
				.bind('EnterFrame', function(frameObj) {
					// regen
					if (frameObj.frame % 19 == 0) {
						this.mana = Math.min(this.maxMana, this.mana + 1);
					}
					else if (frameObj.frame % 51 == 0) {
						this.health = Math.min(this.maxHealth, this.health + 1);
					}
					// decide move
					if ((frameObj.frame + this.fuzzer) % 50 == 0) {
						if (this.sleeping) {
							Crafty.e('FloatingText')
								.FloatingText(this.locX- 0.5, this.locY, 'zzz', '#31A2F2');
						}
						else {
							var players = Crafty('Player');
							var chase = undefined;
							var closestDist = 10000;
							for (var i=0;i<players.length;i++) {
								var dx = Math.abs(Crafty(players[i]).locX - this.locX);
								var dy = Math.abs(Crafty(players[i]).locY - this.locY);
								var dist = dx + dy;
								if (dx <= 10 && dy <= 10 && dist < closestDist) {
									chase = Crafty(players[i]);
									closestDist = dist;
								}
							}
							if (chase) {
								// go after player
								var dx = chase.locX - this.locX;
								var dy = chase.locY - this.locY;
								var movement = { x: (dx ? Math.abs(dx)/dx : 0), y: (dy ? Math.abs(dy)/dy : 0) };
								var dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
								if (props.type == 'caster' && this.mana >= GAME.SPELLS[props.spell].mana && (dist <= Math.abs(dx) || dist <= Math.abs(dy))) {
									// cast spell
									Crafty.e('FloatingText')
										.FloatingText(this.locX - 0.5, this.locY, getRandomScream(), '#500000', 50);
									this.delay(function() {
										Crafty.e(props.spell)
											[props.spell](this.locX, this.locY, movement, this, 'Player');
										this.mana -= GAME.SPELLS[props.spell].mana;
										g_game.sounds[GAME.SPELLS[props.spell].sound].play();
									}, 500);

								}
								else {
									this.moveMob(movement);
								}
							}
						}
					}
				}).Mob(x, y, props.sprite);

			this.level = props.level;
			this.maxHealth = this.health = props.health;
			this.maxMana = this.mana = props.mana;
			this.offense = props.offense;
			this.defense = props.defense;
			this.fuzzer = Math.floor(Math.random() * 50);

			return this;
		},
		addXP: function(amt) {
		},
		attackMob: function(mob, movement) {
			if (mob.has('Player')) {
				mob.takeDamage(this.calcDamageTo(mob), this);
				g_game.slashEffects.getNextEffect().showSlash(mob.x, mob.y, movement);
				g_game.sounds.hurt1.play();
			}
		},
		doDestroy: function() {
			if (this.iAmBoss) {
				g_game.exit.removeComponent('exit_closed').addComponent('exit');
			}
			this.destroy();
		},
		calcDamageTo: function(mob) {
			return this.offense;
		}
	});

	Crafty.c('DialogChar', {

		DialogChar: function(name) {
			this.requires('Mob')
				.Mob();

			this.charName = name;

			return this;
		},
		showDialog: function() {
			Crafty.e('Dialog').Dialog(this.x + this.w/2, this.y, g_gameDialog[this.charName]);
		}
	});
}
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
				}).bind('HealthChanged', function() {
					this.showHealth();
				}).Mob(x, y, type)

			this.playerType = type;
			this.health = this.maxHealth = GAME.CHARLEVELS[this.playerType][0].health;
			this.maxMana = GAME.CHARLEVELS[this.playerType][0].mana;

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 12*TILE_WIDTH, 1, true);
			this.attach(lightSource);

			this.playerControls = controls;

			// meters
			this.posCharBox = $('#imgCharBox').offset();
			this.$healthBar = $('#divCharHealth');
			this.$manaBar = $('#divCharMana');
			this.$nameText = $('#divCharNameText');
			this.$nameText.css({ left: this.posCharBox.left + 54*2, top: this.posCharBox.top + 7*2, 'font-family': GAME_FONT, 'font-size': '12pt', 'font-weight': 'bold' });
			this.$imgPortrait = $('#divPortrait');

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
			this.showHealth();

			return this;
		},
		showHealth: function() {
			var width = Math.floor(96 * this.health/this.maxHealth);
			this.$healthBar.css({ width: width });
		},
		addXP: function(amt) {
		},
		searchForTreasure: function() {
			var treasures = this.hit('loot');
			if (treasures) {
				for (var i=0;i<treasures.length;i++) {
					var treasure = treasures[0].obj;
					if (treasure.has('Treasure')) {
						if (GAME.EQUIPMENT[treasure.treasureType].classes.indexOf(this.class) != -1 && treasure.treasureLevel > this.equipment[treasure.treasureType]) {
							//this[treasure.treasureType].sprite(GAME.EQUIPMENT[treasure.treasureType].slot*TILE_WIDTH, treasure.treasureLevel*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
							this.equipment[treasure.treasureType] = treasure.treasureLevel;
							treasure.destroy();
							g_game.sounds.pickup.play();
							Crafty.e('FloatingText').FloatingText(this.locX-1, this.locY
								, getTextForLoot(treasure.treasureLevel, treasure.treasureType) + ' ' + treasure.treasureType
								, '#A3CE27', 120);

							this.dressInEquipment();
						}
					}
					else if (treasure.has('Ichor')) {
						showAddIchor(treasure.treasureAmt);
						treasure.destroy();
						g_game.sounds.pickup.play();
						//Crafty.e('FloatingText').FloatingText(this.locX, this.locY
						//	, treasure.treasureAmt
						//	, '#5193FF');

					}
					else if (treasure.has('Potion')) {
						g_game.wizard.health = Math.min(g_game.wizard.maxHealth, g_game.wizard.health + 1);
						this.showHealth();
						treasure.destroy();
						g_game.sounds.pickup.play();
						Crafty.e('FloatingText').FloatingText(this.locX, this.locY
							, '+'
							, '#156615');

						showIchorAmount();
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
				g_game['equipment_' + this.class] = JSON.stringify(this.equipment);
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
			// casting offense only
			for (var key in this.equipment) {
				if (key && GAME.EQUIPMENT[key].slot == 0) {
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
			else if (mob.has('DialogChar')) {
				mob.showDialog();
			}
		},
		doDestroy: function() {
			g_game.wizard.destroy();
			if (g_game.persona == 0) {
				setTimeout(function() {
					Crafty.scene("death");
				}, 3000);
			}
			else {
				g_game.persona -= 1;
				g_game.ichorAmount = 0;
				loadPersona();
				showIchorAmount();
			}
		}
	});


	Crafty.c('Caster', {
		bCasting: false,
		bReadyToCast: false,

		Caster: function(x, y, controls) {
			this.requires('Player, Delay')
				.bind('KeyDown', function(evt) {
					if (evt.key == Crafty.keys['1'] && this.equipment.sceptre > 0 && !this.bCasting) {
						this.bCasting = true;
						g_game.sounds.lockandload.play();
						this.spell = 'Fireball';

						this.delay(function() {
							this.bReadyToCast = true;
							Crafty.e('FloatingText')
								.FloatingText(this.locX - 0.5, this.locY, 'Ort Por', '#31A2F2', 50);
						}, 500);
					}
					else if (evt.key == Crafty.keys['2'] && this.equipment.book > 0 && !this.bCasting) {
						this.bCasting = true;
						g_game.sounds.lockandload.play();
						var words = 'Kal Zu';
						if (this.equipment.book == 2) {
							this.spell = 'FireStorm';
							words = 'Vas Flam';
						}
						else if (this.equipment.book == 3) {
							this.spell = 'LighteningStorm';
							words = 'Grav Ex';
						}
						else {
							this.spell = 'Sleep';
							words = 'Kal Zu';
						}

						this.delay(function() {
							this.bReadyToCast = true;
							Crafty.e('FloatingText')
								.FloatingText(this.locX - 0.5, this.locY, 'Kal Zu', '#31A2F2', 50);
						}, 500);
					}
				});

			this.class = 'caster';

			var equip = g_game['equipment_' + this.class];
			if (equip) {
				this.equipment = $.parseJSON(equip);
			}
			else {
				this.equipment = {
					sceptre: 1,
					book: 1
				};
			}

			this.Player(x, y, 'caster', controls);
			this.$nameText.html('Alistair<br>&nbsp;&nbsp;&nbsp;Van Buren');
			this.$imgPortrait.removeClass().addClass('charPortrait portrait-caster');
			this.calcStats();

			return this;
		},
		performMove: function(movement) {
			if (this.bReadyToCast) {
				Crafty.e(this.spell)
					[this.spell](this.locX, this.locY, movement, this, 'Creature');

				this.bReadyToCast = this.bCasting = false;

				g_game.ichorAmount = Math.max(0, g_game.ichorAmount - GAME.SPELLS[this.spell].mana);
				showIchorAmount();
				if (g_game.ichorAmount == 0) {
					loadPersona();
				}
			}
			else if (this.bCasting) {
				// cannot move
				return;
			}
			else {
				this.moveMob(movement);
				this.searchForTreasure();
				this.lookForExit();
			}
		},
		calcDamageTo: function(mob) {
			return 1;
		}

	});

	Crafty.c('Gunman', {
		bShooting: false,
		bReadyToFire: false,

		Gunman: function(x, y, controls) {
			this.requires('Player, Delay')
				.bind('KeyDown', function(evt) {
					if (evt.key == Crafty.keys['1'] && this.equipment.pistol > 0 && !this.bShooting) {
						this.bShooting = true;
						g_game.sounds.lockandload.play();
						this.spell = 'Bullet';

						this.delay(function() {
							this.bReadyToFire = true;
							Crafty.e('FloatingText')
								.FloatingText(this.locX - 0.5, this.locY, 'loaded', '#31A2F2', 16);
						}, 500);
					}
				});

			this.class = 'gunman';

			var equip = g_game['equipment_' + this.class];
			if (equip) {
				this.equipment = $.parseJSON(equip);
			}
			else {
				this.equipment = {
					pistol: 1,
					knuckles: 1
				};
			}

			this.Player(x, y, 'gunman', controls);
			this.$nameText.html('Pidgeon<br>&nbsp;&nbsp;&nbsp;Jack');
			this.$imgPortrait.removeClass().addClass('charPortrait portrait-gunman');
			this.calcStats();

			return this;
		},
		performMove: function(movement) {
			if (this.bReadyToFire) {
				Crafty.e(this.spell)
					[this.spell](this.locX, this.locY, movement, this, 'Creature');
				this.bReadyToFire = this.bShooting = false;
			}
			else if (this.bShooting) {
				// cannot move
				return;
			}
			else {
				this.moveMob(movement);
				this.searchForTreasure();
				this.lookForExit();
			}
		},
		calcDamageTo: function(mob) {
			return GAME.EQUIPMENT.knuckles.offense[this.equipment.knuckles];
		}
	});

	Crafty.c('Peasant', {
		bShooting: false,
		bReadyToFire: false,

		Peasant: function(x, y, controls) {
			this.requires('Player, Delay')
				.bind('KeyDown', function(evt) {
					if (evt.key == Crafty.keys['1'] && this.equipment.pistol > 0 && !this.bShooting) {
						this.bShooting = true;
						g_game.sounds.lockandload.play();
						this.spell = 'Bullet';

						this.delay(function() {
							this.bReadyToFire = true;
							Crafty.e('FloatingText')
								.FloatingText(this.locX - 0.5, this.locY, 'loaded', '#31A2F2', 16);
						}, 500);
					}
				});

			this.class = 'peasant';

			var equip = g_game['equipment_' + this.class];
			if (equip) {
				this.equipment = $.parseJSON(equip);
			}
			else {
				this.equipment ={
					pistol: 0,
					knife: 0
				};
			};

			this.Player(x, y, 'peasant', controls);
			this.$nameText.html('Rebecca<br>&nbsp;&nbsp;&nbsp;Van Buren');
			this.$imgPortrait.removeClass().addClass('charPortrait portrait-peasant');
			this.calcStats();

			return this;
		},
		performMove: function(movement) {
			if (this.bReadyToFire) {
				Crafty.e(this.spell)
					[this.spell](this.locX, this.locY, movement, this, 'Creature');
				this.bReadyToFire = this.bShooting = false;
			}
			else if (this.bShooting) {
				// cannot move
				return;
			}
			else {
				this.moveMob(movement);
				this.searchForTreasure();
				this.lookForExit();
			}
		},
		calcDamageTo: function(mob) {
			return GAME.EQUIPMENT.knife.offense[this.equipment.knife];
		}
	});

}
function init_scenes() {

	Crafty.scene("main", function () {
		Crafty.background("#000");


		for (var i=0;i<10;i++) {
			g_game.slashEffects.objArray.push(Crafty.e('SlashEffect').SlashEffect());
		}

		var w = 50, h = 50;
		g_game.mapTiles = [];
		for (var x=0;x<w;x++) {
			g_game.mapTiles[x] = [];
			for (var y=0;y<h;y++) {
				g_game.mapTiles[x][y] = 0;
			}
		}

		var generator = new ROT.Map.Uniform(w, h, {
			roomWidth: [4, 10],
			roomHeight: [4, 10],
			timeLimit: 10000
		});

		for (var i=0; i<4; i++) {
			generator.create();
		}
		generator.create(function(x,y,v) {
			if (v === 0) {
				g_game.mapTiles[x][y] = 1;
			}
		});

		// make walls
		for (var y=0;y<h;y++) {
			for (var x=0;x<w;x++) {
				if (g_game.mapTiles[x][y] == 1) {
					for (var i=-1;i<=1;i++) {
						for (var j=-1;j<=1;j++) {
							if (g_game.mapTiles[x+j] && g_game.mapTiles[x+j][y+i] !== undefined && g_game.mapTiles[x+j][y+i] === 0){
								g_game.mapTiles[x+j][y+i] = 2;
							}
						}
					}
				}
			}
		}

		g_game.mapReveal = [];

		var bEntrancePlaced = false;
		for (var y=0;y<g_game.mapTiles[0].length;y++) {
			g_game.mapReveal[y] = [];
			for (var x=0;x<g_game.mapTiles.length;x++) {
				g_game.mapReveal[y][x] = false;
				var tile = g_game.mapTiles[x][y];
				if (tile == 2) {
					var sprite = GAME.DUNGEONLEVELS[g_game.curLevel].graphics.wall;
					if (false) { //!bEntrancePlaced) {
						g_game.entrance = Crafty.e('2D, ' + RENDERING_MODE + ', Collision, LitObject, entrance')
							.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 130 })
							.LitObject()
							.collision();
						g_game.entrance.bIamEntrance = true;
						bEntrancePlaced = true;
					}
					else {
						Crafty.e('2D, ' + RENDERING_MODE + ', Collision, LitObject, solid, ' + sprite)
							.attr({ x: x*TERRAIN_WIDTH, y: y*TILE_HEIGHT, z: 100})
							.LitObject()
							.collision(new Crafty.polygon([0, 0], [0, TILE_HEIGHT], [TILE_WIDTH, TILE_HEIGHT], [TILE_WIDTH, 0]));
					}
				}
				else if (tile == 1) {
					// floor
					Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].graphics.floor + ', Collision, LitObject')
						.attr({ x: x*TERRAIN_WIDTH, y: y*TILE_HEIGHT, z: 1})
						.LitObject()
						.collision();
				}
			}
		}

		layoutGUI();
		var bPlayerPlaced = false;
		for (var y=0;y<g_game.mapTiles[0].length;y++) {
			for (var x=0;x<g_game.mapTiles.length;x++) {
				if (g_game.mapTiles[x][y] == 1) {
					if (!bPlayerPlaced) {
						if (g_game.persona == 1) {
							g_game.wizard = Crafty.e('Gunman')
								.Gunman(x, y, g_game.wizardControls);
						}
						else if (g_game.persona == 2) {
							g_game.wizard = Crafty.e('Caster')
								.Caster(x, y, g_game.wizardControls);
						}
						else {
							g_game.wizard = Crafty.e('Peasant')
								.Peasant(x, y, g_game.wizardControls);
						}
						bPlayerPlaced = true;
					}
				}
			}
		}

		var bBossPlaced = false;
		var bExitPlaced = false;
		var dungeonLevel = GAME.DUNGEONLEVELS[g_game.curLevel];
		for (var y=g_game.mapTiles[0].length-1;y>=0;y--) {
			for (var x=g_game.mapTiles.length-1;x>=0;x--) {
				var difPlayerX = g_game.wizard.x/TILE_WIDTH - x;
				var difPlayerY = g_game.wizard.y/TILE_HEIGHT - y;
				if (!(Math.abs(difPlayerX) < 6 && Math.abs(difPlayerY) < 6)) {		// not near player, please
					if (g_game.mapTiles[x][y] == 1 && Math.random() < dungeonLevel.spawnRate) {
						var rand = Math.random() * 10;
						var bMobPlaced = false;
						var chanceTotal = 0;
						for (var i=1;!bMobPlaced && i<dungeonLevel.mobs.length;i++) {
							var mob = dungeonLevel.mobs[i];
							if (rand < mob.prob + chanceTotal) {
								if (!bExitPlaced) {
									g_game.exit = Crafty.e('2D, ' + RENDERING_MODE + ', exit_closed, Collision, LitObject')
										.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 90})
										.collision()
										.LitObject();
									bExitPlaced = true;
									bMobPlaced = true;
								}
								else if(!bBossPlaced) {
									var placedMob = Crafty.e('Creature').Creature(x, y, dungeonLevel.mobs[0]);
									placedMob.iAmBoss = true;
									bMobPlaced = true;
									bBossPlaced = true;
								}
								else {
									var placedMob = Crafty.e('Creature').Creature(x, y, mob);
									bMobPlaced = true;
								}
							}
							chanceTotal += mob.prob;
						}
					}
				}
			}
		}
		for (var i=0;i<dungeonLevel.mobs.length;i++) {
			console.log(Crafty(dungeonLevel.mobs[i].sprite).length + ' ' + dungeonLevel.mobs[i].sprite + ' created...');
		}

		showIchorAmount();
		centerOnPlayers();

	});


	Crafty.scene("mansion", function () {

		g_game.equipment_peasant = '';
		g_game.equipment_gunman = '';
		g_game.equipment_caster = '';

		g_game.curLevel = -1;

		g_game.mapTiles = [];
		g_game.mapReveal = [];

		for (var i=0;i<g_game.map.layers.length;i++) {
			if (g_game.map.layers[i].type == 'objectgroup') {
				// objects
				for (var j=0;j<g_game.map.layers[i].objects.length;j++) {
					var obj = g_game.map.layers[i].objects[j];
					var el = Crafty.e('2D, ' + RENDERING_MODE + ', LitObject, maptile_' + obj.gid
							+ (obj.properties && obj.properties.components ? ',' + obj.properties.components : ''))
						.attr({ x: obj.x, y: obj.y, z: 110 })
						.LitObject();
					if (obj.properties && obj.properties.entity) {
						el.addComponent(obj.properties.entity);
						if (el[obj.properties.entity]) {
							el[obj.properties.entity].apply(el, obj.properties.arguments ? obj.properties.arguments.split(',') : []);
						}
					}
					if (obj.properties && obj.properties.contains) {
						var contained = Crafty.e(obj.properties.contains);
						contained[obj.properties.contains](el);
					}
					/*if (obj.properties && obj.properties.components) {
						var comps = obj.properties.components.split(',');
						for (var c=0;c<comps.length;c++) {
							el.addComponent(comps[c]);
						}
					}*/

				}
			}
			else if (g_game.map.layers[i].type == 'tilelayer') {
				// tiles
				for (var y=0;y<g_game.map.layers[i].height;y++) {
					g_game.mapTiles[y] = [];
					g_game.mapReveal[y] = [];
					for (var x=0;x<g_game.map.layers[i].width;x++) {
						g_game.mapTiles[y][x] = 0;
						g_game.mapReveal[y][x] = false;
						var tile = g_game.map.layers[i].data[x + y * g_game.map.layers[i].width];
						if (tile > 0) {
							var el = Crafty.e('2D, ' + RENDERING_MODE + ', LitObject, maptile_' + g_game.map.layers[i].data[x + y * g_game.map.layers[i].width])
								.attr({ x: x * g_game.map.tilewidth, y: y * g_game.map.tileheight, z: 1 })
								.LitObject();
							if (g_game.map.layers[i].properties && g_game.map.layers[i].properties.components && g_game.map.layers[i].properties.components.indexOf('solid') != -1) {
								el.addComponent('solid');
								el.collision(new Crafty.polygon([0, 0], [TILE_WIDTH, 0],[TILE_WIDTH, TILE_HEIGHT], [0, TILE_HEIGHT]));
								el.attr({ z: 100 });
								g_game.mapTiles[x][y] = 2;
							}
						}
					}
				}
			}
		}

		layoutGUI();
		g_game.wizard = Crafty.e('Peasant')
			.Peasant(15, 28, g_game.wizardControls);

		showIchorAmount();
		centerOnPlayers();

		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 2*TILE_WIDTH, y: 32 * TILE_HEIGHT, z: 1000 })
			.text("Mystery of the Unearthly Ichor")
			.textColor('#9D9D9D', 1)
			.textFont({ size: "32pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})

		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 8*TILE_WIDTH, y: 34 * TILE_HEIGHT, z: 1000 })
			.text("created for 7drl by Sanojian")
			.textColor('#777777', 1)
			.textFont({ size: "14pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})

		Crafty.e('2D, ' + RENDERING_MODE + ', Text, LitObject').attr({ w: 400, h: 32, x: 20*TILE_WIDTH, y: 6 * TILE_HEIGHT, z: 1000 })
			.text("tiles by Oryx")
			.textColor('#666666', 1)
			.textFont({ size: "14pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})
			.LitObject();

		Crafty.e('2D, ' + RENDERING_MODE + ', Text, LitObject').attr({ w: 400, h: 32, x: 27*TILE_WIDTH, y: 0 * TILE_HEIGHT, z: 1000 })
			.text("music by Deceased Superior Technician")
			.textColor('#666666', 1)
			.textFont({ size: "14pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})
			.LitObject();

		playSong('DST-PeacefulStreets');
	});

	Crafty.scene("loading", function () {
		Crafty.background("#000");
		//try {
		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: 800, h: 20, x: VIEW_WIDTH/2 - 400, y: VIEW_HEIGHT/2-160, z: 1000 })
			.text("Loading...")
			.textColor('#fff', 1)
			.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
		//.css({ "text-align": "center", "font-family": GAME_FONT, "font-size": "44px" });
		//} catch (ex) {;}

		Crafty.load(['./images/equipment_fighter.png','./images/equip_icons_fighter.png'
			,'./images/equipment_wizard.png', './images/equip_icons_wizard.png', './images/oryx_roguelike_16x24.png'
			,'./audio/sfx/swing1.wav', './audio/sfx/swing2.wav','./audio/sfx/swing3.wav'
			,'./audio/sfx/hurt1.wav','./audio/sfx/pickup.wav','./audio/sfx/arrow.wav'
			,'./audio/sfx/missle.wav', './audio/sfx/missle_hit.wav', './audio/sfx/fireball.wav'
			,'./audio/sfx/lightening.wav',' ./audio/sfx/lightening_strike.wav'
			,'./images/oryx_roguelike_b_graveyard.png', './images/oryx_roguelike_b_catacombs.png'
			,'./images/oryx_roguelike_b_castle.png','./images/oryx_roguelike_b_temple.png'
			,'./images/oryx_roguelike_b_landmark.png'
			,'./images/oryx_roguelike_portraits.png'
			,'./audio/music/DST-TheHauntedChapel.mp3'
		], function() {

			Crafty.sprite(1, './images/slash_x' + ZOOM + '.png', {
				slash_effect: [0*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/oryx_roguelike_portraits.png', {
				portrait_fighter: [378, 288, 108, 108],
				portrait_wizard: [138, 168, 108, 108]
			});

			Crafty.sprite(TILE_WIDTH, './images/crl_effects_x' + ZOOM + '.png', {
				skull: [12, 16],
				bone: [9, 3],
				smoke: [13, 15],
				fire: [15, 14],
				lightening: [9, 14],
				ichorExplode: [4, 1],
				bullet: [8, 6],
				arrow: [0, 14],
				magic_missle: [0, 1],
				fireball: [0, 1],
				sleep: [12, 15]
			});

			Crafty.sprite(TILE_WIDTH/2, './images/crl_items_x' + ZOOM + '.gif', {
				'pistol-1': [21, 3],
				'pistol-2': [22, 3],
				'pistol-3': [23, 3],
				'knife-1': [0, 2],
				'knife-2': [26, 2],
				'knife-3': [13, 2],
				'knuckles-1': [18, 3],
				'knuckles-2': [19, 3],
				'knuckles-3': [20, 3],
				'sceptre-1': [13, 3],
				'sceptre-2': [16, 3],
				'sceptre-3': [12, 3],
				'book-1': [7, 1],
				'book-2': [6, 1],
				'book-3': [8, 1],
				ichor: [4, 0],
				potion: [23, 0]
			});

			Crafty.sprite(TILE_WIDTH, './images/crl_chars_x' + ZOOM + '.gif', {
				fighter: [0, 0],
				wizard: [2, 4],
				gunman: [3, 4],
				peasant: [3, 1],
				caster: [0, 1],

				neophyte: [5, 3],
				enforcer: [2, 5],
				priest: [4, 3],
				demon: [4, 5]
			});

			Crafty.sprite(1, './images/crl_terrain_x' + ZOOM + '.gif', {
				wall_stone: [0*TERRAIN_WIDTH, 0*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				ceiling_stone: [0*TERRAIN_WIDTH, 0*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				floor_brick: [1*TERRAIN_WIDTH, 5*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				wall_cave: [0*TERRAIN_WIDTH, 6*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				ceiling_cave: [0*TERRAIN_WIDTH, 6*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				floor_cave: [1*TERRAIN_WIDTH, 6*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				wall_sandstone: [0*TERRAIN_WIDTH, 5*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				ceiling_sandstone: [0*TERRAIN_WIDTH, 5*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				floor_sandstone: [1*TERRAIN_WIDTH, 5*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				floor_dirt: [18*TERRAIN_WIDTH, 0*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				wall_muck: [0*TERRAIN_WIDTH, 3*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				ceiling_muck: [0*TERRAIN_WIDTH, 3*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				floor_muck: [1*TERRAIN_WIDTH, 3*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],

				exit_closed: [2*TERRAIN_WIDTH, 9*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				exit: [8*TERRAIN_WIDTH, 9*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT]

			});

			Crafty.sprite(32, './images/crl_mons32_x' + ZOOM + '.gif', {
				snake: [9, 8],
				bat_king: [2, 9],
				bat: [1, 2],
				skeleton: [9, 0],
				skeleton_archer: [8, 0],
				skeleton_magic: [6, 2],
				zombie: [5, 1],
				headless: [1, 7],
				skeleton_warrior: [3, 2],
				skeleton_shooter: [5, 0],
				witch: [2, 3]
			});

			Crafty.sprite(48, './images/crl_mons48_x' + ZOOM + '.gif', {
				king_mummy: [1, 4],
				skeleton_boss: [6, 0]
			});

			Crafty.sprite(1, './images/oryx_roguelike_b_graveyard.png', {
				scene_entrance1: [24, 168, 240, 120],
				scene_entrance2: [24, 310, 240, 120],
				scene_graveyard: [24, 456, 240, 120]
			});

			Crafty.sprite(1, './images/oryx_roguelike_b_catacombs.png', {
				scene_catacombs1: [24, 312, 240, 120],
				scene_catacombs2: [24, 24, 240, 120],
				scene_catacombs3: [24, 456, 240, 120]
			});

			Crafty.sprite(1, './images/oryx_roguelike_b_castle.png', {
				scene_castle1: [24, 744, 240, 120],
				scene_castle2: [24, 168, 240, 120],
				scene_castle3: [24, 312, 240, 120]
			});

			Crafty.sprite(1, './images/oryx_roguelike_b_temple.png', {
				scene_temple1: [24, 312, 240, 120],
				scene_temple2: [24, 24, 240, 120],
				scene_temple3: [24, 168, 240, 120]
			});

			Crafty.sprite(1, './images/oryx_roguelike_b_landmark.png', {
				scene_landmark1: [24, 456, 240, 120]
			});


			g_game.sounds.swing1 = new buzz.sound( "./audio/sfx/swing1", {
				formats: [ "wav" ]
			});
			g_game.sounds.swing2 = new buzz.sound( "./audio/sfx/swing2", {
				formats: [ "wav" ]
			});
			g_game.sounds.swing3 = new buzz.sound( "./audio/sfx/swing3", {
				formats: [ "wav" ]
			});
			g_game.sounds.hurt1 = new buzz.sound( "./audio/sfx/hurt1", {
				formats: [ "wav" ]
			});
			g_game.sounds.missle = new buzz.sound( "./audio/sfx/missle", {
				formats: [ "wav" ]
			});
			g_game.sounds.missle_hit = new buzz.sound( "./audio/sfx/missle_hit", {
				formats: [ "wav" ]
			});
			g_game.sounds.fireball = new buzz.sound( "./audio/sfx/fireball", {
				formats: [ "wav" ]
			});
			g_game.sounds.transform = new buzz.sound( "./audio/sfx/transform", {
				formats: [ "wav" ]
			});
			g_game.sounds.lightening = new buzz.sound( "./audio/sfx/lightening", {
				formats: [ "wav" ]
			});
			g_game.sounds.lightening_strike = new buzz.sound( "./audio/sfx/lightening_strike", {
				formats: [ "wav" ]
			});
			g_game.sounds.lockandload = new buzz.sound( "./audio/sfx/lockandload", {
				formats: [ "wav" ]
			});
			g_game.sounds.gunshot = new buzz.sound( "./audio/sfx/gunshot", {
				formats: [ "wav" ]
			});
			g_game.sounds.arrow = new buzz.sound( "./audio/sfx/arrow", {
				formats: [ "wav" ]
			});
			g_game.sounds.pickup = new buzz.sound( "./audio/sfx/pickup", {
				formats: [ "wav" ]
			});

			//Crafty.scene("intro");
			//Crafty.scene("main");
			//Crafty.scene("splash");
			loadMap('mansion');

		});
	});

	Crafty.scene("death", function () {
		$('#divGUI').hide();
		Crafty.background("#000");

		Crafty.viewport.x = 0;
		Crafty.viewport.y = 0;

		Crafty.e('2D, ' + RENDERING_MODE + ', scene_graveyard')
			.attr({ x: VIEW_WIDTH/2 - 240/2, y: VIEW_HEIGHT/3 - 120/2, z: 1 })


		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 0, y: 32, z: 1000 })
			.text('Death')
			.textColor('#9D9D9D', 1)
			.textFont({ size: "24pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})


		Crafty.e('2D, ' + RENDERING_MODE + ', Text, Keyboard').attr({ w: VIEW_WIDTH, x: 0, y: VIEW_HEIGHT-160, z: 1000 })
			.text("Type space to try again...")
			.textColor('#9D9D9D', 1)
			.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})
			.bind('KeyDown', function(evt) {
				if (evt.key == Crafty.keys.SPACE) {
					Crafty.scene("mansion");
				}
			})


	});


	Crafty.scene("splash", function () {
		$('#divGUI').hide();
		Crafty.background("#000");

		g_game.curLevel = g_game.curLevel || 0;

		Crafty.viewport.x = 0;
		Crafty.viewport.y = 0;

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic1)
			.attr({ x: VIEW_WIDTH/2 - 240/2, y: VIEW_HEIGHT/3 - 120/2, z: 1 })

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic2)
			.attr({ x: VIEW_WIDTH/2 - 2*240 + 90, y: VIEW_HEIGHT/3, z: 1 })

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic3)
			.attr({ x: VIEW_WIDTH/2 + 240 - 90, y: VIEW_HEIGHT/3, z: 1 })

		// example mob
		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].mobs[1].sprite)
			.attr({ x: VIEW_WIDTH/2 + 60, y: VIEW_HEIGHT/2, z: 100 })

		var speaking = 'peasant';
		if (g_game.curLevel == GAME.DUNGEONLEVELS.length-1) {
			speaking = 'peasant';
		}
		else if (g_game.persona == 1) {
			speaking = 'gunman';
		}
		else if (g_game.persona == 2) {
			speaking = 'caster';
		}
		var speaker = Crafty.e('2D, ' + RENDERING_MODE + ', Color, charPortrait, portrait-' + speaking)
			.attr({ x: VIEW_WIDTH/2 - 60, y: 2*VIEW_HEIGHT/3, w: 82, h: 86, z: 100 })
			//.color('#ffffff');

		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 0, y: 16, z: 1000 })
			.text("Stage " + (parseInt(g_game.curLevel, 10) + 1))
			.textColor('#9D9D9D', 1)
			.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})

		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 0, y: 40, z: 1000 })
			.text(GAME.DUNGEONLEVELS[g_game.curLevel].name)
			.textColor('#9D9D9D', 1)
			.textFont({ size: "24pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})


		var dlgCounter = 0;
		var dlgInterval = setInterval(function() {
			if (dlgCounter >= GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.dialog.length) {
				clearInterval(dlgInterval);
				Crafty.e('2D, ' + RENDERING_MODE + ', Text, Keyboard').attr({ w: VIEW_WIDTH, x: 0, y: VIEW_HEIGHT-48, z: 1000 })
					.text((g_game.curLevel == GAME.DUNGEONLEVELS.length-1) ? "Thanks for playing.  Space to restart.." : "Type space to continue...")
					.textColor('#9D9D9D', 1)
					.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
					.css({ 'text-align': 'center'})
					.bind('KeyDown', function(evt) {
						if (evt.key == Crafty.keys.SPACE) {
							if (g_game.curLevel == GAME.DUNGEONLEVELS.length-1) {
								localStorage.curLevel = 0;
								Crafty.scene("mansion");
							}
							else {
								Crafty.scene("main");
							}
						}
					})
			}
			else {
				var dialog = GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.dialog[dlgCounter];
				Crafty.e('FloatingText')
					.FloatingText(speaker.x/TILE_WIDTH - 2, speaker.y/TILE_HEIGHT - 1,
						dialog.text, '#0F65CD', 90);

				dlgCounter++;
			}

		}, 2000);

		playSong(GAME.DUNGEONLEVELS[g_game.curLevel].song);

	});

}
function init_Spells() {

	Crafty.c('Spell', {
		calcSpellDamage: function(props, caster) {
			var damage = props.damage + Math.ceil(Math.random() * props.damage * this.caster.offense/4);
			return damage;
		}
	});

	Crafty.c('Arrow', {
		speed: GAME.SPELLS.Arrow.speed*3,
		range: GAME.SPELLS.Arrow.range*3,

		Arrow: function(x, y, direction, caster, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, Spell, arrow')
				.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 100})
				.bind('EnterFrame', function(frameObj) {
					this.attr({ x: this.x + direction.x*this.speed, y: this.y + direction.y*this.speed });
					this.range -= this.speed;
					if (this.range <= 0) {
						this.destroy();
					}
					else if (this.hit('solid')) {
						this.destroy();
					}
					else if (this.hit(target)) {
						var creatures = this.hit(target);
						for (var i=0;i<creatures.length;i++) {
							var xp = creatures[i].obj.takeDamage(this.damage*this.caster.offense, this.caster);
						}
						this.destroy();
					}
				}).collision()

			this.caster = caster;
			this.damage = this.calcSpellDamage(GAME.SPELLS.Arrow, caster);
			if (direction.y < 0) {
				this.sprite(3, 14);
			}
			else if (direction.x < 0) {
				this.sprite(2, 14);
			}
			else if (direction.y > 0) {
				this.sprite(1, 14);
			}

			return this;
		}
	});

	Crafty.c('Bullet', {
		speed: GAME.SPELLS.Bullet.speed*ZOOM,
		range: GAME.SPELLS.Bullet.range*ZOOM,

		Bullet: function(x, y, direction, caster, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, Spell, bullet')
				.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 100})
				.bind('EnterFrame', function(frameObj) {
					this.attr({ x: this.x + direction.x*this.speed, y: this.y + direction.y*this.speed });
					this.range -= this.speed;
					if (this.range <= 0) {
						this.destroy();
					}
					else if (this.hit('solid')) {
						this.destroy();
					}
					else if (this.hit(target)) {
						var creatures = this.hit(target);
						for (var i=0;i<creatures.length;i++) {
							var xp = creatures[i].obj.takeDamage(this.damage*this.caster.offense, this.caster);
						}
						this.destroy();
					}
				}).collision()

			this.caster = caster;
			this.damage = this.calcSpellDamage(GAME.SPELLS.Bullet, caster);
			g_game.sounds[GAME.SPELLS.Bullet.sound].play();
			if (direction.y > 0) {
				this.sprite(11, 6);
			}
			else if (direction.x < 0) {
				this.sprite(10, 6);
			}
			else if (direction.y < 0) {
				this.sprite(9, 6);
			}

			return this;
		}
	});

	Crafty.c('AOESpell', {
		exploded: false,

		AOESpell: function(x, y, direction, caster, target, def) {
			this.spellDef = def;
			this.speed =  this.spellDef.speed*3;
			this.range = this.spellDef.range*3;

			this.requires('2D, ' + RENDERING_MODE + ', Collision, Spell, smoke, SpriteAnimation, Delay')
				.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 200})
				.animate('explode', [[1*TILE_WIDTH, 8*TILE_HEIGHT], [2*TILE_WIDTH, 8*TILE_HEIGHT], [3*TILE_WIDTH, 8*TILE_HEIGHT], [4*TILE_WIDTH, 8*TILE_HEIGHT]])
				.bind('EnterFrame', function(frameObj) {
					if (this.exploded) {
						return;
					}
					this.attr({ x: this.x + direction.x*this.speed, y: this.y + direction.y*this.speed });
					this.range -= this.speed;
					if (this.range <= 0) {
						this.explode();
					}
					else if (this.hit('solid')) {
						this.explode();
					}
					else if (this.hit(target)) {
						this.explode();
					}
				}).collision()

			this.caster = caster;
			this.target = target;

			return this;
		}
	});

	Crafty.c('LighteningStorm', {

		LighteningStorm: function(x, y, direction, caster, target) {
			this.requires('AOESpell')
				.AOESpell(x, y, direction, caster, target, GAME.SPELLS.FireStorm)

			this.caster = caster;

			return this;
		},
		explode: function() {
			this.exploded = true;
			this.attr({ x: this.x - this.x % TILE_WIDTH, y: this.y - this.y % TILE_HEIGHT });
			this.stop().animate('explode', 10, 0);
			this.delay(function() {
				for (var y=0-GAME.SPELLS.FireStorm.aoe;y<=GAME.SPELLS.FireStorm.aoe;y++) {
					for (var x=0-GAME.SPELLS.FireStorm.aoe;x<=GAME.SPELLS.FireStorm.aoe;x++) {
						if (Math.abs(x) + Math.abs(y) <= GAME.SPELLS.Sleep.aoe) {
							Crafty.e('Electricity').Electricity(this.x + x*TILE_WIDTH, this.y + y*TILE_HEIGHT, this.target, GAME.SPELLS.LighteningStorm.damage, this.caster);
						}
					}
				}
				g_game.sounds[GAME.SPELLS.LighteningStorm.sound].play();
				this.destroy();
			}, 1000 * 15/50);
		}
	});

	Crafty.c('FireStorm', {

		FireStorm: function(x, y, direction, caster, target) {
			this.requires('AOESpell')
				.AOESpell(x, y, direction, caster, target, GAME.SPELLS.FireStorm)

			this.caster = caster;

			return this;
		},
		explode: function() {
			this.exploded = true;
			this.attr({ x: this.x - this.x % TILE_WIDTH, y: this.y - this.y % TILE_HEIGHT });
			this.stop().animate('explode', 10, 0);
			this.delay(function() {
				for (var y=0-GAME.SPELLS.FireStorm.aoe;y<=GAME.SPELLS.FireStorm.aoe;y++) {
					for (var x=0-GAME.SPELLS.FireStorm.aoe;x<=GAME.SPELLS.FireStorm.aoe;x++) {
						if (Math.abs(x) + Math.abs(y) <= GAME.SPELLS.Sleep.aoe) {
							Crafty.e('FireStormFire').FireStormFire(this.x + x*TILE_WIDTH, this.y + y*TILE_HEIGHT, this.target, this.caster);
						}
					}
				}
				g_game.sounds[GAME.SPELLS.FireStorm.sound].play();
				this.destroy();
			}, 1000 * 15/50);
		}
	});

	Crafty.c('Sleep', {

		Sleep: function(x, y, direction, caster, target) {
			this.requires('AOESpell')
				.AOESpell(x, y, direction, caster, target, GAME.SPELLS.Sleep)

			return this;
		},
		explode: function() {
			this.exploded = true;
			this.attr({ x: this.x - this.x % TILE_WIDTH, y: this.y - this.y % TILE_HEIGHT });
			this.stop().animate('explode', 10, 0);
			this.delay(function() {
				for (var y=0-GAME.SPELLS.Sleep.aoe;y<=GAME.SPELLS.Sleep.aoe;y++) {
					for (var x=0-GAME.SPELLS.Sleep.aoe;x<=GAME.SPELLS.Sleep.aoe;x++) {
						if (Math.abs(x) + Math.abs(y) <= GAME.SPELLS.Sleep.aoe) {
							Crafty.e('SleepSmoke').SleepSmoke(this.x + x*TILE_WIDTH, this.y + y*TILE_HEIGHT, this.target);
						}
					}
				}
				//g_game.sounds[GAME.SPELLS.Sleep.sound].play();
				this.destroy();
			}, 1000 * 15/50);

		}
	});



	Crafty.c('FireStormFire', {
		duration: 50,

		FireStormFire: function(x, y, target, caster) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, fire')
				.attr({ x: x, y: y, z: 200 })
			this.bind('EnterFrame', function(frameObj) {
				if (frameObj.frame % 20 == 0) {
					this.duration -= 10;
					if (this.duration <= 0) {
						this.destroy();
						return;
					}
					this.alpha = this.alpha - 0.1;
					var targets = this.hit(target);
					if (targets) {
						for (var i=0;i<targets.length;i++) {
							targets[i].obj.takeDamage(GAME.SPELLS.FireStorm.damage, caster);
						}
					}
				}
			}).collision();
			this.alpha = 0.6;

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 4*TILE_WIDTH);
			this.attach(lightSource);

			return this;
		}
	});

	Crafty.c('SleepSmoke', {
		duration: 50,

		SleepSmoke: function(x, y, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, smoke')
				.attr({ x: x, y: y, z: 200 })
			this.bind('EnterFrame', function(frameObj) {
				if (frameObj.frame % 10 == 0) {
					this.duration -= 10;
					if (this.duration <= 0) {
						this.destroy();
						return;
					}
					this.alpha = this.alpha - 0.1;
					var targets = this.hit(target);
					if (targets) {
						for (var i=0;i<targets.length;i++) {
							targets[i].obj.sleep();
						}
					}
				}
			}).collision();
			this.alpha = 0.6;

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 4*TILE_WIDTH);
			this.attach(lightSource);

			return this;
		}

	});

	Crafty.c('Lightening', {
		speed: GAME.SPELLS.Lightening.speed*3,
		range: GAME.SPELLS.Lightening.range*3,

		Lightening: function(x, y, direction, caster, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, Spell, lightening')
				.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 100})
				.bind('EnterFrame', function(frameObj) {
					this.attr({ x: this.x + direction.x*this.speed, y: this.y + direction.y*this.speed });
					this.sprite(Math.floor(Math.random()*4)*TILE_WIDTH, 9*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
					this.range -= this.speed;
					if (this.range <= 0) {
						this.destroy();
					}
					else if (this.hit('solid')) {
						this.destroy();
					}
					else if (this.hit(target)) {
						var creatures = this.hit(target);
						for (var i=0;i<creatures.length;i++) {
							//var xp = creatures[i].obj.takeDamage(this.damage, this.caster);
							this.explode(creatures[i].obj.x, creatures[i].obj.y, target);
							g_game.sounds.lightening_strike.play();
						}
						this.destroy();
					}
				}).collision()

			this.caster = caster;
			this.damage = this.calcSpellDamage(GAME.SPELLS.Lightening, caster);
			g_game.sounds.lightening.play();

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 4*TILE_WIDTH, 0.4);
			this.attach(lightSource);

			return this;
		},
		explode: function(x, y, target) {
			this.exploded = true;
			this.attr({ x: this.x - this.x % TILE_WIDTH, y: this.y - this.y % TILE_HEIGHT });
			Crafty.e('Electricity').Electricity(this.x, this.y, target, this.damage, this.caster);
		}
	});

	Crafty.c('Electricity', {
		duration: 30,

		Electricity: function(x, y, target, damage, caster) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, lightening')
				.attr({ x: x, y: y, z: 200 })
			this.bind('EnterFrame', function(frameObj) {
				this.sprite(Math.floor(Math.random()*4)*TILE_WIDTH, 9*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
				if (frameObj.frame % 10 == 0) {
					this.duration -= 10;
					if (this.duration <= 0) {
						this.destroy();
						return;
					}
				}
			}).collision();

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 2*TILE_WIDTH);
			this.attach(lightSource);

			// find all adjoining creatures
			var aoe = Crafty.e('2D, ' + RENDERING_MODE + ', elec_aoe, Collision')
				.attr({ alpha: 0, x: this.x - TILE_WIDTH, y: this.y - TILE_HEIGHT })
				.collision();
			var creatures = aoe.hit(target);
			var electrifiedCreatures = [];
			for (var i=0;i<creatures.length;i++) {
				if (!creatures[i].obj.electrified) {
					creatures[i].obj.takeDamage(damage, caster);
					creatures[i].obj.electrified = true;
					electrifiedCreatures.push(creatures[i].obj);
					Crafty.e('Electricity').Electricity(creatures[i].obj.x, creatures[i].obj.y, target, damage, caster);
				}
			}
			for (var i=0;i<electrifiedCreatures.length;i++) {
				electrifiedCreatures[i].electrified = false;
			}

			return this;
		}

	});

	Crafty.c('Missle', {
		speed: GAME.SPELLS.Missle.speed*3,
		range: GAME.SPELLS.Missle.range*3,

		Missle: function(x, y, direction, caster, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, Spell, magic_missle')
				.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 100})
				.bind('EnterFrame', function(frameObj) {
					this.attr({ x: this.x + direction.x*this.speed, y: this.y + direction.y*this.speed });
					this.range -= this.speed;
					if (this.range <= 0) {
						this.destroy();
					}
					else if (this.hit('solid')) {
						this.destroy();
						g_game.sounds.missle_hit.play();
					}
					else if (this.hit(target)) {
						var creatures = this.hit(target);
						for (var i=0;i<creatures.length;i++) {
							var xp = creatures[i].obj.takeDamage(this.damage*this.caster.offense, this.caster);
						}
						g_game.sounds.missle_hit.play();
						this.destroy();
					}
				}).collision()

			this.caster = caster;
			this.damage = this.calcSpellDamage(GAME.SPELLS.Missle, caster);
			g_game.sounds.missle.play();

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 4*TILE_WIDTH);
			this.attach(lightSource);

			return this;
		}
	});

	Crafty.c('Fireball', {
		speed: GAME.SPELLS.Fireball.speed*ZOOM,
		range: GAME.SPELLS.Fireball.range*ZOOM,

		Fireball: function(x, y, direction, caster, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, fireball, Spell, SpriteAnimation')
				.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 100})
				.animate('burn', 0, 1, 1)
				.bind('EnterFrame', function(frameObj) {
					this.attr({ x: this.x + direction.x*this.speed, y: this.y + direction.y*this.speed });
					this.range -= this.speed;
					if (this.range <= 0) {
						this.destroy();
					}
					else if (this.hit('solid')) {
						this.destroy();
					}
					else if ((frameObj.frame % 4 == 0) && this.hit(target)) {
						var creatures = this.hit(target);
						for (var i=0;i<creatures.length;i++) {
							creatures[i].obj.takeDamage(this.damage*this.caster.offense, this.caster);
						}
					}
				}).collision()

			this.caster = caster;
			this.damage = this.calcSpellDamage(GAME.SPELLS.Fireball, caster);
			this.stop().animate('burn', 10, -1);
			g_game.sounds.fireball.play();

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 12*TILE_WIDTH);
			this.attach(lightSource);

			return this;
		}
	});

}
function init_world() {

	Crafty.c('Treasure', {
		Treasure: function(type, level, x, y) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, LitObject, loot, ' + type + '-' + level)
				.attr({ z: 90 });
			if (x !== undefined) {
				this.attr({ x: x * TILE_WIDTH, y: y * TILE_HEIGHT });
			}
			if (!this.has('LitObject')) {
				this.addComponent('LitObject').LitObject();
			}

			this.treasureType = type;
			this.treasureLevel = level;

			return this;
		}
	});

	Crafty.c('Ichor', {
		Ichor: function(x, y, type, amt) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, LitObject, loot, ' + type)
				.attr({ x: x * TILE_WIDTH + TILE_WIDTH/4, y: y * TILE_HEIGHT + TILE_HEIGHT/2, z: 1000 })
				.collision()
				.LitObject();

			this.treasureType = 'ichor';
			this.treasureAmt = amt;

			var lightSource = Crafty.e('LightSource').LightSource(this.x + this.w/2, this.y + this.h/2, 3*TILE_WIDTH, 0.7, true);
			this.attach(lightSource);

			return this;
		}
	});

	Crafty.c('Potion', {
		Potion: function(x, y, type) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, LitObject, loot, ' + type)
				.attr({ x: x * TILE_WIDTH + TILE_WIDTH/4, y: y * TILE_HEIGHT + TILE_HEIGHT/2, z: 1000 })
				.collision()
				.LitObject();

			this.treasureType = 'potion';

			var lightSource = Crafty.e('LightSource').LightSource(this.x + this.w/2, this.y + this.h/2, 3*TILE_WIDTH, 0.7, true);
			this.attach(lightSource);

			return this;
		}
	});

}

function loadMap(strMap) {

	$.getJSON('./maps/' + strMap + '.json?' + Math.random(), function(data) {

		for (var i=0;i<data.tilesets.length;i++) {
			var myMap = new Object();
			var width = data.tilesets[i].imagewidth / data.tilesets[i].tilewidth;
			var height = data.tilesets[i].imageheight / data.tilesets[i].tileheight;

			for (var y=0;y<height;y++)
				for (var x=0;x<width;x++)
					myMap['maptile_' + (data.tilesets[i].firstgid + y*width+x)] = [
						x*data.tilesets[i].tilewidth,
						y*data.tilesets[i].tileheight,
						data.tilesets[i].tilewidth,
						data.tilesets[i].tileheight
					];

			Crafty.sprite(1, './maps/' + data.tilesets[i].image, myMap);
		}

		g_game.map = data;
		g_game.currentMap = strMap;

		Crafty.scene("mansion"); //when everything is loaded, run the main scene
		//playSong(data.properties.song);

	});

}
