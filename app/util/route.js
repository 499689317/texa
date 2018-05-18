/**
 * Created by lijie on 16/5/13.
 * Copyright (c) 2016 LeDongTian. All rights reserved.
 */

var dispatch = function(uid, servers) {
    var index = Number(uid) % servers.length;
    return servers[index];
};

exports.route = function(type) {
    return function(session, msg, app, cb) {
        var id;
        if (_.isObject(session)) { // for handler
            id = type === "table" ? session.get("tableServerId") : session.uid;
        } else { // for remote
            id = session;
        }

        var servers = app.getServersByType(type);
        if (_.isUndefined(id)) {
            Log.error("[route] cannot get " + type);
            cb(new Error(`[route] cannot get ` + type));
        } else if (!servers || servers.length === 0) {
            Log.error(`[route] no ${type} server available`, id, msg);
            cb(new Error(`can not find ${type} servers.`));
        } else {
            var serverId = _.isNaN(Number(id)) ? id : dispatch(id, servers).id ;
            cb(null, serverId);
        }
    }
};

