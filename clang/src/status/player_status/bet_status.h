
#ifndef BET_STATUS_H
#define BET_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;
class Room;
class Player;
class BetStatus : public Status
{
public:
	BetStatus(int id, int roomId, string uid);
	virtual ~BetStatus();

	Room* GetRoom();
	Player* GetPlayer();

	virtual void OnEnter();
	virtual void check();
	virtual void OnExit();
private:
	string _uid;
	Room* _room = NULL;
	Player* _player = NULL;
};

#endif


