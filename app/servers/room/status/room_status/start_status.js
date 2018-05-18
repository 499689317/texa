
var room_mgr = require("../../room_mgr.js");

/**
 * 德州扑克房间状态机
 * 开始状态：StartStatus(达成开始游戏条件)
 */

// 开始游戏，准备阶段
class StartStatus {

	constructor(id) {
		this.id = Const.RoomStatus.Start;
		this.roomId = id;
		this.room = null;
	};
	onEnter() {
		Log.info("房间" + this.roomId + "进入准备开始状态");
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，意味着这个房间不能用", this.roomId);
			return;
		};
		this.check();
	};

	check() {
		
		// 准备牌堆，包括取牌，洗牌等
		// 准备完毕后进入开始发底牌状态
		this.room.card_mgr.init();
		// 洗牌，此时牌已经够乱了
		this.room.card_mgr.shuffleCards();
		
		// 没有问题后进入发牌阶段
		this.room.update(Const.RoomStatus.Hole);
	};

	onExit() {
		Log.info("房间" + this.roomId + "退出准备开始状态");
		this.room.clearPreTalk();
		// this.destroy();
	};
	destroy() {
		this.id = 0;
		this.roomId = 0;
		this.room = null;
	};
};

module.exports = StartStatus;













