
var WaitStatus = require("./status/room_status/wait_status.js");
var StartStatus = require("./status/room_status/start_status.js");
var HoleStatus = require("./status/room_status/hole_status.js");
var FlopStatus = require("./status/room_status/flop_status.js");
var TurnStatus = require("./status/room_status/turn_status.js");
var RiverStatus = require("./status/room_status/river_status.js");
var StopStatus = require("./status/room_status/stop_status.js");
var Status = require("./status/status.js");

var CardMgr = require("./card_mgr.js");// 每个房间都分配一个房间管理器
var Player = require("./player.js");

// 房间逻辑
function Room(id) {

	this.id = id || 0;// 房间id
	this.type = 0; // 房间类型，不同的类型房间配置不同，比如大小盲注
	this.channel = null;

	this.card_mgr = null;// 卡牌管理器
	this.players = [];// 房间内玩家
	this.waits = [];// 走一个等待队列，这里考虑到房间如果人太多了，这里是会影响性能的

	this.status_mgr = null;// 状态管理器
	this.status_map = {};
	
	// 每个房间都有有限个座位
	// seats = {
	// 		id: 座位id,
	// 		uid: 0,// 这个位置玩家的id
	// 		flag: 1,// 1：庄家，2：小盲，3：大盲
	// };
	this.seats = [];// 座位
	this.max_chip = {};// 跟踪房间任何状态下的最大下注筹码
	this.pre_talk = [];// 前一说话玩家
	// 记录每局游戏的奖池
	// bonus = [
	// 		[
	// 			{
	// 				uid: 玩家id,
	// 				chip: 底池筹码
	// 			}
	// 		],
	// 		[
	// 			{
	// 				uid: 玩家id,
	// 				chip: 边池筹码
	// 			}
	// 		]
	// ];
	this.bonus = [];// 奖池
	this.isLock = false;// 房间开始游戏后，处于锁定状态，锁定状态其它玩家不能加入到游戏中，只能等待本局结束解锁后可以加入
	
	this.init();
};

Room.prototype.init = function() {

	for (var i = 1; i <= 9; i++) {
		this.seats.push({id: i, uid: 0, flag: 0});
	};
	// console.log(this.seats);
	// 创建一个发牌器
	this.card_mgr = new CardMgr();
	// 房间创建一个channel
	this.channel = App.channelService.createChannel(this.id);
	// console.log(this.channel);
	this.status_map[Const.RoomStatus.Wait] = new WaitStatus(this.id);
	this.status_map[Const.RoomStatus.Start] = new StartStatus(this.id);
	this.status_map[Const.RoomStatus.Hole] = new HoleStatus(this.id);
	this.status_map[Const.RoomStatus.Flop] = new FlopStatus(this.id);
	this.status_map[Const.RoomStatus.Turn] = new TurnStatus(this.id);
	this.status_map[Const.RoomStatus.River] = new RiverStatus(this.id);
	this.status_map[Const.RoomStatus.Stop] = new StopStatus(this.id);
	this.status_mgr = new Status(this.status_map[Const.RoomStatus.Wait]);
};
Room.prototype.update = function(statusId) {
	this.status_mgr.update(this.status_map[statusId]);
};
Room.prototype.getCurStatus = function() {
	return this.status_mgr.getCurStatus();
};
Room.prototype.getPreStatus = function() {
	return this.status_mgr.getPreStatus();
};

// 需要一个机制来灵活操作奖池
Room.prototype.getBonus = function() {
	return this.bonus;
};
// 边池种类与边池差异筹码是相关的，最多时可产生玩家个数个边池
Room.prototype.setBonus = function(uid, chip) {
	for (var i = 0; i < this.bonus.length; i++) {
	};
};
// 当前下注最大筹码
Room.prototype.getMaxChip = function(statusId) {
	if (!statusId) {
		Log.error("获取当前房间最大下注筹码参数错误");
		return 0;
	};
	if (this.max_chip[statusId]) {return this.max_chip[statusId];};
	return 0;
};
Room.prototype.setMaxChip = function(statusId, chip) {
	if (!statusId || typeof chip === "undefined") {
		Log.error("更新当前房间状态下最大下注筹码参数错误");
		return;
	};
	if (!this.max_chip) {this.max_chip = {};};
	if (!this.max_chip[statusId]) {this.max_chip[statusId] = 0;};
	if (this.max_chip[statusId] < chip) {this.max_chip[statusId] = chip;};
};
// count：从当前说话玩家开始计算起，向前取count个
// count: 0向前1个，1：向前2个......
Room.prototype.getPreTalk = function(count) {
	if (!count) {count = 0;};
	var itor = this.pre_talk.length - count;
	if (itor < 0) {
		Log.error("取前向玩家错误：", count);
		itor = 0;
	};
	return this.pre_talk[itor];
};
Room.prototype.setPreTalk = function(uid) {
	if (!uid) {
		Log.error("更新当前房间前一下注玩家参数错误");
		return;
	};
	if (!this.pre_talk) {this.pre_talk = [];};
	this.pre_talk.push(uid);
};
Room.prototype.isPlayerNeedCall = function(statusId, chip) {
	if (typeof chip === "undefined") {
		Log.error("判断玩家是否需要跟注参数错误");
		return false;
	};
	// console.log("当前玩家下注筹码为：", chip);
	// console.log("本轮最大下注筹码为：", this.getMaxChip(statusId));
	if (chip < this.getMaxChip(statusId)) {return true;};
	return false;
};
// 获取房间配置信息，最好能读表
Room.prototype.getRoomConfByType = function(type) {
	return {sb: 5, bb: 10, seat_count: 9};
};

