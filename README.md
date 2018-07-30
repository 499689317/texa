# 棋牌

## 2018/03/26

+ sublime2安装
+ git安装
+ sorucetree安装
+ http://dl.mongodb.org/dl/osx/x86_64下载mongodb
+ .ssh下创建config文件
	Host minitest
    hostname 192.168.10.175
    user root
+ 连接测试服ssh minitest
+ cd projects下minigame
+ 进入pomelo后台shell
	pomelo-cli -h 127.0.0.1 -P 3019 -u admin -p admin
+ 杀掉进程：kill all
+ 启动进程：pomelo start -D -e testing

## 2018/03/27
+ pomelo中文文档：https://github.com/NetEase/pomelo/wiki/Home-in-Chinese
+ 系列封装的工具库underscore: http://www.bootcss.com/p/underscore/#pick
+ sprintf-js: 一个类似于jquery的dom库
+ moment: nodejs的一个日期处理库
+ nconf: 配置文件管理库
+ mongoose-auto-increment: mongoose一个自动增量的库
+ pomelo-schedule: pomelo刲装的一个类似于crontab的组件

项目地址：git@192.168.10.4:lihongbin/answersking.git

+ pomelo
	. // pomelo文件目录说明
	. 
	. app = require("pomelo").createApp();// 相当于创建了一个管理进程（主进程概念）
	. // 环境设置方法
	. app.set();
	. app.enable();
	. app.configure();
	. app.getBase();
	. // rpc调用的方式(用于进程间rpc调用)
	. app.rpc.服务器名.remote句柄;
	. app.rpcInvoke(sid, msg, cb);
+ mongodb的连接客户端
+ redis连接客户端

## 2018/03/28

+ 配合客户端联调
+ tableServer: 房间服（负责游戏主要逻辑）
+ matchServer: 匹配服
+ chatServer: 聊天服
+ connectorServer: 连接服
+ gateServer: http服（负载均衡）

## 2018/03/29

+ 使用pomelo-node-tcp-client实现一个项目测试环境

## 2018/03/30

+ 维护玩家会话的session中各id的含义
	frontendId: 前端服务器id
	uniId: 玩家平台id
	uid: 玩家角色id===player.id，只有bind()后才能调用getByUid()
+ mongoose操作
	定义及基本概念
	Schema(纯洁的数据库模型),Model数据管理的类,Entity关系：
	Schema生成Model,Model创建Entity,Model与Entity都可操作数据库，但是Model比Entity更具操作性。
	定义一个Schema: var schema = new mongoose.Schema({name:String});
	注：schema上可挂载自定义方法，实例方法，schema.methods.func = func;
							  静态方法，schema.statics.func = func;
	定义一个Model: var model = db.model("Modelname", schema);
	定义一个Entity: var entity = new model({name:"小明"});// 就是一个Model的实例
	注：entity上并不具备Model的方法，只能用自已的方法。

+ pomelo架构的部分概念
1. channelServer: 只是pomelo启动后的一个js类，并不是一个服务器节点，不要被名字骗了
	用于创建各服务节点所属的channel
2. sessionServer/backendSessionServer: 也是服务器启动后的js类
	用于各节点维护session会话

## 2018/04/02

+ 引入pomelo模块（项目基本架构）
+ 调用createApp()创建项目应用，调用init方法时内部有一个appUtil.defaultConfiguration()是初始化的主要方法
+ 在defaultConfiguration中，使用Cluster具体实现项目内各个服务器的创建与启动（loadMaster/loadServers)
+ 在loadServers中，根据config目录下的servers.json文件配置来创建当前项目的的服务器
+ 配置servers.json创建的服务器进程
+ 调用app.start()启动项目
+ start()具体实现在application文件中的start方法内
	1. 调用loadDefaultCommponents方法加载各默认服务器配置表
	2. 调用optCommponents方法调用commponents内的start方法，初始化一系列默认服务器，具体实现在servers.js文件下
	3. 各默认服务器的定义具体实现在components目录下（channel/session.....）

+ 使用Buffer主要有这么几个原因：
	节省存储空间
	操作与传输速度非常快
+ 读写Buffer缓冲区：
	在对buffer数据重新编码写入缓冲区时：	
	用writeInt8写入值包含中文的buffer会报错，这时要用writeUInt8方法，原因是在utf-8编码下，中文占了3个字节


## 2018/04/08

德州扑克项目demo版计划
房间状态分层：已完成
房间状态逻辑：0.5天
牌型判断：0.5天
玩家匹配：1天
玩家操作逻辑：1天
玩家弃牌，让牌，跟注：1天
玩家加注，allin：1天，
调试：1天
这个星期试着把主要逻辑走通
客户联调：7天
bug修改：15天

## 2018/04/09

