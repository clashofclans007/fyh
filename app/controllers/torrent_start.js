var torrentManager  = require('../../torrent_manager');
var config          = require('../../config');

module.exports = function(req, res){
    var name = req.query.name;
    var magnet = req.query.magnet;

    torrentManager.start(name, magnet, function(id){
        res.send({
            id: id
        })
    });
};
