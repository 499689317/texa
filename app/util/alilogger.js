/**
 * Created by lijie on 16/3/11.
 * Copyright (c) 2016 LeDongTian. All rights reserved.
 */


var ALY = require('aliyun-sdk');

var sls = new ALY.SLS({
    "accessKeyId": Conf.get("logger:key"),
    "secretAccessKey": Conf.get("logger:secret"),

    /*
    北京：http://cn-beijing.sls.aliyuncs.com
    杭州：http://cn-hangzhou.sls.aliyuncs.com
    青岛：http://cn-qingdao.sls.aliyuncs.com
    深圳：http://cn-shenzhen.sls.aliyuncs.com

    注意：如果你是在 ECS 上连接 SLS，可以使用内网地址，速度快，没有带宽限制。
    杭州：cn-hangzhou-intranet.sls.aliyuncs.com
    北京：cn-beijing-intranet.sls.aliyuncs.com
    青岛：cn-qingdao-intranet.sls.aliyuncs.com
    深圳：cn-shenzhen-intranet.sls.aliyuncs.com
    */

    endpoint: Conf.get("logger:endpoint"),

    // 这是 sls sdk 目前支持最新的 api 版本, 不需要修改
    apiVersion: '2015-06-01',

    //以下是可选配置
    httpOptions: {
        timeout: 5000  //单位ms 默认没有timeout
    }
});

var hostname = require('os').hostname();

var aliLogger = module.exports = {};

var pendingLogs = [];
var sendingLogs = [];
var lastSendTime = Date.now();

var formatLogData = function(msg, data) {
    var attrs = [{key: "msg", value: msg}];

    if (_.isString(data)) {
        attrs.push({key: "data", value: data});
        return attrs;
    }

    if (Array.isArray(data)) {
        var msg2, player;
        for (var i = 0; i < data.length; ++i) {
            if (data[i].toLog) {
                player = data[i].toLog();
            } else {
                msg2 = data[i];
            }
        }
        data = player || {};
        data.clientmsg = JSON.stringify(msg2);
    }

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            attrs.push({
                key,
                value: data[key] + "" // value 必须是字符串类型
            });
        }
    }
    return attrs;
};

aliLogger.addLog = function(msg, data) {
    pendingLogs.push({
        time: Math.floor(Date.now() / 1000),
        contents: formatLogData(msg, data)
    });
};

aliLogger.addErrorLog = function(msg, data) {
    var log = {
        time: Math.floor(Date.now() / 1000),
        contents: formatLogData(msg, data)
    };
    doSendLogs("game-error", [log], (err, data) => {
        if (err) {
            Log.error('[aliyun sls] send error log error:', err);
        } else {
            Log.info('[aliyun sls] send error log success');
        }
    });
};

aliLogger.numOfPendingLogs = function() {
    return pendingLogs.length;
};

setInterval(() => {
    try {
        if (sendingLogs.length > 0) return;
        if (pendingLogs.length > 10 || (pendingLogs.length > 0 && Date.now() - lastSendTime > 5000)) {
            lastSendTime = Date.now();
            sendLogs();
        }
    } catch (e) {
        console.error("Error sending log to aliyun", e);
    }
}, 1000);


// -------------------------------
// put logs
// -------------------------------

var sendLogs = function() {
    sendingLogs = pendingLogs;
    pendingLogs = [];
    doSendLogs("game-stats", sendingLogs, (err, data) => {
        if (err) {
            Log.error('[aliyun sls] send stats logs error:', err);
        } else {
            Log.info(_.sprintf('[aliyun sls] send %d stats logs success', sendingLogs.length));
        }
        sendingLogs = [];
    });
};

var doSendLogs = function(topic, logs, callback) {
    sls.putLogs({
        projectName: Conf.get("logger:project"),
        logStoreName: Conf.get("logger:store"),
        logGroup: {
            topic: topic,
            source: hostname,
            logs: logs
        }
    }, callback);
};