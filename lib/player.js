var Player = {
    name: null,

    color: null,

    socket: null,

    coords: {
        x: 20,
        y: 20
    },

    length: 1,

    body: [],

    getCoords: function getCoords() {
        "use strict";

        return this.coords;
    },

    hitTest: function hitTest(x, y) {
        "use strict";
        if (this.body.indexOf([x, y]) !== -1) {
            return true;
        }
        return false;
    },

    update: function update(x, y) {
        "use strict";
        this.body.unshift([x, y]);
        if (this.length < this.body.length) {
            this.body.pop();
        }
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