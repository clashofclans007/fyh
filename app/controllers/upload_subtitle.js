var path    = require('path');
var url     = require('url');
var request = require('request');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var downloadUrl = req.query.url;
    var realPath = config.app.repository;

    request.head(downloadUrl, function(error, response){
        if (error) {
            res.send({});
            return;
        }

        if (response.statusCode == 200) {
            var filename = response.headers['content-disposition'].match(/filename=\"(.*)\"/)[1];
            var newFilePath = realPath + '/' + filename;
            request(downloadUrl).pipe(fs.createWriteStream(newFilePath)).on('close', function(){
                res.send({});
            }).on('error', function(){
                res.send({});
            });
        } else {
            res.send({});
        }
    });
};
