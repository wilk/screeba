'use strict';

var q = require('q');

/**
 * Logger class. It exposes a common API for each transport
 * @param {Object} configs An object containing configurations to initialize the Logger
 * @param {Array}  configs.levels A list of levels. By default every message are logged at each level
 * @param {Array}  configs.transports A list of transports. By default it has no transport, so it's an empty container
 * @returns {Logger} A new Logger instance
 * @constructor
 */
function Logger (configs) {
    var me = this;

    configs = configs || {};
    me.levels = configs.levels || ['info', 'warning', 'error'];
    me.transports = configs.transports || [];

    me.levels.forEach(function (level) {
        me[level] = function (message, metadata, callback) {
            me.log(level, message, metadata, callback);
        };
    });

    /**
     * It logs a message at the specified level
     * @param {String} level The level the logger has to log
     * @param {String} message The message to log
     * @param {Object} metadata An object containing extra data to log
     * @param {Function} callback A callback function called after logging
     * @returns {Promise} A promise resolved or rejected by every transport (it depends on each transport implementation)
     */
    me.log = function (level, message, metadata, callback) {
        var deferred = q.defer(),
            promises = [];

        me.transports.forEach(function (transport) {
            var promise = transport.log(level, message, metadata, callback, q.defer());

            if (q.isPromise(promise)) promises.push(promise);
        });

        if (promises.length > 0) q.all(promises).then(deferred.resolve, deferred.reject);

        return deferred.promise;
    };

    /**
     * It queries the logs
     * @param {Object} query An object containing the query
     * @param {Function} callback A callback function called after querying
     * @returns {Promise} A promise resolved or rejected by every transport (it depends on each transport implementation)
     */
    me.query = function (query, callback) {
        var deferred = q.defer(),
            promises = [];

        me.transports.forEach(function (transport) {
            var promise = transport.query(query, callback, q.defer());

            if (q.isPromise(promise)) promises.push(promise);
        });

        if (promises.length > 0) q.all(promises).then(deferred.resolve, deferred.reject);

        return deferred.promise;
    };

    return me;
};

module.exports = Logger;
