/**
 * Created by lijie on 16/4/19.
 * Copyright (c) 2016 LeDongTian. All rights reserved.
 */

exports.generateToken = function(uniqueId) {
    var passwd = Conf.get('auth:cookie_passwd');
    var cipher = require('crypto').createCipher('DES-ECB', passwd);
    var res = cipher.update(`${uniqueId}##${Date.now()}`, "utf8", "hex");
    res += cipher.final("hex");
    return res;
};

exports.validateToken = function(token) {
    var passwd = Conf.get('auth:cookie_passwd');
    var decipher = require('crypto').createDecipher('DES-ECB', passwd);
    var res;
    try {
        res = decipher.update(token, "hex", "utf8");
        res += decipher.final("utf8");
    } catch (e) {
        Log.warn("invalid token", token, e);
        return false;
    }

    var parts = res.split("##");
    var uniqueId = parts[0];
    Log.info(`[decrypt token] uid:${uniqueId} time:${parts[1]}`);
    if (!uniqueId || Date.now() > +parts[1] + 7200 * 1000) {
        return false;
    } else {
        return uniqueId;
    }
};