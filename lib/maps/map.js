var Map = {
    map: null,

    borderId: 3,

    getRawData: function getRawData() {
        "use strict";
        return this.map;
    },

    hitBorderTest: function hitBorderTest(x, y) {
        "use strict";
        if (this._isValidCoordinate(x, y) && this.map[y][x] === this.borderId) {
            return true;
        }
        return false;
    },

    _isValidCoordinate: function isValidCoordinate(x, y) {
        "use strict";
        return (this.map.hasOwnProperty(y) && this.map[y].hasOwnProperty(x));
    }
};

exports.Map = Map;

