var ws = require('./lib/servers/webServer'),
    gs = require('./lib/servers/gameServer'),
    ml = require('./lib/maps/mapLoader'),
    gameServer,
    webServer,
    mapLoader = ml.createMapLoader();


webServer = ws.start(8080);
gameServer = gs.start(8081);