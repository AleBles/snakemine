var ml = require('./maps/mapLoader'),
    mapLoader = ml.createMapLoader(true),
    crypto = require('crypto');

var Room = {
    map: null,

    players: [],

    max_size: 10,

    id: crypto.createHash('sha1').update(new Buffer(Math.random() * 999999)).digest('hex'),

    intervalId: null,

    addPlayer: function addPlayer(player) {
        "use strict";
        if (this.players.length < this.max_size) {
            this.players.push(player);
            player.socket.emit('map', this.map.getRawData());
        }
    },

    removePlayer: function removePlayer(player) {
        "use strict";
        var playerIndex = this.players.indexOf(player);
        if (playerIndex !== -1) {
            this.players.splice(playerIndex, 1);
        }
    },

    start: function start() {
        "use strict";
        this.intervalId = setInterval(this.tick.bind(this), 200);
    },

    stop: function stop() {
        "use strict";
        clearInterval(this.intervalId);
    },

    tick: function tick() {
        "use strict";
        var i,
            coords,
            hit;

        for (i = 0; i < this.players.length; i += 1) {
            this.players[i].updateCoords();
            coords = this.players[i].getCoords();
            console.log(coords);
            hit = this.map.hitBorderTest(coords.x, coords.y);
            if (false === hit) {
                console.log('Sending update');
                this.players[i].socket.emit('updateCoords', coords);
            }
        }
    }
};

exports.createRoom = function () {
    "use strict";
    var room = Object.create(Room, {
        map: { value: mapLoader.getMap(1) }
    });
    return room;
};