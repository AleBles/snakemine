/*
 The player
 */
var Snake = function (name, color) {
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
var s = Snake.prototype;
s.init = function (xOffset, yOffset) {
    "use strict";
    this.xOffset = xOffset;
    this.yOffset = yOffset;
};
s.place = function (x, y) {
    "use strict";
    this.x = x;
    this.y = y;
};
s.update = function (socket) {
    "use strict";
    this.oldCoords.x = this.x;
    this.oldCoords.y = this.y;
    this.x += this.velocity.x[this.direction];
    this.y += this.velocity.y[this.direction];

    socket.emit('updateCoords', {x: this.x, y: this.y});
    this.queue.unshift([this.x, this.y]);
};
s.setDirection = function (dir) {
    "use strict";
    this.direction = dir;
};
s.draw = function (ctx) {
    "use strict";
    if (this.length < this.queue.length) {
        var coords = this.queue.pop();
        ctx.clearRect(coords[0] * this.xOffset, coords[1] * this.yOffset, this.xOffset, this.yOffset);
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * this.xOffset + 1, this.y * this.yOffset + 1, this.xOffset - 2, this.yOffset - 2);
};