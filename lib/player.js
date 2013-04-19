var Player = {
    name: null,

    color: null,

    socket: null,

    coords: {
        x: 20,
        y: 20
    },

    getCoords: function getCoords() {
        "use strict";

        return this.coords;
    }
};

exports.createPlayer = function (name, color, socket) {
    "use strict";

    var player = Object.create(Player, {
        name: { value: name },
        color: { value: color },
        socket: { value: socket }
    });
    return player;
}