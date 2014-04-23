var _       = require('underscore');
var Kickass = require('node-kickass');
var util    = require('./util');

module.exports = function(query, page, sort, callback) {
    var kickass = new Kickass();

    kickass.setQuery(query).setPage(page).setSort(sort).run(function(errors, data) {
        if (! errors.length > 0) {
            var torrents = [];
            _.each(data, function(item) {
                torrents.push({
                    name: item.title,
                    date: item.date,
                    link: item.link,
                    magnet: item['torrent:magneturi']['#'],
                    seeders: item['torrent:seeds']['#'],
                    leechers: item['torrent:peers']['#'],
                    size: util.bytesToSize(item['torrent:contentlength']['#'], 2)
                });
            });
            callback(null, torrents);
        } else {
            callback(new Error('An error occurred!'));
        }
    });
};
