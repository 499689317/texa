
#include "room.h"
#include "../globals.h"

void Room::Test() {

	for (unsigned long i = 0; i < _seats.size(); ++i)
	{
		cout << _seats[i] << endl;
	}
	// 测试卡牌管理器
	cout << "_cardMgr: " << _cardMgr << endl;
	_cardMgr -> Test();

	cout << "_statusMgr: " << _statusMgr << endl;
}

Room::Room(int id) : _id(id) {

	cout << "创建房间默认构造函数" << endl;

	// 初始化房间坐位
	for (int i = 1; i <= 9; ++i)
	{
		_seats.push_back(new Seat(i, "", 0));
	}

	// 初始化卡牌管理器
	_cardMgr = new CardMgr();

	// 初始化状态机管理器
	_statusMgr = new StatusMgr();
	_status_map[Wait] = new WaitStatus(Wait, _id);
	_status_map[Start] = new StartStatus(Start, _id);
	_status_map[Hole] = new HoleStatus(Hole, _id);
	_status_map[Flop] = new FlopStatus(Flop, _id);
	_status_map[Turn] = new TurnStatus(Turn, _id);
	_status_map[River] = new RiverStatus(River, _id);
	_status_map[Stop] = new StopStatus(Stop, _id);

	// 测试函数
	// Test();

}
Room::~Room() {
	cout << "房间析构函数" << endl;
	if (_cardMgr != NULL)
	{
		delete _cardMgr;
		_cardMgr = NULL;
	}
	if (_statusMgr != NULL)
	{
		delete _statusMgr;
		_statusMgr = NULL;
	}
	for (std::vector<Seat*>::iterator iter = _seats.begin(); iter != _seats.end(); iter++)
	{
		if (*iter != NULL)
		{
			delete *iter;
			*iter = NULL;
		}
	}
	_seats.clear();
	for (std::vector<Player*>::iterator iter = _players.begin(); iter != _players.end(); iter++)
	{
		if (*iter != NULL)
		{
			delete *iter;
			*iter = NULL;
		}
	}
	_players.clear();
	for (std::vector<Player*>::iterator iter = _waits.begin(); iter != _waits.end(); iter++)
	{
		if (*iter != NULL)
		{
			delete *iter;
			*iter = NULL;
		}
	}
	_waits.clear();
	for (std::map<int, Status*>::iterator iter = _status_map.begin(); iter != _status_map.end(); iter++)
	{
		if (iter -> second != NULL)
		{
			delete iter -> second;
			iter -> second = NULL;
		}
	}
	_status_map.clear();
}

void Room::Update(int statusId) {
	_statusMgr -> Update(_status_map[statusId]);
}
Status* Room::GetPreStatus() {
	return _statusMgr -> GetPreStatus();
}
Status* Room::GetCurStatus() {
	return _statusMgr -> GetCurStatus();
}

void Room::JoinRoom(string uid, string sid, int roomId, int chip) {

	// assert(uid && sid && roomId && chip);
	
	Player* ptr = new Player(uid, sid, roomId, chip);
	_players.push_back(ptr);
	ptr -> Update(Waits);

}
void Room::SetLock(bool enable) {
	_isLock = enable ? true : false;
}


Player* Room::GetPlayerById(string uid) {
	for (unsigned long i = 0; i < _players.size(); i++)
	{
		if (_players[i] -> GetUid() == uid)
		{
			return _players[i];
		}
	}
	return NULL;
}
Player* Room::GetWaitById(string uid) {
	
	for (unsigned long i = 0; i < _waits.size(); i++)
	{
		if (_waits[i] -> GetUid() == uid)
		{
			return _waits[i];
		}
	}
	return NULL;
}

int Room::GetRoomId() {
	return _id;
}
CardMgr* Room::GetCardMgr() {
	return _cardMgr;
}
vector<Player*>& Room::GetPlayers() {
	return _players;
}

vector<Player*>& Room::GetWaits() {
	return _waits;
}


void Room::HoleCards() {

	int count = 2;
	for (unsigned long i = 0; i < _players.size(); ++i)
	{
		// int uid = _players[i] -> GetUid();
		// int sid = _players[i] -> GetSid();
		// 没有位置的玩家不发底牌
		std::vector<Card*> v = _cardMgr -> ProvideCards(count);
		_players[i] -> SetPlayerCards(v);
		// 发到各玩家手里
		_cardMgr -> Print(v);
	}
}
void Room::FlopCards() {

	int count = 3;
	std::vector<Card*> v = _cardMgr -> ProvideCards(count);
	for (unsigned long i = 0; i < _players.size(); ++i)
	{
		_players[i] -> SetPlayerCards(v);
	}
	// 广播所有玩家
	_cardMgr -> Print(v);
}
void Room::TurnCards() {

	int count = 1;
	std::vector<Card*> v = _cardMgr -> ProvideCards(count);
	for (unsigned long i = 0; i < _players.size(); ++i)
	{
		_players[i] -> SetPlayerCards(v);
	}
	// 广播所有玩家
	_cardMgr -> Print(v);
}
void Room::RiverCards() {

	int count = 1;
	std::vector<Card*> v = _cardMgr -> ProvideCards(count);
	for (unsigned long i = 0; i < _players.size(); ++i)
	{
		_players[i] -> SetPlayerCards(v);
	}
	// 广播所有玩家
	_cardMgr -> Print(v);
}

void Room::ResetRoom() {

	// 析构掉本局的牌堆
	_cardMgr -> ClearCards();

	for (unsigned long i = 0; i < _players.size(); ++i)
	{
		_players[i] -> clearCards();
		_players[i] -> clearTalks();
		_players[i] -> clearChips();
		_players[i] -> Update(Waits);
	}
}







