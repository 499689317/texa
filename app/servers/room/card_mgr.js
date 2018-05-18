
var Card = require("./card.js");
// 卡牌管理器
// 并不继承自Card，仅仅作为Card的管理者

function CardMgr() {
	this.cards = [];// 一个房间总共52张扑克
	// this.init();
};

CardMgr.prototype.init = function() {

	// 初始化游戏卡牌
	// 总共52张，不包括大小鬼
	var max_cards = Const.MaxCards;
	this.cards.length = 0;
	// 花色，类型
	for (var c in Const.CardColor) {
		
		var color = Const.CardColor[c];
		for (var k in Const.CardKind) {
			
			var kind = Const.CardKind[k];
			// Log.info(color, ":::::::", kind);
			this.cards.push(new Card({color: color, kind: kind}));
		};
	};
	// Log.info(this.cards);
	// console.log(this.cards);
};

CardMgr.prototype.shuffleCards = function() {

	// 洗牌算法先定一种，后期看洗牌效果，如果不行在换
	// 随机选取两张牌交换位置，连续交换1000次
	if (!this.cards || !this.cards.length) {
		Log.error("牌堆不存在，牌去哪了？");
		return;
	};
	Log.info("当前卡牌张数：", this.cards.length);
	for (var i = 0; i < 1000; i++) {
		this.exchangeCards();
	};
	// console.log(this.cards);
};

CardMgr.prototype.exchangeCards = function() {

	var random1 = 0;
	var random2 = 0;
	do {
		random1 = this.getRandom();
		random2 = this.getRandom();
	} while(random1 != random1);
	// Log.info(random1, "xxxx", random2);
	if (!this.cards[random1] || !this.cards[random2]) {
		Log.error("随机取牌没有取成功", random1, random2);
		return;
	};

	var card = this.cards[random1];
	this.cards[random1] = this.cards[random2];
	this.cards[random2] = card;
};
// 取牌堆随机一张牌
CardMgr.prototype.getRandom = function() {
	return Math.floor(Math.random() * this.cards.length);
};

// 按洗完牌后的顺序发牌
// count: 一次发几张牌
// 返回数据类型
CardMgr.prototype.provideCards = function(count) {

	if (!count) {
		Log.error("发牌参数错误", count);
		return null;
	};
	// 按顺序取，直到取空数组为止，这里要不要这样取牌还有待商榷
	return this.cards.splice(0, count);
};

CardMgr.prototype.destroy = function() {

	if (this.cards && this.cards.length) {
		for (var i = 0; i < this.cards.length; i++) {
			this.cards[i].destroy();
			this.cards[i] = null;
		};
		this.cards.length = 0;
	};
};
// TODO卡牌管理类与房间管理类还不一样，是否要做成一样的有待后期看性能？
module.exports = CardMgr;






