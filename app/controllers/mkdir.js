/**
 * Yeni klasör oluşturur.
 */

var path    = require('path');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    var currentPath = '/' + path.normalize(req.query.path);
    var realPath    = path.normalize(config.repository + currentPath) + '/' + req.query.folder;

    fs.mkdir(realPath, function(){
        res.send({});
    });
};
