var _       = require('underscore');
var request = require('request');
var jsdom   = require('jsdom');
var zlib    = require('zlib');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var gunzip = zlib.createGunzip();
    var output = "";

    gunzip.on('data', function(data){
        output += data.toString();
    });

    gunzip.on('end', function(){
        jsdom.env(output, ["public/lib/jquery-2.1.0.min.js"], function (errors, window) {
            if (errors) {
                console.log(errors);
                res.send({});
                return;
            }

            var $ = window.$;
            res.send({
                html: $('#torrent_files').html().toString()
            })
          }
        );
    });

    gunzip.on('error', function(error){
        console.log(error);
        res.send({});
    });
    request(req.query.link.toString()).pipe(gunzip);
};
