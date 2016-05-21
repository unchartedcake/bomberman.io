var ip = '192.168.0.6';
var port = '1234';
var socket = io.connect('http://' + ip + ':' + port);

// map and player
var oldMap = [];
var oldPlayer;
function getMap(){
	return oldMap;
}

function getPlayer(){
	return oldPlayer;
}

// communicate with server
socket.on('connect', function(){
	var username = prompt('Your name?');
	if (username.length == 0)
		username = 'Mr.Uknown';
	socket.emit('enter', username);
});

socket.on('update', function(newMap, newPlayer){
	oldMap = newMap;
	oldPlayer = newPlayer;
});