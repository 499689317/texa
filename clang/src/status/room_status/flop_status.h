

#ifndef FLOP_STATUS_H
#define FLOP_STATUS_H

#include <iostream>
#include "../../../timer/timer.h"
#include "../status.h"

using namespace std;

class Player;
class Room;
class FlopStatus : public Status
{
public:
	FlopStatus(int id, int roomId);
	virtual ~FlopStatus();

	void CheckOver();
	bool IsOver(std::vector<Player*> v);
	void FilterPlayer();
	void FilterPlayerNotAllin(std::vector<Player*> v);
	int GetTalkCount(std::vector<Player*> v);
	int GetAllinCount(std::vector<Player*> v);
	bool IsAllTalk(std::vector<Player*> v);
	bool IsAllAllin(std::vector<Player*> v);

	void SetTalkId(int id);
	int GetTalkId();

	virtual void OnEnter();
	virtual void check();
	virtual void OnExit();

	static void check_game(uv_timer_t* t);
private:
	timer_t* _timer = NULL;
	int _talkId;
	std::vector<Player*> _fp;
	std::vector<Player*> _fpna;
	Room* _room = NULL;
};


#endif


