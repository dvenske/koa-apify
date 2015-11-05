/**
 * Module dependencies.
 */

var debug = require('debug')('koa-apify');
var _ = require('koa-route');
var glob = require("glob")
var path = require("path")

/**
 * Expose `apify`.
 */
module.exports = {
    "apify" : apify
}

/**
 * Load routes in `root` directory.
 *
 * @param {Application} app
 * @api private
 */

function apify(app, root) {
    glob(root + "/**/api.json", function (er, files) {
        files.forEach(function (file) {
            var api = require(file);

            api.directory = path.dirname(file);
            api.name = api.directory.split(path.sep).pop();

            if (api.routes) route(app, api);
        });
    })
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

        console.log(path);

        app.use(_[method.toLowerCase()](path, fn));
    }
}