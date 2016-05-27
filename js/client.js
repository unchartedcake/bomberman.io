// connection setting
var ip, port, socket;
if(connectionType == "LAN") {	// local/LAN/workstation
	ip = '192.168.0.3';
	port = '1234';
	socket = io.connect('http://' + ip + ':' + port);
}

if(connectionType != "local") {
	socket.on('connect', function(){
		var username = prompt('Your name?');
		if (username == null)
			username = 'Mr.Uknown';
		socket.emit('enter', username);
	});
	socket.on('update', function(newMap, newPlayerList){
		clientMap = newMap;
		clientPlayerList = newPlayerList;
	});
}


// initialize canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


// settings (SHOULD BE MOVED TO SERVER)
var settings = {
	gridScale: {
		row: 8,
		col: 14
	},
	player: {
		boxSize: 50
	},
	movement: {
		deceleration: 0.2,
		walkCounterThresh: 5
	}
};

var gridSize;
var zoomRatio;
var playerBoxSize = 50;

function resizeCanvas() {
	gridSize = getGridSize();
	canvas.width = gridSize * settings.gridScale.col;
	canvas.height = gridSize * settings.gridScale.row;
	zoomRatio = gridSize / 70;
}

function getGridSize() {
	var gridSize = min(
		window.innerWidth / settings.gridScale.col,
		window.innerHeight / settings.gridScale.row
	);
	if(gridSize > 70) gridSize = 70;
	return gridSize;
}

window.onresize = resizeCanvas;
resizeCanvas();


// map
var clientMap = [];

function MapCell() {
	this.type = "background";	// background(default), tile, obstacle
	this.subType = "none";
}

for(var row = 0; row < settings.gridScale.row; row++) {
	clientMap[row] = [];
	for(var col = 0; col < settings.gridScale.col; col++)
		clientMap[row][col] = new MapCell();
}

function updateMap() {	// WHAT'S THIS?
	if(connectionType == "local") return localMap;
	return clientMap;
}


// player
var clientPlayerList = [];
function getPlayerList() {
	if(connectionType == "local") return [player];
	return clientPlayerList;
}

// communicate with server
function move(dir) {
	if(connectionType == "local") return;
	socket.emit('move', dir);
}


// other functions
function min(a, b) {
	return (a < b) ? a : b;
}
