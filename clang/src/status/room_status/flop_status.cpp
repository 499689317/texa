
#include "flop_status.h"
#include "../../room_mgr/room_mgr.h"

FlopStatus::FlopStatus(int id, int roomId) : Status(id, roomId) {
	cout << "FlopStatus构造函数" << endl;
}
FlopStatus::~FlopStatus() {
	_fp.clear();
	_fpna.clear();
}

void FlopStatus::CheckOver() {

	sleep(1);

	FilterPlayer();
	printf("有%lu个玩家还在翻牌圈游戏\n", _fp.size());
	if (IsOver(_fp))
	{
		_room -> Update(Stop);
		return;
	}
	FilterPlayerNotAllin(_fp);
	printf("翻牌圈%lu个玩家除去allin玩家数%lu\n", _fp.size(), _fpna.size());
	if (!IsAllTalk(_fpna))
	{
		printf("继续轮询\n");
		return;
	}
	_room -> Update(Turn);
}

void FlopStatus::check_game(uv_timer_t* t) {

	FlopStatus* status = (FlopStatus*)t -> data;

	status -> FilterPlayer();
	printf("有%lu个玩家还在翻牌圈游戏\n", status -> _fp.size());
	if (status -> IsOver(status -> _fp))
	{
		status -> _room -> Update(Stop);
		return;
	}
	status -> FilterPlayerNotAllin(status -> _fp);
	printf("翻牌圈%lu个玩家除去allin玩家数%lu\n", status -> _fp.size(), status -> _fpna.size());
	if (!status -> IsAllTalk(status -> _fpna))
	{
		printf("继续轮询\n");
		// return;
	}
	status -> _room -> Update(Turn);
}
bool FlopStatus::IsOver(std::vector<Player*> v) {
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
void FlopStatus::FilterPlayer() {

	_fp.clear();
	for (unsigned long i = 0; i < _room -> GetPlayers().size(); ++i) {

		int holeTalk = _room -> GetPlayers()[i] -> GetPlayerTalk(Hole);
		int flopTalk = _room -> GetPlayers()[i] -> GetPlayerTalk(GetId());
		if (holeTalk == Fold || flopTalk == Fold)
		{
			continue;
		}
		_fp.push_back(_room -> GetPlayers()[i]);
	}
}
void FlopStatus::FilterPlayerNotAllin(std::vector<Player*> v) {

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
int FlopStatus::GetTalkCount(std::vector<Player*> v) {
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
int FlopStatus::GetAllinCount(std::vector<Player*> v) {
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

bool FlopStatus::IsAllTalk(std::vector<Player*> v) {
	return GetTalkCount(v) >= (int)v.size();
}
bool FlopStatus::IsAllAllin(std::vector<Player*> v) {
	return GetAllinCount(v) >= (int)(v.size() - 1);
}

void FlopStatus::SetTalkId(int id) {
	_talkId = id;
}
int FlopStatus::GetTalkId() {
	return _talkId;
}

void FlopStatus::OnEnter() {
	cout << "房间: " << GetRoomId() << "进入FlopStatus: " << GetId() << "状态" << endl;

	if (_room == NULL)
	{
		_room = RoomMgr::GetInstance() -> GetRoomById(GetRoomId());
	}
	check();
}
void FlopStatus::check() {
	cout << "房间: " << GetRoomId() << "FlopStatus check" << endl;

	_room -> FlopCards();
	if (_timer == NULL)
	{
		_timer = Ttimer -> setInterval(check_game, 2000);
		_timer -> timer.data = this;
	}
	// CheckOver();
}
void FlopStatus::OnExit() {
	cout << "房间: " << GetRoomId() << "退出FlopStatus: " << GetId() << "状态" << endl;
	_talkId = 0;
	_fp.clear();
	_fpna.clear();
	if (_timer != NULL)
	{
		Ttimer -> clearInterval(_timer);
		_timer = NULL;
	}
}




