function init_world() {

	Crafty.c('Treasure', {
		Treasure: function(x, y, type, level) {
			this.requires('2D, ' + RENDERING_MODE + ', Collision, LitObject, icon_' + type + '_' + level)
				.attr({ x: x * TILE_WIDTH, y: y * TILE_HEIGHT, z: 90 })
				.collision()
				.LitObject();

			this.treasureType = type;
			this.treasureLevel = level;

			return this;
		}
	});

}