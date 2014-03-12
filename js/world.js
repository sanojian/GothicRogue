function init_world() {

	Crafty.c('Treasure', {
		Treasure: function(x, y, type, level) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, LitObject, loot, icon_' + type + '_' + level)
				.attr({ x: x * TILE_WIDTH, y: y * TILE_HEIGHT, z: 90 })
				.collision()
				.LitObject();

			this.treasureType = type;
			this.treasureLevel = level;

			return this;
		}
	});

	Crafty.c('Ichor', {
		Ichor: function(x, y, type, amt) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, LitObject, loot, ' + type)
				.attr({ x: x * TILE_WIDTH + TILE_WIDTH/4, y: y * TILE_HEIGHT + TILE_HEIGHT/2, z: 90 })
				.collision()
				.LitObject();

			this.treasureType = 'ichor';
			this.treasureAmt = amt;

			var lightSource = Crafty.e('LightSource').LightSource(this.x + this.w/2, this.y + this.h/2, 3*TILE_WIDTH, 0.7);
			this.attach(lightSource);

			return this;
		}
	});

}