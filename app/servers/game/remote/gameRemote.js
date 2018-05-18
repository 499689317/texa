
//

var Remote = function(app) {
    this.app = app;
};

Remote.prototype.init = function(uid, fields, cb) {
    
};

Remote.prototype.pushMessageTo = function(uid, route, msg, cb) {
    var player = playerMgr.getPlayer(uid);
    if (!player || player.removing) return cb();
    var target = {uid: uid, sid: player.frontId};
    App.channelService.pushMessageByUids(route, msg, [target], cb);
};

module.exports = function(app) {
    return new Remote(app);
};