// 玩家进入房间
Room.prototype.joinRoom = function(user) {
	
	var player = new Player({uid: user.uid, sid: user.sid, chip: user.chip, roomId: this.id});
	console.log("房间是否锁上：", this.isLock);
	// 锁上状态，玩家进来处于等待队列中的，只有在房间未锁上状态，玩家才会在players队列中
	if (this.isLock) {
		this.waits.push(player);
	} else {
		this.players.push(player);
	};

	// 按顺序给房间按排玩家坐下
	var seat = this.getEmptySeat();
	if (seat) {
		Log.info("房间有空位，可以坐下，但不一定可以游戏");
		player.update(Const.PlayerStatus.Wait);// 设置为wait状态还不一定，暂时先这样
		// 玩家在位置下坐下
		seat.uid = user.uid;
	} else {
		Log.warn("房间没有空位，只能旁观");
		player.update(Const.PlayerStatus.Wait);// 后面可能会加一个旁观状态
	};
};
// 玩家退出房间
Room.prototype.leaveRoom = function(uid) {
	for (var i = 0; i < this.players.length; i++) {
		if (uid == this.players[i].uid) {
			// 离开房间后连同位置信息也要清理掉
			var seat = this.isUserHaveSeat(this.players[i].uid);
			if (seat) {
				seat.uid = 0;
				seat.flag = 0;
			};
			this.players[i].destroy();
			this.players.splice(i, 1);
			i--;
		};
	};
	for (var i = 0; i < this.waits.length; i++) {
		if (uid == this.waits[i].uid) {
			var seat = this.isUserHaveSeat(this.waits[i].uid);
			if (seat) {
				seat.uid = 0;
				seat.flag = 0;
			};
			this.waits[i].destroy();
			this.waits.splice(i, 1);
			i--;
		};
	};
	console.log(this.players);
	console.log(this.waits);
	console.log(this.seats);
};

// 开始一局游戏前的准备工作
Room.prototype.isReady = function(playerNum) {

	if (!playerNum) {
		Log.error("创建游戏参数错误", playerNum);
		return false;
	};
	// 选择庄家，第一局从一号位开始就近找一个位置为庄家，否则上一局的小盲位为本局的庄家，小盲位没有则大盲位，以此类推
	// 确定了庄家位，则可以确定小盲位，大盲位与枪口位
	var isCanBegin = false;
	var banker = this.getSpecialSeat(playerNum, Const.RoomSeats.Btn);
	if (banker) {
		Log.info("有庄家情况");
		isCanBegin = this.createGame(playerNum, banker.id);
	} else {
		Log.info("没有庄家情况");
		// 从第一个位置开始就近找一个玩家作为庄家
		banker = this.getNextSeatById(1);
		// console.log(banker);
		if (banker) {
			banker.flag = Const.RoomSeats.Btn;
			isCanBegin = this.createGame(playerNum, banker.id);
		};
	};
	return isCanBegin;
};
/**
 * 创建一局游戏
 * @param  {[type]} seat [庄家位置]
 * 特殊处理两个与三个玩家的情况
 */
