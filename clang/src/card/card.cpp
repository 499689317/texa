
#include "card.h"
#include <iostream>
using namespace std;

Card::Card(int color, int kind) : _color(color), _kind(kind) {

}
Card::~Card() {

}

int Card::GetColor() {
	return _color;
}
int Card::GetKind() {
	return _kind;
}
void Card::SetColor(int color) {
	_color = color;
}
void Card::SetKind(int kind) {
	_kind = kind;
}

void Card::Print() {
	cout<< "color: " << _color << " kind: " << _kind << endl;
}




