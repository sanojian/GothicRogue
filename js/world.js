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
				.attr({ x: x * TILE_WIDTH + TILE_WIDTH/4, y: y * TILE_HEIGHT + TILE_HEIGHT/2, z: 90 })
				.collision()
				.LitObject();

			this.treasureType = 'ichor';
			this.treasureAmt = amt;

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
