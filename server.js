// Dependencies
require('./console-trace')({
    always: true
});

var http            = require('http');
var express         = require('express');
var passport        = require('passport');
var BasicStrategy   = require('passport-http').BasicStrategy;
var config          = require('./config');

passport.use(new BasicStrategy(
  function(username, password, done) {
    if (username !== config.app.username && password !== config.app.password) {
        return done(null, false);
    }

    return done(null, {username: username});
  }
));

// Application
var app = express();
app.configure(function(){
    app.use(express.static('public')); // Site directory.
    app.use(express.static(config.app.repository)); // Download directory.

    // Request logger
    app.use(function(req, res, next){
        console.log('%s %s', req.method, req.url);
        next();
    });

    // Authentication
    app.use(passport.initialize());
    app.use(passport.authenticate('basic', {
        session: false
    }));
});

// Routes
app.get('/api/v1/torrent-list', require('./app/controllers/torrent_list'));
app.get('/api/v1/torrent-add', require('./app/controllers/torrent_add'));
app.get('/api/v1/torrent-start', require('./app/controllers/torrent_start'));
app.get('/api/v1/torrent-stop', require('./app/controllers/torrent_stop'));
app.get('/api/v1/torrent-remove', require('./app/controllers/torrent_remove'));

app.get('/api/v1/torrent-search', require('./app/controllers/torrent_search'));
app.get('/api/v1/subtitle-search', require('./app/controllers/subtitle_search'));

app.get('/api/v1/upload-from-url', require('./app/controllers/upload_from_file'));
app.get('/api/v1/upload-subtitle', require('./app/controllers/upload_subtitle'));

app.get('/api/v1/stream', require('./app/controllers/stream'));
app.get('/api/v1/move', require('./app/controllers/move'));
app.get('/api/v1/rename', require('./app/controllers/rename'));
app.get(/^\/api\/v1\/ls\/?(.*)?$/, require('./app/controllers/ls'));
app.get(/^\/api\/v1\/unlink\/?(.*)?$/, require('./app/controllers/unlink'));
app.get(/^\/api\/v1\/mkdir\/?(.*)?$/, require('./app/controllers/mkdir'));
app.get(/^\/api\/v1\/subtitle\/?(.*)?$/, require('./app/controllers/subtitle'));
app.get(/^\/api\/v1\/extract\/?(.*)?$/, require('./app/controllers/extract'));

// Lets go!
var server = app.listen(config.app.port, function(){
    console.log('Listening on port %d', config.app.port);
});