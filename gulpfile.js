var fs          = require('fs');
var path        = require('path');
var _           = require('lodash');
var s           = require("underscore.string");
var gulp        = require('gulp');
var gulpsync    = require('gulp-sync')(gulp);
var rename      = require('gulp-rename');
var intercept   = require('gulp-intercept');
//var del = require('del');
var concat      = require('gulp-concat');
var streamqueue = require('streamqueue');
var pngquant    = require('imagemin-pngquant');
var imageOptim  = require('gulp-imageoptim');
var spawn       = require('child_process').spawn;
var exec       = require('child_process').exec;
var crc16       = require('crc-itu').crc16;

_.mixin(s);

function walk(path, fileList) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
        if (fs.statSync(path + '/' + item).isDirectory()) {
            walk(path + '/' + item, fileList);
        } else {
            fileList.push(path + '/' + item);
        }
    });
}

function calcCRC(fname) {
    var buffer = fs.readFileSync(fname);
    return crc16(buffer).toString('16');
}


/** =========================== **/
/**      Process Resources      **/
/** =========================== **/

var scan = function(root, resList, excludes, groupList)  {
    var files = [];
    var typeMap = { '.json': 'json', '.png': 'image', '.jpg': 'image', '.fnt': 'font', '.mp3': 'sound' };
    var groups = {};
    walk(root, files);
    files.forEach(function(file) {
        var name = path.basename(file);
        var ext = path.extname(file);
        var dir = s.strLeft(s.strRight(file, root + '/'), '/' + name);
        dir = dir == name ? "" : dir;
        if (excludes && excludes.indexOf(dir) != -1 || !ext) return;
        var resName = (dir ? dir + "/" : dir) + name.replace('.', '_');
        resList.push({
            name: resName,
            type: typeMap[ext],
            url: s.strRight(file, 'resource/') + "?" + calcCRC(file)
        });
        if (groupList) {
            var groupName = s.strLeft(resName, '/');
            if (groupName != resName) {
                groups[groupName] = groups[groupName] || [];
                groups[groupName].push(resName);
            }
        }
    });
    _.each(groups, function(list, name) {
        groupList.push({
            name: name,
            keys: list.join(',')
        });
    })
};


gulp.task('tex', gulpsync.sync(['_tex', 'res', 'pngquant']));


gulp.task('_tex', function(cb) {
    var task = spawn('python', [__dirname + '/tool/pack_texture.py']);
    task.stdout.on('data', function (data) { process.stdout.write(data + ""); });
    task.stderr.on('data', function (data) { process.stdout.write(data + ""); });
    task.on('close', cb);
});

gulp.task('res', function() {
    var data = JSON.parse(fs.readFileSync("resource/res.json", 'utf-8'));
    var dirList = ['armature', 'movieclip', 'image', 'sprite', 'particle', 'font', 'sound'];
    data.resources = _.reject(data.resources, function(item) {
        return _.find(dirList, function(dir) { return s.startsWith(item.url, dir) });
    });
    data.groups = _.reject(data.groups, function(group) {
        return ["home", "preload", "postload"].indexOf(group.name) == -1;
    });


    //scan('resource/particle', data.resources);
    scan('resource/armature', data.resources);
    scan('resource/movieclip', data.resources);
    scan('resource/image', data.resources);
    scan('resource/font', data.resources);
    scan('resource/sound', data.resources);

    var files = [];
    walk('resource/sprite', files);
    files.forEach(function(file) {
        if (_.endsWith(file, ".json")) {
            data.resources.push({
                name: path.basename(file, '.json'),
                type: 'sheet',
                url: s.strRight(file, 'resource/') + "?" + calcCRC(file)
            });
        }
    });

    fs.writeFileSync('resource/res.json', JSON.stringify(data, null, '\t'));

    var wing = JSON.parse(fs.readFileSync("wingProperties.json", 'utf-8'));
    var res = wing["resourcePlugin"]["library"];
    res.children = _.reject(res.children, function(item) {
        return item.children && s.startsWith(item.name, 'sprite_');
    });

    data = JSON.stringify(wing, null, '\t')
        .replace(/: /g, ":")
        .replace(/\[\n\s+([^,]+)\n\s+\]/g, "[$1]")
        .replace(/configs":\[\s+\{/, `configs":[{`)
        .replace(/}\n\s+],/, "}],");
    fs.writeFileSync('wingProperties.json', data);
});


/** =========================== **/
/**     Process Config JSON     **/
/** =========================== **/

function groupBy(name, key1, key2) {
    var fname = "../conf/" + name + ".json";
    var json = JSON.parse(fs.readFileSync(fname, 'utf-8'));
    json = _.map(json, function(f) { return _.omit(f, 'id') });
    var ret = {};
    _.each(json, function(meta) {
        if (key2) {
            ret[meta[key1]] = ret[meta[key1]] || {};
            ret[meta[key1]][meta[key2]] = meta;
        } else {
            ret[meta[key1]] = ret[meta[key1]] || [];
            ret[meta[key1]].push(meta);
        }
    });
    fs.writeFileSync(fname, JSON.stringify(ret, null, 2));
}

function combineJSON() {
    var files = [];
    walk('../conf/', files);
    var conf = {};
    _.each(files, function(file) {
        var key = path.basename(file, '.json');
        if (s.endsWith(key, "_server")) return;
        var json = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (key == 'config') {
            _.extend(conf, json);
        } else {
            conf[key] = json;
        }
    });
    var code = "var Conf = " + JSON.stringify(conf, null, 4);
    fs.writeFileSync("src/system/Conf.ts", code);
}

gulp.task('conf', function(cb) {
    exec('rm ' + __dirname + '/../conf/.DS_Store');
    var task = spawn('python', [__dirname + '/tool/convert_excel.py']);
    task.stdout.on('data', function (data) { console.log(data + ""); });
    task.stderr.on('data', function (data) { console.log(data + ""); });
    task.on('close', function() {
        //groupBy('fish', "type", "color");
        //groupBy('level', 'stage', 'level');
        //groupBy('levelfish', 'stage');
        combineJSON();
        cb();
    });
});

gulp.task('mcrename', function (cb) {
    return gulp
        .src('movieClip/**')
        .pipe(rename(path => {
            if (path.extname === '.png' && !_.startsWith(path.basename, path.dirname)) {
                path.basename = path.dirname + '_' + path.basename;
            }
        }))
        .pipe(gulp.dest("./dist"))
});

/** =========================== **/
/**       Build And Release     **/
/** =========================== **/

gulp.task('_build', function(cb) {
    var task = spawn('egret', ["publish", "--version", "1.0"]);
    task.stdout.on('data', function (data) { console.log(data + ""); });
    task.stderr.on('data', function (data) { console.log(data + ""); });
    task.on('close', cb);
});

gulp.task('_index', function() {
    var path = "../client-dist/wuxia.html";
    var html = fs.readFileSync(path, "utf-8");

    // js加版本号
    var files = ["wuxia/main.min.js", "wuxia/base.min.js", "wuxia/lib.min.js"];
    files.forEach(function(file) {
        var hash = calcCRC("../client-dist/" + file);
        console.log(file, hash);
        html = html.replace(new RegExp(`"${file}[^"]*"`, 'g'), `"${file}?${hash}"`);
    });
    // default.thm.json res.json写入版本号
    var ver1 = calcCRC("../client-dist/wuxia/resource/res.json");
    var ver2 = calcCRC("../client-dist/wuxia/resource/default.thm.json");
    html = html.replace(/;;.*;;/g, `;;var RELEASE=true, VER_RES="${ver1}", VER_THM="${ver2}";;`);
    fs.writeFileSync(path, html, "utf-8");
});

