

#ifndef STOP_STATUS_H
#define STOP_STATUS_H

#include <iostream>
#include "../../../timer/timer.h"
#include "../status.h"

using namespace std;

class Player;
class Room;
class StopStatus : public Status
{
public:
	StopStatus(int id, int roomId);
	virtual ~StopStatus();

	void CheckOver();
	void FilterPlayer();
	void UnlockRoom();
	void ResetRoom();

	virtual void OnEnter();
	virtual void check();
	virtual void OnExit();

	static void check_game(uv_timer_t* t);
private:
	timer_t* _timer = NULL;
	std::vector<Player*> _fp;
	Room* _room = NULL;
};

#endif


