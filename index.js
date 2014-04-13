'use strict';

var q = require('q'),
    Logger = require('./lib/Logger'),
    Screeba = {};

(function (Screeba) {
    Screeba.loggers = [];

    /**
     * Factory method for new loggers
     * @param {Object} configs A configuration object to initialize the logger
     * @returns {Logger} A new Logger
     */
    Screeba.logger = function (configs) {
        var logger = new Logger(configs);

        Screeba.loggers.push(logger);

        return logger;
    };

    /**
     * Tells to each existing logger to log something
     * @param {String} level The level to log
     * @param {String} message A message to log
     * @param {Object} metadata Extra data to log
     * @param {Function} callback A callback called after logging
     * @returns {Promise} A promise of the log (it depends on each transport implementation)
     */
    Screeba.log = function (level, message, metadata, callback) {
        var deferred = q.defer(),
            promises = [];

        Screeba.loggers.forEach(function (logger) {
            var promise = logger.log(level, message, metadata, callback);

            if (q.isPromise(promise)) promises.push(promise);
        });

        if (promises.length > 0) q.all(promises).then(deferred.resolve, deferred.reject);

        return deferred.promise;
    };

    /**
     * Tells to each existing logger to query something
     * @param {Object} query An object containing the query
     * @param {Function} callback A callback called after querying
     * @returns {Promise} A promise of the query (it depends on each transport implementation)
     */
    Screeba.query = function (query, callback) {
        var deferred = q.defer(),
            promises = [];

        Screeba.loggers.forEach(function (logger) {
            var promise = logger.query(query, callback);

            if (q.isPromise(promise)) promises.push(promise);
        });

        if (promises.length > 0) q.all(promises).then(deferred.resolve, deferred.reject);

        return deferred.promise;
    };
})(Screeba);

module.exports = Screeba;
