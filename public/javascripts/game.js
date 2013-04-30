/*
    Main game logic
 */
var Game = function (webSocketUrl) {
    "use strict";
    this._io = null;
    this._ctx = null;
    this._board = null;
    this._serverUrl = webSocketUrl;
    this._players = [];
    this._width = 0;
    this._height = 0;
    this._intervalId = null;
    this._food = null;
};
var g = Game.prototype;
g.start = function (playerName, playerColor) {
    "use strict";

    this._player = new Snake(playerName, playerColor);

    this._io = io.connect(this._serverUrl);
    this._io.on('connect', $.proxy(this.connected, this));
    this._io.on('updateCoords', $.proxy(this.updateCoords, this));
    this._io.on('map', $.proxy(this.receiveMap, this));
    this._io.on('gameOver', $.proxy(this.playerGameOver, this));
    this._io.on('placeFood', $.proxy(this.placeFood, this));
    this._io.on('eat', $.proxy(this.eatFood, this));
    this._io.on('addPlayer', $.proxy(this.addPlayer, this));
    this._io.on('message', $.proxy(this.receiveMessage, this));

    document.onkeydown = $.proxy(this.keyListener, this);

    var canvas = document.getElementById('stage');
    this._width = canvas.width = canvas.offsetWidth;
    this._height = canvas.height = canvas.offsetWidth / 2;
    this._ctx = canvas.getContext('2d');

    this._intervalId = setInterval($.proxy(this.tick, this), 120);

};
g.connected = function () {
    "use strict";
    this._io.emit('addPlayer', this._player);
};
g.addPlayer = function (name) {
    $('#player-table').append('<tr><td>' + name + '</td></tr>');
};
g.receiveMessage = function (msg) {
    var now = new Date(),
        message = '<tr><td class="message">' + now.timeNow() + ' - </td><td class="message">' + msg + '</td></tr>';
    $('#chat-table').append(message);
};
g.receiveMap = function (mapData) {
    "use strict";
    console.log('receiving map data');
    console.dir(mapData);
    this.xOffset = this._width / mapData[0].length;
    this.yOffset = this._height / mapData.length;
    this._food = new Food(this.xOffset, this.yOffset);
    this._board = new Board(mapData, this.xOffset, this.yOffset);
    this._board.draw(this._ctx);

    this._player.init(this.xOffset, this.yOffset);
    this._player.place(20, 20);
};
g.tick = function () {
    "use strict";
    this._player.update(this._io);
    this._food.draw(this._ctx);
    this._player.draw(this._ctx);
};
g.playerGameOver = function () {
    "use strict";
    clearInterval(this._intervalId);
    $('#connect-modal').modal('show');
};
g.placeFood = function (coords) {
    "use strict";
    console.log('placing food!');
    this._food.place(coords.x, coords.y);
};
g.eatFood = function () {
    "use strict";
    this._player.length += 1;
    console.log(this._player.length);
};
g.keyListener = function (event) {
    "use strict";
    var code = event.keyCode - 37;
    /***
     * 0: left, 1: up, 2: right, 3: down
     **/
    if (0 <= code && code < 4) {
        this._player.setDirection(code);
    }
};