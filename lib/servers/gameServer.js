var socketIo = require('socket.io'),
    logger = require('log4js').getLogger('GAMESERVER'),
    playerFactory = require('../player'),
    roomFactory = require('../room');

function GameServer() {
    "use strict";

    this._io = null;

    this._players = [];

    this.room = roomFactory.createRoom();

    this.connected = function (socket) {
        logger.debug('Client connected');
        socket.on('addPlayer', this.addPlayer.bind(this, socket));
        socket.on('updateCoords', this.updatePlayerCoords.bind(this, socket));
    };

    this.addPlayer = function (socket, data) {
        socket.join('snake');
        socket.player = playerFactory.createPlayer(data.name, data.color, socket);

        this.room.addPlayer(socket.player);
        this._players.push(socket.player);
    };

    this.updatePlayerCoords = function (socket, coords) {
        this.room.updatePlayerCoords(socket.player, coords);
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

