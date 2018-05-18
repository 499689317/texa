
#ifndef WAIT_STATUS_H
#define WAIT_STATUS_H

#include <iostream>
// #define NDEBUG
// #include <assert.h>
#include "../../../timer/timer.h"
#include "../status.h"

using namespace std;

class Player;
class Room;
class WaitStatus : public Status
{
public:
	WaitStatus(int id, int roomId);
	virtual ~WaitStatus();

	Room* GetRoom();
	// 开局人数条件
	bool IsEnoughPlayer(int num);
	// 开局坐位是否分配完
	bool IsReadySeat(int num);
	// 过滤玩家
	void FilterPlayer();
	// 锁住房间
	void LockRoom();

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


