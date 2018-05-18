/**
 * Created by lihongbin on 16/3/23.
 */

var crypto = require('crypto');
var seedrandom = require('seedrandom');
var dbh = App.dbHelper;

exports.scheduleOnce = function(fn, timeout, timeoutMax) {
    if (_.isArray(timeout)) {
        timeout = timeout[0];
        timeoutMax = timeout[1];
    }
    if (timeoutMax) {
        return setTimeout(fn, this.randomInt(Math.round(timeout * 1000), Math.round(timeoutMax * 1000)));
    } else {
        return setTimeout(fn, timeout * 1000);
    }
};

/**
 * Returns a random real number in [min, max)
 * @nosideeffects
 */
exports.randomReal = function(min, max) {
    return Math.random() * (max - min) + min;
};

/**
 * Returns a random integer in [min, max]
 * Using Math.round() will give you a non-uniform distribution!
 * @nosideeffects
 */
exports.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * return true with given rate
 * @param rate: a [0, 1] rate
 */
exports.randomRate = function(rate) {
    return Math.random() < rate;
};

exports.randomByWeight = function(weights) {
    var sum = 0;
    weights.forEach(weight => sum += weight);
    var r = Math.random() * sum;
    for (var i = 0; r > weights[i]; ++i) {
        r -= weights[i];
    }
    return i;
};

exports.randomByWeightForObj = function(meta, key) {
    var sum = 0;
    _.each(meta, v => sum += v[key]);
    var r = Math.random() * sum;
    return _.find(meta, v => {
        if (r < v[key]) {
            return true;
        }
        r -= v[key];
    })
};

exports.sampleN = function(meta, num) {
    var ret = [];
    for (var i = 0; i < num; i++) {
        ret.push(_.sample(meta));
    }
    return ret;
};

exports.randomRound = function(num) {
    var int = Math.floor(num);
    var rate = num - int;
    return int + this.randomRate(rate);
};

exports.clamp = function(n, min, max) {
    return Math.max(Math.min(n, max), min);
};

exports.isBetween = function(n, min, max) {
    return n >= min && n <= max;
};

exports.incr = function(obj, key, n) {
    if (n === void 0) { n = 1; }
    obj[key] = obj[key] ? obj[key] + n : n;
    return obj[key];
};

exports.objAdd = function(obj, src) {
    obj = obj || {};
    _.each(src, (v, k) => {
        this.incr(obj, k, v);
    });
    return obj;
};

exports.safeAdd = function (val, add) {
    return _.isNumber(val) ? (val+add) : add;
};

exports.loopNum = function(min, max, num, diff) {
    var len = max - min + 1;
    diff = diff % len;
    num += diff;
    if (num > max) {
        num -= len;
    }
    if (num < min) {
        num += len;
    }
    return num;
};

exports.floatEqual = function(n1, n2, epsilon) {
    return Math.abs(n1 - n2) < (epsilon || 0.0001);
};

exports.sum = function(arr) {
    var sum = 0;
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        sum += arr[i];
    }
    return sum;
};

exports.wrapResp = function(res, player, cb) {
    if (res instanceof Error) {
        res = {errno: 500, errmsg: res.message || res + ""};
    } else if (_.isUndefined(res.errno)) {
        if (_.isFunction(res.toObject)) {
            res = res.toObject();
        }
        res = {errno: 0, data: res};
    }
    if (player) {
        var save = false;
        var sync = {ts: Date.now()};
        if (player.isModified('gold')) {
            sync.gold = player.gold;
            //player.update({$set:{cash: player.cash}}).exec();
            //save = true;
        }

        res.sync = sync;
        if (save) {
            player.save((err) => {
                if (err) {
                    Log.error("save player error", err);
                }
                cb(err, res);
            }); // 重大bug  连续两个save会导致数据异常，数组相同元素push两次或以上
        }
    }
    cb(null, res);
};

/**
 * 给客户端发消息
 */
exports.pushMessageTo = function(uid, msg, cb) {
    cb = cb || function() {};
    App.rpcCore.pushMessageTo(uid, uid, 'serverMessage', msg, cb);
};

exports.arrayInit = function(val, size) {
    var arr = [];
    for (var i = 0; i < size; i++) {
        arr.push(val);
    }
    return arr;
};

exports.parseJSON = function(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        Log.warn("[parseJSON] error", e);
        return null;
    }
};

