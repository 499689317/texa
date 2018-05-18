
#include "raise_status.h"
#include "../../room_mgr/room_mgr.h"

RaiseStatus::RaiseStatus(int id, int roomId, string uid) : Status(id, roomId) {
	cout << "玩家Raise构造函数" << endl;
	_uid = uid;
}
RaiseStatus::~RaiseStatus() {

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

void RaiseStatus::OnEnter() {

	cout << "玩家: " << _uid << "进入RaiseStatus: " << GetId() << "状态" << endl;

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
void RaiseStatus::check() {

	cout << "玩家闲置" << endl;
	assert(_room != NULL && _player != NULL);

	// 房间状态
	// Status* status = _room -> GetCurStatus();
	
}
void RaiseStatus::OnExit() {
	cout << "玩家: " << _uid << "退出RaiseStatus: "<< GetId() << "状态" << endl;
}

Room* RaiseStatus::GetRoom() {
	return _room;
}
Player* RaiseStatus::GetPlayer() {
	return _player;
}






