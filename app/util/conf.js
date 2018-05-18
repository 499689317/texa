/**
 * Created by lijie on 16/3/9.
 * Copyright (c) 2016 LeDongTian. All rights reserved.
 */

var fs = require("fs");
var path = require("path");
//var later = require("later");

/**************************************
 *             init nconf             *
 **************************************/
var conf = module.exports = require("nconf");
//console.log("[Config] ******load all conf, env:" + ENV);
// load nconf


conf.load = function() {
    this.file('server config', {
        file: _.sprintf(path.join(__dirname, "../../") + '/config/app_%s.json', ENV)
    });
};


conf.load();

setInterval(conf.load.bind(conf), 5 * 60 * 1000);

/**************************************
 *   load data conf in conf_shared    *
 **************************************/

function loadAllConf(isFirstLoad) {
    // load json configs
    var jsons = fs.readdirSync("./config_game");
    jsons = _.reject(jsons, function(n) {
        return path.extname(n) !== ".json" || n === "config.json";
    });
    _.each(jsons, function(fname) {
        var name = path.basename(fname, ".json");
        var json = fs.readFileSync(path.join("./config_game", fname), "utf-8");
        if (isFirstLoad && conf[name]) {
            console.log("[CONF] Warning overriding nconf's property: " + name);
        }
        conf[name] = JSON.parse(json);
    });
}

function loadNicknameData() {
    var data = fs.readFileSync('./config/nickname/nickname.json', "utf-8");
    data = JSON.parse(data);
    var surname = [];
    var male = [];
    var female = [];
    _.each(data, (v, k) => {
        if (v.surname) surname.push(v.surname);
        if (v.male) male.push(v.male);
        if (v.female) female.push(v.female);
    });
    conf.nickname = {surname, male, female};
}

loadAllConf(true);

function groupBy(obj, key1, key2) {
    var ret = {};
    _.each(obj, function(meta) {
        ret[meta[key1]] = ret[meta[key1]] || {};
        ret[meta[key1]][meta[key2]] = meta;
    });
    return ret;
}

function arrayBy(obj, key1, key2) {
    var ret = {};
    _.each(obj, function(meta) {
        if (key2) {
            ret[meta[key1]] = ret[meta[key1]] || {};
            ret[meta[key1]][meta[key2]] = ret[meta[key1]][meta[key2]] || [];
            ret[meta[key1]][meta[key2]].push(meta);
        } else {
            ret[meta[key1]] = ret[meta[key1]] || [];
            ret[meta[key1]].push(meta);
        }

    });
    return ret;
}