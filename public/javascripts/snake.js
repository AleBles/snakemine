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
var Food = function (spacing) {
    "use strict";
    this.x = this.y = 0;
    this.z = spacing;
};
var f = Food.prototype;
f.place = function (map) {
    "use strict";
    do {
        this.x = Math.random() * 45 | 0;
        this.y = Math.random() * 30 | 0;
    } while (map[this.x][this.y] && map[this.x][this.y] !== 3);

    map[this.x][this.y] = 1;
    return this;
};
f.draw = function (ctx) {
    "use strict";
    ctx.strokeRect(this.x * this.z + 1, this.y * this.z + 1, this.z - 2, this.z - 2);
};
/*
    The player
 */
var Player = function (name, color) {
    "use strict";
    this.name = name;
    this.color = color;
};
var p = Player.prototype;
/*
    Main game logic
 */
var Snake = function (webSocketUrl) {
    "use strict";
    this._io = null;
    this._intervalId = null;
    this._ctx = null;
    this._board = null;
    this._serverUrl = webSocketUrl;
    this._players = [];
    this._width = 0;
    this._height = 0;
};
var s = Snake.prototype;
s.start = function (playerName, playerColor) {
    "use strict";

    this._players.push({
        name: playerName,
        color: playerColor,
        local: true
    });

    this._io = io.connect(this._serverUrl);
    this._io.on('connect', $.proxy(this.connected, this));
    this._io.on('updateDirection', $.proxy(this.updateDirection, this));
    this._io.on('map', $.proxy(this.receiveMap, this));

    document.onkeydown = $.proxy(this.keyListener, this);

    var canvas = document.getElementById('stage');
    this._width = canvas.width = canvas.offsetWidth;
    this._height = canvas.height = canvas.offsetWidth / 2;
    this._ctx = canvas.getContext('2d');
};
s.connected = function () {
    "use strict";
    this._io.emit('addPlayer', this._players[0]);
};
s.receiveMap = function (mapData) {
    "use strict";
    console.log('receiving map data');
    var xOffset = this._width / mapData[0].length,
        yOffset = this._height / mapData.length;
    this._board = new Board(mapData, xOffset, yOffset);
    this._board.draw(this._ctx);
};
s.updateDirection = function (dir) {
    "use strict";
    console.log('Turning: ' + dir);
    turn.unshift(dir);
};
s.tick = function () {
    "use strict";
};
s.keyListener = function (event) {
    "use strict";
    var code = event.keyCode - 37,
        dir,
        sum;

    console.log('Keydown: ' + code);
    /***
     * 0: left
     * 1: up
     * 2: right
     * 3: down
     **/
    if (0 <= code && code < 4 && code !== turn[0]) {
        this._io.emit('updateDirection', code);
    } else if (-5 === code) {

        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = 0;
        } else {
            this._intervalId = setInterval($.proxy(this.tick, this), 120);
        }

    } else { // O.o
        dir = sum + code;
        if (dir === 44 || dir === 94 || dir === 126 || dir === 171) {
            sum += code;
        } else if (dir === 218) {
            easy = 1;
        }
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