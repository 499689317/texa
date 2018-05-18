/**
 * Created by lijie on 16/3/7.
 * Copyright (c) 2016 LeDongTian. All rights reserved.
 */
var crc    = require('crc');
var Mixed = require('mongoose').Schema.Types.Mixed;

exports.schema = {
    _id             : Number,
    platform        : { type: String,  default: "" },           // 平台名称
    uniqueId        : { type: String,  index: true },           // 平台ID
    name            : String,                                   // 玩家昵称
    headImg         : String,                                   // 玩家头像
    sex             : String,                                   // 玩家性别
    channel         : { type: String,  default: "" },           // 玩家渠道
    serverId        : { type: String,  index: true },           // 服务器Id
    createdAt       : { type: Date,    default: Date.now },     // 创建时间
    addr            : { type: [String] },
    _lastLoginTime  : { type: Date,    default: Date.now },     // 上次登录时间
    _lastLogoutTime : Date,                                     // 上次登出时间
    repo            : { type: Mixed,   default: {} },           // 背包
    level           : { type: Number,  default: 1 },            // 玩家等级
    exp             : { type: Number,  default: 0 },            // 经验
    coin             : { type: Number,  default: 0 },           // 金币
};


exports.virtuals = {

};

exports.subDocuments = {

};

exports.schemaOptions = {
    versionKey: false,
    toObject: {
        transform(doc, ret, options) {
            ret.id = ret._id;
            var login = ret._lastLoginTime,
                logout = ret._lastLogoutTime;
            if (login) {
                if (!logout || logout < login) {
                    ret.lastOnline = 0;
                } else {
                    ret.lastOnline = Math.floor((Date.now() - logout) / 1000);
                }
            }
            ret.heroes = _.filter(ret.heroes, v => _.contains(ret.formation, v.id.toString()));
            delete ret._lastLoginTime;
            delete ret._lastLogoutTime;
            delete ret._id;
            delete ret.__v;
        }
    }
};

exports.methods = {

    isOnline() {
        return !!this.frontId;
    },

    hasItem(id, num, target) {
        var parts = id.split('_'),
            type = parts[0],
            no = parts[1];
        target = target || 'repo';
        if (!_.isNumber(num) || num <= 0) {
            return false;
        }
        if (!_.isUndefined(this[id])) {
            return this[id] >= num;
        } else {
            return (this[target][id] || 0) >= num;
        }
    },

    hasItems(items) {
        return !_.find(items, it => !this.hasItem(it.id, it.num, it.target));
    },

    useItem(id, num, reason, target) {
        if (!this.hasItem(id, num, target)) return false;
        this.addItem(id, -num, reason, target);
        return true;
    },

    useItems(items, reason) {
        if (!this.hasItems(items)) return false;
        _.each(items, it => this.useItem(it.id, it.num, reason, it.target));
        return true;
    },

    addItems(items, reason) {
        _.each(items, it => this.addItem(it.id, it.num, reason, it.target));
    },

    addItem(id, num, reason, target) {
        var data = id;
        target = target || 'repo';
        if (_.isObject(id)) {
            reason = num;
            num = data.num;
            id = data.id;
        }
        if (!num) {return;}
        if (isNaN(num)) {
            Log.error("addGoods 非法的num", {num:num, type:id, reason:reason});
            return;
        }
        num = Math.ceil(num);
        var parts = id.split('_'),
            type = parts[0],
            no = parts[1];
        var remain = 0;
        switch (type) {
            case 'coin':
            case 'gold':
                Util.incr(this, id, num);
                remain = this[id];
                break;
            default:
                Util.incr(this[target], id, num);
                if (this[target][id] == 0) delete this[target][id];
                this.markModified(`${target}.${id}`);
                remain = this[target][id];
                break;
        }
        Log.stats(num > 0 ? '增加物品' : '减少物品', {num, id, reason, uid: this.id, remain})
    },

    toLog() {
        return _.pick(this, "uid", "uniqueId", "name", "serverId");
    },

    saveIfOffline(cb) {
        cb = cb || function(){};
        if (this.frontId) return cb();
        this.save((err) => {
            if (err) {
                Log.error("save player error", err);
            }
            cb(err);
        });
    }
};
