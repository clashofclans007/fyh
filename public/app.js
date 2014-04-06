$(function(){
    window.App = Ember.Application.create({
        LOG_TRANSITIONS: true
    });

    App.Router.map(function(){
        this.route('path');
        this.route('video', { path: '/video/:path' });
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
        needs: ['video'],
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
            setSubtitle: function(name, path){
                this.set('controllers.video.subtitle', {name: name, path: path});
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