Room.prototype.createGame = function(playerNum, bankerId) {

	// 庄家的下一位，小盲位
	var sb = this.getNextSeatById(bankerId);
	sb.flag = Const.RoomSeats.Sb;
	if (playerNum == 2) {

		// 开局只有两个玩家时，小盲位与枪口位一样，庄家与大盲位一样
		// 这里不做处理
		Log.warn("房间只有两个人，没有大盲位也没有枪口位，但可以进行游戏");
	} else {

		// 开局只有三个玩家时，小盲位不变，大盲位不变，庄家与枪口位一样
		if (playerNum >= 3) {

			Log.warn("房间只有三个人，没有枪口位，但可以进行游戏");
			// 小盲位的下一位，大盲位
			var bb = this.getNextSeatById(sb.id);
			bb.flag = Const.RoomSeats.Bb;
			// 开局大于三个玩家时，庄家，小盲，大盲，枪口位置独立
			if (playerNum > 3) {
				this.getNextSeatById(bb.id).flag = Const.RoomSeats.Utg;
			};
		};
	};
	console.log(this.seats);
	return true;
};
// 取房间特殊位置
Room.prototype.getSpecialSeat = function(playerNum, room_seats) {

	if (!playerNum || !room_seats) {
		Log.error("获取特殊位置参数错误");
		return null;
	};
	for (var i = 0; i < this.seats.length; i++) {
		if (playerNum == 2) {
			// 两个玩家,小盲与枪口一样，庄家与大盲一样
			if (room_seats == Const.RoomSeats.Bb && this.seats[i].flag == Const.RoomSeats.Btn) {
				return this.seats[i];
			};
			if (room_seats == Const.RoomSeats.Utg && this.seats[i].flag == Const.RoomSeats.Sb) {
				return this.seats[i];
			};
		} else if (playerNum == 3) {
			// 三个玩家，庄家与枪口一样
			if (room_seats == Const.RoomSeats.Utg && this.seats[i].flag == Const.RoomSeats.Btn) {
				return this.seats[i];
			};
		};
		if (this.seats[i].flag == room_seats) {return this.seats[i];};
	};
	Log.error("未取到房间特殊位置：", room_seats);
	return null;
};

// 按顺序取空位置给新进玩家坐下
Room.prototype.getEmptySeat = function() {
	for (var i = 0; i < this.seats.length; i++) {
		if (!this.seats[i].uid) {return this.seats[i];};
	};
	Log.info("没有空位置了");
	return null;
};

// 取当前id的下一玩家座位
Room.prototype.getNextSeatById = function(id) {
	if (!id) {
		Log.error("取当前座位下一玩家参数错误");
		return null;
	};
	var len = this.seats.length, count = 0;
	do {
		count++;id++;
		if (id > len) {id = 1;};// id: 1-9
		var seat = this.getSeatById(id);
		if (seat.uid) {return seat;};// TODO已弃牌玩家是否要跳过？
	} while (count < len);// 最大循环次数不超过座位数
	Log.error("未取到下一玩家的座位");
	return null;
};
// 取当前id的下一未说话玩家的坐位
Room.prototype.getSeatNextUser = function(id, statusId) {
	if (!id) {
		Log.error("取当前座位下一未说话玩家参数错误");
		return null;
	};
	var len = this.seats.length, count = 0;
	if (!statusId) {statusId = this.getCurStatus().id;};
	do {// 先把合适的id找出来
		count++;id++;
		if (id > len) {id = 1;};// id: 1-9
		var seat = this.getSeatById(id);
		if (!seat || !seat.uid) {continue;};// 位置没有玩家，跳过
		var player = this.getPlayerById(seat.uid);
		// TODO玩家不存在也要跳过？有可能出现这种情况，在寻找位置时，可能刚好玩家退出去了，这里player取出为null
		if (!player) {continue;};
		var curStatus = player.getCurStatus();
		if (curStatus && curStatus.id == Const.PlayerStatus.Fold) {continue;};// 弃牌玩家跳过
		if (curStatus && curStatus.id == Const.PlayerStatus.Allin) {continue;};// allin玩家跳过
		// 1. 玩家前一轮未弃牌，2. 玩家这一轮未说过话，3. 玩家说过话，但是下注筹码未与最大下注筹码持平
		if (!player.talks[statusId]) {return seat;};// 跳出循环条件,取到合适id跳出循环
		// 每一轮说话，除了allin玩家，其他玩家下注筹码必须持平，否则一直按顺序取玩家，直到持平
		// console.log(player);
		if (this.isPlayerNeedCall(statusId, player.getPlayerChip(statusId))) {return seat;};
	} while (count < len);// 最大循环次数不超过座位数
	Log.warn("未取到下一未说话玩家的座位");
	return null;
};

