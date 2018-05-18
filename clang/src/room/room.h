
#ifndef ROOM_H
#define ROOM_H

#include <map>
#include <vector>
#include <iostream>
#include <string>

#include "uv.h"

// #define NDEBUG
#include "assert.h"

#include "seat.h"
#include "../player/player.h"
#include "../card_mgr/card_mgr.h"
#include "../status/status_mgr.h"
#include "../status/room_status/wait_status.h"
#include "../status/room_status/start_status.h"
#include "../status/room_status/hole_status.h"
#include "../status/room_status/flop_status.h"
#include "../status/room_status/turn_status.h"
#include "../status/room_status/river_status.h"
#include "../status/room_status/stop_status.h"

// 房间广播消息是依赖nodejs来做还是c++来做，这里需要时间来做一下，开始慢慢遇到核心问题了

using namespace std;

class Room
{
public:
	Room(int id);
	~Room();

	void Test();

	void Update(int statusId);
	Status* GetPreStatus();
	Status* GetCurStatus();

	void JoinRoom(string uid, string sid, int roomId, int chip);
	void SetLock(bool enable);

	Player* GetPlayerById(string);// 玩家id为string类型
	Player* GetWaitById(string);

	int GetRoomId();
	vector<Player*>& GetPlayers();
	vector<Player*>& GetWaits();

	CardMgr* GetCardMgr();

	// 底牌圈
	void HoleCards();
	// 翻牌圈
	void FlopCards();
	// 转牌圈
	void TurnCards();
	// 河牌圈
	void RiverCards();

	void ResetRoom();
private:
	int _id;// 房间id
	bool _isLock = false;
	CardMgr* _cardMgr = NULL;
	StatusMgr* _statusMgr = NULL;

	vector<Seat*> _seats;
	vector<Player*> _players;
	vector<Player*> _waits;
	std::map<int, Status*> _status_map;
};

#endif

