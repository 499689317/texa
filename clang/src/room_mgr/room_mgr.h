
#ifndef ROOM_MGR_H
#define ROOM_MGR_H

#include <map>
#include <vector>
#include <iostream>
#include <string>

#include "../room/room.h"

using namespace std;

/**
 * 这里是这么解决的
 * 因为room_mgr类中大量使用了Room的方法，所以不能简单的前向声明Room，必须要包含room.h头文件
 * 所以只能优先在这里引入room.h头文件，但是由于业务需要，又必须要在Status里引入room_mgr.h头文件，Status头文件又被Room引用了
 * 这时肯定会出现互相引用的问题，解决方法是在Status中前向说明RoomMgr类型，在status.cpp内引入room_mgr.h文件
 * .h文件要记得加上ifndef宏
 */
// class Room;// TODO前向说明一下Room这个类，这里不确定能否引入Room这个类，后面找时间试一下，实在不行试试友元函数

class RoomMgr
{
public:
	
	~RoomMgr();

	void Test();

	// 获取单例
	static RoomMgr* GetInstance();

	// 创建房间
	void CreateRoom(int roomId, bool isNeedRobot);
	// 根据房间id获取房间实例
	Room* GetRoomById(int roomId);
	// 根据玩家id获取所在的房间id
	int GetRoomIdByUid(std::string uid);
	void JoinRobot(Room*);

	int GetRoomId();
	
	std::vector<Room*> GetRooms();
	std::map<std::string, int> GetRoomUser();

	void SetRoomId(int roomId);
	void SetRooms(Room* room);
	// 设置玩家id与房间id的对应关系
	void SetRoomIdByUid(std::string uid, int roomId);
private:
	// 把构造函数设置为私有，不给别人创建实例的机会
	RoomMgr();
	// RoomMgr(const RoomMgr& r);// 拷贝构造与赋值符号的重载也设为私有，防止复制
	// RoomMgr& operator=(const RoomMgr& r);
	static RoomMgr* _roomMgr;

	uv_mutex_t mutex;
	
	int _roomId;
	std::vector<Room*> _rooms;
	std::map<std::string, int> _roomUser;
};


#endif