// 取当前局游戏说话玩家，按座位顺时针顺序来取
// player必须是有座位的玩家，TODO这里后面优化一下，传人数进来即可
Room.prototype.getTalkPlayer = function(players, curTalkId) {

	var playerNum = players.length;

	var curStatus = this.getCurStatus().id;// 房间当前状态
	if (curStatus == Const.RoomStatus.Hole && !this.isNotFirstTalk()) {
		console.log("本局第一次说话取枪口位");
		// 如果只有两个人，小盲位与枪口位相同
		// 如果只有三个人，庄家位与枪口位相同
		if (playerNum == 2) {
			return this.getSpecialSeat(playerNum, Const.RoomSeats.Sb).uid;
		} else if (playerNum == 3) {
			return this.getSpecialSeat(playerNum, Const.RoomSeats.Btn).uid;
		} else {
			return this.getSpecialSeat(playerNum, Const.RoomSeats.Utg).uid;
		};
	} else {
		console.log("不是本局第一次说话");
		if (!curTalkId) {
			curTalkId = this.getSpecialSeat(playerNum, Const.RoomSeats.Btn).uid;
		};
		var curSeat = this.isUserHaveSeat(curTalkId);
		var nextSeat = this.getSeatNextUser(curSeat.id);
		if (!nextSeat) {Log.warn("未取到下一说话玩家，nextSeat为空");return 0;};
		return nextSeat.uid;
	};
	Log.error("取下一说话玩家出错");
	return 0;
};


// 换座位，换座位的前提是有空座位，且每次换座位是是代价的
Room.prototype.exchangeSeat = function() {

};
Room.prototype.getSeatById = function(id) {
	for (var i = 0; i < this.seats.length; i++) {
		if (id == this.seats[i].id) {return this.seats[i];};
	};
	Log.error("未找到id对应的座位", id);
	return null;
};
// 根据玩家id判断玩家是否有座位
Room.prototype.isUserHaveSeat = function(id) {

	if (!id) {
		Log.error("判断玩家是否有座位参数错误");
		return null;
	};
	for (var i = 0; i < this.seats.length; i++) {
		if (this.seats[i].uid && this.seats[i].uid == id) {return this.seats[i];};
	};
	return null;
};
// 判断本局游戏是否是第一次说话
Room.prototype.isNotFirstTalk = function() {
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].talks && Object.keys(this.players[i].talks).length > 1) {return true};
	};
	return false;
};
// 根据玩家id取玩家
Room.prototype.getPlayerById = function(id) {
	if (!id) {
		Log.error("根据id取游戏中玩家参数错误：", id);
		return null;
	};
	for (var i = 0; i < this.players.length; i++) {
		if (id == this.players[i].uid) {return this.players[i];};
	};
	Log.error("id对应player不在游戏中：", id);
	return null;
};
Room.prototype.getWaitById = function(id) {
	if (!id) {
		Log.error("根据id取等待中玩家参数错误：", id);
		return null;
	};
	for (var i = 0; i < this.waits.length; i++) {
		if (id == this.waits[i].uid) {return this.waits[i];};
	};
	Log.error("id对应wait不在等待中：", id);
	return null;
};

// 发放底牌逻辑
// 每个玩家的底牌是单独发放的，各个玩家只能拿到自已的底牌
// 这里的包有可能会被外挂监听，所以这个地方单独拿出来处理
Room.prototype.holeCards = function() {

	if (!this.players || !this.players.length) {
		Log.error("房间数据错误，在没有玩家的情况下发了底牌", this.id);
		return;
	};
	// 给房间的人分别单独传输底牌消息
	var count = 2;// 每次发两张
	var route = "hole_cards";
	// 因为发牌逻辑比较简单，这里不另外处理
	for (var i = 0; i < this.players.length; i++) {
		// 牌只发给准备好的玩家，其它状态玩家不发牌
		var uid = this.players[i].uid;
		var sid = this.players[i].sid;
		if (!this.isUserHaveSeat(uid)) {continue;};
		// 按玩家顺序开始取底牌
		var cards = this.card_mgr.provideCards(count);
		// 给一份牌到玩家手里
		this.players[i].setPlayerCards(cards);
		this.pushMsg(uid, sid, route, cards);
		// console.log(cards);
	};
};
// 翻牌圈，公共牌是所有人都可以看的，包括观战的人
Room.prototype.flopCards = function() {
	if (!this.players || !this.players.length) {
		Log.error("房间数据错误，在没有玩家的情况下发了牌", this.id);
		return;
	};
	var count = 3;// 翻牌圈每次发3张公共牌
	var route = "flop_cards";
	var cards = this.card_mgr.provideCards(count);
	for (var i = 0; i < this.players.length; i++) {
		this.players[i].setPlayerCards(cards);
	};
	// console.log(cards);
	this.publicMsg(route, cards);
};
// 转牌圈
Room.prototype.turnCards = function() {
	if (!this.players || !this.players.length) {
		Log.error("房间数据错误，在没有玩家的情况下发了牌", this.id);
		return;
	};
	var count = 1;// 转牌圈发1张牌
	var route = "turn_cards";
	var cards = this.card_mgr.provideCards(count);
	for (var i = 0; i < this.players.length; i++) {
		this.players[i].setPlayerCards(cards);
	};
	// console.log(cards);
	this.publicMsg(route, cards);
};
// 河牌圈
Room.prototype.riverCards = function() {
	if (!this.players || !this.players.length) {
		Log.error("房间数据错误，在没有玩家的情况下发了牌", this.id);
		return;
	};
	var count = 1;// 河牌圈发1张牌
	var route = "river_cards";
	var cards = this.card_mgr.provideCards(count);
	for (var i = 0; i < this.players.length; i++) {
		this.players[i].setPlayerCards(cards);
	};
	// console.log(cards);
	this.publicMsg(route, cards);
};

