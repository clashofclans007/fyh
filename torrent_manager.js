var _               = require('underscore');
var torrentStream   = require('torrent-stream');
var crypto          = require('crypto');
var fs              = require('fs');
var path            = require('path');
var mkdirp          = require('mkdirp');
var config          = require('./config');
var sqlite3         = require('sqlite3').verbose();
var db              = new sqlite3.Database('../app.db');
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

        engine.on('ready', function(){
            // TODO : Torrenta bağlı dosyalar veritabanına eklenmeli ve indirme işlemi tamamlandığında işaretlenmeli.
            console.log(__filename, 'The engine is ready for torrent: ' + row.name + ' key: ' + row.key);

            engine.files.forEach(function(file){
                // Torrent içeriğindeki dizin yapısını korumak için mkdirp ile ilgili dizin oluşturuluyor.
                var torrentPath = config.repository + '/' + row.name;
                mkdirp(path.dirname(torrentPath + '/' + file.path), function(){
                    // file.createReadStream oluşturulduğunda engine dosyaları indirmeye ya da göndermeye başlar.
                    file.createReadStream().pipe(fs.createWriteStream(torrentPath + '/' + file.path));
                });
            });
        });
    },

    /**
     * Anahtara bağlı torrent datalarını siler ve torrent engine i kapatır.
     *
     * @param key Torrent için üretilen anahtar.
     * @param callback Geriye herhangi bir bilgi döndürmez.
     */
    remove: function(key, callback) {
        if (this.engines[key] !== undefined) {
            this.engines[key].destroy(); // İstemciyi durdur, bağlantıları kapat.
            // Tüm cache dsyalarını sil.
            this.engines[key].remove(function(){
                console.log(__filename, 'The cache files have been removed for torrent: ' + key);
                callback();
            });
        }
    }
};

// DB Section
db.run('CREATE TABLE IF NOT EXISTS torrent(key, name, magnet)');

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
                console.log(__filename, err);
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
                console.log(__filename, err);
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
                console.log(__filename, err);
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
                console.log(__filename, err);
                callback([]);
                return;
            }

            callback(rows);
        });
    },

    /**
     * İlgili anahtara bağlı satırı siler.
     *
     * @param key Torrent için üretilen anahtar.
     * @param callback Başarılı silme işlemi için true, başarısız bir işlem için false değerini döner.
     */
    remove: function(key, callback) {
        db.run('DELETE FROM torrent WHERE key = $key', function(err){
            if (err) {
                console.log(__filename, err);
                callback(false);
                return;
            }

            callback(true);
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
        row.status = true;
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
                        row.status = false;
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
        TorrentDbManager.findAll(callback);
    }
};
