function init_fx() {


	Crafty.c('FloatingText', {

		FloatingText: function(x, y, txt, color, speed) {
			this.requires('2D, ' + RENDERING_MODE + ', Text, Tween')
				.attr({ w: 320, h: 20, x: x*TILE_WIDTH + TILE_WIDTH/2, y: y*TILE_HEIGHT, z: 200 })
				.textColor(color, 1)
				.text(txt)
				.textFont({ size: "12pt", weight: 'bold', family: GAME_FONT })
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

	Crafty.c('LightSource', {

		LightSource: function(cx, cy, d, intensity) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision')
				.attr( { x: cx - d/2, y: cy - d/2, w: d, h: d } )
				.collision()
				.bind('EnterFrame', function(frameObj) {
					if (frameObj.frame % 11 == 0) {
						this.lightUp(frameObj.frame);
					}
				});

			this.radius = d;
			this.intensity = intensity || 1;
			return this;
		},
		lightUp: function(frame) {
			var d = this.radius;
			var litObjs = this.hit('LitObject');
			for (var i=0;i<litObjs.length;i++) {
				var dist = Math.sqrt(Math.pow(this.x + d/2 - litObjs[i].obj.x - TILE_WIDTH/2, 2)
					+ Math.pow(this.y + d/2 - litObjs[i].obj.y - TILE_HEIGHT/2, 2));
				litObjs[i].obj.light(this.intensity*(0.2 + ((d/2) - dist)/(d/2)), frame);
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

}