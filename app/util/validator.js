/**
 * Created by lihongbin on 17/3/10.
 */

var validator = require("validator");
var _ = require("lodash");

/***
 *
 equals(str, comparison) - check if the string matches the comparison.
 contains(str, seed) - check if the string contains the seed.
 matches(str, pattern [, modifiers]) - check if string matches the pattern. Either matches('foo', /foo/i) or matches('foo', 'foo', 'i').
 isEmail(str) - check if the string is an email.
 isURL(str [, options]) - check if the string is an URL. options is an object which defaults to { protocols: ['http','https','ftp'], require_tld: true, require_protocol: false }.
 isIP(str [, version]) - check if the string is an IP (version 4 or 6).
 isAlpha(str) - check if the string contains only letters (a-zA-Z).
 isNumeric(str) - check if the string contains only numbers.
 isAlphanumeric(str) - check if the string contains only letters and numbers.
 isHexadecimal(str) - check if the string is a hexadecimal number.
 isHexColor(str) - check if the string is a hexadecimal color.
 isLowercase(str) - check if the string is lowercase.
 isUppercase(str) - check if the string is uppercase.
 isInt(str) - check if the string is an integer.
 isFloat(str) - check if the string is a float.
 isDivisibleBy(str, number) - check if the string is a number that's divisible by another.
 isNull(str) - check if the string is null.
 isLength(str, min [, max]) - check if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 isByteLength(str, min [, max]) - check if the string's length (in bytes) falls in a range.
 isUUID(str [, version]) - check if the string is a UUID (version 3, 4 or 5).
 isDate(str) - check if the string is a date.
 isAfter(str [, date]) - check if the string is a date that's after the specified date (defaults to now).
 isBefore(str [, date]) - check if the string is a date that's before the specified date.
 isIn(str, values) - check if the string is in a array of allowed values.
 isCreditCard(str) - check if the string is a credit card.
 isISBN(str [, version]) - check if the string is an ISBN (version 10 or 13).
 isJSON(str) - check if the string is valid JSON (note: uses JSON.parse).
 isAscii(str) - check if the string contains ASCII chars only.
 *
 */

module.exports = function(params, ruleset) {
    var msg = null;
    _.each(ruleset, function(rules, paramName) {
        if (msg) return;
        var paramValue = params[paramName];
        if (typeof rules === "string") {
            if (typeof paramValue === "undefined") {
                msg = "missing param " + paramName;
            } else if (!validator[rules](paramValue)) {
                msg = 'invalid param ' + paramName;
            }
        } else {
            if (typeof paramValue === "undefined") {
                if (rules["required"] !== false) {
                    msg = "missing param " + paramName;
                }
                return;
            }
            _.each(rules, function(condition, ruleName) {
                if (ruleName === "required") return;
                if (!validator[ruleName](paramValue, condition)) {
                    msg = 'invalid param ' + paramName;
                }
            });
        }
    });
    if (msg) {
        return { errno: 400, errmsg: msg };
    }
};


// some extension of validator.js

var positiveInt = /^(?:0|[1-9][0-9]*)$/;

validator.isPositiveInt = validator.isId = function(str) {
    return positiveInt.test(str);
};

validator.isNotEmpty = function(str) {
    return str != null && str !== "";
};

validator.isBoolean = _.isBoolean;
