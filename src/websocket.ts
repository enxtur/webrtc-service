import http from "http";
import { Server, Socket } from "socket.io";
import { Message, MessageType } from "./types";

export function use(server: http.Server) {
  const idSockets = new Map<string, Socket>();
  const usernameSockets = new Map<string, Socket>();
  const idUsernames = new Map<string, string>();
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
    transports: ["websocket"],
  });

  const sendUserListToAll = () => {
    idSockets.forEach((socket) => {
      socket.emit("userlist", Array.from(usernameSockets.keys()));
    });
  };

  const sendToOneUser = (target: string, msg: Message) => {
    const socket = usernameSockets.get(target);
    if (socket) {
      socket.emit("message", msg);
    }
  }

  const sendToEveryone = (msg: Message) => {
    idSockets.forEach((socket) => {
      socket.emit("message", msg);
    });
  }

  const removeUsernameBySocketId = (socketId: string) => {
    const username = idUsernames.get(socketId);
    if (username) {
      idUsernames.delete(socketId);
      usernameSockets.delete(username);
    }
  }

  io.on("connection", (socket) => {
    idSockets.set(socket.id, socket);
    socket.emit("id", {
      type: "id",
      id: socket.id,
    });

    socket.on("message", (msg: Message) => {
      switch (msg.type) {
        case MessageType.message:
          const username = idUsernames.get(socket.id);
          msg.name = username;
          msg.text = msg.text?.replace(/(<([^>]+)>)/ig, "");
          if (msg.target) {
            sendToOneUser(msg.target, msg);
          } else {
            sendToEveryone(msg);
          }
          break;
        case MessageType.username:
          if (msg.name) {
            removeUsernameBySocketId(socket.id);
            idUsernames.set(socket.id, msg.name);
            usernameSockets.set(msg.name, socket);
            sendUserListToAll();
          }
          break;
        default:
          if (msg.target) {
            sendToOneUser(msg.target, msg);
          } else {
            sendToEveryone(msg);
          }
          break;
      }
    });
    socket.on("disconnect", () => {
      idSockets.delete(socket.id);
      removeUsernameBySocketId(socket.id);
      sendUserListToAll();
    });
  });
  return io;
}