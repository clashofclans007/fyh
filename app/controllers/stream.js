var fs      = require('fs');
var path    = require('path');
var config  = require('../../config');

module.exports = function(req, res){
    var currentPath = path.normalize(req.query.path || '/');
    var realPath    = config.app.repository + currentPath;
    var extname     = path.extname(realPath);
    var contentType = 'video/mp4';

    if (extname == '.mkv'){
        contentType = 'video/mkv';
    } else if (extname == '.webm') {
        contentType = 'video/webm';
    } else if (extname == '.ogv') {
        contentType = 'video/ogg';
    }

    var stat = fs.statSync(realPath)
        , total = stat.size;

    if (req.headers['range']) {
        var range = req.headers.range
            , parts = range.replace(/bytes=/, "").split("-")
            , partialstart = parts[0]
            , partialend = parts[1]
            , start = parseInt(partialstart, 10)
            , end = partialend ? parseInt(partialend, 10) : total-1
            , chunksize = (end-start)+1;

        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

        res.writeHead(206
            , { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total
                , 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
                , 'Content-Type': contentType
            });

        var stream = fs.createReadStream(realPath, {start: start, end: end});
    } else {
        console.log('ALL: ' + total);
        res.writeHead(200
            , { 'Content-Length': total
                , 'Content-Type': contentType
            });
        var stream = fs.createReadStream(realPath);
    }

    stream.on('open', function(){
        stream.pipe(res);
    });

    stream.on('error', function(err){
        console.log(err);
        res.destroy();
    });

    res.on('close', function(){
        stream.destroy();
    });
};