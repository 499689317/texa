
#include "bet_status.h"
#include "../../room_mgr/room_mgr.h"

BetStatus::BetStatus(int id, int roomId, string uid) : Status(id, roomId) {
	cout << "玩家Bet构造函数" << endl;
	_uid = uid;
}
BetStatus::~BetStatus() {

	if (_room != NULL)
	{
		delete _room;
		_room = NULL;
	}
	if (_player != NULL)
	{
		delete _player;
		_player = NULL;
	}
}

void BetStatus::OnEnter() {

	cout << "玩家: " << _uid << "进入BetStatus: " << GetId() << "状态" << endl;

	if (_room == NULL)
	{
		_room = RoomMgr::GetInstance() -> GetRoomById(GetRoomId());
	}
	if (_player == NULL)
	{
		_player = _room -> GetPlayerById(_uid);
	}

	check();
}
void BetStatus::check() {

	cout << "玩家闲置" << endl;
	assert(_room != NULL && _player != NULL);

	// 房间状态
	// Status* status = _room -> GetCurStatus();
	
}
void BetStatus::OnExit() {
	cout << "玩家: " << _uid << "退出BetStatus: "<< GetId() << "状态" << endl;
}

Room* BetStatus::GetRoom() {
	return _room;
}
Player* BetStatus::GetPlayer() {
	return _player;
}






