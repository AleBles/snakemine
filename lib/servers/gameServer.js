var ml = require('../maps/mapLoader'),
    mapLoader = ml.createMapLoader(true),
    socketIo = require('socket.io'),
    logger = require('log4js').getLogger('GAMESERVER'),
    playerFactory = require('../player'),
    Food = require('../food').Food;

function GameServer() {
    "use strict";

    this._io = null;

    this._players = [];

    this.map = mapLoader.getMap(1);

    this.food = new Food();

    this.connected = function (socket) {
        logger.debug('Client connected');
        socket.on('addPlayer', this.addPlayer.bind(this, socket));
        socket.on('updateCoords', this.updatePlayerCoords.bind(this, socket));
    };

    this.addPlayer = function (socket, data) {
        socket.join('snake');
        socket.player = playerFactory.createPlayer(data.name, data.color, socket);

        socket.emit('map', this.map.getRawData());
        socket.emit('placeFood', this.food.getCoords());

        this._players.push(socket.player);
        socket.emit('addPlayer', data.name);
        socket.emit('message', data.name + ' joined the game.');
    };

    this.updatePlayerCoords = function (socket, coords) {
        if (this.food.hitTest(coords.x, coords.y)) {
            socket.emit('eat');
            this.food.place(this.map);
            socket.emit('placeFood', this.food.getCoords());
        }

        if (this.map.hitBorderTest(coords.x, coords.y) === true) {
            if (undefined !== socket.player) {
                socket.emit('gameOver');
                socket.emit('message', socket.player.name + ' is gameover.');
            }
        }
        socket.player.update(coords.x, coords.y);
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

        this.food.place(this.map);
    };
}

exports.start = function (port) {
    "use strict";

    var gameServer = new GameServer();
    gameServer.start(port);
    return gameServer;
};

