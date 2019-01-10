'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var debug = (0, _debug3.default)();
var warn = (0, _debug3.default)(); // create a namespaced warning
warn.log = console.warn.bind(console); // eslint-disable-line no-console

exports.default = function (Model) {
  var bootOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  debug('TimeStamp mixin for Model %s', Model.modelName);

  var options = _extends({
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    required: true,
    validateUpsert: false, // default to turning validation off
    silenceWarnings: false
  }, bootOptions);

  debug('options', options);

  // enable our warnings via the options
  warn.enabled = !options.silenceWarnings;

  if (!options.validateUpsert && Model.settings.validateUpsert) {
    Model.settings.validateUpsert = false;
    warn(Model.pluralModelName + ' settings.validateUpsert was overriden to false');
  }

  if (Model.settings.validateUpsert && options.required) {
    warn('Upserts for ' + Model.pluralModelName + ' will fail when\n          validation is turned on and time stamps are required');
  }

  Model.defineProperty(options.createdAt, {
    type: Date,
    required: options.required,
    defaultFn: 'now',
    mysql: {
      columnName: 'created_at',
      dataType: 'timestamp'
    }
  });

  Model.defineProperty(options.updatedAt, {
    type: Date,
    required: false,
    mysql: {
      columnName: 'updated_at',
      dataType: 'timestamp',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'Y'
    }
  });

  Model.defineProperty(options.deletedAt, {
    type: Date,
    required: false,
    mysql: {
      columnName: 'deleted_at',
      dataType: 'timestamp',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'Y'
    }
  });

  Model.observe('before save', function (ctx, next) {
    debug('ctx.options', ctx.options);
    if (ctx.options && ctx.options.skipUpdatedAt) {
      return next();
    }
    if (ctx.instance) {
      debug('%s.%s before save: %s', ctx.Model.modelName, options.updatedAt, ctx.instance.id);
      ctx.instance[options.updatedAt] = new Date();
      ctx.instance[options.deletedAt] = null;
    } else {
      debug('%s.%s before update matching %j', ctx.Model.pluralModelName, options.updatedAt, ctx.where);
      ctx.data[options.updatedAt] = new Date();
    }
    return next();
  });

  /**
   * Watches destroyAll(), deleteAll(), destroyById() , deleteById(), prototype.destroy(),
   * prototype.delete() methods
   * and instead of deleting object, sets properties deletedAt and isDeleted.
   */
  Model.observe('before delete', function (ctx, next) {
    Model.updateAll(ctx.where, _defineProperty({}, options.deletedAt, new Date())).then(function () {
      next(null);
    });
  });

  /**
   * When ever model tries to access data, we add by default isDeleted: false to where query
   * if there is already in query isDeleted property, then we do not modify query
   */
  Model.observe('access', function (ctx, next) {
    // If we want the deleted ones
    if (ctx.query.isDeleted) return next();
    if (ctx.query.where && JSON.stringify(ctx.query.where).indexOf('isDeleted') === 1) return next();
    // By defaut set deletedAt to null
    if (!ctx.query.where) ctx.query.where = {};
    ctx.query.where[options.deletedAt] = null;
    next();
  });
};

module.exports = exports.default;
//# sourceMappingURL=time-stamp.js.map
