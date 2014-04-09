/**
 * config.repository klasöründeki ya da istenilen alt dizinlerdeki dosya ve dizinleri döner.
 */

var _       = require('underscore');
var path    = require('path');
var fs      = require('fs');
var config  = require('../../config');

/**
 * @see http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 */
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

module.exports = function(req, res){
    var currentPath = '/';
    if (req.params[0] !== undefined) {
        currentPath = '/' + path.normalize(req.params[0]);
    }

    if (currentPath[currentPath.length - 1] !== '/') {
        currentPath += '/';
    }

    var realPath = config.repository + currentPath;
    var pathInfo = fs.readdirSync(realPath);
    var files = [];
    var folders = [];
    var breadcrumbs = [];

    _.each(pathInfo, function(item){
        var stat = fs.statSync(realPath + item);
        var itemPath = currentPath + item;
        item = {
            name: item,
            path: itemPath,
            fileUrl: config.getAppUrl() + itemPath
        };

        if (stat.isFile()) {
            item.size = bytesToSize(stat.size);
            // TODO : Check other formats
            var extension = path.extname(itemPath);
            if (extension == '.mp4') {
                item.isVideo = true;
            } else if(extension == '.srt') {
                item.isSubtitle = true;
            } else if(extension == '.zip' || extension == '.rar') {
                item.isArchive = true;
            } else {
                item.isNormal = true;
            }

            files.push(item);
        } else {
            item.path = itemPath;
            item.totalCount = 0; // TODO
            item.totalSize = 0; // TODO

            folders.push(item);
        }
    });

    var tempPath = '/';
    _.each(currentPath.split("/"), function(item){
        if (item.length > 0) {
            tempPath += item + '/';
            breadcrumbs.push({name: item, path: tempPath});
        }
    });

    res.send({
        currentPath: currentPath,
        breadcrumbs: breadcrumbs,
        files: files,
        folders: folders
    });
};