
#ifndef CARD_MGR_H
#define CARD_MGR_H

#include "../card/card.h"
#include "model.cpp"

#include <algorithm>
#include <vector>
#include <iostream>
// #define NDEBUG
#include <assert.h>
using namespace std;


typedef struct cards_type_info
{
	
	int type;// 类型
	string uid;
	// 这里有个坑说明一下，struct内不要放vector，vector是一个对象，不是一段内存，sizeof时候没有办法获取到vector的大小
	// 如果直接调用cards的话，cards肯定没有构造好，会引发一系列内存问题的
	// std::vector<Card*> cards;
}types_info;


class CardMgr
{
public:
	CardMgr();
	~CardMgr();

	// 初始化卡牌管理器
	void Init();
	void Test();
	
	void ClearCards();
	
	// 洗牌算法
	void ShuffleCards();
	void ExchangeCards();
	int GetRandom();
	// 发牌逻辑,返回一个vector装有当前发手牌的容器
	vector<Card*> ProvideCards(int count);

	// 还是觉得在这里管理卡牌类型会好一点
	std::vector<Card*> IsRoyalFlush(std::vector<Card*>& v);
	std::vector<Card*> IsStraightFlush(std::vector<Card*>& v);
	std::vector<Card*> IsFourOfAkind(std::vector<Card*>& v);
	std::vector<Card*> IsFullHoush(std::vector<Card*>& v);
	std::vector<Card*> IsFlush(std::vector<Card*>& v);
	std::vector<Card*> IsStraight(std::vector<Card*>& v);
	std::vector<Card*> IsThreeOfAkind(std::vector<Card*>& v, bool isCondition);
	std::vector<Card*> IsTwoPair(std::vector<Card*>& v);
	std::vector<Card*> IsPair(std::vector<Card*>& v);
	std::vector<Card*> IsHighCard(std::vector<Card*>& v);
	void SortCards(std::vector<Card*>& v);
	Model* CheckCardsType(std::vector<Card*>& v);
	std::vector<Model*> CommpareHighCard(std::vector<Model*>& v);


	// 刲装存取cards的外部方法
	vector<Card*> GetCards();
	void SetCards(Card* card);
	void Print(vector<Card*> v);
private:
	vector<Card*> _cards;
	vector<Card*> _provide_cards;
};

#endif




