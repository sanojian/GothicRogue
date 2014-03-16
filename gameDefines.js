window.GAME = {
	EQUIPMENT: {
		knife: {
			classes: ['peasant'],
			defense: [0, 0, 0, 0, 0],
			offense: [0, 1, 2, 3, 8],
			slot: 1,
			z: 110
		},
		sceptre: {
			classes: ['caster'],
			defense: [0, 0, 0, 0, 0],
			offense: [0, 1, 2, 3, 0],
			slot: 0,
			z: 110
		},
		book: {
			classes: ['caster'],
			defense: [0, 0, 0, 0, 0],
			offense: [0, 0, 0, 0, 0],
			slot: 1,
			z: 110
		},
		pistol: {
			classes: ['peasant', 'gunman'],
			defense: [0, 0, 0, 0, 0],
			offense: [0, 1, 2, 3, 8],
			slot: 0,
			z: 110
		},
		knuckles: {
			classes: ['gunman'],
			defense: [0, 0, 0, 0, 0],
			offense: [0, 1, 2, 5, 8],
			slot: 1,
			z: 110
		}
	},
	SPELLS: {
		Missle: {
			mana: 4,
			damage: 1,
			speed: 3,
			range: 200,
			sound: 'missle'
		},
		Fireball: {
			mana: 8,
			damage: 1,
			speed: 9,
			range: 400,
			sound: 'fireball'
		},
		Sleep: {
			mana: 8,
			damage: 0,
			speed: 8,
			range: 160,
			aoe: 2,
			sound: 'sleep'
		},
		LighteningStorm: {
			mana: 15,
			damage: 2,
			speed: 8,
			range: 160,
			aoe: 2,
			sound: 'lightening'
		},
		FireStorm: {
			mana: 10,
			damage: 1,
			speed: 8,
			range: 160,
			aoe: 2,
			sound: 'fireball'
		},
		Lightening: {
			mana: 20,
			damage: 12,
			speed: 8,
			range: 160,
			sound: 'lightening'
		},
		Arrow: {
			mana: 4,
			damage: 1,
			speed: 1,
			range: 180,
			sound: 'arrow'
		},
		Bullet: {
			mana: 4,
			damage: 1,
			speed: 12,
			range: 180,
			sound: 'gunshot'
		}
	},
	CHARLEVELS: {
		caster: [
			{ health: 6, mana: 0 },
			{ health: 12, mana: 0 },
			{ health: 14, mana: 0 },
			{ health: 26, mana: 0 },
			{ health: 36, mana: 0 },
			{ health: 40, mana: 0 },
			{ health: 45, mana: 0 },
			{ health: 50, mana: 0 },
			{ health: 55, mana: 0 },
			{ health: 60, mana: 0 }
		],
		gunman: [
			{ health: 6, mana: 0 },
			{ health: 12, mana: 0 },
			{ health: 14, mana: 0 },
			{ health: 26, mana: 0 },
			{ health: 36, mana: 0 },
			{ health: 40, mana: 0 },
			{ health: 45, mana: 0 },
			{ health: 50, mana: 0 },
			{ health: 55, mana: 0 },
			{ health: 60, mana: 0 }
		],
		peasant: [
			{ health: 6, mana: 0 },
			{ health: 12, mana: 0 },
			{ health: 14, mana: 0 },
			{ health: 26, mana: 0 },
			{ health: 36, mana: 0 },
			{ health: 40, mana: 0 },
			{ health: 45, mana: 0 },
			{ health: 50, mana: 0 },
			{ health: 55, mana: 0 },
			{ health: 60, mana: 0 }
		]
	},
	DUNGEONLEVELS: [
		{
			name: 'Entry Into the Unknown',
			spawnRate: 0.07,
			mobs: [ 
				{ sprite: 'bat_king', 	prob: 1,	type: 'fighter', 	level: 2, 	health: 4,	 	mana: 0, 	offense: 2, 	defense: 12		},
				{ sprite: 'bat', 		prob: 4,	type: 'fighter', 	level: 1, 	health: 2, 	mana: 0, 	offense: 1, 	defense: 4		},
				{ sprite: 'snake', 		prob: 5,	type: 'fighter', 	level: 1, 	health: 2, 	mana: 0, 	offense: 1, 	defense: 4 		}
			],
			graphics: {
				wall: 'wall_cave',
				ceiling: 'ceiling_cave',
				floor: 'floor_dirt'
			},
			song: 'DST-BeyondTheseForests',
			sceneInfo: {
				pic1: 'scene_entrance1',
				pic2: 'scene_graveyard',
				pic3: 'scene_entrance2',
				dialog: [
					{ speaker: 'fighter', text: 'What is this place?' }
				]
			}
		},
		{
			name: 'Buried Too Long',
			spawnRate: 0.07,
			mobs: [ 
				{ sprite: 'skeleton_magic',		prob: 1,	type: 'caster', 	level: 2, 	health: 6, 	mana: 4, 	offense: 1, 	defense: 12,	spell: 'Missle'	},
				{ sprite: 'skeleton', 			prob: 6,	type: 'fighter', 	level: 2, 	health: 2,	 	mana: 0, 	offense: 1, 	defense: 8		},
				{ sprite: 'skeleton_archer', 	prob: 3,	type: 'caster', 	level: 2, 	health: 2,	 	mana: 4, 	offense: 1, 	defense: 8,		spell: 'Arrow' }
			],
			graphics: {
				wall: 'wall_sandstone',
				ceiling: 'ceiling_sandstone',
				floor: 'floor_sandstone'
			},
			song: 'DST-ClockTower',
			sceneInfo: {
				pic1: 'scene_catacombs1',
				pic2: 'scene_catacombs2',
				pic3: 'scene_catacombs3',
				dialog: [
					{ speaker: 'wizard', text: 'Something moves here' },
					{ speaker: 'wizard', text: 'that should not be alive.' }
				]
			}
		},
		{
			name: 'Death Does not Become You',
			spawnRate: 0.07,
			mobs: [ 
				{ sprite: 'king_mummy', 	prob: 1,	type: 'fighter', 	level: 3, 	health: 8,	 	mana: 0, 	offense: 1, 	defense: 18		},
				{ sprite: 'zombie', 		prob: 6,	type: 'fighter', 	level: 2, 	health: 2, 	mana: 0, 	offense: 1, 	defense: 18 	},
				{ sprite: 'headless', prob: 3,	type: 'caster',		level: 2, 	health: 2, 	mana: 4, 	offense: 1, 	defense: 10,	spell: 'Missle' }
			],
			graphics: {
				wall: 'wall_muck',
				ceiling: 'ceiling_muck',
				floor: 'floor_muck'
			},
			song: 'DST-Azum',
			sceneInfo: {
				pic1: 'scene_temple1',
				pic2: 'scene_temple2',
				pic3: 'scene_temple3',
				dialog: [
					{ speaker: 'wizard', text: 'I thought the skeletons .' },
					{ speaker: 'wizard', text: 'were bad. These things' },
					{ speaker: 'wizard', text: 'smell much worse.' }
				]
			}
		},
		{
			name: 'The Dead Want Revenge',
			spawnRate: 0.07,
			mobs: [ 
				{ sprite: 'skeleton_boss', 		prob: 1,	type: 'fighter', 	level: 3, 	health: 8,	 	mana: 0, 	offense: 2, 	defense: 32		},
				{ sprite: 'skeleton_warrior', 	prob: 6,	type: 'fighter', 	level: 2, 	health: 3,	 	mana: 0, 	offense: 1, 	defense: 18		},
				{ sprite: 'skeleton_shooter', 	prob: 3,	type: 'caster', 	level: 2, 	health: 2, 	mana: 4, 	offense: 1, 	defense: 12,	spell: 'Bullet'	}
			],
			graphics: {
				wall: 'wall_sandstone',
				ceiling: 'ceiling_sandstone',
				floor: 'floor_sandstone'
			},
			song: 'DST-WaterTemple-I',
			sceneInfo: {
				pic1: 'scene_catacombs1',
				pic2: 'scene_catacombs3',
				pic3: 'scene_catacombs2',
				dialog: [
					{ speaker: 'fighter', text: 'Skeletons again...' },
					{ speaker: 'wizard', text: 'Will we ever get out of here?' }
				]
			}
		},
		{
			name: 'In Need of Answers',
			spawnRate: 0.07,
			mobs: [ 
				{ sprite: 'witch',			prob: 1,	type: 'caster', 	level: 3, 	health: 8,	 	mana: 24, 	offense: 1, 	defense: 18,	spell: 'Fireball'	},
				{ sprite: 'neophyte', 		prob: 4,	type: 'fighter', 	level: 2, 	health: 1,	 	mana: 0, 	offense: 1, 	defense: 18		},
				{ sprite: 'enforcer',		prob: 3,	type: 'fighter', 	level: 2, 	health: 2, 		mana: 18, 	offense: 1, 	defense: 12	}
			],
			graphics: {
				wall: 'wall_stone',
				ceiling: 'ceiling_stone',
				floor: 'floor_brick'
			},
			song: 'DST-Alters',
			sceneInfo: {
				pic1: 'scene_castle1',
				pic2: 'scene_castle2',
				pic3: 'scene_castle3',
				dialog: [
					{ speaker: 'wizard', text: 'Who is behind all' },
					{ speaker: 'fighter', text: 'of this madness?' }
				]
			}
		},
		{
			name: 'The Truth Dawns',
			spawnRate: 0.07,
			mobs: [
				{ sprite: 'demon',			prob: 1,	type: 'caster', 	level: 3, 	health: 8,	 	mana: 24, 	offense: 1, 	defense: 18,	spell: 'Fireball'	},
				{ sprite: 'priest', 		prob: 4,	type: 'caster', 	level: 3, 	health: 1,	 	mana: 24, 	offense: 1, 	defense: 18	,	spell: 'Bullet'	},
				{ sprite: 'neophyte',		prob: 3,	type: 'fighter', 	level: 3, 	health: 2, 		mana: 18, 	offense: 1, 	defense: 12	}
			],
			graphics: {
				wall: 'wall_stone',
				ceiling: 'ceiling_stone',
				floor: 'floor_brick'
			},
			song: 'DST-Alters',
			sceneInfo: {
				pic1: 'scene_castle1',
				pic2: 'scene_castle2',
				pic3: 'scene_castle3',
				dialog: [
					{ speaker: 'wizard', text: 'Who is behind all' },
					{ speaker: 'fighter', text: 'of this madness?' }
				]
			}
		},
		{
			name: 'The Dead Can Now Rest',
			mobs: [
				{ sprite: 'demon',			prob: 1,	type: 'caster', 	level: 3, 	health: 8,	 	mana: 24, 	offense: 1, 	defense: 18,	spell: 'Fireball'	},
				{ sprite: 'peasant', 		prob: 4,	type: 'caster', 	level: 3, 	health: 1,	 	mana: 24, 	offense: 1, 	defense: 18	,	spell: 'Bullet'	},
				{ sprite: 'neophyte',		prob: 3,	type: 'fighter', 	level: 3, 	health: 2, 		mana: 18, 	offense: 1, 	defense: 12	}
			],
			song: 'DST-TheHauntedChapel',
			sceneInfo: {
				pic1: 'scene_entrance1',
				dialog: [
					{ speaker: 'wizard', text: 'The priests of this' },
					{ speaker: 'fighter', text: 'unholy church were' },
					{ speaker: 'fighter', text: 'corrupted by the' },
					{ speaker: 'wizard', text: 'mysterious ichor.' },
					{ speaker: 'wizard', text: 'But where did it come' },
					{ speaker: 'fighter', text: 'from?  I have no answers!' }
				]
			}
		}
	]
}