var ip = '192.168.0.3';
var port = 1234;
var server = require('http').createServer(handle);
var io = require('/Users/cupcake/Desktop/GitHub/bomberman.io/node_modules/socket.io').listen(server);
var fs = require('fs');
var path = require('path');

// handle http request
function handle(request, response){
	filePath = '.' + request.url;
	filePath = (filePath == './') ? './index.html' : filePath;
	ext = path.extname(filePath);
	if (ext != '.html' && ext != '.js' && ext != '.png'){
		console.log('someone try to request ' + ext + ' file');
		response.end();
		return;
	}
	fs.readFile(filePath, function(err, data){
		if(err)
			throw err;
		response.end(data);	
	});
}

// compute
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
	}
}
// grid scale
var gridScale = {
	row: settings.canvas.height / settings.gridSize,
	col: settings.canvas.width / settings.gridSize
};
// tools
function row2CoordY(row) {
	return settings.gridSize * row;
}
function col2CoordX(col) {
	return settings.gridSize * col;
}
function coordY2Row(y) {
	return (Math.floor(y / settings.gridSize));
}
function coordX2Col(x) {
	return (Math.floor(x / settings.gridSize));
}

// init map
var map = [];
function mapCell() {
	this.type = "background";	// background, tile, obstacle
	this.canBeDestroyed = false;
}
mapCell.prototype.isPassable = function() {
	if(this.type == "obstacle") return false;
	return true;	// background/tile
};
function addTile(row, col, imgSrc) {
	map[row][col].type = "tile";
}

function addObstacle(row, col, imgSrc) {
	map[row][col].type = "obstacle";
	map[row][col].canBeDestroyed = canBeDestroyed;
}
for(var row = 0; row < gridScale.row; row++) {
	map[row] = [];
	for(var col = 0; col < gridScale.col; col++)
		map[row][col] = new mapCell();
}
addTile(3, 10, "grass");
addTile(4, 7, "grass");
addObstacle(1, 1, "box1", true);
addObstacle(6, 7, "box2", true);

// init player
var playerList = [];
// decelerate every 0.02s
setInterval(function(){
	for (var i = 0; i < playerList.length; i++){
		playerList[i].vel.x *= settings.movement.deceleration;
		playerList[i].vel.y *= settings.movement.deceleration;
	}
	io.sockets.emit('update', map, playerList);	
}, 20);

function Player(username){
	this.name = username;
	this.direction = 'down';
	this.pos = {
		x: 50,
		y: 50
	}
	this.vel = {
		x: 0,
		y: 0
	}
	this.acceleration = 3;
}
function isPassableByPos(x, y) {
	// border test
	if(x < 0 || y < 0 || x >= settings.canvas.width || y >= settings.canvas.height)
		return false;
	// obstacle test
	return map[coordY2Row(y)][coordX2Col(x)].isPassable();
}
function isCollision(x, y) {
	var halfBoxSize = settings.player.boxSize / 2;
	if(isPassableByPos(x - halfBoxSize, y - halfBoxSize) &&		// top-left
		isPassableByPos(x + halfBoxSize, y - halfBoxSize) &&	// top-right
		isPassableByPos(x + halfBoxSize, y + halfBoxSize) &&	// bottom-right
		isPassableByPos(x - halfBoxSize, y + halfBoxSize)		// bottom-left
	) return false;
	return true;
}
function movePlayer(player, dir){
	// player movement
	switch (dir){
	case 'up':	// key up
		player.direction = "up";
		player.vel.x = 0;
		player.vel.y -= player.acceleration;
		break;
	case 'right':	// key right
		player.direction = "right";
		player.vel.x += player.acceleration;
		player.vel.y = 0;
		break;
	case 'down':	// key down
		player.direction = "down";
		player.vel.x = 0;
		player.vel.y += player.acceleration;
		break;
	case 'left':	// key left
		player.direction = "left";
		player.vel.x -= player.acceleration;
		player.vel.y = 0;
		break;
	}
	player.pos.x += player.vel.x;
	player.pos.y += player.vel.y;

	// detect collision
	var offset = settings.player.boxSize / 2 + 1;
	if (isCollision(player.pos.x, player.pos.y)) {
		switch(player.direction) {
			case "up":
				player.pos.y = settings.gridSize * coordY2Row(player.pos.y) + offset;
				player.vel.y = 0;
				break;
			case "right":
				player.pos.x = settings.gridSize * (coordX2Col(player.pos.x) + 1) - offset;
				player.vel.x = 0;
				break;
			case "down":
				player.pos.y = settings.gridSize * (coordY2Row(player.pos.y) + 1) - offset;
				player.vel.y = 0;
				break;
			case "left":
				player.pos.x = settings.gridSize * coordX2Col(player.pos.x) + offset;
				player.vel.x = 0;
				break;
		}
	}
}

function updatePlayerList(player){
	for (var i = 0; i < playerList.length; i++)
		if (playerList[i].name == player.name){
			playerList[i] = player;
			return;
		}
}

// server communicate
server.listen(port, ip);
console.log("running on " + ip + " " + port);
io.sockets.on('connection', function(socket){
	socket.on('enter', function (username){
		console.log(username + ' is connected.');
		socket.player = new Player(username);
		playerList.push(socket.player);
		io.sockets.emit('update', map, playerList);
	});

	socket.on('move', function(dir){
		console.log(socket.player.name + ' moves ' + dir);
		movePlayer(socket.player, dir);
		updatePlayerList(socket.player);
		io.sockets.emit('update', map, playerList);	
	});
	//socket.emit: send to a specific socket
	//socket.broadcast.emit: send to all socket except this one
	//io.sockets.emit: send to all socket
});
