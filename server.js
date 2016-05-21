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
		console.log('someone try to hack!');
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
var map = [];
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
