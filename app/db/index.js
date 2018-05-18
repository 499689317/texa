/**
 * Created by lijie on 16/3/7.
 * Copyright (c) 2016 LeDongTian. All rights reserved.
 */


var events   = require("events");
var path     = require('path');
var mongoose = require('mongoose');
var simpledb = require('./simpledb');
var redis    = require('redis');
var app      = require('pomelo').app;

if (ENV == 'development') {
    mongoose.set('debug', true);
}

var db = module.exports = new events.EventEmitter();
db.helper = require('./helper.js');
initMongoDB();
initRedis();

function initMongoDB() {
    simpledb.init({
        connectionString: Conf.get("main:mongodb"),
        options: { config: {autoIndex: app && app.getServerId() == "core1" }},
        modelsDir: path.join(__dirname, 'model'),
        autoIncrementNumberIds: true,
        debug: true
    }, (err, mongo) => {
        Log.info("[DB] connected to mongodb server");
        db.mongo = mongo;
        onConnected();
    });
}


function initRedis() {
    var host = Conf.get("main:redis");
    var options = {};
    var parts = host.split(":");
    if (parts.length == 3) {
        options.auth_pass = parts[2];
    }
    var client = redis.createClient(parts[1], parts[0], options);

    client.once("ready", function() {
        Log.info("[DB][redis] " + host + " connected");
        db.redis = client;
        onConnected();
    });

    client.on("error", function(err) {
        Log.error("[DB][redis] " + host + " connect error, stack:" + err.stack, err);
    });
}

var connected = 0;

function onConnected() {
    connected ++;
    if (connected == 2) {
        db.ready = true;
        db.emit("ready", db);
    }
}
