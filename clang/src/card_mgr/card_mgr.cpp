
#include "card_mgr.h"
#include "../globals.h"
// #include <ctime>

void CardMgr::Test() {

	Init();
	ShuffleCards();
	vector<Card*> v = ProvideCards(3);
	cout << "取牌后牌" << endl;
	Print(v);
	cout << "取牌后剩余牌数：" << GetCards().size() << endl;
}
void CardMgr::Print(vector<Card*> v) {
	// 无符号长整形
	for (unsigned long i = 0; i < v.size(); ++i) {
		v[i] -> Print();
	}
}

CardMgr::CardMgr() {
	// 默认构造
}
CardMgr::~CardMgr() {
	ClearCards();
}

void CardMgr::SetCards(Card* card) {
	_cards.push_back(card);
}
vector<Card*> CardMgr::GetCards() {
	return _cards;
}

void CardMgr::Init() {
	
	_cards.clear();
	for (int i = 1; i < 5; i++) {
		for (int j = 2; j < 15; ++j) {

			Card* card = new Card(i, j);
			SetCards(card);
		}
	}
	
	// iterator
	// vector<Card*>::iterator iter;
	// for (iter = _cards.begin(); iter < _cards.end(); iter++) {
	// 	cout << "_cards: " << *iter << endl;
	// }
	// Print(_cards);
}

void CardMgr::ClearCards() {
	printf("_cards.size(): %lu\n", _cards.size());
	printf("_provide_cards.size(): %lu\n", _provide_cards.size());
	for (vector<Card*>::iterator iter = _cards.begin(); iter < _cards.end(); iter++)
	{
		if (*iter != NULL)
		{
			delete *iter;
			*iter = NULL;
		}
	}
	_cards.clear();
	for (vector<Card*>::iterator iter = _provide_cards.begin(); iter < _provide_cards.end(); iter++)
	{
		if (*iter != NULL)
		{
			delete *iter;
			*iter = NULL;
		}
	}
	_provide_cards.clear();
}

void CardMgr::ShuffleCards() {

	// 判断是否为空
	if (_cards.empty()) {
		cout << "没有卡牌" << endl;
		return;
	}

	cout << "当前牌堆卡牌数：" << _cards.size() << endl;
	srand((unsigned)time(NULL));// 生成一个随机数种子
	// 交换1000次
	for (int i = 0; i < 1000; ++i) {
		ExchangeCards();
	}
	// Print(_cards);
}

void CardMgr::ExchangeCards() {

	int random1 = 0, random2 = 0;
	do {
		// TODO
		random1 = GetRandom();
		random2 = GetRandom();
	} while(random1 == random2);
	if (!_cards[random1] || !_cards[random2]) {
		// printf("随机取牌出错了");
		// printf("%d\n", random1);
		// printf("%d\n", random2);
		return;
	}
	// printf("random1: %d\n", random1);
	// printf("random2: %d\n", random2);
	// 交换卡牌指针
	Card* ptr = _cards[random1];
	_cards[random1] = _cards[random2];
	_cards[random2] = ptr;
}
int CardMgr::GetRandom() {
	return rand() % _cards.size();
}

// 取牌
vector<Card*> CardMgr::ProvideCards(int count) {

	if (!count) {
		printf("参数count有问题");
		count = 1;
	}
	// 在_cards中取count个元素给一个新的vector对象
	vector<Card*> v(_cards.begin(), _cards.begin() + count);

	// 发出去的牌保存一份，assign方法不会在原来基础上追加，而是覆盖原来数据，弃用
	// _provide_cards.assign(_cards.begin(), _cards.begin() + count);
	for (unsigned long i = 0; i < v.size(); ++i)
	{
		_provide_cards.push_back(v[i]);
	}

	// 然后将_cards中第1到count个元素删除
	_cards.erase(_cards.begin(), _cards.begin() + count);
	// 这里返回的是vector对象，vector肯定是实现了拷贝构造函数的
	return v;
}


/**
 * 德州扑克的一些牌型
 */
