

#ifndef PLAYER_H
#define PLAYER_H

#include <map>
#include <vector>
#include <string>

#include "../status/status_mgr.h"
#include "../status/player_status/allin_status.h"
#include "../status/player_status/bet_status.h"
#include "../status/player_status/call_status.h"
#include "../status/player_status/check_status.h"
#include "../status/player_status/fold_status.h"
#include "../status/player_status/raise_status.h"
#include "../status/player_status/waits_status.h"

using namespace std;

class Card;
class Player
{
public:
	Player(string uid, string sid, int roomId, int chip);
	~Player();

	void Test();

	void Update(int statusId);
	Status* GetPreStatus();
	Status* GetCurStatus();

	string GetUid();
	string GetSid();
	int GetRoomId();
	int GetChip();

	int GetPlayerChip(int roomStatus);
	int GetPlayerTalk(int roomStatus);
	std::vector<Card*> GetPlayerCards();

	void SetPlayerCards(std::vector<Card*> v);
	void SetPlayerTalks(int roomStatus, int playerStatus);
	void SetPlayerChips(int roomStatus, int chip);
	
	void clearCards();
	void clearTalks();
	void clearChips();
private:
	string _uid;
	string _sid;
	int _roomId;
	int _chip;
	StatusMgr* _statusMgr = NULL;
	
	vector<Card*> _cards;
	map<int, int> _talks;
	map<int, int> _chips;
	map<int, Status*> _status_map;
};

#endif



