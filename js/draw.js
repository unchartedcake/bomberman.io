/* todo:
 * imgReady, renderByMapCellType
 */

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
		move("up");
		player.direction = "up";
		player.vel.x = 0;
		player.vel.y -= player.acceleration;
	}
	if(keyStatus[39]) {	// key right
		move("right");
		player.direction = "right";
		player.vel.x += player.acceleration;
		player.vel.y = 0;
	}
	if(keyStatus[40]) {	// key down
		move("down");
		player.direction = "down";
		player.vel.x = 0;
		player.vel.y += player.acceleration;
	}
	if(keyStatus[37]) {	// key left
		move("left");
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
				player.pos.y = 70 * coordY2Row(player.pos.y) + offset;
				player.vel.y = 0;
			break;
			case "right":
				player.pos.x = 70 * (coordX2Col(player.pos.x) + 1) - offset;
				player.vel.x = 0;
			break;
			case "down":
				player.pos.y = 70 * (coordY2Row(player.pos.y) + 1) - offset;
				player.vel.y = 0;
			break;
			case "left":
				player.pos.x = 70 * coordX2Col(player.pos.x) + offset;
				player.vel.x = 0;
			break;
			}
	}
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

function isPassableByPos(x, y) {
	// border test
	if(x < 0 || y < 0 || x >= canvas.width / zoomRatio || y >= canvas.height / zoomRatio)
		return false;
	// obstacle test
	return map[coordY2Row(y)][coordX2Col(x)].type != "obstacle";
}


// render canvas
var playerList = [];
function renderCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	map = updateMap();
	drawMap();
	drawGrid();
	playerList = getPlayerList();
	for (var i = 0; i < playerList.length; i++)
		drawPlayer(playerList[i]);
	handleKeyEvent();
	FPSCounter++;
	showDevInfo();
	window.requestAnimationFrame(renderCanvas);
}


// NEED TO BE MODIFIED (img.src part)
var img_background = new Image();
img_background.src = "img/background.png";
var img_box = new Image();
img_box.src = "img/obstacle/box1.png";

function drawMap() {	// not a good method
	for(var row = 0; row < settings.gridScale.row; row++)
		for(var col = 0; col < settings.gridScale.col; col++) {
			var img = (map[row][col].type == "background")?  img_background : img_box;
			var type = map[row][col].type;
			var subType = map[row][col].subType;
			if(type == "background") {
				ctx.drawImage(
					imgReady[imgIndex["background"]],
					col2CoordX(col), row2CoordY(row),
					gridSize, gridSize
				);
			}
			else if(type == "tile") {
				ctx.drawImage(
					imgReady[imgIndex.tile[subType]],
					col2CoordX(col), row2CoordY(row),
					gridSize, gridSize
				);
			}
			else {
				ctx.drawImage(
					imgReady[imgIndex.obstacle[subType]],
					col2CoordX(col), row2CoordY(row),
					gridSize, gridSize
				);
			}
		}
}

function drawGrid() {
	if(!document.getElementById("showGrid").checked) return;
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
function drawPlayer(p) {
	var x = p.pos.x;
	var y = p.pos.y;
	var boxSize = settings.player.boxSize;
	var img = new Image();

	if(p.direction == "down" || p.direction == "up") {
		walkCounter = 0;
		img.src = "img/player/player.png";
	}
	else if(p.vel.x > 1e-3) {
		walkCounter++;
		img.src = "img/player/walk_r_" + Math.floor(walkCounter / settings.movement.walkCounterThresh) % 11 + ".png";
	}
	else if(p.vel.x < -1e-3) {
		walkCounter++;
		img.src = "img/player/walk_l_" + Math.floor(walkCounter / settings.movement.walkCounterThresh) % 11 + ".png";
	}
	else {
		walkCounter = 0;
		if(p.direction == "right")
			img.src = "img/player/walk_r_0.png";
		else
			img.src = "img/player/walk_l_0.png";
	}

	ctx.drawImage(
		img,
		(x - img.width / 2) * zoomRatio,
		(y + playerBoxSize / 2 - img.height) * zoomRatio,
		img.width * zoomRatio,
		img.height * zoomRatio
	);
	ctx.font = "14px Arial"; 
	ctx.textAlign = "center";
	ctx.fillText(p.name, x * zoomRatio, (y + boxSize / 2 + 14) * zoomRatio);

	if(!document.getElementById("showPlayerBorder").checked) return;
	ctx.beginPath();
	// center spot of the player
	ctx.arc(x * zoomRatio, y * zoomRatio, 2, 0, 2 * Math.PI);
	// border of the player's box model
	ctx.rect(
		(x - playerBoxSize / 2) * zoomRatio,
		(y - playerBoxSize / 2) * zoomRatio,
		playerBoxSize * zoomRatio,
		playerBoxSize * zoomRatio
	);
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
	document.getElementById("playerVelX").innerHTML = player.vel.x.toFixed(2);
	document.getElementById("playerVelY").innerHTML = player.vel.y.toFixed(2);
}


// tools
function row2CoordY(row) {
	return gridSize * row;
}
function col2CoordX(col) {
	return gridSize * col;
}
function coordY2Row(y) {
	return (Math.floor(y / 70));
}
function coordX2Col(x) {
	return (Math.floor(x / 70));
}


// preload images and execute
var imgSrcList = [
	"/background.png",		// 0, default background image
	"/player/player.png",
	"/player/walk_l_0.png",
	"/player/walk_l_1.png",
	"/player/walk_l_2.png",
	"/player/walk_l_3.png",	// 5
	"/player/walk_l_4.png",
	"/player/walk_l_5.png",
	"/player/walk_l_6.png",
	"/player/walk_l_7.png",
	"/player/walk_l_8.png",	// 10
	"/player/walk_l_9.png",
	"/player/walk_l_10.png",
	"/player/walk_r_0.png",
	"/player/walk_r_1.png",
	"/player/walk_r_2.png",	// 15
	"/player/walk_r_3.png",
	"/player/walk_r_4.png",
	"/player/walk_r_5.png",
	"/player/walk_r_6.png",
	"/player/walk_r_7.png",	// 20
	"/player/walk_r_8.png",
	"/player/walk_r_9.png",
	"/player/walk_r_10.png",
	"/obstacle/box1.png",
	"/obstacle/box2.png",	// 25
	"/tile/grass.png"
];
var imgReady = [];
var imgIndex = {
	background: 0,
	player: {
		face: 1,
		leftFirstFrame: 2,
		rightFirstFrame: 13
	},
	obstacle: {
		box1: 24,
		box2: 25,
	},
	tile: {
		grass: 26
	}
};

var loadImgCount = 0;
var loadImgTotal = imgSrcList.length;

for(var i = 0; i < loadImgTotal; i++) {
	var image = new Image();
	image.onload = function() {
		loadImgCount++;
		if(loadImgCount == loadImgTotal)	// finish loading
			renderCanvas();
	};
	image.src = "img" + imgSrcList[i];
	imgReady[i] = image;
}
