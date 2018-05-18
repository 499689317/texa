
#include "call_status.h"
#include "../../room_mgr/room_mgr.h"

CallStatus::CallStatus(int id, int roomId, string uid) : Status(id, roomId) {
	cout << "玩家Call构造函数" << endl;
	_uid = uid;
}
CallStatus::~CallStatus() {

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

void CallStatus::OnEnter() {

	cout << "玩家: " << _uid << "进入CallStatus: " << GetId() << "状态" << endl;

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
void CallStatus::check() {

	cout << "玩家闲置" << endl;
	assert(_room != NULL && _player != NULL);

	// 房间状态
	// Status* status = _room -> GetCurStatus();
	
}
void CallStatus::OnExit() {
	cout << "玩家: " << _uid << "退出CallStatus: "<< GetId() << "状态" << endl;
}

Room* CallStatus::GetRoom() {
	return _room;
}
Player* CallStatus::GetPlayer() {
	return _player;
}






