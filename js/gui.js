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
	$('#imgIchorMeter').css({
		top: pos.top + $('#imgCharBox').height() + 48,
		left: pos.left + 32
	});
	var posMeter = $('#imgIchorMeter').offset();
	$('#divIchorMeter').css({
		top: posMeter.top + 4,
		left: posMeter.left + 4
	});

	$('#divCharControls').css({ top: pos.top + $('#imgCharBox').height() + 24*3,
		left: pos.left + $('#imgwizardBox').width()/2 - 48*3/2, width: 48*3, height: 48*3 });
	$('div.keyText').css('font-family', GAME_FONT);
	$('#divKeyUp').css({ left: $('#divCharControls').width()/2-3*3, top: 12*3 });
	$('#divKeyLeft').css({ left: 12*3, top: $('#divCharControls').height()/2-3*3 });
	$('#divKeyRight').css({ left: 30*3, top: $('#divCharControls').height()/2-3*3 });
	$('#divKeyDown').css({ left: $('#divCharControls').width()/2-3*3, top: 30*3 });
	//$('#divwizardSpells').css({ top: pos.top + $('#imgCharBox').height() + 3*3,
	//	left: pos.left + $('#imgwizardBox').width()/2 - 64*3/2, width: 64*3, height: 16*3 });
	//$('#divwizardSpellControls').css({
	//	top: $('#divwizardSpells').offset().top + 14*3,
	//	left: $('#divwizardSpells').offset().left,
	//	width: $('#divwizardSpells').width()
	//});
	$('#divKeySpell1').css({ left: (16/2-2)*3 });
	$('#divKeySpell2').css({ left: (3*16/2-2)*3 });
	$('#divKeySpell3').css({ left: (5*16/2-2)*3 });
	$('#divKeySpell4').css({ left: (7*16/2-2)*3 });
	$('#imgSpell_Fireball').css('left', 16*3);
	$('#imgSpell_Sleep').css('left', 32*3);
	$('#imgSpell_Lightening').css('left', 48*3);
	//$('#divOverlay').css({ width: $('#cr-stage').width(), height: $('#cr-stage').height(), left: pos.left+2, top: pos.top+2 });

	$('#canvasMiniMap').css({ width: 64*3, height: 64*3, left: pos.left + $('#cr-stage').width() - 64*3 - 6, top: pos.top + 6 });

}

function showIchorAmount() {
	var maxHeight = 153;
	var height = Math.floor(maxHeight * g_game.ichorAmount / 100);
	var posMeter = $('#imgIchorMeter').offset();
	$('#divIchorMeter').css({
		height: height,
		top: posMeter.top + 4 + maxHeight - height
	});

}