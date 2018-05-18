
#include <iostream>
#include "base.h"

using namespace std;
v8::Persistent<v8::Function> Base::constructor;
Base::Base(double x, double y) : _x(x), _y(y) {
	cout << "Base默认构造函数" << endl;
	// cout << "打印引入的全局变量：" << "gInt: " << gInt << endl;
	// cout << "gChar*: " << gChar << endl;
	// cout << "gInts: " << gInts << endl;
	// MAINJS_SET_METHOD();
	// cout << "打印引入的静态全局变量：" << sInt << endl;
}

Base::~Base() {
	cout << "Base析构函数" << endl;
}

double Base::GetX() {
	cout << "_x : " << _x << endl;
	cout << "this->_x : " << this -> _x << endl;
	return _x;
}

double Base::GetY() {
	cout << "_y : " << _y << endl;
	cout << "this->_y : " << this -> _y << endl;
	return _y;
}

void Base::Init(v8::Local<v8::Object> exports) {

	v8::Isolate* isolate = exports -> GetIsolate();

	v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, Create);
	tpl -> SetClassName(v8::String::NewFromUtf8(isolate, "Create"));
	tpl -> InstanceTemplate() -> SetInternalFieldCount(1);
	NODE_SET_PROTOTYPE_METHOD(tpl, "PrintXY", PrintXY);
	constructor.Reset(isolate, tpl -> GetFunction());
	exports -> Set(v8::String::NewFromUtf8(isolate, "Create"), tpl -> GetFunction());
}

void Base::Create(const v8::FunctionCallbackInfo<v8::Value>& args) {

	if (args.IsConstructCall()) {
		
		cout << "构造调用Create" << endl;
		double value = args[0] -> IsUndefined() ? 0 : args[0] -> NumberValue();
		double value2 = args[1] -> IsUndefined() ? 0 : args[1] -> NumberValue();
		Base* ptr = new Base(value, value2);
		ptr -> Wrap(args.This());
		args.GetReturnValue().Set(args.This());
	} else {

		cout << "非构造调用Create" << endl;
		// 普通函数调用，可以替代js中的new操作
		NewInstance(args);
	}
}
void Base::NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args) {

	v8::Isolate* isolate = args.GetIsolate();
	const int argc = 2;
	v8::Local<v8::Value> argv[argc] = {args[0], args[1]};
	v8::Local<v8::Context> context = isolate -> GetCurrentContext();
	v8::Local<v8::Function> cons = v8::Local<v8::Function>::New(isolate, constructor);
	v8::Local<v8::Object> instance = cons -> NewInstance(context, argc, argv).ToLocalChecked();
	args.GetReturnValue().Set(instance);
}

void Base::PrintXY(const v8::FunctionCallbackInfo<v8::Value>& args) {

	// v8::Isolate* isolate = args.GetIsolate();

	// 获取当前对象
	// Base* base = node::ObjectWrap::Unwrap<Base>(args.Holder());
	// cout << "PrintXY : " << base -> _x << "," << base -> _y << endl;
}


