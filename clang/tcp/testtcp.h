
#ifndef TESTTCP_H
#define TESTTCP_H

#include "uv.h"
#include <map>
#include "tcpclient.h"// 这个与客户端的约定随时都可变

// 初始化->启动->绑定->监听->接受连接->接收数据->发送数据
class Tserver
{
public:
	Tserver(uv_loop_t* loop);
	virtual ~Tserver();

	bool StartIp4(const char* ip, int port);
	bool StartIp6(const char* ip, int port);
	void Close();
	bool Send(int id, const char* msg);
	bool Broadcast(int id, const char* msg);
	bool SetNoDelay(bool enable);
	bool SetKeepAlive(bool enable, unsigned int delay);
	Tclient* GetClientById(int id);
private:
	bool Init();
	bool BindIp4(const char* ip, int port);
	bool BindIp6(const char* ip, int port);
	bool Listen();

	// 生成客户端id,id是唯一的
	int GetClientId();
	bool RemoveClientById(int id);

	// 回调监听事件
	static void on_accept_onnect(uv_stream_t* server, int status);
	static void on_alloc_buffer(uv_handle_t* client, std::size_t size, uv_buf_t* buf);
	static void on_after_recv(uv_stream_t* client, ssize_t nread, const uv_buf_t* buf);
	static void on_after_send(uv_write_t* req, int status);
	static void on_after_server_close(uv_handle_t* server);
	static void on_after_client_close(uv_handle_t* client);

	uv_loop_t* _loop;
	uv_tcp_t _server_handle;
	uv_mutex_t _mutex_handle;// 互斥量，这里，libuv总是运行在单线程中的，感觉没有必要加这个线程锁
	std::map<int, Tclient*> _clients;
	bool _isInit;
	bool _isFinished;
};

#endif


