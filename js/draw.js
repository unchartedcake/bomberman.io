/* todo:
 * devInfo, imgReady, renderByMapCellType
 */

// settings
var settings = {
	canvas: {
		width: 980,
		height: 560
	},
	gridSize: 70,
	player: {
		boxSize: 50,
	},
	movement: {
		deceleration: 0.2,
		walkCounterThresh: 5
	},
	gridScale: {
		row: 8,
		col: 14
	}
}

// initialize properties related to canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

/* I just finish reviewing code here */


// player controlling
var keyStatus = [];	// records the status of each key

document.body.addEventListener("keydown", function(event) {
	keyStatus[event.keyCode] = true;
});
document.body.addEventListener("keyup", function(event) {
	keyStatus[event.keyCode] = false;
});

function handleKeyEvent() {
	// player movement
	if(keyStatus[38]) {	// key up
		move('up');
		player.direction = "up";
		player.vel.x = 0;
		player.vel.y -= player.acceleration;
	}
	if(keyStatus[39]) {	// key right
		move('right');
		player.direction = "right";
		player.vel.x += player.acceleration;
		player.vel.y = 0;
	}
	if(keyStatus[40]) {	// key down
		move('down');
		player.direction = "down";
		player.vel.x = 0;
		player.vel.y += player.acceleration;
	}
	if(keyStatus[37]) {	// key left
		move('left');
		player.direction = "left";
		player.vel.x -= player.acceleration;
		player.vel.y = 0;
	}
	player.pos.x += player.vel.x;
	player.pos.y += player.vel.y;
	player.vel.x *= settings.movement.deceleration;
	player.vel.y *= settings.movement.deceleration;

	// detect collision
	var offset = playerBoxSize / 2 + 1;
	if(isCollision(player.pos.x, player.pos.y)) {
		switch(player.direction) {
			case "up":
				player.pos.y = gridSize * coordY2Row(player.pos.y) + offset;
				player.vel.y = 0;
				break;
			case "right":
				player.pos.x = gridSize * (coordX2Col(player.pos.x) + 1) - offset;
				player.vel.x = 0;
				break;
			case "down":
				player.pos.y = gridSize * (coordY2Row(player.pos.y) + 1) - offset;
				player.vel.y = 0;
				break;
			case "left":
				player.pos.x = gridSize * coordX2Col(player.pos.x) + offset;
				player.vel.x = 0;
				break;
		}
	}
}

function isPassableByPos(x, y) {
	// border test
	if(x < 0 || y < 0 || x >= settings.canvas.width || y >= settings.canvas.height)
		return false;
	// obstacle test
	return map[coordY2Row(y)][coordX2Col(x)].isPassable();
}

function isCollision(x, y) {
	var halfBoxSize = playerBoxSize / 2;
	if(isPassableByPos(x - halfBoxSize, y - halfBoxSize) &&		// top-left
		isPassableByPos(x + halfBoxSize, y - halfBoxSize) &&	// top-right
		isPassableByPos(x + halfBoxSize, y + halfBoxSize) &&	// bottom-right
		isPassableByPos(x - halfBoxSize, y + halfBoxSize)		// bottom-left
	) return false;
	return true;
}


// render canvas
var playerList = [];
function renderCanvas() {
	canvas.width = settings.canvas.width;
	canvas.height = settings.canvas.height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//map = getMap();
	drawMapCell();
	drawGrid();

	playerList = getPlayerList();
	for (var i = 0; i < playerList.length; i++)
		drawPlayer(playerList[i]);
	handleKeyEvent();
	showDevInfo();
	FPSCounter++;
	window.requestAnimationFrame(renderCanvas);
}
// BH TODO: draw mapCell image by mapCell.type
var a = new Image();
a.src = 'img/background.png';
var b = new Image();
b.src = 'img/obstacles/box1.png';
function drawMapCell() {
	for(var row = 0; row < settings.gridScale.row; row++)
		for(var col = 0; col < settings.gridScale.col; col++){
			// BH TODO: draw mapCell image by mapCell.type
			var img = (map[row][col].type == 'obstacle') ? b : a;
			ctx.drawImage(
				img,
				col2CoordX(col),
				row2CoordY(row)
			);
		}
}

