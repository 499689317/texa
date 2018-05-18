
#include "room_mgr.h"
#include "../globals.h"
// 饿汉式单例: 主线程完成初始化单例，不用加锁
RoomMgr* RoomMgr::_roomMgr = new RoomMgr();
// 懒汉式单例: 多线程下要加锁
// RoomMgr* RoomMgr::_roomMgr = NULL;

void RoomMgr::Test() {

	Room* room = GetRoomById(_roomId);
	room -> Update(Start);
	room -> Update(Hole);
	room -> Update(Flop);
	room -> Update(Turn);
	room -> Update(River);
	room -> Update(Stop);
}

RoomMgr::RoomMgr() : _roomId(1) {
	cout << "RoomMgr构造函数" << endl;
	int flag = uv_mutex_init(&mutex);
	if (flag)
	{
		printf("线程锁初始化失败RoomMgr()\n");
	}
}
RoomMgr::~RoomMgr() {
	// 销毁vector内的指针所指的内存
}

RoomMgr* RoomMgr::GetInstance() {
	// 这里要确保是线程安全的
	if (_roomMgr == NULL)// 单线程下是没有问题的
	{
		_roomMgr = new RoomMgr();
	}
	return _roomMgr;
}

void RoomMgr::CreateRoom(int roomId, bool isNeedRobot) {
	
	assert(roomId);
	uv_mutex_lock(&mutex);
	Room* room = GetRoomById(roomId);
	if (room == NULL)
	{
		room = new Room(roomId);
		SetRooms(room);
	}
	
	// TODO
	// Test();
	cout << "加入机器人一起游戏：" << isNeedRobot << endl;
	if (isNeedRobot)
	{
		/* 加入一些测试用的机器人 */
		JoinRobot(room);
	}
	uv_mutex_unlock(&mutex);
	room -> Update(Wait);
	
}

void RoomMgr::JoinRobot(Room* room) {

	string uids[] = {"101", "102", "103", "104", "105", "106", "107", "108"};

	string sid = "connector";
	int chip = 1000;

	for (int i = 0; i < 8; ++i)
	{
		// printf("%s\n", uids[i].c_str());
		room -> JoinRoom(uids[i], sid, _roomId, chip);
	}
}

Room* RoomMgr::GetRoomById(int roomId) {

	for (unsigned long i = 0; i < _rooms.size(); ++i) {

		int id = _rooms[i] -> GetRoomId();
		// cout << "id: " << id << endl;
		// cout << "roomId: " << roomId << endl;
		if (roomId == id)
		{
			return _rooms[i];
		}
	}
	return NULL;
}

int RoomMgr::GetRoomIdByUid(std::string uid) {
	for (std::map<string, int>::iterator iter = _roomUser.begin(); iter != _roomUser.end(); iter++)
	{
		if (uid == iter -> first && iter -> second)
		{
			return iter -> second;
		}
	}
	return 0;
}
void RoomMgr::SetRoomIdByUid(std::string uid, int roomId) {
	_roomUser[uid] = roomId;
}

int RoomMgr::GetRoomId() {
	return _roomId;
}
std::vector<Room*> RoomMgr::GetRooms() {
	return _rooms;
}
std::map<std::string, int> RoomMgr::GetRoomUser() {
	return _roomUser;
}
void RoomMgr::SetRoomId(int roomId) {
	_roomId = roomId;
}
void RoomMgr::SetRooms(Room* room) {
	_rooms.push_back(room);
}














