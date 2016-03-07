var sails = require('sails');

describe('Logging Tests', function () {
    before(function (done) {
        sails.lift({
            log: {
                level: 'silent',
                service: 'test'
            },
            connections: {
                mongo: {
                    host: 'localhost',
                    port: 27017,
                    database: 'shadow-test'
                }
            },
            port: 1420,
            hooks: {
                'sails-hook-cws-query-builder': require('../index.js'),
                grunt: false
            }
        }, function (err, server) {
            if (err) {
                return done(err);
            }
            GLOBAL.Query = server.hooks['sails-hook-cws-query-builder'];
            done();
        });
    });

    after(function (done) {
        sails.lower(done);
    });

    require('./query');
});