function drawGrid() {
	ctx.beginPath();
	for(var row = 1; row < settings.gridScale.row; row++) {
		ctx.moveTo(0, row2CoordY(row));
		ctx.lineTo(canvas.width, row2CoordY(row));
	}
	for(var col = 1; col < settings.gridScale.col; col++) {
		ctx.moveTo(col2CoordX(col), 0);
		ctx.lineTo(col2CoordX(col), canvas.height);
	}
	ctx.lineWidth = 1;
	ctx.setLineDash([5, 5]);
	ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
	ctx.stroke();
}

var walkCounter = 0;
function drawPlayer(playerT) {
	var x = playerT.pos.x;
	var y = playerT.pos.y;
	var boxSize = settings.player.boxSize;

	var img = new Image();
	if(playerT.direction == "down" || playerT.direction == "up") {
		walkCounter = 0;
		img.src = "img/player/player.png";
	}
	else if(playerT.vel.x > 1e-3) {
		walkCounter++;
		img.src = "img/player/walk_r_" + Math.floor(walkCounter / settings.movement.walkCounterThresh) % 11 + ".png";
	}
	else if(playerT.vel.x < -1e-3) {
		walkCounter++;
		img.src = "img/player/walk_l_" + Math.floor(walkCounter / settings.movement.walkCounterThresh) % 11 + ".png";
	}
	else {
		walkCounter = 0;
		if(playerT.direction == "right")
			img.src = "img/player/walk_r_0.png";
		else
			img.src = "img/player/walk_l_0.png";
	}

	ctx.drawImage(
		img,
		x - img.width * zoom / 2,
		y + playerBoxSize / 2 - img.height * zoom,
		img.width * zoom,
		img.height * zoom
	);

	ctx.beginPath();
	// center spot of the player
	ctx.arc(x, y, 1, 0, 2 * Math.PI);
	// box model of the player
	ctx.rect(x - playerBoxSize / 2, y - playerBoxSize / 2, playerBoxSize, playerBoxSize);
	ctx.lineWidth = 2;
	ctx.setLineDash([]);
	ctx.strokeStyle = "brown";
	ctx.stroke();
}


// development information
var FPSCounter = 0;

setInterval(function() {
	document.getElementById("FPS").innerHTML = FPSCounter;
	FPSCounter = 0;
}, 1000);

function showDevInfo() {
	document.getElementById("direction").innerHTML = player.direction;
	document.getElementById("walkingFrame").innerHTML = Math.floor(walkCounter / settings.movement.walkCounterThresh) % 11;
	document.getElementById("playerPosX").innerHTML = player.pos.x.toFixed(2);
	document.getElementById("playerPosY").innerHTML = player.pos.y.toFixed(2);
	document.getElementById("playerVelX").innerHTML = player.vel.x;
	document.getElementById("playerVelY").innerHTML = player.vel.y;

}


// tools
function row2CoordY(row) {
	return gridSize * row;
}
function col2CoordX(col) {
	return gridSize * col;
}
function coordY2Row(y) {
	return (Math.floor(y / gridSize));
}
function coordX2Col(x) {
	return (Math.floor(x / gridSize));
}


// preload images
var imgSrcList = [
	"/background.png",
	"/obstacles/box1.png",
	"/obstacles/box2.png",
	"/player/player.png",
	"/player/walk_r_0.png",
	"/player/walk_r_1.png",
	"/player/walk_r_2.png",
	"/player/walk_r_3.png",
	"/player/walk_r_4.png",
	"/player/walk_r_5.png",
	"/player/walk_r_6.png",
	"/player/walk_r_7.png",
	"/player/walk_r_8.png",
	"/player/walk_r_9.png",
	"/player/walk_r_10.png",
	"/player/walk_l_0.png",
	"/player/walk_l_1.png",
	"/player/walk_l_2.png",
	"/player/walk_l_3.png",
	"/player/walk_l_4.png",
	"/player/walk_l_5.png",
	"/player/walk_l_6.png",
	"/player/walk_l_7.png",
	"/player/walk_l_8.png",
	"/player/walk_l_9.png",
	"/player/walk_l_10.png",
	"/tiles/grass.png"
];

var loadImgCount = 0;
var loadImgTotal = imgSrcList.length;

for(var i = 0; i < loadImgTotal; i++) {
	var image = new Image();
	image.onload = function() {
		loadImgCount++;
		if(loadImgCount == loadImgTotal)	//finish loading
			renderCanvas();
	};
	image.src = "img" + imgSrcList[i];
}
