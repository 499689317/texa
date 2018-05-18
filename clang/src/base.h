
#include <node.h>
#include <node_object_wrap.h>

// #include "globals.h"
// extern int gInt;
// extern int gInts[];
// extern const char* gChar;
// extern void MAINJS_SET_METHOD();

class Base : public node::ObjectWrap
{
public:
	Base(double x, double y);
	~Base();

	double GetX();
	double GetY();

	static v8::Persistent<v8::Function> constructor;
	/**
	 * 这里解释一下静态成员属性与方法，静态成员是属于整个类的，是这个类所有对象所共有的行为
	 * 类似于js中挂到原型的属性与方法，是所有对象共享的
	 * 所以开销应应该比非静态成员属性与方法小，这是我猜测的？具体要进一步确定
	 * 既然静态成员开销小，为什么不大量使用呢？这个问题涉及到this指针及实际需求
	 * 因为在实际应用中很难存在一种需求使得非静态成员函数不引用本对象的非静态成员，如果直的存在这种需求则可直接声明为静态成员
	 * 静态成员函数的调用是无法获得this指针的，所以不可能引用非静态成员，这方面也是限制了静态成员的使用
	 */
	static void Init(const v8::Local<v8::Object> exports);
	static void Create(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args);
	static void PrintXY(const v8::FunctionCallbackInfo<v8::Value>& args);
private:
	double _x;
	double _y;
};

