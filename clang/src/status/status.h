
#ifndef STATUS_H
#define STATUS_H

#include <iostream>
#include <string>
#include <vector>
// #define NDEBUG
#include <assert.h>
#include <unistd.h>
#include "../globals.h"

using namespace std;

// class Room;
// class RoomMgr;
class Status
{
public:
	Status(int id, int roomId);
	virtual ~Status();// 多态情况下析构也得虚

	int GetId();
	int GetRoomId();

	// Room* GetRoom();
	// RoomMgr* GetRoomMgr();// TODO 这个地方有点奇怪

	// 虚函数方法---考虑Status作为一个纯虚基类
	virtual void OnEnter() = 0;
	virtual void check() = 0;// check方法设计成纯虚函数主要是为了兼容对状态机的传参
	virtual void OnExit() = 0;
private:
	int _id;
	int _roomId;// 房间id
	// Room* _room = NULL;// 最后一招了
	// RoomMgr* _roomMgr = NULL;// 房间管理实例，保险起见初始化一下
};

#endif



