$(function(){
    window.App = Ember.Application.create({
        LOG_TRANSITIONS: true
    });

    App.Router.map(function(){
        this.route('file-manager');
        this.route('video');
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
                    alertify.success("Removed!");
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
                    alertify.success('Selected path moved!');
                    currentObject.send('unsetMoveFile');
                    currentObject.send('refresh');
                });
            }
        }
    });

    // Path Folder Controller
    App.PathFolderItemController = Ember.ObjectController.extend({
        needs: ['file-manager', 'rename'],
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
            },
            rename: function(){
                this.get('controllers.rename').set('oldPath', this.get('path'));
                this.get('controllers.rename').set('newPath', this.get('path'));
                $('#rename-modal').modal('show');
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
                return Ember.$.getJSON('/api/v1/extract', { path: this.get('path')}).then(function(response){
                    alertify.success('Archive extracted!');
                    currentObject.get('controllers.file-manager').send('refresh');
                });
            },
            watch: function(path, contentType) {
                this.get('controllers.video').set('path', path);
                this.get('controllers.video').set('contentType', contentType);
                this.transitionToRoute('video');
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
                    alertify.success('The url uploaded to the server!');
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
                    alertify.success('Folder created!');
                    $('#create-folder-modal').modal('hide');
                    currentObject.set('folder', '');
                    currentObject.get('controllers.file-manager').send('refresh');
                });
            }
        }
    });

    // Rename Controller
    App.RenameController = Ember.ObjectController.extend({
        oldPath: '',
        newPath: '',
        needs: ['file-manager'],
        actions: {
            rename: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/rename', { newPath: this.get('newPath'), 'path': this.get('oldPath')}).then(function(){
                    alertify.success('Selected path renamed!');
                    currentObject.get('controllers.file-manager').send('refresh');
                    $('#rename-modal').modal('hide');
                });
            }
        }
    });

    // Video Controller
    App.VideoController = Ember.ObjectController.extend({
        subtitle: null,
        contentType: '',
        path: ''
    });

    // Torrent Search Controller
    App.TorrentSearchController = Ember.ObjectController.extend({
        search: '',
        page: 0,
        field: 'seeders',
        fields: [
            {
                key: "time_add",
                name: "Added Time"
            },
            {
                key: "seeders",
                name: "Seed"
            },
            {
                key: "leechers",
                name: "Leech"
            },
            {
                key: "size",
                name: "Size"
            },
            {
                key: "file_count",
                name: "Files"
            }
        ],
        order: "desc",
        order_list: [
            {
                key: "desc",
                name: "DESC"
            },
            {
                key: "asc",
                name: "ASC"
            }
        ],
        category: "all",
        categories: [
            {
                key: "all",
                name: "All"
            },
            {
                key: "movies",
                name: "Movie"
            },
            {
                key: "tv",
                name: "TV"
            },
            {
                key: "anime",
                name: "Anime"
            },
            {
                key: "music",
                name: "Music"
            },
            {
                key: "books",
                name: "Books"
            },
            {
                key: "games",
                name: "Games"
            },
            {
                key: "applications",
                name: "Applications"
            }
        ],
        torrents: [],
        actions: {
            clearPageAndSearch: function(){
                this.set('page', 0);
                this.send('search');
            },
            search: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/torrent-search', {
                    search: this.get('search'),
                    page: this.get('page'),
                    order: this.get('order'),
                    field: this.get('field'),
                    category: this.get('category')
                }).then(function(torrents){
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

    // Torrent Search Item
    App.TorrentSearchItemController = Ember.ObjectController.extend({
        html: '',
        actions: {
            start: function(){
                Ember.$.getJSON('/api/v1/torrent-add', { magnet: this.get('magnet') }).then(function(){
                    alertify.success('Torrent added to the downoad manager!');
                });
            },
            showFiles: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/get-torrent-files', { link: this.get('link') }).then(function(response){
                    currentObject.set('html', response.html);
                });
            }
        }
    });

    // Subtitle Search Controller
    App.SubtitleSearchController = Ember.ObjectController.extend({
        search: '',
        language: 'tur',
        subtitles: [],
        page: 0,
        source: 'divxplanet',
        sources: [
            {
                key: 'divxplanet',
                name: 'DIVX Planet'
            },
            {
                key: 'opensubtitles',
                name: 'Open Subtitles'
            }
        ],
        actions: {
            clearPageAndSearch: function(){
                this.set('page', 0);
                this.send('search');
            },
            search: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/subtitle-search', { search: this.get('search'), lang: this.get('language'), source: this.get('source'), page: this.get('page') }).then(function(subtitles){
                    currentObject.set('subtitles', subtitles);
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

    // Subtitle Search Item Controller
    App.SubtitleSearchItemController = Ember.ObjectController.extend({
        actions: {
            uploadFile: function(){
                Ember.$.getJSON('/api/v1/upload-subtitle', { url: this.get('downloadLink') }).then(function(){
                    alertify.success('Selected subtitle uploaded to the server!');
                });
            }
        }
    });

    // Download Manager Route
    App.DownloadManagerRoute = Ember.Route.extend({
        setupController: function(controller, model){
            this._super(controller, model);
            controller.send('refresh');
        }
    });

    // Download Manager Controller
    App.DownloadManagerController = Ember.ObjectController.extend({
        torrents: [],
        actions: {
            refresh: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/torrent-list').then(function(torrents){
                    currentObject.set('torrents', torrents);
                });
            }
        }
    });

    // Download Manager Item Controller
    App.DownloadManagerItemController = Ember.ObjectController.extend({
        isStopped: function(){
            return this.get('status') == 'STOPPED';
        }.property('status'),
        needs: ['download-manager'],
        actions: {
            start: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/torrent-start', {id: this.get('id')}).then(function(response){
                    alertify.success('Torrent started!');
                    currentObject.get('controllers.download-manager').send('refresh');
                });
            },
            stop: function(){
                var currentObject = this;
                Ember.$.getJSON('/api/v1/torrent-stop', {id: this.get('id')}).then(function(response){
                    alertify.success('Torrent stopped!');
                    currentObject.get('controllers.download-manager').send('refresh');
                });
            },
            remove: function(){
                if (!confirm('Are you sure?')) {
                    return;
                }

                var currentObject = this;
                Ember.$.getJSON('/api/v1/torrent-remove', {id: this.get('id')}).then(function(response){
                    alertify.success('Torrent removed!');
                    currentObject.get('controllers.download-manager').send('refresh');
                });
            }
        }
    });
}());
