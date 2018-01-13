/**
 * Created by vd on 03/01/18.
 */
'use strict';
const config     = require('../config');
const logger     = require('../lib/logger').getLogger('multifile');
const MultiFile  = require('../middlewares/multifile');
const oMultiFile = new MultiFile(config.uploadPath, logger);

const image  = require('../controllers/image');
const router = module.exports = require('express').Router();

router.get('/:image', image.getImage);
router.get('/*', image.getImage);