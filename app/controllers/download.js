var path    = require('path');
var fs      = require('fs');
var config  = require('../../config');

module.exports = function(req, res){
    var filePath = '/' + path.normalize(req.query.path);
    var basename = path.basename(filePath);
    var realPath    = path.normalize(config.app.repository + filePath);

    res.set({
        'Content-Disposition': 'attachment; filename=' + basename
    });

    fs.createReadStream(realPath).pipe(res);
};
