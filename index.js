const _ = require('lodash');

function bindQueryBuilder (model) {

    //extrat model param for testing and also to allow model amendment after initial invocation
    function queryBuilder (queryBody, model) {
        var builtQuery = {
            where: {}
        };

        if (_.has(queryBody,'search')) {
            const searchTerm = queryBody.search.split(':');
            const criterias = {
                or: []
            };
            //If we provide granular search against parameter (i.e. name:account)
            if (searchTerm.length === 2) {
                builtQuery.where[searchTerm[0]] = {
                    contains: searchTerm[1]
                };
            } else {
                if (model && _.isArray(model.searchable) && model.searchable.length) {
                    criterias.or = model.searchable.map((term) => {
                        var obj = {};
                        obj[term] = {
                            contains: queryBody.search
                        };
                        return obj;
                    });
                    builtQuery.where = criterias;
                }
            }
        }

        if (_.has(queryBody,'customQuery')) {
            builtQuery.where = _.merge(builtQuery.where, queryBody.customQuery);
        }

        if (_.has(queryBody,'limit')) {
            builtQuery.limit = parseInt(queryBody.limit, 10);
        }

        if (_.has(queryBody,'skip')) {
            builtQuery.skip = parseInt(queryBody.skip, 10);
        }

        if (_.has(queryBody,'sort')) {
            builtQuery.sort = queryBody.sort;
        }
        return builtQuery;
    }

    model.queryBuilder = queryBuilder;
    return queryBuilder;
}

/**
* Returns count and data
*/

function bindQuerySearch (model) {
    var queryBuilder = bindQueryBuilder(model);
    function querySearch (query) {
        var newQuery = queryBuilder(query);
        return model.find(newQuery)
           .then(function (data) {
               return model.count(newQuery)
                   .then(function(count) {
                       return {
                           count: count,
                           data: data
                       }
                   })
           });
    }
    model.querySearch = querySearch;
}

module.exports = function(sails) {

    function patch() {
        const keys = Object.keys(sails.models);
        keys.forEach(function(v) {
            bindQueryBuilder(sails.models[v]);
            bindQuerySearch(sails.models[v]);
        });
    }

    return {
        builder: bindQueryBuilder,
        search: bindQuerySearch,
        initialize: function(done) {

            //later on wait for this events
            //to apply extra methods to models
            var eventsToWaitFor = [];

            if (sails.hooks.orm) {
                eventsToWaitFor.push('hook:orm:loaded');
            }
            if (sails.hooks.pubsub) {
                eventsToWaitFor.push('hook:pubsub:loaded');
            }

            sails
                .after(eventsToWaitFor, function() {
                    patch();
                    done();
                });
        }
    };
};
