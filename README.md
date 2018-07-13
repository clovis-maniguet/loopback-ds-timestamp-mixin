TIMESTAMPS
=============

This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework.  It automatically adds `createdAt`, `updatedAt` and `deletedAt` attributes to any Model.

`createdAt` will be set to the current Date the by using the default property of the attribute.

`updatedAt` will be set for every update of an object through bulk `updateAll` or instance `model.save` methods.

`deletedAt` will be set for every delete of an object through bulk `deleteAll` or instance `model.delete` methods.

This module is implemented with the `before save` [Operation Hook](http://docs.strongloop.com/display/public/LB/Operation+hooks#Operationhooks-beforesave) which requires the  loopback-datasource-juggler module greater than  [v2.23.0](strongloop/loopback-datasource-juggler@0002aaedeffadda34ae03752d03d0805ab661665).

INSTALL
=============

```bash
  npm i loopback-ds-timestamp-mixin --save
```

SERVER CONFIG
=============

Add the `mixins` property to your `server/model-config.json`:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-timestamp-mixin",
      "../common/mixins"
    ]
  }
}
```

MODEL CONFIG
=============

To use with your Models add the `mixins` attribute to the definition object of your model config.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "mixins": {
      "TimeStamp" : true
    }
  }
```

MODEL OPTIONS
=============

The attribute names `createdAt`, `updatedAt` and `deletedAt` are configurable.  To use different values for the default attribute names add the following parameters to the mixin options.

You can also configure whether `createdAt`, `updatedAt` and `deletedAt` are required or not. This can be useful when applying this mixin to existing data where the `required` constraint would fail by default.

This mixin uses console logs to warn you whenever something might need your attention. If you would prefer not to receive these warnings, you can disable them by setting the option `silenceWarnings` to `true` on a per model basis.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "mixins": {
      "TimeStamp" : {
        "createdAt" : "created_at",
        "updatedAt" : "updated_at",
        "deletedAt" : "deleted_at",
        "silenceWarnings": true
      }
    }
  }
```

**NOTE for database MySQL and Postgres options**

When you use database options for MySQL and the like beware that you may have to use the `columnName` value configured for the database instead of the loopback configured name.

In the following example for the `Widget` object your `createdAt` field should equal the `columnName` which would be `created_at`.

```json
{
  "name": "Widget",
  "properties": {
    "createdAt": {
      "type": "Date",
       "required": true,
       "length": null,
       "precision": null,
       "scale": null,
       "mysql": {
         "columnName": "created_at",
         "dataType": "datetime",
         "dataLength": null,
         "dataPrecision": null,
         "dataScale": null,
         "nullable": "N"
       }
  }
  }
}
```
Thus the configuration looks like this for the above example.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "mixins": {
      "TimeStamp" : {
        "createdAt" : "created_at"
      }
    }
  }
```

Please see [issue #19](clarkbw/loopback-ds-timestamp-mixin/issues/19) for more information on database options.

OPERATION OPTIONS
=============

By passing in additional options to an update or save operation you can control when this mixin updates the `updatedAt` field.  The passing true to the option `skipUpdatedAt` will skip updating the `updatedAt` field.

In this example we assume a book object with the id of 2 already exists. Normally running this operation would change the `updatedAt` field to a new value.

```js
Book.updateOrCreate({name: 'New name', id: 2}, {skipUpdatedAt: true}, function(err, book) {
  // book.updatedAt will not have changed
});
```

DEVELOPMENT
=============

This package is written in ES6 JavaScript, check out [@getify/You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS) if you want to learn more about ES6.

Source files are located in the [`es6`](https://github.com/clarkbw/loopback-ds-timestamp-mixin/tree/master/es6) directory.  Edit the source files to make changes while running `gulp` in the background.  Gulp is using [babel](https://babeljs.io/docs/setup/#gulp) to transform the es6 JavaScript into node compatible JavaScript.

```bash
  gulp
```

TESTING
=============

For error checking and to help maintain style this package uses `eslint` as a pretest.  All test are run against the transformed versions of files, not the es6 versions.

Run the tests in the `test` directory.

```bash
  npm test
```

Run with debugging output on:

```bash
  DEBUG='loopback:mixins:time-stamp' npm test
```

LICENSE
=============
[ISC](LICENSE)
