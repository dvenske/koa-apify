/**
 * Module dependencies.
 */

var debug = require('debug')('koa-apify');
var fs = require('fs');
var path = require('path');
var _ = require('koa-route');

/**
 * Expose `apify`.
 */

module.exports = apify;

/**
 * Load routes in `root` directory.
 *
 * @param {Application} app
 * @param {String} root
 * @api private
 */

function apify(app, root) {
  fs.readdirSync(root).forEach(function(file) {
    var dir = path.resolve(root, file);
    var stats = fs.lstatSync(dir);

    if (stats.isDirectory()) {
      var api = require(dir + '/api.json');
      api.name = file;
      api.directory = dir;

      if (api.routes) route(app, api);
    }
  });
}

/**
 * Define routes in `api`.
 *
 * @param {Application} app
 * @param {Object} api
 * @api private
 */

function route(app, api) {
  debug('routes: %s', api.name);

  var mod = require(api.directory);

  for (var key in api.routes) {
    var prop = api.routes[key];
    var request = key.split(' ');
    var method = request[0];
    var path = request[1];
    debug('%s %s -> .%s', method, path, prop);

    var fn = mod[prop];
    if (!fn) throw new Error(api.name + ': exports.' + prop + ' is not defined.');

    app.use(_[method.toLowerCase()](path, fn));
  }
}
