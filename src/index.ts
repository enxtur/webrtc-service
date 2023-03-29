import http from "http";
// import * as websocket from "./websocket";
import express from "express";
import { ExpressPeerServer } from "peer";

(async function() {
  const app = express();
  const server = http.createServer(app);
  // websocket.use(server);
  const peerServer = ExpressPeerServer(server, {
    
    path: "/myapp",
    // generateClientId: function () {
    //   return "12345";
    // }
  });
  peerServer.on("connection", (client) => {
    const clientId = client.getId();
    console.log("connection", clientId, client.getToken());
    const socket = client.getSocket();
    const token = client.getToken();
    if (token !== "mytoken") {
      socket?.close();
    }
  });
  app.use(peerServer);
  app.use("/", express.static(__dirname + "/../../xs-webrtc-client/build"));
  server.listen(3000, () => {
    console.log("listening on *:3000");
  });
})();