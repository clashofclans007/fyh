var _       = require('underscore');
var request = require('request');
var xmlToJs = require('xml2js').parseString;

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    var searchParam = req.query.search;
    var page = req.query.page;
    var offset = 40 * page;
    var searchUrl = 'http://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-' + searchParam + '/offset-' + offset + '/xml';

    request(searchUrl, function(error, response, body){
        if (error || response.statusCode != 200) {
            res.send([]);
            return;
        }

        xmlToJs(body, function(err, result){
            if (err) {
                res.send([]);
                return;
            }

            var subtitles = [];
            _.each(result.opensubtitles.search[0].results[0].subtitle, function(item){
                if (item.ads1 !== undefined) {
                    return;
                }

                subtitles.push({
                    id: item.MovieID[0]._,
                    name: item.MovieName[0],
                    year: item.MovieYear[0],
                    seriesSeason: item.SeriesSeason[0],
                    seriesEpisode: item.SeriesEpisode[0],
                    fileCount: item.TotalSubs[0],
                    latestUpdate: item.Newest[0]._,
                    movieKind: item.MovieKind[0]
                });
            });

            res.send(subtitles);
        });
    });
};
