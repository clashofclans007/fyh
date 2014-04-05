/**
 * TODO : Stream close action
 */

var _       = require('underscore');
var async   = require('async');
var http    = require('http');
var path    = require('path');
var fs      = require('fs');
var express = require('express');
var config  = require('./config');

/**
 * @see http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 */
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

/**
 * Stream port queue
 */
var streamPort = null;
var streamPortQueue = async.queue(function(task, callback){
    if (streamPort == null) {
        streamPort = config.streamPortRange[0];
    } else {
        streamPort++;
    }
    callback(null, streamPort);
}, 1);

/**
 * Application
 */
var app = express();
app.use(express.static('public'));

// simple logger
app.use(function(req, res, next){
    console.log('%s %s', req.method, req.url);
    next();
});

/**
 * Get folders & files
 */
app.get('/api/v1/ls', function(req, res){
    var currentPath = path.normalize(req.query.path || '/');
    var realPath = config.repository + currentPath;
    var pathInfo = fs.readdirSync(realPath);
    var files = [];
    var folders = [];

    _.each(pathInfo, function(item){
        var stat = fs.statSync(realPath + '/' + item);
        item = {
            name: item,
            path: currentPath + '/' + item
        };

        if (stat.isFile()) {
            item.size = bytesToSize(stat.size);
            // TODO : Check other formats
            if (path.extname(item.path) == '.mp4') {
                item.isVideo = true;
            }

            files.push(item);
        } else {
            item.path = currentPath + '/' + item.name;
            item.totalCount = 0; // TODO
            item.totalSize = 0; // TODO

            folders.push(item);
        }
    });

    res.send({
        currentPath: currentPath,
        files: files,
        folders: folders
    });
});

/**
 * Download selected file.
 */
app.get('/api/v1/download', function(req, res){
    var currentPath = path.normalize(req.query.path || '/');
    var realPath = config.repository + currentPath;
    res.sendfile(realPath);
});

/**
 * Stream selected video file
 */
app.get('/api/v1/stream', function(req, res){
    var currentPath = path.normalize(req.query.path || '/');
    var realPath = config.repository + currentPath;

    streamPortQueue.push({}, function(err, port){
        if (err) {
            // TODO : Send error message
            res.send({});
            return;
        }

        /**
         * @see https://gist.github.com/lleo/8614403
         */
        var streamServer = http.createServer(function (streamReq, streamRes) {
            var stat = fs.statSync(realPath)
                , total = stat.size;

            if (streamReq.headers['range']) {
                var range = streamReq.headers.range
                    , parts = range.replace(/bytes=/, "").split("-")
                    , partialstart = parts[0]
                    , partialend = parts[1]
                    , start = parseInt(partialstart, 10)
                    , end = partialend ? parseInt(partialend, 10) : total-1
                    , chunksize = (end-start)+1;

                console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

                var file = fs.createReadStream(realPath, {start: start, end: end});

                streamRes.writeHead(206
                    , { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total
                        , 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
                        , 'Content-Type': 'video/mp4'
                    });
                file.pipe(streamRes);
            }
            else {
                console.log('ALL: ' + total);
                streamRes.writeHead(200
                    , { 'Content-Length': total
                        , 'Content-Type': 'video/mp4'
                    });
                fs.createReadStream(path).pipe(streamRes);
            }
        }).listen(port, function(){
            console.log('Streaming on port %d for file : %s', streamServer.address().port, realPath);

            res.send({
                url: 'http://' + config.streamUrl + ':' + streamServer.address().port
            });
        });
    });
});

// Run server
var server = app.listen(8080, function(){
    console.log('Listening on port %d', server.address().port)
});