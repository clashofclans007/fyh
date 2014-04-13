var config = require('./config');

function bytesToSize(bytes, precision)
{
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;

    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' Bytes';

    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KB';

    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MB';

    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GB';

    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB';
    } else {
        return bytes + 'Bytes';
    }
}

function getAppUrl(){
    var url = config.appServerHost;
    if (config.appServerPort !== 80) {
        url += ':' + config.appServerPort;
    }

    return 'http://' + url;
}

module.exports = {
    bytesToSize: bytesToSize,
    getAppUrl: getAppUrl
};