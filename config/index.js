/**
 * Created by vd on 03/01/18.
 */
'use strict';
const log = require('./log');

process.env.NODE_CONFIG_DIR = __dirname;

module.exports = {
    project: {
        webPort: 3003,
        name   : 'image-server',
        host   : 'http://192.168.1.127:3003'
    },

    log          : log,
    uploadPath   : '/data/image-server/',
    thumbnailPath: '/data/image-server/thumbnails/',

    maxThumbnailWidth: 2000,
    maxThumbnailHeight: 2000
};
