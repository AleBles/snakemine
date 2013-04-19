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
    this.x = this.y = 0;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.color = 'rgb(200,0,0)';
};
var f = Food.prototype;
f.place = function (x, y) {
    "use strict";
    this.x = x;
    this.y = y;
    return this;
};
f.draw = function (ctx) {
    "use strict";
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * this.xOffset + 1, this.y * this.yOffset + 1, this.xOffset - 2, this.yOffset - 2);
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
};
p.setDirection = function (dir) {
    "use strict";
    this.direction = dir;
};
p.draw = function (ctx) {
    "use strict";
    ctx.clearRect(this.oldCoords.x * this.xOffset, this.oldCoords.y * this.yOffset, this.xOffset, this.yOffset);
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

    document.onkeydown = $.proxy(this.keyListener, this);

    var canvas = document.getElementById('stage');
    this._width = canvas.width = canvas.offsetWidth;
    this._height = canvas.height = canvas.offsetWidth / 2;
    this._ctx = canvas.getContext('2d');

    this._intervalId = setInterval($.proxy(this.tick, this), 33);

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
    this._food.place(coords.x, coords.y);
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

//function init() {
//
//    var ctx;
//    var doc = document;
//    var xV = [-1, 0, 1, 0];
//    var yV = [0, -1, 0, 1];
//    var queue = [];
//
//    var elements = 1;
//    var map = [];
//
//
//    var Z = 10;
//    var X = 5 + (Math.random() * (45 - Z))|0;
//    var Y = 5 + (Math.random() * (30 - Z))|0;
//
//    var direction = Math.random() * 3 | 0;
//
//    var interval = 0;
//
//    var score = 0;
//    var inc_score = 50;
//
//    var sum = 0, easy = 0;
//
//    var i, dir, board, food;
//
//    var canvas = doc.getElementById('stage');
//
//    for (i = 0; i < 45; i++) {
//        map[i] = [];
//    }
//
//    canvas.setAttribute('width', 45 * Z);
//    canvas.setAttribute('height', 30 * Z);
//
//    ctx = canvas.getContext('2d');
//
//    food = new Food(Z);
//    food.place(map).draw(ctx);
//
//    board = new Board(45 * Z, 30 * Z, Z);
//    board.draw(ctx, map);
//
//    function clock() {
//
//        if (easy) {
//            X = (X+45)%45;
//            Y = (Y+30)%30;
//        }
//
//        --inc_score;
//
//        if (turn.length) {
//            dir = turn.pop();
//            if ((dir % 2) !== (direction % 2)) {
//                direction = dir;
//            }
//        }
//
//        if (
//
//            (easy || (0 <= X && 0 <= Y && X < 45 && Y < 30))
//
//
//                && 2 !== map[X][Y]) {
//            if (1 === map[X][Y]) {
//                score+= Math.max(5, inc_score);
//                inc_score = 50;
//                food.place(map).draw(ctx);
//                elements++;
//            }
//            if (3 === map[X][Y]) {
//                if (confirm("You lost! Play again? Your Score is " + score)) {
//
//                    ctx.clearRect(0, 0, 450, 300);
//                    queue = [];
//
//                    elements = 1;
//                    map = [];
//
//                    X = 5 + (MR() * (45 - Z))|0;
//                    Y = 5 + (MR() * (30 - Z))|0;
//
//                    direction = MR() * 3 | 0;
//
//                    score = 0;
//                    inc_score = 50;
//
//                    for (i = 0; i < 45; i++) {
//                        map[i] = [];
//                    }
//
//                    food.place(map).draw(ctx);
//                } else {
//                    clearInterval(interval);
//                }
//            }
//
//            ctx.fillRect(X * Z, Y * Z, Z - 1, Z - 1);
//            map[X][Y] = 2;
//            queue.unshift([X, Y]);
//
//            X+= xV[direction];
//            Y+= yV[direction];
//
//            if (elements < queue.length) {
//                dir = queue.pop()
//
//                map[dir[0]][dir[1]] = 0;
//                ctx.clearRect(dir[0] * Z, dir[1] * Z, Z, Z);
//            }
//        } else if (!turn.length) {
//            if (confirm("You lost! Play again? Your Score is " + score)) {
//
//                ctx.clearRect(0, 0, 450, 300);
//                queue = [];
//
//                elements = 1;
//                map = [];
//
//                X = 5 + (Math.random() * (45 - Z))|0;
//                Y = 5 + (Math.random() * (30 - Z))|0;
//
//                direction = Math.random() * 3 | 0;
//
//                score = 0;
//                inc_score = 50;
//
//                for (i = 0; i < 45; i++) {
//                    map[i] = [];
//                }
//
//                food.place(map).draw(ctx);
//            } else {
//                clearInterval(interval);
//            }
//        }
//
//    }
//
//    interval = setInterval(clock, 120);
//
//    doc.onkeydown = function(e) {
//
//    }
//}