std::vector<Card*> CardMgr::IsRoyalFlush(std::vector<Card*>& v) {
	// printf("IsRoyalFlush：%lu\n", v.size());
	std::vector<Card*> vv(0);// 初始化一个初始大小为0的向量
	std::vector<Card*> tv = IsStraightFlush(v);

	if (tv.empty())
	{
		return vv;
	}
	if (tv[0] -> GetKind() == 14)
	{
		vv = tv;
	}
	return vv;
}
std::vector<Card*> CardMgr::IsStraightFlush(std::vector<Card*>& v) {
	// printf("IsStraightFlush: %lu\n", v.size());
	std::vector<Card*> vv(0);
	std::vector<Card*> tv = IsFlush(v);
	if (tv.empty())
	{
		return vv;
	}

	vv = IsStraight(tv);

	return vv;
}
std::vector<Card*> CardMgr::IsFourOfAkind(std::vector<Card*>& v) {
	// printf("IsFourOfAkind: %lu\n", v.size());
	std::vector<Card*> vv(0);
	for (unsigned long i = 0; i < v.size() - 3; ++i)
	{
		int kind = v[i] -> GetKind();
		if (kind == v[i + 1] -> GetKind() && kind == v[i + 2] -> GetKind() && kind == v[i + 3] -> GetKind())
		{
			std::vector<Card*> tv;
			for (unsigned long j = 0; j < v.size(); ++j)
			{
				if (v[j] -> GetKind() == v[i] -> GetKind())
				{
					continue;
				}
				tv.push_back(v[j]);
			}
			vv.insert(vv.begin(), v.begin(), v.begin() + 4);
			vv.push_back(tv[0]);
		}
	}
	return vv;
}
std::vector<Card*> CardMgr::IsFullHoush(std::vector<Card*>& v) {
	// printf("IsFullHoush: %lu\n", v.size());
	std::vector<Card*> vv = IsThreeOfAkind(v, true);
	if (vv.empty())
	{
		return vv;
	}
	for (unsigned long i = 0; i < v.size() - 1; ++i)
	{
		if (vv[0] -> GetKind() != v[i] -> GetKind() && v[i] -> GetKind() == v[i + 1] -> GetKind())
		{
			vv.insert(vv.begin() + 3, v.begin() + i, v.begin() + i + 2);
			return vv;
		}
	}
	vv.clear();
	return vv;
}

