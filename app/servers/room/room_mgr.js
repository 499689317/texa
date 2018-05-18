
// var Room = require("./room.js");

// 房间管理器
var mod = module.exports = {
	rooms: [],
	roomUser: {},// 维护一个uid与roomId的关系表
	roomId: 1
};

mod.createRoom = function(roomId, isNeedRobot) {

	if (!roomId) {
		roomId = this.roomId;
	};

	if (!roomId) {
		Log.error("创建房间参数错误");
		return;
	};
	var room = this.getRoomById(roomId);
	if (room) {
		console.warn("房间已创建", roomId);
	} else {
		console.warn("创建新房间", roomId);
		// 暂时这样处理，怕会引起内存泄漏
		var Room = require("./room.js");
		room = new Room(roomId);
		this.rooms.push(room);
	};
	room.update(Const.RoomStatus.Wait);

	// TODO测试代码
	if (isNeedRobot) {this.joinRobot(room);};
};

// 玩家下线，离开要及时从房间里清理掉
mod.playerLeave = function(uid) {

	if (!uid) {
		Log.error("玩家离开房间参数错误");
		return;
	};

	var roomId = this.getRoomIdByUid(uid);
	if (!roomId) {
		Log.error("玩家离开房间，uid对应roomId不存在");
		return;
	};

	var room = this.getRoomById(roomId);
	if (!room) {
		Log.error("玩家离开房间,roomId对应房间不存在");
		return;
	};
	room.leaveRoom(uid);
};
mod.playerJoin = function(roomId, player, isNeedRobot) {

	if (!roomId) {
		Log.error("加入房间参数错误");
		return;
	};

	var room = this.getRoomById(roomId);
	if (!room) {
		Log.error("加入房间id对应房间不存在", roomId);
		return;
	};

	console.log(player);
	this.joinPlayer(room, player);

	// TODO测试代码
	if (isNeedRobot) {this.joinRobot(room);};

	// 返回客户端消息内容
	var list = [];
	for (var i = 0; i < room.players.length; i++) {
		var info = _.pick(room.players[i], "uid", "chip");
		info.status = room.players[i].getCurStatus().id;
		list.push(info);
	};
	var baseinfo = {
		roomId: roomId,
		roomStatus: room.getCurStatus().id,
		list: list,
		roomInfo: null,
		result: null
	};
	return baseinfo;
};

// TODO测试代码
mod.joinPlayer = function(room, player) {

	if (!room || !player) {
		Log.error("玩家加入房间参数错误");
		return;
	};
	var roomId = room.id;
	var uid = player.uid;
	this.setRoomIdByUid(uid, roomId);
	room.joinRoom({uid: uid, sid: player.sid, chip: 1000});
};
mod.joinRobot = function(room) {
	if (!room) {
		Log.error("加入机器人参数错误");
		return;
	};
	var roomId = room.id;
	var uids = [101, 102, 103, 104, 105, 106, 107, 108];
	for (var i = 0; i < uids.length; i++) {
		var uid = uids[i];
		this.setRoomIdByUid(uid, roomId);
		room.joinRoom({uid: uid, sid: "connector", chip: 1000});
	};
};

// getter/setter
mod.getRoomById = function(roomId) {

	if (!roomId) {
		Log.error("根据id取房间参数错误", roomId);
		return null;
	};
	if (!this.rooms || !this.rooms) {
		Log.error("当前服务器没有创建一个房间", roomId);
		return null;
	};

	for (var i = 0; i < this.rooms.length; i++) {
		if (roomId == this.rooms[i].id) {
			return this.rooms[i];
		};
	};
	Log.error("roomId对应房间不存在", roomId);
	return null;
};
mod.getRoomIdByUid = function(uid) {

	if (!uid) {
		Log.error("根据玩家id取对应房间id参数错误");
		return 0;
	};
	if (this.roomUser[uid]) {return this.roomUser[uid];};
	Log.error("根据玩家id未取到对应房间id");
	return 0;
};
mod.setRoomIdByUid = function(uid, roomId) {

	if (!uid || !roomId) {
		Log.error("更新玩家id的房间id参数错误");
		return;
	};
	if (!this.roomUser) {this.roomUser = {};};
	this.roomUser[uid] = roomId;
};

