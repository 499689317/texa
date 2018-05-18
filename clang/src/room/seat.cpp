
#include "seat.h"
Seat::Seat(int id, string uid, int flag) : _id(id), _uid(uid), _flag(flag) {
	// printf("Seat构造函数\n");
}
Seat::~Seat() {

}

int Seat::GetId() {
	return _id;
}
string Seat::GetUid() {
	return _uid;
}
int Seat::GetFlag() {
	return _flag;
}