+ 玩家操作逻辑完成
+ 房间循环开局逻辑完成
+ 玩家选座未开始
+ 玩家出牌顺序验证未开始
+ 奖池累计未开始
+ 玩家结算未开始
+ 牌型大小判断未完成

## 2018/04/11

+ 庄家位置先确定
+ 看有没有人换座
+ 换座后确定小盲，大盲位置
+ 扣池底，小盲，大盲的盲注与换座惩罚的注
+ 开始发牌

## 2018/04/13

+ 奖池规则，底池，边池
+ 奖池结算
+ 房间内庄家位轮询
+ 创建房间规则，包括记录房间id
+ 每轮说话都可能产生游戏结果，每轮说话都要做好监听

## 2018/04/14

+ 主游戏bug修改
+ 写简单的机器人脚本
+ 完成了第一个与客户端联调的版本

## 2018/04/19

+ 发送给玩家底牌，对玩家进行一次过滤
+ 处理游戏进行中加入房间的玩家

## 2018/04/20

### 对v8进行深入研究整理

1. 基本概念

+ v8在执行javascript前将脚本编译成了机器码而非字节码或直译，并使用了内联缓存（inline caching）的方式来提高性能，在执行速度上是可以蓖美二进制编译的
+ v8利用为对象创建隐藏类hidden class的方式来提高对js对象属性访问性能，只需要一条指令即可，这里v8已经优化得非常智能了。隐藏类可多个对象共享。

+ Isolate: 一个独立的v8 runtime，也可以认为是一个独立的v8实例，包括了自已的堆管理器，gc组件，后续的很多操作都依赖于这个Isolate实例作为上下文传入。
注：一个给定的Isolate在同一时间只能被一个线程访问，但如果有多个不同的Isolate，就可以给多个线程同时访问。不过，一个Isolate还不足以运行脚本，你还需要一个全局对象，一个执行上下文通过指定一个全局对象来定义一个完整的脚本执行环境。因此，可以有多个执行上下文存在于一个Isolate中，而且它们还可以简单安全地共享它们的全局对象。这是因为这个全局对象实际上属于Isolate，而却这个全局对象被Isolate的互斥锁保护着。

+ 三个基本概念：句柄，作用域，上下文环境
句柄：每一个句柄就是指向一个v8对象的指针，所有的v8对象必须使用句柄来操作，如果一个v8对象没有任何句柄与之关联，则这个对象很快会被垃圾回收器给回收掉
作用域：可以看成是一个句柄的容器，在一个作用域里可以有很多个句柄，句柄指向的对象是可以一个一个释放的，但很多时候这样太繁琐，取而代之的是释放一个scope，那么在这个scope中的所有handle就被统一释放掉了
上下文环境：v8提供的一些库函数等等，也可以认为是某种运行环境

2. 引入v8

+ 下载v8源码，对源码进行编译，编译后安装好v8引擎就可以直接把v8作为一个普通的动态链接库来使用
+ 安装c++模块构建工具node-gyp：npm install -g node-gyp
+ 生成构建json文件binding.gyp
+ 构建c++插件node-gyp configure build生成.node二进制文件
+ 引入.node文件即可调用c++封装的模块

3. v8常用的数据结构(v8暴露给nodejs访问的一些数据类型)
	v8::Exception
	v8::FunctionCallbackInfo
	v8::Function
	v8::Isolate
	v8::Local
	v8::Number
	v8::Object
	v8::String
	v8::Value
详细资料：https://www.jianshu.com/p/857b4d38aba1?utm_campaign=maleskine&utm_content=note&utm_medium=pc_all_hots&utm_source=recommendation


## 2018/05/03

+ uv_write_t与uv_read_t做好边用边申请，用完就释放的原则
+ c语言宏定义：do{...}while(0)确保一个块代码，很灵活，灵活个屁

## 2018/05/08

## 2018/05/09

+ 将主线程设计为生产者，将多个子线程构成的线程池作为消费者
+ 生产者产生的作务类型：所有与房间有关系的逻辑
1. 创建新房间
2. 等待玩家进入
3. 坐下游戏
4. 聊天

## 2018/5/11

+ c++版本单进程2线程(因为测试机2核，防止线程切换带来的开销)，测试过程不包含消息广播
	3000个房间cpu峰值是50%上下浮动，平均在20-30%
	内存有部份泄露，但初始内存占用在100M内
	c++的表现还是非常好的
+ nodejs版本单进程单线程
	500个房间cpu峰值60%上下浮动，相对比较稳定
	内存占用120M相对比较正常
	如果在阿里云上压测效果会更好

## 2018/5/12

