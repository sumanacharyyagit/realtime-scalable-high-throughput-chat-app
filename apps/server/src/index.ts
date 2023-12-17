import http from "http";

import SocketServices from "./services/socket";

(async function init() {
    const httpServer = http.createServer();
    const socketService = new SocketServices();
    const PORT = process.env.PORT || 8080;

    socketService.io.attach(httpServer);

    httpServer.listen(PORT, function () {
        console.log(`HTTP Server started at >>> http://localhost:${PORT}`);
    });
    socketService.initListeners();
})();
