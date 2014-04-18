var kickass = require('../../kickass');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var page        = req.query.page || 0;
    var searchParam = req.query.search;

    kickass(searchParam, page, function(err, torrents){
        if (err) {
            console.log(err);
            res.send([]);
            return;
        }

        res.send(torrents);
    });
};