+ 小结nodejs拓展c++模块部份内容

	总体思路

	使用nodejs写游戏服务器情况下去拓展c++模块主要是为了能够将nodejs的单机性能压榨到最大，有这么几种场景，当游戏主要逻辑过于复杂的情况下，nodejs单进程跑有可能会无法满足实际应用需求，一些高实时、高密集计算类型的场景，这时拓展c++模块就显得非常必要了。

	现阶段暂时只是初步想法，所有的游戏模块，包括一些需要高并发支持的场景依然沿用nodejs服务器，比如有游戏各ui模块逻辑，各种玩家角色培养线功能，玩家一些非实时同步的数据等等。在一些密集计算的场景，如rpg的地图、战场、房间等可以拓展c++模块去完成。

	思路主要是先将c++拓展模块导出为可执行的二进制包，调用nodejs的requre方法引入到nodejs服务器中跑，c++导出的执行包需要满足部份接口即可，这时就可以在nodejs服务器内部根据拓展模块暴露的接口来组织了。

	v8拓展

	v8主要功能还是为了实现JavaScript与c++互调，v8内部刲装了JavaScript可识别的数据类型。v8将JavaScript代码导入进来进行重新编码为可执行的指令，然后开启了一个Isolate实例来跑这些指令。

	这里可以刲装一层中间层供JavaScript与c++互相访问，比如一些参数的传递，函数接口的调用等等。

	这里有一种新的拓展写法，先使用nodejs实现各种逻辑，然后导入到v8内部开启单独的线程启动新的Isolate实例来跑。我这一块暂时不想这么弄，因为拓展c++模块主要的目的还是希望能用c++来完成这些逻辑，如果使用这种思路的话就失去了拓展的先天优势。后期有时间可以这么尝试一下。

	在v8内部提供了大量的类似JavaScript的数据类型及导出函数。依赖v8去作拓展需要按照v8的文档来执行他们的语言特性，这一层我暂时只是仅仅做为一个桥接层看待，不想在v8的层面上做过多的逻辑。

	libuv拓展

	libuv拓展是我现在使用的拓展模式，所有拓展的模式以libuv为基础，c++原生编程为主来做拓展。这么做的好处很多，可以尽可能压榨执行性能，拓展性也特别强，不会被v8的各种奇怪的数据类型干扰。

	现阶段我主要完成了libuv新事件循环的开启、基于libuv的网络库的tcp服务器拓展、基于libuv的线程及线程池开启、引入了一个libuv内部的QUEUE队列和一个定时器的刲装。

	开启事件循环一种是与nodejs使用同一个事件循环(默认循环)，也可以开启一个新的事件循环。
	网络库主要是对uv_tcp_t句柄的再加工，把内部read与write进行了一系列的处理及维护客户端的socket实例，具体可以看刲的源码
	对线程的引入主要还要用原生pthread，线程池使用libuv刲装的uv_queue_work来实现
	定时器主要还是对uv_timer_t的再刲装

## 2018/05/15

+ 引入c++ grpc框架
+ 对比了grpc与thrift的优异
+ 从侧面反应出pomelo这个框架整体来说是很不错的，在这个框架基础上做优化拓展开发是没有问题的

## 2018/05/16

+ 引入thrift框架
	1. 安装thrift, Python.h在目录中找不到，安装yum install python-devel
	2. 安装依赖boost, bzlib.h：没有那个文件或目录, 安装yum -y install bzip2-devel
	
	注：配置boost的环境变量(这一步很关键): export PATH=$PATH:/usr/local/include/:/usr/local/lib/

	3. 改用这个版本：wget http://apache.fayea.com/thrift/0.9.3/thrift-0.9.3.tar.gz（跳过nodejs版本的编译）
	
	注：记得make完成后执行make install
	https://blog.csdn.net/zhouxukun123/article/details/78897972
	注：删除一个软链接目录时 rm -rf 目录名，千万不能用rm -rf 目录名/

	4. 安装依赖libevent，wget http://monkey.org/~provos/libevent-1.4.13-stable.tar.gz（使用2.0.22版本）
	5. https://www.cnblogs.com/shihuc/p/5938656.html
	
+ 导出thrift工程
	资料（在linux下可以成功）：https://my.oschina.net/zmlblog/blog/177245
	1. 定义xxx.thrift文件
	2. thrift -r --gen cpp xxx.thrift
	3. 在gen-cpp目录下生成基于thrift的rpc架构项目文件
	4. 编译文件，这一步很多坑（mac编译失败了）
	g++ -g -DHAVE_NETINET_IN_H -I. -I/usr/local/include/thrift -L/usr/local/lib Serv.cpp student_types.cpp student_constants.cpp Serv_server.skeleton.cpp -o server -lthrift

	问题1：error while loading shared libraries: libthrift-0.9.3.so: cannot open shared object file: No such file or directory
	看哪一个链接未找到: ldd 可执行文件
	解决方案：export LD_LIBRARY_PATH=/usr/local/lib

+ 为什么要引入thrift
	1. 拓展自已的技术方向
	2. 寻找更好的服务器架构方案
	3. 真正做到脱离nodejs，开辟c++服务器编程，满足高性能要求业务（还是有很多问题要解决，c++还是太复杂了）






