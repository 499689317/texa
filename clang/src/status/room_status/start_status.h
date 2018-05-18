
#ifndef START_STATUS_H
#define START_STATUS_H

#include <iostream>
#include "../status.h"

using namespace std;

class Room;
class StartStatus : public Status
{
public:
	StartStatus(int id, int roomId);
	virtual ~StartStatus();

	virtual void OnEnter();
	virtual void check();
	virtual void OnExit();
private:
	Room* _room = NULL;
};


#endif


