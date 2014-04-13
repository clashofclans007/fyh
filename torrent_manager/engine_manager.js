var _                   = require('underscore');
var torrentStream       = require('torrent-stream');
var fs                  = require('fs');
var path                = require('path');
var mkdirp              = require('mkdirp');
var config              = require('../config');
var TorrentDbManager    = require('./db_manager');

module.exports = {
    engines: {},

    /**
     * Anahtar için tanımlı bir engine sorgular.
     *
     * @param key Torrent için üretilen key
     * @returns {boolean}
     */
    hasKey: function(key) {
        return this.engines[key] !== undefined;
    },

    /**
     * Yeni bir torrent engine oluşturur.
     *
     * @param row magnet, name ve key değerlerini içeren obje.
     * @returns {*}
     */
    getEngine: function(row){
        // Engine daha önce oluşturulmuşsa onu dön.
        if (this.engines[row.key] != undefined) {
            return this.engines[row.key];
        }

        var engine = torrentStream(row.magnet, {
            connections: 100,
            path: config.repository + '/download-cache/' + row.name,
            verify: true,
            dht: true,
            tracker: true
        });
        this.engines[row.key] = engine;
        return engine;
    },

    /**
     * Torrent indirme işlemini (ya da gönderme) başlatır.
     *
     * @param row
     * @param callback Gönderilen row değerini geri döndürür.
     */
    start: function(row, callback) {
        var engine = this.getEngine(row);

        // Engine oluşma bilgisi önce gönderilmeli. Ready durumuna geçmesi biraz vakit alabiliyor.
        callback(row);

        TorrentDbManager.updateTorrentStatus(row.key, 'Waiting torrent information...');

        engine.on('ready', function(){
            TorrentDbManager.updateTorrentStatus(row.key, 'Downloading...');

            // Torrent dosya bilgileri alınıyor.
            var torrentSize = 0;
            _.each(engine.files, function(file){
                torrentSize+= file.length;
            });

            TorrentDbManager.updateTorrentSize(row.key, torrentSize);

            _.each(engine.files, function(file){
                // Torrent içeriğindeki dizin yapısını korumak için mkdirp ile ilgili dizin oluşturuluyor.
                var torrentPath = config.repository + '/' + row.name;
                mkdirp(path.dirname(torrentPath + '/' + file.path), function(){
                    // file.createReadStream oluşturulduğunda engine dosyaları indirmeye ya da göndermeye başlar.
                    file.createReadStream().pipe(fs.createWriteStream(torrentPath + '/' + file.path));
                });
            });
        });

        engine.on('error', function(){
            console.log('An error occurred for torrent: ', row.name + ' key: ' + row.key + ' error:', err);
        });

        engine.on('download', function(pieceIndex){
            TorrentDbManager.updateTorrentDownloaded(row.key, engine.swarm.downloaded);
        });

        engine.on('upload', function(pieceIndex, offset, length){
            TorrentDbManager.updateTorrentUploaded(row.key, engine.swarm.uploaded);
        });
    },

    /**
     * Anahtara bağlı torrent datalarını siler ve torrent engine i kapatır.
     *
     * @param key Torrent için üretilen anahtar.
     * @param callback Geriye herhangi bir bilgi döndürmez.
     */
    remove: function(key, callback) {
        var currentObject = this;

        if (this.engines[key] !== undefined) {
            // İstemciyi durdur, bağlantıları kapat.
            this.engines[key].destroy(function(){
                // Tüm cache dsyalarını sil.
                currentObject.engines[key].remove(function(){
                    delete currentObject.engines[key];
                    console.log('The cache files have been removed for torrent: ' + key);
                    callback();
                });
            });
        } else {
            // Herhangi bir istemci yoksa devam et.
            callback();
        }
    }
};