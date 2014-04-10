/**
 * @TODO : Kategori bazlı aramalar.
 */

var _ = require('underscore');
var request = require('request');
var jsdom = require('jsdom');

module.exports = function(req, res){
    var page = req.query.page || 0;
    var searchParam = req.query.search;
    var searchUrl = 'http://194.71.107.83/search/' + searchParam + '/' + page + '/3/0';

    request(searchUrl, function(error, response, body){
        if (error || response.statusCode != 200) {
            res.send([]);
            return;
        }

        jsdom.env(body, ['http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js'], function(error, window){
            var $ = window.$;
            var torrents = [];
            _.each($('#searchResult tr'), function(item){
                var name = $('a.detLink', item).text();
                if (name.length == 0) {
                    return;
                }
                var magnet = $('a[title="Download this torrent using magnet"]', item).attr('href');
                var desc = $('font.detDesc', item).text();
                var seeders = $('td', item).eq(2).text();
                var leechers = $('td', item).eq(3).text();

                torrents.push({
                    name: name,
                    magnet: magnet,
                    seeders: seeders,
                    leechers: leechers,
                    desc: desc
                });
            });

            res.send(torrents);
        });
    });
};
