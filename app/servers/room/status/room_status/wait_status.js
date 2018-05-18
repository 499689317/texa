
var room_mgr = require("../../room_mgr.js");

/**
 * 德州扑克房间状态机
 * 等待状态：WaitStatus(等待其他玩家进入房间)
 */

// 房间等待玩家状态
class WaitStatus {

	constructor(id) {
		this.id = Const.RoomStatus.Wait;
		this.roomId = id;// 房间id
		this.room = null;// 当前房间的实例
		this._time = null;
	};
	onEnter() {
		Log.info("房间" + this.roomId + "进入等待状态");
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，意味着这个房间不能用", this.roomId);
			return;
		};
		// 检测是否匹配到足够的玩家
		// 如果检测到玩家不足，继续维持等待状态，直到玩家足够
		// 每隔5秒种check一次玩家人数
		this.check();
	};
	 
	check() {
		var self = this;
		self.clearTick();
		self._time = setTimeout(function() {

			// TODO 如果房间不在这个状态下，不能走下面这些逻辑
			
			if (!self.room || !self.room.players) {
				Log.error("房间数据错误", self.roomId);
				return;
			};
			Log.info("当前总房间数：", room_mgr.rooms.length);
			Log.info("当前房间人数：",self.room.players.length);

			var players = self.filterPlayer();

			// 这里要确定游戏开始的条件都得满足
			// 1. 人数>=2
			// 2. 位置分配完成
			// 3. 有座位的玩家状态为准备状态，否则从座位上踢掉
			var playerNum = players.length;
			if (self.isEnoughPlayer(playerNum) && self.isReadySeat(playerNum)) {
				Log.info("满足游戏开始条件，可以开始游戏");
				self.room.update(Const.RoomStatus.Start);
				return;
			};
			// 否则继续轮询房间内玩家人数
			self.check();
		}, 5000);
	};

	// 游戏开局人数>=2
	isEnoughPlayer(playerNum) {
		return playerNum >= 2;
	};
	// 房间位置是否分配完成，包括庄家，小盲，大盲，枪口
	isReadySeat(playerNum) {
		return this.room.isReady(playerNum);
	};
	// 取满足游戏的玩家
	// 玩家有坐位
	// 玩家处于等待状态
	filterPlayer() {
		var arr = [];
		for (var i = 0; i < this.room.players.length; i++) {
			if (!this.room.isUserHaveSeat(this.room.players[i].uid)) {continue;};
			if (this.room.players[i].getCurStatus().id == Const.PlayerStatus.Wait) {
				arr.push(this.room.players[i]);
			};
		};
		return arr;
	};
	// 满足开始游戏条件后把房间锁上，后边在进来的玩家不能参加本局游戏了
	lockRoom() {
		this.room.isLock = true;
	};

	// 清理定时器
	clearTick() {
		if (this._time) {
			clearTimeout(this._time);
			this._time = null;
		};
	};
	onExit() {
		Log.info("房间" + this.roomId + "退出等待状态");
		this.lockRoom();
		this.room.clearPreTalk();
		this.clearTick();
		// this.destroy();
	};
	destroy() {
		this.id = 0;
		this.roomId = 0;
		this.clearTick();
		this.room = null;
	};
};

module.exports = WaitStatus;








