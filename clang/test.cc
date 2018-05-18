
#include <unistd.h>
#include <uv.h>
#include "iostream"

#include "./timer/timer.h"
#include "./tcp/testtcp.h"
#include "./src/globals.h"
#include "./src/room_mgr/room_mgr.h"

using namespace std;

// 这里的命名规则主要模仿libuv，提高可阅性

namespace test {

	int count = 10;
	void run(uv_idle_t* idler) {

		count--;
		sleep(1);
		printf("空转任务 %d\n", count);
		if (!count)
		{
			uv_idle_stop(idler);
		}
	}
	// 测试定时器
	// static void thing(uv_timer_t* t) {
	// 	printf("room_id: %d\n", *(int*)t -> data);
	// 	// uv_mutex_unlock(&mutex);
	// };

	/**
	 * 对uv层一些调用
	 * 需要有一个事件循环的主线程
	 * 1.
	 * 每创建一个房间对应创建一个线程【池】？为它服务，当房间被销毁，则回收它
	 * 首先必需要确定这么做的实际效果与在生产环境下的可接受程度
	 * 要确定这么做会不会太过于浪费资源
	 * 这里用uv_default_loop，为什么呢，因为只是测试，实际上要新开辟一个事件循环系统，为了性能
	 * 2.
	 * 毕竟只是node的拓展模块，只能还是以v8为主线程
	 * 所以这里要做好房间线程的调度，这里的任务就是调度房间系统
	 * 主要完成创建新房间与销毁废弃房间
	 * 3.
	 * 启动项目主要服务
	 * a. 消息推送服务
	 * b. socket连接服务
	 */
	
	// uv_loop_t* loop = uv_default_loop();
	// 声明一个新开避的事件循环
	uv_loop_t* loop = uv_loop_new();
	// uv_tcp_t server;
	uv_work_t work[10000];
	uv_mutex_t mutex;

	/*    tcp服务  这部份后期会引入更好用的网络库    */
	typedef struct {
	    uv_write_t req;
	    uv_buf_t buf;
	} write_req_t;
	void free_write_req(uv_write_t *req) {
	    write_req_t *wr = (write_req_t*) req;
	    free(wr->buf.base);
	    free(wr);
	}
	void alloc_buffer(uv_handle_t *handle, size_t suggested_size, uv_buf_t *buf) {
	    buf->base = (char*) malloc(suggested_size);
	    buf->len = suggested_size;
	}
	void echo_write(uv_write_t *req, int status) {
	    if (status) {
	        fprintf(stderr, "Write error %s\n", uv_strerror(status));
	    }
	    free_write_req(req);
	}
	void echo_read(uv_stream_t *client, ssize_t nread, const uv_buf_t *buf) {
	    if (nread > 0) {
	        write_req_t *req = (write_req_t*) malloc(sizeof(write_req_t));
	        req->buf = uv_buf_init(buf->base, nread);
	        uv_write((uv_write_t*) req, client, &req->buf, 1, echo_write);
	        return;
	    }
	    if (nread < 0) {
	        if (nread != UV_EOF)
	            fprintf(stderr, "Read error %s\n", uv_err_name(nread));
	        uv_close((uv_handle_t*) client, NULL);
	    }
	    free(buf->base);
	}
	void on_new_connection(uv_stream_t *server, int status) {
	    if (status < 0) {
	        fprintf(stderr, "New connection error %s\n", uv_strerror(status));
	        // error!
	        return;
	    }
	    uv_tcp_t *client = (uv_tcp_t*) malloc(sizeof(uv_tcp_t));
	    uv_tcp_init(loop, client);
	    if (uv_accept(server, (uv_stream_t*) client) == 0) {
	    	printf("客户端连接过来了\n");
	        uv_read_start((uv_stream_t*) client, alloc_buffer, echo_read);
	    }
	    else {
	        uv_close((uv_handle_t*) client, NULL);
	    }
	}
	
	void start_tcp_server() {

		assert(loop != NULL);

		Tserver* server = new Tserver(loop);
		Tcpserver = server;
		server -> StartIp4("127.0.0.1", 7000);
		server -> SetNoDelay(true);
		server -> SetKeepAlive(true, 60);
		
		// int r;
		// struct sockaddr_in addr;
		// uv_ip4_addr("127.0.0.1", 7000, &addr);
		// r = uv_tcp_init(loop, &server);
		// if (r)
		// {
		// 	printf("init error\n");
		// 	return;
		// }
		// r = uv_tcp_bind(&server, (const struct sockaddr*)&addr, 0);
		// if (r)
		// {
		// 	printf("bind error\n");
		// 	return;
		// }
		// r = uv_listen((uv_stream_t*)&server, 128, on_new_connection);
		// if (r)
		// {
		// 	printf("listen error\n");
		// 	return;
		// }
	}

