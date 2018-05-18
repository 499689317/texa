/**
 * Created by lihongbin on 16/4/28.
 */


// kick all clients
var channelService = app.get('channelService');
channelService.broadcast("connector", 'serverMessage', {route: "shutdown", msg: "服务器已开启维护模式。"});
app.set("serverStatus", 2);
app.rpc.guild.guildRemote.saveGuilds.toServer('*', (err, res) => {});
result = true;
