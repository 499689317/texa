
#ifndef CALL_STATUS_H
#define CALL_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;
class Room;
class Player;
class CallStatus : public Status
{
public:
	CallStatus(int id, int roomId, string uid);
	virtual ~CallStatus();

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


