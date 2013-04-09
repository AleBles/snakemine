var ws = require('./lib/servers/webServer'),
    gs = require('./lib/servers/gameServer'),
    gameServer,
    webServer;


webServer = ws.start(8080);
gameServer = gs.start(8081);