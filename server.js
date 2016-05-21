var ip = '192.168.0.6';
var port = 1234;
var server = require('http').createServer(handle);
var io = require('/usr/local/lib/node_modules/socket.io').listen(server);
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

function addObstacle(row, col, imgSrc, canBeDestroyed) {
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
var player;







// server communicate
server.listen(port, ip);
console.log("running on " + ip + " " + port);
io.sockets.on('connection', function(socket){
	socket.on('enter', function (username){
		console.log(username + ' is connected.');
		socket.username = username;
		io.sockets.emit('update', map, player);
	});

	socket.on('up', function(){
		var username = socket.username;
		console.log(username + ' moved up.');
		value += 1;
		io.sockets.emit('update', map, player);	
	});

	socket.on('move', function(dir){
		console.log(socket.username + ' moves ' + dir);
	});
	//socket.emit: send to a specific socket
	//socket.broadcast.emit: send to all socket except this one
	//io.sockets.emit: send to all socket
});
