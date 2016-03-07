const chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon');

chai.use(require('sinon-chai'));

describe('Logging tests', function () {

    var clock;

    beforeEach(function () {
        clock = sinon.useFakeTimers();
    });
    afterEach(function () {
        clock.restore();
    });

    it('should return {} i.e. find all, if no queries', function () {
        var query = Query.builder({})({});
        expect(query).to.eql({
            where: {}
        });
    });

    it('should split name:searchTerm in to contains query', function () {
        var query = Query.builder({})({search: 'name:account'});
        expect(query).to.eql({where: {
            name: {
                contains: 'account'
            }
        }});
    });

    it('should ignore malformed search query', function () {
        var query = Query.builder({})({search: 'account'});
        expect(query).to.eql({where: {}});
    });

    it('should return $or search query', function () {
        var query = Query.builder({})({search: 'account'},{
            searchable: ['name','id']
        });
        expect(query).to.eql({where: {
          or: [
            {
              name: {
                contains: 'account'
              }
            },
            {
              id: {
                contains: 'account'
              }
            }
          ]
        }});
    });

    it('should make sort query', function () {
        var query = Query.builder({})({sort: 'name'});
        expect(query).to.eql({
            where: {},
            sort: 'name'
        });
    });

    it('should make skip query', function () {
        var query = Query.builder({})({skip: '10'});
        expect(query).to.eql({
            where: {},
            skip: 10
        });
    });

    it('should make limit query', function () {
        var query = Query.builder({})({limit: '10'});
        expect(query).to.eql({
            where: {},
            limit: 10
        });
    });

    it('should augment where query with customQuery filters', function () {
        var query = Query.builder({})({customQuery: {appid: 12345, marketid: 22222}});
        expect(query).to.eql({
            where: {
                appid: 12345,
                marketid: 22222
            }
        });
    });

    it('should return full query object when all filters applied', function () {
        var query = Query.builder({})({
            search: 'name:account',
            skip: '1',
            sort: 'name',
            limit: '10',
            customQuery: {
                appid: 12345,
                marketid: 22222
            }
        });
        expect(query).to.eql({
            where: {
                name: {
                    contains: 'account'
                },
                appid: 12345,
                marketid: 22222
            },
            sort: 'name',
            limit: 10,
            skip: 1
        });
    });


});

