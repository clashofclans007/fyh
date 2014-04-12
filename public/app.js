$(function(){
    window.App = Ember.Application.create({
        LOG_TRANSITIONS: true
    });

    App.Router.map(function(){
        this.route('file-manager');
        this.route('video', { path: '/video/:fileUrl' });
        this.route('download-manager');
        this.route('torrent-search');
        this.route('subtitle-search');
    });

    // FileManager Route
    App.FileManagerRoute = Ember.Route.extend({
        setupController: function(controller, model){
            this._super(controller, model);
            controller.send('cd', '/');
        }
    });

    // FileManager Controller
    App.FileManagerController = Ember.ObjectController.extend({
        moveFile: null,
        actions: {
            cd: function(path){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/ls' + path).then(function(data){
                    currentObject.set('content', data);
                });
            },
            unlink: function(path){
                if (!confirm('Are you sure?')) {
                    return;
                }

                var currentObject = this;
                Ember.$.getJSON('/api/v1/unlink' + path).then(function(){
                    currentObject.send('refresh');
                });
            },
            refresh: function(){
                this.send('cd', this.get('currentPath'));
            },
            setMoveFile: function(path){
                this.set('moveFile', path);
            },
            unsetMoveFile: function(){
                this.set('moveFile', null);
            },
            move: function(){
                if (!confirm('Are you sure?')) {
                    return;
                }

                var currentObject = this;
                Ember.$.getJSON('/api/v1/move', { newPath: this.get('currentPath'), 'path': this.get('moveFile').path}).then(function(){
                    currentObject.send('unsetMoveFile');
                    currentObject.send('refresh');
                });
            }
        }
    });

    // Path Folder Controller
    App.PathFolderItemController = Ember.ObjectController.extend({
        needs: ['file-manager'],
        isMoveFile: function(){
            var moveFile = this.get('controllers.file-manager.moveFile');
            return moveFile != null && moveFile.name == this.get('name');
        }.property('controllers.file-manager.moveFile'),
        actions: {
            cd: function(){
                this.get('controllers.file-manager').send('cd', this.get('path'));
            },
            unlink: function(){
                this.get('controllers.file-manager').send('unlink', this.get('path'));
            },
            setMoveFile: function(){
                this.get('controllers.file-manager').send('setMoveFile', {name: this.get('name'), path: this.get('path')});
            },
            unsetMoveFile: function(){
                this.get('controllers.file-manager').send('unsetMoveFile');
            }
        }
    });

    // Path Item Controller
    App.PathItemController = App.PathFolderItemController.extend({
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
                    currentObject.get('controllers.file-manager').send('refresh');
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
                    currentObject.get('controllers.file-manager').send('refresh');
                });
            }
        }
    });

    // Create Folder Controller
    App.CreateFolderController = Ember.ObjectController.extend({
        folder: '',
        needs: ['file-manager'],
        actions: {
            create: function(){
                if (this.get('folder').length == 0) {
                    return;
                }

                var currentObject = this;
                var currentPath = this.get('controllers.file-manager').get('currentPath');
                Ember.$.getJSON('/api/v1/mkdir', { folder: this.get('folder'), path: currentPath }).then(function(){
                    $('#create-folder-modal').modal('hide');
                    currentObject.set('folder', '');
                    currentObject.get('controllers.file-manager').send('refresh');
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

    // Subtitle Search Controller
    App.SubtitleSearchController = Ember.ObjectController.extend({
        search: '',
        subtitles: [],
        actions: {
            search: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/subtitle-search', { search: this.get('search') }).then(function(subtitles){
                    currentObject.set('subtitles', subtitles);
                });
            }
        }
    });
}());