// connection
var ip = '10.5.7.1';
var port = '1234';
//var socket = io.connect('http://' + ip + ':' + port);

// settings related to canvas and grid
var settings = {
	canvas: {
		width: undefined,
		height: undefined
	},
	gridScale: {
		row: 8,
		col: 14
	}
}
var gridSize = getGridSize();
var zoom = gridSize / 70;
var playerBoxSize = 50 * zoom;

window.onresize = function() {
	settings.canvas.width = gridSize * settings.gridScale.col;
	settings.canvas.height = gridSize * settings.gridScale.row;
	gridSize = getGridSize();
	zoom = gridSize / 70;
	playerBoxSize = 50 * zoom;
};

function getGridSize() {
	var size = min(
		window.innerWidth / settings.gridScale.col,
		window.innerHeight / settings.gridScale.row
	);
	if(size > 70) size = 70;
	return size;
}

settings.canvas.width = gridSize * settings.gridScale.col;
settings.canvas.height = gridSize * settings.gridScale.row;


// map
function mapCell() {
	this.type = "background";	// background, tile, obstacle
	this.subType = "none";
	this.canBeDestroyed = false;
}

mapCell.prototype.isPassable = function() {
	if(this.type == "obstacle") return false;
	return true;	// background/tile
};

var clientMap = [];
for(var row = 0; row < settings.gridScale.row; row++) {
	clientMap[row] = [];
	for(var col = 0; col < settings.gridScale.col; col++)
		clientMap[row][col] = new mapCell();
}

function getMap() {
	return clientMap;
}


// player
var clientPlayer = {
	direction: "down",
	pos: {
		x: 150,
		y: 50
	},
	vel: {	// velocity
		x: 0,
		y: 0,
	},
	acceleration: 4
}

function getPlayer() {
	return clientPlayer;
}


// communicate with server
function move(dir) {
	//socket.emit('move', dir);
}

/*
socket.on('connect', function(){
	var username = prompt('Your name?');
	if (username.length == 0)
		username = 'Mr.Uknown';
	socket.emit('enter', username);
});

socket.on('update', function(newMap, newPlayer){
	//alert('map update');
	clientMap = newMap;
	clientPlayer = newPlayer;
});
*/

// other tools
function min(a, b) {
	if(a < b) return a;
	return b;
}
