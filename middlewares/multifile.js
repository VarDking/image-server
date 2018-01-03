/**
 * Created by vd on 03/01/18.
 */
'use strict';
const multer = require('multer');

class MultiFile {
    constructor(dest, logger = console.log) {
        this.logger = logger;
        this.dest   = dest;
        this.init();
    }

    init() {
        let self     = this;
        this.storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, self.dest);
            },

            filename: function (req, file, cb) {
                cb(null, file.name);
            }
        });

        this.uploadImages = multer({storage: this.storage}).array('upfile');
    }

    uploadFiles(req, res, next) {
        this.uploadImages(req, res, (err) => {
            if (err) {
                this.logger().error(err);
                return res.json({code: 1, mgs: err});
            } else if (!req.files || req.files.length === 0) {
                return res.json({code: 1, mgs: '上传图片不能为空！'});
            } else {
                return next();
            }
        });
    }
}

module.exports = MultiFile;

