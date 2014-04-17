var _               = require('underscore');
var OpenSubtitle    = require('../../opensubtitle');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    OpenSubtitle.search('tur', req.query.search, function(results){
        console.log(results);
        var subtitles = [];
        _.each(results, function(item){
            subtitles.push({
                id: item.IDSubtitle,
                name: item.MovieName,
                year: item.MovieYear,
                seriesSeason: item.SeriesSeason,
                seriesEpisode: item.SeriesEpisode,
                latestUpdate: item.SubAddDate,
                movieKind: item.MovieKind,
                downloadLink: item.ZipDownloadLink
            });
        });

        res.send(subtitles);
    });

    /*
    var searchParam = req.query.search;
    var page = req.query.page;
    var offset = 40 * page;
    var searchUrl = 'http://www.opensubtitles.org/en/search/sublanguageid-all/moviename-' + searchParam + '/offset-' + offset + '/xml';

    request(searchUrl, function(error, response, body){
        if (error || response.statusCode != 200) {
            console.log(error);
            res.send([]);
            return;
        }

        xmlToJs(body, function(err, result){
            if (err) {
                console.log(err);
                res.send([]);
                return;
            }

            console.log(result.opensubtitles.search[0].results[0]);

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

            res.send({
                //prevOffset: prevOffset,
                //nextOffset: nextOffset,
                subtitles: subtitles
            });
        });
    });*/
};
