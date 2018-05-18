
#ifndef STATUS_MGR_H
#define STATUS_MGR_H

// #define NDEBUG
#include <assert.h>

// #include "status.h"

class Status;
class StatusMgr
{
public:
	StatusMgr();
	~StatusMgr();

	Status* GetPreStatus();
	Status* GetCurStatus();
	void SetPreStatus(Status* status);
	void SetCurStatus(Status* status);

	void Update(Status* status);
private:
	Status* _preStatus = NULL;
	Status* _curStatus = NULL;
};

#endif




