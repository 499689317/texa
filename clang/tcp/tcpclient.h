
#ifndef TCPCLIENT_H
#define TCPCLIENT_H

#include "uv.h"
// #include "../queue.h"

// 数据格式
typedef struct recv_client_msg
{

	int id;// client id
	char* msg;// client msg
	int len;// msg length

	// QUEUE* ptr;// QUEUE

}client_msg;

// 定义一种数据结构，更像是一种与客户端的约定
class Tserver;
class Tclient
{
public:
	Tclient(int id);
	virtual ~Tclient();

	void AllocWriteBuf(size_t size);
	void AllocReadBuf(size_t size);
	void ClearWriteBuf();
	void ClearReadBuf();

	// 还得在这里解析接收的数据
	// 这里抽像一个数据处理层
	static void Recvbuffer(int id, const char* msg, int len);
	// static QUEUE queue;
	static size_t BUF_SIZE;

	int _id;
	Tserver* server;// 注意与handle的区别，不要混淆了
	uv_tcp_t* client_handle;
	uv_write_t write_req;// 暂时认为是一个写任务task，能看到这里默认你也认为libuv很奇怪
	uv_buf_t read_buf;
	uv_buf_t write_buf;
};

#endif



