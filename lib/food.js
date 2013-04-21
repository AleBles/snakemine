function Food() {
    "use strict";
    this.x = 0;

    this.y = 0;

    this.color = 'rgb(200, 0, 0)';

    this.place = function (map) {
        var rawMap = map.getRawData(),
            maxX = rawMap[0].length,
            maxY = rawMap.length,
            x = 0,
            y = 0;

        while (true === map.hitBorderTest(x, y)) {
            x = Math.random() * maxX | 0;
            y = Math.random() * maxY | 0;
        }

        this.x = x;
        this.y = y;

        return {x: x, y: y};
    };

    this.getCoords = function () {
        return {x: this.x, y: this.y};
    };

    this.hitTest = function (x, y) {
        if (this.x === x && this.y === y) {
            return true;
        }
        return false;
    };
}

exports.Food = Food;