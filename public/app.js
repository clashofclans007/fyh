$(function(){
    window.App = Ember.Application.create({
        LOG_TRANSITIONS: true
    });

    App.Router.map(function(){
        this.route('file-manager', { path: '/file-manager/:path'});
        this.route('video', { path: '/video/:fileUrl' });
        this.route('download-manager');
        this.route('torrent-search');
    });

    // Path Route
    App.FileManagerRoute = Ember.Route.extend({
        model: function(params){
            var path = '/';
            if (params.path !== undefined) {
                path = params.path;
            }

            return Ember.$.getJSON('/api/v1/ls' + path).then(function(data){
                console.log(data);
                return data;
            });
        }
    });

    // Path File Item Controller
    App.PathFileItemController = Ember.ObjectController.extend({
        needs: ['video', 'file-manager'],
        isSelectedSubtitle: function(){
            var selectedSubtitle = this.get('controllers.video.subtitle');
            return selectedSubtitle != null && selectedSubtitle.name == this.get('name');
        }.property('controllers.video.subtitle'),
        actions: {
            setSubtitle: function(){
                this.set('controllers.video.subtitle', {name: this.get('name'), path: this.get('path')});
            },
            unsetSubtitle: function(){
                this.set('controllers.video.subtitle', null);
            },
            extract: function(){
                var currentObject = this;
                return Ember.$.getJSON('/api/v1/extract', { path: this.get('path')}).then(function(){
                    currentObject.get('controllers.path').send('refresh');
                });
            }
        }
    });

    // Upload From Url Controller
    App.UploadFromUrlController = Ember.ObjectController.extend({
        url: '',
        needs: ['file-manager'],
        actions: {
            upload: function(){
                var currentObject = this;
                var currentPath = this.get('controllers.file-manager').get('currentPath');
                Ember.$.getJSON('/api/v1/upload-from-url', { url: this.get('url'), path: currentPath }).then(function(){
                    $('#upload-from-url-modal').modal('hide');
                    currentObject.transitionToRoute('file-manager', { path: '/' });
                });
            }
        }
    });

    // Video Route
    App.VideoRoute = Ember.Route.extend({
        model: function(params){
            return {
                fileUrl: params.fileUrl
            }
        }
    });

    // Video Controller
    App.VideoController = Ember.ObjectController.extend({
        subtitle: null
    });

    // Torrent Search Controller
    App.TorrentSearchController = Ember.ObjectController.extend({
        search: '',
        page: 0,
        torrents: [],
        actions: {
            search: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/torrent-search', { search: this.get('search'), page: this.get('page') }).then(function(torrents){
                    currentObject.set('torrents', torrents);
                });
            },
            nextPage: function(){
                this.set('page', this.get('page') + 1);
                this.send('search');
            },
            prevPage: function(){
                if (this.get('page') > 0) {
                    this.set('page', this.get('page') - 1);
                    this.send('search');
                }
            }
        }
    });
}());