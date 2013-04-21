var ml = require('./maps/mapLoader'),
    mapLoader = ml.createMapLoader(true),
    crypto = require('crypto'),
    Food = require('./food').Food;

var Room = {
    map: null,

    players: [],

    max_size: 10,

    food: new Food(),

    id: crypto.createHash('sha1').update(new Buffer(Math.random() * 999999)).digest('hex'),

    addPlayer: function addPlayer(player) {
        "use strict";
        if (this.players.length < this.max_size) {
            this.players.push(player);
            player.socket.emit('map', this.map.getRawData());
            player.socket.emit('placeFood', this.food.getCoords());
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
        if (this.food.hitTest(coords.x, coords.y)) {
            player.socket.emit('eat');
            this.food.place(this.map);
            console.log(this.food.getCoords());
            player.socket.emit('placeFood', this.food.getCoords());
        }

        if (this.map.hitBorderTest(coords.x, coords.y) === true) {
            if (undefined !== player) {
                player.socket.emit('gameOver');
            }
        }

    }
};

exports.createRoom = function () {
    "use strict";
    var room = Object.create(Room, {
        map: { value: mapLoader.getMap(1) }
    });
    room.food.place(room.map);
    return room;
};