
var room_mgr = require("../../room_mgr.js");

/**
 * 德州扑克房间状态机
 * 底牌圈：HoleStatus(每个玩家获得2张底牌)
 */

// 发放底牌阶段
class HoleStatus {

	constructor(id) {
		this.id = Const.RoomStatus.Hole;
		this.roomId = id;
		this.room = null;
		this._time = null;
		this.talkId = 0;// 当前说话玩家的uid，作验证用的
		this.behavior = [];// 当前玩家的形为，作验证用的
	};
	onEnter() {
		Log.info("房间" + this.roomId + "进入底牌圈状态");
		// 发牌依赖于每个房间的牌堆管理器
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，意味着这个房间不能用", this.roomId);
			return;
		};
		this.check();
	};

	check() {

		// 开始发底牌
		this.room.holeCards();
		
		// 底牌圈第一个下注的玩家（枪口位玩家）推送给客户端
		this.talkId = this.getCurTalkUid();
		
		// 枪口位玩家的操作权限
		this.setBehavior([
			Const.PlayerStatus.Fold,
			Const.PlayerStatus.Bet,
			Const.PlayerStatus.Check,
			Const.PlayerStatus.Allin
		]);

		console.log(this.talkId);
		console.log(this.behavior);
		// this.pushTalk(this.talkId, {uid: this.talkId, behavior: this.behavior});
		// 这里如果后期出现bug，那么就把this.behavior深拷贝一份
		this.publicTalk({uid: this.talkId, behavior: this.behavior});


		// 注：第一轮说话检测游戏进度，如果非弃牌玩家只剩1位，则结束本轮游戏，非弃牌玩家获得胜利
		

		// 测试代码，模拟真实对战
		setTimeout(function() {
			this.testFunc(this.talkId, this.behavior);
		}.bind(this), 1000);
		
		

		
		// 暂时弃用此方法，不做定时检测
		// this.checkOver();

	};

	// 测试函数
	testFunc(uid, behavior) {

		// if (typeof uid === "string") {return;};

		var player = this.room.getPlayerById(uid);
		var random = Math.floor(Math.random() * behavior.length);
		var behav = behavior[random];

		if (!player || !behav) {
			Log.warn("hole_status测试脚本未取到player或behav");
			return;
		};

		var random2 = Math.floor(Math.random() * player.chip);
		
		player.update(behav, {chip: random2});
	};

	// 轮询房间这种方式暂时弃用，性能影响太大了
	checkOver() {

		var players = this.filterPlayer();
		var self = this;
		self.clearTick();
		self._time = setTimeout(function() {

			// 先检测当前局游戏是否有进行下去的必要
			// 1. 玩家人数是否够，因为有的玩家可以异常退出
			// 2. 剩一个玩家，结束本局游戏，剩下玩家胜利
			// 3. 全部玩家都走了，如何结算？？？这里策划说就算都是死人也要正常打完游戏
			if (self.isNonePlayer(players)) {
				self.room.update(Const.RoomStatus.Wait);
				return;
			};

			if (self.isAllTalk(players)) {
				// 所有玩家说完话
				self.room.update(Const.RoomStatus.Flop);
				return;
			};
			Log.info("轮询，检测玩家底牌圈是否结束");
			self.checkOver();
		}, 5000);
	};

	// 依赖玩家操作来检测，这里必须一层一层检测
	checkOver2() {

		// 取本轮游戏玩家
		var players = this.filterPlayer();
		Log.info("有" + players.length + "个玩家还在底牌圈游戏");
		// 检测玩家，即使玩家都走了也正常进行完游戏
		if (this.isNonePlayer(players)) {
			Log.error("严重bug，底牌圈players未取到玩家");
			// this.room.update(Const.RoomStatus.Wait);
			return;
		};
		// 检测是否产生游戏结果，是则进入结算
		if (this.isOver(players)) {
			Log.warn("底牌圈已剩最后一个玩家或所有玩家allin，直接结算");
			this.room.update(Const.RoomStatus.Stop);
			return;
		};

		var players2 = this.filterPlayerButAllin(players);
		Log.info("底牌圈" + players.length + "个玩家中除去allin的玩家数：" + players2.length);
		// 未产生结果，判断游戏玩家说话
		if (!this.isAllTalk(players2)) {
			Log.warn("还有玩家在底牌圈没有说话，继续轮询");
			return;
		};
		// 所有玩家说过话后，检测所有玩家的下注筹码是否持平
		if (!this.isChipEqual(players2)) {
			Log.warn("底牌圈玩家下注筹码未持平，继续说话");
			return;
		};
		this.room.update(Const.RoomStatus.Flop);
	};

	// 判断游戏是否结束，只剩一个玩家或者只剩一个玩家未allin
	isOver(players) {
		if (players.length === 1) {
			Log.info("底牌圈剩一个玩家");
			return true;
		} else if (this.isAllAllin(players)) {
			Log.info("底牌圈所有玩家allin");
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
	

	// 没有座位的玩家过滤掉
	// 弃牌玩家过滤掉
	// TODO 开始游戏后，就算玩家掉线，也要强制打完本局游戏
	filterPlayer() {
		var arr = [];
		for (var i = 0; i < this.room.players.length; i++) {
			if (!this.room.isUserHaveSeat(this.room.players[i].uid)) {continue;};
			if (this.room.players[i].talks[this.id] == Const.PlayerStatus.Fold) {continue;};
			arr.push(this.room.players[i]);
		};
		return arr;
	};
	// 在把未弃牌中未allin玩家取出来
	filterPlayerButAllin(players) {
		var arr = [];
		for (var i = 0; i < players.length; i++) {
			if (players[i].talks[this.id] == Const.PlayerStatus.Allin) {continue;};
			arr.push(players[i]);
		};
		return arr;
	};
	// 房间的人都异常走了
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
		Log.info("底牌圈已说话玩家人数", count);
		return count;
	};
	// 获取所有已allin玩家人数,包括之前所有的allin玩家
	getAllinCount(players) {
		var count = 0;
		for (var i = 0; i < players.length; i++) {
			if (players[i].talks[this.id] == Const.PlayerStatus.Allin) {
				count++;
			};
		};
		Log.info("底牌圈已allin玩家人数", count);
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
		Log.info("底牌圈已持平玩家人数", count);
		return count;
	};
	// 判断这个回合的玩家是否都说完话，是否要除去allin玩家来算这个说话人数，即players是除去allin的玩家
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
		Log.info("房间" + this.roomId + "退出底牌圈状态");
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

module.exports = HoleStatus;











