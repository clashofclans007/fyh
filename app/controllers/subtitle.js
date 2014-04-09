/**
 * İstenilen alt yazı dosyasını webvtt formatında ve karakter kodu utf-8'e çevrilmiş halde sunar.
 */

var _               = require('underscore');
var path            = require('path');
var fs              = require('fs');
var charsetDetector = require('node-icu-charset-detector');
var Iconv           = require('iconv').Iconv;
var srt             = require('subtitles-parser');
var config          = require('../../config');

/**
 * @see https://github.com/mooz/node-icu-charset-detector
 */
function bufferToString(buffer) {
    var charset = charsetDetector.detectCharset(buffer).toString();

    try {
        return buffer.toString(charset);
    } catch (x) {
        var charsetConverter = new Iconv(charset, "utf8");
        return charsetConverter.convert(buffer).toString();
    }
}

module.exports = function(req, res){
    var realPath = config.repository + '/' + path.normalize(req.params[0]);
    var buffer = fs.readFileSync(realPath);
    var data = srt.fromSrt(bufferToString(buffer));

    var output = "WEBVTT\n\n";
    _.each(data, function(item){
        output += item.id + "\n";
        output += item.startTime.toString().replace(',', '.') + " --> " + item.endTime.toString().replace(',', '.') + "\n";
        output += item.text + "\n\n";
    });

    res.set('Content-Type', 'text/vtt; charset=utf-8');
    res.send(new Buffer(output));
};