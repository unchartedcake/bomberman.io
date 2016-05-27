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
function drawMap() {
	for(var row = 0; row < settings.gridScale.row; row++)
		for(var col = 0; col < settings.gridScale.col; col++) {
			var img = new Image();
			img.src = (map[row][col].type == "background")? "img/background.png" : "img/obstacles/box1.png";
			ctx.drawImage(img, col2CoordX(col), row2CoordY(row));
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

// execution
renderCanvas();
