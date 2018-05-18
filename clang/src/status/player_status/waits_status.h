
#ifndef WAITS_STATUS_H
#define WAITS_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;
class Room;
class Player;
class WaitsStatus : public Status
{
public:
	WaitsStatus(int id, int roomId, string uid);
	virtual ~WaitsStatus();

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


