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
			this.requires('2D, ' + RENDERING_MODE + ', Collision, Delay, LitObject, ' + type.toLowerCase())
				.attr( { x: x * TILE_WIDTH, y: y * TILE_HEIGHT, z: 100 } )
				.collision()
				.LitObject();

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
			this.attr({ x: this.locX * TILE_WIDTH, y: this.locY * TILE_HEIGHT });
			var walls = this.hit('solid');
			if (walls) {
				this.locX -= movement.x;
				this.locY -= movement.y;
				this.attr({ x: this.locX * TILE_WIDTH, y: this.locY * TILE_HEIGHT });
			}
			else {
				var mobs = this.hit('Mob');
				if (mobs) {
					this.attackMob(mobs[0].obj, movement);
					this.locX -= movement.x;
					this.locY -= movement.y;
					this.attr({ x: this.locX * TILE_WIDTH, y: this.locY * TILE_HEIGHT });
				}
			}
		},
		takeDamage: function(amt, from) {

			this.sleeping = false;
			//Crafty.e('FloatingText')
			//	.FloatingText(this.locX, this.locY, amt, '#BE2633');

			this.health = Math.max(0, this.health - amt);
			this.trigger('HealthChanged');
			if (this.health <= 0) {
				from.addXP(getXPforLevel(this.level));
				// loot
				if (Math.random() < 0.2) {
					var item = Math.floor(Math.random() * 9);
					var i = 0;
					for (var key in GAME.EQUIPMENT) {
						if (i == item) {
							Crafty.e('Treasure').Treasure(this.locX, this.locY, key, this.level);
						}
						i++;
					}
				}
				else {
					Crafty.e('Ichor').Ichor(this.locX, this.locY, 'ichor', 20);
				}

				// flying bones
				for (var i=0;i<2 + Math.floor(Math.random()*3);i++) {
					Crafty.e('2D, ' + RENDERING_MODE + ', ' + (i==0 ? 'skull' : 'bone'))
						.attr({ x: this.x + TILE_WIDTH/4 + TILE_WIDTH*Math.random(), y: this.y + TILE_HEIGHT/4 + Math.random()*TILE_HEIGHT/2, z: this.z+1 })
						.bind('EnterFrame', function() {
							this.frameCount = this.frameCount ? this.frameCount + 1 : 1;
							this.dx = this.dx ? this.dx : 2 - Math.random() * 4;
							this.dy = this.dy ? this.dy : -3 - Math.random() * 4;
							this.dy += 0.3;
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
		calcDamageTo: function(mob) {
			/*var dmg = 1 + Math.floor(Math.random() * this.offense);
			var reduction = Math.random()*mob.defense/(30 * mob.level);
			dmg = Math.floor(dmg - dmg*reduction);
			return Math.max(1, dmg);*/
			return this.offense;
		},
		sleep: function() {
			this.sleeping = true;

			this.delay(function() {
				this.sleeping = false;
			}, 4000);
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
									Crafty.e(props.spell)
										[props.spell](this.locX, this.locY, movement, this, 'Player');
									this.mana -= GAME.SPELLS[props.spell].mana;
									g_game.sounds[GAME.SPELLS[props.spell].sound].play();
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
		}
	});
}