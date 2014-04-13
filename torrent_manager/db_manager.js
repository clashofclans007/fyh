var sqlite3 = require('sqlite3').verbose();
var db      = new sqlite3.Database('./app/app.db');

// DB Section
db.run('CREATE TABLE IF NOT EXISTS torrent(key, name, magnet, status, is_downloaded)');
db.run('CREATE TABLE IF NOT EXISTS torrent_file(torrent_key, name, path, size, downloaded, uploaded, is_downloaded)');

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
