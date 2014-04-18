/**
 * Dosya ya da dizini siler.
 */

var path    = require('path');
var fs      = require('fs');
var rimraf  = require('rimraf');
var config  = require('../../config');

module.exports = function(req, res){
    if (req.params[0] == undefined) {
        res.send({});
        return;
    }

    var currentPath = '/' + path.normalize(req.params[0]);
    var realPath    = config.app.repository + currentPath;

    rimraf(realPath, function(){
        res.send({});
    });
};
