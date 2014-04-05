$(function(){
    window.App = Ember.Application.create({
        LOG_TRANSITIONS: true
    });

    App.Router.map(function(){
        this.route('path');
    });

    App.IndexRoute = Ember.Route.extend({
        beforeModel: function(){
            this.transitionTo('path');
        }
    });

    App.PathRoute = Ember.Route.extend({
        model: function(){
            return Ember.$.getJSON('/api/v1/ls').then(function(path){
                console.log(path);
                return path;
            });
        }
    });

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
            }
        }
    });
}());