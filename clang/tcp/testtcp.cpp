
#include "testtcp.h"

Tserver::Tserver(uv_loop_t* loop) {

	_loop = loop;
	_isInit = false;
	_isFinished = true;
}
Tserver::~Tserver() {

	// 退出tcp server
	Close();
}

bool Tserver::StartIp4(const char* ip, int port) {

	if (!Init())
	{
		printf("Init失败\n");
		return false;
	}
	if (!BindIp4(ip, port))
	{
		printf("Bind4失败\n");
		return false;
	}
	if (!Listen())
	{
		printf("Listen失败\n");
		return false;
	}
	printf("tcp服务器启动成功\n");
	return true;
}
bool Tserver::StartIp6(const char* ip, int port) {
	return true;
}
void Tserver::Close() {

	// 客户端都踢了
	for (std::map<int, Tclient*>::iterator iter = _clients.begin(); iter != _clients.end(); iter++)
	{
		Tclient* data = iter -> second;
		uv_close((uv_handle_t*)&data -> client_handle, on_after_client_close);
	}
	_clients.clear();
	// tcp handle踢了
	if (_isInit)
	{
		uv_close((uv_handle_t*)&_server_handle, on_after_server_close);
		printf("tcp服务器已退出\n");
	}
	_isInit = false;
	_isFinished = true;
	uv_mutex_destroy(&_mutex_handle);
}

/**
 * TODO 注意：有个大坑，被坑惨了
 * 一定要在上一次Send完全执行完成了以后进入下一次Send，所以我要给他上锁
 * 这是一个异步操作
 */
bool Tserver::Send(int id, const char* msg) {

	if (!_isFinished)
	{
		printf("等待上一次Send完\n");
		return false;
	}
	_isFinished = false;

	if (!id || !msg)
	{
		printf("Send参数错误\n");
		return false;
	}
	// 找到当前客户端
	auto iter = _clients.find(id);
	if (iter == _clients.end())
	{
		printf("没有找到对应的客户端 %d\n", id);
		return false;
	}
	Tclient* client = iter -> second;

	/* send content 内容怎么写，这是个问题 下面这几步都很关键 */
	// 1. 判断缓冲区够不够，不够要申请，不要用sizeof
	std::size_t len = std::strlen(msg);
	
	// client -> ClearWriteBuf();// TODO 把这个放到write_cb内去
	client -> AllocWriteBuf(len);

	printf("=============len: %lu\n", len);
	printf("-----------write_buf: %lu\n", client -> write_buf.len);

	// if (client -> write_buf.len < len)
	// {
	// 	// 重新申请一块区间给write_buf
	// 	client -> write_buf.base = (char*)realloc(client -> write_buf.base, len);
	// 	client -> write_buf.len = len;
	// }
	
	// 2. 把要发送的内容写入缓冲区
	memcpy(client -> write_buf.base, msg, len);
	// 3. 初始化uvbuf，这里有点多此一举了
	uv_buf_t buf = uv_buf_init((char*)client -> write_buf.base, len);
	// 连续多次Send时候发生了无限回调，不知道是不是libuv库本身的bug，后来发现不是
	// 这里的write_req没有初始化就传进去了是因为uv_write内部会初始化它
	int flag = uv_write(&client -> write_req, (uv_stream_t*)client -> client_handle, &buf, 1, on_after_send);
	if (flag)
	{
		printf("消息发送失败了\n");
		return false;
	}
	return true;
}
// 广播功能
bool Tserver::Broadcast(int id, const char* msg) {

	if (_clients.empty())
	{
		printf("当前没有客户端边接\n");
		return false;
	}

	uv_mutex_lock(&_mutex_handle);
	for (auto iter = _clients.begin(); iter != _clients.end(); iter++)
	{
		Tclient* client = iter -> second;
		if (client -> _id == id)
		{
			// 跳过自已
			continue;
		}
		Send(client -> _id, msg);
	}
	uv_mutex_unlock(&_mutex_handle);
	return true;
}


