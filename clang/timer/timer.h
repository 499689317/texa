
/**
 * 基于libuv的一个定时器刲装
 * 这里为了尽量与nodejs的setInterval与setTimeout方法相似
 * 暂时先这样，后边功能不够用在加
 */
#ifndef TIMER_H
#define TIMER_H

#include "uv.h"
#include <assert.h>

typedef struct timer_handle
{
 	uv_timer_t timer;
 	uint64_t delay;
 	uint64_t repeat;
}timer_t;

class Timer
{
public:
	Timer(uv_loop_t* loop);
	virtual ~Timer();

	timer_t* setInterval(uv_timer_cb cb, uint64_t repeat);
	timer_t* setTimeout(uv_timer_cb cb, uint64_t delay);
	bool clearInterval(timer_t* t);
	bool clearTimeout(timer_t* t);
private:
	timer_t* AllocTimer(uint64_t delay, uint64_t repeat);
	void FreeTimer(timer_t*);
	uv_loop_t* _loop;
};

#endif




