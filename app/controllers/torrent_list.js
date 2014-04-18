var transmissionManager = require('../../transmission-manager');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    transmissionManager.fetchAll(function(err, torrents){
        res.send(torrents);
    });
};
