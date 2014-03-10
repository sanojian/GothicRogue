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
							var xp = creatures[i].obj.takeDamage(this.damage, this.caster);
						}
						this.destroy();
					}
				}).collision()

			this.caster = caster;
			this.damage = this.calcSpellDamage(GAME.SPELLS.Arrow, caster);
			if (direction.x > 0) {
				this.sprite(8*TILE_WIDTH, 9*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
			}
			else if (direction.x < 0) {
				this.sprite(7*TILE_WIDTH, 9*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
			}
			else if (direction.y > 0) {
				this.sprite(6*TILE_WIDTH, 9*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
			}

			return this;
		}
	});

	Crafty.c('Sleep', {
		speed: GAME.SPELLS.Sleep.speed*3,
		range: GAME.SPELLS.Sleep.range*3,
		exploded: false,

		Sleep: function(x, y, direction, caster, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, Spell, sleep, SpriteAnimation, Delay')
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
				this.destroy();
			}, 1000 * 15/50);

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

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 4*TILE_WIDTH);
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

			var lightSource = Crafty.e('LightSource').LightSource(this.x + TILE_WIDTH/2, this.y + TILE_HEIGHT/2, 4*TILE_WIDTH);
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
							var xp = creatures[i].obj.takeDamage(this.damage, this.caster);
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
		speed: GAME.SPELLS.Fireball.speed*3,
		range: GAME.SPELLS.Fireball.range*3,

		Fireball: function(x, y, direction, caster, target) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, fireball, Spell, SpriteAnimation')
				.attr({ x: x*TILE_WIDTH, y: y*TILE_HEIGHT, z: 100})
				.animate('burn', [[10*TILE_WIDTH, 8*TILE_HEIGHT], [11*TILE_WIDTH, 8*TILE_HEIGHT]])
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
							creatures[i].obj.takeDamage(this.damage, this.caster);
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