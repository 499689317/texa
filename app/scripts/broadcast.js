/**
 * Created by lihongbin on 16/4/28.
 */

var foo = function() {
    var channelService = app.get('channelService');
    channelService.broadcast("connector", 'serverMessage', {route: "broadcast", msg: "5分钟之后维护，请勇士们休息片刻。"});
    app.set("serverStatus", 2);
    return true;
};

result = foo();
