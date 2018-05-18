
var FoldStatus = require("./status/player_status/fold_status.js");
var BetStatus = require("./status/player_status/bet_status.js");
var RaiseStatus = require("./status/player_status/raise_status.js");
var CallStatus = require("./status/player_status/call_status.js");
var CheckStatus = require("./status/player_status/check_status.js");
var WaitStatus = require("./status/player_status/wait_status.js");
var AllinStatus = require("./status/player_status/allin_status.js");
var Status = require("./status/status.js");

// 玩家进入房间后是处于多状态形式的
// 由于玩家进入房间后是一种临时态
// 所以这里没有去把玩家像传统rpg游戏一样写得太复杂

function Player(res) {

	this.uid = res.uid || 0; // 玩家角包id
	this.sid = res.sid || 0; // 玩家所在服务器id
	this.chip = res.chip || 0;// 玩家带入的筹码量
	this.roomId = res.roomId || 0; // 玩家所在的房间id
	
	this.status_mgr = null;// 玩家状态管理器
	this.status_map = {};

	this.cards = [];// 玩家当前所持有的牌
	// 需要记录玩家当前说话状态
	// 当前房间状态下的说话状态
	// talks = {
	// 		roomStatus: playerStatus
	// };
	this.talks = {};// 说完话记录一下
	this.chips = {};// 每一轮下注记录一下

	this.init();
};

Player.prototype.init = function() {

	this.status_map[Const.PlayerStatus.Fold] = new FoldStatus(this.uid, this.roomId);
	this.status_map[Const.PlayerStatus.Bet] = new BetStatus(this.uid, this.roomId);
	this.status_map[Const.PlayerStatus.Raise] = new RaiseStatus(this.uid, this.roomId);
	this.status_map[Const.PlayerStatus.Call] = new CallStatus(this.uid, this.roomId);
	this.status_map[Const.PlayerStatus.Check] = new CheckStatus(this.uid, this.roomId);
	this.status_map[Const.PlayerStatus.Wait] = new WaitStatus(this.uid, this.roomId);
	this.status_map[Const.PlayerStatus.Allin] = new AllinStatus(this.uid, this.roomId);
	this.status_mgr = new Status();
};
// 这里做一下fix
Player.prototype.update = function(statusId, msg) {
	this.status_mgr.update(this.status_map[statusId]);
	this.getCurStatus().check(msg);
};
// 获取玩家当前状态，根据这个状态来判断当前玩家的权限
Player.prototype.getCurStatus = function() {
	return this.status_mgr.getCurStatus();
};
// 获取玩家前一状态，暂时不知道有什么用
Player.prototype.getPreStatus = function() {
	return this.status_mgr.getPreStatus();
};


// 玩家获得当前牌
Player.prototype.setPlayerCards = function(cards) {

	if (!cards || !cards.length) {
		Log.error("没有发出牌，哪里出错了");
		return;
	};
	// 这里需不需要将牌标识为底牌与公共牌，加个字段即可
	this.cards = this.cards.concat(cards);
	// console.log(this.cards);
};
/**
 * 设置玩家说话状态
 * @param {[type]} roomStatus   [对应房间状态id]
 * @param {[type]} playerStatus [对应玩家状态id]
 */
Player.prototype.setPlayerTalk = function(roomStatus, playerStatus) {
	if (!roomStatus || !playerStatus) {
		Log.error("记录玩家当前轮说话状态参数错误");
		return;
	};
	if (!this.talks) {this.talks = {};};
	if (this.talks[roomStatus]) {
		// 在追平筹码时会有多次说话的情况，这里选择覆盖，记录最新说话状态
		// 这里只能以玩家最新说话状态为准，必须要覆盖更新
		Log.warn("同一轮游戏多次说话", roomStatus, playerStatus);
		// return;
	};
	this.talks[roomStatus] = playerStatus;
};
Player.prototype.setPlayerChip = function(roomStatus, chip) {
	if (!roomStatus || typeof chip === "undefined") {
		Log.error("记录玩家当前轮下注金额参数错误");
		return;
	};
	if (!this.chips) {this.chips = {};};
	if (!this.chips[roomStatus]) {this.chips[roomStatus] = 0;};
	this.chips[roomStatus] += chip;
};
Player.prototype.getPlayerChip = function(roomStatus) {
	if (!roomStatus) {
		Log.error("获取玩家房间状态下注的总筹码参数错误");
		return;
	};
	if (this.chips[roomStatus]) {return this.chips[roomStatus];};
	return 0;
};


Player.prototype.clearCards = function() {
	this.cards.length = 0;
};
Player.prototype.clearTalks = function() {
	this.talks = null;
};
Player.prototype.clearChips = function() {
	this.chips = null;
};
Player.prototype.destroy = function() {
	Log.info("玩家数据销毁");
	this.uid = 0;
	this.sid = 0;
	this.roomId = 0;

	if (this.status_mgr) {
		this.status_mgr.destroy();
		this.status_mgr = null;
	};
	for(var id in this.status_map) {
		this.status_map[id].destroy();
		delete this.status_map[id];
	};
	this.status_map = null;
	this.clearCards();
	this.clearTalks();
	this.clearChips();
};

module.exports = Player;



