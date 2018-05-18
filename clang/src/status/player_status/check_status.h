
#ifndef CHECK_STATUS_H
#define CHECK_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;
class Room;
class Player;
class CheckStatus : public Status
{
public:
	CheckStatus(int id, int roomId, string uid);
	virtual ~CheckStatus();

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


