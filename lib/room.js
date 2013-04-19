var ml = require('./maps/mapLoader'),
    mapLoader = ml.createMapLoader(true),
    crypto = require('crypto');

var Room = {
    map: null,

    players: [],

    max_size: 10,

    id: crypto.createHash('sha1').update(new Buffer(Math.random() * 999999)).digest('hex'),

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

    updatePlayerCoords: function updatePlayerCoords(player, coords) {
        "use strict";
        if (this.map.hitBorderTest(coords.x, coords.y) === true) {
            player.socket.emit('gameOver');
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