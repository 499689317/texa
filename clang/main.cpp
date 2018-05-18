
#include <node.h>
#include <iostream>
#include "test.cc"

// #include "src/base.h"

namespace main {

	using namespace std;
	using namespace v8;

	/**
	 * 这里提供一个中间层
	 * 目的是包装c++对象及类，这里是否可以抽象出一个模板
	 */
	

	/**
	 * 向node.js暴露相关接口交互
	 */
	
	// 启动主要服务
	void start_main_server(const FunctionCallbackInfo<Value>& args) {
		// test::test();
		test::start_server();
	}

	// 创建房间
	void create_room(const FunctionCallbackInfo<Value>& args) {

		printf("创建新房间\n");

		Isolate* isolate = args.GetIsolate();

		// 这里要解析出nodejs那边传过来的参数
		// 错误要及时抛出并回传到js端
		if (args.Length() < 2)
		{
			printf("创建房间参数个数错误\n");
			isolate -> ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "创建房间参数个数错误")));
			return;
		}
		// 参数类型
		if (!args[0] -> IsNumber() || !args[1] -> IsBoolean())
		{
			printf("创建房间参数类型错误\n");
			isolate -> ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "创建房间参数类型错误")));
			return;
		}

		int room_id = args[0] -> NumberValue();
		bool is_need_robot = args[1] -> BooleanValue();

		printf("room_id %d\n", room_id);
		printf("is_need_robot %d\n", is_need_robot);

		// 这里内存泄露了
		// 这个局部变量会被回收掉，这里正确的做法是返回一个堆空间
		// test::room_info_t rm_info = {room_id, is_need_robot};
		
		test::room_info_t* rm_info = (test::room_info_t*)malloc(sizeof(test::room_info_t));
		rm_info -> room_id = room_id;
		rm_info -> is_need_robot = is_need_robot;

		test::create_room(rm_info);
	}

	void init(Local<Object> exports) {

		// printf("NODE_GYP_MODULE_NAME生成一个模块的名字，编译的时候动态生成的宏，这里叫做main\n");
		// Base::Init(exports);

	  	NODE_SET_METHOD(exports, "start_main_server", start_main_server);
	  	NODE_SET_METHOD(exports, "create_room", create_room);
	}

	NODE_MODULE(NODE_GYP_MODULE_NAME, init)

};
