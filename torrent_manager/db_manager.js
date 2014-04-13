/**
 * TODO: update metodlarını teke düşür.
 */
var sqlite3 = require('sqlite3').verbose();
var config  = require('../config');
var db      = new sqlite3.Database(config.appDbPath);

// DB Section
db.run('CREATE TABLE IF NOT EXISTS torrent(key, name, magnet, size, downloaded, uploaded, status)');

module.exports = {
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
        db.run('DELETE FROM torrent WHERE key = $key', {$key: key}, function(err){
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(true);
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
     * Torrent boyut bilgisini değiştirir.
     *
     * @param key Torrent için üretien anahtar
     * @param size Torrent içerisindeki tüm dosyaların boyutu.
     * @param callback Başarılı güncelleme işleminde true, başarısız işlem için false değerini döner.
     */
    updateTorrentSize: function(key, size, callback) {
        if (callback == undefined) {
            callback = function(){};
        }

        db.run('UPDATE torrent SET size = $size', {$size: size}, function(err){
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(true);
        });
    },

    /**
     * İndirilen torrent parçalarının boyutunu günceller.
     *
     * @param key Torrent için üretien anahtar
     * @param downloaded İndirien torrent parçaları boyutu.
     * @param callback Başarılı güncelleme işleminde true, başarısız işlem için false değerini döner.
     */
    updateTorrentDownloaded: function(key, downloaded, callback) {
        if (callback == undefined) {
            callback = function(){};
        }

        db.run('UPDATE torrent SET downloaded = $downloaded', {$downloaded: downloaded}, function(err){
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(true);
        });
    },

    /**
     * Gönderilen torrent parçalarının boyutu verisini günceller.
     *
     * @param key Torrent için üretien anahtar
     * @param uploaded Gönderilen torrent parçalarının boyutu.
     * @param callback Başarılı güncelleme işleminde true, başarısız işlem için false değerini döner.
     */
    updateTorrentUploaded: function(key, uploaded, callback) {
        if (callback == undefined) {
            callback = function(){};
        }

        db.run('UPDATE torrent SET uploaded = $uploaded', {$uploaded: uploaded}, function(err){
            if (err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(true);
        });
    }
};
