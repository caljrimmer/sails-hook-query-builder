# Sails Hook Query Builder

[![build status](https://travis-ci.org/caljrimmer/sails-hook-query-builder.svg?branch=master&style=flat-square)](https://travis-ci.org/caljrimmer/sails-hook-query-builder)


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
  
## Build query

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

## Search via waterline from query 
     

```javascript
return Log.querySearch(_.merge(req.query, {
    customQuery: {
        'meta.audit': true
    }
})); 
```

will return:

```javascript
{
    count: 2,
    data: [
        {
            level: 'info',
            message: 'New message',
            meta: {
                auditFlag: 'Resolver'
            }
        },
        {
            level: 'error',
            message: 'Second message',
            meta: {
                auditFlag: 'Incorrect'
            }
        }
    ]
}
```

## Native request queries

- ?sort=name will sort against any property
- ?search=message:smith will search against a single property and value (delimited by :)
- ?search=smith will search against any property
- ?limit=10 will limit the results returned
- ?skip=20 will skip a defined number of results (used in pagination)