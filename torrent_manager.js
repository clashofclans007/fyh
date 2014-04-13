var _               = require('underscore');
var torrentStream   = require('torrent-stream');
var crypto          = require('crypto');
var fs              = require('fs');
var path            = require('path');
var mkdirp          = require('mkdirp');
var config          = require('./config');
var sqlite3         = require('sqlite3').verbose();
var db              = new sqlite3.Database('app/app.db');
var engines         = {};

// Utility Section
function generateKey(magnet) {
    var shasum = crypto.createHash('sha1');
    shasum.update(magnet);
    return shasum.digest('hex').toString();
}

// Torrent Section
var TorrentEngineManager = {
    engines: {},

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
            console.log('The engine is ready for torrent: ' + row.name + ' key: ' + row.key);
            TorrentDbManager.updateTorrentStatus(row.key, 'Starting...');

            _.each(engine.files, function(file){
                TorrentDbManager.addFileToTorrent(row.key, {
                    name: file.name,
                    path: file.path,
                    size: file.length
                });
            });

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
            console.log('Downloaded piece for torrent: ', row.name + ' key: ' + row.key + ' index:', pieceIndex);
        });

        engine.on('upload', function(pieceIndex, offset, length){
            console.log('Uploaded piece for torrent: ', row.name + ' key: ' + row.key + ' index:', pieceIndex);
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

// DB Section
db.run('CREATE TABLE IF NOT EXISTS torrent(key, name, magnet, status, is_downloaded)');
db.run('CREATE TABLE IF NOT EXISTS torrent_file(torrent_key, name, path, size, downloaded, uploaded, is_downloaded)');

var TorrentDbManager = {
    /**
     * Torrent için üretilen anahtarın varlığını sorgular.
     *
     * @param key Torrent için üretilen anahtar.
     * @param callback(status) Anahtar veritabanında varsa true yoksa false değerini döner.
     */
    hasKey: function(key, callback) {
        db.get('SELECT COUNT(*) AS count FROM torrent WHERE key = $key', {$key: key}, function(err, row){
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(row.count > 0);
        });
    },

    /**
     * Torrent için üretilen anahtara bağlı satırı verir.
     *
     * @param key Torrent için üretilen anahtar.
     * @param callback(row) Anahtar varsa ilgili satırı döner. Yoksa null döner.
     */
    findKey: function(key, callback) {
        db.get('SELECT * FROM torrent WHERE key = $key', {$key: key}, function(err, row){
            if (err) {
                console.log(err);
                callback(null);
                return;
            }

            if (row == undefined) {
                callback(null);
            } else {
                callback(row);
            }
        });
    },

    /**
     * @param row key, magnet ve name değişkenlerinden oluşur.
     * @param callback(status) hatalı durumda false, başarılı durumda true değeri döner.
     */
    insert: function(row, callback){
        db.run('INSERT INTO torrent(key, name, magnet) VALUES($key, $name, $magnet)', {
            $key: row.key,
            $name: row.name,
            $magnet: row.magnet
        }, function(err) {
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(true);
        });
    },

    /**
     * Tüm torrent bilgilerini verir.
     *
     * @param callback Başarılı ya da başarısız durumda her zaman bir dizi döner.
     */
    findAll: function(callback){
        db.all('SELECT * FROM torrent', function(err, rows){
            if (err) {
                console.log(err);
                callback([]);
                return;
            }

            callback(rows);
        });
    },

    /**
     * İlgili anahtara bağlı torrent bilgilerini siler.
     *
     * @param key Torrent için üretilen anahtar.
     * @param callback Başarılı silme işlemi için true, başarısız bir işlem için false değerini döner.
     */
    remove: function(key, callback) {
        db.run('DELETE FROM torrent_file WHERE torrent_key = $key', {$key: key}, function(err){
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            db.run('DELETE FROM torrent WHERE key = $key', {$key: key}, function(err){
                if (err) {
                    console.log(err);
                    callback(false);
                    return;
                }

                callback(true);
            });
        });
    },

    /**
     * Torrent durumunu değiştirir.
     *
     * @param key Torrent için üretien anahtar
     * @param status yeni torrent durumu.
     * @param callback Başarılı güncelleme işleminde true, başarısız işlem için false değerini döner.
     */
    updateTorrentStatus: function(key, status, callback) {
        if (callback == undefined) {
            callback = function(){};
        }

        db.run('UPDATE torrent SET status = $status', {$status: status}, function(err){
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(true);
        });
    },

    /**
     * Bir dosyayı torrenta bağlar.
     *
     * @param torrentKey Torrent için üretilen anahtar.
     * @param fileRow Dosya bilgilerini taşıyan obje. Obje içerisinde name, size, path değerleri bulunmalı.
     * @param callback Başarılı işlem durumunda true, başarısız işlemde false dönülür.
     */
    addFileToTorrent: function(torrentKey, fileRow, callback) {
        if (callback == undefined){
            callback = function(){};
        }

        // Dosya daha önce bağlanmışsa es geç.
        db.get('SELECT COUNT(*) AS count FROM torrent_file WHERE path = $path', {$path: fileRow.path}, function(err, row){
            if (row.count > 0) {
                callback(true);
                return;
            }

            db.run('INSERT INTO torrent_file(torrent_key, name, size, path) VALUES($torrentKey, $name, $size, $path)', {
                $torrentKey: torrentKey,
                $name: fileRow.name,
                $size: fileRow.size,
                $path: fileRow.path
            }, function(err){
                if (err) {
                    console.log(err);
                    callback(false);
                    return;
                }

                callback(true);
            });
        });
    }
};

module.exports = {
    /**
     * Magnet ile torrent indirme işlemini başlatır.
     *
     * @param row name ve magnet değerlerini içeren obje.
     * @param callback Gönderilen row objesi geri döner. row objesine eklenen status alanı başarılı durumda true, başarısız durumda false değerini alır.
     */
    start: function(row, callback){
        // Eğer torrent için engine çalışıyorsa herhangi bir işlem yapma ve olumlu geri dönüş yap.
        var currentObject = this;
        row.key = generateKey(row.magnet);
        row.error = true;
        if (engines[row.key] !== undefined) {
            callback(row);
            return;
        }

        // Torrent veritabanında yoksa eklenmesi gerekiyor. Bu yüzden kontrol yapılıyor.
        TorrentDbManager.hasKey(row.key, function(status){
            if (status == false) {
                // Bu yeni bir torrent. Veritabanına kaydet ve torrent indirme işlemini başlat.
                TorrentDbManager.insert(row, function(status){
                    if (status == false) {
                        row.error = false;
                        callback(row);
                        return;
                    }

                    TorrentEngineManager.start(row, callback);
                });
            } else {
                TorrentEngineManager.start(row, callback);
            }
        });
    },

    /**
     * Çalışan bir torrentı siler. Ancak indirilen cache harici dosyalar silinmez.
     *
     * @param key Torrent için üretilen anahtar.
     * @param callback Başarılı silme işlemi için true, başarısız işlem için false değerini döner.
     */
    remove: function(key, callback){
        TorrentEngineManager.remove(key, function(){
            TorrentDbManager.remove(key, callback);
        });
    },

    /**
     * Torrent bilgilerini döner.
     *
     * @param callback Torrent bilgilerinin bulunduğu bir dizi döner.
     */
    getTorrents: function(callback){
        TorrentDbManager.findAll(function(rows){

            callback(rows);
        });
    }
};
