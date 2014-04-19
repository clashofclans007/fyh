var _               = require('underscore');
var OpenSubtitle    = require('../../opensubtitle');
var DivxPlanet      = require('../../divxplanet');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    if (req.query.source == 'opensubtitles') {
        OpenSubtitle.search(req.query.lang, req.query.search, function(results){
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
    } else {
        var divxplanet = new DivxPlanet();
        divxplanet
            .setQuery(req.query.search)
            .setPage(parseInt(req.query.page))
            .on('success', function(subtitles){
                /**
                 * per item:
                 * - name
                 * - downloadLink
                 */
                res.send(subtitles);
            })
            .on('error', function(err){
                console.log(err);
                res.send([]);
            })
            .search();
    }
};
