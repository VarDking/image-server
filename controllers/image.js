/**
 * Created by vd on 03/01/18.
 */
'use strict';
const send     = require('send');
const sharp    = require('sharp');
const parseUrl = require('parseurl');
const config   = require('../config');

const logger   = require('../lib/logger').getLogger('main');
const imageReg = /\.(?:jpg|jpeg|png|webp|gif)(?:[_.](\d{2,4})x?(\d{2,4})?)?$/;

module.exports = {getImage};

const sendOpts = {
    cacheControl: true,
    dotfiles    : "deny",
    root        : config.uploadPath
};


/**
 * getImage, if thumbnails width over max value,return 404
 * /images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_96x96.jpg
 *
 * @returns {*}
 */
function getImage(req, res, next) {
    let originalUrl = parseUrl.original(req);
    let path        = parseUrl(req).pathname;

    if (path === '/' && originalUrl.pathname.substr(-1) !== '/') {
        return next(); //404
    } else {
        path = path.slice(1);
    }

    let imageSizeMath = path.match(imageReg);
    if (!imageSizeMath) {
        return next(); //404
    }

    let width  = +imageSizeMath[1];
    let height = +imageSizeMath[2];

    // origin image
    if (!width) {
        return sendFile(req, res, path, sendOpts);
    }

    // over max width or height return 404
    if (width > config.maxThumbnailWidth || height > config.maxThumbnailHeight) {
        return next();
    }

    //thumbnails
    let originAbsolutePath = `${config.uploadPath}${path}`.replace(/_\d+x?(\d+)?$/, '');
    let resizeStream       = sharp(originAbsolutePath).resize(width, height || null).jpeg();
    resizeStream.on('error', function error(err) {
        logger.error(err);
        res.status(500).end();
    });
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    resizeStream.pipe(res);
}

function sendFile(req, res, path, sendOpts) {
    let isEnded = false;
    let stream  = send(req, path, sendOpts);

    // on directory
    stream.on('directory', function () {
        if (!isEnded) {
            isEnded = true;
            res.status(403).end();
        }
    });

    // forward errors
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