
#include "fold_status.h"
#include "../../room_mgr/room_mgr.h"

FoldStatus::FoldStatus(int id, int roomId, string uid) : Status(id, roomId) {
	cout << "玩家Fold构造函数" << endl;
	_uid = uid;
}
FoldStatus::~FoldStatus() {

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

void FoldStatus::OnEnter() {

	cout << "玩家: " << _uid << "进入FoldStatus: " << GetId() << "状态" << endl;

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
void FoldStatus::check() {

	cout << "玩家闲置" << endl;
	assert(_room != NULL && _player != NULL);

	// 房间状态
	// Status* status = _room -> GetCurStatus();
	
}
void FoldStatus::OnExit() {
	cout << "房间: " << _uid << "退出FoldStatus: "<< GetId() << "状态" << endl;
}

Room* FoldStatus::GetRoom() {
	return _room;
}
Player* FoldStatus::GetPlayer() {
	return _player;
}






