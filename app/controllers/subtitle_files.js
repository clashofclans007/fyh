var _       = require('underscore');
var request = require('request');
var jsdom   = require('jsdom');

module.exports = function(req, res){
    var searchUrl = 'http://www.opensubtitles.org/en/search/sublanguageid-all/idmovie-' + req.query.id;

    request(searchUrl, function(error, response, body){
        if (error || response.statusCode != 200) {
            res.send([]);
            return;
        }

        jsdom.env(body, ['http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js'], function(error, window){
            var $ = window.$;
            var files = [];
            _.each($('#search_results tr'), function(item){
                if ($(item).hasClass('head')) {
                    return;
                }

                if (!$(item).attr('id') || $(item).attr('id').indexOf('name') == -1) {
                    return;
                }

                var id = $(item).attr('id').replace('name', '');
                var language = $('a', $('td', item).eq(1)).attr('title');
                var cdCount = $('td', item).eq(2).text().trim();
                var uploadDate = $('td', item).eq(3).text().trim().match(/(\d){2}\/(\d){2}\/(\d){4}/)[0];

                files.push({
                    id: id,
                    language: language,
                    cdCount: cdCount,
                    uploadDate: uploadDate
                });
            });

            res.send(files);
        });
    });
};
