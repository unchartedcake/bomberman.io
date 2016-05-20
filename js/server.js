var server = require('http').createServer(handle);
var io = require('/usr/local/lib/node_modules/socket.io').listen(server);
var fs = require('fs');

function handle(request, response){
	fs.readFile('./t.html', function readF(err, data) {
		if (err) throw err;
		response.end(data);	
	});

}

var ip = '192.168.0.102';
var port = 1234;
var value = 0;
server.listen(port, ip);
console.log("running on " + ip + " " + port);
io.sockets.on('connection', function (socket){
	socket.on('enter', function (username){
		console.log(username + ' is connected.');
		socket.username = username;
		io.sockets.emit('init', value);	
	});

	socket.on('click', function(){
		var username = socket.username;
		console.log(username + ' clicked.');
		value += 1;
		io.sockets.emit('update', value);	
	});
/*
	socket.on('send', function (data){
		console.log(data);	
		io.sockets.emit('printMessage', socket.username, data);
	});
*/
	//socket.emit: send to a specific socket
	//socket.broadcast.emit: send to all socket except this one
	//io.sockets.emit: send to all socket


});
