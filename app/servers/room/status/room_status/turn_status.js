
var room_mgr = require("../../room_mgr.js");

/**
 * 德州扑克房间状态机
 * 转牌圈：TurnStatus(第4张公共牌)
 */

// 转牌圈
class TurnStatus {

	constructor(id) {
		this.id = Const.RoomStatus.Turn;
		this.roomId = id;
		this.room = null;
		this._time = null;
		this.talkId = 0;
		this.behavior = [];
	};
	onEnter() {
		Log.info("房间" + this.roomId + "进入转牌圈状态");
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，意味着这个房间不能用", this.room);
			return;
		};
		this.check();
	};

	check() {

		// 发放转牌圈公共牌
		this.room.turnCards();

		// 转牌圈第一个下注的玩家（从庄家开始未弃牌的下一个玩家）推送给客户端
		this.talkId = this.getCurTalkUid();
		
		// 这个玩家的操作权限
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



		// 注：第三轮检测游戏是否结束，有可能会产生胜利者
		


		// 模拟真实对战
		setTimeout(function() {
			this.testFunc(this.talkId, this.behavior);
		}.bind(this), 1000);
		


		// 暂时弃用此方法，后边再说
		// this.checkOver();
		

	};


	// 测试函数
	testFunc(uid, behavior) {

		// if (typeof uid === "string") {return;};

		var player = this.room.getPlayerById(uid);
		var random = Math.floor(Math.random() * behavior.length);
		var behav = behavior[random];
		
		if (!player || !behav) {
			Log.warn("turn_status测试脚本未取到player或behav");
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
				self.room.update(Const.RoomStatus.River);
				return;
			};
			Log.info("轮询，检测玩家转牌圈是否结束");
			self.checkOver();
		}, 2000);
	};


	// 依赖玩家操作来检测
	checkOver2() {

		// 取本轮游戏玩家，去掉上一轮弃牌玩家
		var players = this.filterPlayer();
		Log.info("有" + players.length + "个玩家还在转牌圈游戏");
		// 检测玩家
		if (this.isNonePlayer(players)) {
			Log.error("严重bug，转牌圈players未取到玩家");
			// this.room.update(Const.RoomStatus.Wait);
			return;
		};
		// 检测本轮是否会结束游戏，如果只剩一个玩家，他不用说话即可产生结果
		if (this.isOver(players)) {
			Log.warn("转牌圈已剩最后一个玩家或所有玩家allin，进入游戏结算");
			this.room.update(Const.RoomStatus.Stop);
			return;
		};

		var players2 = this.filterPlayerButAllin(players);
		Log.info("转牌圈" + players.length + "个玩家中除去allin的玩家数：" + players2.length);
		// 检测玩家说话
		if (!this.isAllTalk(players2)) {
			Log.warn("还有玩家在转牌圈没有说话，继续轮询");
			return;
		};
		// 所有玩家说过话后，检测所有玩家的下注筹码是否持平
		if (!this.isChipEqual(players2)) {
			Log.warn("转牌圈玩家下注筹码未持平，继续说话");
			return;
		};
		this.room.update(Const.RoomStatus.River);
	};

	// 检测本轮游戏是否可以结束
	isOver(players) {
		if (players.length === 1) {
			Log.info("转牌圈剩一个玩家");
			return true;
		} else if (this.isAllAllin(players)) {
			Log.info("转牌圈所有玩家allin");
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


	// 翻牌圈与当前没有弃牌的玩家筛选出来
	filterPlayer() {
		var arr = [];
		for (var i = 0; i < this.room.players.length; i++) {
			if (!this.room.isUserHaveSeat(this.room.players[i].uid)) {continue;};
			if (this.room.players[i].talks[Const.RoomStatus.Hole] == Const.PlayerStatus.Fold) {continue;};
			if (this.room.players[i].talks[Const.RoomStatus.Flop] == Const.PlayerStatus.Fold) {continue;};
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
			if (players[i].talks[Const.RoomStatus.Flop] == Const.PlayerStatus.Allin) {continue;};
			if (players[i].talks[this.id] == Const.PlayerStatus.Allin) {continue;};
			arr.push(players[i]);
		};
		return arr;
	};
	isNonePlayer(players) {
		if (!players || !players.length) {return true;};
		return false;
	};

	getTalkCount(players) {
		var count = 0;
		for (var i = 0; i < players.length; i++) {
			if (players[i].talks && players[i].talks[this.id]) {
				count++;
			};
		};
		Log.info("转牌圈已说话玩家人数", count);
		return count;
	};
	getAllinCount(players) {
		var count = 0;
		for (var i = 0; i < players.length; i++) {
			if (players[i].talks[Const.RoomStatus.Hole] == Const.PlayerStatus.Allin
				|| players[i].talks[Const.RoomStatus.Flop] == Const.PlayerStatus.Allin
				|| players[i].talks[this.id] == Const.PlayerStatus.Allin) {
				count++;
			};
		};
		Log.info("转牌圈已allin玩家人数", count);
		return count;
	};
	getChipEqualCount(players) {
		var maxChip = this.room.getMaxChip(this.id);
		var count = 0;
		for (var i = 0; i < players.length; i++) {
			if (players[i].chips && players[i].chips[this.id] >= maxChip) {
				count++;
			};
		};
		Log.info("转牌圈已持平玩家人数", count);
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
		Log.info("房间" + this.roomId + "退出转牌圈状态");
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

module.exports = TurnStatus;















