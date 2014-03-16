function fadeOutControls() {
	$('div.playerControls').stop().css('opacity', 1);
	$('div.playerControls').animate({ opacity: 0 }, 2000);
}

function updateMiniMap() {
	var drawingCanvas = document.getElementById('canvasMiniMap');
	var context = drawingCanvas.getContext('2d');

	for (var y=0;y<g_game.mapTiles[0].length;y++) {
		for (var x=0;x<g_game.mapTiles.length;x++) {
			context.fillStyle = '#000';
			if (g_game.mapReveal[y][x]) {
				var tile = g_game.mapTiles[x][y];
				if (tile == 1) {
					context.fillStyle = '#005784';
				}
				else if (tile == 2) {
					context.fillStyle = '#31A2F2';
				}
			}
			context.fillRect(x*6,y*3,6,3);
		}
	}
	//if (g_game.mapReveal[g_game.entrance.y/TILE_HEIGHT][g_game.entrance.x/TILE_WIDTH]) {
	//	context.fillStyle = '#44891A';
	//	context.fillRect((g_game.entrance.x/TILE_WIDTH)*6-1,(g_game.entrance.y/TILE_HEIGHT)*3-1,8,4);
	//}
	if (g_game.mapReveal[g_game.exit.y/TILE_HEIGHT][g_game.exit.x/TILE_WIDTH]) {
		context.fillStyle = '#BE2633';
		context.fillRect((g_game.exit.x/TILE_WIDTH)*6-1,(g_game.exit.y/TILE_HEIGHT)*3-1,8,4);
	}

	context.fillStyle = '#fff';
	//context.fillRect(g_game.fighter.locX*6,g_game.fighter.locY*3,6,3);
	context.fillRect(g_game.wizard.locX*6,g_game.wizard.locY*3,6,3);

}

function layoutGUI() {
	$('#divGUI').show();
	var pos = $('#cr-stage').offset();
	$('#imgCharBox').css({
		top: pos.top,
		left: pos.left
	});
	$('#divCharHealth').css({
		left: pos.left + 36*2,
		top: pos.top + 55*2
	});
	$('#divPortrait').css({
		top: pos.top + 15,
		left: pos.left + 16
	});
	$('#charSlot0').css({
		top: pos.top + 53 + 5,
		left: pos.left + 109 + 5
	});
	$('#charSlot1').css({
		top: pos.top + 53 + 5,
		left: pos.left + 165 + 5
	});
	$('#uiNum1').css({
		top: pos.top + 53 + 5 - 3,
		left: pos.left + 109 + 5 + 24
	});
	$('#uiNum2').css({
		top: pos.top + 53 + 5 - 3,
		left: pos.left + 165 + 5 + 24
	});

	$('#imgIchorMeter').css({
		top: pos.top + $('#imgCharBox').height() + 48,
		left: pos.left + 32
	});
	var posMeter = $('#imgIchorMeter').offset();
	$('#divIchorMeter').css({
		top: posMeter.top + 4,
		left: posMeter.left + 4
	});

	$('div.ichorText').css({
		'font-family': GAME_FONT
	})

	$('#canvasMiniMap').css({ width: 64*3, height: 64*3, left: pos.left + $('#cr-stage').width() - 64*3 - 6, top: pos.top + 6 });

}

function showIchorAmount() {
	if (g_game.persona == 0 && g_game.ichorAmount >= 48) {
		g_game.persona = 1;
		loadPersona();
		//g_game.ichorAmount = 0
	}
	else if (g_game.persona == 1 && g_game.ichorAmount >= 90) {
		g_game.persona = 2;
		loadPersona();
	}

	var maxHeight = 153;
	var height = Math.floor(maxHeight * g_game.ichorAmount / 100);
	var posMeter = $('#imgIchorMeter').offset();
	$('#divIchorMeter').css({
		height: height,
		top: posMeter.top + 4 + maxHeight - height
	});
}

function showAddIchor(amt) {
	var id = g_game.nextIchorId || 0 ;
	g_game.nextIchorId = (id + 1) % 6;

	var $txt = $('#ichorText_' + id);
	$txt.text(amt);
	var pos = $('#cr-stage').offset();
	var posMeter = $('#imgIchorMeter').offset();
	$txt.css({
		left: pos.left + VIEW_WIDTH/2,
		top: pos.top + VIEW_HEIGHT/2
	}).show().animate( {
			top: posMeter.top - 20,
			left: posMeter.left + 4
		},
		{
			duration: 600,
			//easing: 'easeOutQuint',
			complete: function() {
				$txt.animate({
						top: posMeter.top + 120
					},
					{
						duration: 1000,
						complete: function() {
							g_game.ichorAmount = Math.min(100, g_game.ichorAmount + amt);
							showIchorAmount();
							$txt.hide();
						}
					}
				)
			}
		}
	);


}

function loadPersona() {
	var xTile = g_game.wizard.x / TILE_WIDTH;
	var yTile = g_game.wizard.y / TILE_HEIGHT;
	Crafty.e('IchorExplode').IchorExplode(g_game.wizard.x, g_game.wizard.y);
	g_game.wizard.destroy();
	if (g_game.persona == 2) {
		g_game.wizard = Crafty.e('Caster')
			.Caster(xTile, yTile, g_game.wizardControls);
		$('#uiNum1').show();
		$('#uiNum2').show();
	}
	else if (g_game.persona == 1) {
		g_game.wizard = Crafty.e('Gunman')
			.Gunman(xTile, yTile, g_game.wizardControls);
		$('#uiNum1').show();
		$('#uiNum2').hide();
	}
	else {
		g_game.wizard = Crafty.e('Peasant')
			.Peasant(xTile, yTile, g_game.wizardControls);
		$('#uiNum1').show();
		$('#uiNum2').hide();
	}

	g_game.wizard.speak('Where am I?')

}