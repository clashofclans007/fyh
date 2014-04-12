/**
 * Dizin ya da dosyayı başka bir dizine taşır.
 */

var path    = require('path');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    var oldPath = '/' + path.normalize(req.query.path);
    var oldBasename = path.basename(oldPath);
    var realOldPath    = path.normalize(config.repository + oldPath);

    var newPath = '/' + path.normalize(req.query.newPath);
    var realNewPath = path.normalize(config.repository + newPath + '/' + oldBasename);

    fs.rename(realOldPath, realNewPath, function(){
        res.send({});
    });
};
