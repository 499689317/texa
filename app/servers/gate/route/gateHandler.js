var crc    = require('crc');
var cipher = require('../../../util/cipher');

module.exports = function(app, http, plugin) {

    // 获取服务器局域网地址, 用于本机调试
    var internalAddr = "";
    if (ENV == "development") {
        var os = require('os');
        var ifaces = os.networkInterfaces();

        Object.keys(ifaces).forEach(function(ifname) {
            ifaces[ifname].forEach(function(iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                internalAddr = internalAddr || iface.address;
            });
        });
    }
    internalAddr = internalAddr || "127.0.0.1";

    http.get('/servers', function(req, res) {
        var uniqueId = extractUniqueId(req);
        if (uniqueId.errno) return res.send(uniqueId);

        var servers = _.groupBy(Conf.get("servers"), "region");
        App.db.Server.findById(uniqueId, {}, (err, data) => {
            data = data || {};
            servers = _.flatten(_.values(servers));
            res.send({
                errno: 0,
                last: data.last,
                login : data.login,
                servers: servers.reverse()
            });
            Log.stats("获取服务器列表", {uniqueId});
        });
    });

    http.get('/gate', function(req, res) {

        var uniqueId = extractUniqueId(req);
        if (uniqueId.errno) return res.send(uniqueId);

        if (app.get("serverStatus") != 1 && !entryPlayerList(uniqueId)) {
            return res.send({errno: 400, errmsg: "服务器维护中"});
        }
        // get all connectors
        var connectors = app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            res.send({errno: 500, errmsg: 'no available connector'});
            Log.error('找不到可用的connector');
            return;
        }

        var serverId = Math.abs(crc.crc32(uniqueId)) % connectors.length;
        var server = connectors[serverId];
        Log.stats("用户连接到gate", {uniqueId, connectorId: serverId});

        res.send({
            errno: 0,
            host: ENV == "development" ? internalAddr : Conf.get("main:connector_hosts")[serverId],
            port: server.clientPort
        });
    });
};

var entryPlayerList = function(id) {
    if (ENV != 'production') {
        return true;
    }
    var list = [
        "oEGJQwVVeqCORm-MACciMWGOgl9E", // 李劼
        "oEGJQwce4usXOdKzLkPeLLYjUlfM"  // 李宏斌
    ];
    return list.indexOf(id) != -1;
};

var extractUniqueId = function(req) {
    var params = req.query,
        uniqueId;
    if ((!isProd || params.key == "Ldt@)!^" || Const.platformList.indexOf(params.platform) != -1) && params.uniqueId) {
        uniqueId = params.uniqueId;
    } else {
        var token = params.token || req.cookies.token;
        if (!token) {
            return {errno: 401, errmsg: "缺少Token"};
        }
        uniqueId = cipher.validateToken(token);
    }

    if (!uniqueId) {
        return {errno: 401, errmsg: "Token无效或者已过期"};
    }

    return uniqueId;
};
