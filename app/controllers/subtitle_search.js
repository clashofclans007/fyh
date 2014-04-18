var _               = require('underscore');
var OpenSubtitle    = require('../../opensubtitle');

module.exports = function(req, res){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);

    OpenSubtitle.search('tur', req.query.search, function(results){
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
};
