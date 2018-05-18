
// 状态机

class Status {

	constructor(status) {
		this._preStatus = null;
		this._curStatus = null;
		// this.init(status);
	};

	init(status) {
		this._curStatus = status;
		this._curStatus.onEnter();
	};
	setPreStatus(status) {
		this._preStatus = status;
	};
	getPreStatus() {
		return this._preStatus;
	};
	setCurStatus(status) {
		this._curStatus = status;
	};
	getCurStatus() {
		return this._curStatus;
	};
	update(status) {
		if (this._curStatus && this._curStatus.id == status.id) {
			console.warn("状态相同，看看有没有问题");
			return;
		};
		if (!this._curStatus) {

			this.setCurStatus(status);
			this._curStatus.onEnter();
		} else {

			this.setPreStatus(this._curStatus);
			this._preStatus.onExit();
			this.setCurStatus(status);
			this._curStatus.onEnter();
		}
	};
	destroy() {
		if (this._preStatus) {
			this._preStatus.destroy();
			this._preStatus = null;
		};
		if (this._curStatus) {
			this._curStatus.destroy();
			this._preStatus = null;
		};
	};
};

module.exports = Status;



