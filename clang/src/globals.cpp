
#include "globals.h"

// #include <iostream>
// using namespace std;

// 声明且定义全局变量
// extern int gInt = 10;
// extern char* gChar = "acbaskdjfhka";

// 定义全局变量
// int gInt = 10;
// int gInts[] = {1, 2, 3, 4, 5};
// const char* gChar = "acbaskdjfhka";


int CardColor[] = {1, 2, 3, 4};
int CardKind[] = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};

Tserver* Tcpserver = 0;
Timer* Ttimer = 0;

/**
 * [MAINJS_SET_METHOD description]
 * 这个方法有点难去抽象，先暂时这样，后面有时间在弄
 */
// void MAINJS_SET_METHOD(v8::Local<v8::Object> exports, v8::String* name, v8::Function* func) {
	// cout << "MAINJS_SET_METHOD" << endl;
	// cout << "name: " << name << endl;

	// v8::Isolate* isolate = exports -> GetIsolate();

	// v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, func);
	// tpl -> SetClassName(name);
	// tpl -> InstanceTemplate() -> SetInternalFieldCount(1);
	// // NODE_SET_PROTOTYPE_METHOD(tpl, "PlusOne", PlusOne);
	// // constructor.Reset(isolate, tpl -> GetFunction());
	// exports -> Set(funcName, tpl -> GetFunction());
// }

