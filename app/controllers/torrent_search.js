var kickass = require('../../kickass');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var page        = req.query.page || 0;
    var searchParam = req.query.search;
    var category    = req.query.category;
    var sort        = {
        field: req.query.field,
        sorder: req.query.order
    };

    if (category != 'all') {
        searchParam = searchParam + ' category:' + category;
    }

    kickass(searchParam, parseInt(page), sort, function(err, torrents){
        if (err) {
            console.log(err);
            res.send([]);
            return;
        }

        res.send(torrents);
    });
};
