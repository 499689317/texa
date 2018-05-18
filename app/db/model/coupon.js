/**
 * Created by joker on 16/6/6.
 */

exports.schema = {

    _id         : String,
    type        : String,
    group       : { type: String, index: true },
    goods       : [{
        _id     : false,
        id      : String,
        num     : Number
    }],
    expireAt    : Date,
    usedAt      : Date,
    usedBy      : { type: Number, default: 0, index: true }
};
