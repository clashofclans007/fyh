var crypto                  = require('crypto');
var TorrentDbManager        = require('./db_manager');
var TorrentEngineManager    = require('./engine_manager');

/**
 * Magnet üzerinden bir key oluşturur.
 *
 * @param magnet
 * @returns {*|string|String}
 */
function generateKey(magnet) {
    var shasum = crypto.createHash('sha1');
    shasum.update(magnet);
    return shasum.digest('hex').toString();
}

module.exports = {
    /**
     * Magnet ile torrent indirme işlemini başlatır.
     *
     * @param row name ve magnet değerlerini içeren obje.
     * @param callback Gönderilen row objesi geri döner. row objesine eklenen status alanı başarılı durumda true, başarısız durumda false değerini alır.
     */
    start: function(row, callback){
        var currentObject = this;
        row.key = generateKey(row.magnet);
        row.error = true;

        // Eğer torrent için engine çalışıyorsa herhangi bir işlem yapma ve olumlu geri dönüş yap.
        if (TorrentEngineManager.hasKey(row.key)) {
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
