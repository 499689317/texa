
var room_mgr  = require("../room_mgr.js");

module.exports = function(app) {
    return new Remote(app);
};

var Remote =  function(app) {
    this.app = app;
    
};

/**
 * 具体负责初始化房间服务器相关
 * 根据配置文件或者自定义等方式，预创建部份房间等待客户端连接
 */
Remote.prototype.init = function(roomId, cb) {
	Log.info("预创建部份房间");
	room_mgr.createRoom(roomId, true);
	cb && cb();
};

Remote.prototype.test = function(cb) {

	// 测试单进程开启8人房游戏房间数
	for (var i = 0; i < 500; i++) {
		
		var roomId = (i + 1);
		room_mgr.createRoom(roomId, true);
	};
	cb && cb();
}

Remote.prototype.create = function(user, cb) {

};
Remote.prototype.kick = function(uid, cb) {
	// 房间踢掉一个玩家
	room_mgr.playerLeave(uid);
	cb && cb();
};
