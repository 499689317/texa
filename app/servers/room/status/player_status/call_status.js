
var room_mgr = require("../../room_mgr.js");

/**
 * 玩家状态机
 * 跟注：CallStatus
 */

class CallStatus {

	constructor(uid, roomId) {
		this.id = Const.PlayerStatus.Call;
		this.uid = uid;// 玩家id
		this.roomId = roomId;// 玩家所在房间id
		this.player = null;// 玩家实例
		this.room = null;
	};

	onEnter() {
		Log.info("玩家" + this.uid + "进入跟注状态");
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，id对应的房间不存在", this.roomId);
			return;
		};
		// 根据玩家id找到房间内的玩家实例
		this.player = this.room.getPlayerById(this.uid);
		if (!this.player) {
			Log.error("id对应玩家不存在", this.uid);
			return;
		};
	};
	check(msg) {

		// 跟注状态
		console.log("跟注逻辑");
		if (!msg || !msg.chip) {
			Log.error("跟注状态参数错误");
			// return;
			msg = {chip: 0};
		};
		msg.chip = 100;
		console.log("跟注金额：", msg.chip);

		// 1. 检测玩家的合法性，是否排到这个玩家出牌
		// 2. 检测形为的合法性，该玩家是否能够作出这个形为
		// 3. 检测下注数目的合法性，该玩家手上的筹码是否足够

		// 当前房间状态
		var roomStatus = this.room.getCurStatus();
		Log.info("玩家" + this.uid + "在" + roomStatus.id + "回合跟注");
		if (!roomStatus.isLegalTalkId(this.uid)) {
			Log.error("未轮到该玩家，非法操作：", this.uid);
			return;
		};
		if (!roomStatus.isLegalBehavior(this.id)) {
			Log.error("玩家不能进行加注这个操作：", this.uid);
			return;
		};
		// 这里取的pre_chip还是上一家说话下的注
		if (!this.isLegalChip(roomStatus.id, msg.chip)) {
			Log.error("玩家在跟注轮作弊", this.uid);
			return;
		};

		this.player.setPlayerTalk(roomStatus.id, this.id);
		this.room.setMaxChip(roomStatus.id, msg.chip);// 跟注应该不会产生最大筹码？
		// 记录玩家每一轮下注筹码
		this.player.setPlayerChip(roomStatus.id, msg.chip);
		

		// 给客户端推送一条消息，告诉客户端下一个操作的玩家是谁，且他有哪些权限
		var uid = roomStatus.getCurTalkUid();
		var behavior = this.getNextBehavior();

		console.log("下一个玩家是：", uid);

		if (uid) {
            this.room.setPreTalk(uid);
			roomStatus.setTalkId(uid);
			roomStatus.setBehavior(behavior);
			// roomStatus.pushTalk(this.uid, {uid: uid, behavior: behavior});
			roomStatus.publicTalk({uid: uid, behavior: behavior});
		} else {

		};
		roomStatus.checkOver2();

		// ======
		// test
		// ======
		
		this.testFunc(roomStatus, uid, behavior);

		
	};

	// 测试函数
	testFunc(status, nextUid, nextBehavior) {

		if (!status || !nextUid || !nextBehavior) {
			console.warn("call测试脚本参数错误");
			return;
		};
		setTimeout(function() {

			status.testFunc(nextUid, nextBehavior);
		}.bind(this), 1000);
	};
	// 获取前一玩家下注额度进行验证
	isLegalChip(statusId, chip) {

		if (!statusId || !chip) {
			Log.error("玩家跟注状态参数错误", this.uid);
			return false;
		};
		if (chip > this.player.chip) {
			Log.error("玩家跟注状态有作弊嫌疑,跟注超过总筹码", this.uid);
			return false;
		};
		// var pre_chip = this.getPreChip(statusId);
		// if (chip != pre_chip) {
		// 	Log.error("玩家跟注状态有作弊嫌疑,跟注不等于上一家下注筹码", this.uid);
		// 	return false;
		// };
		return true;
	};
	getPreChip(statusId) {

		if (!statusId) {
			Log.error("取前一玩家下注筹码参数错误");
			return 0;
		};
		var pre_uid = this.room.getPreTalk(0);
		console.log(pre_uid);
		return this.room.getPlayerById(pre_uid).getPlayerChip(statusId);
	};

	getNextBehavior() {
		return [
			Const.PlayerStatus.Fold,
			Const.PlayerStatus.Raise,
			Const.PlayerStatus.Call,
			Const.PlayerStatus.Allin
		];
	};

	onExit() {
		Log.info("玩家" + this.uid + "退出跟注状态");
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

module.exports = CallStatus;















