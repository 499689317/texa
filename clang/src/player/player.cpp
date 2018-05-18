
#include "player.h"

void Test() {


}


/**
 * u: 玩家id
 * s: 玩家服务器id
 * r: 玩家所在房间id
 * c: 玩家在当前持有筹码数
 */
Player::Player(string u, string s, int r, int c) : _uid(u), _sid(s), _roomId(r), _chip(c) {
	// 状态机初始化
	_statusMgr = new StatusMgr();
	_status_map[Fold] = new FoldStatus(Fold, _roomId, _uid);
	_status_map[Bet] = new BetStatus(Bet, _roomId, _uid);
	_status_map[Raise] = new RaiseStatus(Raise, _roomId, _uid);
	_status_map[Call] = new CallStatus(Call, _roomId, _uid);
	_status_map[Check] = new CheckStatus(Check, _roomId, _uid);
	_status_map[Waits] = new WaitsStatus(Waits, _roomId, _uid);
	_status_map[Allin] = new AllinStatus(Allin, _roomId, _uid);
}
Player::~Player() {

	// for (std::vector<Card*>::iterator iter = _cards.begin(); iter != _cards.end(); iter++)
	// {
	// 	if (*iter != NULL)
	// 	{
	// 		delete *iter;
	// 		*iter = NULL;
	// 	}
	// }
	// _cards.clear();
	// for (std::map<int, Status*>::iterator iter = _status_map.begin(); iter != _status_map.end(); iter++)
	// {
	// 	if (iter -> second != NULL)
	// 	{
	// 		delete iter -> second;
	// 		iter -> second = NULL;
	// 	}
	// }
	// _status_map.clear();
}

void Player::Update(int statusId) {
	_statusMgr -> Update(_status_map[statusId]);
}
Status* Player::GetPreStatus() {
	return _statusMgr -> GetPreStatus();
}
Status* Player::GetCurStatus() {
	return _statusMgr -> GetCurStatus();
}


string Player::GetUid() {
	return _uid;
}
string Player::GetSid() {
	return _sid;
}
int Player::GetRoomId() {
	return _roomId;
}
int Player::GetChip() {
	return _chip;
}

void Player::SetPlayerCards(std::vector<Card*> v) {
	for (unsigned long i = 0; i < v.size(); ++i) {
		_cards.push_back(v[i]);
	}
}
void Player::SetPlayerTalks(int roomStatus, int playerStatus) {

	assert(roomStatus && playerStatus);

	_talks[roomStatus] = playerStatus;
}
void Player::SetPlayerChips(int roomStatus, int chip) {

	assert(roomStatus && chip);
	// 这里也可以insert pair的方式插入键值对
	_chips[roomStatus] += chip;
}
int Player::GetPlayerChip(int roomStatus) {

	assert(roomStatus);

	std::map<int, int>::iterator iter = _chips.find(roomStatus);
	if (iter == _chips.end())
	{
		return 0;
	}
	return _chips[roomStatus];
}
int Player::GetPlayerTalk(int roomStatus) {

	assert(roomStatus);

	std::map<int, int>::iterator iter = _talks.find(roomStatus);
	if (iter == _talks.end())
	{
		return 0;
	}
	return _talks[roomStatus];
}
// TODO 这里要确定一下vector是否实现了拷贝构造函数，不要内存泄露了
std::vector<Card*> Player::GetPlayerCards() {
	return _cards;
}

void Player::clearCards() {
	_cards.clear();
}
void Player::clearTalks() {
	_talks.clear();
}
void Player::clearChips() {
	_chips.clear();
}