bool Tserver::SetNoDelay(bool enable) {

	int flag = uv_tcp_nodelay(&_server_handle, enable ? 1 : 0);
	if (flag)
	{
		return false;
	}
	return true;
}
bool Tserver::SetKeepAlive(bool enable, unsigned int delay) {

	int flag = uv_tcp_keepalive(&_server_handle, enable, delay);
	if (flag)
	{
		return false;
	}
	return true;
}
Tclient* Tserver::GetClientById(int id) {

	auto iter = _clients.find(id);
	if (iter == _clients.end())
	{
		printf("未找到id对应的client\n");
		return NULL;
	}
	return iter -> second;
}


// 启动服务器相关
bool Tserver::Init() {

	if (_isInit)
	{
		return true;
	}
	if (!_loop)
	{
		printf("_loop为NULL\n");
		return false;
	}
	int flag = uv_mutex_init(&_mutex_handle);
	if (flag)
	{
		printf("锁初始化初失败\n");
		return false;
	}
	flag = uv_tcp_init(_loop, &_server_handle);
	if (flag)
	{
		printf("tcp服务器handle初始化失败\n");
		return false;
	}
	_isInit = true;
	_server_handle.data = this;
	return true;
}
bool Tserver::BindIp4(const char* ip, int port) {

	struct sockaddr_in addr;
	int flag = uv_ip4_addr(ip, port, &addr);
	if (flag)
	{
		printf("socket地址初始化失败\n");
		return false;
	}
	
	flag = uv_tcp_bind(&_server_handle, (const struct sockaddr*)&addr, 0);
	if (flag)
	{
		printf("绑定socket失败\n");
		return false;
	}
	printf("Bind4 in ip= %s port= %d\n", ip, port);
	return true;
}
bool Tserver::BindIp6(const char* ip, int port) {
	return true;
}
bool Tserver::Listen() {

	int flag = uv_listen((uv_stream_t*)&_server_handle, 128, on_accept_onnect);
	if (flag)
	{
		printf("服务器监听端口失败\n");
		return false;
	}
	return true;
}

int Tserver::GetClientId() {
	static int clientId = 100;
	return clientId++;
}
bool Tserver::RemoveClientById(int id) {

	// 这里...
	uv_mutex_lock(&_mutex_handle);
	auto iter = _clients.find(id);
	if (iter == _clients.end())
	{
		printf("未找到id对应的client\n");
		return false;
	}
	// 判断当前handle是不是活跃的
	if (uv_is_active((uv_handle_t*)iter -> second -> client_handle))
	{
		uv_read_stop((uv_stream_t*)iter -> second -> client_handle);
	}
	uv_close((uv_handle_t*)iter -> second -> client_handle, on_after_client_close);
	// 从map中移除
	_clients.erase(iter);
	uv_mutex_unlock(&_mutex_handle);
	return true;
}



