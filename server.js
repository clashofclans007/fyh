// Dependencies
var http    = require('http');
var express = require('express');
var config  = require('./config');

// Application
var app = express();
app.use(express.static('public')); // Site directory.
app.use(express.static(config.repository)); // Download directory.

// Request logger
app.use(function(req, res, next){
    console.log('%s %s', req.method, req.url);
    next();
});

// Routes
app.get('/api/v1/upload-from-url', require('./app/controllers/upload_from_file'));
app.get('/api/v1/torrent-search', require('./app/controllers/torrent_search'));
app.get('/api/v1/subtitle-search', require('./app/controllers/subtitle_search'));
app.get('/api/v1/move', require('./app/controllers/move'));
app.get('/api/v1/subtitle-files', require('./app/controllers/subtitle_files'));
app.get('/api/v1/upload-subtitle', require('./app/controllers/upload_subtitle'));
app.get(/^\/api\/v1\/ls\/?(.*)?$/,require('./app/controllers/ls'));
app.get(/^\/api\/v1\/unlink\/?(.*)?$/,require('./app/controllers/unlink'));
app.get(/^\/api\/v1\/mkdir\/?(.*)?$/,require('./app/controllers/mkdir'));
app.get(/^\/api\/v1\/subtitle\/?(.*)?$/, require('./app/controllers/subtitle'));
app.get(/^\/api\/v1\/extract\/?(.*)?$/, require('./app/controllers/extract'));

// Lets go!
var server = app.listen(config.appServerPort, function(){
    console.log('Listening on port %d', config.appServerPort)
});