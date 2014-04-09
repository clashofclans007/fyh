/**
 * Arşiv dosyalarını, bulunduğu dizine arşiv dosyası ile aynı isimli bir klasör oluşturarak açar.
 */

var path    = require('path');
var fs      = require('fs');
var config  = require('../../config');
var unzip   = require('unzip');
var exec    = require('child_process').exec;

module.exports = function(req, res){
    var currentPath = path.normalize(req.query.path || '/');
    var realPath    = config.repository + currentPath;
    var extname     = path.extname(realPath);
    var basename    = path.basename(realPath, extname);
    var output      = path.dirname(realPath) + '/' + basename;

    if (extname == '.zip') {
        fs.createReadStream(realPath).pipe(unzip.Extract({ path: output })).on('close', function(){
            res.send({});
        });
    } else if (extname == '.rar') {
        exec("unrar x '" + realPath + "' '" + output + "/'", function(error, stdout, stderr){
            res.send({});
        });
    } else {
        res.send({});
    }
};