	/*   房间信息  */ 
	typedef struct room_info
	{
		int room_id;
		bool is_need_robot;
	}room_info_t;
	
	void create_room(room_info_t* room) {

		assert(room != NULL);

		int roomId = room -> room_id;
		bool isNeedRobot = room -> is_need_robot;
		// printf("roomId: %d\n", roomId);
		// printf("isNeedRobot: %d\n", isNeedRobot);

		free(room);
		uv_mutex_unlock(&mutex);

		RoomMgr::GetInstance() -> CreateRoom(roomId, isNeedRobot);
	}
	// 子线程维持的房间
	void thread_cb(void* args) {
		room_info_t* room = (room_info_t*)args;
		create_room(room);
	}

	// uv_queue_work
	void queue_work_cb(uv_work_t* w) {
		room_info_t* room = (room_info_t*)w -> data;
		uv_mutex_lock(&mutex);
		create_room(room);

		// while(true) {
		// 	sleep(2);
		// 	printf("roomId: %d isNeedRobot: %d\n", room -> room_id, room -> is_need_robot);
		// 	printf("==========================\n");
		// }
	}
	void after_queue_work_cb(uv_work_t* w, int status) {
		// 任务执行完成后得把线程池资源回收了
	}

	/*  开启游戏线程 type: 1单线程，2线程池 */
	void start_game_thread(int type) {

		assert(loop != NULL);

		int flag = uv_mutex_init(&mutex);
		if (flag)
		{
			printf("线程锁初始化失败\n");
			return;
		}

		if (type == 1)
		{

			// 预创建的房间需要读数据表，这里先有假数据代替一下
			room_info_t* room = (room_info_t*)malloc(sizeof(room_info_t));
			room -> room_id = 1;
			room -> is_need_robot = true;

			uv_thread_t thread_id;
			// 这里没有用线程池主要是考虑到线程的上下文切换与房间机制的局限性限制
			uv_thread_create(&thread_id, thread_cb, (void*)room);
			// 这里将房间线程分离出去交给系统管理调度
			// 注：线程即使分离出去后，主线程退出了，分离线程还是一样退出
			pthread_detach(thread_id);
			// 这里不要用会合式线程，管理太麻烦
			// uv_thread_join(&thread_id);
		}
		else
		{
			// 这里调整线程池内的线程数，最大只能到128
			setenv("UV_THREADPOOL_SIZE", "2", 1);
			printf("UV_THREADPOOL_SIZE: %s\n", getenv("UV_THREADPOOL_SIZE"));

			// 这里用一个线程池试试性能
			// 这里默认开启了4个子线程
			// 这个方法如果你没有看源码的话就不要去用，危险，这种方式刲装很容易产生歧义
			for (int i = 0; i < 2500; ++i)
			{
				// sleep(1);
				room_info_t* r = (room_info_t*)malloc(sizeof(room_info_t));
				r -> room_id = (i + 1);
				r -> is_need_robot = true;

				work[i].data = (void*)r;
				uv_queue_work(loop, &work[i], queue_work_cb, after_queue_work_cb);
			}
		}
	}

	void start_server() {

		// 创建loop失败不能启动服务
		assert(loop != NULL);

		// 空转监视器事例
		// 有什么实际用处呢？想想
		// uv_idle_t idler;
		// uv_idle_init(loop, &idler);
		// uv_idle_start(&idler, run);

		// 这里需要注意的点是，开启子线程是不依赖loop的
		// 其实可以这么理解这一块的架构，虽然我开避子线程不需要loop，但我在启动tcp服务时是依赖于loop的
		// 这里的关系异常复杂，但是我已经弄明白了
		start_tcp_server();
		
		// 初始化timer
		Ttimer = new Timer(loop);
		// xxx = Ttimer -> setTimeout(thing, 2000);

		// 服务启动时预加载房间
		// 这里要么调用会合式线程阻塞主线程
		// 要么用事件loop阻塞主线程
		// 或者用其它方式：比如无限循环？试一下
		start_game_thread(2);

		uv_run(loop, UV_RUN_DEFAULT);
		uv_loop_close(loop);
		free(loop);
		printf("主线程没有阻塞住\n");
	}
	
};


