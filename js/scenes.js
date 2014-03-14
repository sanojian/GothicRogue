function init_scenes() {

	Crafty.scene("main", function () {
		Crafty.background("#000");


		for (var i=0;i<10;i++) {
			g_game.slashEffects.objArray.push(Crafty.e('SlashEffect').SlashEffect());
		}

		var w = 48, h = 48;
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
				g_game.mapReveal[y][x] = true;
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
						g_game.wizard = Crafty.e('Peasant')
							.Peasant(x, y, g_game.wizardControls);
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
						for (var i=0;!bMobPlaced && i<dungeonLevel.mobs.length;i++) {
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
								else if (!(i==0 && bBossPlaced)) {
									var placedMob = Crafty.e('Creature').Creature(x, y, mob);
									bMobPlaced = true;
									if (i==0) {
										bBossPlaced = true;
										placedMob.iAmBoss = true;
									}
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


			Crafty.sprite(1, './images/equipment_fighter.png', {
				shirt_0: [0*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shirt_1: [0*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shirt_2: [0*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shirt_3: [0*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shirt_4: [0*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				pants_0: [1*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				pants_1: [1*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				pants_2: [1*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				pants_3: [1*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				pants_4: [1*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				helm_0: [2*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				helm_1: [2*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				helm_2: [2*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				helm_3: [2*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				helm_4: [2*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				boots_0: [3*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				boots_1: [3*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				boots_2: [3*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				boots_3: [3*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				boots_4: [3*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shield_0: [4*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shield_1: [4*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shield_2: [4*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shield_3: [4*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				shield_4: [4*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				sword_0: [5*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				sword_1: [5*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				sword_2: [5*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				sword_3: [5*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				sword_4: [5*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/equip_icons_fighter.png', {
				icon_shirt_0: [0*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shirt_1: [0*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shirt_2: [0*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shirt_3: [0*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shirt_4: [0*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_pants_0: [1*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_pants_1: [1*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_pants_2: [1*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_pants_3: [1*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_pants_4: [1*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_helm_0: [2*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_helm_1: [2*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_helm_2: [2*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_helm_3: [2*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_helm_4: [2*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_boots_0: [3*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_boots_1: [3*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_boots_2: [3*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_boots_3: [3*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_boots_4: [3*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shield_0: [4*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shield_1: [4*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shield_2: [4*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shield_3: [4*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_shield_4: [4*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_sword_0: [5*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_sword_1: [5*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_sword_2: [5*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_sword_3: [5*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_sword_4: [5*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/equipment_wizard.png', {
				robe_0: [0*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				robe_1: [0*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				robe_2: [0*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				robe_3: [0*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				robe_4: [0*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				hat_0: [1*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				hat_1: [1*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				hat_2: [1*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				hat_3: [1*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				hat_4: [1*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				staff_0: [2*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				staff_1: [2*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				staff_2: [2*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				staff_3: [2*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				staff_4: [2*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/equip_icons_wizard.png', {
				icon_robe_0: [0*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_robe_1: [0*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_robe_2: [0*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_robe_3: [0*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_robe_4: [0*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_hat_0: [1*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_hat_1: [1*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_hat_2: [1*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_hat_3: [1*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_hat_4: [1*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_staff_0: [2*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_staff_1: [2*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_staff_2: [2*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_staff_3: [2*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				icon_staff_4: [2*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/crl_effects_x' + ZOOM + '.png', {
				skull: [12*TILE_WIDTH, 16*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				bone: [9*TILE_WIDTH, 3*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/crl_chars_x' + ZOOM + '.gif', {
				fighter: [0*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				wizard: [2*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				gunman: [3*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				peasant: [3*TILE_WIDTH, 1*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/crl_terrain_x' + ZOOM + '.gif', {
				wall_brick: [0*TERRAIN_WIDTH, 0*TERRAIN_HEIGHT, TERRAIN_WIDTH, TILE_HEIGHT*1.5 + 3],
				ceiling_brick: [0*TERRAIN_WIDTH, 0*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				floor_cracks: [1*TERRAIN_WIDTH, 5*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				exit_closed: [2*TERRAIN_WIDTH, 9*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				exit: [8*TERRAIN_WIDTH, 9*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT]

			});

			Crafty.sprite(1, './images/crl_items_x' + ZOOM + '.gif', {
				ichor: [4*TILE_WIDTH/2, 0*TILE_HEIGHT/2, TILE_WIDTH/2, TILE_HEIGHT/2]
			});

			Crafty.sprite(1, './images/crl_mons32_x' + ZOOM + '.gif', {
				rat: [0*TILE_WIDTH, 8*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				rat_king: [8*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				bat: [7*TILE_WIDTH, 2*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});


			Crafty.sprite(1, './images/oryx_roguelike_16x24.png', {
				//fighter: [0*TILE_WIDTH, 24*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//wizard: [12*TILE_WIDTH, 24*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				magic_missle: [0*TILE_WIDTH, 10*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				fireball: [10*TILE_WIDTH, 8*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				arrow: [5*TILE_WIDTH, 9*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				sleep: [0*TILE_WIDTH, 8*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				smoke: [3*TILE_WIDTH, 8*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				lightening: [3*TILE_WIDTH, 9*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				elec_aoe: [0, 0, 3*TILE_WIDTH, 3*TILE_HEIGHT],

				orc: [5*TILE_WIDTH, 29*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				orc_archer: [6*TILE_WIDTH, 29*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				orc_chief: [8*TILE_WIDTH, 29*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				spider: [8*TILE_WIDTH, 27*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//rat: [1*TILE_WIDTH, 26*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//rat_king: [4*TILE_WIDTH, 26*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//bat: [6*TILE_WIDTH, 26*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				skeleton: [0*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				skeleton_warrior: [1*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				skeleton_mage: [4*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				skeleton_necro: [5*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				skeleton_boss: [2*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				skeleton_archer: [3*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				skeleton_magic: [6*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				imp: [4*TILE_WIDTH, 29*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				death_knight: [11*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				death_mage: [16*TILE_WIDTH, 30*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				necromancer: [2*TILE_WIDTH, 32*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],

				//skull: [214*3, 848*3, 12*3, 12*3],
				//bone: [256*3, 1020*3, 8*3, 8*3],

				//wall_brick: [0*TILE_WIDTH, 13*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//ceiling_brick: [7*TILE_WIDTH, 12*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//floor_cracks: [9*TILE_WIDTH, 15*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				wall_mud: [2*TILE_WIDTH, 13*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				ceiling_mud: [13*TILE_WIDTH, 12*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				floor_mouldy: [9*TILE_WIDTH, 12*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				entrance: [8*TILE_WIDTH, 14*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
				//exit_closed: [7*TILE_WIDTH, 16*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//exit: [14*TILE_WIDTH, 16*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
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
			g_game.sounds.lightening = new buzz.sound( "./audio/sfx/lightening", {
				formats: [ "wav" ]
			});
			g_game.sounds.lightening_strike = new buzz.sound( "./audio/sfx/lightening_strike", {
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


		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 0, y: 96, z: 1000 })
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
					Crafty.scene("splash");
				}
			})


	});

	Crafty.scene("intro", function () {
		$('#divGUI').hide();
		Crafty.background("#000");

		Crafty.viewport.x = 0;
		Crafty.viewport.y = 0;

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic1)
			.attr({ x: VIEW_WIDTH/2 - 240/2, y: VIEW_HEIGHT/3 - 120/2, z: 1 })

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic2)
			.attr({ x: VIEW_WIDTH/2 - 2*240 + 60, y: VIEW_HEIGHT/3, z: 1 })

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic3)
			.attr({ x: VIEW_WIDTH/2 + 240 - 60, y: VIEW_HEIGHT/3, z: 1 })

		var speakers = {};
		speakers.fighter = Crafty.e('2D, ' + RENDERING_MODE + ', portrait_fighter')
			.attr({ x: VIEW_WIDTH/2 + 108/2, y: VIEW_HEIGHT/2, z: 10 })
		speakers.wizard = Crafty.e('2D, ' + RENDERING_MODE + ', portrait_wizard')
			.attr({ x: VIEW_WIDTH/2 - 3*108/2, y: VIEW_HEIGHT/2, z: 10 })

		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 0, y: 64, z: 1000 })
			.text("Mystery of the Unearthly Ichor")
			.textColor('#9D9D9D', 1)
			.textFont({ size: "32pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})

		Crafty.e('2D, ' + RENDERING_MODE + ', Text, Keyboard').attr({ w: VIEW_WIDTH, x: 0, y: VIEW_HEIGHT-160, z: 1000 })
			.text("Type space to continue...")
			.textColor('#9D9D9D', 1)
			.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})
			.bind('KeyDown', function(evt) {
				if (evt.key == Crafty.keys.SPACE) {
					Crafty.scene("splash");
				}
			})

		playSong('DST-TheHauntedChapel');

	});

	Crafty.scene("splash", function () {
		$('#divGUI').hide();
		Crafty.background("#000");

		g_game.curLevel = localStorage.curLevel || 0;

		Crafty.viewport.x = 0;
		Crafty.viewport.y = 0;

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic1)
			.attr({ x: VIEW_WIDTH/2 - 240/2, y: VIEW_HEIGHT/3 - 120/2, z: 1 })

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic2)
			.attr({ x: VIEW_WIDTH/2 - 2*240 + 60, y: VIEW_HEIGHT/3, z: 1 })

		Crafty.e('2D, ' + RENDERING_MODE + ', ' + GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.pic3)
			.attr({ x: VIEW_WIDTH/2 + 240 - 60, y: VIEW_HEIGHT/3, z: 1 })

		var speakers = {};
		speakers.fighter = Crafty.e('2D, ' + RENDERING_MODE + ', portrait_fighter')
			.attr({ x: VIEW_WIDTH/2 + 108/2, y: VIEW_HEIGHT/2, z: 10 })
		speakers.wizard = Crafty.e('2D, ' + RENDERING_MODE + ', portrait_wizard')
			.attr({ x: VIEW_WIDTH/2 - 3*108/2, y: VIEW_HEIGHT/2, z: 10 })

		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 0, y: 64, z: 1000 })
			.text("Stage " + (parseInt(g_game.curLevel, 10) + 1))
			.textColor('#9D9D9D', 1)
			.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})

		Crafty.e('2D, ' + RENDERING_MODE + ', Text').attr({ w: VIEW_WIDTH, x: 0, y: 96, z: 1000 })
			.text(GAME.DUNGEONLEVELS[g_game.curLevel].name)
			.textColor('#9D9D9D', 1)
			.textFont({ size: "24pt", weight: 'bold', family: GAME_FONT })
			.css({ 'text-align': 'center'})


		var dlgCounter = 0;
		var dlgInterval = setInterval(function() {
			if (dlgCounter >= GAME.DUNGEONLEVELS[g_game.curLevel].sceneInfo.dialog.length) {
				clearInterval(dlgInterval);
				Crafty.e('2D, ' + RENDERING_MODE + ', Text, Keyboard').attr({ w: VIEW_WIDTH, x: 0, y: VIEW_HEIGHT-160, z: 1000 })
					.text("Type space to continue...")
					.textColor('#9D9D9D', 1)
					.textFont({ size: "16pt", weight: 'bold', family: GAME_FONT })
					.css({ 'text-align': 'center'})
					.bind('KeyDown', function(evt) {
						if (evt.key == Crafty.keys.SPACE) {
							if (g_game.curLevel == GAME.DUNGEONLEVELS.length-1) {
								localStorage.curLevel = 0;
								Crafty.scene("intro");
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
					.FloatingText(speakers[dialog.speaker].x/TILE_WIDTH - 1, speakers[dialog.speaker].y/TILE_HEIGHT - 0.25,
						dialog.text, '#31A2F2', 90);

				dlgCounter++;
			}

		}, 2000);

		playSong(GAME.DUNGEONLEVELS[g_game.curLevel].song);

	});

}