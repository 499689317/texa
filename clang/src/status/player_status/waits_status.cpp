
#include "waits_status.h"
#include "../../room_mgr/room_mgr.h"

WaitsStatus::WaitsStatus(int id, int roomId, string uid) : Status(id, roomId) {
	cout << "玩家Waits构造函数" << endl;
	_uid = uid;
}
WaitsStatus::~WaitsStatus() {

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

void WaitsStatus::OnEnter() {

	cout << "玩家: " << _uid << "进入WaitsStatus: " << GetId() << "状态" << endl;

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
void WaitsStatus::check() {

	cout << "玩家闲置" << endl;
	// assert(_room != NULL && _player != NULL);

	// 房间状态
	// Status* status = _room -> GetCurStatus();

}
void WaitsStatus::OnExit() {
	cout << "玩家: " << _uid << "退出WaitsStatus: "<< GetId() << "状态" << endl;
}

Room* WaitsStatus::GetRoom() {
	return _room;
}
Player* WaitsStatus::GetPlayer() {
	return _player;
}






