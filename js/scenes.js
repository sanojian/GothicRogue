function init_scenes() {

	Crafty.scene("main", function () {
		Crafty.background("#000");


		for (var i=0;i<10;i++) {
			g_game.slashEffects.objArray.push(Crafty.e('SlashEffect').SlashEffect());
		}

		//Dungeon.Clear();
		//Dungeon.Generate();

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
			//var display = new ROT.Display({width:w, height:h, fontSize:6});
			//SHOW(display.getContainer());
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
		var bWizardPlaced = false;
		for (var y=0;y<g_game.mapTiles[0].length;y++) {
			for (var x=0;x<g_game.mapTiles.length;x++) {
				if (g_game.mapTiles[x][y] == 1) {
					if (!bWizardPlaced) {
						g_game.wizard = Crafty.e('Wizard')
							.Wizard(x, y, g_game.wizardControls);
						bWizardPlaced = true;
					}
				}
			}
		}

		restorePlayers();

		var bBossPlaced = false;
		var bExitPlaced = false;
		var dungeonLevel = GAME.DUNGEONLEVELS[g_game.curLevel];
		for (var y=g_game.mapTiles[0].length-1;y>=0;y--) {
			for (var x=g_game.mapTiles.length-1;x>=0;x--) {
				if (!(y<10 && x<10)) {		// not in first room, please
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

		centerOnPlayers();
		fadeOutControls();

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

			Crafty.sprite(1, './images/slash.png', {
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

			Crafty.sprite(1, './images/crl_chars_x' + ZOOM + '.gif', {
				fighter: [0*TILE_WIDTH, 0*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				wizard: [2*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				gunman: [2*TILE_WIDTH, 4*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
			});

			Crafty.sprite(1, './images/crl_terrain_x' + ZOOM + '.gif', {
				wall_brick: [0*TERRAIN_WIDTH, 0*TERRAIN_HEIGHT, TERRAIN_WIDTH, TILE_HEIGHT*1.5 + 3],
				ceiling_brick: [0*TERRAIN_WIDTH, 0*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT],
				floor_cracks: [1*TERRAIN_WIDTH, 5*TERRAIN_HEIGHT, TERRAIN_WIDTH, TERRAIN_HEIGHT]
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

				skull: [214*3, 848*3, 12*3, 12*3],
				bone: [256*3, 1020*3, 8*3, 8*3],

				//wall_brick: [0*TILE_WIDTH, 13*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//ceiling_brick: [7*TILE_WIDTH, 12*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				//floor_cracks: [9*TILE_WIDTH, 15*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				wall_mud: [2*TILE_WIDTH, 13*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				ceiling_mud: [13*TILE_WIDTH, 12*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				floor_mouldy: [9*TILE_WIDTH, 12*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				entrance: [8*TILE_WIDTH, 14*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				exit_closed: [7*TILE_WIDTH, 16*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT],
				exit: [14*TILE_WIDTH, 16*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT]
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
			Crafty.scene("main");

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
			.text("A Tale of Unearthly Ichor")
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