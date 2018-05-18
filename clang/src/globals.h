
/**
 * 全局变量声明放到头文件.h，定义放到源文件.cpp
 * 或者声明且定义都放到.cpp文件
 */

// #include <node.h>
#ifndef GLOBALS_H
#define GLOBALS_H

class Tserver;
class Timer;
// 声明全局变量

extern int CardColor[];
extern int CardKind[];

enum CardBuff { A = 1, B, C, D, E, F, G, H, I, J };
enum RoomStatus { Wait = 1, Start, Hole, Flop, Turn, River, Stop };
enum PlayerStatus { Fold = 1, Bet, Raise, Call, Check, Waits, Allin };

extern Tserver* Tcpserver;
extern Timer* Ttimer;

// extern int gInt;
// extern int gInts[];
// extern const char* gChar;
// void MAINJS_SET_METHOD(v8::FunctionCallbackInfo<v8::Value>& args);

#endif



