
/**
 * 项目中常量定义
 * 总共需要52张牌
 */
var Const = {
    MaxCards: 52
};

/**
 * errcode
 * 标识请求响应返回的错误码
 */
Const.ErrCode = {
	SysSucceed: 0,// 请求成功
	SysParam: 1,// 请求参数错误
	SysModel: 2,// 请求模块错误
};

/**
 * 卡牌颜色 红桃 黑桃 梅花 方块
 */
Const.CardColor = {
    RedPeach: 1, Spades: 2, PlumBlossom: 3, Diamond: 4
};

/**
 * 卡牌种类 A 2 3 4 5 6 7 8 9 10 J Q K
 */
Const.CardKind = {
    A: 14, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10, K: 11, L: 12, M: 13
};

/**
 * 德州扑克牌型 高牌 一对 两对 三条 顺子 同花 葫芦 四条 同花顺 皇家同花顺
 */
Const.CardBuff = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10
};
Const.CardMap = {
    1: "高牌", 2: "一对", 3: "两对", 4: "三条", 5: "顺子", 6: "同花", 7: "葫芦", 8: "四条", 9: "同花顺", 10: "皇家同花顺"
};

/**
 * 房间状态 等待 开始 底牌圈 翻牌圈 转牌圈 河牌圈 结算
 */
Const.RoomStatus = {
    Wait: 1, Start: 2, Hole: 3, Flop: 4, Turn: 5, River: 6, Stop: 7
};

/**
 * 玩家状态 弃牌 下注 加注 跟注 过牌 闲置 allin
 */
Const.PlayerStatus = {
    Fold: 1, Bet: 2, Raise: 3, Call: 4, Check: 5, Wait: 6, Allin: 7
};

/**
 * 房间牌座位置 庄家 小盲 大盲 枪口
 */
Const.RoomSeats = {
	Btn: 1, Sb: 2, Bb: 3, Utg: 4
};

module.exports = Const;



