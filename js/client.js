var ip = '192.168.0.6';
var port = '1234';
var socket = io.connect('http://' + ip + ':' + port);

socket.on('connect', function(){
	var username = prompt('Your name?');
	if (username.length == 0)
		username = 'Mr.Uknown';
	socket.emit('enter', username);
});

socket.on('init', function(value){
	display.innerHTML = value;
});

socket.on('update', function(value){
	display.innerHTML = value;
});