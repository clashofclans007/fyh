/**
 * Verilen bağlantıdaki dosyayı isteğin yapıldığı sırada bulunulan dizine indirir.
 */

var path    = require('path');
var url     = require('url');
var request = require('request');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var downloadUrl = req.query.url.toString();
    var downloadPath = '/' + path.normalize(req.query.path);
    var realDownloadPath = path.normalize(config.app.repository + downloadPath);

    request.get(downloadUrl, function(error, response, body){
        if (error) {
            res.send({});
            return;
        }

        try {
            var filename = response.headers['content-disposition'].match(/filename=\"(.*)\"/)[1];
        } catch (err) {
            var parsedUrl = url.parse(downloadUrl);
            var filename = path.basename(parsedUrl.pathname);
        }

        var newFilePath = realDownloadPath + '/' + filename;
        fs.writeFileSync(newFilePath, body);
        res.send({});
    });
};
