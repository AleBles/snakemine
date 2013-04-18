var Player = {
    name: null,

    color: null,

    socket: null,

    coords: {
        x: 20,
        y: 20
    },

    oldCoords: {
        x: 0,
        y: 0
    },

    velocity: {
        x: [-1, 0, 1, 0],
        y: [0, -1, 0, 1]
    },

    direction: Math.random() * 3 | 0,

    updateDirection: function updateDirection(direction) {
        "use strict";
        this.direction = direction;
    },

    updateCoords: function updateCoords() {
        "use strict";
        console.log(this.direction);
        this.oldCoords.x = this.coords.x;
        this.oldCoords.y = this.coords.y;
        this.coords.x += this.velocity.x[this.direction];
        this.coords.y += this.velocity.y[this.direction];
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