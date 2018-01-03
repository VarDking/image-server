/**
 * Created by vd on 03/01/18.
 */
'use strict';
module.exports = function (req, res, next) {
    return res.status(404).send('404');
};