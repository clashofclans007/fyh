var fs      = require('fs');
var path    = require('path');
var config  = require('../../config');

module.exports = function(req, res){
    var currentPath = path.normalize(req.query.path || '/');
    var realPath    = config.repository + currentPath;

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

        var file = fs.createReadStream(realPath, {start: start, end: end});

        res.writeHead(206
            , { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total
                , 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
                , 'Content-Type': 'video/mp4'
            });
        file.pipe(res);
    }
    else {
        console.log('ALL: ' + total);
        res.writeHead(200
            , { 'Content-Length': total
                , 'Content-Type': 'video/mp4'
            });
        fs.createReadStream(realPath).pipe(res);
    }
};