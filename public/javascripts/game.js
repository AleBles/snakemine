/*
    Main game logic
 */
var Game = function (webSocketUrl) {
    "use strict";
    this._io = null;
    this.contexts = {
        background: null,
        below: null,
        player: null,
        above: null
    };
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

    //Creat the player
    this._player = new Snake(playerName, playerColor);

    //Connect to the websocket
    this._connect();

    //Register the key listener
    document.onkeydown = $.proxy(this.keyListener, this);

    //Setup the screen
    this._stageSetup();

    //Start ticking
    this._intervalId = setInterval($.proxy(this.tick, this), 120);

};
g._connect = function () {
    "use strict";

    this._io = io.connect(this._serverUrl);
    this._io.on('connect', $.proxy(this.connected, this));
    this._io.on('map', $.proxy(this.receiveMap, this));
    this._io.on('gameOver', $.proxy(this.playerGameOver, this));
    this._io.on('placeFood', $.proxy(this.placeFood, this));
    this._io.on('eat', $.proxy(this.eatFood, this));
    this._io.on('addPlayer', $.proxy(this.addPlayer, this));
    this._io.on('message', $.proxy(this.receiveMessage, this));
    this._io.on('updatePlayer', $.proxy(this.updatePlayer, this));
};
g._stageSetup = function () {
    "use strict";

    //Load stages
    var bg = document.getElementById('context-background'),
        bl = document.getElementById('context-below'),
        pl = document.getElementById('context-player'),
        ab = document.getElementById('context-above');

    //Set the correct sizes
    this._width = bg.width = bl.width = pl.width = ab.width = bg.offsetWidth;
    this._height = bg.height = bl.height = pl.height = ab.height = bg.offsetWidth / 2;
    $('.stage-span').height(this._height);

    //Get the contexts
    this.contexts.background = bg.getContext('2d');
    this.contexts.below = bl.getContext('2d');
    this.contexts.player = pl.getContext('2d');
    this.contexts.above = ab.getContext('2d');
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
    this._board.draw(this.contexts.background);

    this._player.init(this.xOffset, this.yOffset);
    this._player.place(20, 20);
};
g.tick = function () {
    "use strict";
    this._player.update(this._io);
    this._food.draw(this.contexts.below);
    this._player.draw(this.contexts.player);
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