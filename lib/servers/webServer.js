var express = require('express'),
    http = require('http'),
    path = require('path'),
    logger = require('log4js').getLogger('WEBSERVER');

function WebServer() {
    "use strict";

    this._http = express();

    this._http.set('views', __dirname + '/../../views');
    this._http.set('view engine', 'ejs');
    this._http.use(express.favicon());
    this._http.use(express.logger('dev'));
    this._http.use(express.bodyParser());
    this._http.use(express.methodOverride());
    this._http.use(express.cookieParser('your secret here'));
    this._http.use(express.session());
    this._http.use(this._http.router);
    this._http.use(express.static(path.join(__dirname, '/../../public')));

    this.index = function (req, res) {
        res.render('index', {
            title: 'SnakeMine',
            guestName: 'Guest-' + Math.floor((Math.random() * 999) + 1)
        });
    };

    this.about = function (req, res) {
        res.render('about', { title: 'SnakeMine' });
    };

    this.contact = function (req, res) {
        res.render('contact', { title: 'SnakeMine' });
    };

    this._http.get('/', this.index.bind(this));
    this._http.get('/about', this.about.bind(this));
    this._http.get('/contact', this.contact.bind(this));


    this.start = function (port) {
        this._http.listen(port, function () {
            logger.info("Started web server on port " + port);
        });
    };
}

exports.start = function (port) {
    "use strict";

    var webServer = new WebServer();
    webServer.start(port);
    return webServer;
};