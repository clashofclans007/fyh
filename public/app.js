$(function(){
    window.App = Ember.Application.create({
        LOG_TRANSITIONS: true
    });

    App.Router.map(function(){
        this.route('path');
        this.route('video', { path: '/video/:path' });
        this.route('download-manager');
    });

    App.IndexRoute = Ember.Route.extend({
        beforeModel: function(){
            this.transitionTo('path');
        }
    });

    // Path Route
    App.PathRoute = Ember.Route.extend({
        model: function(){
            return Ember.$.getJSON('/api/v1/ls').then(function(path){
                console.log(path);
                return path;
            });
        }
    });

    // Path Controller
    App.PathController = Ember.ObjectController.extend({
        breadcrumbs: [],
        actions: {
            open: function(path){
                this.get('breadcrumbs').clear();
                var tempPath = '/';
                _.each(path.split("/"), function(item){
                    if (item.length > 0) {
                        tempPath += item + '/';
                        this.get('breadcrumbs').pushObject({name: item, path: tempPath});
                    }
                }, this);

                var currentObject = this;
                Ember.$.getJSON('/api/v1/ls', {path: path}).then(function(path){
                    console.log(path);
                    currentObject.set('model', path);
                });
            },
            refresh: function(){
                this.send('open', this.get('currentPath'));
            }
        }
    });

    // Path File Item Controller
    App.PathFileItemController = Ember.ObjectController.extend({
        needs: ['video', 'path'],
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

    // Video Route
    App.VideoRoute = Ember.Route.extend({
        model: function(params){
            return Ember.$.getJSON('/api/v1/stream', { path: params.path}).then(function(stream){
                console.log(stream);
                return stream;
            });
        }
    });

    // Video Controller
    App.VideoController = Ember.ObjectController.extend({
        subtitle: null
    });
}());