
#include "status.h"
// #include "../room/room.h"
// #include "../room_mgr/room_mgr.h"

Status::Status(int id, int roomId) : _id(id), _roomId(roomId) {
	// printf("Status纯虚基类构造函数\n");
	// _roomMgr = RoomMgr::GetInstance();
}
Status::~Status(){
	// if (_room)
	// {
	// 	delete _room;
	// 	_room = NULL;
	// }
}

int Status::GetId() {
	return _id;
}
int Status::GetRoomId() {
	return _roomId;
}
// Room* Status::GetRoom() {
// 	// return RoomMgr::GetInstance() -> GetRoomById(_roomId);
// 	return _room;
// }

// RoomMgr* Status::GetRoomMgr() {
// 	return _roomMgr;
// }

