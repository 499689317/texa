
#include "check_status.h"
#include "../../room_mgr/room_mgr.h"

CheckStatus::CheckStatus(int id, int roomId, string uid) : Status(id, roomId) {
	cout << "玩家Check构造函数" << endl;
	_uid = uid;
}
CheckStatus::~CheckStatus() {

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

void CheckStatus::OnEnter() {

	cout << "玩家: " << _uid << "进入CheckStatus: " << GetId() << "状态" << endl;

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
void CheckStatus::check() {

	cout << "玩家闲置" << endl;
	assert(_room != NULL && _player != NULL);

	// 房间状态
	// Status* status = _room -> GetCurStatus();
	
}
void CheckStatus::OnExit() {
	cout << "玩家: " << _uid << "退出CheckStatus: "<< GetId() << "状态" << endl;
}

Room* CheckStatus::GetRoom() {
	return _room;
}
Player* CheckStatus::GetPlayer() {
	return _player;
}






