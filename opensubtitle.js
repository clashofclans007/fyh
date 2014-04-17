var opensubtitles = require('opensubtitles-client');

var OpenSubtitle = {
    token: null,
    search: function(lang, text, callback){
        if (this.token == null) {
            var currentObject = this;
            opensubtitles.api.login().done(function(token){
                currentObject.token = token;
                currentObject.search(lang, text, callback);
            });
        } else {
            opensubtitles.api.search(this.token, lang, text).done(callback);
        }
    }
};

module.exports = OpenSubtitle;