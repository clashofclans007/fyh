var _               = require('underscore');
var Transmission    = require('transmission');
var Util            = require('./util');
var config          = require('./config');

var client = new Transmission(config.transmission);

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

module.exports = {
    /**
     * Durum bilgisini döner.
     */
    getStatus: function(status){
        switch(status) {
            case 0:
                return 'STOPPED'; // Torrent is stopped
            case 1:
                return 'CHECK_WAIT'; // Queued to check files
            case 2:
                return 'CHECK'; // Checking files
            case 3:
                return 'DOWNLOAD_WAIT'; // Queued to download
            case 4:
                return 'DOWNLOADING'; // Downloading
            case 5:
                return 'SEED_WAIT'; // Queued to seed
            case 6:
                return 'SEED'; // Seeding
            case 7:
                return 'ISOLATED'; // Torrent can't find peers
            default:
                return 'UNKNOWN';
        }
    },

    /**
     * Torrent bilgilerini verir.
     */
    fetchAll: function(callback){
        var currentObject = this;

        client.all(function(err, result){
            if (err) {
                callback(err, []);
                return;
            }

            var torrents = [];
            _.each(result.torrents, function(item){

                var eta = 0;
                if (item.eta > 0) {
                    eta = item.eta.toString().toHHMMSS();
                }

                var doneDate = 0;
                if (item.doneDate > 0) {
                    doneDate = new Date(item.doneDate * 1000);
                }

                var addedDate = 0;
                if (item.addedDate > 0) {
                    addedDate = new Date(item.addedDate * 1000);
                }

                torrents.push({
                    id: item.id,
                    name: item.name,
                    eta: eta,
                    addedDate: addedDate,
                    doneDate: doneDate,
                    isFinished: item.leftUntilDone == 0,
                    downloaded: Util.bytesToSize(item.totalSize - item.leftUntilDone, 2),
                    totalSize: Util.bytesToSize(item.totalSize, 2),
                    leftUntilDone: Util.bytesToSize(item.leftUntilDone, 2),
                    percentDone: (item.percentDone * 100).toFixed(2),
                    status: currentObject.getStatus(item.status)
                });
            });

            callback(null, torrents);
        });
    },

    /**
     * Torrentı siler.
     */
    remove: function(ids, callback) {
        client.remove(ids, function(err, result){
            callback(err);
        });
    },

    /**
     * Yeni bir torrent başlatır.
     */
    add: function(magnet, callback){
        var options = {
            'download-dir': config.app.repository
        };

        client.add(magnet, options, function(err, result){
            callback(err, result);
        });
    },

    /**
     * Mevcut bir torrentı başlatır.
     */
    start: function(ids, callback) {
        client.start(ids, function(err, result){
            callback(err, result);
        });
    },

    /**
     * Mevcut bir torrentı durdurur.
     */
    stop: function(ids, callback){
        client.stop(ids, function(err){
            callback(err);
        });
    }
};