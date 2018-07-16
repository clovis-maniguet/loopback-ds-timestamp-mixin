import _debug from './debug';

const debug = _debug();
const warn = _debug(); // create a namespaced warning
warn.log = console.warn.bind(console); // eslint-disable-line no-console

export default (Model, bootOptions = {}) => {
  debug('TimeStamp mixin for Model %s', Model.modelName);

  const options = Object.assign({
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    required: true,
    validateUpsert: false, // default to turning validation off
    silenceWarnings: false,
  }, bootOptions);

  debug('options', options);

  // enable our warnings via the options
  warn.enabled = !options.silenceWarnings;

  if (!options.validateUpsert && Model.settings.validateUpsert) {
    Model.settings.validateUpsert = false;
    warn(`${Model.pluralModelName} settings.validateUpsert was overriden to false`);
  }

  if (Model.settings.validateUpsert && options.required) {
    warn(`Upserts for ${Model.pluralModelName} will fail when
          validation is turned on and time stamps are required`);
  }

  Model.defineProperty(options.createdAt, {
    type: Date,
    required: options.required,
    defaultFn: 'now',
    mysql: {
      columnName: 'created_at',
      dataType: 'timestamp',
    },
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
      nullable: 'Y',
    },
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
      nullable: 'Y',
    },
  });

  Model.observe('before save', (ctx, next) => {
    debug('ctx.options', ctx.options);
    if (ctx.options && ctx.options.skipUpdatedAt) { return next(); }
    if (ctx.instance) {
      debug('%s.%s before save: %s', ctx.Model.modelName, options.updatedAt, ctx.instance.id);
      ctx.instance[options.updatedAt] = new Date();
    } else {
      debug('%s.%s before update matching %j',
            ctx.Model.pluralModelName, options.updatedAt, ctx.where);
      ctx.data[options.updatedAt] = new Date();
    }
    return next();
  });

  /**
   * Watches destroyAll(), deleteAll(), destroyById() , deleteById(), prototype.destroy(), prototype.delete() methods
   * and instead of deleting object, sets properties deletedAt and isDeleted.
   */
  Model.observe('before delete', function (ctx, next) {
    Model.updateAll(ctx.where, {[options.deletedAt]: new Date()}).then(function (result) {
        next(null);
    });
  });

  /**
   * When ever model tries to access data, we add by default isDeleted: false to where query
   * if there is already in query isDeleted property, then we do not modify query
   */
  Model.observe('access', function (ctx, next) {
    if (!ctx.query.isDeleted && (!ctx.query.where || ctx.query.where && JSON.stringify(ctx.query.where).indexOf('isDeleted') == -1)) {
        if (!ctx.query.where) ctx.query.where = {};
        ctx.query.where[options.deletedAt] = null;
    }
    next();
  });
};

module.exports = exports.default;