exports.sign1758 = function(params) {
    var keys = _.keys(params).sort();
    var parts = _.map(keys, key => {
        if (key == "sign" || key == "sign_type") return;
        var val = params[key];
        return `${key}=${val == null ? "" : val}`;
    });
    var data = parts.join("&") + Conf.get("1758:appSecret");
    return crypto.createHash("md5").update(data, "utf-8").digest("hex");
};

exports.signLequ = function(params) {
    var keys = _.keys(params).sort();
    var parts = _.compact(_.map(keys, key => {
        if (key == "sign" || key == "sign_type") return;
        var val = params[key];
        return `${key}=${val == null ? "" : val}`;
    }));
    var data = parts.join("&") + "&"+Conf.get("lequ:appSecret");
    return crypto.createHash("md5").update(data, "utf-8").digest("hex");
};

exports.signParamsSpec = function(params, spec, mark, suffix, encode) {
    var parts = _.compact(_.map(spec, key => {
        if (key == "sign") return;
        var val = encode ? encodeURIComponent(params[key]) : decodeURIComponent(params[key]);
        return `${key}=${val == null ? "" : val}`;
    }));
    var data = parts.join(mark) + suffix;
    Log.info("signParamsSpec info: ",data);
    return crypto.createHash("md5").update(data, "utf-8").digest("hex");
};

exports.signParamsSort = function(params, mark, suffix, noEncode, method) {
    method = method || 'md5';
    var keys = _.keys(params).sort();
    var parts = _.compact(_.map(keys, key => {
        if (key == "sign" || key == 'signature') return;
        var val = noEncode? params[key] : encodeURIComponent(params[key]);
        return `${key}=${val == null ? "" : val}`;
    }));
    var data = parts.join(mark) + suffix;
    Log.info("signParamsSort info: ",data);
    return crypto.createHash(method).update(data, "utf-8").digest("hex");
};

exports.md5 = function(data) {
    return crypto.createHash("md5").update(data, "utf-8").digest("hex");
};

exports.getRPackMoney = function(remainSize, remainMoney) {
    if (remainSize == 1) {
        return remainMoney;
    }

    var min = 1;
    var max = remainMoney / remainSize * 2;
    return exports.randomInt(min, max);
};

exports.sendMail = function(uid, mailId, attach, cb) {
    App.db.Player.update(
        {_id: _.isArray(uid) ? {$in: uid}: uid},
        {
            $push: {
                mailbox: {
                    $each: [{mid: mailId, attNum: attach, time: Date.now()}],
                    $position: 0,
                    $slice: 50
                }
            },
            $inc: {
                unreadMail: 1
            }
        },
        {multi: _.isArray(uid)},
        () => {
            Log.info(`send mail to uid:${uid}, mailId:${mailId}, attach:${JSON.stringify(attach)}`);
            if (cb) cb();
        }
    );
};

exports.sendReward = function(uid, data, cb) {
    App.db.Player.update(
        {_id: _.isArray(uid) ? {$in: uid}: uid},
        {
            $push: {
                rewardCenter: {
                    $each: data,
                    $position: 0,
                    $slice: 50
                }
            },
            $set: {
                hasReward: true
            }
        },
        {multi: _.isArray(uid)},
        (err) => {
            if (err) {
                Log.info('send reward error', JSON.stringify(err));
            }
            Log.info(`send reward to uid:${uid}, reward:${JSON.stringify(data)}`);
            if (cb) cb();
        }
    );
};

exports.sendRewardMailByRank = function(servers, mailId, rankKey, rewardMeta, rewardKeys) {
    Async.eachLimit(servers, 2, (server, callback) => {
        var sid = server.id;
        App.dbHelper.getRankByRange(rankKey, 0, -1, sid, (err, ranks) => {
            if (err) {
                Log.error("[sendRewardMailByRank] error", err);
                return callback(err);
            }
            Async.eachSeries(rewardMeta, (r, cb) => {
                var start = r.range[0] - 1;
                var end = r.range[1];
                if (start >= ranks.length) { return cb() }
                var targets = ranks.slice(start, end);
                var ids = _.pluck(targets, 'id');
                Util.sendMail(ids, mailId, _.map(rewardKeys, k => r[k]), cb);
            }, callback);
        })
    }, (err) => {
        if (!err) {
            Log.stats("发放奖励", {ok:1});
        } else {
            Log.error("发放奖励失败", err);
        }
    });
};

exports.getRankMeta = function(conf, rank) {
    return _.find(conf, function(v) {
        var range = v["range"];
        return rank >= range[0] && rank <= range[1];
    });
};

