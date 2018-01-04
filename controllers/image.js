/**
 * Created by vd on 03/01/18.
 */
'use strict';
const send     = require('send');
const path     = require('path');
const sharp    = require('sharp');
const parseUrl = require('parseurl');
const fs       = require('fs-extra');
const config   = require('../config');

const logger          = require('../lib/logger').getLogger('main');
const imageReg        = /\.(?:jpg|jpeg|png|webp|gif)(?:[_.](\d{2,4})x?(\d{2,4})?)?(\.(?:jpg|jpeg|png|webp|gif))?$/;
const imageExtNameReg = /\.(?:jpg|jpeg|png|webp|gif)$/;
const thumbnailExtReg = /_\d+x?(\d+)?(\.(?:jpg|jpeg|png|webp|gif))?$/;

module.exports = {getImage};

const sendOpts = {
    cacheControl: true,
    dotfiles    : "deny",
    root        : config.uploadPath
};

const thumbnailSendOpts = {
    cacheControl: true,
    dotfiles    : "deny",
    root        : config.thumbnailPath
};

/**
 * getImage, if thumbnails width over max value,return 404
 * /images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_96x96.jpg
 *
 * @returns {*}
 */
function getImage(req, res, next) {
    let originalUrl = parseUrl.original(req);
    let pathName    = parseUrl(req).pathname;

    if (pathName === '/' && originalUrl.pathname.substr(-1) !== '/') {
        return next(); //404
    } else {
        pathName = pathName.slice(1);
    }

    let imageSizeMath = pathName.match(imageReg);
    if (!imageSizeMath) {
        return next(); //404
    }

    let width  = +imageSizeMath[1];
    let height = +imageSizeMath[2];

    // origin image
    if (!width) {
        return sendFile(req, res, pathName, sendOpts);
    }

    // over max width or height return 404
    if (width > config.maxThumbnailWidth || height > config.maxThumbnailHeight) {
        return next();
    }

    // thumbnails
    let originAbsolutePath    = `${config.uploadPath}${pathName}`.replace(thumbnailExtReg, '');
    let thumbnailAbsolutePath = `${config.thumbnailPath}${pathName}`;
    if (!imageExtNameReg.test(thumbnailAbsolutePath)) {
        let extName           = '.jpg'; //default jpeg
        pathName              = pathName + extName;
        thumbnailAbsolutePath = thumbnailAbsolutePath + extName;
    }

    return fs.pathExists(thumbnailAbsolutePath).then(exists => {
        if (!exists) {
            let dir = path.dirname(thumbnailAbsolutePath);
            return fs.ensureDir(dir).then(() => {
                return sharp(originAbsolutePath).resize(width, height || null).toFile(thumbnailAbsolutePath)
            });
        }
    }).then(() => {
        return sendFile(req, res, pathName, thumbnailSendOpts);
    }).catch(err => {
        logger.error(err);
        if (err.message.includes('Input file is missing or of an unsupported image format')) {
            res.status(404).end();
        } else {
            res.status(500).end();
        }
    });
}

function sendFile(req, res, pathName, sendOpts) {
    let isEnded = false;
    let stream  = send(req, pathName, sendOpts);

    // on directory
    stream.on('directory', function () {
        if (!isEnded) {
            isEnded = true;
            res.status(403).end();
        }
    });

    // on errors
    stream.on('error', function error(err) {
        logger.error(err);
        if (isEnded) {
            return;
        }

        if (err.statusCode) {
            res.status(err.statusCode).end();
        } else {
            res.status(404).end();
        }

        isEnded = true;
    });

    //send file
    stream.pipe(res);
}