
#include "start_status.h"
#include "../../room_mgr/room_mgr.h"

StartStatus::StartStatus(int id, int roomId) : Status(id, roomId) {
	cout << "StartStatus构造函数" << endl;
}
StartStatus::~StartStatus() {

}

void StartStatus::OnEnter() {
	cout << "房间: " << GetRoomId() << "进入StartStatus: " << GetId() << "状态" << endl;

	if (_room == NULL)
	{
		_room = RoomMgr::GetInstance() -> GetRoomById(GetRoomId());
	}
	check();
}
void StartStatus::check() {
	cout << "房间: " << GetRoomId() << "StartStatus check" << endl;

	_room -> GetCardMgr() -> Init();
	_room -> GetCardMgr() -> ShuffleCards();

	_room -> Update(Hole);
}
void StartStatus::OnExit() {
	cout << "房间: " << GetRoomId() << "退出StartStatus: " << GetId() << "状态" << endl;
}




