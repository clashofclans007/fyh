var path    = require('path');
var url     = require('url');
var request = require('request');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    var downloadUrl = 'http://www.opensubtitles.org/en/subtitleserve/sub/' + req.query.id;
    var realPath = config.repository;

    request(downloadUrl, function(error, response, body){
        if (error) {
            res.send({});
            return;
        }

        var filename = response.headers['content-disposition'].match(/filename=\"(.*)\"/)[1];
        var newFilePath = realPath + '/' + filename;
        fs.writeFileSync(newFilePath, body);
        res.send({});
    });
};
