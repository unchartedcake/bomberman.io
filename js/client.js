var ip = '192.168.0.6';
var port = '1234';
var socket = io.connect('http://' + ip + ':' + port);

// settings
var settings = {
	canvas: {
		width: 980,
		height: 560
	},
	gridSize: 70
}
// grid scale
var gridScale = {
	row: settings.canvas.height / settings.gridSize,
	col: settings.canvas.width / settings.gridSize
};
// map
var oldMap = [];
function mapCell() {
	this.type = "background";	// background, tile, obstacle
	this.canBeDestroyed = false;
}
for(var row = 0; row < gridScale.row; row++) {
	oldMap[row] = [];
	for(var col = 0; col < gridScale.col; col++)
		oldMap[row][col] = new mapCell();
}
// player
var oldPlayerList = [];
var oldPlayer = {
	direction: "down",
	pos: {
		x: 50,
		y: 50
	},
	vel: {	// velocity
		x: 0,
		y: 0,
	},
	acceleration: 3
}
//oldPlayerList.push(oldPlayer);

function getMap(){
	return oldMap;
}

function getPlayerList(){
	return oldPlayerList;
}

// communicate with server
function move(dir){
	socket.emit('move', dir);
}

socket.on('connect', function(){
	var username = prompt('Your name?');
	if (username == null)
		username = 'Mr.Uknown';
	socket.emit('enter', username);
});

socket.on('update', function(newMap, newPlayerList){
	//alert('map update');
	oldMap = newMap;
	oldPlayerList = newPlayerList;
});