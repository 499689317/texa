
#ifndef ALLIN_STATUS_H
#define ALLIN_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;
class Room;
class Player;
class AllinStatus : public Status
{
public:
	AllinStatus(int id, int roomId, string uid);
	virtual ~AllinStatus();

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


