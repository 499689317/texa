
#include "wait_status.h"
// #include "../../room/room.h"
#include "../../room_mgr/room_mgr.h"

WaitStatus::WaitStatus(int id, int roomId) : Status(id, roomId) {
	cout << "WaitStatus构造函数" << endl;
}
WaitStatus::~WaitStatus() {

	if (_room != NULL)
	{
		delete _room;
		_room = NULL;
	}
}

bool WaitStatus::IsEnoughPlayer(int num) {
	return num >= 2;
}
bool WaitStatus::IsReadySeat(int num) {
	return true;
}
void WaitStatus::FilterPlayer() {

	_fp.clear();
	for (unsigned long i = 0; i < _room -> GetPlayers().size(); ++i) {

		int id = _room -> GetPlayers()[i] -> GetCurStatus() -> GetId();
		if (Waits == id)
		{
			_fp.push_back(_room -> GetPlayers()[i]);
		}
	}
}
void WaitStatus::LockRoom() {
	_room -> SetLock(true);
}

void WaitStatus::OnEnter() {
	cout << "房间: " << GetRoomId() << "进入WaitStatus: " << GetId() << "状态" << endl;

	if (_room == NULL)
	{
		_room = RoomMgr::GetInstance() -> GetRoomById(GetRoomId());
	}
	if (_timer == NULL)
	{
		_timer = Ttimer -> setInterval(check_game, 2000);
		_timer -> timer.data = this;
	}
	// check();
}

void WaitStatus::check_game(uv_timer_t* t) {

	WaitStatus* status = (WaitStatus*)t -> data;

	cout << "房间: "<< status -> GetRoomId() << "WaitStatus check" << endl;

	printf("当前房间总数%lu\n", RoomMgr::GetInstance() -> GetRooms().size());
	printf("当前房间人数%lu\n", status -> _room -> GetPlayers().size());

	// 筛选玩家
	status -> FilterPlayer();
	int num = status -> _fp.size();
	printf("筛选出玩家数：%d\n", num);
	if (status -> IsEnoughPlayer(num) && status -> IsReadySeat(num))
	{
		status -> _room -> Update(Start);
		return;
	}
}
void WaitStatus::check() {

	cout << "房间: "<< GetRoomId() << "WaitStatus check" << endl;

	// 这里模拟一个定时检测的功能，每2秒钟检测一次
	// sleep居然会阻塞后面的代码？
	sleep(2);

	assert(_room != NULL);

	printf("当前房间总数%lu\n", RoomMgr::GetInstance() -> GetRooms().size());
	printf("当前房间人数%lu\n", _room -> GetPlayers().size());

	// 筛选玩家
	FilterPlayer();
	int num = _fp.size();
	printf("筛选出玩家数：%d\n", num);
	if (IsEnoughPlayer(num) && IsReadySeat(num))
	{
		_room -> Update(Start);
		return;
	}
	// 继续轮询
	check();
}
void WaitStatus::OnExit() {
	cout << "房间: " << GetRoomId() << "退出WaitStatus: "<< GetId() << "状态" << endl;
	LockRoom();
	_fp.clear();
	if (_timer != NULL)
	{
		Ttimer -> clearInterval(_timer);
		_timer = NULL;
	}
}

Room* WaitStatus::GetRoom() {
	return _room;
}