// =============================
// =============================
// =============================
// 识别牌型
// cards内是已排序的牌
// cards = [{color: x, kind: y}...];
// =============================
// =============================
// =============================
// 皇家同花顺
mod.isRoyalFlush = function(cards) {

    var straightFlush = this.isStraightFlush(cards);
    if (!straightFlush) {
    	return null;
    };
    if (straightFlush[0].kind == 14) {
    	// 皇家同花顺
    	return straightFlush;
    };
    return null;
};
// 同花顺
mod.isStraightFlush = function(cards) {
    var flushCards = this.isFlush(cards);
    if (!flushCards) {
    	return null;
    };
    //再找顺子
    var straight = this.isStraight(flushCards);
    if (!straight) {
    	return null;
    };
    return straight;
};
// 同花
mod.isFlush = function(cards) {
	var colors = [0, 0, 0, 0];
    for (var i = 0; i < cards.length; i++) {
        colors[cards[i].color]++;
    };
    var flushColor = 0;
    for (var j = 0; j < 4; j++) {
        if (colors[j] >= 5) {
            flushColor = j;
            break;
        };
    };
    if (!flushColor) return null;
    var flushCards = [];
    for (var i = 0; i < cards.length; i++) {
        if (cards[i].color == flushColor) {
            flushCards.push(cards[i]);
        };
    };
    return flushCards;
};
// 顺子
mod.isStraight = function(cards) {
 	for (var i = 0; i < cards.length - 4; i++) {
        if (cards[i].kind - 1 == cards[i + 1].kind
            && cards[i + 1].kind - 1 == cards[i + 2].kind
            && cards[i + 2].kind - 1 == cards[i + 3].kind) {
        	// 常规顺子，取最大的顺子
            if (cards[i + 3].kind - 1 == cards[i + 4].kind) {
            	return [cards[i], cards[i + 1], cards[i + 2], cards[i + 3], cards[i + 4]];
            };
            // 额外处理5、4、3、2、A的顺子
            if (cards[i].kind == 2 && cards[cards.length - 1].kind == 14) {
                return [cards[i], cards[i + 1], cards[i + 2], cards[i + 3], cards[cards.length - 1]];
            };
        };
    };
    return null;
};
// 葫芦
mod.isFullHouse = function(cards) {
	var three = this.isThreeOfAKind(cards, true);
	if (!three) {
		return null;
	};
	for (var i = 0; i < cards.length -1; i++) {
		
		if (three[0].kind != cards[i].kind && cards[i].kind == cards[i + 1].kind) {
			return three.concat([cards[i], cards[i + 1]]);
		};
	};
    return null;
};
// 四条
mod.isFourOfAKind = function(cards) {
	for (var i = 0; i < cards.length - 3; i++) {
        if (cards[i].kind == cards[i + 1].kind && cards[i].kind == cards[i + 2].kind  && cards[i].kind == cards[i + 3].kind) {
        	// 这里牺牲一点性能也要把最大单牌找出来
        	var arr = [];
        	for (var j = 0; j < cards.length; j++) {
        		if (cards[j].kind == cards[i].kind) {continue;};
        		arr.push(cards[j]);
        	};
        	return [cards[i], cards[i + 1], cards[i + 2], cards[i + 3], arr[0]];
        };
    }
    return null;
};
// 三条
mod.isThreeOfAKind = function(cards, isCondition) {
	for (var i = 0; i < cards.length - 2; i++) {
        if (cards[i].kind == cards[i + 1].kind && cards[i].kind == cards[i + 2].kind) {
        	if (!isCondition) {
	        	var arr = [];
				for (var j = 0; j < cards.length; j++) {
					if (cards[j].kind == cards[i].kind) {continue;};
					arr.push(cards[j]);
				};
				return [cards[i], cards[i + 1], cards[i + 2], arr[0], arr[1]];
        	};
        	return [cards[i], cards[i + 1], cards[i + 2]];
        };
    };
    return null;
};
// 两对
mod.isTwoPair = function(cards) {
	var hasPair = false;
	var list = [];
    for (var i = 0; i < cards.length - 1; i++) {
        if (cards[i].kind == cards[i + 1].kind) {
        	list.push(cards[i]);
        	list.push(cards[i + 1]);
            if (hasPair) {
            	var arr = [];
            	for (var j = 0; j < cards.length; j++) {
            		if (cards[j].kind == list[0].kind || cards[j].kind == list[2].kind) {continue;};
            		arr.push(cards[j]);
            	};
            	list.push(arr[0]);
            	return list;
            };
            i++;
            hasPair = true;
        }
    }
    return null;
};
// 一对
mod.isPair = function(cards) {
	for (var i = 0; i < cards.length - 1; i++) {
        if (cards[i].kind == cards[i + 1].kind) {
        	var arr = [];
        	for (var j = 0; j < cards.length; j++) {
        		if (cards[j].kind == cards[i].kind) {continue;};
        		arr.push(cards[j]);
        	};
        	return [cards[i], cards[i + 1], arr[0], arr[1], arr[2]];
        };
    }
    return null;
};
// 高牌
mod.isHighCard = function(cards) {return [cards[0], cards[1], cards[2], cards[3], cards[4]];};

