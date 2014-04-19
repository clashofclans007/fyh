var path    = require('path');
var url     = require('url');
var request = require('request');
var fs      = require('fs');
var jsdom   = require('jsdom');
var config  = require('../../config');

var request = request.defaults({jar: true});

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var downloadUrl = req.query.url;
    var realPath = config.app.repository;

    if (downloadUrl.indexOf('divxplanet')) {
        request(downloadUrl, function(error, response, body){
            if (error) {
                console.log(error);
                res.send({});
                return;
            }

            jsdom.env(body, ["public/lib/jquery-2.1.0.min.js"], function (errors, window) {
                if (errors) {
                    console.log(errors);
                    res.send({});
                    return;
                }

                var $ = window.$;
                var postc = $('#dlform input[name=postc]').val();
                var id = $('#dlform input[name=id]').val();

                var newFilePath = realPath + '/test.rar';
                var params = {
                    postc: postc,
                    id: id
                };

                var options = {
                    url: 'http://divxplanet.com/indir.php',
                    method: 'POST',
                    form: params,
                    encoding: null
                };
                request(options, function(error, response, body){
                    var filename = response.headers['content-disposition'].match(/filename=\"(.*)\"/)[1];
                    var newFilePath = realPath + '/' + filename;

                    fs.writeFileSync(newFilePath, body);
                    res.send({});
                });
              }
            );
        });
    } else {
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
    }
};
