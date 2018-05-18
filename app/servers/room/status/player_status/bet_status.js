
var room_mgr = require("../../room_mgr.js");

/**
 * 玩家状态机
 * 下注：BetStatus
 */

// 下注状态
class BetStatus {

	constructor(uid, roomId) {
		this.id = Const.PlayerStatus.Bet;
		this.uid = uid;// 玩家id
		this.roomId = roomId;// 玩家所在房间id
		this.player = null;// 玩家实例
		this.room = null;
	};

	onEnter() {
		Log.info("玩家" + this.uid + "进入下注状态");
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

		// 下注状态
		console.log("下注逻辑");
		if (!msg || !msg.chip) {
			Log.error("下注状态参数错误");
			// return;
			msg = {chip: 0};
		};
		msg.chip = 100;
		console.log("下注金额：", msg.chip);

		// 1. 检测玩家的合法性，是否排到这个玩家出牌
		// 2. 检测形为的合法性，该玩家是否能够作出这个形为
		// 3. 检测下注数目的合法性，该玩家手上的筹码是否足够

		// 当前房间状态
		var roomStatus = this.room.getCurStatus();
		Log.info("玩家" + this.uid + "在" + roomStatus.id + "回合下注");
		if (!roomStatus.isLegalTalkId(this.uid)) {
			Log.error("未轮到该玩家，非法操作：", this.uid);
			return;
		};
		if (!roomStatus.isLegalBehavior(this.id)) {
			Log.error("玩家不能进行加注这个操作：", this.uid);
			return;
		};
		if (!this.isLegalChip(msg.chip)) {
			Log.error("玩家在下注轮作弊", this.uid);
			return;
		};

		// 先记录当前玩家状态，后边要根据这个状态拿下一个玩家信息
		this.player.setPlayerTalk(roomStatus.id, this.id);
		this.room.setMaxChip(roomStatus.id, msg.chip);
		// 记录玩家每一轮下注筹码
		this.player.setPlayerChip(roomStatus.id, msg.chip);


		// 给客户端推送一条消息，告诉客户端下一个操作的玩家是谁，且他有哪些权限
		var uid = roomStatus.getCurTalkUid();
		var behavior = this.getNextBehavior();

		console.log("下一个玩家是：", uid);

		if (uid) {
			// 记录说话玩家
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
			console.warn("bet测试脚本参数错误");
			return;
		};
		setTimeout(function() {

			status.testFunc(nextUid, nextBehavior);
		}.bind(this), 1000);
	};

	isLegalChip(chip) {

		if (!chip) {
			Log.error("玩家下注状态参数错误", this.uid);
			return false;
		};
		// 下注金额不应大于玩家手上所有筹码量allin
		if (chip > this.player.chip) {
			Log.error("玩家下注状态有作弊嫌疑,下注超过总筹码", this.uid);
			return false;
		};
		// 下注金额不应小于最小下注额度为一个大盲注
		// if (chip < this.getRoomBbChip()) {
		// 	Log.error("玩家下注状态有作弊嫌疑,下注低于大盲注", this.uid);
		// 	return false;
		// };
		return true;
	};
	// 当前玩家所在的房间大盲注
	getRoomBbChip() {
		return this.room.getRoomConfByType().bb;
	};
	// 玩家进行下注操作后，下一个玩家的形为权限
	getNextBehavior() {
		return [
			Const.PlayerStatus.Fold,
			Const.PlayerStatus.Raise,
			Const.PlayerStatus.Call,
			Const.PlayerStatus.Allin
		];
	};


	onExit() {
		Log.info("玩家" + this.uid + "退出下注状态");
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

module.exports = BetStatus;











