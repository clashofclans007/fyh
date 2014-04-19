var _       = require('underscore');
var events  = require('events');
var request = require('request');
var jsdom   = require('jsdom');
var Iconv   = require('iconv').Iconv;

var DivxPlanet = function(){
    this.query = '';
    this.page = 1;
};

DivxPlanet.prototype.__proto__ = events.EventEmitter.prototype;

DivxPlanet.prototype.setQuery = function(query){
    this.query = query;
    return this;
};

DivxPlanet.prototype.setPage = function(page){
    this.page = page;
    return this;
};

DivxPlanet.prototype.search = function(){
    var params = {
        ara_ad: this.query
    };

    var currentObject = this;
    request.post('http://divxplanet.com/altyazi/arama/' + this.page + '.html', {form: params}, function(err, response, body){
        if (err) {
            return currentObject.emit('error', err);
        }

        var charsetConverter = new Iconv("latin1", "utf-8");
        body = charsetConverter.convert(new Buffer(body)).toString();

        jsdom.env(body, ["public/lib/jquery-2.1.0.min.js"], function (errors, window) {
            if (errors) {
                return currentObject.emit('error', errors);
            }

            var $ = window.$;
            var subtitles = [];

            _.each($('table'), function(item) {
                var trChildrens = $('tr', item);
                if (trChildrens.length > 1 && $('td', $(trChildrens[1])).length == 9) {
                    _.each($('tr', item), function(tr){
                        if ($('td', $(tr)).length != 9){
                            return;
                        }

                        if ($('td', $(tr)).eq(1).text() == 'Film/Dizi') {
                            return;
                        }

                        var name = $('td a', $(tr)).eq(1);
                        var url = 'http://divxplanet.com' + name.attr('href');
                        var name = name.text();

                        var pieces = $('td', $(tr)).eq(1).text().split('-');
                        var lang = pieces[pieces.length - 1].trim();

                        var cdCount = $('td', $(tr)).eq(3).text();

                        subtitles.push({
                            downloadLink: url,
                            name: name + ' - ' + lang + ' - ' + cdCount + 'CD'
                        });
                    });
                }
            });

            return currentObject.emit('success', subtitles);
          }
        );
    });
    return this;
};

module.exports = DivxPlanet;
