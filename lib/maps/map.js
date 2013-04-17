function Map(map) {
    "use strict";
    this.map = map;

    this.FIELD = 1;
    this.FOOD = 2;
    this.BORDER = 3;
    this.PLAYER = 4;

    this.getRawData = function () {
        return this.map;
    };

    this._isValidCoordinate = function (x, y) {
        return (this.map.hasOwnProperty(y) && this.map[y].hasOwnProperty(x));
    };
}

exports.Map = Map;