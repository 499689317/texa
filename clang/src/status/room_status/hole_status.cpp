
#include "hole_status.h"
#include "../../room_mgr/room_mgr.h"

HoleStatus::HoleStatus(int id, int roomId) : Status(id, roomId) {
	cout << "HoleStatus构造函数" << endl;
}
HoleStatus::~HoleStatus() {
	_fp.clear();
	_fpna.clear();
}

void HoleStatus::CheckOver() {

	sleep(1);

	FilterPlayer();
	printf("有%lu个玩家还在底牌圈游戏\n", _fp.size());
	if (IsOver(_fp))
	{
		_room -> Update(Stop);
		return;
	}
	FilterPlayerNotAllin(_fp);
	printf("底牌圈%lu个玩家除去allin玩家数%lu\n", _fp.size(), _fpna.size());
	if (!IsAllTalk(_fpna))
	{
		printf("继续轮询\n");
		return;
	}
	_room -> Update(Flop);
}

void HoleStatus::check_game(uv_timer_t* t) {

	HoleStatus* status = (HoleStatus*)t -> data;

	status -> FilterPlayer();
	printf("有%lu个玩家还在底牌圈游戏\n", status -> _fp.size());
	if (status -> IsOver(status -> _fp))
	{
		status -> _room -> Update(Stop);
		return;
	}
	status -> FilterPlayerNotAllin(status -> _fp);
	printf("底牌圈%lu个玩家除去allin玩家数%lu\n", status -> _fp.size(), status -> _fpna.size());
	if (!status -> IsAllTalk(status -> _fpna))
	{
		printf("继续轮询\n");
		// return;
	}
	status -> _room -> Update(Flop);
}
bool HoleStatus::IsOver(std::vector<Player*> v) {
	if (v.size() == 1)
	{
		return true;
	}
	else if (IsAllAllin(v))
	{
		return true;
	}
	return false;
}
void HoleStatus::FilterPlayer() {

	_fp.clear();
	for (unsigned long i = 0; i < _room -> GetPlayers().size(); ++i) {

		int holeTalk = _room -> GetPlayers()[i] -> GetPlayerTalk(GetId());
		if (holeTalk == Fold)
		{
			continue;
		}
		_fp.push_back(_room -> GetPlayers()[i]);
	}
}
void HoleStatus::FilterPlayerNotAllin(std::vector<Player*> v) {

	_fpna.clear();
	for (unsigned long i = 0; i < v.size(); ++i) {

		int talk = v[i] -> GetPlayerTalk(GetId());
		// printf("talk: %d\n", talk);
		// printf("allin: %d\n", Allin);
		if (Allin == talk)
		{
			continue;
		}
		_fpna.push_back(v[i]);
	}
}
int HoleStatus::GetTalkCount(std::vector<Player*> v) {
	int count = 0;
	for (unsigned long i = 0; i < v.size(); ++i) {

		int talk = v[i] -> GetPlayerTalk(GetId());
		if (talk)
		{
			count++;
		}
	}
	return count;
}
int HoleStatus::GetAllinCount(std::vector<Player*> v) {
	int count = 0;
	for (unsigned long i = 0; i < v.size(); ++i) {

		int talk = v[i] -> GetPlayerTalk(GetId());
		if (Allin == talk)
		{
			count++;
		}
	}
	return count;
}

bool HoleStatus::IsAllTalk(std::vector<Player*> v) {
	return GetTalkCount(v) >= (int)v.size();
}
bool HoleStatus::IsAllAllin(std::vector<Player*> v) {
	return GetAllinCount(v) >= (int)(v.size() - 1);
}

void HoleStatus::SetTalkId(int id) {
	_talkId = id;
}
int HoleStatus::GetTalkId() {
	return _talkId;
}

void HoleStatus::OnEnter() {
	cout << "房间: " << GetRoomId() << "进入HoleStatus: " << GetId() << "状态" << endl;

	if (_room == NULL)
	{
		_room = RoomMgr::GetInstance() -> GetRoomById(GetRoomId());
	}
	check();
}
void HoleStatus::check() {
	cout << "房间: " << GetRoomId() << "HoleStatus check" << endl;

	_room -> HoleCards();

	if (_timer == NULL)
	{
		_timer = Ttimer -> setInterval(check_game, 2000);
		_timer -> timer.data = this;
	}
	// CheckOver();
}
void HoleStatus::OnExit() {
	cout << "房间: " << GetRoomId() << "退出HoleStatus: " << GetId() << "状态" << endl;
	_talkId = 0;
	_fp.clear();
	_fpna.clear();
	if (_timer != NULL)
	{
		Ttimer -> clearInterval(_timer);
		_timer = NULL;
	}
}




