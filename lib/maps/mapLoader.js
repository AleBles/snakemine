var BaseMap = require('./map').Map;

function MapLoader() {
    "use strict";
    this._activeMaps = [1];

    this._maps = {};

    this._loadMap = function (mapId) {
        var rawMap;

        if (this._activeMaps.indexOf(mapId) !== -1) {
            rawMap = require('./' + mapId + '.map').map;
            var newMap = new BaseMap(rawMap);
            this._maps[mapId] = newMap;
        }
    };

    this.preloadMaps = function () {
        var map;
        for (map in this._activeMaps) {
            this._loadMap(map);
        }
    };

    this.getMap = function (mapId) {
        if (this._activeMaps.indexOf(mapId) !== -1) {
            if (!this._maps.hasOwnProperty(mapId)) {
                this._loadMap(mapId);
            }
            return this._maps[mapId];
        }
    };
}

exports.createMapLoader = function (preload) {
    "use strict";

    var mapLoader = new MapLoader();
    if (true === preload) {
        mapLoader.preloadMaps();
    }
    return mapLoader;
};
