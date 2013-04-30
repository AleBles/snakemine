/*
 The Food
 */
var Food = function (xOffset, yOffset) {
    "use strict";
    this.x = 0;
    this.y = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.color = 'rgb(200,0,0)';
    this.cnt = 0;
};
var f = Food.prototype;
f.place = function (x, y) {
    "use strict";
    this.oldX = this.x;
    this.oldY = this.y;
    this.x = x;
    this.y = y;
    this.cnt = 0;
    return this;
};
f.draw = function (ctx) {
    "use strict";
    if (this.oldX !== this.x && this.oldY !== this.y && this.cnt < 1) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * this.xOffset + 1, this.y * this.yOffset + 1, this.xOffset - 2, this.yOffset - 2);
        this.cnt += 1;
    }
};