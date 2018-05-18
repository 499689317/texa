
#ifndef RAISE_STATUS_H
#define RAISE_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;
class Room;
class Player;
class RaiseStatus : public Status
{
public:
	RaiseStatus(int id, int roomId, string uid);
	virtual ~RaiseStatus();

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