gulp.task('post-build', function() {
    return gulp
        .src([
            "bin-release/web/1.0/**/*.*",
            "!bin-release/web/1.0/index.html",
            "!bin-release/web/1.0/libs",
            "!bin-release/web/1.0/libs/**"
        ])
        .pipe(intercept((file) => {
            // 删除sprite的json文件中的TexturePacker的SmartUpdateKey
            if (!/resource\/sprite\/.*\.json/.test(file.path)) return file;
            var json = file.contents.toString();
            file.contents = new Buffer(json.replace(/"ver":\s*"[^\"]*",\n/, ""));
            return file;
        }))
        .pipe(gulp.dest('../client-dist/wuxia'));
});

gulp.task('build', gulpsync.sync(['res', '_build', 'post-build', '_index']));

gulp.task('pack-libs', function() {
    var args = [
        { objectMode: true },
        gulp.src("libs/modules/egret/egret.min.js"),
        gulp.src("libs/modules/egret/egret.web.min.js"),
        gulp.src("libs/modules/game/game.min.js"),
        gulp.src("libs/modules/game/game.web.min.js")
    ];
    streamqueue.apply(this, args)
        .pipe(concat('base.min.js'))
        .pipe(gulp.dest('../client-dist/wuxia'));

    args = [
        { objectMode: true },
        gulp.src("libs/modules/tween/tween.min.js"),
        gulp.src("libs/modules/res/res.min.js"),
        gulp.src("libs/modules/eui/eui.min.js"),
        gulp.src("libs/modules/dragonbones/dragonbones.min.js"),
        gulp.src("libs/modules/pomelo/pomelo.min.js"),
        gulp.src("libs/modules/moment/moment.min.js"),
        gulp.src("libs/modules/underscore/underscore.min.js"),
        gulp.src("libs/modules/weixinapi/weixinapi.min.js"),
        gulp.src("libs/modules/seedrandom/seedrandom.min.js"),
        gulp.src("libs/modules/nest/nest.min.js"),
        gulp.src("libs/modules/egretsa/egretsa.min.js")

        //gulp.src("libs/modules/particle/particle.min.js"),
    ];
    return streamqueue.apply(this, args)
        .pipe(concat('lib.min.js'))
        .pipe(gulp.dest('../client-dist/wuxia'));
});

gulp.task('default', gulpsync.sync(['build']));

gulp.task('pngquant', function() {
    var list = ["ui_sbar", "ui_main"];
    return gulp.src(_.map(list, name => `./resource/sprite/${name}.png`))
        .pipe(pngquant({quality: '60-100', speed: 1, force: true})())
        .pipe(gulp.dest('./resource/sprite'));
});

gulp.task('imageoptim', function() {
    return gulp.src('./resource/sprite/*.png')
        .pipe(imageOptim.optimize())
        .pipe(gulp.dest('./resource/sprite'));
});

gulp.task('image', gulpsync.sync(['pngquant', 'imageoptim']));

