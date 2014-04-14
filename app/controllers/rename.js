var path    = require('path');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    var oldPath = '/' + path.normalize(req.query.path);
    var realOldPath    = path.normalize(config.repository + oldPath);

    var newPath = '/' + path.normalize(req.query.newPath);
    var realNewPath = path.normalize(config.repository + newPath);

    fs.rename(realOldPath, realNewPath, function(){
        res.send({});
    });
};