// 回调监听都是static方法，要想办法拿到当前所需的实例
void Tserver::on_accept_onnect(uv_stream_t* server, int status) {

	if (!server -> data)// server本质是uv_tcp_t，在Init的时候已经将this挂在了它的data域下
	{
		return;
	}

	Tserver* ts = (Tserver*)server -> data;

	int id = ts -> GetClientId();// 取出的id重复了就煞笔了

	// printf("创建client handle %d\n", id);

	Tclient* client = new Tclient(id);
	client -> server = ts;

	// 这里把client下的client_handle初始化
	int flag = uv_tcp_init(ts -> _loop, client -> client_handle);
	if (flag)
	{
		printf("初始化客户端handle失败\n");
		uv_close((uv_handle_t*)client -> client_handle, NULL);
		delete client;
		return;
	}

	flag = uv_accept((uv_stream_t*)&ts -> _server_handle, (uv_stream_t*)client -> client_handle);
	if (flag)
	{
		printf("接收客户端出错\n");
		return;
	}

	ts -> _clients.insert(std::make_pair(id, client));

	// 服务器开始准备接收客户端的消息数据
	flag = uv_read_start((uv_stream_t*)client -> client_handle, on_alloc_buffer, on_after_recv);
	if (flag)
	{
		/* code */
		printf("出事了 %d\n", flag);
	}
}
void Tserver::on_alloc_buffer(uv_handle_t* client, std::size_t size, uv_buf_t* buf) {

	if (!client -> data)// 客户端handle的data域挂着Data
	{
		return;
	}
	Tclient* tc = (Tclient*)client -> data;

	// 这里有个坑，size的大小是libuv给你一个默认的数值，并不是根据你接收数据的长度来告诉你要申请多少空间的，默认值是65536
	// 当新数据比上一次的数据长度要长时是没有问题的，但是当新数据变短了，这时候需要根据实际需求自已去截取新数据，否则读出的数据是不能直接用的
	// 会把多出空间的数据也读出来，这里没有内存泄露，我一直以为这里内存泄露了
	// 不过这个回调里边确实也无法确定数据长度，只能多，不能少，看看别人是怎么刲装这一块的
	// 所以这里好像不用边用边申请，没有意义，到时做好解析就行----这是对于读操作来说，写操作暂时不变
	// printf("这个size是将要申请多少空间来存放数据，决定了数据读取的长度：%lu\n", size);
	// tc -> AllocReadBuf(1);
	
	*buf = tc -> read_buf;// 初始化buf，这个缓冲区的大小是定制的，根据需要去调整
}
// 这里开始处理数据包了----包与协议肯定是定制的，先这样，后期在改
void Tserver::on_after_recv(uv_stream_t* client, ssize_t nread, const uv_buf_t* buf) {

	if (!client -> data)
	{
		return;
	}
	Tclient* tc = (Tclient*)client -> data;// 接收客户端的的数据
	// printf("开始清理read_buf\n");
	// tc -> ClearReadBuf();// 接收完就释放掉
	// printf("清理read_buf后base: %p\n", tc -> read_buf.base);
	// printf("清理read_buf后len: %zu\n", tc -> read_buf.len);
	
	if (nread < 0)
	{
		Tserver* server = (Tserver*)tc -> server;
		/* 处理异常 UV_ECONNRESET */
		if (nread == UV_EOF)
		{
			/* 主动断开 */
			printf("客户端主动断开 %zd\n", nread);
		}
		else
		{
			/* 异常断开 */
			printf("客户端异常断开 %zd\n", nread);
		}
		server -> RemoveClientById(tc -> _id);
		return;
	}
	else if (nread == 0)
	{
		/* 未读取到数据 */
		printf("nread == 0 %zd\n", nread);
	}
	else
	{
		printf("这个长度是数据字节长度nread > 0 %zd\n", nread);
		// 把数据直接丢给clienthandle去处理处理
		Tclient::Recvbuffer(tc -> _id, buf -> base, nread);
	}
}
void Tserver::on_after_send(uv_write_t* req, int status) {

	if (status < 0)
	{
		/* 发送数据异常 log一下 */
		printf("on_after_send faile\n");
	}
	
	uv_handle_t* handle = (uv_handle_t*)req -> handle;
	Tclient* client = (Tclient*)handle -> data;

	// 先不管成不成功，把下一次Send权限打开
	client -> server -> _isFinished = true;

	// TODO 在这里怎么更好地去清理write_buf
	printf("开始清理write_buf\n");
	client -> ClearWriteBuf();
	printf("清理write_buf后base: %p\n", client -> write_buf.base);
	printf("清理write_buf后len: %zu\n", client -> write_buf.len);

	// Tclient* client = container_of(req, class Tclient, write_req);
	// client -> ClearWriteBuf();
	
}
void Tserver::on_after_server_close(uv_handle_t* server) {
	// 停服了，这里在把tcp handle移出事件循环后调用
	// 处理一些清理工作，但是在生产环境中tcp停了意味着服务器停了
	
}
void Tserver::on_after_client_close(uv_handle_t* client) {

	Tclient* tc = (Tclient*)client -> data;
	delete tc;
	tc = NULL;
}


