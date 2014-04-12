var _               = require('underscore');
var torrentStream   = require('torrent-stream');
var crypto          = require('crypto');
var fs              = require('fs');
var path            = require('path');
var mkdirp          = require('mkdirp');
var config          = require('./config');
var engines         = {};

module.exports = {
    start: function(name, magnet, callback){
        var shasum = crypto.createHash('sha1');
        shasum.update(magnet);
        var id = shasum.digest('hex').toString();

        if (engines[id] !== undefined) {
            callback(id);
            return;
        }

        engine = torrentStream(magnet, {
            connections: 100,
            path: config.repository + '/download-cache/' + name,
            verify: true,
            dht: true,
            tracker: true
        });
        engines[id] = {
            id: id,
            name: name,
            engine: engine
        };

        engine.on('ready', function(){
            callback(id);
            engine.files.forEach(function(file){
                mkdirp(path.dirname(config.repository + '/' + file.path), function(){
                    file.createReadStream().pipe(fs.createWriteStream(config.repository + '/' + file.path));
                });
            });
        });
    },
    stop: function(id){
        if (engines[id] !== undefined) {
            engines[id].destroy();
        }
    },
    getActiveTorrents: function(){
        var temp = {};
        _.each(engines, function(item){
            temp.push({
                id: item.id,
                name: item.name
            })
        });

        return temp;
    }
};
