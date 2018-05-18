
var room_mgr  = require("../room_mgr.js");

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};



// 玩家加入房间
Handler.prototype.join = function(msg, session, next) {
	
	var info = room_mgr.playerJoin(1, {uid: session.uid, sid: session.frontendId});
	next(null, {errno: Const.ErrCode.SysSucceed, errmsg: info});
};


// 玩家弃牌，当前玩家置为弃牌状态，不能参与当前局游戏
Handler.prototype.fold = function(msg, session, next) {

	var uid = session.uid;
	var sid = session.frontendId;
	var roomId = msg.roomId;
	if (!uid || !sid || !roomId) {
		Log.error("参数错误", uid, sid, roomId);
		next(null, {errno: Const.ErrCode.SysParam, errmsg: "参数错误"});
		return;
	};

	var room = room_mgr.getRoomById(roomId);
	if (!room) {
		Log.error("房间不存在", roomId);
		next(null, {errno: 100, errmsg: "房间不存在"});
		return;
	};

	var player = room.getPlayerById(uid);
	if (!player) {
		Log.error("玩家不在房间", uid);
		next(null, {errno: 101, errmsg: "玩家不在房间"});
		return;
	};
	player.update(Const.PlayerStatus.Fold);
	next(null, {errno: Const.ErrCode.SysSucceed, errmsg: {isFold: true}});
};
// 过牌
Handler.prototype.check = function(msg, session, next) {

	var uid = session.uid;
	var sid = session.frontendId;
	var roomId = msg.roomId;
	if (!uid || !sid || !roomId) {
		Log.error("参数错误", uid, sid, roomId);
		next(null, {errno: Const.ErrCode.SysParam, errmsg: "参数错误"});
		return;
	};

	var room = room_mgr.getRoomById(roomId);
	if (!room) {
		Log.error("房间不存在", roomId);
		next(null, {errno: 100, errmsg: "房间不存在"});
		return;
	};

	var player = room.getPlayerById(uid);
	if (!player) {
		Log.error("玩家不在房间", uid);
		next(null, {errno: 101, errmsg: "玩家不在房间"});
		return;
	};
	player.update(Const.PlayerStatus.Check);
	next(null, {errno: Const.ErrCode.SysSucceed, errmsg: {isCheck: true}});
};
// 下注
Handler.prototype.bet = function(msg, session, next) {

	var uid = session.uid;
	var sid = session.frontendId;
	var roomId = msg.roomId;
	var chip = msg.chip;// 下注金额，要么弃牌要么下注
	if (!uid || !sid || !roomId || !chip) {
		Log.error("参数错误", uid, sid, roomId, chip);
		next(null, {errno: Const.ErrCode.SysParam, errmsg: "参数错误"});
		return;
	};

	var room = room_mgr.getRoomById(roomId);
	if (!room) {
		Log.error("房间不存在", roomId);
		next(null, {errno: 100, errmsg: "房间不存在"});
		return;
	};

	var player = room.getPlayerById(uid);
	if (!player) {
		Log.error("玩家不在房间", uid);
		next(null, {errno: 101, errmsg: "玩家不在房间"});
		return;
	};
	player.update(Const.PlayerStatus.Bet, {chip: chip});
	next(null, {errno: Const.ErrCode.SysSucceed, errmsg: {isBet: true}});
};


// 加注
Handler.prototype.raise = function(msg, session, next) {

	// 所需参数
	var uid = session.uid;
	var sid = session.frontendId;
	var roomId = msg.roomId;
	var chip = msg.chip;// 下注金额，要么弃牌要么下注
	if (!uid || !sid || !roomId || !chip) {
		Log.error("参数错误", uid, sid, roomId, chip);
		next(null, {errno: Const.ErrCode.SysParam, errmsg: "参数错误"});
		return;
	};

	var room = room_mgr.getRoomById(roomId);
	if (!room) {
		Log.error("房间不存在", roomId);
		next(null, {errno: 100, errmsg: "房间不存在"});
		return;
	};

	var player = room.getPlayerById(uid);
	if (!player) {
		Log.error("玩家不在房间", uid);
		next(null, {errno: 101, errmsg: "玩家不在房间"});
		return;
	};
	player.update(Const.PlayerStatus.Raise, {chip: chip});
	next(null, {errno: Const.ErrCode.SysSucceed, errmsg: {isRaise: true}});
};


// 跟注
Handler.prototype.call = function(msg, session, next) {

	// 所需参数
	var uid = session.uid;
	var sid = session.frontendId;
	var roomId = msg.roomId;
	var chip = msg.chip;// 下注金额，要么弃牌要么下注
	if (!uid || !sid || !roomId || !chip) {
		Log.error("参数错误", uid, sid, roomId, chip);
		next(null, {errno: Const.ErrCode.SysParam, errmsg: "参数错误"});
		return;
	};

	var room = room_mgr.getRoomById(roomId);
	if (!room) {
		Log.error("房间不存在", roomId);
		next(null, {errno: 100, errmsg: "房间不存在"});
		return;
	};

	var player = room.getPlayerById(uid);
	if (!player) {
		Log.error("玩家不在房间", uid);
		next(null, {errno: 101, errmsg: "玩家不在房间"});
		return;
	};
	player.update(Const.PlayerStatus.Call, {chip: chip});
	next(null, {errno: Const.ErrCode.SysSucceed, errmsg: {isCall: true}});
};

// allin
Handler.prototype.allin = function(msg, session, next) {

	// 所需参数
	var uid = session.uid;
	var sid = session.frontendId;
	var roomId = msg.roomId;
	var chip = msg.chip;
	if (!uid || !sid || !roomId || !chip) {
		Log.error("参数错误", uid, sid, roomId, chip);
		next(null, {errno: Const.ErrCode.SysParam, errmsg: "参数错误"});
		return;
	};

	var room = room_mgr.getRoomById(roomId);
	if (!room) {
		Log.error("房间不存在", roomId);
		next(null, {errno: 100, errmsg: "房间不存在"});
		return;
	};

	var player = room.getPlayerById(uid);
	if (!player) {
		Log.error("玩家不在房间", uid);
		next(null, {errno: 101, errmsg: "玩家不在房间"});
		return;
	};
	player.update(Const.PlayerStatus.Allin, {chip: chip});
	next(null, {errno: Const.ErrCode.SysSucceed, errmsg: {isAllin: true}});
};

















