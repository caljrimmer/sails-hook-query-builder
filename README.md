# Sails Hook Query Builder

Query builder adds a static method to all models in a sails app that allows creates a query which will paginate, search and sort.

## To use 

- Add "sails-hook-cws-query-builder" to package.json of project. Sails will automatically pick this up when invoking.
- Add searchable parameter to models e.g. in models/Log.js

```javascript
module.exports = {
    connection: 'mongo',
    tableName: 'log',
    searchable: ['level','message','meta.auditFlag'],
    attributes: {
        message: {
            type: 'string'
        },
        level: {
            type: 'string'
        },
        meta: {
            type: 'json'
        }
    }
};
```

This will allow queries to be built with:

```javascript
var query = Log.queryBuilder(_.merge(req.query, {
    customQuery: {
        'meta.audit': true
    }
})); 

//Expected query items are search, limit, skip and sort.
//**CustomQuery** are queries not associated with search, pagination or sort
```

if req url was:

```javascript
/log?search=smith&limit=1&sort=user
```

then the returned query object would be:

```javascript
{
    where : {
        or : [
            {
                message : {
                    contains : 'smith'
                }
            },
            {
                level : {
                    contains : 'smith'
                }
            },
            {
                meta.auditFlag : {
                    contains : 'smith'
                }
            },
        ]
    },
    limit: 1,
    sort: 'user'
}
``` 

## Native request queries

- ?sort=name will sort against any property
- ?search=message:smith will search against a single property and value (delimited by :)
- ?search=smith will search against any property
- ?limit=10 will limit the results returned
- ?skip=20 will skip a defined number of results (used in pagination)