mod.checkType = function(cards) {
	// 这里从大到小排序，可以保证找出的第一个顺子是当前最大的顺子
	cards.sort(function(a, b) {
		return b.kind - a.kind;
	});
	// console.log(cards);
	var obj = this.isRoyalFlush(cards);
	if (obj) return {type: Const.CardBuff.J, value: obj};// 皇家同花顺
	obj = this.isStraightFlush(cards);
    if (obj) return {type: Const.CardBuff.I, value: obj};// 同花顺
    obj = this.isFourOfAKind(cards);
    if (obj) return {type: Const.CardBuff.H, value: obj};// 四条
    obj = this.isFullHouse(cards);
    if (obj) return {type: Const.CardBuff.G, value: obj};// 葫芦
    obj = this.isFlush(cards);
    if (obj) return {type: Const.CardBuff.F, value: obj};// 同花
    obj = this.isStraight(cards);
    if (obj) return {type: Const.CardBuff.E, value: obj};// 顺子
    obj = this.isThreeOfAKind(cards);
    if (obj) return {type: Const.CardBuff.D, value: obj};// 三条
    obj = this.isTwoPair(cards);
    if (obj) return {type: Const.CardBuff.C, value: obj};// 两对
    obj = this.isPair(cards);
    if (obj) return {type: Const.CardBuff.B, value: obj};// 一对
    obj = this.isHighCard(cards);
    return {type: Const.CardBuff.A, value: obj};// 高牌
};
// 对比
mod.commpare = function(type, list) {
	if (!type || !list || !list.length) {
		Log.error("对比牌型大小参数错误");
		return null;
	};
	return this.comHighCard(type, list);
};

// 所有牌型都可以按这个比牌规则走
mod.comHighCard = function(type, list) {

	// 逻辑上是按照一张一张单牌进行对比，取有最大单牌，可以平局
	// 第一张牌
	var arr = [];
	for (var i = 0; i < list.length; i++) {
		arr.push(list[i].value[0].kind);
	};
	var win = Math.max.apply(null, arr);
	var winner = [];
	for (var i = 0; i < list.length; i++) {
		if (list[i].value[0].kind >= win) {
			winner.push(list[i]);
		};
	};
	if (winner.length == 1) {
		return winner[0].uid;
	};

	// 第二张牌
	var arr2 = [];
	for (var i = 0; i < winner.length; i++) {
		arr2.push(winner[i].value[1].kind);
	};
	var win2 = Math.max.apply(null, arr2);
	var winner2 = [];
	for (var i = 0; i < winner.length; i++) {
		if (winner[i].value[1].kind >= win2) {
			winner2.push(winner[i]);
		};
	};
	if (winner2.length == 1) {
		return winner2[0].uid;
	};

	// 第三张牌
	var arr3 = [];
	for (var i = 0; i < winner2.length; i++) {
		arr3.push(winner2[i].value[2].kind);
	};
	var win3 = Math.max.apply(null, arr3);
	var winner3 = [];
	for (var i = 0; i < winner2.length; i++) {
		if (winner2[i].value[2].kind >= win3) {
			winner3.push(winner2[i]);
		};
	};
	if (winner3.length == 1) {
		return winner3[0].uid;
	};

	// 第4张牌
	var arr4 = [];
	for (var i = 0; i < winner3.length; i++) {
		arr4.push(winner3[i].value[3].kind);
	};
	var win4 = Math.max.apply(null, arr4);
	var winner4 = [];
	for (var i = 0; i < winner3.length; i++) {
		if (winner3[i].value[3].kind >= win4) {
			winner4.push(winner3[i]);
		};
	};
	if (winner4.length == 1) {
		return winner4[0].uid;
	};

	// 第5张牌
	var arr5 = [];
	for (var i = 0; i < winner4.length; i++) {
		arr5.push(winner4[i].value[4].kind);
	};
	var win5 = Math.max.apply(null, arr5);
	var winner5 = [];
	for (var i = 0; i < winner4.length; i++) {
		if (winner4[i].value[4].kind >= win5) {
			winner5.push(winner4[i].uid);
		};
	};
	if (winner5.length == 1) {
		return winner5[0];
	};
	Log.info("有平局，最大是：" + Const.CardMap[type]);
	return winner5;
};

mod.destroy = function() {

	this.roomId = 0;
	this.roomUser = null;
	if (this.rooms && this.rooms.length) {
		for (var i = 0; i < this.rooms.length; i++) {
			this.rooms[i].destroy();
			this.rooms[i] = null;
		};
		this.rooms.length = 0;
	};
};

