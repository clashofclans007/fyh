var torrentManager  = require('../../torrent_manager/torrent_manager');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var name    = req.query.name;
    var magnet  = req.query.magnet;

    var row = {
        name: name,
        magnet: magnet
    };

    torrentManager.start(row, function(row){
        res.send(row)
    });
};
