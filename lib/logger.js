/**
 * Created by chen on 2016/12/3.
 * 日志模块
 */
'use strict';
const once   = require('once');
const log4js = require('log4js');

const logConfig = require('../config/log');

module.exports = {getLogger};

const configure = once(function (configs) {
    log4js.configure(configs);
});

/**
 * @param name
 * @param [options]
 * @param [options.type]   - file or connect
 * @param [options.format] - format
 */
function getLogger(name, options) {
    options        = options || {};
    let type       = options.type || 'file';
    options.format = options.format || logConfig.format;
    let fnMap      = {
        'file'   : getFileLogger,
        'connect': getConnectLogger
    };

    let fn = fnMap[type];
    return fn(name, options);
}

function getFileLogger(name) {
    configure(logConfig);
    return log4js.getLogger(name);
}

function getConnectLogger(name, options) {
    let logger = getFileLogger(name);
    return log4js.connectLogger(logger, options)
}