// 这里有个会崩的问题，已经知道为什么会崩了，但是不好定位
std::vector<Card*> CardMgr::IsFlush(std::vector<Card*>& v) {
	// printf("IsFlush: %lu\n", v.size());
	std::vector<Card*> vv(0);
	// std::map<int, int> colors;
	int colors[] = {0, 0, 0, 0};
	for (unsigned long i = 0; i < v.size(); ++i)
	{
		int color = v[i] -> GetColor();
		colors[color - 1]++;
	}
	int flushColor = 0;
	for (int i = 0; i < 4; ++i)
	{
		if (colors[i] >= 5)
		{
			flushColor = (i + 1);
			break;
		}
	}
	if (flushColor == 0)
	{
		return vv;
	}
	// printf("同花花色 %d\n", flushColor);

	std::vector<Card*> tv;
	for (unsigned long i = 0; i < v.size(); ++i)
	{
		if (v[i] -> GetColor() == flushColor)
		{
			tv.push_back(v[i]);
		}
	}
	vv.insert(vv.begin(), tv.begin(), tv.begin() + 5);
	return vv;
}
std::vector<Card*> CardMgr::IsStraight(std::vector<Card*>& v) {
	// printf("IsStraight: %lu\n", v.size());
	std::vector<Card*> vv(0);
	for (unsigned long i = 0; i < v.size() - 4; ++i)
	{
		if (v[i] -> GetKind() - 1 == v[i + 1] -> GetKind()
			&& v[i + 1] -> GetKind() - 1 == v[i + 2] -> GetKind()
			&& v[i + 2] -> GetKind() - 1 == v[i + 3] -> GetKind())
		{
			/* 常规顺子 */
			if (v[i + 3] -> GetKind() - 1 == v[i + 4] -> GetKind())
			{
				vv.insert(vv.begin(), v.begin(), v.begin() + 5);
				return vv;
			}
			// 特殊情况
			if (v[i] -> GetKind() == 2 && v[v.size() - 1] -> GetKind() == 14)
			{
				vv.insert(vv.begin(), v.begin(), v.begin() + 4);
				vv.push_back(v[v.size() - 1]);
				return vv;
			}
		}
	}
	return vv;
}
std::vector<Card*> CardMgr::IsThreeOfAkind(std::vector<Card*>& v, bool isCondition) {
	// printf("IsThreeOfAkind: %lu\n", v.size());
	std::vector<Card*> vv(0);
	for (unsigned long i = 0; i < v.size() - 2; ++i)
	{
		if (v[i] -> GetKind() == v[i + 1] -> GetKind() && v[i] -> GetKind() == v[i + 2] -> GetKind())
		{
			vv.insert(vv.begin(), v.begin(), v.begin() + 3);
			if (!isCondition)
			{
				std::vector<Card*> tv;
				for (unsigned long j = 0; j < v.size(); ++j)
				{
					if (v[j] -> GetKind() == v[i] -> GetKind())
					{
						continue;
					}
					tv.push_back(v[j]);
				}
				vv.insert(vv.begin() + 3, tv.begin(), tv.begin() + 2);
				return vv;
			}
			return vv;
		}
	}
	return vv;
}
std::vector<Card*> CardMgr::IsTwoPair(std::vector<Card*>& v) {
	// printf("IsTwoPair: %lu\n", v.size());
	std::vector<Card*> vv(0);
	bool ishaspair = false;
	for (unsigned long i = 0; i < v.size() - 1; ++i)
	{
		if (v[i] -> GetKind() == v[i + 1] -> GetKind())
		{
			vv.push_back(v[i]);
			vv.push_back(v[i + 1]);
			if (ishaspair)
			{
				std::vector<Card*> tv;
				for (unsigned long j = 0; j < v.size(); ++j)
				{
					if (v[j] -> GetKind() == vv[0] -> GetKind() || v[j] -> GetKind() == vv[2] -> GetKind())
					{
						continue;
					}
					tv.push_back(v[j]);
				}
				vv.push_back(tv[0]);
				return vv;
			}
			i++;
			ishaspair = true;
		}
	}
	vv.clear();
	return vv;
}
std::vector<Card*> CardMgr::IsPair(std::vector<Card*>& v) {
	// printf("IsPair: %lu\n", v.size());
	std::vector<Card*> vv(0);
	for (unsigned long i = 0; i < v.size() - 1; ++i)
	{
		if (v[i] -> GetKind() == v[i + 1] -> GetKind())
		{
			std::vector<Card*> tv;
			for (unsigned long j = 0; j < v.size(); ++j)
			{
				if (v[i] -> GetKind() == v[j] -> GetKind())
				{
					continue;
				}
				tv.push_back(v[j]);
			}
			vv.push_back(v[i]);
			vv.push_back(v[i + 1]);
			vv.insert(vv.begin() + 2, tv.begin(), tv.begin() + 3);
		}
	}
	return vv;
}
std::vector<Card*> CardMgr::IsHighCard(std::vector<Card*>& v) {
	// printf("IsHighCard: %lu\n", v.size());
	std::vector<Card*> vv(v.begin(), v.begin() + 5);
	return vv;
}

