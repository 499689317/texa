
#include "stop_status.h"
#include "../../room_mgr/room_mgr.h"

StopStatus::StopStatus(int id, int roomId) : Status(id, roomId) {
	cout << "StopStatus构造函数" << endl;
}
StopStatus::~StopStatus() {
	_fp.clear();
}

void StopStatus::CheckOver() {

	sleep(2);
	_room -> Update(Wait);
}

void StopStatus::check_game(uv_timer_t* t) {

	StopStatus* status = (StopStatus*)t -> data;
	status -> _room -> Update(Wait);
}
void StopStatus::FilterPlayer() {

	_fp.clear();
	for (unsigned long i = 0; i < _room -> GetPlayers().size(); ++i) {

		int holeTalk = _room -> GetPlayers()[i] -> GetPlayerTalk(Hole);
		int flopTalk = _room -> GetPlayers()[i] -> GetPlayerTalk(Flop);
		int turnTalk = _room -> GetPlayers()[i] -> GetPlayerTalk(Turn);
		int riverTalk = _room -> GetPlayers()[i] -> GetPlayerTalk(GetId());
		if (holeTalk == Fold || flopTalk == Fold || turnTalk == Fold || riverTalk == Fold)
		{
			continue;
		}
		_fp.push_back(_room -> GetPlayers()[i]);
	}
}
void StopStatus::UnlockRoom() {
	_room -> SetLock(false);
}
void StopStatus::ResetRoom() {
	_room -> ResetRoom();
}

void StopStatus::OnEnter() {
	cout << "房间: " << GetRoomId() << "进入StopStatus: " << GetId() << "状态" << endl;

	if (_room == NULL)
	{
		_room = RoomMgr::GetInstance() -> GetRoomById(GetRoomId());
	}
	check();
}
void StopStatus::check() {
	cout << "房间: " << GetRoomId() << "StopStatus check" << endl;

	// for (unsigned long i = 0; i < _room -> GetPlayers().size(); ++i)
	// {
	// 	std::vector<Card*> v = _room -> GetPlayers()[i] -> GetPlayerCards();
	// 	cout << "玩家排序前" << (_room -> GetPlayers()[i] -> GetUid()) << "手牌：" << endl;
	// 	for (unsigned long j = 0; j < v.size(); ++j)
	// 	{
	// 		v[j] -> Print();
	// 	}
	// 	cout << "玩家排序后" << (_room -> GetPlayers()[i] -> GetUid()) << "手牌：" << endl;
	// 	_room -> GetCardMgr() -> SortCards(v);
	// 	for (unsigned long n = 0; n < v.size(); ++n)
	// 	{
	// 		v[n] -> Print();
	// 	}
	// }
	
	// Status* status = _room.GetPreStatus();
	FilterPlayer();
	printf("结算玩家人数：%lu\n", _fp.size());
	if (_fp.empty())
	{
		printf("没有结算玩家\n");
		return;
	}
	
	if (_fp.size() == 1)
	{
		printf("玩家偷鸡获得最终胜利\n");
	}
	else
	{
		std::map<int, string> typemap;
		typemap[1] = "高牌";
		typemap[2] = "一对";
		typemap[3] = "两对";
		typemap[4] = "三条";
		typemap[5] = "顺子";
		typemap[6] = "同花";
		typemap[7] = "葫芦";
		typemap[8] = "四条";
		typemap[9] = "同花顺";
		typemap[10] = "皇家同花顺";
		
		int type = 0;
		// std::vector<types_info*> tv1;
		// std::vector<types_info*> tv2;
		std::vector<Model*> tv1;
		std::vector<Model*> tv2;

		for (unsigned long i = 0; i < _fp.size(); ++i)
		{
			string uid = _fp[i] -> GetUid();
			std::vector<Card*> v = _fp[i] -> GetPlayerCards();

			// types_info* ptr = _room -> GetCardMgr() -> CheckCardsType(v);
			
			Model* ptr = _room -> GetCardMgr() -> CheckCardsType(v);
			// printf("xxxxxxxxxxxxxxxxxxxxxxx %p\n", ptr);
			
			ptr -> uid = uid;
			tv1.push_back(ptr);

			if (type < ptr -> type)
			{
				type = ptr -> type;
			}
		}

		printf("当前最大牌型是”%s“\n", typemap[type].c_str());

		for (unsigned long i = 0; i < tv1.size(); ++i)
		{
			printf("玩家”%s”牌型为“%s”\n", (tv1[i] -> uid).c_str(), typemap[tv1[i] -> type].c_str());
			_room -> GetCardMgr() -> Print(tv1[i] -> cards);
			if (tv1[i] -> type == type)
			{
				tv2.push_back(tv1[i]);
			}
		}


		if (tv2.size() == 1)
		{
			printf("玩家“%s”使用“%s”获得最终胜利\n", (tv2[0] -> uid).c_str(), typemap[tv2[0] -> type].c_str());
		}
		else
		{
			printf("继续比较\n");
			std::vector<Model*> winner = _room -> GetCardMgr() -> CommpareHighCard(tv2);
			if (winner.size() == 1)
			{
				printf("玩家“%s”使用“%s”获得最终胜利\n", (winner[0] -> uid).c_str(), typemap[winner[0] -> type].c_str());
			}
			else
			{
				for (unsigned long i = 0; i < winner.size(); ++i)
				{
					printf("玩家“%s”使用“%s”获得最终胜利\n", (winner[i] -> uid).c_str(), typemap[winner[i] -> type].c_str());
				}
			}
		}
	}

	if (_timer == NULL)
	{
		_timer = Ttimer -> setInterval(check_game, 2000);
		_timer -> timer.data = this;
	}
	// CheckOver();
}
void StopStatus::OnExit() {
	cout << "房间: " << GetRoomId() << "退出StopStatus: " << GetId() << "状态" << endl;
	_fp.clear();
	if (_timer != NULL)
	{
		Ttimer -> clearInterval(_timer);
		_timer = NULL;
	}
	ResetRoom();
	UnlockRoom();
}




