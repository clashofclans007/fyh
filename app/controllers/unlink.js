/**
 * Arşiv dosyalarını, bulunduğu dizine arşiv dosyası ile aynı isimli bir klasör oluşturarak açar.
 */

var path    = require('path');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    if (req.params[0] == undefined) {
        res.send({});
        return;
    }

    var currentPath = '/' + path.normalize(req.params[0]);
    var realPath    = config.repository + currentPath;

    var stat = fs.statSync(realPath);
    if (stat.isFile()) {
        fs.unlink(realPath, function(error){
            res.send({});
        });
    } else {
        fs.rmdir(realPath, function(error){
            res.send({});
        });
    }
};
