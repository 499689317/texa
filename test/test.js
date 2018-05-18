


/**
 * 项目测试脚本
 * 模拟玩家注册登陆
 * 模拟玩家正常游戏
 */

var tools = require("./tools.js");
var crypto = require("crypto");
var Pomelo = require("pomelo-node-tcp-client");
var pomelo = new Pomelo();

function getCipher(str) {

	var cipher = crypto.createCipher('DES-ECB', "test@ledongtian");
	var crypted = cipher.update(str,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted;
};

(function() {

	var uniqueId = "test_1";
	var nickname = "name_test_1";
	var serverId = 1;
	var token = getCipher(uniqueId);
	console.log(token);
	// 登陆gate
	connGate(uniqueId, function(gdata) {
		if (typeof gdata === "Error") {
			console.error("失败");
			return;
		};
		console.log(gdata);
		// 连接connector
		connConnector(gdata.host, gdata.port, function(cdata) {
			console.log(cdata);
			console.log("connector连接ok");
			// 登陆游戏
			loginConnector(serverId, token, nickname, function(ldata) {
				console.log("connector登陆ok");
				testRoom(function(d) {
					console.log(d);
				});
				// testMatch(function(d) {
				// 	console.log(d);
				// });
				// testCards(function(d) {
				// 	console.log(d);
				// });
				// 加入房间
				testJoin(function(ret) {
					console.log(ret);
				});
			});
		});
	});
})();

// 拿取connector地址
function connGate(uid, cb) {

	var gateHost = "127.0.0.1";
	// var gateHost = "192.168.10.175";
	var gatePort = 11015;
	var gateUrl = "http://" + gateHost + ":" + gatePort;
	var path = gateUrl + "/gate?uniqueId=" + uid;
	console.log(path);
	tools.get(path, function(err, ret) {
		
		if (ret instanceof Error) {
			console.log("登陆gate出错");
			console.error(ret);
			return;
		};
		cb && cb(JSON.parse(ret));
	});
};

// 连接connector
function connConnector(host, port, cb) {

	pomelo.init(host, port, {}, function(ret) {
		
		cb && cb(ret);
	});
};
// 登陆connector
function loginConnector(sid, token, nickname, cb) {

	var msg = {
		serverId: sid,
		token: token,
		nickname: nickname
	};
	pomelo.request("connector.entryHandler.enter", msg, function(ret) {
		
		cb && cb(ret);
	});
};

function testMatch(cb) {

	var msg = {};
	pomelo.request("match.matchHandler.match", msg, function(ret) {
		cb && cb(ret);
	});
};

function testJoin(cb) {
	var msg = {};
	pomelo.request("room.roomHandler.join", msg, function(ret) {
		cb && cb(ret);
	});
};

// 测试房间
function testRoom(cb) {

	pomelo.on("room_message", function(ret) {
		// 接收卡牌信息
		if (ret.route == "hole_cards") {
			console.log("底牌圈发牌");
			console.log(ret.msg);
		} else if (ret.route == "flop_cards") {
			console.log("翻牌圈发牌");
			console.log(ret.msg);
		} else if (ret.route == "turn_cards") {
			console.log("转牌圈发牌");
			console.log(ret.msg);
		} else if (ret.route == "river_cards") {
			console.log("河牌圈发牌");
			console.log(ret.msg);
		};

		// 接收出牌信息
		if (ret.route == "talk") {
			console.log("说话阶段");
			console.log(ret.msg);
		};
		// 补发公共牌
		if (ret.route == "patch_cards") {
			console.log("补发公共牌");
			console.log(ret.msg);
		};
		// 接收游戏结果
		if (ret.route == "result") {
			console.log("游戏结果");
			console.log(ret.msg);
		};

	});
};
// 下注
function testBet(cb) {

	var msg = {
		roomId: 1,
		count: 100
	};
	pomelo.request("room.roomHandler.bet", msg, function(ret) {
		cb && cb(ret);
	});
};
// 加注
function testRaise(cb) {

	var msg = {
		roomId: 1,
		count: 200
	};
	pomelo.request("room.roomHandler.raise", msg, function(ret) {
		cb && cb(ret);
	});
};
// 跟注
function testCall(cb) {

	var msg = {
		roomId: 1,
		count: 200
	};
	pomelo.request("room.roomHandler.call", msg, function(ret) {
		cb && cb(ret);
	});
};

// 过牌
function testCheck(cb) {

	var msg = {
		roomId: 1
	};
	pomelo.request("room.roomHandler.check", msg, function(ret) {
		cb && cb(ret);
	});
};


// 测试牌型

function testCards(cb) {


	var msg = {
		roomId: 1
	};
	pomelo.request("room.roomHandler.testCards", msg, function(ret) {
		cb && cb(ret);
	});
};
























