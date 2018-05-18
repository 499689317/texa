
var room_mgr = require("../../room_mgr.js");

/**
 * 德州扑克房间状态机
 * 结束状态：StopStatus(结算玩家奖励)
 */

class StopStatus {

	constructor(id) {
		this.id = Const.RoomStatus.Stop;
		this.roomId = id;
		this.room = null;
		this._time = null;
	};
	onEnter() {
		Log.info("房间" + this.roomId + "进入结算状态");
		this.room = room_mgr.getRoomById(this.roomId);
		if (!this.room) {
			Log.error("严重bug，意味着这个房间不能用", this.room);
			return;
		};
		this.check();
	};

	check() {

		// 当前局游戏结束后统一走这个状态机
		// 发布游戏结果消息给客户端
		// 结算完成后会自动开启下一盘游戏逻辑

		// 如果是河牌圈进入结算状态需要比牌大小得到最终胜利玩家
		// 如果是其它状态进入结算状态，则谁最后弃牌谁最终胜利，不需要比牌
		
		var preStatus = this.room.getPreStatus();
		console.log("preStatus: ", preStatus.id);
		var players = this.filterPlayer(preStatus.id);
		if (!players.length) {
			Log.error("没有结算玩家？哪出了问题");
			return;
		};
		// console.log(players);
		var result = {type: 0, winner: []};
		// 不管哪一个状态进入结算，只要是只有一个玩家进入结算，都没有必要进行比牌，直接判为胜利
		if (players.length == 1) {
			// 未弃牌那个玩家胜利
			console.log("玩家" + players[0].uid + "偷鸡获得最终胜利");
			result.winner.push({uid: players[0].uid});
		} else {
			// 这里存在补发公共牌的情况
			var count = 0;
			if (preStatus.id === Const.RoomStatus.Hole) {
				count = 5;// 补发5张公共牌
			} else if (preStatus.id === Const.RoomStatus.Flop) {
				count = 2;// 补发2张公共牌
			} else if (preStatus.id === Const.RoomStatus.Turn) {
				count = 1;// 补发1张公共牌
			} else {
				// 不补发公共牌
			};
			var pubCards = this.patchCards(count);


			if (pubCards) {this.publicPatchCards(pubCards);};


			// ===================================
			// ===================================
			// ===================================
			// 比牌逻辑是不变的，这里是所有比牌的共用代码
			// ===================================
			// ===================================
			// ===================================
			
			// 把牌型最大的type取出来
			var type = 0;
			for (var i = 0; i < players.length; i++) {
				if (pubCards) {players[i].setPlayerCards(pubCards);};// 如果存在补发公共牌，补发上在比牌
				var cards = room_mgr.checkType(players[i].cards);
				if (type < cards.type) {type = cards.type;};
			};
			console.log("当前最大牌型是：" + Const.CardMap[type]);
			result.type = type;
			result.des = Const.CardMap[type];

			var list = [];
			for (var i = 0; i < players.length; i++) {
				var cards = room_mgr.checkType(players[i].cards);
				if (cards.type == type) {
					list.push({uid: players[i].uid, value: cards.value});
				};
				console.log("玩家" + players[i].uid + "牌型为：" + Const.CardMap[cards.type]);
				console.log(cards.value);
			};
			// console.log(list);
			
			// 皇家同花顺，不唯一，最终赢家，可能出现平局
			// 同花顺，不唯一，取牌时取各玩家最大的同花顺，只比较最大的牌，有可能出现平局
			// 四条，不唯一，可能出现相同的两个四条，先比较四条的字面值，再比较单牌
			// 葫芦，不唯一，可能出现相同的两个三条，也可能出现相同的对子，先比较三条的字面值，再比较对子，有可能出现平局
			// 同花，不唯一，取牌时取各玩家最大的同花，连续比较最大值，有可能出现平局
			// 顺子，不唯一，取牌时取各玩家最大的顺子，只比较最大值，有可能出现平局
			// 三条，不唯一，取牌时取各玩家最大的三条，先比较三条的字面值，后比较两张单牌，有可能出现平局
			// 两对，不唯一，取牌时取各玩家最大的两对，先比较两对字面值，后比较单牌，有可能出现平局
			// 一对，不唯一，取牌时取玩家最大的三张单牌，先比较一对字面值，再比较三张单牌，有可能出现平局
			// 高牌，不唯一，取牌时取各玩家最大的高牌，连续比较最大值，有可能出现平局
			if (list.length == 1) {
				// 当前玩家获胜
				console.log("玩家" + list[0].uid + "使用”" + Const.CardMap[type] + "“获得最终胜利");
				result.winner.push({uid: list[0].uid, cards: list[0].value});
			} else {

				// 同牌型比牌
				var uid = room_mgr.commpare(type, list);
				if (!uid) {
					console.error("没取到胜利玩家，出问题了");
					return;
				};
				if (_.isArray(uid)) {
					console.log("平局：" + Const.CardMap[type]);
					console.log(uid);
					// 找出哪些玩家平局
					for (var i = 0; i < uid.length; i++) {
						var ucards = this.getCards(uid[i], list);
						if (!ucards) {continue;};
						result.winner.push({uid: uid[i], cards: ucards});
					};
				} else {
					console.log("玩家" + uid + "使用”" + Const.CardMap[type] + "“获得最终胜利");
					result.winner.push({uid: uid, cards: this.getCards(uid, list)});
				};
			};
		};

		// 对房间进行结果的广播
		console.log(result);
		this.publicTalk(result);

		// 5秒钟后重新开始下一局游戏
		this.checkOver();
	};


