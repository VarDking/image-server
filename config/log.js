/**
 * Created by chen on 2016/12/3.
 */
'use strict';
const logFilePath = __dirname + '/../data/logs/';
const appenders   = [
    {
        category            : 'main',
        type                : 'dateFile',
        filename            : `${logFilePath}`,
        pattern             : 'yyyyMMdd.log',
        alwaysIncludePattern: true,
        maxLogSize          : 1024 * 1024 * 30
    },
    {
        category: 'main',
        type    : 'logLevelFilter',
        level   : 'WARN',
        appender: {
            type      : 'file',
            filename  : `${logFilePath}log.warn`,
            maxLogSize: 1024 * 1024 * 30
        }
    },
    {
        category: 'main',
        type    : 'logLevelFilter',
        level   : 'ERROR',
        appender: {
            type      : 'file',
            filename  : `${logFilePath}log.error`,
            maxLogSize: 1024 * 1024 * 30
        }
    },
    {
        type: 'console'
    }
];

module.exports = {
    level         : 'AUTO',
    format        : ':remote-addr ' +
    ' ":method :url HTTP/:http-version"' +
    ' :status :content-length',
    replaceConsole: false,
    appenders     : appenders
};