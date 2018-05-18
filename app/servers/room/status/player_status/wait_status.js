
var room_mgr = require("../../room_mgr.js");

/**
 * 玩家状态机
 * 闲置：WaitStatus
 */

// 闲置状态的玩家是可以参与继续本局游戏的玩家
class WaitStatus {

	constructor(uid, roomId) {
		this.id = Const.PlayerStatus.Wait;
		this.uid = uid;// 玩家id
		this.roomId = roomId;// 玩家所在房间id
		this.player = null;// 玩家实例
		this.room = null;
	};

	onEnter() {
		Log.info("玩家" + this.uid + "进入闲置状态");
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，id对应的房间不存在", this.roomId);
			return;
		};
		// 根据玩家id找到房间内的玩家实例
		this.player = this.room.getPlayerById(this.uid);
		if (!this.player) {
			this.player = this.room.getWaitById(this.uid);
		};
	};
	check(msg) {
		console.log("闲置逻辑");

		if (!this.player) {
			Log.error("id对应玩家不存在", this.uid);
			return;
		};

		// 当前房间状态。这个状态有可能不用记录
		var roomStatus = this.room.getCurStatus().id;
		Log.info("玩家" + this.uid + "在" + roomStatus + "回合闲置");
		this.player.setPlayerTalk(roomStatus, this.id);

	};

	
	onExit() {
		Log.info("玩家" + this.uid + "退出闲置状态");
		// this.destroy();
	};
	destroy() {
		this.id = 0;
		this.uid = 0;
		this.roomId = 0;
		this.player = null;
		this.room = null;
	};
};

module.exports = WaitStatus;











