/**
 * Created by vd on 03/01/18.
 */
'use strict';
const ejs          = require('ejs');
const path         = require('path');
const helmet       = require('helmet');
const express      = require('express');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const session      = require('express-session');
const engine       = require('ejs-mate');

const config        = require('./config');
const router        = require('./routes');
const logConfig     = require('./config/log');
const notFound      = require('./middlewares/not-found');
const logger        = require('./lib/logger').getLogger('main');
const connectLogger = require('./lib/logger').getLogger('main', {
    type: 'connect', format: logConfig.connectFormat
});

const app = module.exports = express();

//attach project info
app.locals.projectInfo = config.project;

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'src/dist/pages'));
app.set('view engine', 'ejs');

app.use(helmet());

app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './public/dist')));
app.use(express.static(path.join(__dirname, './public/asset')));
app.use(express.static(path.join(config.uploadPath)));

app.use(session({
    resave           : true,
    saveUninitialized: true,
    secret           : '6d8f3559cbd36d44bd',
    cookie           : {maxAge: 60000}
}));

app.use(connectLogger);
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false, limit: '10mb'}));// parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '10mb'}));// parse application/json

app.use(router);
app.use(notFound);

//start server
app.start = function () {
    return app.listen(config.project.webPort, () => {
        logger.info(`server is listening on ${config.project.webPort}`);
        logger.info(`server stated ... `);
    });
};

app.start();