var _       = require('underscore');
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
            name: item
        };

        if (stat.isFile()) {
            item.size = bytesToSize(stat.size);

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

// Run server
var server = app.listen(8080, function(){
    console.log('Listening on port %d', server.address().port)
});