exports.initArrWithNum = function(num, size) {
    var arr = [];
    for (var i = 0; i < size; i++) {
        arr.push(num);
    }
    return arr;
};

exports.itemsObjToArr = function(obj) {
    var arr = [];
    _.each(obj, (v, k) => {
        arr.push({id:k, num:v});
    });
    return arr;
};

exports.deleteObjInArr = function(arr, fn, num) {
    var has = _.countBy(arr, fn)['true'] || 0;
    if (has < num) {return [];}
    var ret = [];
    for (var i = arr.length - 1; i >= 0; i--) {
        var obj = arr[i];
        if (fn(obj)) {
            ret.push(obj);
            arr.splice(i, 1);
            num --;
        }
        if (!num) {
            return ret;
        }
    }
};

exports.lotEquipQuality = function(quality) {
    var ret;
    if (quality <= 4) {
        ret = 4;
    } else if (quality <= 6) {
        ret = 5;
    } else {
        ret = 6;
    }
    return ret;
};

exports.fightToPlayer = function(t1, tarId, cb) {
    if (!_.isObject(tarId)) {
        App.db.Bp.findById(tarId, (err, result) => {
            if (err) {
                return Log.info("fight to player error.");
            }
            var seed = Date.now();
            var t2 = result.battleInfo;
            _.each(t2.heroes, hero => hero.team = 2);
            var info = Share.commonBattle({t1, t2}, seedrandom(seed));

            cb({isWin: info.isWin, seed, t2});
        });
    } else {
        var seed = Date.now();
        var t2 = tarId;
        var info = Share.commonBattle({t1, t2}, seedrandom(seed));

        cb({isWin: info.isWin, seed, t2});
    }

};

exports.getRewardByLoot = function(player) {
    var rewardConf = util.randomByWeightForObj(Conf.lootReward, 'rate');
    var parts = rewardConf.id.split('_');
    var quality = parts[1];
    var ret = {num: 1, type: 'normal'};
    switch (parts[0]) {
        case 'treasure':
            var treasure = _.chain(Conf.treasure).filter(v => v.quality == quality).sample().value();
            var trIdx = util.randomInt(0, quality - 1);
            ret.type = 'treasurePiece';
            ret.id = treasure.name;
            ret.idx = trIdx;
            player.addTreasurePieces(ret.id, trIdx, 1);
            break;
        case 'heroPiece':
            var hero = _.chain(Conf.hero).filter(v => (v.quality == quality) && v.name != '主角').sample().value();
            ret.type = 'heroPiece';
            ret.id = hero.name;
            player.addHeroPieces(ret.id, 1);
            break;
        case 'wugong':
            var wugong = _.chain(Conf.skill).filter(v => v.quality == quality).sample().value();
            ret.type = 'wugongPiece';
            ret.id = wugong.name;
            player.addWugongPieces(ret.id, 1);
            break;
        case 'silver':
            var silver = Conf.level[player.level].coin / 2;
            silver = util.randomInt(silver, silver * 1.5);
            player.addItem('silver', silver, 'loot');
            ret.num = silver;
            ret.id = 'silver';
            break;
        default:
            ret.id = rewardConf.id;
            player.addItem(ret.id, rewardConf.num, 'loot');
            ret.num = rewardConf.num;
            break;
    }
    return ret;
};

exports.rewardObjToArr = function(obj) {
    var ret = [];
    _.each(obj, (v, k) => {
        switch (k) {
            case 'wugongPieces':
                ret = ret.concat(_.map(v, (num, name) => {
                    return {id: name, num, type: 'wugongPiece'}
                }));
                break;
            case 'hero':
                ret = ret.concat(_.map(v, (num, name) => {
                    return {id: name, num, type: 'hero'}
                }));
                break;
            case 'wugong':
                ret = ret.concat(_.map(v, (num, name) => {
                    return {id: name, num, type: 'wugong'}
                }));
                break;
            case 'treasure':
                ret = ret.concat(_.map(v, (num, name) => {
                    return {id: name, num, type: 'treasure'}
                }));
                break;
            case 'exp':
                ret.push({id: 'exp', num: v, type: 'exp'});
                break;
            default:
                ret.push({id: k, num: v});
                break;
        }
    });
    return ret;
};

exports.randomNickname = function(gender) {
    var conf = Conf.nickname;
    var surname = _.sample(conf.surname);
    var lastname;
    if (gender == 1) {
        lastname = _.sample(conf.male);
    } else {
        lastname = _.sample(conf.female);
    }

    return  surname + lastname;
};