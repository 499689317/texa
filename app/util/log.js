/**
 * Created by lijie on 16/3/9.
 * Copyright (c) 2016 LeDongTian. All rights reserved.
 */


var path = require('path');

var pomeloLogger = require('pomelo-logger');
pomeloLogger.configure("./config/log4js.json", {serverId : App.getServerId(), base: APP_ROOT});
var localLogger = pomeloLogger.getLogger('con-log');
var aliLogger = require('./alilogger');

localLog = function(level, args) {
    // stringify object arg, prevent it is serialized by logger
    var lastArg = _.last(args);

    if (_.isArray(lastArg)) {
        _.each(lastArg, (arg, idx) => {
            if (arg.inspect) lastArg[idx] = arg.inspect();
            if (arg.__route__) arg[0] = `[${arg.action}] ${arg[0]}`;
        });
    } else if (_.isObject(lastArg)) {
        if (lastArg.stack || lastArg instanceof Error) {
            args[args.length - 1] = lastArg.message + "\n" + lastArg.stack;
        } else {
            lastArg.serverId = App.getServerId();
        }
    }

    localLogger[level].apply(localLogger, args);

    if (level == 'warn' || level == 'error') {
        var errno = level == 'warn' ? 400 : 500;
        return {errno, errmsg: args[0]};
    }

};

remoteLog = function(level, msg, data) {
    if (ENV != "production" || !Conf.get("logger:enable")) return;
    data = data || {};
    if (_.isObject(data)) {
        data.serverId = App.getServerId();
    }
    if (level == "error") {
        aliLogger.addErrorLog(msg, data);
    } else {
        aliLogger.addLog(msg, data);
    }
};

module.exports = {
    debug: function() {
        localLog("debug", arguments);
    },
    info: function() {
        localLog("info", arguments);
    },
    warn: function(msg, data) {
        //remoteLog('warn', arguments);
        return localLog("warn", arguments);
    },
    error: function(msg, data) {
        remoteLog("error", msg, data);
        return localLog("error", arguments);
    },
    stats: function(msg, data) {
        remoteLog("stats", msg, data);
        localLog("info", arguments);
    },
    apiLogger: function(req, res, next) {
        log.info("[%s][%s] body:%s ip:%s cookie:%s user-agent:%s", req.method, req.url, JSON.stringify(req.body), req.get("X-Forwarded-For"), JSON.stringify(req.cookies), req.get("user-agent"));
        next();
    },
    errorLogger:function(req, res, route, err) {
        if (!res.headersSent) {
            res.send(new InternalError(err));
        }
        log.error(_.sprintf("[%s] error:%s, stack:%s", req.url, err.message, err.stack));
        return true;
    }
};


