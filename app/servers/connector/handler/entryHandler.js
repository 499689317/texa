var async = require('async');
var cipher = require('../../../util/cipher');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
    app.userInfo = {};
};

var handler = Handler.prototype;


var userEntering = {};

handler.enter = function(msg, session, next) {

    if (_.isString(msg)) {
        msg = JSON.parse(decodeURIComponent(msg));
    } else {
        if (!_.isObject(msg)) {
            return next(null, {errno: 500, errmsg: "版本已过期，请刷新页面，或重启微信并清除缓存"});
        };
    }
    Log.info(JSON.stringify(msg));

    var servers = Conf.get('servers'),
        serverId = msg.serverId;
    if (!serverId || !_.find(servers, (s) => s.id == serverId)) {
        Log.warn("[enter] invalid serverId", msg);
        return next(null, {errno: 500, errmsg: "非法的serverId"});
    }

    var uniqueId;
    if ((!isProd || msg.key == "Ldt@)!^" || msg.platform == "hortor" || msg.platform == "egret") && msg.uniqueId) {
        uniqueId = msg.uniqueId;
    } else {
        if (!msg.token) {
            Log.warn("[enter] missing token", msg);
            return next(null, {errno: 500, errmsg: "缺少token"});
        }
        uniqueId = msg.uniqueId = cipher.validateToken(msg.token);

        if (!uniqueId) {
            Log.warn("[enter] invalid or expired token", msg);
            return next(null, {errno: 500, errmsg: "授权信息非法或者已过期"});
        }
    }

    var id = uniqueId + '-' + serverId;
    if (userEntering[id]) {
        Log.info("[enter] 连续登录", {uniqueId, serverId});
        next(null, {errno: 500, errmsg: "已在登录中"});
        return;
    }
    userEntering[id] = Date.now();

    var app = this.app, isNew = false;
    var sessionService = app.get('sessionService');
    async.waterfall([
        function(cb) {
            // step1: 检查是否为新玩家 如果是则创建玩家
            app.db.Player.findOne({serverId, uniqueId}, {_id: 1}, (err, player) => {
                if (err) {
                    return cb({errno: 500, errmsg: err});
                } else if (!player) {
                    isNew = true;
                    //return cb({errno: 500, errmsg: '服务器已停止注册新玩家'});
                    // playerMgr.createPlayer(msg, cb);
                    cb(null, {id: uniqueId});
                } else {
                    cb(null, player);
                }
            });
        },
        function(player, cb) {
            // step2: login in to core server
            var uid = player.id;
            var info = _.pick(msg, "headimgurl", "nickname", "subscribe", "platform");
            cb(null, player);
        },
        function(player, cb) {
            // step3: 检查重复登录
            var serverLogin = {last: serverId};
            serverLogin[`login.${serverId}`] = player.level;
            var oldSession = _.first(sessionService.getByUid(player.id));
            if (!oldSession) {
                return cb(null, player);
            }
            // 重复登录 把已经登录的session踢下线
            Log.stats("用户重复登录", {uniqueId, serverId, uid: player.id});
            var msg = {msg: "由于该账号在其他地方登陆，您被强制下线。"};
            var user = {uid: player.id, sid: app.serverId};
            player.lastOffline = 0;
            app.channelService.pushMessageByUids("kicked", msg, [user], () => {
                sessionService.kick(uniqueId, "duplicated login", () => cb(null, player));
            });
        },
        function(player, cb) {
            session.bind(player.id);
            session.set("uniId", player.uniqueId);
            session.pushAll((err) => {
                cb(err, player);
            });
        }
    ], function(err, player) {
        delete userEntering[id];
        if (err) {
            Log.info("[enter] 进入游戏出错", {err: err, msg: msg});
            err = err.errno ? err : {errno: 500, errmsg: err.msg};
            return next(null, err);
        }

        var uid = player.id;
        session.on('closed', onUserLeave.bind(null, app));
        app.userInfo[uid] = _.pick(player, "id", "uniqueId", "serverId", "level", "name");
        Log.stats("用户登录", {
            uid, serverId, uniqueId,
            ip: sessionService.getClientAddressBySessionId(session.id).ip
        });

        var info = {serverId, gid: player.guild};
        //app.rpc.chat.chatRemote.add(uid, uid, app.serverId, info, () => {});
        next(null, {errno: 0, data: player, ts: Date.now()});
    });
};

var onUserLeave = function(app, session, reason) {
    if (!session || !session.uid) {
        return;
    }
    var uid = session.uid;
    app.rpc.room.roomRemote.kick(null, uid, function() {});
    
    delete app.userInfo[uid];
    delete userEntering[uid];
    Log.stats("用户登出", {uid: uid, reason: reason});
};