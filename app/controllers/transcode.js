var _       = require('underscore');
var path    = require('path');
var fs      = require('fs');
var FFmpeg  = require('fluent-ffmpeg');
var config  = require('../../config');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var filePath = '/' + path.normalize(req.query.path);
    var extname = path.extname(filePath);
    var realFilePath = path.normalize(config.app.repository + filePath);
    var outputFilePath = realFilePath.replace(extname, '.mp4');

    new FFmpeg({source: realFilePath})
        .withVideoCodec('libx264')
        .withAudioCodec('libfaac')
        .toFormat('mp4')
        .on('error', function(err) {
            res.send({});
        })
        .on('end', function() {
            res.send({});
        })
        .saveToFile(outputFilePath);
};