// 发送channel消息
Room.prototype.pushMsg = function(uid, sid, route, msg) {

	if (!uid || !sid || !route || !msg) {
		Log.error("pushMsg参数错误");
		return;
	};
	var data = {route: route, msg: msg};
	// if (this.channel) {
	// 	this.channel.add(uid, sid);
	// 	this.channel.pushMessage("room_message", data, function() {
	// 		Log.info("pushMessage消息发送成功：", uid, sid);
	// 	});
	// 	this.channel.leave(uid, sid);
	// } else {
		var uids = [{uid: uid, sid: sid}];
		App.channelService.pushMessageByUids("room_message", data, uids, function() {
			Log.info("pushMessageByUids消息发送成功：", uid, sid);
		});
	// }
};
Room.prototype.publicMsg = function(route, msg) {

	if (!route || !msg) {
		Log.error("publicMsg参数错误");
		return;
	};
	var data = {route: route, msg: msg};
	if (!this.players || !this.players) {
		Log.error("房间没有玩家", this.id);
		return;
	};
	var uids = [];
	for (var i = 0; i < this.players.length; i++) {
		uids.push({uid: this.players[i].uid, sid: this.players[i].sid});
	};
	for (var i = 0; i < this.waits.length; i++) {
		uids.push({uid: this.waits[i].uid, sid: this.waits[i].sid});
	};
	// console.log(uids);
	// console.log(data);
	App.channelService.pushMessageByUids("room_message", data, uids, function() {
		Log.info("publicMsg消息发送成功：", route);
	});
};

// 把players队列中没有位置的玩家移到waits队列
// 把waits队列中有位置的玩家移到players队列
Room.prototype.updateQueue = function() {
	for (var i = 0; i < this.players.length; i++) {
		if (!this.isUserHaveSeat(this.players[i].uid)) {
			this.waits.push(this.players[i]);
			this.players.splice(i, 1);
			i--;
		};
	};
	for (var i = 0; i < this.waits.length; i++) {
		if (this.isUserHaveSeat(this.waits[i].uid)) {
			this.players.push(this.waits[i]);
			this.waits.splice(i, 1);
			i--;
		};
	};
	// console.log(this.players);
	// console.log(this.waits);
};
Room.prototype.resetRoom = function() {
	this.bonus = null;
	this.max_chip = null;
	this.clearPreTalk();
	this.updateQueue();
	// 将玩家部份数据重置
	for (var i = 0; i < this.players.length; i++) {
		this.players[i].clearCards();
		this.players[i].clearTalks();
		this.players[i].clearChips();
		this.players[i].update(Const.PlayerStatus.Wait);
	};
};
Room.prototype.clearPreTalk = function() {this.pre_talk.length = 0;};
Room.prototype.destroy = function() {
	this.id = 0;
	this.seats = null;
	this.bonus = null;
	this.max_chip = null;
	this.clearPreTalk();
	if (this.status_mgr) {
		this.status_mgr.destroy();
		this.status_mgr = null;
	};
	for(var id in this.status_map) {
		this.status_map[id].destroy();
		delete this.status_map[id];
	};
	this.status_map = null;
	if (this.card_mgr) {
		this.card_mgr.destroy();
		this.card_mgr = null;
	};
	if (this.channel) {
		this.channel.destroy();
		this.channel = null;
	};
	for (var i = 0; i < this.players.length; i++) {
		this.players[i].destroy();
	};
	this.players.length = 0;
};
module.exports = Room;



