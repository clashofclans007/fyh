var _               = require('underscore');
var fs              = require('fs');
var path            = require('path');
var request         = require('request');
var OpenSubtitle    = require('../../opensubtitle');
var config          = require('../../config');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var filePath = '/' + path.normalize(req.query.path);
    var realFilePath = path.normalize(config.app.repository + filePath);
    var realDirName = path.dirname(realFilePath);

    OpenSubtitle.findForFile(realFilePath, "tur", function(results){
        if (results.length == 0) {
            res.send({});
            return;
        }

        request.head(results[0].ZipDownloadLink, function(error, response, body){
            if (error) {
                res.send({});
                return;
            }

            if (response.statusCode == 200) {
                var filename = response.headers['content-disposition'].match(/filename=\"(.*)\"/)[1];
                var newFilePath = realDirName + '/' + filename;
                request(results[0].ZipDownloadLink)
                    .pipe(fs.createWriteStream(newFilePath))
                    .on('close', function(){
                        res.send({});
                    }).on('error', function(){
                        res.send({});
                    });
            } else {
                res.send({});
            }
        });
    });
};
