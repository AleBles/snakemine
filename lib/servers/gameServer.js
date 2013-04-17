var socketIo = require('socket.io'),
    logger = require('log4js').getLogger('GAMESERVER'),
    ml = require('../maps/mapLoader'),
    mapLoader = ml.createMapLoader(true); //true for preload

function GameServer() {
    "use strict";

    this._io = null;

    this.connected = function (socket) {
        logger.debug('Client connected');
        socket.on('addPlayer', this.addPlayer.bind(this, socket));
        socket.on('updateDirection', this.updateDirection.bind(this, socket));

        //lets give the guy the map
        var map = mapLoader.getMap(1);
        socket.emit('map', map.getRawData());
    };

    this.addPlayer = function (socket, data) {
        console.log(JSON.stringify(data) + ' added.');
    };

    this.updateDirection = function (socket, code) {
        console.log('changing direction: ' + code);
        socket.emit('updateDirection', code);
    };

    this.start = function (port) {
        this._io = socketIo.listen(port, function () {
            logger.info('GameServer started listening on port: ' + port);
        });

        this._io.on('connection', this.connected.bind(this));
        this._io.set('log level', 1);
        this._io.enable('browser client minification');  // send minified client
        this._io.enable('browser client etag');          // apply etag caching logic based on version number
        this._io.enable('browser client gzip');          // gzip the file
    };
}

exports.start = function (port) {
    "use strict";

    var gameServer = new GameServer();
    gameServer.start(port);
    return gameServer;
};

