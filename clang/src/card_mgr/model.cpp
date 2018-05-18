
#include <vector>
#include <string>

class Card;
class Model
{
public:
	Model() {};
	~Model() {
		printf("Model析构函数调用\n");
		type = 0;
		uid = "";
		// 这里有公共牌，如何去做好析构呢
		// 手牌不能在这析构
		// for (unsigned long i = 0; i < cards.size(); ++i)
		// {
		// 	delete cards[i];
		// 	cards[i] = NULL;
		// }
		cards.clear();
	};

	int type;
	std::string uid;
	std::vector<Card*> cards;
};



