var turn  = [],
    io = io,
    $ = $,
    document = document;
/*
    The board
 */
var Board = function (map, xOffset, yOffset) {
    "use strict";
    this._map = map;
    this.maxX = map[0].length;
    this.maxY = map.length;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.BORDER = 3;
};
var b = Board.prototype;
b.draw = function (ctx) {
    "use strict";
    var x,
        y;

    for (y = 0; y < this.maxY; y += 1) {
        for (x = 0; x < this.maxX; x += 1) {
            if (this._map.hasOwnProperty(y) && this._map[y].hasOwnProperty(x) && this.BORDER === this._map[y][x]) {
                ctx.strokeRect(x * this.xOffset + 1, y * this.yOffset + 1, this.xOffset - 2, this.yOffset - 2);
            }
        }
    }
};
/*
    The Food
 */
var Food = function (xOffset, yOffset) {
    "use strict";
    this.x = 0;
    this.y = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.color = 'rgb(200,0,0)';
    this.cnt = 0;
};
var f = Food.prototype;
f.place = function (x, y) {
    "use strict";
    this.oldX = this.x;
    this.oldY = this.y;
    this.x = x;
    this.y = y;
    this.cnt = 0;
    return this;
};
f.draw = function (ctx) {
    "use strict";
    if (this.oldX !== this.x && this.oldY !== this.y && this.cnt < 1) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * this.xOffset + 1, this.y * this.yOffset + 1, this.xOffset - 2, this.yOffset - 2);
        this.cnt += 1;
    }
};
/*
    The player
 */
var Player = function (name, color) {
    "use strict";
    this.name = name;
    this.color = color;
    this.x = 0;
    this.y = 0;
    this.xOffset = 0;
    this.yOffset = 0;
    this.oldCoords = {x: null, y: null};
    this.velocity = {x: [-1, 0, 1, 0], y: [0, -1, 0, 1] };
    this.direction = Math.random() * 3 | 0;
    this.length = 1;
    this.queue = [];
};
var p = Player.prototype;
p.init = function (xOffset, yOffset) {
    "use strict";
    this.xOffset = xOffset;
    this.yOffset = yOffset;
};
p.place = function (x, y) {
    "use strict";
    this.x = x;
    this.y = y;
};
p.update = function (socket) {
    "use strict";
    this.oldCoords.x = this.x;
    this.oldCoords.y = this.y;
    this.x += this.velocity.x[this.direction];
    this.y += this.velocity.y[this.direction];

    socket.emit('updateCoords', {x: this.x, y: this.y});
    this.queue.unshift([this.x, this.y]);
};
p.setDirection = function (dir) {
    "use strict";
    this.direction = dir;
};
p.draw = function (ctx) {
    "use strict";
    if (this.length < this.queue.length) {
        var coords = this.queue.pop();
        ctx.clearRect(coords[0] * this.xOffset, coords[1] * this.yOffset, this.xOffset, this.yOffset);
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * this.xOffset + 1, this.y * this.yOffset + 1, this.xOffset - 2, this.yOffset - 2);
};
/*
    Main game logic
 */
var Snake = function (webSocketUrl) {
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
var s = Snake.prototype;
s.start = function (playerName, playerColor) {
    "use strict";

    this._player = new Player(playerName, playerColor);

    this._io = io.connect(this._serverUrl);
    this._io.on('connect', $.proxy(this.connected, this));
    this._io.on('updateCoords', $.proxy(this.updateCoords, this));
    this._io.on('map', $.proxy(this.receiveMap, this));
    this._io.on('gameOver', $.proxy(this.playerGameOver, this));
    this._io.on('placeFood', $.proxy(this.placeFood, this));
    this._io.on('eat', $.proxy(this.eatFood, this));

    document.onkeydown = $.proxy(this.keyListener, this);

    var canvas = document.getElementById('stage');
    this._width = canvas.width = canvas.offsetWidth;
    this._height = canvas.height = canvas.offsetWidth / 2;
    this._ctx = canvas.getContext('2d');

    this._intervalId = setInterval($.proxy(this.tick, this), 120);

};
s.connected = function () {
    "use strict";
    this._io.emit('addPlayer', this._player);
};
s.receiveMap = function (mapData) {
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
s.tick = function () {
    "use strict";
    this._player.update(this._io);
    this._food.draw(this._ctx);
    this._player.draw(this._ctx);
};
s.playerGameOver = function () {
    "use strict";
    clearInterval(this._intervalId);
    $('#connect-modal').modal('show');
};
s.placeFood = function (coords) {
    "use strict";
    console.log('placing food!');
    this._food.place(coords.x, coords.y);
};
s.eatFood = function () {
    "use strict";
    this._player.length += 1;
    console.log(this._player.length);
};
s.keyListener = function (event) {
    "use strict";
    var code = event.keyCode - 37;
    /***
     * 0: left, 1: up, 2: right, 3: down
     **/
    if (0 <= code && code < 4 && code !== turn[0]) {
        this._player.setDirection(code);
    }
};