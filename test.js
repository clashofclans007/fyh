var transmissionManager = require('./transmission-manager');

/**
var magnet = 'magnet:?xt=urn:btih:1d392e689cba1664ef4655c61f236a9db7ab126c&dn=Family+guy+season+12+episodes+1+to+16+&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.istole.it%3A6969&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337';
transmissionManager.add(magnet, function(err, result){
    console.log(err);
    console.log(result);
});
*/

/*
transmissionManager.remove(1, function(err, result){
    console.log(err);
    console.log(result);
});
*/


transmissionManager.fetchAll(function(err, result){
    console.log(err);
    console.log(result);
});

/*
transmissionManager.start([1, 2, 3], function(err, result){
    console.log(err);
    console.log(result);
});
*/