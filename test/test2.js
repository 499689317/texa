
// tcp客户端
var net = require('net');

var host = "127.0.0.1";
var port = 7000;

var count = 4000;

(function() {

	init();
})();

function init() {

	count--;
	createConn(function(c) {

		if (!count) {
			console.log("创建完毕！！！");



			return;
		};
		init();

		send(c, Date.now());

	});
};


function createConn(cb) {

	var client = net.createConnection(port, host);

	client.on('connect', function(){
	    console.log('客户端：已经与服务端建立连接', count);
	    cb && cb(client);
	});
	client.on('data', function(data){
	    console.log('客户端：收到服务端数据，内容为:'+ data);
	    
	    send(client, Date.now());
	});
	client.on('close', function(data){
	    console.log('客户端：连接断开');
	});
};


function send(cl, msg) {
	cl.write(msg + "");
};


// setInterval(function() {
// 	var r = Math.floor(Math.random() * 10);
// 	var str = '...' + r;
// 	console.log("数据长度：", str.length);
// 	client.write(str);
// }, 2000);