bool CompCards(Card* c1, Card* c2) {
	return (c1 -> GetKind()) > (c2 -> GetKind());
}
void CardMgr::SortCards(std::vector<Card*>& v) {
	sort(v.begin(), v.end(), CompCards);
}
Model* CardMgr::CheckCardsType(std::vector<Card*>& v) {

	SortCards(v);
	// 记得free掉-------这里遇到一个内存问题，查了很久居然是malloc的问题
	// types_info* info = (types_info*)malloc(sizeof(types_info));
	
	Model* info = new Model();

	info -> cards = IsRoyalFlush(v);
	if (!info -> cards.empty())
	{
		info -> type = J;
		// printf("9info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsStraightFlush(v);
	if (!info -> cards.empty())
	{
		info -> type = I;
		// printf("8info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsFourOfAkind(v);
	if (!info -> cards.empty())
	{
		info -> type = H;
		// printf("7info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsFullHoush(v);
	if (!info -> cards.empty())
	{
		info -> type = G;
		// printf("6info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsFlush(v);
	if (!info -> cards.empty())
	{
		info -> type = F;
		// printf("5info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsStraight(v);
	if (!info -> cards.empty())
	{
		info -> type = E;
		// printf("4info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsThreeOfAkind(v, false);
	if (!info -> cards.empty())
	{
		info -> type = D;
		// printf("3info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsTwoPair(v);
	if (!info -> cards.empty())
	{
		info -> type = C;
		// printf("2info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsPair(v);
	if (!info -> cards.empty())
	{
		info -> type = B;
		// printf("1info->cards %lu\n", info -> cards.size());
		return info;
	}
	
	info -> cards = IsHighCard(v);
	info -> type = A;
	// printf("0info->cards %lu\n", info -> cards.size());
	return info;
}


std::vector<Model*> CardMgr::CommpareHighCard(std::vector<Model*>& v) {
	// 从第一张牌开始对比
	std::vector<int> tv1;
	for (unsigned long i = 0; i < v.size(); ++i)
	{
		tv1.push_back(v[i] -> cards[0] -> GetKind());
	}
	auto m = max_element(tv1.begin(), tv1.end());
	int max = *m;
	printf("第一张牌：%d\n", max);
	std::vector<Model*> winner1;
	for (unsigned long i = 0; i < v.size(); ++i)
	{
		if (v[i] -> cards[0] -> GetKind() >= max)
		{
			winner1.push_back(v[i]);
		}
	}
	if (winner1.size() == 1)
	{
		return winner1;
	}
	// 第二张牌
	std::vector<int> tv2;
	for (unsigned long i = 0; i < winner1.size(); ++i)
	{
		tv2.push_back(winner1[i] -> cards[1] -> GetKind());
	}
	m = max_element(tv2.begin(), tv2.end());
	max = *m;
	printf("第二张牌：%d\n", max);
	std::vector<Model*> winner2;
	for (unsigned long i = 0; i < winner1.size(); ++i)
	{
		if (winner1[i] -> cards[1] -> GetKind() >= max)
		{
			winner2.push_back(winner1[i]);
		}
	}
	if (winner2.size() == 1)
	{
		return winner2;
	}
	// 第三张牌
	std::vector<int> tv3;
	for (unsigned long i = 0; i < winner2.size(); ++i)
	{
		tv3.push_back(winner2[i] -> cards[2] -> GetKind());
	}
	m = max_element(tv3.begin(), tv3.end());
	max = *m;
	printf("第三张牌：%d\n", max);
	std::vector<Model*> winner3;
	for (unsigned long i = 0; i < winner2.size(); ++i)
	{
		if (winner2[i] -> cards[2] -> GetKind() >= max)
		{
			winner3.push_back(winner2[i]);
		}
	}
	if (winner3.size() == 1)
	{
		return winner3;
	}
	// 第四张牌
	std::vector<int> tv4;
	for (unsigned long i = 0; i < winner3.size(); ++i)
	{
		tv4.push_back(winner3[i] -> cards[3] -> GetKind());
	}
	m = max_element(tv4.begin(), tv4.end());
	max = *m;
	printf("第四张牌：%d\n", max);
	std::vector<Model*> winner4;
	for (unsigned long i = 0; i < winner3.size(); ++i)
	{
		if (winner3[i] -> cards[3] -> GetKind() >= max)
		{
			winner4.push_back(winner3[i]);
		}
	}
	if (winner4.size() == 1)
	{
		return winner4;
	}
	// 第五张牌
	std::vector<int> tv5;
	for (unsigned long i = 0; i < winner4.size(); ++i)
	{
		tv5.push_back(winner4[i] -> cards[4] -> GetKind());
	}
	m = max_element(tv5.begin(), tv5.end());
	max = *m;
	printf("第五张牌：%d\n", max);
	std::vector<Model*> winner5;
	for (unsigned long i = 0; i < winner4.size(); ++i)
	{
		if (winner4[i] -> cards[4] -> GetKind() >= max)
		{
			winner5.push_back(winner4[i]);
		}
	}
	if (winner5.size() == 1)
	{
		return winner5;
	}
	printf("多人平局\n");
	return winner5;
}









