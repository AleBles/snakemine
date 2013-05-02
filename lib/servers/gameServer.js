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
        socket.on('disconnect', this.disconnect.bind(this, socket));
    };

    this.disconnect = function (socket) {
        this._io.sockets['in']('snake').emit('message', socket.player.name + ' disconnected.');
        this.removePlayer(socket.player);
    };

    this.addPlayer = function (socket, data) {
        socket.join('snake');
        socket.player = playerFactory.createPlayer(data.name, data.color, socket);

        socket.emit('map', this.map.getRawData());
        socket.emit('placeFood', this.food.getCoords());

        this._players.push(socket.player);
        this._io.sockets['in']('snake').emit('addPlayer', data.name);
        this._io.sockets['in']('snake').emit('message', data.name + ' joined the game.');
    };

    this.updatePlayerCoords = function (socket, coords) {
        if (this.food.hitTest(coords.x, coords.y)) {
            socket.emit('eat');
            this.food.place(this.map);
            this._io.sockets['in']('snake').emit('placeFood', this.food.getCoords());
        }

        if (this.map.hitBorderTest(coords.x, coords.y) === true) {
            if (undefined !== socket.player) {
                socket.emit('gameOver');
                this._io.sockets['in']('snake').emit('message', socket.player.name + ' is gameover.');
                this.removePlayer(socket.player);
            }
        } else {
            socket.player.update(coords.x, coords.y);
            this._io.sockets['in']('snake').emit('updatePlayer', {
                name: socket.player.name,
                color: socket.player.color,
                x: coords.x,
                y: coords.y
            });
        }
    };

    this.removePlayer = function (player) {
        var pIndex = this._players.indexOf(player);
        if (-1 !== pIndex) {
            this._players.splice(pIndex, 1);
        }
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

