var path         = require('path');
var pomelo       = require('pomelo');
var httpPlugin   = require('pomelo-http-plugin');
var cors         = require('cors');
var cookieParser = require('cookie-parser');

/** ======= Setup Global Vars ======= */

global._         = require('underscore');
_.str            = require('underscore.string');
_.mixin(_.str.exports());
_.sprintf        = require('sprintf-js').sprintf;

var app = pomelo.createApp();
global.App       = app;
global.Async     = require('async');
global.Util      = global.util = require('./app/util');
global.ENV       = app.get('env');
global.isProd    = ENV === "production";
global.APP_ROOT  = path.resolve(__dirname);
global.Const     = require('./app/util/const');
global.Conf      = require('./app/util/conf');
global.Log       = require('./app/util/log');
global.moment    = require('moment');

/** ===== Configure Pomelo App ====== */
Log.info(ENV);
Log.info(Conf.get('main:client_url'));
app.set('name', '德州扑克');
app.enable('systemMonitor');


app.configure('all', 'gate', function() {
    console.log("配置gate服");
    app.loadConfig('httpConfig', path.join(app.getBase(), 'config/http.json'));
    httpPlugin.beforeFilter(cors({origin: true, credentials: true}));
    httpPlugin.beforeFilter(cookieParser());
    app.use(httpPlugin, {
        http: app.get('httpConfig')[app.getServerId()]
    });
});

app.configure('all', 'connector', function() {
    console.log("配置connector服");
    app.set(
        'connectorConfig', {
            connector: pomelo.connectors.hybridconnector,
            heartbeat: 20,
            timeout: 60,
            disconnectOnTimeout: true,
            useDict: true,
            useProtobuf: true
        }
    );
});

var router = require('./app/util/route').route;
app.configure('all', 'game', function() {
    console.log("配置game服");
});

app.configure('all', 'room', function() {
    console.log("配置room服");
});

// start app
var db = require('./app/db');
db.on('ready', () => {
    app.rds = db.redis;
    app.db = db.mongo;
    app.dbHelper = db.helper;
    app.start(() => {
        
        if (app.getServerId() === "room") {
            console.log("房间服启动完成，预创建房间等待玩家游戏");
            // 预创建部份房间
            // app.rpc.room.roomRemote.init(null, null, null);
            
            // 压测房间
            app.rpc.room.roomRemote.test(null, null);
        };

        Log.info("======  server started ok  ======");
    });
});

process.on('uncaughtException', function(err) {
    Log.error('Uncaught Exception: ', err.message, err.stack);
});
