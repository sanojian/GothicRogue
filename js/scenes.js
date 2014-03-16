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