
#include <string>
using namespace std;
// 房间的坐位
class Seat
{
public:
	Seat(int id, string uid, int flag);
	~Seat();

	int GetId();
	string GetUid();
	int GetFlag();
private:
	int _id;
	string _uid;
	int _flag;
};




