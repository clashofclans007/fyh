/**
 * Verilen bağlantıdaki dosyayı isteğin yapıldığı sırada bulunulan dizine indirir.
 *
 * TODO : Dosya adı bulunmayan bağlantılarda sorun çıkabilir.
 */

var path    = require('path');
var url     = require('url');
var request = require('request');
var config  = require('../../config');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var currentPath = path.normalize(req.query.path || '/');
    var realPath = config.repository + currentPath;

    var downloadUrl = req.query.url;
    var parsedUrl = url.parse(downloadUrl);
    var basename = path.basename(parsedUrl.pathname);
    var newFilePath = realPath + '/' + basename;

    request(downloadUrl, function(error, response, body){
        if (error) {
            res.send({});
            return;
        }

        fs.writeFileSync(newFilePath, body);
        res.send({});
    });
};
