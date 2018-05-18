
// 扑克卡牌
class Card {
	constructor(res) {
		this.color = res.color || 0;
		this.kind = res.kind || 0;
	};
	init() {};
	destroy() {
		this.color = 0;
		this.kind = 0;
	};
};
module.exports = Card;








