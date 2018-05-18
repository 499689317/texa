
#include "allin_status.h"
#include "../../room_mgr/room_mgr.h"

AllinStatus::AllinStatus(int id, int roomId, string uid) : Status(id, roomId) {
	cout << "玩家Allin构造函数" << endl;
	_uid = uid;
}
AllinStatus::~AllinStatus() {

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

void AllinStatus::OnEnter() {

	cout << "玩家: " << _uid << "进入AllinStatus: " << GetId() << "状态" << endl;

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
void AllinStatus::check() {

	cout << "玩家闲置" << endl;
	assert(_room != NULL && _player != NULL);

	// 房间状态
	// Status* status = _room -> GetCurStatus();
	
}
void AllinStatus::OnExit() {
	cout << "玩家: " << _uid << "退出AllinStatus: "<< GetId() << "状态" << endl;
}

Room* AllinStatus::GetRoom() {
	return _room;
}
Player* AllinStatus::GetPlayer() {
	return _player;
}






