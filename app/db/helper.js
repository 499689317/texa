/**
 * Created by lihongbin on 16/3/23.
 */

var MAGIC_NUMBER_FOR_SCORE = 10000000;

var getElapsedSeconds = function() {
    var start = moment("2016 4 1", "YYYY MM DD");
    return moment().unix() - start.unix();
};

var encodeScoreWithTime = function(score) {
    return score * MAGIC_NUMBER_FOR_SCORE + MAGIC_NUMBER_FOR_SCORE - (getElapsedSeconds() % MAGIC_NUMBER_FOR_SCORE);
};

var decodeScoreWithTime = function(val) {
    return Math.floor(val / MAGIC_NUMBER_FOR_SCORE);
};


exports.updateRank = function(key, val, uid, sid, callback) {
    App.rds.zadd(key + sid, val, uid, callback);
};

exports.incrRankScore = function(key, val, uid, sid, callback) {
    App.rds.zincrby(key + sid, val, uid, (err, ret) =>{
        callback(err, ret)
    });
};

exports.updateRankIfHigher = function(key, val, uid, sid, callback) {
    App.rds.zscore(key + sid, uid, (err, score) => {
        if (err) return callback(err);
        if (val <= score) {
            callback();
        } else {
            exports.updateRank(key, val, uid, sid, callback);
        }
    });
};

exports.delKey = function(key, sid, callback) {
    App.rds.del(key + sid, callback);
};

exports.getRank = function(key, uid, sid, callback) {
    var func = _.endsWith(key, '-rev') ? "zrevrank" : "zrank";
    App.rds[func](key + sid, uid, callback);
};

exports.removeRank = function(key, uid, sid, callback) {
    App.rds.zrem(key + sid, uid, callback);
};

exports.clearRank = function(key, sid, callback) {
    App.rds.zremrangebyrank(key + sid, 0, -1, callback);
};

exports.getScore = function(key, uid, sid, callback) {
    App.rds.zscore(key + sid, uid, (err, score) => {
        callback(err, score);
    })
};

exports.getRankAndScore = function(key, uid, sid, callback) {
    Async.parallel({
        rank: function(cb) {
            var func = _.endsWith(key, '-rev') ? "zrevrank" : "zrank";
            App.rds[func](key + sid, uid, cb);
        },
        score: function(cb) {
            App.rds.zscore(key + sid, uid, (err, score) => {
                cb(err, score)
            });
        }
    }, callback);
};

exports.getPidByRank = function(key, rank, sid, callback) {
    this.getRankByRange(key, rank, rank, sid, (err, res) => {
        callback(err, res[0] ? res[0].id : "");
    })
};

exports.getPidByScore = function(key, score, sid, callback) {
    App.rds.zrangebyscore(key + sid, score, score, (err, res) => {
        callback(err, res[0]);
    });
};

exports.getRankByRange = function(key, start, end, sid, callback) {
    var func = _.endsWith(key, '-rev') ? "zrevrange" : "zrange";
    App.rds[func](key + sid, start, end, "withscores", (err, res) => {
        if (err) return callback(err);
        var ret = [];
        for (var i = 0; i < res.length; i += 2) {
            var score = parseInt(res[i + 1]);
            ret.push({ id: res[i], score: score, rank: start + Math.floor(i/2) });
        }
        callback(null, ret);
    });
};

exports.getRankSize = function(key, sid, callback) {
    App.rds.zcard(key + sid, callback);
};

exports.getScoreWithSize = function(key, uid, sid, callback) {
    var rKey = key + sid;
    App.rds.multi().zscore(rKey, uid)
        .zcard(rKey)
        .exec((err, replies) => {
            if (err) callback(err);
            else callback(null, {score: replies[0], size: replies[1]})
        });
};

exports.getRankWithSize = function(key, uid, sid, callback) {
    var rKey = key + sid;
    var func = _.endsWith(key, '-rev') ? "zrevrank" : "zrank";
    App.rds.multi()[func](rKey, uid)
        .zcard(rKey)
        .exec((err, replies) => {
            if (err) callback(err);
            else callback(null, {rank: replies[0], size: replies[1]})
        });
};

exports.updateGuildBPRank = function(guild, callback) {
    callback = callback || function(){};
    var gid = guild.id, sid = guild.serverId;
    App.db.Player.aggregate()
        .match({_id: {$in: guild.members}})
        .group({_id: null, sumBp: {$sum: "$bp"}})
        .exec((err, data) => {
            if (err) {
                Log.error("update guild bp rank error", err);
                return callback(err);
            }
            var bp = data[0].sumBp;
            guild.bp = bp;
            guild._rankUpdated = new Date();
            Log.stats("更新公会战力榜", {gid: guild.id, num: guild.bp});
            exports.updateRank(Consts.REDIS_KEY_RANK_GUILD_BP, bp, gid, sid, (err) => callback(err, bp));
        });
};

exports.getGuildBPRank = function(gid, sid, cb) {
    exports.getRankAndScore(Consts.REDIS_KEY_RANK_GUILD_BP, gid, sid, cb);
};