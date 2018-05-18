
function fetch(method, path, param) {

    return function (cb) {

        var cfg = require("url").parse(path);
        cfg.method = method;
        if (method.toLowerCase() === 'post') {
            cfg.headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'  
            };
        };

        if (typeof param === 'object') {
            var keys = Object.keys(param);
            var arr = [];
            for (var i = 0; i < keys.length; i++) {
                arr.push(keys[i] + "=" + param[keys[i]]);
            };
            var data = arr.join("&");
        }else{
            var data = param || null;
        }
            

        var http = path.slice(0, 5) === 'https' ? require("https") : require('http');
        var req = http.request(cfg, function (res) {
            var chunks = [];
            var size = 0;

            if (res.statusCode !== 200) {
                cb(null, new Error("statusCode is not 200, is " + res.statusCode));
                return;
            };

            res.on("data", function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });

            res.on("end", function () {
                var str = Buffer.concat(chunks, size).toString();
                chunks = size = null;
                cb(null, str);
            });

            res.on("error", function (err) {
                cb(null, err);
            });
        });

        req.on("error", function (err) {
            cb(null, err);
        });

        req.setTimeout(5000, function () {
            cb(null, new Error("Timeout"));
        });  

        req.end(data);
    }
};
exports.get = function(path, cb) {
	fetch('get', path)(cb);
};
exports.post = function(path, param, cb) {
	fetch('post', path, param)(cb);
};



