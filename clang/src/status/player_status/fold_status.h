
#ifndef FOLD_STATUS_H
#define FOLD_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;
class Room;
class Player;
class FoldStatus : public Status
{
public:
	FoldStatus(int id, int roomId, string uid);
	virtual ~FoldStatus();

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


