
var room_mgr = require("../../room_mgr.js");

/**
 * 德州扑克房间状态机
 * 翻牌圈：FlopStatus(前3张公共牌)
 */

// 翻牌圈
class FlopStatus {

	constructor(id) {
		this.id = Const.RoomStatus.Flop;
		this.roomId = id;
		this.room = null;
		this._time = null;
		this.talkId = 0;
		this.behavior = [];
	};
	onEnter() {
		Log.info("房间" + this.roomId + "进入翻牌圈状态");
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，意味着这个房间不能用", this.roomId);
			return;
		};
		this.check();
	};

	check() {

		// 进入翻牌圈后，首先由系统发出3张公共牌展示给进入下一轮的玩家
		this.room.flopCards();
		
		// 翻牌圈第一个说话的玩家（从庄家位开始算的下一家未弃牌玩家）推送给客户端
		this.talkId = this.getCurTalkUid();
		
		// 本轮第一个说话玩家的操作权限
		this.setBehavior([
			Const.PlayerStatus.Fold,
			Const.PlayerStatus.Bet,
			Const.PlayerStatus.Check,
			Const.PlayerStatus.Allin
		]);

		console.log(this.talkId);
		console.log(this.behavior);
		// this.pushTalk(this.talkId, {uid: this.talkId, behavior: this.behavior});
		this.publicTalk({uid: this.talkId, behavior: this.behavior});
		

		// 注：第二轮检测游戏进度，最后一个非弃牌玩家获得胜利
		


		// 模拟真实对战
		setTimeout(function() {
			this.testFunc(this.talkId, this.behavior);
		}.bind(this), 1000);
		
		


		// 暂时弃用此方法，后面看会不会用上
		// this.checkOver();
		
	};


	// 测试函数
	testFunc(uid, behavior) {

		// if (typeof uid === "string") {return;};

		var player = this.room.getPlayerById(uid);
		var random = Math.floor(Math.random() * behavior.length);
		var behav = behavior[random];
		if (!player || !behav) {
			Log.warn("flop_status测试脚本未取到player或behav");
			return;
		};
		
		var random2 = Math.floor(Math.random() * player.chip);
		
		player.update(behav, {chip: random2});
	};


	checkOver() {

		var players = this.filterPlayer();
		var self = this;
		self.clearTick();
		self._time = setTimeout(function() {

			if (self.isNonePlayer(players)) {
				self.room.update(Const.RoomStatus.Wait);
				return;
			};

			if (self.isAllTalk(players)) {
				// 所有玩家说完话则进入转牌圈
				self.room.update(Const.RoomStatus.Turn);
				return;
			};
			Log.info("轮询，检测玩家翻牌圈是否结束");
			self.checkOver();
		}, 2000);
	};


	// 依赖玩家操作来检测
	checkOver2() {

		// 本轮游戏的玩家，除去了上一轮说话的弃牌玩家
		var players = this.filterPlayer();
		Log.info("有" + players.length + "个玩家还在翻牌圈游戏");
		// 检测玩家，与上一轮一样，都得打完本局才能真正退出
		if (this.isNonePlayer(players)) {
			Log.error("严重bug，翻牌圈players未取到玩家");
			// this.room.update(Const.RoomStatus.Wait);
			return;
		};
		// 检测是否产生游戏结束
		if (this.isOver(players)) {
			Log.warn("翻牌圈已剩最后一个玩家或所有玩家allin，直接进入结算");
			this.room.update(Const.RoomStatus.Stop);
			return;
		};

		var players2 = this.filterPlayerButAllin(players);
		Log.info("翻牌圈" + players.length + "个玩家中除去allin的玩家数：" + players2.length);
		// 判断玩家说话
		if (!this.isAllTalk(players2)) {
			Log.warn("还有玩家在翻牌圈没有说话，继续轮询");
			return;
		};
		// 所有玩家说过话后，检测所有玩家的下注筹码是否持平
		if (!this.isChipEqual(players2)) {
			Log.warn("翻牌圈玩家下注筹码未持平，继续说话");
			return;
		};
		this.room.update(Const.RoomStatus.Turn);
	};


	// 检测本轮是否进入结算
	isOver(players) {
		if (players.length === 1) {
			Log.info("翻牌圈剩一个玩家");
			return true;
		} else if (this.isAllAllin(players)) {
			Log.info("翻牌圈所有玩家allin");
			return true;
		};
		return false;
	};


	// 当前说话玩家行为
	isLegalBehavior(behav) {

		if (!behav) {
			Log.error("判断玩家形为合法性参数错误");
			return false;
		};
		for (var i = 0; i < this.behavior.length; i++) {
			if (behav == this.behavior[i]) {
				return true;
			};
		};
		Log.error("玩家当前操作非法", this.talkId);
		return false;
	};
	setBehavior(list) {
		this.behavior.length = 0;
		this.behavior = list;
	};
	getBehavior() {
		return this.behavior;
	};

	isLegalTalkId(id) {

		if (!id) {
			Log.error("判断玩家id合法性参数错误");
			return false;
		};
		return id == this.talkId;
	};
	// 当前说话玩家id
	setTalkId(id) {
		this.talkId = id;
	};
	getTalkId() {
		return this.talkId;
	};

	// 需要当前说话的验证，不能依赖和信任客户端的说话请求
	// 如果客户端的说话顺序不是按服务器顺序过来的，就弹回去当作弊处理
	getCurTalkUid() {
		var players = this.filterPlayer();
		return this.room.getTalkPlayer(players, this.talkId);
	};

	// 推送说话相关信息给客户端
	pushTalk(uid, msg) {
		var sid = this.room.getPlayerById(uid).sid;
		this.room.pushMsg(uid, sid, "talk", msg);
	};
	publicTalk(msg) {
		this.room.publicMsg("talk", msg);
	};


	// 底牌圈与当前没有弃牌的玩家筛选出来
	filterPlayer() {
		var arr = [];
		for (var i = 0; i < this.room.players.length; i++) {
			if (!this.room.isUserHaveSeat(this.room.players[i].uid)) {continue;};
			if (this.room.players[i].talks[Const.RoomStatus.Hole] == Const.PlayerStatus.Fold) {continue;};
			if (this.room.players[i].talks[this.id] == Const.PlayerStatus.Fold) {continue;};
			arr.push(this.room.players[i]);
		};
		return arr;
	};
	// 除去allin玩家
	filterPlayerButAllin(players) {
		var arr = [];
		for (var i = 0; i < players.length; i++) {
			if (players[i].talks[Const.RoomStatus.Hole] == Const.PlayerStatus.Allin) {continue;};
			if (players[i].talks[this.id] == Const.PlayerStatus.Allin) {continue;};
			arr.push(players[i]);
		};
		return arr;
	};
	isNonePlayer(players) {
		if (!players || !players.length) {return true;};
		return false;
	};

	// 获取底牌圈已说话玩家人数，之前回合已allin的玩家获取不到
	getTalkCount(players) {
		var count = 0;
		for (var i = 0; i < players.length; i++) {
			if (players[i].talks && players[i].talks[this.id]) {
				count++;
			};
		};
		Log.info("翻牌圈已说话玩家人数", count);
		return count;
	};
	// 获取所有已allin玩家人数,包括之前所有的allin玩家
	getAllinCount(players) {
		var count = 0;
		for (var i = 0; i < players.length; i++) {
			if (players[i].talks[Const.RoomStatus.Hole] == Const.PlayerStatus.Allin
				|| players[i].talks[this.id] == Const.PlayerStatus.Allin) {
				count++;
			};
		};
		Log.info("翻牌圈已allin玩家人数", count);
		return count;
	};
	// 获取所有下注筹码持平的玩家人数
	getChipEqualCount(players) {
		var maxChip = this.room.getMaxChip(this.id);
		var count = 0;
		for (var i = 0; i < players.length; i++) {
			if (players[i].chips && players[i].chips[this.id] >= maxChip) {
				count++;
			};
		};
		Log.info("翻牌圈已持平玩家人数", count);
		return count;
	};
	// 判断这个回合的玩家是否都说完话
	isAllTalk(players) {
		return this.getTalkCount(players) >= players.length;
	};
	isAllAllin(players) {
		return this.getAllinCount(players) >= (players.length - 1);
	};
	// 判断当前房间状态下玩家下注筹码是否持平，只要不持平就不能进入下一状态房间
	isChipEqual(players) {
		return this.getChipEqualCount(players) >= players.length;
	};


	clearTick() {
		if (this._time) {
			clearTimeout(this._time);
			this._time = null;
		};
	};
	onExit() {
		Log.info("房间" + this.roomId + "退出翻牌圈状态");
		this.room.clearPreTalk();
		this.clearTick();
		this.talkId = 0;
		this.behavior.length = 0;
		// this.destroy();
	};
	destroy() {
		this.id = 0;
		this.roomId = 0;
		this.room = null;
		this.clearTick();
		this.talkId = 0;
		this.behavior.length = 0;
	};
};

module.exports = FlopStatus;












