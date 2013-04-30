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