	/**
	 * 这里有这么几种特殊情况
	 * 当所有玩家在底牌圈allin，进入结算状态比牌前需要给玩家补5张公共牌
	 * 当所有玩家在翻牌圈allin，进入结算状态比牌前需要给玩家补2张公共牌
	 * 当所有玩家在转牌圈allin，进入结算状态比牌前需要给玩家补1张公共牌
	 */
	patchCards(count) {
		if (!count) {count = 1;};
		return this.room.card_mgr.provideCards(count);

	};


	getCards(uid, list) {
		for (var i = 0; i < list.length; i++) {
			if (uid == list[i].uid) {return list[i].value;};
		};
		Log.error("没有这个玩家的卡牌", uid);
		return null;
	};

	checkOver() {

		var self = this;
		self.clearTick();
		self._time = setTimeout(function() {
			self.room.update(Const.RoomStatus.Wait);
		}, 5000);
	};


	// 推送说话相关信息给客户端
	pushTalk(uid, msg) {
		var sid = this.room.getPlayerById(uid).sid;
		this.room.pushMsg(uid, sid, "result", msg);
	};
	publicTalk(msg) {
		this.room.publicMsg("result", msg);
	};
	publicPatchCards(msg) {
		this.room.publicMsg("patch_cards", msg);
	};


	// 筛选结算玩家有哪些，这里做一个特殊处理，因为房间在任何状态都有可能进行结算
	// 这里筛选出来的玩家不一定就是进入河牌圈的玩家
	filterPlayer(statusId) {
		var players = [];
		for (var i = 0; i < this.room.players.length; i++) {
			if (!this.room.isUserHaveSeat(this.room.players[i].uid)) {continue;};
			if (this.room.players[i].talks[Const.RoomStatus.Hole] == Const.PlayerStatus.Fold) {continue;};
			if (this.room.players[i].talks[Const.RoomStatus.Flop] == Const.PlayerStatus.Fold) {continue;};
			if (this.room.players[i].talks[Const.RoomStatus.Turn] == Const.PlayerStatus.Fold) {continue;};
			if (this.room.players[i].talks[Const.RoomStatus.River] == Const.PlayerStatus.Fold) {continue;};
			players.push(this.room.players[i]);
		};
		return players;
	};

	// 结束本局游戏后，打开房间锁，此时如果有空位，可以加入开始下一局游戏
	unlockRoom() {
		this.room.isLock = false;
	};
	resetRoom() {
		Log.info("重置房间数据");
		this.room.resetRoom();
	};
	clearTick() {
		if (this._time) {
			clearTimeout(this._time);
			this._time = null;
		};
	};
	onExit() {
		Log.info("房间" + this.roomId + "退出结算状态");
		this.clearTick();
		this.resetRoom();
		this.unlockRoom();
		// this.destroy();
	};
	destroy() {
		this.id = 0;
		this.roomId = 0;
		this.room = null;
		this.clearTick();
		this.resetRoom();
	};
};

module.exports = StopStatus;













