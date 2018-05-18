
#include "tcpclient.h"
#include "testtcp.h"
#include "../src/globals.h"
#include <time.h>

size_t Tclient::BUF_SIZE = 1024 * 10; // 65536
// QUEUE_INIT(&Tclient::queue);

Tclient::Tclient(int id) : _id(id) {

	// 初始化数据结构
	client_handle = (uv_tcp_t*)malloc(sizeof(*client_handle));
	client_handle -> data = this;// 就在这里...

	// 这里写成边用边申请是不是会好一点，不然老出问题
	AllocReadBuf(BUF_SIZE);
	// AllocWriteBuf(BUF_SIZE);
}
Tclient::~Tclient() {
	
	ClearReadBuf();
	ClearWriteBuf();
	free(client_handle);
	client_handle = NULL;
}

void Tclient::AllocWriteBuf(size_t size) {

	write_buf = uv_buf_init((char*)malloc(sizeof(char) * size), size);
}
void Tclient::AllocReadBuf(size_t size) {

	read_buf = uv_buf_init((char*)malloc(sizeof(char) * size), size);
}
void Tclient::ClearWriteBuf() {

	// if (write_buf.base != NULL)
	// {
		free(write_buf.base);
		write_buf.base = NULL;
		write_buf.len = 0;
	// }
}
void Tclient::ClearReadBuf() {

	// if (read_buf.base != NULL)
	// {
		free(read_buf.base);
		read_buf.base = NULL;
		read_buf.len = 0;
	// }
}

void Tclient::Recvbuffer(int id, const char* msg, int len) {

	printf("id: %d\n", id);
	printf("msg: %s\n", msg);
	printf("len: %d\n", len);

	// Tclient* tc = Tcpserver -> GetClientById(id);

	char* temp_msg = (char*)malloc(sizeof(char) * len);
	for (int i = 0; i < len; ++i)
	{
		temp_msg[i] = msg[i];
	}
	printf("temp_msg: %s\n", temp_msg);

	// recv_client_msg
	// client_msg* cm = (client_msg*)malloc(sizeof(client_msg));
	// cm -> id = id;
	// cm -> msg = temp_msg;
	// cm -> len = len;
	

	free(temp_msg);
	temp_msg = NULL;

	// 这里肯定要去清理read_buf的吧
	// 这里我还得需要一种更好的路由方式帮我的数据路由出去
	// char* <-> json || xml ?

	
	// printf("开始清理read_buf\n");
	// tc -> ClearReadBuf();// 接收完就释放掉
	// printf("清理read_buf后base: %p\n", tc -> read_buf.base);
	// printf("清理read_buf后len: %zu\n", tc -> read_buf.len);

	time_t t = time(0);
	char tmp[64]; 
	strftime( tmp, sizeof(tmp), "%Y/%m/%d %X %A 本年第%j天 %z",localtime(&t) );
	printf("%s\n", tmp);
	Tcpserver -> Send(id, tmp);

}


