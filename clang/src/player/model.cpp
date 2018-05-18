
#include <string>
using namespace std;
class Model
{
public:
	Model(string u, int s, int c, int r) : uid(u), sid(s), chip(c), roomId(r) {
		// inline
	};
	~Model() {};

	// 数据model成员属性定义为公有
	string uid;
	int sid;
	int chip;
	int roomId;
};


