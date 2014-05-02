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
});

// Routes
app.get('/api/v1/torrent-list', passport.authenticate('basic', {session: false}), require('./app/controllers/torrent_list'));
app.get('/api/v1/torrent-add', passport.authenticate('basic', {session: false}), require('./app/controllers/torrent_add'));
app.get('/api/v1/torrent-start', passport.authenticate('basic', {session: false}), require('./app/controllers/torrent_start'));
app.get('/api/v1/torrent-stop', passport.authenticate('basic', {session: false}), require('./app/controllers/torrent_stop'));
app.get('/api/v1/torrent-remove', passport.authenticate('basic', {session: false}), require('./app/controllers/torrent_remove'));

app.get('/api/v1/torrent-search', passport.authenticate('basic', {session: false}), require('./app/controllers/torrent_search'));
app.get('/api/v1/subtitle-search', passport.authenticate('basic', {session: false}), require('./app/controllers/subtitle_search'));
app.get('/api/v1/get-torrent-files', passport.authenticate('basic', {session: false}), require('./app/controllers/get_torrent_files'));

app.get('/api/v1/upload-from-url', passport.authenticate('basic', {session: false}), require('./app/controllers/upload_from_file'));
app.get('/api/v1/upload-subtitle', passport.authenticate('basic', {session: false}), require('./app/controllers/upload_subtitle'));

app.get('/api/v1/stream', require('./app/controllers/stream'));
app.get('/api/v1/download', require('./app/controllers/download'));
app.get('/api/v1/move', passport.authenticate('basic', {session: false}), require('./app/controllers/move'));
app.get('/api/v1/rename', passport.authenticate('basic', {session: false}), require('./app/controllers/rename'));
app.get(/^\/api\/v1\/ls\/?(.*)?$/, passport.authenticate('basic', {session: false}), require('./app/controllers/ls'));
app.get(/^\/api\/v1\/unlink\/?(.*)?$/, passport.authenticate('basic', {session: false}), require('./app/controllers/unlink'));
app.get(/^\/api\/v1\/mkdir\/?(.*)?$/, passport.authenticate('basic', {session: false}), require('./app/controllers/mkdir'));
app.get(/^\/api\/v1\/subtitle\/?(.*)?$/, passport.authenticate('basic', {session: false}), require('./app/controllers/subtitle'));
app.get(/^\/api\/v1\/extract\/?(.*)?$/, passport.authenticate('basic', {session: false}), require('./app/controllers/extract'));

// Lets go!
var server = app.listen(config.app.port, function(){
    console.log('Listening on port %d', config.app.port);
});