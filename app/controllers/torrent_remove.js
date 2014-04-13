var torrentManager  = require('../../torrent_manager/torrent_manager');
var config          = require('../../config');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var key = req.query.key;

    torrentManager.remove(key, function(status){
        res.send({
            status: status
        });
    });
};
