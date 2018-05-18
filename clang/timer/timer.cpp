
#include "timer.h"

Timer::Timer(uv_loop_t* loop) : _loop(loop) {
}
Timer::~Timer() {
}
timer_t* Timer::AllocTimer(uint64_t delay, uint64_t repeat) {

	timer_t* t = (timer_t*)malloc(sizeof(timer_t));
	t -> delay = delay;
	t -> repeat = repeat;
	return t;
}
void Timer::FreeTimer(timer_t* t) {
	free(t);
}


timer_t* Timer::setInterval(uv_timer_cb cb, uint64_t repeat) {

	assert(_loop != NULL);

	timer_t* t = AllocTimer(repeat, repeat);
	int flag = uv_timer_init(_loop, &(t -> timer));
	if (flag)
	{
		printf("初始化setInterval失败\n");
		return NULL;
	}
	// 这里与nodejs的setInterval相似，都不是立即开始的
	flag = uv_timer_start(&(t -> timer), cb, t -> delay, t -> repeat);
	if (flag)
	{
		printf("开始setInterval失败\n");
		return NULL;
	}
	// 定时器启动成功
	return t;
}
timer_t* Timer::setTimeout(uv_timer_cb cb, uint64_t delay) {

	assert(_loop != NULL);

	timer_t* t = AllocTimer(delay, 0);
	int flag = uv_timer_init(_loop, &(t -> timer));
	if (flag)
	{
		printf("初始化setTimeout失败\n");
		return NULL;
	}
	// 注意这里只延时执行一次，不会重复执行回调
	flag = uv_timer_start(&(t -> timer), cb, t -> delay, t -> repeat);
	if (flag)
	{
		printf("开始setTimeout失败\n");
		return NULL;
	}
	// setTimeout启动成功
	return t;
}
bool Timer::clearInterval(timer_t* t) {
	assert(t != NULL);
	int flag = uv_timer_stop(&(t -> timer));
	FreeTimer(t);// 即使flag不为0也释放timer
	if (flag)
	{
		printf("停止定时器失败//clearInterval\n");
		return false;
	}
	return true;
}
bool Timer::clearTimeout(timer_t* t) {
	assert(t != NULL);
	int flag = uv_timer_stop(&(t -> timer));
	FreeTimer(t);
	if (flag)
	{
		printf("停止定时器失败//clearTimeout\n");
		return false;
	}
	return true;
}


