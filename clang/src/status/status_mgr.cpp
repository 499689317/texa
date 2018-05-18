
#include "status_mgr.h"
#include "status.h"

StatusMgr::StatusMgr() {

}
StatusMgr::~StatusMgr() {
	if (_curStatus)
	{
		delete _curStatus;
		_curStatus = NULL;
	}
	if (_preStatus)
	{
		delete _preStatus;
		_preStatus = NULL;
	}
}

Status* StatusMgr::GetPreStatus() {
	return _preStatus;
}
Status* StatusMgr::GetCurStatus() {
	return _curStatus;
}
void StatusMgr::SetPreStatus(Status* status) {
	_preStatus = status;
}
void StatusMgr::SetCurStatus(Status* status) {
	_curStatus = status;
}

void StatusMgr::Update(Status* status) {

	assert(status != NULL);// 参数不能为空

	if (_curStatus && _curStatus -> GetId() == status -> GetId())
	{
		// printf("状态相同，这里看需求放开\n");
		cout << "状态相同，这里看需求放开" << endl;
		return;
	}
	// 这里可以调用到正确版本的函数
	if (_curStatus == NULL)
	{
		SetCurStatus(status);
		_curStatus -> OnEnter();
	}
	else
	{
		SetPreStatus(_curStatus);
		_preStatus -> OnExit();
		SetCurStatus(status);
		_curStatus -> OnEnter();
	}
}



